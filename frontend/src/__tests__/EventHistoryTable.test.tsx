import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EventHistoryTable } from '../components/EventHistoryTable';
import type { DoorEvent } from '../types';

const events: DoorEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: `event-${i}`, deviceId: 'front-door',
  eventType: i < 6 ? 'DOOR_OPENED' : 'LIGHT_ON',
  createdAt: new Date(2026, 9, 28, 12, i).toISOString(),
  details: { description: `Activity number ${i}` },
}));
afterEach(cleanup);
describe('Activity progressive disclosure', () => {
  it('shows five events, expands in batches, and collapses', () => {
    render(<EventHistoryTable events={events} />);
    expect(screen.getAllByRole('row')).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: /Show more/ }));
    expect(screen.getAllByRole('row')).toHaveLength(11);
    fireEvent.click(screen.getByRole('button', { name: /Show more/ }));
    expect(screen.getAllByRole('row')).toHaveLength(13);
    expect(screen.queryByRole('button', { name: /Show more/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });
  it('resets the limit on filtering and searches all loaded events', () => {
    render(<EventHistoryTable events={events} />);
    fireEvent.click(screen.getByRole('button', { name: /Show more/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(screen.getByText('Showing 5 of 6 events')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Filter events' }), { target: { value: 'Activity number 11' } });
    expect(screen.getByText('Activity number 11')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 1 events')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show more/ })).toBeNull();
  });
  it('handles an empty history without expansion controls', () => {
    render(<EventHistoryTable events={[]} />);
    expect(screen.getByText('Showing 0 of 0 events')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show more/ })).toBeNull();
  });
});
