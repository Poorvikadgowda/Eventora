import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen10PharmacyStock = () => {
  const { setFigmaScreen, setActiveReservation, notify } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const unitPrice = 42.50;
  const totalPrice = unitPrice * quantity;

  const handleReserve = () => {
    setLoading(true);
    setTimeout(() => {
      const reservationId = 'RES-' + Math.floor(1000 + Math.random() * 9000);
      setActiveReservation({
        reservation_id: reservationId,
        pharmacy_name: 'Pradhan Mantri Jan Aushadhi Kendra',
        pharmacy_address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
        pharmacy_phone: '+91 80 2520 1199',
        drug_name: 'Amoxicillin & Potassium Clavulanate 625mg',
        quantity_strips: quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expires_in_minutes: 60
      });
      notify(`Reservation hold confirmed! ID: ${reservationId}`, 'success');
      setLoading(false);
      setFigmaScreen(15); // Advance to Screen 15 (Hold Confirmation Ticket)
    }, 600);
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(9)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Reserve Medicine
          </h2>
          <p className="text-[11px] text-slate-500">
            1-hour complimentary stock hold reservation
          </p>
        </div>
      </div>

      {/* Store Master Card (Matching Figma Screen 10) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
              ✓ Verified PMBJP Kendra
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Jan Aushadhi Kendra – Indiranagar
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru
            </p>
          </div>
          <span className="text-2xl">🏪</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span>🕒 Open today: 8:00 AM – 10:00 PM</span>
          <a href="tel:+918025201199" className="text-[#00796B] font-bold hover:underline">
            📞 Call Store
          </a>
        </div>
      </div>

      {/* Selected Generic Medicine SKU Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-xl">
              💊
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Amoxicillin & Pot. Clavulanate 625mg
              </h4>
              <p className="text-[10px] text-slate-400">
                Tablet Strip of 6 • PMBJP00312
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            24 in stock
          </span>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Unit Price</span>
            <span className="font-bold text-slate-800">₹{unitPrice.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Savings vs MRP</span>
            <span className="font-bold text-emerald-600">Save 79% (₹158.77)</span>
          </div>
        </div>

        {/* Quantity Strip Counter */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-slate-800">Select Quantity:</span>
          
          <div className="flex items-center space-x-3 bg-[#F4F9F7] border border-slate-200 rounded-full px-3 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-6 h-6 rounded-full bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 shadow-sm"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-900 w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-6 h-6 rounded-full bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price Row */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold">
          <span className="text-slate-600">Total Payable at Store:</span>
          <span className="text-base font-black text-[#00796B]">
            ₹{totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 60-Minute Complimentary Hold Policy Notice */}
      <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200/60 text-[11px] text-emerald-950 space-y-1">
        <div className="font-bold flex items-center space-x-1">
          <span>⏱️</span>
          <span>60-Minute Free Hold Guarantee</span>
        </div>
        <p className="text-[10px] text-emerald-800/90 leading-relaxed">
          No advance payment required. The pharmacist will physically reserve your strips for 1 hour. Show the confirmation ID at counter.
        </p>
      </div>

      {/* Primary CTA Button */}
      <button
        onClick={handleReserve}
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        {loading ? (
          <span className="animate-spin text-base">⏳</span>
        ) : (
          <>
            <span>Confirm 1-Hour Hold Reservation</span>
            <span>➔</span>
          </>
        )}
      </button>

    </div>
  );
};
