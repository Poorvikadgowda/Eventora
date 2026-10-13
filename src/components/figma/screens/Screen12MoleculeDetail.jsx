import React from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen12MoleculeDetail = () => {
  const { setFigmaScreen, addToBasket, notify } = useApp();

  const handleAddAndFind = () => {
    addToBasket({
      drug_id: 'jan-amox-625',
      brand_name: 'Amoxicillin & Clavulanate 625mg Generic',
      price: 42.50
    });
    setFigmaScreen(9); // Advance to Nearby Pharmacies Map
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(7)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Molecule Deep Dive
          </h2>
          <p className="text-[11px] text-slate-500">
            Pharmacology, Bioequivalence & CDSCO Standards
          </p>
        </div>
      </div>

      {/* Primary Brand Spec Card (Matching Figma Screen 12) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl">
              🔬
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#00796B] uppercase tracking-wide block">
                Active Formulation
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Amoxicillin + Clavulanic Acid
              </h3>
              <p className="text-[10px] text-slate-500">
                Therapeutic Class: Broad Spectrum Antibiotic
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Schedule H
          </span>
        </div>

        {/* Mechanism of Action */}
        <div className="bg-[#F4F9F7] rounded-2xl p-3 border border-[#E2ECE7] space-y-2 text-xs">
          <span className="font-bold text-slate-800 block text-[11px]">
            Dual Molecular Action Mechanism:
          </span>
          <div className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">•</span>
              <p>
                <strong className="text-slate-800">Amoxicillin (500mg):</strong> Inhibits bacterial cell wall synthesis during active multiplication, resulting in bactericidal lysis.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-600 font-bold">•</span>
              <p>
                <strong className="text-slate-800">Clavulanic Acid (125mg):</strong> Irreversibly blocks beta-lactamase enzymes produced by resistant bacteria, restoring full amoxicillin potency.
              </p>
            </div>
          </div>
        </div>

        {/* CDSCO Bioequivalence Testing Matrix */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">CDSCO Bioequivalence Report</span>
            <span className="text-[10px] text-emerald-600 font-bold">Passed (100%)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block">Peak Concentration (Cmax)</span>
              <span className="font-bold text-slate-800">98.4% Ratio (Target 80-125%)</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block">Absorption Area (AUC)</span>
              <span className="font-bold text-slate-800">99.1% Ratio (Target 80-125%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equivalent Generic Options */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-slate-800">Jan Aushadhi PMBJP Alternative</h4>
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Amoxy-Clav 625mg (PMBJP00312)</span>
            <span className="text-[10px] text-slate-400">BPPI Govt Certified • 6 Tablets</span>
          </div>
          <div className="text-right">
            <span className="font-black text-[#00796B] text-sm">₹42.50</span>
            <span className="block text-[9px] text-emerald-600 font-semibold">Save ₹158.77</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleAddAndFind}
          className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <span>Find Nearby Stock & Reserve (₹42.50)</span>
          <span>➔</span>
        </button>

        <button
          onClick={() => setFigmaScreen(11)}
          className="w-full py-2.5 rounded-full bg-white border border-[#00796B]/30 hover:bg-emerald-50 text-[#00796B] font-bold text-xs transition-colors flex items-center justify-center space-x-1"
        >
          <span>💬 Ask Pharmacist Questions About This Drug</span>
        </button>
      </div>

    </div>
  );
};
