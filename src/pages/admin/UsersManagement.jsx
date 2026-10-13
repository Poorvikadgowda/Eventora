import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';

export const UsersManagement = () => {
  const { students } = useEvents();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.usn.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'All' || s.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Academic Directory Roster
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            User & Student Management
          </h1>
          <p className="text-body-md text-outline">
            Review registered scholar profiles, attendance compliance, and credential vault issuance.
          </p>
        </div>

        <button
          onClick={() => addToast('Exporting student directory CSV report...', 'info')}
          className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-surface-container-high transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Student Roster</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded-xl border border-surface-container-high w-full sm:w-80 shadow-xs">
          <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
          <input
            type="text"
            placeholder="Search by name, USN, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-body-md text-on-surface"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-container-lowest text-body-sm font-medium border border-surface-container-high outline-none text-on-surface"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information Science">Information Science</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Electronics & Comm.">Electronics & Comm.</option>
          <option value="Biotechnology">Biotechnology</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                <th className="py-4 px-6">Scholar Profile</th>
                <th className="py-4 px-6">USN</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Attendance Rate</th>
                <th className="py-4 px-6">Attended</th>
                <th className="py-4 px-6">Certificates</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-surface-container-high" />
                      <div>
                        <p className="font-bold text-primary">{student.name}</p>
                        <span className="text-xs text-outline">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-secondary">{student.usn}</td>
                  <td className="py-4 px-6 font-medium">{student.department}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-teal-700">{student.attendanceRate}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold">{student.attendedCount} sessions</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                      {student.certificatesCount} Vault
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => addToast(`Loaded profile dossier for ${student.name}`, 'info')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs"
                    >
                      Dossier
                    </button>
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
