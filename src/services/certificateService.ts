import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_CERTIFICATES, CertificateRecord } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_certificates';

function getLocalCertificates(): CertificateRecord[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
  return INITIAL_CERTIFICATES;
}

function saveLocalCertificates(certs: CertificateRecord[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(certs));
}

// ================= RESULTS DATA MODEL =================

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  action: string;
  notes?: string;
  changes?: string[];
  previousStatus?: string;
  newStatus?: string;
  score?: number;
  rank?: number;
  award?: string;
}

export interface EventResult {
  id: string;
  eventId: string;
  awardCategory: 'winner' | 'achievement';
  awardTitle: string;
  rank?: number;
  isTeam: boolean;
  teamName?: string;
  studentIds: string[];
  studentNames: string[];
  projectTitle?: string;
  score?: number;
  judgeNotes?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'reapproval_required';
  approvedBy?: string;
  approvedAt?: string;
  auditTrail?: AuditLogEntry[];
}

export interface ParticipantRecord {
  registrationId: string;
  studentId: string;
  name: string;
  email: string;
  usn: string;
  department: string;
  avatar: string;
  teamName?: string;
  projectTitle?: string;
  registrationStatus: string;
  attendanceStatus: string;
  isAttendanceVerified: boolean;
  attendanceMethod?: string;
  checkinTime?: string;
}

export interface TeamRecord {
  id: string;
  eventId: string;
  name: string;
  projectTitle?: string;
  memberIds: string[];
  members: Array<{
    id: string;
    name: string;
    email: string;
    usn: string;
    department: string;
    isAttendanceVerified: boolean;
  }>;
}

// ================= RESULTS API METHODS =================

export async function getEventResults(eventId: string): Promise<EventResult[]> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/results`);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn('Error fetching event results from backend:', err);
  }
  return [];
}

export async function createEventResult(eventId: string, resultData: Partial<EventResult>): Promise<EventResult | null> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to create result');
  } catch (err) {
    console.error('Error creating event result:', err);
    throw err;
  }
}

export async function updateEventResult(resultId: string, updateData: Partial<EventResult> & { editorName?: string; editReason?: string }): Promise<{ success: boolean; status?: string; reapprovalRequired?: boolean; changes?: string[] }> {
  try {
    const res = await fetch(`/api/certificates/results/${encodeURIComponent(resultId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        status: data.status,
        reapprovalRequired: Boolean(data.reapprovalRequired),
        changes: data.changes || [],
      };
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to update result');
  } catch (err) {
    console.error('Error updating event result:', err);
    throw err;
  }
}

export async function approveEventResult(resultId: string, approvedBy: string = 'Dr. Eleanor Vance (Chief Academic Officer)', approvalNotes?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/certificates/results/${encodeURIComponent(resultId)}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy, approvalNotes }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error approving event result:', err);
    return false;
  }
}

export async function approveAllEventResults(eventId: string, approvedBy: string = 'Dr. Eleanor Vance (Chief Academic Officer)', approvalNotes?: string): Promise<{ success: boolean; approvedCount: number }> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/results/approve-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy, approvalNotes }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, approvedCount: data.approvedCount || 0 };
    }
    return { success: false, approvedCount: 0 };
  } catch (err) {
    console.error('Error in bulk result approval:', err);
    return { success: false, approvedCount: 0 };
  }
}

export async function deleteEventResult(resultId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/certificates/results/${encodeURIComponent(resultId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting event result:', err);
    return false;
  }
}

export async function getEventParticipants(eventId: string): Promise<ParticipantRecord[]> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/participants`);
    if (res.ok) {
      const data = await res.json();
      return data.participants || [];
    }
  } catch (err) {
    console.warn('Error fetching event participants:', err);
  }
  return [];
}

export async function getEventTeams(eventId: string): Promise<TeamRecord[]> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/teams`);
    if (res.ok) {
      const data = await res.json();
      return data.teams || [];
    }
  } catch (err) {
    console.warn('Error fetching event teams:', err);
  }
  return [];
}

export async function validateCsvResults(eventId: string, csvText?: string, rows?: any[]): Promise<{ totalRows: number; validCount: number; invalidCount: number; validRows: any[]; invalidRows: any[] }> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/results/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText, rows }),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'CSV validation failed');
  } catch (err) {
    console.error('Error validating CSV:', err);
    throw err;
  }
}

