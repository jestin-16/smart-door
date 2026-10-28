#!/usr/bin/env bash
# ==============================================================================
# Script: generate_mqtt_passwords.sh
# Purpose: Generates or updates the hashed Mosquitto password file from .env
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
PW_FILE="${SCRIPT_DIR}/mosquitto/config/password_file"

if [ -f "${ENV_FILE}" ]; then
    echo ">>> Loading credentials from ${ENV_FILE}..."
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
else
    echo ">>> .env not found, using default environment variables if set..."
fi

BACKEND_USER="${MQTT_BACKEND_USER:-smartdoor_backend}"
BACKEND_PASS="${MQTT_BACKEND_PASSWORD:-backend_secure_mqtt_pass}"
ESP32_USER="${MQTT_ESP32_USER:-smartdoor_esp32}"
ESP32_PASS="${MQTT_ESP32_PASSWORD:-esp32_secure_mqtt_pass}"

echo ">>> Generating Mosquitto password file at ${PW_FILE}..."
docker run --rm -v "${SCRIPT_DIR}/mosquitto/config:/mosquitto/config" eclipse-mosquitto:2.0 sh -c "
    mosquitto_passwd -c -b /mosquitto/config/password_file '${BACKEND_USER}' '${BACKEND_PASS}'
    mosquitto_passwd -b /mosquitto/config/password_file '${ESP32_USER}' '${ESP32_PASS}'
    chmod 644 /mosquitto/config/password_file
"

echo ">>> Mosquitto password file generated successfully with users: '${BACKEND_USER}', '${ESP32_USER}'."
