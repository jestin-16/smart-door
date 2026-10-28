package com.smartdoor.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "device_configurations")
public class DeviceConfig {

    @Id
    @Column(length = 64)
    private String deviceId;

    @Column(nullable = false)
    private Integer lightThreshold = 1500;

    @Column(nullable = false)
    private Long offDelayMs = 15000L;

    @Column(nullable = false)
    private Boolean autoMode = true;

    private Instant createdAt;
    private Instant updatedAt;

    public DeviceConfig() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public DeviceConfig(String deviceId, Integer lightThreshold, Long offDelayMs, Boolean autoMode) {
        this.deviceId = deviceId;
        this.lightThreshold = lightThreshold;
        this.offDelayMs = offDelayMs;
        this.autoMode = autoMode;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Integer getLightThreshold() { return lightThreshold; }
    public void setLightThreshold(Integer lightThreshold) { this.lightThreshold = lightThreshold; }

    public Long getOffDelayMs() { return offDelayMs; }
    public void setOffDelayMs(Long offDelayMs) { this.offDelayMs = offDelayMs; }

    public Boolean getAutoMode() { return autoMode; }
    public void setAutoMode(Boolean autoMode) { this.autoMode = autoMode; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
