package com.smartdoor.controller;

import com.smartdoor.model.TelemetryDto;
import com.smartdoor.service.MqttGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/telemetry")
@Tag(name = "Telemetry", description = "Live IoT Telemetry, Sensor States, and Connectivity")
public class TelemetryController {

    private final MqttGatewayService mqttGatewayService;

    @Value("${mqtt.default-device-id:smartdoor-01}")
    private String defaultDeviceId;

    public TelemetryController(MqttGatewayService mqttGatewayService) {
        this.mqttGatewayService = mqttGatewayService;
    }

    @GetMapping
    @Operation(summary = "Get latest telemetry", description = "Retrieves live door status, illuminance, lighting state, and network metrics.")
    public ResponseEntity<TelemetryDto> getTelemetry(@RequestParam(required = false) String deviceId) {
        String targetId = (deviceId != null && !deviceId.isBlank()) ? deviceId : defaultDeviceId;
        TelemetryDto dto = mqttGatewayService.getLatestTelemetry(targetId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Live SSE telemetry stream", description = "Real-time Server-Sent Events stream for instantaneous UI updates when hardware states change.")
    public SseEmitter streamTelemetry() {
        return mqttGatewayService.subscribeTelemetryStream();
    }
}
