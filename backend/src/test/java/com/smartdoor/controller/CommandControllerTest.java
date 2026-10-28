package com.smartdoor.controller;

import com.smartdoor.model.CommandRequest;
import com.smartdoor.service.MqttGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommandControllerTest {

    @Mock
    private MqttGatewayService mqttGatewayService;

    @InjectMocks
    private CommandController commandController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(commandController, "defaultDeviceId", "smartdoor-01");
    }

    @Test
    void testSetLightState_Success() {
        CommandRequest request = new CommandRequest("ON", null);

        ResponseEntity<Map<String, Object>> response = commandController.setLightState("smartdoor-01", request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("SUCCESS", response.getBody().get("status"));
        assertEquals("ON", response.getBody().get("state"));
        verify(mqttGatewayService, times(1)).publishLightCommand("smartdoor-01", "ON");
    }

    @Test
    void testSetLightState_MissingState() {
        CommandRequest request = new CommandRequest(null, null);

        ResponseEntity<Map<String, Object>> response = commandController.setLightState("smartdoor-01", request);

        assertEquals(400, response.getStatusCode().value());
        verifyNoInteractions(mqttGatewayService);
    }

    @Test
    void testSetLightingMode_Success() {
        CommandRequest request = new CommandRequest(null, "MANUAL");

        ResponseEntity<Map<String, Object>> response = commandController.setLightingMode("smartdoor-01", request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("SUCCESS", response.getBody().get("status"));
        assertEquals("MANUAL", response.getBody().get("mode"));
        verify(mqttGatewayService, times(1)).publishModeCommand("smartdoor-01", "MANUAL");
    }

    @Test
    void testSetDoorState_RejectedInFavorOfReedSwitch() {
        CommandRequest request = new CommandRequest("OPEN", null);

        ResponseEntity<Map<String, Object>> response = commandController.setDoorState("smartdoor-01", request);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("REJECTED", response.getBody().get("status"));
        verifyNoInteractions(mqttGatewayService);
    }
}
