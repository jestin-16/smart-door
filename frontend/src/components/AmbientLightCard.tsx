import React from 'react';
import { Sun, Moon, Sliders, Activity, ShieldAlert } from 'lucide-react';

interface AmbientLightCardProps {
  lightPercentage?: number;
  lightAdc?: number;
  lightThreshold?: number;
  lightHysteresis?: number;
  isDark?: boolean;
  isConnected: boolean;
  onUpdateThreshold: (threshold: number) => void;
}

export const AmbientLightCard: React.FC<AmbientLightCardProps> = ({
  lightPercentage,
  lightAdc,
  lightThreshold = 2000,
  lightHysteresis = 100,
  isDark,
  isConnected,
  onUpdateThreshold,
}) => {
  const hasData = isConnected && lightPercentage !== undefined && lightAdc !== undefined;
  const thresholdPercentage = Number(((lightThreshold / 4095) * 100).toFixed(1));

  // Circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const safePercent = hasData ? Math.min(100, Math.max(0, lightPercentage!)) : 0;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="glass-card-interactive rounded-3xl p-6 shadow-luxury relative overflow-hidden group">
      {/* Top accent indicator strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
          !hasData
            ? 'bg-slate-200'
            : isDark
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600'
            : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${!hasData ? 'bg-slate-300' : isDark ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            LDR Light Sensor
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">Ambient Illuminance</h2>
        </div>
        <div className={`p-2.5 rounded-2xl transition-all shadow-xs ${
          !hasData
            ? 'bg-slate-100 text-slate-400'
            : isDark
            ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-glow-indigo'
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow-amber'
        }`}>
          {!hasData ? (
            <Activity className="w-5 h-5 text-slate-400" />
          ) : isDark ? (
            <Moon className="w-5 h-5 text-indigo-600" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
        </div>
      </div>

      {/* High-Tech Circular Radial Gauge (EnergyAI Inspiration) */}
      <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Radial SVG Dial */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            {/* Background track circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated gauge fill ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`transition-all duration-700 ease-out ${
                !hasData
                  ? 'stroke-slate-200'
                  : isDark
                  ? 'stroke-indigo-500'
                  : 'stroke-amber-400'
              }`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={hasData ? strokeDashoffset : circumference}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Icon & Percentage Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hasData && (
              isDark ? (
                <Moon className="w-4 h-4 text-indigo-500 mb-0.5" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 mb-0.5" />
              )
            )}
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              {hasData ? `${lightPercentage}%` : '--'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              {hasData ? 'Illuminance' : 'Sensor Off'}
            </span>
          </div>
        </div>

        {/* Numeric Telemetry & State Badge */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between">
            <span
              className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-2xs ${
                !hasData
                  ? 'bg-slate-50 text-slate-500 border-slate-200'
                  : isDark
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-500/10'
                  : 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/10'
              }`}
            >
              {!hasData ? 'STANDBY' : isDark ? 'DARK' : 'BRIGHT'}
            </span>
          </div>

          <div className="font-mono text-xs font-semibold text-slate-600">
            {hasData ? `(${lightAdc} / 4095 ADC)` : 'Awaiting sensor reading'}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {hasData
              ? isDark
                ? 'Environment is DARK: Opening the door triggers the doorway LED.'
                : 'Environment is BRIGHT: Daylight suppression keeps LED off.'
              : 'Waiting for ADC packet from ESP32 on GPIO 34...'}
          </p>
        </div>
      </div>

      {/* Visual Threshold Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Photocell Dynamic Range</span>
          <span className="font-mono text-rose-600 font-semibold">
            Trigger Threshold: {thresholdPercentage}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full relative overflow-hidden">
          {hasData && (
            <div
              className={`h-full transition-all duration-300 ${
                isDark ? 'bg-indigo-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, lightPercentage!))}%` }}
            />
          )}
          {/* Threshold marker tick */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-xs"
            style={{ left: `${thresholdPercentage}%` }}
            title={`Threshold: ${lightThreshold} ADC (${thresholdPercentage}%)`}
          />
        </div>
      </div>

      {/* Threshold Configuration Slider */}
      <div className="pt-4 border-t border-slate-200/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Dark Threshold Setting:</span>
          </div>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            {lightThreshold} ADC ({thresholdPercentage}%)
          </span>
        </div>

        <input
          type="range"
          min="100"
          max="3500"
          step="50"
          value={lightThreshold}
          onChange={(e) => onUpdateThreshold(Number(e.target.value))}
          className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200/80 rounded-lg appearance-none transition-all"
        />
        
        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5 items-center">
          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
            ADC1_CH6 (GPIO 34)
          </span>
          <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
            &plusmn;{lightHysteresis} ADC Hysteresis Active
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-700">Hysteresis Protection:</strong> Prevents rapid light flickering by requiring illuminance to cross &plusmn;{lightHysteresis} ADC before changing between DARK and BRIGHT.
        </div>
      </div>
    </div>
  );
};

export default AmbientLightCard;

