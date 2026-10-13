import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_FEEDBACK, FeedbackRecord } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_feedback';

function getLocalFeedback(): FeedbackRecord[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK));
  return INITIAL_FEEDBACK;
}

function saveLocalFeedback(records: FeedbackRecord[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}

export async function submitFeedback(data: {
  eventId: string;
  eventName: string;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  overallRating: number;
  organizationRating: number;
  speakerRating: number;
  venueRating: number;
  contentRating: number;
  comment?: string;
}): Promise<FeedbackRecord> {
  const newRecord: FeedbackRecord = {
    id: `fb_${Date.now()}`,
    eventId: data.eventId,
    eventName: data.eventName,
    studentId: data.studentId || 'usr_alex_01',
    studentName: data.studentName || 'Alexander Wright',
    studentAvatar: data.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    overallRating: data.overallRating || 5,
    organizationRating: data.organizationRating || 5,
    speakerRating: data.speakerRating || 5,
    venueRating: data.venueRating || 5,
    contentRating: data.contentRating || 5,
    comment: data.comment || '',
    createdAt: new Date().toISOString(),
    sentiment: data.overallRating >= 4 ? 'Positive' : (data.overallRating === 3 ? 'Neutral' : 'Negative')
  };

  const all = getLocalFeedback();
  saveLocalFeedback([newRecord, ...all]);

  if (!isDemoMode) {
    try {
      await supabase.from('feedback').insert({
        event_id: data.eventId,
        student_id: data.studentId || 'usr_alex_01',
        rating: data.overallRating,
        organization_rating: data.organizationRating,
        speaker_rating: data.speakerRating,
        venue_rating: data.venueRating,
        content_rating: data.contentRating,
        comment: data.comment
      });
    } catch {
      // Ignore
    }
  }

  return newRecord;
}

export async function getEventFeedback(eventId: string): Promise<FeedbackRecord[]> {
  const all = getLocalFeedback();
  if (isDemoMode) {
    return all.filter((f) => f.eventId === eventId);
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, profiles(name, avatar_url)')
      .eq('event_id', eventId);

    if (error || !data || data.length === 0) {
      return all.filter((f) => f.eventId === eventId);
    }

    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      eventName: 'Campus Event',
      studentName: d.profiles?.name || 'Student Attendee',
      studentAvatar: d.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      overallRating: d.rating,
      organizationRating: d.organization_rating,
      speakerRating: d.speaker_rating,
      venueRating: d.venue_rating,
      contentRating: d.content_rating,
      comment: d.comment || '',
      createdAt: d.created_at,
      sentiment: d.rating >= 4 ? 'Positive' : 'Neutral'
    }));
  } catch {
    return all.filter((f) => f.eventId === eventId);
  }
}

export async function getMyFeedback(studentId: string): Promise<FeedbackRecord[]> {
  const all = getLocalFeedback();
  return all.filter((f) => f.studentId === studentId);
}
