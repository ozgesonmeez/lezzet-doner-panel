import io
import json
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs
import migrate_menu_images as migration


class MigrationTests(unittest.TestCase):
    def test_only_legacy_references_are_selected(self):
        uuid = "8d1e4657-a8ba-4530-bb66-fd4e67f1aad5"
        self.assertEqual(uuid, migration.legacy_id(migration.ORIGIN + "/api/public/menu/images/" + uuid))
        self.assertEqual(uuid, migration.legacy_id("/api/public/menu/images/" + uuid))
        self.assertIsNone(migration.legacy_id("https://res.cloudinary.com/demo/image/upload/photo.png"))
        self.assertIsNone(migration.legacy_id("https://example.com/api/public/menu/images/" + uuid))

    def test_retry_uses_same_public_id_and_never_overwrites(self):
        image = {
            "id": "8d1e4657-a8ba-4530-bb66-fd4e67f1aad5",
            "data": "AQID", "content_type": "image/png", "sha256": "expected-hash",
        }
        public_id = migration.FOLDER + "/legacy-" + image["id"]
        url = "https://res.cloudinary.com/demo/image/upload/" + public_id + ".png"
        requests = []

        def respond(request, **kwargs):
            requests.append(parse_qs(request.data.decode()))
            return io.BytesIO(json.dumps({"secure_url": url, "public_id": public_id}).encode())

        with patch.object(migration, "urlopen", side_effect=respond), patch.object(migration, "verify") as verify:
            first = migration.upload(image, "demo", "test-key", "test-secret")
            second = migration.upload(image, "demo", "test-key", "test-secret")
        self.assertEqual(first, second)
        self.assertEqual(requests[0]["public_id"], requests[1]["public_id"])
        self.assertEqual(["false"], requests[0]["overwrite"])
        self.assertEqual(["data:image/png;base64,AQID"], requests[0]["file"])
        self.assertEqual(2, verify.call_count)

    def test_unexpected_cloudinary_response_stops_before_verification(self):
        image = {"id": "8d1e4657-a8ba-4530-bb66-fd4e67f1aad5", "data": "AQID",
                 "content_type": "image/png", "sha256": "expected"}
        with patch.object(migration, "urlopen", return_value=io.BytesIO(b'{"secure_url":"https://example.com/photo.png"}')):
            with self.assertRaises(RuntimeError):
                migration.upload(image, "demo", "test-key", "test-secret")

    def test_updates_have_compare_and_swap_guard(self):
        ref = {"table": "menu_products", "column": "image_url", "id": 16}
        statement = migration.update_statement(ref, "old-url", "new-url")
        self.assertIn("WHERE id=16 AND image_url='old-url'", statement)
        self.assertIn("IF NOT FOUND THEN RAISE EXCEPTION", statement)
        self.assertNotIn("DELETE", statement)

    def test_unrelated_modules_cannot_be_updated(self):
        ref = {"table": "daily_cash_entries", "column": "image_url", "id": 1}
        with self.assertRaises(RuntimeError):
            migration.update_statement(ref, "old", "new")


if __name__ == "__main__":
    unittest.main()
