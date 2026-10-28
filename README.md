# SmartDoorLight — Real ESP32 IoT Monitoring & Automatic Lighting System

A complete, production-grade, modular IoT smart door monitoring and automated doorway lighting application engineered around an ESP32 development board, physical magnetic reed switch hardware sensor, LDR analog light sensor, Spring Boot (Java 21) backend, PostgreSQL persistence, MQTT messaging, and React (Vite + TypeScript + Tailwind CSS) dashboard.

---

## 1. Verified Physical Hardware Setup

The physical magnetic reed switch has been connected directly to the ESP32 and verified via Arduino Serial Monitor.

### Physical Wiring & Pin Assignments

| Component | ESP32 GPIO | Mode / Circuit | Wiring Detail | Electrical Note |
| :--- | :--- | :--- | :--- | :--- |
| **Magnetic Reed Switch** | **GPIO 27** | `INPUT_PULLUP` | Terminal 1 $\rightarrow$ GPIO 27<br>Terminal 2 $\rightarrow$ Shared GND | Internal $\approx 45\text{k}\Omega$ pull-up utilized. **No external pull-up resistor required.** |
| **LDR Module (ET5329)** | **GPIO 34** | Analog Input (`ADC1_CH6`) | VCC $\rightarrow$ 3.3V<br>GND $\rightarrow$ GND<br>AO $\rightarrow$ GPIO 34 | **Safety Critical**: Connected to 3.3V pin (strictly $\le 3.3\text{V}$ for ESP32 ADC). High ADC ($\approx 3200$) = Dark; Low ADC ($\approx 800$) = Bright. |
| **Doorway White LED** | **GPIO 26** | Digital Output | GPIO 26 $\rightarrow$ $220\Omega$ resistor $\rightarrow$ LED Anode (+)<br>LED Cathode (-) $\rightarrow$ GND | Current limiting: $R = \frac{3.3V - 2.1V}{0.0055A} \approx 218\Omega \rightarrow 220\Omega$ standard. Safe current $\approx 5.5\text{mA} < 12\text{mA}$ limit. |
| **Status Indicator** | **GPIO 2** | Digital Output | Internal onboard blue LED | Driven directly by internal board traces. |

### Circuit Diagram

```
                 +--------------------------------+
                 |       ESP32 30-PIN DEVKIT      |
                 |                                |
                 |  3.3V  -------------+          |---------> VCC (LDR Module)
                 |  GND   -------------|-+--------|---------> GND (LDR, LED Cathode, Reed Term 2)
                 |                     | |        |
                 |   GPIO 34 <---------+----------|---------> AO (LDR Module Analog Output)
                 |                                |
                 |   GPIO 26 ---------[220 Ohm]---|---------> [White LED Anode (+)]
                 |                                |           [LED Cathode (-)] -> GND
                 |                                |
                 |   GPIO 27 <--------------------|---------> Reed Switch Terminal 1
                 |   (INPUT_PULLUP)               |           Reed Switch Terminal 2 -> GND
                 +--------------------------------+
```

---

## 2. Door-State Detection & Physical Reed Switch Behavior

### Electrical Behavior (Normally-Open Reed Switch with `INPUT_PULLUP`)
- **GPIO LOW (0V)**: Reed switch contacts are closed. The neodymium magnet is in close proximity activating the contacts.
- **GPIO HIGH (3.3V)**: Reed switch contacts are open. The neodymium magnet is absent / out of range.

### Physical Mounting & Configurable Mapping
Reed contact state and door state are not automatically identical. The system implements a configurable mapping (`DOOR_DEFAULT_MAGNET_DETECTS_CLOSED`):

1. **Standard Mounting (Default: `magnetDetectsClosed = true`)**:
   - The reed switch is mounted to the stationary door frame (jamb).
   - The neodymium magnet is mounted to the moving door edge.
   - When the door is **CLOSED**, the magnet is adjacent to the switch $\rightarrow$ **Switch CLOSED (GPIO LOW)**.
   - When the door is **OPEN**, the magnet swings away $\rightarrow$ **Switch OPEN (GPIO HIGH)**.
2. **Reverse / Inverted Mounting (`magnetDetectsClosed = false`)**:
   - For specialized installations or normally-closed (NC) switches where magnet proximity indicates an open doorway.

### Real Hardware Verification Log
Physical laboratory testing confirmed the following Serial Monitor output when moving a neodymium magnet near and away from the reed switch on GPIO 27:

