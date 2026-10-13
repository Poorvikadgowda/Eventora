import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const DynamicQRModal = ({ isOpen, onClose, event }) => {
  const { currentUser } = useAuth();
  const { qrSession } = useEvents();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const targetEvent = event || {
    id: qrSession.eventId,
    title: qrSession.eventName,
    venue: qrSession.venue
  };

  useEffect(() => {
    if (!isOpen) return;

    // Generate dynamic QR payload
    const payload = JSON.stringify({
      studentId: currentUser?.id,
      studentName: currentUser?.name,
      usn: currentUser?.usn,
      eventId: targetEvent.id,
      sessionToken: qrSession.token,
      timestamp: Date.now()
    });

    QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#00152a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [isOpen, currentUser, targetEvent, qrSession.token]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Student Attendance Pass" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        {/* Dynamic Countdown Header */}
        <div className="w-full bg-secondary-fixed/30 rounded-xl p-3 mb-space-md flex items-center justify-between border border-secondary/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
            <span className="text-label-sm font-bold text-on-secondary-fixed uppercase tracking-wider">
              Rotating Anti-Fraud Token
            </span>
          </div>
          <span className="text-label-md font-mono font-bold text-secondary bg-white px-2 py-0.5 rounded shadow-xs">
            Refreshes in {qrSession.expiresIn}s
          </span>
        </div>

        {/* QR Display Card */}
        <div className="p-4 bg-white rounded-2xl shadow-md border-4 border-primary-container/10 relative group">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="Dynamic Attendance QR Pass" className="w-64 h-64 object-contain rounded-lg" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-surface-container-low rounded-lg text-outline">
              Generating Secure QR...
            </div>
          )}
          <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
            <span className="px-3 py-1 bg-primary text-on-primary text-[11px] font-bold rounded-full shadow-md">
              VALID FOR EVENT CHECK-IN
            </span>
          </div>
        </div>

        {/* Student Pass Details */}
        <div className="mt-space-md w-full bg-surface-container-low p-space-md rounded-xl text-left border border-surface-container-high/60 space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-surface-container-high">
            <span className="text-body-sm text-outline">Student Name</span>
            <span className="text-body-md font-bold text-primary">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-surface-container-high">
            <span className="text-body-sm text-outline">USN</span>
            <span className="text-body-md font-mono font-semibold text-secondary">{currentUser?.usn}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-surface-container-high">
            <span className="text-body-sm text-outline">Event</span>
            <span className="text-body-md font-semibold text-on-surface truncate max-w-[200px]">{targetEvent.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-sm text-outline">Venue</span>
            <span className="text-body-sm font-medium text-on-surface-variant">{targetEvent.venue}</span>
          </div>
        </div>

        <p className="text-label-sm text-outline mt-space-md">
          Present this screen to the scanner at the venue entrance. Dynamic rotation prevents unauthorized screen-sharing.
        </p>

        <button
          onClick={onClose}
          className="mt-space-md w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors shadow-sm"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};
