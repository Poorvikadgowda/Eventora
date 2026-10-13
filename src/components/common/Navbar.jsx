import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { BackendStatusBadge } from './BackendStatusBadge';
import {
  Pill,
  Upload,
  Search,
  MapPin,
  Bot,
  User,
  ShieldCheck,
  Building2,
  LogOut,
  LogIn,
  Languages,
  Menu,
  X,
  LayoutDashboard,
  Database,
  BarChart3
} from 'lucide-react';

export const Navbar = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    setAuthModalOpen,
    setAuthRole
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Rx', icon: Upload },
    { id: 'database', label: 'Medicine DB', icon: Database },
    { id: 'search', label: 'Search Drugs', icon: Search },
    { id: 'pharmacies', label: 'Pharmacy Map', icon: MapPin },
    { id: 'chatbot', label: 'AI Chatbot', icon: Bot },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Building2 }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick(user.authenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-teal-glow shadow-sm group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  Generic<span className="text-teal-600">Swap</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3 h-3 text-teal-600" /> PMBJP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Active Molecule & Generic Finder
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Language, Profile, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real-Time Live Backend Status Badge */}
            <BackendStatusBadge />

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 hidden sm:inline" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === 'kn'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="ಕನ್ನಡ (Kannada)"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === 'hi'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="हिंदी (Hindi)"
              >
                हिंदी
              </button>
            </div>

            {/* User Profile / Auth State */}
            {user.authenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'border-teal-500 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {user.user_name ? user.user_name.charAt(0) : 'U'}
                  </div>
                  <span className="hidden sm:inline font-semibold text-slate-800">
                    {user.user_name}
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Verified OTP Session" />
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthRole('USER');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthRole('USER');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Sign Up / OTP
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
