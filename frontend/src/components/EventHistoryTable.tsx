import React, { useState } from 'react';
import type { DoorEvent, EventType } from '../types';
import { Search, Inbox, ArrowDown, X } from 'lucide-react';

interface EventHistoryTableProps {
  events: DoorEvent[];
  isConnected?: boolean;
}

const categories = ['ALL', 'DOOR', 'LIGHT', 'CONFIG'];

export const EventHistoryTable: React.FC<EventHistoryTableProps> = ({ events, isConnected = false }) => {
  const pageSize = 5;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'DOOR_OPENED':
        return (
          <span className="journal-badge badge-door-open">
            <i className="journal-dot" aria-hidden="true" />
            <span>Door Opened</span>
          </span>
        );
      case 'DOOR_CLOSED':
        return (
          <span className="journal-badge badge-door-closed">
            <i className="journal-dot" aria-hidden="true" />
            <span>Door Closed</span>
          </span>
        );
      case 'LIGHT_ON':
        return (
          <span className="journal-badge badge-light-on">
            <i className="journal-dot" aria-hidden="true" />
            <span>Light ON</span>
          </span>
        );
      case 'LIGHT_OFF':
        return (
          <span className="journal-badge badge-light-off">
            <i className="journal-dot" aria-hidden="true" />
            <span>Light OFF</span>
          </span>
        );
      case 'LIGHT_TIMER_STARTED':
        return (
          <span className="journal-badge badge-timer">
            <i className="journal-dot" aria-hidden="true" />
            <span>Timer Started</span>
          </span>
        );
      case 'LIGHT_TIMER_CANCELLED':
        return (
          <span className="journal-badge badge-timer">
            <i className="journal-dot" aria-hidden="true" />
            <span>Timer Cancelled</span>
          </span>
        );
      case 'LIGHT_TIMER_EXPIRED':
        return (
          <span className="journal-badge badge-timer">
            <i className="journal-dot" aria-hidden="true" />
            <span>Timer Expired</span>
          </span>
        );
      case 'MODE_CHANGED':
        return (
          <span className="journal-badge badge-config">
            <i className="journal-dot" aria-hidden="true" />
            <span>Mode Changed</span>
          </span>
        );
      case 'CONFIG_UPDATED':
        return (
          <span className="journal-badge badge-config">
            <i className="journal-dot" aria-hidden="true" />
            <span>Config Updated</span>
          </span>
        );
      default:
        return (
          <span className="journal-badge badge-default">
            <i className="journal-dot" aria-hidden="true" />
            <span>{type}</span>
          </span>
        );
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (filterType === 'DOOR' && !evt.eventType.startsWith('DOOR')) return false;
    if (filterType === 'LIGHT' && !evt.eventType.startsWith('LIGHT')) return false;
    if (filterType === 'CONFIG' && !['MODE_CHANGED', 'CONFIG_UPDATED'].includes(evt.eventType))
      return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const matchType = evt.eventType.toLowerCase().includes(q);
      const matchDesc = evt.details?.description?.toLowerCase().includes(q) || false;
      const matchId = evt.id.toLowerCase().includes(q);
      const matchLabel = evt.eventType.replaceAll('_', ' ').toLowerCase().includes(q);
      return matchType || matchDesc || matchId || matchLabel;
    }

    return true;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="event-log" className="journal-section" aria-labelledby="journal-title">
      <div className="journal-header">
        <div className="journal-intro">
          <span className="eyebrow"><span className="section-number">03</span> ACTIVITY JOURNAL</span>
          <h2 id="journal-title">Little moments. <span>Quietly noted.</span></h2>
          <p>Your entryway's story, all in one place.</p>
        </div>

        <div className="journal-toolbar">
          <div className="journal-filters" role="group" aria-label="Filter events by category" style={{ '--filter-index': categories.indexOf(filterType) } as React.CSSProperties}>
            <span className="journal-filter-indicator" aria-hidden="true" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setFilterType(cat); setVisibleCount(pageSize); }}
                aria-pressed={filterType === cat}
                className="journal-filter-btn"
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="journal-search-wrap">
            <Search className="journal-search-icon" size={13} aria-hidden="true" />
            <input
              type="text"
              placeholder="Find a moment..."
              aria-label="Filter events"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(pageSize); }}
              className="journal-search-input"
            />
            {searchQuery && <button type="button" className="journal-search-clear" aria-label="Clear search" onClick={() => { setSearchQuery(''); setVisibleCount(pageSize); }}><X size={13} aria-hidden="true" /></button>}
          </div>
        </div>
      </div>

      <div className="journal-content">
      {/* Journal Table Body */}
      <div className="journal-table-wrap">
        <table className="journal-table">
          <caption className="sr-only">Recent entryway activity</caption>
          <thead>
            <tr>
              <th scope="col" className="col-time">Time</th>
              <th scope="col" className="col-event">Moment</th>
              <th scope="col" className="col-details">The details</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? (
              visibleEvents.map((evt, idx) => (
                <tr
                  key={evt.id}
                  className="journal-row"
                  style={{ '--row-index': idx % pageSize } as React.CSSProperties}
                >
                  <td className="cell-time">
                    <time dateTime={evt.createdAt}>{formatTimestamp(evt.createdAt)}</time>
                    <span className="journal-date">{Number.isNaN(Date.parse(evt.createdAt)) ? '--' : new Date(evt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </td>
                  <td className="cell-event">
                    {getEventBadge(evt.eventType)}
                  </td>
                  <td className="cell-details">
                    <div className="journal-entry-copy">
                      {evt.details?.description && (
                        <span className="entry-desc">{evt.details.description}</span>
                      )}
                      <details className="journal-event-details">
                      <summary>Event details</summary>
                      <div className="entry-meta">
                        <span>Device: {evt.deviceId}</span>
                        {evt.details?.triggerSource && (
                          <span className="meta-tag">[{evt.details.triggerSource}]</span>
                        )}
                        {evt.details?.lightPercentage !== undefined && (
                          <span>Illuminance: {evt.details.lightPercentage}%</span>
                        )}
                        {evt.details?.lightAdc !== undefined && (
                          <span>ADC: {evt.details.lightAdc}</span>
                        )}
                        {evt.details?.offDelayMs !== undefined && (
                          <span>Delay: {evt.details.offDelayMs}ms</span>
                        )}
                        {evt.details?.mode && (
                          <span>Mode: {evt.details.mode}</span>
                        )}
                      </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="cell-empty">
                  <div className="journal-empty">
                    <div className="empty-halo" aria-hidden="true">
                      <Inbox size={20} strokeWidth={1.4} />
                    </div>
                    <p className="empty-headline">No activity to show</p>
                    <p className="empty-subtext">
                      {searchQuery || filterType !== 'ALL'
                        ? 'No moments match this view. Try another filter or search.'
                        : 'Your next arrival starts the story. Door and lighting activity will appear here.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="journal-footer">
        <div className="journal-footer-info">
        <span className="journal-status" aria-live="polite">
          Showing {visibleEvents.length} of {filteredEvents.length} events
        </span>
        <span className="controls-live"><i className={isConnected ? 'status-dot online' : 'status-dot'} />{isConnected ? 'In sync with your entryway' : 'Waiting for your entryway'}</span>
        </div>
        <div className="journal-actions">
          {visibleCount > pageSize && (
            <button
              type="button"
              className="action-less"
              onClick={() => setVisibleCount(pageSize)}
            >
              Show less
            </button>
          )}
          {visibleCount < filteredEvents.length && (
            <button
              type="button"
              className="action-more"
              onClick={() => setVisibleCount((count) => count + pageSize)}
            >
              <span>Show more</span>
              <ArrowDown className="more-plus" size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};

export default EventHistoryTable;



