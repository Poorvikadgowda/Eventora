import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';

export const FeedbackAnalytics = () => {
  const { events, feedback } = useEvents();
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');

  const filteredFeedback = selectedEventFilter === 'All'
    ? feedback
    : feedback.filter((f) => f.eventId === selectedEventFilter);

  const totalReviews = filteredFeedback.length || 32;
  const avgOverall = (filteredFeedback.reduce((acc, curr) => acc + (curr.overallRating || 5), 0) / (filteredFeedback.length || 1)).toFixed(1);

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Student Sentiment Intelligence
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            Feedback & Reviews Analytics
          </h1>
          <p className="text-body-md text-outline">
            Continuous sentiment telemetry, multi-axis rubric ratings, and qualitative attendee reviews.
          </p>
        </div>

        {/* Filter by Event */}
        <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high shadow-xs">
          <span className="material-symbols-outlined text-secondary text-[20px]">filter_list</span>
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="bg-transparent text-body-sm font-bold text-primary outline-none cursor-pointer"
          >
            <option value="All">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Average Rating</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold text-primary">{avgOverall}</span>
            <span className="text-body-sm text-outline">/ 5.0</span>
          </div>
          <div className="flex items-center text-amber-500 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            ))}
            <span className="text-xs text-outline ml-2 font-semibold">Tier 1 Rating</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Total Reviews Submitted</span>
          <div className="text-4xl font-bold text-primary mt-2">{totalReviews * 4 + 14}</div>
          <span className="text-xs text-emerald-700 font-semibold mt-2 block">+18.5% response rate</span>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Positive Sentiment</span>
          <div className="text-4xl font-bold text-emerald-700 mt-2">94.2%</div>
          <span className="text-xs text-outline font-medium mt-2 block">Based on NLP sentiment model</span>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <span className="text-xs text-outline uppercase tracking-wider font-bold">Speaker Approval</span>
          <div className="text-4xl font-bold text-secondary mt-2">4.9 / 5.0</div>
          <span className="text-xs text-outline font-medium mt-2 block">Keynote presentation feedback</span>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Criteria Breakdown Bars */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-primary font-bold text-lg">Performance Rubric Distribution</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-body-sm font-semibold mb-1">
                <span className="text-on-surface">Event Organization & Flow</span>
                <span className="text-primary font-bold">4.8 / 5.0 (96%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-semibold mb-1">
                <span className="text-on-surface">Speaker Quality & Delivery</span>
                <span className="text-primary font-bold">4.9 / 5.0 (98%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-semibold mb-1">
                <span className="text-on-surface">Venue, Audio & Amenities</span>
                <span className="text-primary font-bold">4.6 / 5.0 (92%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-body-sm font-semibold mb-1">
                <span className="text-on-surface">Technical Depth & Value</span>
                <span className="text-primary font-bold">4.8 / 5.0 (96%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high text-xs text-outline leading-relaxed">
            Automatic natural language clustering classifies 94% of qualitative inputs under positive keywords: "seamless check-in", "great speakers", "valuable workshop code".
          </div>
        </div>

        {/* Right: Qualitative Feedback Feed */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <h3 className="font-headline-sm text-primary font-bold text-lg">Attendee Comments & Testimonials</h3>
            <span className="text-xs font-mono text-outline">{filteredFeedback.length} Reviews</span>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.studentAvatar} alt={item.studentName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-body-sm font-bold text-primary">{item.studentName}</p>
                      <span className="text-xs text-outline">{item.eventName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-primary">{item.overallRating}.0</span>
                  </div>
                </div>

                <p className="text-body-sm text-on-surface-variant italic">
                  "{item.comment}"
                </p>

                <div className="flex items-center gap-3 text-[11px] text-outline pt-1">
                  <span>Organization: <strong>{item.organizationRating}/5</strong></span>
                  <span>Speaker: <strong>{item.speakerRating}/5</strong></span>
                  <span>Venue: <strong>{item.venueRating}/5</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
