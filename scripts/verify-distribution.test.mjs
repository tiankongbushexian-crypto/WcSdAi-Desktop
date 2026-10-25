import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const repo = 'https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop';
const roles = ['macos-arm64', 'macos-x64', 'windows-x64'];
const notices = ['LICENSE', 'NOTICE.md', 'THIRD_PARTY_NOTICES.md',
  'LICENSES/LGPL-3.0.txt', 'LICENSES/components/GPL-3.0.txt',
  'LICENSES/components/OFL-1.1.txt', 'LICENSES/components/README.md',
  'LICENSES/components/third-party-notices.txt'];

async function fixture(t, { splitSource = false, mutate = () => {} } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'wcsdai-distribution-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const version = splitSource ? '1.0.5' : '1.1.0';
  const releaseUrl = `${repo}/releases/tag/v${version}`;
  const commits = ['a'.repeat(40), 'b'.repeat(40)];
  const assets = [];
  const bodies = new Map();
  function add(kind, role, sourceCommit, suffix) {
    const name = `WcSdAi-${version}-${suffix}`;
    // Opaque synthetic bytes exercise manifest bindings and file hashing. Archive
    // contents are separately verified by the private source build pipeline.
    const body = Buffer.from(`${kind}\n${role}\n${sourceCommit}\n`);
    bodies.set(name, body);
    assets.push({ name, kind, role, sourceCommit, size: body.length,
      sha256: createHash('sha256').update(body).digest('hex') });
  }
  for (const role of roles) {
    const commit = splitSource && role === 'windows-x64' ? commits[1] : commits[0];
    add('installer', role, commit, `${role}-unsigned.${role.startsWith('macos') ? 'dmg' : 'exe'}`);
    add('complete-artifact', role, commit, `${role}-unsigned.zip`);
  }
  add('corresponding-source', splitSource ? 'macos-source' : 'source', commits[0], `source-${commits[0].slice(0, 12)}.tar.gz`);
  if (splitSource) add('corresponding-source', 'windows-source', commits[1], `source-${commits[1].slice(0, 12)}.tar.gz`);
  const release = { version, releaseUrl, assets };
  const manifest = { schemaVersion: 1, version, notes: { en: 'Fixture release', 'zh-CN': 'Fixture release' },
    downloads: Object.fromEntries(['darwin-arm64', 'darwin-x64', 'win32-x64'].map(role => [role, { url: releaseUrl }])) };
  mutate({ release, manifest });
  const files = {
    'scripts/verify-distribution.mjs': await readFile(path.join(root, 'scripts/verify-distribution.mjs')),
    '.github/workflows/team-builds.yml': await readFile(path.join(root, '.github/workflows/team-builds.yml')),
    'updates/stable.json': JSON.stringify(manifest),
    [`releases/${version}.json`]: JSON.stringify(release),
  };
  const sums = release.assets.map(a => `${a.sha256}  ${a.name}\n`).join('');
  files[`releases/${version}-SHA256SUMS`] = sums;
  files['assets/SHA256SUMS'] = sums;
  const markdown = [releaseUrl, 'Source code (zip)', 'WcSdAi-Desktop-Source',
    ...release.assets.map(a => `${repo}/releases/download/v${version}/${a.name} ${a.sha256}`)].join('\n');
  files['README.md'] = files['README.zh-CN.md'] = markdown;
  for (const notice of notices) files[notice] = 'Synthetic notice for verification tests.\n';
  for (const asset of release.assets) files[`assets/${asset.name}`] = bodies.get(asset.name) ?? Buffer.from('mismatched fixture');
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await writeFile(path.join(dir, name), content);
  }
  return { dir, release, sums };
}
function verify(dir, withAssets = false) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts/verify-distribution.mjs'),
    ...(withAssets ? ['--assets', path.join(dir, 'assets')] : [])], { encoding: 'utf8' });
}
function passes(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
function fails(result, reason) {
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, reason);
}

