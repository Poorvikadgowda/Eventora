import { supabase, isDemoMode } from '../lib/supabase';
import { INITIAL_NOTIFICATIONS, NotificationRecord } from './demoData';

const LOCAL_STORAGE_KEY = 'eventora_notifications';

function getLocalNotifications(): NotificationRecord[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
}

function saveLocalNotifications(notifs: NotificationRecord[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifs));
}

export async function getNotifications(userId?: string): Promise<NotificationRecord[]> {
  const all = getLocalNotifications();
  if (isDemoMode) {
    return userId ? all.filter((n) => !n.userId || n.userId === userId) : all;
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return userId ? all.filter((n) => !n.userId || n.userId === userId) : all;
    }

    return data.map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      message: d.message,
      type: (d.type as any) || 'event',
      isRead: d.is_read,
      createdAt: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  } catch {
    return userId ? all.filter((n) => !n.userId || n.userId === userId) : all;
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  const all = getLocalNotifications();
  saveLocalNotifications(
    all.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
  );

  if (!isDemoMode) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    } catch {
      // Ignore
    }
  }
}

export async function markAllAsRead(userId?: string): Promise<void> {
  const all = getLocalNotifications();
  saveLocalNotifications(all.map((n) => ({ ...n, isRead: true })));

  if (!isDemoMode && userId) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    } catch {
      // Ignore
    }
  }
}

export async function createNotification(data: {
  userId?: string;
  title: string;
  message: string;
  type?: 'registration' | 'event' | 'certificate' | 'recommendation' | 'alert' | 'system';
}): Promise<NotificationRecord> {
  const newNotif: NotificationRecord = {
    id: `notif_${Date.now()}`,
    userId: data.userId || 'usr_alex_01',
    title: data.title,
    message: data.message,
    type: data.type || 'event',
    isRead: false,
    createdAt: 'Just now'
  };

  const all = getLocalNotifications();
  saveLocalNotifications([newNotif, ...all]);

  if (!isDemoMode) {
    try {
      await supabase.from('notifications').insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'event'
      });
    } catch {
      // Ignore
    }
  }

  return newNotif;
}

export function subscribeToNotifications(userId: string, onUpdate: (payload: any) => void) {
  if (isDemoMode) return () => {};

  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => onUpdate(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
