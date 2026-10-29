import React from 'react';
import { Timer } from 'lucide-react';
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
  lightOn, mode = 'AUTO', timerActive, remainingDelayMs = 0, offDelayMs = 15000,
  isConnected, onSetMode, onToggleLight,
}) => {
  const hasData = isConnected && lightOn !== undefined;
  const showTimer = hasData && timerActive;
  const remainingSeconds = (remainingDelayMs / 1000).toFixed(1);
  const progressPercent = showTimer && offDelayMs > 0 ? Math.max(0, Math.min(100, (remainingDelayMs / offDelayMs) * 100)) : 0;

  return (
    <article className="control-row" data-online={hasData} data-lit={hasData && lightOn}>
      <span className="control-index" aria-hidden="true">03</span>
      <div className="control-copy">
        <h3>Entry lighting</h3>
        <div className="control-reading">
          <strong key={hasData ? String(lightOn) : 'offline'} className="reading-value">{!hasData ? '--' : lightOn ? 'Light ON' : 'Light OFF'}</strong>
          <span className="control-status"><i /><span className="sr-only">{!hasData ? 'STANDBY' : mode + ' MODE'}</span></span>
        </div>
        <p className="control-description">{!hasData ? 'Awaiting actuator confirmation' : lightOn ? 'A warm welcome, just for you.' : 'Ready for your next arrival.'}</p>
      </div>
      <div className="control-action">
        <div className="control-light-setting">
          <span>Entry light</span>
          <button
            type="button"
            className="control-switch"
            disabled={!hasData}
            aria-label={lightOn ? 'Turn OFF' : 'Turn ON'}
            aria-pressed={hasData && lightOn}
            onClick={() => onToggleLight(!lightOn)}
          >
            <span className="switch-thumb"><i className="thumb-glow" /></span>
          </button>
        </div>
        <div className="control-mode" data-mode={mode} data-disabled={!hasData} role="group" aria-label="Control mode">
          <span className="control-mode-pill" aria-hidden="true" />
          <button type="button" disabled={!hasData} aria-pressed={mode === 'AUTO'} onClick={() => onSetMode('AUTO')}>Automatic</button>
          <button type="button" disabled={!hasData} aria-pressed={mode === 'MANUAL'} onClick={() => onSetMode('MANUAL')}>Manual</button>
        </div>
        <div className="control-timer" data-active={!!showTimer}>
          <div className="control-note">
            <span className={`timer-icon-wrap ${showTimer ? 'timer-ticking' : ''}`}>
              <Timer size={13} aria-hidden="true" />
            </span>
            <span>{showTimer ? <><span className="sr-only">Door Closed Auto-Off Timer Active: </span><span>{remainingSeconds}s remaining</span></> : 'Switch-off delay · ' + offDelayMs / 1000 + 's'}</span>
          </div>
          <div className="control-timer-track" aria-hidden="true">
            <span style={{ width: progressPercent + '%' }} className="control-timer-fill" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default LightingControlCard;


