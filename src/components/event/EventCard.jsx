import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const EventCard = ({ event, onQuickPass }) => {
  const { currentUser, isAdmin } = useAuth();
  const { isRegistered, registerForEvent } = useEvents();

  const registered = isRegistered(event.id, currentUser?.id);
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const handleRegister = (e) => {
    e.preventDefault();
    e.stopPropagation();
    registerForEvent(event.id, currentUser?.id, currentUser?.email, currentUser?.name);
  };

  const detailsPath = isAdmin ? `/admin/events/${event.id}` : `/student/events/${event.id}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-surface-container-high/60 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col group">
      {/* Thumbnail Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-primary-container">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            {event.category}
          </span>
          {event.isLive && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-full backdrop-blur-md font-bold text-[11px] shadow-xs flex items-center gap-1 ${
            event.price === 'Free' || !event.price
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-950/85 text-amber-300 border border-amber-500/40'
          }`}>
            <span className="material-symbols-outlined text-[13px]">
              {event.price === 'Free' || !event.price ? 'card_giftcard' : 'payments'}
            </span>
            <span>{event.price || 'Free'}</span>
          </span>
        </div>

        {/* Date on banner bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {event.displayDate}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {event.startTime}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-space-lg flex-1 flex flex-col justify-between">
        <div>
          <Link to={detailsPath}>
            <h3 className="font-headline-sm text-primary font-bold line-clamp-2 hover:text-secondary transition-colors mb-1">
              {event.title}
            </h3>
          </Link>
          <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 text-body-sm text-outline mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span className="truncate">{event.venue} ({event.building})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-outline">business</span>
              <span className="truncate">{event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="pt-3 border-t border-surface-container-high/60">
          <div className="flex items-center justify-between text-xs text-outline mb-1.5 font-medium">
            <span>Capacity</span>
            <span className="text-primary font-bold">
              {event.registeredCount} / {event.capacity} ({seatsLeft} seats left)
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercent > 90 ? 'bg-amber-500' : 'bg-secondary'
              }`}
              style={{ width: `${fillPercent}%` }}
            ></div>
          </div>

          {/* Action CTAs */}
          <div className="mt-4 flex items-center gap-2">
            <Link
              to={detailsPath}
              className="flex-1 py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm font-semibold transition-colors text-center"
            >
              View Details
            </Link>

            {registered ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onQuickPass) onQuickPass(event);
                }}
                className="py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-label-sm font-bold flex items-center gap-1 transition-colors shadow-xs"
                title="View Attendance QR Pass"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Registered ✓</span>
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={seatsLeft === 0}
                className="py-2 px-4 rounded-xl bg-secondary hover:bg-secondary-container disabled:bg-surface-container-high disabled:text-outline text-white font-label-sm font-bold transition-all shadow-xs"
              >
                {seatsLeft === 0 ? 'Waitlist' : 'Register'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
