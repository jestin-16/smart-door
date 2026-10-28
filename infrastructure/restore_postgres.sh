#!/usr/bin/env bash
# ==============================================================================
# Script: restore_postgres.sh
# Purpose: Restores a PostgreSQL database dump from a specified backup file.
# Usage:   ./restore_postgres.sh <path_to_backup_file>
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [ -f "${ENV_FILE}" ]; then
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
fi

DB_USER="${POSTGRES_USER:-smartdoor_user}"
DB_NAME="${POSTGRES_DB:-smartdoor_db}"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <path_to_backup_file>"
    echo "Example: $0 ../backups/smartdoor_db_20261028_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo ">>> [ERROR] Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "=================================================="
echo ">>> RESTORING DATABASE: ${DB_NAME}"
echo ">>> FROM BACKUP:       ${BACKUP_FILE}"
echo "=================================================="

if ! docker ps --format '{{.Names}}' | grep -q "smartdoor-postgres"; then
    echo ">>> [ERROR] Container 'smartdoor-postgres' is not running!"
    exit 1
fi

echo ">>> Terminating existing backend connections to allow database restore..."
docker exec smartdoor-postgres psql -U "${DB_USER}" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" || true

if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo ">>> Decompressing and streaming backup into PostgreSQL..."
    gunzip -c "${BACKUP_FILE}" | docker exec -i smartdoor-postgres psql -U "${DB_USER}" -d "${DB_NAME}"
else
    echo ">>> Streaming SQL backup into PostgreSQL..."
    docker exec -i smartdoor-postgres psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo ">>> Database restore completed successfully!"
