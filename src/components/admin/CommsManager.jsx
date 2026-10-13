import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { 
  Send, 
  Zap, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Sparkles, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const CommsManager = () => {
  const { communications, sendBroadcast, attendees } = useEvent();

  const [broadcastTier, setBroadcastTier] = useState('all');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastFeedback, setBroadcastFeedback] = useState('');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastMessage) return;

    const count = sendBroadcast(broadcastTier, broadcastSubject, broadcastMessage);
    setBroadcastFeedback(`Dispatched automated broadcast to ${count} attendees!`);
    setBroadcastSubject('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastFeedback(''), 4000);
  };

  const automatedTriggers = [
    {
      trigger: 'ON_REGISTRATION',
      title: 'Immediate Registration & Digital Pass Issuance',
      desc: 'Dispatches unique QR code badge, wallet pass, and calendar invite instantly upon form submission.',
      status: 'Active',
      channel: 'Email + SMS Pass Link'
    },
    {
      trigger: 'ON_CHECKIN',
      title: 'Contactless Check-In Welcome & Floorplan',
      desc: 'Fired the moment attendee QR code is scanned at gate terminal. Delivers Wi-Fi password and room agenda.',
      status: 'Active',
      channel: 'In-App Notification / SMS'
    },
    {
      trigger: 'ON_FEEDBACK_SUBMITTED',
      title: 'Certificate Issuance & Verification Delivery',
      desc: 'Fired automatically upon survey completion. Issues official certificate ID, PDF download link, and verification hash.',
      status: 'Active',
      channel: 'Email + Download Link'
    }
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Event-Driven Trigger Architecture</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Automated Communications & Broadcasts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero manual emailing: Trigger-based notifications dispatch at key lifecycle transitions automatically.
          </p>
        </div>
      </div>

      {/* Automated Triggers Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {automatedTriggers.map((trig, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {trig.trigger}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active</span>
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">{trig.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{trig.desc}</p>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-indigo-300 font-medium">
              Channel: {trig.channel}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Broadcast Simulator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Send Live Targeted Broadcast</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast emergency updates, session room changes, or gala dinner alerts to all attendees or specific tiers.
          </p>
        </div>

        {broadcastFeedback && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{broadcastFeedback}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Segment</label>
              <select
                value={broadcastTier}
                onChange={(e) => setBroadcastTier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="all">All Registered Attendees ({attendees.length})</option>
                <option value="vip">VIP Only ({attendees.filter(a => a.tier === 'vip').length})</option>
                <option value="speaker">Distinguished Speakers ({attendees.filter(a => a.tier === 'speaker').length})</option>
                <option value="general">General Access ({attendees.filter(a => a.tier === 'general').length})</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Broadcast Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Room Change: Keynote starts in Grand Auditorium"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Message Content</label>
            <textarea
              rows="2"
              required
              placeholder="Enter broadcast announcement..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow flex items-center gap-2 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Instant Broadcast</span>
          </button>
        </form>
      </div>

      {/* Dispatched Communications Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Live Dispatched Messages Queue & History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated logs showing status, channel, and recipient delivery.</p>
          </div>
          <span className="font-mono text-xs text-slate-400">{communications.length} total dispatches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Trigger / ID</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Subject & Preview</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {communications.map(c => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block w-fit">
                      {c.trigger}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{c.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{c.recipientName}</div>
                    <div className="text-[10px] text-slate-400">{c.recipientEmail}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-slate-200 font-medium truncate">{c.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.preview}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-indigo-300 font-medium whitespace-nowrap">
                    {c.channel}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
