import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  QrCode,
  Award,
  CheckCircle2,
  BarChart3,
  Mail,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Users,
  Sparkles,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Lock,
  Search,
  FileText,
  Check,
  Zap,
  TrendingUp,
  Layers,
  Compass,
  Download,
  Share2
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('organizer'); // 'organizer' | 'scanner' | 'certificate'
  const [qrTokenSeconds, setQrTokenSeconds] = useState(12);

  // Dynamic QR countdown simulation for product mockup
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTokenSeconds((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigatePortal = (role = 'student') => {
    if (isAuthenticated) {
      navigate(role === 'admin' ? '/admin' : '/student');
    } else {
      navigate(`/login?portal=${role}`);
    }
  };

  // 8 Core Features
  const features = [
    {
      icon: Calendar,
      title: 'Event Creation & Scheduling',
      tag: 'Multi-Track Orchestration',
      desc: 'Build comprehensive agendas, manage speaker profiles, and configure venue reservations with automatic schedule clash detection.'
    },
    {
      icon: Users,
      title: 'Participant Registration',
      tag: 'Frictionless RSVP',
      desc: 'Custom registration workflows, automated waitlist allocation, departmental eligibility rules, and instant ICS calendar sync.'
    },
    {
      icon: QrCode,
      title: 'QR-Based Check-In',
      tag: 'Dynamic Anti-Fraud',
      desc: 'Cryptographically rotating dynamic QR codes updated every 15 seconds to completely eliminate screenshot proxy attendance.'
    },
    {
      icon: Award,
      title: 'Automated Certificate Generation',
      tag: 'Cryptographic Vault',
      desc: 'Batch-generate verifiable PDF credentials instantly upon confirmed check-in, complete with unique SHA-256 verification URLs.'
    },
    {
      icon: CheckCircle2,
      title: 'Attendance Tracking',
      tag: 'Real-Time Sync',
      desc: 'Live attendee logs synchronized with student USNs and institutional rosters, eliminating manual spreadsheet reconciliations.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      tag: 'Executive Intelligence',
      desc: 'Monitor check-in velocity, crowd density indicators, departmental participation ratios, and automated post-event ROI scores.'
    },
    {
      icon: Mail,
      title: 'Automated Email Notifications',
      tag: 'Smart Dispatches',
      desc: 'Automated event confirmations, personalized mobile check-in passes, calendar reminders, and post-event certificate delivery.'
    },
    {
      icon: MessageSquare,
      title: 'Feedback Collection',
      tag: '5-Star NPS Analytics',
      desc: 'Multi-criteria post-event evaluations, anonymous attendee reviews, speaker ratings, and automated sentiment summarization.'
    }
  ];

  // 4 How It Works Steps
  const steps = [
    {
      step: '01',
      title: 'Create Event',
      subtitle: 'Schedule & Configure',
      desc: 'Establish event schedules, select campus venues (e.g. Dr. AIT SJB Hall), configure registration quotas, and publish in minutes.'
    },
    {
      step: '02',
      title: 'Invite Participants',
      subtitle: 'Targeted Outreach',
      desc: 'Distribute branded RSVP links across academic departments with waitlists, calendar ICS attachments, and custom intake fields.'
    },
    {
      step: '03',
      title: 'Track Attendance',
      subtitle: 'Dynamic QR Verification',
      desc: 'Organizers scan attendees’ dynamic mobile QR passes. Cryptographic anti-fraud tokens validate check-ins in under 200ms.'
    },
    {
      step: '04',
      title: 'Analyze Results',
      subtitle: 'Certificates & Reporting',
      desc: 'Issue tamper-proof certificates automatically into attendee vaults and export accreditation-ready compliance reports.'
    }
  ];

  // Solutions Data
  const solutions = [
    {
      role: 'Students',
      icon: GraduationCap,
      badge: 'Academic Learners',
      headline: 'Effortless RSVPs, live venue navigation & verifiable credentials.',
      benefits: [
        'One-click registration for hackathons, workshops & symposiums',
        'Dynamic mobile QR ticket stored directly in your digital profile',
        'Interactive indoor campus maps with turn-by-turn room routing',
        'Permanent cryptographic PDF certificates ready for LinkedIn sharing'
      ]
    },
    {
      role: 'Faculty & Academic Deans',
      icon: Building2,
      badge: 'Institutional Governance',
      headline: 'Audit-ready attendance compliance with zero paperwork.',
      benefits: [
        'Department-wise student participation rosters updated in real time',
        'Elimination of physical paper sign-in sheets and proxy check-ins',
        'One-click data exports tailored for NAAC & NBA accreditation audits',
        'Centralized visibility over department-sponsored technical events'
      ]
    },
    {
      role: 'Event Organizers',
      icon: Sparkles,
      badge: 'Campus Clubs & Leads',
      headline: 'Run multi-track symposiums with automated precision.',
      benefits: [
        'Real-time check-in velocity dashboard and capacity warning alerts',
        'Automated waitlist clearance and instant attendee broadcast emails',
        'Dynamic QR mobile scanning mode with offline tolerance',
        'Integrated feedback analytics and automated Event Success scoring'
      ]
    },
    {
      role: 'Colleges & Universities',
      icon: Layers,
      badge: 'Campus Administration',
      headline: 'A unified operating system for campus-wide gatherings.',
      benefits: [
        'Centralized calendar preventing overlapping departmental symposiums',
        'Verified student USN integration for genuine institutional participation',
        'Campus vector indoor venue directory (SJB Lab, Centenary Bhavan)',
        'Enterprise role-based security separating student and admin data'
      ]
    },
    {
      role: 'Corporate Teams & Sponsors',
      icon: Briefcase,
      badge: 'Enterprise & Recruiters',
      headline: 'Seamless guest ticketing and verified talent engagement.',
      benefits: [
        'Professional badge check-ins and executive keynote attendance tracking',
        'Real-time hackathon deliverable submissions and evaluation tables',
        'Verified participant skill tags and credential authenticity checks',
        'Exportable attendee engagement reports for post-event recruitment'
      ]
    }
  ];

  // Verified Project Metrics
  const verifiedMetrics = [
    {
      stat: '100%',
      label: 'Dynamic QR Anti-Fraud',
      detail: 'Rotating 15-second tokens eliminate screenshot proxy attendance.'
    },
    {
      stat: '0',
      label: 'Manual Spreadsheets',
      detail: 'Live synchronization between check-in scanners and student profiles.'
    },
    {
      stat: '100%',
      label: 'Verifiable Credentials',
      detail: 'Public verification endpoints (/verify/:id) with SHA-256 integrity.'
    },
    {
      stat: 'Multi-Role',
      label: 'Enterprise Access Control',
      detail: 'Strict isolation separating Student, Faculty/Admin, and Public views.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 font-sans selection:bg-[#0755E9] selection:text-white flex flex-col">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#061A2F] flex items-center justify-center text-[#20DCC2] shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current text-[#20DCC2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#061A2F]">
                  Eventora
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                  Enterprise
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block -mt-0.5">
                Automate Every Event
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#0755E9] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#0755E9] transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-[#0755E9] transition-colors">
              Product Showcase
            </a>
            <a href="#solutions" className="hover:text-[#0755E9] transition-colors">
              Solutions
            </a>
            <a href="#metrics" className="hover:text-[#0755E9] transition-colors">
              Trust & Impact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={currentUser?.role === 'admin' ? '/admin' : '/student'}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#061A2F] hover:bg-[#061A2F]/90 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-[#20DCC2] animate-pulse"></span>
                  <span>Dashboard ({currentUser?.name?.split(' ')[0] || 'My Account'})</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 transition-colors border border-slate-200 hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Sign In Dropdown / Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                    onBlur={() => setTimeout(() => setSignInDropdownOpen(false), 200)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#061A2F] hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
                  >
                    <span>Sign In</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${signInDropdownOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Dropdown Menu for Portal Selection */}
                  {signInDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Select Portal
                        </p>
                      </div>
                      <Link
                        to="/login?portal=student"
                        className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0755E9] flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0755E9]">
                            Student Portal
                          </p>
                          <p className="text-xs text-slate-500">
                            RSVP, attendance & certificate vault
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/login?portal=admin"
                        className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0755E9]">
                            Faculty & Admin Portal
                          </p>
                          <p className="text-xs text-slate-500">
                            Organize events, scanner & reports
                          </p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Get Started CTA */}
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-[#0755E9] hover:bg-[#0546C4] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 group hover:shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 font-medium text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Product Showcase
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Solutions
              </a>
              <a
                href="#metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Trust & Impact
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/login?portal=student"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-slate-100 text-slate-800 block"
              >
                Sign In as Student
              </Link>
              <Link
                to="/login?portal=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center border border-slate-200 text-slate-800 block"
              >
                Sign In as Faculty / Admin
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-[#0755E9] text-white block shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/60">
        {/* Subtle grid background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#061A2F08_1px,transparent_1px),linear-gradient(to_bottom,#061A2F08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60"></div>
        
        {/* Soft color glow orbs */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-100/60 via-teal-100/40 to-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs mb-8 text-xs font-semibold text-[#061A2F]">
              <span className="w-2 h-2 rounded-full bg-[#20DCC2] animate-pulse"></span>
              <span>End-to-End Event Management Automation Platform</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#0755E9] flex items-center gap-1 font-bold">
                Dr. AIT Campus OS <ChevronRight className="w-3 h-3 inline" />
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#061A2F] leading-[1.08] mb-6">
              Every Event.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0755E9] via-[#0755E9] to-[#20DCC2]">
                One Intelligent Platform.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Simplify campus and corporate event management from inception to certificate issuance. Automate multi-track scheduling, frictionless registrations, anti-fraud dynamic QR check-ins, and cryptographic credential delivery in one unified operating system.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {isAuthenticated ? (
                <>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin' : '/student'}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0755E9] hover:bg-[#0546C4] text-white font-semibold text-base transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group hover:scale-[1.02]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#20DCC2] animate-pulse"></span>
                    <span>Go to {currentUser?.role === 'admin' ? 'Organizer Console' : 'Student Dashboard'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={currentUser?.role === 'admin' ? '/admin/events' : '/student/explore'}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base transition-all border border-slate-200/90 shadow-xs flex items-center justify-center gap-2 hover:border-slate-300"
                  >
                    <span>Explore Campus Events</span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0755E9] hover:bg-[#0546C4] text-white font-semibold text-base transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group hover:scale-[1.02]"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base transition-all border border-slate-200/90 shadow-xs flex items-center justify-center gap-2 hover:border-slate-300"
                  >
                    <span>Sign In to Your Account</span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                </>
              )}
            </div>

            {/* Role Gateway Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Direct Portals:</span>
              <button
                onClick={() => handleNavigatePortal('student')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#0755E9]" />
                <span>Student Portal</span>
              </button>
              <button
                onClick={() => handleNavigatePortal('admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Teacher / Admin Console</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Product Dashboard Mockup */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-white p-3 sm:p-5 shadow-[0_20px_50px_rgba(6,26,47,0.12)] border border-slate-200/90 ring-1 ring-slate-100">
              {/* Window Frame Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                    eventora.drait.edu.in/app/command-center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Campus Network
                  </span>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 sm:p-6 border border-slate-200/60">
                {/* Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Total Registrations</span>
                      <Users className="w-4 h-4 text-[#0755E9]" />
                    </div>
                    <div className="text-2xl font-bold text-[#061A2F]">3,420</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18.4% this semester
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Verified Attendance</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-[#061A2F]">96.8%</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">
                      Zero proxy bypasses
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Certificates Issued</span>
                      <Award className="w-4 h-4 text-[#20DCC2]" />
                    </div>
                    <div className="text-2xl font-bold text-[#061A2F]">3,180</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      100% SHA-256 verifiable
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-medium">Active Venues</span>
                      <MapPin className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-[#061A2F]">8 Labs</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      Dr. AIT SJB & Centenary
                    </div>
                  </div>
                </div>

                {/* Event Spotlight & Live Dynamic QR Check-in Module */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Active Event Card */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-[#0755E9] border border-blue-100">
                          Flagship Hackathon
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ID: EVT-DRAIT-2026-01
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#061A2F] mb-1">
                        AI & Autonomous Agents Hackathon 2026
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>SJB Seminar Hall & Cloud Labs • Level 1, Dr. AIT Campus</span>
                      </p>

                      {/* Progress bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>Capacity Utilization (342 / 350 RSVP)</span>
                          <span className="font-semibold text-[#0755E9]">97.7%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0755E9] rounded-full w-[97.7%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0755E9]" />
                        <span>Saturday, 09:00 AM IST</span>
                      </span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Check-in Active
                      </span>
                    </div>
                  </div>

                  {/* Right: Live Dynamic Rotating QR Widget */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center justify-between">
                    <div className="w-full flex items-center justify-between text-xs mb-3">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#0755E9]" />
                        <span>Dynamic Check-in Pass</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Rotates in {qrTokenSeconds}s
                      </span>
                    </div>

                    {/* QR Code Graphic Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 inline-flex flex-col items-center justify-center my-1 relative">
                      <div className="w-28 h-28 bg-[#061A2F] rounded-lg p-2 flex items-center justify-center relative overflow-hidden shadow-inner">
                        {/* Simulated QR Pattern */}
                        <div className="w-full h-full bg-white rounded flex items-center justify-center p-1">
                          <div className="grid grid-cols-5 gap-1 w-full h-full p-1">
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#0755E9] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#20DCC2] rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-[#0755E9] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-slate-200 rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                            <div className="bg-[#061A2F] rounded-xs"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1.5">
                        TOKEN: DYN-{qrTokenSeconds * 42}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2">
                      Anti-fraud screen protection prevents duplicate and forwarded scans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE CARDS SECTION */}
      <section id="features" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0755E9] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              End-to-End Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#061A2F] mt-3 mb-4 tracking-tight">
              Engineered for Zero Administrative Overhead
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Every stage of your event lifecycle is completely automated. Eliminate repetitive manual tasks and deliver seamless institutional experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] hover:bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-[#061A2F] text-[#0755E9] group-hover:text-[#20DCC2] flex items-center justify-center mb-5 border border-slate-200/80 shadow-xs transition-colors">
                      <IconComp className="w-6 h-6 transition-colors" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 group-hover:text-[#0755E9] transition-colors">
                      {feat.tag}
                    </span>
                    <h3 className="text-lg font-bold text-[#061A2F] mt-1 mb-2 leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-[#0755E9] group-hover:translate-x-1 transition-transform">
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#20DCC2] bg-[#061A2F] px-3.5 py-1 rounded-full shadow-xs">
              Simple 4-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#061A2F] mt-3 mb-4 tracking-tight">
              From Planning to Certified Delivery in Minutes
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              See how organizers orchestrate campus symposiums and corporate workshops with zero spreadsheet reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-3xl font-extrabold text-[#0755E9]/80">
                      {s.step}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {s.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#061A2F] mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Fully Automated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCT SHOWCASE SECTION */}
      <section id="showcase" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0755E9] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Interactive Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#061A2F] mt-3 mb-4 tracking-tight">
              Experience the Eventora Operating System
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Toggle between views to see how the system operates in production for organizers, scanners, and credential studios.
            </p>

            {/* Interactive Tab Controls */}
            <div className="inline-flex p-1.5 bg-slate-100 rounded-xl mt-8 border border-slate-200/80">
              <button
                onClick={() => setActiveShowcaseTab('organizer')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeShowcaseTab === 'organizer'
                    ? 'bg-white text-[#061A2F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organizer Console
              </button>
              <button
                onClick={() => setActiveShowcaseTab('scanner')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeShowcaseTab === 'scanner'
                    ? 'bg-white text-[#061A2F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live QR Scanner
              </button>
              <button
                onClick={() => setActiveShowcaseTab('certificate')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeShowcaseTab === 'certificate'
                    ? 'bg-white text-[#061A2F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Credential Studio
              </button>
            </div>
          </div>

          {/* Showcase Display Area */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 p-6 sm:p-8 max-w-5xl mx-auto shadow-sm">
            {activeShowcaseTab === 'organizer' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#061A2F]">
                      Event Director Overview: Dr. AIT Hackathon 2026
                    </h3>
                    <p className="text-xs text-slate-500">
                      SJB Seminar Hall & Cloud Labs • Level 1 • Live Attendance Velocity: 14 scans/min
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Live Session Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Checked-in Attendees</span>
                    <p className="text-2xl font-bold text-[#061A2F] mt-1">331 / 342</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                      <div className="bg-emerald-500 h-full rounded-full w-[96.8%]"></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Department Spread</span>
                    <p className="text-2xl font-bold text-[#061A2F] mt-1">CSE, ISE, ECE</p>
                    <span className="text-[11px] text-slate-500">Top: CSE (48%)</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Event Success Score</span>
                    <p className="text-2xl font-bold text-[#0755E9] mt-1">94.8 / 100</p>
                    <span className="text-[11px] text-emerald-600 font-medium">High Engagement</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
                    Recent Verified Check-Ins
                  </span>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-slate-900">Alexander Wright</span>
                        <span className="text-slate-400 font-mono">(1DA22CS042)</span>
                      </div>
                      <span className="text-slate-500">Checked in at 09:14 AM • Turnstile A</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-slate-900">Priya Sharma</span>
                        <span className="text-slate-400 font-mono">(1DA22IS019)</span>
                      </div>
                      <span className="text-slate-500">Checked in at 09:12 AM • Turnstile B</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'scanner' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#061A2F]">
                      Organizer Anti-Fraud Dynamic Scanner
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cryptographic token verification mode • Average validation latency: 180ms
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#0755E9]">
                    Camera Stream Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center">
                    <div className="w-36 h-36 rounded-2xl bg-[#061A2F] text-white flex flex-col items-center justify-center p-3 relative shadow-inner">
                      <QrCode className="w-16 h-16 text-[#20DCC2] mb-1 animate-pulse" />
                      <span className="text-[10px] font-mono text-slate-300">SCANNING ACTIVE</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-4 font-medium">
                      Point camera at student dynamic pass
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ Anti-Proxy Timestamp Validated
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                        Last Verified Attendee
                      </span>
                      <p className="text-base font-bold text-emerald-950 mt-1">
                        Alexander Wright
                      </p>
                      <p className="text-xs text-emerald-700 font-mono">
                        USN: 1DA22CS042 • CSE Dept
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Status: Eligible for Instant Certificate
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                      <div className="flex justify-between">
                        <span>Total Scanned Today:</span>
                        <span className="font-bold text-slate-900">331</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rejections / Invalid:</span>
                        <span className="font-bold text-red-600">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offline Buffer Capacity:</span>
                        <span className="font-bold text-slate-900">10,000 passes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'certificate' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#061A2F]">
                      Cryptographic Credential Studio
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verifiable PDF generation with public verification endpoints
                    </p>
                  </div>
                  <Link
                    to="/verify/CERT-894201-ET25"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0755E9] text-white hover:bg-[#0546C4] flex items-center gap-1.5"
                  >
                    <span>Test Public Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Certificate Mockup Frame */}
                <div className="bg-white p-6 sm:p-8 rounded-xl border-2 border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="border border-slate-200 p-6 rounded-lg text-center bg-radial from-white to-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-[#061A2F] text-[#20DCC2] mx-auto flex items-center justify-center mb-3">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                      Dr. Ambedkar Institute of Technology
                    </span>
                    <h4 className="text-xl font-bold text-[#061A2F] mt-1 mb-2">
                      Certificate of Excellence & Completion
                    </h4>
                    <p className="text-xs text-slate-500">
                      This certifies that <strong className="text-slate-900">Alexander Wright (1DA22CS042)</strong> has successfully attended and completed the
                    </p>
                    <p className="text-sm font-bold text-[#0755E9] my-1">
                      AI & Autonomous Agents Hackathon 2026
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                      <span>Verification ID: <strong className="font-mono text-slate-800">CERT-894201-ET25</strong></span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Cryptographically Sealed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. SOLUTIONS SECTION */}
      <section id="solutions" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0755E9] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Built for Every Stakeholder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#061A2F] mt-3 mb-4 tracking-tight">
              Tailored Solutions for Your Entire Ecosystem
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Whether you are an attendee checking in or a department dean auditing accreditations, Eventora provides purpose-built workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol, idx) => {
              const IconComponent = sol.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#0755E9] flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {sol.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#061A2F] mb-1">
                      {sol.role}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-5">
                      {sol.headline}
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {sol.benefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0755E9] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. TRUST AND IMPACT SECTION (Verified Project Metrics Only) */}
      <section id="metrics" className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Verified Technical Benchmarks
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#061A2F] mt-3 mb-4 tracking-tight">
              Engineered with Cryptographic Rigor
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Our core infrastructure guarantees zero proxy fraud, instant credential auditability, and absolute multi-tenant role isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verifiedMetrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] p-7 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#061A2F] mb-2 tracking-tight">
                    {m.stat}
                  </div>
                  <h3 className="text-base font-bold text-[#061A2F] mb-2">
                    {m.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.detail}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-center text-xs text-emerald-600 font-semibold gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified System Capability</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dr. AIT Campus Endorsement Note */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#061A2F] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-[#20DCC2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#061A2F]">
                  Integrated with Dr. Ambedkar Institute of Technology Campus
                </h4>
                <p className="text-xs text-slate-500">
                  Configured with authentic venue maps: SJB Seminar Hall, Centenary Bhavan, and Academic Blocks.
                </p>
              </div>
            </div>
            <Link
              to="/login?portal=student"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 shrink-0 transition-colors"
            >
              Explore Dr. AIT Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="py-20 sm:py-28 bg-[#061A2F] text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0755E9]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#20DCC2] text-xs font-semibold mb-6 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Next Semester & Beyond</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Ready to Make Every Event Effortless?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Join Dr. AIT students, organizers, and faculty leaders automating registrations, dynamic QR check-ins, and cryptographic certificates in one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={currentUser?.role === 'admin' ? '/admin' : '/student'}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0755E9] hover:bg-[#0546C4] text-white font-semibold text-base transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span className="w-2 h-2 rounded-full bg-[#20DCC2] animate-pulse"></span>
                <span>Open {currentUser?.role === 'admin' ? 'Organizer Console' : 'Student Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0755E9] hover:bg-[#0546C4] text-white font-semibold text-base transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-all border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2"
                >
                  <span>Sign In to Existing Account</span>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer id="contact" className="bg-[#040F1D] text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0755E9] flex items-center justify-center text-white">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Eventora
                </span>
              </Link>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Automate Every Event. The comprehensive enterprise event management automation platform built for campus symposiums, hackathons, and corporate conferences.
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                Dr. Ambedkar Institute of Technology Campus Edition • Bengaluru
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Platform
              </h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#showcase" className="hover:text-white transition-colors">Product Showcase</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#metrics" className="hover:text-white transition-colors">Trust & Impact</a></li>
              </ul>
            </div>

            {/* Portals & Direct Links */}
            <div>
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Role Portals
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login?portal=student" className="hover:text-white transition-colors">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login?portal=admin" className="hover:text-white transition-colors">
                    Faculty & Admin Console
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/verify/CERT-894201-ET25" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>Public Verification</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Support & Contact
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:events@drait.edu.in" className="hover:text-white transition-colors">
                    events@drait.edu.in
                  </a>
                </li>
                <li>
                  <span className="text-slate-400">Dr. AIT Technical Cell</span>
                </li>
                <li>
                  <span className="text-slate-400">Bengaluru - 560056</span>
                </li>
                <li>
                  <span className="text-slate-500">System Status: Active</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 Eventora. All rights reserved. End-to-End Event Management Automation System.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer">Security Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
