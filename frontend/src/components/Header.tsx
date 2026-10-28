import React, { useState } from 'react';
import { DoorClosed, Wifi, WifiOff, Settings, RefreshCw, Cpu, Layers } from 'lucide-react';
import type { ConnectionState } from '../types';

interface HeaderProps {
  status: ConnectionState;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onOpenSettings,
  onRefresh,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'history'>('overview');

  const scrollToSection = (id: string, tab: 'overview' | 'controls' | 'history') => {
    setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all">
      <div className="glass-pill rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-luxury flex flex-wrap items-center justify-between gap-3 border border-white/80">
        {/* Brand & System Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-md shadow-slate-900/10 ring-1 ring-white/20">
            <DoorClosed className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                SmartDoorLight
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium hidden sm:inline-block">
                ESP32 Hardware
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Physical Button Doorway Monitor & Autonomous Lighting
            </p>
          </div>
        </div>

        {/* Floating Pill Nav Tabs (EnergyAI Inspiration) */}
        <nav className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/60 shadow-inner">
          <button
            onClick={() => scrollToSection('hero-twin', 'overview')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Digital Twin</span>
          </button>
          <button
            onClick={() => scrollToSection('hardware-cards', 'controls')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'controls'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>Sensors & Controls</span>
          </button>
          <button
            onClick={() => scrollToSection('event-log', 'history')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Event Log
          </button>
        </nav>

        {/* Real Hardware Connection Indicator & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2 text-xs font-medium">
            {status === 'CONNECTED' && (
              <span className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-500/10 border-emerald-500/30 border px-3 py-1.5 rounded-full shadow-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ESP32 Hardware Connected</span>
              </span>
            )}
            {status === 'DISCONNECTED' && (
              <span className="flex items-center space-x-1.5 text-rose-700 bg-rose-50 border-rose-200 border px-3 py-1.5 rounded-full shadow-xs font-semibold">
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span>Device Disconnected</span>
              </span>
            )}
            {status === 'UNKNOWN' && (
              <span className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 border-slate-200 border px-3 py-1.5 rounded-full shadow-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>Checking Hardware...</span>
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white rounded-full transition-all border border-slate-200/80 shadow-2xs hover:shadow-xs disabled:opacity-50"
            title="Refresh hardware status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Settings Action */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white rounded-full transition-all border border-slate-200/80 shadow-2xs hover:shadow-xs"
            title="Configure System Thresholds & Delays"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

