export const INITIAL_EVENT = {
  id: "evt-global-ai-2026",
  name: "Global Tech & AI Automation Summit 2026",
  shortName: "GTAIS 2026",
  tagline: "Connecting 5,000+ Innovators, Engineers & Industry Leaders",
  date: "October 24-26, 2026",
  isoDate: "2026-10-24",
  venue: "Metropolitan Convention Center, Silicon Harbor & Virtual Live",
  city: "San Francisco, CA",
  organizer: "FutureTech Global Council",
  organizerEmail: "support@autoeventhub.io",
  requireFeedbackForCertificate: true,
  capacity: 2500,
  tracks: [
    { id: "ai", name: "AI & Autonomous Agents", color: "from-blue-500 to-indigo-600" },
    { id: "cloud", name: "Cloud Native & DevOps", color: "from-emerald-500 to-teal-600" },
    { id: "security", name: "Zero-Trust Cybersecurity", color: "from-rose-500 to-amber-600" },
    { id: "executive", name: "Executive Leadership & Strategy", color: "from-purple-500 to-pink-600" }
  ],
  ticketTiers: [
    { id: "general", name: "General Attendee", price: "$0 (Standard Access)", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    { id: "vip", name: "VIP All-Access", price: "$299", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    { id: "speaker", name: "Distinguished Speaker", price: "Complimentary", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    { id: "student", name: "Student / Scholar", price: "Scholarship", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    { id: "sponsor", name: "Corporate Sponsor", price: "Enterprise", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" }
  ]
};

export const INITIAL_SESSIONS = [
  {
    id: "S-101",
    title: "Keynote: The Era of Agentic Event & Enterprise Automation",
    speaker: "Dr. Elena Rostova, Chief AI Architect",
    time: "Day 1, 09:00 AM - 10:30 AM",
    room: "Grand Auditorium Alpha",
    capacity: 1200,
    track: "ai",
    checkedInCount: 142
  },
  {
    id: "S-102",
    title: "Deep Dive Workshop: Zero-Code Event Workflows & Instant QR Issuance",
    speaker: "Marcus Sterling, Head of Automation",
    time: "Day 1, 11:00 AM - 12:45 PM",
    room: "Hands-on Lab 304",
    capacity: 150,
    track: "cloud",
    checkedInCount: 48
  },
  {
    id: "S-103",
    title: "Panel: Scaling Resilient Multi-Region Cloud Infrastructure",
    speaker: "Sarah Jenkins & Industry Guests",
    time: "Day 1, 02:00 PM - 03:30 PM",
    room: "Hall B (West Wing)",
    capacity: 450,
    track: "cloud",
    checkedInCount: 89
  },
  {
    id: "S-104",
    title: "Executive VIP Roundtable & Dinner Reception",
    speaker: "Keynote Guests & Enterprise Partners",
    time: "Day 1, 06:30 PM - 09:30 PM",
    room: "Skyline Terrace & Lounge",
    capacity: 100,
    track: "executive",
    checkedInCount: 35
  }
];

export const INITIAL_ATTENDEES = [
  {
    id: "EVT-80921",
    name: "Alex Morgan",
    email: "alex.morgan@techcorp.io",
    phone: "+1 (555) 234-5678",
    organization: "TechCorp Global",
    jobTitle: "Lead Systems Architect",
    tier: "vip",
    track: "ai",
    registeredAt: "2026-09-18T10:14:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T08:45:12Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T08:45:12Z" }
    ],
    qrToken: "EVT-80921-VIP-VERIFIED-SECURE-99X",
    feedbackSubmitted: true,
    feedback: {
      rating: 5,
      organizationRating: 5,
      speakerRating: 5,
      venueRating: 5,
      contentRating: 5,
      npsScore: 10,
      comments: "Exceptional registration speed! Scanned my QR code in literally 1 second at the gate.",
      submittedAt: "2026-09-20T12:30:00Z"
    },
    certificateGenerated: true,
    certificateId: "CERT-GTAIS-80921",
    certificateHash: "a9f8b2c174e30018d9f"
  },
  {
    id: "EVT-80922",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@ai-research.org",
    phone: "+1 (555) 345-6789",
    organization: "Institute of Autonomous AI",
    jobTitle: "Chief AI Architect",
    tier: "speaker",
    track: "ai",
    registeredAt: "2026-09-15T09:00:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T08:15:00Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T08:15:00Z" }
    ],
    qrToken: "EVT-80922-SPEAKER-VERIFIED-SECURE-12K",
    feedbackSubmitted: true,
    feedback: {
      rating: 5,
      organizationRating: 5,
      speakerRating: 5,
      venueRating: 5,
      contentRating: 5,
      npsScore: 10,
      comments: "Fabulous audio-visual setup and flawless session attendance management.",
      submittedAt: "2026-09-20T11:00:00Z"
    },
    certificateGenerated: true,
    certificateId: "CERT-GTAIS-80922",
    certificateHash: "f4e198bba23719c8321"
  },
  {
    id: "EVT-80923",
    name: "Devon Vance",
    email: "devon.vance@cloudscale.net",
    phone: "+1 (555) 456-7890",
    organization: "CloudScale Systems",
    jobTitle: "DevOps Engineer",
    tier: "general",
    track: "cloud",
    registeredAt: "2026-09-19T14:20:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T09:02:45Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T09:02:45Z" }
    ],
    qrToken: "EVT-80923-GEN-VERIFIED-SECURE-44B",
    feedbackSubmitted: false,
    certificateGenerated: false,
    certificateId: null,
    certificateHash: null
  },
  {
    id: "EVT-80924",
    name: "Priya Sharma",
    email: "priya.sharma@stanford.edu",
    phone: "+1 (555) 567-8901",
    organization: "Stanford Robotics Lab",
    jobTitle: "Graduate Researcher",
    tier: "student",
    track: "ai",
    registeredAt: "2026-09-17T11:05:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T08:50:33Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T08:50:33Z" },
      { sessionId: "S-102", sessionTitle: "Deep Dive Workshop: Zero-Code Event Workflows", timestamp: "2026-09-20T11:02:10Z" }
    ],
    qrToken: "EVT-80924-STU-VERIFIED-SECURE-77Z",
    feedbackSubmitted: true,
    feedback: {
      rating: 4,
      organizationRating: 5,
      speakerRating: 5,
      venueRating: 4,
      contentRating: 5,
      npsScore: 9,
      comments: "Loved the hands-on lab. The automated feedback notification reached my inbox right after the session!",
      submittedAt: "2026-09-20T13:10:00Z"
    },
    certificateGenerated: true,
    certificateId: "CERT-GTAIS-80924",
    certificateHash: "c381d9f829031ba54ef"
  },
  {
    id: "EVT-80925",
    name: "Marcus Sterling",
    email: "marcus.sterling@apexpartners.com",
    phone: "+1 (555) 678-9012",
    organization: "Apex Enterprise Partners",
    jobTitle: "Partner & VP Engineering",
    tier: "sponsor",
    track: "executive",
    registeredAt: "2026-09-16T16:45:00Z",
    verified: true,
    checkedIn: false,
    checkedInAt: null,
    checkedInSession: null,
    checkInHistory: [],
    qrToken: "EVT-80925-SPO-VERIFIED-SECURE-33R",
    feedbackSubmitted: false,
    certificateGenerated: false,
    certificateId: null,
    certificateHash: null
  },
  {
    id: "EVT-80926",
    name: "Chloe Zhao",
    email: "chloe.zhao@cyberfortress.io",
    phone: "+1 (555) 789-0123",
    organization: "CyberFortress Security",
    jobTitle: "Senior Security Analyst",
    tier: "general",
    track: "security",
    registeredAt: "2026-09-19T08:12:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T09:15:20Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T09:15:20Z" }
    ],
    qrToken: "EVT-80926-GEN-VERIFIED-SECURE-88H",
    feedbackSubmitted: false,
    certificateGenerated: false,
    certificateId: null,
    certificateHash: null
  },
  {
    id: "EVT-80927",
    name: "Liam O'Connor",
    email: "liam.oconnor@dublincapital.ie",
    phone: "+353 (1) 234-5678",
    organization: "Horizon Ventures",
    jobTitle: "Managing Director",
    tier: "vip",
    track: "executive",
    registeredAt: "2026-09-18T15:30:00Z",
    verified: true,
    checkedIn: false,
    checkedInAt: null,
    checkedInSession: null,
    checkInHistory: [],
    qrToken: "EVT-80927-VIP-VERIFIED-SECURE-55Q",
    feedbackSubmitted: false,
    certificateGenerated: false,
    certificateId: null,
    certificateHash: null
  },
  {
    id: "EVT-80928",
    name: "Samantha Reed",
    email: "samantha.reed@quantum-labs.com",
    phone: "+1 (555) 890-1234",
    organization: "Quantum Research Labs",
    jobTitle: "Staff Software Engineer",
    tier: "general",
    track: "ai",
    registeredAt: "2026-09-20T07:10:00Z",
    verified: true,
    checkedIn: true,
    checkedInAt: "2026-09-20T08:35:40Z",
    checkedInSession: "S-101",
    checkInHistory: [
      { sessionId: "S-101", sessionTitle: "Keynote: The Era of Agentic Event Automation", timestamp: "2026-09-20T08:35:40Z" }
    ],
    qrToken: "EVT-80928-GEN-VERIFIED-SECURE-21M",
    feedbackSubmitted: true,
    feedback: {
      rating: 5,
      organizationRating: 5,
      speakerRating: 5,
      venueRating: 4,
      contentRating: 5,
      npsScore: 10,
      comments: "Best organized tech summit of 2026. Zero lines at check-in!",
      submittedAt: "2026-09-20T13:45:00Z"
    },
    certificateGenerated: true,
    certificateId: "CERT-GTAIS-80928",
    certificateHash: "8b7e21a0f931d8e56ca"
  }
];

