package com.smartdoor.controller;

import com.smartdoor.service.MqttGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class HealthControllerTest {

    @Mock
    private MqttGatewayService mqttGatewayService;

    @InjectMocks
    private HealthController healthController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetHealth_WhenMqttConnected() {
        when(mqttGatewayService.isConnected()).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("smartdoor-backend", response.getBody().get("service"));
        assertEquals("CONNECTED", response.getBody().get("mqttStatus"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void testGetHealth_WhenMqttDisconnected() {
        when(mqttGatewayService.isConnected()).thenReturn(false);

        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("DISCONNECTED", response.getBody().get("mqttStatus"));
    }
}
