import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen08PriceComparison = () => {
  const { setFigmaScreen } = useApp();
  const [filterCategory, setFilterCategory] = useState('all');
  const [durationMonths, setDurationMonths] = useState(12);
  const [familyMembers, setFamilyMembers] = useState(1);

  const brandedMonthly = 433.82;
  const genericMonthly = 87.00;
  const monthlySavings = brandedMonthly - genericMonthly;

  const totalBranded = brandedMonthly * durationMonths * familyMembers;
  const totalGeneric = genericMonthly * durationMonths * familyMembers;
  const totalSavings = totalBranded - totalGeneric;
  const savingsPercent = ((totalSavings / totalBranded) * 100).toFixed(0);

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
            Price Comparison
          </h2>
          <p className="text-[11px] text-slate-500">
            Branded MRP vs Jan Aushadhi generic cost
          </p>
        </div>
      </div>

      {/* Category Filter Pills (Matching Figma Screen 8) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {['all', 'tablets', 'capsules'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full capitalize transition-all ${
              filterCategory === cat
                ? 'bg-[#00796B] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All (3)' : cat === 'tablets' ? 'Tablets (2)' : 'Capsules (1)'}
          </button>
        ))}
      </div>

      {/* Side-by-Side Savings Summary Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3">
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800">Prescription Cost Comparison</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            {savingsPercent}% Savings
          </span>
        </div>

        {/* 2-Column Price Comparison */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
              Branded MRP
            </span>
            <div className="text-lg font-black text-slate-700 mt-0.5">
              ₹{brandedMonthly.toFixed(2)}
            </div>
            <span className="text-[9px] text-slate-400">Standard retail</span>
          </div>

          <div className="bg-[#E0F2F1] rounded-2xl p-3 border border-teal-200 text-center">
            <span className="text-[10px] text-[#00796B] font-bold uppercase block">
              Jan Aushadhi
            </span>
            <div className="text-lg font-black text-[#00796B] mt-0.5">
              ₹{genericMonthly.toFixed(2)}
            </div>
            <span className="text-[9px] text-teal-700 font-medium">Govt subsidy</span>
          </div>
        </div>

        {/* Visual Comparison Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
            <span>Spend Distribution</span>
            <span>You retain ₹{monthlySavings.toFixed(2)} / month</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="bg-[#00796B] h-full transition-all"
              style={{ width: `${(genericMonthly / brandedMonthly) * 100}%` }}
              title="Generic Spend (20%)"
            />
            <div
              className="bg-emerald-400/80 h-full transition-all"
              style={{ width: `${((brandedMonthly - genericMonthly) / brandedMonthly) * 100}%` }}
              title="Your Savings (80%)"
            />
          </div>
        </div>

      </div>

      {/* Annual Chronic Savings Calculator Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Chronic Basket Calculator</h3>
            <p className="text-[10px] text-slate-400">Calculate cumulative long-term savings</p>
          </div>
          <span className="text-base">🧮</span>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
            <span>Duration</span>
            <span className="text-[#00796B] font-bold">{durationMonths} Months</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            className="w-full accent-[#00796B] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
            <span>1 mo</span>
            <span>6 mo</span>
            <span>12 mo</span>
            <span>24 mo</span>
          </div>
        </div>

        {/* Family Member Multiplier */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-slate-700">Family Members on Medication:</span>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-0.5">
            <button
              onClick={() => setFamilyMembers((f) => Math.max(1, f - 1))}
              className="text-xs font-bold text-slate-600 px-1 hover:text-[#00796B]"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-800">{familyMembers}</span>
            <button
              onClick={() => setFamilyMembers((f) => Math.min(10, f + 1))}
              className="text-xs font-bold text-slate-600 px-1 hover:text-[#00796B]"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Projected Annual Savings Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-[#00796B] rounded-2xl p-3 text-white text-center shadow-sm">
          <span className="text-[10px] text-emerald-100 uppercase font-semibold tracking-wide">
            Projected Total Savings
          </span>
          <div className="text-xl font-black mt-0.5">
            ₹{totalSavings.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-100/90 block mt-0.5">
            (Pay only ₹{totalGeneric.toFixed(2)} instead of ₹{totalBranded.toFixed(2)})
          </span>
        </div>

      </div>

      {/* Advance to Nearby Pharmacies CTA */}
      <button
        onClick={() => setFigmaScreen(9)}
        className="w-full py-3.5 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold text-xs shadow-md shadow-teal-800/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <span>Locate Nearby Jan Aushadhi Stores</span>
        <span>➔</span>
      </button>

    </div>
  );
};
