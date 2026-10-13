import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }

    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    if (!usn.trim()) {
      addToast(role === 'student' ? 'Please enter your USN (e.g. 1DA22CS...)' : 'Please enter your Staff ID', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match. Please re-enter carefully.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        department,
        usn: usn.trim().toUpperCase()
      });

      if (result.success) {
        addToast(`Account created successfully! Welcome to Eventora, ${result.user?.name || name}!`, 'success');
        navigate(role === 'admin' ? '/admin' : '/student');
      } else {
        addToast(result.error || 'Registration failed. Please check your details.', 'error');
      }
    } catch {
      addToast('Something went wrong during account creation. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-8 selection:bg-secondary selection:text-white">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container-high">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-teal-300 shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <span className="font-headline-md text-2xl font-bold text-primary">Eventora</span>
          </Link>
          <h2 className="text-2xl font-bold text-primary">Create Your Account</h2>
          <p className="text-body-sm text-outline mt-1 max-w-md mx-auto">
            Register your official account to access campus events, workshops, hackathons, and cryptographic certificates.
          </p>
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-center gap-2">
            <span>Already created an account?</span>
            <Link to="/login" className="font-bold text-[#0755E9] hover:underline flex items-center gap-0.5">
              <span>Sign In here</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex p-1 bg-surface-container-low rounded-xl mb-6 border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-label-md font-bold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-1.5 ${
              role === 'student'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Student Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-label-md font-bold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>Faculty / Organizer</span>
          </button>
        </div>

        {/* Real Account Creation Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1">
              Full Name
            </label>
            <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px] mr-2.5">person</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'student' ? 'e.g. Shashank Kumar' : 'e.g. Dr. Radhika Iyer'}
                className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1">
              Email Address
            </label>
            <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px] mr-2.5">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'e.g. yourname@drait.edu.in' : 'e.g. faculty@drait.edu.in'}
                className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
              />
            </div>
          </div>

          {/* USN / Staff ID & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                {role === 'student' ? 'USN (Roll Number)' : 'Staff ID / Employee Code'}
              </label>
              <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                <span className="material-symbols-outlined text-outline text-[20px] mr-2.5">badge</span>
                <input
                  type="text"
                  required
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. 1DA23CS045' : 'e.g. FAC-AIT-019'}
                  className="bg-transparent border-none outline-none text-body-md text-on-surface w-full font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                Academic Department
              </label>
              <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full cursor-pointer"
                >
                  <option value="Computer Science & Engineering">CSE (Computer Science)</option>
                  <option value="Information Science & Engineering">ISE (Information Science)</option>
                  <option value="Artificial Intelligence & Machine Learning">AIML (AI & ML)</option>
                  <option value="Electronics & Communication">ECE (Electronics)</option>
                  <option value="Electrical & Electronics">EEE (Electrical)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Medical Electronics">Medical Electronics</option>
                </select>
              </div>
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                Password
              </label>
              <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                <span className="material-symbols-outlined text-outline text-[20px] mr-2">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                Confirm Password
              </label>
              <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                <span className="material-symbols-outlined text-outline text-[20px] mr-2">lock_clock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
                />
              </div>
            </div>
          </div>

          {/* Account Verification Policy Badge */}
          <div className="p-3 bg-secondary-fixed/30 border border-secondary/20 rounded-xl text-xs text-primary flex items-center gap-2 mt-2">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
              verified_user
            </span>
            <span>Your credentials are encrypted and stored safely for Dr. AIT event credentials.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary-container disabled:bg-surface-container-high text-white font-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-3"
          >
            {submitting ? (
              <span>Creating Your Account...</span>
            ) : (
              <>
                <span>Create Account & Start Using Eventora</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-body-sm text-outline">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
