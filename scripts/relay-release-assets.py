"""One-time, hash-pinned relay of existing public installer artifacts."""

from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import tempfile
import urllib.parse
import urllib.request
import zipfile

REPOSITORY = 'tiankongbushexian-crypto/WcSdAi-Desktop-Downloads'
RELEASE_ID = 422152874
TAG = 'v1.0.5'
ROLES = ('macos-arm64', 'macos-x64', 'windows-x64')
ZIP_NAMES = {role: f'WcSdAi-1.0.5-{role}-unsigned.zip' for role in ROLES}
ROOT = Path(__file__).resolve().parent.parent


def require(condition, message):
    if not condition:
        raise ValueError(message)


def mask(value):
    escaped = value.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print('::add-mask::' + escaped, flush=True)


def validate_url(value):
    require(isinstance(value, str) and len(value) < 8192, 'Invalid artifact URL')
    parts = urllib.parse.urlsplit(value)
    require(parts.scheme == 'https' and not parts.fragment, 'Artifact URL must use HTTPS without a fragment')
    require(parts.username is None and parts.password is None, 'Artifact URL must not contain credentials')
    require(re.fullmatch(r'productionresultssa[0-9]+\.blob\.core\.windows\.net', parts.hostname or ''),
            'Artifact URL host is not allowed')
    require(parts.netloc in (parts.hostname, parts.hostname + ':443'), 'Artifact URL port is not allowed')
    require(parts.path.startswith('/') and bool(parts.query), 'Artifact URL path or query missing')
    query = urllib.parse.parse_qs(parts.query, strict_parsing=True)
    require(all(len(values) == 1 for values in query.values()), 'Repeated signed URL parameter')
    require(query.get('sp') == ['r'] and query.get('spr') == ['https'] and query.get('sr') == ['b'],
            'Artifact URL must grant HTTPS blob read only')
    require(bool(query.get('sig', [''])[0]), 'Artifact URL signature missing')
    expiry = datetime.fromisoformat(query.get('se', [''])[0].replace('Z', '+00:00'))
    require(expiry.tzinfo is not None and expiry > datetime.now(timezone.utc), 'Artifact URL is expired')
    return value


def parse_inputs(event):
    raw = event.get('inputs', {}).get('artifact_urls', '')
    require(isinstance(raw, str), 'Artifact URL input must be JSON text')
    mask(raw)
    urls = json.loads(raw)
    require(isinstance(urls, dict) and set(urls) == set(ROLES), 'Exactly three platform URL keys are required')
    for value in urls.values():
        if isinstance(value, str):
            mask(value)
    return {role: validate_url(urls[role]) for role in ROLES}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        return None


def open_request(request):
    return urllib.request.build_opener(NoRedirect()).open(request, timeout=120)


