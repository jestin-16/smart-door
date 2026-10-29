import React, { useState, useEffect, useRef } from 'react';
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

/**
 * Custom hook to smoothly interpolate numerical changes with a damped cubic deceleration.
 * Initializes synchronously to `value` so tests and initial render have exact numbers with no flash.
 */
function useSmoothNumber(value: number | undefined, precision = 1): number | undefined {
  const [displayValue, setDisplayValue] = useState<number | undefined>(value);
  const animFrameRef = useRef<number | null>(null);
  const currentValRef = useRef<number | undefined>(value);

  useEffect(() => {
    if (value === undefined) {
      animFrameRef.current = requestAnimationFrame(() => {
        setDisplayValue(undefined);
        currentValRef.current = undefined;
      });
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (currentValRef.current === undefined || reducedMotion) {
      animFrameRef.current = requestAnimationFrame(() => {
        currentValRef.current = value;
        setDisplayValue(value);
      });
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    const startVal = currentValRef.current;
    const targetVal = value;
    if (startVal === targetVal) return;

    let startTime: number | undefined;
    const duration = 650; // ms smooth glide

    const tick = (now: number) => {
      startTime ??= now;
      const elapsed = now - startTime;
      const progress = Math.max(0, Math.min(1, elapsed / duration));
      // Silky smooth cubic bezier ease-out: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;
      const factor = Math.pow(10, precision);
      const nextDisplay = Math.round(current * factor) / factor;
      setDisplayValue(nextDisplay);
      currentValRef.current = current;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(targetVal);
        currentValRef.current = targetVal;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, precision]);

  return displayValue;
}

export const AmbientLightCard: React.FC<AmbientLightCardProps> = ({
  lightPercentage, lightAdc, lightThreshold = 2000, lightHysteresis = 100,
  isDark, isConnected, onUpdateThreshold,
}) => {
  const hasData = isConnected && lightPercentage !== undefined && lightAdc !== undefined;

  // Smoothly interpolated values for seamless visual transitions
  const displayPercentage = useSmoothNumber(lightPercentage, 1);
  const displayAdc = useSmoothNumber(lightAdc, 0);

  const formattedPercentage = displayPercentage !== undefined
    ? (Number.isInteger(lightPercentage) && Number.isInteger(displayPercentage)
        ? String(displayPercentage)
        : displayPercentage.toFixed(1))
    : '--';

  const sliderPercent = Math.min(100, Math.max(0, ((lightThreshold - 100) / 3400) * 100));
  const activeAdc = displayAdc ?? lightAdc ?? 0;
  const currentAdcPercent = hasData ? Math.min(100, Math.max(0, ((activeAdc - 100) / 3400) * 100)) : 0;
  const fillPercentage = hasData ? Math.min(100, Math.max(3, displayPercentage ?? lightPercentage ?? 0)) : 0;

  return (
    <article className="control-row relative" data-online={hasData} data-dark={hasData && isDark}>
      {/* Ambient Atmospheric Glow that breathes with ambient room light */}
      <div
        className="ambient-card-halo"
        aria-hidden="true"
        style={{
          opacity: hasData ? Math.min(0.65, Math.max(0.1, (fillPercentage / 100) * 0.65)) : 0,
        }}
      />

      <span className="control-index" aria-hidden="true">02</span>
      <div className="control-copy">
        <h3>Ambient light</h3>
        <div className="control-reading">
          <strong className="reading-value tabular-nums">{hasData ? formattedPercentage + '%' : '--'}</strong>
          <span className="control-status">
            {hasData && (
              isDark ? (
                <span className="celestial-badge dark"><Moon size={13} strokeWidth={1.6} aria-hidden="true" /></span>
              ) : (
                <span className="celestial-badge bright"><Sun size={13} strokeWidth={1.6} aria-hidden="true" /></span>
              )
            )}
            {!hasData ? 'STANDBY' : isDark ? 'DARK' : 'BRIGHT'}
          </span>
        </div>

        {/* Smooth Living Ambient Level Bar */}
        <div className="ambient-level-track" aria-hidden="true" title={`Illuminance: ${hasData ? formattedPercentage : '--'}%`}>
          <div
            className="ambient-level-fill"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <p className="control-description">{!hasData ? 'Awaiting sensor reading' : isDark ? 'A softer light for a darker evening.' : 'A little daylight is all you need.'}</p>
      </div>
      <div className="control-action">
        <div className="control-setting">
          <label htmlFor="darkness-threshold">Darkness threshold</label>
          <span className="threshold-value-pill">{lightThreshold}<small> ADC</small></span>
        </div>

        <div className="control-range-wrapper">
          <input
            id="darkness-threshold"
            className="control-range"
            aria-label="Darkness threshold"
            disabled={!hasData}
            type="range"
            min="100"
            max="3500"
            step="50"
            value={lightThreshold}
            onChange={(e) => onUpdateThreshold(Number(e.target.value))}
            style={{ '--range-fill': sliderPercent + '%' } as React.CSSProperties}
          />
          {hasData && (
            <div className="control-meter-bar" aria-hidden="true" title={`Current ADC: ${lightAdc}`}>
              <div className="control-meter-fill" style={{ width: `${currentAdcPercent}%` }} />
              <span className="control-meter-marker" style={{ left: `${currentAdcPercent}%` }} />
            </div>
          )}
        </div>

        <div className="control-range-labels" aria-hidden="true">
          <span className={sliderPercent < 35 ? 'label-highlight' : ''}>More sensitive</span>
          <span className={sliderPercent > 65 ? 'label-highlight' : ''}>Less sensitive</span>
        </div>

        <details className="control-details">
          <summary>Sensor details</summary>
          <div className="control-detail-content">
            {hasData && <p>({displayAdc ?? lightAdc} / 4095 ADC)</p>}
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



