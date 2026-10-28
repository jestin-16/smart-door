# SmartDoorLight — Production Deployment & DevOps Architecture Guide

Complete, production-grade guide for deploying **SmartDoorLight** to **AWS EC2 Ubuntu 24.04 LTS** in Mumbai (`ap-south-1`) with Docker Compose, automated GitHub Actions CI/CD, Mosquitto MQTT authentication, and TLS security.

---

## 1. System Architecture Overview

```
                      +---------------------------------------+
                      |       Physical ESP32 Edge Device      |
                      |  - LDR Photocell (GPIO 34 ADC1)       |
                      |  - White Doorway LED (GPIO 26 Output) |
                      |  - Push Button / Reed (GPIO 27 Input) |
                      +-------------------+-------------------+
                                          |
                        MQTTS (TLS 8883)  |  MQTT (TCP 1883)
                     (Authenticated via   |   User: smartdoor_esp32)
                                          v
+-----------------------------------------------------------------------------------+
| AWS EC2 Instance: smart-door-server (15.252.238.128, Ubuntu 24.04 LTS, t3.small)  |
|                                                                                   |
|  +-------------------------+            +---------------------------------------+ |
|  | Nginx Web Proxy         |            | Mosquitto MQTT Broker 2.0             | |
|  | (smartdoor-frontend)    |            | (smartdoor-mqtt)                      | |
|  | - Port 80 exposed       |            | - Ports 1883 & 8883 exposed           | |
|  | - Serves React SPA      |            | - Anonymous access DISABLED           | |
|  | - Proxies /api/         |            | - Password file + Least-privilege ACL | |
|  +------------+------------+            +-------------------+-------------------+ |
|               |                                             |                     |
|               | (Internal Docker Network: smartdoor-net)    |                     |
|               v                                             v                     |
|  +----------------------------------------------------------+-------------------+ |
|  | Spring Boot 4 IoT Gateway Service (smartdoor-backend, Java 21)               | |
|  | - Memory tuned for t3.small: -Xmx384m -Xms128m                               | |
|  | - Port 8080 internal only                                                     | |
|  | - Authenticates with Mosquitto as 'smartdoor_backend'                        | |
|  +------------------------------------+-----------------------------------------+ |
|                                       | (Internal Docker Network)                 |
|                                       v                                           |
|  +------------------------------------------------------------------------------+ |
|  | PostgreSQL 16 Alpine Database (smartdoor-postgres)                           | |
|  | - Port 5432 INTERNAL ONLY (Never exposed to host or internet!)               | |
|  | - Persistent Volume: smartdoor-postgres-data                                 | |
|  +------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 2. AWS Security Group Rules (Firewall Policy)

In the AWS EC2 Management Console, open **Security Groups** $\rightarrow$ Select `smart-door-server` security group $\rightarrow$ **Edit inbound rules**:

| Type | Port Range | Protocol | Source | Purpose | Security Notes |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **SSH** | `22` | TCP | `My IP` (`<your_current_ip>/32`) | Server administration | **CRITICAL**: Never set to `0.0.0.0/0`. Restrict strictly to your personal IP. |
| **HTTP** | `80` | TCP | `0.0.0.0/0` | React Dashboard & API | Publicly accessible web dashboard. |
| **Custom TCP** | `1883` | TCP | `0.0.0.0/0` | MQTT (Password Auth) | Standard IoT MQTT port for ESP32 devices. |
| **Custom TCP** | `8883` | TCP | `0.0.0.0/0` | MQTTS (TLS Encrypted) | Secure MQTT over TLS. |

> [!CAUTION]
> **Prohibited Ports**:
> - **PostgreSQL (`5432`)**: Must NEVER have an inbound rule. All database traffic travels strictly over Docker's internal `smartdoor-network`.
> - **Mosquitto WebSockets (`9001`)**: Must NOT be exposed. The React frontend interacts with the system exclusively through the Spring Boot REST API (`/api/v1/`).
> - **Spring Boot Backend (`8080`)**: Handled via Nginx reverse proxy on port 80. Port 8080 is internal.

---

## 3. EC2 Server Preparation (One-Time Setup)

SSH into your EC2 instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@15.252.238.128
```

### 3.1 Configure 2 GiB Swap Space (Crucial for `t3.small`)
The `t3.small` instance provides 2 GiB of physical RAM. Allocating a 2 GiB swap file prevents Out-Of-Memory (OOM) termination during Docker builds or burst workloads:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
Verify swap:
```bash
free -h
```

### 3.2 Install Docker & Docker Compose Plugin
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# Add Docker's official GPG key:
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow ubuntu user to execute docker without sudo:
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 4. Initial Deployment on EC2

Clone the repository and run the automated deployment script:
```bash
git clone https://github.com/jestin-16/smart-door.git ~/smart-door
cd ~/smart-door

# Execute automated deployment script
chmod +x infrastructure/*.sh
bash infrastructure/deploy_on_ec2.sh
```

