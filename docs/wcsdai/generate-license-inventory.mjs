import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Read package metadata and license texts only; never install or contact registries.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dependencyRoot = path.resolve(process.argv[2] ?? root);
const cargoHome = path.resolve(process.env.CARGO_HOME ?? path.join(os.homedir(), ".cargo"));
const require = createRequire(path.join(dependencyRoot, "package.json"));
const yaml = require("yaml");
const read = (file) => fs.readFileSync(file, "utf8");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const entries = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
const rows = [];
const notices = new Map();
const escape = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const pending = (name) => `【待确认许可证：${name}】`;

function collectNotices(dir, name) {
  const found = [];
  for (const entry of entries(dir)) {
    if (!/^(licen[sc]es?|copying|notice|copyright|authors|ofl)([.\-_]|$)/i.test(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const nested of entries(file)) {
        if (nested.isFile()) found.push(path.join(file, nested.name));
      }
    } else if (entry.isFile()) found.push(file);
  }
  for (const file of found) {
    const content = read(file);
    const digest = hash(content);
    const item = notices.get(digest) ?? { content, sources: [] };
    item.sources.push(`${name}: ${path.relative(dir, file)}`);
    notices.set(digest, item);
  }
  return found.map((file) => path.relative(dir, file));
}

function sourceObligation(license) {
  if (license.includes("待确认") || /SEE LICENSE|UNLICENSED|LicenseRef/i.test(license)) return "Pending review before distribution";
  if (/AGPL|LGPL|(?<!L)GPL|MPL|EPL|CDDL|CPL/i.test(license)) return "Copyleft or license choice: review shipped use/source obligations";
  if (/^(MIT|ISC|BSD-[234]-Clause|Apache-2\.0|0BSD|CC0-1\.0|Unlicense|Zlib|BlueOak-1\.0\.0|Python-2\.0|BSL-1\.0|WTFPL|Public Domain)( OR (MIT|Apache-2\.0))?$/.test(license)) {
    return "No general source-offer requirement; retain applicable notices";
  }
  return "Review exact terms and distribution scope";
}

function fontNotices(file) {
  const bytes = fs.readFileSync(file);
  const records = new Set();
  for (let i = 0; i < bytes.readUInt16BE(4); i++) {
    const table = 12 + i * 16;
    if (bytes.toString("ascii", table, table + 4) !== "name") continue;
    const offset = bytes.readUInt32BE(table + 8);
    const strings = offset + bytes.readUInt16BE(offset + 4);
    for (let j = 0; j < bytes.readUInt16BE(offset + 2); j++) {
      const record = offset + 6 + j * 12;
      const platform = bytes.readUInt16BE(record);
      if (![0, 13, 14].includes(bytes.readUInt16BE(record + 6))) continue;
      const start = strings + bytes.readUInt16BE(record + 10);
      const data = Buffer.from(bytes.subarray(start, start + bytes.readUInt16BE(record + 8)));
      records.add(platform === 0 || platform === 3 ? data.swap16().toString("utf16le") : data.toString("latin1"));
    }
  }
  return [...records].join("\n\n");
}

const installed = new Map();
for (const store of entries(path.join(dependencyRoot, "node_modules/.pnpm"))) {
  if (!store.isDirectory()) continue;
  const modules = path.join(dependencyRoot, "node_modules/.pnpm", store.name, "node_modules");
  const candidates = entries(modules).flatMap((entry) => entry.name.startsWith("@")
    ? entries(path.join(modules, entry.name)).map((child) => path.join(modules, entry.name, child.name))
    : [path.join(modules, entry.name)]);
  for (const dir of candidates) {
    const manifest = path.join(dir, "package.json");
    if (!fs.existsSync(manifest)) continue;
    const data = JSON.parse(read(manifest));
    if (data.name && data.version) installed.set(`${data.name}@${data.version}`, { dir, data });
  }
}

