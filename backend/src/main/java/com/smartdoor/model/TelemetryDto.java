package com.smartdoor.model;

import java.time.Instant;

public class TelemetryDto {
    private String deviceId;
    private Long uptimeSeconds;
    private Boolean doorOpen;
    private Integer lightAdc;
    private Double lightPercentage;
    private Integer lightThreshold;
    private Integer lightHysteresis;
    private Boolean isDark;
    private Boolean lightOn;
    private String mode;
    private Boolean timerActive;
    private Long remainingDelayMs;
    private Long offDelayMs;
    private Boolean wifiConnected;
    private Boolean mqttConnected;
    private Integer wifiRssi;
    private Instant timestamp;
    private String connectionState; // "CONNECTED", "DISCONNECTED", "UNKNOWN"
    private Long lastHardwareUpdateTimestamp;

    public TelemetryDto() {
        this.timestamp = Instant.now();
        this.connectionState = "UNKNOWN";
    }

    // Getters and Setters
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Long getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(Long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }

    public Boolean getDoorOpen() { return doorOpen; }
    public void setDoorOpen(Boolean doorOpen) { this.doorOpen = doorOpen; }

    public Integer getLightAdc() { return lightAdc; }
    public void setLightAdc(Integer lightAdc) { this.lightAdc = lightAdc; }

    public Double getLightPercentage() { return lightPercentage; }
    public void setLightPercentage(Double lightPercentage) { this.lightPercentage = lightPercentage; }

    public Integer getLightThreshold() { return lightThreshold; }
    public void setLightThreshold(Integer lightThreshold) { this.lightThreshold = lightThreshold; }

    public Integer getLightHysteresis() { return lightHysteresis; }
    public void setLightHysteresis(Integer lightHysteresis) { this.lightHysteresis = lightHysteresis; }

    public Boolean getIsDark() { return isDark; }
    public void setIsDark(Boolean dark) { isDark = dark; }

    public Boolean getLightOn() { return lightOn; }
    public void setLightOn(Boolean lightOn) { this.lightOn = lightOn; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public Boolean getTimerActive() { return timerActive; }
    public void setTimerActive(Boolean timerActive) { this.timerActive = timerActive; }

    public Long getRemainingDelayMs() { return remainingDelayMs; }
    public void setRemainingDelayMs(Long remainingDelayMs) { this.remainingDelayMs = remainingDelayMs; }

    public Long getOffDelayMs() { return offDelayMs; }
    public void setOffDelayMs(Long offDelayMs) { this.offDelayMs = offDelayMs; }

    public Boolean getWifiConnected() { return wifiConnected; }
    public void setWifiConnected(Boolean wifiConnected) { this.wifiConnected = wifiConnected; }

    public Boolean getMqttConnected() { return mqttConnected; }
    public void setMqttConnected(Boolean mqttConnected) { this.mqttConnected = mqttConnected; }

    public Integer getWifiRssi() { return wifiRssi; }
    public void setWifiRssi(Integer wifiRssi) { this.wifiRssi = wifiRssi; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getConnectionState() { return connectionState; }
    public void setConnectionState(String connectionState) { this.connectionState = connectionState; }

    public Long getLastHardwareUpdateTimestamp() { return lastHardwareUpdateTimestamp; }
    public void setLastHardwareUpdateTimestamp(Long lastHardwareUpdateTimestamp) { this.lastHardwareUpdateTimestamp = lastHardwareUpdateTimestamp; }
}
