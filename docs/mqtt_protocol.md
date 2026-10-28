# SmartDoorLight — MQTT Communication Protocol Specification

## 1. Topic Hierarchy Overview

Base Prefix: `smartdoor/device/{deviceId}/`

| Topic Path | Direction | QoS | Retained | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `smartdoor/device/{deviceId}/telemetry` | ESP32 $\rightarrow$ Broker | 0 | No | Periodic device telemetry & sensor states |
| `smartdoor/device/{deviceId}/event` | ESP32 $\rightarrow$ Broker | 1 | No | Instantaneous events (door state change, light toggle) |
| `smartdoor/device/{deviceId}/command` | Backend $\rightarrow$ ESP32 | 1 | No | Control commands (`SET_LIGHT`, `SET_MODE`) |
| `smartdoor/device/{deviceId}/config` | Backend $\rightarrow$ ESP32 | 1 | Yes | Over-the-air threshold & timer parameter updates |
| `smartdoor/device/{deviceId}/status` | ESP32 $\rightarrow$ Broker | 1 | Yes | LWT (Last Will and Testament) online/offline indicator |

---

## 2. Topic Schemas & Payloads

### 2.1 Periodic Telemetry (`.../telemetry`)
Broadcast every 5 seconds (`TELEMETRY_INTERVAL_MS = 5000`):
```json
{
  "deviceId": "smartdoor-01",
  "uptimeSeconds": 348,
  "doorOpen": false,
  "lightAdc": 1120,
  "lightPercentage": 27.3,
  "lightThreshold": 1500,
  "isDark": true,
  "lightOn": true,
  "mode": "AUTO",
  "timerActive": true,
  "remainingDelayMs": 9500,
  "offDelayMs": 15000,
  "wifiConnected": true,
  "mqttConnected": true,
  "wifiRssi": -58
}
```

---

### 2.2 Instantaneous Events (`.../event`)
Published immediately when a state change occurs:

#### `DOOR_OPENED` / `DOOR_CLOSED`
```json
{
  "deviceId": "smartdoor-01",
  "eventType": "DOOR_OPENED",
  "uptimeSeconds": 350,
  "details": {
    "doorOpen": true,
    "lightAdc": 1120,
    "lightPercentage": 27.3,
    "isDark": true,
    "threshold": 1500
  }
}
```

#### `LIGHT_ON` / `LIGHT_OFF` / `LIGHT_TIMER_STARTED` / `LIGHT_TIMER_EXPIRED`
```json
{
  "deviceId": "smartdoor-01",
  "eventType": "LIGHT_TIMER_STARTED",
  "uptimeSeconds": 365,
  "details": {
    "lightOn": true,
    "mode": "AUTO",
    "timerActive": true,
    "remainingDelayMs": 15000,
    "offDelayMs": 15000
  }
}
```

---

### 2.3 Remote Commands (`.../command`)
Sent from backend REST API to ESP32:

#### Force Light Output
```json
{
  "action": "SET_LIGHT",
  "state": "ON"
}
```
*(Values for `state`: `"ON"`, `"OFF"`)*

#### Change Operating Mode
```json
{
  "action": "SET_MODE",
  "mode": "AUTO"
}
```
*(Values for `mode`: `"AUTO"`, `"MANUAL"`)*

---

### 2.4 Device Configuration (`.../config`)
```json
{
  "lightThreshold": 1800,
  "offDelayMs": 20000
}
```

---

### 2.5 Last Will and Testament Status (`.../status`)
Configured on initial MQTT connect with retain flag enabled:
- Online (published upon connect):
  ```json
  {
    "status": "online",
    "deviceId": "smartdoor-01",
    "ip": "192.168.1.150"
  }
  ```
- Offline (automatically dispatched by broker if connection terminates unexpectedly):
  ```json
  {
    "status": "offline"
  }
  ```