const lockText = read(path.join(root, "pnpm-lock.yaml"));
const documents = yaml.parseAllDocuments(lockText);
for (const document of documents) {
  if (document.errors.length) throw document.errors[0];
}
const lock = documents.reduce((result, document) => {
  const value = document.toJSON();
  Object.assign(result.packages, value.packages);
  for (const [name, importer] of Object.entries(value.importers ?? {})) {
    result.importers[name] = { ...result.importers[name], ...importer };
  }
  return result;
}, { packages: {}, importers: {} });
const direct = new Map();
for (const [owner, importer] of Object.entries(lock.importers)) {
  for (const kind of ["dependencies", "devDependencies", "optionalDependencies", "packageManagerDependencies"]) {
    for (const [name, value] of Object.entries(importer[kind] ?? {})) {
      const version = value.version.split("(")[0];
      const key = `${name}@${version}`;
      direct.set(key, [...(direct.get(key) ?? []), `${owner}:${kind}`]);
    }
  }
}
for (const key of Object.keys(lock.packages).sort()) {
  const split = key.lastIndexOf("@");
  const name = key.slice(0, split);
  const version = key.slice(split + 1);
  const match = installed.get(key);
  const rawLicense = match?.data.license;
  const license = typeof rawLicense === "string" ? rawLicense : rawLicense?.type ?? pending(name);
  const licenseFiles = match ? collectNotices(match.dir, `npm ${key}`) : [];
  rows.push({ ecosystem: "npm", name, version, license,
    source: `https://www.npmjs.com/package/${name}/v/${version}`,
    scope: direct.has(key) ? direct.get(key).join(", ") : "transitive / optional platform",
    evidence: match ? `installed package.json; ${licenseFiles.length ? licenseFiles.join(", ") : "no top-level license text"}` : "locked; metadata not installed on this host",
    sourceObligation: sourceObligation(license) });
}

const katexRow = rows.find((row) => row.name === "katex");
const katex = katexRow ? installed.get(`katex@${katexRow.version}`) : undefined;
if (katex) {
  const fonts = path.join(katex.dir, "dist/fonts");
  const fontTexts = entries(fonts).filter((entry) => entry.name.endsWith(".ttf"))
    .map((entry) => `${entry.name}\n${fontNotices(path.join(fonts, entry.name))}`);
  const content = fontTexts.join("\n\n");
  notices.set(hash(content), { content, sources: [`KaTeX ${katexRow.version}: original TTF copyright/license name records`] });
  const license = fontTexts.length && fontTexts.every((text) => text.includes("SIL Open Font License, Version 1.1")) ? "OFL-1.1" : pending("KaTeX fonts");
  rows.push({ ecosystem: "asset", name: "KaTeX fonts", version: katexRow.version, license,
    source: `https://github.com/KaTeX/KaTeX/tree/v${katexRow.version}/src/fonts`,
    scope: `${fontTexts.length} installed TTF faces; corresponding WOFF/WOFF2 outputs`,
    evidence: "embedded font name records 0, 13, 14; original copyright and reserved names in third-party-notices.txt",
    sourceObligation: "Preserve OFL license, copyright and reserved font names; review modifications" });
}

const cargoText = read(path.join(root, "Cargo.lock"));
const cargoRegistries = entries(path.join(cargoHome, "registry/src"));
for (const block of cargoText.split("[[package]]").slice(1)) {
  const name = /^name = "([^"]+)"/m.exec(block)?.[1];
  const version = /^version = "([^"]+)"/m.exec(block)?.[1];
  const source = /^source = "([^"]+)"/m.exec(block)?.[1];
  if (!name || !version || !source) continue;
  const dir = cargoRegistries.map((registry) => path.join(cargoHome, "registry/src", registry.name, `${name}-${version}`))
    .find((candidate) => fs.existsSync(path.join(candidate, "Cargo.toml")));
  const manifest = dir ? read(path.join(dir, "Cargo.toml")) : "";
  const license = /^license = "([^"]+)"/m.exec(manifest)?.[1] ?? pending(name);
  const licenseFiles = dir ? collectNotices(dir, `cargo ${name}@${version}`) : [];
  rows.push({ ecosystem: "cargo", name, version, license,
    source: `https://crates.io/crates/${name}/${version}`, scope: "Cargo.lock resolved (includes target-specific and dev)",
    evidence: dir ? `cached Cargo.toml; ${licenseFiles.join(", ") || "no top-level license text"}` : "locked; source not cached on this host",
    sourceObligation: sourceObligation(license) });
}

