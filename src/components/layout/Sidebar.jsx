import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, role, isAdmin, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const studentNavItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Explore Events', path: '/student/explore', icon: 'explore' },
    { label: 'Student Dashboard', path: '/student', icon: 'dashboard', end: true },
    { label: 'My Attendance & Pass', path: '/student/attendance', icon: 'fact_check' },
    { label: 'QR Scanner & Upload', path: '/student/qr-scanner', icon: 'qr_code_scanner' },
    { label: 'Assignments', path: '/student/assignments', icon: 'assignment' },
    { label: 'Live Event Map', path: '/student/map', icon: 'map' },
    { label: 'Recommendations', path: '/student/recommendations', icon: 'auto_awesome' },
    { label: 'Certificates', path: '/student/certificates', icon: 'workspace_premium' },
    { label: 'Feedback & Reviews', path: '/student/feedback', icon: 'rate_review' },
    { label: 'Notifications', path: '/student/notifications', icon: 'notifications' },
    { label: 'Profile', path: '/student/profile', icon: 'person' },
  ];

  const adminNavItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Admin Analytics', path: '/admin', icon: 'analytics', end: true },
    { label: 'Events List', path: '/admin/events', icon: 'event' },
    { label: 'Create Event', path: '/admin/events/create', icon: 'add_circle' },
    { label: 'Assignments & Tasks', path: '/admin/assignments', icon: 'assignment' },
    { label: 'QR Scanner & Upload', path: '/admin/qr-scanner', icon: 'qr_code_scanner' },
    { label: 'Attendance Records', path: '/admin/attendance', icon: 'fact_check' },
    { label: 'Smart QR Anti-Fraud', path: '/admin/anti-fraud', icon: 'shield' },
    { label: 'Certificate Studio', path: '/admin/certificates', icon: 'workspace_premium' },
    { label: 'Manage Results', path: '/admin/results', icon: 'emoji_events' },
    { label: 'Feedback & Reviews', path: '/admin/feedback', icon: 'rate_review' },
    { label: 'Live Event Map', path: '/admin/live-map', icon: 'map' },
    { label: 'AI Event Copilot', path: '/admin/ai-copilot', icon: 'smart_toy' },
    { label: 'Event Success Score', path: '/admin/success-score', icon: 'score' },
    { label: 'Student Dashboard', path: '/student', icon: 'dashboard' },
    { label: 'Users Management', path: '/admin/users', icon: 'group' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-primary/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col pt-space-lg pb-space-lg shadow-subtle border-r border-surface-container-high transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-space-lg mb-space-lg flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px] text-teal-300">bolt</span>
            </div>
            <div>
              <span className="font-headline-md text-primary font-bold tracking-tight block leading-tight">
                Eventora
              </span>
              <span className="text-[10px] uppercase tracking-wider text-outline font-semibold">
                {isAdmin ? 'Admin Console' : 'Campus Portal'}
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high text-outline"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-space-md space-y-space-xs overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center px-space-md py-space-sm rounded-xl transition-all text-body-md ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`
              }
            >
              <span className="material-symbols-outlined mr-space-md text-[22px] shrink-0">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Card & Role Switcher */}
        <div className="px-space-md pt-space-md mt-auto border-t border-surface-container-high space-y-2">
          {/* Active Profile Pill */}
          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-sm font-bold text-on-surface truncate">{currentUser?.name || 'User'}</p>
                <p className="text-[11px] text-outline capitalize truncate">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = isAdmin ? 'student' : 'admin';
                switchRole(next);
                navigate(next === 'admin' ? '/admin' : '/student');
              }}
              title="Toggle role"
              className="p-1 rounded-lg hover:bg-surface-container-high text-secondary shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">cached</span>
            </button>
          </div>

          {/* Quick Portal Switcher */}
          <button
            onClick={() => {
              const next = isAdmin ? 'student' : 'admin';
              switchRole(next);
              navigate(next === 'admin' ? '/admin' : '/student');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-label-sm font-semibold bg-primary-container/10 text-primary hover:bg-primary-container/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Switch to {isAdmin ? 'Student Portal' : 'Admin Console'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
