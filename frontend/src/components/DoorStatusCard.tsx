import React from 'react';
import { Radio } from 'lucide-react';

interface DoorStatusCardProps {
  isOpen?: boolean;
  reedSwitchClosed?: boolean;
  magnetDetected?: boolean;
  isConnected: boolean;
  onSetDoorState?: (state: 'OPEN' | 'CLOSED') => void;
}

export const DoorStatusCard: React.FC<DoorStatusCardProps> = ({
  isOpen, reedSwitchClosed, magnetDetected, isConnected,
}) => {
  const hasData = isConnected && isOpen !== undefined;
  const isSwitchClosed = reedSwitchClosed ?? (hasData ? !isOpen : undefined);
  const isMagDetected = magnetDetected ?? isSwitchClosed;

  return (
    <article className="control-row" data-online={hasData} data-open={hasData && isOpen}>
      <span className="control-index" aria-hidden="true">01</span>
      <div className="control-copy">
        <h3>Door sensor</h3>
        <div className="control-reading">
          <strong key={hasData ? String(isOpen) : 'offline'} className="reading-value">{!hasData ? '--' : isOpen ? 'Door Open' : 'Door Closed'}</strong>
          <span className="control-status"><i /><span className="sr-only">{!hasData ? 'STANDBY' : isOpen ? 'OPEN' : 'CLOSED'}</span></span>
        </div>
        <p className="control-description">{!hasData ? 'Your door status will appear when connected.' : isOpen ? 'Door is OPEN. Welcome home.' : 'Door is CLOSED. All settled for now.'}</p>
      </div>
      <div className="control-action">
        <div className="control-note"><Radio size={15} strokeWidth={1.4} aria-hidden="true" /><span>{hasData ? 'Following your door, in real time.' : 'Waiting for a signal'}</span></div>
        <details className="control-details">
          <summary>Sensor details</summary>
          <div className="control-detail-content">
            {!hasData && <p>Awaiting hardware telemetry packet...</p>}
            <dl>
              <div><dt>Reed contact</dt><dd>{!hasData ? '--' : isSwitchClosed ? 'SWITCH CLOSED (GPIO LOW)' : 'SWITCH OPEN (GPIO HIGH)'}</dd></div>
              <div><dt>Magnet</dt><dd>{!hasData ? '--' : isMagDetected ? 'Magnet Detected (Proximate)' : 'Magnet Not Detected (Absent)'}</dd></div>
              <div><dt>Hardware input</dt><dd>GPIO 27 (INPUT_PULLUP)</dd></div>
              <div><dt>Debounce</dt><dd>50ms</dd></div>
            </dl>
          </div>
        </details>
      </div>
    </article>
  );
};

export default DoorStatusCard;
