package com.smartdoor.controller;

import com.smartdoor.model.ConfigUpdateRequest;
import com.smartdoor.model.DeviceConfig;
import com.smartdoor.repository.DeviceConfigRepository;
import com.smartdoor.service.MqttGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/config")
@Tag(name = "Configuration", description = "Device Threshold and Timer Parameter Tuning")
public class ConfigController {

    private final DeviceConfigRepository configRepository;
    private final MqttGatewayService mqttGatewayService;

    @Value("${mqtt.default-device-id:smartdoor-01}")
    private String defaultDeviceId;

    public ConfigController(DeviceConfigRepository configRepository, MqttGatewayService mqttGatewayService) {
        this.configRepository = configRepository;
        this.mqttGatewayService = mqttGatewayService;
    }

    @GetMapping
    @Operation(summary = "Get device configuration", description = "Retrieves active darkness threshold and off-delay timer settings.")
    public ResponseEntity<DeviceConfig> getConfig(@RequestParam(required = false) String deviceId) {
        String targetId = (deviceId != null && !deviceId.isBlank()) ? deviceId : defaultDeviceId;

        DeviceConfig config = configRepository.findById(targetId)
                .orElseGet(() -> {
                    DeviceConfig newConfig = new DeviceConfig(targetId, 1500, 15000L, true);
                    return configRepository.save(newConfig);
                });

        return ResponseEntity.ok(config);
    }

    @PutMapping
    @Operation(summary = "Update device configuration", description = "Persists updated parameters in PostgreSQL and dispatches MQTT config topic.")
    public ResponseEntity<DeviceConfig> updateConfig(
            @RequestParam(required = false) String deviceId,
            @Valid @RequestBody ConfigUpdateRequest request) {

        String targetId = (deviceId != null && !deviceId.isBlank()) ? deviceId : defaultDeviceId;

        DeviceConfig config = configRepository.findById(targetId)
                .orElseGet(() -> new DeviceConfig(targetId, 1500, 15000L, true));

        if (request.getLightThreshold() != null) {
            config.setLightThreshold(request.getLightThreshold());
        }
        if (request.getOffDelayMs() != null) {
            config.setOffDelayMs(request.getOffDelayMs());
        }
        if (request.getAutoMode() != null) {
            config.setAutoMode(request.getAutoMode());
        }

        DeviceConfig saved = configRepository.save(config);

        // Dispatch configuration update over MQTT
        mqttGatewayService.publishConfigUpdate(targetId, saved.getLightThreshold(), saved.getOffDelayMs());

        return ResponseEntity.ok(saved);
    }
}
