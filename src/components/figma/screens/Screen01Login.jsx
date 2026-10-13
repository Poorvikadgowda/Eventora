import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { signInWithPhoneOtp, formatToE164 } from '../../../services/supabaseClient';

export const Screen01Login = () => {
  const { setFigmaScreen, notify } = useApp();
  const [mobileNumber, setMobileNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const clean = mobileNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      notify('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const e164 = formatToE164(clean);
    setLoading(true);
    try {
      const resp = await signInWithPhoneOtp(e164, {
        full_name: userName || 'Patient',
        role
      });
      if (resp.success) {
        notify(`6-digit verification code dispatched to ${e164}`, 'success');
        sessionStorage.setItem('figma_pending_phone', e164);
        setFigmaScreen(2);
      } else {
        notify(resp.error || 'Failed to dispatch verification code from Supabase', 'error');
      }
    } catch (err) {
      notify(err.message || 'Supabase Phone Auth error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full px-5 py-8 flex flex-col justify-between bg-[#F4F9F7]">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-4">
        {/* App Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#00796B] flex items-center justify-center text-3xl text-white shadow-lg shadow-teal-700/20 mb-3 border border-emerald-400/20">
          💊
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Generic<span className="text-[#00796B]">Swap</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Active Molecule & Low-Cost Generic Medicine Finder
        </p>
      </div>

      {/* Main Form Card */}
      <div className="my-6 bg-white rounded-3xl p-5 shadow-sm border border-[#E2ECE7]">
        <h2 className="text-lg font-bold text-slate-800">Get Started</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Enter your mobile number to receive a secure 6-digit confirmation code.
        </p>

        {/* Role Toggle (Patient vs Pharmacy Admin) */}
        <div className="flex bg-[#F4F9F7] p-1 rounded-2xl border border-emerald-100 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              role === 'USER'
                ? 'bg-[#00796B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👤 Patient / User
          </button>
          <button
            type="button"
            onClick={() => setRole('PHARMACY_ADMIN')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              role === 'PHARMACY_ADMIN'
                ? 'bg-[#00796B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏪 Pharmacy Admin
          </button>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00796B]/20 focus:border-[#00796B] transition-all"
              required
            />
          </div>

          {/* Mobile Number Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Mobile Number (E.164)
            </label>
            <div className="flex rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#00796B]/20 focus-within:border-[#00796B]">
              <span className="px-3.5 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold border-r border-slate-200 flex items-center">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-3.5 py-2.5 text-xs text-slate-800 font-mono tracking-wider focus:outline-none"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Supabase Phone Auth verified in +91 E.164 format.
            </p>
          </div>

          {/* CTA Pill Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-base">⏳</span>
            ) : (
              <>
                <span>Get OTP Verification</span>
                <span>➔</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Disclaimers */}
      <div className="text-center space-y-2 pb-2">
        <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
          Compliant with CDSCO bioequivalence guidelines & Jan Aushadhi (PMBJP) standards.
        </p>
      </div>

    </div>
  );
};
