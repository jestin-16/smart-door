#include "mqtt_manager.h"
#include "config.h"

MqttManager::MqttManager(const char* deviceId, const char* brokerHost, uint16_t brokerPort,
                         const char* user, const char* password,
                         bool useTls, const char* caCert)
    : _deviceId(deviceId),
      _brokerHost(brokerHost),
      _brokerPort(brokerPort),
      _mqttUser(user ? user : ""),
      _mqttPass(password ? password : ""),
      _useTls(useTls),
      _caCert(caCert),
      _wifiSsid(""),
      _wifiPass(""),
      _mqttClient(_wifiClient),
      _lastWifiAttempt(0),
      _lastMqttAttempt(0),
      _commandCallback(nullptr),
      _configCallback(nullptr) {
    _topicTelemetry = String(MQTT_TOPIC_PREFIX) + _deviceId + MQTT_TOPIC_TELEMETRY;
    _topicEvent     = String(MQTT_TOPIC_PREFIX) + _deviceId + MQTT_TOPIC_EVENT;
    _topicCommand   = String(MQTT_TOPIC_PREFIX) + _deviceId + MQTT_TOPIC_COMMAND;
    _topicConfig    = String(MQTT_TOPIC_PREFIX) + _deviceId + MQTT_TOPIC_CONFIG;
    _topicStatus    = String(MQTT_TOPIC_PREFIX) + _deviceId + MQTT_TOPIC_STATUS;
}

void MqttManager::begin(const char* wifiSsid, const char* wifiPass) {
    _wifiSsid = wifiSsid;
    _wifiPass = wifiPass;

    WiFi.mode(WIFI_STA);

    if (_useTls) {
        if (_caCert && strlen(_caCert) > 0) {
            _secureClient.setCACert(_caCert);
            Serial.println("[MQTT TLS] Configured Root CA certificate for verification.");
        } else {
            // For self-signed certificates or direct IP endpoints, encrypt transport using TLS
            _secureClient.setInsecure();
            Serial.println("[MQTT TLS] Initialized TLS transport (encrypted, direct IP mode).");
        }
        _mqttClient.setClient(_secureClient);
    } else {
        _mqttClient.setClient(_wifiClient);
    }

    _mqttClient.setServer(_brokerHost.c_str(), _brokerPort);
    _mqttClient.setBufferSize(1024);

    _mqttClient.setCallback([this](char* topic, byte* payload, unsigned int length) {
        this->onMqttMessage(topic, payload, length);
    });

    // Start initial Wi-Fi connection attempt
    maintainWifi();
}

void MqttManager::maintainWifi() {
    if (WiFi.status() == WL_CONNECTED) {
        return;
    }

    unsigned long now = millis();
    if (now - _lastWifiAttempt >= WIFI_RECONNECT_INTERVAL_MS || _lastWifiAttempt == 0) {
        _lastWifiAttempt = now;
        Serial.printf("[Wi-Fi] Connecting to %s (non-blocking)...\n", _wifiSsid.c_str());
        WiFi.begin(_wifiSsid.c_str(), _wifiPass.c_str());
    }
}

