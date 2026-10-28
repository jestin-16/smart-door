#pragma once

#ifndef SMARTDOOR_CONFIG_H
#define SMARTDOOR_CONFIG_H

#include <Arduino.h>

// ==========================================
// GPIO Pin Assignments
// ==========================================
// Physical Push Button: Optional breadboard fallback (GPIO 27)
#define PIN_DOOR_BUTTON 27
#define PIN_DOOR_SENSOR PIN_DOOR_BUTTON // Backward compatibility alias

// LDR Light Sensor: Connected to GPIO 34 (ADC1_CH6, Wi-Fi safe, input-only)
#define PIN_LDR_ANALOG 34

// Primary Lighting Output: Connected to LED via 220 Ohm resistor (GPIO 26)
#define PIN_LIGHT_LED 26

// Status Indicator LED (ESP32 on-board LED)
#define PIN_STATUS_LED 2

// ==========================================
// Timing & Operational Defaults
// ==========================================
// Software debounce window for push button (ms)
#define BUTTON_DEBOUNCE_MS 50
#define SENSOR_DEBOUNCE_MS BUTTON_DEBOUNCE_MS

// Non-blocking timer duration after door closes before light switches off (ms)
#define DEFAULT_OFF_DELAY_MS 15000UL // 15 seconds

// ADC Sampling window, smoothing & hysteresis
#define LDR_SAMPLE_COUNT 8
// Real sensor readings: Bright ~784-845, Dark ~3206-3228.
// Higher ADC value indicates DARKER environment.
#define DEFAULT_LIGHT_THRESHOLD 2000   // Midpoint threshold (0-4095 12-bit ADC)
#define DEFAULT_LIGHT_HYSTERESIS 100   // Hysteresis window (prevents rapid switching)

// Telemetry periodic broadcast interval (ms)
#define TELEMETRY_INTERVAL_MS 5000UL

// Reconnection intervals for non-blocking network state machine (ms)
#define WIFI_RECONNECT_INTERVAL_MS 5000UL
#define MQTT_RECONNECT_INTERVAL_MS 5000UL

// ==========================================
// MQTT Configuration & Topics
// ==========================================
#define DEFAULT_DEVICE_ID "smartdoor-01"

// MQTT Base topics: smartdoor/device/{deviceId}/...
#define MQTT_TOPIC_PREFIX "smartdoor/device/"
#define MQTT_TOPIC_TELEMETRY "/telemetry"
#define MQTT_TOPIC_EVENT "/event"
#define MQTT_TOPIC_COMMAND "/command"
#define MQTT_TOPIC_CONFIG "/config"
#define MQTT_TOPIC_STATUS "/status"

// Serial baud rate
#define SERIAL_BAUD_RATE 115200

#endif // SMARTDOOR_CONFIG_H
