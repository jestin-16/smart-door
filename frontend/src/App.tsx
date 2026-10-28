import { useState } from 'react';
import { useSmartDoor } from './hooks/useSmartDoor';
import { Header } from './components/Header';
import { DeviceStatusBanner } from './components/DeviceStatusBanner';
import { DoorwayHeroVisualizer } from './components/DoorwayHeroVisualizer';
import { DoorStatusCard } from './components/DoorStatusCard';
import { AmbientLightCard } from './components/AmbientLightCard';
import { LightingControlCard } from './components/LightingControlCard';
import { EventHistoryTable } from './components/EventHistoryTable';
import { SettingsModal } from './components/SettingsModal';
import { SystemAlert } from './components/SystemAlert';

export function App() {
  const {
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
    refetch,
    setError,
  } = useSmartDoor();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const isConnected = connectionState === 'CONNECTED';

  const handleRefresh = () => {
    setRevealKey((prev) => prev + 1);
    refetch();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] bg-grid-pattern relative overflow-x-hidden flex flex-col selection:bg-amber-200 selection:text-amber-950 font-sans">
      {/* Decorative Ambient Background Atmospheric Glows (EnergyAI style) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/4 w-[36rem] h-[36rem] bg-amber-400/10 rounded-full blur-3xl animate-ambient-float -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-72 right-1/4 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-3xl animate-ambient-float anim-delay-500 -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl animate-ambient-float anim-delay-300 -z-10"
      />

      {/* 1. Floating Pill Header with Smooth Reveal Down */}
      <div className="animate-reveal-down anim-delay-50 z-30 pt-3">
        <Header
          status={connectionState}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>

      {/* 2. Device Status Strip with Staggered Reveal Down */}
      <div className="animate-reveal-down anim-delay-100 z-20">
        <DeviceStatusBanner
          telemetry={telemetry}
          connectionState={connectionState}
          lastSuccessfulUpdate={lastSuccessfulUpdate}
          statusMessage={statusMessage}
        />
      </div>

      {/* 3. Main Dashboard Body with Staggered Cascade Entrance */}
      <main
        key={revealKey}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
      >
        {/* Error Notification */}
        {error && (
          <div className="animate-reveal-up anim-delay-100">
            <SystemAlert
              error={error}
              isDisconnected={false}
              onDismissError={() => setError(null)}
            />
          </div>
        )}

        {/* Hero Architectural Digital Twin */}
        <div className="animate-reveal-up anim-delay-150">
          <DoorwayHeroVisualizer
            doorOpen={telemetry?.doorOpen}
            lightOn={telemetry?.lightOn}
            isDark={telemetry?.isDark}
            lightPercentage={telemetry?.lightPercentage}
            lightAdc={telemetry?.lightAdc}
            mode={telemetry?.mode || 'AUTO'}
            timerActive={telemetry?.timerActive}
            remainingDelayMs={telemetry?.remainingDelayMs || 0}
            offDelayMs={config?.offDelayMs || telemetry?.offDelayMs || 15000}
            isConnected={isConnected}
            onSetDoorState={setDoorState}
            onToggleLight={toggleLight}
          />
        </div>

        {/* Section Heading & Hardware Node Badge */}
        <div id="hardware-cards" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60 animate-reveal-up anim-delay-150">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Hardware Telemetry Overview</span>
              <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs">
                Live Edge Node
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time door status, ambient light photocell, and autonomous 15s delay actuator
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/80 text-slate-700 shadow-luxury font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {isConnected ? 'ESP32 Streaming' : 'Standby / Offline'}
            </span>
          </div>
        </div>

        {/* 4. Sensor Cards 3-Column Grid with Staggered Cascading Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Door Sensor (Dashboard Control & Live Hardware State) */}
          <div className="animate-reveal-up anim-delay-200">
            <DoorStatusCard
              isOpen={telemetry?.doorOpen}
              isConnected={isConnected}
              onSetDoorState={setDoorState}
            />
          </div>

          {/* Card 2: Ambient Light Photocell (LDR with Hysteresis) */}
          <div className="animate-reveal-up anim-delay-350">
            <AmbientLightCard
              lightPercentage={telemetry?.lightPercentage}
              lightAdc={telemetry?.lightAdc}
              lightThreshold={config?.lightThreshold || telemetry?.lightThreshold || 2000}
              lightHysteresis={telemetry?.lightHysteresis || 100}
              isDark={telemetry?.isDark}
              isConnected={isConnected}
              onUpdateThreshold={(threshold) => updateConfiguration({ lightThreshold: threshold })}
            />
          </div>

          {/* Card 3: Doorway Light Control with 15s Delay */}
          <div className="animate-reveal-up anim-delay-500">
            <LightingControlCard
              lightOn={telemetry?.lightOn}
              mode={telemetry?.mode || 'AUTO'}
              timerActive={telemetry?.timerActive}
              remainingDelayMs={telemetry?.remainingDelayMs || 0}
              offDelayMs={config?.offDelayMs || telemetry?.offDelayMs || 15000}
              isConnected={isConnected}
              onSetMode={setLightingMode}
              onToggleLight={toggleLight}
            />
          </div>
        </div>

        {/* 5. Event History & Audit Table */}
        <div className="animate-reveal-up anim-delay-650">
          <EventHistoryTable events={events} />
        </div>
      </main>

      {/* 6. Settings Modal */}
      {config && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onSaveConfig={updateConfiguration}
        />
      )}

      {/* 7. Footer with Gentle Fade In */}
      <footer className="glass-panel border-t border-slate-200/80 mt-16 py-8 text-center text-xs text-slate-500 animate-fade-in anim-delay-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">SmartDoorLight</span>
            <span>&bull; Real Hardware Edge Monitoring &bull; ESP32 &bull; Spring Boot &bull; PostgreSQL</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            Dashboard Control (Door) &bull; GPIO 34 (LDR ADC) &bull; GPIO 26 (LED Actuator)
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
