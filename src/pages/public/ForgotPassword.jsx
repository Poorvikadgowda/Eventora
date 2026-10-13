import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { addToast } = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await resetPassword(email);
      if (res.success) {
        setSubmitted(true);
        addToast(res.message || 'Password reset link sent to your email address!', 'success');
      } else {
        addToast(res.error || 'Failed to dispatch reset email.', 'error');
      }
    } catch {
      addToast('Unable to process password reset. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container-high text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[28px]">lock_reset</span>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-2">Reset Password</h2>
        <p className="text-body-sm text-outline mb-6">
          Enter your university email address and we will send you a secure verification link to reset your password.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-body-sm text-left space-y-2 mb-6">
            <p className="font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
              Reset instructions sent!
            </p>
            <p className="text-xs text-emerald-700">
              Check your inbox at <span className="font-semibold">{email}</span>. Click the link inside to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-left">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-surface-container-high">
          <Link to="/login" className="text-secondary text-body-sm font-semibold hover:underline flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