export async function bulkSaveResults(eventId: string, results: any[], initialStatus: string = 'draft'): Promise<number> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/results/bulk-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, initialStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.savedCount || 0;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to save results');
  } catch (err) {
    console.error('Error saving bulk results:', err);
    throw err;
  }
}

export async function configureEventCertificateTypes(eventId: string, certificateTypes: string[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/certificates/events/${encodeURIComponent(eventId)}/configure-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateTypes }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error configuring event certificate types:', err);
    return false;
  }
}

// ================= STUDENT CREDENTIAL RETRIEVAL =================

export async function getMyCertificates(
  studentId: string,
  studentEmail?: string,
  studentUsn?: string
): Promise<CertificateRecord[]> {
  const certMap = new Map<string, CertificateRecord>();

  // 1. Fetch from FastAPI Backend SQLite / Storage registry
  try {
    const res = await fetch(`/api/certificates?student_id=${encodeURIComponent(studentId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.certificates)) {
        data.certificates.forEach((d: any) => {
          const cid = (d.certificateId || d.certificate_id || '').toUpperCase();
          if (cid) {
            certMap.set(cid, {
              id: d.id || `cert_${cid}`,
              certificateId: cid,
              eventId: d.event_id || d.eventId || '',
              eventName: d.eventName || d.event_name || 'Campus Event',
              certificateType: d.certificateType || d.certificate_type || 'Participation',
              awardTitle: d.awardTitle || d.award_title,
              rank: d.rank,
              teamName: d.teamName || d.team_name,
              recipientName: d.recipientName || d.recipient_name || 'Verified Recipient',
              recipientEmail: d.recipientEmail || d.recipient_email || '',
              studentId: d.student_id || d.recipient_id || studentId,
              usn: d.usn || studentUsn || '',
              issueDate: d.issueDate || d.issue_date || 'October 15, 2026',
              issuer: d.issuer || 'Dr. Eleanor Vance',
              issuerTitle: d.issuer_title || 'Chief Academic Officer',
              coIssuer: d.co_issuer || 'Marcus Sterling',
              coIssuerTitle: d.co_issuer_title || 'Event Director',
              status: (d.status || '').toLowerCase() === 'revoked' ? 'Revoked' : 'Verified',
              description: d.description || `For verified attendance and achievement in ${d.eventName || 'campus event'}.`,
              qrVerificationUrl: d.qrVerificationUrl || d.qr_verification_url || `${window.location.origin}/verify/${cid}`,
              downloadUrl: d.downloadUrl || `/api/certificates/download/${cid}`,
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Backend certificates fetch fallback:', err);
  }

  // 2. Fetch from Supabase certificates if online & not demo mode
  if (!isDemoMode) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, events(title, category, date), profiles(name, usn, email)')
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((d: any) => {
          const cid = (d.certificate_id || '').toUpperCase();
          if (cid && !certMap.has(cid)) {
            certMap.set(cid, {
              id: d.id,
              certificateId: cid,
              eventId: d.event_id,
              eventName: d.events?.title || 'Campus Event',
              certificateType: d.certificate_type || 'Participation',
              awardTitle: d.award_title,
              rank: d.rank,
              teamName: d.team_name,
              recipientName: d.profiles?.name || 'Verified Recipient',
              recipientEmail: d.profiles?.email || '',
              studentId: d.student_id,
              usn: d.profiles?.usn || '',
              issueDate: new Date(d.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              issuer: d.metadata?.issuer || 'Dr. Eleanor Vance',
              issuerTitle: d.metadata?.issuer_title || 'Chief Academic Officer',
              coIssuer: d.metadata?.co_issuer || 'Marcus Sterling',
              coIssuerTitle: d.metadata?.co_issuer_title || 'Event Director',
              status: d.status === 'revoked' ? 'Revoked' : 'Verified',
              description: d.metadata?.description || `For verified attendance and active engagement in ${d.events?.title || 'campus event'}.`,
              qrVerificationUrl: d.certificate_url || `${window.location.origin}/verify/${cid}`,
              downloadUrl: `/api/certificates/download/${cid}`
            });
          }
        });
      }
    } catch (err) {
      console.warn('Supabase getMyCertificates query fallback:', err);
    }
  }

  // 3. Fallback to LocalStorage initial certificates if none found
  if (certMap.size === 0) {
    const all = getLocalCertificates();
    const matchesStudent = (c: any) => {
      if (!c) return false;
      const matchId = studentId && (c.studentId === studentId || c.recipientId === studentId || c.student_id === studentId);
      const matchEmail = studentEmail && c.recipientEmail?.toLowerCase() === studentEmail.toLowerCase();
      const matchUsn = studentUsn && c.usn?.toUpperCase() === studentUsn.toUpperCase();
      return Boolean(matchId || matchEmail || matchUsn);
    };

    const matched = all.filter(matchesStudent);
    const fallbackList = matched.length > 0 ? matched : all.slice(0, 5);
    fallbackList.forEach((c) => {
      certMap.set(c.certificateId.toUpperCase(), c);
    });
  }

  return Array.from(certMap.values());
}

export async function generateCertificate(data: {
  eventId: string;
  eventName: string;
  studentId: string;
  recipientName: string;
  recipientEmail: string;
  usn: string;
  issuer?: string;
  issuerTitle?: string;
  coIssuer?: string;
  coIssuerTitle?: string;
  description?: string;
  certificateType?: string;
  awardTitle?: string;
  rank?: number;
  teamName?: string;
}): Promise<CertificateRecord> {
  const certCode = `CERT-${Math.floor(100000 + Math.random() * 900000)}-ET26`;
  const newCert: CertificateRecord = {
    id: `cert_${Date.now()}`,
    certificateId: certCode,
    eventId: data.eventId,
    eventName: data.eventName,
    recipientName: data.recipientName,
    recipientEmail: data.recipientEmail,
    studentId: data.studentId,
    recipientId: data.studentId,
    usn: data.usn,
    issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    issuer: data.issuer || 'Dr. Eleanor Vance',
    issuerTitle: data.issuerTitle || 'Chief Academic Officer',
    coIssuer: data.coIssuer || 'Marcus Sterling',
    coIssuerTitle: data.coIssuerTitle || 'Event Director',
    status: 'Verified',
    description: data.description || `For successfully completing and actively participating in ${data.eventName}.`,
    qrVerificationUrl: `http://localhost:5173/verify/${certCode}`,
    certificateType: data.certificateType || 'Participation',
    awardTitle: data.awardTitle,
    rank: data.rank,
    teamName: data.teamName,
  };

  const all = getLocalCertificates();
  saveLocalCertificates([newCert, ...all]);

  if (!isDemoMode) {
    try {
      await supabase.from('certificates').insert({
        event_id: data.eventId,
        student_id: data.studentId,
        certificate_id: certCode,
        certificate_url: newCert.qrVerificationUrl,
        certificate_type: newCert.certificateType,
        award_title: newCert.awardTitle,
        rank: newCert.rank,
        team_name: newCert.teamName,
      });
    } catch {
      // Ignore
    }
  }

  return newCert;
}

// ================= PUBLIC VERIFICATION =================

export interface VerificationResult {
  status: 'Valid' | 'Revoked' | 'Not Found';
  isValid: boolean;
  certificateId: string;
  recipientName?: string;
  eventName?: string;
  issuingOrganization?: string;
  issueDate?: string;
  certificateType?: string;
  awardTitle?: string;
  rank?: number;
  teamName?: string;
  revocationReason?: string;
  revokedAt?: string;
  message?: string;
}

export async function verifyCertificate(certificateId: string): Promise<VerificationResult> {
  const cleanId = certificateId.trim().toUpperCase();
  if (!cleanId) {
    return {
      status: 'Not Found',
      isValid: false,
      certificateId: '',
    };
  }

  // 1. Secure Backend Verification Endpoint (Supabase / Secure DB Layer)
  try {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      const isRevoked = data.status === 'Revoked' || !data.isValid;
      return {
        status: isRevoked ? 'Revoked' : 'Valid',
        isValid: !isRevoked,
        certificateId: data.certificateId || cleanId,
        recipientName: data.recipientName,
        eventName: data.eventName,
        issuingOrganization: data.issuingOrganization,
        issueDate: data.issueDate,
        certificateType: data.certificateType,
        awardTitle: data.awardTitle,
        rank: data.rank,
        teamName: data.teamName,
        revocationReason: data.revocationReason,
        revokedAt: data.revokedAt,
      };
    } else if (res.status === 404) {
      return {
        status: 'Not Found',
        isValid: false,
        certificateId: cleanId,
      };
    }
  } catch (backendErr) {
    console.warn('Backend verification query fallback:', backendErr);
  }

  // 2. Supabase Public Verification RPC (Direct Client Fallback)
  if (!isDemoMode) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('verify_certificate_public', {
        lookup_cert_id: cleanId,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        const r = rpcData[0];
        const isRevoked = r.status?.toLowerCase() === 'revoked' || !r.is_valid;
        return {
          status: isRevoked ? 'Revoked' : 'Valid',
          isValid: !isRevoked,
          certificateId: r.certificate_id,
          recipientName: r.recipient_name,
          eventName: r.event_title,
          issuingOrganization: 'Eventora Academic Credential Registry',
          issueDate: new Date(r.issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          certificateType: r.certificate_type || 'Participation',
          awardTitle: r.award_title,
          rank: r.rank,
        };
      }
    } catch {
      // Fallback
    }
  }

  // 3. Local Storage / Fallback
  const all = getLocalCertificates();
  const found = all.find((c) => c.certificateId.toUpperCase() === cleanId);

  if (found) {
    const isRevoked = found.status === 'Revoked';
    return {
      status: isRevoked ? 'Revoked' : 'Valid',
      isValid: !isRevoked,
      certificateId: found.certificateId,
      recipientName: found.recipientName,
      eventName: found.eventName,
      issuingOrganization: `${found.issuer} (${found.issuerTitle})`,
      issueDate: found.issueDate,
      certificateType: found.certificateType || 'Participation',
      awardTitle: found.awardTitle,
      rank: found.rank,
      teamName: found.teamName,
    };
  }

  return {
    status: 'Not Found',
    isValid: false,
    certificateId: cleanId,
  };
}

