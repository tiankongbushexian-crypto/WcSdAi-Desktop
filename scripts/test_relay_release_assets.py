import contextlib
from datetime import datetime, timedelta, timezone
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.parse
import zipfile

spec = importlib.util.spec_from_file_location('relay', Path(__file__).with_name('relay-release-assets.py'))
relay = importlib.util.module_from_spec(spec)
spec.loader.exec_module(relay)


def signed_url(**changes):
    query = {'sp': 'r', 'spr': 'https', 'sr': 'b', 'sig': 'example-not-a-real-signature',
             'se': (datetime.now(timezone.utc) + timedelta(minutes=20)).isoformat()}
    query.update(changes)
    return 'https://productionresultssa5.blob.core.windows.net/public/artifact.zip?' + urllib.parse.urlencode(query)


def metadata(name, content):
    return {'name': name, 'size': len(content), 'sha256': hashlib.sha256(content).hexdigest()}


class UrlValidation(unittest.TestCase):
    def test_read_only_https_blob(self):
        url = signed_url()
        self.assertEqual(relay.validate_url(url), url)

    def test_reject_url_authority_changes(self):
        url = signed_url()
        invalid = [url.replace('https:', 'http:'), url + '#fragment',
                   url.replace('productionresultssa5.', 'user:pass@productionresultssa5.'),
                   url.replace('.net/', '.net:8443/'), url.replace('.net/', '.net.evil.example/'),
                   url.replace('productionresultssa5', 'untrusted'),
                   url.replace('productionresultssa5', 'productionresultssa5@evil.example')]
        for value in invalid:
            with self.subTest(value=value.split('?')[0]), self.assertRaises(ValueError):
                relay.validate_url(value)

    def test_reject_permissions_and_expiry(self):
        for query in ({'sp': 'rw'}, {'spr': 'http,https'}, {'sr': 'c'}, {'sig': ''},
                      {'se': '2000-01-01T00:00:00Z'}):
            with self.subTest(query=query), self.assertRaises(ValueError):
                relay.validate_url(signed_url(**query))
        with self.assertRaises(ValueError):
            relay.validate_url(signed_url() + '&sp=r')

    def test_inputs_fixed_keys_and_masked(self):
        data = {role: signed_url() for role in relay.ROLES}
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            self.assertEqual(relay.parse_inputs({'inputs': {'artifact_urls': json.dumps(data)}}), data)
        self.assertEqual(output.getvalue().count('::add-mask::'), 4)
        data['unexpected'] = signed_url()
        with contextlib.redirect_stdout(io.StringIO()), self.assertRaises(ValueError):
            relay.parse_inputs({'inputs': {'artifact_urls': json.dumps(data)}})

    def test_redirects_are_disabled(self):
        self.assertIsNone(relay.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://evil.example'))


class Extraction(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.output = self.root / 'output'
        self.output.mkdir()
        self.archive = self.root / 'original.zip'
        self.expected = {'installer.exe': metadata('installer.exe', b'installer'),
                         'source.tar.gz': metadata('source.tar.gz', b'source')}

    def tearDown(self):
        self.temp.cleanup()

    def write_zip(self, entries):
        with zipfile.ZipFile(self.archive, 'w') as zipped:
            for name, content in entries:
                zipped.writestr(name, content)

    def test_extract_only_expected_members(self):
        self.write_zip([('installer.exe', b'installer'), ('source.tar.gz', b'source'),
                        ('ignored.txt', b'ignored'), ('../outside', b'never written')])
        relay.extract_expected(self.archive, self.output, self.expected)
        self.assertEqual(sorted(p.name for p in self.output.iterdir()), ['installer.exe', 'source.tar.gz'])
        self.assertFalse((self.root / 'outside').exists())

    def test_reject_duplicate_selected_member(self):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', UserWarning)
            self.write_zip([('installer.exe', b'installer'), ('installer.exe', b'installer')])
        with self.assertRaises(ValueError):
            relay.extract_expected(self.archive, self.output, self.expected)

    def test_reject_size_and_hash_mismatch(self):
        for content in (b'too-long-installer', b'XXXXXXXXX'):
            self.write_zip([('installer.exe', content), ('source.tar.gz', b'source')])
            with self.assertRaises(ValueError):
                relay.extract_expected(self.archive, self.output, self.expected)
            for file in self.output.iterdir():
                file.unlink()

    def test_reject_symlink(self):
        info = zipfile.ZipInfo('installer.exe')
        info.create_system = 3
        info.external_attr = 0o120777 << 16
        self.write_zip([(info, b'installer'), ('source.tar.gz', b'source')])
        with self.assertRaises(ValueError):
            relay.extract_expected(self.archive, self.output, self.expected)

    def test_existing_source_must_match(self):
        self.write_zip([('installer.exe', b'installer'), ('source.tar.gz', b'source')])
        (self.output / 'source.tar.gz').write_bytes(b'wrong!')
        with self.assertRaises(ValueError):
            relay.extract_expected(self.archive, self.output, self.expected)

    def test_bounded_copy_rejects_oversize(self):
        with self.assertRaises(ValueError):
            relay.copy_bounded(io.BytesIO(b'oversize'), self.output / 'bounded', metadata('bounded', b'ok'))


class Publication(unittest.TestCase):
    def test_existing_asset_requires_all_identity_fields(self):
        expected = metadata('installer.exe', b'approved')
        asset = {'name': expected['name'], 'size': expected['size'],
                 'digest': 'sha256:' + expected['sha256'], 'state': 'uploaded'}
        self.assertTrue(relay.existing_matches(asset, expected))
        for key, value in [('name', 'other.exe'), ('size', 0), ('digest', None), ('state', 'starter')]:
            with self.subTest(key=key):
                self.assertFalse(relay.existing_matches({**asset, key: value}, expected))

    def test_wrong_repository_request_rejected_before_network(self):
        with self.assertRaises(ValueError):
            relay.api_request('/repos/another/project/releases/422152874', 'fake')

    def test_existing_mismatch_blocks_uploads(self):
        expected = metadata('installer.exe', b'approved')
        release = {'id': relay.RELEASE_ID, 'tag_name': relay.TAG, 'draft': True}
        wrong = {'name': 'installer.exe', 'size': expected['size'], 'digest': 'sha256:wrong', 'state': 'uploaded'}
        with patch.object(relay, 'api_request', side_effect=[release, [wrong]]) as api:
            with self.assertRaises(ValueError):
                relay.publish(Path('/unused'), {'installer.exe': expected}, 'fake')
        self.assertEqual([call.args[2:] for call in api.call_args_list], [(), ()])

    def test_public_release_is_never_modified(self):
        release = {'id': relay.RELEASE_ID, 'tag_name': relay.TAG, 'draft': False}
        with patch.object(relay, 'api_request', return_value=release):
            with self.assertRaises(ValueError):
                relay.publish(Path('/unused'), {}, 'fake')


if __name__ == '__main__':
    unittest.main()