def digest_file(file):
    digest = hashlib.sha256()
    with file.open('rb') as stream:
        while chunk := stream.read(4 * 1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def verify_file(file, expected):
    require(file.is_file() and file.stat().st_size == expected['size'], 'Asset size mismatch')
    require(digest_file(file) == expected['sha256'], 'Asset SHA-256 mismatch')


def copy_bounded(source, destination, expected):
    size = 0
    digest = hashlib.sha256()
    with destination.open('xb') as target:
        while chunk := source.read(4 * 1024 * 1024):
            size += len(chunk)
            require(size <= expected['size'], 'Asset exceeds expected size')
            digest.update(chunk)
            target.write(chunk)
    require(size == expected['size'] and digest.hexdigest() == expected['sha256'], 'Asset content does not match approved bytes')


def download_zip(url, destination, expected):
    request = urllib.request.Request(url, headers={'Accept-Encoding': 'identity'})
    with open_request(request) as response:
        require(response.status == 200, 'Artifact download did not return HTTP 200')
        copy_bounded(response, destination, expected)


def extract_expected(archive, output, members):
    with zipfile.ZipFile(archive) as zipped:
        infos = zipped.infolist()
        require(len(infos) <= 100, 'Unexpected artifact member count')
        for name, expected in members.items():
            require(re.fullmatch(r'[A-Za-z0-9.-]+', name), 'Unsafe selected member name')
            matches = [info for info in infos if info.filename == name]
            require(len(matches) == 1, 'Expected artifact member missing or duplicated')
            info = matches[0]
            mode = info.external_attr >> 16
            require(not info.is_dir() and stat.S_IFMT(mode) in (0, stat.S_IFREG), 'Selected ZIP member is not a regular file')
            require(info.file_size == expected['size'], 'ZIP member exceeds approved size')
            target = output / name
            if target.exists():
                verify_file(target, expected)
                # Check the duplicate macOS source in the second original ZIP too.
                digest = hashlib.sha256()
                size = 0
                with zipped.open(info) as source:
                    while chunk := source.read(4 * 1024 * 1024):
                        size += len(chunk)
                        require(size <= expected['size'], 'Duplicate member exceeds approved size')
                        digest.update(chunk)
                require(size == expected['size'] and digest.hexdigest() == expected['sha256'], 'Duplicate source differs')
            else:
                with zipped.open(info) as source:
                    copy_bounded(source, target, expected)


def api_request(path, token, data=None, content_type=None, size=None):
    upload = path.startswith('https://uploads.github.com/')
    url = path if upload else 'https://api.github.com' + path
    expected_prefix = (f'https://uploads.github.com/repos/{REPOSITORY}/releases/{RELEASE_ID}/assets?'
                       if upload else f'https://api.github.com/repos/{REPOSITORY}/releases/{RELEASE_ID}')
    require(url.startswith(expected_prefix), 'Unexpected GitHub API destination')
    headers = {'Authorization': 'Bearer ' + token,
               'Accept': 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28'}
    if data is not None:
        headers.update({'Content-Type': content_type, 'Content-Length': str(size)})
    request = urllib.request.Request(url, headers=headers, data=data,
                                     method='POST' if data is not None else 'GET')
    with open_request(request) as response:
        body = response.read(1024 * 1024 + 1)
        require(len(body) <= 1024 * 1024, 'Unexpected API response size')
        return json.loads(body)


def existing_matches(asset, expected):
    return (bool(expected) and asset.get('name') == expected['name'] and asset.get('size') == expected['size']
            and asset.get('digest') == 'sha256:' + expected['sha256']
            and asset.get('state') == 'uploaded')


def publish(output, expected, token):
    release_path = f'/repos/{REPOSITORY}/releases/{RELEASE_ID}'
    release = api_request(release_path, token)
    require(release.get('id') == RELEASE_ID and release.get('tag_name') == TAG
            and release.get('draft') is True, 'Expected existing draft release not found')
    assets = api_request(release_path + '/assets?per_page=100', token)
    require(isinstance(assets, list) and len(assets) <= len(expected), 'Unexpected draft assets')
    existing = {}
    for asset in assets:
        name = asset.get('name')
        require(name in expected and name not in existing, 'Unexpected or duplicated existing asset')
        require(existing_matches(asset, expected[name]), 'Existing asset differs; refusing overwrite')
        existing[name] = asset
    # Validate all existing assets before making the first upload.
    for name, metadata in expected.items():
        if name in existing:
            print(f'Verified existing asset: {name}', flush=True)
            continue
        url = (f'https://uploads.github.com/repos/{REPOSITORY}/releases/{RELEASE_ID}/assets?'
               + urllib.parse.urlencode({'name': name}))
        with (output / name).open('rb') as stream:
            uploaded = api_request(url, token, stream, 'application/octet-stream', metadata['size'])
        require(existing_matches(uploaded, metadata), 'Uploaded asset metadata mismatch')
        print(f'Uploaded verified asset: {name}', flush=True)
    final = api_request(release_path + '/assets?per_page=100', token)
    require(len(final) == len(expected) and {a.get('name') for a in final} == set(expected)
            and all(existing_matches(a, expected.get(a.get('name'), {}))
            for a in final), 'Final release asset verification failed')


def main():
    require(os.environ.get('GITHUB_REPOSITORY') == REPOSITORY, 'This relay only runs in the staging repository')
    require(os.environ.get('GITHUB_EVENT_NAME') == 'workflow_dispatch', 'Manual dispatch required')
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    urls = parse_inputs(event)
    token = os.environ.get('GITHUB_TOKEN', '')
    require(bool(token), 'Job-scoped GitHub token missing')
    release = json.loads((ROOT / 'releases/1.0.5.json').read_text())
    expected = {a['name']: a for a in release['assets']}
    require(len(expected) == 8 and release['version'] == '1.0.5', 'Approved release metadata missing')
    require({a['name'] for a in expected.values() if a['kind'] == 'complete-artifact'} == set(ZIP_NAMES.values()),
            'Unexpected complete artifact metadata')
    with tempfile.TemporaryDirectory(prefix='wcsdai-public-relay-', dir=os.environ.get('RUNNER_TEMP')) as temp:
        output = Path(temp)
        for role in ROLES:
            name = ZIP_NAMES[role]
            download_zip(urls[role], output / name, expected[name])
            selected = {a['name']: a for a in expected.values()
                        if (a['kind'] == 'installer' and a['role'] == role)
                        or (a['kind'] == 'corresponding-source'
                            and a['role'] == ('windows-source' if role == 'windows-x64' else 'macos-source'))}
            require(len(selected) == 2, 'Expected installer and source mapping missing')
            extract_expected(output / name, output, selected)
            print(f'Verified original archive and selected members: {role}', flush=True)
        sums = ROOT / 'releases/1.0.5-SHA256SUMS'
        shutil.copyfile(sums, output / 'SHA256SUMS')
        subprocess.run(['node', str(ROOT / 'scripts/verify-distribution.mjs'), '--assets', str(output)], check=True)
        expected['SHA256SUMS'] = {'name': 'SHA256SUMS', 'size': sums.stat().st_size,
                                 'sha256': digest_file(sums)}
        publish(output, expected, token)
    print('Relay complete: all 9 approved assets verified on the existing draft release.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Exceptions from urllib can include signed URLs; never emit their text.
        print(f'::error::Asset relay failed ({type(error).__name__}); no URL or token is logged.', flush=True)
        raise SystemExit(1)
