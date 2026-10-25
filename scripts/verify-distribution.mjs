import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const repo = 'https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop';
const read = (name) => readFile(path.join(root, name), 'utf8');
const manifest = JSON.parse(await read('updates/stable.json'));
const version = manifest.version;
// Validate before using the version as a local path or download URL component.
assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, 'Invalid stable version');
const releaseUrl = `${repo}/releases/tag/v${version}`;
const release = JSON.parse(await read(`releases/${version}.json`));
const sumText = await read(`releases/${version}-SHA256SUMS`);
const sums = new Map();
for (const line of sumText.trim().split('\n')) {
  const match = /^([a-f0-9]{64}) {2}([A-Za-z0-9.-]+)$/.exec(line);
  assert.ok(match, 'Invalid checksum row');
  assert.ok(!sums.has(match[2]), `Duplicate checksum: ${match[2]}`);
  sums.set(match[2], match[1]);
}

assert.equal(manifest.schemaVersion, 1);
assert.deepEqual(Object.keys(manifest.downloads).sort(), [
  'darwin-arm64', 'darwin-x64', 'win32-x64',
]);
for (const entry of Object.values(manifest.downloads)) {
  assert.deepEqual(entry, { url: releaseUrl });
}
assert.ok(manifest.notes.en && manifest.notes['zh-CN']);
assert.equal(release.version, version, 'Release version differs from stable manifest');
assert.equal(release.releaseUrl, releaseUrl);
assert.ok(Array.isArray(release.assets), 'Release assets must be an array');
const platformRoles = ['macos-arm64', 'macos-x64', 'windows-x64'];
const names = new Set();
for (const asset of release.assets) {
  assert.match(asset.name, /^[A-Za-z0-9.-]+$/);
  assert.ok(!names.has(asset.name), `Duplicate asset: ${asset.name}`);
  names.add(asset.name);
  assert.match(asset.sha256, /^[a-f0-9]{64}$/, `${asset.name}: invalid SHA-256`);
  assert.match(asset.sourceCommit, /^[a-f0-9]{40}$/, `${asset.name}: invalid source commit`);
  assert.equal(sums.get(asset.name), asset.sha256, `${asset.name}: checksum mismatch`);
  assert.ok(Number.isSafeInteger(asset.size) && asset.size > 0, `${asset.name}: invalid size`);
  if (asset.kind === 'corresponding-source') {
    assert.ok(['source', 'macos-source', 'windows-source'].includes(asset.role),
      `${asset.name}: invalid source platform`);
    assert.equal(asset.name, `WcSdAi-${version}-source-${asset.sourceCommit.slice(0, 12)}.tar.gz`,
      'Source archive name must identify its version and commit');
  } else {
    assert.ok(['installer', 'complete-artifact'].includes(asset.kind), `${asset.name}: unknown asset kind`);
    assert.ok(platformRoles.includes(asset.role), `${asset.name}: unknown platform`);
    const extension = asset.kind === 'complete-artifact' ? 'zip'
      : asset.role.startsWith('macos-') ? 'dmg' : 'exe';
    assert.equal(asset.name, `WcSdAi-${version}-${asset.role}-unsigned.${extension}`,
      `${asset.name}: name does not match its platform and kind`);
  }
}
assert.equal(sums.size, names.size, 'Checksum file set differs from release assets');
const installers = release.assets.filter(a => a.kind === 'installer');
const archives = release.assets.filter(a => a.kind === 'complete-artifact');
const sources = release.assets.filter(a => a.kind === 'corresponding-source');
assert.deepEqual(installers.map(a => a.role).sort(), platformRoles, 'Installer platform set mismatch');
assert.deepEqual(archives.map(a => a.role).sort(), platformRoles, 'Complete archive platform set mismatch');
for (const installer of installers) {
  const archive = archives.find(a => a.role === installer.role);
  assert.equal(archive.sourceCommit, installer.sourceCommit,
    `${installer.role}: complete archive commit differs from installer`);
  const matchingSources = sources.filter(a => a.sourceCommit === installer.sourceCommit);
  assert.equal(matchingSources.length, 1, `${installer.role}: expected one corresponding source for installer commit`);
  const source = matchingSources[0];
  assert.ok(source.role === 'source' || source.role === `${installer.role.split('-')[0]}-source`,
    `${installer.role}: corresponding source platform mismatch`);
}
// A single source can cover all platforms. Historical split builds retain one
// corresponding source per distinct installer commit, without orphan sources.
assert.equal(sources.length, new Set(installers.map(a => a.sourceCommit)).size,
  'Unexpected corresponding source without a matching installer');

for (const name of ['README.md', 'README.zh-CN.md']) {
  const markdown = await read(name);
  assert.ok(markdown.includes(releaseUrl), `${name}: release link missing`);
  assert.ok(markdown.includes('Source code (zip)'), `${name}: source distinction missing`);
  assert.ok(markdown.includes('WcSdAi-Desktop-Source'), `${name}: development repository missing`);
  assert.ok(!markdown.includes('/actions/runs/'), `${name}: expiring Actions download`);
  for (const asset of release.assets) {
    assert.ok(markdown.includes(`${repo}/releases/download/v${version}/${asset.name}`),
      `${name}: ${asset.name} link missing`);
    if (asset.kind !== 'complete-artifact') {
      assert.ok(markdown.includes(asset.sha256), `${name}: ${asset.name} hash missing`);
    }
  }
}

for (const notice of ['LICENSE', 'NOTICE.md', 'THIRD_PARTY_NOTICES.md',
  'LICENSES/LGPL-3.0.txt', 'LICENSES/components/GPL-3.0.txt',
  'LICENSES/components/OFL-1.1.txt', 'LICENSES/components/README.md',
  'LICENSES/components/third-party-notices.txt']) {
  assert.ok((await read(notice)).trim().length > 0, `Missing notice: ${notice}`);
}
const workflow = await read('.github/workflows/team-builds.yml');
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /permissions:\n {2}contents: read/, 'Legacy read-only workflow permissions changed');
assert.match(workflow, /\$\{\{ github\.repository \}\}\/releases\/tag\/v\d+\.\d+\.\d+/);
assert.ok(!/\bwrite\b|\buses:|\bsecrets\./.test(workflow), 'Unexpected build/publication capability');

const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--assets'),
  'Usage: node scripts/verify-distribution.mjs [--assets /absolute/asset/directory]');
if (args.length) {
  const assetDirectory = path.resolve(args[1]);
  assert.deepEqual((await readdir(assetDirectory)).sort(),
    [...release.assets.map((a) => a.name), 'SHA256SUMS'].sort(), 'Staged asset file set mismatch');
  assert.equal(await readFile(path.join(assetDirectory, 'SHA256SUMS'), 'utf8'), sumText);
  for (const asset of release.assets) {
    const file = path.join(assetDirectory, asset.name);
    assert.equal((await stat(file)).size, asset.size, `${asset.name}: size mismatch`);
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(file)) hash.update(chunk);
    assert.equal(hash.digest('hex'), asset.sha256, `${asset.name}: SHA-256 mismatch`);
  }
}
console.log(JSON.stringify({ result: 'PASS', version, manifestPlatforms: 3,
  installerCount: installers.length, sourceArchiveCount: sources.length, completeArchiveCount: archives.length,
  stagedAssetHashesVerified: args.length ? release.assets.length : 0 }, null, 2));
