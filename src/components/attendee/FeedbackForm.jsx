import React, { useState } from 'react';
import { useEvent } from '../../store/EventContext';
import { Star, MessageSquare, Award, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FeedbackForm = () => {
  const { currentAttendee, submitFeedback, checkInAttendee, setAttendeeTab } = useEvent();

  const [ratings, setRatings] = useState({
    rating: 5,
    organizationRating: 5,
    speakerRating: 5,
    venueRating: 5,
    contentRating: 5,
    npsScore: 10,
    comments: ''
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!currentAttendee) {
    return (
      <div className="text-center py-16 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-white">No Attendee Selected</h3>
        <p className="text-xs text-slate-400 mt-2">
          Please select an attendee from the top testing selector.
        </p>
      </div>
    );
  }

  // If attendee is not checked in yet
  if (!currentAttendee.checkedIn) {
    return (
      <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Check-In Required to Submit Feedback</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            To ensure authenticated reviews and genuine attendance records, post-event surveys and certificates unlock after your gate QR pass is scanned.
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-white">{currentAttendee.name}</span> is currently in{' '}
          <span className="font-mono text-amber-400 font-bold">Registered</span> state.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setAttendeeTab('pass')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            View My QR Pass
          </button>
          <button
            onClick={() => {
              checkInAttendee(currentAttendee.id);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-emerald transition-all"
          >
            ⚡ Fast Gate Check-In (Test Bypass)
          </button>
        </div>
      </div>
    );
  }

  // If feedback was already submitted
  if (currentAttendee.feedbackSubmitted && !submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Feedback Already Submitted</h3>
          <p className="text-xs text-slate-400 mt-1">
            Thank you {currentAttendee.name}! Your responses have been processed and your official certificate is ready.
          </p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Overall Rating:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              {'★'.repeat(currentAttendee.feedback?.rating || 5)}
              <span className="text-slate-300 font-mono ml-1">({currentAttendee.feedback?.rating}/5)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Net Promoter Score (NPS):</span>
            <span className="text-indigo-300 font-bold font-mono">
              {currentAttendee.feedback?.npsScore} / 10
            </span>
          </div>
          {currentAttendee.feedback?.comments && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Your Comments:</span>
              <p className="text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                "{currentAttendee.feedback.comments}"
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setAttendeeTab('certificate')}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
        >
          <Award className="w-4 h-4" />
          <span>View & Download Official Certificate</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = submitFeedback(currentAttendee.id, ratings);
    if (res.success) {
      setSubmittedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const StarRatingInput = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/80 text-xs">
      <span className="text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-600 hover:text-amber-400 transition-colors focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-accent-amber text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Post-Event Feedback & Evaluation</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Event Experience Feedback</h2>
        <p className="text-xs text-slate-400 mt-1">
          Your insights shape future summits. Completing this survey automatically issues your official, cryptographically verified Certificate of Completion.
        </p>
      </div>

      {submittedSuccess ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-5 animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your feedback is recorded. Your verifiable certificate has been automatically generated and is ready.
            </p>
          </div>

          <button
            onClick={() => setAttendeeTab('certificate')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Proceed to Download Certificate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-xs">
          
          {/* Multi-Factor Rating */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Performance Breakdown
            </h4>
            <StarRatingInput
              label="Overall Summit Experience"
              value={ratings.rating}
              onChange={(val) => setRatings({ ...ratings, rating: val })}
            />
            <StarRatingInput
              label="Keynotes & Speaker Quality"
              value={ratings.speakerRating}
              onChange={(val) => setRatings({ ...ratings, speakerRating: val })}
            />
            <StarRatingInput
              label="Check-In Speed & Organization"
              value={ratings.organizationRating}
              onChange={(val) => setRatings({ ...ratings, organizationRating: val })}
            />
            <StarRatingInput
              label="Venue, Catering & Networking"
              value={ratings.venueRating}
              onChange={(val) => setRatings({ ...ratings, venueRating: val })}
            />
          </div>

          {/* NPS 0-10 Scale */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                How likely are you to recommend this summit to a colleague? (NPS)
              </label>
              <span className="font-mono text-indigo-400 font-bold text-sm">
                {ratings.npsScore}/10
              </span>
            </div>

            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRatings({ ...ratings, npsScore: score })}
                  className={`py-2 rounded-lg font-mono font-bold text-xs transition-all ${
                    ratings.npsScore === score
                      ? score >= 9
                        ? 'bg-emerald-500 text-white shadow-glow-emerald'
                        : score >= 7
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
              <span>0 (Not at all likely)</span>
              <span>10 (Extremely likely)</span>
            </div>
          </div>

          {/* Open Comments */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-200">
              Key Takeaways, Suggestions or Testimonial
            </label>
            <textarea
              rows="3"
              placeholder="What stood out to you? Any sessions you loved?"
              value={ratings.comments}
              onChange={(e) => setRatings({ ...ratings, comments: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Submit Feedback & Unlock Certificate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
