import React, { useEffect, useRef } from 'react';
import { ExternalLink, Navigation } from 'lucide-react';

export const InteractiveMap = ({ pharmacies = [], userLocation, selectedPharmacy, onSelectPharmacy }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined') return;

    // Check if Leaflet (L) is loaded on window
    const L = window.L;
    if (!L) {
      console.warn('Leaflet library not yet loaded on window.');
      return;
    }

    const defaultLat = userLocation?.lat || 28.6139;
    const defaultLon = userLocation?.lon || 77.2090;

    // Initialize Leaflet Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLon],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // OpenStreetMap Real Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update map view if userLocation changes
    map.setView([defaultLat, defaultLon], map.getZoom() || 12);

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add User Location Marker
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #3b82f6; position: relative;">
          <div style="position: absolute; inset: -6px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker([defaultLat, defaultLon], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>Your Location</strong><br>${userLocation?.label || 'Center point'}`);
    markersRef.current.push(userMarker);

    // Add Pharmacy Markers
    pharmacies.forEach((pharm) => {
      const isSelected = selectedPharmacy?.id === pharm.id;
      const isJanAushadhi = pharm.is_jan_aushadhi || pharm.pharmacy_name?.toLowerCase().includes('pmbjp') || pharm.name?.toLowerCase().includes('pmbjp');

      // Status-based pin coloring
      let pinColor = '#0d9488'; // Available
      let statusBadge = '🟢 AVAILABLE';

      if (pharm.availability_status === 'LOW STOCK') {
        pinColor = '#f59e0b';
        statusBadge = '🟠 LOW STOCK';
      } else if (pharm.availability_status === 'OUT OF STOCK') {
        pinColor = '#e11d48';
        statusBadge = '❌ OUT OF STOCK';
      } else if (pharm.availability_status === 'UNKNOWN') {
        pinColor = '#64748b';
        statusBadge = '⚪ UNKNOWN';
      }

      const customIcon = L.divIcon({
        className: 'pharmacy-marker',
        html: `
          <div style="
            background: ${pinColor};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 12px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1.0)'};
            transition: transform 0.2s;
          ">
            <span>${isJanAushadhi ? '💊 PMBJP' : '🏥 Store'}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });

      const marker = L.marker([pharm.latitude, pharm.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          if (onSelectPharmacy) onSelectPharmacy(pharm);
        });

      const googleMapsUrl = pharm.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${pharm.latitude},${pharm.longitude}`;

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; max-width: 240px; font-size: 12px; line-height: 1.4;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${pharm.pharmacy_name || pharm.name}</strong>
          <span style="color: #64748b; font-size: 11px;">${pharm.address}</span>
          <div style="margin: 6px 0; padding: 4px 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px;">
            <strong>${statusBadge}</strong> • <span style="color: #0d9488; font-weight: bold;">₹${pharm.approximate_price || '9.50'}</span>
          </div>
          <div style="color: #64748b; font-size: 10px; margin-bottom: 6px;">
            🕒 ${pharm.last_updated_human || 'Updated recently'}
          </div>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: #eff6ff;
            color: #1d4ed8;
            font-weight: bold;
            font-size: 11px;
            border-radius: 6px;
            border: 1px solid #bfdbfe;
            text-decoration: none;
          ">
            🗺️ Directions in Google Maps →
          </a>
        </div>
      `);

      markersRef.current.push(marker);

      if (isSelected) {
        map.setView([pharm.latitude, pharm.longitude], 14);
        marker.openPopup();
      }
    });

  }, [pharmacies, userLocation, selectedPharmacy]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend & Credential Notice */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 shadow-md flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Low Stock
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Out of Stock
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Unknown
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-blue-800 shadow-xs">
        📍 Google Maps Navigation Active
      </div>
    </div>
  );
};
