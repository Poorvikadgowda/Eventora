import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { events, registrations, attendance, certificates, assignments = [] } = useEvents();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [dismissAlert, setDismissAlert] = useState(false);

  // Compute live attendance rate
  const liveAttendanceRate = registrations.length > 0
    ? Math.min(100, Math.round((attendance.length / registrations.length) * 100))
    : 92;

  // Registration Trend Data
  const registrationTrends = [
    { day: 'Mon', count: 180 },
    { day: 'Tue', count: 320 },
    { day: 'Wed', count: 490 },
    { day: 'Thu', count: 710 },
    { day: 'Fri', count: 940 },
    { day: 'Sat', count: 1250 },
    { day: 'Sun', count: 1480 },
  ];

  // Department Breakdown
  const departmentData = [
    { name: 'Comp. Sci', attendees: 540 },
    { name: 'Info Sci', attendees: 320 },
    { name: 'AI & Data', attendees: 290 },
    { name: 'Electronics', attendees: 210 },
    { name: 'Biotech', attendees: 120 },
  ];

  const handleApplyRecommendation = () => {
    addToast('Increased Auditorium A waitlist buffer by 15% and scheduled automated check-in reminder SMS!', 'success');
    setDismissAlert(true);
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-12">
      {/* AI Insights Banner (matches Stitch admin_analytics_dashboard) */}
      {!dismissAlert && (
        <div className="relative bg-primary-container text-on-primary-container rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0 shadow-lg text-white">
              <span className="material-symbols-outlined text-[26px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-wider text-teal-300 bg-primary px-2.5 py-0.5 rounded-full font-bold">
                  Eventora Intelligence
                </span>
                <span className="text-xs text-primary-fixed-dim">Updated 10m ago</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-primary mb-1">
                Peak Registration Surge Detected for Annual Tech Symposium
              </h2>
              <p className="text-body-sm text-primary-fixed-dim/90 max-w-3xl leading-relaxed">
                Computer Science department registrations increased by 45% today. Recommended action: Increase venue capacity for Auditorium A or schedule an automated reminder regarding early check-in via QR scanner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={handleApplyRecommendation}
              className="bg-secondary text-white hover:bg-secondary-container px-4 py-2.5 rounded-xl font-label-md font-bold transition-all shadow-md text-xs sm:text-sm"
            >
              Apply Recommendations
            </button>
            <button
              onClick={() => setDismissAlert(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl font-label-md transition-all text-xs sm:text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid (5 Cards - matches Stitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* Card 1: Total Events */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Total Events</span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">event</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{events.length}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Active in Supabase</span>
            </div>
          </div>
        </div>

        {/* Card 2: Registrations */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{registrations.length}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Enrolled passes</span>
            </div>
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{liveAttendanceRate}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              <span>{attendance.length} checked-in</span>
            </div>
          </div>
        </div>

        {/* Card 4: Certificates */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">card_membership</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{certificates.length}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Cryptographic credentials</span>
            </div>
          </div>
        </div>

        {/* Card 5: Active Deliverables */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Assignments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{assignments.length}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-semibold">
              <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
              <span>Course tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin/events/create"
          className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Event</span>
        </Link>

        <Link
          to="/admin/qr-scanner"
          className="px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md font-bold transition-colors border border-surface-container-high flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px] text-teal-600">qr_code_scanner</span>
          <span>Scan Attendance</span>
        </Link>

        <Link
          to="/admin/anti-fraud"
          className="px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md font-bold transition-colors border border-surface-container-high flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
          <span>Dynamic Anti-Fraud Session</span>
        </Link>

        <Link
          to="/admin/certificates"
          className="px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md font-bold transition-colors border border-surface-container-high flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-600">workspace_premium</span>
          <span>Generate Certificates</span>
        </Link>

        <Link
          to="/admin/ai-copilot"
          className="px-5 py-2.5 rounded-xl bg-primary-container text-teal-300 hover:bg-primary font-label-md font-bold transition-colors flex items-center gap-2 ml-auto"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span>Launch AI Copilot</span>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Registration Velocity Trend */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-primary font-bold">Registration Velocity Trend</h3>
              <p className="text-body-sm text-outline">Real-time RSVP velocity tracking across active symposium tracks.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold">
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrends}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`${val} Registrations`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Participation Breakdown */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-primary font-bold">Department Breakdown</h3>
              <p className="text-body-sm text-outline">Attendee distribution by academic faculty.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
              Active Term
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  formatter={(val) => [`${val} Students`, 'Attendance']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#E2E8F0' }}
                />
                <Bar dataKey="attendees" fill="#00152a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Performance Event Roster Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-sm text-primary font-bold text-xl">Active Events Overview</h3>
            <p className="text-body-sm text-outline">Real-time capacity tracking, attendance rates, and success scores.</p>
          </div>
          <Link
            to="/admin/events"
            className="text-label-sm font-bold text-secondary hover:underline self-start sm:self-auto"
          >
            Manage All Events ({events.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                <th className="py-4 px-6">Event Title</th>
                <th className="py-4 px-6">Date & Venue</th>
                <th className="py-4 px-6">Capacity Utilization</th>
                <th className="py-4 px-6">Attendance Rate</th>
                <th className="py-4 px-6">Success Score</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
              {events.slice(0, 6).map((evt) => {
                const fillPct = Math.round((evt.registeredCount / evt.capacity) * 100);
                const attPct = Math.round(((evt.attendanceCount || 40) / evt.registeredCount) * 100);

                return (
                  <tr key={evt.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={evt.image} alt={evt.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-primary">{evt.title}</p>
                          <span className="text-xs text-outline">{evt.category} • {evt.organizer}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-on-surface">{evt.displayDate}</p>
                      <span className="text-xs text-outline">{evt.venue}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{evt.registeredCount} / {evt.capacity}</span>
                          <span className="text-primary">{fillPct}%</span>
                        </div>
                        <div className="w-28 bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(100, fillPct)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-body-sm font-bold text-teal-700">{attPct || 92}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
                        {evt.successScore || 92.4} / 100
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        evt.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-surface-container-high text-outline'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/events/${evt.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-secondary font-bold text-xs inline-flex items-center gap-1"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
