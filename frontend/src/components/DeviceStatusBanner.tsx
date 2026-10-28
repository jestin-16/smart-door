import React from 'react';
import { ShieldCheck, Cpu, Signal, Clock, AlertTriangle, Activity } from 'lucide-react';
import type { DeviceTelemetry, ConnectionState } from '../types';

interface DeviceStatusBannerProps {
  telemetry: DeviceTelemetry | null;
  connectionState: ConnectionState;
  lastSuccessfulUpdate: Date | null;
  statusMessage: string | null;
}

export const DeviceStatusBanner: React.FC<DeviceStatusBannerProps> = ({
  telemetry,
  connectionState,
  lastSuccessfulUpdate,
  statusMessage,
}) => {
  const isConnected = connectionState === 'CONNECTED';

  const formatUptime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never (Awaiting initial hardware packet)';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getRssiDisplay = (rssi?: number) => {
    if (rssi === undefined || rssi === null) return '--';
    return `${rssi} dBm`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {/* Disconnection Warning Ribbon */}
      {!isConnected && statusMessage && (
        <div className="mb-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3 px-4 text-amber-900 text-xs font-medium flex items-center justify-between shadow-xs backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-semibold">
            Standby
          </span>
        </div>
      )}

      {/* Hardware Telemetry Glass Bar */}
      <div className="glass-card rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-luxury border border-white/70">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-600">
          <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap gap-y-2">
            {/* Hardware ID */}
            <div className="flex items-center space-x-1.5 font-mono bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/50">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 text-[11px]">Device ID:</span>
              <span className="font-semibold text-slate-800">{telemetry?.deviceId || 'smartdoor-01'}</span>
            </div>

            {/* Real Wi-Fi RSSI */}
            <div className="flex items-center space-x-1.5 bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/50">
              <Signal className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-slate-500 text-[11px]">Wi-Fi RSSI:</span>
              <span className="font-semibold text-slate-700">{isConnected ? getRssiDisplay(telemetry?.wifiRssi) : '--'}</span>
            </div>

            {/* Real Hardware Uptime */}
            <div className="flex items-center space-x-1.5 bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/50">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 text-[11px]">Uptime:</span>
              <span className="font-mono font-semibold text-slate-700">{isConnected ? formatUptime(telemetry?.uptimeSeconds) : '--'}</span>
            </div>

            {/* Timestamp of last successful update */}
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Last Hardware Packet:</span>
              <span className="font-medium text-slate-800 font-mono text-[11px]">{formatLastSync(lastSuccessfulUpdate)}</span>
            </div>
          </div>

          {/* Fail-safe autonomy guarantee */}
          <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200/60 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local edge control active (independent of internet)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatusBanner;

