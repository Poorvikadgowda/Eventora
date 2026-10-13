import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { analyzePrescription } from '../../../services/api';

const CLINIC_PRESETS = [
  {
    id: 'sample-1',
    doctor: 'Dr. R. Mehta, DM',
    clinic: 'Apex Cardiology Centre',
    title: 'Cardiology & BP Rx',
    rawText: 'Tab Telma 40mg 1-0-0 before breakfast\nCap Pantocid DSR 1-0-0 empty stomach\nTab Dolo 650mg SOS fever',
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 'sample-2',
    doctor: 'Dr. Anita Joshi, MD',
    clinic: 'Fortis Multi-Speciality',
    title: 'Infection & Fever Rx',
    rawText: 'Tab Augmentin 625 Duo 1-0-1 after food x 5 days\nTab Dolo 650mg 1-0-1 after food\nCap Pantocid DSR 1-0-0',
    thumbnail: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 'sample-3',
    doctor: 'Dr. K. Srinivas, DM',
    clinic: 'Diabetes & Endocrine Clinic',
    title: 'Diabetes & Statin Rx',
    rawText: 'Tab Glycomet GP2 1-0-0 before breakfast\nTab Atorva 20mg 0-0-1 at bedtime\nTab Telma 40mg 1-0-0',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=60'
  }
];

export const Screen04UploadRx = () => {
  const { setFigmaScreen, setCurrentPrescription, notify } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectPreset = (preset) => {
    setCurrentPrescription({
      preset_id: preset.id,
      doctor_name: preset.doctor,
      clinic: preset.clinic,
      title: preset.title,
      raw_text: preset.rawText,
      image_url: preset.thumbnail
    });
    notify(`Loaded prescription from ${preset.clinic}`, 'info');
    // Advance to Screen 5 (Laser OCR Scanning Animation)
    setFigmaScreen(5);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCurrentPrescription({
        doctor_name: 'Dr. R. Mehta, DM',
        clinic: 'Scanned Clinic Document',
        title: file.name,
        raw_text: 'Tab Augmentin 625 Duo 1-0-1 after food\nTab Dolo 650mg 1-0-1',
        file_obj: file
      });
      setFigmaScreen(5);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(3)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Upload Prescription
          </h2>
          <p className="text-[11px] text-slate-500">
            Upload doctor's slip for active molecule analysis
          </p>
        </div>
      </div>

      {/* Main Upload Dropzone Card (Matching Figma Screen 4) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-[#00796B]/30 hover:border-[#00796B] transition-all text-center shadow-sm">
        
        <div className="w-16 h-16 rounded-full bg-[#E0F2F1] text-[#00796B] flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
          📄
        </div>

        <h3 className="text-sm font-bold text-slate-800">
          Drop your prescription here
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
          High clarity JPEG, PNG or PDF under 10MB recommended
        </p>

        {/* Action Buttons Row */}
        <div className="flex justify-center gap-2 mt-4">
          <label className="cursor-pointer px-4 py-2 bg-[#00796B] hover:bg-[#004D40] text-white text-xs font-bold rounded-full shadow-sm flex items-center space-x-1.5 active:scale-95 transition-all">
            <span>📁</span>
            <span>Browse File</span>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>

          <label className="cursor-pointer px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#00796B] border border-emerald-200 text-xs font-bold rounded-full shadow-sm flex items-center space-x-1.5 active:scale-95 transition-all">
            <span>📸</span>
            <span>Camera</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

      </div>

      {/* 3 Pre-Loaded Clinic Presets Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">
            Or Test with Clinic Presets:
          </h3>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-semibold">
            1-Click Demo
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {CLINIC_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="bg-white rounded-2xl p-2 border border-[#E2ECE7] hover:border-[#00796B] shadow-sm hover:shadow transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <img
                src={preset.thumbnail}
                alt={preset.title}
                className="w-full h-16 object-cover rounded-xl mb-1.5 border border-slate-100 group-hover:scale-105 transition-transform"
              />
              <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                {preset.title}
              </span>
              <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                {preset.doctor}
              </span>
              <span className="text-[9px] text-[#00796B] font-bold mt-1">
                Scan ➔
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy & Bioequivalence Notice */}
      <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200/50 flex items-start space-x-2 text-[11px] text-emerald-900">
        <span className="text-sm">🛡️</span>
        <div>
          <span className="font-bold">CDSCO Bioequivalence Rule:</span> Generics contain identical active pharmaceutical ingredients (API) with matching therapeutic potency.
        </div>
      </div>

    </div>
  );
};
