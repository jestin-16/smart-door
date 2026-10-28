import React from 'react';
import { DoorClosed, DoorOpen, Timer, Power } from 'lucide-react';
import type { LightingMode } from '../types';

interface DoorwayHeroVisualizerProps {
  doorOpen?: boolean;
  reedSwitchClosed?: boolean;
  magnetDetected?: boolean;
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
  lightPercentage,
  mode = 'AUTO',
  timerActive,
  remainingDelayMs = 0,
  offDelayMs = 15000,
  isConnected,
  onSetDoorState: _onSetDoorState,
}) => {
  const hasData = isConnected && doorOpen !== undefined && lightOn !== undefined;
  const remainingSec = (remainingDelayMs / 1000).toFixed(1);
  const totalSec = offDelayMs / 1000;
  const timerPercent = timerActive && offDelayMs > 0 ? Math.min(100, Math.max(0, (remainingDelayMs / offDelayMs) * 100)) : 0;

  return (
    <section id="hero-twin" className="entrance-panel" aria-labelledby="entrance-title">
      <div className="entrance-copy">
        <span className="eyebrow">YOUR FRONT DOOR</span>
        <h2 id="entrance-title">A warm welcome.<br /><span>Every time.</span></h2>
        <p>Know when your door opens. Let the light take care of the rest.</p>
        <div className="entrance-readings">
          <div>{hasData && doorOpen ? <DoorOpen size={17} /> : <DoorClosed size={17} />}<span>Door<strong key={!hasData ? 'unknown' : String(doorOpen)} className="reading-value">{!hasData ? 'Awaiting signal' : doorOpen ? 'Open' : 'Closed'}</strong></span><i data-state={hasData ? doorOpen ? 'open' : 'closed' : 'unknown'} /></div>
          <div><Power size={17} /><span>Entry light<strong>{!hasData ? 'Awaiting signal' : lightOn ? 'On' : 'Off'}</strong></span><span className="reading-note">{hasData ? mode === 'AUTO' ? 'Automatic' : 'Manual' : '--'}</span></div>
        </div>
        <div className="entrance-note"><Timer size={15} /><span>{!hasData ? 'Your live view will appear when the device connects.' : timerActive ? 'Light turns off in ' + remainingSec + 's' : 'Light stays on for ' + totalSec + 's after closing.'}</span></div>
        <div className="countdown-track" data-active={hasData && !!timerActive} aria-hidden="true"><span style={{ width: timerPercent + '%' }} /></div>
      </div>
      <div className="entrance-visual">
          <div className="door-scene" data-open={hasData && doorOpen ? 'true' : 'false'} data-lit={hasData && lightOn ? 'true' : 'false'} data-online={hasData} role="img" aria-label={!hasData ? 'Door visualization: awaiting live telemetry' : `Door ${doorOpen ? 'open' : 'closed'}, light ${lightOn ? 'on' : 'off'}`}>
            <div className="scene-wall" aria-hidden="true">
              <div className="scene-lamp" /><div className="scene-beam" /><div className="scene-floor" /><div className="scene-doormat" /><div className="door-shadow" />
              <div className="door-frame">
                <div className="door-interior"><span /></div>
                <div className="door-leaf"><div className="door-inlay door-inlay-top" /><div className="door-inlay door-inlay-bottom" /><div className="door-lock" /><div className="door-handle" /><i className="door-hinge door-hinge-top" /><i className="door-hinge door-hinge-bottom" /></div>
              </div>
            </div>
          </div><p className="visual-caption"><span />{hasData ? 'Live from your entryway' : 'Waiting for your device'}{hasData && lightPercentage !== undefined ? ` / ${lightPercentage}% ambient light` : ''}</p></div>
    </section>
  );
};
export default DoorwayHeroVisualizer;
