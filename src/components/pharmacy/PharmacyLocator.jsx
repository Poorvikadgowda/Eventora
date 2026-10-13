import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { getNearbyPharmacies, reserveMedicine } from '../../services/api';
import { InteractiveMap } from './InteractiveMap';
import {
  MapPin,
  Search,
  Phone,
  Navigation,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Sparkles,
  Filter,
  Info,
  Compass,
  ArrowUpDown,
  Building2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Check
} from 'lucide-react';

// Preset Medical Hubs for Manual Location Selection
const CITY_PRESETS = [
  { name: 'Delhi NCR (AIIMS / CP)', lat: 28.6139, lon: 77.2090, city: 'Delhi NCR' },
  { name: 'Bengaluru (Indiranagar / Jayanagar)', lat: 12.9719, lon: 77.6412, city: 'Bengaluru' },
  { name: 'Hyderabad (Ameerpet)', lat: 17.4375, lon: 78.4482, city: 'Hyderabad' },
  { name: 'Chennai (T. Nagar)', lat: 13.0418, lon: 80.2341, city: 'Chennai' },
  { name: 'Kolkata (Park Street)', lat: 22.5512, lon: 88.3585, city: 'Kolkata' },
  { name: 'Pune (FC Road)', lat: 18.5204, lon: 73.8431, city: 'Pune' }
];

