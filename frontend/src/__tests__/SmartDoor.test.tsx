import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestEdgeStateMachine } from './testFixtures';
import { DoorStatusCard } from '../components/DoorStatusCard';
import { AmbientLightCard } from '../components/AmbientLightCard';
import { LightingControlCard } from '../components/LightingControlCard';

describe('Real Hardware Edge Logic & State Machine Specification', () => {
  let sim: TestEdgeStateMachine;

  beforeEach(() => {
    sim = new TestEdgeStateMachine();
  });

  it('1. Magnetic reed switch state determines door state with configurable mapping', () => {
    expect(sim.getTelemetry().doorOpen).toBe(false);

    // Neodymium magnet moved away (switch opens, GPIO HIGH) -> Door OPEN (Standard mapping)
    sim.setReedSwitch(false, true);
    expect(sim.getTelemetry().doorOpen).toBe(true);
    expect(sim.getTelemetry().reedSwitchClosed).toBe(false);
    expect(sim.getTelemetry().magnetDetected).toBe(false);

    // Neodymium magnet moved proximate (switch closes, GPIO LOW) -> Door CLOSED (Standard mapping)
    sim.setReedSwitch(true, true);
    expect(sim.getTelemetry().doorOpen).toBe(false);
    expect(sim.getTelemetry().reedSwitchClosed).toBe(true);
    expect(sim.getTelemetry().magnetDetected).toBe(true);

    // Inverted/Reverse mounting mapping:
    sim.setReedSwitch(true, false);
    expect(sim.getTelemetry().doorOpen).toBe(true);
    sim.setReedSwitch(false, false);
    expect(sim.getTelemetry().doorOpen).toBe(false);
  });

  it('2. OPEN + DARK turns the LED ON automatically (ADC ~3200)', () => {
    // Ambient light at dark level (~3200 ADC > 2000 threshold)
    sim.setLightAdc(3200);
    expect(sim.getTelemetry().isDark).toBe(true);

    sim.setDoor(true); // Door opened via dashboard
    const tel = sim.getTelemetry();
    expect(tel.doorOpen).toBe(true);
    expect(tel.lightOn).toBe(true);
  });

  it('3. OPEN + BRIGHT keeps the automatic light OFF (ADC ~800)', () => {
    // Ambient light at bright daylight (~800 ADC < 2000 threshold)
    sim.setLightAdc(800);
    expect(sim.getTelemetry().isDark).toBe(false);

    sim.setDoor(true); // Door opened via dashboard
    const tel = sim.getTelemetry();
    expect(tel.doorOpen).toBe(true);
    expect(tel.lightOn).toBe(false);
  });

  it('4. Closing the door triggers the defined 15-second shutdown delay', () => {
    sim.setLightAdc(3200); // Dark
    sim.setDoor(true);      // Open door -> LED ON
    expect(sim.getTelemetry().lightOn).toBe(true);

    sim.setDoor(false);     // Close door -> 15s delay starts
    const tel = sim.getTelemetry();
    expect(tel.doorOpen).toBe(false);
    expect(tel.lightOn).toBe(true); // Still ON during delay
    expect(tel.timerActive).toBe(true);
    expect(tel.remainingDelayMs).toBe(15000);
  });

  it('5. Reopening the door cancels the pending shutdown', () => {
    sim.setLightAdc(3200); // Dark
    sim.setDoor(true);      // Open
    sim.setDoor(false);     // Close -> Timer starts
    expect(sim.getTelemetry().timerActive).toBe(true);

    sim.setDoor(true);      // Reopen door before timeout
    const tel = sim.getTelemetry();
    expect(tel.doorOpen).toBe(true);
    expect(tel.timerActive).toBe(false);
    expect(tel.lightOn).toBe(true); // Light remains ON
  });

  it('6. LDR threshold hysteresis prevents rapid switching near boundary', () => {
    // Threshold = 2000 ADC, Hysteresis = 100 ADC
    // Dark trigger = (2000 + 100) = 2100 ADC
    // Bright trigger = (2000 - 100) = 1900 ADC

    // Start bright (800 ADC)
    sim.setLightAdc(800);
    expect(sim.getTelemetry().isDark).toBe(false);

    // Rise to 2050 ADC: Inside hysteresis band [1900, 2100]
    sim.setLightAdc(2050);
    // Must NOT switch to dark yet because it has not crossed (2000 + 100)
    expect(sim.getTelemetry().isDark).toBe(false);

    // Rise to 2150 ADC: Crosses above 2100
    sim.setLightAdc(2150);
    expect(sim.getTelemetry().isDark).toBe(true);

    // Drop to 2050 ADC: Inside hysteresis band
    sim.setLightAdc(2050);
    // Must remain dark until crossing below (2000 - 100)
    expect(sim.getTelemetry().isDark).toBe(true);

    // Drop to 1850 ADC: Crosses below 1900
    sim.setLightAdc(1850);
    expect(sim.getTelemetry().isDark).toBe(false);
  });
});

