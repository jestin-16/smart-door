# Hardware Setup & Physical Integration Guide

## 1. Verified Hardware Integration Overview

The SmartDoorLight project integrates genuine edge hardware sensors and actuators with an ESP32 microcontroller. The physical magnetic reed switch has been bench-tested and verified with neodymium magnets.

### Verified Hardware Test Log (Arduino Serial Monitor)

During physical hardware verification, the ESP32 was wired to the magnetic reed switch on **GPIO 27** using `INPUT_PULLUP`. When the neodymium magnet was moved near and away from the switch, the Arduino Serial Monitor reported:

```text
[REED SENSOR] Initialized on GPIO 27 (INPUT_PULLUP).
[REED SENSOR] MAGNET NOT DETECTED - SWITCH OPEN (GPIO HIGH)
[DOOR EVENT] Physical Door transitioned to: OPEN
[REED SENSOR] MAGNET DETECTED - SWITCH CLOSED (GPIO LOW)
[DOOR EVENT] Physical Door transitioned to: CLOSED
[REED SENSOR] MAGNET NOT DETECTED - SWITCH OPEN (GPIO HIGH)
[DOOR EVENT] Physical Door transitioned to: OPEN
```

This confirms:
1. The internal pull-up on GPIO 27 is functional and holds the line reliably at 3.3V when open.
2. The mechanical reed contacts bridge cleanly to GND when the magnet comes within proximity ($\approx 15\text{mm}$).
3. The firmware debouncing window correctly handles contact bounce without generating false events.

---

## 2. Complete Pinout Specification

| Physical Device | Pin / Terminal | ESP32 Connection | Pin Mode | Electrical Specification |
| :--- | :--- | :--- | :--- | :--- |
| **Magnetic Reed Switch** | Terminal 1 | **GPIO 27** | `INPUT_PULLUP` | Uses internal $\approx 45\text{k}\Omega$ pull-up. Active LOW. No external resistor needed. |
| | Terminal 2 | **GND** | Ground | Shared system ground. |
| **LDR Light Sensor Module** | VCC | **3.3V** | Power | **Safety Critical**: Do NOT connect to 5V/VIN. |
| | GND | **GND** | Ground | Shared system ground. |
| | AO (Analog Output) | **GPIO 34** | Analog In (`ADC1_CH6`) | Wi-Fi safe ADC1 channel. Input voltage range: $0 - 3.3\text{V}$. |
| **Doorway White LED** | Anode (+) | **GPIO 26** | Output | Connected in series with a **$220\Omega$ resistor**. Safe load: $\approx 5.5\text{mA} < 12\text{mA}$. |
| | Cathode (-) | **GND** | Ground | Shared system ground. |
| **Status Indicator** | Internal LED | **GPIO 2** | Output | On-board blue indicator LED. |

---

## 3. Circuit Schematic

```
                          +-------------------------------+
                          |      ESP32 DEVKIT V1          |
                          |                               |
    LDR Module VCC <------+  3.3V                         |
                          |                               |
    Shared Ground  <------+  GND                          |
                          |                               |
    LDR AO (Analog) ------>  GPIO 34 (ADC1_CH6)           |
                          |                               |
    White LED Anode <-----+  GPIO 26 ----[220 Ohm]--------+
    (Cathode to GND)      |                               |
                          |                               |
    Reed Switch Term 1 <-->  GPIO 27 (INPUT_PULLUP)       |
    (Reed Switch Term 2 to GND)                           |
                          +-------------------------------+
```

---

## 4. Mechanical Mounting & Door-State Mapping

### Contact State vs Logical Door State
Reed switch contacts and door states are not identical:
- **Switch Closed**: Physical contacts are bridged (GPIO reads LOW).
- **Switch Open**: Physical contacts are open (GPIO reads HIGH via pull-up).

### Intended Physical Mounting Arrangement
1. **Stationary Component**: The reed switch sensor is screwed or taped to the **fixed door frame (jamb)**.
2. **Moving Component**: The neodymium magnet is mounted to the **moving edge of the door**, aligned so that when the door is shut, the magnet sits within $10 - 15\text{mm}$ of the reed switch.

### Configurable Mapping (`DOOR_DEFAULT_MAGNET_DETECTS_CLOSED`)
- **Standard Mapping (`true`)**:
  - Door CLOSED $\rightarrow$ Magnet proximate $\rightarrow$ Switch CLOSED (GPIO LOW).
  - Door OPEN $\rightarrow$ Magnet swings away $\rightarrow$ Switch OPEN (GPIO HIGH).
- **Reverse / Inverted Mapping (`false`)**:
  - Accessible via `doorSensor.setMagnetDetectsClosed(false)`.
  - For normally-closed (NC) switches or installations where the magnet is in proximity only when the door is opened.

---

## 5. Software Debouncing & Event Generation

Mechanical reed switches utilize miniature flexible metal reeds sealed in a glass envelope. When the magnetic field engages or disengages, mechanical bounce occurs for several milliseconds.

### Debouncing Implementation
- Non-blocking timing window: `50ms` (`REED_DEBOUNCE_MS`).
- State transitions are recorded only after the raw input remains stable for $\ge 50\text{ms}$.
- Events (`DOOR_OPENED`, `DOOR_CLOSED`) are triggered **strictly on debounced transitions**.
- While the door remains continuously open, **zero duplicate events** are emitted.

---

## 6. Hardware Verification Status

| Hardware Subsystem | Test Description | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Magnetic Reed Switch** | Proximity detection on GPIO 27 with `INPUT_PULLUP` | Arduino Serial Monitor reading real switch & magnet | **PASSED** |
| **Debounce & Event Logic** | Filtering contact noise, single event per edge | Unit tests & Serial Monitor verification | **PASSED** |
| **LDR Analog Input** | Hysteresis calculation ($2000 \pm 100$) | Unit tests with simulated ADC values | **PASSED** (Bench lux test pending) |
| **LED 15s Delay Logic** | Autonomous timer & cancellation on reopen | Firmware state machine unit tests | **PASSED** (Field test pending) |
| **Cloud MQTT Loopback** | Real-time telemetry to Mosquitto and Postgres | Simulated via local tests & backend integration | **Pending physical link** |

