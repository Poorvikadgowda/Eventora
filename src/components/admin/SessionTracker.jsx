import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { Calendar, Users, MapPin, Clock, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';

export const SessionTracker = () => {
  const { sessions, attendees, checkInAttendee } = useEvent();
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || 'S-101');
  const [quickSearch, setQuickSearch] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Attendees who checked into this active session
  const sessionAttendees = attendees.filter(a => 
    a.checkInHistory && a.checkInHistory.some(h => h.sessionId === activeSession.id)
  );

  // Attendees not yet in this session
  const unCheckedInAttendees = attendees.filter(a => 
    !a.checkInHistory || !a.checkInHistory.some(h => h.sessionId === activeSession.id)
  );

  const filteredUnchecked = unCheckedInAttendees.filter(a =>
    a.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(quickSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Multi-Track & Breakout Monitoring</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Session Attendance & Capacity Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor room occupancy, prevent room overfilling, and log individual session credentials.
          </p>
        </div>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sessions.map(s => {
          const count = s.checkedInCount || 0;
          const pct = Math.min(100, Math.round((count / s.capacity) * 100));
          const isSelected = s.id === activeSessionId;

          return (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-glow'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {s.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  pct > 90 ? 'bg-rose-500/20 text-rose-300' : pct > 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {pct}% Full
                </span>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-2">{s.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{s.speaker}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <strong className="text-white">{count}</strong> / {s.capacity}
                </span>
                <span className="text-[11px] text-slate-500">{s.room.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive on Selected Session */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">SESSION {activeSession.id}</span>
            <h3 className="text-xl font-bold text-white">{activeSession.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {activeSession.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                {activeSession.room}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">Current Occupancy</div>
              <div className="text-lg font-bold text-white font-mono">
                {activeSession.checkedInCount || 0} / {activeSession.capacity}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column: Checked-In Attendees vs Fast Add Attendee */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Checked-in List */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Verified Attendees Inside ({sessionAttendees.length})
            </h4>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {sessionAttendees.length > 0 ? (
                sessionAttendees.map(a => {
                  const checkInEntry = a.checkInHistory?.find(h => h.sessionId === activeSession.id);
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{a.name}</span>
                          <span className="font-mono text-[10px] text-indigo-400">{a.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{a.organization} • {a.tier.toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {checkInEntry ? new Date(checkInEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No attendees checked in to this specific breakout yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Check-in from Registered List */}
          <div className="lg:col-span-5 space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Fast Check-In Attendee
            </h4>
            
            <input
              type="text"
              placeholder="Search registered attendees..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredUnchecked.slice(0, 5).map(a => (
                <div key={a.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-200 truncate">{a.name}</div>
                    <div className="text-[10px] text-slate-400">{a.tier.toUpperCase()}</div>
                  </div>
                  <button
                    onClick={() => checkInAttendee(a.id, activeSession.id)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold shrink-0"
                  >
                    Check In
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
