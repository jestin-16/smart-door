#include "light_sensor.h"

LightSensor::LightSensor(uint8_t analogPin, uint16_t defaultThreshold, uint16_t defaultHysteresis, uint8_t sampleCount)
    : _pin(analogPin),
      _threshold(defaultThreshold),
      _hysteresis(defaultHysteresis),
      _sampleCount(sampleCount > 16 ? 16 : (sampleCount < 1 ? 1 : sampleCount)),
      _sampleIndex(0),
      _sampleSum(0),
      _smoothedAdc(0),
      _isDarkState(false),
      _isInitialized(false) {
    for (uint8_t i = 0; i < 16; ++i) {
        _samples[i] = 0;
    }
}

void LightSensor::begin() {
    // Configure ADC attenuation for full 0 - 3.3V range
    analogSetAttenuation(ADC_11db);
    pinMode(_pin, INPUT);

    // Seed smoothing buffer with initial reading
    uint16_t initialReading = analogRead(_pin);
    _sampleSum = 0;
    for (uint8_t i = 0; i < _sampleCount; ++i) {
        _samples[i] = initialReading;
        _sampleSum += initialReading;
    }
    _smoothedAdc = initialReading;
    _isDarkState = (_smoothedAdc > _threshold);
    _isInitialized = true;
}

void LightSensor::update() {
    uint16_t rawReading = analogRead(_pin);

    // Moving average update
    _sampleSum -= _samples[_sampleIndex];
    _samples[_sampleIndex] = rawReading;
    _sampleSum += rawReading;
    _sampleIndex = (_sampleIndex + 1) % _sampleCount;

    _smoothedAdc = static_cast<uint16_t>(_sampleSum / _sampleCount);

    // Apply Hysteresis for real ET5329 sensor:
    // Bright conditions: ~784-845 ADC (Low)
    // Dark conditions:   ~3206-3228 ADC (High)
    // When BRIGHT (isDarkState == false): switches to DARK only if ADC > (threshold + hysteresis)
    // When DARK (isDarkState == true): switches to BRIGHT only if ADC < (threshold - hysteresis)
    if (!_isDarkState) {
        uint32_t darkTrigger = static_cast<uint32_t>(_threshold) + _hysteresis;
        if (_smoothedAdc > darkTrigger) {
            _isDarkState = true;
        }
    } else {
        uint16_t brightTrigger = (_threshold > _hysteresis) ? (_threshold - _hysteresis) : 0;
        if (_smoothedAdc < brightTrigger) {
            _isDarkState = false;
        }
    }
}

uint16_t LightSensor::getRawAdc() const {
    return _smoothedAdc;
}

float LightSensor::getLightPercentage() const {
    // 0 ADC = 100% Brightness, 4095 ADC = 0% Brightness
    float pct = ((4095.0f - static_cast<float>(_smoothedAdc)) / 4095.0f) * 100.0f;
    if (pct < 0.0f) pct = 0.0f;
    if (pct > 100.0f) pct = 100.0f;
    return pct;
}

bool LightSensor::isDark() const {
    return _isDarkState;
}

void LightSensor::setThreshold(uint16_t threshold) {
    _threshold = threshold;
    // Re-evaluate state with new threshold
    if (!_isDarkState && _smoothedAdc > (_threshold + _hysteresis)) {
        _isDarkState = true;
    } else if (_isDarkState && _smoothedAdc < ((_threshold > _hysteresis) ? (_threshold - _hysteresis) : 0)) {
        _isDarkState = false;
    }
}

uint16_t LightSensor::getThreshold() const {
    return _threshold;
}

void LightSensor::setHysteresis(uint16_t hysteresis) {
    _hysteresis = hysteresis;
}

uint16_t LightSensor::getHysteresis() const {
    return _hysteresis;
}
