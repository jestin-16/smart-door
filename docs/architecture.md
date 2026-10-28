# SmartDoorLight — System Architecture & Integration Guide

## 1. System Overview & Data Flow

```mermaid
graph TD
    subgraph EdgeDevice["ESP32 Microcontroller (Edge Hardware)"]
        Reed["Magnetic Reed Switch (GPIO 27, INPUT_PULLUP)"] --> Debounce["50ms Debounce & FSM"]
        LDR["LDR Module (GPIO 34 ADC1)"] --> Hysteresis["Moving Average + Hysteresis"]
        Debounce --> EdgeState["Autonomous Lighting Controller"]
        Hysteresis --> EdgeState
        EdgeState --> LED["Doorway LED (GPIO 26 via 220 Ohm)"]
        EdgeState --> MQTTClient["PubSubClient MQTT Manager"]
    end

    subgraph MessagingBroker["MQTT Broker (Eclipse Mosquitto)"]
        MQTTClient <-->|Pub/Sub 1883| Topics["Topics: /telemetry, /event, /command, /config"]
    end

    subgraph BackendService["Spring Boot 4 Service (Java 21)"]
        Topics <-->|Paho MQTT Client| Gateway["MqttGatewayService"]
        Gateway --> EventRepo["DoorEventRepository"]
        Gateway --> ConfigRepo["DeviceConfigRepository"]
        EventRepo --> Postgres[("PostgreSQL 16 Database")]
        ConfigRepo --> Postgres
        REST["REST API Controllers (/api/v1/...)"] --> Gateway
    end

    subgraph FrontendApp["React Dashboard (Vite + Tailwind)"]
        REST <-->|HTTP / JSON (Real Only)| WebUI["IoT Dashboard"]
    end
```

---

## 2. Fail-Safe Local Edge Autonomy
The ESP32 firmware guarantees safety and functionality even during complete network or backend outages:
1. All sensor debouncing, state toggling, and light decision logic resides strictly on the ESP32 in `LightingController.cpp`.
2. Network calls (Wi-Fi connection checks and MQTT transmission) are non-blocking using `millis()` timers.
3. If Wi-Fi or the MQTT broker disconnects, the doorway light reliably turns on when the door is opened in darkness, and smoothly turns off 15 seconds after closure.

---

## 3. Explicit Hardware Connection States

The system implements three explicit states:
- **CONNECTED**: Real telemetry heartbeat received within the last 15 seconds, and MQTT LWT status is `online`.
- **DISCONNECTED**: No packet received for $>15\text{s}$, or LWT status is `offline`, or backend is unreachable. All unavailable sensor values are displayed as `--`.
- **UNKNOWN**: Initial startup state before the first hardware packet has been evaluated.

The dashboard displays:
`Device disconnected — waiting for hardware connection.`

---

## 4. Free-Tier Hosting Compatibility Architecture

When moving to cloud hosting without paid infrastructure:

| Component | Recommended Free-Tier Service | Operational Considerations |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** or **Cloudflare Pages** | Static Vite SPA build. Zero idle spin-down. |
| **Backend** | **Render** or **Railway** | Spring Boot container. Free Render web services spin down after 15 minutes of inactivity; upon spin-up, takes 30-50s to cold start. **Crucial:** The ESP32's local lighting control is completely immune to backend sleep. |
| **Database** | **Neon** or **Supabase** | Free managed PostgreSQL (compute auto-pauses when idle). |
| **MQTT Broker** | **HiveMQ Cloud** (Free 100 devices) or self-hosted Mosquitto on a free VPS | Supports TLS (port 8883) with username/password authentication. |

---

## 5. Local Setup Quickstart

### 5.1 Infrastructure
```bash
cd infrastructure
docker compose up -d
```
Starts Mosquitto (`1883`, `9001`) and PostgreSQL 16 (`5432`).

### 5.2 Backend Service
```bash
cd backend
./mvnw.cmd spring-boot:run
```
Available at `http://localhost:8080`. Swagger UI at `/swagger-ui.html`.

### 5.3 Frontend Dashboard
```bash
cd frontend
npm run dev
```
Available at `http://localhost:5173`.
