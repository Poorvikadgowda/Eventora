import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_EVENTS, EventoraEvent } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_events';

function getLocalEvents(): EventoraEvent[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
  return INITIAL_EVENTS;
}

function saveLocalEvents(events: EventoraEvent[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
}

export async function getEvents(): Promise<EventoraEvent[]> {
  if (isDemoMode) {
    return getLocalEvents();
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) {
      return getLocalEvents();
    }

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      category: d.category || 'Technical',
      date: d.date,
      displayDate: d.date,
      startTime: d.start_time || '09:00 AM',
      endTime: d.end_time || '05:00 PM',
      venue: d.venue || 'Auditorium A',
      building: 'Tech Center',
      organizer: 'Dept. of Eventora',
      capacity: d.capacity || 100,
      registeredCount: 0,
      attendanceCount: 0,
      status: d.status === 'published' ? 'Published' : 'Draft',
      isLive: d.status === 'ongoing',
      price: 'Free',
      department: 'Computer Science',
      image: d.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
      speakers: [],
      agenda: [],
      features: {
        enableQR: true,
        enableCertificate: true,
        enableFeedback: true,
        enableNotifications: true,
        enableAICopilot: true
      },
      successScore: 90.0
    }));
  } catch {
    return getLocalEvents();
  }
}

export async function getPublishedEvents(): Promise<EventoraEvent[]> {
  const allEvents = await getEvents();
  return allEvents.filter((e) => e.status.toLowerCase() === 'published');
}

export async function getEventById(id: string): Promise<EventoraEvent | null> {
  const events = await getEvents();
  const found = events.find((e) => e.id === id);
  return found || null;
}

export async function createEvent(data: Partial<EventoraEvent>): Promise<EventoraEvent> {
  const newId = `evt_${Date.now()}`;
  const newEvent: EventoraEvent = {
    id: newId,
    title: data.title || 'Untitled Event',
    description: data.description || '',
    category: data.category || 'Technical',
    date: data.date || new Date().toISOString().split('T')[0],
    displayDate: data.date || new Date().toISOString().split('T')[0],
    startTime: data.startTime || '09:00 AM',
    endTime: data.endTime || '05:00 PM',
    venue: data.venue || 'Auditorium A',
    building: data.building || 'Tech Center',
    organizer: data.organizer || 'Eventora Department',
    capacity: Number(data.capacity) || 100,
    registeredCount: 0,
    attendanceCount: 0,
    status: data.status || 'Published',
    isLive: false,
    price: data.price || 'Free',
    department: data.department || 'Computer Science',
    image: data.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
    speakers: data.speakers || ['Distinguished Speaker'],
    agenda: data.agenda || [{ time: '09:00 AM', title: 'Inauguration' }],
    features: data.features || {
      enableQR: true,
      enableCertificate: true,
      enableFeedback: true,
      enableNotifications: true,
      enableAICopilot: true
    },
    successScore: 88.0,
    matchReason: 'Newly created campus event.'
  };

  if (!isDemoMode) {
    try {
      await supabase.from('events').insert({
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category,
        date: newEvent.date,
        start_time: newEvent.startTime,
        end_time: newEvent.endTime,
        venue: newEvent.venue,
        capacity: newEvent.capacity,
        status: newEvent.status.toLowerCase(),
        image_url: newEvent.image
      });
    } catch {
      // Continue with local save
    }
  }

  const current = getLocalEvents();
  saveLocalEvents([newEvent, ...current]);
  return newEvent;
}

export async function updateEvent(id: string, data: Partial<EventoraEvent>): Promise<EventoraEvent | null> {
  const current = getLocalEvents();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated = { ...current[index], ...data };
  current[index] = updated;
  saveLocalEvents(current);

  if (!isDemoMode) {
    try {
      await supabase.from('events').update({
        title: updated.title,
        description: updated.description,
        capacity: updated.capacity,
        status: updated.status.toLowerCase()
      }).eq('id', id);
    } catch {
      // Ignore
    }
  }

  return updated;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const current = getLocalEvents();
  saveLocalEvents(current.filter((e) => e.id !== id));

  if (!isDemoMode) {
    try {
      await supabase.from('events').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }

  return true;
}
