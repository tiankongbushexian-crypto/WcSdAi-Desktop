import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const repo = 'https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop';
const version = '1.0.5';
const releaseUrl = `${repo}/releases/tag/v${version}`;
const read = (name) => readFile(path.join(root, name), 'utf8');
const manifest = JSON.parse(await read('updates/stable.json'));
const release = JSON.parse(await read(`releases/${version}.json`));
const sumText = await read(`releases/${version}-SHA256SUMS`);
const sums = new Map(sumText.trim().split('\n').map((line) => {
  const match = /^([a-f0-9]{64}) {2}([A-Za-z0-9.-]+)$/.exec(line);
  assert.ok(match, 'Invalid checksum row');
  return [match[2], match[1]];
}));

assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.version, version);
assert.deepEqual(Object.keys(manifest.downloads).sort(), [
  'darwin-arm64', 'darwin-x64', 'win32-x64',
]);
for (const entry of Object.values(manifest.downloads)) {
  assert.deepEqual(entry, { url: releaseUrl });
}
assert.ok(manifest.notes.en && manifest.notes['zh-CN']);
assert.equal(release.version, version);
assert.equal(release.releaseUrl, releaseUrl);
assert.equal(release.assets.length, 8);
assert.equal(sums.size, release.assets.length);
assert.equal(release.assets.filter((a) => a.kind === 'installer').length, 3);
assert.equal(release.assets.filter((a) => a.kind === 'corresponding-source').length, 2);
assert.equal(release.assets.filter((a) => a.kind === 'complete-artifact').length, 3);

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

for (const asset of release.assets) {
  assert.match(asset.name, /^[A-Za-z0-9.-]+$/);
  assert.equal(sums.get(asset.name), asset.sha256);
  assert.equal(asset.sourceCommit, asset.role.startsWith('macos')
    ? '66523a3480cb42cd4e92b6747486cbeb7586c781'
    : 'a2d1da936618c3ccca1761289b5b6794b17481da');
  assert.ok(Number.isSafeInteger(asset.size) && asset.size > 0);
}
for (const notice of ['LICENSE', 'NOTICE.md', 'THIRD_PARTY_NOTICES.md',
  'LICENSES/LGPL-3.0.txt', 'LICENSES/components/GPL-3.0.txt',
  'LICENSES/components/OFL-1.1.txt', 'LICENSES/components/README.md',
  'LICENSES/components/third-party-notices.txt']) {
  assert.ok((await read(notice)).trim().length > 0, `Missing notice: ${notice}`);
}
const workflow = await read('.github/workflows/team-builds.yml');
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /permissions:\n {2}contents: read/);
assert.ok(workflow.includes('${{ github.repository }}/releases/tag/v1.0.5'));
assert.ok(!/\bwrite\b|\buses:|\bsecrets\./.test(workflow), 'Unexpected build/publication capability');

const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--assets'),
  'Usage: node scripts/verify-distribution.mjs [--assets /absolute/asset/directory]');
if (args.length) {
  const assetDirectory = path.resolve(args[1]);
  assert.deepEqual((await readdir(assetDirectory)).sort(),
    [...release.assets.map((a) => a.name), 'SHA256SUMS'].sort());
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
  installerCount: 3, sourceArchiveCount: 2, completeArchiveCount: 3,
  stagedAssetHashesVerified: args.length ? 8 : 0 }, null, 2));
