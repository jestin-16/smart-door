import React from 'react';
import { DoorOpen, DoorClosed, Lightbulb, Sun, Moon, Timer, Power, ShieldCheck, Sparkles } from 'lucide-react';
import type { LightingMode } from '../types';

interface DoorwayHeroVisualizerProps {
  doorOpen?: boolean;
  lightOn?: boolean;
  isDark?: boolean;
  lightPercentage?: number;
  lightAdc?: number;
  mode?: LightingMode;
  timerActive?: boolean;
  remainingDelayMs?: number;
  offDelayMs?: number;
  isConnected: boolean;
  onSetDoorState?: (state: 'OPEN' | 'CLOSED') => void;
  onToggleLight?: (targetState?: boolean) => void;
}

export const DoorwayHeroVisualizer: React.FC<DoorwayHeroVisualizerProps> = ({
  doorOpen,
  lightOn,
  isDark,
  lightPercentage,
  lightAdc,
  mode = 'AUTO',
  timerActive,
  remainingDelayMs = 0,
  offDelayMs = 15000,
  isConnected,
  onSetDoorState,
  onToggleLight,
}) => {
  const hasData = isConnected && doorOpen !== undefined && lightOn !== undefined;
  const remainingSec = (remainingDelayMs / 1000).toFixed(1);
  const totalSec = offDelayMs / 1000;
  const timerPercent = timerActive && offDelayMs > 0 ? (remainingDelayMs / offDelayMs) * 100 : 0;

  return (
    <div id="hero-twin" className="relative glass-card rounded-3xl p-6 sm:p-8 shadow-luxury-lg overflow-hidden border border-white/80 transition-all">
      {/* Background radial atmosphere */}
      <div
        className={`pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 -z-10 ${
          lightOn ? 'bg-amber-400/20' : 'bg-indigo-500/10'
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 -z-10 ${
          isDark ? 'bg-indigo-600/15' : 'bg-amber-300/15'
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Visual Architectural Twin */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-slate-900/[0.04] to-slate-900/[0.08] border border-slate-200/60 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            
            {/* Top HUD: Ambient Lighting & Space Sensor */}
            <div className="flex items-center justify-between z-10 w-full">
              <div className="flex items-center space-x-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white shadow-xs text-xs font-medium">
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-slate-800">Night / Dark Ambience</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-800">Daylight Ambience</span>
                  </>
                )}
                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                  {hasData && lightPercentage !== undefined ? `${lightPercentage}%` : '--'}
                </span>
              </div>

              {/* Luminaire status beacon */}
              <div className="flex items-center space-x-1.5 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white shadow-xs text-xs">
                <span className={`w-2 h-2 rounded-full ${lightOn ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="font-semibold text-slate-800">
                  {lightOn ? 'LED Lit (GPIO 26)' : 'LED Off'}
                </span>
              </div>
            </div>

            {/* Central Isometric Architectural Illustration */}
            <div className="relative flex-1 flex items-center justify-center my-2">
              {/* Volumetric Light Beam Cone from Luminaire */}
              {lightOn && (
                <div
                  className="absolute top-2 w-48 h-48 bg-gradient-to-b from-amber-300/40 via-amber-200/20 to-transparent blur-md rounded-b-full pointer-events-none animate-beam-pulse z-0"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}
                />
              )}

              {/* Ceiling Fixture */}
              <div className="absolute top-0 flex flex-col items-center z-10">
                <div className="w-8 h-2 bg-slate-700 rounded-full" />
                <div className="w-0.5 h-4 bg-slate-400" />
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    lightOn
                      ? 'bg-amber-400 text-amber-900 shadow-glow-amber ring-4 ring-amber-300/50'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${lightOn ? 'fill-amber-300 text-amber-900' : ''}`} />
                </div>
              </div>

              {/* Doorway Frame & Door Leaf */}
              <div className="relative z-10 mt-6 flex flex-col items-center">
                {/* Door Frame */}
                <div className="relative w-36 h-48 sm:w-40 sm:h-52 border-4 border-slate-700/80 rounded-t-xl bg-slate-900/10 flex items-end justify-center shadow-md">
                  
                  {/* Threshold Beam on floor */}
                  <div
                    className={`absolute -bottom-2 w-44 sm:w-48 h-4 rounded-full transition-all duration-500 ${
                      lightOn
                        ? 'bg-amber-300/60 shadow-[0_0_24px_rgba(245,158,11,0.6)] blur-xs'
                        : 'bg-slate-300/30'
                    }`}
                  />

                  {/* Door Leaf (Pivots smoothly on open/close) */}
                  <div
                    className={`absolute bottom-0 left-0 w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 rounded-t-lg origin-left transition-all duration-700 ease-in-out border-r border-amber-600/60 shadow-lg flex flex-col justify-between p-3 ${
                      doorOpen
                        ? 'transform -rotate-y-60 scale-x-75 -translate-x-3 opacity-90'
                        : 'transform rotate-y-0 scale-x-100 opacity-100'
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Door window panel */}
                    <div className="w-full h-16 rounded-md bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/70">
                        {doorOpen ? <DoorOpen className="w-4 h-4" /> : <DoorClosed className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Handle & Lock */}
                    <div className="flex items-center justify-end space-x-1 pr-1">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          doorOpen ? 'bg-amber-400 shadow-glow-amber' : 'bg-emerald-400 shadow-glow-emerald'
                        }`}
                      />
                      <div className="w-4 h-1.5 bg-slate-200 rounded-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photocell Ambient Sensor Callout (GPIO 34) */}
              <div className="absolute right-4 bottom-8 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white shadow-xs z-10 text-[10px] space-y-0.5 max-w-[110px]">
                <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>LDR Node</span>
                </div>
                <div className="font-mono text-slate-500">GPIO 34 ADC</div>
                <div className="font-semibold text-slate-800">
                  {hasData && lightAdc !== undefined ? `${lightAdc} ADC` : '--'}
                </div>
              </div>
            </div>

            {/* Bottom HUD: Live Status Pill */}
            <div className="flex items-center justify-between z-10 w-full text-xs">
              <span className="text-[11px] font-mono text-slate-500">
                Mode: <strong className="text-slate-800">{mode}</strong>
              </span>
              <span
                className={`px-3 py-1 rounded-full font-semibold border ${
                  !hasData
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : doorOpen
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {!hasData ? 'STANDBY' : doorOpen ? 'DOOR IS OPEN' : 'DOOR IS CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Metrics & Quick Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Entryway Digital Twin</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Real-Time Architectural Monitor
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Synchronized 1:1 with your ESP32 microcontroller, GPIO 34 photocell sensor, and GPIO 26 doorway light.
            </p>
          </div>

          {/* 15-Second Delay Countdown HUD Widget (If active) */}
          {timerActive ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-500/10 border border-amber-300/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-amber-600 animate-spin" />
                  Auto-Off Timer Active:
                </span>
                <span className="font-mono font-bold text-amber-800 text-sm">
                  {remainingSec}s / {totalSec}s
                </span>
              </div>
              <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300 ease-linear shadow-xs"
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800/80">
                Light remains ON for convenience after closing door. Pressing <strong>Open Door</strong> cancels the delay immediately.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Edge Auto-Off Delay:
              </span>
              <span className="font-mono font-semibold text-slate-800">{totalSec}s configured</span>
            </div>
          )}

          {/* Quick Interactive Command Buttons */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Direct Edge Commands:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSetDoorState?.(doorOpen ? 'CLOSED' : 'OPEN')}
                disabled={!hasData}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs ${
                  doorOpen
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {doorOpen ? <DoorClosed className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
                <span>{doorOpen ? 'Trigger Close' : 'Trigger Open'}</span>
              </button>

              <button
                onClick={() => onToggleLight?.(!lightOn)}
                disabled={!hasData}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all shadow-xs ${
                  lightOn
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Power className="w-4 h-4 text-slate-600" />
                <span>{lightOn ? 'Extinguish LED' : 'Illuminate LED'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorwayHeroVisualizer;
