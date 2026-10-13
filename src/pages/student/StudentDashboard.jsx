import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { DynamicQRModal } from '../../components/event/DynamicQRModal';
import { CertificateViewerModal } from '../../components/event/CertificateViewerModal';
import { EventCard } from '../../components/event/EventCard';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { events, registrations, certificates, attendance, assignments = [] } = useEvents();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  // Countdown timer simulation
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 14, minutes: 22, seconds: 45 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter events registered by this student
  const myRegisteredEvents = events.filter((e) =>
    registrations.some((r) => r.eventId === e.id && r.studentId === currentUser?.id)
  );

  // Recommendations
  const recommendedEvents = events.slice(0, 3);

  // Attendance history chart data
  const attendanceChartData = [
    { month: 'Jun', rate: 88, events: 4 },
    { month: 'Jul', rate: 90, events: 5 },
    { month: 'Aug', rate: 92, events: 6 },
    { month: 'Sep', rate: 95, events: 5 },
    { month: 'Oct', rate: 94, events: 4 },
  ];

  const handleOpenQR = (event = null) => {
    setSelectedEventForQR(event || events[0]);
    setIsQRModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Welcome & Hero Section (matches Stitch student_dashboard) */}
      <div className="relative overflow-hidden rounded-2xl bg-primary-container p-6 sm:p-8 lg:p-space-xl shadow-[0_12px_32px_-4px_rgba(16,42,67,0.12)]">
        <div className="absolute -right-12 -top-12 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 rounded-full bg-teal-500/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-2 ring-white/20">
                <img
                  className="w-full h-full object-cover"
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={currentUser?.name}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-primary-container flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-teal-300 text-label-sm font-bold uppercase tracking-wider">
                  {currentUser?.badge || 'Active Scholar'}
                </span>
                <span className="text-teal-200/80 text-label-sm">
                  • {currentUser?.semester || 'Fall Semester 2024'} • {currentUser?.department}
                </span>
              </div>
              <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-primary font-bold tracking-tight mb-1">
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Alex'}!
              </h1>
              <p className="text-on-primary-container text-body-md">
                You have <span className="text-teal-300 font-semibold">{myRegisteredEvents.length} active registered events</span>. Your attendance rate is stellar at <span className="text-teal-300 font-bold">{currentUser?.attendanceRate || 94}%</span>.
              </p>
            </div>
          </div>

          {/* Next Event Countdown & Quick Check-In CTA */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right px-3">
              <p className="text-[11px] text-teal-200 uppercase tracking-wider font-semibold">Next Event Starts In</p>
              <p className="font-mono text-xl sm:text-2xl text-on-primary font-bold tracking-tight">
                {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s
              </p>
            </div>
            <Link
              to="/student/map"
              className="bg-white/15 hover:bg-white/25 text-white px-3.5 py-2.5 rounded-xl font-label-md font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              title="Campus Live Map"
            >
              <span className="material-symbols-outlined text-[20px] text-teal-300">map</span>
              <span className="hidden sm:inline">Live Map</span>
            </Link>
            <button
              onClick={() => handleOpenQR(events[0])}
              className="bg-secondary-container hover:bg-secondary text-white px-4 py-2.5 rounded-xl font-label-md font-bold transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code</span>
              <span>Quick Check-In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Widget (matches Stitch student_dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        {/* Stat 1: Attendance Rate */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high/60 group">
          <div className="flex items-center justify-between mb-space-md">
            <span className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
              Attendance Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-3xl font-bold text-primary">
                {currentUser?.attendanceRate || 94}%
              </span>
              <span className="text-label-sm text-teal-700 ml-2 font-semibold inline-flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.4%
              </span>
            </div>
            <div className="w-16 h-8 flex items-end gap-1">
              <div className="w-3 bg-surface-container-high h-4 rounded-t"></div>
              <div className="w-3 bg-surface-container-high h-6 rounded-t"></div>
              <div className="w-3 bg-surface-container-high h-5 rounded-t"></div>
              <div className="w-3 bg-teal-400 h-8 rounded-t"></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Registered Events */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high/60 group">
          <div className="flex items-center justify-between mb-space-md">
            <span className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
              Registered Events
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-3xl font-bold text-primary">
                {String(myRegisteredEvents.length).padStart(2, '0')}
              </span>
              <span className="text-label-sm text-outline ml-2 font-medium">Active passes</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold">
              2 Live Soon
            </span>
          </div>
        </div>

        {/* Stat 3: Certificates Earned */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high/60 group">
          <div className="flex items-center justify-between mb-space-md">
            <span className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
              Certificates Earned
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-3xl font-bold text-primary">
                {String(certificates.length).padStart(2, '0')}
              </span>
              <span className="text-label-sm text-secondary ml-2 font-semibold">Verified</span>
            </div>
            <span className="text-label-sm text-outline font-medium">In Vault</span>
          </div>
        </div>

        {/* Stat 4: Events Attended */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high/60 group">
          <div className="flex items-center justify-between mb-space-md">
            <span className="text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
              Total Check-Ins
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-3xl font-bold text-primary">
                {attendance.length}
              </span>
              <span className="text-label-sm text-outline ml-2 font-medium">Scans logged</span>
            </div>
            <span className="text-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              100% Valid
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Attendance Trends Chart */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-primary font-bold">Attendance & Engagement Velocity</h3>
              <p className="text-body-sm text-outline">Semester progress tracked across workshops & technical symposiums.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-label-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">show_chart</span> Consistent High
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceChartData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="#64748B" fontSize={12} unit="%" />
                <Tooltip
                  formatter={(value) => [`${value}% Attendance`, 'Rate']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-xs text-outline">
            <span>Minimum university attendance requirement: 75%</span>
            <span className="text-teal-700 font-bold">Surplus: +19.0%</span>
          </div>
        </div>

        {/* Registered Events List */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-primary font-bold">My Event Passes</h3>
              <p className="text-body-sm text-outline">Show QR pass at venue door</p>
            </div>
            <Link to="/student/explore" className="text-label-sm text-secondary hover:underline font-bold">
              Explore More
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[270px]">
            {myRegisteredEvents.length === 0 ? (
              <div className="p-8 text-center text-outline">
                <p>No event passes yet. Browse and register from Explore Events!</p>
              </div>
            ) : (
              myRegisteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-body-sm font-bold text-primary truncate">{evt.title}</p>
                    <p className="text-[12px] text-outline">{evt.displayDate} • {evt.venue}</p>
                  </div>
                  <button
                    onClick={() => handleOpenQR(evt)}
                    className="p-2 rounded-lg bg-primary text-teal-300 hover:bg-primary-container transition-colors shadow-xs shrink-0 flex items-center gap-1 text-xs font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    <span>Pass</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => handleOpenQR(events[0])}
            className="w-full mt-4 py-2.5 rounded-xl bg-secondary-container hover:bg-secondary text-white font-label-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code</span>
            <span>Open Dynamic QR Pass</span>
          </button>
        </div>
      </div>

      {/* Recommended For You Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-bold uppercase tracking-wider">
              Smart Matching AI
            </span>
            <h2 className="text-2xl font-headline-sm text-primary font-bold mt-1">
              Recommended Events Based on Your Academic Profile
            </h2>
          </div>
          <Link to="/student/recommendations" className="text-label-sm text-secondary hover:underline font-bold">
            View All Recommendations →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onQuickPass={handleOpenQR} />
          ))}
        </div>
      </div>

      {/* Active Course Deliverables & Assignments Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
                Continuous Assessment
              </span>
            </div>
            <h3 className="font-headline-sm text-primary font-bold">Upcoming Assignments & Deliverables</h3>
            <p className="text-body-sm text-outline">Submit workshop files, slide decks, and code repositories.</p>
          </div>
          <Link to="/student/assignments" className="text-label-sm text-secondary hover:underline font-bold">
            View All ({assignments.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignments.slice(0, 3).map((asg) => (
            <div
              key={asg.id}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider truncate max-w-[180px]">
                    {asg.eventTitle || 'Campus Task'}
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">assignment</span>
                </div>
                <h4 className="text-body-md font-bold text-primary mb-1 line-clamp-2">
                  {asg.title}
                </h4>
                <p className="text-xs text-outline line-clamp-2">{asg.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between text-xs text-outline">
                <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                <Link
                  to="/student/assignments"
                  className="text-secondary font-bold hover:underline flex items-center gap-0.5"
                >
                  Submit <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Certificates Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container-high/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline-sm text-primary font-bold">Recent Verified Credentials</h3>
            <p className="text-body-sm text-outline">Available in your cryptographic credential studio vault.</p>
          </div>
          <Link to="/student/certificates" className="text-label-sm text-secondary hover:underline font-bold">
            Open Certificate Studio →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certificates.slice(0, 3).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-secondary font-bold">{cert.certificateId}</span>
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">verified</span>
                </div>
                <h4 className="text-body-md font-bold text-primary group-hover:text-secondary transition-colors mb-1">
                  {cert.eventName}
                </h4>
                <p className="text-xs text-outline line-clamp-2">{cert.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between text-xs text-outline">
                <span>{cert.issueDate}</span>
                <span className="text-secondary font-bold flex items-center gap-1 group-hover:underline">
                  Preview <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic QR Check-in Modal */}
      <DynamicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={selectedEventForQR}
      />

      {/* Certificate Viewer Modal */}
      <CertificateViewerModal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </div>
  );
};
