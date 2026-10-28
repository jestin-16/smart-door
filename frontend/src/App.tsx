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
  const isConnected = connectionState === 'CONNECTED';

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="dashboard-shell min-h-screen relative overflow-x-hidden flex flex-col selection:bg-amber-200 selection:text-amber-950 font-sans">
      {/* 1. Floating Pill Header with Smooth Reveal Down */}
      <div className="dashboard-header">
        <Header
          status={connectionState}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Main Dashboard Body with Staggered Cascade Entrance */}
      <main
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

        <section className="overview-heading animate-reveal-up">
          <div><p className="eyebrow">HOME OVERVIEW</p><h1>Your entrance, at a glance.</h1><p>A little awareness. A more welcoming home.</p></div>
          <span className="overview-location"><span className={isConnected ? 'status-dot online' : 'status-dot'} />{isConnected ? 'Live from your entryway' : 'Waiting for live data'}</span>
        </section>

        {/* Hero Architectural Digital Twin */}
        <div className="animate-reveal-up anim-delay-150">
          <DoorwayHeroVisualizer
            doorOpen={telemetry?.doorOpen}
            reedSwitchClosed={telemetry?.reedSwitchClosed}
            magnetDetected={telemetry?.magnetDetected}
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

        <section id="hardware-cards" className="controls-workspace" aria-labelledby="controls-title">
          <div className="controls-intro animate-reveal-up anim-delay-150">
            <span className="eyebrow">MAKE YOURSELF AT HOME</span>
            <h2 id="controls-title">Small details.<br /><span>A calmer home.</span></h2>
            <p>A feel for your surroundings.<br />A little control over your comfort.</p>
            <span className="controls-live"><i className={isConnected ? 'status-dot online' : 'status-dot'} />{isConnected ? 'In sync with your entryway' : 'Waiting for your entryway'}</span>
          </div>
          <div className="controls-flow">
          <div className="animate-reveal-up anim-delay-200">
            <DoorStatusCard
              isOpen={telemetry?.doorOpen}
              reedSwitchClosed={telemetry?.reedSwitchClosed}
              magnetDetected={telemetry?.magnetDetected}
              isConnected={isConnected}
              onSetDoorState={setDoorState}
            />
          </div>

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
        </section>


        {/* 5. Event History & Audit Table */}
        <div className="animate-reveal-up anim-delay-650">
          <EventHistoryTable events={events} />
        </div>

        <details className="device-details"><summary>Device information</summary>      {/* Connection details */}
      <div className="connection-strip animate-fade-in">
        <DeviceStatusBanner
          telemetry={telemetry}
          connectionState={connectionState}
          lastSuccessfulUpdate={lastSuccessfulUpdate}
          statusMessage={statusMessage}
        />
      </div>

</details>
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
            <span>&bull; A more thoughtful entrance.</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">
            Designed around your everyday.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
