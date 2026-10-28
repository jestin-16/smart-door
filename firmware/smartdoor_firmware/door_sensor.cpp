#include "door_sensor.h"

DoorSensor::DoorSensor(uint8_t pin, unsigned long debounceDelayMs, bool magnetDetectsClosed)
    : _pin(pin),
      _debounceDelayMs(debounceDelayMs),
      _magnetDetectsClosed(magnetDetectsClosed),
      _doorState(DoorState::UNKNOWN),
      _debouncedRawPinState(true), // Default unpressed/open (HIGH with pull-up)
      _lastRawReading(true),
      _lastDebounceTime(0),
      _lastStateChangeTime(0),
      _stateEstablished(false),
      _callback(nullptr) {}

void DoorSensor::begin() {
    pinMode(_pin, INPUT_PULLUP);

    // Initial hardware read to establish baseline state immediately
    bool initialRaw = (digitalRead(_pin) == HIGH);
    _lastRawReading = initialRaw;
    _debouncedRawPinState = initialRaw;
    _doorState = resolveDoorState(initialRaw);
    _stateEstablished = true;
    _lastDebounceTime = millis();
    _lastStateChangeTime = millis();

    bool switchClosed = !initialRaw; // LOW = closed
    Serial.printf("[REED SENSOR] Initialized on GPIO %d (INPUT_PULLUP).\n", _pin);
    Serial.printf("[REED SENSOR] Status: %s - %s (GPIO %s) -> Door %s\n",
                  switchClosed ? "MAGNET DETECTED" : "MAGNET NOT DETECTED",
                  switchClosed ? "SWITCH CLOSED" : "SWITCH OPEN",
                  initialRaw ? "HIGH" : "LOW",
                  isOpen() ? "OPEN" : "CLOSED");
}

void DoorSensor::update() {
    // Read raw digital input (HIGH = contacts open/magnet absent, LOW = contacts closed/magnet proximate)
    bool rawReading = (digitalRead(_pin) == HIGH);

    if (rawReading != _lastRawReading) {
        _lastDebounceTime = millis();
        _lastRawReading = rawReading;
    }

    if ((millis() - _lastDebounceTime) >= _debounceDelayMs) {
        if (rawReading != _debouncedRawPinState || !_stateEstablished) {
            _debouncedRawPinState = rawReading;
            _stateEstablished = true;

            DoorState newDoorState = resolveDoorState(_debouncedRawPinState);
            bool switchClosed = !_debouncedRawPinState;

            // Verified Serial Monitor output logging
            Serial.printf("[REED SENSOR] %s - %s (GPIO %s)\n",
                          switchClosed ? "MAGNET DETECTED" : "MAGNET NOT DETECTED",
                          switchClosed ? "SWITCH CLOSED" : "SWITCH OPEN",
                          _debouncedRawPinState ? "HIGH" : "LOW");

            // Event generation only when the debounced logical door state changes
            if (newDoorState != _doorState) {
                _doorState = newDoorState;
                _lastStateChangeTime = millis();

                Serial.printf("[DOOR EVENT] Physical Door transitioned to: %s\n",
                              isOpen() ? "OPEN" : "CLOSED");

                if (_callback) {
                    _callback(isOpen());
                }
            }
        }
    }
}

DoorState DoorSensor::resolveDoorState(bool rawPinHigh) const {
    // rawPinHigh = true (HIGH) means reed contacts open, magnet absent
    // rawPinHigh = false (LOW) means reed contacts closed, magnet detected
    bool magnetDetected = !rawPinHigh;

    if (_magnetDetectsClosed) {
        // Standard mounting: Magnet close to switch when door is closed
        return magnetDetected ? DoorState::CLOSED : DoorState::OPEN;
    } else {
        // Inverted mounting: Magnet close to switch when door is open
        return magnetDetected ? DoorState::OPEN : DoorState::CLOSED;
    }
}

bool DoorSensor::isOpen() const {
    return _doorState == DoorState::OPEN;
}

bool DoorSensor::isClosed() const {
    return _doorState == DoorState::CLOSED;
}

DoorState DoorSensor::getDoorState() const {
    return _doorState;
}

bool DoorSensor::isStateEstablished() const {
    return _stateEstablished;
}

bool DoorSensor::isReedClosed() const {
    return !_debouncedRawPinState; // LOW indicates contacts are physically bridged
}

bool DoorSensor::isMagnetDetected() const {
    return !_debouncedRawPinState;
}

unsigned long DoorSensor::getLastChangeTime() const {
    return _lastStateChangeTime;
}

void DoorSensor::setOnStateChange(StateChangeCallback callback) {
    _callback = callback;
}

void DoorSensor::setMagnetDetectsClosed(bool magnetDetectsClosed) {
    _magnetDetectsClosed = magnetDetectsClosed;
    if (_stateEstablished) {
        _doorState = resolveDoorState(_debouncedRawPinState);
    }
}

bool DoorSensor::getMagnetDetectsClosed() const {
    return _magnetDetectsClosed;
}