export async function revokeCertificate(
  certificateId: string,
  reason: string = 'Administrative policy audit',
  actor: string = 'Academic Authority'
): Promise<{ success: boolean; message: string }> {
  const cleanId = certificateId.trim().toUpperCase();
  try {
    const res = await fetch('/api/certificates/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateId: cleanId, reason, actor }),
    });
    if (res.ok) {
      const data = await res.json();
      const all = getLocalCertificates();
      const updated = all.map((c) => (c.certificateId.toUpperCase() === cleanId ? { ...c, status: 'Revoked' as const } : c));
      saveLocalCertificates(updated);
      return { success: true, message: data.message || `Certificate ${cleanId} has been revoked.` };
    }
  } catch (err) {
    console.warn('API revoke error, falling back locally:', err);
  }

  const all = getLocalCertificates();
  const updated = all.map((c) => (c.certificateId.toUpperCase() === cleanId ? { ...c, status: 'Revoked' as const } : c));
  saveLocalCertificates(updated);
  return { success: true, message: `Certificate ${cleanId} marked as Revoked.` };
}

export async function reissueCertificate(
  certificateId: string,
  actor: string = 'Academic Authority'
): Promise<{ success: boolean; message: string }> {
  const cleanId = certificateId.trim().toUpperCase();
  try {
    const res = await fetch('/api/certificates/reissue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateId: cleanId, actor }),
    });
    if (res.ok) {
      const data = await res.json();
      const all = getLocalCertificates();
      const updated = all.map((c) => (c.certificateId.toUpperCase() === cleanId ? { ...c, status: 'Verified' as const } : c));
      saveLocalCertificates(updated);
      return { success: true, message: data.message || `Certificate ${cleanId} has been reinstated.` };
    }
  } catch (err) {
    console.warn('API reissue error, falling back locally:', err);
  }

  const all = getLocalCertificates();
  const updated = all.map((c) => (c.certificateId.toUpperCase() === cleanId ? { ...c, status: 'Verified' as const } : c));
  saveLocalCertificates(updated);
  return { success: true, message: `Certificate ${cleanId} reinstated to Verified.` };
}

