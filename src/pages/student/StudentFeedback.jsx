import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';

export const StudentFeedback = () => {
  const { currentUser } = useAuth();
  const { events, feedback, submitFeedback } = useEvents();

  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [overallRating, setOverallRating] = useState(5);
  const [organizationRating, setOrganizationRating] = useState(5);
  const [speakerRating, setSpeakerRating] = useState(5);
  const [venueRating, setVenueRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitFeedback({
      eventId: selectedEvent.id,
      eventName: selectedEvent.title,
      studentName: currentUser?.name || 'Alexander Wright',
      studentAvatar: currentUser?.avatar,
      overallRating,
      organizationRating,
      speakerRating,
      venueRating,
      contentRating,
      comment
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setComment('');
  };

  const renderStarPicker = (val, setVal, label) => (
    <div className="flex items-center justify-between py-2 border-b border-surface-container-high/60 last:border-none">
      <span className="text-body-sm font-semibold text-on-surface">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 text-amber-500 hover:scale-125 transition-transform"
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: star <= val ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-outline ml-1">{val}.0</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-lg">
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
          Student Voice & Ratings
        </span>
        <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
          Feedback & Post-Event Evaluation
        </h1>
        <p className="text-body-md text-outline">
          Your reviews directly calibrate the university Event Success Score and guide curriculum improvements.
        </p>
      </div>

      {submitted ? (
        <div className="bg-surface-container-lowest p-10 sm:p-14 rounded-3xl border border-surface-container-high text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <span className="material-symbols-outlined text-[36px]">rate_review</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Thank You for Your Feedback!</h2>
          <p className="text-body-md text-outline max-w-md mx-auto mb-6">
            Your evaluation for <strong className="text-primary">{selectedEvent.title}</strong> has been recorded and submitted to the event analytics engine.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md"
          >
            Submit Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container-high/60 shadow-md space-y-6">
          {/* Select Event */}
          <div>
            <label className="block text-label-md font-bold text-primary mb-2">Select Attended Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.displayDate})
                </option>
              ))}
            </select>
          </div>

          {/* 5-Category Rating Matrix */}
          <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-surface-container-high/60 space-y-1">
            <h3 className="text-label-sm font-bold uppercase tracking-wider text-outline mb-2">
              Performance Criteria Evaluation (1–5 Stars)
            </h3>
            {renderStarPicker(overallRating, setOverallRating, 'Overall Event Satisfaction')}
            {renderStarPicker(organizationRating, setOrganizationRating, 'Event Organization & Flow')}
            {renderStarPicker(speakerRating, setSpeakerRating, 'Speaker / Presenter Quality')}
            {renderStarPicker(venueRating, setVenueRating, 'Venue, Audio & Amenities')}
            {renderStarPicker(contentRating, setContentRating, 'Technical / Content Depth')}
          </div>

          {/* Text Comments */}
          <div>
            <label className="block text-label-md font-bold text-primary mb-2">
              Written Review & Suggestions
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what worked well, key takeaways from the speakers, and ideas for the next iteration..."
              className="w-full p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Submit Evaluation</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </form>
      )}

      {/* Recent Feedbacks List */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-high/60 shadow-sm space-y-4">
        <h3 className="font-headline-sm text-primary font-bold text-lg">Community Feedback Stream</h3>
        <div className="space-y-3">
          {feedback.slice(0, 4).map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={fb.studentAvatar} alt={fb.studentName} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-body-sm font-bold text-primary">{fb.studentName}</span>
                  <span className="text-xs text-outline">• {fb.eventName}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold text-outline ml-1">{fb.overallRating}.0</span>
                </div>
              </div>
              <p className="text-body-sm text-on-surface-variant italic">"{fb.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
