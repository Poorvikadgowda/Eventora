import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen07GenericAlternatives = () => {
  const { setFigmaScreen, addToBasket, notify } = useApp();
  const [selectedGenericId, setSelectedGenericId] = useState('jan-amox-625');

  const genericMatches = [
    {
      id: 'jan-amox-625',
      name: 'Amoxicillin & Potassium Clavulanate 625mg',
      manufacturer: 'Jan Aushadhi (BPPI)',
      pmbjp_code: 'PMBJP00312',
      generic_price: 42.50,
      branded_price: 201.27,
      savings_percentage: 78.9,
      dosage_form: 'Tablet (Strip of 6)',
      cdsco_approved: true,
      bioequivalence_status: 'Bioequivalent Certified (90% Confidence Interval within 80-125%)'
    },
    {
      id: 'trade-amox-625',
      name: 'Amoxy-Clav 625 Generic Formulations',
      manufacturer: 'Cipla Med Generic',
      pmbjp_code: 'GEN-CIPLA-88',
      generic_price: 58.00,
      branded_price: 201.27,
      savings_percentage: 71.2,
      dosage_form: 'Tablet (Strip of 6)',
      cdsco_approved: true,
      bioequivalence_status: 'US-FDA / CDSCO WHO-GMP Certified'
    }
  ];

  const handleSelectAndBasket = (gen) => {
    setSelectedGenericId(gen.id);
    addToBasket({
      drug_id: gen.id,
      brand_name: gen.name,
      manufacturer: gen.manufacturer,
      price: gen.generic_price
    });
    notify(`Selected ${gen.name}`, 'success');
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(6)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Generic Alternatives
          </h2>
          <p className="text-[11px] text-slate-500">
            Govt-certified Jan Aushadhi active equivalents
          </p>
        </div>
      </div>

      {/* Prescribed Brand Master Card (Matching Figma Screen 7) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
              💊
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">
                Prescribed Brand
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Augmentin 625 Duo
              </h3>
              <p className="text-[10px] text-slate-500">
                Amoxicillin 500mg + Clavulanic Acid 125mg
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-slate-900">₹201.27</span>
            <span className="block text-[9px] text-slate-400">MRP per strip</span>
          </div>
        </div>

        {/* CDSCO Bioequivalence Advisory Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center space-x-1.5 text-[10px] text-emerald-800">
          <span>🛡️</span>
          <span>
            <strong className="font-semibold text-emerald-950">Bioequivalent:</strong> Same API chemical structure, absorption rate, and clinical cure rate.
          </span>
        </div>
      </div>

      {/* Generic Matches Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Matching Generic Equivalents</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            Save up to 79%
          </span>
        </div>

        {genericMatches.map((gen) => {
          const isSelected = selectedGenericId === gen.id;
          return (
            <div
              key={gen.id}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-sm ${
                isSelected
                  ? 'border-[#00796B] ring-2 ring-[#00796B]/20'
                  : 'border-[#E2ECE7] hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-900">{gen.name}</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      PMBJP
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Mfg: {gen.manufacturer} • Code: <span className="font-mono">{gen.pmbjp_code}</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-[#00796B]">
                    ₹{gen.generic_price.toFixed(2)}
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    {gen.savings_percentage}% OFF
                  </span>
                </div>
              </div>

              {/* Bioequivalence Spec */}
              <p className="text-[10px] text-slate-400 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                ✓ {gen.bioequivalence_status}
              </p>

              {/* Selection Button */}
              <button
                type="button"
                onClick={() => handleSelectAndBasket(gen)}
                className={`w-full mt-3 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#00796B] text-white shadow-sm'
                    : 'bg-emerald-50 text-[#00796B] hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>{isSelected ? '✓ Selected Alternative' : 'Select This Generic'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Advance to Price Comparison CTA */}
      <button
        onClick={() => setFigmaScreen(8)}
        className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <span>Compare Detailed Prices & Annual Savings</span>
        <span>➔</span>
      </button>

    </div>
  );
};
