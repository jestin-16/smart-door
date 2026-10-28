#!/usr/bin/env bash
# ==============================================================================
# Script: backup_postgres.sh
# Purpose: Creates a compressed backup of the SmartDoor PostgreSQL database
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
ENV_FILE="${SCRIPT_DIR}/.env"

if [ -f "${ENV_FILE}" ]; then
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
fi

DB_USER="${POSTGRES_USER:-smartdoor_user}"
DB_NAME="${POSTGRES_DB:-smartdoor_db}"

mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/smartdoor_db_${TIMESTAMP}.sql.gz"

echo ">>> Creating compressed backup of database '${DB_NAME}'..."
if ! docker ps --format '{{.Names}}' | grep -q "smartdoor-postgres"; then
    echo ">>> [ERROR] Container 'smartdoor-postgres' is not running!"
    exit 1
fi

docker exec smartdoor-postgres pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo ">>> Backup created successfully at: ${BACKUP_FILE}"
echo ">>> Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep last 14 backups, delete older ones
find "${BACKUP_DIR}" -name "smartdoor_db_*.sql.gz" -mtime +14 -delete 2>/dev/null || true
echo ">>> Backup retention cleaned up."
