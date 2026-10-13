import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [usn, setUsn] = useState(currentUser?.usn || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [semester, setSemester] = useState(currentUser?.semester || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [newTag, setNewTag] = useState('');
  const [interests, setInterests] = useState(currentUser?.interests || ['Artificial Intelligence', 'Web3', 'Hackathons']);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim() || interests.includes(newTag.trim())) return;
    setInterests([...interests, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tag) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      usn,
      department,
      semester,
      phone,
      interests
    });
    addToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-lg">
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
          Scholar Credentials & Persona
        </span>
        <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
          Student Profile Settings
        </h1>
        <p className="text-body-md text-outline">
          Manage your verified academic identity, contact credentials, and AI recommendation matching interests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Summary Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-high/60 shadow-sm text-center flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={currentUser?.name}
              className="w-28 h-28 rounded-2xl object-cover shadow-md ring-4 ring-surface-container-high"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-teal-400 text-teal-950 text-[10px] font-extrabold uppercase shadow-sm">
              Verified
            </span>
          </div>

          <h3 className="text-xl font-bold text-primary mb-1">{name}</h3>
          <p className="text-xs font-mono text-secondary font-bold mb-1">{usn}</p>
          <p className="text-body-sm text-outline">{department}</p>

          <div className="w-full mt-6 pt-6 border-t border-surface-container-high/60 space-y-3 text-left text-body-sm">
            <div className="flex justify-between">
              <span className="text-outline">Attendance Rate</span>
              <span className="font-bold text-teal-700">{currentUser?.attendanceRate || 94}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Total Events</span>
              <span className="font-bold text-primary">{currentUser?.attendedCount || 24} Attended</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Certificates</span>
              <span className="font-bold text-primary">{currentUser?.certificatesCount || 6} Verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container-high/60 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-primary font-bold text-lg mb-2">Edit Academic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">USN / University ID</label>
              <input
                type="text"
                required
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Current Academic Term</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50 font-medium"
              />
            </div>
          </div>

          {/* Interests & Recommendation Tags */}
          <div className="pt-2">
            <label className="block text-label-md font-semibold text-on-surface mb-2">
              Interests & Technical Focus (Powers AI Event Matching)
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-semibold text-xs border border-secondary/20"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add skill or interest (e.g. Robotics, Rust, Cloud)..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs"
              >
                Add Tag
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
