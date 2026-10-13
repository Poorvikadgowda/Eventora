import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryPortal = searchParams.get('portal');
  const fromPath = location.state?.from?.pathname || searchParams.get('redirect');

  const [activePortal, setActivePortal] = useState(() => {
    if (queryPortal === 'admin' || fromPath?.startsWith('/admin')) return 'admin';
    return 'student';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await login(email, password, activePortal);
      if (result.success) {
        addToast(`Signed in successfully as ${result.user?.name || 'User'} (${activePortal.toUpperCase()})`, 'success');
        navigate(fromPath || (activePortal === 'admin' ? '/admin' : '/student'), { replace: true });
      } else {
        addToast(result.error || 'Invalid email or password. Please try again.', 'error');
      }
    } catch {
      addToast('Unable to sign in. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
        {/* Left Panel: Visuals & Stats (matches Stitch sign_in_authentication) */}
        <div className="lg:col-span-7 bg-primary relative flex flex-col justify-between p-8 sm:p-14 lg:p-20 overflow-hidden text-on-primary">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/4 top-1/3 w-72 h-72 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>

          {/* Top Branding */}
          <div className="relative z-10 flex items-center gap-3">
            <Link to="/" className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30">
              <span className="material-symbols-outlined text-[28px] text-white">bolt</span>
            </Link>
            <div>
              <span className="font-headline-md text-on-primary font-bold tracking-tight block text-2xl">
                Eventora
              </span>
              <span className="text-label-sm text-teal-300 tracking-widest uppercase font-semibold">
                Enterprise Event OS
              </span>
            </div>
          </div>

          {/* Central Hero Copy */}
          <div className="relative z-10 my-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/80 text-teal-300 text-label-md mb-6 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
              <span>Next-Gen Event Automation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-headline-xl text-on-primary tracking-tight font-extrabold mb-6 leading-tight">
              Coordinate, automate, and scale every campus & corporate experience.
            </h1>
            <p className="text-body-lg text-primary-fixed-dim leading-relaxed font-light">
              Join thousands of organizers managing seamless check-ins, automated certificates, and real-time analytics in one unified ecosystem.
            </p>
          </div>

          {/* Platform Statistics Footer */}
          <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-primary-container/60">
            <div>
              <div className="font-headline-lg text-on-primary font-bold text-2xl sm:text-3xl">99.9%</div>
              <div className="text-body-sm text-primary-fixed-dim">System Uptime</div>
            </div>
            <div>
              <div className="font-headline-lg text-on-primary font-bold text-2xl sm:text-3xl">4.8M+</div>
              <div className="text-body-sm text-primary-fixed-dim">Attendees Checked</div>
            </div>
            <div>
              <div className="font-headline-lg text-on-primary font-bold text-2xl sm:text-3xl">1,200+</div>
              <div className="text-body-sm text-primary-fixed-dim">Active Campuses</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Authentication Form */}
        <div className="lg:col-span-5 bg-surface flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-headline-lg text-on-surface text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-body-md text-on-surface-variant">
                Select your portal role and enter your credentials to access Eventora.
              </p>
            </div>

            {/* Portal Role Tabs */}
            <div className="flex p-1 bg-surface-container-low rounded-xl mb-6 border border-surface-container-high/60">
              <button
                type="button"
                onClick={() => setActivePortal('student')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-label-md font-bold transition-all text-center ${
                  activePortal === 'student'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => setActivePortal('admin')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-label-md font-bold transition-all text-center ${
                  activePortal === 'admin'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Teacher / Admin
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface font-semibold mb-1.5">
                  {activePortal === 'student' ? 'Student Email or USN' : 'Administrator Email'}
                </label>
                <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-3 border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-3">mail</span>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activePortal === 'student' ? 'e.g. poorvikagowda030@gmail.com or 1DA22CS...' : 'e.g. admin@drait.edu.in'}
                    className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-label-md text-on-surface font-semibold">Password</label>
                  <Link to="/forgot-password" className="text-body-sm text-secondary hover:underline font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-3 border border-surface-container-high/60 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-3">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-transparent border-none outline-none text-body-md text-on-surface w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-lg font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2"
              >
                <span>Sign In to Eventora</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* New User Account Creation CTA */}
            <div className="mt-6 pt-5 border-t border-surface-container-high/60 text-center">
              <p className="text-body-sm text-outline mb-3">
                Don't have an Eventora account yet?
              </p>
              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-label-md font-bold text-sm transition-all inline-flex items-center justify-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Create an Account First</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
