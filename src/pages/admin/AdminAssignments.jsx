import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission
} from '../../services/assignmentService';
import { uploadAssignmentAttachment } from '../../services/storageService';

export const AdminAssignments = () => {
  const { currentUser } = useAuth();
  const { events } = useEvents();
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEventId, setNewEventId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Review Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Grading Modal / Drawer
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('A');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [grading, setGrading] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleOpenCreate = () => {
    setNewTitle('');
    setNewDescription('');
    setNewEventId(events[0]?.id || '');
    // Default 5 days from now
    const d = new Date(Date.now() + 86400000 * 5);
    setNewDueDate(d.toISOString().slice(0, 16));
    setNewAttachmentFile(null);
    setIsCreateOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) {
      addToast('Please provide an assignment title and due date', 'error');
      return;
    }

    setCreating(true);
    try {
      let attachmentUrl = '';
      if (newAttachmentFile) {
        attachmentUrl = await uploadAssignmentAttachment(newAttachmentFile);
      }

      const targetEvent = events.find((ev) => ev.id === newEventId);

      const created = await createAssignment({
        title: newTitle.trim(),
        description: newDescription.trim(),
        dueDate: new Date(newDueDate).toISOString(),
        eventId: newEventId || undefined,
        eventTitle: targetEvent?.title || 'Campus Event',
        attachmentUrl: attachmentUrl || undefined,
        createdBy: currentUser?.id
      });

      setAssignments((prev) => [created, ...prev]);
      addToast(`Assignment "${created.title}" published successfully!`, 'success');
      setIsCreateOpen(false);
    } catch {
      addToast('Failed to create assignment', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete assignment "${title}"? All student submissions will also be removed.`)) {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      addToast('Assignment removed', 'info');
    }
  };

  const handleOpenSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubs(true);
    try {
      const data = await getSubmissions(assignment.id);
      setSubmissions(data);
    } catch {
      // Handled
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleOpenGradeModal = (sub) => {
    setGradingSub(sub);
    setGradeInput(sub.grade || 'A (92/100)');
    setFeedbackInput(sub.feedback || 'Well-structured deliverable meeting all core specifications.');
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!gradingSub || !selectedAssignment) return;

    setGrading(true);
    try {
      await gradeSubmission(
        gradingSub.id,
        gradeInput,
        feedbackInput,
        gradingSub.studentId,
        selectedAssignment.title
      );

      setSubmissions((prev) =>
        prev.map((s) => (s.id === gradingSub.id ? { ...s, grade: gradeInput, feedback: feedbackInput, status: 'graded' } : s))
      );

      addToast(`Grade recorded for ${gradingSub.studentName}! Notification dispatched.`, 'success');
      setGradingSub(null);
    } catch {
      addToast('Failed to save grade', 'error');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-container p-6 sm:p-8 lg:p-space-xl shadow-md border border-white/10">
        <div className="absolute -right-12 -top-12 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
                Instructor Console
              </span>
              <span className="text-teal-200/80 text-xs font-semibold">
                • Curriculum & Assessment Management
              </span>
            </div>
            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-primary font-bold tracking-tight">
              Course Deliverables & Evaluation
            </h1>
            <p className="text-on-primary-container text-body-md mt-1 max-w-2xl">
              Publish task specifications, upload reference attachments to Supabase Storage, and evaluate student submissions with personalized feedback.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-secondary text-white hover:bg-secondary-container px-5 py-3 rounded-2xl font-label-md font-bold transition-all shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Publish New Assignment</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Active Assignments</span>
            <span className="text-3xl font-bold text-primary mt-1 block">{assignments.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">assignment</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Total Deliverables Received</span>
            <span className="text-3xl font-bold text-teal-700 mt-1 block">
              {assignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold block">Storage Cloud Provider</span>
            <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">cloud_done</span> Supabase Storage
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[20px]">folder_shared</span>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="p-12 text-center text-outline">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Fetching assignments from database...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-surface-container-high/60 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low mx-auto flex items-center justify-center text-outline mb-4">
            <span className="material-symbols-outlined text-[32px]">post_add</span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">No assignments published yet</h3>
          <p className="text-sm text-outline max-w-md mx-auto mb-4">
            Create your first course assignment or symposium task specification to receive student deliverables.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold uppercase tracking-wider truncate">
                    {assignment.eventTitle || 'Campus Event'}
                  </span>
                  <button
                    onClick={() => handleDelete(assignment.id, assignment.title)}
                    className="p-1 text-outline hover:text-red-600 rounded-lg hover:bg-surface-container"
                    title="Delete Assignment"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <h3 className="font-headline-sm text-lg font-bold text-primary mb-2 line-clamp-2">
                  {assignment.title}
                </h3>

                <p className="text-body-sm text-outline mb-4 line-clamp-3 leading-relaxed">
                  {assignment.description}
                </p>

                {assignment.attachmentUrl && (
                  <div className="mb-4 p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-primary">attachment</span>
                      Attachment Attached
                    </span>
                    <a
                      href={assignment.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-secondary hover:underline"
                    >
                      View
                    </a>
                  </div>
                )}

                <div className="space-y-1 text-xs text-outline mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">people</span>
                    <span className="font-semibold text-primary">
                      {assignment.submissionCount || 0} Submissions Logged
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-container-high/60">
                <button
                  onClick={() => handleOpenSubmissions(assignment)}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  <span>Inspect & Grade Submissions</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-container-high space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h2 className="text-xl font-bold text-primary">Create New Assignment</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Implementation Lab"
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Associated Event / Symposium
                </label>
                <select
                  value={newEventId}
                  onChange={(e) => setNewEventId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Task Description & Requirements
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specify submission guidelines, file formats, and evaluation criteria..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Reference Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-outline file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-container"
                />
                <p className="text-[11px] text-outline mt-1">Uploads to Supabase 'assignment-files' bucket</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-body-sm font-semibold hover:bg-surface-container text-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-body-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      <span>Publish Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-surface-container-high space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-surface-container-high pb-3 shrink-0">
              <div>
                <span className="text-xs font-bold text-outline uppercase tracking-wider block">Deliverable Submissions</span>
                <h2 className="text-xl font-bold text-primary">{selectedAssignment.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingSubs ? (
                <div className="p-8 text-center text-outline">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Loading submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-outline bg-surface-container-low rounded-2xl">
                  <p className="text-sm font-semibold">No students have submitted yet for this assignment.</p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={sub.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                        alt={sub.studentName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-body-sm font-bold text-primary truncate">{sub.studentName}</p>
                          <span className="text-xs font-mono text-outline">({sub.studentUsn})</span>
                        </div>
                        <p className="text-[11px] text-outline">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                        {sub.notes && (
                          <p className="text-xs text-on-surface-variant italic mt-1 line-clamp-1">
                            "{sub.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {sub.submissionUrl && (
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          <span>File</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          sub.status === 'graded'
                            ? 'bg-secondary-fixed/50 text-secondary'
                            : 'bg-primary text-white hover:bg-primary-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {sub.status === 'graded' ? 'verified' : 'grade'}
                        </span>
                        <span>{sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Grade'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradingSub && (
        <div className="fixed inset-0 bg-primary/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <h3 className="font-bold text-primary">Grade Deliverable</h3>
              <button
                onClick={() => setGradingSub(null)}
                className="p-1 rounded-lg hover:bg-surface-container-high text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-outline">
              Student: <strong className="text-primary">{gradingSub.studentName}</strong> ({gradingSub.studentUsn})
            </p>

            <form onSubmit={handleSubmitGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">
                  Grade / Score *
                </label>
                <input
                  type="text"
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="e.g. A+ (95/100) or Passed"
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">
                  Instructor Feedback & Recommendations
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Provide structured feedback for the student..."
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-3 py-2 text-xs font-semibold text-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grading}
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>Save & Notify Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
