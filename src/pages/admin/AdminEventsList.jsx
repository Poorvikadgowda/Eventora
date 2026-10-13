import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';

export const AdminEventsList = () => {
  const { events, updateEvent, deleteEvent } = useEvents();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || e.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleStatus = (event) => {
    const nextStatus = event.status === 'Published' ? 'Draft' : 'Published';
    updateEvent(event.id, { status: nextStatus });
    addToast(`Event status updated to ${nextStatus}`, 'info');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteEvent(id);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Curriculum & Program Control
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            Event Management Roster
          </h1>
          <p className="text-body-md text-outline">
            Review live capacities, toggle publication statuses, and configure event automations.
          </p>
        </div>

        <Link
          to="/admin/events/create"
          className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-surface-container-lowest px-4 py-2 rounded-xl border border-surface-container-high w-full sm:w-80 shadow-xs">
          <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
          <input
            type="text"
            placeholder="Search events, venues, organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-body-md text-on-surface"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-lowest text-body-sm font-medium border border-surface-container-high outline-none text-on-surface"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Workshop">Workshop</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Seminar">Seminar</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-lowest text-body-sm font-medium border border-surface-container-high outline-none text-on-surface"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-outline text-label-sm uppercase tracking-wider font-bold border-b border-surface-container-high">
                <th className="py-4 px-6">Event Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Registration Fee</th>
                <th className="py-4 px-6">Date & Venue</th>
                <th className="py-4 px-6">Registrations / Cap</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={evt.image} alt={evt.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div>
                        <Link to={`/admin/events/${evt.id}`} className="font-bold text-primary hover:text-secondary transition-colors block">
                          {evt.title}
                        </Link>
                        <span className="text-xs text-outline">{evt.organizer}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium">{evt.category}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                      evt.price === 'Free' || !evt.price
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {evt.price === 'Free' || !evt.price ? 'card_giftcard' : 'payments'}
                      </span>
                      {evt.price || 'Free'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-primary">{evt.displayDate}</p>
                    <span className="text-xs text-outline">{evt.venue}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-primary">{evt.registeredCount}</span>
                    <span className="text-outline"> / {evt.capacity}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(evt)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 ${
                        evt.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {evt.status}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/events/${evt.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors"
                        title="View & Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-error transition-colors"
                        title="Delete Event"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
