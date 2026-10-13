import React from 'react';
import { useApp } from '../../store/AppContext';
import {
  Upload,
  Search,
  MapPin,
  Pill,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Bot,
  Building2,
  FileText,
  Percent,
  Activity
} from 'lucide-react';

export const LandingPage = () => {
  const { setActiveTab, setAuthModalOpen } = useApp();

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Active Molecule & Jan Aushadhi Generic Finder
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Stop Overpaying for Branded Medicines. <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Save 70% to 90%
            </span> with Identical Generics.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Upload your doctor's handwritten or printed clinic prescription. GenericSwap instantly extracts the <strong>Active Pharmaceutical Ingredients (APIs/Salts)</strong>, explains what each molecule treats, and matches them with government-certified <strong>Jan Aushadhi (PMBJP)</strong> bioequivalent medicines.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 group"
            >
              <Upload className="w-4 h-4 text-slate-950 group-hover:-translate-y-0.5 transition-transform" />
              Upload Prescription Now
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-teal-300" />
              Search by Medicine / Salt
            </button>
            <button
              onClick={() => setActiveTab('pharmacies')}
              className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Locate Nearby Stores
            </button>
          </div>
        </div>

        {/* Live Savings Counter Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 flex items-center gap-1">
              82.4% <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Average Price Reduction</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium">WHO-GMP & IP Bioequivalent</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">₹14,200+</div>
            <div className="text-xs text-slate-400 font-medium">Avg Annual Chronic Savings</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">10,000+</div>
            <div className="text-xs text-slate-400 font-medium">Govt Jan Aushadhi Kendras</div>
          </div>
        </div>
      </section>

      {/* 4-Step Interactive User Flow Timeline */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            4 Simple Steps from Doctor's Note to Massive Savings
          </h2>
          <p className="text-slate-600 text-sm">
            Designed for patients, caregivers, and medical practitioners to switch seamlessly to generic equivalents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-extrabold flex items-center justify-center mb-4 text-base">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Upload Prescription</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Upload any clinic note, doctor prescription photo (JPG/PNG), or select from realistic pre-built sample prescriptions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-extrabold flex items-center justify-center mb-4 text-base">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Vision OCR Extraction</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Our Vision NER parser extracts medicine brand names, active molecules (APIs), strengths (e.g. 650mg), and dosage frequencies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-extrabold flex items-center justify-center mb-4 text-base">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Confirm & Match Generics</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Review and edit extracted details. View Jan Aushadhi and commercial generic alternatives with side-by-side MRP price comparisons.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-extrabold flex items-center justify-center mb-4 text-base">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Locate Stock & Save</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Find nearby pharmacies on the interactive map, check stock availability badges, verify update timestamps, and get navigation directions.
            </p>
          </div>

        </div>
      </section>

      {/* Bioequivalence & Quality Assurance Feature Card */}
      <section className="bg-teal-50/70 border border-teal-200/80 rounded-3xl p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Scientific Bioequivalence Standards
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Are Generic Medicines Just as Safe as Expensive Brands?
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              <strong>Yes, 100%.</strong> Under the regulatory framework of the <em>Central Drugs Standard Control Organisation (CDSCO)</em> and <em>Indian Pharmacopoeia (IP)</em>, government Jan Aushadhi generic medicines contain the <strong>exact same Active Pharmaceutical Ingredient (API)</strong>, chemical purity, dosage form, and rate of absorption as originators.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Identical therapeutic effect & absorption rate</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Manufactured in WHO-GMP certified facilities</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero brand markup or marketing royalty costs</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 p-2.5 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Government testing batch-by-batch in NABL labs</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase text-slate-500">Real Prescription Example</div>
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Pantocid DSR (Brand)</span>
                <span className="font-bold text-rose-600">₹195.00 / strip</span>
              </div>
              <div className="text-xs text-slate-500">Pantoprazole 40mg + Domperidone 30mg SR</div>
            </div>
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-teal-700">Jan Aushadhi Equivalent</span>
                <span className="font-bold text-emerald-600">₹32.00 / strip</span>
              </div>
              <div className="text-xs text-teal-800 font-semibold">PMBJP Code #0088 (Identical API)</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="text-xs text-emerald-800 font-semibold">Immediate Patient Savings</div>
              <div className="text-2xl font-black text-emerald-700">83.6% (Save ₹163.00)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Vision OCR Prescription Scanner</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Scan and extract printed or handwritten prescriptions with built-in image quality checks, edge filters, and an editable confirmation table.
          </p>
          <button
            onClick={() => setActiveTab('upload')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 pt-2"
          >
            Try Scanner <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Multilingual AI Chatbot</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Context-aware AI clinical assistant supporting <strong>English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)</strong> with natural speech synthesis.
          </p>
          <button
            onClick={() => setActiveTab('chatbot')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 pt-2"
          >
            Chat with Pharmacist <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Nearby Store & Live Stock Map</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Locate Jan Aushadhi Kendras and pharmacies on an interactive OpenStreetMap with transparent last-updated stock timestamps.
          </p>
          <button
            onClick={() => setActiveTab('pharmacies')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 pt-2"
          >
            Open Pharmacy Map <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </section>

    </div>
  );
};