// Electron's Chromium notice includes embedded components beyond npm metadata.
const electronRow = rows.find((row) => row.name === "electron");
const electron = electronRow ? installed.get(`electron@${electronRow.version}`) : undefined;
const chromiumFile = electron ? path.join(electron.dir, "dist/LICENSES.chromium.html") : undefined;
const chromiumNotice = chromiumFile && fs.existsSync(chromiumFile)
  ? { source: "electron/dist/LICENSES.chromium.html", electronVersion: electronRow.version,
    sha256: hash(read(chromiumFile)), packagedAs: "licenses/Electron-LICENSES.chromium.html" }
  : { status: "Pending: Electron Chromium notice not installed" };
collectNotices(path.join(root, "apps/desktop/resources/plugins/pi.file-manager"), "bundled pi.file-manager@0.5.2");
rows.sort((a, b) => `${a.ecosystem}/${a.name}/${a.version}`.localeCompare(`${b.ecosystem}/${b.name}/${b.version}`, "en"));
const stats = { npm: rows.filter((row) => row.ecosystem === "npm").length,
  cargo: rows.filter((row) => row.ecosystem === "cargo").length,
  pending: rows.filter((row) => row.license.includes("待确认")).length,
  noticeTexts: notices.size };
const metadata = { schemaVersion: 1, pnpmLockSha256: hash(lockText), cargoLockSha256: hash(cargoText), chromiumNotice, stats, dependencies: rows };
fs.writeFileSync(path.join(root, "docs/wcsdai/dependency-inventory.json"), `${JSON.stringify(metadata, null, 2)}\n`);
const header = `# Dependency license inventory\n\nGenerated from lockfiles and existing local package metadata. This is an inventory, not a legal clearance or an exact shipped-binary SBOM. All resolved platform/dev/optional packages are included; unavailable metadata stays pending. Original license texts collected on this host are in the repository’s LICENSES/ directory (see LICENSES/components/README.md). Regenerate with \`node docs/wcsdai/generate-license-inventory.mjs <dependency-checkout>\`.\n\n- npm versions: ${stats.npm}\n- Cargo versions: ${stats.cargo}\n- Pending metadata: ${stats.pending}\n- Distinct collected notice texts: ${stats.noticeTexts}\n- pnpm lock SHA-256: \`${metadata.pnpmLockSha256}\`\n- Cargo lock SHA-256: \`${metadata.cargoLockSha256}\`\n\n| Dependency | Version | License | Source | Source provision | Scope / evidence |\n| --- | --- | --- | --- | --- | --- |\n`;
fs.writeFileSync(path.join(root, "docs/wcsdai/dependency-inventory.md"), header + rows.map((row) => `| ${escape(`${row.ecosystem}: ${row.name}`)} | ${escape(row.version)} | ${escape(row.license)} | ${escape(row.source)} | ${escape(row.sourceObligation)} | ${escape(`${row.scope}; ${row.evidence}`)} |`).join("\n") + "\n");
const noticeHeader = "WcSdAi third-party license texts\n\nGenerated from installed packages/cached crate sources. Scope includes development\nand optional dependencies, not only the distributed app. Missing texts and platform\nmetadata remain release review items in docs/wcsdai/dependency-inventory.md.\nLicense and copyright notices below are reproduced without editing their text.\n\n";
fs.mkdirSync(path.join(root, "LICENSES/components"), { recursive: true });
fs.writeFileSync(path.join(root, "LICENSES/components/third-party-notices.txt"), noticeHeader + [...notices.values()]
  .sort((a, b) => a.sources[0].localeCompare(b.sources[0], "en"))
  .map((item) => `${"=".repeat(80)}\n${[...new Set(item.sources)].sort().join("\n")}\n${"=".repeat(80)}\n${item.content}\n`).join("\n"));
console.log(JSON.stringify(stats));
