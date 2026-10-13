import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Award, 
  QrCode, 
  AlertCircle,
  FileSpreadsheet,
  X,
  ExternalLink
} from 'lucide-react';
import { exportAttendeesToCSV, parseCSV } from '../../utils/csvExport';

export const AttendeeManager = () => {
  const { 
    attendees, 
    checkInAttendee, 
    issueCertificate, 
    registerAttendee,
    setCurrentAttendeeId,
    setActiveView,
    setAttendeeTab,
    importCSV,
    event
  } = useEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStrategy, setImportStrategy] = useState('skip');
  const [importResult, setImportResult] = useState(null);

  // New Attendee Form state
  const [newAttendeeData, setNewAttendeeData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    jobTitle: '',
    tier: 'general',
    track: 'ai'
  });

  // Filter attendees
  const filteredAttendees = attendees.filter(a => {
    const matchSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.organization && a.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchTier = tierFilter === 'all' || a.tier === tierFilter;

    let matchStatus = true;
    if (statusFilter === 'checkedIn') matchStatus = a.checkedIn;
    if (statusFilter === 'pending') matchStatus = !a.checkedIn;
    if (statusFilter === 'certified') matchStatus = a.certificateGenerated;

    return matchSearch && matchTier && matchStatus;
  });

  const handleManualAdd = (e) => {
    e.preventDefault();
    const res = registerAttendee(newAttendeeData);
    if (res.success) {
      setIsAddModalOpen(false);
      setNewAttendeeData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        jobTitle: '',
        tier: 'general',
        track: 'ai'
      });
    } else {
      alert(res.message);
    }
  };

  const handleImportCSVSubmit = () => {
    if (!importText.trim()) return;
    const parsed = parseCSV(importText);
    if (parsed.length === 0) {
      alert('Could not parse any valid attendee rows. Ensure comma-separated format with headers: name, email, organization, tier');
      return;
    }
    const res = importCSV(parsed, importStrategy);
    setImportResult(res);
  };

  const loadSampleCSVWithDuplicates = () => {
    const sample = `name,email,organization,tier
Alex Morgan,alex.morgan@techcorp.io,TechCorp,vip
Kavita Patel,kavita.patel@deeptech.ai,DeepTech AI,general
Marcus Sterling,marcus.sterling@apexpartners.com,Apex Partners,sponsor
Ethan Chen,ethan.chen@berkeley.edu,UC Berkeley,student`;
    setImportText(sample);
  };

  const inspectAttendeePass = (id) => {
    setCurrentAttendeeId(id);
    setActiveView('attendee');
    setAttendeeTab('pass');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header & Bulk Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Unified Central Registry</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Attendee Management & Deduplication
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Single Source of Truth: Automated pass generation, anti-duplication validation, and credential tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-accent-cyan" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => exportAttendeesToCSV(attendees, event.shortName)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Attendee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, ID, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Tier & Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Tiers</option>
              <option value="general" className="bg-slate-900">General</option>
              <option value="vip" className="bg-slate-900">VIP</option>
              <option value="speaker" className="bg-slate-900">Speaker</option>
              <option value="student" className="bg-slate-900">Student</option>
              <option value="sponsor" className="bg-slate-900">Sponsor</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="checkedIn" className="bg-slate-900">Checked In</option>
              <option value="pending" className="bg-slate-900">Awaiting Check-in</option>
              <option value="certified" className="bg-slate-900">Certified</option>
            </select>
          </div>
        </div>

      </div>

      {/* Attendee Data Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Attendee</th>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-5 py-3.5">Tier</th>
                <th className="px-5 py-3.5">Gate Status</th>
                <th className="px-5 py-3.5">Survey & Cert</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map(attendee => (
                  <tr key={attendee.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    {/* Name & ID */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0">
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{attendee.name}</span>
                            <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                              {attendee.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{attendee.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="px-5 py-4">
                      <div className="text-slate-200">{attendee.organization || 'Independent'}</div>
                      <div className="text-[11px] text-slate-400">{attendee.jobTitle || 'Attendee'}</div>
                    </td>

                    {/* Tier */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        attendee.tier === 'vip'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : attendee.tier === 'speaker'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : attendee.tier === 'student'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        {attendee.tier}
                      </span>
                    </td>

                    {/* Gate Status */}
                    <td className="px-5 py-4">
                      {attendee.checkedIn ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-bold">Checked In</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(attendee.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400/80">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Awaiting Gate</span>
                        </div>
                      )}
                    </td>

                    {/* Survey & Certificate */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="text-[11px] flex items-center gap-1.5">
                          <span className="text-slate-400">Survey:</span>
                          {attendee.feedbackSubmitted ? (
                            <span className="text-amber-400 font-bold">
                              ★ {attendee.feedback?.rating}/5
                            </span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </div>
                        <div className="text-[11px] flex items-center gap-1.5">
                          <span className="text-slate-400">Cert:</span>
                          {attendee.certificateGenerated ? (
                            <span className="font-mono text-purple-400 font-bold">
                              Issued
                            </span>
                          ) : (
                            <span className="text-slate-500">Locked</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Instant Check-In button if not checked in */}
                        {!attendee.checkedIn && (
                          <button
                            onClick={() => checkInAttendee(attendee.id)}
                            title="Check-In at Gate"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                          >
                            Check In
                          </button>
                        )}

                        {/* Issue Certificate button */}
                        {!attendee.certificateGenerated && (
                          <button
                            onClick={() => issueCertificate(attendee.id)}
                            title="Issue Certificate"
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Pass & QR */}
                        <button
                          onClick={() => inspectAttendeePass(attendee.id)}
                          title="Open Attendee Pass & QR"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    No attendees match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <button
              onClick={() => { setIsImportModalOpen(false); setImportResult(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider">
              <Upload className="w-4 h-4" />
              <span>Bulk CSV Importer with Anti-Duplication</span>
            </div>

            <h3 className="text-xl font-bold text-white">Import Attendees from CSV</h3>
            <p className="text-xs text-slate-400">
              Paste or load CSV data. The system automatically inspects email and phone to prevent duplicate entries.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">CSV Text (Headers: name, email, organization, tier)</span>
                <button
                  type="button"
                  onClick={loadSampleCSVWithDuplicates}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Load Sample with Duplicates
                </button>
              </div>
              <textarea
                rows="5"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="name,email,organization,tier&#10;Jordan Reed,jordan@company.com,Acme,general"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Deduplication Strategy Picker */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">Duplicate Resolution Strategy:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportStrategy('skip')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    importStrategy === 'skip' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Skip Duplicates</div>
                  <div className="text-[10px] text-slate-400">Preserve existing records</div>
                </button>
                <button
                  type="button"
                  onClick={() => setImportStrategy('update')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    importStrategy === 'update' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Update Existing</div>
                  <div className="text-[10px] text-slate-400">Refresh existing attendee data</div>
                </button>
              </div>
            </div>

            {/* Result summary */}
            {importResult && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-300">Import Batch Complete!</div>
                <div className="text-slate-300">
                  Added: <strong className="text-white">{importResult.added}</strong> • 
                  Updated: <strong className="text-white">{importResult.updated}</strong> • 
                  Skipped (Duplicates): <strong className="text-amber-300">{importResult.skipped}</strong>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setIsImportModalOpen(false); setImportResult(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleImportCSVSubmit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow"
              >
                Execute Bulk Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Attendee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Add Attendee to Registry</h3>
            <p className="text-xs text-slate-400">
              Generates instant QR token and queues welcome email without manual spreadsheets.
            </p>

            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAttendeeData.name}
                  onChange={(e) => setNewAttendeeData({ ...newAttendeeData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newAttendeeData.email}
                    onChange={(e) => setNewAttendeeData({ ...newAttendeeData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newAttendeeData.phone}
                    onChange={(e) => setNewAttendeeData({ ...newAttendeeData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Organization</label>
                  <input
                    type="text"
                    value={newAttendeeData.organization}
                    onChange={(e) => setNewAttendeeData({ ...newAttendeeData, organization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Badge Tier</label>
                  <select
                    value={newAttendeeData.tier}
                    onChange={(e) => setNewAttendeeData({ ...newAttendeeData, tier: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="general">General</option>
                    <option value="vip">VIP</option>
                    <option value="speaker">Speaker</option>
                    <option value="student">Student</option>
                    <option value="sponsor">Sponsor</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-glow"
                >
                  Register Attendee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
