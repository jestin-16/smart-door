import type { DeviceTelemetry, DoorEvent, DeviceConfig } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export class ApiService {
  /**
   * Fetches genuine hardware telemetry from the backend service.
   * Never fabricates fallback or default fake sensor readings.
   */
  public async getTelemetry(deviceId?: string): Promise<DeviceTelemetry> {
    const url = deviceId ? `${BASE_URL}/telemetry?deviceId=${encodeURIComponent(deviceId)}` : `${BASE_URL}/telemetry`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Backend unavailable (${response.status} ${response.statusText})`);
    }

    return response.json();
  }

  /**
   * Fetches genuine historical door events persisted in PostgreSQL.
   */
  public async getEvents(limit: number = 50, deviceId?: string): Promise<DoorEvent[]> {
    const query = new URLSearchParams({ limit: limit.toString() });
    if (deviceId) query.append('deviceId', deviceId);

    const response = await fetch(`${BASE_URL}/events?${query.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to load event audit history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetches persisted device configuration from PostgreSQL.
   */
  public async getConfig(deviceId?: string): Promise<DeviceConfig> {
    const url = deviceId ? `${BASE_URL}/config?deviceId=${encodeURIComponent(deviceId)}` : `${BASE_URL}/config`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch device configuration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Dispatches logical door command (OPEN or CLOSED) to physical ESP32 via backend MQTT.
   */
  public async setDoorState(state: 'OPEN' | 'CLOSED', deviceId?: string): Promise<void> {
    const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
    const response = await fetch(`${BASE_URL}/commands/door${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || `Failed to dispatch door command (${response.status})`);
    }
  }

  /**
   * Dispatches lighting mode command to physical ESP32 via backend MQTT.
   */
  public async setLightingMode(mode: 'AUTO' | 'MANUAL', deviceId?: string): Promise<void> {
    const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
    const response = await fetch(`${BASE_URL}/commands/mode${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || `Failed to set lighting mode (${response.status})`);
    }
  }

  /**
   * Dispatches manual light state command to physical ESP32 via backend MQTT.
   */
  public async setLightState(state: 'ON' | 'OFF', deviceId?: string): Promise<void> {
    const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
    const response = await fetch(`${BASE_URL}/commands/light${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || `Failed to set light output (${response.status})`);
    }
  }

  /**
   * Updates threshold and delay configuration in PostgreSQL and dispatches over MQTT.
   */
  public async updateConfig(config: Partial<DeviceConfig>, deviceId?: string): Promise<DeviceConfig> {
    const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
    const response = await fetch(`${BASE_URL}/config${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || `Failed to save configuration (${response.status})`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
