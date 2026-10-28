package com.smartdoor.controller;

import com.smartdoor.model.CommandRequest;
import com.smartdoor.service.MqttGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/commands")
@Tag(name = "Commands", description = "Remote Light and Operational Mode Control Over MQTT")
public class CommandController {

    private final MqttGatewayService mqttGatewayService;

    @Value("${mqtt.default-device-id:smartdoor-01}")
    private String defaultDeviceId;

    public CommandController(MqttGatewayService mqttGatewayService) {
        this.mqttGatewayService = mqttGatewayService;
    }

    @PostMapping("/door")
    @Operation(summary = "Set logical door state (Disabled)", description = "Door state is governed exclusively by the physical magnetic reed switch on GPIO 27. Remote command overrides are rejected.")
    public ResponseEntity<Map<String, Object>> setDoorState(
            @RequestParam(required = false) String deviceId,
            @Valid @RequestBody CommandRequest request) {

        return ResponseEntity.badRequest().body(Map.of(
                "status", "REJECTED",
                "error", "Door state simulation is disabled. Physical magnetic reed switch on GPIO 27 is the active hardware sensor."
        ));
    }

    @PostMapping("/light")
    @Operation(summary = "Set light state", description = "Commands the light output ON or OFF via MQTT.")
    public ResponseEntity<Map<String, Object>> setLightState(
            @RequestParam(required = false) String deviceId,
            @Valid @RequestBody CommandRequest request) {

        if (request.getState() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "State must be provided (ON or OFF)"));
        }

        String targetId = (deviceId != null && !deviceId.isBlank()) ? deviceId : defaultDeviceId;
        mqttGatewayService.publishLightCommand(targetId, request.getState());

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "deviceId", targetId,
                "command", "SET_LIGHT",
                "state", request.getState()
        ));
    }

    @PostMapping("/mode")
    @Operation(summary = "Set lighting mode", description = "Switches between AUTO and MANUAL lighting modes.")
    public ResponseEntity<Map<String, Object>> setLightingMode(
            @RequestParam(required = false) String deviceId,
            @Valid @RequestBody CommandRequest request) {

        if (request.getMode() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mode must be provided (AUTO or MANUAL)"));
        }

        String targetId = (deviceId != null && !deviceId.isBlank()) ? deviceId : defaultDeviceId;
        mqttGatewayService.publishModeCommand(targetId, request.getMode());

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "deviceId", targetId,
                "command", "SET_MODE",
                "mode", request.getMode()
        ));
    }
}
