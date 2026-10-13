import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const TopHeader = ({ onOpenSearch, onToggleMobileSidebar }) => {
  const { currentUser, role, isAdmin, switchRole, logout, isDemoMode } = useAuth();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useEvents();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-subtle border-b border-surface-container-high/60 z-40 flex items-center justify-between px-space-md lg:px-space-xl">
      {/* Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-space-sm flex-1">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-10 h-10 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Global Search Bar (Trigger) */}
        <div
          onClick={onOpenSearch}
          className="flex items-center bg-surface-container-low hover:bg-surface-container hover:border-outline-variant/40 border border-transparent px-space-md py-space-xs rounded-xl w-60 sm:w-80 md:w-96 gap-space-sm cursor-pointer transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-outline text-[20px]">search</span>
          <span className="text-body-md text-outline truncate flex-1 select-none">
            Search events, certificates, users...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-outline bg-surface-container-high rounded border border-outline-variant/40">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Icons: Notifications, User Menu */}
      <div className="flex items-center gap-space-sm lg:gap-space-md">

        {/* Quick Role Toggle for pair testing */}
        <button
          onClick={() => {
            const next = isAdmin ? 'student' : 'admin';
            switchRole(next);
            navigate(next === 'admin' ? '/admin' : '/student');
          }}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-label-sm font-medium text-on-surface-variant transition-colors"
          title="Quick switch between Student and Admin portals"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">swap_horiz</span>
          <span>Switch to {isAdmin ? 'Student' : 'Admin'}</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-space-md border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-sm font-bold text-on-surface">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-label-sm text-secondary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-container-high">
                {notifications.length === 0 ? (
                  <div className="p-space-lg text-center text-outline text-body-sm">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 ${
                        !notif.isRead ? 'bg-secondary-fixed/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {notif.type === 'registration'
                            ? 'confirmation_number'
                            : notif.type === 'certificate'
                            ? 'workspace_premium'
                            : notif.type === 'recommendation'
                            ? 'auto_awesome'
                            : 'notifications'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-body-sm font-semibold text-on-surface truncate">{notif.title}</p>
                          <span className="text-[11px] text-outline shrink-0 ml-1">{notif.createdAt}</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-surface-container-high text-center bg-surface-container-low/30">
                <Link
                  to={isAdmin ? '/admin/attendance' : '/student/notifications'}
                  onClick={() => setShowNotifications(false)}
                  className="text-label-sm text-secondary hover:underline font-semibold"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-container-high transition-colors"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-container-highest"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-body-sm font-bold text-on-surface leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-label-sm text-outline capitalize">{role}</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px] hidden sm:inline-block">
              expand_more
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-space-md border-b border-surface-container-high bg-surface-container-low/40">
                <p className="text-body-md font-bold text-on-surface">{currentUser?.name}</p>
                <p className="text-label-sm text-outline truncate">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  <span className="capitalize">{role} Portal</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5 text-body-sm">
                <Link
                  to={isAdmin ? '/admin' : '/student/profile'}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">account_circle</span>
                  <span>My Profile</span>
                </Link>

                <Link
                  to={isAdmin ? '/admin/settings' : '/student/attendance'}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    {isAdmin ? 'settings' : 'qr_code_2'}
                  </span>
                  <span>{isAdmin ? 'System Settings' : 'My QR Pass'}</span>
                </Link>

                <div className="border-t border-surface-container-high my-1"></div>

                <button
                  onClick={() => {
                    const next = isAdmin ? 'student' : 'admin';
                    switchRole(next);
                    setShowUserMenu(false);
                    navigate(next === 'admin' ? '/admin' : '/student');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-secondary hover:bg-secondary-fixed/20 transition-colors font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    <span>Switch to {isAdmin ? 'Student' : 'Admin'}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-white font-bold">ALT</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-error hover:bg-error-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
