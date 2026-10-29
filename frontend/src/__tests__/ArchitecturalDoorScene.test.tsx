import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ArchitecturalDoorScene from '../components/ArchitecturalDoorScene';
import { DOOR_ANIMATION_CONFIG } from '../components/doorAnimationConfig';

describe('ArchitecturalDoorScene Physical Simulation & Rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders awaiting telemetry state when not connected', () => {
    render(<ArchitecturalDoorScene isConnected={false} />);
    const scene = screen.getByRole('img');
    expect(scene).toHaveAttribute('aria-label', 'Door visualization: awaiting live telemetry');
    expect(scene).toHaveAttribute('data-online', 'false');
  });

  it('renders closed resting state with correct semantic attributes', () => {
    render(<ArchitecturalDoorScene isConnected={true} doorOpen={false} lightOn={false} />);
    const scene = screen.getByRole('img');
    expect(scene).toHaveAttribute('aria-label', 'Door closed, light off');
    expect(scene).toHaveAttribute('data-open', 'false');
    expect(scene).toHaveAttribute('data-lit', 'false');
  });

  it('renders open state with light on semantic attributes', () => {
    render(<ArchitecturalDoorScene isConnected={true} doorOpen={true} lightOn={true} lightPercentage={65} />);
    const scene = screen.getByRole('img');
    expect(scene).toHaveAttribute('aria-label', 'Door open, light on');
    expect(scene).toHaveAttribute('data-open', 'true');
    expect(scene).toHaveAttribute('data-lit', 'true');
  });

  it('includes architectural elements: hinges, handle, lock, 3D thickness edge, and light spill', () => {
    const { container } = render(
      <ArchitecturalDoorScene isConnected={true} doorOpen={true} lightOn={true} />
    );

    expect(container.querySelector('.door-leaf')).toBeInTheDocument();
    expect(container.querySelector('.door-handle')).toBeInTheDocument();
    expect(container.querySelector('.door-thickness-edge')).toBeInTheDocument();
    expect(container.querySelector('.door-light-spill')).toBeInTheDocument();
    expect(container.querySelector('.door-shadow')).toBeInTheDocument();
    expect(container.querySelector('.scene-doormat')).toBeInTheDocument();
    expect(container.querySelectorAll('.door-hinge').length).toBe(2);
  });

  it('supports mid-flight interruption without throwing', () => {
    const { rerender } = render(
      <ArchitecturalDoorScene isConnected={true} doorOpen={false} lightOn={false} />
    );

    // Open door
    rerender(<ArchitecturalDoorScene isConnected={true} doorOpen={true} lightOn={true} />);
    act(() => {
      vi.advanceTimersByTime(50); // Mid-anticipation
    });

    // Rapid toggle: switch back to closed mid-flight
    rerender(<ArchitecturalDoorScene isConnected={true} doorOpen={false} lightOn={false} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Rapid toggle: switch back to open
    rerender(<ArchitecturalDoorScene isConnected={true} doorOpen={true} lightOn={true} />);
    act(() => {
      vi.advanceTimersByTime(1200); // Allow full settle
    });

    const scene = screen.getByRole('img');
    expect(scene).toHaveAttribute('data-open', 'true');
  });

  it('exposes the expected DOOR_ANIMATION_CONFIG parameters', () => {
    expect(DOOR_ANIMATION_CONFIG.mass).toBe(1.25);
    expect(DOOR_ANIMATION_CONFIG.stiffness).toBe(64);
    expect(DOOR_ANIMATION_CONFIG.damping).toBe(11.2);
    expect(DOOR_ANIMATION_CONFIG.targetOpenAngle).toBe(-74);
    expect(DOOR_ANIMATION_CONFIG.overshootAmountDeg).toBe(2.8);
    expect(DOOR_ANIMATION_CONFIG.dustMoteCount).toBe(8);
  });
});
