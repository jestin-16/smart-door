import React from 'react';
import { DoorOpen, DoorClosed, Radio, Sparkles, CheckCircle2 } from 'lucide-react';

interface DoorStatusCardProps {
  isOpen?: boolean;
  isConnected: boolean;
  onSetDoorState?: (state: 'OPEN' | 'CLOSED') => void;
}

export const DoorStatusCard: React.FC<DoorStatusCardProps> = ({
  isOpen,
  isConnected,
  onSetDoorState,
}) => {
  const hasData = isConnected && isOpen !== undefined;

  return (
    <div className="glass-card-interactive rounded-3xl p-6 shadow-luxury relative overflow-hidden group">
      {/* Top accent indicator strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
          !hasData
            ? 'bg-slate-200'
            : isOpen
            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500'
        }`}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${!hasData ? 'bg-slate-300' : isOpen ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            Door State & Trigger
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">Logical Door Control</h2>
        </div>
        <div className={`p-2.5 rounded-2xl transition-all shadow-xs ${
          !hasData
            ? 'bg-slate-100 text-slate-400'
            : isOpen
            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-glow-amber'
            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-glow-emerald'
        }`}>
          {!hasData ? (
            <Radio className="w-5 h-5 text-slate-400" />
          ) : isOpen ? (
            <DoorOpen className="w-5 h-5 text-amber-600" />
          ) : (
            <DoorClosed className="w-5 h-5 text-emerald-600" />
          )}
        </div>
      </div>

      {/* Main State Display with Radial Halo */}
      <div className="my-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            !hasData
              ? 'bg-slate-100 text-slate-400'
              : isOpen
              ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-600 ring-2 ring-amber-400/50 shadow-glow-amber'
              : 'bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-600 ring-2 ring-emerald-400/50 shadow-glow-emerald'
          }`}>
            {!hasData ? (
              <span className="text-sm font-mono text-slate-400">N/A</span>
            ) : isOpen ? (
              <DoorOpen className="w-7 h-7 text-amber-600" />
            ) : (
              <DoorClosed className="w-7 h-7 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !hasData
                    ? 'bg-slate-300'
                    : isOpen
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {!hasData ? '--' : isOpen ? 'Door Open' : 'Door Closed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
              {!hasData
                ? 'Awaiting hardware telemetry packet...'
                : isOpen
                ? 'Door is OPEN — triggers LED ON if environment is dark'
                : 'Door is CLOSED — LED shuts off after 15-second delay'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-2xs ${
            !hasData
              ? 'bg-slate-50 text-slate-500 border-slate-200'
              : isOpen
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-amber-500/10'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-emerald-500/10'
          }`}
        >
          {!hasData ? 'STANDBY' : isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      {/* Real Hardware Interactive Door Controls */}
      <div className="my-5 pt-4 border-t border-slate-200/60">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
          Dashboard Door Command:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSetDoorState?.('OPEN')}
            disabled={!hasData || isOpen}
            id="btn-open-door"
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
              isOpen
                ? 'bg-amber-100/80 text-amber-900 border-amber-300/80 cursor-default ring-2 ring-amber-400/30'
                : 'bg-white text-slate-800 border-slate-200/80 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 hover:shadow-xs'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <DoorOpen className="w-4 h-4 text-amber-600" />
            <span>Open Door</span>
          </button>

          <button
            onClick={() => onSetDoorState?.('CLOSED')}
            disabled={!hasData || !isOpen}
            id="btn-close-door"
            className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
              !isOpen && hasData
                ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300/80 cursor-default ring-2 ring-emerald-400/30'
                : 'bg-white text-slate-800 border-slate-200/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 hover:shadow-xs'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <DoorClosed className="w-4 h-4 text-emerald-600" />
            <span>Close Door</span>
          </button>
        </div>
      </div>

      {/* Sensor Hardware Specs */}
      <div className="space-y-2 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Trigger Source:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">Dashboard Button / MQTT</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Output Actuator:</span>
          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">GPIO 26 (LED via 220Ω)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Edge Autonomy:</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 15s Non-Blocking Delay Active
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>Click <strong>Open Door</strong> or <strong>Close Door</strong> to send live hardware commands over MQTT to your ESP32.</span>
      </div>
    </div>
  );
};

export default DoorStatusCard;