```text
[REED SENSOR] MAGNET NOT DETECTED - SWITCH OPEN (GPIO HIGH)
[DOOR EVENT] Physical Door transitioned to: OPEN
[REED SENSOR] MAGNET DETECTED - SWITCH CLOSED (GPIO LOW)
[DOOR EVENT] Physical Door transitioned to: CLOSED
[REED SENSOR] MAGNET NOT DETECTED - SWITCH OPEN (GPIO HIGH)
[DOOR EVENT] Physical Door transitioned to: OPEN
```

### Noise Filtering & Event Guarantee
- **50ms Software Debouncing**: Mechanical reed vibration during contact closure is filtered by a non-blocking debounce timer.
- **State Transition Events**: Events are emitted **only** when the debounced state changes.
- **No Duplicate Events**: While the door remains open, no repeated open events are published.
- **Known Initial State**: Baseline state is established on boot in `DoorSensor::begin()`.

---

## 3. Autonomous Lighting Logic (Failsafe Edge Control)

The lighting state machine executes continuously in firmware `loop()` using non-blocking `millis()`. It does not depend on cloud or broker connectivity to operate:

1. **Door OPEN + Ambient DARK**: Turns White LED on GPIO 26 **ON** immediately.
2. **Door OPEN + Ambient BRIGHT**: Keeps White LED **OFF**.
3. **Door Closes**: Initiates the configured **15-second non-blocking shutdown delay**.
4. **Door Reopens during countdown**: Cancels the pending shutdown delay immediately and retains the light if still dark.
5. **Photocell Hysteresis**: With midpoint threshold $T = 2000$ and band $H = 100$:
   - Transitions to DARK only above 2100 ADC.
   - Transitions to BRIGHT only below 1900 ADC.
   - Eliminates flicker at dawn/dusk boundaries.

---

## 4. Production Web Dashboard & Backend Integration

The push-button door simulation has been completely eliminated from production code. The web dashboard displays genuine hardware edge data:
- **Door State**: `Door Open` / `Door Closed` / `--` (Standby when offline)
- **Reed Contact State**: `SWITCH CLOSED (GPIO LOW)` / `SWITCH OPEN (GPIO HIGH)`
- **Magnet Proximity**: `Magnet Detected (Proximate)` / `Magnet Not Detected (Absent)`
- **LDR Photocell**: Real smoothed ADC counts and brightness percentage
- **LED Actuator**: Real physical output state and active countdown timer
- **Zero Mock Data**: When hardware is disconnected, all sensor metrics render as explicit `--` unavailable markers with a status notice.

---

## 5. Project Directory Structure

```
f:\smartdoor\
├── firmware\                 # ESP32 C++ PlatformIO & Arduino IDE firmware
│   ├── include\              # Hardware configuration, pins, and class headers
│   │   ├── config.h          # GPIO 27 (Reed), GPIO 34 (LDR), GPIO 26 (LED)
│   │   ├── door_sensor.h     # Debounced reed switch driver
│   │   ├── light_sensor.h    # LDR driver with ADC hysteresis
│   │   └── lighting_controller.h # Non-blocking 15s delay state machine
│   ├── src\                  # Firmware implementation files
│   └── smartdoor_firmware\   # Arduino IDE mirrored sketch (.ino + sources)
├── frontend\                 # React 19, Vite, TypeScript, Tailwind CSS dashboard
│   ├── src\components\       # Live telemetry and architectural digital twin cards
│   └── src\__tests__\        # Vitest hardware state machine test suite
├── backend\                  # Spring Boot 4 (Java 21) REST & MQTT service
│   ├── src\main\             # MqttGatewayService, Controllers, JPA Entities
│   └── src\test\             # JUnit 5 integration test suite
├── infrastructure\           # Mosquitto MQTT & PostgreSQL 16 Docker Compose
└── docs\                     # Hardware guides, architecture, testing reports
```

---

## 6. Test Execution Summary

### Automated Test Results
- **Backend Test Suite (Maven / JUnit 5)**: **10 passed, 0 failures, 0 errors** (100% green).
- **Frontend Test Suite (Vitest / Testing Library)**: **14 passed, 0 failures** (100% green).
- **Frontend Production Build**: `tsc -b && vite build` compiled successfully without warnings or errors.

### Hardware Testing Status
- **Physical Reed Switch on GPIO 27**: **PASSED** (Verified with neodymium magnet on Serial Monitor).
- **LDR Calibration & Dynamic Lux Range**: Pending final physical bench testing in varied room lux.
- **End-to-End MQTT Cloud Loopback**: Pending physical connection with live broker.
