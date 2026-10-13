import { supabase, isDemoMode } from '../lib/supabase';

export interface Assignment {
  id: string;
  eventId?: string;
  eventTitle?: string;
  title: string;
  description: string;
  dueDate: string;
  attachmentUrl?: string;
  createdBy?: string;
  createdAt?: string;
  submissionCount?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentUsn?: string;
  studentAvatar?: string;
  submissionUrl: string;
  fileName?: string;
  notes?: string;
  status: 'submitted' | 'graded' | 'resubmission_required';
  grade?: string;
  feedback?: string;
  submittedAt: string;
}

const LOCAL_ASSIGNMENTS_KEY = 'eventora_assignments';
const LOCAL_SUBMISSIONS_KEY = 'eventora_assignment_submissions';

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_101',
    eventId: 'evt_ait_hackathon',
    eventTitle: 'AI & Autonomous Agents Hackathon (Dr. AIT SJB Lab)',
    title: 'Hackathon Architecture Blueprint & 4-Slide Pitch Deck',
    description: 'Submit your team 4-slide pitch deck (.pdf) and system architecture diagram detailing your autonomous agentic workflow for the Dr. AIT Hackathon in Silver Jubilee Building.',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    attachmentUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString(),
    submissionCount: 14
  },
  {
    id: 'asg_102',
    eventId: 'evt_library_symposium',
    eventTitle: 'Dr. Ambedkar Centenary Bhavan National Research Symposium',
    title: 'IEEE Double-Column Research Paper Draft & Literature Review',
    description: 'Upload your 6-page IEEE manuscript draft (.pdf) and literature review for oral presentation in the Centenary Bhavan Digital Library & IEEE Vault.',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
    attachmentUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString(),
    submissionCount: 9
  },
  {
    id: 'asg_103',
    eventId: 'evt_acts_pitch',
    eventTitle: 'Ambedkar Centre for Tech Startup (ACTS) Seed Pitch',
    title: 'Startup Business Model Canvas & Prototype Video Walkthrough',
    description: 'Submit your Lean Canvas (.pdf) and 3-minute working MVP video link for evaluation by the Dr. AIT Incubation Cell investment committee.',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // Past deadline
    attachmentUrl: '',
    createdAt: new Date().toISOString(),
    submissionCount: 22
  }
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub_001',
    assignmentId: 'asg_101',
    studentId: 'a0000000-0000-0000-0000-000000000001',
    studentName: 'Alexander Wright',
    studentUsn: '1DA22CS042',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    submissionUrl: 'https://example.com/submissions/alexander_pitch.pdf',
    fileName: 'alexander_eventora_pitch.pdf',
    notes: 'Includes full distributed database replication diagram and latency analysis.',
    status: 'graded',
    grade: 'A+ (98/100)',
    feedback: 'Exceptional architecture layout. Strong attention to offline-first cache strategies.',
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

function getLocalAssignments(): Assignment[] {
  const saved = localStorage.getItem(LOCAL_ASSIGNMENTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Auto-migrate if legacy mock assignments detected
      const isLegacy = parsed.some((a: any) =>
        a.eventTitle?.includes('Cyber Defense') ||
        a.eventTitle?.includes('National Tech Symposium & Hackathon 2026')
      );
      if (!isLegacy && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
  return INITIAL_ASSIGNMENTS;
}

function saveLocalAssignments(assignments: Assignment[]) {
  localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

function getLocalSubmissions(): AssignmentSubmission[] {
  const saved = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
  return INITIAL_SUBMISSIONS;
}

function saveLocalSubmissions(subs: AssignmentSubmission[]) {
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs));
}

/**
 * Fetch all assignments, optionally filtered by event
 */
export async function getAssignments(eventId?: string): Promise<Assignment[]> {
  const local = getLocalAssignments();
  if (isDemoMode) {
    return eventId ? local.filter((a) => a.eventId === eventId) : local;
  }

  try {
    let query = supabase
      .from('assignments')
      .select('*, events(title), assignment_submissions(count)')
      .order('due_date', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return eventId ? local.filter((a) => a.eventId === eventId) : local;
    }

    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      eventTitle: d.events?.title || 'Campus Event',
      title: d.title,
      description: d.description || '',
      dueDate: d.due_date,
      attachmentUrl: d.attachment_url,
      createdBy: d.created_by,
      createdAt: d.created_at,
      submissionCount: d.assignment_submissions ? d.assignment_submissions.length || 0 : 0
    }));
  } catch {
    return eventId ? local.filter((a) => a.eventId === eventId) : local;
  }
}

/**
 * Create a new assignment
 */
