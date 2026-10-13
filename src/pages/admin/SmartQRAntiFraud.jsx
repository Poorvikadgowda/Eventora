import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';

export const SmartQRAntiFraud = () => {
  const {
    events,
    students,
    qrSession,
    refreshQRSession,
    togglePauseQRSession,
    endQRSession,
    selectQREvent,
    antiFraudLogs,
    markAttendance
  } = useEvents();

  const { addToast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedStudentToTest, setSelectedStudentToTest] = useState(students[0]?.id || '');
  const [testMode, setTestMode] = useState('valid'); // 'valid' | 'expired' | 'duplicate' | 'tampered'

  const activeEvent = events.find((e) => e.id === qrSession.eventId) || events[0];

  useEffect(() => {
    const payload = JSON.stringify({
      sessionId: qrSession.sessionId,
      eventId: qrSession.eventId,
      token: qrSession.token,
      timestamp: Date.now()
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#00152a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [qrSession]);

  const handleRunSimulator = () => {
    const student = students.find((s) => s.id === selectedStudentToTest) || students[0];

    if (testMode === 'valid') {
      markAttendance(activeEvent.id, student.id, student.name, student.usn, 'Dynamic Smart QR');
    } else if (testMode === 'expired') {
      addToast(`Anti-Fraud Alert: Scan Rejected! QR Token expired 22 seconds ago.`, 'error');
    } else if (testMode === 'duplicate') {
      markAttendance(activeEvent.id, student.id, student.name, student.usn, 'Dynamic Smart QR');
      // Second scan triggers duplicate
      setTimeout(() => {
        markAttendance(activeEvent.id, student.id, student.name, student.usn, 'Dynamic Smart QR');
      }, 500);
    } else if (testMode === 'tampered') {
      addToast(`Anti-Fraud Security Flag: Cryptographic signature mismatch! IP flagged.`, 'error');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Page Title & Event Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Zero-Trust Verification Engine
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            Smart QR Anti-Fraud Attendance
          </h1>
          <p className="text-body-md text-outline">
            15-second cryptographically rotating dynamic QR codes to eliminate proxy check-ins and unauthorized screenshots.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high shadow-xs">
          <span className="material-symbols-outlined text-secondary text-[20px]">event</span>
          <select
            value={qrSession.eventId}
            onChange={(e) => selectQREvent(e.target.value)}
            className="bg-transparent text-body-sm font-bold text-primary outline-none cursor-pointer"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Metrics Cards (matches Stitch smart_qr_anti_fraud_attendance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container-high/60 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Total Registered</span>
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">1,482</span>
            <span className="text-emerald-700 font-semibold text-xs flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+12%
            </span>
          </div>
          <span className="text-xs text-outline mt-1">Expected max capacity</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container-high/60 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Checked-In</span>
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">1,128</span>
            <span className="text-secondary font-semibold text-xs">76.1% rate</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '76.1%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container-high/60 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Anomaly Flagged</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-error">14</span>
            <span className="text-error font-semibold text-xs flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">warning</span>Action req.
            </span>
          </div>
          <span className="text-xs text-outline mt-1">Blocked screenshots & GPS</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-surface-container-high/60 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Attendance Authenticity</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">98.4%</span>
            <span className="text-teal-700 font-semibold text-xs flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">shield</span>Secure
            </span>
          </div>
          <span className="text-xs text-outline mt-1">Zero unauthorized bypasses</span>
        </div>
      </div>

      {/* Main Grid: Rotating QR Code Generator + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Dynamic Rotating QR Code Generator (matches Stitch) */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[26px]">qr_code_2</span>
                <h2 className="text-2xl font-bold text-primary">Live Rotating Dynamic QR</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                qrSession.isPaused ? 'bg-amber-100 text-amber-800' : 'bg-secondary-fixed text-on-secondary-fixed'
              }`}>
                <span className={`w-2 h-2 rounded-full ${qrSession.isPaused ? 'bg-amber-600' : 'bg-secondary animate-pulse'}`}></span>
                {qrSession.isPaused ? 'Session Paused' : 'Active Session'}
              </span>
            </div>

            <p className="text-body-sm text-on-surface-variant mb-6 leading-relaxed">
              Display this dynamic code on auditorium projection screens. Refreshed cryptographically every 15 seconds to prevent sharing screenshots across chat groups.
            </p>

            {/* QR Container */}
            <div className="flex flex-col items-center justify-center bg-surface-container-low p-6 rounded-2xl relative border border-surface-container-high/60">
              <div className="p-4 bg-white rounded-2xl shadow-md border-4 border-primary/5 flex items-center justify-center relative">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Rotating Dynamic Anti-Fraud QR" className="w-56 h-56 object-contain" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-outline">Generating...</div>
                )}
                <div className="absolute w-11 h-11 bg-primary rounded-full flex items-center justify-center text-teal-300 shadow-lg border-2 border-white">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
              </div>

              {/* Dynamic Countdown & Token */}
              <div className="mt-4 flex flex-col items-center text-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-semibold">ROTATION WINDOW:</span>
                  <span className="font-mono text-sm font-bold text-secondary bg-white px-2 py-0.5 rounded shadow-xs">
                    {qrSession.expiresIn}s Remaining
                  </span>
                </div>
                <span className="font-mono text-xs text-outline mt-1 font-semibold">
                  TOKEN: {qrSession.token}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Control Bar */}
          <div className="mt-6 pt-4 border-t border-surface-container-high flex flex-wrap items-center gap-2">
            <button
              onClick={refreshQRSession}
              className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold transition-colors flex items-center justify-center gap-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Rotate Token</span>
            </button>

            <button
              onClick={togglePauseQRSession}
              className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold transition-colors flex items-center justify-center gap-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                {qrSession.isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{qrSession.isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={endQRSession}
              className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-error font-label-md font-bold transition-colors text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
              <span>End Session</span>
            </button>
          </div>
        </div>

        {/* Right: Anti-Fraud Simulator & Verification Engine */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-teal-600 text-[24px]">verified_user</span>
              <h2 className="text-2xl font-bold text-primary">Live Anti-Fraud Scanner Sandbox</h2>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Simulate edge-case attack vectors: proxy screenshot submissions, expired token replays, and duplicate entries.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-bold text-primary mb-1.5">
                  Select Student Tester
                </label>
                <select
                  value={selectedStudentToTest}
                  onChange={(e) => setSelectedStudentToTest(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-semibold outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.usn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label-md font-bold text-primary mb-1.5">
                  Attack / Verification Scenario
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestMode('valid')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testMode === 'valid'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-surface-container-low border-surface-container-high text-outline'
                    }`}
                  >
                    <span className="font-bold text-xs block">Normal Scan</span>
                    <span className="text-[11px]">Valid active token</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMode('expired')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testMode === 'expired'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-surface-container-low border-surface-container-high text-outline'
                    }`}
                  >
                    <span className="font-bold text-xs block">Expired Screenshot</span>
                    <span className="text-[11px]">&gt; 15s token replay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMode('duplicate')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testMode === 'duplicate'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-surface-container-low border-surface-container-high text-outline'
                    }`}
                  >
                    <span className="font-bold text-xs block">Duplicate Attempt</span>
                    <span className="text-[11px]">Scanned twice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMode('tampered')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      testMode === 'tampered'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-surface-container-low border-surface-container-high text-outline'
                    }`}
                  >
                    <span className="font-bold text-xs block">Tampered Signature</span>
                    <span className="text-[11px]">HMAC hash forged</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulator}
            className="mt-6 w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>Execute Verification Test</span>
          </button>
        </div>
      </div>

      {/* Live Anti-Fraud Activity Table (matches Stitch) */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
          <h3 className="font-headline-sm text-primary font-bold text-lg">
            Real-Time Anti-Fraud Audit Activity Feed
          </h3>
          <span className="text-xs text-outline font-mono">Zero-Trust Audit Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                <th className="py-3.5 px-5">Student / Device</th>
                <th className="py-3.5 px-5">USN</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Verification Result</th>
                <th className="py-3.5 px-5">Audit Justification</th>
                <th className="py-3.5 px-5 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
              {antiFraudLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-primary">{log.student}</td>
                  <td className="py-3.5 px-5 font-mono text-secondary">{log.usn}</td>
                  <td className="py-3.5 px-5 font-mono text-outline">{log.timestamp}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        log.result === 'Valid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.result === 'Duplicate'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-on-surface-variant font-medium">{log.reason}</td>
                  <td className="py-3.5 px-5 font-mono text-xs text-outline">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
