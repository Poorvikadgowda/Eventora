import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/AppContext';
import { analyzePrescription } from '../../../services/api';

export const Screen05ScanOcr = () => {
  const { setFigmaScreen, currentPrescription, setCurrentPrescription, notify } = useApp();
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Enhancing document contrast...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText('Extracting printed & handwritten medical text...');
    }, 1200);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Parsing active molecules & dosages via NER...');
    }, 2400);

    const t3 = setTimeout(async () => {
      setProgress(100);
      setStatusText('Analysis Complete! 3 active medicines detected.');
      
      // Perform or simulate analysis
      try {
        const rawText = currentPrescription?.raw_text || 'Tab Augmentin 625 Duo 1-0-1 after food\nTab Dolo 650mg 1-0-1\nCap Pantocid DSR 1-0-0';
        const data = await analyzePrescription(rawText);
        setCurrentPrescription((prev) => ({
          ...prev,
          ...data,
          analyzed: true
        }));
      } catch (err) {
        console.warn('OCR fallback used:', err.message);
      }
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleProceed = () => {
    setFigmaScreen(6); // Advance to Screen 6 (Extracted Info Confirmation)
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(4)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Scanning Prescription
          </h2>
          <p className="text-[11px] text-slate-500">
            Vision OCR & Active Molecule Parsing
          </p>
        </div>
      </div>

      {/* Prescription Document Container with Laser Scan Effect */}
      <div className="relative bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        
        {/* Animated Green Laser Scan Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce z-20" />

        {/* Prescription Header Simulation */}
        <div className="border-b border-slate-100 pb-2 mb-3 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black text-[#00796B] tracking-wider uppercase block">
              Apex Care Multispeciality
            </span>
            <span className="text-xs font-bold text-slate-800">
              Dr. R. Mehta, MBBS, DM (Cardio)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Rx #7829-26
          </span>
        </div>

        {/* Highlighted Bounding Boxes (as seen in Figma Screen 5) */}
        <div className="space-y-2.5 my-2">
          
          <div className="p-2 rounded-xl border border-emerald-400/80 bg-emerald-50/70 text-slate-800 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-950 block">
                1. Tab Augmentin 625 Duo
              </span>
              <span className="text-[10px] text-emerald-700">
                Amoxicillin 500mg + Clavulanic Acid 125mg • 1-0-1
              </span>
            </div>
            <span className="text-xs">✅</span>
          </div>

          <div className="p-2 rounded-xl border border-teal-400/80 bg-teal-50/70 text-slate-800 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-teal-950 block">
                2. Tab Dolo 650mg
              </span>
              <span className="text-[10px] text-teal-700">
                Paracetamol 650mg • 1-0-1 (SOS)
              </span>
            </div>
            <span className="text-xs">✅</span>
          </div>

          <div className="p-2 rounded-xl border border-emerald-400/80 bg-emerald-50/70 text-slate-800 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-950 block">
                3. Cap Pantocid DSR
              </span>
              <span className="text-[10px] text-emerald-700">
                Pantoprazole 40mg + Domperidone 30mg • 1-0-0
              </span>
            </div>
            <span className="text-xs">✅</span>
          </div>

        </div>

        {/* Doctor Stamp & Signature preview */}
        <div className="flex justify-between items-end pt-3 border-t border-slate-100 text-[10px] text-slate-400">
          <span>Adv: Low sodium diet</span>
          <span className="font-serif italic text-emerald-800">Dr. R. Mehta [Reg: 58291]</span>
        </div>

      </div>

      {/* OCR Status & Progress Tracker */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{statusText}</span>
          </span>
          <span className="font-mono font-bold text-[#00796B]">{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00796B] to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* CTA Button once complete */}
        {progress >= 100 && (
          <button
            onClick={handleProceed}
            className="w-full mt-2 py-3 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 animate-fade-in"
          >
            <span>Review Extracted Medicines (3 Detected)</span>
            <span>➔</span>
          </button>
        )}
      </div>

    </div>
  );
};
