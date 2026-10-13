import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen06ExtractedReview = () => {
  const { setFigmaScreen, currentPrescription, setCurrentPrescription, notify } = useApp();

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      brand_name: 'Augmentin 625 Duo',
      active_ingredient: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
      dosage_form: 'Tablet',
      frequency: '1-0-1',
      timing: 'After food',
      duration: '5 days',
      branded_price: 201.27,
      generic_price: 42.50
    },
    {
      id: 2,
      brand_name: 'Dolo 650',
      active_ingredient: 'Paracetamol 650mg',
      dosage_form: 'Tablet',
      frequency: '1-0-1',
      timing: 'After food (SOS)',
      duration: '3 days',
      branded_price: 34.05,
      generic_price: 9.50
    },
    {
      id: 3,
      brand_name: 'Pantocid DSR',
      active_ingredient: 'Pantoprazole 40mg + Domperidone 30mg',
      dosage_form: 'Capsule',
      frequency: '1-0-0',
      timing: 'Empty stomach',
      duration: '10 days',
      branded_price: 198.50,
      generic_price: 35.00
    }
  ]);

  const handleUpdateMedicine = (id, field, value) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    notify('Removed medicine item', 'info');
  };

  const handleAddMedicine = () => {
    const newMed = {
      id: Date.now(),
      brand_name: 'Telma 40',
      active_ingredient: 'Telmisartan 40mg',
      dosage_form: 'Tablet',
      frequency: '1-0-0',
      timing: 'Morning',
      duration: '30 days',
      branded_price: 140.0,
      generic_price: 14.0
    };
    setMedicines((prev) => [...prev, newMed]);
    notify('Added Telma 40 to extracted items', 'success');
  };

  const handleConfirm = () => {
    setCurrentPrescription((prev) => ({
      ...prev,
      confirmed_medicines: medicines,
      total_branded: medicines.reduce((sum, m) => sum + m.branded_price, 0),
      total_generic: medicines.reduce((sum, m) => sum + m.generic_price, 0)
    }));
    notify('Prescription confirmed! Searching Jan Aushadhi generic catalog...', 'success');
    setFigmaScreen(7); // Advance to Screen 7 (Generic Alternatives)
  };

  return (
    <div className="px-4 py-4 space-y-3.5 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(5)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Extracted Information
          </h2>
          <p className="text-[11px] text-slate-500">
            Review and confirm extracted prescription data
          </p>
        </div>
      </div>

      {/* Doctor & Clinic Header Card (Matching Figma Screen 6) */}
      <div className="bg-white rounded-3xl p-3.5 border border-[#E2ECE7] shadow-sm flex items-center space-x-3">
        <img
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=160&auto=format&fit=crop&q=60"
          alt="Prescription Thumbnail"
          className="w-14 h-14 object-cover rounded-2xl border border-slate-100 shadow-inner"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#00796B] uppercase tracking-wide">
              Apex Care Multispeciality
            </span>
            <span className="text-[10px] text-slate-400">28 Sep 2026</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">
            Dr. R. Mehta, MBBS, DM (Cardio)
          </h3>
          <p className="text-[10px] text-slate-500 truncate">
            Patient: Rahul Verma (38M) • 3 Prescribed Drugs
          </p>
        </div>
      </div>

      {/* Extracted Medicines List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Detected Medicines ({medicines.length})</span>
          <span className="text-[10px] text-[#00796B] font-medium">Click fields to edit</span>
        </div>

        {medicines.map((med) => (
          <div
            key={med.id}
            className="bg-white rounded-3xl p-3.5 border border-[#E2ECE7] shadow-sm space-y-2 relative"
          >
            {/* Top row: Brand name & Delete */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={med.brand_name}
                  onChange={(e) => handleUpdateMedicine(med.id, 'brand_name', e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[#00796B]"
                />
                <span className="block text-[10px] font-medium text-[#00796B] mt-0.5">
                  Salt: {med.active_ingredient}
                </span>
              </div>
              <button
                onClick={() => handleRemoveMedicine(med.id)}
                className="text-slate-300 hover:text-red-500 text-xs p-1"
                title="Remove"
              >
                ✕
              </button>
            </div>

            {/* Dosages & Frequency Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-mono font-medium">
                {med.frequency}
              </span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg font-medium border border-emerald-100">
                {med.timing}
              </span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                {med.duration}
              </span>
              <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-lg font-semibold ml-auto">
                MRP: ₹{med.branded_price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Another Medicine Button */}
      <button
        type="button"
        onClick={handleAddMedicine}
        className="w-full py-2.5 rounded-2xl bg-white border border-dashed border-[#00796B]/50 hover:bg-emerald-50/50 text-[#00796B] font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
      >
        <span>+</span>
        <span>Add Another Medicine</span>
      </button>

      {/* CTA Confirm Button */}
      <button
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <span>Confirm & Find Generic Alternatives</span>
        <span>➔</span>
      </button>

    </div>
  );
};
