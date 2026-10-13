import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { DynamicQRModal } from '../../components/event/DynamicQRModal';

export const StudentAttendance = () => {
  const { currentUser } = useAuth();
  const { attendance, events } = useEvents();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Filter attendance for current student or show all demo attendance records
  const myAttendance = attendance;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Verified Check-In Logs
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            My Attendance History & QR Pass
          </h1>
          <p className="text-body-md text-outline">
            Immutable attendance timestamps authenticated via rotating dynamic tokens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code</span>
            <span>Open My Attendance QR Pass</span>
          </button>

          <Link
            to="/admin/qr-scanner"
            className="px-5 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary border border-surface-container-high font-label-md font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">upload_file</span>
            <span>Upload QR / Scanner</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Attendance Rate</span>
            <p className="text-3xl font-bold text-primary mt-1">{currentUser?.attendanceRate || 94}%</p>
            <span className="text-xs text-emerald-700 font-semibold">+2.4% vs department average</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Total Events Checked</span>
            <p className="text-3xl font-bold text-primary mt-1">{myAttendance.length}</p>
            <span className="text-xs text-secondary font-semibold">Zero absent flags</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider font-bold">Credential Eligibility</span>
            <p className="text-3xl font-bold text-emerald-700 mt-1">100%</p>
            <span className="text-xs text-outline font-medium">Eligible for all certificates</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
          <h3 className="font-headline-sm text-primary font-bold text-lg">Recorded Attendance Sessions</h3>
          <span className="text-xs text-outline font-mono">Live Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                <th className="py-3.5 px-5">Event Name</th>
                <th className="py-3.5 px-5">Student / USN</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Check-In Time</th>
                <th className="py-3.5 px-5">Verification Method</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
              {myAttendance.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-primary">
                    {item.eventName}
                  </td>
                  <td className="py-3.5 px-5">
                    <div>
                      <span className="font-medium">{item.studentName}</span>
                      <span className="block text-xs font-mono text-outline">{item.usn}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-outline">{item.date}</td>
                  <td className="py-3.5 px-5 font-mono text-on-surface">{item.time}</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md font-medium">
                      <span className="material-symbols-outlined text-[14px] text-teal-600">lock</span>
                      {item.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DynamicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={events[0]}
      />
    </div>
  );
};
