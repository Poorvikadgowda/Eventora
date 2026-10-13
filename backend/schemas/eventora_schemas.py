"""
Pydantic Schemas for Eventora Web Application
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# ================= AUTH SCHEMAS =================
class UserLoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "student"

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"
    usn: Optional[str] = None
    department: Optional[str] = "Computer Science"
    phone: Optional[str] = None
    interests: Optional[List[str]] = []

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    usn: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    badge: Optional[str] = None
    interests: Optional[List[str]] = []
    attendanceRate: Optional[float] = 90.0
    attendedCount: Optional[int] = 0
    registeredCount: Optional[int] = 0
    certificatesCount: Optional[int] = 0

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# ================= EVENT SCHEMAS =================
class EventCreateRequest(BaseModel):
    title: str
    description: str
    category: str
    date: str
    startTime: str
    endTime: str
    venue: str
    building: Optional[str] = "Tech Center"
    organizer: str
    capacity: int
    price: Optional[str] = "Free"
    department: Optional[str] = "Computer Science"
    image: Optional[str] = None
    speakers: Optional[List[str]] = []
    agenda: Optional[List[Dict[str, str]]] = []
    features: Optional[Dict[str, bool]] = {
        "enableQR": True,
        "enableCertificate": True,
        "enableFeedback": True,
        "enableNotifications": True,
        "enableAICopilot": True
    }
    certificateTypes: Optional[List[str]] = ["participation"]

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    venue: Optional[str] = None
    building: Optional[str] = None
    organizer: Optional[str] = None
    capacity: Optional[int] = None
    price: Optional[str] = None
    status: Optional[str] = None
    isLive: Optional[bool] = None
    department: Optional[str] = None
    image: Optional[str] = None
    speakers: Optional[List[str]] = None
    agenda: Optional[List[Dict[str, str]]] = None
    certificateTypes: Optional[List[str]] = None

# ================= REGISTRATION SCHEMAS =================
class RegistrationRequest(BaseModel):
    eventId: str
    studentId: Optional[str] = None

# ================= QR SCHEMAS =================
class QRSessionStartRequest(BaseModel):
    eventId: str
    windowSeconds: Optional[int] = 15

class QRValidateRequest(BaseModel):
    eventId: str
    token: str
    studentId: Optional[str] = None
    method: Optional[str] = "Dynamic QR"
    deviceInfo: Optional[str] = "Web Scanner"

# ================= ATTENDANCE SCHEMAS =================
class AttendanceScanRequest(BaseModel):
    eventId: str
    tokenOrStudentId: str
    method: Optional[str] = "Dynamic QR"
    deviceInfo: Optional[str] = "Admin Scanner"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ManualAttendanceRequest(BaseModel):
    eventId: str
    studentId: str
    status: Optional[str] = "Present"

# ================= CERTIFICATE SCHEMAS =================
class CertificateIssueRequest(BaseModel):
    eventId: str
    studentId: str
    issuerName: Optional[str] = "Dr. Eleanor Vance"
    issuerTitle: Optional[str] = "Chief Academic Officer"

# ================= FEEDBACK SCHEMAS =================
class FeedbackSubmitRequest(BaseModel):
    eventId: str
    studentId: Optional[str] = None
    organizationRating: int = Field(5, ge=1, le=5)
    speakerRating: int = Field(5, ge=1, le=5)
    venueRating: int = Field(5, ge=1, le=5)
    contentRating: int = Field(5, ge=1, le=5)
    overallRating: int = Field(5, ge=1, le=5)
    comment: Optional[str] = ""

# ================= AI COPILOT SCHEMAS =================
class AICopilotRequest(BaseModel):
    prompt: str
    category: Optional[str] = None
    department: Optional[str] = None
    capacity: Optional[int] = None
    context: Optional[Dict[str, Any]] = None
