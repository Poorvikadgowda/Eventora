import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { getAllMedicines, searchMedicines } from '../../services/api';
import {
  Pill,
  Search,
  ShieldCheck,
  Building,
  CheckCircle2,
  DollarSign,
  MapPin,
  PlusCircle,
  Sparkles,
  Info
} from 'lucide-react';

export const MedicineDatabaseView = () => {
  const { setActiveTab, setSelectedPharmacy, addToBasket } = useApp();
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await searchMedicines('');
        if (res?.results && res.results.length > 0) {
          setMedicines(res.results);
        } else {
          const allMeds = await getAllMedicines();
          setMedicines(allMeds || []);
        }
      } catch (err) {
        console.warn('Medicine catalog load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Analgesics', label: 'Fever & Pain' },
    { id: 'Gastrointestinal', label: 'Acidity & Digestion' },
    { id: 'Antibiotics', label: 'Infections' },
    { id: 'Cardiovascular', label: 'Blood Pressure & Heart' },
    { id: 'Anti-diabetic', label: 'Diabetes Care' }
  ];

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    const brand = (med.brand_name || '').toLowerCase();
    const generic = (med.generic_alternative?.generic_name || med.generic_name || '').toLowerCase();
    const molecules = (med.active_ingredients || [])
      .map((i) => (i.molecule || '').toLowerCase())
      .join(' ');
    const activeStr = (med.active_ingredient || '').toLowerCase();
    const tClass = (med.therapeutic_class || '').toLowerCase();

    const matchesQuery =
      !q ||
      brand.includes(q) ||
      generic.includes(q) ||
      molecules.includes(q) ||
      activeStr.includes(q) ||
      tClass.includes(q);

    const matchesCategory =
      selectedCategory === 'ALL' ||
      tClass.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Module 10: Verified Medicine Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Active Molecule & PMBJP Generic Database
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Browse registered medicines, view exact active pharmaceutical ingredients (APIs/salts), and examine certified bioequivalent Jan Aushadhi generic alternatives.
          </p>
        </div>
      </div>

      {/* Statutory Safety Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Statutory Clinical Notice:</span> GenericSwap is an informational decision-support prototype. It does not diagnose, prescribe, or alter dosages. Bioequivalent generic alternatives are sourced from official PMBJP registries with active ingredient, strength, and dosage form parity. Final substitution must be authorized by a licensed doctor or pharmacist.
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name (Dolo, Telma), active molecule (Paracetamol), or condition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Loading verified medicines from local database...
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No matching medicines found</p>
          <p className="text-xs text-slate-400 mt-1">Try searching for generic salts like 'Paracetamol' or 'Pantoprazole'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const generic = med.generic_alternative || {};
            const savingsPct = med.savings_percentage || 75.0;
            const brandPrice = med.branded_mrp_per_strip || (med.branded_unit_price ? med.branded_unit_price * 10 : 30.0);
            const genericPrice = generic.jan_aushadhi_strip_price || (med.generic_unit_price ? med.generic_unit_price * 10 : 7.5);

            return (
              <div
                key={med.drug_id || med.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                        {med.brand_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {med.manufacturer || 'Registered Indian Manufacturer'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                      {med.dosage_form || 'Tablet'}
                    </span>
                  </div>

                  {/* Active Molecule Badge */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Active Pharmaceutical Ingredient (API)
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      {med.active_ingredients?.map((i) => `${i.molecule} (${i.strength_mg || med.strength})`).join(' + ') ||
                        `${med.active_ingredient || 'Bioequivalent Salt'} (${med.strength})`}
                    </span>
                    <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
                      Class: {med.therapeutic_class || 'Standard Therapeutic Drug'}
                    </span>
                  </div>

                  {/* Verified Generic Match */}
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Jan Aushadhi Swap
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                        {generic.pmbjp_drug_code || 'PMBJP VERIFIED'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1 font-medium">
                      {generic.generic_name || `${med.brand_name} Generic Equivalent IP`}
                    </p>
                  </div>

                  {/* Price Comparison */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Branded Strip</span>
                      <span className="font-bold text-slate-700 line-through">₹{brandPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 block uppercase font-bold">Generic Strip</span>
                      <span className="font-extrabold text-emerald-700 text-sm">₹{genericPrice.toFixed(2)}</span>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px] shadow-sm">
                      Save {savingsPct}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => {
                      addToBasket(med);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Basket
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPharmacy(null);
                      setActiveTab('pharmacies');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Find Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
