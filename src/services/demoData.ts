// ========================================================
// EVENTORA HIGH-FIDELITY SEEDED DATASET (demoData.ts)
// Strict fulfillment:
// - 10 Students
// - 2 Admins
// - 8 Events
// - 52 Registrations (>= 50 required)
// - 44 Attendance records (>= 40 required)
// - 22 Certificates (>= 20 required)
// - 32 Feedback reviews (>= 30 required)
// - 22 Notifications (>= 20 required)
// - 8 Campus Venues (>= 8 required)
// ========================================================

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: 'student';
  usn: string;
  department: string;
  semester: string;
  phone: string;
  avatar: string;
  badge: string;
  interests: string[];
  attendanceRate: number;
  attendedCount: number;
  registeredCount: number;
  certificatesCount: number;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  organization: string;
  title: string;
  phone: string;
  avatar: string;
}

export interface Venue {
  id: string;
  name: string;
  building: string;
  floor: string;
  room?: string;
  capacity: number;
  lat: number;
  lng: number;
  currentEvent?: string;
  occupancy: number;
  occupancyPercent: number;
  status: 'Live' | 'Upcoming' | 'Scheduled' | 'Available';
  temperature: string;
  speaker?: string;
}

export interface AgendaItem {
  time: string;
  title: string;
}

export interface EventFeatures {
  enableQR: boolean;
  enableCertificate: boolean;
  enableFeedback: boolean;
  enableNotifications: boolean;
  enableAICopilot: boolean;
}

export interface EventoraEvent {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Workshop' | 'Hackathon' | 'Bootcamp' | 'Seminar' | 'Sports' | 'Cultural';
  date: string;
  displayDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  building: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  attendanceCount: number;
  status: 'Published' | 'Draft' | 'Ongoing' | 'Completed' | 'Cancelled';
  isLive: boolean;
  price: string;
  department: string;
  image: string;
  speakers: string[];
  agenda: AgendaItem[];
  features: EventFeatures;
  successScore: number;
  matchReason?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  status: 'Present' | 'Late' | 'Absent';
  method: 'Dynamic QR' | 'Manual Entry' | 'NFC Pass' | 'Web Scanner';
}

export interface AntiFraudLog {
  id: string;
  student: string;
  usn: string;
  timestamp: string;
  result: 'Valid' | 'Rejected' | 'Duplicate' | 'Fraud Attempt';
  reason: string;
  ip: string;
  device?: string;
}

export interface CertificateRecord {
  id: string;
  certificateId: string;
  eventId: string;
  eventName: string;
  recipientName: string;
  recipientEmail: string;
  recipientId?: string;
  studentId?: string;
  usn: string;
  issueDate: string;
  issuer: string;
  issuerTitle: string;
  coIssuer: string;
  coIssuerTitle: string;
  status: 'Verified' | 'Revoked';
  description: string;
  qrVerificationUrl: string;
  downloadUrl?: string;
  certificateType?: string;
  awardTitle?: string;
  rank?: number;
  teamName?: string;
  resultId?: string;
}

export interface FeedbackRecord {
  id: string;
  eventId: string;
  eventName: string;
  studentName: string;
  studentAvatar: string;
  studentId?: string;
  overallRating: number;
  organizationRating: number;
  speakerRating: number;
  venueRating: number;
  contentRating: number;
  comment: string;
  createdAt: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'registration' | 'event' | 'certificate' | 'recommendation' | 'alert' | 'system';
  isRead: boolean;
  createdAt: string;
}

// ========================================================
// 10 STUDENTS
// ========================================================
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: "usr_alex_01",
    name: "Alexander Wright",
    email: "student@eventora.demo",
    role: "student",
    usn: "1MS22CS042",
    department: "Computer Science",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    badge: "Active Scholar",
    interests: ["Artificial Intelligence", "Web3", "Cloud Computing", "Hackathons"],
    attendanceRate: 94.0,
    attendedCount: 24,
    registeredCount: 6,
    certificatesCount: 6,
  },
  {
    id: "usr_sarah_02",
    name: "Sarah Jenkins",
    email: "sarah.j@eventora.demo",
    role: "student",
    usn: "1MS22IS019",
    department: "Information Science",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    badge: "Honor Attendee",
    interests: ["UI/UX Design", "Product Management", "Cybersecurity"],
    attendanceRate: 96.5,
    attendedCount: 28,
    registeredCount: 6,
    certificatesCount: 9,
  },
  {
    id: "usr_marcus_03",
    name: "Marcus Brody",
    email: "marcus.b@eventora.demo",
    role: "student",
    usn: "1MS22EC088",
    department: "Electronics & Comm.",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 456-7890",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    badge: "Tech Enthusiast",
    interests: ["IoT", "Robotics", "Embedded Systems"],
    attendanceRate: 88.0,
    attendedCount: 19,
    registeredCount: 5,
    certificatesCount: 5,
  },
  {
    id: "usr_priya_04",
    name: "Priya Sharma",
    email: "priya.s@eventora.demo",
    role: "student",
    usn: "1MS22CS112",
    department: "Computer Science",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 567-8901",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    badge: "AI Innovator",
    interests: ["Deep Learning", "NLP", "Machine Learning"],
    attendanceRate: 97.2,
    attendedCount: 31,
    registeredCount: 7,
    certificatesCount: 11,
  },
  {
    id: "usr_david_05",
    name: "David Chen",
    email: "david.c@eventora.demo",
    role: "student",
    usn: "1MS22ME034",
    department: "Mechanical Eng.",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 678-9012",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    badge: "Design Lead",
    interests: ["3D Printing", "CAD", "Automation"],
    attendanceRate: 91.0,
    attendedCount: 22,
    registeredCount: 4,
    certificatesCount: 7,
  },
  {
    id: "usr_elena_06",
    name: "Elena Rostova",
    email: "elena.r@eventora.demo",
    role: "student",
    usn: "1MS22AI015",
    department: "Artificial Intelligence",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 789-0123",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    badge: "Data Scientist",
    interests: ["Computer Vision", "Autonomous Systems"],
    attendanceRate: 95.0,
    attendedCount: 26,
    registeredCount: 5,
    certificatesCount: 8,
  },
  {
    id: "usr_rohit_07",
    name: "Rohit Verma",
    email: "rohit.v@eventora.demo",
    role: "student",
    usn: "1MS22CS075",
    department: "Computer Science",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 890-1234",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    badge: "Open Source Contributor",
    interests: ["Fullstack Dev", "DevOps", "Kubernetes"],
    attendanceRate: 92.5,
    attendedCount: 20,
    registeredCount: 5,
    certificatesCount: 6,
  },
  {
    id: "usr_ananya_08",
    name: "Ananya Iyer",
    email: "ananya.i@eventora.demo",
    role: "student",
    usn: "1MS22BT022",
    department: "Biotechnology",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 901-2345",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    badge: "Bioinformatics Scholar",
    interests: ["Bioinformatics", "Genomics", "HealthTech"],
    attendanceRate: 89.0,
    attendedCount: 18,
    registeredCount: 4,
    certificatesCount: 4,
  },
  {
    id: "usr_jason_09",
    name: "Jason Miller",
    email: "jason.m@eventora.demo",
    role: "student",
    usn: "1MS22IS055",
    department: "Information Science",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 012-3456",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400",
    badge: "Cyber Defender",
    interests: ["Ethical Hacking", "Cryptography", "Network Security"],
    attendanceRate: 93.8,
    attendedCount: 25,
    registeredCount: 5,
    certificatesCount: 8,
  },
  {
    id: "usr_tanya_10",
    name: "Tanya Sen",
    email: "tanya.s@eventora.demo",
    role: "student",
    usn: "1MS22EC041",
    department: "Electronics & Comm.",
    semester: "Fall Semester 2024",
    phone: "+1 (555) 123-4560",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    badge: "Event Ambassador",
    interests: ["Public Speaking", "Cultural Events", "Leadership"],
    attendanceRate: 98.0,
    attendedCount: 35,
    registeredCount: 6,
    certificatesCount: 14,
  }
];

// ========================================================
// 2 ADMINS
// ========================================================
export const INITIAL_ADMINS: AdminProfile[] = [
  {
    id: "usr_admin_01",
    name: "Dr. Eleanor Vance",
    email: "admin@eventora.demo",
    role: "admin",
    organization: "Eventora Global University",
    title: "Chief Academic Officer & Event Director",
    phone: "+1 (555) 999-8888",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "usr_admin_02",
    name: "Marcus Sterling",
    email: "director@eventora.demo",
    role: "admin",
    organization: "Eventora Global University",
    title: "Director of Student Activities & Campus Operations",
    phone: "+1 (555) 888-7777",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
  }
];

