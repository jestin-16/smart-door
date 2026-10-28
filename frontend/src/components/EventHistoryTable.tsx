import React, { useState } from 'react';
import type { DoorEvent, EventType } from '../types';
import { History, Search, Inbox, ShieldCheck } from 'lucide-react';

interface EventHistoryTableProps {
  events: DoorEvent[];
}

export const EventHistoryTable: React.FC<EventHistoryTableProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'DOOR_OPENED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            DOOR OPENED
          </span>
        );
      case 'DOOR_CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            DOOR CLOSED
          </span>
        );
      case 'LIGHT_ON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-glow-amber" />
            LIGHT ON
          </span>
        );
      case 'LIGHT_OFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            LIGHT OFF
          </span>
        );
      case 'LIGHT_TIMER_STARTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-800 border border-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            TIMER 15s START
          </span>
        );
      case 'LIGHT_TIMER_CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            TIMER CANCELLED
          </span>
        );
      case 'LIGHT_TIMER_EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            TIMER EXPIRED
          </span>
        );
      case 'MODE_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-800 border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            MODE CHANGED
          </span>
        );
      case 'CONFIG_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-800 border border-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            CONFIG UPDATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {type}
          </span>
        );
    }
  };

  const filteredEvents = events.filter((evt) => {
    // Category filter
    if (filterType === 'DOOR' && !evt.eventType.startsWith('DOOR')) return false;
    if (filterType === 'LIGHT' && !evt.eventType.startsWith('LIGHT')) return false;
    if (filterType === 'CONFIG' && !['MODE_CHANGED', 'CONFIG_UPDATED'].includes(evt.eventType))
      return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchType = evt.eventType.toLowerCase().includes(q);
      const matchDesc = evt.details?.description?.toLowerCase().includes(q) || false;
      const matchId = evt.id.toLowerCase().includes(q);
      return matchType || matchDesc || matchId;
    }

    return true;
  });

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
    <div id="event-log" className="glass-card rounded-3xl shadow-luxury overflow-hidden border border-white/80 transition-all relative">
      {/* Top accent indicator strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-400 via-indigo-500 to-amber-400" />

      {/* Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
            <History className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Hardware Telemetry &amp; Event Log</h3>
            <p className="text-xs text-slate-500">Genuine physical sensor transitions and actuator events</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Tabs */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-xs shadow-inner">
            {['ALL', 'DOOR', 'LIGHT', 'CONFIG'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  filterType === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-36 sm:w-48 bg-white/70 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/50 border-b border-slate-200/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-5 w-28">Timestamp</th>
              <th className="py-3 px-5 w-48">Event Type</th>
              <th className="py-3 px-5">Hardware Telemetry &amp; Source</th>
              <th className="py-3 px-5 w-32 text-right">Device ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 text-slate-700">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3 px-5 font-mono text-slate-500 whitespace-nowrap text-[11px] font-semibold">
                    {formatTimestamp(evt.createdAt)}
                  </td>
                  <td className="py-3 px-5 whitespace-nowrap">{getEventBadge(evt.eventType)}</td>
                  <td className="py-3 px-5 text-slate-600">
                    <div>
                      {evt.details?.triggerSource && (
                        <span className="font-bold text-slate-800 mr-2 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          [{evt.details.triggerSource}]
                        </span>
                      )}
                      {evt.details?.description && (
                        <span className="text-slate-800 font-medium mr-2">{evt.details.description}</span>
                      )}
                      <span className="text-slate-400 text-[11px] font-mono">
                        {evt.details?.lightPercentage !== undefined &&
                          `Illuminance: ${evt.details.lightPercentage}% | `}
                        {evt.details?.lightAdc !== undefined &&
                          `ADC: ${evt.details.lightAdc} | `}
                        {evt.details?.offDelayMs !== undefined &&
                          `Delay: ${evt.details.offDelayMs}ms | `}
                        {evt.details?.mode && `Mode: ${evt.details.mode}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-400 text-right text-[11px] font-semibold">
                    {evt.deviceId}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox className="w-6 h-6 stroke-1 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No hardware events recorded yet</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      {searchQuery
                        ? 'No events match your search query.'
                        : 'Press the physical push button on GPIO 4 or alter ambient light on the LDR to generate events.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3 px-6 bg-slate-50/60 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Audit trail stored in PostgreSQL 16 database
        </span>
        <span className="font-mono">{filteredEvents.length} events logged</span>
      </div>
    </div>
  );
};

export default EventHistoryTable;

