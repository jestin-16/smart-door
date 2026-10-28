#include <Arduino.h>
#include "config.h"
#include "secrets.h"
#include "door_sensor.h"
#include "light_sensor.h"
#include "lighting_controller.h"
#include "mqtt_manager.h"

// Instantiate physical hardware modules
DoorSensor doorButton(PIN_DOOR_BUTTON, BUTTON_DEBOUNCE_MS);
LightSensor lightSensor(PIN_LDR_ANALOG, DEFAULT_LIGHT_THRESHOLD, DEFAULT_LIGHT_HYSTERESIS, LDR_SAMPLE_COUNT);
LightingController lighting(PIN_LIGHT_LED, PIN_STATUS_LED, DEFAULT_OFF_DELAY_MS);
MqttManager mqtt(DEFAULT_DEVICE_ID, MQTT_BROKER_HOST, MQTT_BROKER_PORT, MQTT_USER, MQTT_PASSWORD);

unsigned long lastTelemetryTime = 0;

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);
    delay(500); // Brief power stabilization

    Serial.println("\n==================================================");
    Serial.println("  SmartDoorLight ESP32 Real Hardware System");
    Serial.println("  Door Control: Dashboard Logical Trigger / GPIO 27");
    Serial.println("  Light Sensor: LDR Analog Module (GPIO 34 ADC1 with Hysteresis)");
    Serial.println("  Lighting Output: White LED (GPIO 26 via 220 Ohm resistor)");
    Serial.println("==================================================");
    Serial.printf("[Pins] Door Trigger: GPIO %d | LDR: GPIO %d | LED: GPIO %d | Status: GPIO %d\n",
                  PIN_DOOR_BUTTON, PIN_LDR_ANALOG, PIN_LIGHT_LED, PIN_STATUS_LED);

    // Initialize physical sensors and actuators
    doorButton.begin();
    lightSensor.begin();
    lighting.begin();

    // Event callback: Door State Changes (both physical or dashboard command)
    doorButton.setOnStateChange([](bool isOpen) {
        Serial.printf("[DOOR EVENT] Logical Door %s at %lu ms\n",
                      isOpen ? "OPENED" : "CLOSED", millis());

        JsonDocument details;
        details["doorOpen"] = isOpen;
        details["lightAdc"] = lightSensor.getRawAdc();
        details["lightPercentage"] = lightSensor.getLightPercentage();
        details["isDark"] = lightSensor.isDark();
        details["threshold"] = lightSensor.getThreshold();
        details["hysteresis"] = lightSensor.getHysteresis();
        details["triggerSource"] = "DASHBOARD_COMMAND";

        mqtt.publishEvent(isOpen ? "DOOR_OPENED" : "DOOR_CLOSED", details);
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
        details["lightOn"] = lightState;
        details["mode"] = (lighting.getMode() == LightingMode::AUTO) ? "AUTO" : "MANUAL";
        details["timerActive"] = lighting.isTimerActive();
        details["remainingDelayMs"] = lighting.getRemainingDelayMs();
        details["offDelayMs"] = lighting.getOffDelay();

        mqtt.publishEvent(eventName, details);
    });

    // Incoming Command Handler (Remote Control)
    mqtt.setOnCommand([](const DeviceCommand& cmd) {
        Serial.printf("[COMMAND] Action: %s | State: %s | Mode: %s\n",
                      cmd.action.c_str(), cmd.state.c_str(), cmd.mode.c_str());

        if (cmd.action == "SET_DOOR") {
            bool open = (cmd.state == "OPEN" || cmd.state == "true" || cmd.state == "1");
            doorButton.setDoorState(open);
            Serial.printf("[COMMAND] Door state updated to: %s\n", open ? "OPEN" : "CLOSED");
        } else if (cmd.action == "SET_LIGHT") {
            bool turnOn = (cmd.state == "ON" || cmd.state == "true" || cmd.state == "1");
            lighting.setManualState(turnOn);
        } else if (cmd.action == "SET_MODE") {
            if (cmd.mode == "AUTO") {
                lighting.setMode(LightingMode::AUTO);
            } else if (cmd.mode == "MANUAL") {
                lighting.setMode(LightingMode::MANUAL);
            }
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
    });

    // Start Wi-Fi & MQTT network manager
    mqtt.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.println("[SYSTEM] Setup completed. Local autonomous control loop active.");
}

void loop() {
    // 1. Debounce and read physical push button to toggle simulated door state
    doorButton.update();

    // 2. Read and smooth ambient light level with hysteresis
    lightSensor.update();

    // 3. Autonomous lighting state machine (failsafe: runs locally without cloud dependencies)
    lighting.update(doorButton.isOpen(), lightSensor.isDark());

    // 4. Update network client loops & non-blocking reconnections
    mqtt.update();

    // 5. Periodic telemetry broadcast (only publishes real sensor readings!)
    unsigned long now = millis();
    if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = now;

        JsonDocument doc;
        doc["deviceId"] = DEFAULT_DEVICE_ID;
        doc["uptimeSeconds"] = now / 1000;
        doc["doorOpen"] = doorButton.isOpen();
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
}