// ================= BATCH GENERATION =================

export async function batchGenerateCertificates(params: {
  eventId: string;
  templateConfig: CertificateTemplateConfig;
  eligibilityRules?: any;
  approvedStudentIds?: string[];
  certificateType?: string;
}): Promise<any> {
  const res = await fetch('/api/certificates/generate-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to generate certificates');
  }
  return res.json();
}

// ================= CERTIFICATE TEMPLATE CONFIG =================

export interface CertificateTemplateConfig {
  id?: string;
  eventId?: string;
  title: string;
  subtitle: string;
  eventName: string;
  description: string;
  issueDate: string;
  sampleRecipient: string;
  sampleUsn: string;
  logoType: 'eventora' | 'dr_ait' | 'university' | 'custom';
  customLogoUrl?: string;
  theme: 'classic' | 'modern' | 'executive';
  issuerName: string;
  issuerTitle: string;
  coIssuerName: string;
  coIssuerTitle: string;
  certificateType?: string;
  awardTitle?: string;
  rank?: number;
  teamName?: string;
  eligibilityRules: {
    requireRegistration: boolean;
    requireDynamicQR: boolean;
    requireApproval: boolean;
    minAttendancePercent: number;
  };
}

export const DEFAULT_CERTIFICATE_TEMPLATE: CertificateTemplateConfig = {
  title: 'Certificate of Excellence',
  subtitle: 'This is proudly presented to',
  eventName: 'Annual Tech Fest 2026',
  description: 'For active participation, outstanding performance, and demonstrated technical competency in the campus symposium.',
  issueDate: 'October 15, 2026',
  sampleRecipient: 'Poorvika Gowda',
  sampleUsn: '1DA22CS042',
  logoType: 'eventora',
  theme: 'classic',
  issuerName: 'Dr. Eleanor Vance',
  issuerTitle: 'Chief Academic Officer',
  coIssuerName: 'Marcus Sterling',
  coIssuerTitle: 'Event Director',
  certificateType: 'Participation',
  eligibilityRules: {
    requireRegistration: true,
    requireDynamicQR: true,
    requireApproval: true,
    minAttendancePercent: 80
  }
};

