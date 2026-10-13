import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: 'student' | 'admin' | 'any';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole = 'any'
}) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Show a branded loading screen while authentication state is being resolved
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 selection:bg-secondary selection:text-white">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-teal-300 shadow-xl shadow-primary/20 animate-bounce mb-5">
          <span className="material-symbols-outlined text-[32px]">bolt</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-secondary animate-ping"></div>
          <span className="font-headline-sm font-bold text-primary text-xl">Eventora Security Gate</span>
        </div>
        <p className="text-body-sm text-outline animate-pulse">
          Verifying session credentials and cryptographic role access...
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to /login preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Student trying to access admin-only route
  if (allowedRole === 'admin' && role !== 'admin') {
    return <Navigate to="/student" replace />;
  }

  // Admin trying to access student-only route (redirect to admin or allow viewing)
  if (allowedRole === 'student' && role === 'admin') {
    // If accessing student home directly, redirect to admin dashboard; otherwise allow admins to preview student event explorer
    if (location.pathname === '/student') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
