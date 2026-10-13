import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen03Home = () => {
  const { user, setFigmaScreen, language, setLanguage, prescriptionHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setFigmaScreen(7); // Jump to generic search screen
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header: User Profile Avatar & Notification Bell */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00796B] to-emerald-400 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold text-[#00796B]">
              RV
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Welcome back,</span>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {user?.user_name || 'Rahul Verma'}
            </h2>
          </div>
        </div>

        {/* Language & Notification Icons */}
        <div className="flex items-center space-x-2">
          {/* Vernacular Toggle Pill */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 rounded-full px-2 py-1 shadow-sm focus:outline-none"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>

          <button
            onClick={() => setFigmaScreen(11)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 relative"
          >
            <span>💬</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search brand, molecule or store..."
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00796B]/40 focus:border-[#00796B]"
        />
        {searchQuery && (
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-2.5 py-1 bg-[#00796B] text-white text-[11px] font-bold rounded-xl"
          >
            Go
          </button>
        )}
      </form>

      {/* Lifetime Savings KPI Card */}
      <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider">
              Verified Generic Savings
            </span>
            <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
              82% Average
            </span>
          </div>
          <div className="text-2xl font-black mt-1">₹14,280</div>
          <p className="text-[11px] text-emerald-100/80 mt-1">
            Saved across 6 prescriptions using PMBJP Jan Aushadhi bioequivalent substitutes.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2x2 Quick Action Cards Grid (Direct Figma screen layout) */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 mb-2.5 tracking-tight">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Card 1: Upload Prescription */}
          <button
            onClick={() => setFigmaScreen(4)}
            className="bg-[#E0F2F1] hover:bg-[#cbf0ee] border border-teal-200/60 rounded-3xl p-3.5 text-left flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#00796B] text-white flex items-center justify-center text-lg shadow-sm mb-2">
              📸
            </div>
            <div>
              <div className="text-xs font-bold text-[#004D40]">Upload Rx</div>
              <div className="text-[10px] text-teal-800/70 mt-0.5">Scan doctor slip with OCR</div>
            </div>
          </button>

          {/* Card 2: Find Generics */}
          <button
            onClick={() => setFigmaScreen(7)}
            className="bg-[#ECFDF5] hover:bg-[#d5f7e6] border border-emerald-200/60 rounded-3xl p-3.5 text-left flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm mb-2">
              💊
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">Find Generics</div>
              <div className="text-[10px] text-emerald-800/70 mt-0.5">Jan Aushadhi alternatives</div>
            </div>
          </button>

          {/* Card 3: Nearby Pharmacies */}
          <button
            onClick={() => setFigmaScreen(9)}
            className="bg-[#E0F2FE] hover:bg-[#c9e9fd] border border-sky-200/60 rounded-3xl p-3.5 text-left flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-lg shadow-sm mb-2">
              🗺️
            </div>
            <div>
              <div className="text-xs font-bold text-sky-950">Nearby Stores</div>
              <div className="text-[10px] text-sky-800/70 mt-0.5">Live stock & 1hr hold</div>
            </div>
          </button>

          {/* Card 4: Savings Calculator */}
          <button
            onClick={() => setFigmaScreen(8)}
            className="bg-[#FEF3C7] hover:bg-[#fde68a] border border-amber-200/60 rounded-3xl p-3.5 text-left flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-lg shadow-sm mb-2">
              📊
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Price Compare</div>
              <div className="text-[10px] text-amber-800/70 mt-0.5">Annual chronic savings</div>
            </div>
          </button>

        </div>
      </div>

      {/* Recent Prescriptions Feed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">
            Recent Prescriptions
          </h3>
          <button
            onClick={() => setFigmaScreen(13)}
            className="text-[11px] font-bold text-[#00796B] hover:underline"
          >
            View all ({prescriptionHistory?.length || 2})
          </button>
        </div>

        <div className="space-y-2">
          {/* Recent Rx Item 1 */}
          <div
            onClick={() => setFigmaScreen(6)}
            className="bg-white rounded-2xl p-3 border border-[#E2ECE7] shadow-sm hover:border-[#00796B] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-base">
                📄
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Dr. R. Mehta, MD</h4>
                <p className="text-[10px] text-slate-400">Cardiology & BP Rx • 3 Medicines</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                Save ₹1,240
              </span>
              <span className="block text-[9px] text-slate-400 mt-0.5">90% Cheaper</span>
            </div>
          </div>

          {/* Recent Rx Item 2 */}
          <div
            onClick={() => setFigmaScreen(6)}
            className="bg-white rounded-2xl p-3 border border-[#E2ECE7] shadow-sm hover:border-[#00796B] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-base">
                📄
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Dr. Sunita Rao, MBBS</h4>
                <p className="text-[10px] text-slate-400">Fever & Infection Rx • 2 Medicines</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                Save ₹480
              </span>
              <span className="block text-[9px] text-slate-400 mt-0.5">78% Cheaper</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
