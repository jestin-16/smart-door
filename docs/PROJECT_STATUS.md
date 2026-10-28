# SmartDoorLight — Project Status & Hardware Milestones

## 1. Project Overview & Current Milestone

The SmartDoorLight project has transitioned from the prototype push-button door simulation to a **verified physical magnetic reed switch hardware integration**.

All simulated door commands and push-button toggle logic have been removed from production code across firmware, backend, and frontend. The door state is driven strictly by genuine physical sensor telemetry.

---

## 2. Hardware Architecture & GPIO Mapping

| Sensor / Actuator | Physical Pin | Mode | Status | Verification Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Magnetic Reed Switch** | **GPIO 27** | `INPUT_PULLUP` | **Verified & Operational** | Bench-tested on ESP32. Serial Monitor confirmed clean transitions when neodymium magnet is moved near/away. |
| **LDR Photocell Module** | **GPIO 34** | Analog In (`ADC1_CH6`) | **Integrated** | Powered at 3.3V (safety limit). Midpoint threshold $T = 2000$ with $\pm 100$ hysteresis. |
| **White Doorway LED** | **GPIO 26** | Digital Out | **Integrated** | Connected via $220\Omega$ resistor ($\approx 5.5\text{mA}$ load). Non-blocking 15s shutdown delay. |
| **Status Indicator** | **GPIO 2** | Digital Out | **Integrated** | On-board blue ESP32 LED. |

---

## 3. Implementation Summary by Layer

### Firmware Layer (`firmware/`)
- **`DoorSensor` Driver**:
  - Replaced button toggle simulation with debounced reed switch reader on GPIO 27.
  - Active LOW with internal pull-up: GPIO LOW = Contacts Closed (Magnet Detected); GPIO HIGH = Contacts Open (Magnet Absent).
  - Configurable mounting mapping (`DOOR_DEFAULT_MAGNET_DETECTS_CLOSED = true`).
  - 50ms software debouncing filters contact bounce.
  - Single event emitted on state transitions; zero duplicate events during steady states.
  - Baseline state established on boot in `begin()`.
- **`LightingController`**:
  - Autonomous edge FSM running in `loop()` via non-blocking `millis()`.
  - Turns LED ON when `doorOpen && isDark`.
  - Initiates 15s auto-off timer when door closes. Cancels timer immediately if door reopens.
  - Failsafe operation maintains local functionality even if Wi-Fi or MQTT broker is disconnected.
- **Mirrored Arduino IDE Sketch**:
  - Synchronized `firmware/smartdoor_firmware/` with all firmware updates.

### Backend Layer (`backend/`)
- **`TelemetryDto` & `DoorEvent`**:
  - Added `reedSwitchClosed` and `magnetDetected` fields.
- **`MqttGatewayService`**:
  - Parses real-time reed switch telemetry and event details from MQTT broker.
- **`CommandController`**:
  - Deprecated and rejected `/api/v1/commands/door` with HTTP 400 in favor of physical reed switch.
- **Test Suite**:
  - 10/10 JUnit 5 tests passing (100% green).

### Frontend Layer (`frontend/`)
- **`DoorStatusCard`**:
  - Removed push-button "Open Door" / "Close Door" simulation buttons.
  - Displays genuine reed switch contact status (`SWITCH CLOSED (GPIO LOW)` / `SWITCH OPEN (GPIO HIGH)`), neodymium magnet proximity badge, and logical door state.
- **`DoorwayHeroVisualizer`**:
  - Displays real-time reed status badge alongside LED actuator control.
- **Zero Mock Data Policy**:
  - Disconnected devices render explicit `--` unavailable states with status banner.
- **Test Suite**:
  - 14/14 Vitest tests passing (100% green). TypeScript build compiles with 0 errors.

---

## 4. Hardware Milestone Roadmap

- [x] **Milestone 1**: Physical reed switch bench testing on ESP32 GPIO 27 with Serial Monitor verification.
- [x] **Milestone 2**: Firmware debounced driver implementation and configurable mounting mapping.
- [x] **Milestone 3**: Autonomous 15-second lighting delay state machine with reopen cancellation.
- [x] **Milestone 4**: Removal of simulated door inputs from frontend and backend production code.
- [x] **Milestone 5**: Full automated unit test suites passing across all three tiers (24/24 tests).
- [x] **Milestone 6**: End-to-end multi-tier Wi-Fi hardware loop verified live (ESP32 -> Mosquitto -> Spring Boot -> PostgreSQL -> React).
- [ ] **Milestone 7**: Physical field testing of LDR ambient lux calibration under varied natural lighting conditions.

