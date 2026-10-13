import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getEventResults,
  createEventResult,
  updateEventResult,
  approveEventResult,
  approveAllEventResults,
  deleteEventResult,
  getEventParticipants,
  getEventTeams,
  validateCsvResults,
  bulkSaveResults,
  batchGenerateCertificates,
} from '../../services/certificateService';

export const ManageResults = () => {
  const { id: routeEventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { addToast } = useToast();
  const { currentUser, role, isAdmin } = useAuth();

  const [selectedEventId, setSelectedEventId] = useState(routeEventId || 'evt_hackathon_03');
  const [results, setResults] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'roster'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'reapproval' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  const [modalCategory, setModalCategory] = useState('winner'); // 'winner' | 'achievement'
  const [modalAwardTitle, setModalAwardTitle] = useState('1st Place (Champion)');
  const [modalRank, setModalRank] = useState('1');
  const [modalIsTeam, setModalIsTeam] = useState(true);
  const [modalTeamName, setModalTeamName] = useState('');
  const [modalProjectTitle, setModalProjectTitle] = useState('');
  const [modalScore, setModalScore] = useState(95);
  const [modalJudgeNotes, setModalJudgeNotes] = useState('');
  const [modalSelectedStudents, setModalSelectedStudents] = useState([]);
  const [modalStatus, setModalStatus] = useState('draft');

  // CSV Import Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvValidating, setCsvValidating] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvInitialStatus, setCsvInitialStatus] = useState('draft');

  // Audit History Modal State
  const [auditModalResult, setAuditModalResult] = useState(null);

  // Bulk Approval Modal State
  const [isApproveAllModalOpen, setIsApproveAllModalOpen] = useState(false);

  // Active Event
  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || {
      id: selectedEventId,
      title: 'Global FinTech Hackathon 2026',
      category: 'Hackathon',
      date: '2026-10-22',
      certificateTypes: ['participation', 'winner', 'achievement'],
    };
  }, [events, selectedEventId]);

  // Load all live database records for the selected event
  const loadEventData = async () => {
    setLoading(true);
    try {
      const [resList, partList, teamList] = await Promise.all([
        getEventResults(selectedEventId),
        getEventParticipants(selectedEventId),
        getEventTeams(selectedEventId),
      ]);
      setResults(resList);
      setParticipants(partList);
      setTeams(teamList);
    } catch (err) {
      console.error('Failed to load event data:', err);
      addToast({
        title: 'Data Load Warning',
        message: 'Could not fetch database records. Refreshing view.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeEventId && routeEventId !== selectedEventId) {
      setSelectedEventId(routeEventId);
    }
  }, [routeEventId]);

  useEffect(() => {
    loadEventData();
  }, [selectedEventId]);

  // Access Control Guard: Only Admin or Organizers
  if (!isAdmin && role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[36px]">gavel</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Organizer Authorization Required</h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Competition result management, score entry, and certificate approval actions are restricted strictly to authorized academic organizers and event administrators.
        </p>
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Student Portal
        </Link>
      </div>
    );
  }

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setEditingResultId(null);
    setModalCategory('winner');
    setModalAwardTitle('1st Place (Champion)');
    setModalRank('1');
    setModalIsTeam(teams.length > 0);
    setModalTeamName(teams[0]?.name || '');
    setModalProjectTitle(teams[0]?.projectTitle || '');
    setModalScore(95);
    setModalJudgeNotes('');
    setModalSelectedStudents(teams[0]?.memberIds || []);
    setModalStatus('draft');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (res) => {
    setEditingResultId(res.id);
    setModalCategory(res.awardCategory || 'winner');
    setModalAwardTitle(res.awardTitle || '');
    setModalRank(res.rank ? String(res.rank) : '');
    setModalIsTeam(Boolean(res.isTeam));
    setModalTeamName(res.teamName || '');
    setModalProjectTitle(res.projectTitle || '');
    setModalScore(res.score !== undefined ? res.score : 90);
    setModalJudgeNotes(res.judgeNotes || '');
    setModalSelectedStudents(res.studentIds || []);
    setModalStatus(res.status || 'draft');
    setIsModalOpen(true);
  };

  // Team selection helper in modal
  const handleSelectTeamPreset = (tname) => {
    setModalTeamName(tname);
    const tm = teams.find((t) => t.name === tname);
    if (tm) {
      if (tm.projectTitle) setModalProjectTitle(tm.projectTitle);
      if (tm.memberIds && tm.memberIds.length > 0) {
        setModalSelectedStudents(tm.memberIds);
      }
    }
  };

  // Save Modal Submission (Create or Update)
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (modalSelectedStudents.length === 0) {
      alert('Please select at least one student recipient for this award.');
      return;
    }
    if (modalIsTeam && !modalTeamName.trim()) {
      alert('Please provide a team name for team award.');
      return;
    }

    try {
      const studentObjs = participants.filter((p) => modalSelectedStudents.includes(p.studentId));
      const studentNames = studentObjs.map((s) => s.name);

      if (editingResultId) {
        // UPDATE existing result
        const res = await updateEventResult(editingResultId, {
          awardCategory: modalCategory,
          awardTitle: modalAwardTitle,
          rank: modalCategory === 'winner' && modalRank ? parseInt(modalRank, 10) : undefined,
          isTeam: modalIsTeam,
          teamName: modalIsTeam ? modalTeamName : undefined,
          studentIds: modalSelectedStudents,
          studentNames,
          projectTitle: modalProjectTitle || undefined,
          score: parseFloat(modalScore) || 0,
          judgeNotes: modalJudgeNotes || undefined,
          editorName: currentUser?.name || 'Academic Organizer',
          editReason: 'Manual modification in Manage Results portal',
        });

        if (res.reapprovalRequired) {
          addToast({
            title: 'Reapproval Required',
            message: 'You modified an approved outcome. It has been reverted to "Needs Reapproval" and requires authorized approval before certificates can be issued.',
            type: 'warning',
          });
        } else {
          addToast({
            title: 'Result Updated',
            message: 'Competition outcome was successfully updated.',
            type: 'success',
          });
        }
      } else {
        // CREATE new result
        await createEventResult(selectedEventId, {
          awardCategory: modalCategory,
          awardTitle: modalAwardTitle,
          rank: modalCategory === 'winner' && modalRank ? parseInt(modalRank, 10) : undefined,
          isTeam: modalIsTeam,
          teamName: modalIsTeam ? modalTeamName : undefined,
          studentIds: modalSelectedStudents,
          studentNames,
          projectTitle: modalProjectTitle || undefined,
          score: parseFloat(modalScore) || 0,
          judgeNotes: modalJudgeNotes || undefined,
          status: modalStatus,
          approvedBy: modalStatus === 'approved' ? (currentUser?.name || 'Dr. Eleanor Vance') : undefined,
        });

        addToast({
          title: 'Result Recorded',
          message: `${modalAwardTitle} recorded as ${modalStatus.toUpperCase()}.`,
          type: 'success',
        });
      }

      setIsModalOpen(false);
      loadEventData();
    } catch (err) {
      addToast({ title: 'Submission Failed', message: err.message, type: 'error' });
    }
  };

  // Single Approve Result
  const handleApproveResult = async (resultId) => {
    const approverName = currentUser?.name || 'Dr. Eleanor Vance (Chief Academic Officer)';
    try {
      const ok = await approveEventResult(resultId, approverName, 'Verified and approved by organizer');
      if (ok) {
        addToast({
          title: 'Outcome Approved',
          message: 'The competition outcome is now verified and cleared for certificate issuance.',
          type: 'success',
        });
        loadEventData();
      }
    } catch (err) {
      addToast({ title: 'Approval Failed', message: err.message, type: 'error' });
    }
  };

  // Bulk Approve All
  const handleApproveAll = async () => {
    const approverName = currentUser?.name || 'Dr. Eleanor Vance (Chief Academic Officer)';
    try {
      const res = await approveAllEventResults(selectedEventId, approverName, 'Bulk approval of verified judging outcomes');
      if (res.success) {
        addToast({
          title: 'All Outcomes Approved',
          message: `Approved ${res.approvedCount} competition outcome(s). Certificate generation is now unlocked.`,
          type: 'success',
        });
        setIsApproveAllModalOpen(false);
        loadEventData();
      }
    } catch (err) {
      addToast({ title: 'Bulk Approval Failed', message: err.message, type: 'error' });
    }
  };

  // Delete Result
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this competition outcome?')) return;
    try {
      const ok = await deleteEventResult(resultId);
      if (ok) {
        addToast({
          title: 'Outcome Deleted',
          message: 'Competition result record was removed from the database.',
          type: 'info',
        });
        loadEventData();
      }
    } catch (err) {
      addToast({ title: 'Deletion Failed', message: err.message, type: 'error' });
    }
  };

  // Trigger Winner Certificates
  const handleGenerateWinnerCertificates = async () => {
    const approvedResults = results.filter((r) => r.status === 'approved');
    if (approvedResults.length === 0) {
      addToast({
        title: 'Certificate Issuance Blocked',
        message: 'No approved competition outcomes found. You must review and approve outcomes before issuing winner certificates.',
        type: 'warning',
      });
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        eventId: selectedEventId,
        templateConfig: {
          title: 'Certificate of Excellence',
          subtitle: 'This is proudly presented to',
          eventName: currentEvent.title,
          description: `In recognition of competitive excellence in ${currentEvent.title}.`,
          issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          issuerName: 'Dr. Eleanor Vance',
          issuerTitle: 'Chief Academic Officer',
          coIssuerName: 'Marcus Sterling',
          coIssuerTitle: 'Event Director',
          logoType: 'eventora',
        },
        certificateType: 'results', // Generate winner & achievement from approved outcomes
      };

      const res = await batchGenerateCertificates(payload);
      addToast({
        title: 'Winner Certificates Issued',
        message: `Generated ${res.successfulCount || 0} award credentials (${res.skippedCount || 0} skipped/deduplicated).`,
        type: 'success',
      });
      loadEventData();
    } catch (err) {
      addToast({
        title: 'Issuance Error',
        message: err.message || 'Failed to issue winner certificates',
        type: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Trigger Participation Certificates
  const handleGenerateParticipationCertificates = async () => {
    setGenerating(true);
    try {
      const payload = {
        eventId: selectedEventId,
        templateConfig: {
          title: 'Certificate of Participation',
          subtitle: 'This is proudly presented to',
          eventName: currentEvent.title,
          description: `For verified active participation in ${currentEvent.title}.`,
          issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          issuerName: 'Dr. Eleanor Vance',
          issuerTitle: 'Chief Academic Officer',
          coIssuerName: 'Marcus Sterling',
          coIssuerTitle: 'Event Director',
          logoType: 'eventora',
        },
        certificateType: 'participation',
      };

      const res = await batchGenerateCertificates(payload);
      addToast({
        title: 'Participation Certificates Issued',
        message: `Issued ${res.successfulCount || 0} participation credentials to verified attendees (${res.skippedCount || 0} skipped).`,
        type: 'success',
      });
      loadEventData();
    } catch (err) {
      addToast({
        title: 'Issuance Error',
        message: err.message || 'Failed to issue participation certificates',
        type: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  // CSV Validation & Preview
  const handleValidateCsv = async () => {
    if (!csvText.trim()) {
      alert('Please paste or upload CSV text first.');
      return;
    }
    setCsvValidating(true);
    try {
      const preview = await validateCsvResults(selectedEventId, csvText);
      setCsvPreview(preview);
      addToast({
        title: 'CSV Validated',
        message: `${preview.validCount} valid row(s), ${preview.invalidCount} error(s). Review below before committing.`,
        type: preview.invalidCount > 0 ? 'warning' : 'success',
      });
    } catch (err) {
      addToast({ title: 'Validation Error', message: err.message, type: 'error' });
    } finally {
      setCsvValidating(false);
    }
  };

  // CSV Confirm & Save
  const handleConfirmCsvImport = async () => {
    if (!csvPreview || !csvPreview.validRows || csvPreview.validRows.length === 0) {
      alert('No valid rows available to save.');
      return;
    }
    try {
      const count = await bulkSaveResults(selectedEventId, csvPreview.validRows, csvInitialStatus);
      addToast({
        title: 'Import Successful',
        message: `Imported ${count} competition outcome(s) as ${csvInitialStatus.toUpperCase()}.`,
        type: 'success',
      });
      setIsCsvModalOpen(false);
      setCsvText('');
      setCsvPreview(null);
      loadEventData();
    } catch (err) {
      addToast({ title: 'Import Failed', message: err.message, type: 'error' });
    }
  };

  // Download Sample CSV
  const handleDownloadCsvTemplate = () => {
    const csvSample = `rank,award_category,award_title,team_name,identifier,score,project_title,notes
1,winner,1st Place (Champion),CodeCrafters,1MS22CS042,98.5,Autonomous Agentic IDE,Flawless architecture and delivery
2,winner,2nd Place (Runner-Up),CyberKnights,1MS22ME034,94.0,Quantum Intrusion Defense,Strong threat simulation
3,winner,3rd Place,DataDynamos,1MS22CS075,90.5,Predictive Agro Analytics,Intuitive farmer telemetry
,achievement,Best Innovation,,1MS22AI015,92.0,AI Health Diagnostics,Remarkable edge compute model`;

    const blob = new Blob([csvSample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Eventora_Results_Template_${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Category filter
      if (categoryFilter !== 'all' && r.awardCategory !== categoryFilter) return false;
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'approved' && r.status !== 'approved') return false;
        if (statusFilter === 'pending' && r.status !== 'pending_approval') return false;
        if (statusFilter === 'reapproval' && r.status !== 'reapproval_required') return false;
        if (statusFilter === 'draft' && r.status !== 'draft') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAward = r.awardTitle?.toLowerCase().includes(q);
        const matchesTeam = r.teamName?.toLowerCase().includes(q);
        const matchesProject = r.projectTitle?.toLowerCase().includes(q);
        const matchesStudents = r.studentNames?.some((n) => n.toLowerCase().includes(q));
        if (!matchesAward && !matchesTeam && !matchesProject && !matchesStudents) return false;
      }
      return true;
    });
  }, [results, categoryFilter, statusFilter, searchQuery]);

  // Statistics
  const approvedCount = results.filter((r) => r.status === 'approved').length;
  const pendingCount = results.filter((r) => r.status === 'pending_approval').length;
  const reapprovalCount = results.filter((r) => r.status === 'reapproval_required').length;
  const draftCount = results.filter((r) => r.status === 'draft').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-amber-400/30">
              <span className="material-symbols-outlined text-[16px]">military_tech</span>
              Enterprise Result Management System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Competition & Award Results
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Official scoring, ranking, and award management for hackathons and competitive events.
              Results are strictly audited with approval gates and automatic reapproval guards before winner certificates are generated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition border border-white/20 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import CSV
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition shadow-md shadow-emerald-900/30"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Outcome
            </button>
            <Link
              to="/admin/certificates"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              Certificate Studio
            </Link>
          </div>
        </div>

        {/* Event Selector & Live State Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-800/90 text-white font-medium text-sm rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.category || 'Event'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <span className="material-symbols-outlined text-teal-400 text-[16px]">how_to_reg</span>
              {participants.length} Registered Participants
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">groups</span>
              {teams.length} Teams
            </span>
          </div>
        </div>
      </div>

      {/* Reapproval Notice Banner if any results need reapproval */}
      {reapprovalCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">sync_problem</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900">
              Action Required: {reapprovalCount} Outcome(s) Modified and Awaiting Reapproval
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Approved scores or rankings were modified by an organizer. Affected certificates cannot be generated or reissued until an authorized organizer reviews and reapproves the modified outcomes.
            </p>
          </div>
          <button
            onClick={() => setIsApproveAllModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-sm shrink-0"
          >
            Review & Reapprove
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">trophy</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{results.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outcomes</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved (Ready)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-600">{pendingCount + draftCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft / Pending</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">published_with_changes</span>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{reapprovalCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Reapproval</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Results vs Roster */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'results'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">award_star</span>
            Competition Outcomes ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'roster'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">badge</span>
            Live Registered Roster ({participants.length})
          </button>
        </div>

        {/* Certificate Generation Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateWinnerCertificates}
            disabled={generating || approvedCount === 0}
            title={approvedCount === 0 ? 'Approve at least one outcome before issuing winner certificates' : ''}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              approvedCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-900/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">military_tech</span>
            {generating ? 'Generating...' : `Generate Winner Certs (${approvedCount})`}
          </button>
          <button
            onClick={handleGenerateParticipationCertificates}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Generate Participation Certs
          </button>
        </div>
      </div>

      {/* TAB 1: Competition Outcomes View */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by award, team, student, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Approval</option>
                <option value="reapproval">Needs Reapproval</option>
                <option value="draft">Drafts</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                <option value="winner">Winner Podiums</option>
                <option value="achievement">Special Awards</option>
              </select>
            </div>

            {/* Bulk Approval Button */}
            {(pendingCount > 0 || reapprovalCount > 0 || draftCount > 0) && (
              <button
                onClick={() => setIsApproveAllModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Approve All Pending ({pendingCount + reapprovalCount + draftCount})
              </button>
            )}
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">
                  progress_activity
                </span>
                <p className="text-sm font-medium">Loading competition results registry...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <span className="material-symbols-outlined text-[28px]">search_off</span>
                </div>
                <h3 className="text-base font-bold text-slate-800">No outcomes found</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  No competitive outcomes match your current filter. Record a new outcome or import via CSV.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition shadow-sm"
                >
                  Record First Outcome
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Rank / Distinction</th>
                      <th className="py-3.5 px-4">Award Category</th>
                      <th className="py-3.5 px-4">Recipient (Team / Student)</th>
                      <th className="py-3.5 px-4">Project Title</th>
                      <th className="py-3.5 px-4 text-center">Score</th>
                      <th className="py-3.5 px-4 text-center">Approval Status</th>
                      <th className="py-3.5 px-4">Approved By</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((r) => {
                      const isApproved = r.status === 'approved';
                      const isReapproval = r.status === 'reapproval_required';
                      const isPending = r.status === 'pending_approval';

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          {/* Rank / Distinction */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              {r.rank === 1 && (
                                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold shadow-sm">
                                  1
                                </span>
                              )}
                              {r.rank === 2 && (
                                <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold shadow-sm">
                                  2
                                </span>
                              )}
                              {r.rank === 3 && (
                                <span className="w-7 h-7 rounded-lg bg-amber-800/10 text-amber-900 flex items-center justify-center font-extrabold shadow-sm">
                                  3
                                </span>
                              )}
                              {(!r.rank || r.rank > 3) && (
                                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                  <span className="material-symbols-outlined text-[16px]">stars</span>
                                </span>
                              )}
                              <div>
                                <span className="block text-slate-900 font-bold">{r.awardTitle}</span>
                                {r.judgeNotes && (
                                  <span className="block text-[11px] text-slate-400 font-normal italic truncate max-w-[200px]">
                                    "{r.judgeNotes}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Award Category */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                r.awardCategory === 'winner'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {r.awardCategory === 'winner' ? 'trophy' : 'verified'}
                              </span>
                              {r.awardCategory}
                            </span>
                          </td>

                          {/* Recipient */}
                          <td className="py-3.5 px-4">
                            {r.isTeam ? (
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-slate-400 text-[16px]">group</span>
                                  {r.teamName || 'Team'}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {r.studentNames?.join(', ') || 'No members listed'}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                                  {r.studentNames?.[0] || 'Individual Participant'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Project Title */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {r.projectTitle || <span className="text-slate-400 italic">Not specified</span>}
                          </td>

                          {/* Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-extrabold text-xs border border-slate-200">
                              {r.score !== undefined ? `${r.score.toFixed(1)}/100` : '—'}
                            </span>
                          </td>

                          {/* Approval Status */}
                          <td className="py-3.5 px-4 text-center">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Approved
                              </span>
                            )}
                            {isReapproval && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold animate-pulse">
                                <span className="material-symbols-outlined text-[14px]">sync_problem</span>
                                Needs Reapproval
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                                <span className="material-symbols-outlined text-[14px]">pending</span>
                                Pending Review
                              </span>
                            )}
                            {!isApproved && !isReapproval && !isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Approved By */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {isApproved ? (
                              <div>
                                <span className="font-semibold text-slate-800 block truncate max-w-[150px]">
                                  {r.approvedBy || 'Academic Authority'}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : 'Verified'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Awaiting review</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {!isApproved && (
                                <button
                                  onClick={() => handleApproveResult(r.id)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                  title="Approve Outcome"
                                >
                                  <span className="material-symbols-outlined text-[18px]">verified</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                                title="Edit Scores or Details"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => setAuditModalResult(r)}
                                className="p-1.5 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-50 transition"
                                title="View Audit Trail"
                              >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                              </button>
                              <button
                                onClick={() => handleDeleteResult(r.id)}
                                className="p-1.5 rounded-lg bg-slate-50 text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Result"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Live Registered Roster View */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Participants & Competitive Teams</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real database registrations and verified Dynamic QR check-in states for {currentEvent.title}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {participants.filter((p) => p.isAttendanceVerified).length} Checked In
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {participants.length} Total Registered
              </span>
            </div>
          </div>

          {/* Teams Roster */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Teams ({teams.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-500 text-[18px]">groups</span>
                        {t.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        {t.projectTitle ? `Project: ${t.projectTitle}` : 'No project submitted'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {t.members.length} Members
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    {t.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium truncate">{m.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono">{m.usn}</span>
                          {m.isAttendanceVerified ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="QR Checked-In" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300" title="Not Checked-In" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Participants */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Individual Registrations ({participants.filter((p) => !p.teamName).length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {participants
                .filter((p) => !p.teamName)
                .map((p) => (
                  <div key={p.registrationId} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{p.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{p.usn || p.department}</span>
                    </div>
                    {p.isAttendanceVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Present
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                        Absent
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create or Edit Outcome */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingResultId ? 'Edit Competition Outcome' : 'Record Competition Outcome'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter judge scoring, podium placement, and verified team or individual allocations.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {editingResultId && modalStatus === 'approved' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">warning</span>
                <span>
                  <strong>Reapproval Rule:</strong> Modifying an approved result will automatically mark it as <em>"Needs Reapproval"</em> and lock certificate issuance until reapproved by an organizer.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitResult} className="space-y-5">
              {/* Category & Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Award Category
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="winner">Winner (1st, 2nd, 3rd, Finalist)</option>
                    <option value="achievement">Special Achievement / Recognition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Award Title / Distinction
                  </label>
                  <input
                    type="text"
                    required
                    value={modalAwardTitle}
                    onChange={(e) => setModalAwardTitle(e.target.value)}
                    placeholder="e.g. 1st Place (Champion), Best Innovation"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Podium Rank & Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalCategory === 'winner' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Podium Rank (1, 2, 3...)
                    </label>
                    <select
                      value={modalRank}
                      onChange={(e) => setModalRank(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="1">1st Place (Gold Champion)</option>
                      <option value="2">2nd Place (Silver Runner-up)</option>
                      <option value="3">3rd Place (Bronze Laureate)</option>
                      <option value="4">4th Place (Finalist)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Special Category Preset
                    </label>
                    <select
                      onChange={(e) => setModalAwardTitle(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Best Innovation">Best Innovation Award</option>
                      <option value="Best Project">Best Project Award</option>
                      <option value="Best Presentation">Best Presentation</option>
                      <option value="Outstanding Technical Merit">Outstanding Technical Merit</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Judge Score (0 – 100)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={modalScore}
                      onChange={(e) => setModalScore(e.target.value)}
                      className="w-24 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={modalScore}
                      onChange={(e) => setModalScore(e.target.value)}
                      className="flex-1 accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Team vs Individual Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Structure
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalIsTeam(true)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      modalIsTeam
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    Team Award
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalIsTeam(false)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      !modalIsTeam
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Individual Award
                  </button>
                </div>
              </div>

              {/* Team Name Preset Selection */}
              {modalIsTeam && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Team Name
                    </label>
                    {teams.length > 0 && (
                      <span className="text-[11px] text-slate-500">Pick from registered teams:</span>
                    )}
                  </div>
                  {teams.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTeamPreset(t.name)}
                          className={`px-3 py-1 text-xs rounded-lg border transition ${
                            modalTeamName === t.name
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    value={modalTeamName}
                    onChange={(e) => setModalTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Project Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project / Solution Title
                </label>
                <input
                  type="text"
                  value={modalProjectTitle}
                  onChange={(e) => setModalProjectTitle(e.target.value)}
                  placeholder="e.g. Autonomous Agentic IDE, DeFi Shield"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Recipient Student Picker from Registered Database */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Award Recipient(s) ({modalSelectedStudents.length} selected)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Personalized certificates with embedded QR verification will be issued individually to every student selected here.
                </p>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50">
                  {participants.map((p) => {
                    const isSelected = modalSelectedStudents.includes(p.studentId);
                    return (
                      <label
                        key={p.studentId}
                        className={`flex items-center justify-between p-3 cursor-pointer text-xs transition ${
                          isSelected ? 'bg-teal-50/80 font-bold text-teal-900' : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (modalIsTeam) {
                                setModalSelectedStudents((prev) =>
                                  prev.includes(p.studentId)
                                    ? prev.filter((id) => id !== p.studentId)
                                    : [...prev, p.studentId]
                                );
                              } else {
                                setModalSelectedStudents([p.studentId]);
                              }
                            }}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="block text-slate-900">{p.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {p.usn || p.email} {p.teamName ? `• Team ${p.teamName}` : ''}
                            </span>
                          </div>
                        </div>
                        {p.isAttendanceVerified && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full font-semibold">
                            QR Verified
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Judge Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judge Notes & Deliberation Remarks
                </label>
                <textarea
                  rows={2}
                  value={modalJudgeNotes}
                  onChange={(e) => setModalJudgeNotes(e.target.value)}
                  placeholder="Optional judge feedback or citation to be displayed on the outcome statement."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status Selector for New Results */}
              {!editingResultId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Initial Outcome State
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Save as Draft (Review later)</option>
                    <option value="pending_approval">Submit for Approval</option>
                    <option value="approved">Approve Immediately (Authorized Organizer)</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-sm"
                >
                  {editingResultId ? 'Save & Update Outcome' : 'Confirm & Record Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CSV Import with Validation & Interactive Preview */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Import Competition Results via CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload judging panel scores with real-time pre-save validation and error prevention.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setCsvPreview(null);
                  setCsvText('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Supported columns: <code>rank</code>, <code>award_category</code>, <code>award_title</code>, <code>team_name</code>, <code>identifier (USN/email)</code>, <code>score</code>, <code>project_title</code>, <code>notes</code>
              </span>
              <button
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download Sample CSV
              </button>
            </div>

            {/* CSV Input Area */}
            <div>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste your CSV content here or click 'Download Sample CSV' to inspect the structure..."
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Validation Trigger Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Initial State:</label>
                <select
                  value={csvInitialStatus}
                  onChange={(e) => setCsvInitialStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                >
                  <option value="draft">Draft (Review Later)</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleValidateCsv}
                disabled={csvValidating || !csvText.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
              >
                {csvValidating ? 'Validating Against Database...' : 'Validate CSV Rows'}
              </button>
            </div>

            {/* Interactive Preview Table */}
            {csvPreview && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Validation Report ({csvPreview.validCount} Valid / {csvPreview.invalidCount} Invalid)
                  </h4>
                  {csvPreview.invalidCount > 0 && (
                    <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Fix errors in invalid rows before importing
                    </span>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] text-slate-600">
                    <thead className="bg-slate-50 font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Award / Rank</th>
                        <th className="p-2.5">Recipient</th>
                        <th className="p-2.5 text-center">Score</th>
                        <th className="p-2.5">Validation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvPreview.validRows.map((r, i) => (
                        <tr key={i} className="bg-emerald-50/40">
                          <td className="p-2.5 font-bold">{r.rowNumber}</td>
                          <td className="p-2.5">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Valid
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">{r.awardTitle}</td>
                          <td className="p-2.5">{r.teamName || r.studentNames?.join(', ')}</td>
                          <td className="p-2.5 text-center font-bold">{r.score}</td>
                          <td className="p-2.5 text-emerald-600">Matched {r.studentNames?.length} student(s)</td>
                        </tr>
                      ))}

                      {csvPreview.invalidRows.map((ir, i) => (
                        <tr key={i} className="bg-rose-50/60">
                          <td className="p-2.5 font-bold text-rose-900">{ir.rowNumber}</td>
                          <td className="p-2.5">
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">cancel</span>
                              Invalid
                            </span>
                          </td>
                          <td className="p-2.5">{ir.data.awardTitle || '—'}</td>
                          <td className="p-2.5">{ir.data.teamName || '—'}</td>
                          <td className="p-2.5 text-center">{ir.data.score || '—'}</td>
                          <td className="p-2.5 text-rose-700 font-bold">{ir.errors.join('; ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCsvPreview(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Discard Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCsvImport}
                    disabled={csvPreview.validCount === 0}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    Confirm & Save {csvPreview.validCount} Valid Outcome(s)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Audit Trail History Modal */}
      {auditModalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Audit Trail & Reapproval History</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable chronological log of changes for: <strong>{auditModalResult.awardTitle}</strong>
                </p>
              </div>
              <button
                onClick={() => setAuditModalResult(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {auditModalResult.auditTrail && auditModalResult.auditTrail.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {auditModalResult.auditTrail.map((entry, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">
                          {entry.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Actor: <strong>{entry.actor}</strong>
                      </p>
                      {entry.changes && entry.changes.length > 0 && (
                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
                          {entry.changes.join(' • ')}
                        </div>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-slate-500 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  No previous revision entries recorded for this outcome.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuditModalResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Bulk Approval Confirmation */}
      {isApproveAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">verified</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authorize All Competition Outcomes?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are about to approve <strong>{pendingCount + reapprovalCount + draftCount}</strong> pending outcome(s) for <strong>{currentEvent.title}</strong>.
                This action will be stamped under your organizer credentials:
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                {currentUser?.name || 'Dr. Eleanor Vance (Chief Academic Officer)'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsApproveAllModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveAll}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                Confirm & Approve All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
