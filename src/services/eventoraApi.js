/**
 * Eventora Backend API Client Service
 * Communicates with the FastAPI backend at http://localhost:8000
 * Gracefully falls back to local in-memory/demo state if backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.message || 'API request failed');
    }
    return await res.json();
  } catch (error) {
    // Return null or rethrow based on caller
    console.debug(`[Eventora API] ${endpoint} request error:`, error.message);
    throw error;
  }
}

// Check if backend is alive
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// Auth
export async function loginApi(email, password, role = 'student') {
  return await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role })
  });
}

export async function registerApi(userData) {
  return await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function fetchAllUsersApi(role, search) {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (search) params.append('search', search);
  return await apiRequest(`/api/auth/users?${params.toString()}`);
}

// Events
export async function fetchEventsApi(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  return await apiRequest(`/api/events?${params.toString()}`);
}

export async function fetchEventByIdApi(id) {
  return await apiRequest(`/api/events/${id}`);
}

export async function createEventApi(eventData) {
  return await apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}

export async function updateEventApi(id, eventData) {
  return await apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  });
}

export async function deleteEventApi(id) {
  return await apiRequest(`/api/events/${id}`, {
    method: 'DELETE'
  });
}

export async function registerForEventApi(eventId, studentId) {
  return await apiRequest(`/api/events/${eventId}/register?student_id=${studentId || 'usr_alex_01'}`, {
    method: 'POST'
  });
}

export async function cancelRegistrationApi(eventId, studentId) {
  return await apiRequest(`/api/events/${eventId}/register?student_id=${studentId || 'usr_alex_01'}`, {
    method: 'DELETE'
  });
}

// Dynamic QR
export async function startQRSessionApi(eventId, windowSeconds = 15) {
  return await apiRequest('/api/qr/session', {
    method: 'POST',
    body: JSON.stringify({ eventId, windowSeconds })
  });
}

export async function fetchCurrentQRTokenApi(eventId) {
  return await apiRequest(`/api/qr/token/${eventId}`);
}

export async function validateQRTokenApi(eventId, token, studentId, method = 'Dynamic QR') {
  return await apiRequest('/api/qr/validate', {
    method: 'POST',
    body: JSON.stringify({ eventId, token, studentId, method })
  });
}

// Attendance
export async function scanAttendanceApi(eventId, tokenOrStudentId, method = 'Dynamic QR', deviceInfo = 'Web Scanner') {
  return await apiRequest('/api/attendance/scan', {
    method: 'POST',
    body: JSON.stringify({ eventId, tokenOrStudentId, method, deviceInfo })
  });
}

export async function fetchEventAttendanceApi(eventId) {
  return await apiRequest(`/api/attendance/event/${eventId}`);
}

export async function fetchStudentAttendanceApi(studentId) {
  return await apiRequest(`/api/attendance/student/${studentId}`);
}

export async function fetchAntiFraudLogsApi() {
  return await apiRequest('/api/attendance/anti-fraud-logs');
}

export async function fetchAttendanceStatsApi() {
  return await apiRequest('/api/attendance/stats');
}

// Certificates
export async function fetchCertificatesApi(studentId, eventId) {
  const params = new URLSearchParams();
  if (studentId) params.append('student_id', studentId);
  if (eventId) params.append('event_id', eventId);
  return await apiRequest(`/api/certificates?${params.toString()}`);
}

export async function verifyCertificateApi(certificateId) {
  return await apiRequest(`/api/certificates/verify/${certificateId}`);
}

export async function generateCertificateApi(certData) {
  return await apiRequest('/api/certificates/generate', {
    method: 'POST',
    body: JSON.stringify(certData)
  });
}

// Feedback
export async function submitFeedbackApi(feedbackData) {
  return await apiRequest('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
}

export async function fetchEventFeedbackApi(eventId) {
  return await apiRequest(`/api/feedback/event/${eventId}`);
}

export async function fetchFeedbackAnalyticsApi() {
  return await apiRequest('/api/feedback/analytics');
}

// Analytics & Success Score
export async function fetchDashboardAnalyticsApi() {
  return await apiRequest('/api/analytics/dashboard');
}

export async function fetchSuccessScoresApi() {
  return await apiRequest('/api/analytics/events');
}

export async function fetchSuccessScoreBreakdownApi(eventId) {
  return await apiRequest(`/api/analytics/success-score/${eventId}`);
}

// AI Copilot
export async function runAICopilotApi(prompt, context = {}) {
  return await apiRequest('/api/ai/copilot', {
    method: 'POST',
    body: JSON.stringify({ prompt, ...context })
  });
}

// Venues & Campus
export async function fetchVenuesApi() {
  return await apiRequest('/api/venues');
}

export async function fetchRecommendationsApi(studentId = 'usr_alex_01') {
  return await apiRequest(`/api/recommendations/${studentId}`);
}

export async function fetchNotificationsApi(userId = 'usr_alex_01') {
  return await apiRequest(`/api/notifications?user_id=${userId}`);
}
