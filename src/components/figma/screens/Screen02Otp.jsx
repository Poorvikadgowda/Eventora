import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../store/AppContext';
import { verifyPhoneOtp } from '../../../services/supabaseClient';

export const Screen02Otp = () => {
  const { setFigmaScreen, login, notify } = useApp();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef([]);

  const pendingPhone = sessionStorage.getItem('figma_pending_phone') || '+919876543210';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    setErrorMessage('');
    if (value.length > 1) {
      // Pasting full 6-digit code
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    // Auto-advance focus
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const code = digits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    try {
      const resp = await verifyPhoneOtp(pendingPhone, code);
      if (resp.success && resp.session) {
        login(resp.session);
        notify('Mobile number verified with Supabase!', 'success');
        setFigmaScreen(3); // Advance to Screen 3 (Dashboard)
      } else {
        setErrorMessage(resp.error || 'Invalid or expired confirmation code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Supabase OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full px-5 py-6 flex flex-col justify-between bg-[#F4F9F7]">
      
      {/* Top Bar with Back Arrow */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => setFigmaScreen(1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            ←
          </button>
          <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            Step 2 of 2
          </span>
        </div>

        {/* Header Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">OTP Verification</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{pendingPhone}</span>
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {/* 6 Digits Container Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2ECE7] shadow-sm mb-4">
          <div className="flex justify-between items-center gap-1.5 mb-4">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-xl font-mono font-bold rounded-2xl border border-slate-200 bg-[#F4F9F7] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:bg-white transition-all shadow-inner"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Expires in: <strong className="text-slate-800 font-mono">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</strong>
            </span>
            <button
              type="button"
              onClick={() => setFigmaScreen(1)}
              className="text-[#00796B] font-bold hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || digits.join('').length < 6}
          className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin text-base">⏳</span>
          ) : (
            <>
              <span>Verify & Continue</span>
              <span>✓</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Disclaimers */}
      <div className="text-center space-y-2 pb-2">
        <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
          Secured with Supabase Phone Authentication & E.164 verification.
        </p>
      </div>

    </div>
  );
};
