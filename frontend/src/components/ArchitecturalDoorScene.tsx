import React from 'react';
import { DOOR_ANIMATION_CONFIG } from './doorAnimationConfig';

export { DOOR_ANIMATION_CONFIG };

const DUST_MOTES = [
  { top: '22%', left: '46%', delay: '0s', duration: '4.8s', scale: 0.9, baseOpacity: 0.5 },
  { top: '38%', left: '52%', delay: '1.2s', duration: '5.4s', scale: 1.1, baseOpacity: 0.6 },
  { top: '55%', left: '42%', delay: '2.1s', duration: '4.2s', scale: 0.8, baseOpacity: 0.45 },
  { top: '68%', left: '48%', delay: '0.6s', duration: '5.8s', scale: 1.2, baseOpacity: 0.55 },
  { top: '32%', left: '58%', delay: '2.8s', duration: '4.5s', scale: 0.7, baseOpacity: 0.4 },
  { top: '48%', left: '36%', delay: '1.7s', duration: '5.1s', scale: 1.0, baseOpacity: 0.5 },
  { top: '62%', left: '56%', delay: '3.3s', duration: '4.9s', scale: 0.85, baseOpacity: 0.48 },
  { top: '75%', left: '44%', delay: '0.9s', duration: '5.6s', scale: 1.15, baseOpacity: 0.52 },
];

export interface ArchitecturalDoorSceneProps {
  doorOpen?: boolean;
  lightOn?: boolean;
  isDark?: boolean;
  lightPercentage?: number;
  isConnected: boolean;
}

export const ArchitecturalDoorScene: React.FC<ArchitecturalDoorSceneProps> = ({
  doorOpen,
  lightOn,
  isDark: _isDark,
  lightPercentage,
  isConnected,
}) => {
  const hasData = Boolean(isConnected && doorOpen != null && lightOn != null);
  const isTargetOpen = Boolean(hasData && doorOpen);
  const isTargetLit = Boolean(hasData && lightOn);

  // Derived ambient light multiplier for light spill intensity
  const ambientFactor =
    typeof lightPercentage === 'number' && Number.isFinite(lightPercentage)
      ? Math.max(0.35, Math.min(1.0, (100 - lightPercentage * 0.35) / 100))
      : 0.85;

  return (
    <div
      className="door-scene"
      data-open={isTargetOpen ? 'true' : 'false'}
      data-lit={isTargetLit ? 'true' : 'false'}
      data-online={hasData}
      role="img"
      aria-label={
        !hasData
          ? 'Door visualization: awaiting live telemetry'
          : `Door ${doorOpen ? 'open' : 'closed'}, light ${lightOn ? 'on' : 'off'}`
      }
      style={
        {
          '--ambient-light-factor': ambientFactor.toFixed(2),
          '--door-open-angle': `${DOOR_ANIMATION_CONFIG.targetOpenAngle}deg`,
          '--door-open-duration': `${DOOR_ANIMATION_CONFIG.openDurationMs}ms`,
          '--door-open-ease': DOOR_ANIMATION_CONFIG.openEasing,
          '--door-close-duration': `${DOOR_ANIMATION_CONFIG.closeDurationMs}ms`,
          '--door-close-ease': DOOR_ANIMATION_CONFIG.closeEasing,
          '--handle-release-duration': `${DOOR_ANIMATION_CONFIG.handleReleaseDurationMs}ms`,
          '--handle-release-angle': `${DOOR_ANIMATION_CONFIG.handleMaxAngle}deg`,
          '--light-fade-duration': `${DOOR_ANIMATION_CONFIG.lightFadeDurationMs}ms`,
          '--pendant-sway-duration': `${DOOR_ANIMATION_CONFIG.pendantSwayDurationMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="scene-wall" aria-hidden="true">
        {/* The shade, bulb, and beam swing together from the ceiling mount. */}
        <div className="pendant-mount" />
        <div className="scene-pendant">
          <div className="pendant-cord" />
          <div className="scene-beam" />
          <div className="pendant-halo" />
          <div className="pendant-bulb" />
          <div className="scene-lamp" />
        </div>
        <div className="scene-floor" />
        <div className="doorstep" />

        {/* Warm floor light expands as the doorway opens. */}
        <div className="door-light-spill" />

        {/* Floating Atmospheric Dust Motes drifting inside the warm light cone */}
        <div className="scene-dust-field">
          {DUST_MOTES.map((mote, i) => (
            <span
              key={i}
              className="dust-mote"
              style={{
                top: mote.top,
                left: mote.left,
                animationDelay: mote.delay,
                animationDuration: mote.duration,
                opacity: mote.baseOpacity,
                transform: `scale(${mote.scale})`,
              }}
            />
          ))}
        </div>

        {/* Welcome Mat with Subtle Ambient Gleam */}
        <div className="scene-doormat"><span>WELCOME</span></div>

        {/* Physical Floor Contact Shadow */}
        <div className="door-shadow" />

        {/* Architectural 3D Door Frame & Interior Chamber */}
        <div className="door-frame">
          <div className="door-interior">
            <span />
          </div>

          {/* Fluted walnut leaf with a glass inset and brass hardware. */}
          <div className="door-leaf">
            <div className="door-inlay door-inlay-top" />
            <div className="door-inlay door-inlay-bottom" />
            <div className="door-peephole" />
            <div className="door-mail-slot" />
            <div className="door-lock" />

            {/* Solid Brass Handle with Mechanical Depression Reaction */}
            <div className="door-handle" />

            <i className="door-hinge door-hinge-top" />
            <i className="door-hinge door-hinge-bottom" />

            {/* Realistic 3D Thickness Edge Plane */}
            <div className="door-thickness-edge" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturalDoorScene;
