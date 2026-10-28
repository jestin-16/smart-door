# SmartDoorLight — Hardware Wiring & Electrical Safety Guide

## 1. Project Concept & Input Selection
In this hardware demonstration version, a **momentary tactile push button** replaces the magnetic reed switch as the primary door input:
- **Reason for Substitution**: A physical push button on the breadboard provides an immediate, reliable, and portable way to simulate door access events without mounting magnets to physical door frames.
- **Toggle Mechanism**: Each valid button press (active LOW) toggles the simulated door state between **OPEN** and **CLOSED**.
- **Software Debouncing**: A 50ms software window inside `DoorSensor.cpp` filters mechanical switch contact bounce, ensuring one state change per press.

---

## 2. Electrical Safety & Pin Assignments

> [!CAUTION]
> **ADC Voltage Limit**: The ESP32 ADC inputs are strictly rated for **0 to 3.3V**. Connecting a 5V sensor output to an ESP32 analog pin will permanently burn the microcontroller ADC. Always wire LDR VCC to the **3.3V pin**, NOT 5V/VIN.

> [!IMPORTANT]
> **Current Limiting**: ESP32 GPIOs can safely source or sink a maximum of **12mA**. Always place a $220\Omega$ or $330\Omega$ resistor in series with the LED to limit current to $\approx 4\text{mA}$.

### Pinout Table

| Component | ESP32 GPIO | Mode / Circuit | Wiring Detail | Electrical Note |
| :--- | :--- | :--- | :--- | :--- |
| **Logical Door State** | **Dashboard** | MQTT Command | Controlled via Dashboard "Open Door" / "Close Door" buttons | Physical reed switch / button is not required for door triggering. |
| **LDR Module (ET5329)** | **GPIO 34** | Analog Input (`ADC1_CH6`) | VCC $\rightarrow$ 3.3V<br>GND $\rightarrow$ GND<br>AO $\rightarrow$ GPIO 34 | Connected to ADC1 (GPIO 34). 12-bit ADC reading (0-4095). High ADC (~3200) = Dark; Low ADC (~800) = Bright. |
| **Doorway White LED** | **GPIO 26** | Digital Output | GPIO 26 $\rightarrow$ $220\Omega$ resistor $\rightarrow$ LED Anode (+)<br>LED Cathode (-) $\rightarrow$ GND | Current limiting: $R = \frac{3.3V - 2.1V}{0.0055A} \approx 218\Omega \rightarrow$ standard **$220\Omega$**. Safe load $\approx 5.5\text{mA} < 12\text{mA}$. |
| **Status Indicator** | **GPIO 2** | Digital Output | Internal onboard blue LED | Driven directly by internal board traces. |

---

## 3. Circuit Schematic

```
                 +-----------------------+
                 |    ESP32 30-PIN USB-C |
                 |                       |
                 |  3.3V  -------------+ |----------> VCC (LDR Module)
                 |  GND   -------------|-+----------> GND (LDR, LED Cathode)
                 |                     | |
                 |   GPIO 34 <---------+-----------> AO (LDR Module Analog Output)
                 |                     |
                 |   GPIO 26 ---------[220 Ohm]----> [White LED Anode (+)]
                 |                                   [LED Cathode (-)] -> GND
                 +-----------------------+
```

---

## 4. Light Threshold & Hysteresis

Based on real sensor calibration measurements:
- **Brighter Ambient Conditions**: ADC count $\approx \mathbf{784 - 845}$
- **Darker Ambient Conditions**: ADC count $\approx \mathbf{3206 - 3228}$
- **Calibrated Midpoint Threshold**: $\mathbf{2000\text{ ADC}}$ (configurable via dashboard slider)
- **Hysteresis Band**: $\pm \mathbf{100\text{ ADC}}$
- **Transition to DARK**: Occurs only when ADC rises above $(2000 + 100) = \mathbf{2100\text{ ADC}}$.
- **Transition to BRIGHT**: Occurs only when ADC drops below $(2000 - 100) = \mathbf{1900\text{ ADC}}$.
- Between 1900 and 2100 ADC, the system holds its previous state to prevent rapid flickering.
