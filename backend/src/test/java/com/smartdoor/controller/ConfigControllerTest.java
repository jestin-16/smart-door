package com.smartdoor.controller;

import com.smartdoor.model.ConfigUpdateRequest;
import com.smartdoor.model.DeviceConfig;
import com.smartdoor.repository.DeviceConfigRepository;
import com.smartdoor.service.MqttGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ConfigControllerTest {

    @Mock
    private DeviceConfigRepository configRepository;

    @Mock
    private MqttGatewayService mqttGatewayService;

    @InjectMocks
    private ConfigController configController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(configController, "defaultDeviceId", "smartdoor-01");
    }

    @Test
    void testGetConfig_ExistingDevice() {
        DeviceConfig existing = new DeviceConfig("smartdoor-01", 1600, 20000L, true);
        when(configRepository.findById("smartdoor-01")).thenReturn(Optional.of(existing));

        ResponseEntity<DeviceConfig> response = configController.getConfig("smartdoor-01");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1600, response.getBody().getLightThreshold());
        assertEquals(20000L, response.getBody().getOffDelayMs());
    }

    @Test
    void testUpdateConfig_UpdatesDbAndMqtt() {
        DeviceConfig existing = new DeviceConfig("smartdoor-01", 1500, 15000L, true);
        when(configRepository.findById("smartdoor-01")).thenReturn(Optional.of(existing));
        when(configRepository.save(any(DeviceConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConfigUpdateRequest request = new ConfigUpdateRequest(1800, 12000L, false);

        ResponseEntity<DeviceConfig> response = configController.updateConfig("smartdoor-01", request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1800, response.getBody().getLightThreshold());
        assertEquals(12000L, response.getBody().getOffDelayMs());
        assertFalse(response.getBody().getAutoMode());

        verify(configRepository, times(1)).save(any(DeviceConfig.class));
        verify(mqttGatewayService, times(1)).publishConfigUpdate("smartdoor-01", 1800, 12000L);
    }
}
