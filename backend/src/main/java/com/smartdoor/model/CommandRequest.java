package com.smartdoor.model;

import jakarta.validation.constraints.Pattern;

public class CommandRequest {

    @Pattern(regexp = "ON|OFF|OPEN|CLOSED", message = "State must be 'ON', 'OFF', 'OPEN', or 'CLOSED'")
    private String state;

    @Pattern(regexp = "AUTO|MANUAL", message = "Mode must be 'AUTO' or 'MANUAL'")
    private String mode;

    public CommandRequest() {}

    public CommandRequest(String state, String mode) {
        this.state = state;
        this.mode = mode;
    }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
