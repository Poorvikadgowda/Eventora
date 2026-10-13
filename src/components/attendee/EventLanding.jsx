import React, { useState, useEffect } from 'react';
import { useEvent } from '../../store/EventContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  Award,
  Zap
} from 'lucide-react';
import { RegisterModal } from './RegisterModal';

export const EventLanding = () => {
  const { event, sessions, setAttendeeTab } = useEvent();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Live countdown timer to event
  const [timeLeft, setTimeLeft] = useState({ days: 34, hours: 12, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-14 border border-slate-800/80 mt-4 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Registration is Live • Automated Express Check-In</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {event.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {event.tagline}. Experience next-generation automated attendance, express contactless badge verification, and instant verifiable certificates of attendance.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-accent-cyan" />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-glow flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register Now — Free Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAttendeeTab('pass')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <QrCode className="w-4 h-4 text-brand-400" />
              <span>Already Registered? View My Pass</span>
            </button>
          </div>
        </div>

        {/* Countdown Ticker Box */}
        <div className="mt-10 sm:mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-4 max-w-md gap-3 text-center">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.days}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Days</div>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.hours}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Hours</div>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{timeLeft.minutes}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Mins</div>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="text-xl sm:text-2xl font-black text-brand-400 font-mono">{timeLeft.seconds}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Secs</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Instant Contactless Badging</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Register once and your encrypted digital badge with dynamic QR pass is generated immediately. Add to mobile wallet or scan directly from screen.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Duplicate Entry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Smart identity deduplication safeguards against repeated entries and fragmented data. Your check-in history automatically syncs in real-time.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Automated Verifiable Certificate</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Once you attend and submit feedback, your verified certificate of completion is unlocked instantly with a public cryptographic verification hash.
          </p>
        </div>
      </section>

      {/* Flagship Sessions & Agenda */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Summit Sessions</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select tracks are automatically monitored via contactless express scanners.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
          >
            <span>Register to reserve seat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {session.id}
                </span>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {session.time}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{session.title}</h4>
              <p className="text-xs text-slate-400">{session.speaker}</p>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60 text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                  {session.room}
                </span>
                <span className="text-slate-400">
                  Capacity: <strong className="text-slate-200">{session.capacity}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

    </div>
  );
};
