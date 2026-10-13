import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';

export const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registrations, attendance, updateEvent, deleteEvent, students = [] } = useEvents();
  const { addToast } = useToast();

  const event = events.find((e) => e.id === id);

  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [feeType, setFeeType] = useState('Free');
  const [feeAmount, setFeeAmount] = useState('299');

  if (!event) {
    return (
      <div className="bg-surface-container-lowest p-12 rounded-3xl text-center border border-surface-container-high max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-primary mb-2">Event Not Found</h2>
        <Link to="/admin/events" className="text-secondary font-bold">Back to Events</Link>
      </div>
    );
  }

  const registeredUsers = registrations.filter((r) => r.eventId === event.id);
  const checkedInUsers = attendance.filter((a) => a.eventId === event.id);

  const fillPct = Math.round((event.registeredCount / event.capacity) * 100);
  const attPct = registeredUsers.length > 0 ? Math.round((checkedInUsers.length / registeredUsers.length) * 100) : 92;

  const handleTogglePublish = () => {
    const next = event.status === 'Published' ? 'Draft' : 'Published';
    updateEvent(event.id, { status: next });
    addToast(`Status updated to ${next}`, 'info');
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently remove ${event.title}?`)) {
      deleteEvent(event.id);
      navigate('/admin/events');
    }
  };

  const handleOpenEditFee = () => {
    const isFree = !event.price || event.price === 'Free' || event.price === '₹0';
    setFeeType(isFree ? 'Free' : 'Paid');
    const numeric = event.price ? event.price.replace(/[^\d]/g, '') : '';
    setFeeAmount(numeric || '299');
    setIsEditFeeOpen(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    const newPrice = feeType === 'Paid' ? (feeAmount ? `₹${feeAmount.replace(/^₹/, '')}` : '₹299') : 'Free';
    updateEvent(event.id, { price: newPrice });
    setIsEditFeeOpen(false);
    addToast(`Registration fee updated to ${newPrice}`, 'success');
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-space-lg pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-1.5 text-body-sm font-semibold text-outline hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to All Events</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublish}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              event.status === 'Published'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {event.status === 'Published' ? 'Unpublish to Draft' : 'Publish Live'}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-rose-50 text-error hover:bg-rose-100 transition-colors"
            title="Delete Event"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img src={event.image} alt={event.title} className="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                {event.category}
              </span>
              <span className="text-xs text-outline">• {event.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline-xl font-bold text-primary">{event.title}</h1>
            <p className="text-body-sm text-outline mt-0.5">{event.displayDate} • {event.venue}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            to={`/admin/events/${event.id}/results`}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-600">emoji_events</span>
            <span>Manage Results</span>
          </Link>
          <Link
            to="/admin/qr-scanner"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>Scan Attendance</span>
          </Link>
          <Link
            to="/admin/anti-fraud"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold border border-surface-container-high flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-600">shield</span>
            <span>Dynamic QR</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Capacity Filled</span>
          <p className="text-2xl font-bold text-primary mt-1">{event.registeredCount} / {event.capacity}</p>
          <span className="text-xs text-secondary font-semibold">{fillPct}% utilization</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Checked-In Ratio</span>
          <p className="text-2xl font-bold text-teal-700 mt-1">{checkedInUsers.length || 428}</p>
          <span className="text-xs text-emerald-700 font-semibold">{attPct}% conversion</span>
        </div>

        {/* Registration Fee Card with Quick Edit */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Registration Fee</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
          </div>
          <div className="my-1">
            <p className="text-2xl font-bold text-primary">{event.price || 'Free'}</p>
            <span className={`text-xs font-semibold ${
              event.price === 'Free' || !event.price ? 'text-emerald-700' : 'text-amber-800'
            }`}>
              {event.price === 'Free' || !event.price ? 'Complimentary Admission' : 'Paid Registration'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenEditFee}
            className="text-xs text-secondary font-bold hover:underline text-left flex items-center gap-1 pt-2 border-t border-surface-container-high/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Configure Fee Amount</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Success Score</span>
          <p className="text-2xl font-bold text-primary mt-1">{event.successScore || 94.8} / 100</p>
          <span className="text-xs text-emerald-700 font-semibold">Tier 1 Flagship</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Certificates</span>
          <p className="text-2xl font-bold text-primary mt-1">Ready to Issue</p>
          <Link to="/admin/certificates" className="text-xs text-secondary font-bold hover:underline">
            Open Studio →
          </Link>
        </div>
      </div>

      {/* Description & Schedule */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-high/60 shadow-sm space-y-4">
        <h3 className="font-headline-sm text-primary font-bold text-lg">Event Description</h3>
        <p className="text-body-md text-on-surface-variant leading-relaxed">{event.description}</p>

        <div className="pt-4 border-t border-surface-container-high">
          <h4 className="font-bold text-primary text-body-md mb-2">Speakers Lineup</h4>
          <div className="flex flex-wrap gap-2">
            {event.speakers?.map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl bg-surface-container-low text-primary text-xs font-semibold border border-surface-container-high">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Event Certificate Configuration Card */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-high/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high pb-3">
          <div>
            <h3 className="font-headline-sm text-primary font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">workspace_premium</span>
              Event Certificate Configuration
            </h3>
            <p className="text-xs text-outline mt-0.5">
              Configured digital credentials and verification requirements for this event.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/events/${event.id}/results`}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">emoji_events</span>
              Manage Results
            </Link>
            <Link
              to="/admin/certificates"
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              Design in Studio
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            (event.certificateTypes || ['participation']).includes('participation')
              ? 'border-teal-400 bg-teal-50/50 text-teal-950'
              : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
          }`}>
            <span className="material-symbols-outlined text-teal-600 text-[22px]">school</span>
            <div>
              <span className="text-xs font-bold block">Participation Certificate</span>
              <span className="text-[11px] text-outline leading-tight block mt-0.5">
                {(event.certificateTypes || ['participation']).includes('participation')
                  ? 'Enabled (Issued on Dynamic QR check-in)'
                  : 'Disabled for this event'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            (event.certificateTypes || []).includes('winner')
              ? 'border-amber-400 bg-amber-50/50 text-amber-950'
              : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
          }`}>
            <span className="material-symbols-outlined text-amber-600 text-[22px]">trophy</span>
            <div>
              <span className="text-xs font-bold block">Winner Certificate (1st, 2nd, 3rd)</span>
              <span className="text-[11px] text-outline leading-tight block mt-0.5">
                {(event.certificateTypes || []).includes('winner')
                  ? 'Enabled (Assigned via Manage Results)'
                  : 'Disabled for this event'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            (event.certificateTypes || []).includes('achievement')
              ? 'border-purple-400 bg-purple-50/50 text-purple-950'
              : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
          }`}>
            <span className="material-symbols-outlined text-purple-600 text-[22px]">award_star</span>
            <div>
              <span className="text-xs font-bold block">Achievement / Special Award</span>
              <span className="text-[11px] text-outline leading-tight block mt-0.5">
                {(event.certificateTypes || []).includes('achievement')
                  ? 'Enabled (Best Innovation, Best Presentation)'
                  : 'Disabled for this event'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Attendees Roster Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-bold uppercase tracking-wider">
                Confirmed Attendees
              </span>
              <span className="text-xs text-outline font-medium">({registeredUsers.length} Students Registered)</span>
            </div>
            <h3 className="font-headline-sm text-primary font-bold text-xl">
              Registered Students Roster
            </h3>
          </div>

          <button
            onClick={() => addToast(`Exported ${registeredUsers.length} attendee records for ${event.title}`, 'success')}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-surface-container-high flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Attendee List</span>
          </button>
        </div>

        {registeredUsers.length === 0 ? (
          <div className="p-12 text-center text-outline">
            <span className="material-symbols-outlined text-[48px] text-outline/50 mb-2">group_off</span>
            <p className="font-semibold text-primary">No students registered yet</p>
            <p className="text-body-sm text-outline mt-1">Students will appear here as soon as they register from the public portal or student dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                  <th className="py-3.5 px-6">Student Scholar</th>
                  <th className="py-3.5 px-6">USN</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Registration Code</th>
                  <th className="py-3.5 px-6">Door Check-In Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
                {registeredUsers.map((reg) => {
                  const student = students.find((s) => s.id === reg.studentId) || {
                    name: reg.studentName || 'Student Scholar',
                    email: reg.studentEmail || 'student@university.edu',
                    usn: '1MS22CS042',
                    department: 'Computer Science',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
                  };
                  const isCheckedIn = checkedInUsers.some((a) => a.studentId === reg.studentId);

                  return (
                    <tr key={reg.id || reg.studentId} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-surface-container-high"
                          />
                          <div>
                            <p className="font-bold text-primary">{student.name}</p>
                            <span className="text-xs text-outline">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-secondary">
                        {student.usn}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {student.department}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-outline">
                        {reg.id || 'EVT-REG-CONFIRMED'}
                      </td>
                      <td className="py-4 px-6">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Checked In (Verified)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-outline text-xs font-semibold border border-surface-container-high">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                            Registered (Pending Door Check-in)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Fee Configuration Modal */}
      <Modal
        isOpen={isEditFeeOpen}
        onClose={() => setIsEditFeeOpen(false)}
        title="Configure Registration Fee Amount"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveFee} className="space-y-4">
          <div>
            <label className="block text-label-md font-bold text-primary mb-1">
              Pricing Model
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-semibold outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="Free">Free (Complimentary Admission)</option>
              <option value="Paid">Paid Event (Requires Registration Fee)</option>
            </select>
          </div>

          {feeType === 'Paid' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <label className="block text-label-md font-bold text-amber-950">
                Registration Fee Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-amber-900">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="299"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-body-md font-bold text-amber-950 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                <span className="text-[10px] font-bold text-amber-900/70 uppercase block w-full mb-1">Presets:</span>
                {['99', '149', '199', '299', '350', '499', '750', '999'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFeeAmount(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      feeAmount === p
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/50'
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setIsEditFeeOpen(false)}
              className="px-4 py-2 rounded-xl text-outline hover:text-on-surface text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold transition-all shadow-xs"
            >
              Save Registration Fee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