test('the checked-in historical manifest remains valid', () => {
  const result = JSON.parse(execFileSync(process.execPath, [path.join(root, 'scripts/verify-distribution.mjs')], { encoding: 'utf8' }));
  assert.equal(result.result, 'PASS');
});
test('one corresponding source covers three same-commit platform artifacts', async t => {
  const { dir } = await fixture(t);
  assert.deepEqual(passes(verify(dir, true)), { result: 'PASS', version: '1.1.0', manifestPlatforms: 3,
    installerCount: 3, sourceArchiveCount: 1, completeArchiveCount: 3, stagedAssetHashesVerified: 7 });
});
test('historical macOS and Windows builds may have distinct corresponding sources', async t => {
  const { dir } = await fixture(t, { splitSource: true });
  assert.equal(passes(verify(dir, true)).sourceArchiveCount, 2);
});
test('a complete archive cannot claim a different commit than its installer', async t => {
  const { dir } = await fixture(t, { mutate: ({ release }) => { release.assets.find(a => a.kind === 'complete-artifact').sourceCommit = 'b'.repeat(40); } });
  fails(verify(dir), /archive.*commit/i);
});
test('each platform requires both its installer and complete archive', async t => {
  for (const kind of ['installer', 'complete-artifact']) {
    const { dir } = await fixture(t, { mutate: ({ release }) => {
      release.assets = release.assets.filter(a => !(a.kind === kind && a.role === 'macos-arm64'));
    } });
    fails(verify(dir), /platform set mismatch/i);
  }
});
test('source absence is rejected even when checksums and README agree', async t => {
  const { dir } = await fixture(t, { mutate: ({ release }) => { release.assets = release.assets.filter(a => a.kind !== 'corresponding-source'); } });
  fails(verify(dir), /corresponding source/i);
});
test('a source from another commit cannot satisfy installer provenance', async t => {
  const { dir } = await fixture(t, { mutate: ({ release }) => {
    const source = release.assets.find(a => a.kind === 'corresponding-source');
    source.sourceCommit = 'b'.repeat(40); source.name = source.name.replace('aaaaaaaaaaaa', 'bbbbbbbbbbbb');
  } });
  fails(verify(dir), /corresponding source/i);
});
test('unrelated extra source archives cannot be attached to a release', async t => {
  const { dir } = await fixture(t, { mutate: ({ release }) => {
    const source = release.assets.find(a => a.kind === 'corresponding-source');
    release.assets.push({ ...source, sourceCommit: 'b'.repeat(40),
      name: source.name.replace('aaaaaaaaaaaa', 'bbbbbbbbbbbb') });
  } });
  fails(verify(dir), /corresponding source without a matching installer/i);
});
test('source names and platform labels cannot contradict their provenance', async t => {
  const wrongName = await fixture(t, { mutate: ({ release }) => { release.assets.find(a => a.kind === 'corresponding-source').name = 'WcSdAi-1.1.0-source-bbbbbbbbbbbb.tar.gz'; } });
  fails(verify(wrongName.dir), /source.*name/i);
  const wrongPlatform = await fixture(t, { mutate: ({ release }) => { release.assets.find(a => a.kind === 'corresponding-source').role = 'windows-source'; } });
  fails(verify(wrongPlatform.dir), /source.*platform/i);
});
test('manifest version must select the matching release document', async t => {
  const { dir } = await fixture(t, { mutate: ({ release }) => { release.version = '1.0.5'; } });
  fails(verify(dir), /version/i);
});
test('an invalid manifest version is rejected before selecting a release path', async t => {
  const { dir } = await fixture(t, { mutate: ({ manifest }) => { manifest.version = '../1.1.0'; } });
  fails(verify(dir), /invalid stable version/i);
});
test('duplicate checksum rows and platform artifacts are rejected', async t => {
  const { dir, sums } = await fixture(t);
  await writeFile(path.join(dir, 'releases/1.1.0-SHA256SUMS'), sums + sums.split('\n')[0] + '\n');
  fails(verify(dir), /duplicate checksum/i);
  const duplicate = await fixture(t, { mutate: ({ release }) => { release.assets.push({ ...release.assets[0] }); } });
  fails(verify(duplicate.dir), /duplicate/i);
});
test('staged assets retain exact file-set, length, and SHA-256 verification', async t => {
  const { dir, release } = await fixture(t);
  const target = path.join(dir, 'assets', release.assets[0].name);
  const original = await readFile(target);
  await writeFile(target, Buffer.alloc(original.length, 120));
  fails(verify(dir, true), /SHA-256 mismatch/i);
  await writeFile(target, original.subarray(1));
  fails(verify(dir, true), /size mismatch/i);
  await writeFile(target, original);
  await writeFile(path.join(dir, 'assets', 'unexpected.txt'), 'unexpected');
  fails(verify(dir, true), /asset file set/i);
});
test('README links and the legacy read-only workflow remain enforced', async t => {
  const { dir, release } = await fixture(t);
  const readme = path.join(dir, 'README.md');
  const original = await readFile(readme, 'utf8');
  await writeFile(readme, original.replace(release.assets[0].name, 'missing.dmg'));
  fails(verify(dir), /link missing/i);
  await writeFile(readme, original);
  const workflow = path.join(dir, '.github/workflows/team-builds.yml');
  await writeFile(workflow, (await readFile(workflow, 'utf8')).replace('contents: read', 'contents: write'));
  fails(verify(dir), /read-only workflow/i);
  await writeFile(workflow, (await readFile(workflow, 'utf8')).replace('contents: write', 'contents: read')
    + '\n      - uses: actions/checkout@v4\n');
  fails(verify(dir), /unexpected build\/publication capability/i);
});
