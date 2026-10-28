#pragma once

#ifndef LIGHTING_CONTROLLER_H
#define LIGHTING_CONTROLLER_H

#include <Arduino.h>
#include <functional>

enum class LightingMode {
    AUTO,
    MANUAL
};

enum class LightEvent {
    LIGHT_TURNED_ON,
    LIGHT_TURNED_OFF,
    TIMER_STARTED,
    TIMER_CANCELLED,
    TIMER_EXPIRED,
    MODE_CHANGED
};

class LightingController {
public:
    using LightEventCallback = std::function<void(LightEvent event, bool lightState)>;

    explicit LightingController(uint8_t lightPin, uint8_t statusLedPin, unsigned long offDelayMs = 15000);

    void begin();
    
    // Non-blocking update called every iteration of loop()
    void update(bool isDoorOpen, bool isDark);

    // Mode and manual overrides
    void setMode(LightingMode mode);
    LightingMode getMode() const;
    void setManualState(bool state);
    
    // Configuration
    void setOffDelay(unsigned long delayMs);
    unsigned long getOffDelay() const;

    // Status queries
    bool isLightOn() const;
    bool isTimerActive() const;
    unsigned long getRemainingDelayMs() const;

    // Event listener
    void setOnEvent(LightEventCallback callback);

private:
    uint8_t _lightPin;
    uint8_t _statusLedPin;
    unsigned long _offDelayMs;
    
    LightingMode _mode;
    bool _lightState;
    bool _manualTargetState;
    
    bool _timerActive;
    unsigned long _timerStartTime;
    bool _prevDoorOpen;

    LightEventCallback _eventCallback;

    void setPhysicalOutputs(bool on);
    void notifyEvent(LightEvent event);
};

#endif // LIGHTING_CONTROLLER_H
