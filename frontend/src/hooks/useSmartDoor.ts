import { useState, useEffect, useCallback, useRef } from 'react';
import type { DeviceTelemetry, DoorEvent, DeviceConfig, ConnectionState } from '../types';
import { apiService } from '../services/api';

export function useSmartDoor(deviceId: string = 'smartdoor-01') {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [events, setEvents] = useState<DoorEvent[]>([]);
  const [config, setConfig] = useState<DeviceConfig | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('UNKNOWN');
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchHardwareData = useCallback(async () => {
    try {
      const [tel, evts, cfg] = await Promise.all([
        apiService.getTelemetry(deviceId),
        apiService.getEvents(50, deviceId).catch(() => []),
        apiService.getConfig(deviceId).catch(() => null),
      ]);

      if (!isMountedRef.current) return;

      if (tel && tel.connectionState === 'CONNECTED' && tel.doorOpen !== undefined) {
        setTelemetry(tel);
        setConnectionState('CONNECTED');
        setStatusMessage(null);
        setError(null);
        setLastSuccessfulUpdate(new Date());
      } else {
        // Hardware is disconnected / no active heartbeat packet
        setTelemetry(tel || null);
        setConnectionState('DISCONNECTED');
        setStatusMessage('Device disconnected — waiting for hardware connection.');
      }

      setEvents(evts);
      if (cfg) setConfig(cfg);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setConnectionState('DISCONNECTED');
      setStatusMessage('Device disconnected — waiting for hardware connection.');
      // Keep telemetry null / disconnected so UI displays "--"
      setTelemetry((prev) => (prev ? { ...prev, connectionState: 'DISCONNECTED' } : null));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchHardwareData();

    // 1. Live Server-Sent Events (SSE) Stream for Instant Sub-100ms Updates
    let eventSource: EventSource | null = null;
    let sseTimeoutId: any = null;

    const connectSSE = () => {
      if (typeof EventSource === 'undefined' || !isMountedRef.current) return;
      try {
        eventSource = new EventSource(apiService.getTelemetryStreamUrl());

        eventSource.addEventListener('telemetry', (event: MessageEvent) => {
          if (!isMountedRef.current) return;
          try {
            const data: DeviceTelemetry = JSON.parse(event.data);
            if (data && data.doorOpen !== undefined && data.connectionState === 'CONNECTED') {
              setTelemetry(data);
              setConnectionState('CONNECTED');
              setStatusMessage(null);
              setError(null);
              setLastSuccessfulUpdate(new Date());
            } else if (data && data.connectionState === 'DISCONNECTED') {
              setTelemetry(data);
              setConnectionState('DISCONNECTED');
              setStatusMessage('Device disconnected — waiting for hardware connection.');
            }
          } catch (_) {}
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Automatically reconnect SSE stream after 2 seconds on network hiccups
          if (isMountedRef.current && !sseTimeoutId) {
            sseTimeoutId = setTimeout(() => {
              sseTimeoutId = null;
              connectSSE();
            }, 2000);
          }
        };
      } catch (_) {}
    };

    connectSSE();

    // 2. High-Frequency Fallback Polling (1000ms instead of 3000ms)
    const interval = setInterval(fetchHardwareData, 1000);

    return () => {
      isMountedRef.current = false;
      if (eventSource) {
        eventSource.close();
      }
      if (sseTimeoutId) {
        clearTimeout(sseTimeoutId);
      }
      clearInterval(interval);
    };
  }, [fetchHardwareData]);

  const setDoorState = useCallback(
    async (state: 'OPEN' | 'CLOSED') => {
      if (connectionState !== 'CONNECTED') {
        setError('Cannot change door state: Device disconnected — waiting for hardware connection.');
        return;
      }
      try {
        await apiService.setDoorState(state, deviceId);
        await fetchHardwareData(); // Poll real confirmation from device
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch door command.');
      }
    },
    [connectionState, deviceId, fetchHardwareData]
  );

  const setLightingMode = useCallback(
    async (mode: 'AUTO' | 'MANUAL') => {
      if (connectionState !== 'CONNECTED') {
        setError('Cannot change mode: Device disconnected — waiting for hardware connection.');
        return;
      }
      try {
        await apiService.setLightingMode(mode, deviceId);
        await fetchHardwareData(); // Poll real confirmation from device
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch lighting mode command.');
      }
    },
    [connectionState, deviceId, fetchHardwareData]
  );

  const toggleLight = useCallback(
    async (targetState?: boolean) => {
      if (connectionState !== 'CONNECTED') {
        setError('Cannot switch light: Device disconnected — waiting for hardware connection.');
        return;
      }
      const nextState = targetState !== undefined ? targetState : !(telemetry?.lightOn);
      try {
        await apiService.setLightState(nextState ? 'ON' : 'OFF', deviceId);
        await fetchHardwareData(); // Poll real confirmation from device
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch light command.');
      }
    },
    [connectionState, deviceId, telemetry?.lightOn, fetchHardwareData]
  );

  const updateConfiguration = useCallback(
    async (newConfig: Partial<DeviceConfig>) => {
      try {
        const updated = await apiService.updateConfig(newConfig, deviceId);
        setConfig(updated);
        await fetchHardwareData();
      } catch (err: any) {
        setError(err.message || 'Failed to save configuration.');
      }
    },
    [deviceId, fetchHardwareData]
  );

  return {
    telemetry,
    events,
    config,
    connectionState,
    lastSuccessfulUpdate,
    isLoading,
    statusMessage,
    error,
    setDoorState,
    setLightingMode,
    toggleLight,
    updateConfiguration,
    refetch: fetchHardwareData,
    setError,
  };
}
