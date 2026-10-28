#include <Arduino.h>
#include "config.h"
#include "secrets.h"
#include "door_sensor.h"
#include "light_sensor.h"
#include "lighting_controller.h"
#include "mqtt_manager.h"

#ifndef MQTT_USE_TLS
#define MQTT_USE_TLS false
#endif

#ifndef MQTT_CA_CERT
#define MQTT_CA_CERT nullptr
#endif

// Instantiate physical hardware modules
DoorSensor doorSensor(PIN_REED_SWITCH, REED_DEBOUNCE_MS, DOOR_DEFAULT_MAGNET_DETECTS_CLOSED);
LightSensor lightSensor(PIN_LDR_ANALOG, DEFAULT_LIGHT_THRESHOLD, DEFAULT_LIGHT_HYSTERESIS, LDR_SAMPLE_COUNT);
LightingController lighting(PIN_LIGHT_LED, PIN_STATUS_LED, DEFAULT_OFF_DELAY_MS);
MqttManager mqtt(DEFAULT_DEVICE_ID, MQTT_BROKER_HOST, MQTT_BROKER_PORT, MQTT_USER, MQTT_PASSWORD, MQTT_USE_TLS, MQTT_CA_CERT);

unsigned long lastTelemetryTime = 0;

void sendTelemetryNow() {
    lastTelemetryTime = millis();

    JsonDocument doc;
    doc["deviceId"] = DEFAULT_DEVICE_ID;
    doc["uptimeSeconds"] = lastTelemetryTime / 1000;
    doc["doorOpen"] = doorSensor.isOpen();
    doc["reedSwitchClosed"] = doorSensor.isReedClosed();
    doc["magnetDetected"] = doorSensor.isMagnetDetected();
    doc["doorStateEstablished"] = doorSensor.isStateEstablished();
    doc["lightAdc"] = lightSensor.getRawAdc();
    doc["lightPercentage"] = lightSensor.getLightPercentage();
    doc["lightThreshold"] = lightSensor.getThreshold();
    doc["lightHysteresis"] = lightSensor.getHysteresis();
    doc["isDark"] = lightSensor.isDark();
    doc["lightOn"] = lighting.isLightOn();
    doc["mode"] = (lighting.getMode() == LightingMode::AUTO) ? "AUTO" : "MANUAL";
    doc["timerActive"] = lighting.isTimerActive();
    doc["remainingDelayMs"] = lighting.getRemainingDelayMs();
    doc["offDelayMs"] = lighting.getOffDelay();
    doc["wifiConnected"] = mqtt.isWifiConnected();
    doc["mqttConnected"] = mqtt.isMqttConnected();
    doc["wifiRssi"] = WiFi.RSSI();

    mqtt.publishTelemetry(doc);
}

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);
    delay(500); // Brief power stabilization

    Serial.println("\n==================================================");
    Serial.println("  SmartDoorLight ESP32 Real Hardware System");
    Serial.println("  Door Sensor: Magnetic Reed Switch (GPIO 27, INPUT_PULLUP)");
    Serial.println("  Light Sensor: LDR Analog Module (GPIO 34 ADC1 with Hysteresis)");
    Serial.println("  Lighting Output: White LED (GPIO 26 via 220 Ohm resistor)");
    Serial.println("==================================================");
    Serial.printf("[Pins] Reed Switch: GPIO %d | LDR: GPIO %d | LED: GPIO %d | Status: GPIO %d\n",
                  PIN_REED_SWITCH, PIN_LDR_ANALOG, PIN_LIGHT_LED, PIN_STATUS_LED);

    // Initialize physical sensors and actuators
    doorSensor.begin();
    lightSensor.begin();
    lighting.begin();

    // Event callback: Physical Door State Changes detected by reed switch
    doorSensor.setOnStateChange([](bool isOpen) {
        Serial.printf("[DOOR EVENT] Physical Door %s (Reed: %s) at %lu ms\n",
                      isOpen ? "OPENED" : "CLOSED",
                      doorSensor.isReedClosed() ? "SWITCH CLOSED (Magnet Detected)" : "SWITCH OPEN (Magnet Absent)",
                      millis());

        // Immediately evaluate lighting state machine so LED output and state are synchronized synchronously
        lighting.update(isOpen, lightSensor.isDark());

        JsonDocument details;
        details["doorOpen"] = isOpen;
        details["reedSwitchClosed"] = doorSensor.isReedClosed();
        details["magnetDetected"] = doorSensor.isMagnetDetected();
        details["lightOn"] = lighting.isLightOn();
        details["lightAdc"] = lightSensor.getRawAdc();
        details["lightPercentage"] = lightSensor.getLightPercentage();
        details["isDark"] = lightSensor.isDark();
        details["threshold"] = lightSensor.getThreshold();
        details["hysteresis"] = lightSensor.getHysteresis();
        details["triggerSource"] = "PHYSICAL_REED_SWITCH";

        mqtt.publishEvent(isOpen ? "DOOR_OPENED" : "DOOR_CLOSED", details);

        // Instantly push telemetry packet over MQTT so dashboard updates with 0 latency!
        sendTelemetryNow();
        mqtt.update();
    });

    // Event callback: Lighting Controller State Machine
    lighting.setOnEvent([](LightEvent event, bool lightState) {
        const char* eventName = "UNKNOWN";
        switch (event) {
            case LightEvent::LIGHT_TURNED_ON:  eventName = "LIGHT_ON"; break;
            case LightEvent::LIGHT_TURNED_OFF: eventName = "LIGHT_OFF"; break;
            case LightEvent::TIMER_STARTED:    eventName = "LIGHT_TIMER_STARTED"; break;
            case LightEvent::TIMER_CANCELLED:  eventName = "LIGHT_TIMER_CANCELLED"; break;
            case LightEvent::TIMER_EXPIRED:    eventName = "LIGHT_TIMER_EXPIRED"; break;
            case LightEvent::MODE_CHANGED:     eventName = "MODE_CHANGED"; break;
        }

        Serial.printf("[LIGHT EVENT] %s | Physical LED State: %s | Remaining Timer: %lu ms\n",
                      eventName, lightState ? "ON" : "OFF", lighting.getRemainingDelayMs());

        JsonDocument details;
        details["doorOpen"] = doorSensor.isOpen();
        details["reedSwitchClosed"] = doorSensor.isReedClosed();
        details["magnetDetected"] = doorSensor.isMagnetDetected();
        details["lightOn"] = lightState;
        details["mode"] = (lighting.getMode() == LightingMode::AUTO) ? "AUTO" : "MANUAL";
        details["timerActive"] = lighting.isTimerActive();
        details["remainingDelayMs"] = lighting.getRemainingDelayMs();
        details["offDelayMs"] = lighting.getOffDelay();

        mqtt.publishEvent(eventName, details);

        // Instantly push telemetry packet over MQTT so dashboard updates with 0 latency!
        sendTelemetryNow();
        mqtt.update();
    });

    // Incoming Command Handler (Remote Control)
    mqtt.setOnCommand([](const DeviceCommand& cmd) {
        Serial.printf("[COMMAND] Action: %s | State: %s | Mode: %s\n",
                      cmd.action.c_str(), cmd.state.c_str(), cmd.mode.c_str());

        if (cmd.action == "SET_DOOR") {
            Serial.println("[COMMAND] Door state is governed exclusively by the physical magnetic reed switch on GPIO 27. Remote override ignored.");
        } else if (cmd.action == "SET_LIGHT") {
            bool turnOn = (cmd.state == "ON" || cmd.state == "true" || cmd.state == "1");
            lighting.setManualState(turnOn);
            sendTelemetryNow();
        } else if (cmd.action == "SET_MODE") {
            if (cmd.mode == "AUTO") {
                lighting.setMode(LightingMode::AUTO);
            } else if (cmd.mode == "MANUAL") {
                lighting.setMode(LightingMode::MANUAL);
            }
            sendTelemetryNow();
        }
    });

    // Incoming Configuration Handler
    mqtt.setOnConfig([](const DeviceConfiguration& cfg) {
        if (cfg.hasLightThreshold) {
            Serial.printf("[CONFIG] Updating Light Threshold to: %u\n", cfg.lightThreshold);
            lightSensor.setThreshold(cfg.lightThreshold);
        }
        if (cfg.hasOffDelayMs) {
            Serial.printf("[CONFIG] Updating Off Delay to: %lu ms\n", cfg.offDelayMs);
            lighting.setOffDelay(cfg.offDelayMs);
        }
        sendTelemetryNow();
    });

    // Start Wi-Fi & MQTT network manager
    mqtt.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.println("[SYSTEM] Setup completed. Local autonomous control loop active.");
}

void loop() {
    // 1. Debounce and read physical magnetic reed switch on GPIO 27
    doorSensor.update();

    // 2. Read and smooth ambient light level with hysteresis on GPIO 34
    lightSensor.update();

    // 3. Autonomous lighting state machine (failsafe: runs locally without cloud dependencies)
    lighting.update(doorSensor.isOpen(), lightSensor.isDark());

    // 4. Update network client loops & non-blocking reconnections
    mqtt.update();

    // 5. Periodic telemetry broadcast (only publishes real sensor readings!)
    unsigned long now = millis();
    if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        sendTelemetryNow();
    }
}
