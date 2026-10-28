#pragma once

#ifndef LIGHT_SENSOR_H
#define LIGHT_SENSOR_H

#include <Arduino.h>

class LightSensor {
public:
    explicit LightSensor(uint8_t analogPin, uint16_t defaultThreshold = 1500,
                         uint16_t defaultHysteresis = 75, uint8_t sampleCount = 8);

    void begin();
    void update();

    uint16_t getRawAdc() const;
    float getLightPercentage() const; // 0.0% (dark) to 100.0% (bright)
    bool isDark() const;

    void setThreshold(uint16_t threshold);
    uint16_t getThreshold() const;

    void setHysteresis(uint16_t hysteresis);
    uint16_t getHysteresis() const;

private:
    uint8_t _pin;
    uint16_t _threshold;
    uint16_t _hysteresis;
    uint8_t _sampleCount;
    uint16_t _samples[16];
    uint8_t _sampleIndex;
    uint32_t _sampleSum;
    uint16_t _smoothedAdc;
    bool _isDarkState;
    bool _isInitialized;
};

#endif // LIGHT_SENSOR_H
