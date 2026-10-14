import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical');
  const [department, setDepartment] = useState('Computer Science');
  const [date, setDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [venue, setVenue] = useState('Auditorium A');
  const [building, setBuilding] = useState('Tech Center');
  const [organizer, setOrganizer] = useState('Dept. of Computer Science & Engineering');
  const [capacity, setCapacity] = useState('300');
  const [price, setPrice] = useState('Free');
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [feeAmount, setFeeAmount] = useState('299');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000');
  const [speakersText, setSpeakersText] = useState('Dr. Eleanor Vance, Prof. Alan Turing');
  const [agendaText, setAgendaText] = useState('09:30 AM - Keynote Address\n11:30 AM - Hands-on Session\n02:00 PM - Panel Discussion & Hackathon');

  // Automation Toggles
  const [enableQR, setEnableQR] = useState(true);
  const [enableCertificate, setEnableCertificate] = useState(true);
  const [enableFeedback, setEnableFeedback] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAICopilot, setEnableAICopilot] = useState(true);

  // Certificate Configuration State
  const [certificateTypes, setCertificateTypes] = useState(['participation']);

  const toggleCertType = (type) => {
    if (type === 'none') {
      setCertificateTypes(['none']);
      setEnableCertificate(false);
      return;
    }
    setEnableCertificate(true);
    setCertificateTypes((prev) => {
      const withoutNone = prev.filter((t) => t !== 'none');
      if (withoutNone.includes(type)) {
        const filtered = withoutNone.filter((t) => t !== type);
        return filtered.length > 0 ? filtered : ['none'];
      } else {
        return [...withoutNone, type];
      }
    });
  };

  const presetImages = [
    { label: 'Conference / Tech', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000' },
    { label: 'AI & Robotics Lab', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000' },
    { label: 'Hackathon Coding', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000' },
    { label: 'Concert / Cultural', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000' },
  ];

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isPublished = true) => {
    if (!title.trim() || !description.trim()) {
      addToast('Please enter an event title and description', 'error');
      return;
    }

    const speakers = speakersText.split(',').map((s) => s.trim()).filter(Boolean);
    const agenda = agendaText.split('\n').map((line) => {
      const parts = line.split('-');
      return {
        time: parts[0]?.trim() || '10:00 AM',
        title: parts[1]?.trim() || line.trim()
      };
    });

    const finalPrice = isPaidEvent
      ? (feeAmount && feeAmount.trim() ? `₹${feeAmount.trim().replace(/^₹/, '')}` : '₹299')
      : 'Free';

    setIsSubmitting(true);
    try {
      await createEvent({
        title,
        description,
        category,
        department,
        date,
        startTime,
        endTime,
        venue,
        building,
        organizer,
        capacity: Number(capacity) || 200,
        price: finalPrice,
        image,
        speakers,
        agenda,
        publish: isPublished,
        features: {
          enableQR,
          enableCertificate: !certificateTypes.includes('none'),
          enableFeedback,
          enableNotifications,
          enableAICopilot
        },
        certificateTypes: certificateTypes.includes('none') ? ['none'] : certificateTypes
      });

      addToast(isPublished ? 'Event published and saved to Supabase!' : 'Event saved as draft in Supabase!', 'success');
      navigate('/admin/events');
    } catch (err) {
      addToast('An error occurred while saving the event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-space-lg pb-12">
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
          Enterprise Event Builder
        </span>
        <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
          Create & Schedule New Event
        </h1>
        <p className="text-body-md text-outline">
          Define event logistics, speaker rosters, capacity parameters, and automated lifecycle triggers.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-3xl border border-surface-container-high/60 shadow-md space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-primary font-bold text-lg border-b border-surface-container-high pb-2">
            1. Core Details & Categorization
          </h3>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Event Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Next-Gen Web3 & AI Builders Summit 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md font-semibold text-primary outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Detailed overview of themes, problem statements, deliverables, and participant prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Information Science">Information Science</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Student Affairs">Student Affairs</option>
                <option value="Sports Council">Sports Council</option>
              </select>
            </div>

            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Pricing Model</label>
              <select
                value={isPaidEvent ? 'Paid' : 'Free'}
                onChange={(e) => {
                  const paid = e.target.value === 'Paid';
                  setIsPaidEvent(paid);
                  setPrice(paid ? `₹${feeAmount}` : 'Free');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-semibold outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="Free">Free (Complimentary)</option>
                <option value="Paid">Paid Event (Requires Registration Fee)</option>
              </select>
            </div>
          </div>

          {/* Dedicated Registration Fee Amount Configuration */}
          {isPaidEvent && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-label-md font-bold text-amber-950">
                    Registration Fee Amount (₹ INR) *
                  </label>
                  <p className="text-xs text-amber-800/80">
                    Exact registration amount required from attendees during check-in and checkout.
                  </p>
                </div>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-amber-900">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="299"
                    value={feeAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFeeAmount(val);
                      setPrice(val ? `₹${val}` : 'Free');
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-body-md font-bold text-amber-950 outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-amber-200/60">
                <span className="text-[11px] font-bold text-amber-900/70 uppercase">Popular University Presets:</span>
                {['99', '149', '199', '299', '350', '499', '750', '999'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setFeeAmount(preset);
                      setPrice(`₹${preset}`);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      feeAmount === preset
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/50'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Logistics, Venue & Schedule */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-primary font-bold text-lg border-b border-surface-container-high pb-2">
            2. Logistics & Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Venue Hall</label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              >
                <option value="Auditorium A">Auditorium A</option>
                <option value="Lab 4B">Lab 4B</option>
                <option value="Seminar Hall 3">Seminar Hall 3</option>
                <option value="Science Atrium">Science Atrium</option>
                <option value="Main Sports Arena">Main Sports Arena</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Campus Building</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="block text-label-md font-bold text-on-surface mb-1">Capacity Limit</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Organizer Unit</label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-medium outline-none"
            />
          </div>
        </div>

        {/* Section 3: Visuals, Speakers & Agenda */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-primary font-bold text-lg border-b border-surface-container-high pb-2">
            3. Visual Assets, Speakers & Timeline
          </h3>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Event Banner Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {presetImages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(p.url)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-primary transition-colors"
                >
                  Use {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Speakers (comma-separated)</label>
            <input
              type="text"
              value={speakersText}
              onChange={(e) => setSpeakersText(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance, Prof. Marcus Sterling"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-label-md font-bold text-on-surface mb-1">Agenda Milestones (Line format: Time - Title)</label>
            <textarea
              rows={3}
              value={agendaText}
              onChange={(e) => setAgendaText(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm font-mono outline-none resize-none"
            />
          </div>
        </div>

        {/* Section 4: Automated Feature Toggles */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-primary font-bold text-lg border-b border-surface-container-high pb-2">
            4. Lifecycle Automation Switches
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high cursor-pointer hover:bg-surface-container">
              <input
                type="checkbox"
                checked={enableQR}
                onChange={(e) => setEnableQR(e.target.checked)}
                className="w-5 h-5 accent-secondary rounded"
              />
              <div>
                <span className="text-body-sm font-bold text-primary block">Dynamic Anti-Fraud QR</span>
                <span className="text-[11px] text-outline">15s rotating token validation at door</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high cursor-pointer hover:bg-surface-container">
              <input
                type="checkbox"
                checked={enableCertificate}
                onChange={(e) => setEnableCertificate(e.target.checked)}
                className="w-5 h-5 accent-secondary rounded"
              />
              <div>
                <span className="text-body-sm font-bold text-primary block">Automated Certificates</span>
                <span className="text-[11px] text-outline">Instant cryptographic credential vault</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high cursor-pointer hover:bg-surface-container">
              <input
                type="checkbox"
                checked={enableFeedback}
                onChange={(e) => setEnableFeedback(e.target.checked)}
                className="w-5 h-5 accent-secondary rounded"
              />
              <div>
                <span className="text-body-sm font-bold text-primary block">Post-Event Feedback</span>
                <span className="text-[11px] text-outline">5-star rating matrix collection</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high cursor-pointer hover:bg-surface-container">
              <input
                type="checkbox"
                checked={enableAICopilot}
                onChange={(e) => setEnableAICopilot(e.target.checked)}
                className="w-5 h-5 accent-secondary rounded"
              />
              <div>
                <span className="text-body-sm font-bold text-primary block">AI Matching & Recommendations</span>
                <span className="text-[11px] text-outline">Intelligent targeting to relevant student majors</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Certificate Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
            <h3 className="font-headline-sm text-primary font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">workspace_premium</span>
              5. Event Certificate Configuration
            </h3>
            <span className="text-xs text-outline font-medium">Multi-type credential architecture</span>
          </div>
          <p className="text-xs text-outline">
            Specify which official digital credentials Eventora should issue for this event upon outcome verification.
            Organizers can enable multiple certificate types concurrently for competitive symposiums and hackathons.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Participation */}
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                certificateTypes.includes('participation')
                  ? 'border-teal-500 bg-teal-50/40 text-teal-950 ring-1 ring-teal-500/30'
                  : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={certificateTypes.includes('participation')}
                onChange={() => toggleCertType('participation')}
                className="w-5 h-5 accent-teal-600 rounded mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-teal-600">school</span>
                  Participation Certificate
                </span>
                <span className="text-[11px] text-outline leading-tight block mt-0.5">
                  Issued to attendees fulfilling verified Dynamic QR attendance check-in requirements.
                </span>
              </div>
            </label>

            {/* Winner */}
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                certificateTypes.includes('winner')
                  ? 'border-amber-500 bg-amber-50/40 text-amber-950 ring-1 ring-amber-500/30'
                  : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={certificateTypes.includes('winner')}
                onChange={() => toggleCertType('winner')}
                className="w-5 h-5 accent-amber-500 rounded mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-500">trophy</span>
                  Winner Certificate (1st, 2nd, 3rd)
                </span>
                <span className="text-[11px] text-outline leading-tight block mt-0.5">
                  For hackathons, competitions, and quizzes. Assigned via Manage Results to individual winners or team rosters.
                </span>
              </div>
            </label>

            {/* Achievement */}
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                certificateTypes.includes('achievement')
                  ? 'border-purple-500 bg-purple-50/40 text-purple-950 ring-1 ring-purple-500/30'
                  : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={certificateTypes.includes('achievement')}
                onChange={() => toggleCertType('achievement')}
                className="w-5 h-5 accent-purple-600 rounded mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-purple-600">award_star</span>
                  Achievement / Special Award
                </span>
                <span className="text-[11px] text-outline leading-tight block mt-0.5">
                  Best Project, Best Innovation, Best Presentation, Finalist, or Special Recognition badges.
                </span>
              </div>
            </label>

            {/* No Certificate */}
            <label
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                certificateTypes.includes('none')
                  ? 'border-rose-400 bg-rose-50/50 text-rose-950 ring-1 ring-rose-400/30'
                  : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={certificateTypes.includes('none')}
                onChange={() => toggleCertType('none')}
                className="w-5 h-5 accent-rose-500 rounded mt-0.5"
              />
              <div>
                <span className="text-sm font-bold block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-rose-500">block</span>
                  No Certificate
                </span>
                <span className="text-[11px] text-outline leading-tight block mt-0.5">
                  Disable certificate generation entirely for informational or casual campus gatherings.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="px-6 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-8 py-3.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <span>Publish Event Live</span>
                <span className="material-symbols-outlined text-[18px]">publish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
