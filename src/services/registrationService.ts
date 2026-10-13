import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_REGISTRATIONS, Registration } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_registrations';

function getLocalRegistrations(): Registration[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
  return INITIAL_REGISTRATIONS;
}

function saveLocalRegistrations(regs: Registration[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(regs));
}

export async function getMyRegistrations(studentId: string): Promise<Registration[]> {
  const all = getLocalRegistrations();
  if (isDemoMode) {
    return all.filter((r) => r.studentId === studentId);
  }

  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('student_id', studentId);

    if (error || !data || data.length === 0) {
      return all.filter((r) => r.studentId === studentId);
    }

    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      status: d.status,
      registeredAt: d.registered_at
    }));
  } catch {
    return all.filter((r) => r.studentId === studentId);
  }
}

export async function getEventRegistrations(eventId: string): Promise<Registration[]> {
  const all = getLocalRegistrations();
  if (isDemoMode) {
    return all.filter((r) => r.eventId === eventId);
  }

  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId);

    if (error || !data || data.length === 0) {
      return all.filter((r) => r.eventId === eventId);
    }

    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      status: d.status,
      registeredAt: d.registered_at
    }));
  } catch {
    return all.filter((r) => r.eventId === eventId);
  }
}

export async function registerForEvent(
  eventId: string,
  studentId: string
): Promise<{ success: boolean; message: string; registration?: Registration }> {
  const all = getLocalRegistrations();

  // Check duplicate
  const exists = all.some((r) => r.eventId === eventId && r.studentId === studentId);
  if (exists) {
    return {
      success: false,
      message: 'You are already registered for this event.'
    };
  }

  const newReg: Registration = {
    id: `reg_${Date.now()}`,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString()
  };

  saveLocalRegistrations([...all, newReg]);

  if (!isDemoMode) {
    try {
      await supabase.from('event_registrations').insert({
        event_id: eventId,
        student_id: studentId,
        status: 'confirmed'
      });
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    message: 'Registration confirmed successfully!',
    registration: newReg
  };
}

export async function cancelRegistration(
  eventId: string,
  studentId: string
): Promise<{ success: boolean; message: string }> {
  const all = getLocalRegistrations();
  saveLocalRegistrations(all.filter((r) => !(r.eventId === eventId && r.studentId === studentId)));

  if (!isDemoMode) {
    try {
      await supabase
        .from('event_registrations')
        .delete()
        .match({ event_id: eventId, student_id: studentId });
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    message: 'Registration cancelled.'
  };
}

// Realtime listener for registrations
export function subscribeToRegistrations(onUpdate: (payload: any) => void) {
  if (isDemoMode) return () => {};

  const channel = supabase
    .channel('public:event_registrations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'event_registrations' },
      (payload) => onUpdate(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
