import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { searchMedicines } from '../../services/api';
import {
  Search,
  Filter,
  Pill,
  ShieldCheck,
  TrendingDown,
  MapPin,
  PlusCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MedicineSearch = () => {
  const { setActiveTab, addToBasket, notify } = useApp();

  const [query, setQuery] = useState('Paracetamol');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dosageFilter, setDosageFilter] = useState('ALL');

  const executeSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await searchMedicines(searchTerm);
      setResults(res.results || []);
    } catch (err) {
      notify('Search failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch('Paracetamol');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const filteredResults = results.filter((item) => {
    if (dosageFilter === 'ALL') return true;
    return item.dosage_form?.toUpperCase().includes(dosageFilter);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Module 19: Direct Search & Filtering
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Search Medicines & Active Molecules
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Look up any medicine by brand name, chemical active molecule (salt), or therapeutic indication to find Jan Aushadhi generic equivalents.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by brand (e.g. Dolo, Pantocid, Augmentin, Telma) or salt (Paracetamol, Metformin)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Popular Search Chips */}
        <div className="flex items-center gap-2 pt-3 px-2 text-xs text-slate-500 overflow-x-auto">
          <span className="font-semibold shrink-0">Popular:</span>
          {['Dolo 650', 'Pantocid DSR', 'Augmentin 625', 'Telma 40', 'Metformin', 'Azithromycin'].map((term, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(term);
                executeSearch(term);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[11px] font-medium transition-colors shrink-0"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-2">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">Filter Dosage Form:</span>
          <select
            value={dosageFilter}
            onChange={(e) => setDosageFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-xs focus:outline-none"
          >
            <option value="ALL">All Forms</option>
            <option value="TABLET">Tablets</option>
            <option value="CAPSULE">Capsules</option>
            <option value="SYRUP">Syrups</option>
          </select>
        </div>

        <span>Showing <strong>{filteredResults.length}</strong> matching medicines</span>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResults.map((drug, idx) => {
          const generic = drug.generic_alternative;
          const molecules = (drug.active_ingredients || []).map((i) => i.molecule).join(' + ');

          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{drug.brand_name}</h3>
                    <div className="text-xs text-slate-500">{drug.manufacturer} • {drug.dosage_form}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Save {drug.savings_percentage}%
                  </span>
                </div>

                <div className="text-xs text-teal-800 bg-teal-50/80 p-2.5 rounded-xl border border-teal-100 space-y-1">
                  <div>
                    Active Molecule (API): <strong>{molecules || drug.strength}</strong>
                  </div>
                  <div className="text-[11px] text-teal-700">
                    Jan Aushadhi Equiv: <strong>{generic?.generic_name || 'Generic Equivalent'}</strong>
                  </div>
                  <div className="text-[10px] font-mono text-teal-600">
                    Code: {generic?.pmbjp_drug_code || 'PMBJP0012'}
                  </div>
                </div>
              </div>

              {/* Price Row & CTAs */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Brand MRP</span>
                    <span className="font-bold text-slate-700">
                      ₹{drug.branded_mrp_per_strip || (drug.branded_unit_price * 10).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Jan Aushadhi Rate</span>
                    <span className="font-black text-emerald-600 text-sm">
                      ₹{generic?.jan_aushadhi_strip_price || (generic?.jan_aushadhi_unit_price * 10).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToBasket(drug)}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                    Add to Basket
                  </button>
                  <button
                    onClick={() => setActiveTab('pharmacies')}
                    className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Locate Stock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
