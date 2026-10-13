import React from 'react';
import { useApp } from '../../store/AppContext';

export const FIGMA_SCREENS = [
  { id: 1, title: '01. Mobile Login', subtitle: 'Phone Number & Get Started', icon: '📱' },
  { id: 2, title: '02. OTP Verification', subtitle: '6-Digit Security Code', icon: '🔒' },
  { id: 3, title: '03. User Dashboard', subtitle: 'Profile, Search, 4 Actions, Rx Feed', icon: '🏠' },
  { id: 4, title: '04. Upload Prescription', subtitle: 'Camera, File & 3 Clinic Presets', icon: '📤' },
  { id: 5, title: '05. OCR Laser Scan', subtitle: 'Bounding Box Salt Detection', icon: '⚡' },
  { id: 6, title: '06. Extracted Review', subtitle: 'Doctor Card, Dosages & Salt Editing', icon: '📋' },
  { id: 7, title: '07. Generic Alternatives', subtitle: 'PMBJP Matches & CDSCO Badges', icon: '💊' },
  { id: 8, title: '08. Price Comparison', subtitle: 'MRP vs Generic & Annual Savings', icon: '📊' },
  { id: 9, title: '09. Nearby Pharmacies', subtitle: 'Split Map & Jan Aushadhi Card', icon: '🗺️' },
  { id: 10, title: '10. Stock & Hold Picker', subtitle: 'Store Availability & Strip Counter', icon: '📦' },
  { id: 11, title: '11. AI Pharmacist Chat', subtitle: 'Layman Q&A & Clinical Chips', icon: '💬' },
  { id: 12, title: '12. Molecule Detail', subtitle: 'Bioequivalence & Pharmacology', icon: '🔬' },
  { id: 13, title: '13. My Prescriptions', subtitle: 'Active & Archived Rx Vault', icon: '📁' },
  { id: 14, title: '14. Pharmacy Locator', subtitle: 'Full Map with 5km/10km Filters', icon: '📍' },
  { id: 15, title: '15. Reservation Hold Slip', subtitle: '1-Hour Hold QR Code & Route', icon: '🎟️' },
  { id: 16, title: '16. Multilingual Voice', subtitle: 'Kannada (ಕನ್ನಡ) & Hindi Audio', icon: '🎙️' }
];

export const FigmaScreenNavigator = () => {
  const { figmaScreen, setFigmaScreen, viewMode, setViewMode } = useApp();

  const currentScreenObj = FIGMA_SCREENS.find((s) => s.id === figmaScreen) || FIGMA_SCREENS[2];

  const handlePrev = () => {
    setFigmaScreen((prev) => (prev > 1 ? prev - 1 : 16));
  };

  const handleNext = () => {
    setFigmaScreen((prev) => (prev < 16 ? prev + 1 : 1));
  };

  return (
    <header className="sticky top-0 z-50 bg-[#004D40] text-white shadow-lg border-b border-[#00796B]/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        
        {/* Brand & Figma Attribution */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#00796B] flex items-center justify-center font-bold text-white shadow">
            💊
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-bold tracking-tight text-white">
              <span>GenericSwap</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                Figma Spec
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/70 hidden sm:block">
              Active Molecule & Generic Finder Prototype
            </p>
          </div>
        </div>

        {/* 16 Screens Dropdown Selector & Navigation Controls */}
        <div className="flex items-center space-x-1.5 bg-[#00382E] p-1 rounded-xl border border-emerald-900/60">
          <button
            onClick={handlePrev}
            title="Previous Screen"
            className="p-1.5 rounded-lg hover:bg-[#00796B] text-emerald-200 transition-colors"
          >
            ◀
          </button>

          <select
            value={figmaScreen}
            onChange={(e) => setFigmaScreen(Number(e.target.value))}
            className="bg-[#002820] text-emerald-100 font-medium text-xs px-2.5 py-1.5 rounded-lg border border-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[200px] sm:max-w-[260px]"
          >
            {FIGMA_SCREENS.map((screen) => (
              <option key={screen.id} value={screen.id} className="bg-[#00382E] text-white">
                {screen.title} – {screen.subtitle}
              </option>
            ))}
          </select>

          <button
            onClick={handleNext}
            title="Next Screen"
            className="p-1.5 rounded-lg hover:bg-[#00796B] text-emerald-200 transition-colors"
          >
            ▶
          </button>
        </div>

        {/* View Mode Toggle (Mobile Device Frame vs Desktop Fullscreen) */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex bg-[#00382E] p-0.5 rounded-xl border border-emerald-900/60">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#00796B] text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <span>📱</span>
              <span className="hidden md:inline">Mobile Frame</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'desktop'
                  ? 'bg-[#00796B] text-white shadow-sm'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <span>🖥️</span>
              <span className="hidden md:inline">Desktop Wide</span>
            </button>
          </div>

          {/* Figma Design Source Link */}
          <a
            href="https://www.figma.com/design/W0J1sJLY9ZnEG4VHDrpmp4/Untitled"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-1 bg-black/30 hover:bg-black/50 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <span>🎨</span>
            <span>Open Figma</span>
          </a>
        </div>

      </div>

      {/* Screen Strip Quick Bar (Visible on wider screens for rapid jumping) */}
      <div className="bg-[#00352A] px-3 py-1.5 border-t border-emerald-900/40 hidden md:flex items-center justify-center space-x-1 overflow-x-auto text-[11px]">
        {FIGMA_SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setFigmaScreen(s.id)}
            className={`px-2 py-0.5 rounded-full transition-all whitespace-nowrap flex items-center space-x-1 ${
              figmaScreen === s.id
                ? 'bg-emerald-500 text-[#002820] font-bold shadow-sm'
                : 'text-emerald-200/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.id < 10 ? `0${s.id}` : s.id}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