export const INITIAL_ADMIN = INITIAL_ADMINS[0];

// ========================================================
// 10 DR. AMBEDKAR INSTITUTE OF TECHNOLOGY (DR. AIT) VENUES
// ========================================================
export const INITIAL_VENUES: Venue[] = [
  {
    id: "ven_jpn_auditorium",
    name: "JPN Auditorium",
    building: "JPN Auditorium Complex",
    floor: "Ground Floor",
    room: "Auditorium Main Hall",
    capacity: 750,
    lat: 12.9644,
    lng: 77.5064,
    currentEvent: "Sanskriti 2026 - Dr. AIT Annual Fest",
    occupancy: 685,
    occupancyPercent: 91.3,
    status: "Live",
    temperature: "21.5°C",
    speaker: "Dr. B.R. Ambedkar Commemorative Keynote"
  },
  {
    id: "ven_centenary_library",
    name: "Dr. Ambedkar Centenary Bhavan (Library)",
    building: "Centenary Bhavan",
    floor: "Ground Floor",
    room: "Central Library & Information Centre",
    capacity: 450,
    lat: 12.9640,
    lng: 77.5068,
    currentEvent: "National Research Symposium & Book Exhibition",
    occupancy: 290,
    occupancyPercent: 64.4,
    status: "Live",
    temperature: "22.0°C",
    speaker: "Chief University Librarian"
  },
  {
    id: "ven_sjb_lab",
    name: "Advanced AI & Cloud Lab",
    building: "Silver Jubilee Building (SJB)",
    floor: "Level 1",
    room: "CSE Dept. Workstation Pods 101",
    capacity: 120,
    lat: 12.9648,
    lng: 77.5072,
    currentEvent: "AI & Autonomous Agents Hackathon",
    occupancy: 104,
    occupancyPercent: 86.6,
    status: "Live",
    temperature: "20.8°C",
    speaker: "Dr. HOD Computer Science"
  },
  {
    id: "ven_sjb_pg",
    name: "ACTS Incubation & AICTE IDEA Lab",
    building: "Silver Jubilee Building (SJB)",
    floor: "Level 2",
    room: "Startup Cell & Prototyping Bay 201",
    capacity: 120,
    lat: 12.9649,
    lng: 77.5073,
    currentEvent: "Ambedkar Centre for Tech Startup (ACTS) Pitch",
    occupancy: 88,
    occupancyPercent: 73.3,
    status: "Live",
    temperature: "21.0°C",
    speaker: "Head of Incubation & Innovation"
  },
  {
    id: "ven_d_block_ece",
    name: "VLSI & Embedded Systems Lab",
    building: "D Block (ECE & EEE)",
    floor: "Level 1",
    room: "Electronics Lab 204",
    capacity: 150,
    lat: 12.9652,
    lng: 77.5060,
    currentEvent: "IoT Sensors & Robotics Prototyping",
    occupancy: 110,
    occupancyPercent: 73.3,
    status: "Upcoming",
    temperature: "21.0°C",
    speaker: "Prof. ECE Dept."
  },
  {
    id: "ven_admin_syndicate",
    name: "Syndicate Hall & Boardroom",
    building: "Main Administrative Block",
    floor: "Level 2",
    room: "Principal's Boardroom 301",
    capacity: 100,
    lat: 12.9643,
    lng: 77.5058,
    currentEvent: "Governing Council Academic Senate",
    occupancy: 78,
    occupancyPercent: 78.0,
    status: "Upcoming",
    temperature: "21.2°C",
    speaker: "Principal, Dr. AIT"
  },
  {
    id: "ven_c_block_mech",
    name: "Robotics & CAD/CAM Simulation Center",
    building: "C Block (Mech & Civil)",
    floor: "Level 1",
    room: "Mechanical Innovation Bay",
    capacity: 110,
    lat: 12.9638,
    lng: 77.5054,
    currentEvent: "Additive Manufacturing & 3D Prototyping",
    occupancy: 85,
    occupancyPercent: 77.2,
    status: "Available",
    temperature: "22.5°C",
    speaker: "Prof. Mechanical Engineering"
  },
  {
    id: "ven_b_block_ml",
    name: "Biomedical Instrumentation Lab",
    building: "B Block (Medical Electronics)",
    floor: "Level 2",
    room: "Clinical Signal Processing Suite",
    capacity: 80,
    lat: 12.9646,
    lng: 77.5052,
    currentEvent: "Clinical Bio-Telemetry Workshop",
    occupancy: 55,
    occupancyPercent: 68.7,
    status: "Available",
    temperature: "21.8°C",
    speaker: "Prof. Medical Electronics"
  },
  {
    id: "ven_sports_complex",
    name: "Indoor Sports Complex & Gymnasium",
    building: "Sports & Amenities Complex",
    floor: "Ground Floor",
    room: "Badminton Court & Fitness Arena",
    capacity: 800,
    lat: 12.9632,
    lng: 77.5062,
    currentEvent: "VTU Inter-Collegiate Badminton Circuit",
    occupancy: 520,
    occupancyPercent: 65.0,
    status: "Scheduled",
    temperature: "23.5°C",
    speaker: "Sports Director, Dr. AIT"
  },
  {
    id: "ven_main_playground",
    name: "Dr. AIT Central Sports Ground",
    building: "Sports & Amenities Complex",
    floor: "Ground Floor",
    room: "Cricket & Track Field",
    capacity: 2500,
    lat: 12.9628,
    lng: 77.5070,
    currentEvent: "Annual Athletic Meet 2026",
    occupancy: 1800,
    occupancyPercent: 72.0,
    status: "Scheduled",
    temperature: "25.0°C",
    speaker: "Physical Education Director"
  },
  {
    id: "ven_canteen",
    name: "Dr. AIT Central Cafeteria & Food Court",
    building: "Sports & Amenities Complex",
    floor: "Ground Floor",
    room: "Student Dining Commons & Nescafe Hub",
    capacity: 350,
    lat: 12.9636,
    lng: 77.5065,
    currentEvent: "Student Dining & Commons",
    occupancy: 240,
    occupancyPercent: 68.5,
    status: "Available",
    temperature: "23.0°C",
    speaker: "Student Welfare Committee"
  }
];

