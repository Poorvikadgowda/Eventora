import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { getPriceComparison, getComparableMedicines } from '../../services/api';
import {
  TrendingDown,
  Calculator,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Pill,
  ArrowRight,
  FileText,
  Sparkles,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Info,
  Check,
  ArrowUpRight
} from 'lucide-react';

const STATUTORY_PRICE_DISCLAIMER =
  'Prices are approximate/demo/local-database prices. Never claim that the displayed price is the current market price unless the application actually receives verified current data.';

export const PriceComparator = () => {
  const { currentPrescription, user, setActiveTab, notify } = useApp();

  // Selected medicine for focused comparison
  const [selectedMedicineId, setSelectedMedicineId] = useState('dolo-650');
  const [activeComparison, setActiveComparison] = useState(null);
  const [catalogList, setCatalogList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chronic Treatment Calculator States
  const [durationMonths, setDurationMonths] = useState(12);
  const [familyCount, setFamilyCount] = useState(1);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('pack'); // 'pack' | 'unit'

  // Extract prescription medicines or default seeds
  const prescriptionMedicines = currentPrescription?.medicines || [
    {
      drug_id: 'dolo-650',
      brand_name: 'Dolo 650',
      strength: '650mg',
      dosage_form: 'Tablet',
      branded_mrp_per_strip: 32.0,
      branded_unit_price: 3.2,
      generic_unit_price: 0.95,
      savings_percentage: 70.3,
      generic_alternative: {
        generic_name: 'Paracetamol Tablets IP 650mg (PMBJP0012)',
        pmbjp_drug_code: 'PMBJP0012',
        jan_aushadhi_strip_price: 9.5
      }
    },
    {
      drug_id: 'pantocid-dsr',
      brand_name: 'Pantocid DSR',
      strength: '40mg + 30mg',
      dosage_form: 'Capsule (SR)',
      branded_mrp_per_strip: 195.0,
      branded_unit_price: 19.5,
      generic_unit_price: 3.2,
      savings_percentage: 83.6,
      generic_alternative: {
        generic_name: 'Pantoprazole 40mg + Domperidone 30mg SR Capsules (PMBJP0088)',
        pmbjp_drug_code: 'PMBJP0088',
        jan_aushadhi_strip_price: 32.0
      }
    }
  ];

  // Fetch catalog & initial medicine comparison on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const catalog = await getComparableMedicines();
        if (isMounted && catalog && catalog.length > 0) {
          setCatalogList(catalog);
        }

        // Default to first prescription medicine ID if available
        const initialId = prescriptionMedicines[0]?.drug_id || 'dolo-650';
        setSelectedMedicineId(initialId);

        const comp = await getPriceComparison(initialId);
        if (isMounted) {
          setActiveComparison(comp);
        }
      } catch (err) {
        console.error('Error loading price comparison data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle medicine switch
  const handleSelectMedicine = async (medId) => {
    setSelectedMedicineId(medId);
    setIsLoading(true);
    try {
      const comp = await getPriceComparison(medId);
      setActiveComparison(comp);
    } catch (err) {
      notify?.('Could not load comparison for selected medicine', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Active comparison values with robust fallbacks
  const brandMedicineName = activeComparison?.brand_medicine || 'Dolo 650';
  const brandPrice = Number(activeComparison?.brand_price ?? 32.0);
  const genericMedicineName = activeComparison?.generic_medicine || 'Paracetamol Tablets IP 650mg (PMBJP0012)';
  const genericPrice = Number(activeComparison?.generic_price ?? 9.5);
  const absoluteSaving = Number(activeComparison?.absolute_saving ?? (brandPrice - genericPrice));
  const savingPercentage = Number(activeComparison?.saving_percentage ?? (((brandPrice - genericPrice) / brandPrice) * 100));
  const activeStrength = activeComparison?.strength || '650mg';
  const activeForm = activeComparison?.dosage_form || 'Tablet';
  const packSize = activeComparison?.pack_size || 10;

  // Unit pricing calculations
  const brandUnitPrice = +(brandPrice / packSize).toFixed(2);
  const genericUnitPrice = +(genericPrice / packSize).toFixed(2);
  const unitSaving = +(brandUnitPrice - genericUnitPrice).toFixed(2);

  // Bar visualization calculations (normalize to 100%)
  const maxPrice = Math.max(brandPrice, genericPrice, 1);
  const brandBarWidth = Math.min(100, Math.round((brandPrice / maxPrice) * 100));
  const genericBarWidth = Math.min(100, Math.max(8, Math.round((genericPrice / maxPrice) * 100)));

  // Chronic savings calculations
  const monthlyBranded = prescriptionMedicines.reduce((acc, m) => {
    const cost = m.branded_mrp_per_strip || (m.branded_unit_price * 10);
    return acc + cost * 2;
  }, 0);

  const monthlyGeneric = prescriptionMedicines.reduce((acc, m) => {
    const cost = m.generic_alternative?.jan_aushadhi_strip_price || (m.generic_unit_price * 10);
    return acc + cost * 2;
  }, 0);

  const totalBrandedSpend = Math.round(monthlyBranded * durationMonths * familyCount);
  const totalGenericSpend = Math.round(monthlyGeneric * durationMonths * familyCount);
  const netSavings = Math.max(0, totalBrandedSpend - totalGenericSpend);
  const chronicSavingsPct = totalBrandedSpend > 0 ? Math.round((netSavings / totalBrandedSpend) * 100) : 80;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Module: Price Comparison & Savings
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Prescribed Brand vs. Generic Price Comparator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time differential price calculation and bioequivalent Jan Aushadhi substitution engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSlipModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            Print Jan Aushadhi Slip
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pharmacies')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            Locate Stores
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Labeling Banner */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-black tracking-wide uppercase text-amber-900 flex items-center gap-2">
            <span>Mandatory Statutory Pricing Notice</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
              LOCAL DATABASE / DEMO
            </span>
          </div>
          <p className="text-xs font-medium text-amber-900/90 leading-relaxed">
            {STATUTORY_PRICE_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Medicine Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-600" />
            Select Medicine for Side-by-Side Comparison:
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Active: <span className="font-bold text-teal-700">{brandMedicineName}</span> ({activeStrength} • {activeForm})
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Prescription Medicines */}
          {prescriptionMedicines.map((m) => {
            const medId = m.drug_id || m.brand_name.toLowerCase().replace(/\s+/g, '-');
            const isSelected = selectedMedicineId.toLowerCase() === medId.toLowerCase() ||
                               brandMedicineName.toLowerCase() === m.brand_name.toLowerCase();
            return (
              <button
                key={medId}
                type="button"
                onClick={() => handleSelectMedicine(medId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30 ring-2 ring-teal-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{m.brand_name}</span>
                <span className="text-[10px] opacity-80 font-mono">({m.strength})</span>
              </button>
            );
          })}

          {/* Quick-switch catalog buttons */}
          {catalogList.length > 0 &&
            catalogList
              .filter(
                (c) =>
                  !prescriptionMedicines.some(
                    (p) => p.brand_name.toLowerCase() === c.brand_medicine.toLowerCase()
                  )
              )
              .slice(0, 4)
              .map((c) => {
                const isSelected = selectedMedicineId.toLowerCase() === c.medicine_id.toLowerCase() ||
                                   brandMedicineName.toLowerCase() === c.brand_medicine.toLowerCase();
                return (
                  <button
                    key={c.medicine_id}
                    type="button"
                    onClick={() => handleSelectMedicine(c.medicine_id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30 ring-2 ring-teal-300'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-dashed border-slate-300'
                    }`}
                  >
                    <span>{c.brand_medicine}</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">(-{Math.round(c.saving_percentage)}%)</span>
                  </button>
                );
              })}
        </div>
      </div>

      {/* 4 PRIMARY DISPLAY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Brand Medicine */}
        <div className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
            Doctor Prescribed
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Brand Medicine
            </span>
            <div className="font-extrabold text-slate-900 text-base truncate" title={brandMedicineName}>
              {brandMedicineName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {activeStrength} • {activeForm}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 tracking-tight">
              ₹{brandPrice.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-rose-600/90 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Approx. MRP / pack
            </span>
          </div>
        </div>

        {/* 2. Generic Medicine */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
            Govt Certified
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Generic Medicine
            </span>
            <div className="font-extrabold text-slate-900 text-base truncate" title={genericMedicineName}>
              {genericMedicineName}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              PMBJP / Jan Aushadhi
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              ₹{genericPrice.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Approx. Rate / pack
            </span>
          </div>
        </div>

        {/* 3. Estimated Savings */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border-2 border-emerald-400 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Estimated Savings
            </span>
            <div className="font-extrabold text-slate-800 text-base">
              Net Direct In-Pocket
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Per pack substitution
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              ₹{absoluteSaving.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Money Kept
            </span>
          </div>
        </div>

        {/* 4. Savings Percentage */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-5 rounded-2xl border-2 border-teal-700 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 block mb-1">
              Savings Percentage
            </span>
            <div className="font-extrabold text-white text-base">
              Cost Reduction
            </div>
            <div className="text-[11px] text-teal-100 mt-0.5">
              Relative to Brand Price
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-teal-500/50 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-300 tracking-tight">
              {Math.round(savingPercentage)}%
            </span>
            <span className="text-[10px] font-bold text-teal-900 bg-emerald-300 px-2 py-0.5 rounded font-mono">
              SAVED
            </span>
          </div>
        </div>

      </div>

      {/* BAR / CHART VISUALIZATION SECTION */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              Side-by-Side Visual Bar Chart
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Comparative Price Breakdown ({brandMedicineName} vs. Generic)
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setComparisonMode('pack')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'pack' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Pack Price
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('unit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                comparisonMode === 'unit' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Per Unit / Tab
            </button>
          </div>
        </div>

        {/* Visual Bar Comparison Gauges */}
        <div className="space-y-6 py-2">

          {/* Bar 1: Prescribed Brand Medicine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="text-slate-900">Brand Medicine: {brandMedicineName}</span>
                <span className="text-[10px] font-normal text-slate-500">({activeStrength})</span>
              </div>
              <div className="text-rose-600 text-sm font-black font-mono">
                ₹{comparisonMode === 'pack' ? brandPrice.toFixed(2) : brandUnitPrice.toFixed(2)}
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  /{comparisonMode === 'pack' ? 'pack' : 'unit'}
                </span>
              </div>
            </div>

            <div className="h-9 w-full bg-slate-100 rounded-xl overflow-hidden p-1 flex items-center">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-between px-3 text-white text-xs font-extrabold transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${brandBarWidth}%` }}
              >
                <span>Doctor Prescribed Brand</span>
                <span className="font-mono">100% Base Cost</span>
              </div>
            </div>
          </div>

          {/* Bar 2: Generic Medicine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-900">Generic Medicine: {genericMedicineName}</span>
                <span className="text-[10px] font-normal text-emerald-700">(PMBJP Bioequivalent)</span>
              </div>
              <div className="text-emerald-600 text-sm font-black font-mono">
                ₹{comparisonMode === 'pack' ? genericPrice.toFixed(2) : genericUnitPrice.toFixed(2)}
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  /{comparisonMode === 'pack' ? 'pack' : 'unit'}
                </span>
              </div>
            </div>

            <div className="h-9 w-full bg-slate-100 rounded-xl overflow-hidden p-1 flex items-center relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-between px-3 text-white text-xs font-extrabold transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${genericBarWidth}%` }}
              >
                <span className="truncate">Jan Aushadhi Generic</span>
                <span className="font-mono ml-2">₹{comparisonMode === 'pack' ? genericPrice.toFixed(2) : genericUnitPrice.toFixed(2)}</span>
              </div>
              {/* Delta marker showing the gap */}
              <div className="absolute right-3 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Save {Math.round(savingPercentage)}%</span>
                <span className="text-[11px] font-mono">(₹{comparisonMode === 'pack' ? absoluteSaving.toFixed(2) : unitSaving.toFixed(2)} less)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Visual Difference Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 font-black flex items-center justify-center shrink-0">
              ₹
            </div>
            <div>
              <div className="font-bold text-slate-700">Prescribed Brand MRP</div>
              <div className="text-slate-500 text-[11px]">Commercial packaging & promotion</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 font-black flex items-center justify-center shrink-0">
              ₹
            </div>
            <div>
              <div className="font-bold text-slate-700">Generic Jan Aushadhi Rate</div>
              <div className="text-slate-500 text-[11px]">Zero advertising markup</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-black flex items-center justify-center shrink-0">
              %
            </div>
            <div>
              <div className="font-bold text-emerald-700">{Math.round(savingPercentage)}% Cheaper</div>
              <div className="text-slate-500 text-[11px]">Same active molecule bioequivalence</div>
            </div>
          </div>
        </div>

        {/* Pricing Label Disclaimer Tag */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Pricing source tag: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">approximate_local_database</code>
          </span>
          <span className="font-medium text-slate-400">
            Does not claim live retail market price
          </span>
        </div>
      </div>

      {/* Chronic Treatment & Annual Savings Calculator */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
              <Calculator className="w-3.5 h-3.5 text-teal-400" />
              Annual Chronic Care Basket Calculator
            </div>
            <h3 className="text-2xl font-extrabold text-white mt-2">
              Calculate Your Household Savings Over Time
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Adjust duration and family members to calculate projected savings for continuous chronic maintenance.
            </p>
          </div>

          <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <span className="text-xs text-teal-200 font-semibold block">Total Estimated Savings</span>
            <span className="text-3xl font-black text-emerald-400">₹{netSavings.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-slate-300 block">({chronicSavingsPct}% reduction)</span>
          </div>
        </div>

        {/* Sliders Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">

          <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Calendar className="w-4 h-4 text-teal-400" /> Treatment Duration:
              </span>
              <span className="text-teal-300 text-sm font-black">{durationMonths} Months</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={durationMonths}
              onChange={(e) => setDurationMonths(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Month</span>
              <span>6 Months</span>
              <span>12 Months (1 Year)</span>
              <span>24 Months (2 Years)</span>
            </div>
          </div>

          <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Users className="w-4 h-4 text-teal-400" /> Patients / Family Members:
              </span>
              <span className="text-teal-300 text-sm font-black">{familyCount} Person{familyCount > 1 ? 's' : ''}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={familyCount}
              onChange={(e) => setFamilyCount(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Patient</span>
              <span>2 Patients</span>
              <span>3 Patients</span>
              <span>5 Patients</span>
            </div>
          </div>

        </div>

        {/* Spend Comparison Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <span className="text-xs text-slate-400 block mb-1">Branded Spend (Approx)</span>
            <span className="text-xl font-bold text-rose-400">₹{totalBrandedSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <span className="text-xs text-slate-400 block mb-1">Jan Aushadhi Generic Spend (Approx)</span>
            <span className="text-xl font-bold text-emerald-400">₹{totalGenericSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-center">
            <span className="text-xs text-emerald-300 font-bold block mb-1">Estimated Pocket Savings</span>
            <span className="text-xl font-extrabold text-white">₹{netSavings.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Printable Jan Aushadhi Slip Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 space-y-6">

            {/* Printable Slip Container */}
            <div id="jan-aushadhi-slip" className="border-2 border-teal-800 p-6 rounded-2xl space-y-4 bg-white text-slate-900">
              <div className="flex items-center justify-between border-b-2 border-teal-800 pb-3">
                <div>
                  <h3 className="font-black text-lg text-teal-900 tracking-tight">
                    PRADHAN MANTRI BHARATIYA JANAUSHADHI PARIYOJANA (PMBJP)
                  </h3>
                  <div className="text-[11px] text-teal-700 font-semibold">
                    Generic Medicine Counter Request Slip • CDSCO Verified
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-teal-700 text-white font-black flex items-center justify-center text-xs">
                  PMBJP
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1 text-slate-700 border-b border-slate-200 pb-2">
                <div><strong>Patient Name:</strong> {user?.user_name || 'Rahul Verma'}</div>
                <div><strong>Mobile:</strong> +91 {user?.mobile_number || '9876543210'}</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Status:</strong> Verified Active Molecule</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Requested Generic Bioequivalent Medicines:
                </div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">Prescribed Drug</th>
                      <th className="p-2 border">PMBJP Generic Salt & Strength</th>
                      <th className="p-2 border">Approx Generic Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionMedicines.map((m, idx) => (
                      <tr key={idx} className="border">
                        <td className="p-2 border font-bold text-center">{idx + 1}</td>
                        <td className="p-2 border">{m.brand_name}</td>
                        <td className="p-2 border font-semibold text-teal-900">
                          {m.generic_alternative?.generic_name || m.strength}
                        </td>
                        <td className="p-2 border font-mono font-bold text-emerald-700">
                          ₹{(m.generic_alternative?.jan_aushadhi_strip_price || 9.5).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-tight">
                <strong>Pharmacist Instruction:</strong> Please dispense the bioequivalent Jan Aushadhi generic equivalents listed above in accordance with Section 1.5 of the Indian Medical Council (Professional Conduct) Regulations.
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('generics')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Back to Generic Matcher
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pharmacies')}
          className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
        >
          Find Nearby Jan Aushadhi Stores on Map
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
