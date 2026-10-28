package com.smartdoor.controller;

import com.smartdoor.service.MqttGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Service Health and Connectivity Check")
public class HealthController {

    private final MqttGatewayService mqttGatewayService;

    public HealthController(MqttGatewayService mqttGatewayService) {
        this.mqttGatewayService = mqttGatewayService;
    }

    @GetMapping
    @Operation(summary = "Health status", description = "Returns service health and MQTT broker connection status.")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "smartdoor-backend");
        health.put("mqttStatus", mqttGatewayService.isConnected() ? "CONNECTED" : "DISCONNECTED");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}
