import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_ATTENDANCE, AttendanceRecord } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_attendance';

function getLocalAttendance(): AttendanceRecord[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
  return INITIAL_ATTENDANCE;
}

function saveLocalAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

export async function getMyAttendance(studentId: string): Promise<AttendanceRecord[]> {
  const all = getLocalAttendance();
  if (isDemoMode) {
    return all.filter((a) => a.studentId === studentId);
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, events(title)')
      .eq('student_id', studentId);

    if (error || !data || data.length === 0) {
      return all.filter((a) => a.studentId === studentId);
    }

    return data.map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      studentName: 'Student',
      usn: '',
      eventId: d.event_id,
      eventName: d.events?.title || 'Campus Event',
      date: new Date(d.scanned_at).toISOString().split('T')[0],
      time: new Date(d.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: d.status === 'present' ? 'Present' : 'Late',
      method: (d.verification_method === 'qr' ? 'Dynamic QR' : 'Manual Entry') as any
    }));
  } catch {
    return all.filter((a) => a.studentId === studentId);
  }
}

export async function getEventAttendance(eventId: string): Promise<AttendanceRecord[]> {
  const all = getLocalAttendance();
  if (isDemoMode) {
    return all.filter((a) => a.eventId === eventId);
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, profiles(name, usn)')
      .eq('event_id', eventId);

    if (error || !data || data.length === 0) {
      return all.filter((a) => a.eventId === eventId);
    }

    return data.map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      studentName: d.profiles?.name || 'Student',
      usn: d.profiles?.usn || '',
      eventId: d.event_id,
      eventName: 'Campus Event',
      date: new Date(d.scanned_at).toISOString().split('T')[0],
      time: new Date(d.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      method: 'Dynamic QR'
    }));
  } catch {
    return all.filter((a) => a.eventId === eventId);
  }
}

export async function createAttendanceSession(eventId: string): Promise<{
  sessionId: string;
  token: string;
  expiresIn: number;
}> {
  const token = 'TOK-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
  const sessionId = `sess_${Date.now()}`;

  if (!isDemoMode) {
    try {
      await supabase.from('attendance_sessions').insert({
        id: sessionId,
        event_id: eventId,
        token: token,
        active: true,
        expires_at: new Date(Date.now() + 15000).toISOString()
      });
    } catch {
      // Ignore
    }
  }

  return {
    sessionId,
    token,
    expiresIn: 15
  };
}

export async function validateAttendanceQR(data: {
  eventId: string;
  studentId: string;
  studentName: string;
  usn: string;
  token?: string;
  method?: string;
}): Promise<{ success: boolean; status: string; message: string; record?: AttendanceRecord }> {
  const all = getLocalAttendance();

  // Check duplicate
  const alreadyMarked = all.some(
    (a) => a.eventId === data.eventId && (a.studentId === data.studentId || a.usn === data.usn)
  );

  if (alreadyMarked) {
    return {
      success: false,
      status: 'Duplicate',
      message: `${data.studentName} is already checked in for this event.`
    };
  }

  const now = new Date();
  const newRecord: AttendanceRecord = {
    id: `att_${Date.now()}`,
    studentId: data.studentId,
    studentName: data.studentName,
    usn: data.usn,
    eventId: data.eventId,
    eventName: 'Campus Event',
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Present',
    method: (data.method as any) || 'Dynamic QR'
  };

  saveLocalAttendance([newRecord, ...all]);

  if (!isDemoMode) {
    try {
      await supabase.from('attendance').insert({
        event_id: data.eventId,
        student_id: data.studentId,
        status: 'present',
        verification_method: 'qr'
      });
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    status: 'Present',
    message: `Attendance marked successfully for ${data.studentName}!`,
    record: newRecord
  };
}

export async function endAttendanceSession(sessionId: string): Promise<boolean> {
  if (!isDemoMode) {
    try {
      await supabase.from('attendance_sessions').update({ active: false }).eq('id', sessionId);
    } catch {
      // Ignore
    }
  }
  return true;
}

export function subscribeToAttendance(onUpdate: (payload: any) => void) {
  if (isDemoMode) return () => {};

  const channel = supabase
    .channel('public:attendance')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'attendance' },
      (payload) => onUpdate(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
