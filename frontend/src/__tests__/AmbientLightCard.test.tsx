import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AmbientLightCard } from '../components/AmbientLightCard';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Ambient reading transitions', () => {
  it('shows the first sensor reading after connecting and reconnecting', async () => {
    const onUpdateThreshold = vi.fn();
    const { rerender } = render(<AmbientLightCard isConnected={false} onUpdateThreshold={onUpdateThreshold} />);
    rerender(<AmbientLightCard isConnected lightPercentage={22.3} lightAdc={3180} onUpdateThreshold={onUpdateThreshold} />);
    expect(await screen.findByText('22.3%')).toBeInTheDocument();
    expect(screen.getByText('(3180 / 4095 ADC)')).toBeInTheDocument();
    rerender(<AmbientLightCard isConnected={false} onUpdateThreshold={onUpdateThreshold} />);
    await waitFor(() => expect(screen.getByText('--')).toBeInTheDocument());
    rerender(<AmbientLightCard isConnected lightPercentage={61} lightAdc={1600} onUpdateThreshold={onUpdateThreshold} />);
    expect(await screen.findByText('61%')).toBeInTheDocument();
  });

  it('updates directly when reduced motion is preferred', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const onUpdateThreshold = vi.fn();
    const { rerender } = render(<AmbientLightCard isConnected lightPercentage={22} lightAdc={3180} onUpdateThreshold={onUpdateThreshold} />);
    rerender(<AmbientLightCard isConnected lightPercentage={80} lightAdc={800} onUpdateThreshold={onUpdateThreshold} />);
    await waitFor(() => expect(screen.getByText('80%')).toBeInTheDocument(), { timeout: 200 });
    expect(screen.getByText('(800 / 4095 ADC)')).toBeInTheDocument();
  });
});
