import React from 'react';
import { Lightbulb, Timer, Power, Zap, Radio, Sparkles } from 'lucide-react';
import type { LightingMode } from '../types';

interface LightingControlCardProps {
  lightOn?: boolean;
  mode?: LightingMode;
  timerActive?: boolean;
  remainingDelayMs?: number;
  offDelayMs?: number;
  isConnected: boolean;
  onSetMode: (mode: LightingMode) => void;
  onToggleLight: (targetState?: boolean) => void;
}

export const LightingControlCard: React.FC<LightingControlCardProps> = ({
  lightOn,
  mode = 'AUTO',
  timerActive,
  remainingDelayMs = 0,
  offDelayMs = 15000,
  isConnected,
  onSetMode,
  onToggleLight,
}) => {
  const hasData = isConnected && lightOn !== undefined;
  const remainingSeconds = (remainingDelayMs / 1000).toFixed(1);
  const totalSeconds = offDelayMs / 1000;
  const progressPercent =
    timerActive && offDelayMs > 0
      ? Math.max(0, Math.min(100, (remainingDelayMs / offDelayMs) * 100))
      : 0;

  return (
    <div className="glass-card-interactive rounded-3xl p-6 shadow-luxury relative overflow-hidden group">
      {/* Top accent indicator strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
          !hasData
            ? 'bg-slate-200'
            : lightOn
            ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400'
            : 'bg-slate-200'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${!hasData ? 'bg-slate-300' : lightOn ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
            Lighting Output
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">LED Actuator Control</h2>
        </div>
        <div className={`p-2.5 rounded-2xl transition-all shadow-xs ${
          !hasData
            ? 'bg-slate-100 text-slate-400'
            : lightOn
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow-amber'
            : 'bg-slate-100 text-slate-400'
        }`}>
          {!hasData ? (
            <Radio className="w-5 h-5 text-slate-400" />
          ) : (
            <Lightbulb
              className={`w-5 h-5 transition-colors ${
                lightOn ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
              }`}
            />
          )}
        </div>
      </div>

      {/* Main Light Status Banner */}
      <div className="my-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              !hasData
                ? 'bg-slate-100 text-slate-400'
                : lightOn
                ? 'bg-gradient-to-br from-amber-400/20 to-orange-400/20 text-amber-600 ring-2 ring-amber-400/50 shadow-glow-amber'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Lightbulb className={`w-7 h-7 ${hasData && lightOn ? 'fill-amber-500 text-amber-600' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {!hasData ? '--' : lightOn ? 'Light ON' : 'Light OFF'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  !hasData
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : mode === 'AUTO'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                {!hasData ? 'STANDBY' : `${mode} MODE`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-[190px] leading-relaxed">
              {!hasData
                ? 'Awaiting actuator confirmation'
                : lightOn
                ? 'Illuminating doorway (GPIO 26 via 220Ω resistor)'
                : 'Circuit idle (LED extinguished)'}
            </p>
          </div>
        </div>

        {/* Manual On/Off Quick Toggle */}
        {hasData && (
          <button
            onClick={() => onToggleLight(!lightOn)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs ${
              lightOn
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{lightOn ? 'Turn OFF' : 'Turn ON'}</span>
          </button>
        )}
      </div>

      {/* 15-Second Delay Indicator (EnergyAI warm amber style) */}
      {timerActive ? (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-900 mb-2">
            <div className="flex items-center space-x-1.5 font-bold">
              <Timer className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Door Closed Auto-Off Timer Active</span>
            </div>
            <span className="font-mono font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              {remainingSeconds}s remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300 ease-linear shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-800/90 mt-2 font-medium">
            Non-blocking timer: light turns off in {remainingSeconds}s unless door button is pressed to reopen.
          </p>
        </div>
      ) : (
        <div className="mb-5 py-2.5 px-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Timer className="w-3.5 h-3.5 text-slate-400" /> Auto-Off Timer Setting:
          </span>
          <span className="font-semibold text-slate-800 font-mono">{totalSeconds}s after door closure</span>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="pt-4 border-t border-slate-200/60">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
          Operating Mode:
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onSetMode('AUTO')}
            disabled={!hasData}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
              mode === 'AUTO'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automatic Mode</span>
          </button>
          <button
            onClick={() => onSetMode('MANUAL')}
            disabled={!hasData}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
              mode === 'MANUAL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Manual Override</span>
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>In AUTO mode, light operates autonomously via threshold &amp; 15-second shutoff timer.</span>
      </div>
    </div>
  );
};

export default LightingControlCard;

