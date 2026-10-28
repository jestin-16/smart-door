#pragma once

#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <functional>

struct DeviceCommand {
    String action;       // "SET_LIGHT", "SET_MODE", "PING"
    String state;        // "ON", "OFF"
    String mode;         // "AUTO", "MANUAL"
};

struct DeviceConfiguration {
    uint16_t lightThreshold;
    unsigned long offDelayMs;
    bool hasLightThreshold;
    bool hasOffDelayMs;
};

class MqttManager {
public:
    using CommandCallback = std::function<void(const DeviceCommand& cmd)>;
    using ConfigCallback = std::function<void(const DeviceConfiguration& config)>;

    explicit MqttManager(const char* deviceId, const char* brokerHost, uint16_t brokerPort,
                         const char* user = nullptr, const char* password = nullptr);

    void begin(const char* wifiSsid, const char* wifiPass);
    void update(); // Non-blocking loop call

    bool isWifiConnected() const;
    bool isMqttConnected();

    void publishTelemetry(const JsonDocument& doc);
    void publishEvent(const char* eventType, const JsonDocument& details);
    
    void setOnCommand(CommandCallback callback);
    void setOnConfig(ConfigCallback callback);

private:
    String _deviceId;
    String _brokerHost;
    uint16_t _brokerPort;
    String _mqttUser;
    String _mqttPass;
    String _wifiSsid;
    String _wifiPass;

    WiFiClient _wifiClient;
    PubSubClient _mqttClient;

    unsigned long _lastWifiAttempt;
    unsigned long _lastMqttAttempt;

    String _topicTelemetry;
    String _topicEvent;
    String _topicCommand;
    String _topicConfig;
    String _topicStatus;

    CommandCallback _commandCallback;
    ConfigCallback _configCallback;

    void maintainWifi();
    void maintainMqtt();
    void onMqttMessage(char* topic, byte* payload, unsigned int length);
};

#endif // MQTT_MANAGER_H
