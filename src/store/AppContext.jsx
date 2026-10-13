import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserPrescriptions, getPatientHistory } from '../services/api';
import { supabase, signOutUser } from '../services/supabaseClient';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Authentication State – Synced with Supabase Auth as the Single Source of Truth
  const [user, setUser] = useState({
    authenticated: false,
    id: null,
    email: '',
    mobile_number: '',
    user_name: '',
    role: 'USER', // 'USER' or 'PHARMACY_ADMIN'
    pharmacy_id: 'apollo-cp-01',
    verified: false,
    session_token: null
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('USER'); // Role toggle

  // Active Navigation Tab
  // 'landing', 'dashboard', 'upload', 'confirmation', 'generics', 'comparator', 'pharmacies', 'admin', 'chatbot', 'profile', 'search'
  const [activeTab, setActiveTab] = useState('landing');

  // Multilingual Support ('en' = English, 'kn' = Kannada, 'hi' = Hindi)
  const [language, setLanguage] = useState('en');

  // Currently Analyzed / Confirmed Prescription
  const [currentPrescription, setCurrentPrescription] = useState(null);

  // User Prescription History
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);

  // Patient Medical History (allergies, chronic conditions)
  const [patientHistory, setPatientHistory] = useState(null);

  // Chronic Medicine Basket
  const [basket, setBasket] = useState([]);

  // Selected Pharmacy for Focus / Map navigation
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // User Geolocation (Default to New Delhi / Bengaluru cluster)
  const [userLocation, setUserLocation] = useState({
    lat: 28.6139,
    lon: 77.2090,
    label: 'Connaught Place, New Delhi (Default)'
  });

  // Figma Dual-View & Screen Navigator (1 to 16)
  const [viewMode, setViewMode] = useState('desktop'); // 'mobile' | 'desktop'
  const [figmaScreen, setFigmaScreen] = useState(3); // Defaults to Screen 3 (Dashboard)

  // 1-Hour Hold Active Reservation
  const [activeReservation, setActiveReservation] = useState({
    reservation_id: 'RES-8942',
    pharmacy_name: 'Pradhan Mantri Jan Aushadhi Kendra',
    pharmacy_address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    pharmacy_phone: '+91 80 2520 1199',
    drug_name: 'Amoxicillin & Pot. Clavulanate 625mg',
    quantity_strips: 1,
    unit_price: 42.50,
    total_price: 42.50,
    created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    expires_in_minutes: 58
  });

  // Global Toast / Notification
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Map Supabase Session to GenericSwap User Object
  const mapSessionToUser = (session) => {
    if (!session || !session.user) return null;
    const su = session.user;
    const meta = su.user_metadata || {};
    return {
      authenticated: true,
      id: su.id,
      email: su.email || '',
      mobile_number: su.phone || meta.phone || '',
      user_name: meta.full_name || su.email?.split('@')[0] || su.phone || 'Patient',
      role: meta.role || 'USER',
      pharmacy_id: meta.pharmacy_id || 'apollo-cp-01',
      verified: !!(su.phone_confirmed_at || su.email_confirmed_at || su.confirmed_at),
      session_token: session.access_token
    };
  };

  // 1. Initialize Supabase Session & Listen for Auth State Changes
  useEffect(() => {
    // Restore session on refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSessionToUser(session));
      }
    });

    // Real-time listener across logins, signups, token refreshes, and logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSessionToUser(session));
      } else {
        setUser({
          authenticated: false,
          id: null,
          email: '',
          mobile_number: '',
          user_name: '',
          role: 'USER',
          pharmacy_id: null,
          verified: false,
          session_token: null
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load prescription history and profile when user logs in
  useEffect(() => {
    async function loadUserData() {
      if (!user.authenticated) return;
      try {
        const phoneOrId = user.mobile_number || user.id || '9876543210';
        const history = await getUserPrescriptions(phoneOrId);
        setPrescriptionHistory(history || []);

        const profile = await getPatientHistory(phoneOrId);
        setPatientHistory(profile);
      } catch (err) {
        console.warn('User data load notice:', err.message);
      }
    }
    loadUserData();
  }, [user.authenticated, user.mobile_number, user.id]);

  // Request Browser Geolocation if permitted
  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: 'Your Current GPS Location'
          });
          notify('📍 Location updated from GPS', 'success');
        },
        (err) => {
          console.warn('Geolocation access declined:', err.message);
          notify('Using default city coordinates (New Delhi Hub)', 'info');
        }
      );
    }
  };

  // Login handler: accepts either a Supabase session or user payload, then redirects to dashboard
  const login = (sessionOrUser) => {
    if (sessionOrUser?.user) {
      const mapped = mapSessionToUser(sessionOrUser);
      setUser(mapped);
      notify(`Welcome back, ${mapped.user_name}!`, 'success');
      if (mapped.role === 'PHARMACY_ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    } else if (sessionOrUser) {
      setUser({
        authenticated: true,
        id: sessionOrUser.id || null,
        email: sessionOrUser.email || '',
        mobile_number: sessionOrUser.mobile_number || '',
        user_name: sessionOrUser.user_name || 'Patient',
        role: sessionOrUser.role || 'USER',
        pharmacy_id: sessionOrUser.pharmacy_id || 'apollo-cp-01',
        verified: true,
        session_token: sessionOrUser.session_token || null
      });
      notify(`Welcome back, ${sessionOrUser.user_name || 'Patient'}!`, 'success');
      if (sessionOrUser.role === 'PHARMACY_ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
    setAuthModalOpen(false);
  };

  // Logout handler: signs out from Supabase Auth and redirects to landing page
  const logout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setUser({
      authenticated: false,
      id: null,
      email: '',
      mobile_number: '',
      user_name: '',
      role: 'USER',
      pharmacy_id: null,
      verified: false,
      session_token: null
    });
    setActiveTab('landing');
    notify('Logged out successfully', 'info');
  };

  const addToBasket = (medicine) => {
    setBasket((prev) => {
      if (prev.some((m) => m.drug_id === medicine.drug_id)) return prev;
      return [...prev, medicine];
    });
    notify(`Added ${medicine.brand_name} to savings basket`, 'success');
  };

  const removeFromBasket = (drugId) => {
    setBasket((prev) => prev.filter((m) => m.drug_id !== drugId));
    notify('Removed item from basket', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authRole,
        setAuthRole,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        currentPrescription,
        setCurrentPrescription,
        prescriptionHistory,
        setPrescriptionHistory,
        patientHistory,
        setPatientHistory,
        basket,
        setBasket,
        addToBasket,
        removeFromBasket,
        selectedPharmacy,
        setSelectedPharmacy,
        userLocation,
        setUserLocation,
        detectUserLocation,
        toast,
        notify,
        viewMode,
        setViewMode,
        figmaScreen,
        setFigmaScreen,
        activeReservation,
        setActiveReservation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
