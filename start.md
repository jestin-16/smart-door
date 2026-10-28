# SmartDoorLight — Quick Start & Operation Guide

Complete step-by-step instructions to run, flash, and test the **SmartDoorLight** IoT automatic doorway lighting system.

---

## 1. Hardware Pinout & Wiring

| Component | ESP32 Pin | Mode / Connection | Electrical Notes |
| :--- | :--- | :--- | :--- |
| **LDR Sensor (ET5329)** | **GPIO 34** (`ADC1_CH6`) | VCC $\rightarrow$ **3.3V**<br>GND $\rightarrow$ **GND**<br>AO $\rightarrow$ **GPIO 34** | **Safety Critical**: Connect VCC to **3.3V only** (never 5V). 12-bit ADC (0–4095). High ADC ($\approx 3200$) = Dark; Low ADC ($\approx 800$) = Bright. |
| **White Doorway LED** | **GPIO 26** | GPIO 26 $\rightarrow$ **220 Ω resistor** $\rightarrow$ LED Anode (+)<br>LED Cathode (-) $\rightarrow$ **GND** | Safe current limit: $\approx 5.5\text{ mA} < 12\text{ mA}$ GPIO max limit. |
| **Magnetic Reed Switch (ET5370)** *(Optional)* | **GPIO 27** | Wire 1 $\rightarrow$ **GPIO 27**<br>Wire 2 $\rightarrow$ **GND** | Uses internal `INPUT_PULLUP`. Magnet near (door closed) = LOW; Magnet away (door open) = HIGH. |
| **Logical Door Control** | **Dashboard** | Web UI Buttons | Primary demo trigger: Click **Open Door** / **Close Door** on the web dashboard. |
| **Power Supply** | **USB-C Port** | 5V USB (Laptop, Power Bank, or Charger) | ESP32 boots in $<1$ second and auto-connects to Wi-Fi. |

### Breadboard Wiring Schematic
```
                 +-----------------------+
                 |    ESP32 30-PIN USB-C |
                 |                       |
                 |  3.3V  -------------+ |----------> VCC (LDR Module)
                 |  GND   -------------|-+----------> GND (LDR, LED Cathode, Reed Switch)
                 |                     | |
 (Reed Switch)   |   GPIO 27 <---------+ |----------> Leg 1 (ET5370 Reed Switch)
                 |                     | |            Leg 2 -> GND
                 |   GPIO 34 <---------+-----------> AO (LDR Analog Output)
                 |                     |
                 |   GPIO 26 ---------[220 Ohm]----> [LED Anode (+)]
                 |                                   [LED Cathode (-)] -> GND
                 +-----------------------+
```

---

## 2. Network Prerequisites (Crucial Hotspot Setting)

> [!IMPORTANT]
> **Hotspot Band**: ESP32 microcontrollers only have a **2.4 GHz** radio and cannot connect to 5 GHz networks.
> On your smartphone hotspot:
> 1. Go to **Settings** $\rightarrow$ **Personal Hotspot** $\rightarrow$ **Hotspot Settings**.
> 2. Set **AP Band** to **2.4 GHz** (not 5 GHz).

* **Wi-Fi SSID**: Configured in `firmware/smartdoor_firmware/secrets.h` (e.g. `"realme 9 5G Speed Edition"`).
* **Wi-Fi Password**: Empty string `""` for open hotspots, or your hotspot password.
* **MQTT Broker Host**: Your PC's local IP address on Wi-Fi (e.g. `"10.41.210.66"`).

---

## 3. Starting the Full Project

### Step 1: Start Infrastructure (MQTT Broker + Database)
Make sure Docker Desktop is running, then run:
```powershell
cd f:\smartdoor\infrastructure
docker compose up -d
```
* **Mosquitto MQTT Broker**: Running on port `1883` and `9001`.
* **PostgreSQL 16**: Running on port `5432`.

### Step 2: Start Spring Boot Backend
```powershell
cd f:\smartdoor\backend
./mvnw.cmd spring-boot:run
```
* **REST API**: `http://localhost:8080/api/v1`
* **Swagger UI Documentation**: `http://localhost:8080/swagger-ui.html`
* *(Optional standalone mode without Docker/PostgreSQL)*:
  `./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=standalone`

### Step 3: Start React Dashboard
```powershell
cd f:\smartdoor\frontend
npm run dev
```
* **Web Dashboard**: Open `http://localhost:5173` in any browser.

---

## 4. Uploading Firmware to ESP32

### Method A: Via Arduino IDE (Recommended)
1. Open **Arduino IDE**.
2. Close the Serial Monitor if it is currently open (to release `COM7`).
3. Open `f:\smartdoor\firmware\smartdoor_firmware\smartdoor_firmware.ino`.
4. Ensure board is set to **ESP32 Dev Module** and port is **COM7**.
5. Click **Upload** (arrow icon).

### Method B: Via Command Line
```powershell
& "C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe" upload -p COM7 --fqbn esp32:esp32:esp32 "f:\smartdoor\firmware\smartdoor_firmware"
```

---

## 5. System Logic & Verification Procedure

| Test Step | Action | Expected Behavior |
| :--- | :--- | :--- |
| **1. Connection** | Open `http://localhost:5173` with ESP32 powered on | Banner displays **CONNECTED** with green indicator, genuine LDR ADC reading ($\approx 3100-3250$), and Wi-Fi RSSI. |
| **2. Open Door in Dark** | Leave LDR in normal room lighting ($> 2000$ ADC), click **Open Door** | Dashboard shows **Door Open** badge; physical white LED on **GPIO 26 turns ON immediately**. |
| **3. Daylight Suppression** | With door open, shine a phone light onto the LDR (ADC drops below $1900$) | Dashboard updates to **BRIGHT**; physical LED on **GPIO 26 turns OFF**. Remove light $\rightarrow$ LED turns back ON. |
| **4. Close Door 15s Timer** | With LED ON, click **Close Door** on the dashboard | Dashboard displays **Door Closed** and an animated **15.0s countdown bar**. Physical LED remains ON for 15 seconds, then **turns OFF**. |
| **5. Cancel Delay on Reopening** | Close door, and during the 15-second countdown, click **Open Door** | The countdown timer cancels immediately; the physical LED remains ON without interruption. |

---

## 6. Project Architecture Overview

```
[ Physical ESP32 DevKit ] 
   ├── LDR Photocell (GPIO 34 ADC1)
   └── White LED Actuator (GPIO 26 Output)
         │
         │  Wi-Fi 2.4 GHz (JSON Telemetry & Commands)
         ▼
[ Eclipse Mosquitto MQTT Broker ]  (tcp://10.41.210.66:1883)
         │
         │  Paho MQTT v3 Client
         ▼
[ Spring Boot 4 Java 21 Backend ] (http://localhost:8080)
   ├── PostgreSQL 16 Persistence (Event Audit Log)
   └── REST API Endpoints (/commands/door, /commands/light, /telemetry)
         │
         │  HTTP / Polling (Every 3 seconds)
         ▼
[ React 19 + TypeScript Dashboard ] (http://localhost:5173)
   ├── Live Connection Status Banner (Zero Mock Data)
   ├── Door Control Card (Open Door / Close Door buttons)
   ├── Ambient Illuminance Card (Real ADC readings & Hysteresis slider)
   └── Doorway Light Control Card (15-second delay countdown bar)
```
