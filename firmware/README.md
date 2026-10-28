# SmartDoorLight — ESP32 Firmware

Firmware written in C++ with Arduino framework for the ESP32 30-Pin NodeMCU (CP2102) development board.

## Hardware Wiring & Electrical Safety Guide

| Component | ESP32 Pin | Mode / Circuit | Notes |
| :--- | :--- | :--- | :--- |
| **Reed Switch (Door)** | **GPIO 4** | `INPUT_PULLUP` to GND | Normally-Open reed switch. Magnet near $\rightarrow$ contacts close to GND (LOW). Magnet separated $\rightarrow$ internal pull-up drives pin HIGH. |
| **LDR Module (Light)** | **GPIO 34** | Analog Input (ADC1_CH6) | **Safety Critical:** Connect VCC to **3.3V pin** (NOT 5V) to ensure analog input voltage never exceeds 3.3V. GPIO 34 is input-only and remains functional when Wi-Fi is active. |
| **Primary LED Light** | **GPIO 18** | Digital Output | Connect GPIO 18 $\rightarrow$ 220Ω / 330Ω resistor $\rightarrow$ LED Anode (+). Cathode (-) to GND. Protects GPIO from exceeding 12mA. |
| **Status Indicator** | **GPIO 2** | Digital Output | Internal on-board blue LED indicator. |

### Edge Autonomy & Fail-Safe Operation
The lighting control logic runs locally inside `loop()` independently of network state:
1. When door opens and ambient light is below `lightThreshold`, the LED turns on instantly.
2. When door closes, a non-blocking 15-second timer starts (`DEFAULT_OFF_DELAY_MS = 15000`).
3. If door reopens during the countdown, the timer is aborted and the LED remains lit.
4. When 15 seconds elapse without door reopening, the LED is extinguished.
5. If Wi-Fi or MQTT disconnects, the lighting functions continue without freezing or delays.

---

## Configuration & Credentials
1. Copy `include/secrets.h.example` to `include/secrets.h`:
   ```bash
   cp include/secrets.h.example include/secrets.h
   ```
2. Set your Wi-Fi SSID, Password, and MQTT broker address in `secrets.h`.
3. `secrets.h` is excluded from git tracking to prevent accidental credential leakage.

---

## Building and Flashing
To build and flash using PlatformIO:
```bash
# Build firmware
pio run

# Upload to ESP32 board
pio run --target upload

# Open serial monitor
pio device monitor -b 115200
```
