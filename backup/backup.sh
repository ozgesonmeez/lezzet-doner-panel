#!/usr/bin/env bash

set -Eeuo pipefail

# =========================================================
# REQUIRED ENVIRONMENT VARIABLES
# =========================================================

: "${DATABASE_URL:?DATABASE_URL tanımlı değil.}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN tanımlı değil.}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY tanımlı değil.}"

# =========================================================
# CONFIGURATION
# =========================================================

BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
RELEASE_TAG="${BACKUP_RELEASE_TAG:-db-backups}"

GITHUB_API="https://api.github.com"
GITHUB_UPLOADS="https://uploads.github.com"

TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"

BACKUP_NAME="lezzet-doner-${TIMESTAMP}.dump"

WORK_DIR="$(mktemp -d)"
BACKUP_FILE="${WORK_DIR}/${BACKUP_NAME}"

RELEASE_JSON="${WORK_DIR}/release.json"
ASSETS_FILE="${WORK_DIR}/assets.json"
DELETE_IDS="${WORK_DIR}/delete-ids.txt"

trap 'rm -rf "${WORK_DIR}"' EXIT

touch "${DELETE_IDS}"

github_api() {
  curl \
    --silent \
    --show-error \
    --fail-with-body \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$@"
}

echo "============================================"
echo "Lezzet Döner PostgreSQL Backup"
echo "UTC: ${TIMESTAMP}"
echo "============================================"

# =========================================================
# CREATE POSTGRESQL DUMP
# =========================================================

echo "PostgreSQL yedeği oluşturuluyor..."

pg_dump \
  "${DATABASE_URL}" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="${BACKUP_FILE}"

if [[ ! -s "${BACKUP_FILE}" ]]; then
  echo "HATA: Backup dosyası boş."
  exit 1
fi

# =========================================================
# VERIFY BACKUP
# =========================================================

echo "Backup doğrulanıyor..."

pg_restore \
  --list \
  "${BACKUP_FILE}" \
  > /dev/null

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
BACKUP_SHA256="$(sha256sum "${BACKUP_FILE}" | awk '{print $1}')"

echo "Backup boyutu: ${BACKUP_SIZE}"
echo "SHA256: ${BACKUP_SHA256}"

# =========================================================
# FIND OR CREATE PRIVATE GITHUB RELEASE
# =========================================================

echo "GitHub backup alanı kontrol ediliyor..."

HTTP_STATUS="$(
  curl \
    --silent \
    --show-error \
    --output "${RELEASE_JSON}" \
    --write-out "%{http_code}" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "${GITHUB_API}/repos/${GITHUB_REPOSITORY}/releases/tags/${RELEASE_TAG}"
)"

if [[ "${HTTP_STATUS}" == "404" ]]; then

  echo "Backup release oluşturuluyor..."

  CREATE_BODY="$(
    jq \
      -n \
      --arg tag "${RELEASE_TAG}" \
      '{
        tag_name: $tag,
        name: "Database Backups",
        body: "Lezzet Döner otomatik PostgreSQL yedekleri.",
        draft: false,
        prerelease: false
      }'
  )"

  github_api \
    -X POST \
    "${GITHUB_API}/repos/${GITHUB_REPOSITORY}/releases" \
    -H "Content-Type: application/json" \
    -d "${CREATE_BODY}" \
    > "${RELEASE_JSON}"

elif [[ "${HTTP_STATUS}" != "200" ]]; then

  echo "HATA: GitHub release sorgusu başarısız."
  echo "HTTP: ${HTTP_STATUS}"
  exit 1

fi

RELEASE_ID="$(
  jq \
    -r \
    '.id' \
    "${RELEASE_JSON}"
)"

if [[ -z "${RELEASE_ID}" || "${RELEASE_ID}" == "null" ]]; then
  echo "HATA: GitHub release ID alınamadı."
  exit 1
fi

# =========================================================
# UPLOAD BACKUP
# =========================================================

echo "Backup GitHub'a yükleniyor..."

github_api \
  -X POST \
  "${GITHUB_UPLOADS}/repos/${GITHUB_REPOSITORY}/releases/${RELEASE_ID}/assets?name=${BACKUP_NAME}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@${BACKUP_FILE}" \
  > /dev/null

echo "Backup yükleme başarılı."

# =========================================================
# RETENTION CLEANUP
# =========================================================

echo "Eski backuplar kontrol ediliyor..."

CUTOFF_EPOCH="$(
  date \
    -u \
    -d "-${BACKUP_RETENTION_DAYS} days" \
    +%s
)"

PAGE=1

while true; do

  github_api \
    "${GITHUB_API}/repos/${GITHUB_REPOSITORY}/releases/${RELEASE_ID}/assets?per_page=100&page=${PAGE}" \
    > "${ASSETS_FILE}"

  ASSET_COUNT="$(
    jq \
      'length' \
      "${ASSETS_FILE}"
  )"

  if [[ "${ASSET_COUNT}" -eq 0 ]]; then
    break
  fi

  jq \
    -r \
    --argjson cutoff "${CUTOFF_EPOCH}" \
    '
      .[]
      | select(
          (.created_at | fromdateiso8601)
          < $cutoff
        )
      | .id
    ' \
    "${ASSETS_FILE}" \
    >> "${DELETE_IDS}"

  if [[ "${ASSET_COUNT}" -lt 100 ]]; then
    break
  fi

  PAGE=$((PAGE + 1))

done

if [[ -s "${DELETE_IDS}" ]]; then

  while IFS= read -r ASSET_ID; do

    if [[ -z "${ASSET_ID}" ]]; then
      continue
    fi

    github_api \
      -X DELETE \
      "${GITHUB_API}/repos/${GITHUB_REPOSITORY}/releases/assets/${ASSET_ID}" \
      > /dev/null

  done < "${DELETE_IDS}"

fi

echo "============================================"
echo "BACKUP BAŞARILI"
echo "Dosya: ${BACKUP_NAME}"
echo "Boyut: ${BACKUP_SIZE}"
echo "SHA256: ${BACKUP_SHA256}"
echo "Saklama süresi: ${BACKUP_RETENTION_DAYS} gün"
echo "============================================"