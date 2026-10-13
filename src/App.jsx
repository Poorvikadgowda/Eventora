import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { VerifyCertificate } from './pages/public/VerifyCertificate';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExploreEvents } from './pages/student/ExploreEvents';
import { EventDetails } from './pages/student/EventDetails';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentCertificates } from './pages/student/StudentCertificates';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentFeedback } from './pages/student/StudentFeedback';
import { PersonalizedRecommendations } from './pages/student/PersonalizedRecommendations';
import { StudentLiveMap } from './pages/student/StudentLiveMap';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEventsList } from './pages/admin/AdminEventsList';
import { CreateEvent } from './pages/admin/CreateEvent';
import { AdminEventDetails } from './pages/admin/AdminEventDetails';
import { AdminAssignments } from './pages/admin/AdminAssignments';
import { QRAttendanceScanner } from './pages/admin/QRAttendanceScanner';
import { SmartQRAntiFraud } from './pages/admin/SmartQRAntiFraud';
import { CertificateStudio } from './pages/admin/CertificateStudio';
import { ManageResults } from './pages/admin/ManageResults';
import { FeedbackAnalytics } from './pages/admin/FeedbackAnalytics';
import { AICopilot } from './pages/admin/AICopilot';
import { EventSuccessScore } from './pages/admin/EventSuccessScore';
import { UsersManagement } from './pages/admin/UsersManagement';
import { AdminSettings } from './pages/admin/AdminSettings';

import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <EventProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
              <Route path="/verify" element={<VerifyCertificate />} />

              {/* Student Routes wrapped in AppShell + ProtectedRoute */}
              <Route path="/student" element={<ProtectedRoute allowedRole="student"><AppShell><StudentDashboard /></AppShell></ProtectedRoute>} />
              <Route path="/student/explore" element={<ProtectedRoute allowedRole="student"><AppShell><ExploreEvents /></AppShell></ProtectedRoute>} />
              <Route path="/student/events/:id" element={<ProtectedRoute allowedRole="student"><AppShell><EventDetails /></AppShell></ProtectedRoute>} />
              <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><AppShell><StudentAttendance /></AppShell></ProtectedRoute>} />
              <Route path="/student/certificates" element={<ProtectedRoute allowedRole="student"><AppShell><StudentCertificates /></AppShell></ProtectedRoute>} />
              <Route path="/student/assignments" element={<ProtectedRoute allowedRole="student"><AppShell><StudentAssignments /></AppShell></ProtectedRoute>} />
              <Route path="/student/feedback" element={<ProtectedRoute allowedRole="student"><AppShell><StudentFeedback /></AppShell></ProtectedRoute>} />
              <Route path="/student/recommendations" element={<ProtectedRoute allowedRole="student"><AppShell><PersonalizedRecommendations /></AppShell></ProtectedRoute>} />
              <Route path="/student/map" element={<ProtectedRoute allowedRole="student"><AppShell><StudentLiveMap /></AppShell></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute allowedRole="student"><AppShell><NotificationsPage /></AppShell></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />

              {/* Admin Routes wrapped in AppShell + ProtectedRoute */}
              <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminDashboard /></AppShell></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminEventsList /></AppShell></ProtectedRoute>} />
              <Route path="/admin/events/create" element={<ProtectedRoute allowedRole="admin"><AppShell><CreateEvent /></AppShell></ProtectedRoute>} />
              <Route path="/admin/events/:id" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminEventDetails /></AppShell></ProtectedRoute>} />
              <Route path="/admin/assignments" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminAssignments /></AppShell></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminDashboard /></AppShell></ProtectedRoute>} />
              <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="any"><AppShell><StudentAttendance /></AppShell></ProtectedRoute>} />
              <Route path="/admin/qr-scanner" element={<ProtectedRoute allowedRole="any"><AppShell><QRAttendanceScanner /></AppShell></ProtectedRoute>} />
              <Route path="/student/qr-scanner" element={<ProtectedRoute allowedRole="any"><AppShell><QRAttendanceScanner /></AppShell></ProtectedRoute>} />
              <Route path="/admin/anti-fraud" element={<ProtectedRoute allowedRole="admin"><AppShell><SmartQRAntiFraud /></AppShell></ProtectedRoute>} />
              <Route path="/admin/certificates" element={<ProtectedRoute allowedRole="admin"><AppShell><CertificateStudio /></AppShell></ProtectedRoute>} />
              <Route path="/admin/results" element={<ProtectedRoute allowedRole="admin"><AppShell><ManageResults /></AppShell></ProtectedRoute>} />
              <Route path="/admin/events/:id/results" element={<ProtectedRoute allowedRole="admin"><AppShell><ManageResults /></AppShell></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute allowedRole="admin"><AppShell><FeedbackAnalytics /></AppShell></ProtectedRoute>} />
              <Route path="/admin/live-map" element={<ProtectedRoute allowedRole="admin"><AppShell><StudentLiveMap /></AppShell></ProtectedRoute>} />
              <Route path="/admin/ai-copilot" element={<ProtectedRoute allowedRole="admin"><AppShell><AICopilot /></AppShell></ProtectedRoute>} />
              <Route path="/admin/success-score" element={<ProtectedRoute allowedRole="admin"><AppShell><EventSuccessScore /></AppShell></ProtectedRoute>} />
              <Route path="/admin/recommendations" element={<ProtectedRoute allowedRole="admin"><AppShell><PersonalizedRecommendations /></AppShell></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AppShell><UsersManagement /></AppShell></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AppShell><AdminSettings /></AppShell></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </EventProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
