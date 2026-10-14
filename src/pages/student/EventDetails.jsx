import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import { DynamicQRModal } from '../../components/event/DynamicQRModal';
import { Modal } from '../../components/common/Modal';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const { events, isRegistered, registerForEvent, cancelRegistration } = useEvents();
  const { addToast } = useToast();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="bg-surface-container-lowest p-12 rounded-3xl text-center border border-surface-container-high max-w-lg mx-auto mt-12">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">error</span>
        <h2 className="text-2xl font-bold text-primary mb-2">Event Not Found</h2>
        <p className="text-body-sm text-outline mb-6">The requested event could not be found or has ended.</p>
        <Link to="/student/explore" className="px-5 py-2.5 rounded-xl bg-secondary text-white font-bold">
          Back to Events
        </Link>
      </div>
    );
  }

  const registered = isRegistered(event.id, currentUser?.id);
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const isPaid = Boolean(event.price && event.price !== 'Free' && event.price !== '₹0');

  const handleRegisterClick = async () => {
    if (isPaid) {
      setIsPaymentModalOpen(true);
    } else {
      setIsRegistering(true);
      try {
        await registerForEvent(event.id, currentUser?.id, currentUser?.email, currentUser?.name);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      await registerForEvent(event.id, currentUser?.id, currentUser?.email, currentUser?.name);
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);
      addToast(`Payment of ${event.price} verified! Registration pass confirmed.`, 'success');
    }, 700);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      cancelRegistration(event.id, currentUser?.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Event link copied to clipboard!', 'info');
  };

  const handleAddToCalendar = () => {
    const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.venue}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Calendar event file (.ics) downloaded!', 'success');
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-space-lg">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-body-sm font-semibold text-outline hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Share"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share</span>
          </button>
          <button
            onClick={handleAddToCalendar}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Add to Calendar"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 w-full shadow-lg border border-surface-container-high/60">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent"></div>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            {event.category}
          </span>
          {event.isLive && (
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live
            </span>
          )}
        </div>

        {/* Title & Metadata over Banner */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <span className="text-teal-300 font-semibold text-xs uppercase tracking-wider block mb-1">
            Organized by {event.organizer}
          </span>
          <h1 className="text-3xl sm:text-5xl font-headline-xl font-bold tracking-tight mb-3">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-primary-fixed-dim">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-teal-300">calendar_today</span>
              {event.displayDate}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-teal-300">schedule</span>
              {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-teal-300">location_on</span>
              {event.venue} ({event.building})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Registration Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Description, Speakers, Agenda */}
        <div className="lg:col-span-8 space-y-space-lg">
          {/* About Event */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm">
            <h2 className="text-xl font-headline-sm text-primary font-bold mb-3">About This Event</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.matchReason && (
              <div className="mt-6 p-4 rounded-xl bg-secondary-fixed/20 border border-secondary/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[24px]">auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-on-secondary-fixed uppercase tracking-wider">AI Recommendation Match</p>
                  <p className="text-body-sm text-on-surface">{event.matchReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Speakers */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm">
            <h2 className="text-xl font-headline-sm text-primary font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">mic</span>
              <span>Distinguished Speakers</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.speakers?.map((spk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-teal-300 font-bold">
                    {spk[0]}
                  </div>
                  <div>
                    <p className="text-body-sm font-bold text-primary">{spk}</p>
                    <p className="text-[11px] text-outline">Featured Keynote Speaker</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Agenda */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm">
            <h2 className="text-xl font-headline-sm text-primary font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              <span>Schedule & Agenda</span>
            </h2>
            <div className="space-y-4">
              {event.agenda?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-surface-container-high/60 last:border-none last:pb-0">
                  <span className="font-mono text-body-sm font-bold text-secondary bg-blue-50 px-2.5 py-1 rounded shrink-0">
                    {item.time}
                  </span>
                  <div>
                    <h4 className="text-body-md font-bold text-primary">{item.title}</h4>
                    <p className="text-xs text-outline mt-0.5">Interactive session with Q&A and attendance logging.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Venue & Live Map Location */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-headline-sm text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <span>Campus Venue Location</span>
              </h2>
              <Link
                to={`/student/map?venue=${encodeURIComponent(event.venue)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-teal-300 text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>Open in Campus Live Map</span>
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-body-md font-bold text-primary">{event.venue}</p>
                <p className="text-body-sm text-outline">{event.building} • Ground Level Navigation</p>
                <p className="text-xs text-secondary font-semibold mt-1">Indoor GPS beacon active • ~180m from North Gate</p>
              </div>
              <Link
                to={`/student/map?venue=${encodeURIComponent(event.venue)}`}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">near_me</span>
                <span>Get Walking Directions</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-md sticky top-20 space-y-5">
          <div>
            <span className="text-label-sm uppercase tracking-wider text-outline font-bold">Registration Status</span>
            <div className="text-2xl font-bold text-primary mt-1">
              {registered ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                  Registered & Confirmed
                </span>
              ) : (
                <span>Registration Open</span>
              )}
            </div>
          </div>

          {/* Registration Fee Box */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-outline font-bold uppercase tracking-wider block">
                Registration Fee
              </span>
              <span className="text-xl font-bold text-primary block mt-0.5">
                {event.price || 'Free'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
              event.price === 'Free' || !event.price
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-300'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {event.price === 'Free' || !event.price ? 'card_giftcard' : 'payments'}
              </span>
              {event.price === 'Free' || !event.price ? 'Free Admission' : 'Required Fee'}
            </span>
          </div>

          {/* Capacity Counter */}
          <div>
            <div className="flex justify-between text-xs text-outline mb-1.5 font-medium">
              <span>Capacity Utilized</span>
              <span className="font-bold text-primary">{event.registeredCount} / {event.capacity}</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${fillPercent > 90 ? 'bg-amber-500' : 'bg-secondary'}`}
                style={{ width: `${fillPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-outline mt-1.5">
              {seatsLeft > 0 ? `${seatsLeft} seats remaining` : 'Event currently at max capacity'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            {registered ? (
              <>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                  <span>View Dynamic QR Pass</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-body-sm font-semibold transition-colors"
                >
                  Cancel Registration
                </button>
              </>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={seatsLeft === 0 || isRegistering}
                className={`w-full py-3.5 rounded-xl text-white font-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                  seatsLeft === 0
                    ? 'bg-surface-container-high text-outline cursor-not-allowed'
                    : isPaid
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/10'
                    : 'bg-secondary hover:bg-secondary-container'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {seatsLeft === 0
                        ? 'Join Waitlist'
                        : isPaid
                        ? `Proceed to Pay & Register (${event.price})`
                        : 'Register for Event (Free)'}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {isPaid ? 'payment' : 'arrow_forward'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Feature Badges list */}
          <div className="pt-4 border-t border-surface-container-high/60 space-y-2 text-xs text-on-surface-variant font-medium">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              <span>Includes Verifiable Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">qr_code_scanner</span>
              <span>15s Dynamic Anti-Fraud Check-In</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">reviews</span>
              <span>Post-Event Feedback & Rating Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic QR Pass Modal */}
      <DynamicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={event}
      />

      {/* Registration Payment Checkout Modal for Paid Events */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => !isProcessingPayment && setIsPaymentModalOpen(false)}
        title="Complete Event Registration"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80">Event Registration Fee</span>
                <h4 className="text-base font-bold text-amber-950 line-clamp-1">{event.title}</h4>
              </div>
              <span className="text-2xl font-black text-amber-950 font-mono shrink-0">
                {event.price}
              </span>
            </div>
            <div className="text-xs text-amber-900/80 flex items-center gap-3 pt-1 border-t border-amber-200/60">
              <span>📅 {event.displayDate}</span>
              <span>📍 {event.venue}</span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-outline">Attendee</span>
              <span className="font-bold text-primary">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">USN</span>
              <span className="font-mono font-semibold text-secondary">{currentUser?.usn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Email Pass Dispatch</span>
              <span className="text-outline-variant font-medium">{currentUser?.email || 'student@eventora.demo'}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-label-sm font-bold text-primary">Select Payment Method</label>
            <div className="space-y-2">
              {[
                { id: 'upi', label: 'Instant UPI (Google Pay, PhonePe, Paytm)', icon: 'qr_code_scanner' },
                { id: 'wallet', label: 'Dr. AIT Campus Student ID Card Wallet', icon: 'account_balance_wallet' },
                { id: 'card', label: 'Debit / Credit Card / NetBanking', icon: 'credit_card' },
                { id: 'instant', label: 'One-Click Fast Checkout (Demo Mode)', icon: 'bolt' }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'bg-primary-container/20 border-primary shadow-xs'
                      : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-primary"
                  />
                  <span className="material-symbols-outlined text-[20px] text-primary">{m.icon}</span>
                  <span className="text-body-sm font-medium text-on-surface flex-1">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-outline hover:text-on-surface text-xs font-bold border border-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleConfirmPayment}
              className="flex-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Pay {event.price} & Register</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
