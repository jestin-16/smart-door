#!/usr/bin/env bash
# ==============================================================================
# Script: generate_mqtt_certs.sh
# Purpose: Generates self-signed CA and Server TLS certificates for Mosquitto
#          with Subject Alternative Name (SAN) matching EC2 public IP and hostnames.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/mosquitto/certs"
CONF_D="${SCRIPT_DIR}/mosquitto/config/conf.d"

SERVER_IP="${1:-15.252.238.128}"
DAYS_VALID=3650

echo ">>> Generating TLS Certificates for MQTT Broker (IP: ${SERVER_IP})..."
mkdir -p "${CERTS_DIR}" "${CONF_D}"

# 1. Generate Certificate Authority (CA)
echo ">>> Creating Certificate Authority (CA)..."
openssl req -new -x509 -days ${DAYS_VALID} -extensions v3_ca \
    -keyout "${CERTS_DIR}/ca.key" \
    -out "${CERTS_DIR}/ca.crt" \
    -subj "/CN=SmartDoor-Root-CA/O=SmartDoorLight/C=IN" \
    -nodes

# 2. Generate Server Private Key
echo ">>> Generating Server Private Key..."
openssl genrsa -out "${CERTS_DIR}/server.key" 2048

# 3. Create OpenSSL config for SAN (Subject Alternative Name)
OPENSSL_CNF="${CERTS_DIR}/openssl_san.cnf"
cat > "${OPENSSL_CNF}" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = ${SERVER_IP}
O = SmartDoorLight
C = IN

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = ${SERVER_IP}
IP.2 = 127.0.0.1
DNS.1 = localhost
EOF

# 4. Generate Certificate Signing Request (CSR)
echo ">>> Generating CSR with SAN..."
openssl req -new \
    -key "${CERTS_DIR}/server.key" \
    -out "${CERTS_DIR}/server.csr" \
    -config "${OPENSSL_CNF}"

# 5. Sign Server Certificate with CA
echo ">>> Signing Server Certificate with CA..."
openssl x509 -req -days ${DAYS_VALID} \
    -in "${CERTS_DIR}/server.csr" \
    -CA "${CERTS_DIR}/ca.crt" \
    -CAkey "${CERTS_DIR}/ca.key" \
    -CAcreateserial \
    -out "${CERTS_DIR}/server.crt" \
    -extfile "${OPENSSL_CNF}" \
    -extensions v3_req

# Cleanup temporary CSR and CNF
rm -f "${CERTS_DIR}/server.csr" "${OPENSSL_CNF}" "${CERTS_DIR}/ca.srl"

# Set strict file permissions
chmod 600 "${CERTS_DIR}/ca.key" "${CERTS_DIR}/server.key"
chmod 644 "${CERTS_DIR}/ca.crt" "${CERTS_DIR}/server.crt"

# Activate TLS configuration in Mosquitto
cp "${CONF_D}/tls.conf.example" "${CONF_D}/tls.conf"

echo ">>> Successfully generated TLS certificates in ${CERTS_DIR}!"
echo ">>> Created: ca.crt, ca.key, server.crt, server.key"
echo ">>> Activated: ${CONF_D}/tls.conf (port 8883 is now enabled)"
echo ">>> Note: For ESP32 TLS verification, copy '${CERTS_DIR}/ca.crt' to the firmware certificate header."
