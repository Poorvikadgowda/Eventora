import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { ShieldCheck, Search, CheckCircle2, XCircle, Award, Calendar, Building, Sparkles } from 'lucide-react';

export const PublicVerify = () => {
  const { verifyCertificate, attendees } = useEvent();
  const [searchQuery, setSearchQuery] = useState('CERT-GTAIS-80921');
  const [result, setResult] = useState(() => verifyCertificate('CERT-GTAIS-80921'));

  const handleSearch = (e) => {
    e?.preventDefault();
    const res = verifyCertificate(searchQuery);
    setResult(res);
  };

  // Find sample valid certificates for 1-click testing
  const validAttendees = attendees.filter(a => a.certificateGenerated);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Public Credential Verification Portal</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">
          Verify Certificate Authenticity
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Confirm official summit certificates, attendance records, and credential hashes against the immutable registry.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-xl">
        <div className="p-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Certificate ID (e.g. CERT-GTAIS-80921) or Hash..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all"
        >
          Verify Credential
        </button>
      </form>

      {/* Quick Test Links */}
      {validAttendees.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Quick 1-Click Verification Test:</span>
          {validAttendees.slice(0, 3).map(a => (
            <button
              key={a.id}
              onClick={() => {
                setSearchQuery(a.certificateId);
                setResult(verifyCertificate(a.certificateId));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-800 transition-colors"
            >
              {a.certificateId} ({a.name})
            </button>
          ))}
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {result.valid ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-glow-emerald space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Official Certificate Verified</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-emerald-400/90 font-medium">
                      Authentic credential verified on the AutoEvent Hub Registry
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  STATUS: AUTHENTIC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Recipient Name:</span>
                  <div className="text-base font-bold text-white">{result.attendee.name}</div>
                  <div className="text-xs text-indigo-400">{result.attendee.organization}</div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Credential Type:</span>
                  <div className="text-base font-bold text-white">Certificate of Completion</div>
                  <div className="text-xs text-slate-400">{result.event.name}</div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Certificate ID:</span>
                  <div className="font-mono font-bold text-purple-300">{result.attendee.certificateId}</div>
                  <div className="font-mono text-[10px] text-slate-500">Hash: {result.attendee.certificateHash}</div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Event Completion Date:</span>
                  <div className="text-slate-200 font-semibold">{result.event.isoDate}</div>
                  <div className="text-[10px] text-emerald-400">Attendance: Verified & Checked In</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 text-center">
                🔒 Cryptographic checksum guarantees that this certificate has not been forged, revoked, or altered.
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 border-2 border-rose-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Credential Verification Failed</h3>
              <p className="text-xs text-rose-300 max-w-sm mx-auto">
                {result.message}
              </p>
              <p className="text-[11px] text-slate-500">
                Please ensure the Certificate ID or hash was entered correctly.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
