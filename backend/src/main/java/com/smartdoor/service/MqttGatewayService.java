package com.smartdoor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartdoor.model.DoorEvent;
import com.smartdoor.model.TelemetryDto;
import com.smartdoor.repository.DoorEventRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

@Service
public class MqttGatewayService implements MqttCallbackExtended {

    private static final Logger log = LoggerFactory.getLogger(MqttGatewayService.class);

    @Value("${mqtt.broker-url:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${mqtt.client-id:smartdoor-backend}")
    private String clientId;

    @Value("${mqtt.topic-prefix:smartdoor/device/}")
    private String topicPrefix;

    @Value("${mqtt.default-device-id:smartdoor-01}")
    private String defaultDeviceId;

    @Value("${mqtt.username:}")
    private String mqttUsername;

    @Value("${mqtt.password:}")
    private String mqttPassword;

    private final DoorEventRepository eventRepository;
    private final ObjectMapper objectMapper;
    private final Map<String, TelemetryDto> latestTelemetryMap = new ConcurrentHashMap<>();
    private final Map<String, Boolean> deviceOnlineMap = new ConcurrentHashMap<>();

    private MqttAsyncClient mqttClient;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public MqttGatewayService(DoorEventRepository eventRepository, ObjectProvider<ObjectMapper> objectMapperProvider) {
        this.eventRepository = eventRepository;
        ObjectMapper mapper = objectMapperProvider.getIfAvailable();
        this.objectMapper = (mapper != null) ? mapper : new ObjectMapper().findAndRegisterModules();
    }

    @PostConstruct
    public void init() {
        connectToBroker();
    }

