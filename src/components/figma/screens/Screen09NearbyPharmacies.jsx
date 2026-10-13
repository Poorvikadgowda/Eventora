import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { InteractiveMap } from '../../pharmacy/InteractiveMap';

export const Screen09NearbyPharmacies = () => {
  const { setFigmaScreen, userLocation } = useApp();

  const primaryPharmacy = {
    id: 'jan-aushadhi-kendra-01',
    name: 'Pradhan Mantri Jan Aushadhi Kendra',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    distance_km: 0.8,
    phone: '+91 80 2520 1199',
    stock_status: 'IN_STOCK',
    stock_qty: 24,
    price: 42.50,
    last_updated: '15 mins ago',
    type: 'PMBJP_GOVT'
  };

  const samplePharmacies = [
    {
      id: 'jan-aushadhi-kendra-01',
      name: 'Pradhan Mantri Jan Aushadhi Kendra',
      address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      type: 'PMBJP_GOVT',
      stock_status: 'IN_STOCK'
    },
    {
      id: 'apollo-pharmacy-indira',
      name: 'Apollo Pharmacy 24x7',
      address: 'CMH Road, Indiranagar, Bengaluru',
      latitude: 12.9780,
      longitude: 77.6400,
      type: 'COMMERCIAL',
      stock_status: 'IN_STOCK'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#F4F9F7]">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-[#E2ECE7] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFigmaScreen(8)}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Nearby Pharmacies
            </h2>
            <p className="text-[10px] text-slate-500">
              Stores stocking generic equivalents within 5 km
            </p>
          </div>
        </div>

        {/* Jump to Full Map */}
        <button
          onClick={() => setFigmaScreen(14)}
          className="text-[10px] font-bold text-[#00796B] bg-[#E0F2F1] px-2.5 py-1 rounded-full border border-teal-200"
        >
          View All (5)
        </button>
      </div>

      {/* Top Map Half (Interactive Map matching Figma Screen 9) */}
      <div className="h-[240px] w-full relative border-b border-[#E2ECE7]">
        <InteractiveMap
          pharmacies={samplePharmacies}
          userLocation={{ lat: 12.9716, lon: 77.5946 }}
          selectedPharmacy={primaryPharmacy}
          onSelectPharmacy={() => setFigmaScreen(10)}
        />
        {/* Map Overlay Badge */}
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-sm flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Showing stores within 5 km</span>
        </div>
      </div>

      {/* Bottom Half: Nearest Pharmacy Card (Direct Figma Screen 9 layout) */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        
        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
          <span>Nearest Jan Aushadhi Store</span>
          <span className="text-[10px] text-[#00796B] font-semibold">0.8 km away</span>
        </div>

        {/* Selected Store Card */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#00796B]/30 shadow-md space-y-3">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900">{primaryPharmacy.name}</span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Govt PMBJP
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {primaryPharmacy.address}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                🟢 In Stock
              </span>
              <span className="block text-[9px] text-slate-400 mt-1">
                {primaryPharmacy.stock_qty} strips ready
              </span>
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div className="bg-[#F4F9F7] rounded-2xl p-2.5 border border-[#E2ECE7] flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Generic Unit Price</span>
              <span className="font-black text-[#00796B] text-sm">₹{primaryPharmacy.price.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Inventory Verified</span>
              <span className="text-[10px] font-semibold text-slate-600">{primaryPharmacy.last_updated}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <button
              onClick={() => setFigmaScreen(10)}
              className="flex-1 py-2.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Check Stock & Hold</span>
              <span>➔</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(primaryPharmacy.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center"
            >
              📍 Route
            </a>
          </div>

        </div>

        {/* Freshness Disclaimer Safeguard */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          ⚠️ Note: Inventory is synced from store catalog uploads. Click to reserve before traveling.
        </p>

      </div>

    </div>
  );
};
