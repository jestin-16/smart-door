import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface AmbientLightCardProps {
  lightPercentage?: number;
  lightAdc?: number;
  lightThreshold?: number;
  lightHysteresis?: number;
  isDark?: boolean;
  isConnected: boolean;
  onUpdateThreshold: (threshold: number) => void;
}

export const AmbientLightCard: React.FC<AmbientLightCardProps> = ({
  lightPercentage, lightAdc, lightThreshold = 2000, lightHysteresis = 100,
  isDark, isConnected, onUpdateThreshold,
}) => {
  const hasData = isConnected && lightPercentage !== undefined && lightAdc !== undefined;
  const sliderPercent = Math.min(100, Math.max(0, ((lightThreshold - 100) / 3400) * 100));

  return (
    <article className="control-row" data-online={hasData}>
      <span className="control-index" aria-hidden="true">02</span>
      <div className="control-copy">
        <h3>Ambient light</h3>
        <div className="control-reading">
          <strong className="reading-value">{hasData ? lightPercentage + '%' : '--'}</strong>
          <span className="control-status">{hasData && (isDark ? <Moon size={14} strokeWidth={1.4} aria-hidden="true" /> : <Sun size={14} strokeWidth={1.4} aria-hidden="true" />)}{!hasData ? 'STANDBY' : isDark ? 'DARK' : 'BRIGHT'}</span>
        </div>
        <p className="control-description">{!hasData ? 'Awaiting sensor reading' : isDark ? 'A softer light for a darker evening.' : 'A little daylight is all you need.'}</p>
      </div>
      <div className="control-action">
        <div className="control-setting">
          <label htmlFor="darkness-threshold">Darkness threshold</label><span>{lightThreshold}<small> ADC</small></span>
        </div>
        <input id="darkness-threshold" className="control-range" aria-label="Darkness threshold" disabled={!hasData} type="range" min="100" max="3500" step="50" value={lightThreshold} onChange={(e) => onUpdateThreshold(Number(e.target.value))} style={{ '--range-fill': sliderPercent + '%' } as React.CSSProperties} />
        <div className="control-range-labels" aria-hidden="true"><span>More sensitive</span><span>Less sensitive</span></div>
        <details className="control-details">
          <summary>Sensor details</summary>
          <div className="control-detail-content">
            {hasData && <p>({lightAdc} / 4095 ADC)</p>}
            <p>ADC1_CH6 (GPIO 34)</p>
            <p>&plusmn;{lightHysteresis} ADC Hysteresis Active</p>
            <p>Prevents flickering near the darkness threshold.</p>
          </div>
        </details>
      </div>
    </article>
  );
};

export default AmbientLightCard;