void MqttManager::maintainMqtt() {
    if (WiFi.status() != WL_CONNECTED) {
        return;
    }

    if (_mqttClient.connected()) {
        return;
    }

    unsigned long now = millis();
    if (now - _lastMqttAttempt >= MQTT_RECONNECT_INTERVAL_MS || _lastMqttAttempt == 0) {
        _lastMqttAttempt = now;
        if (_useTls) {
            Serial.printf("[MQTT TLS] Connecting to %s:%d (MQTTS) as %s...\n", _brokerHost.c_str(), _brokerPort, _deviceId.c_str());
        } else {
            Serial.printf("[MQTT] Connecting to %s:%d (plain TCP) as %s...\n", _brokerHost.c_str(), _brokerPort, _deviceId.c_str());
        }

        // Configure LWT (Last Will and Testament)
        const char* willTopic = _topicStatus.c_str();
        const char* willPayload = "{\"status\":\"offline\"}";
        bool willRetain = true;
        uint8_t willQos = 1;

        bool connected = false;
        if (_mqttUser.length() > 0) {
            connected = _mqttClient.connect(_deviceId.c_str(), _mqttUser.c_str(), _mqttPass.c_str(),
                                           willTopic, willQos, willRetain, willPayload);
        } else {
            connected = _mqttClient.connect(_deviceId.c_str(), willTopic, willQos, willRetain, willPayload);
        }

        if (connected) {
            Serial.println("[MQTT] Connected successfully!");

            // Publish online status
            JsonDocument statusDoc;
            statusDoc["status"] = "online";
            statusDoc["deviceId"] = _deviceId;
            statusDoc["ip"] = WiFi.localIP().toString();
            String statusStr;
            serializeJson(statusDoc, statusStr);
            _mqttClient.publish(_topicStatus.c_str(), statusStr.c_str(), true);

            // Subscribe to control topics
            _mqttClient.subscribe(_topicCommand.c_str(), 1);
            _mqttClient.subscribe(_topicConfig.c_str(), 1);
            Serial.printf("[MQTT] Subscribed to %s and %s\n", _topicCommand.c_str(), _topicConfig.c_str());
        } else {
            Serial.printf("[MQTT] Connection failed, rc=%d. Will retry in %lu ms\n",
                          _mqttClient.state(), MQTT_RECONNECT_INTERVAL_MS);
        }
    }
}

void MqttManager::update() {
    maintainWifi();
    maintainMqtt();

    if (_mqttClient.connected()) {
        _mqttClient.loop();
    }
}

bool MqttManager::isWifiConnected() const {
    return (WiFi.status() == WL_CONNECTED);
}

bool MqttManager::isMqttConnected() {
    return _mqttClient.connected();
}

void MqttManager::publishTelemetry(const JsonDocument& doc) {
    if (!_mqttClient.connected()) {
        return;
    }
    String payload;
    serializeJson(doc, payload);
    _mqttClient.publish(_topicTelemetry.c_str(), payload.c_str(), false);
}

void MqttManager::publishEvent(const char* eventType, const JsonDocument& details) {
    if (!_mqttClient.connected()) {
        return;
    }
    JsonDocument eventDoc;
    eventDoc["deviceId"] = _deviceId;
    eventDoc["eventType"] = eventType;
    eventDoc["uptimeSeconds"] = millis() / 1000;
    eventDoc["details"] = details;

    String payload;
    serializeJson(eventDoc, payload);
    _mqttClient.publish(_topicEvent.c_str(), payload.c_str(), false);
    Serial.printf("[MQTT EVENT] %s -> %s\n", eventType, payload.c_str());
}

void MqttManager::setOnCommand(CommandCallback callback) {
    _commandCallback = callback;
}

void MqttManager::setOnConfig(ConfigCallback callback) {
    _configCallback = callback;
}

void MqttManager::onMqttMessage(char* topic, byte* payload, unsigned int length) {
    String topicStr = String(topic);
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.printf("[MQTT] JSON parse failed on %s: %s\n", topic, error.c_str());
        return;
    }

    if (topicStr == _topicCommand && _commandCallback) {
        DeviceCommand cmd;
        cmd.action = doc["action"] | "";
        cmd.state  = doc["state"] | "";
        cmd.mode   = doc["mode"] | "";
        _commandCallback(cmd);
    } else if (topicStr == _topicConfig && _configCallback) {
        DeviceConfiguration cfg;
        cfg.hasLightThreshold = doc["lightThreshold"].is<uint16_t>();
        cfg.lightThreshold = doc["lightThreshold"] | 0;

        cfg.hasOffDelayMs = doc["offDelayMs"].is<unsigned long>();
        cfg.offDelayMs = doc["offDelayMs"] | 0;

        _configCallback(cfg);
    }
}
