import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { events, students, certificates, venues } = useEvents();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.trim().toLowerCase();

  const filteredEvents = query
    ? events.filter(e => e.title.toLowerCase().includes(query) || e.category.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query))
    : [];

  const filteredStudents = query
    ? students.filter(s => s.name.toLowerCase().includes(query) || s.usn.toLowerCase().includes(query) || s.department.toLowerCase().includes(query))
    : [];

  const filteredCertificates = query
    ? certificates.filter(c => c.certificateId.toLowerCase().includes(query) || c.recipientName.toLowerCase().includes(query) || c.eventName.toLowerCase().includes(query))
    : [];

  const filteredVenues = query
    ? venues.filter(v => v.name.toLowerCase().includes(query) || v.building.toLowerCase().includes(query))
    : [];

  const totalResults = filteredEvents.length + filteredStudents.length + filteredCertificates.length + filteredVenues.length;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-space-lg py-3.5 border-b border-surface-container-high gap-space-sm bg-surface-container-low/50">
          <span className="material-symbols-outlined text-secondary text-[24px]">search</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none outline-none text-body-lg text-on-surface placeholder:text-outline font-medium"
            placeholder="Search events, students, certificates, venues... (Esc to close)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-lg hover:bg-surface-container-high text-outline transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-label-sm font-mono text-outline bg-surface-container-high rounded border border-outline-variant/30">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-space-md space-y-space-md">
          {!query && (
            <div className="py-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">find_in_page</span>
              <p className="text-body-md font-medium text-on-surface">Global Quick Navigation</p>
              <p className="text-body-sm text-outline">Type to instantly find events, student records, certificates, or campus venues.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button 
                  onClick={() => setSearchTerm('Tech')} 
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full text-label-md text-on-surface transition-all"
                >
                  Tech Fest
                </button>
                <button 
                  onClick={() => setSearchTerm('Alex')} 
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full text-label-md text-on-surface transition-all"
                >
                  Alex Wright
                </button>
                <button 
                  onClick={() => setSearchTerm('Auditorium')} 
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full text-label-md text-on-surface transition-all"
                >
                  Auditorium A
                </button>
                <button 
                  onClick={() => setSearchTerm('CERT')} 
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high rounded-full text-label-md text-on-surface transition-all"
                >
                  Certificates
                </button>
              </div>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-10 text-center text-outline">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">search_off</span>
              <p className="text-body-md font-medium text-on-surface">No results found for "{searchTerm}"</p>
              <p className="text-body-sm">Try searching for "Tech Fest", "Hackathon", "Alex", or "Auditorium".</p>
            </div>
          )}

          {/* Events Section */}
          {filteredEvents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-label-sm font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                <span>Events ({filteredEvents.length})</span>
                <span className="material-symbols-outlined text-[16px]">event</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleSelect(`/student/events/${event.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">event</span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-secondary">{event.title}</p>
                        <p className="text-body-sm text-outline">{event.displayDate} • {event.venue} • {event.category}</p>
                      </div>
                    </div>
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                      {event.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Section */}
          {filteredStudents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-label-sm font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                <span>Students ({filteredStudents.length})</span>
                <span className="material-symbols-outlined text-[16px]">group</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelect(`/admin/users`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant" />
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-secondary">{student.name}</p>
                        <p className="text-body-sm text-outline">{student.usn} • {student.department}</p>
                      </div>
                    </div>
                    <span className="text-label-sm text-on-tertiary-container font-semibold">
                      {student.attendanceRate}% Att.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Section */}
          {filteredCertificates.length > 0 && (
            <div>
              <div className="px-2 py-1 text-label-sm font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                <span>Certificates ({filteredCertificates.length})</span>
                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => handleSelect(`/verify/${cert.certificateId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-secondary">{cert.eventName}</p>
                        <p className="text-body-sm text-outline">{cert.recipientName} • <span className="font-mono text-secondary">{cert.certificateId}</span></p>
                      </div>
                    </div>
                    <span className="text-label-sm text-secondary font-bold flex items-center gap-1">
                      Verify <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venues Section */}
          {filteredVenues.length > 0 && (
            <div>
              <div className="px-2 py-1 text-label-sm font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                <span>Campus Venues ({filteredVenues.length})</span>
                <span className="material-symbols-outlined text-[16px]">location_on</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    onClick={() => handleSelect(`/student/map`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-700">
                        <span className="material-symbols-outlined text-[18px]">apartment</span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-secondary">{venue.name}</p>
                        <p className="text-body-sm text-outline">{venue.building} • {venue.floor} • Cap: {venue.capacity}</p>
                      </div>
                    </div>
                    <span className="text-label-sm text-on-tertiary-container font-bold px-2 py-0.5 rounded bg-tertiary-fixed/30">
                      {venue.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-space-lg py-2.5 bg-surface-container-low/70 border-t border-surface-container-high flex items-center justify-between text-label-sm text-outline">
          <span>Navigate with arrows or click directly</span>
          <button onClick={onClose} className="hover:text-on-surface transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
