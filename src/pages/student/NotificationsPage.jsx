import React from 'react';
import { useEvents } from '../../context/EventContext';

export const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useEvents();

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Campus Broadcast Center
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            Notifications & Event Alerts
          </h1>
          <p className="text-body-md text-outline">
            Stay updated with registration confirmations, start-time reminders, and issued credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsRead}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary text-body-sm font-bold transition-colors"
              >
                Mark All Read
              </button>
              <button
                onClick={clearNotifications}
                className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-error text-body-sm font-semibold transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm divide-y divide-surface-container-high overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-outline">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">notifications_off</span>
            <p className="text-lg font-bold text-primary">No Notifications</p>
            <p className="text-body-sm">You are completely up to date with your events and certificates.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 transition-colors cursor-pointer flex items-start gap-4 hover:bg-surface-container-low/50 ${
                !notif.isRead ? 'bg-secondary-fixed/15' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px]">
                  {notif.type === 'registration'
                    ? 'confirmation_number'
                    : notif.type === 'certificate'
                    ? 'workspace_premium'
                    : notif.type === 'recommendation'
                    ? 'auto_awesome'
                    : 'notifications'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-body-md font-bold text-primary flex items-center gap-2">
                    {notif.title}
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    )}
                  </h4>
                  <span className="text-xs text-outline">{notif.createdAt}</span>
                </div>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