    @PreDestroy
    public void cleanup() {
        scheduler.shutdown();
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.disconnect();
                mqttClient.close();
            }
        } catch (MqttException e) {
            log.error("Error shutting down MQTT client", e);
        }
    }

    public boolean isConnected() {
        return mqttClient != null && mqttClient.isConnected();
    }

    private void connectToBroker() {
        try {
            mqttClient = new MqttAsyncClient(brokerUrl, clientId + "-" + UUID.randomUUID().toString().substring(0, 8), new MemoryPersistence());
            mqttClient.setCallback(this);

            MqttConnectOptions options = new MqttConnectOptions();
            options.setAutomaticReconnect(true);
            options.setCleanSession(true);
            options.setConnectionTimeout(5);
            options.setKeepAliveInterval(30);

            if (mqttUsername != null && !mqttUsername.isBlank()) {
                options.setUserName(mqttUsername);
            }
            if (mqttPassword != null && !mqttPassword.isBlank()) {
                options.setPassword(mqttPassword.toCharArray());
            }

            log.info("Connecting to MQTT Broker at {}...", brokerUrl);
            mqttClient.connect(options, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    log.info("Successfully connected to MQTT Broker at {}", brokerUrl);
                    subscribeToTopics();
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    log.warn("Failed to connect to MQTT Broker (will retry in background): {}", exception.getMessage());
                    scheduleReconnect();
                }
            });
        } catch (MqttException e) {
            log.warn("Failed to initialize MQTT Client: {}. Will retry.", e.getMessage());
            scheduleReconnect();
        }
    }

    private void scheduleReconnect() {
        scheduler.schedule(() -> {
            if (mqttClient == null || !mqttClient.isConnected()) {
                connectToBroker();
            }
        }, 10, TimeUnit.SECONDS);
    }

    private void subscribeToTopics() {
        try {
            String wildcardTopic = topicPrefix + "#";
            mqttClient.subscribe(wildcardTopic, 1, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    log.info("Subscribed to MQTT topics matching {}", wildcardTopic);
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    log.error("Failed to subscribe to MQTT topics: {}", exception.getMessage());
                }
            });
        } catch (MqttException e) {
            log.error("Error subscribing to topics", e);
        }
    }

    @Override
    public void connectComplete(boolean reconnect, String serverURI) {
        log.info("MQTT Connection complete (reconnect: {}). Server: {}", reconnect, serverURI);
        if (reconnect) {
            subscribeToTopics();
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT Connection lost: {}", cause != null ? cause.getMessage() : "unknown");
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload());
        log.debug("MQTT message received on [{}]: {}", topic, payload);

        try {
            if (topic.endsWith("/telemetry")) {
                handleTelemetryMessage(payload);
            } else if (topic.endsWith("/event")) {
                handleEventMessage(payload);
            } else if (topic.endsWith("/status")) {
                handleStatusMessage(payload);
            }
        } catch (Exception e) {
            log.error("Failed to process MQTT message from topic {}: {}", topic, e.getMessage());
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // no-op
    }

    private void handleTelemetryMessage(String jsonPayload) throws Exception {
        JsonNode node = objectMapper.readTree(jsonPayload);
        String deviceId = node.has("deviceId") ? node.get("deviceId").asText() : defaultDeviceId;

        TelemetryDto tel = new TelemetryDto();
        tel.setDeviceId(deviceId);
        tel.setUptimeSeconds(node.path("uptimeSeconds").asLong(0));
        tel.setDoorOpen(node.path("doorOpen").asBoolean(false));
        tel.setLightAdc(node.path("lightAdc").asInt(0));
        tel.setLightPercentage(node.path("lightPercentage").asDouble(0.0));
        tel.setLightThreshold(node.path("lightThreshold").asInt(1500));
        tel.setLightHysteresis(node.path("lightHysteresis").asInt(75));
        tel.setIsDark(node.path("isDark").asBoolean(false));
        tel.setLightOn(node.path("lightOn").asBoolean(false));
        tel.setMode(node.path("mode").asText("AUTO"));
        tel.setTimerActive(node.path("timerActive").asBoolean(false));
        tel.setRemainingDelayMs(node.path("remainingDelayMs").asLong(0));
        tel.setOffDelayMs(node.path("offDelayMs").asLong(15000));
        tel.setWifiConnected(node.path("wifiConnected").asBoolean(true));
        tel.setMqttConnected(true);
        tel.setWifiRssi(node.path("wifiRssi").asInt(-60));
        tel.setTimestamp(Instant.now());
        tel.setConnectionState("CONNECTED");
        tel.setLastHardwareUpdateTimestamp(System.currentTimeMillis());

        latestTelemetryMap.put(deviceId, tel);
        deviceOnlineMap.put(deviceId, true);
    }

    private void handleEventMessage(String jsonPayload) throws Exception {
        JsonNode node = objectMapper.readTree(jsonPayload);
        String deviceId = node.has("deviceId") ? node.get("deviceId").asText() : defaultDeviceId;
        String eventType = node.path("eventType").asText("UNKNOWN");

        DoorEvent event = new DoorEvent(UUID.randomUUID().toString(), deviceId, eventType);
        event.setCreatedAt(Instant.now());
        event.setDetailsJson(jsonPayload);

        JsonNode details = node.path("details");
        if (!details.isMissingNode()) {
            if (details.has("doorOpen")) event.setDoorOpen(details.get("doorOpen").asBoolean());
            if (details.has("lightOn")) event.setLightOn(details.get("lightOn").asBoolean());
            if (details.has("lightPercentage")) event.setLightPercentage(details.get("lightPercentage").asDouble());
            if (details.has("lightAdc")) event.setLightAdc(details.get("lightAdc").asInt());
            if (details.has("isDark")) event.setIsDark(details.get("isDark").asBoolean());
            if (details.has("remainingDelayMs")) event.setRemainingDelayMs(details.get("remainingDelayMs").asLong());
            if (details.has("offDelayMs")) event.setOffDelayMs(details.get("offDelayMs").asLong());
            if (details.has("mode")) event.setMode(details.get("mode").asText());
            if (details.has("description")) event.setDescription(details.get("description").asText());
        }

        eventRepository.save(event);
        log.info("Persisted genuine hardware door event {} for device {}", eventType, deviceId);
    }

    private void handleStatusMessage(String jsonPayload) throws Exception {
        JsonNode node = objectMapper.readTree(jsonPayload);
        String deviceId = node.has("deviceId") ? node.get("deviceId").asText() : defaultDeviceId;
        String status = node.path("status").asText("unknown");

        boolean isOnline = "online".equalsIgnoreCase(status);
        deviceOnlineMap.put(deviceId, isOnline);

        TelemetryDto tel = latestTelemetryMap.get(deviceId);
        if (tel != null) {
            tel.setMqttConnected(isOnline);
            tel.setConnectionState(isOnline ? "CONNECTED" : "DISCONNECTED");
            tel.setTimestamp(Instant.now());
        }
    }

    public TelemetryDto getLatestTelemetry(String deviceId) {
        TelemetryDto dto = latestTelemetryMap.get(deviceId);
        
        // If no packet was ever received from physical hardware, NEVER invent fake readings!
        if (dto == null) {
            TelemetryDto disconnectedDto = new TelemetryDto();
            disconnectedDto.setDeviceId(deviceId);
            disconnectedDto.setConnectionState("DISCONNECTED");
            disconnectedDto.setWifiConnected(false);
            disconnectedDto.setMqttConnected(false);
            disconnectedDto.setLastHardwareUpdateTimestamp(null);
            // All sensor fields (doorOpen, lightAdc, lightOn, etc.) remain null!
            return disconnectedDto;
        }

        // Determine if hardware has gone stale / disconnected (>15s without heartbeat)
        Long lastSeen = dto.getLastHardwareUpdateTimestamp();
        boolean isLwtOnline = deviceOnlineMap.getOrDefault(deviceId, false);
        long now = System.currentTimeMillis();

        if (!isLwtOnline || lastSeen == null || (now - lastSeen > 15000)) {
            dto.setConnectionState("DISCONNECTED");
            dto.setMqttConnected(false);
        } else {
            dto.setConnectionState("CONNECTED");
            dto.setMqttConnected(true);
        }

        return dto;
    }

    public void publishDoorCommand(String deviceId, String state) {
        if (mqttClient == null || !mqttClient.isConnected()) {
            throw new IllegalStateException("Cannot execute command: MQTT broker connection is offline.");
        }
        if (!"CONNECTED".equals(getLatestTelemetry(deviceId).getConnectionState())) {
            throw new IllegalStateException("Device disconnected — waiting for hardware connection.");
        }

        String topic = topicPrefix + deviceId + "/command";
        try {
            String payload = String.format("{\"action\":\"SET_DOOR\",\"state\":\"%s\"}", state.toUpperCase());
            publish(topic, payload);
            log.info("Published door command to [{}]: {}", topic, payload);
        } catch (Exception e) {
            log.error("Failed to publish door command", e);
            throw new RuntimeException("Failed to send door command: " + e.getMessage());
        }
    }

    public void publishLightCommand(String deviceId, String state) {
        if (mqttClient == null || !mqttClient.isConnected()) {
            throw new IllegalStateException("Cannot execute command: MQTT broker connection is offline.");
        }
        if (!"CONNECTED".equals(getLatestTelemetry(deviceId).getConnectionState())) {
            throw new IllegalStateException("Device disconnected — waiting for hardware connection.");
        }

        String topic = topicPrefix + deviceId + "/command";
        try {
            String payload = String.format("{\"action\":\"SET_LIGHT\",\"state\":\"%s\"}", state);
            publish(topic, payload);
            log.info("Published light command to [{}]: {}", topic, payload);
        } catch (Exception e) {
            log.error("Failed to publish light command", e);
            throw new RuntimeException("Failed to send light command: " + e.getMessage());
        }
    }

    public void publishModeCommand(String deviceId, String mode) {
        if (mqttClient == null || !mqttClient.isConnected()) {
            throw new IllegalStateException("Cannot execute command: MQTT broker connection is offline.");
        }
        if (!"CONNECTED".equals(getLatestTelemetry(deviceId).getConnectionState())) {
            throw new IllegalStateException("Device disconnected — waiting for hardware connection.");
        }

        String topic = topicPrefix + deviceId + "/command";
        try {
            String payload = String.format("{\"action\":\"SET_MODE\",\"mode\":\"%s\"}", mode);
            publish(topic, payload);
            log.info("Published mode command to [{}]: {}", topic, payload);
        } catch (Exception e) {
            log.error("Failed to publish mode command", e);
            throw new RuntimeException("Failed to send mode command: " + e.getMessage());
        }
    }

    public void publishConfigUpdate(String deviceId, Integer lightThreshold, Long offDelayMs) {
        if (mqttClient == null || !mqttClient.isConnected()) {
            log.warn("Config saved in DB but MQTT broker is offline. Hardware will sync upon reconnect.");
            return;
        }

        String topic = topicPrefix + deviceId + "/config";
        try {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            if (lightThreshold != null) {
                sb.append("\"lightThreshold\":").append(lightThreshold);
                first = false;
            }
            if (offDelayMs != null) {
                if (!first) sb.append(",");
                sb.append("\"offDelayMs\":").append(offDelayMs);
            }
            sb.append("}");

            String payload = sb.toString();
            publish(topic, payload);
            log.info("Published configuration update to [{}]: {}", topic, payload);
        } catch (Exception e) {
            log.error("Failed to publish config update", e);
        }
    }

    private void publish(String topic, String payload) throws MqttException {
        if (mqttClient != null && mqttClient.isConnected()) {
            MqttMessage msg = new MqttMessage(payload.getBytes());
            msg.setQos(1);
            mqttClient.publish(topic, msg);
        } else {
            throw new MqttException(MqttException.REASON_CODE_CLIENT_NOT_CONNECTED);
        }
    }
}
