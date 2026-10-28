export type LightingMode = 'AUTO' | 'MANUAL';
export type LightState = 'ON' | 'OFF';
export type ConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'UNKNOWN';

export interface DeviceTelemetry {
  deviceId: string;
  uptimeSeconds?: number;
  doorOpen?: boolean;
  reedSwitchClosed?: boolean;
  magnetDetected?: boolean;
  doorStateEstablished?: boolean;
  lightAdc?: number;
  lightPercentage?: number;
  lightThreshold?: number;
  lightHysteresis?: number;
  isDark?: boolean;
  lightOn?: boolean;
  mode?: LightingMode;
  timerActive?: boolean;
  remainingDelayMs?: number;
  offDelayMs?: number;
  wifiConnected?: boolean;
  mqttConnected?: boolean;
  wifiRssi?: number;
  timestamp?: string;
  connectionState: ConnectionState;
  lastHardwareUpdateTimestamp?: number | null;
}

export type EventType =
  | 'DOOR_OPENED'
  | 'DOOR_CLOSED'
  | 'LIGHT_ON'
  | 'LIGHT_OFF'
  | 'LIGHT_TIMER_STARTED'
  | 'LIGHT_TIMER_CANCELLED'
  | 'LIGHT_TIMER_EXPIRED'
  | 'MODE_CHANGED'
  | 'CONFIG_UPDATED';

export interface DoorEvent {
  id: string;
  deviceId: string;
  eventType: EventType;
  createdAt: string;
  details?: {
    doorOpen?: boolean;
    reedSwitchClosed?: boolean;
    magnetDetected?: boolean;
    lightOn?: boolean;
    lightPercentage?: number;
    lightAdc?: number;
    threshold?: number;
    hysteresis?: number;
    isDark?: boolean;
    remainingDelayMs?: number;
    offDelayMs?: number;
    mode?: string;
    description?: string;
    triggerSource?: string;
    [key: string]: any;
  };
}

export interface DeviceConfig {
  deviceId: string;
  lightThreshold: number;
  offDelayMs: number;
  autoMode: boolean;
}
