import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const EmailConfirmationModal = ({ isOpen, onClose, event, onOpenLiveQR }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [qrUrl, setQrUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const recipientEmail = currentUser?.email || 'student@eventora.demo';
  const recipientName = currentUser?.name || 'Student';
  const registrationCode = `REG-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    if (!isOpen || !event) return;

    const payload = JSON.stringify({
      regId: registrationCode,
      eventId: event.id,
      eventTitle: event.title,
      studentName: recipientName,
      studentEmail: recipientEmail,
      venue: event.venue,
      date: event.date
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#00152a',
        light: '#ffffff'
      }
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('QR error:', err));
  }, [isOpen, event, recipientName, recipientEmail]);

  if (!event) return null;

  const handleDownloadTicket = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      addToast('Digital event ticket downloaded (.png)!', 'success');
      if (qrUrl) {
        const link = document.createElement('a');
        link.download = `${event.title.replace(/\s+/g, '_')}_Ticket.png`;
        link.href = qrUrl;
        link.click();
      }
    }, 600);
  };

  const handleAddToCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.venue}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Calendar invite added!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registration & Email Confirmation" maxWidth="max-w-xl">
      <div className="flex flex-col space-y-4">
        {/* Success Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-emerald-950 text-base">Registration Confirmed! 🎉</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                1-Click Instant
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              No extra details needed! Your seat is locked in and your pass has been registered to{' '}
              <span className="font-semibold underline">{recipientEmail}</span>.
            </p>
          </div>
        </div>

        {/* Email Inbox Simulation Window */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high overflow-hidden shadow-xs">
          {/* Email Client Header Bar */}
          <div className="bg-surface-container-low px-4 py-3 border-b border-surface-container-high flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-[16px] text-secondary">mail</span>
              <span className="font-semibold text-primary">Email Dispatch Notification</span>
            </div>
            <span className="text-[11px] text-outline font-mono">Just now • Automated</span>
          </div>

          {/* Email Envelope Details */}
          <div className="p-4 border-b border-surface-container-high/60 space-y-1 text-xs bg-white">
            <div className="flex items-baseline">
              <span className="text-outline w-16 font-semibold shrink-0">From:</span>
              <span className="text-primary font-medium">Eventora Campus Hub &lt;events@eventora.university.edu&gt;</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-outline w-16 font-semibold shrink-0">To:</span>
              <span className="text-primary font-bold">{recipientName} &lt;{recipientEmail}&gt;</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-outline w-16 font-semibold shrink-0">Subject:</span>
              <span className="text-secondary font-bold">Confirmed: Your Pass for {event.title}</span>
            </div>
          </div>

          {/* Email Content Body */}
          <div className="p-5 bg-gradient-to-b from-slate-50 to-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-teal-300">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                </div>
                <span className="font-bold text-primary text-sm">EVENTORA</span>
              </div>
              <span className="font-mono text-[11px] bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded font-bold">
                {registrationCode}
              </span>
            </div>

            {/* Ticket Card within Email */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-left flex-1">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-secondary text-[10px] font-bold uppercase">
                  {event.category}
                </span>
                <h4 className="font-bold text-primary text-base leading-snug">{event.title}</h4>
                <div className="space-y-1 text-xs text-outline font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                    <span>{event.displayDate || event.date} • {event.startTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                    <span>{event.venue} ({event.building || 'Tech Center'})</span>
                  </div>
                </div>
              </div>

              {/* QR Code Pass */}
              <div className="flex flex-col items-center shrink-0 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Pass" className="w-24 h-24 rounded-lg object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-lg"></div>
                )}
                <span className="text-[10px] font-mono text-outline mt-1 font-bold">Scan at Door</span>
              </div>
            </div>

            <p className="text-[11px] text-outline text-center">
              Please present this email QR ticket or your digital student app at the venue entrance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-sm font-bold transition-all border border-surface-container-high flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{downloading ? 'Downloading...' : 'Save Ticket'}</span>
          </button>

          <button
            onClick={handleAddToCalendar}
            className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-sm font-bold transition-all border border-surface-container-high flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            <span>Add Calendar</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenLiveQR) onOpenLiveQR(event);
            }}
            className="py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            <span>Live QR Pass</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-center text-xs font-semibold text-outline hover:text-primary transition-colors"
        >
          Close & Return to Events
        </button>
      </div>
    </Modal>
  );
};
