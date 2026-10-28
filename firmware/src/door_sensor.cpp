#include "door_sensor.h"

DoorSensor::DoorSensor(uint8_t buttonPin, unsigned long debounceDelayMs)
    : _pin(buttonPin),
      _debounceDelayMs(debounceDelayMs),
      _simulatedDoorOpen(false),       // Initial door state: CLOSED
      _debouncedButtonState(true),     // Unpressed (HIGH with pull-up)
      _lastRawReading(true),
      _lastDebounceTime(0),
      _lastStateChangeTime(0),
      _callback(nullptr) {}

void DoorSensor::begin() {
    pinMode(_pin, INPUT_PULLUP);
    
    // Initial read
    bool raw = (digitalRead(_pin) == HIGH);
    _lastRawReading = raw;
    _debouncedButtonState = raw;
    _lastDebounceTime = millis();
    _lastStateChangeTime = millis();
}

void DoorSensor::update() {
    // Active LOW button with INPUT_PULLUP: HIGH = unpressed, LOW = pressed
    bool rawReading = (digitalRead(_pin) == HIGH);

    if (rawReading != _lastRawReading) {
        _lastDebounceTime = millis();
    }

    if ((millis() - _lastDebounceTime) > _debounceDelayMs) {
        if (rawReading != _debouncedButtonState) {
            _debouncedButtonState = rawReading;

            // Detect transition to pressed (falling edge: HIGH -> LOW)
            if (_debouncedButtonState == false) {
                // Toggle the simulated door state between OPEN and CLOSED
                _simulatedDoorOpen = !_simulatedDoorOpen;
                _lastStateChangeTime = millis();

                Serial.printf("[BUTTON] Valid press detected! Door toggled to: %s\n",
                              _simulatedDoorOpen ? "OPEN" : "CLOSED");

                if (_callback) {
                    _callback(_simulatedDoorOpen);
                }
            }
        }
    }

    _lastRawReading = rawReading;
}

bool DoorSensor::isOpen() const {
    return _simulatedDoorOpen;
}

bool DoorSensor::isClosed() const {
    return !_simulatedDoorOpen;
}

void DoorSensor::setDoorState(bool open) {
    if (_simulatedDoorOpen != open) {
        _simulatedDoorOpen = open;
        _lastStateChangeTime = millis();
        if (_callback) {
            _callback(_simulatedDoorOpen);
        }
    }
}

unsigned long DoorSensor::getLastChangeTime() const {
    return _lastStateChangeTime;
}

void DoorSensor::setOnStateChange(StateChangeCallback callback) {
    _callback = callback;
}