export async function createAssignment(payload: {
  title: string;
  description: string;
  dueDate: string;
  eventId?: string;
  eventTitle?: string;
  attachmentUrl?: string;
  createdBy?: string;
}): Promise<Assignment> {
  const newAssignment: Assignment = {
    id: `asg_${Date.now()}`,
    eventId: payload.eventId,
    eventTitle: payload.eventTitle || 'Campus Event',
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    attachmentUrl: payload.attachmentUrl,
    createdBy: payload.createdBy,
    createdAt: new Date().toISOString(),
    submissionCount: 0
  };

  if (!isDemoMode) {
    try {
      const { data, error } = await supabase.from('assignments').insert({
        event_id: payload.eventId || null,
        title: payload.title,
        description: payload.description,
        due_date: payload.dueDate,
        attachment_url: payload.attachmentUrl || null,
        created_by: payload.createdBy || null
      }).select().single();

      if (!error && data) {
        newAssignment.id = data.id;
      }
    } catch {
      // Continue with local save
    }
  }

  const current = getLocalAssignments();
  saveLocalAssignments([newAssignment, ...current]);
  return newAssignment;
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(id: string): Promise<boolean> {
  const current = getLocalAssignments();
  saveLocalAssignments(current.filter((a) => a.id !== id));

  if (!isDemoMode) {
    try {
      await supabase.from('assignments').delete().eq('id', id);
    } catch {
      // Fallback
    }
  }
  return true;
}

/**
 * Fetch all submissions for an assignment (for instructors/admins)
 */
export async function getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
  const local = getLocalSubmissions().filter((s) => s.assignmentId === assignmentId);
  if (isDemoMode) return local;

  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*, profiles(name, usn, avatar_url)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return local;
    }

    return data.map((d: any) => ({
      id: d.id,
      assignmentId: d.assignment_id,
      studentId: d.student_id,
      studentName: d.profiles?.name || 'Student',
      studentUsn: d.profiles?.usn || '',
      studentAvatar: d.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      submissionUrl: d.submission_url,
      fileName: d.file_name || 'submission_file',
      notes: d.notes || '',
      status: d.status || 'submitted',
      grade: d.grade,
      feedback: d.feedback,
      submittedAt: d.submitted_at
    }));
  } catch {
    return local;
  }
}

/**
 * Fetch individual student submission
 */
export async function getMySubmission(
  assignmentId: string,
  studentId: string
): Promise<AssignmentSubmission | null> {
  const local = getLocalSubmissions().find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId
  );
  if (isDemoMode) return local || null;

  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .match({ assignment_id: assignmentId, student_id: studentId })
      .maybeSingle();

    if (error || !data) return local || null;

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      submissionUrl: data.submission_url,
      fileName: data.file_name || 'submission_file',
      notes: data.notes || '',
      status: data.status || 'submitted',
      grade: data.grade,
      feedback: data.feedback,
      submittedAt: data.submitted_at
    };
  } catch {
    return local || null;
  }
}

/**
 * Submit an assignment
 */
export async function submitAssignment(payload: {
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentUsn?: string;
  studentAvatar?: string;
  submissionUrl: string;
  fileName?: string;
  notes?: string;
}): Promise<AssignmentSubmission> {
  const current = getLocalSubmissions();
  const existingIdx = current.findIndex(
    (s) => s.assignmentId === payload.assignmentId && s.studentId === payload.studentId
  );

  const subRecord: AssignmentSubmission = {
    id: existingIdx !== -1 ? current[existingIdx].id : `sub_${Date.now()}`,
    assignmentId: payload.assignmentId,
    studentId: payload.studentId,
    studentName: payload.studentName || 'Alexander Wright',
    studentUsn: payload.studentUsn || '1MS22CS042',
    studentAvatar: payload.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    submissionUrl: payload.submissionUrl,
    fileName: payload.fileName || 'assignment_submission',
    notes: payload.notes || '',
    status: 'submitted',
    submittedAt: new Date().toISOString()
  };

  if (!isDemoMode) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert(
          {
            assignment_id: payload.assignmentId,
            student_id: payload.studentId,
            submission_url: payload.submissionUrl,
            file_name: payload.fileName || 'submission_file',
            notes: payload.notes || null,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'assignment_id,student_id' }
        )
        .select()
        .single();

      if (!error && data) {
        subRecord.id = data.id;
      }
    } catch {
      // Continue with local save
    }
  }

  if (existingIdx !== -1) {
    current[existingIdx] = subRecord;
    saveLocalSubmissions([...current]);
  } else {
    saveLocalSubmissions([subRecord, ...current]);
  }

  return subRecord;
}

/**
 * Grade a student submission (for instructors/admins)
 */
export async function gradeSubmission(
  submissionId: string,
  grade: string,
  feedback: string,
  studentId?: string,
  assignmentTitle?: string
): Promise<boolean> {
  const current = getLocalSubmissions();
  const index = current.findIndex((s) => s.id === submissionId);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      grade,
      feedback,
      status: 'graded'
    };
    saveLocalSubmissions([...current]);
  }

  if (!isDemoMode) {
    try {
      await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          status: 'graded',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      // Create in-app notification for the student
      if (studentId) {
        await supabase.from('notifications').insert({
          user_id: studentId,
          title: 'Assignment Graded',
          message: `Your submission for "${assignmentTitle || 'Assignment'}" has been graded: ${grade}.`,
          type: 'assignment'
        });
      }
    } catch {
      // Handled
    }
  }

  return true;
}