export const INITIAL_COMMUNICATIONS = [
  {
    id: "COM-001",
    trigger: "ON_REGISTRATION",
    recipientName: "Alex Morgan",
    recipientEmail: "alex.morgan@techcorp.io",
    subject: "Confirmed: Your Digital Pass & QR Code for GTAIS 2026",
    status: "Delivered",
    timestamp: "2026-09-18T10:14:05Z",
    channel: "Email + SMS",
    preview: "Hi Alex, your registration for Global Tech & AI Automation Summit 2026 is confirmed! Access your QR badge inside."
  },
  {
    id: "COM-002",
    trigger: "ON_CHECKIN",
    recipientName: "Alex Morgan",
    recipientEmail: "alex.morgan@techcorp.io",
    subject: "Welcome to GTAIS 2026! Wi-Fi & Live Floorplan Inside",
    status: "Delivered",
    timestamp: "2026-09-20T08:45:15Z",
    channel: "In-App Push / SMS",
    preview: "Welcome Alex! You're checked in at Grand Auditorium. High-speed Wi-Fi: SummitGuest2026 (Pass: innovate26)."
  },
  {
    id: "COM-003",
    trigger: "ON_FEEDBACK_SUBMITTED",
    recipientName: "Alex Morgan",
    recipientEmail: "alex.morgan@techcorp.io",
    subject: "Your Official Certificate of Attendance is Ready",
    status: "Delivered",
    timestamp: "2026-09-20T12:30:05Z",
    channel: "Email",
    preview: "Thank you for your feedback! Your verifiable credential CERT-GTAIS-80921 is now unlocked for download."
  },
  {
    id: "COM-004",
    trigger: "ON_CHECKIN",
    recipientName: "Priya Sharma",
    recipientEmail: "priya.sharma@stanford.edu",
    subject: "Welcome to GTAIS 2026! Wi-Fi & Live Floorplan Inside",
    status: "Delivered",
    timestamp: "2026-09-20T08:50:35Z",
    channel: "In-App Push",
    preview: "Welcome Priya! You're checked in at Grand Auditorium. Enjoy the Summit!"
  },
  {
    id: "COM-005",
    trigger: "PRE_EVENT_REMINDER",
    recipientName: "Broadcast (All Verified)",
    recipientEmail: "8 Recipients",
    subject: "Tomorrow: GTAIS 2026 Kickoff & Express QR Check-In Guide",
    status: "Delivered",
    timestamp: "2026-09-19T09:00:00Z",
    channel: "Email Broadcast",
    preview: "Get ready for tomorrow's keynote! Save your digital pass to your Apple/Google Wallet for 2-second entry."
  }
];

export const CERTIFICATE_TEMPLATES = [
  {
    id: "tech-gradient",
    name: "Cyber Modern Gradient",
    theme: "Dark Indigo / Cyan Neon",
    borderClass: "border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950",
    accentColor: "#6366f1",
    sealColor: "#38bdf8",
    fontFamily: "font-sans"
  },
  {
    id: "academic-classic",
    name: "Classical Academic Prestige",
    theme: "Gold Crest & Royal Cream",
    borderClass: "border-amber-600/50 bg-gradient-to-b from-stone-900 via-neutral-900 to-amber-950/40",
    accentColor: "#f59e0b",
    sealColor: "#eab308",
    fontFamily: "font-serif"
  },
  {
    id: "corporate-minimal",
    name: "Executive Minimalist",
    theme: "Monochrome Platinum & Sapphire",
    borderClass: "border-slate-400/40 bg-slate-900",
    accentColor: "#0284c7",
    sealColor: "#0ea5e9",
    fontFamily: "font-sans"
  }
];
