/** Shared timings for the hinged leaf, its shadow, and the floor light. */
export const DOOR_ANIMATION_CONFIG = {
  targetOpenAngle: -74,
  openDurationMs: 780,
  openEasing: 'cubic-bezier(0.22, 0.68, 0.2, 1)',
  closeDurationMs: 620,
  closeEasing: 'cubic-bezier(0.32, 0, 0.2, 1)',
  handleReleaseDurationMs: 480,
  handleMaxAngle: -11,
  lightFadeDurationMs: 420,
  pendantSwayDurationMs: 4200,
} as const;

export type DoorAnimationConfig = typeof DOOR_ANIMATION_CONFIG;
