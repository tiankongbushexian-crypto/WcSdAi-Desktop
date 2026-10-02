import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../apps/desktop/package.json", import.meta.url));
const { createServer } = await import(require.resolve("vite"));
const { default: tailwindcss } = await import(require.resolve("@tailwindcss/vite"));
const root = fileURLToPath(new URL("../apps/desktop/", import.meta.url));
const server = await createServer({
  configFile: false, root,
  cacheDir: fileURLToPath(new URL("../.artifacts/wcsdai-updates-motion/review-vite-cache", import.meta.url)),
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  optimizeDeps: { entries: ["review/home-motion.html"] },
  server: { host: "127.0.0.1", port: 18762, strictPort: true, fs: { allow: [fileURLToPath(new URL("../", import.meta.url))] } },
});
await server.listen();
console.log("Local review only: http://127.0.0.1:18762/review/home-motion.html");
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await server.close(); process.exit(0); });
