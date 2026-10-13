import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import {
  getAssignments,
  getMySubmission,
  submitAssignment
} from '../../services/assignmentService';
import { uploadStudentSubmission } from '../../services/storageService';

export const StudentAssignments = () => {
  const { currentUser } = useAuth();
  const { events } = useEvents();
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);

      if (currentUser?.id) {
        const subMap = {};
        for (const a of data) {
          const sub = await getMySubmission(a.id, currentUser.id);
          if (sub) {
            subMap[a.id] = sub;
          }
        }
        setSubmissions(subMap);
      }
    } catch (err) {
      console.warn('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    const existing = submissions[assignment.id];
    setNotes(existing?.notes || '');
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
    setSelectedFile(null);
    setNotes('');
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !currentUser?.id) return;

    if (!selectedFile && !submissions[selectedAssignment.id]?.submissionUrl && !notes.trim()) {
      addToast('Please attach a file or write solution notes', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = submissions[selectedAssignment.id]?.submissionUrl || '';
      let fileName = submissions[selectedAssignment.id]?.fileName || 'submission';

      if (selectedFile) {
        fileUrl = await uploadStudentSubmission(selectedFile, currentUser.id);
        fileName = selectedFile.name;
      } else if (!fileUrl) {
        fileUrl = 'https://eventora.edu/text-submission';
      }

      const newSub = await submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentUsn: currentUser.usn,
        studentAvatar: currentUser.avatar || currentUser.avatar_url,
        submissionUrl: fileUrl,
        fileName,
        notes
      });

      setSubmissions((prev) => ({
        ...prev,
        [selectedAssignment.id]: newSub
      }));

      addToast('Assignment submitted successfully!', 'success');
      handleCloseModal();
    } catch {
      addToast('Failed to submit assignment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list
  const filteredAssignments = assignments.filter((a) => {
    const isSub = Boolean(submissions[a.id]);
    if (activeFilter === 'pending') return !isSub;
    if (activeFilter === 'submitted') return isSub;
    return true;
  });

  const pendingCount = assignments.filter((a) => !submissions[a.id]).length;
  const submittedCount = Object.keys(submissions).length;
  const gradedCount = Object.values(submissions).filter((s) => s.status === 'graded').length;

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-container p-6 sm:p-8 lg:p-space-xl shadow-md border border-white/10">
        <div className="absolute -right-12 -top-12 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
                Academic Curriculum
              </span>
              <span className="text-teal-200/80 text-xs font-semibold">
                • Continuous Assessment & Portfolios
              </span>
            </div>
            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-primary font-bold tracking-tight">
              Assignments & Deliverables
            </h1>
            <p className="text-on-primary-container text-body-md mt-1 max-w-2xl">
              Submit your symposium pitch decks, technical notebooks, and post-workshop deliverables. Track feedback and official grades directly from course instructors.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="text-right px-2">
              <span className="text-[11px] text-teal-200 uppercase tracking-wider font-bold block">
                Pending Work
              </span>
              <span className="font-headline-lg text-2xl text-on-primary font-bold">
                {pendingCount} Tasks
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-300">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Total Assigned</span>
            <span className="text-2xl font-bold text-primary mt-1 block">{assignments.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">library_books</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Pending</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Submitted</span>
            <span className="text-2xl font-bold text-teal-700 mt-1 block">{submittedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Graded & Reviewed</span>
            <span className="text-2xl font-bold text-secondary mt-1 block">{gradedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">grade</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All Deliverables ({assignments.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Pending Action ({pendingCount})
        </button>
        <button
          onClick={() => setActiveFilter('submitted')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeFilter === 'submitted'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Submitted & Evaluated ({submittedCount})
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="p-12 text-center text-outline">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading assignments and submission status...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-surface-container-high/60 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low mx-auto flex items-center justify-center text-outline mb-4">
            <span className="material-symbols-outlined text-[32px]">
              {activeFilter === 'submitted' ? 'pending_actions' : 'assignment_turned_in'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">
            {activeFilter === 'submitted' ? 'No Submissions Yet' : 'No assignments found'}
          </h3>
          <p className="text-sm text-outline max-w-md mx-auto">
            {activeFilter === 'submitted'
              ? `You haven't submitted any deliverables yet. You have ${pendingCount} pending task${pendingCount === 1 ? '' : 's'} awaiting your solution.`
              : activeFilter === 'pending'
              ? 'Great job! You have submitted solutions for all assigned deliverables.'
              : "No deliverables matching your selected filter."}
          </p>
          {activeFilter === 'submitted' && pendingCount > 0 && (
            <button
              onClick={() => setActiveFilter('pending')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>View {pendingCount} Pending Tasks to Submit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const sub = submissions[assignment.id];
            const isDueSoon = new Date(assignment.dueDate).getTime() - Date.now() < 86400000 * 2;
            const isPastDue = new Date(assignment.dueDate).getTime() < Date.now();

            return (
              <div
                key={assignment.id}
                className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold uppercase tracking-wider truncate">
                      {assignment.eventTitle || 'Campus Event'}
                    </span>
                    {sub ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        sub.status === 'graded'
                          ? 'bg-secondary-fixed/60 text-secondary'
                          : 'bg-teal-50 text-teal-800'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {sub.status === 'graded' ? 'verified' : 'check_circle'}
                        </span>
                        {sub.status === 'graded' ? 'Graded' : 'Submitted'}
                      </span>
                    ) : isPastDue ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">event_busy</span> Overdue
                      </span>
                    ) : isDueSoon ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Due Soon
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
                        Open
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline-sm text-lg font-bold text-primary mb-2 line-clamp-2">
                    {assignment.title}
                  </h3>

                  <p className="text-body-sm text-outline mb-4 line-clamp-3 leading-relaxed">
                    {assignment.description}
                  </p>

                  {/* Attachment if present */}
                  {assignment.attachmentUrl && (
                    <div className="mb-4 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">attachment</span>
                        <span className="text-xs font-bold text-on-surface truncate">Teacher Reference Resource</span>
                      </div>
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-secondary hover:underline shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  )}

                  {/* Due Date Indicator */}
                  <div className="flex items-center gap-2 text-xs text-outline mb-4">
                    <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>

                  {/* If Graded: Show Grade & Feedback */}
                  {sub && sub.status === 'graded' && (
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 mb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-emerald-800">Evaluator Grade</span>
                        <span className="text-xs font-bold text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {sub.grade || 'A'}
                        </span>
                      </div>
                      {sub.feedback && (
                        <p className="text-xs text-emerald-950 italic pt-1 border-t border-emerald-100">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-4 border-t border-surface-container-high/60">
                  {sub ? (
                    <button
                      onClick={() => handleOpenSubmitModal(assignment)}
                      className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md font-bold text-xs flex items-center justify-center gap-2 transition-all border border-surface-container-high"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      <span>View / Update Submission</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmitModal(assignment)}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Submit Solution</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-container-high space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold uppercase tracking-wider block mb-1">
                  {selectedAssignment.eventTitle || 'Campus Deliverable'}
                </span>
                <h2 className="text-xl font-bold text-primary">{selectedAssignment.title}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-surface-container-high text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              {/* File Upload to Supabase Storage */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Attach Solution File (PDF, DOCX, ZIP, IPYNB)
                </label>
                <div className="border-2 border-dashed border-surface-container-high rounded-2xl p-4 text-center hover:bg-surface-container-low transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-[32px] text-primary mb-1">cloud_upload</span>
                    <p className="text-sm font-bold text-primary">
                      {selectedFile ? selectedFile.name : (submissions[selectedAssignment.id]?.fileName || 'Click or drag file to upload')}
                    </p>
                    <p className="text-xs text-outline mt-0.5">
                      Uploads directly to secure Supabase storage vault
                    </p>
                  </div>
                </div>
              </div>

              {/* Solution Notes / URL */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Submission Notes or GitHub URL
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide repository link, architecture overview, or execution instructions..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Existing Submission Details if Any */}
              {submissions[selectedAssignment.id] && (
                <div className="p-3 rounded-xl bg-surface-container-low text-xs text-outline space-y-1">
                  <p className="font-semibold text-primary">Previous Submission:</p>
                  <p>Submitted: {new Date(submissions[selectedAssignment.id].submittedAt).toLocaleString()}</p>
                  <p className="truncate">File: {submissions[selectedAssignment.id].fileName}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-body-sm font-semibold hover:bg-surface-container text-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-body-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Confirm Submission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
