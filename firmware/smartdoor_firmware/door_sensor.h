#pragma once

#ifndef DOOR_SENSOR_H
#define DOOR_SENSOR_H

#include <Arduino.h>
#include <functional>

/**
 * Logical Door State representation
 */
enum class DoorState {
    UNKNOWN,
    OPEN,
    CLOSED
};

/**
 * DoorSensor
 * Interfaces with a physical magnetic reed switch on ESP32 using INPUT_PULLUP.
 * 
 * Hardware Wiring:
 * - Terminal 1 -> ESP32 GPIO (default: GPIO 27)
 * - Terminal 2 -> ESP32 GND
 * - No external pull-up resistor required (internal 45k pull-up utilized).
 * 
 * Verified Physical Output on Serial Monitor:
 * - Magnet detected  => Switch contacts closed => GPIO reads LOW
 * - Magnet absent    => Switch contacts open   => GPIO reads HIGH
 * 
 * Mounting Mapping:
 * - Standard (default): Switch on frame, magnet on moving door.
 *   Magnet Detected (Contacts Closed, LOW) => Door CLOSED
 *   Magnet Absent   (Contacts Open, HIGH)  => Door OPEN
 * - Inverted/Reverse: Configurable via setMagnetDetectsClosed(false).
 * 
 * Debouncing & Event Generation:
 * - 50ms software debounce window prevents contact bounce glitches.
 * - Events are generated strictly on debounced state transitions.
 * - Repeated door events while state remains steady are prevented.
 */
class DoorSensor {
public:
    using StateChangeCallback = std::function<void(bool isOpen)>;

    explicit DoorSensor(uint8_t pin, unsigned long debounceDelayMs = 50, bool magnetDetectsClosed = true);

    void begin();
    void update();

    // High-level logical door status
    bool isOpen() const;
    bool isClosed() const;
    DoorState getDoorState() const;
    bool isStateEstablished() const;

    // Physical reed switch contact and magnet proximity status
    bool isReedClosed() const;      // true if physical contacts are closed (GPIO LOW)
    bool isMagnetDetected() const;  // true if magnet is activating contacts (GPIO LOW)

    // Configuration & Callbacks
    unsigned long getLastChangeTime() const;
    void setOnStateChange(StateChangeCallback callback);
    void setMagnetDetectsClosed(bool magnetDetectsClosed);
    bool getMagnetDetectsClosed() const;

private:
    uint8_t _pin;
    unsigned long _debounceDelayMs;
    bool _magnetDetectsClosed;

    DoorState _doorState;
    bool _debouncedRawPinState;     // HIGH (true) or LOW (false)
    bool _lastRawReading;
    unsigned long _lastDebounceTime;
    unsigned long _lastStateChangeTime;
    bool _stateEstablished;

    StateChangeCallback _callback;

    DoorState resolveDoorState(bool rawPinHigh) const;
};

#endif // DOOR_SENSOR_H
