/**
 * --------------------------------------------------------------------------
 * ARCHITECTURAL DOOR ANIMATION CONFIGURATION
 * Centralized tuning parameters for spring physics, timings, and light effects.
 * --------------------------------------------------------------------------
 */
export const DOOR_ANIMATION_CONFIG = {
  // 1. Spring Dynamics & Timing Equivalents
  mass: 1.25,                  // Solid white-oak leaf mass (kg)
  stiffness: 64,               // Rotational spring tension (N/m)
  damping: 11.2,               // Damping coefficient (~0.62 underdamped for authentic settle)

  // 2. Pivot & Angles
  restingClosedAngle: 0,       // Resting closed angle in degrees (0°)
  targetOpenAngle: -74,        // Open angle in degrees (-74°)
  overshootAmountDeg: 2.8,     // Momentum overshoot past resting target (~2.8°)

  // 3. Synchronized Durations & Curves (Calm, architectural pace synced with lighting)
  openDurationMs: 1300,        // Calibrated graceful open duration (ms)
  openEasing: 'cubic-bezier(0.18, 0.96, 0.26, 1.0)',
  closeDurationMs: 1100,       // Calibrated weighted close duration (ms)
  closeEasing: 'cubic-bezier(0.28, 0.08, 0.2, 1.0)',

  // 4. Latch & Handle Mechanics
  anticipationDurationMs: 110, // Handle depression before swing release (ms)
  handleMaxAngle: 11,          // Handle downward turn during latch release (deg)
  latchCompressionPx: 1.2,     // Micro inward compression against frame stop (px)

  // 5. Closing Contact & Settle
  contactReboundDamping: 0.16, // Velocity coefficient on frame stop contact
  latchSeatClickDurationMs: 90,// Duration of handle latch click on seat (ms)
  latchSeatClickAngle: 3.5,    // Downward latch click angle (deg)

  // 6. Lighting & Atmosphere (100% Synchronized with Door Opening & Closing)
  lightOpenSyncDurationMs: 1300, // Light unfolds in exact unison with door open
  lightCloseSyncDurationMs: 1100,// Light narrows in exact unison with door close
  baseLightIntensity: 0.92,    // Warm light wedge intensity multiplier
  dustMoteCount: 8,            // Count of atmospheric dust motes
  matHighlightIntensity: 0.35, // Welcome mat illumination factor
  parallaxShiftPx: 2.0,        // Subtle depth parallax (px)
} as const;

export type DoorAnimationConfig = typeof DOOR_ANIMATION_CONFIG;
