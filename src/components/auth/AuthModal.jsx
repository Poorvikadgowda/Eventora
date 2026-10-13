import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  signInWithPhoneOtp,
  verifyPhoneOtp,
  signInWithEmail,
  signUpWithEmail,
  formatToE164
} from '../../services/supabaseClient';
import {
  X,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authRole,
    setAuthRole,
    login,
    notify
  } = useApp();

  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(1); // 1 = Enter Phone/Credentials, 2 = Verify OTP

  // Form Fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [formattedE164, setFormattedE164] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(300);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset errors when switching modes or closing
  useEffect(() => {
    setErrorMessage('');
  }, [authMethod, emailMode, step, authModalOpen]);

  if (!authModalOpen) return null;

  // ---------------------------------------------------------------------------
  // Phone OTP: Step 1 – Request OTP via Supabase Phone Auth
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const clean = mobileNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const e164 = formatToE164(clean);
    setFormattedE164(e164);
    setLoading(true);

    try {
      const res = await signInWithPhoneOtp(e164, {
        full_name: userName || 'Patient',
        role: authRole
      });

      if (res.success) {
        setStep(2);
        setTimer(300);
        notify(`Verification code dispatched to ${e164}`, 'success');
      } else {
        const err = res.error || 'Failed to dispatch verification code from Supabase.';
        if (err.toLowerCase().includes('unsupported phone provider')) {
          setErrorMessage(
            'The Phone provider is currently disabled in your Supabase project. Enable it in Supabase Dashboard (Authentication → Providers → Phone), or use the "Email & Password" tab to sign in immediately.'
          );
        } else {
          setErrorMessage(err);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error connecting to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Phone OTP: Step 2 – Confirm OTP via Supabase Phone Auth
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = otpCode.replace(/\D/g, '').trim();
    if (cleanCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit confirmation code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPhoneOtp(formattedE164 || mobileNumber, cleanCode);
      if (res.success && res.session) {
        login(res.session);
      } else {
        setErrorMessage(res.error || 'Invalid or expired confirmation code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Supabase OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Email & Password Auth: Sign Up & Login via Supabase Auth
  // ---------------------------------------------------------------------------
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (emailMode === 'signup') {
        const res = await signUpWithEmail(email, password, userName || 'Patient', authRole, mobileNumber);
        if (res.success) {
          if (res.session) {
            login(res.session);
          } else {
            notify('Sign up successful! Please check your email to confirm your account.', 'success');
            setAuthModalOpen(false);
          }
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.success && res.session) {
          login(res.session);
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Supabase authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header / Brand Banner */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {step === 2
                  ? 'Confirm 6-Digit OTP'
                  : authMethod === 'phone'
                  ? 'Mobile OTP Authentication'
                  : emailMode === 'signup'
                  ? 'Create Patient Account'
                  : 'Account Login'}
              </h3>
              <p className="text-xs text-teal-100">
                Supabase Secure Healthcare Authentication
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setAuthRole('USER')}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              authRole === 'USER'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Patient / Caregiver
          </button>
          <button
            type="button"
            onClick={() => setAuthRole('PHARMACY_ADMIN')}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              authRole === 'PHARMACY_ADMIN'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" /> Pharmacy Admin
          </button>
        </div>

        {/* Auth Method Switcher (Phone OTP vs Email) */}
        {step === 1 && (
          <div className="flex border-b border-slate-100 bg-slate-100/60 px-6 py-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'phone'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'email'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email & Password
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {/* Supabase Error Alert Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed flex-1">
                <div><span className="font-bold">Authentication Error:</span> {errorMessage}</div>
                {authMethod === 'phone' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('email');
                      setErrorMessage('');
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 font-bold hover:bg-rose-100/70 transition-all text-xs shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-700" />
                    Sign In with Email & Password Instead
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. Phone OTP – Step 1 */}
          {authMethod === 'phone' && step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (E.164 Format)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Verified through Supabase Phone Auth in standard E.164 (+91) format.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Requesting code...' : 'Get 6-Digit OTP'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* 1. Phone OTP – Step 2 */}
          {authMethod === 'phone' && step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  Code sent to {formattedE164}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                  Enter 6-Digit Confirmation Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                    className="w-full py-3 text-center text-2xl font-mono tracking-[0.35em] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Expires in: <strong>{formatTimer(timer)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="text-teal-600 hover:text-teal-800 font-semibold"
                >
                  Change Number
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying with Supabase...' : 'Verify & Continue'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* 2. Email & Password Auth (Sign In / Sign Up) */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {emailMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? 'Processing...'
                    : emailMode === 'signup'
                    ? 'Create Supabase Account'
                    : 'Sign In with Supabase'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                {emailMode === 'signup' ? (
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('login');
                        setErrorMessage('');
                      }}
                      className="text-teal-600 hover:text-teal-800 font-bold"
                    >
                      Log In
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('signup');
                        setErrorMessage('');
                      }}
                      className="text-teal-600 hover:text-teal-800 font-bold"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
