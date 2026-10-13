import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Sliders, Palette, Zap, ArrowRight } from 'lucide-react';

export const CertificateStudio = () => {
  const { 
    event, 
    setEvent, 
    templates, 
    selectedTemplate, 
    setSelectedTemplate, 
    attendees, 
    issueCertificate,
    setActiveView,
    setAttendeeTab
  } = useEvent();

  const [batchSuccess, setBatchSuccess] = useState('');

  const checkedInAttendees = attendees.filter(a => a.checkedIn);
  const certifiedCount = attendees.filter(a => a.certificateGenerated).length;
  const pendingCertCount = checkedInAttendees.filter(a => !a.certificateGenerated).length;

  const handleBatchIssue = () => {
    let count = 0;
    checkedInAttendees.forEach(a => {
      if (!a.certificateGenerated) {
        issueCertificate(a.id);
        count++;
      }
    });
    setBatchSuccess(`Successfully generated and unlocked certificates for ${count} eligible attendees!`);
    setTimeout(() => setBatchSuccess(''), 4000);
  };

  const activeTpl = templates.find(t => t.id === selectedTemplate) || templates[0];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Automated Credential Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Certificate Studio & Dynamic Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Design verifiable templates, configure auto-issuance rules, and execute batch PDF generation.
          </p>
        </div>

        <button
          onClick={handleBatchIssue}
          disabled={pendingCertCount === 0}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs shadow-glow flex items-center gap-2 transition-all ${
            pendingCertCount > 0
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Batch Issue to Checked-In ({pendingCertCount} Pending)</span>
        </button>
      </div>

      {batchSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{batchSuccess}</span>
        </div>
      )}

      {/* Grid: Controls & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Rules Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Automated Issuance Policies</span>
            </h3>

            {/* Toggle Prerequisite */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Gated Survey Prerequisite</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Require feedback submission before certificate unlocks.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvent(prev => ({ ...prev, requireFeedbackForCertificate: !prev.requireFeedbackForCertificate }))}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  event.requireFeedbackForCertificate ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total Issued:</span>
                <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">{certifiedCount}</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Checked-in Pending:</span>
                <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{pendingCertCount}</div>
              </div>
            </div>
          </div>

          {/* Template Styles */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent-cyan" />
              <span>Designer Certificate Templates</span>
            </h3>

            <div className="space-y-2.5">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedTemplate === tpl.id
                      ? 'bg-purple-600/20 border-purple-500 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-white">{tpl.name}</div>
                    <div className="text-[11px] text-slate-400">{tpl.theme}</div>
                  </div>
                  {selectedTemplate === tpl.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-glow"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Preview Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Vector Layout Preview
            </span>
            <button
              onClick={() => {
                setActiveView('attendee');
                setAttendeeTab('certificate');
              }}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
            >
              <span>Test Attendee Download View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Miniature Scale Preview */}
          <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden">
            <div className={`w-full max-w-lg aspect-[1.4/1] rounded-2xl p-6 relative border-2 flex flex-col justify-between shadow-2xl ${activeTpl.borderClass}`}>
              <div className="text-center space-y-1">
                <div className="text-[9px] font-mono tracking-widest text-indigo-300 uppercase">
                  OFFICIAL SUMMIT CREDENTIAL
                </div>
                <div className="text-base font-extrabold text-white uppercase tracking-wide">
                  Certificate of Attendance
                </div>
                <div className="text-[9px] text-slate-400 uppercase">Conferred Upon</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-xl font-black text-white">Alex Morgan</div>
                <div className="text-[10px] text-indigo-300">Lead Systems Architect • TechCorp Global</div>
                <div className="text-[9px] text-slate-300 max-w-xs mx-auto line-clamp-2">
                  For outstanding participation in the {event.name}.
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-slate-800/80 pt-2 text-[8px] text-slate-400">
                <div>
                  <div className="font-serif italic text-indigo-200">Dr. Elena Rostova</div>
                  <div className="text-slate-500">Summit Executive Chair</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 mx-auto flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-mono text-[7px] text-slate-400">{event.isoDate}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-purple-400 font-bold">CERT-GTAIS-80921</div>
                  <div className="text-slate-500">VERIFIED HASH</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
