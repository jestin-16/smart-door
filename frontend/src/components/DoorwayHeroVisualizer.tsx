import React, { useState } from 'react';
import { DoorClosed, DoorOpen, Timer, Power, ArrowUpRight, Pause, Play, Sun } from 'lucide-react';
import type { LightingMode } from '../types';
import ArchitecturalDoorScene from './ArchitecturalDoorScene';
import './hero.css';

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
  isDark,
  lightPercentage,
  mode = 'AUTO',
  timerActive,
  remainingDelayMs = 0,
  offDelayMs = 15000,
  isConnected,
}) => {
  const [motionPaused, setMotionPaused] = useState(false);
  const hasData = isConnected && doorOpen !== undefined && lightOn !== undefined;
  const remainingSec = (remainingDelayMs / 1000).toFixed(1);
  const totalSec = offDelayMs / 1000;
  const timerPercent = timerActive && offDelayMs > 0 ? Math.min(100, Math.max(0, (remainingDelayMs / offDelayMs) * 100)) : 0;

  return (
    <section id="hero-twin" className="entrance-panel cinematic-hero" aria-labelledby="entrance-title" data-online={hasData} data-illuminated={hasData && lightOn} data-motion-paused={motionPaused}>
      <div className="entrance-copy">
        <span className="eyebrow hero-label"><span /> YOUR FRONT DOOR</span>
        <h2 id="entrance-title">A warm welcome.<br /><span>Every time.</span></h2>
        <p>Know when your door opens.<br />Let the light take care of the rest.</p>

        <dl className="hero-readings" aria-label="Entrance status">
          <div>
            <dt>{hasData && doorOpen ? <DoorOpen size={16} aria-hidden="true" /> : <DoorClosed size={16} aria-hidden="true" />} Door</dt>
            <dd key={!hasData ? 'unknown-door' : String(doorOpen)} className="reading-value"><i data-state={!hasData ? 'unknown' : doorOpen ? 'open' : 'closed'} />{!hasData ? 'Awaiting signal' : doorOpen ? 'Open' : 'Closed'}</dd>
          </div>
          <div>
            <dt><Power size={16} aria-hidden="true" /> Entry light</dt>
            <dd key={!hasData ? 'unknown-light' : String(lightOn)} className="reading-value"><i data-state={!hasData ? 'unknown' : lightOn ? 'on' : 'off'} />{!hasData ? 'Awaiting signal' : lightOn ? 'On' : 'Off'}{hasData && <small>{mode === 'AUTO' ? 'Auto' : 'Manual'}</small>}</dd>
          </div>
        </dl>

        <div className="hero-timer-note"><Timer size={14} aria-hidden="true" /><span>{!hasData ? 'Connect your device to see your entryway live.' : timerActive ? `Light turns off in ${remainingSec}s` : `Light stays on for ${totalSec}s after closing.`}</span></div>
        <div className="countdown-track" data-active={hasData && !!timerActive} aria-hidden="true"><span style={{ width: timerPercent + '%' }} /></div>
        <a className="entrance-link" href="#hardware-cards">View controls <span><ArrowUpRight size={16} aria-hidden="true" /></span></a>
      </div>

      <div className="entrance-visual">
        <div className="hero-scene-heading">
          <span>FRONT ENTRANCE</span>
          <span className="hero-connection"><i />{hasData ? 'Live' : 'Offline'}</span>
        </div>
        <div className="hero-scene-stage">
          <div className="hero-scene-light" aria-hidden="true" />
          <div className="hero-wall-lines" aria-hidden="true" />
          <div className="hero-ground" aria-hidden="true" />
          <ArchitecturalDoorScene
            doorOpen={doorOpen}
            lightOn={lightOn}
            isDark={isDark}
            lightPercentage={lightPercentage}
            isConnected={isConnected}
          />
        </div>
        <div className="hero-scene-footer">
          <span className="hero-ambient-reading"><Sun size={14} aria-hidden="true" />{hasData && lightPercentage !== undefined ? `${lightPercentage}% ambient light` : 'Waiting for live data'}</span>
          <button type="button" className="hero-motion-toggle" aria-pressed={motionPaused} aria-label="Pause ambient animation" title={motionPaused ? 'Resume ambient animation' : 'Pause ambient animation'} onClick={() => setMotionPaused((paused) => !paused)}>
            {motionPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
};
export default DoorwayHeroVisualizer;
