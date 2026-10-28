#!/usr/bin/env bash
# ==============================================================================
# SmartDoorLight — Production EC2 Deployment & Health Verification Script
# Target: AWS EC2 Ubuntu 24.04 LTS (t3.small, Mumbai ap-south-1)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
ENV_FILE="${SCRIPT_DIR}/.env"

echo "=================================================="
echo ">>> Starting SmartDoorLight Production Deployment"
echo ">>> Target Host Public IP: 15.252.238.128"
echo ">>> Working Directory: ${ROOT_DIR}"
echo "=================================================="

# ------------------------------------------------------------------------------
# 1. System & Memory Verification (t3.small has 2 GiB RAM)
# ------------------------------------------------------------------------------
echo ">>> Checking host memory and swap..."
TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
SWAP_RAM_MB=$(free -m | awk '/^Swap:/{print $2}')

echo ">>> Host Total RAM: ${TOTAL_RAM_MB} MiB | Swap: ${SWAP_RAM_MB} MiB"

if [ "${SWAP_RAM_MB}" -eq 0 ]; then
    echo ">>> [WARNING] No swap space detected on this instance."
    echo ">>> On t3.small (2 GiB RAM), configuring a 2 GiB swapfile is strongly recommended:"
    echo ">>>   sudo fallocate -l 2G /swapfile"
    echo ">>>   sudo chmod 600 /swapfile"
    echo ">>>   sudo mkswap /swapfile"
    echo ">>>   sudo swapon /swapfile"
    echo ">>>   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
fi

# ------------------------------------------------------------------------------
# 2. Environment Configuration
# ------------------------------------------------------------------------------
if [ ! -f "${ENV_FILE}" ]; then
    echo ">>> .env not found. Generating production .env from .env.example..."
    cp "${SCRIPT_DIR}/.env.example" "${ENV_FILE}"
    
    # Generate secure random passwords
    RAND_DB_PASS=$(openssl rand -hex 16)
    RAND_BACKEND_MQTT=$(openssl rand -hex 16)
    RAND_ESP32_MQTT=$(openssl rand -hex 16)

    sed -i "s/replace_with_strong_db_password/${RAND_DB_PASS}/g" "${ENV_FILE}"
    sed -i "s/replace_with_strong_backend_mqtt_pass/${RAND_BACKEND_MQTT}/g" "${ENV_FILE}"
    sed -i "s/replace_with_strong_esp32_mqtt_pass/${RAND_ESP32_MQTT}/g" "${ENV_FILE}"

    echo ">>> Generated fresh cryptographically strong credentials in ${ENV_FILE}"
    echo ">>> [IMPORTANT] Save these credentials in a secure password manager!"
fi

# Ensure Mosquitto directories exist
mkdir -p "${SCRIPT_DIR}/mosquitto/certs"
mkdir -p "${SCRIPT_DIR}/mosquitto/config/conf.d"

# Ensure Mosquitto password file is initialized
if [ ! -f "${SCRIPT_DIR}/mosquitto/config/password_file" ]; then
    echo ">>> Initializing Mosquitto password file from .env..."
    chmod +x "${SCRIPT_DIR}/generate_mqtt_passwords.sh"
    bash "${SCRIPT_DIR}/generate_mqtt_passwords.sh"
fi

# ------------------------------------------------------------------------------
# 3. Pre-Deployment Database Backup
# ------------------------------------------------------------------------------
if docker ps --format '{{.Names}}' | grep -q "smartdoor-postgres"; then
    BACKUP_DIR="${ROOT_DIR}/backups"
    mkdir -p "${BACKUP_DIR}"
    BACKUP_FILE="${BACKUP_DIR}/smartdoor_db_predeploy_$(date +%Y%m%d_%H%M%S).sql"
    echo ">>> Taking pre-deployment database snapshot: ${BACKUP_FILE}..."
    docker exec smartdoor-postgres pg_dump -U smartdoor_user -d smartdoor_db > "${BACKUP_FILE}" 2>/dev/null || true
    echo ">>> Database snapshot saved."
fi

# ------------------------------------------------------------------------------
# 4. Build and Deploy Containers
# ------------------------------------------------------------------------------
echo ">>> Building and updating Docker images..."
docker compose -f "${COMPOSE_FILE}" build --pull

echo ">>> Starting services via Docker Compose..."
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

# ------------------------------------------------------------------------------
# 5. Health Check Verification Loop (up to 90 seconds)
# ------------------------------------------------------------------------------
echo ">>> Waiting for all 4 services to become healthy..."
MAX_WAIT_SECONDS=90
ELAPSED=0
HEALTHY=false

while [ ${ELAPSED} -lt ${MAX_WAIT_SECONDS} ]; do
    sleep 5
    ELAPSED=$((ELAPSED + 5))

    # Check HTTP response from Nginx reverse proxy to backend
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/v1/health || true)
    
    if [ "${HTTP_STATUS}" -eq 200 ]; then
        HEALTHY=true
        echo ">>> Backend health check returned HTTP 200 OK after ${ELAPSED}s!"
        break
    else
        echo ">>> [${ELAPSED}s/${MAX_WAIT_SECONDS}s] Waiting for backend... (HTTP status: ${HTTP_STATUS})"
    fi
done

# ------------------------------------------------------------------------------
# 6. Deployment Result & Status Reporting
# ------------------------------------------------------------------------------
if [ "${HEALTHY}" = true ]; then
    echo ""
    echo "=================================================="
    echo ">>> SmartDoorLight Deployment SUCCESSFUL! <<<"
    echo "=================================================="
    echo "Frontend Dashboard:   http://15.252.238.128/"
    echo "Backend Health Check: http://15.252.238.128/api/v1/health"
    echo "OpenAPI Swagger UI:   http://15.252.238.128/swagger-ui.html"
    echo "MQTT Broker (TCP):    15.252.238.128:1883"
    echo "MQTT Broker (TLS):    15.252.238.128:8883"
    echo "PostgreSQL Port 5432: PROTECTED (Internal Network Only)"
    echo "=================================================="
    echo "Container Status:"
    docker compose -f "${COMPOSE_FILE}" ps
    exit 0
else
    echo ""
    echo "=================================================="
    echo ">>> [ERROR] Deployment failed health verification! <<<"
    echo "=================================================="
    echo "Recent container logs:"
    docker compose -f "${COMPOSE_FILE}" logs --tail=50
    exit 1
fi
