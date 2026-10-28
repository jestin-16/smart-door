# System Architecture & Technical Specification

## 1. Architectural Overview

The SmartDoorLight IoT ecosystem consists of four decoupled layers operating in unison:
1. **Physical Edge Layer (ESP32 Microcontroller)**: Executes real-time hardware sensing and autonomous lighting control locally with zero cloud dependencies.
2. **Messaging Broker Layer (Eclipse Mosquitto)**: Low-latency MQTT pub/sub broker handling bidirectional communication.
3. **Application & Persistence Layer (Spring Boot 4 & PostgreSQL 16)**: Consumes telemetry, audits door state change events, and exposes RESTful management APIs.
4. **Presentation Layer (React 19, TypeScript, Tailwind CSS)**: Real-time architectural digital twin visualizing genuine hardware telemetry.

```mermaid
flowchart TD
    subgraph Edge ["Physical ESP32 Edge Device"]
        Reed["Magnetic Reed Switch\n(GPIO 27, INPUT_PULLUP)"] -->|Debounced 50ms| DoorState["Door State Resolver"]
        LDR["LDR Photocell\n(GPIO 34, ADC1_CH6)"] -->|8x Average + Hysteresis| LightState["Dark / Bright Classifier"]
        DoorState --> LightFSM["Autonomous Lighting Controller\n(Non-blocking millis, 15s delay)"]
        LightState --> LightFSM
        LightFSM --> LED["Doorway White LED\n(GPIO 26 via 220 Ohm)"]
        DoorState -.-> MQTT_Client["MqttManager\n(PubSubClient)"]
        LightFSM -.-> MQTT_Client
        LightState -.-> MQTT_Client
    end

    subgraph Broker ["Message Broker"]
        MQTT_Client <==>|MQTT TCP 1883 / TLS| Mosquitto["Mosquitto MQTT Broker"]
    end

    subgraph Backend ["Spring Boot 4 Service"]
        Mosquitto <==>|Paho MQTT Async Client| Gateway["MqttGatewayService"]
        Gateway -->|Save Events| DB[("PostgreSQL 16\ndoor_events")]
        Gateway -->|In-Memory Cache| TelCache["Latest Telemetry DTO"]
        TelCache --> REST["REST API Controllers\n(/telemetry, /events, /config)"]
    end

    subgraph Frontend ["React 19 Dashboard"]
        REST <==>|HTTP Polling (3s)| UI["Vite + React 19 UI\n(DoorwayHeroVisualizer, DoorStatusCard)"]
    end
```

---

## 2. Firmware Subsystems & Local Edge Autonomy

### Autonomous Edge Failsafe Principle
The ESP32 firmware is engineered to operate 100% autonomously. If the Wi-Fi connection is lost, or the MQTT broker/backend is offline:
- The magnetic reed switch continues to detect door movements.
- The LDR photocell continues to assess ambient darkness with hysteresis.
- The lighting controller continues to turn the LED on when the door opens in darkness and turns it off 15 seconds after the door closes.
- Network reconnections occur asynchronously using non-blocking state timers (`WIFI_RECONNECT_INTERVAL_MS = 5000UL`).

### Firmware Component Responsibilities

1. **`DoorSensor` (`door_sensor.h` / `door_sensor.cpp`)**:
   - Manages physical reed switch on GPIO 27 with `INPUT_PULLUP`.
   - Filters contact bounce via 50ms software window.
   - Resolves physical contacts (`SWITCH CLOSED` / `SWITCH OPEN`) into logical door states (`DOOR CLOSED` / `DOOR OPEN`) via configurable mapping (`DOOR_DEFAULT_MAGNET_DETECTS_CLOSED`).
   - Generates state transition callbacks only when the debounced state changes.

2. **`LightSensor` (`light_sensor.h` / `light_sensor.cpp`)**:
   - Samples analog input on GPIO 34 across 8 historical samples.
   - Applies dual-threshold hysteresis ($T = 2000$, $H = 100$).
   - Dark threshold: $> 2100\text{ ADC}$; Bright threshold: $< 1900\text{ ADC}$.

3. **`LightingController` (`lighting_controller.h` / `lighting_controller.cpp`)**:
   - Manages LED on GPIO 26 and status LED on GPIO 2.
   - `AUTO` mode: turns LED ON when `doorOpen && isDark`.
   - When door closes: initiates 15,000ms delay countdown using `millis()`.
   - When door reopens during countdown: immediately cancels shutdown timer.
   - `MANUAL` mode: allows direct remote control (`ON`/`OFF`).

4. **`MqttManager` (`mqtt_manager.h` / `mqtt_manager.cpp`)**:
   - Publishes periodic telemetry packets every 5 seconds.
   - Publishes state transition events immediately on change.
   - Listens for remote configuration updates (`lightThreshold`, `offDelayMs`) and lighting commands (`SET_LIGHT`, `SET_MODE`).
   - Ignores software door override commands (`SET_DOOR`) to maintain integrity with physical reed switch hardware.

---

## 3. Backend Architecture & Persistence

### `MqttGatewayService`
- Connects to Mosquitto via Eclipse Paho MQTT Async Client.
- Wildcard subscription: `smartdoor/device/#`.
- Automatically maps MQTT telemetry JSON to `TelemetryDto` and door events to JPA entities.
- Enforces heartbeat watchdog: if no telemetry is received for $> 15\text{s}$, the device is marked `DISCONNECTED`.

### Zero Mock Data Policy
When the device is disconnected:
- Sensor fields (`doorOpen`, `lightAdc`, `lightOn`, etc.) return `null`.
- The dashboard displays explicit `--` unavailable markers.
- Fake or default values are never substituted.

---

## 4. Frontend Architecture

- **`DoorStatusCard`**: Displays physical reed switch contact state (`SWITCH CLOSED (GPIO LOW)` / `SWITCH OPEN (GPIO HIGH)`), magnet proximity badge, and logical door state.
- **`DoorwayHeroVisualizer`**: Architectural digital twin visualizing the doorway, volumetric light cone, and active 15s auto-off countdown bar.
- **`AmbientLightCard`**: Visualizes LDR analog reading, percentage, and hysteresis boundaries.
- **`LightingControlCard`**: Displays LED actuator status, remaining countdown, and allows mode switching (`AUTO` / `MANUAL`).
- **`EventHistoryTable`**: Historical audit log of genuine hardware events.

