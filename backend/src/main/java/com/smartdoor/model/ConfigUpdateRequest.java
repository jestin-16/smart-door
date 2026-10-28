package com.smartdoor.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class ConfigUpdateRequest {

    @Min(value = 0, message = "Light threshold must be >= 0")
    @Max(value = 4095, message = "Light threshold must be <= 4095")
    private Integer lightThreshold;

    @Min(value = 1000, message = "Off delay must be >= 1000 ms")
    @Max(value = 300000, message = "Off delay must be <= 300000 ms")
    private Long offDelayMs;

    private Boolean autoMode;

    public ConfigUpdateRequest() {}

    public ConfigUpdateRequest(Integer lightThreshold, Long offDelayMs, Boolean autoMode) {
        this.lightThreshold = lightThreshold;
        this.offDelayMs = offDelayMs;
        this.autoMode = autoMode;
    }

    public Integer getLightThreshold() { return lightThreshold; }
    public void setLightThreshold(Integer lightThreshold) { this.lightThreshold = lightThreshold; }

    public Long getOffDelayMs() { return offDelayMs; }
    public void setOffDelayMs(Long offDelayMs) { this.offDelayMs = offDelayMs; }

    public Boolean getAutoMode() { return autoMode; }
    public void setAutoMode(Boolean autoMode) { this.autoMode = autoMode; }
}
