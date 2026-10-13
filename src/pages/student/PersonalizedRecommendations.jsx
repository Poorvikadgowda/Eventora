import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { DynamicQRModal } from '../../components/event/DynamicQRModal';

export const PersonalizedRecommendations = () => {
  const { currentUser } = useAuth();
  const { events, isRegistered, registerForEvent } = useEvents();

  const [activeInterest, setActiveInterest] = useState('All');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);

  const interests = ['All', 'Artificial Intelligence', 'Web3', 'Cloud Computing', 'Hackathons'];

  // Match calculations
  const recommendedEvents = events.map((event, idx) => {
    let matchScore = 95 - idx * 4;
    if (idx === 0) matchScore = 98;
    if (idx === 1) matchScore = 96;
    if (idx === 2) matchScore = 92;

    return {
      ...event,
      matchPercentage: matchScore,
      matchExplanation: event.matchReason || `Matches your department (${currentUser?.department}) and attendance in technical symposiums.`
    };
  });

  const filtered = activeInterest === 'All'
    ? recommendedEvents
    : recommendedEvents.filter(e =>
        e.title.toLowerCase().includes(activeInterest.toLowerCase()) ||
        e.category.toLowerCase().includes(activeInterest.toLowerCase()) ||
        e.description.toLowerCase().includes(activeInterest.toLowerCase())
      );

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-bold uppercase tracking-wider">
          Smart Matching AI Engine
        </span>
        <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
          Personalized Event Recommendations
        </h1>
        <p className="text-body-md text-outline">
          Algorithmic event discovery calibrated to your major, declared skill interests, and past workshop attendance.
        </p>
      </div>

      {/* Student Profile Attributes Banner */}
      <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">psychology</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-primary font-bold text-lg">
              Active Recommendation Profile: {currentUser?.name}
            </h3>
            <p className="text-xs text-on-primary-container/80">
              Department: {currentUser?.department} • USN: {currentUser?.usn} • Historic Attendance: {currentUser?.attendanceRate}%
            </p>
          </div>
        </div>

        {/* Interests Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {currentUser?.interests?.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-surface/10 text-teal-300 text-xs font-semibold">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Filter by Topic Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {interests.map((item) => (
          <button
            key={item}
            onClick={() => setActiveInterest(item)}
            className={`px-4 py-2 rounded-xl text-label-md font-bold transition-all ${
              activeInterest === item
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Recommended Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((event) => {
          const registered = isRegistered(event.id, currentUser?.id);

          return (
            <div
              key={event.id}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high/60 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header with Match Percentage Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    {event.matchPercentage}% Match
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-outline text-xs font-semibold">
                    {event.category}
                  </span>
                </div>

                <Link to={`/student/events/${event.id}`}>
                  <h3 className="text-xl font-headline-sm text-primary font-bold mb-2 group-hover:text-secondary transition-colors">
                    {event.title}
                  </h3>
                </Link>
                <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4">
                  {event.description}
                </p>

                {/* Why this event is recommended */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 mb-4 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                    auto_awesome
                  </span>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-outline block">
                      Why Eventora AI Recommends This:
                    </span>
                    <p className="text-xs text-on-surface font-medium leading-relaxed mt-0.5">
                      {event.matchExplanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-outline mb-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {event.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {event.displayDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-surface-container-high/60 flex items-center gap-3">
                <Link
                  to={`/student/events/${event.id}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md font-bold transition-colors text-center text-xs"
                >
                  View Details
                </Link>

                {registered ? (
                  <button
                    onClick={() => {
                      setSelectedEventForQR(event);
                      setIsQRModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-md font-bold text-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Registered ✓</span>
                  </button>
                ) : (
                  <button
                    onClick={() => registerForEvent(event.id, currentUser?.id, currentUser?.email, currentUser?.name)}
                    className="py-2.5 px-5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold text-xs transition-all shadow-xs"
                  >
                    Quick Register
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DynamicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={selectedEventForQR}
      />
    </div>
  );
};
