package com.smartdoor.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "door_events", indexes = {
    @Index(name = "idx_door_events_device_time", columnList = "deviceId, createdAt"),
    @Index(name = "idx_door_events_type", columnList = "eventType")
})
public class DoorEvent {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 64)
    private String deviceId;

    @Column(nullable = false, length = 64)
    private String eventType;

    private Boolean doorOpen;
    private Boolean reedSwitchClosed;
    private Boolean magnetDetected;
    private Boolean lightOn;
    private Double lightPercentage;
    private Integer lightAdc;
    private Boolean isDark;
    private Long remainingDelayMs;
    private Long offDelayMs;

    @Column(length = 16)
    private String mode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String detailsJson;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public DoorEvent() {
        this.createdAt = Instant.now();
    }

    public DoorEvent(String id, String deviceId, String eventType) {
        this.id = id;
        this.deviceId = deviceId;
        this.eventType = eventType;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Boolean getDoorOpen() { return doorOpen; }
    public void setDoorOpen(Boolean doorOpen) { this.doorOpen = doorOpen; }

    public Boolean getReedSwitchClosed() { return reedSwitchClosed; }
    public void setReedSwitchClosed(Boolean reedSwitchClosed) { this.reedSwitchClosed = reedSwitchClosed; }

    public Boolean getMagnetDetected() { return magnetDetected; }
    public void setMagnetDetected(Boolean magnetDetected) { this.magnetDetected = magnetDetected; }

    public Boolean getLightOn() { return lightOn; }
    public void setLightOn(Boolean lightOn) { this.lightOn = lightOn; }

    public Double getLightPercentage() { return lightPercentage; }
    public void setLightPercentage(Double lightPercentage) { this.lightPercentage = lightPercentage; }

    public Integer getLightAdc() { return lightAdc; }
    public void setLightAdc(Integer lightAdc) { this.lightAdc = lightAdc; }

    public Boolean getIsDark() { return isDark; }
    public void setIsDark(Boolean dark) { isDark = dark; }

    public Long getRemainingDelayMs() { return remainingDelayMs; }
    public void setRemainingDelayMs(Long remainingDelayMs) { this.remainingDelayMs = remainingDelayMs; }

    public Long getOffDelayMs() { return offDelayMs; }
    public void setOffDelayMs(Long offDelayMs) { this.offDelayMs = offDelayMs; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) { this.detailsJson = detailsJson; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
