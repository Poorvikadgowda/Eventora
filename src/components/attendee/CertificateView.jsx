import React, { useState, useEffect, useRef } from 'react';
import { useEvent } from '../../store/EventContext';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { 
  Award, 
  Download, 
  Share2, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  Palette, 
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CertificateView = () => {
  const { 
    event, 
    currentAttendee, 
    issueCertificate, 
    setAttendeeTab, 
    templates, 
    selectedTemplate, 
    setSelectedTemplate 
  } = useEvent();

  const [qrUrl, setQrUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const certRef = useRef(null);

  const activeTpl = templates.find(t => t.id === selectedTemplate) || templates[0];

  useEffect(() => {
    if (currentAttendee?.certificateId) {
      // QR contains public verification link
      const verifyLink = `${window.location.origin}/?verify=${currentAttendee.certificateId}`;
      generateQrDataUrl(verifyLink, { width: 180, margin: 1 }).then(setQrUrl);
    }
  }, [currentAttendee]);

  if (!currentAttendee) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-white">No Attendee Selected</h3>
        <p className="text-xs text-slate-400 mt-2">
          Please select an attendee from the top testing dropdown.
        </p>
      </div>
    );
  }

  // If certificate not yet unlocked
  if (!currentAttendee.certificateGenerated) {
    return (
      <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Certificate Locked</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Certificates are issued automatically to attendees who attend the sessions and submit the post-event survey.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1. Gate Check-In:</span>
            {currentAttendee.checkedIn ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">Pending Gate Scan</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">2. Feedback Survey:</span>
            {currentAttendee.feedbackSubmitted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="text-slate-500">Pending Feedback</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setAttendeeTab(currentAttendee.checkedIn ? 'feedback' : 'pass')}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow flex items-center justify-center gap-2 transition-all"
          >
            <span>{currentAttendee.checkedIn ? 'Complete Survey to Unlock' : 'Go to Gate Pass'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => issueCertificate(currentAttendee.id)}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all"
          >
            ⚡ Test Auto-Issue Now
          </button>
        </div>
      </div>
    );
  }

  // Download PDF using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Certificate_${currentAttendee.name.replace(/\s+/g, '_')}_${currentAttendee.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Verified Credential</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Certificate of Attendance & Completion
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            ID: <span className="text-purple-300 font-bold">{currentAttendee.certificateId}</span> • Hash: {currentAttendee.certificateHash}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Vector PDF'}</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div className="flex justify-center overflow-x-auto p-2">
        <div
          ref={certRef}
          className={`w-[840px] h-[580px] shrink-0 rounded-3xl p-10 relative overflow-hidden border-4 shadow-2xl flex flex-col justify-between ${activeTpl.borderClass} ${activeTpl.fontFamily}`}
        >
          {/* Decorative Corner Flairs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-tl-full pointer-events-none"></div>

          {/* Top Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono uppercase tracking-widest text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
              <span>OFFICIAL VERIFIED SUMMIT CREDENTIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-white drop-shadow-md">
              Certificate of Attendance
            </h1>
            <p className="text-xs text-slate-400 tracking-widest uppercase font-medium">
              THIS RECOGNITION IS PROUDLY CONFERRED UPON
            </p>
          </div>

          {/* Recipient Name */}
          <div className="text-center my-auto space-y-2 relative z-10">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
              {currentAttendee.name}
            </div>
            <div className="text-sm text-indigo-300 font-medium">
              {currentAttendee.organization} {currentAttendee.jobTitle && `• ${currentAttendee.jobTitle}`}
            </div>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mt-2"></div>

            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-2">
              For distinguished participation and active engagement in the{' '}
              <strong className="text-white">{event.name}</strong>, contributing to forward-looking discussions on enterprise automation, agentic workflows, and cloud systems.
            </p>
          </div>

          {/* Footer: Signatures, Seal & Verification QR */}
          <div className="grid grid-cols-3 items-end pt-6 border-t border-slate-800/80 relative z-10">
            
            {/* Signature 1 */}
            <div className="text-left space-y-1">
              <div className="font-serif italic text-lg text-indigo-200 font-bold tracking-wider">
                Dr. Elena Rostova
              </div>
              <div className="w-36 h-0.5 bg-slate-700"></div>
              <div className="text-[10px] font-bold text-slate-300">Dr. Elena Rostova</div>
              <div className="text-[9px] text-slate-500">Summit Executive Chair</div>
            </div>

            {/* Official Center Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-1 border border-amber-400/40">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-amber-200 mt-0.5">
                    AUTHENTIC
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-1">
                Issued: {event.isoDate}
              </div>
            </div>

            {/* Verification QR & Hash */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div>
                <div className="text-[10px] font-bold text-slate-300">Public Verification</div>
                <div className="font-mono text-[9px] text-purple-400 font-bold">{currentAttendee.certificateId}</div>
                <div className="font-mono text-[8px] text-slate-500 truncate max-w-[120px]">{currentAttendee.certificateHash}</div>
              </div>
              {qrUrl && (
                <div className="p-1 bg-white rounded-lg shadow">
                  <img src={qrUrl} alt="Verify QR" className="w-12 h-12" />
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Verification Direct Link Callout */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Anyone can verify this credential at the public verification portal using ID: <strong className="font-mono text-purple-300">{currentAttendee.certificateId}</strong></span>
        </div>
        <button
          onClick={() => setAttendeeTab('verify')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <span>Open Public Verifier</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
