# SmartDoorLight — Real ESP32 IoT Monitoring & Automatic Lighting System

A complete, production-grade, modular IoT smart door monitoring and automated doorway lighting application engineered around an ESP32 development board, physical breadboard inputs, Spring Boot (Java 21) backend, PostgreSQL persistence, MQTT messaging, and React (Vite + TypeScript + Tailwind CSS) dashboard.

---

## Hardware Specifications & Real Circuit Setup

| Component | ESP32 GPIO | Mode / Circuit | Notes |
| :--- | :--- | :--- | :--- |
| **Logical Door Control** | **Dashboard** | MQTT Command | Controlled via Dashboard **Open Door** & **Close Door** buttons. Sends real MQTT commands directly to ESP32. |
| **LDR Light Sensor Module (ET5329)** | **GPIO 34** | Analog Input (`ADC1_CH6`) | **Safety Critical**: Connected to 3.3V pin (NOT 5V). Real calibration: Bright $\approx 784-845$, Dark $\approx 3206-3228$. Base threshold $T = 2000$ with $\pm 100$ hysteresis. |
| **Primary White LED** | **GPIO 26** | Digital Output | Connected via a **$220\Omega$ resistor** to LED anode (safe current $\approx 5.5\text{mA} < 12\text{mA}$ limit). |
| **Status Indicator** | **GPIO 2** | Digital Output | Internal onboard blue LED indicator. |

---

## Operating Behavior & Lighting Logic

1. **Dashboard Logical Door Control**: User clicks **Open Door** or **Close Door** on the dashboard. The command is transmitted over MQTT to the ESP32.
2. **Illuminance with Hysteresis**: The LDR continuously measures ambient light. With base threshold $T = 2000$ and hysteresis $H = 100$, ambient switches to `DARK` only if ADC rises above 2100, and switches to `BRIGHT` only if ADC drops below 1900.
3. **Automatic Lighting Rule**:
   - Door is **OPEN** AND Environment is **DARK** $\rightarrow$ Turn LED **ON** instantly.
   - Environment is **BRIGHT** $\rightarrow$ Keep automatic light **OFF**.
   - Door becomes **CLOSED** $\rightarrow$ Start non-blocking 15-second countdown timer before shutting the LED OFF.
   - If the door is reopened during the 15-second delay, cancel shutdown countdown and re-evaluate light condition.
4. **Local Edge Autonomy**: The lighting controller executes locally in firmware `loop()` using non-blocking `millis()`. If Wi-Fi, MQTT, or backend disconnects, local lighting operations continue uninterrupted.

---

## Zero Mock Data Policy

All simulated and fabricated software telemetry has been removed:
- **Explicit States**: `CONNECTED`, `DISCONNECTED`, `UNKNOWN`.
- **Unavailable Readings**: When the ESP32 is offline, sensor values are displayed as `--` rather than invented readings.
- **Disconnected Notice**: When hardware is not communicating, the UI displays:
  > *"Device disconnected — waiting for hardware connection."*
- **Real Hardware Actuation**: LED on GPIO 26 actually changes state based on genuine sensor readings on GPIO 34 and dashboard commands.

---

## Project Structure
```
f:\smartdoor\
├── firmware\                 # ESP32 C++ PlatformIO project (DoorSensor, LightSensor, Controller)
├── frontend\                 # React 19, Vite, TypeScript, Tailwind CSS dashboard
├── backend\                  # Java 21, Spring Boot 4, Maven REST & MQTT service
├── infrastructure\           # Docker Compose (Mosquitto MQTT & PostgreSQL 16)
└── docs\                     # Hardware wiring guide, MQTT protocol schemas, architecture
```

---

## Quickstart Guide

### 1. Flash ESP32 Firmware
```bash
cd firmware
# Copy secrets template and enter your Wi-Fi SSID, Password, and MQTT broker IP
cp include/secrets.h.example include/secrets.h

# Compile and upload via PlatformIO
pio run --target upload
pio device monitor -b 115200
```

### 2. Launch Local Infrastructure
```bash
cd infrastructure
docker compose up -d
```
Starts Mosquitto MQTT broker (`1883`, `9001`) and PostgreSQL 16 (`5432`).

### 3. Run Backend Service
```bash
cd backend
./mvnw.cmd spring-boot:run
```
Spring Boot API available at `http://localhost:8080`. Swagger documentation at `http://localhost:8080/swagger-ui.html`.

### 4. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Dashboard available at `http://localhost:5173`.

---

## Automated Test Execution Results

All automated unit and component test suites pass 100%:

### Frontend Vitest Suite
```
✓ src/__tests__/SmartDoor.test.tsx (12 tests passed)
  ✓ Button press changes door state once (toggles OPEN <-> CLOSED)
  ✓ OPEN + DARK turns the LED ON automatically
  ✓ OPEN + BRIGHT keeps the automatic light OFF
  ✓ Closing the door triggers the defined 15-second shutdown delay
  ✓ Reopening the door cancels the pending shutdown
  ✓ LDR threshold hysteresis prevents rapid switching near boundary
  ✓ Displays unavailable values as "--" when device is disconnected
  ✓ Displays genuine door open state when connected
  ✓ Displays "--" for illuminance when light sensor is disconnected
  ✓ Displays actual illuminance and hysteresis when connected
  ✓ Displays "--" for LED actuator when disconnected
  ✓ Displays active 15s timer when confirmed by hardware telemetry
```

### Backend Maven JUnit 5 & Mockito Suite
```
[INFO] Running com.smartdoor.controller.CommandControllerTest (3 tests passed)
[INFO] Running com.smartdoor.controller.ConfigControllerTest (2 tests passed)
[INFO] Running com.smartdoor.repository.DoorEventRepositoryTest (1 test passed)
[INFO] Running com.smartdoor.SmartdoorBackendApplicationTests (1 test passed)
[INFO] BUILD SUCCESS (Tests run: 7, Failures: 0, Errors: 0)
```