The script will automatically:
1. Verify system RAM and swap status.
2. Initialize `infrastructure/.env` from `.env.example` with cryptographically secure random passwords.
3. Generate Mosquitto hashed credentials in `infrastructure/mosquitto/config/password_file`.
4. Build multi-stage Docker images (`smartdoor-backend` and `smartdoor-frontend`).
5. Launch the containers with health-check dependency sequencing.
6. Verify service health via `curl http://127.0.0.1/api/v1/health`.

---

## 5. GitHub Actions CI/CD Setup

Continuous Integration and Continuous Deployment (CI/CD) is fully automated in `.github/workflows/deploy.yml`.

### Required GitHub Repository Secrets
Go to your GitHub repository:
**Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ Click **New repository secret**:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `EC2_HOST` | `15.252.238.128` | Public IP of the EC2 instance |
| `EC2_USER` | `ubuntu` | SSH user for Ubuntu 24.04 LTS |
| `EC2_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Complete contents of your private `.pem` key file |
| `EC2_SSH_PORT` | `22` *(Optional)* | SSH port (defaults to 22) |

### How Deployment Works
1. Every `git push` to `main` triggers `.github/workflows/deploy.yml`.
2. **Stage 1 (CI)**: Runs on GitHub's Ubuntu runners. Compiles and executes all backend unit tests (`mvnw verify`), frontend linter (`oxlint`), frontend tests (`vitest run`), and builds the Vite production distribution.
3. **Stage 2 (CD)**: Connects securely to `15.252.238.128` via SSH, fetches the latest commit, builds/updates the containers, and verifies that `/api/v1/health` returns `200 OK`.

---

## 6. Mosquitto TLS Encryption Setup (Port 8883)

To enable TLS encryption on port 8883:

```bash
cd ~/smart-door/infrastructure
bash generate_mqtt_certs.sh 15.252.238.128
docker compose restart mqtt-broker
```

This creates:
- `infrastructure/mosquitto/certs/ca.crt` (Root CA)
- `infrastructure/mosquitto/certs/server.crt` & `server.key` (Server Certificate with Subject Alternative Name for `15.252.238.128`)
- Activates `infrastructure/mosquitto/config/conf.d/tls.conf`

---

## 7. ESP32 Firmware Configuration

Open `firmware/include/secrets.h` (or `firmware/smartdoor_firmware/secrets.h`):

```cpp
#pragma once

#ifndef SMARTDOOR_SECRETS_H
#define SMARTDOOR_SECRETS_H

// 1. Wi-Fi Credentials (2.4 GHz hotspot/router only)
#define WIFI_SSID "YOUR_HOTSPOT_NAME"
#define WIFI_PASSWORD "YOUR_HOTSPOT_PASSWORD"

// 2. MQTT Broker Connectivity
#define MQTT_BROKER_HOST "15.252.238.128"
#define MQTT_BROKER_PORT 1883       // Use 8883 if MQTT_USE_TLS is true
#define MQTT_USE_TLS false          // Set to true to encrypt with MQTTS

// 3. Authenticated Credentials (from infrastructure/.env)
#define MQTT_USER "smartdoor_esp32"
#define MQTT_PASSWORD "YOUR_GENERATED_ESP32_MQTT_PASSWORD"

#endif
```

> [!NOTE]
> For TLS mode on port 8883, set `MQTT_BROKER_PORT 8883` and `MQTT_USE_TLS true`. The firmware automatically routes through `WiFiClientSecure` in non-blocking mode.

---

## 8. Database Backup & Disaster Recovery

### Manual Backup
```bash
cd ~/smart-door/infrastructure
bash backup_postgres.sh
```
Backups are compressed and stored in `~/smart-door/backups/smartdoor_db_<timestamp>.sql.gz`.

### Database Restore / Rollback
```bash
cd ~/smart-door/infrastructure
bash restore_postgres.sh ~/smart-door/backups/smartdoor_db_<timestamp>.sql.gz
```

### Rollback Previous Deployment
To roll back the application to a previous Git commit:
```bash
cd ~/smart-door
git log --oneline -n 5
git reset --hard <PREVIOUS_COMMIT_SHA>
bash infrastructure/deploy_on_ec2.sh
```
Database data stored in `smartdoor-postgres-data` volume is preserved across all deployments and rollbacks.

---

## 9. Verification & Troubleshooting Cheat Sheet

### View Real-Time Container Logs
```bash
# All containers:
docker compose -f ~/smart-door/infrastructure/docker-compose.yml logs -f

# Specific container:
docker logs -f smartdoor-backend
docker logs -f smartdoor-mqtt
docker logs -f smartdoor-frontend
docker logs -f smartdoor-postgres
```

### Health Check Endpoints
- **Frontend Dashboard**: `http://15.252.238.128/`
- **Backend Health Check**: `http://15.252.238.128/api/v1/health`
- **Swagger UI**: `http://15.252.238.128/swagger-ui.html`
- **Live Hardware Telemetry**: `http://15.252.238.128/api/v1/telemetry`