export async function saveCertificateTemplate(template: CertificateTemplateConfig): Promise<void> {
  const key = template.eventId ? `eventora_cert_template_${template.eventId}` : 'eventora_cert_template_default';
  localStorage.setItem(key, JSON.stringify(template));
  localStorage.setItem('eventora_cert_template_default', JSON.stringify(template));

  // Sync to Supabase certificate_templates table
  if (!isDemoMode && template.eventId) {
    try {
      await supabase.from('certificate_templates').upsert({
        event_id: template.eventId,
        title: template.title,
        subtitle: template.subtitle,
        description: template.description,
        logo_type: template.logoType,
        theme: template.theme,
        issuer_name: template.issuerName,
        issuer_title: template.issuerTitle,
        co_issuer_name: template.coIssuerName,
        co_issuer_title: template.coIssuerTitle,
        eligibility_rules: template.eligibilityRules,
        updated_at: new Date().toISOString()
      }, { onConflict: 'event_id' });
    } catch (err) {
      console.warn('Supabase certificate template sync fallback:', err);
    }
  }
}

export function loadCertificateTemplate(eventId?: string): CertificateTemplateConfig {
  if (eventId) {
    const eventSpecific = localStorage.getItem(`eventora_cert_template_${eventId}`);
    if (eventSpecific) {
      try {
        return JSON.parse(eventSpecific);
      } catch {
        // Fallback
      }
    }
  }
  const savedDefault = localStorage.getItem('eventora_cert_template_default');
  if (savedDefault) {
    try {
      return JSON.parse(savedDefault);
    } catch {
      // Fallback
    }
  }
  return DEFAULT_CERTIFICATE_TEMPLATE;
}

export async function fetchCertificateTemplate(eventId?: string): Promise<CertificateTemplateConfig> {
  if (!isDemoMode && eventId) {
    try {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (!error && data) {
        const tpl: CertificateTemplateConfig = {
          id: data.id,
          eventId: data.event_id,
          title: data.title,
          subtitle: data.subtitle || 'This is proudly presented to',
          eventName: '',
          description: data.description || '',
          issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          sampleRecipient: 'Poorvika Gowda',
          sampleUsn: '1DA22CS042',
          logoType: data.logo_type || 'eventora',
          theme: data.theme || 'classic',
          issuerName: data.issuer_name,
          issuerTitle: data.issuer_title,
          coIssuerName: data.co_issuer_name || '',
          coIssuerTitle: data.co_issuer_title || '',
          eligibilityRules: data.eligibility_rules || DEFAULT_CERTIFICATE_TEMPLATE.eligibilityRules
        };
        saveCertificateTemplate(tpl);
        return tpl;
      }
    } catch {
      // Fallback
    }
  }
  return loadCertificateTemplate(eventId);
}
