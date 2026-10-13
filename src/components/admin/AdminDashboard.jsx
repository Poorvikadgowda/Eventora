import React from 'react';
import { useEvent } from '../../store/EventContext';
import { 
  Users, 
  UserCheck, 
  ScanLine, 
  Award, 
  MessageSquare, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Send,
  Zap,
  Sparkles
} from 'lucide-react';
import { exportAttendeesToCSV } from '../../utils/csvExport';

export const AdminDashboard = () => {
  const { event, attendees, sessions, communications, kpis, setAdminTab } = useEvent();

  // Recent 6 activities
  const recentActivities = [
    ...attendees.filter(a => a.checkedIn).map(a => ({
      type: 'CHECKIN',
      text: `${a.name} checked in at ${a.checkedInSession || 'Main Gate'}`,
      time: a.checkedInAt,
      tier: a.tier,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    })),
    ...attendees.filter(a => a.feedbackSubmitted).map(a => ({
      type: 'FEEDBACK',
      text: `${a.name} submitted 5-star feedback (NPS: ${a.feedback?.npsScore})`,
      time: a.feedback?.submittedAt || a.registeredAt,
      tier: a.tier,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    })),
    ...attendees.slice(0, 3).map(a => ({
      type: 'REGISTER',
      text: `${a.name} completed self-serve registration`,
      time: a.registeredAt,
      tier: a.tier,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    }))
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 6);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Automated Event Operations Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {event.shortName} Executive Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero duplicate entry • Real-time gate validation • Automated triggers active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAdminTab('scanner')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-brand-600 to-indigo-700 hover:from-indigo-500 hover:to-brand-500 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span>Launch Live Gate Scanner</span>
          </button>
          <button
            onClick={() => exportAttendeesToCSV(attendees, event.shortName)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Normalized CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Registered */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {kpis.totalRegistered}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% Deduplicated</span>
          </div>
        </div>

        {/* Live Checked In */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Checked-In Gate</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {kpis.totalCheckedIn}
          </div>
          <div className="text-[11px] text-slate-400">
            <strong className="text-emerald-400">{kpis.checkInRate}%</strong> attendance rate
          </div>
        </div>

        {/* Feedback Submissions */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg Feedback</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {kpis.avgRating} <span className="text-xs text-amber-500/80">★</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {kpis.totalFeedback} responses received
          </div>
        </div>

        {/* Net Promoter Score (NPS) */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">NPS Score</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            +{kpis.npsScore}
          </div>
          <div className="text-[11px] text-emerald-400">
            World-class satisfaction
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Certificates</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
            {kpis.totalCertificates}
          </div>
          <div className="text-[11px] text-purple-300">
            Automated hash generated
          </div>
        </div>

      </div>

      {/* Attendance & Automation Funnel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Automated Event Lifecycle Funnel</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual drop-off and conversion rates across the zero-friction automation pipeline.
            </p>
          </div>
          <span className="text-xs text-brand-400 font-mono">Live Automated Cascades</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          
          {/* Stage 1 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              1. Registered
            </div>
            <div className="text-2xl font-black text-white font-mono">{kpis.totalRegistered}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full w-full"></div>
            </div>
            <div className="text-[10px] text-slate-400">100% Baseline</div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              2. Passes Issued
            </div>
            <div className="text-2xl font-black text-indigo-300 font-mono">{kpis.totalVerified}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-full"></div>
            </div>
            <div className="text-[10px] text-emerald-400">100% Instant Pass</div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              3. Gate Checked-In
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{kpis.totalCheckedIn}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${kpis.checkInRate}%` }}></div>
            </div>
            <div className="text-[10px] text-slate-400">{kpis.checkInRate}% Turnout</div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              4. Survey Done
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{kpis.totalFeedback}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${kpis.totalCheckedIn > 0 ? (kpis.totalFeedback / kpis.totalCheckedIn) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400">
              {kpis.totalCheckedIn > 0 ? Math.round((kpis.totalFeedback / kpis.totalCheckedIn) * 100) : 0}% of Checked-in
            </div>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              5. Certified
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">{kpis.totalCertificates}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full" 
                style={{ width: `${kpis.totalRegistered > 0 ? (kpis.totalCertificates / kpis.totalRegistered) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-purple-300">Automated PDF</div>
          </div>

        </div>
      </div>

      {/* Grid: Live Activity Stream & Session Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Activity Stream */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Operations Feed</span>
            </h3>
            <span className="text-[11px] text-slate-400">Real-time event bus</span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${act.color}`}>
                    {act.type}
                  </span>
                  <span className="text-slate-200 truncate">{act.text}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Capacity Tracker */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Multi-Session Live Attendance</h3>
            <button
              onClick={() => setAdminTab('sessions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View all sessions &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map(s => {
              const pct = Math.min(100, Math.round(((s.checkedInCount || 0) / s.capacity) * 100));
              return (
                <div key={s.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200 truncate">{s.title}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      <strong className="text-white">{s.checkedInCount || 0}</strong> / {s.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{s.room}</span>
                    <span>{pct}% Capacity</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
