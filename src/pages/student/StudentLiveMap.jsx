import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useToast } from '../../context/ToastContext';
import { CampusInteriorMap } from '../../components/map/CampusInteriorMap';

export const StudentLiveMap = () => {
  const { venues, events } = useEvents();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const venueParam = searchParams.get('venue');

  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(() => {
    if (venueParam) {
      const match = venues.find(v => v.name.toLowerCase().includes(venueParam.toLowerCase()));
      if (match) return match;
    }
    return venues[0] || {
      id: 'ven_jpn_auditorium',
      name: 'JPN Auditorium',
      building: 'JPN Auditorium Complex',
      floor: 'Ground Floor',
      capacity: 750,
      occupancy: 685,
      occupancyPercent: 91,
      temperature: '21.5°C',
      status: 'Live',
      currentEvent: 'Sanskriti 2026 - Dr. AIT Annual Fest',
      speaker: 'Dr. B.R. Ambedkar Commemorative Keynote',
      lat: 12.9644,
      lng: 77.5064
    };
  });

  const [mapMode, setMapMode] = useState('interior'); // Default to realistic college interior blueprint
  const [isNavigating, setIsNavigating] = useState(false);
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersRef = useRef({});

  // If venue query param changes, select it
  useEffect(() => {
    if (venueParam) {
      const match = venues.find(v => v.name.toLowerCase().includes(venueParam.toLowerCase()));
      if (match) {
        setSelectedRoom(match);
        if (leafletMapInstance.current) {
          leafletMapInstance.current.flyTo([match.lat, match.lng], 17, { animate: true });
          if (markersRef.current[match.id]) {
            markersRef.current[match.id].openPopup();
          }
        }
      }
    }
  }, [venueParam, venues]);

  // Initialize or re-render Leaflet Map
  useEffect(() => {
    if (mapMode !== 'osm' || !mapContainerRef.current) return;

    const initMap = () => {
      if (!window.L) return;

      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }

      const initialLat = selectedRoom?.lat || 12.9644;
      const initialLng = selectedRoom?.lng || 77.5064;

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([initialLat, initialLng], 17);

      // Clean OpenStreetMap standard tiles (Zero API key watermark)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Invalidate size after mount to prevent gray tiles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      const markers = {};

      venues.forEach((v) => {
        const isLive = v.status === 'Live';
        const isSelected = selectedRoom?.id === v.id;

        const customIcon = window.L.divIcon({
          className: 'eventora-venue-pin',
          html: `
            <div style="
              background: ${isSelected ? '#0051D5' : isLive ? '#00152A' : '#102A43'};
              color: white;
              width: 42px;
              height: 42px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 16px rgba(0, 21, 42, 0.35);
              border: 3px solid ${isSelected ? '#38BDF8' : 'white'};
              cursor: pointer;
              transition: transform 0.2s ease;
              position: relative;
            ">
              <span class="material-symbols-outlined" style="font-size: 20px; color: ${isLive ? '#2DD4BF' : '#FFFFFF'};">
                ${isLive ? 'sensors' : 'meeting_room'}
              </span>
              ${
                isLive
                  ? `<span style="
                      position: absolute;
                      top: -4px;
                      right: -4px;
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background: #10B981;
                      border: 2px solid white;
                      box-shadow: 0 0 8px #10B981;
                    "></span>`
                  : ''
              }
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          popupAnchor: [0, -24]
        });

        const marker = window.L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0051D5; letter-spacing: 0.5px;">${v.building}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: ${isLive ? '#DCFCE7; color: #166534;' : '#F1F5F9; color: #475569;'}">${v.status}</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 700; color: #00152A; margin: 0 0 4px 0;">${v.name}</h4>
            <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">${v.currentEvent || 'Available for booking'}</p>
            <div style="background: #F8FAFC; padding: 6px 8px; border-radius: 8px; font-size: 11px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #64748B;">Occupancy</span>
                <span style="font-weight: 700; color: #00152A;">${v.occupancyPercent}% (${v.occupancy}/${v.capacity})</span>
              </div>
              <div style="width: 100%; height: 5px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
                <div style="width: ${v.occupancyPercent}%; height: 100%; background: ${v.occupancyPercent > 85 ? '#EF4444' : '#0051D5'}; border-radius: 999px;"></div>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedRoom(v);
        });

        markers[v.id] = marker;
      });

      markersRef.current = markers;
      leafletMapInstance.current = map;

      if (selectedRoom && markers[selectedRoom.id]) {
        markers[selectedRoom.id].openPopup();
      }
    };

    if (window.L) {
      initMap();
    } else {
      const timer = setInterval(() => {
        if (window.L) {
          clearInterval(timer);
          initMap();
        }
      }, 100);
      return () => clearInterval(timer);
    }

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [mapMode, venues]);

  // Center on room when selected
  const handleSelectRoom = (room) => {
    const fullVenue = venues.find(v => v.id === room.id) || {};
    const merged = {
      ...fullVenue,
      ...room,
      floor: room.floor || fullVenue.floor || 'Ground Floor',
      code: room.code || fullVenue.code || '',
      building: room.building || fullVenue.building || 'Campus Building',
      lat: room.lat || fullVenue.lat || 12.9644,
      lng: room.lng || fullVenue.lng || 77.5064
    };
    setSelectedRoom(merged);
    setIsNavigating(false);

    if (mapMode === 'osm' && leafletMapInstance.current) {
      leafletMapInstance.current.flyTo([merged.lat, merged.lng], 17, { animate: true, duration: 1.0 });
      if (markersRef.current[merged.id]) {
        markersRef.current[merged.id].openPopup();
      }
    }
  };

  const filteredVenues = selectedBuilding === 'All'
    ? venues
    : venues.filter((v) => v.building === selectedBuilding);

  const handleDirections = () => {
    setIsNavigating(true);
    addToast(`Turn-by-turn indoor route mapped to ${selectedRoom.name}!`, 'info');
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Dr. AIT Official Institutional Header */}
      <div className="bg-gradient-to-r from-[#00152A] via-[#002B49] to-[#0051D5] text-white p-5 rounded-3xl border border-secondary/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[32px] text-teal-300">school</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Autonomous Institution • Affiliated to VTU
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                NAAC 'A+' & NBA Accredited
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dr. Ambedkar Institute of Technology (Dr. AIT)
            </h1>
            <p className="text-xs text-white/80 mt-0.5">
              Outer Ring Road, Near Jnana Bharathi Campus, Mallathahalli, Bengaluru – 560056
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
          <a
            href="https://drait.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all backdrop-blur-md border border-white/20 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Official Portal (drait.edu.in)</span>
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Top Header / Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container-high/40">
            <span className="material-symbols-outlined text-secondary text-[22px]">location_on</span>
            <div>
              <p className="text-[11px] text-outline uppercase font-semibold">Campus Venues</p>
              <p className="font-headline-sm text-primary font-bold text-base">{venues.length} Locations</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container-high/40">
            <span className="material-symbols-outlined text-emerald-700 text-[22px]">sensors</span>
            <div>
              <p className="text-[11px] text-outline uppercase font-semibold">Live Events</p>
              <p className="font-headline-sm text-primary font-bold text-base">
                {venues.filter(v => v.status === 'Live').length} Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-xs border border-surface-container-high/40">
            <span className="material-symbols-outlined text-teal-600 text-[22px]">group</span>
            <div>
              <p className="text-[11px] text-outline uppercase font-semibold">Average Occupancy</p>
              <p className="font-headline-sm text-teal-700 font-bold text-base">
                {Math.round(venues.reduce((acc, v) => acc + (v.occupancyPercent || 0), 0) / (venues.length || 1))}% Full
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Map Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 bg-surface-container-high rounded-xl">
            <button
              onClick={() => setMapMode('interior')}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'interior' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>College Interior Map</span>
            </button>
            <button
              onClick={() => setMapMode('osm')}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'osm' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span>Campus Grounds (GPS)</span>
            </button>
          </div>

          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl text-body-sm font-medium border border-surface-container-high outline-none cursor-pointer"
          >
            <option value="All">All Dr. AIT Buildings ({venues.length})</option>
            <option value="JPN Auditorium Complex">JPN Auditorium Complex</option>
            <option value="Centenary Bhavan">Centenary Bhavan (Library)</option>
            <option value="Silver Jubilee Building">Silver Jubilee Building (SJB)</option>
            <option value="Main Administrative Block">Main Administrative Block</option>
            <option value="D Block">D Block (ECE & EEE)</option>
            <option value="C Block">C Block (Mech & Civil)</option>
            <option value="B Block">B Block (Medical Electronics)</option>
            <option value="Sports & Amenities Complex">Sports & Amenities Complex</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Venue Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Interactive Map Viewport */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high/60 shadow-sm min-h-[600px] flex flex-col justify-between relative overflow-hidden">
          {/* Overlay Header */}
          <div className="flex items-center justify-between z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-surface-container-high shadow-xs mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                {mapMode === 'interior' ? 'corporate_fare' : 'explore'}
              </span>
              <span className="font-headline-sm text-primary font-bold text-base">
                {mapMode === 'interior' ? 'Dr. Ambedkar Institute of Technology • Interior Blueprint' : 'Dr. AIT Campus Grounds (Mallathahalli) • GPS Map'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping"></span>
                {mapMode === 'interior' ? 'Indoor Beacon Sync Active' : 'Live GPS Sync Active'}
              </span>
            </div>
          </div>

          {/* Map Canvas / Viewport */}
          <div className="relative z-10 w-full min-h-[580px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            {mapMode === 'interior' ? (
              <CampusInteriorMap
                venues={filteredVenues}
                selectedVenue={selectedRoom}
                onSelectVenue={(v) => handleSelectRoom(v)}
                isNavigating={isNavigating}
                onToggleNavigation={() => setIsNavigating(!isNavigating)}
              />
            ) : (
              <div ref={mapContainerRef} className="w-full h-[580px] z-10"></div>
            )}
          </div>

          {/* Quick Venue Selector Strip */}
          <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-outline font-semibold uppercase shrink-0 mr-1">Quick Select:</span>
            {filteredVenues.map((v) => {
              const isSelected = selectedRoom?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => handleSelectRoom(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${v.status === 'Live' ? 'bg-teal-400 animate-pulse' : 'bg-outline'}`}></span>
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Venue Inspector & Navigation Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high/60 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-outline">Venue Inspector</span>
                <h3 className="text-2xl font-bold text-primary">{selectedRoom.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedRoom.status === 'Live' ? 'bg-teal-50 text-teal-800' : 'bg-surface-container-high text-outline'
              }`}>
                {selectedRoom.status}
              </span>
            </div>

            {/* Room Details Breakdown */}
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-outline">Building & Floor</span>
                <span className="font-semibold text-primary">{selectedRoom.building}{selectedRoom.floor ? `, ${selectedRoom.floor}` : ''}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-outline">Current Session</span>
                <span className="font-semibold text-primary truncate max-w-[180px]">{selectedRoom.currentEvent || 'Available'}</span>
              </div>

              {selectedRoom.speaker && (
                <div className="flex justify-between">
                  <span className="text-outline">Lead Speaker</span>
                  <span className="font-semibold text-primary">{selectedRoom.speaker}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-outline">Environmental Temp</span>
                <span className="font-mono text-primary font-bold">{selectedRoom.temperature}</span>
              </div>
            </div>

            {/* Live Occupancy Gauge */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-outline mb-1.5 font-medium">
                <span>Occupancy Level</span>
                <span className="font-bold text-primary">{selectedRoom.occupancy} / {selectedRoom.capacity} ({selectedRoom.occupancyPercent}%)</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedRoom.occupancyPercent > 90 ? 'bg-amber-500' : 'bg-secondary'
                  }`}
                  style={{ width: `${selectedRoom.occupancyPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Turn-by-Turn Navigation Trigger */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDirections}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary-container text-white font-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">near_me</span>
                <span>Get Walking Directions</span>
              </button>

              <button
                onClick={() => addToast(`Subscribed to seat alerts for ${selectedRoom.name}`, 'success')}
                className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md font-semibold transition-colors text-xs"
              >
                Set Door Notification Alert
              </button>
            </div>
          </div>

          {/* Turn-by-turn Navigation Route Display (shows when user clicks Navigate) */}
          {isNavigating && (
            <div className="bg-primary text-white rounded-3xl p-6 shadow-xl border border-secondary/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-300">directions_walk</span>
                  <span className="font-bold text-sm">Walking Route Active</span>
                </div>
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-teal-300 font-mono">
                  {selectedRoom.floor === 'Level 2' ? '~240m • 3 mins' : selectedRoom.floor === 'Level 1' ? '~180m • 2 mins' : '~110m • 1.5 mins'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-white/90">Start at Dr. AIT Main Entrance Gate 1 (Outer Ring Road / Mallathahalli)</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-white/90">Follow campus boulevard past Dr. B.R. Ambedkar Foyer toward {selectedRoom.building || 'academic wing'}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-400 text-teal-950 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-teal-200 font-bold">
                    Arrive at {selectedRoom.name}{selectedRoom.code || selectedRoom.floor ? ` (${[selectedRoom.code, selectedRoom.floor].filter(Boolean).join(' • ')})` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNavigating(false)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Close Navigation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