export const PharmacyLocator = () => {
  const {
    userLocation,
    setUserLocation,
    currentPrescription,
    selectedPharmacy,
    setSelectedPharmacy,
    user,
    notify
  } = useApp();

  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected medicine to check across pharmacies
  const [searchDrug, setSearchDrug] = useState(
    currentPrescription?.medicines?.[0]?.drug_id || 'dolo-650'
  );

  // Geolocation Permission & Manual Search States
  const [geoPermission, setGeoPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'requesting'
  const [manualQuery, setManualQuery] = useState('');
  const [activeCityLabel, setActiveCityLabel] = useState('Delhi NCR (Default)');

  // Sorting: 'distance' | 'availability' | 'price'
  const [sortBy, setSortBy] = useState('distance');
  const [radiusKm, setRadiusKm] = useState(30.0);

  // Current coordinates in use
  const [coords, setCoords] = useState({
    lat: userLocation?.lat || 28.6139,
    lon: userLocation?.lon || 77.2090
  });

  // Request browser geolocation only after explicit user permission
  const handleRequestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoPermission('denied');
      notify?.('Geolocation is not supported by your browser. Please search manually.', 'error');
      return;
    }

    setGeoPermission('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setCoords(newCoords);
        setUserLocation?.({
          lat: newCoords.lat,
          lon: newCoords.lon,
          label: 'Your Current GPS Location'
        });
        setGeoPermission('granted');
        setActiveCityLabel('Your Exact GPS Coordinates');
        notify?.('📍 GPS Location permission granted successfully!', 'success');
      },
      (err) => {
        console.warn('Geolocation permission error or denied:', err.message);
        setGeoPermission('denied');
        notify?.(
          'Location permission was denied. You can search manually by city or area.',
          'error'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual city preset selection
  const handleSelectPreset = (preset) => {
    const newCoords = { lat: preset.lat, lon: preset.lon };
    setCoords(newCoords);
    setUserLocation?.({
      lat: preset.lat,
      lon: preset.lon,
      label: preset.name
    });
    setActiveCityLabel(preset.name);
    setManualQuery('');
    notify?.(`📍 Switched to ${preset.name}`, 'info');
  };

  // Fetch nearby pharmacies from GET /api/pharmacies/nearby
  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const res = await getNearbyPharmacies(
        coords.lat,
        coords.lon,
        searchDrug,
        sortBy,
        radiusKm,
        null,
        manualQuery || null
      );
      setPharmacies(res.pharmacies || []);
    } catch (err) {
      notify?.('Failed to load pharmacy locations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [coords, searchDrug, sortBy, radiusKm, manualQuery]);

  // Handle reserve action
  const handleReserve = async (pharmacy) => {
    try {
      const res = await reserveMedicine({
        pharmacy_id: pharmacy.id,
        drug_id: searchDrug,
        patient_mobile: user?.mobile_number || '9876543210',
        patient_name: user?.user_name || 'Patient',
        quantity_strips: 1
      });
      notify?.(
        `Medicine reserved for 1 hour at ${pharmacy.name || pharmacy.pharmacy_name}. Code: ${
          res?.reservation?.reservation_id || 'RES-CONFIRMED'
        }`,
        'success'
      );
    } catch (err) {
      notify?.('Reservation error: ' + err.message, 'error');
    }
  };

  // Availability badge & styling mapper (Enforces: Never convert UNKNOWN into AVAILABLE)
  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'AVAILABLE',
          badge: '🟢 AVAILABLE',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
          description: 'Sufficient stock in verified inventory'
        };
      case 'LOW STOCK':
        return {
          label: 'LOW STOCK',
          badge: '🟠 LOW STOCK',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
          description: 'Limited units remaining (1-10 strips)'
        };
      case 'OUT OF STOCK':
        return {
          label: 'OUT OF STOCK',
          badge: '❌ OUT OF STOCK',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
          description: 'Zero verified strips available'
        };
      case 'UNKNOWN':
      default:
        // CRITICAL INVARIANT: UNKNOWN is NEVER shown as AVAILABLE
        return {
          label: 'UNKNOWN',
          badge: '⚪ UNKNOWN',
          color: 'text-slate-700 bg-slate-100 border-slate-300',
          dot: 'bg-slate-400',
          description: 'Stock not tracked in local DB • Call store to confirm'
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Module: Nearby Pharmacy & Stock Locator
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Nearby Pharmacies & Jan Aushadhi Kendras
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Locate authorized PMBJP generic kendras, verify medicine stock availability, and navigate with Google Maps.
          </p>
        </div>

        {/* GPS Permission Gating Control */}
        <div className="flex items-center gap-2">
          {geoPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleRequestGeolocation}
              disabled={geoPermission === 'requesting'}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              {geoPermission === 'requesting' ? 'Detecting Location...' : 'Use My GPS Location'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>GPS Active ({coords.lat.toFixed(4)}, {coords.lon.toFixed(4)})</span>
            </div>
          )}
        </div>
      </div>

      {/* Geolocation Permission Status Banner */}
      {geoPermission === 'denied' && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">
              Location Permission Denied or Unavailable
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              Browser location permission was not granted. <strong>No problem!</strong> You can use manual search below or select any major medical hub to find pharmacies and view turn-by-turn navigation.
            </p>
          </div>
        </div>
      )}

      {/* Manual Search & City Presets Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              Manual Location & City Hubs:
            </span>
            <span className="text-[11px] text-slate-500">
              Active center: <strong className="text-teal-800">{activeCityLabel}</strong>
            </span>
          </div>

          {/* Manual Query Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search area, landmark, or store..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
            />
          </div>
        </div>

        {/* 1-Click City Hub Chips */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Quick Hubs:</span>
          {CITY_PRESETS.map((preset) => {
            const isSelected = activeCityLabel === preset.name;
            return (
              <button
                key={preset.city}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* 1. Medicine Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0">Medicine:</span>
            <select
              value={searchDrug}
              onChange={(e) => setSearchDrug(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="dolo-650">Dolo 650 (Paracetamol 650mg)</option>
              <option value="pantocid-dsr">Pantocid DSR (Pantoprazole + Domperidone)</option>
              <option value="augmentin-625-duo">Augmentin 625 Duo (Amoxicillin + Clavulanate)</option>
              <option value="telma-40">Telma 40 (Telmisartan 40mg)</option>
              <option value="glycomet-gp2">Glycomet GP2 (Metformin + Glimepiride)</option>
              <option value="atorva-10">Atorva 10 (Atorvastatin 10mg)</option>
              <option value="montair-lc">Montair-LC (Montelukast + Levocetirizine)</option>
              <option value="azithral-500">Azithral 500 (Azithromycin 500mg)</option>
            </select>
          </div>

          {/* 2. Sorting Selector (Distance, Availability, Price) */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-600" /> Sort by:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === 'distance' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Distance
              </button>
              <button
                type="button"
                onClick={() => setSortBy('availability')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === 'availability' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Availability
              </button>
              <button
                type="button"
                onClick={() => setSortBy('price')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sortBy === 'price' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Price
              </button>
            </div>
          </div>

          {/* 3. Search Radius Slider */}
          <div className="flex items-center gap-3 w-full md:w-auto text-xs text-slate-600">
            <span className="font-semibold shrink-0">Radius: {radiusKm} km</span>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="accent-teal-600 h-1.5 bg-slate-200 rounded cursor-pointer w-28"
            />
          </div>

        </div>

        {/* Invariant & Disclaimer Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Invariant:</strong> Stock marked <code className="font-mono bg-amber-200/80 px-1 py-0.5 rounded">UNKNOWN</code> is <em>never</em> assumed available. Always call the pharmacy phone number to confirm before visiting.
          </span>
        </div>
      </div>

      {/* Interactive Map Component with Google Maps Navigation Fallback */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-bold flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-4 h-4 text-teal-600" />
            Interactive Map & Route Planner:
          </span>
          <span className="text-[11px] text-slate-400">
            Google Maps Turn-by-Turn Navigation active on all store pins
          </span>
        </div>

        <InteractiveMap
          pharmacies={pharmacies}
          userLocation={{ lat: coords.lat, lon: coords.lon, label: activeCityLabel }}
          selectedPharmacy={selectedPharmacy}
          onSelectPharmacy={(p) => setSelectedPharmacy(p)}
        />
      </div>

      {/* Nearby Pharmacy Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{pharmacies.length} pharmacies</strong> (Sorted by <span className="font-bold capitalize text-teal-700">{sortBy}</span>)
          </span>
          <span>Click any card to view route details</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Locating nearest pharmacies and verifying inventory...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold">No pharmacies found matching your criteria in this search radius.</p>
            <p className="text-[11px] text-slate-400">Try expanding the search radius slider or selecting one of the quick city hubs above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacies.map((pharm) => {
              const isSelected = selectedPharmacy?.id === pharm.id;
              const isJanAushadhi = pharm.is_jan_aushadhi || pharm.pharmacy_name?.toLowerCase().includes('pmbjp');
              const avail = getAvailabilityBadge(pharm.availability_status);
              const googleMapsLink = pharm.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${pharm.latitude},${pharm.longitude}`;

              return (
                <div
                  key={pharm.id}
                  onClick={() => setSelectedPharmacy(pharm)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white space-y-4 flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name, Badge & Distance */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {pharm.pharmacy_name || pharm.name}
                          </h3>
                          {isJanAushadhi && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                              PMBJP Kendra
                            </span>
                          )}
                        </div>
                        {/* Address */}
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {pharm.address}
                        </p>
                      </div>

                      {/* Distance */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 block">
                          {pharm.distance_text || `${pharm.distance_km || pharm.distance} km away`}
                        </span>
                      </div>
                    </div>

                    {/* Selected Medicine & Availability Metrics */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      {/* Selected Medicine */}
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          Selected Medicine
                        </span>
                        <span className="font-extrabold text-slate-800 text-xs block mt-0.5 truncate" title={pharm.selected_medicine}>
                          {pharm.selected_medicine}
                        </span>
                      </div>

                      {/* Approximate Price */}
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                          Approximate Price
                        </span>
                        <span className="font-black text-emerald-700 text-xs block mt-0.5">
                          ₹{Number(pharm.approximate_price || 9.5).toFixed(2)}
                          <span className="text-[9px] font-normal text-slate-400 ml-1">(Local DB)</span>
                        </span>
                      </div>
                    </div>

                    {/* Availability Status Card Row */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border text-xs" style={{ borderColor: 'inherit' }}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${avail.dot}`} />
                        <div>
                          <div className="font-black tracking-wide text-xs">
                            {avail.badge}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {avail.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Stock Count</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {pharm.stock_quantity > 0 ? `${pharm.stock_quantity} strips` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Phone, Timestamp, and Google Maps Navigation Link */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {/* Phone */}
                      <a
                        href={`tel:${pharm.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-600 hover:text-teal-700 font-bold flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>{pharm.phone}</span>
                      </a>

                      {/* Last Updated */}
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{pharm.last_updated_human || 'Updated recently'}</span>
                      </span>
                    </div>

                    {/* Actions: Google Maps Navigation & Reserve */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-blue-200 shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Navigate in Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-blue-500 ml-0.5" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserve(pharm);
                        }}
                        disabled={pharm.availability_status === 'OUT OF STOCK'}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          pharm.availability_status === 'OUT OF STOCK'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                        }`}
                      >
                        Reserve 1 Hr
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
