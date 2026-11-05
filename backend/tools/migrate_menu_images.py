#!/usr/bin/env python3
"""Back up first. Plan by default; upload only with --upload, update only with --apply.

Credentials are read in memory from the QR service's Railway environment.
Never prints credentials or deletes assets. Requires the Railway CLI and SSH access.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.error import HTTPError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from uuid import UUID

PROJECT = "5333381a-5c4b-4aa2-b130-3b083d645524"
QR_SERVICE = "d3a7f587-7f45-495d-a2a7-d2787e8fc003"
DATABASE = "cdf9aee4-de58-411b-a9d6-5f031e663d6e"
ORIGIN = "https://compassionate-reverence-production-2423.up.railway.app"
FOLDER = "lezzet-doner/menu"
FIELDS = {
    "menu_products": ("image_url",),
    "menu_slides": ("desktop_image_url", "mobile_image_url"),
}


def execute(command):
    result = subprocess.run(command, capture_output=True, timeout=180)
    if result.returncode:
        raise RuntimeError("Command failed. No credentials are included in this error.")
    return result.stdout.decode()


def sql(statement):
    return execute([
        "railway", "ssh", "-p", PROJECT, "-s", DATABASE, "-e", "production",
        "--", "psql", "-U", "postgres", "-d", "railway", "-X", "-At",
        "-v", "ON_ERROR_STOP=1", "-c", statement,
    ])


def json_query(query):
    output = sql("BEGIN READ ONLY; SELECT row_to_json(snapshot) FROM (" + query + ") snapshot; COMMIT;")
    return [json.loads(line) for line in output.splitlines() if line.startswith("{")]


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def legacy_id(url):
    if not url:
        return None
    parsed = urlparse(url)
    prefix = "/api/public/menu/images/"
    if parsed.path.startswith(prefix) and (
        not parsed.netloc or parsed.netloc == urlparse(ORIGIN).netloc
    ):
        return str(UUID(parsed.path[len(prefix):]))
    return None


def save(path, value):
    temporary = path.with_suffix(".tmp")
    with temporary.open("w") as handle:
        os.chmod(temporary, 0o600)
        json.dump(value, handle, indent=2)
    temporary.replace(path)


def credentials():
    output = execute([
        "railway", "variable", "list", "-p", PROJECT, "-s", QR_SERVICE,
        "-e", "production", "--json",
    ])
    values = json.loads(output)
    keys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
    if not all(values.get(key) for key in keys):
        raise RuntimeError("Cloudinary credentials are unavailable in the Railway service environment.")
    return [values[key] for key in keys]


def upload(image, cloud_name, api_key, api_secret):
    data = base64.b64decode(image["data"])
    parameters = {
        "folder": FOLDER,
        "public_id": "legacy-" + str(UUID(image["id"])),
        "overwrite": "false",
        "timestamp": str(int(time.time())),
    }
    signature_text = "&".join(key + "=" + parameters[key] for key in sorted(parameters))
    signature = hashlib.sha1((signature_text + api_secret).encode()).hexdigest()
    body = urlencode({
        **parameters, "signature": signature, "api_key": api_key,
        "file": "data:" + image["content_type"] + ";base64," + base64.b64encode(data).decode(),
    }).encode()
    request = Request("https://api.cloudinary.com/v1_1/" + cloud_name + "/image/upload",
                      data=body, headers={"Content-Type": "application/x-www-form-urlencoded"})
    try:
        with urlopen(request, timeout=120) as response:
            result = json.load(response)
    except HTTPError as error:
        raise RuntimeError("Cloudinary upload failed, HTTP " + str(error.code)) from None
    url = result.get("secure_url", "")
    public_id = FOLDER + "/legacy-" + image["id"]
    if (result.get("public_id") != public_id
            or urlparse(url).scheme != "https"
            or urlparse(url).hostname != "res.cloudinary.com"
            or not urlparse(url).path.startswith("/" + cloud_name + "/")):
        raise RuntimeError("Unexpected Cloudinary response for image " + image["id"])
    verify(url, image["sha256"])
    return {"url": url, "public_id": public_id, "sha256": image["sha256"]}


def verify(url, expected):
    with urlopen(url, timeout=60) as response:
        if response.status != 200 or not response.headers.get_content_type().startswith("image/"):
            raise RuntimeError("Image URL did not return an image.")
        actual = hashlib.sha256(response.read()).hexdigest()
    if actual != expected:
        raise RuntimeError("Original-byte verification failed; no references will be changed.")


def update_statement(reference, before, after):
    table, column = reference["table"], reference["column"]
    if table not in FIELDS or column not in FIELDS[table]:
        raise RuntimeError("Unexpected reference field.")
    return (
        "DO $$ BEGIN UPDATE " + table + " SET " + column + "=" + literal(after)
        + " WHERE id=" + str(int(reference["id"])) + " AND " + column + "=" + literal(before)
        + "; IF NOT FOUND THEN RAISE EXCEPTION 'Image reference changed concurrently'; END IF; END $$;"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backup", type=Path, required=True)
    parser.add_argument("--journal", type=Path, required=True)
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    backup = args.backup.read_bytes()
    checksum = hashlib.sha256(backup).hexdigest()
    if not backup.startswith(b"PGDMP") or args.backup.with_suffix(".sha256").read_text().strip() != checksum:
        raise RuntimeError("PostgreSQL backup or checksum is invalid.")
    # SHA sidecar must be produced only after a successful pg_dump and restore check.
    images = json_query("SELECT id::text,content_type,encode(image_bytes,'base64') AS data FROM menu_uploaded_images ORDER BY id")
    for image in images:
        image["sha256"] = hashlib.sha256(base64.b64decode(image["data"])).hexdigest()
    by_id = {image["id"]: image for image in images}
    references = []
    for table, columns in FIELDS.items():
        for row in json_query("SELECT id," + ",".join(columns) + " FROM " + table + " ORDER BY id"):
            for column in columns:
                source = row[column]
                image_id = legacy_id(source)
                if image_id:
                    if image_id not in by_id:
                        raise RuntimeError("Reference points to a missing legacy image.")
                    references.append({
                        "table": table, "id": row["id"], "column": column,
                        "old_url": source, "image_id": image_id,
                    })
    journal = json.loads(args.journal.read_text()) if args.journal.exists() else {
        "backup_sha256": checksum, "uploads": {}, "references": references,
    }
    if journal["backup_sha256"] != checksum:
        raise RuntimeError("Journal belongs to a different backup.")
    original = {(item["table"], item["id"], item["column"]): item for item in journal["references"]}
    for reference in references:
        key = (reference["table"], reference["id"], reference["column"])
        if key in original and original[key] != reference:
            raise RuntimeError("A reference changed since the previous plan. Review before retrying.")
        original[key] = reference
    journal["references"] = list(original.values())
    print("Database images:", len(images), "legacy references:", len(references))
    if not (args.upload or args.apply):
        print("Read-only plan. No uploads or updates performed.")
        return
    auth = credentials()
    # Upload all stored images, including unreferenced ones. Stable IDs + overwrite=false
    # preserve retry behavior even after interruption before writing the local journal.
    for image in images:
        previous = journal["uploads"].get(image["id"])
        if previous and previous["sha256"] != image["sha256"]:
            raise RuntimeError("Legacy image bytes changed since the previous attempt.")
        if previous:
            verify(previous["url"], image["sha256"])
        else:
            journal["uploads"][image["id"]] = upload(image, *auth)
            save(args.journal, journal)
        print("Verified image", image["id"])
    if not args.apply:
        print("Uploads verified. Product and slider references are unchanged.")
        return
    # Verify everything again before a single transaction. Roll back all reference changes
    # if any row was edited concurrently. Only image columns are updated.
    statements = ["BEGIN; SET LOCAL lock_timeout='5s';",
                  "SELECT pg_advisory_xact_lock(81421103);"]
    for reference in references:
        target = journal["uploads"][reference["image_id"]]["url"]
        statements.append(update_statement(reference, reference["old_url"], target))
    statements.append("COMMIT;")
    rollback = ["BEGIN;"]
    for reference in journal["references"]:
        target = journal["uploads"][reference["image_id"]]["url"]
        rollback.append(update_statement(reference, target, reference["old_url"]))
    rollback.append("COMMIT;")
    rollback_path = args.journal.with_suffix(".rollback.sql")
    rollback_path.write_text("\n".join(rollback) + "\n")
    os.chmod(rollback_path, 0o600)
    sql(" ".join(statements))
    journal["applied"] = True
    save(args.journal, journal)
    print("Image references updated in one transaction. Legacy bytes and endpoints retained.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Do not expose CLI output, signed URLs, or environment contents.
        if isinstance(error, (RuntimeError, FileNotFoundError)):
            print(str(error))
        else:
            print("Migration stopped safely:", type(error).__name__)
        raise SystemExit(1)
