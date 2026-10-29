import React from 'react';
import { Cpu, Signal, Clock, Activity, ShieldCheck } from 'lucide-react';
import type { DeviceTelemetry, ConnectionState } from '../types';

interface DeviceStatusBannerProps {
  telemetry: DeviceTelemetry | null;
  connectionState: ConnectionState;
  lastSuccessfulUpdate: Date | null;
  statusMessage: string | null;
}

export const DeviceStatusBanner: React.FC<DeviceStatusBannerProps> = ({
  telemetry, connectionState, lastSuccessfulUpdate, statusMessage,
}) => {
  const isConnected = connectionState === 'CONNECTED';
  const seconds = telemetry?.uptimeSeconds;
  const uptime = seconds === undefined ? '--' : [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
  const readings = [
    { label: 'Device', value: telemetry?.deviceId || '--', icon: Cpu },
    { label: 'Wi-Fi signal', value: isConnected && telemetry?.wifiRssi !== undefined ? `${telemetry.wifiRssi} dBm` : '--', icon: Signal },
    { label: 'Time online', value: isConnected ? uptime : '--', icon: Clock },
    { label: 'Last update', value: lastSuccessfulUpdate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) || 'Awaiting connection', icon: Activity },
  ];

  return (
    <div className="device-diagnostics">
      {!isConnected && statusMessage && <p className="device-message">{statusMessage}</p>}
      <dl className="device-readings">
        {readings.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <dt><Icon size={14} strokeWidth={1.5} aria-hidden="true" />{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="device-local-note"><ShieldCheck size={14} aria-hidden="true" />Door and lighting automation runs locally on your device.</p>
    </div>
  );
};

export default DeviceStatusBanner;