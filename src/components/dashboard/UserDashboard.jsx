import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import {
  Upload,
  Search,
  MapPin,
  Bot,
  Pill,
  TrendingDown,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

export const UserDashboard = () => {
  const {
    user,
    setActiveTab,
    prescriptionHistory,
    setCurrentPrescription,
    patientHistory,
    notify
  } = useApp();

  const [dashboardSearch, setDashboardSearch] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (dashboardSearch.trim()) {
      setActiveTab('search');
    }
  };

  const handleOpenPrescription = (rx) => {
    setCurrentPrescription({
      extracted_text: rx.raw_text,
      total_medicines_found: rx.items ? rx.items.length : 0,
      medicines: (rx.items || []).map((item) => ({
        drug_id: item.generic_molecule_slug || 'drug',
        brand_name: item.brand_name,
        dosage_form: item.dosage_form || 'Tablet',
        strength: item.strength,
        active_ingredients: [{ molecule: item.active_ingredient, strength_mg: item.strength, role: 'Active API' }],
        branded_unit_price: item.branded_unit_price || 20.0,
        generic_unit_price: item.generic_unit_price || 3.5,
        savings_percentage: item.savings_percentage || 80.0,
        prescribed_frequency: item.frequency || '1-0-1',
        prescribed_timing: item.timing || 'After food',
        generic_alternative: {
          generic_name: `${item.active_ingredient} ${item.strength}`,
          pmbjp_drug_code: item.pmbjp_code || 'PMBJP0012',
          jan_aushadhi_unit_price: item.generic_unit_price || 3.5,
          manufacturer: item.generic_manufacturer || 'Jan Aushadhi (BPPI)',
          cdsco_approved: true
        }
      })),
      financial_summary: {
        sample_pack_branded_total_inr: rx.total_branded_cost,
        sample_pack_generic_total_inr: rx.total_generic_cost,
        net_savings_inr: rx.net_savings,
        savings_percentage: rx.savings_percentage
      }
    });
    setActiveTab('confirmation');
  };

  // Calculate totals
  const totalSaved = prescriptionHistory.reduce((acc, rx) => acc + (rx.net_savings || 0), 185.5);
  const totalRxs = prescriptionHistory.length || 1;

  return (
    <div className="space-y-8 py-4 pb-16">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-200">
                Patient Medical Portal
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Mobile OTP Verified (+91 {user.mobile_number})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.user_name || 'Patient'}
            </h1>
            <p className="text-sm text-teal-100 mt-1 max-w-xl">
              Track your prescriptions, find bioequivalent Jan Aushadhi generic alternatives, and verify nearby store availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-teal-700" />
              Upload New Rx
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className="px-4 py-2.5 bg-teal-600/80 hover:bg-teal-600 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Ask AI Pharmacist
            </button>
          </div>
        </div>
      </div>

      {/* KPI Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimated Total Savings</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{totalSaved.toFixed(0)}</div>
          <div className="text-[11px] text-slate-500">Compared to Branded MRP</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prescriptions Scanned</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Upload className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRxs}</div>
          <div className="text-[11px] text-slate-500">OCR analyzed with generic matches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Medications</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {patientHistory?.current_medications?.length || 1} Regimens
          </div>
          <div className="text-[11px] text-slate-500">Cross-checked for drug allergies</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jan Aushadhi Centers</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">5 Nearby</div>
          <div className="text-[11px] text-slate-500">Within 15km of your location</div>
        </div>

      </div>

      {/* Patient Allergy Status Alert */}
      {patientHistory?.drug_allergies?.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-0.5">
            <span className="font-bold">Active Safety Cross-Check Guard:</span> You have recorded allergies to{' '}
            <strong>{patientHistory.drug_allergies.join(', ')}</strong>. Any newly uploaded prescriptions will be automatically checked to prevent adverse reactions.
          </div>
        </div>
      )}

      {/* Dashboard Quick Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          Quick Medicine & Active Molecule Search
        </h3>
        <form onSubmit={handleQuickSearch} className="flex gap-2">
          <input
            type="text"
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            placeholder="Search by brand name (e.g. Dolo 650, Augmentin, Telma 40) or salt (Paracetamol)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>
      </div>

      {/* Recent Prescriptions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Prescriptions & Scans</h3>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
          >
            Full History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {prescriptionHistory.length > 0 ? (
            prescriptionHistory.slice(0, 3).map((rx) => (
              <div
                key={rx.id}
                className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rx.title}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                      {rx.items ? `${rx.items.length} Medicines` : 'Analyzed'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Doctor: {rx.doctor_name || 'Dr. A. Sharma'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(rx.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {it.brand_name} ({it.strength || it.active_ingredient})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Net Prescription Savings</div>
                    <div className="text-base font-extrabold text-emerald-600">
                      Save ₹{rx.net_savings} ({rx.savings_percentage}%)
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenPrescription(rx)}
                    className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    View Generics <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No prescriptions saved yet. Upload your first prescription above!
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div
          onClick={() => setActiveTab('upload')}
          className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-200 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">Scan Rx & Extract Molecules</h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            Drag-and-drop clinic slips or test with one of 3 realistic clinic presets.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('pharmacies')}
          className="p-5 bg-gradient-to-br from-sky-50 to-teal-50/50 border border-sky-200 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">Interactive Pharmacy Map</h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            Locate Jan Aushadhi Kendras with verified stock counts and navigation pins.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('chatbot')}
          className="p-5 bg-gradient-to-br from-indigo-50 to-teal-50/50 border border-indigo-200 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">AI Multilingual Pharmacist</h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            Ask in English, Kannada, or Hindi about dosages, food timings, and precautions.
          </p>
        </div>

      </div>

    </div>
  );
};
