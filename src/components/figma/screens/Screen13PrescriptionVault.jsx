import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';

export const Screen13PrescriptionVault = () => {
  const { setFigmaScreen, notify } = useApp();
  const [filterTab, setFilterTab] = useState('all');

  const prescriptions = [
    {
      id: 'rx-01',
      doctor: 'Dr. R. Mehta, DM',
      clinic: 'Apex Cardiology Centre',
      date: '28 Sep 2026',
      medicinesCount: 3,
      brandedTotal: 1380.0,
      genericTotal: 140.0,
      savings: 1240.0,
      status: 'active'
    },
    {
      id: 'rx-02',
      doctor: 'Dr. Anita Joshi, MD',
      clinic: 'Fortis Multi-Speciality',
      date: '14 Aug 2026',
      medicinesCount: 2,
      brandedTotal: 615.0,
      genericTotal: 135.0,
      savings: 480.0,
      status: 'active'
    },
    {
      id: 'rx-03',
      doctor: 'Dr. K. Srinivas, DM',
      clinic: 'Endocrine Care Clinic',
      date: '02 Jun 2026',
      medicinesCount: 4,
      brandedTotal: 2540.0,
      genericTotal: 380.0,
      savings: 2160.0,
      status: 'completed'
    }
  ];

  const filteredRx = prescriptions.filter((rx) => {
    if (filterTab === 'active') return rx.status === 'active';
    if (filterTab === 'completed') return rx.status === 'completed';
    return true;
  });

  const handlePrintSlip = () => {
    window.print();
    notify('Print dialog opened for Jan Aushadhi Slip', 'info');
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
            My Prescriptions
          </h2>
          <p className="text-[11px] text-slate-500">
            Saved prescriptions, generic matches & savings archive
          </p>
        </div>
      </div>

      {/* Cumulative Lifetime Savings Card (Matching Figma Screen 13) */}
      <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-200 uppercase font-semibold tracking-wider">
            Total Healthcare Savings
          </span>
          <div className="text-2xl font-black mt-0.5">₹14,280</div>
          <span className="text-[10px] text-emerald-100/80">3 Active • 6 Completed</span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
          💰
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        {['all', 'active', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1 rounded-full capitalize transition-all ${
              filterTab === tab
                ? 'bg-[#00796B] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All (3)' : tab === 'active' ? 'Active (2)' : 'Completed (1)'}
          </button>
        ))}
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {filteredRx.map((rx) => (
          <div
            key={rx.id}
            className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3 hover:border-[#00796B] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#00796B] uppercase tracking-wide block">
                  {rx.clinic}
                </span>
                <h3 className="text-xs font-bold text-slate-900 mt-0.5">
                  {rx.doctor}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {rx.date} • {rx.medicinesCount} Medicines
                </p>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  rx.status === 'active'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                {rx.status === 'active' ? 'Active Rx' : 'Archived'}
              </span>
            </div>

            {/* Savings row */}
            <div className="bg-[#F4F9F7] rounded-2xl p-2.5 border border-[#E2ECE7] flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Generic Spend</span>
                <span className="font-bold text-[#00796B]">₹{rx.genericTotal.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">You Saved</span>
                <span className="font-bold text-emerald-600">₹{rx.savings.toFixed(2)} (89%)</span>
              </div>
            </div>

            {/* CTA to re-inspect prescription */}
            <button
              onClick={() => setFigmaScreen(6)}
              className="w-full py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#00796B] border border-emerald-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <span>View Extracted Medicines & Alternatives</span>
              <span>➔</span>
            </button>
          </div>
        ))}
      </div>

      {/* Printable Request Slip CTA */}
      <button
        type="button"
        onClick={handlePrintSlip}
        className="w-full py-3 rounded-2xl bg-white border border-[#00796B]/40 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
      >
        <span>🖨️</span>
        <span>Download Official Jan Aushadhi Request Slip</span>
      </button>

    </div>
  );
};
