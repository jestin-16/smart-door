#include "lighting_controller.h"

LightingController::LightingController(uint8_t lightPin, uint8_t statusLedPin, unsigned long offDelayMs)
    : _lightPin(lightPin),
      _statusLedPin(statusLedPin),
      _offDelayMs(offDelayMs),
      _mode(LightingMode::AUTO),
      _lightState(false),
      _manualTargetState(false),
      _timerActive(false),
      _timerStartTime(0),
      _prevDoorOpen(false),
      _eventCallback(nullptr) {}

void LightingController::begin() {
    pinMode(_lightPin, OUTPUT);
    pinMode(_statusLedPin, OUTPUT);
    setPhysicalOutputs(false);
    _lightState = false;
    _timerActive = false;
}

void LightingController::setPhysicalOutputs(bool on) {
    digitalWrite(_lightPin, on ? HIGH : LOW);
    digitalWrite(_statusLedPin, on ? HIGH : LOW);
}

void LightingController::notifyEvent(LightEvent event) {
    if (_eventCallback) {
        _eventCallback(event, _lightState);
    }
}

void LightingController::update(bool isDoorOpen, bool isDark) {
    // 1. MANUAL Override Mode
    if (_mode == LightingMode::MANUAL) {
        if (_timerActive) {
            _timerActive = false;
        }
        if (_lightState != _manualTargetState) {
            _lightState = _manualTargetState;
            setPhysicalOutputs(_lightState);
            notifyEvent(_lightState ? LightEvent::LIGHT_TURNED_ON : LightEvent::LIGHT_TURNED_OFF);
        }
        _prevDoorOpen = isDoorOpen;
        return;
    }

    // 2. AUTOMATIC Mode
    bool doorJustOpened = (isDoorOpen && !_prevDoorOpen);
    bool doorJustClosed = (!isDoorOpen && _prevDoorOpen);

    if (isDoorOpen) {
        // If pending shutdown timer was counting down and door is reopened, cancel it!
        if (_timerActive) {
            _timerActive = false;
            notifyEvent(LightEvent::TIMER_CANCELLED);
        }

        // Automatic rule: Light is ON only when Door is OPEN and Environment is DARK
        if (isDark) {
            if (!_lightState) {
                _lightState = true;
                setPhysicalOutputs(true);
                notifyEvent(LightEvent::LIGHT_TURNED_ON);
            }
        } else {
            // Environment is BRIGHT: Keep automatic light OFF
            if (_lightState) {
                _lightState = false;
                setPhysicalOutputs(false);
                notifyEvent(LightEvent::LIGHT_TURNED_OFF);
            }
        }
    } else {
        // Door is CLOSED
        if (doorJustClosed) {
            if (_lightState) {
                // When door becomes CLOSED, turn LED OFF after a configurable 15-second delay
                _timerActive = true;
                _timerStartTime = millis();
                notifyEvent(LightEvent::TIMER_STARTED);
            }
        }

        if (_timerActive) {
            if (millis() - _timerStartTime >= _offDelayMs) {
                // 15 seconds elapsed
                _timerActive = false;
                _lightState = false;
                setPhysicalOutputs(false);
                notifyEvent(LightEvent::TIMER_EXPIRED);
                notifyEvent(LightEvent::LIGHT_TURNED_OFF);
            }
        } else if (_lightState) {
            // Failsafe: if light remained ON without an active countdown timer while door is closed
            _lightState = false;
            setPhysicalOutputs(false);
            notifyEvent(LightEvent::LIGHT_TURNED_OFF);
        }
    }

    _prevDoorOpen = isDoorOpen;
}

void LightingController::setMode(LightingMode mode) {
    if (_mode != mode) {
        _mode = mode;
        if (_mode == LightingMode::AUTO) {
            _timerActive = false;
        }
        notifyEvent(LightEvent::MODE_CHANGED);
    }
}

LightingMode LightingController::getMode() const {
    return _mode;
}

void LightingController::setManualState(bool state) {
    _mode = LightingMode::MANUAL;
    _manualTargetState = state;
    if (_lightState != state) {
        _lightState = state;
        setPhysicalOutputs(state);
        notifyEvent(state ? LightEvent::LIGHT_TURNED_ON : LightEvent::LIGHT_TURNED_OFF);
    }
}

void LightingController::setOffDelay(unsigned long delayMs) {
    _offDelayMs = delayMs;
}

unsigned long LightingController::getOffDelay() const {
    return _offDelayMs;
}

bool LightingController::isLightOn() const {
    return _lightState;
}

bool LightingController::isTimerActive() const {
    return _timerActive;
}

unsigned long LightingController::getRemainingDelayMs() const {
    if (!_timerActive) {
        return 0;
    }
    unsigned long elapsed = millis() - _timerStartTime;
    if (elapsed >= _offDelayMs) {
        return 0;
    }
    return _offDelayMs - elapsed;
}

void LightingController::setOnEvent(LightEventCallback callback) {
    _eventCallback = callback;
}