describe('Dashboard Hardware State & Disconnected State Presentation', () => {
  it('displays unavailable values as "--" when device is disconnected', () => {
    render(<DoorStatusCard isOpen={undefined} isConnected={false} />);
    expect(screen.getAllByText('--').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('STANDBY')).toBeInTheDocument();
    expect(screen.getByText(/Awaiting hardware telemetry packet/i)).toBeInTheDocument();
  });

  it('displays genuine door open state and reed switch status when connected', () => {
    render(<DoorStatusCard isOpen={true} reedSwitchClosed={false} magnetDetected={false} isConnected={true} />);
    expect(screen.getByText('Door Open')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText(/Door is OPEN/i)).toBeInTheDocument();
    expect(screen.getByText(/SWITCH OPEN \(GPIO HIGH\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Magnet Not Detected \(Absent\)/i)).toBeInTheDocument();
    expect(screen.getByText(/GPIO 27 \(INPUT_PULLUP\)/i)).toBeInTheDocument();
  });

  it('displays genuine door closed state and magnet detected when connected', () => {
    render(<DoorStatusCard isOpen={false} reedSwitchClosed={true} magnetDetected={true} isConnected={true} />);
    expect(screen.getByText('Door Closed')).toBeInTheDocument();
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
    expect(screen.getByText(/Door is CLOSED/i)).toBeInTheDocument();
    expect(screen.getByText(/SWITCH CLOSED \(GPIO LOW\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Magnet Detected \(Proximate\)/i)).toBeInTheDocument();
  });

  it('displays "--" for illuminance when light sensor is disconnected', () => {
    render(
      <AmbientLightCard
        lightPercentage={undefined}
        lightAdc={undefined}
        isConnected={false}
        onUpdateThreshold={vi.fn()}
      />
    );
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Awaiting sensor reading')).toBeInTheDocument();
  });

  it('displays actual illuminance and hysteresis when connected', () => {
    render(
      <AmbientLightCard
        lightPercentage={22.3}
        lightAdc={3180}
        lightThreshold={2000}
        lightHysteresis={100}
        isDark={true}
        isConnected={true}
        onUpdateThreshold={vi.fn()}
      />
    );
    expect(screen.getByText('22.3%')).toBeInTheDocument();
    expect(screen.getByText('(3180 / 4095 ADC)')).toBeInTheDocument();
    expect(screen.getByText('DARK')).toBeInTheDocument();
    expect(screen.getByText(/±100 ADC Hysteresis Active/i)).toBeInTheDocument();
  });

  it('displays "--" for LED actuator when disconnected', () => {
    render(
      <LightingControlCard
        lightOn={undefined}
        isConnected={false}
        onSetMode={vi.fn()}
        onToggleLight={vi.fn()}
      />
    );
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Awaiting actuator confirmation')).toBeInTheDocument();
  });

  it('displays active 15s timer when confirmed by hardware telemetry', () => {
    render(
      <LightingControlCard
        lightOn={true}
        mode="AUTO"
        timerActive={true}
        remainingDelayMs={11400}
        offDelayMs={15000}
        isConnected={true}
        onSetMode={vi.fn()}
        onToggleLight={vi.fn()}
      />
    );
    expect(screen.getByText('Light ON')).toBeInTheDocument();
    expect(screen.getByText('11.4s remaining')).toBeInTheDocument();
    expect(screen.getByText(/Door Closed Auto-Off Timer Active/i)).toBeInTheDocument();
  });

  it('renders the control workspace with navigation and staggered content', async () => {
    // Import App dynamically to verify full integration
    const { App } = await import('../App');
    const { container } = render(<App />);

    expect(screen.getByRole('navigation', { name: 'Dashboard navigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your entrance, at a glance.' })).toBeInTheDocument();

    const revealUpElements = container.querySelectorAll('.animate-reveal-up');
    expect(revealUpElements.length).toBeGreaterThanOrEqual(4); // Subheader + 3 Sensor cards + Event table

    // Verify staggered delays exist
    expect(container.querySelector('.anim-delay-200')).toBeInTheDocument();
    expect(container.querySelector('.anim-delay-350')).toBeInTheDocument();
    expect(container.querySelector('.anim-delay-500')).toBeInTheDocument();
    expect(container.querySelector('.anim-delay-650')).toBeInTheDocument();
  });
});