// ========================================================
// 8 CORE EVENTS
// ========================================================
export const INITIAL_EVENTS: EventoraEvent[] = [
  {
    id: "evt_tech_fest_01",
    title: "Annual Tech Fest 2026",
    description: "The university's flagship technical symposium showcasing student innovations, keynote lectures from industry titans, paper presentations, and robotic exhibits.",
    category: "Technical",
    date: "2026-10-15",
    displayDate: "Oct 15, 2026",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Auditorium A",
    building: "Tech Center",
    organizer: "Dept. of Computer Science & Engineering",
    capacity: 500,
    registeredCount: 462,
    attendanceCount: 428,
    status: "Published",
    isLive: true,
    price: "Free",
    department: "Computer Science",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Dr. Eleanor Vance (Chief Academic Officer)", "Sundar Raman (VP Engineering, Vertex Cloud)"],
    agenda: [
      { time: "09:00 AM", title: "Inauguration & Keynote Address" },
      { time: "11:00 AM", title: "AI Innovation Project Exhibition" },
      { time: "01:30 PM", title: "Networking Lunch" },
      { time: "02:30 PM", title: "Paper Presentations & Code Sprint" },
      { time: "04:30 PM", title: "Awards & Closing Ceremony" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 94.8,
    matchReason: "Based on your major in Computer Science and attendance in past AI symposiums."
  },
  {
    id: "evt_ai_workshop_02",
    title: "AI & ML Workshop: LLMs in Production",
    description: "Deep dive into designing, fine-tuning, and deploying enterprise Large Language Models and multi-agent workflows with real-time vector embeddings.",
    category: "Workshop",
    date: "2026-10-18",
    displayDate: "Oct 18, 2026",
    startTime: "10:00 AM",
    endTime: "03:30 PM",
    venue: "Lab 4B",
    building: "Innovation Hub",
    organizer: "AI & Robotics Club",
    capacity: 100,
    registeredCount: 96,
    attendanceCount: 88,
    status: "Published",
    isLive: false,
    price: "₹299",
    department: "Artificial Intelligence",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Marcus Brody (AI Research Fellow)", "Priya Sharma (Deep Learning Engineer)"],
    agenda: [
      { time: "10:00 AM", title: "Transformer Architectures from Scratch" },
      { time: "11:45 AM", title: "Hands-on RAG Pipeline Setup" },
      { time: "01:00 PM", title: "Lunch Break" },
      { time: "01:45 PM", title: "Fine-Tuning & Quantization Labs" },
      { time: "03:00 PM", title: "Q&A & Certificate Verification" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 92.4,
    matchReason: "Direct match for your interest tags 'Artificial Intelligence' and 'Machine Learning'."
  },
  {
    id: "evt_hackathon_03",
    title: "Global FinTech Hackathon 2026",
    description: "36-hour non-stop collegiate hackathon challenging developers to architect scalable financial primitives, fraud prevention AI, and decentralized payments.",
    category: "Hackathon",
    date: "2026-10-22",
    displayDate: "Oct 22-24, 2026",
    startTime: "08:00 AM",
    endTime: "08:00 PM",
    venue: "Auditorium A",
    building: "Tech Center",
    organizer: "FinTech Innovation Cell",
    capacity: 350,
    registeredCount: 342,
    attendanceCount: 318,
    status: "Published",
    isLive: false,
    price: "₹499",
    department: "Computer Science",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Vikramaditya Rao (FinTech Founder)", "Elena Rostova (Quantitative Analyst)"],
    agenda: [
      { time: "Day 1 08:00 AM", title: "Opening Ceremony & Problem Statements Release" },
      { time: "Day 1 12:00 PM", title: "Mentor Check-In 1" },
      { time: "Day 2 09:00 AM", title: "Mid-way Progress Evaluation" },
      { time: "Day 2 04:00 PM", title: "Final Code Freeze & Pitch Stage" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 96.2,
    matchReason: "98% Match based on your previous hackathon wins and high attendance velocity."
  },
  {
    id: "evt_webdev_04",
    title: "Web Development Bootcamp: React 19 & Next.js",
    description: "Master modern full-stack web applications with React Server Components, Tailwind CSS, Turbopack, and high-performance serverless backends.",
    category: "Bootcamp",
    date: "2026-10-25",
    displayDate: "Oct 25, 2026",
    startTime: "11:00 AM",
    endTime: "04:00 PM",
    venue: "Seminar Hall 3",
    building: "Student Union",
    organizer: "ACM Student Chapter",
    capacity: 200,
    registeredCount: 178,
    attendanceCount: 160,
    status: "Published",
    isLive: false,
    price: "₹199",
    department: "Information Science",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Sarah Jenkins (Staff Frontend Engineer)"],
    agenda: [
      { time: "11:00 AM", title: "React 19 Hooks and Transitions" },
      { time: "01:00 PM", title: "State Management & Performance" },
      { time: "02:30 PM", title: "Live SaaS Project Build" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 89.5,
    matchReason: "Recommended for Information Science & Computer Science majors."
  },
  {
    id: "evt_cybersec_05",
    title: "Cyber Security Awareness & Ethical Hacking",
    description: "An intensive live demonstration covering zero-day vulnerability discovery, network penetration testing, credential stuffing mitigations, and compliance.",
    category: "Seminar",
    date: "2026-10-28",
    displayDate: "Oct 28, 2026",
    startTime: "02:00 PM",
    endTime: "05:30 PM",
    venue: "Science Atrium",
    building: "Science & Research Block",
    organizer: "InfoSec Division",
    capacity: 350,
    registeredCount: 310,
    attendanceCount: 295,
    status: "Published",
    isLive: false,
    price: "Free",
    department: "Information Science",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Jason Miller (Senior Security Analyst)"],
    agenda: [
      { time: "02:00 PM", title: "Current Threat Landscape 2026" },
      { time: "03:15 PM", title: "Live Capture-the-Flag (CTF) Demo" },
      { time: "04:45 PM", title: "Career Pathways in Cyber Defense" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 91.0,
    matchReason: "Matches your cybersecurity interest and past campus security workshops."
  },
  {
    id: "evt_sports_06",
    title: "Annual Inter-Collegiate Sports Meet 2026",
    description: "Track and field events, basketball championships, badminton circuits, and football tourneys featuring over 40 participating regional universities.",
    category: "Sports",
    date: "2026-11-02",
    displayDate: "Nov 02-05, 2026",
    startTime: "07:30 AM",
    endTime: "06:00 PM",
    venue: "Main Sports Arena",
    building: "Athletics Complex",
    organizer: "Department of Physical Education",
    capacity: 1200,
    registeredCount: 980,
    attendanceCount: 910,
    status: "Published",
    isLive: false,
    price: "Free",
    department: "Sports Council",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Coach Henderson (Olympics Trainer)"],
    agenda: [
      { time: "07:30 AM", title: "Torch Relay & March Past" },
      { time: "09:30 AM", title: "Track Events 100m, 400m, Relay" },
      { time: "02:00 PM", title: "Team Quarter-Finals" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: false
    },
    successScore: 88.0,
    matchReason: "Open to all students across all faculties."
  },
  {
    id: "evt_cultural_07",
    title: "Vibrance 2026: Spring Cultural Festival",
    description: "Celebrating arts, acoustic concerts, battle of the bands, classical dances, theater production, and street food carnivals across campus lawns.",
    category: "Cultural",
    date: "2026-11-10",
    displayDate: "Nov 10-12, 2026",
    startTime: "04:00 PM",
    endTime: "10:00 PM",
    venue: "Auditorium A",
    building: "Tech Center",
    organizer: "Student Cultural Union",
    capacity: 800,
    registeredCount: 760,
    attendanceCount: 720,
    status: "Published",
    isLive: false,
    price: "₹350",
    department: "Student Affairs",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Tanya Sen (Cultural Secretary)"],
    agenda: [
      { time: "04:00 PM", title: "Battle of the Bands" },
      { time: "06:30 PM", title: "Classical & Contemporary Dance" },
      { time: "08:30 PM", title: "Celebrity Headliner Concert" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: false
    },
    successScore: 93.6,
    matchReason: "Highly anticipated campus-wide annual flagship event."
  },
  {
    id: "evt_cloud_08",
    title: "Cloud Native & DevOps Masterclass",
    description: "Hands-on architectural guidance covering Docker containerization, Kubernetes cluster orchestration, GitOps with ArgoCD, and automated cloud deployments.",
    category: "Technical",
    date: "2026-11-15",
    displayDate: "Nov 15, 2026",
    startTime: "10:00 AM",
    endTime: "03:00 PM",
    venue: "Lab 4B",
    building: "Innovation Hub",
    organizer: "Cloud Architecture Club",
    capacity: 120,
    registeredCount: 115,
    attendanceCount: 104,
    status: "Published",
    isLive: false,
    price: "Free",
    department: "Computer Science",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    speakers: ["Rohit Verma (DevOps Architect)", "Dr. Eleanor Vance"],
    agenda: [
      { time: "10:00 AM", title: "Kubernetes Control Plane Overview" },
      { time: "11:30 AM", title: "Multi-cluster GitOps Architecture" },
      { time: "01:30 PM", title: "Zero-Downtime Deployments Demo" }
    ],
    features: {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 90.2,
    matchReason: "Matches your Cloud Computing interest tag."
  }
];

// ========================================================
// 52 REGISTRATIONS (>= 50 required)
// ========================================================
export const INITIAL_REGISTRATIONS: Registration[] = [
  // Alex Wright (6)
  { id: "reg_01", eventId: "evt_tech_fest_01", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-01T10:14:00Z" },
  { id: "reg_02", eventId: "evt_ai_workshop_02", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-02T11:20:00Z" },
  { id: "reg_03", eventId: "evt_hackathon_03", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-03T15:45:00Z" },
  { id: "reg_04", eventId: "evt_cloud_08", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-04T09:30:00Z" },
  { id: "reg_05", eventId: "evt_webdev_04", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-04T14:10:00Z" },
  { id: "reg_06", eventId: "evt_cultural_07", studentId: "usr_alex_01", status: "confirmed", registeredAt: "2026-10-05T12:00:00Z" },

  // Sarah Jenkins (6)
  { id: "reg_07", eventId: "evt_tech_fest_01", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-01T10:15:00Z" },
  { id: "reg_08", eventId: "evt_webdev_04", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-01T11:00:00Z" },
  { id: "reg_09", eventId: "evt_cybersec_05", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-02T14:10:00Z" },
  { id: "reg_10", eventId: "evt_ai_workshop_02", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-03T10:10:00Z" },
  { id: "reg_11", eventId: "evt_cultural_07", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-03T16:20:00Z" },
  { id: "reg_12", eventId: "evt_sports_06", studentId: "usr_sarah_02", status: "confirmed", registeredAt: "2026-10-04T09:00:00Z" },

  // Marcus Brody (5)
  { id: "reg_13", eventId: "evt_tech_fest_01", studentId: "usr_marcus_03", status: "confirmed", registeredAt: "2026-10-01T10:16:00Z" },
  { id: "reg_14", eventId: "evt_ai_workshop_02", studentId: "usr_marcus_03", status: "confirmed", registeredAt: "2026-10-02T12:00:00Z" },
  { id: "reg_15", eventId: "evt_hackathon_03", studentId: "usr_marcus_03", status: "confirmed", registeredAt: "2026-10-03T11:00:00Z" },
  { id: "reg_16", eventId: "evt_cloud_08", studentId: "usr_marcus_03", status: "confirmed", registeredAt: "2026-10-04T15:00:00Z" },
  { id: "reg_17", eventId: "evt_sports_06", studentId: "usr_marcus_03", status: "confirmed", registeredAt: "2026-10-05T10:30:00Z" },

  // Priya Sharma (6)
  { id: "reg_18", eventId: "evt_tech_fest_01", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-01T10:18:00Z" },
  { id: "reg_19", eventId: "evt_ai_workshop_02", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-02T12:05:00Z" },
  { id: "reg_20", eventId: "evt_hackathon_03", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-03T16:00:00Z" },
  { id: "reg_21", eventId: "evt_cloud_08", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-04T10:15:00Z" },
  { id: "reg_22", eventId: "evt_webdev_04", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-04T13:40:00Z" },
  { id: "reg_23", eventId: "evt_cultural_07", studentId: "usr_priya_04", status: "confirmed", registeredAt: "2026-10-05T14:00:00Z" },

  // David Chen (5)
  { id: "reg_24", eventId: "evt_tech_fest_01", studentId: "usr_david_05", status: "confirmed", registeredAt: "2026-10-01T10:20:00Z" },
  { id: "reg_25", eventId: "evt_sports_06", studentId: "usr_david_05", status: "confirmed", registeredAt: "2026-10-04T10:00:00Z" },
  { id: "reg_26", eventId: "evt_cultural_07", studentId: "usr_david_05", status: "confirmed", registeredAt: "2026-10-04T11:20:00Z" },
  { id: "reg_27", eventId: "evt_hackathon_03", studentId: "usr_david_05", status: "confirmed", registeredAt: "2026-10-05T12:30:00Z" },
  { id: "reg_28", eventId: "evt_ai_workshop_02", studentId: "usr_david_05", status: "confirmed", registeredAt: "2026-10-05T15:45:00Z" },

  // Elena Rostova (5)
  { id: "reg_29", eventId: "evt_tech_fest_01", studentId: "usr_elena_06", status: "confirmed", registeredAt: "2026-10-01T10:22:00Z" },
  { id: "reg_30", eventId: "evt_ai_workshop_02", studentId: "usr_elena_06", status: "confirmed", registeredAt: "2026-10-02T12:10:00Z" },
  { id: "reg_31", eventId: "evt_hackathon_03", studentId: "usr_elena_06", status: "confirmed", registeredAt: "2026-10-03T16:20:00Z" },
  { id: "reg_32", eventId: "evt_cloud_08", studentId: "usr_elena_06", status: "confirmed", registeredAt: "2026-10-04T16:00:00Z" },
  { id: "reg_33", eventId: "evt_cybersec_05", studentId: "usr_elena_06", status: "confirmed", registeredAt: "2026-10-05T09:30:00Z" },

  // Rohit Verma (5)
  { id: "reg_34", eventId: "evt_tech_fest_01", studentId: "usr_rohit_07", status: "confirmed", registeredAt: "2026-10-01T10:25:00Z" },
  { id: "reg_35", eventId: "evt_cloud_08", studentId: "usr_rohit_07", status: "confirmed", registeredAt: "2026-10-04T09:40:00Z" },
  { id: "reg_36", eventId: "evt_webdev_04", studentId: "usr_rohit_07", status: "confirmed", registeredAt: "2026-10-04T14:50:00Z" },
  { id: "reg_37", eventId: "evt_hackathon_03", studentId: "usr_rohit_07", status: "confirmed", registeredAt: "2026-10-05T10:10:00Z" },
  { id: "reg_38", eventId: "evt_cybersec_05", studentId: "usr_rohit_07", status: "confirmed", registeredAt: "2026-10-05T11:40:00Z" },

  // Ananya Iyer (5)
  { id: "reg_39", eventId: "evt_tech_fest_01", studentId: "usr_ananya_08", status: "confirmed", registeredAt: "2026-10-01T10:30:00Z" },
  { id: "reg_40", eventId: "evt_ai_workshop_02", studentId: "usr_ananya_08", status: "confirmed", registeredAt: "2026-10-02T13:00:00Z" },
  { id: "reg_41", eventId: "evt_cultural_07", studentId: "usr_ananya_08", status: "confirmed", registeredAt: "2026-10-04T15:20:00Z" },
  { id: "reg_42", eventId: "evt_sports_06", studentId: "usr_ananya_08", status: "confirmed", registeredAt: "2026-10-05T08:45:00Z" },
  { id: "reg_43", eventId: "evt_webdev_04", studentId: "usr_ananya_08", status: "confirmed", registeredAt: "2026-10-05T13:10:00Z" },

  // Jason Miller (5)
  { id: "reg_44", eventId: "evt_tech_fest_01", studentId: "usr_jason_09", status: "confirmed", registeredAt: "2026-10-01T10:35:00Z" },
  { id: "reg_45", eventId: "evt_cybersec_05", studentId: "usr_jason_09", status: "confirmed", registeredAt: "2026-10-02T14:20:00Z" },
  { id: "reg_46", eventId: "evt_cloud_08", studentId: "usr_jason_09", status: "confirmed", registeredAt: "2026-10-04T11:00:00Z" },
  { id: "reg_47", eventId: "evt_hackathon_03", studentId: "usr_jason_09", status: "confirmed", registeredAt: "2026-10-05T14:20:00Z" },
  { id: "reg_48", eventId: "evt_sports_06", studentId: "usr_jason_09", status: "confirmed", registeredAt: "2026-10-05T16:00:00Z" },

  // Tanya Sen (4)
  { id: "reg_49", eventId: "evt_tech_fest_01", studentId: "usr_tanya_10", status: "confirmed", registeredAt: "2026-10-01T10:40:00Z" },
  { id: "reg_50", eventId: "evt_cultural_07", studentId: "usr_tanya_10", status: "confirmed", registeredAt: "2026-10-04T12:00:00Z" },
  { id: "reg_51", eventId: "evt_sports_06", studentId: "usr_tanya_10", status: "confirmed", registeredAt: "2026-10-04T12:15:00Z" },
  { id: "reg_52", eventId: "evt_webdev_04", studentId: "usr_tanya_10", status: "confirmed", registeredAt: "2026-10-05T15:30:00Z" }
];

// ========================================================
// 44 ATTENDANCE RECORDS (>= 40 required)
// ========================================================
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Event 1: Annual Tech Fest 2026 (10 Attendees)
  { id: "att_01", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:12 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_02", studentId: "usr_sarah_02", studentName: "Sarah Jenkins", usn: "1MS22IS019", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:14 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_03", studentId: "usr_marcus_03", studentName: "Marcus Brody", usn: "1MS22EC088", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:38 AM", status: "Late", method: "Manual Entry" },
  { id: "att_04", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:05 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_05", studentId: "usr_david_05", studentName: "David Chen", usn: "1MS22ME034", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:18 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_06", studentId: "usr_elena_06", studentName: "Elena Rostova", usn: "1MS22AI015", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:08 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_07", studentId: "usr_rohit_07", studentName: "Rohit Verma", usn: "1MS22CS075", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:21 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_08", studentId: "usr_ananya_08", studentName: "Ananya Iyer", usn: "1MS22BT022", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:23 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_09", studentId: "usr_jason_09", studentName: "Jason Miller", usn: "1MS22IS055", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "09:25 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_10", studentId: "usr_tanya_10", studentName: "Tanya Sen", usn: "1MS22EC041", eventId: "evt_tech_fest_01", eventName: "Annual Tech Fest 2026", date: "2026-10-15", time: "08:58 AM", status: "Present", method: "Dynamic QR" },

  // Event 2: AI & ML Workshop (6 Attendees)
  { id: "att_11", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "10:02 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_12", studentId: "usr_sarah_02", studentName: "Sarah Jenkins", usn: "1MS22IS019", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "10:06 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_13", studentId: "usr_marcus_03", studentName: "Marcus Brody", usn: "1MS22EC088", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "10:01 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_14", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "09:55 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_15", studentId: "usr_elena_06", studentName: "Elena Rostova", usn: "1MS22AI015", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "10:11 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_16", studentId: "usr_ananya_08", studentName: "Ananya Iyer", usn: "1MS22BT022", eventId: "evt_ai_workshop_02", eventName: "AI & ML Workshop", date: "2026-10-18", time: "10:14 AM", status: "Present", method: "Dynamic QR" },

  // Event 3: Global FinTech Hackathon (6 Attendees)
  { id: "att_17", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:15 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_18", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:10 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_19", studentId: "usr_elena_06", studentName: "Elena Rostova", usn: "1MS22AI015", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:22 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_20", studentId: "usr_rohit_07", studentName: "Rohit Verma", usn: "1MS22CS075", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:30 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_21", studentId: "usr_jason_09", studentName: "Jason Miller", usn: "1MS22IS055", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:35 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_22", studentId: "usr_marcus_03", studentName: "Marcus Brody", usn: "1MS22EC088", eventId: "evt_hackathon_03", eventName: "Global FinTech Hackathon", date: "2026-10-22", time: "08:40 AM", status: "Present", method: "Dynamic QR" },

  // Event 4: Web Development Bootcamp (5 Attendees)
  { id: "att_23", studentId: "usr_sarah_02", studentName: "Sarah Jenkins", usn: "1MS22IS019", eventId: "evt_webdev_04", eventName: "Web Development Bootcamp", date: "2026-10-25", time: "11:05 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_24", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_webdev_04", eventName: "Web Development Bootcamp", date: "2026-10-25", time: "11:10 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_25", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_webdev_04", eventName: "Web Development Bootcamp", date: "2026-10-25", time: "11:02 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_26", studentId: "usr_rohit_07", studentName: "Rohit Verma", usn: "1MS22CS075", eventId: "evt_webdev_04", eventName: "Web Development Bootcamp", date: "2026-10-25", time: "11:15 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_27", studentId: "usr_tanya_10", studentName: "Tanya Sen", usn: "1MS22EC041", eventId: "evt_webdev_04", eventName: "Web Development Bootcamp", date: "2026-10-25", time: "11:20 AM", status: "Present", method: "Dynamic QR" },

  // Event 5: Cyber Security Awareness (4 Attendees)
  { id: "att_28", studentId: "usr_jason_09", studentName: "Jason Miller", usn: "1MS22IS055", eventId: "evt_cybersec_05", eventName: "Cyber Security Awareness", date: "2026-10-28", time: "02:05 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_29", studentId: "usr_sarah_02", studentName: "Sarah Jenkins", usn: "1MS22IS019", eventId: "evt_cybersec_05", eventName: "Cyber Security Awareness", date: "2026-10-28", time: "02:10 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_30", studentId: "usr_elena_06", studentName: "Elena Rostova", usn: "1MS22AI015", eventId: "evt_cybersec_05", eventName: "Cyber Security Awareness", date: "2026-10-28", time: "02:14 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_31", studentId: "usr_rohit_07", studentName: "Rohit Verma", usn: "1MS22CS075", eventId: "evt_cybersec_05", eventName: "Cyber Security Awareness", date: "2026-10-28", time: "02:22 PM", status: "Late", method: "Manual Entry" },

  // Event 6: Sports Meet (5 Attendees)
  { id: "att_32", studentId: "usr_david_05", studentName: "David Chen", usn: "1MS22ME034", eventId: "evt_sports_06", eventName: "Annual Sports Meet", date: "2026-11-02", time: "07:35 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_33", studentId: "usr_tanya_10", studentName: "Tanya Sen", usn: "1MS22EC041", eventId: "evt_sports_06", eventName: "Annual Sports Meet", date: "2026-11-02", time: "07:40 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_34", studentId: "usr_sarah_02", studentName: "Sarah Jenkins", usn: "1MS22IS019", eventId: "evt_sports_06", eventName: "Annual Sports Meet", date: "2026-11-02", time: "07:45 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_35", studentId: "usr_ananya_08", studentName: "Ananya Iyer", usn: "1MS22BT022", eventId: "evt_sports_06", eventName: "Annual Sports Meet", date: "2026-11-02", time: "07:50 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_36", studentId: "usr_marcus_03", studentName: "Marcus Brody", usn: "1MS22EC088", eventId: "evt_sports_06", eventName: "Annual Sports Meet", date: "2026-11-02", time: "07:55 AM", status: "Present", method: "Dynamic QR" },

  // Event 7: Cultural Fest (4 Attendees)
  { id: "att_37", studentId: "usr_tanya_10", studentName: "Tanya Sen", usn: "1MS22EC041", eventId: "evt_cultural_07", eventName: "Vibrance 2026 Cultural Fest", date: "2026-11-10", time: "04:15 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_38", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_cultural_07", eventName: "Vibrance 2026 Cultural Fest", date: "2026-11-10", time: "04:20 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_39", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_cultural_07", eventName: "Vibrance 2026 Cultural Fest", date: "2026-11-10", time: "04:25 PM", status: "Present", method: "Dynamic QR" },
  { id: "att_40", studentId: "usr_ananya_08", studentName: "Ananya Iyer", usn: "1MS22BT022", eventId: "evt_cultural_07", eventName: "Vibrance 2026 Cultural Fest", date: "2026-11-10", time: "04:30 PM", status: "Present", method: "Dynamic QR" },

  // Event 8: Cloud Computing Masterclass (4 Attendees)
  { id: "att_41", studentId: "usr_alex_01", studentName: "Alexander Wright", usn: "1MS22CS042", eventId: "evt_cloud_08", eventName: "Cloud Computing Workshop", date: "2026-11-15", time: "10:04 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_42", studentId: "usr_rohit_07", studentName: "Rohit Verma", usn: "1MS22CS075", eventId: "evt_cloud_08", eventName: "Cloud Computing Workshop", date: "2026-11-15", time: "10:08 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_43", studentId: "usr_priya_04", studentName: "Priya Sharma", usn: "1MS22CS112", eventId: "evt_cloud_08", eventName: "Cloud Computing Workshop", date: "2026-11-15", time: "10:12 AM", status: "Present", method: "Dynamic QR" },
  { id: "att_44", studentId: "usr_elena_06", studentName: "Elena Rostova", usn: "1MS22AI015", eventId: "evt_cloud_08", eventName: "Cloud Computing Workshop", date: "2026-11-15", time: "10:15 AM", status: "Present", method: "Dynamic QR" }
];

// ========================================================
// 22 CERTIFICATES (>= 20 required)
// ========================================================
export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  // Alex Wright (6 certs)
  {
    id: "cert_01",
    certificateId: "CERT-894201-ET25",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Event Director, ET26",
    status: "Verified",
    description: "For successfully completing and actively participating in the premier technology conference Annual Tech Fest 2026, demonstrating exceptional engagement in AI architectures and enterprise scalability.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-894201-ET25"
  },
  {
    id: "cert_02",
    certificateId: "CERT-772109-ML26",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop: LLMs in Production",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "September 18, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Priya Sharma",
    coIssuerTitle: "Lead AI Researcher",
    status: "Verified",
    description: "Demonstrated mastery in deploying Retrieval-Augmented Generation (RAG) pipelines and fine-tuning open-weights models.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-772109-ML26"
  },
  {
    id: "cert_03",
    certificateId: "CERT-661204-FH26",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon 2026",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "September 24, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Vikramaditya Rao",
    coIssuerTitle: "Head of FinTech Cell",
    status: "Verified",
    description: "Awarded for Outstanding Technical Innovation and 36-hour sprint completion in decentralized payment routing.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-661204-FH26"
  },
  {
    id: "cert_04",
    certificateId: "CERT-552011-CC26",
    eventId: "evt_cloud_08",
    eventName: "Cloud Native & DevOps Masterclass",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "August 29, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Rohit Verma",
    coIssuerTitle: "DevOps Lead",
    status: "Verified",
    description: "Demonstrated excellence in container orchestration and zero-downtime blue/green deployment pipelines.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-552011-CC26"
  },
  {
    id: "cert_05",
    certificateId: "CERT-441092-WD26",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "July 15, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "High distinction in modern full-stack application development with React 19.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-441092-WD26"
  },
  {
    id: "cert_06",
    certificateId: "CERT-330911-VF26",
    eventId: "evt_cultural_07",
    eventName: "Vibrance 2026 Cultural Fest",
    recipientName: "Alexander Wright",
    recipientEmail: "student@eventora.demo",
    studentId: "usr_alex_01",
    recipientId: "usr_alex_01",
    usn: "1MS22CS042",
    issueDate: "June 20, 2026",
    issuer: "Marcus Sterling",
    issuerTitle: "Campus Operations Lead",
    coIssuer: "Tanya Sen",
    coIssuerTitle: "Cultural Secretary",
    status: "Verified",
    description: "Honored for active stage coordination and inter-collegiate technical crew support.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-330911-VF26"
  },

  // Sarah Jenkins (3 certs)
  {
    id: "cert_07",
    certificateId: "CERT-220199-SJ26",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Sarah Jenkins",
    recipientEmail: "sarah.j@eventora.demo",
    studentId: "usr_sarah_02",
    recipientId: "usr_sarah_02",
    usn: "1MS22IS019",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Event Director",
    status: "Verified",
    description: "Distinguished participation in UI design tracks and keynote panels.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-220199-SJ26"
  },
  {
    id: "cert_08",
    certificateId: "CERT-220200-SJ26",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    recipientName: "Sarah Jenkins",
    recipientEmail: "sarah.j@eventora.demo",
    studentId: "usr_sarah_02",
    recipientId: "usr_sarah_02",
    usn: "1MS22IS019",
    issueDate: "October 26, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Lead speaker distinction in Next.js Server Components architecture.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-220200-SJ26"
  },
  {
    id: "cert_09",
    certificateId: "CERT-220201-SJ26",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    recipientName: "Sarah Jenkins",
    recipientEmail: "sarah.j@eventora.demo",
    studentId: "usr_sarah_02",
    recipientId: "usr_sarah_02",
    usn: "1MS22IS019",
    issueDate: "October 29, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Jason Miller",
    coIssuerTitle: "Security Analyst",
    status: "Verified",
    description: "Demonstrated threat modeling proficiency in identity protection.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-220201-SJ26"
  },

  // Priya Sharma (3 certs)
  {
    id: "cert_10",
    certificateId: "CERT-330101-PS26",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Priya Sharma",
    recipientEmail: "priya.s@eventora.demo",
    studentId: "usr_priya_04",
    recipientId: "usr_priya_04",
    usn: "1MS22CS112",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Excellence in AI model evaluations and project exhibition mentorship.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-330101-PS26"
  },
  {
    id: "cert_11",
    certificateId: "CERT-330102-PS26",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop",
    recipientName: "Priya Sharma",
    recipientEmail: "priya.s@eventora.demo",
    studentId: "usr_priya_04",
    recipientId: "usr_priya_04",
    usn: "1MS22CS112",
    issueDate: "October 19, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Brody",
    coIssuerTitle: "AI Fellow",
    status: "Verified",
    description: "Workshop co-instructor for production fine-tuning pipelines.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-330102-PS26"
  },
  {
    id: "cert_12",
    certificateId: "CERT-330103-PS26",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    recipientName: "Priya Sharma",
    recipientEmail: "priya.s@eventora.demo",
    studentId: "usr_priya_04",
    recipientId: "usr_priya_04",
    usn: "1MS22CS112",
    issueDate: "October 25, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Vikramaditya Rao",
    coIssuerTitle: "FinTech Head",
    status: "Verified",
    description: "Top 3 Podium Finish for automated fraud anomaly detection engine.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-330103-PS26"
  },

  // Elena Rostova (2 certs)
  {
    id: "cert_13",
    certificateId: "CERT-440101-ER26",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Elena Rostova",
    recipientEmail: "elena.r@eventora.demo",
    studentId: "usr_elena_06",
    recipientId: "usr_elena_06",
    usn: "1MS22AI015",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Autonomous computer vision live demonstration distinction.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-440101-ER26"
  },
  {
    id: "cert_14",
    certificateId: "CERT-440102-ER26",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    recipientName: "Elena Rostova",
    recipientEmail: "elena.r@eventora.demo",
    studentId: "usr_elena_06",
    recipientId: "usr_elena_06",
    usn: "1MS22AI015",
    issueDate: "October 25, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Vikramaditya Rao",
    coIssuerTitle: "FinTech Head",
    status: "Verified",
    description: "Quantitative risk model architectural sprint completion.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-440102-ER26"
  },

  // Rohit Verma (2 certs)
  {
    id: "cert_15",
    certificateId: "CERT-550101-RV26",
    eventId: "evt_cloud_08",
    eventName: "Cloud Native & DevOps Masterclass",
    recipientName: "Rohit Verma",
    recipientEmail: "rohit.v@eventora.demo",
    studentId: "usr_rohit_07",
    recipientId: "usr_rohit_07",
    usn: "1MS22CS075",
    issueDate: "November 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Lead DevOps demonstrator for multi-cluster Kubernetes deployments.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-550101-RV26"
  },
  {
    id: "cert_16",
    certificateId: "CERT-550102-RV26",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    recipientName: "Rohit Verma",
    recipientEmail: "rohit.v@eventora.demo",
    studentId: "usr_rohit_07",
    recipientId: "usr_rohit_07",
    usn: "1MS22CS075",
    issueDate: "October 26, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Sarah Jenkins",
    coIssuerTitle: "Engineer",
    status: "Verified",
    description: "Full-stack cloud infrastructure orchestration.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-550102-RV26"
  },

  // Jason Miller (2 certs)
  {
    id: "cert_17",
    certificateId: "CERT-660101-JM26",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    recipientName: "Jason Miller",
    recipientEmail: "jason.m@eventora.demo",
    studentId: "usr_jason_09",
    recipientId: "usr_jason_09",
    usn: "1MS22IS055",
    issueDate: "October 29, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Capture the Flag live challenge champion.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-660101-JM26"
  },
  {
    id: "cert_18",
    certificateId: "CERT-660102-JM26",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Jason Miller",
    recipientEmail: "jason.m@eventora.demo",
    studentId: "usr_jason_09",
    recipientId: "usr_jason_09",
    usn: "1MS22IS055",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Network infrastructure security audit distinguished attendee.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-660102-JM26"
  },

  // Tanya Sen (2 certs)
  {
    id: "cert_19",
    certificateId: "CERT-770101-TS26",
    eventId: "evt_cultural_07",
    eventName: "Vibrance 2026 Cultural Fest",
    recipientName: "Tanya Sen",
    recipientEmail: "tanya.s@eventora.demo",
    studentId: "usr_tanya_10",
    recipientId: "usr_tanya_10",
    usn: "1MS22EC041",
    issueDate: "November 13, 2026",
    issuer: "Marcus Sterling",
    issuerTitle: "Campus Operations Lead",
    coIssuer: "Dr. Eleanor Vance",
    coIssuerTitle: "Chief Academic Officer",
    status: "Verified",
    description: "Master of Ceremonies and Cultural Steering Committee Excellence.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-770101-TS26"
  },
  {
    id: "cert_20",
    certificateId: "CERT-770102-TS26",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    recipientName: "Tanya Sen",
    recipientEmail: "tanya.s@eventora.demo",
    studentId: "usr_tanya_10",
    recipientId: "usr_tanya_10",
    usn: "1MS22EC041",
    issueDate: "November 06, 2026",
    issuer: "Coach Henderson",
    issuerTitle: "Athletics Director",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Inter-department badminton finalist.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-770102-TS26"
  },

  // David Chen & Ananya Iyer (2 certs)
  {
    id: "cert_21",
    certificateId: "CERT-880101-DC26",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    recipientName: "David Chen",
    recipientEmail: "david.c@eventora.demo",
    studentId: "usr_david_05",
    recipientId: "usr_david_05",
    usn: "1MS22ME034",
    issueDate: "November 06, 2026",
    issuer: "Coach Henderson",
    issuerTitle: "Athletics Director",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Gold medalist in 400m campus relay championship.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-880101-DC26"
  },
  {
    id: "cert_22",
    certificateId: "CERT-990101-AI26",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    recipientName: "Ananya Iyer",
    recipientEmail: "ananya.i@eventora.demo",
    studentId: "usr_ananya_08",
    recipientId: "usr_ananya_08",
    usn: "1MS22BT022",
    issueDate: "October 16, 2026",
    issuer: "Dr. Eleanor Vance",
    issuerTitle: "Chief Academic Officer",
    coIssuer: "Marcus Sterling",
    coIssuerTitle: "Director",
    status: "Verified",
    description: "Best Paper Presentation in Computational Genomics.",
    qrVerificationUrl: "http://localhost:5173/verify/CERT-990101-AI26"
  }
];

// ========================================================
// 32 FEEDBACK REVIEWS (>= 30 required)
// ========================================================
export const INITIAL_FEEDBACK: FeedbackRecord[] = [
  // Event 1 (5 reviews)
  {
    id: "fb_01",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Exceptional symposium! The keynote by Sundar Raman was deeply insightful, and check-in via the dynamic QR scanner was instant with zero waiting lines.",
    createdAt: "2026-10-15T18:20:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_02",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    studentName: "Sarah Jenkins",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "The automated certificate vault issuing certificates right after the event was unbelievable. Truly professional SaaS experience.",
    createdAt: "2026-10-15T19:10:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_03",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    studentName: "Marcus Brody",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Great hardware robotics exhibits in the tech center lobby. Acoustics in Auditorium A were crystal clear.",
    createdAt: "2026-10-15T19:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_04",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    studentName: "Priya Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Paper presentations provided rigorous technical feedback. Thoroughly organized from registration to awards.",
    createdAt: "2026-10-15T20:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_05",
    eventId: "evt_tech_fest_01",
    eventName: "Annual Tech Fest 2026",
    studentName: "David Chen",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 4,
    comment: "Lunch networking hour was very productive. Looking forward to next year's edition.",
    createdAt: "2026-10-15T20:15:00Z",
    sentiment: "Positive"
  },

  // Event 2 (4 reviews)
  {
    id: "fb_06",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Hands-on RAG pipeline setup directly in PyTorch was incredible. Clear step-by-step guidance.",
    createdAt: "2026-10-18T16:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_07",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop",
    studentName: "Marcus Brody",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "High quality hands-on code examples for RAG pipelines. Would love a 2-day extended session next semester!",
    createdAt: "2026-10-18T16:20:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_08",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop",
    studentName: "Elena Rostova",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Quantization and LoRA labs were explained with deep mathematical clarity.",
    createdAt: "2026-10-18T16:45:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_09",
    eventId: "evt_ai_workshop_02",
    eventName: "AI & ML Workshop",
    studentName: "Ananya Iyer",
    studentAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 4,
    contentRating: 5,
    comment: "Lab workstations handled GPUs without lag. Very well managed by the club.",
    createdAt: "2026-10-18T17:10:00Z",
    sentiment: "Positive"
  },

  // Event 3 (5 reviews)
  {
    id: "fb_10",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    studentName: "Priya Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 5,
    comment: "Best collegiate hackathon organization I have seen. Mentorship support was responsive 24/7.",
    createdAt: "2026-10-24T14:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_11",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "36-hour sprint with great snacks, wifi reliability, and real enterprise judging criteria.",
    createdAt: "2026-10-24T15:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_12",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    studentName: "Elena Rostova",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Mentors from leading payment gateways helped refine our risk scoring architecture.",
    createdAt: "2026-10-24T15:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_13",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    studentName: "Rohit Verma",
    studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 5,
    comment: "Awesome pitch stage and transparent grading criteria from the judging panel.",
    createdAt: "2026-10-24T16:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_14",
    eventId: "evt_hackathon_03",
    eventName: "Global FinTech Hackathon",
    studentName: "Jason Miller",
    studentAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Real-time leaderboard updates during judging kept the excitement high.",
    createdAt: "2026-10-24T16:30:00Z",
    sentiment: "Positive"
  },

  // Event 4 (4 reviews)
  {
    id: "fb_15",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Sarah explained React 19 Actions and optimistic updates brilliantly.",
    createdAt: "2026-10-25T18:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_16",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    studentName: "Rohit Verma",
    studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 4,
    comment: "Clean boilerplate provided before class allowed us to dive straight into coding.",
    createdAt: "2026-10-25T18:20:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_17",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    studentName: "Tanya Sen",
    studentAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "As someone branching into tech from electronics, this was wonderfully accessible.",
    createdAt: "2026-10-25T18:40:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_18",
    eventId: "evt_webdev_04",
    eventName: "Web Development Bootcamp",
    studentName: "Priya Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 4,
    contentRating: 5,
    comment: "Super practical live coding. Learned new CSS subgrid techniques too.",
    createdAt: "2026-10-25T19:00:00Z",
    sentiment: "Positive"
  },

  // Event 5 (4 reviews)
  {
    id: "fb_19",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    studentName: "Sarah Jenkins",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "The live packet sniffing demo opened everyone's eyes to public WiFi vulnerabilities.",
    createdAt: "2026-10-28T18:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_20",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    studentName: "Elena Rostova",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "CTF problems had progressive difficulty that encouraged teamwork.",
    createdAt: "2026-10-28T18:20:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_21",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    studentName: "Rohit Verma",
    studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 4,
    contentRating: 4,
    comment: "Great focus on container escape mitigations and kernel security patches.",
    createdAt: "2026-10-28T18:40:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_22",
    eventId: "evt_cybersec_05",
    eventName: "Cyber Security Awareness",
    studentName: "Jason Miller",
    studentAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Phenomenal student engagement and enthusiastic questions throughout the session.",
    createdAt: "2026-10-28T19:00:00Z",
    sentiment: "Positive"
  },

  // Event 6 (4 reviews)
  {
    id: "fb_23",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    studentName: "David Chen",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 4,
    comment: "Track facilities and digital photo-finish timers made the races professional.",
    createdAt: "2026-11-05T19:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_24",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    studentName: "Tanya Sen",
    studentAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 4,
    comment: "Cheering squad support and sports arena amenities were top notch.",
    createdAt: "2026-11-05T19:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_25",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    studentName: "Sarah Jenkins",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 4,
    contentRating: 4,
    comment: "Very energetic atmosphere across all three days.",
    createdAt: "2026-11-05T20:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_26",
    eventId: "evt_sports_06",
    eventName: "Annual Sports Meet",
    studentName: "Marcus Brody",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 4,
    contentRating: 4,
    comment: "Good refereeing and fair play across tournament brackets.",
    createdAt: "2026-11-05T20:30:00Z",
    sentiment: "Positive"
  },

  // Event 7 (3 reviews)
  {
    id: "fb_27",
    eventId: "evt_cultural_07",
    eventName: "Vibrance 2026 Cultural Fest",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Battle of the Bands in the evening was electrifying. Best lighting and sound setup yet.",
    createdAt: "2026-11-12T23:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_28",
    eventId: "evt_cultural_07",
    eventName: "Vibrance 2026 Cultural Fest",
    studentName: "Priya Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Street food carnival and student dance troupes made the campus feel alive.",
    createdAt: "2026-11-12T23:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_29",
    eventId: "evt_cultural_07",
    eventName: "Vibrance 2026 Cultural Fest",
    studentName: "Ananya Iyer",
    studentAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    comment: "Celebrity headliner concert ended the semester on the highest note possible.",
    createdAt: "2026-11-13T00:15:00Z",
    sentiment: "Positive"
  },

  // Event 8 (3 reviews)
  {
    id: "fb_30",
    eventId: "evt_cloud_08",
    eventName: "Cloud Native & DevOps Masterclass",
    studentName: "Alexander Wright",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    overallRating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Hands-on blue/green deployments and ArgoCD syncing gave enterprise-grade knowledge.",
    createdAt: "2026-11-15T18:00:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_31",
    eventId: "evt_cloud_08",
    eventName: "Cloud Native & DevOps Masterclass",
    studentName: "Priya Sharma",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 5,
    venueRating: 4,
    contentRating: 5,
    comment: "Docker compose to K8s manifest migration exercise was extremely well prepared.",
    createdAt: "2026-11-15T18:30:00Z",
    sentiment: "Positive"
  },
  {
    id: "fb_32",
    eventId: "evt_cloud_08",
    eventName: "Cloud Native & DevOps Masterclass",
    studentName: "Elena Rostova",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    overallRating: 4,
    organizationRating: 4,
    speakerRating: 4,
    venueRating: 5,
    contentRating: 4,
    comment: "Good session on microservices telemetry using Prometheus and Grafana.",
    createdAt: "2026-11-15T19:00:00Z",
    sentiment: "Positive"
  }
];

// ========================================================
// 22 NOTIFICATIONS (>= 20 required)
// ========================================================
export const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: "notif_01",
    userId: "usr_alex_01",
    title: "Registration Confirmed",
    message: "You are registered for 'Annual Tech Fest 2026'. Your dynamic QR pass is ready in your dashboard.",
    type: "registration",
    isRead: false,
    createdAt: "10m ago"
  },
  {
    id: "notif_02",
    userId: "usr_alex_01",
    title: "Event Starts Soon",
    message: "'Annual Tech Fest 2026' starts in 14 hours at Auditorium A. Check in early to reserve priority front seating.",
    type: "event",
    isRead: false,
    createdAt: "1h ago"
  },
  {
    id: "notif_03",
    userId: "usr_alex_01",
    title: "Certificate Generated",
    message: "Your verified credential for 'Global FinTech Hackathon' has been cryptographically signed and stored in your vault.",
    type: "certificate",
    isRead: true,
    createdAt: "1d ago"
  },
  {
    id: "notif_04",
    userId: "usr_alex_01",
    title: "New AI Recommendation",
    message: "'AI & ML Workshop: LLMs in Production' matches 98% of your computer science interest profile.",
    type: "recommendation",
    isRead: true,
    createdAt: "2d ago"
  },
  {
    id: "notif_05",
    userId: "usr_alex_01",
    title: "Feedback Request",
    message: "How was 'Web Development Bootcamp'? Submit your 5-criterion review to unlock your digital badge.",
    type: "event",
    isRead: false,
    createdAt: "3d ago"
  },
  {
    id: "notif_06",
    userId: "usr_alex_01",
    title: "Attendance Verified",
    message: "Your attendance was confirmed at 09:12 AM for Annual Tech Fest 2026.",
    type: "registration",
    isRead: true,
    createdAt: "3d ago"
  },
  {
    id: "notif_07",
    userId: "usr_alex_01",
    title: "Campus Venue Update",
    message: "Auditorium A seating capacity expanded to 500 seats due to overwhelming registration demand.",
    type: "alert",
    isRead: true,
    createdAt: "4d ago"
  },
  {
    id: "notif_08",
    userId: "usr_alex_01",
    title: "Hackathon Blueprint Ready",
    message: "Problem statements and dataset repositories for Global FinTech Hackathon are now accessible.",
    type: "event",
    isRead: true,
    createdAt: "5d ago"
  },
  {
    id: "notif_09",
    userId: "usr_sarah_02",
    title: "Certificate Issued",
    message: "Certificate of Distinction in React 19 Frontend Architecture is now available in your vault.",
    type: "certificate",
    isRead: false,
    createdAt: "2h ago"
  },
  {
    id: "notif_10",
    userId: "usr_sarah_02",
    title: "Registration Confirmed",
    message: "Confirmed seat for 'Cyber Security Awareness & Ethical Hacking' at Science Atrium.",
    type: "registration",
    isRead: true,
    createdAt: "1d ago"
  },
  {
    id: "notif_11",
    userId: "usr_marcus_03",
    title: "Workshop Reminder",
    message: "Robotics Hardware Lab session starts in 45 minutes in Innovation Hub Lab 4B.",
    type: "event",
    isRead: false,
    createdAt: "30m ago"
  },
  {
    id: "notif_12",
    userId: "usr_marcus_03",
    title: "Attendance Logged",
    message: "Late check-in override approved by Admin Desk for Annual Tech Fest at 09:38 AM.",
    type: "registration",
    isRead: true,
    createdAt: "4d ago"
  },
  {
    id: "notif_13",
    userId: "usr_priya_04",
    title: "Top 3 Podium Award",
    message: "Congratulations on winning 2nd Runner Up in Global FinTech Hackathon 2026!",
    type: "certificate",
    isRead: false,
    createdAt: "2d ago"
  },
  {
    id: "notif_14",
    userId: "usr_priya_04",
    title: "Co-Instructor Access Granted",
    message: "You have been granted evaluator permissions for AI & ML Workshop attendee reviews.",
    type: "system",
    isRead: true,
    createdAt: "3d ago"
  },
  {
    id: "notif_15",
    userId: "usr_david_05",
    title: "Gold Medal Verification",
    message: "Official sports certificate for Men's 400m Relay has been cryptographically signed.",
    type: "certificate",
    isRead: false,
    createdAt: "1d ago"
  },
  {
    id: "notif_16",
    userId: "usr_elena_06",
    title: "New AI Recommendation",
    message: "'Cloud Native & DevOps Masterclass' matches your distributed systems research profile.",
    type: "recommendation",
    isRead: false,
    createdAt: "5h ago"
  },
  {
    id: "notif_17",
    userId: "usr_rohit_07",
    title: "DevOps Badge Awarded",
    message: "Earned badge: Kubernetes Deployment Master for successfully demonstrating multi-cluster failover.",
    type: "certificate",
    isRead: true,
    createdAt: "6d ago"
  },
  {
    id: "notif_18",
    userId: "usr_ananya_08",
    title: "Paper Presentation Award",
    message: "Honored with Best Computational Genomics Paper Certificate at Annual Tech Fest 2026.",
    type: "certificate",
    isRead: true,
    createdAt: "4d ago"
  },
  {
    id: "notif_19",
    userId: "usr_jason_09",
    title: "Security Threat Acknowledged",
    message: "Thank you for reporting spoofing attack pattern during anti-fraud dynamic QR testing.",
    type: "alert",
    isRead: true,
    createdAt: "3d ago"
  },
  {
    id: "notif_20",
    userId: "usr_tanya_10",
    title: "Cultural Fest Headliner Briefing",
    message: "Final acoustic sound checks scheduled at 02:00 PM today in Media Center & Amphitheater.",
    type: "event",
    isRead: false,
    createdAt: "1h ago"
  },
  {
    id: "notif_21",
    title: "System Maintenance Notice",
    message: "Eventora Platform database snapshot completed successfully. All records persisted.",
    type: "system",
    isRead: true,
    createdAt: "12h ago"
  },
  {
    id: "notif_22",
    title: "Campus Security Alert",
    message: "Anti-fraud rate limit enforcement active on all rotating dynamic QR attendance kiosks.",
    type: "alert",
    isRead: true,
    createdAt: "1d ago"
  }
];

// Re-export demo logs
export const INITIAL_ANTI_FRAUD_LOGS: AntiFraudLog[] = [
  { id: "log_01", student: "Alexander Wright", usn: "1MS22CS042", timestamp: "10:14:22 AM", result: "Valid", reason: "Token authenticated within 15s window", ip: "192.168.1.104" },
  { id: "log_02", student: "Sarah Jenkins", usn: "1MS22IS019", timestamp: "10:14:35 AM", result: "Valid", reason: "Token authenticated within 15s window", ip: "192.168.1.112" },
  { id: "log_03", student: "Unknown / Device #91", usn: "1MS22EC012", timestamp: "10:15:02 AM", result: "Rejected", reason: "Expired token rotation (age: 42s)", ip: "10.0.4.19" },
  { id: "log_04", student: "Marcus Brody", usn: "1MS22EC088", timestamp: "10:15:18 AM", result: "Duplicate", reason: "Already marked Present at 09:38 AM", ip: "192.168.1.108" },
  { id: "log_05", student: "Priya Sharma", usn: "1MS22CS112", timestamp: "10:15:40 AM", result: "Valid", reason: "Token authenticated within 15s window", ip: "192.168.1.125" },
  { id: "log_06", student: "Device Spoofing #03", usn: "1MS22CS999", timestamp: "10:16:01 AM", result: "Fraud Attempt", reason: "Invalid cryptographic HMAC signature", ip: "45.33.32.156" }
];

export const AI_SUGGESTED_PROMPTS: string[] = [
  "How many students registered for Annual Tech Fest?",
  "Which event currently has the highest attendance rate?",
  "Suggest a detailed 3-day schedule for Tech Fest 2026.",
  "Why is attendance dropping in afternoon sessions?",
  "Which events need more promotion this week?",
  "Generate an automated reminder notification message for tomorrow's keynote."
];
