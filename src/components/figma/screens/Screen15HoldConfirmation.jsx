import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen15HoldConfirmation = () => {
  const { setFigmaScreen, activeReservation, notify } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(3540); // ~59 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  const reservation = activeReservation || {
    reservation_id: 'RES-8942',
    pharmacy_name: 'Pradhan Mantri Jan Aushadhi Kendra',
    pharmacy_address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    pharmacy_phone: '+91 80 2520 1199',
    drug_name: 'Amoxicillin & Pot. Clavulanate 625mg',
    quantity_strips: 1,
    unit_price: 42.50,
    total_price: 42.50
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(reservation.reservation_id);
    notify('Reservation ID copied to clipboard!', 'success');
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(10)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Reservation Ticket
          </h2>
          <p className="text-[11px] text-slate-500">
            Confirmed 1-hour physical stock hold
          </p>
        </div>
      </div>

      {/* Ticket Master Container (Matching Figma Screen 15) */}
      <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-md overflow-hidden relative">
        
        {/* Ticket Top Banner */}
        <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] p-4 text-white text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl mx-auto mb-1.5 shadow-inner">
            ✓
          </div>
          <h3 className="text-base font-black">Medicine Reserved!</h3>
          <p className="text-[11px] text-emerald-100">
            Physical stock is set aside at the pharmacy counter.
          </p>
        </div>

        {/* Hold ID & Expiry Countdown */}
        <div className="p-4 space-y-3">
          
          <div className="bg-[#F4F9F7] rounded-2xl p-3 border border-[#E2ECE7] flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Reservation Code
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-sm font-mono font-black text-[#00796B]">
                  {reservation.reservation_id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-xs text-slate-400 hover:text-slate-600"
                  title="Copy"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-amber-700 font-semibold uppercase block">
                Hold Expires In
              </span>
              <span className="text-sm font-mono font-bold text-amber-600">
                ⏱️ {formatTimer(secondsLeft)}
              </span>
            </div>
          </div>

          {/* Pharmacy & Route */}
          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Pickup Location
            </span>
            <div className="font-bold text-slate-900">{reservation.pharmacy_name}</div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {reservation.pharmacy_address}
            </p>
          </div>

          {/* Reserved SKU Details */}
          <div className="pt-2 border-t border-slate-100 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800 block">{reservation.drug_name}</span>
              <span className="text-[10px] text-slate-400">{reservation.quantity_strips} Strip(s) Reserved</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#00796B]">
                ₹{reservation.total_price?.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block">Pay at counter</span>
            </div>
          </div>

          {/* QR Code / Barcode Simulation */}
          <div className="pt-3 border-t border-dashed border-slate-200 text-center">
            <div className="w-32 h-32 bg-slate-900 mx-auto rounded-2xl p-2.5 flex items-center justify-center shadow-inner">
              {/* Stylized QR Matrix Pattern */}
              <div className="w-full h-full bg-white rounded-lg p-1.5 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black rounded" />
                  <div className="w-2 h-2 bg-black rounded-sm" />
                  <div className="w-6 h-6 bg-black rounded" />
                </div>
                <div className="text-[7px] font-mono tracking-widest font-black text-slate-900">
                  PMBJP • {reservation.reservation_id}
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black rounded" />
                  <div className="w-3 h-3 bg-black rounded-sm" />
                  <div className="w-2 h-2 bg-black rounded-sm" />
                </div>
              </div>
            </div>
            <span className="block text-[10px] text-slate-400 mt-1.5">
              Pharmacist scans this code to release your held medication
            </span>
          </div>

        </div>

      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reservation.pharmacy_address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <span>📍 Get Google Maps Directions</span>
          <span>➔</span>
        </a>

        <div className="flex gap-2">
          <a
            href={`tel:${reservation.pharmacy_phone}`}
            className="flex-1 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1"
          >
            <span>📞</span>
            <span>Call Pharmacist</span>
          </a>

          <button
            onClick={() => setFigmaScreen(3)}
            className="flex-1 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00796B] font-bold text-xs hover:bg-emerald-100 transition-colors"
          >
            Done (Go to Home)
          </button>
        </div>
      </div>

    </div>
  );
};
