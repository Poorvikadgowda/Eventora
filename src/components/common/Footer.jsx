import React from 'react';
import { Pill, ShieldCheck, Heart, ExternalLink, Info } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const Footer = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="border-t border-slate-200 bg-white/80 mt-auto text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                <Pill className="w-4 h-4 -rotate-45" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Generic<span className="text-teal-600">Swap</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[13px]">
              Democratizing healthcare by identifying active molecules (APIs) in doctor prescriptions and pairing them with government-certified Jan Aushadhi generic alternatives to save 70% to 90%.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              PMBJP Bioequivalent Standard
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Application Flows
            </h4>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li>
                <button onClick={() => setActiveTab('upload')} className="hover:text-teal-700 transition-colors">
                  Upload Doctor Prescription
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('search')} className="hover:text-teal-700 transition-colors">
                  Medicine & Salt Search
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pharmacies')} className="hover:text-teal-700 transition-colors">
                  Nearby Pharmacies & Map
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('chatbot')} className="hover:text-teal-700 transition-colors">
                  AI Pharmacist Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-teal-700 transition-colors">
                  Pharmacy Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bioequivalence Standards */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Regulatory Framework
            </h4>
            <ul className="space-y-2 text-slate-600 text-[13px]">
              <li className="flex items-center gap-1.5">
                <span>Indian Pharmacopoeia (IP)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>CDSCO Bioequivalence Norms</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>WHO-GMP Certified Facilities</span>
              </li>
              <li>
                <a
                  href="https://janaushadhi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold"
                >
                  PMBJP Official Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Important Regulatory Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-800">
              <Info className="w-3.5 h-3.5" /> Clinical & Inventory Disclaimer
            </h4>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              <strong>Clinical:</strong> GenericSwap is an educational decision-support tool. It does not replace professional medical judgment. Always consult your prescribing doctor before substituting medications.
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              <strong>Inventory Notice:</strong> Medicine availability and stock statuses reflect the pharmacy's latest catalog update timestamp. They are not real-time IoT sensors. Please call the store to confirm before traveling.
            </p>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[12px]">
          <div>
            © {new Date().getFullYear()} GenericSwap • Mini-Project Prototype System
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Affordable Healthcare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
