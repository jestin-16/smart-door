import type { DeviceTelemetry, DoorEvent, DeviceConfig } from '../types';

/**
 * Test fixture for verifying the edge state machine logic in unit tests.
 * This is isolated strictly within the test suite and never imported
 * or used by production runtime code.
 */
export class TestEdgeStateMachine {
  private telemetry: DeviceTelemetry;
  private config: DeviceConfig;
  private events: DoorEvent[];
  private timerStartTime: number = 0;

  constructor() {
    this.config = {
      deviceId: 'smartdoor-test-device',
      lightThreshold: 2000,
      offDelayMs: 15000,
      autoMode: true,
    };

    this.telemetry = {
      deviceId: this.config.deviceId,
      uptimeSeconds: 10,
      doorOpen: false,
      lightAdc: 3200,
      lightPercentage: 21.8,
      lightThreshold: this.config.lightThreshold,
      lightHysteresis: 100,
      isDark: true,
      lightOn: false,
      mode: 'AUTO',
      timerActive: false,
      remainingDelayMs: 0,
      offDelayMs: this.config.offDelayMs,
      wifiConnected: true,
      mqttConnected: true,
      wifiRssi: -60,
      connectionState: 'CONNECTED',
      lastHardwareUpdateTimestamp: Date.now(),
      timestamp: new Date().toISOString(),
    };

    this.events = [];
  }

  public setDoor(open: boolean): boolean {
    const _changed = this.telemetry.doorOpen !== open;
    this.telemetry.doorOpen = open;

    if (open) {
      // Door Opened
      if (this.telemetry.timerActive) {
        this.telemetry.timerActive = false;
        this.telemetry.remainingDelayMs = 0;
      }
      if (this.telemetry.mode === 'AUTO' && this.telemetry.isDark) {
        this.telemetry.lightOn = true;
      }
    } else {
      // Door Closed
      if (this.telemetry.mode === 'AUTO' && this.telemetry.lightOn) {
        this.telemetry.timerActive = true;
        this.timerStartTime = Date.now();
        this.telemetry.remainingDelayMs = this.config.offDelayMs;
      }
    }
    return open;
  }

  public pressButton(): boolean {
    return this.setDoor(!this.telemetry.doorOpen);
  }

  public setLightAdc(adc: number) {
    const clampedAdc = Math.max(0, Math.min(4095, adc));
    this.telemetry.lightAdc = clampedAdc;
    this.telemetry.lightPercentage = Number((((4095 - clampedAdc) / 4095) * 100).toFixed(1));

    // Real sensor hysteresis:
    // Bright: ~800 ADC, Dark: ~3200 ADC
    const threshold = this.telemetry.lightThreshold || 2000;
    const hysteresis = this.telemetry.lightHysteresis || 100;

    if (!this.telemetry.isDark) {
      if (clampedAdc > (threshold + hysteresis)) {
        this.telemetry.isDark = true;
      }
    } else {
      if (clampedAdc < (threshold - hysteresis)) {
        this.telemetry.isDark = false;
      }
    }

    if (this.telemetry.mode === 'AUTO' && this.telemetry.doorOpen) {
      this.telemetry.lightOn = this.telemetry.isDark;
    }
  }

  public setLightingMode(mode: 'AUTO' | 'MANUAL') {
    this.telemetry.mode = mode;
    if (mode === 'AUTO') {
      this.telemetry.timerActive = false;
      this.telemetry.remainingDelayMs = 0;
      this.telemetry.lightOn = Boolean(this.telemetry.doorOpen && this.telemetry.isDark);
    }
  }

  public setManualLight(state: boolean) {
    this.telemetry.mode = 'MANUAL';
    this.telemetry.timerActive = false;
    this.telemetry.remainingDelayMs = 0;
    this.telemetry.lightOn = state;
  }

  public updateConfig(newConfig: Partial<DeviceConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.lightThreshold !== undefined) {
      this.telemetry.lightThreshold = newConfig.lightThreshold;
      this.telemetry.isDark = (this.telemetry.lightAdc || 0) > newConfig.lightThreshold;
    }
    if (newConfig.offDelayMs !== undefined) {
      this.telemetry.offDelayMs = newConfig.offDelayMs;
    }
  }

  public getTelemetry(): DeviceTelemetry {
    return { ...this.telemetry };
  }

  public getConfig(): DeviceConfig {
    return { ...this.config };
  }
}
