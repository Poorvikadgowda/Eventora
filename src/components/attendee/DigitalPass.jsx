import React, { useState, useEffect } from 'react';
import { useEvent } from '../../store/EventContext';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Download, 
  Share2, 
  Sparkles, 
  ScanLine, 
  MessageSquare, 
  Award,
  ArrowRight,
  Printer
} from 'lucide-react';

export const DigitalPass = () => {
  const { 
    event, 
    currentAttendee, 
    setActiveView, 
    setAdminTab, 
    setAttendeeTab 
  } = useEvent();

  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (currentAttendee?.qrToken) {
      generateQrDataUrl(currentAttendee.qrToken, { width: 320 }).then(setQrUrl);
    }
  }, [currentAttendee]);

  if (!currentAttendee) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-white">No Attendee Pass Selected</h3>
        <p className="text-xs text-slate-400 mt-2">
          Please register or select an attendee from the top testing dropdown.
        </p>
      </div>
    );
  }

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'vip':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow';
      case 'speaker':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'student':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'sponsor':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const jumpToScannerTest = () => {
    setActiveView('admin');
    setAdminTab('scanner');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Event Access Token
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Digital Pass & QR Badge
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Present this high-contrast QR code at any entrance gate for 1-second express entry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Badge</span>
          </button>
          <button
            onClick={jumpToScannerTest}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-semibold shadow-glow flex items-center gap-1.5 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Test Scan in Gate Scanner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Pass Card (Mobile Wallet / Lanyard Badge Styling) */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden glass-card border-2 border-slate-700/80 shadow-2xl relative">
            
            {/* Lanyard Hole Cutout Simulator */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-slate-950 rounded-full border border-slate-700/80 shadow-inner z-20"></div>

            {/* Badge Header with Gradient */}
            <div className="p-6 pt-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800/80 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">
                    OFFICIAL ACCESS PASS
                  </span>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {event.shortName}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase font-black tracking-wider border ${getTierBadge(currentAttendee.tier)}`}>
                  {currentAttendee.tier}
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-indigo-500/20">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Attendee QR Code"
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-500 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="font-mono text-sm font-extrabold text-indigo-300 tracking-wider">
                  {currentAttendee.id}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 truncate max-w-xs">
                  {currentAttendee.qrToken}
                </div>
              </div>
            </div>

            {/* Attendee Details Card */}
            <div className="p-6 bg-slate-900/90 space-y-4 border-t border-slate-800">
              <div>
                <h4 className="text-xl font-black text-white">{currentAttendee.name}</h4>
                <p className="text-xs text-slate-300 font-medium">{currentAttendee.jobTitle}</p>
                <p className="text-xs text-indigo-400 font-semibold">{currentAttendee.organization}</p>
              </div>

              {/* Status Pill */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Gate Status:</span>
                {currentAttendee.checkedIn ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Checked In ({new Date(currentAttendee.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Gate Entry</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>{event.venue.split(',')[0]}</span>
                <span>{event.isoDate}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Info & Live Workflow Progression */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Check-In Status Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-cyan" />
              <span>Automated Lifecycle Status</span>
            </h3>

            {/* Stepper Timeline */}
            <div className="space-y-4 pt-1">
              
              {/* Step 1: Registration */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Registration & Deduplication Check</div>
                  <div className="text-[11px] text-slate-400">
                    Verified unique record on {new Date(currentAttendee.registeredAt).toLocaleDateString()}.
                  </div>
                </div>
              </div>

              {/* Step 2: Gate Check-in */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  currentAttendee.checkedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                }`}>
                  {currentAttendee.checkedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Contactless Gate Check-In</div>
                  <div className="text-[11px] text-slate-400">
                    {currentAttendee.checkedIn
                      ? `Checked in at ${new Date(currentAttendee.checkedInAt).toLocaleTimeString()}`
                      : 'Scan QR at live gate terminal to validate entry.'}
                  </div>
                </div>
              </div>

              {/* Step 3: Feedback Survey */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  currentAttendee.feedbackSubmitted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : currentAttendee.checkedIn
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {currentAttendee.feedbackSubmitted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Post-Session Feedback Survey</div>
                  <div className="text-[11px] text-slate-400">
                    {currentAttendee.feedbackSubmitted
                      ? `Submitted (Rated ${currentAttendee.feedback.rating}/5 stars)`
                      : currentAttendee.checkedIn
                      ? 'Ready to submit feedback and unlock certificate.'
                      : 'Locked until gate check-in is verified.'}
                  </div>
                </div>
              </div>

              {/* Step 4: Certificate Generation */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  currentAttendee.certificateGenerated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Verifiable Certificate of Completion</div>
                  <div className="text-[11px] text-slate-400">
                    {currentAttendee.certificateGenerated
                      ? `Issued: ${currentAttendee.certificateId} (Ready to download)`
                      : 'Unlocks automatically after attendance & feedback.'}
                  </div>
                </div>
              </div>

            </div>

            {/* Next Action Prompts */}
            <div className="pt-4 border-t border-slate-800">
              {currentAttendee.certificateGenerated ? (
                <button
                  onClick={() => setAttendeeTab('certificate')}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Download Your Official Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : currentAttendee.checkedIn ? (
                <button
                  onClick={() => setAttendeeTab('feedback')}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Submit Event Feedback (Unlocks Certificate)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Tip: Present this pass to gate staff or scan in the live gate scanner.</span>
                </div>
              )}
            </div>

          </div>

          {/* Session Attendance History */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Session Access & Activity History
            </h4>
            {currentAttendee.checkInHistory && currentAttendee.checkInHistory.length > 0 ? (
              <div className="space-y-2">
                {currentAttendee.checkInHistory.map((h, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{h.sessionTitle}</div>
                      <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Session {h.sessionId}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No session scans recorded yet. Present QR at session doors.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
