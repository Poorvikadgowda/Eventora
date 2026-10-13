import React, { useState, useEffect } from 'react';
import { useEvent } from '../../store/EventContext';
import { X, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Ticket, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterModal = ({ isOpen, onClose }) => {
  const { event, registerAttendee, checkDuplicate, setCurrentAttendeeId, setAttendeeTab } = useEvent();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    jobTitle: '',
    tier: 'general',
    track: 'ai',
    dietary: 'None'
  });

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Real-time deduplication check when email or phone changes
  useEffect(() => {
    if (formData.email.includes('@') && formData.email.includes('.')) {
      const dup = checkDuplicate(formData.email, formData.phone);
      if (dup.isDuplicate) {
        setDuplicateWarning(dup);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.email, formData.phone]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email) {
      setErrorMsg('Name and Email are required.');
      return;
    }

    const res = registerAttendee(formData);

    if (res.duplicate) {
      setDuplicateWarning({ isDuplicate: true, attendee: res.attendee, field: res.field });
      return;
    }

    if (res.success) {
      setSuccessResult(res.attendee);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRetrievePass = (attendee) => {
    setCurrentAttendeeId(attendee.id);
    onClose();
    setAttendeeTab('pass');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Registration Successful!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your pass token has been verified and your QR code is ready.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Attendee ID:</span>
                <span className="font-mono text-indigo-300 font-bold">{successResult.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Name:</span>
                <span className="text-slate-200 font-medium">{successResult.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tier:</span>
                <span className="uppercase text-[11px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  {successResult.tier}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Instant Verified
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              ⚡ Automated confirmation & QR Pass sent to <span className="text-slate-200 font-mono">{successResult.email}</span>
            </p>

            <button
              onClick={() => handleRetrievePass(successResult)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <span>View My Digital Badge & QR Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Registration Form */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Friction Registration</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Register for {event.shortName}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Instant digital pass generation with smart duplicate prevention.
              </p>
            </div>

            {/* Live Duplicate Warning Card */}
            {duplicateWarning && (
              <div className="mb-5 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Already Registered ({duplicateWarning.field} Match)
                    </h4>
                    <p className="text-xs text-amber-200/90 mt-0.5">
                      <strong className="text-white">{duplicateWarning.attendee.name}</strong> is already registered under ID{' '}
                      <span className="font-mono bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">
                        {duplicateWarning.attendee.id}
                      </span>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRetrievePass(duplicateWarning.attendee)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/50 text-amber-100 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Open Existing Digital Pass & QR Badge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.hayes@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mobile Phone (for SMS Pass)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company / University</label>
                  <input
                    type="text"
                    placeholder="e.g. CloudTech Labs"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Select Pass Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {event.ticketTiers.map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tier: tier.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.tier === tier.id
                          ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">{tier.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tier.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Track Interest</label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    {event.tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dietary Preferences</label>
                  <select
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="None">Standard Catering</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={duplicateWarning !== null}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all ${
                    duplicateWarning !== null
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Complete Automated Registration</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                🔒 Data is stored in the single-source-of-truth registry. No duplicate re-entry required.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
