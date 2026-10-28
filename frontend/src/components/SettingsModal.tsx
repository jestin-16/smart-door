import React, { useState } from 'react';
import { X, Sliders, Timer, Cpu, Save } from 'lucide-react';
import type { DeviceConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceConfig;
  onSaveConfig: (newConfig: Partial<DeviceConfig>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [threshold, setThreshold] = useState<number>(config.lightThreshold);
  const [delaySeconds, setDelaySeconds] = useState<number>(config.offDelayMs / 1000);
  const [deviceId, setDeviceId] = useState<string>(config.deviceId);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      lightThreshold: Number(threshold),
      offDelayMs: Number(delaySeconds) * 1000,
      deviceId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-card rounded-3xl border border-white/80 shadow-luxury-lg max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto animate-reveal-up">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Parameters</h3>
            <p className="text-xs text-slate-500">Tune edge thresholds and timer parameters</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Threshold setting */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Ambient Darkness Threshold (ADC)</span>
              </label>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{threshold} / 4095</span>
            </div>
            <p className="text-[11px] text-slate-500">
              When ambient light drops below this value, the door opening automatically turns on the light.
            </p>
            <input
              type="range"
              min="200"
              max="3500"
              step="50"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-slate-900 h-2 bg-slate-200/80 rounded-lg appearance-none cursor-pointer mt-1"
            />
          </div>

          {/* Off Delay setting */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-500" />
                <span>Door-Close Light Off Delay (Seconds)</span>
              </label>
              <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">{delaySeconds}s</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Countdown timer started when the door closes before shutting the LED off (Default: 15s).
            </p>
            <input
              type="number"
              min="1"
              max="120"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white/70 font-mono"
            />
          </div>

          {/* Device ID */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Device Identifier</span>
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono bg-white/70"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/60 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

