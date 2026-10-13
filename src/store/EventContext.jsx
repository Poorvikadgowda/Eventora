import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EVENT,
  INITIAL_SESSIONS,
  INITIAL_ATTENDEES,
  INITIAL_COMMUNICATIONS,
  CERTIFICATE_TEMPLATES
} from './mockData';

const EventContext = createContext(null);

const STORAGE_KEYS = {
  EVENT: 'autoevent_event_data',
  ATTENDEES: 'autoevent_attendees_data',
  SESSIONS: 'autoevent_sessions_data',
  COMMUNICATIONS: 'autoevent_comms_data',
  CURRENT_ATTENDEE_ID: 'autoevent_current_attendee_id',
  ACTIVE_VIEW: 'autoevent_active_view'
};

export const EventProvider = ({ children }) => {
  // 1. Initialize State with LocalStorage fallback
  const [event, setEvent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENT);
      return saved ? JSON.parse(saved) : INITIAL_EVENT;
    } catch (e) {
      return INITIAL_EVENT;
    }
  });

  const [attendees, setAttendees] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDEES);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDEES;
    } catch (e) {
      return INITIAL_ATTENDEES;
    }
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch (e) {
      return INITIAL_SESSIONS;
    }
  });

  const [communications, setCommunications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMUNICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_COMMUNICATIONS;
    } catch (e) {
      return INITIAL_COMMUNICATIONS;
    }
  });

  const [currentAttendeeId, setCurrentAttendeeId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_ATTENDEE_ID) || "EVT-80921";
    } catch (e) {
      return "EVT-80921";
    }
  });

  // View state: 'attendee' or 'admin'
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) || 'admin';
    } catch (e) {
      return 'admin';
    }
  });

  // Sub-navigation state
  const [adminTab, setAdminTab] = useState('dashboard');
  const [attendeeTab, setAttendeeTab] = useState('landing');
  const [selectedTemplate, setSelectedTemplate] = useState('tech-gradient');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(event));
    } catch (e) {}
  }, [event]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDEES, JSON.stringify(attendees));
    } catch (e) {}
  }, [attendees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(communications));
    } catch (e) {}
  }, [communications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ATTENDEE_ID, currentAttendeeId);
    } catch (e) {}
  }, [currentAttendeeId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, activeView);
    } catch (e) {}
  }, [activeView]);

  // Current active attendee object
  const currentAttendee = attendees.find(a => a.id === currentAttendeeId) || attendees[0] || null;

  // -------------------------------------------------------------
  // AUTOMATION ENGINES & ACTIONS
  // -------------------------------------------------------------

  /**
   * 1. Smart Deduplication Check
   * Checks if an email or phone is already registered
   */
  const checkDuplicate = (email, phone, excludeId = null) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    const match = attendees.find(a => {
      if (excludeId && a.id === excludeId) return false;
      const existingEmail = a.email.trim().toLowerCase();
      const existingPhone = a.phone ? a.phone.replace(/[^0-9]/g, '') : '';

      if (cleanEmail && existingEmail === cleanEmail) {
        return true;
      }
      if (cleanPhone && existingPhone && cleanPhone.length > 6 && cleanPhone === existingPhone) {
        return true;
      }
      return false;
    });

    if (match) {
      const field = match.email.toLowerCase() === cleanEmail ? 'Email' : 'Phone Number';
      return { isDuplicate: true, attendee: match, field };
    }

    return { isDuplicate: false, attendee: null, field: null };
  };

  /**
   * 2. Automated Registration
   * - Prevents duplicate entry
   * - Assigns unique cryptographic ID & Token
   * - Triggers automatic ON_REGISTRATION communication
   */
  const registerAttendee = (formData) => {
    const dupCheck = checkDuplicate(formData.email, formData.phone);
    if (dupCheck.isDuplicate) {
      return {
        success: false,
        duplicate: true,
        attendee: dupCheck.attendee,
        field: dupCheck.field,
        message: `An account with this ${dupCheck.field} is already registered (${dupCheck.attendee.name}). Duplicate entry prevented.`
      };
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newId = `EVT-${randomSuffix}`;
    const qrToken = `${newId}-${(formData.tier || 'GEN').toUpperCase()}-VERIFIED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newAttendee = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      organization: formData.organization || 'Independent',
      jobTitle: formData.jobTitle || 'Participant',
      tier: formData.tier || 'general',
      track: formData.track || 'ai',
      registeredAt: new Date().toISOString(),
      verified: true,
      checkedIn: false,
      checkedInAt: null,
      checkedInSession: null,
      checkInHistory: [],
      qrToken,
      feedbackSubmitted: false,
      feedback: null,
      certificateGenerated: false,
      certificateId: null,
      certificateHash: null
    };

    // Update attendees list
    const updated = [newAttendee, ...attendees];
    setAttendees(updated);
    setCurrentAttendeeId(newId);

    // Automated Trigger 1: ON_REGISTRATION
    const autoComm = {
      id: `COM-${Math.floor(100 + Math.random() * 900)}`,
      trigger: 'ON_REGISTRATION',
      recipientName: newAttendee.name,
      recipientEmail: newAttendee.email,
      subject: `Confirmed: Your Digital Pass & QR Code for ${event.shortName}`,
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      channel: 'Email + Pass Link',
      preview: `Hi ${newAttendee.name}, your registration for ${event.name} is confirmed! Your Pass ID is ${newAttendee.id}. Click to view badge.`
    };
    setCommunications(prev => [autoComm, ...prev]);

    return {
      success: true,
      duplicate: false,
      attendee: newAttendee,
      message: 'Registration successful! Digital Pass & QR Code issued automatically.'
    };
  };

  /**
   * 3. Real-Time Attendance & Live QR Scanner Engine
   * - Prevents duplicate check-in with audio/visual warnings
   * - Increments session counts
   * - Fires automated ON_CHECKIN welcome notification
   */
  const checkInAttendee = (identifier, sessionId = "S-101") => {
    if (!identifier) {
      return { success: false, status: 'INVALID', message: 'No QR code or attendee ID provided.' };
    }

    const cleanId = identifier.trim();

    // Look up by ID, Email, or QR Token
    const attendee = attendees.find(a => 
      a.id.toLowerCase() === cleanId.toLowerCase() ||
      (a.qrToken && a.qrToken.toLowerCase() === cleanId.toLowerCase()) ||
      a.email.toLowerCase() === cleanId.toLowerCase()
    );

    if (!attendee) {
      return {
        success: false,
        status: 'NOT_FOUND',
        message: `Pass not found for "${cleanId}". Please verify the ticket badge.`
      };
    }

    const session = sessions.find(s => s.id === sessionId) || sessions[0];

    // Check if already checked in to THIS session or overall
    const alreadyInSession = attendee.checkInHistory && attendee.checkInHistory.some(h => h.sessionId === session.id);

    if (alreadyInSession) {
      return {
        success: false,
        status: 'ALREADY_CHECKED_IN',
        attendee,
        session,
        checkedInAt: attendee.checkedInAt,
        message: `DUPLICATE CHECK-IN PREVENTED: ${attendee.name} was already checked in to "${session.title}" at ${new Date(attendee.checkedInAt).toLocaleTimeString()}.`
      };
    }

    const now = new Date().toISOString();
    const newHistory = [
      ...(attendee.checkInHistory || []),
      { sessionId: session.id, sessionTitle: session.title, timestamp: now }
    ];

    const updatedAttendee = {
      ...attendee,
      checkedIn: true,
      checkedInAt: attendee.checkedInAt || now,
      checkedInSession: session.id,
      checkInHistory: newHistory
    };

    // Update attendees
    setAttendees(prev => prev.map(a => a.id === attendee.id ? updatedAttendee : a));

    // Increment session attendee count
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, checkedInCount: (s.checkedInCount || 0) + 1 } : s));

    // Automated Trigger 2: ON_CHECKIN
    const welcomeComm = {
      id: `COM-${Math.floor(100 + Math.random() * 900)}`,
      trigger: 'ON_CHECKIN',
      recipientName: attendee.name,
      recipientEmail: attendee.email,
      subject: `Welcome to ${event.shortName}! Real-time Venue & Wi-Fi Access`,
      status: 'Delivered',
      timestamp: now,
      channel: 'In-App / SMS',
      preview: `Welcome ${attendee.name}! You've successfully checked in at ${session.room}. Connect to Wi-Fi: SummitGuest2026 (Pass: innovate26).`
    };
    setCommunications(prev => [welcomeComm, ...prev]);

    return {
      success: true,
      status: 'SUCCESS',
      attendee: updatedAttendee,
      session,
      message: `Verified & Checked In! Welcome ${attendee.name} (${attendee.tier.toUpperCase()}).`
    };
  };

  /**
   * 4. Feedback & Automated Certificate Unlock Engine
   * - Saves survey rating and NPS
   * - Automatically generates certificate if conditions are satisfied
   * - Fires ON_FEEDBACK_SUBMITTED notification with download link
   */
  const submitFeedback = (attendeeId, feedbackData) => {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (!attendee) return { success: false, message: 'Attendee not found' };

    const randomHash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const certId = `CERT-${event.shortName.replace(/\s+/g, '')}-${attendee.id.replace('EVT-', '')}`;

    const updatedAttendee = {
      ...attendee,
      feedbackSubmitted: true,
      feedback: {
        ...feedbackData,
        submittedAt: new Date().toISOString()
      },
      certificateGenerated: true,
      certificateId: certId,
      certificateHash: randomHash
    };

    setAttendees(prev => prev.map(a => a.id === attendeeId ? updatedAttendee : a));

    // Automated Trigger 3: ON_FEEDBACK_SUBMITTED
    const certComm = {
      id: `COM-${Math.floor(100 + Math.random() * 900)}`,
      trigger: 'ON_FEEDBACK_SUBMITTED',
      recipientName: attendee.name,
      recipientEmail: attendee.email,
      subject: `Certificate of Completion Ready: ${event.name}`,
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      channel: 'Email + PDF Link',
      preview: `Thank you for your feedback! Your verifiable credential ${certId} is now generated and ready for 1-click download.`
    };
    setCommunications(prev => [certComm, ...prev]);

    return {
      success: true,
      attendee: updatedAttendee,
      certificateId: certId,
      message: 'Feedback recorded! Your official Certificate of Attendance is now unlocked.'
    };
  };

  /**
   * 5. Manual / Batch Certificate Generator
   */
  const issueCertificate = (attendeeId) => {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (!attendee) return;

    const randomHash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const certId = `CERT-${event.shortName.replace(/\s+/g, '')}-${attendee.id.replace('EVT-', '')}`;

    const updated = {
      ...attendee,
      certificateGenerated: true,
      certificateId: certId,
      certificateHash: randomHash
    };

    setAttendees(prev => prev.map(a => a.id === attendeeId ? updated : a));
    return updated;
  };

  /**
   * 6. Public Certificate Verifier
   * Verifies authenticity of certificate by ID or cryptographic hash
   */
  const verifyCertificate = (query) => {
    if (!query) return { valid: false, message: 'Please provide a Certificate ID or verification hash.' };
    const clean = query.trim().toLowerCase();

    const match = attendees.find(a => 
      (a.certificateId && a.certificateId.toLowerCase() === clean) ||
      (a.certificateHash && a.certificateHash.toLowerCase() === clean) ||
      a.id.toLowerCase() === clean
    );

    if (match && match.certificateGenerated) {
      return {
        valid: true,
        attendee: match,
        event,
        message: 'Cryptographically Verified Official Certificate'
      };
    }

    return {
      valid: false,
      attendee: null,
      event: null,
      message: 'No active credential found matching this verification code.'
    };
  };

  /**
   * 7. CSV Bulk Importer with Deduplication Rules
   */
  const importCSV = (parsedRows, deduplicationStrategy = 'skip') => {
    let added = 0;
    let updated = 0;
    let skipped = 0;
    let currentList = [...attendees];

    parsedRows.forEach(row => {
      const email = row.email || row.Email || '';
      const phone = row.phone || row.Phone || '';
      const name = row.name || row.Name || 'Guest Attendee';
      const org = row.organization || row.Organization || 'Independent';
      const tier = (row.tier || row.Tier || 'general').toLowerCase();

      if (!email && !name) {
        skipped++;
        return;
      }

      const dup = checkDuplicate(email, phone);

      if (dup.isDuplicate) {
        if (deduplicationStrategy === 'skip') {
          skipped++;
        } else if (deduplicationStrategy === 'update') {
          currentList = currentList.map(a => a.id === dup.attendee.id ? {
            ...a,
            name: name || a.name,
            organization: org || a.organization,
            tier: tier || a.tier
          } : a);
          updated++;
        }
      } else {
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const newId = `EVT-${randomSuffix}`;
        const newAttendee = {
          id: newId,
          name,
          email,
          phone,
          organization: org,
          jobTitle: row.jobTitle || row.Title || 'Attendee',
          tier: ['general', 'vip', 'speaker', 'student', 'sponsor'].includes(tier) ? tier : 'general',
          track: row.track || 'ai',
          registeredAt: new Date().toISOString(),
          verified: true,
          checkedIn: false,
          checkedInAt: null,
          checkedInSession: null,
          checkInHistory: [],
          qrToken: `${newId}-${tier.toUpperCase()}-VERIFIED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          feedbackSubmitted: false,
          feedback: null,
          certificateGenerated: false,
          certificateId: null,
          certificateHash: null
        };
        currentList.push(newAttendee);
        added++;
      }
    });

    setAttendees(currentList);
    return { added, updated, skipped, total: parsedRows.length };
  };

  /**
   * 8. Manual Broadcast Dispatcher
   */
  const sendBroadcast = (targetTier, subject, message) => {
    const recipients = attendees.filter(a => targetTier === 'all' || a.tier === targetTier);
    const newComm = {
      id: `COM-${Math.floor(100 + Math.random() * 900)}`,
      trigger: 'MANUAL_BROADCAST',
      recipientName: `${recipients.length} Attendees (${targetTier.toUpperCase()})`,
      recipientEmail: `${recipients.length} emails`,
      subject,
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      channel: 'Email + In-App Push',
      preview: message
    };
    setCommunications(prev => [newComm, ...prev]);
    return recipients.length;
  };

  /**
   * 9. Reset Demo Data
   */
  const resetToDemo = () => {
    localStorage.clear();
    setEvent(INITIAL_EVENT);
    setAttendees(INITIAL_ATTENDEES);
    setSessions(INITIAL_SESSIONS);
    setCommunications(INITIAL_COMMUNICATIONS);
    setCurrentAttendeeId("EVT-80921");
  };

  // -------------------------------------------------------------
  // COMPUTED STATS & KPIs
  // -------------------------------------------------------------
  const totalRegistered = attendees.length;
  const totalVerified = attendees.filter(a => a.verified).length;
  const totalCheckedIn = attendees.filter(a => a.checkedIn).length;
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
  
  const feedbackList = attendees.filter(a => a.feedbackSubmitted && a.feedback);
  const totalFeedback = feedbackList.length;
  const avgRating = totalFeedback > 0 
    ? (feedbackList.reduce((acc, curr) => acc + (curr.feedback.rating || 5), 0) / totalFeedback).toFixed(1)
    : '5.0';

  // NPS Calculation: % Promoters (9-10) minus % Detractors (0-6)
  const promoters = feedbackList.filter(f => (f.feedback.npsScore || 10) >= 9).length;
  const detractors = feedbackList.filter(f => (f.feedback.npsScore || 10) <= 6).length;
  const npsScore = totalFeedback > 0 
    ? Math.round(((promoters - detractors) / totalFeedback) * 100)
    : 100;

  const totalCertificates = attendees.filter(a => a.certificateGenerated).length;

  return (
    <EventContext.Provider value={{
      // State
      event,
      setEvent,
      attendees,
      sessions,
      communications,
      currentAttendee,
      currentAttendeeId,
      setCurrentAttendeeId,
      activeView,
      setActiveView,
      adminTab,
      setAdminTab,
      attendeeTab,
      setAttendeeTab,
      selectedTemplate,
      setSelectedTemplate,
      templates: CERTIFICATE_TEMPLATES,

      // Actions
      checkDuplicate,
      registerAttendee,
      checkInAttendee,
      submitFeedback,
      issueCertificate,
      verifyCertificate,
      importCSV,
      sendBroadcast,
      resetToDemo,

      // KPIs & Stats
      kpis: {
        totalRegistered,
        totalVerified,
        totalCheckedIn,
        checkInRate,
        totalFeedback,
        avgRating,
        npsScore,
        totalCertificates
      }
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
