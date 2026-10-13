import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { InteractiveMap } from '../../pharmacy/InteractiveMap';

export const Screen14FullMapLocator = () => {
  const { setFigmaScreen } = useApp();
  const [radiusKm, setRadiusKm] = useState(5);
  const [inStockOnly, setInStockOnly] = useState(false);

  const pharmacyCatalog = [
    {
      id: 'jan-aushadhi-kendra-01',
      name: 'Pradhan Mantri Jan Aushadhi Kendra',
      address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      distance_km: 0.8,
      phone: '+91 80 2520 1199',
      stock_status: 'IN_STOCK',
      stock_qty: 24,
      price: 42.50,
      type: 'PMBJP_GOVT',
      last_updated: '15 mins ago'
    },
    {
      id: 'apollo-pharmacy-indira',
      name: 'Apollo Pharmacy 24x7',
      address: 'CMH Road, Indiranagar, Bengaluru',
      latitude: 12.9780,
      longitude: 77.6400,
      distance_km: 1.2,
      phone: '+91 80 2521 8844',
      stock_status: 'IN_STOCK',
      stock_qty: 18,
      price: 48.00,
      type: 'COMMERCIAL',
      last_updated: '40 mins ago'
    },
    {
      id: 'medplus-ulsoor',
      name: 'MedPlus Pharmacy & Wellness',
      address: 'Old Madras Rd, Ulsoor, Bengaluru',
      latitude: 12.9810,
      longitude: 77.6250,
      distance_km: 2.1,
      phone: '+91 80 2555 3322',
      stock_status: 'LOW_STOCK',
      stock_qty: 3,
      price: 45.00,
      type: 'COMMERCIAL',
      last_updated: '2 hours ago'
    },
    {
      id: 'jan-aushadhi-domlur',
      name: 'Jan Aushadhi Kendra – Domlur Hub',
      address: 'Intermediate Ring Rd, Domlur, Bengaluru',
      latitude: 12.9600,
      longitude: 77.6380,
      distance_km: 2.8,
      phone: '+91 80 2535 9900',
      stock_status: 'IN_STOCK',
      stock_qty: 40,
      price: 42.50,
      type: 'PMBJP_GOVT',
      last_updated: 'Just now'
    }
  ];

  const filteredPharmacies = pharmacyCatalog.filter((p) => {
    if (inStockOnly && p.stock_status !== 'IN_STOCK') return false;
    return p.distance_km <= radiusKm;
  });

  return (
    <div className="flex flex-col h-full bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow & Radius Control */}
      <div className="px-4 py-3 bg-white border-b border-[#E2ECE7] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFigmaScreen(9)}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Pharmacy Locator
            </h2>
            <p className="text-[10px] text-slate-500">
              Interactive Map with Verified Inventory
            </p>
          </div>
        </div>

        {/* In-Stock Filter Toggle */}
        <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded text-[#00796B] focus:ring-[#00796B]"
          />
          <span>In-Stock Only</span>
        </label>
      </div>

      {/* Radius Switcher Row */}
      <div className="px-4 py-2 bg-[#F4F9F7] flex items-center justify-between text-xs border-b border-[#E2ECE7]">
        <span className="text-[11px] text-slate-500 font-medium">Search Distance:</span>
        <div className="flex space-x-1.5">
          {[5, 10, 25].map((km) => (
            <button
              key={km}
              onClick={() => setRadiusKm(km)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                radiusKm === km
                  ? 'bg-[#00796B] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Leaflet Map (Figma Screen 14) */}
      <div className="h-[220px] w-full relative border-b border-[#E2ECE7]">
        <InteractiveMap
          pharmacies={filteredPharmacies}
          userLocation={{ lat: 12.9716, lon: 77.5946 }}
          selectedPharmacy={filteredPharmacies[0]}
          onSelectPharmacy={() => setFigmaScreen(10)}
        />
      </div>

      {/* Pharmacy Cards Scrollable List */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-700 px-1">
          Showing {filteredPharmacies.length} verified pharmacies within {radiusKm} km:
        </div>

        {filteredPharmacies.map((pharm) => (
          <div
            key={pharm.id}
            className="bg-white rounded-2xl p-3 border border-[#E2ECE7] shadow-sm space-y-2 hover:border-[#00796B] transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{pharm.name}</h4>
                  {pharm.type === 'PMBJP_GOVT' && (
                    <span className="text-[8px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      PMBJP
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{pharm.address}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#00796B]">
                  {pharm.distance_km} km
                </span>
                <span
                  className={`block text-[9px] font-bold mt-0.5 ${
                    pharm.stock_status === 'IN_STOCK' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {pharm.stock_status === 'IN_STOCK' ? '🟢 In Stock' : '🟠 Low Stock'}
                </span>
              </div>
            </div>

            {/* Price & Last Updated */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Generic Unit: <strong className="text-slate-800 font-bold">₹{pharm.price.toFixed(2)}</strong></span>
              <span>Updated: {pharm.last_updated}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setFigmaScreen(10)}
                className="flex-1 py-1.5 bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs rounded-full shadow-sm flex items-center justify-center space-x-1"
              >
                <span>Reserve 1-Hr Hold</span>
                <span>➔</span>
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharm.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full flex items-center justify-center"
              >
                📍
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
