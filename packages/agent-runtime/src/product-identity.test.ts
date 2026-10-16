import { createServer } from "node:http";
import { afterEach, expect, it } from "vitest";
import type { AgentEventEnvelope, Mode, UiMessage } from "@pi-desktop/shared";
import { DesktopAgentRuntime } from "./runtime.js";
import type { CustomSystemPrompt } from "./custom-system-prompt.js";

type ProviderRequest = {
  model: string;
  messages: Array<{ role: string; content: unknown }>;
  tools?: Array<{ function: { name: string; description?: string } }>;
};

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

/** Exercise prompt composition and the real Pi adapter; only the provider is a fixture. */
async function fixture(options: {
  mode?: Mode;
  history?: UiMessage[];
  customSystemPrompt?: CustomSystemPrompt;
} = {}) {
  const requests: ProviderRequest[] = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const part of req) raw += part;
    requests.push(JSON.parse(raw) as ProviderRequest);
    const chunk = (delta: unknown, finish: string | null) =>
      `data: ${JSON.stringify({ id: "identity-fixture", object: "chat.completion.chunk", created: 1,
        model: "upstream-fixture-model", choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.end(chunk({ role: "assistant", content: "Fixture response." }, null) +
      chunk({}, "stop") + "data: [DONE]\n\n");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  cleanups.push(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("fixture address missing");
  const events: AgentEventEnvelope[] = [];
  const runtime = new DesktopAgentRuntime({
    sessionId: "identity-fixture", mode: options.mode ?? "agent", history: options.history,
    customSystemPrompt: options.customSystemPrompt, thinkingLevel: "off",
    provider: {
      id: "fixture-provider", name: "Fixture", modelId: "upstream-fixture-model",
      baseUrl: `http://127.0.0.1:${address.port}/v1`, apiKey: "fixture-only", apiStyle: "chat_completions",
      supportsReasoning: false, supportedThinkingLevels: ["off"],
    },
    projectInstructions: { entries: [{ source: "AGENTS.md", content: "Keep existing files." }] },
    commandShell: { id: "bash", label: "Bash", dialect: "posix", available: true, isDefault: true },
    host: { async call() { throw new Error("Identity conversation must not execute host tools"); } },
    onEvent: (event) => events.push(event),
  });
  cleanups.push(() => runtime.dispose());
  return { runtime, requests, events };
}

function systemText(request: ProviderRequest): string {
  return request.messages.filter((message) => message.role === "system" || message.role === "developer")
    .map((message) => typeof message.content === "string" ? message.content : JSON.stringify(message.content))
    .join("\n");
}

function expectProductIdentity(request: ProviderRequest): void {
  const prompt = systemText(request);
  expect(prompt).toContain("You are WcSdAi");
  expect(prompt).not.toContain("PI-Desktop");
  expect(prompt).toContain("application identity, not the underlying model");
  expect(prompt).toContain("do not guess a model or provider");
  expect(prompt).toContain("Keep existing files.");
  expect(JSON.stringify(request.tools)).not.toContain("PI-Desktop");
  expect(request.model).toBe("upstream-fixture-model");
}

it.each(["agent", "plan", "goal"] as const)("sends WcSdAi identity to the provider in a new %s conversation", async (mode) => {
  const { runtime, requests, events } = await fixture({ mode });
  await runtime.prompt("What application and model are you?", "new-user", "new-turn");
  expect(requests).toHaveLength(1);
  expectProductIdentity(requests[0]);
  expect(events.some(({ event }) => event.type === "agent_end")).toBe(true);
  expect(events.some(({ event }) => event.type === "error")).toBe(false);
});

it("rebuilds current product instructions for a restored session and mode switches without rewriting history", async () => {
  const history: UiMessage[] = [
    { id: "old-user", role: "user", content: "Who are you?", createdAt: "2026-10-01T00:00:00Z", status: "complete" },
    { id: "old-assistant", role: "assistant", content: "I am PI-Desktop.", createdAt: "2026-10-01T00:00:01Z", status: "complete" },
  ];
  const before = structuredClone(history);
  const { runtime, requests, events } = await fixture({ history });
  for (const mode of ["agent", "plan", "goal", "agent"] as const) {
    runtime.setMode(mode);
    await runtime.prompt("Which application am I using now?");
    const request = requests.at(-1);
    if (!request) throw new Error("Provider request missing");
    expectProductIdentity(request);
    expect(request.messages.some((message) => message.role === "assistant" &&
      JSON.stringify(message.content).includes("I am PI-Desktop."))).toBe(true);
  }
  expect(requests).toHaveLength(4);
  expect(history).toEqual(before);
  expect(events.some(({ event }) => event.type === "error")).toBe(false);
});

it("preserves a user-supplied persona and append ordering at the provider boundary", async () => {
  const persona = "You are My Team Assistant.";
  const appendix = "Use the team's preferred terminology.";
  const { runtime, requests } = await fixture({ customSystemPrompt: { replace: persona, append: appendix } });
  await runtime.prompt("Who are you?");
  expect(requests).toHaveLength(1);
  const prompt = systemText(requests[0]);
  expect(prompt).toContain(persona);
  expect(prompt).not.toContain("You are WcSdAi");
  expect(prompt).not.toContain("PI-Desktop");
  expect(prompt.indexOf(appendix)).toBeGreaterThan(prompt.indexOf(persona));
  expect(prompt.indexOf("Keep existing files.")).toBeGreaterThan(prompt.indexOf(appendix));
  expect(prompt).toContain("Complete the requested work and relevant checks");
  expect(requests[0].model).toBe("upstream-fixture-model");
});
