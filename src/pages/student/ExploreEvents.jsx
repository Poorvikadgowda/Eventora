import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { EventCard } from '../../components/event/EventCard';
import { DynamicQRModal } from '../../components/event/DynamicQRModal';

export const ExploreEvents = () => {
  const { events } = useEvents();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeQREvent, setActiveQREvent] = useState(null);

  const categories = ['All', 'Technical', 'Workshop', 'Hackathon', 'Seminar', 'Sports', 'Cultural'];
  const departments = ['All', 'Computer Science', 'Artificial Intelligence', 'Information Science', 'Sports Council', 'Student Affairs'];

  const filteredEvents = events.filter((evt) => {
    // Hide drafts from students on Explore page
    const isPublished = evt.status ? evt.status.toLowerCase() !== 'draft' : true;
    if (!isPublished) return false;

    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesDepartment = selectedDepartment === 'All' || evt.department === selectedDepartment;
    const isFree = evt.price === 'Free' || !evt.price || evt.price === '₹0';
    const matchesPrice =
      selectedPrice === 'All' ||
      (selectedPrice === 'Free' ? isFree : !isFree);

    return matchesSearch && matchesCategory && matchesDepartment && matchesPrice;
  });

  const handleOpenQuickPass = (event) => {
    setActiveQREvent(event);
    setIsQRModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-wider">
            Campus Event Catalog
          </span>
          <h1 className="text-3xl font-headline-xl text-primary font-bold mt-2">
            Explore & Discover Events
          </h1>
          <p className="text-body-md text-outline">
            Browse upcoming university hackathons, research summits, bootcamps, and festivals.
          </p>
        </div>

        {/* Actions: Search & Live Map */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-80 flex items-center bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-surface-container-high shadow-xs">
            <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Search events, venues, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-body-md text-on-surface"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <Link
            to="/student/map"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Live Map</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-body-sm font-medium border border-surface-container-high outline-none text-on-surface"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-body-sm font-medium border border-surface-container-high outline-none text-on-surface"
          >
            <option value="All">All Fees</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-body-sm text-outline">
        <span>Showing <strong className="text-primary">{filteredEvents.length}</strong> events</span>
        {(search || selectedCategory !== 'All' || selectedDepartment !== 'All' || selectedPrice !== 'All') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedDepartment('All');
              setSelectedPrice('All');
            }}
            className="text-secondary font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-16 text-center border border-surface-container-high">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-outline flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h3 className="text-xl font-bold text-primary mb-1">No Events Found</h3>
          <p className="text-body-sm text-outline max-w-sm mx-auto mb-4">
            We couldn't find any events matching your selected search criteria. Try selecting "All" categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedDepartment('All');
              setSelectedPrice('All');
            }}
            className="px-5 py-2.5 rounded-xl bg-secondary text-white font-label-md font-bold"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onQuickPass={handleOpenQuickPass} />
          ))}
        </div>
      )}

      {/* Dynamic QR Modal */}
      <DynamicQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        event={activeQREvent}
      />
    </div>
  );
};
