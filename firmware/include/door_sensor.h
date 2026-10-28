#pragma once

#ifndef DOOR_SENSOR_H
#define DOOR_SENSOR_H

#include <Arduino.h>
#include <functional>

/**
 * DoorButtonSensor
 * Reads physical tactile push button on ESP32 with software debouncing.
 * Each valid button press (active LOW) toggles the simulated door state
 * between OPEN and CLOSED.
 */
class DoorSensor {
public:
    using StateChangeCallback = std::function<void(bool isOpen)>;

    explicit DoorSensor(uint8_t buttonPin, unsigned long debounceDelayMs = 50);

    void begin();
    void update();

    bool isOpen() const;
    bool isClosed() const;
    void setDoorState(bool open); // Programmatic override if needed
    unsigned long getLastChangeTime() const;
    void setOnStateChange(StateChangeCallback callback);

private:
    uint8_t _pin;
    unsigned long _debounceDelayMs;
    
    bool _simulatedDoorOpen;     // true = OPEN, false = CLOSED (initial: false/CLOSED)
    bool _debouncedButtonState;  // true = HIGH (unpressed), false = LOW (pressed)
    bool _lastRawReading;
    unsigned long _lastDebounceTime;
    unsigned long _lastStateChangeTime;
    
    StateChangeCallback _callback;
};

#endif // DOOR_SENSOR_H
