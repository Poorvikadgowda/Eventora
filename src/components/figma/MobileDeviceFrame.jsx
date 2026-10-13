import React from 'react';
import { useApp } from '../../store/AppContext';
import { MobileBottomNav } from './MobileBottomNav';

export const MobileDeviceFrame = ({ children }) => {
  const { figmaScreen } = useApp();

  // Screens 1 and 2 are Auth (Login and OTP), so bottom nav is hidden on those
  const showBottomNav = figmaScreen >= 3;

  return (
    <div className="flex justify-center items-center py-6 px-2 min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      
      {/* Smartphone Chassis */}
      <div className="relative w-full max-w-[400px] h-[844px] bg-[#1e293b] rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700/80 flex flex-col overflow-hidden">
        
        {/* Antenna bands & buttons simulation */}
        <div className="absolute -left-[14px] top-[115px] w-[4px] h-[28px] bg-slate-600 rounded-l-md" />
        <div className="absolute -left-[14px] top-[155px] w-[4px] h-[50px] bg-slate-600 rounded-l-md" />
        <div className="absolute -left-[14px] top-[215px] w-[4px] h-[50px] bg-slate-600 rounded-l-md" />
        <div className="absolute -right-[14px] top-[170px] w-[4px] h-[75px] bg-slate-600 rounded-r-md" />

        {/* Screen Display Container */}
        <div className="relative flex-1 bg-[#F4F9F7] rounded-[40px] overflow-hidden flex flex-col shadow-inner">
          
          {/* Top Status Bar & Dynamic Island */}
          <div className="relative z-30 pt-3 pb-1 px-6 flex items-center justify-between text-slate-800 bg-[#F4F9F7]/90 backdrop-blur-sm select-none">
            {/* Clock */}
            <span className="text-[13px] font-semibold tracking-tight">9:41</span>

            {/* Dynamic Island Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[110px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Icons: Signal, WiFi, Battery */}
            <div className="flex items-center space-x-1.5 text-slate-800">
              {/* Cellular Signal */}
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 3a1 1 0 011-1h2a1 1 0 011 1v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" />
              </svg>
              {/* WiFi */}
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zm-2.829 2.828a3 3 0 00-4.242 0 1 1 0 01-1.415-1.414 5 5 0 017.072 0 1 1 0 01-1.415 1.414zM10 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {/* Battery */}
              <div className="flex items-center">
                <div className="w-5 h-2.5 rounded-[4px] border border-slate-700 p-0.5 flex items-center">
                  <div className="w-full h-full bg-emerald-600 rounded-[2px]" />
                </div>
                <div className="w-[1.5px] h-1 bg-slate-700 rounded-r-sm -ml-px" />
              </div>
            </div>
          </div>

          {/* Scrollable Screen Content Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-emerald-200">
            {children}
          </div>

          {/* Sticky Mobile Bottom Navigation */}
          {showBottomNav && (
            <div className="relative z-30">
              <MobileBottomNav />
            </div>
          )}

          {/* Bottom Home Indicator Bar */}
          <div className="relative z-30 pt-1 pb-2 flex justify-center bg-white/80 backdrop-blur-sm">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>

        </div>
      </div>

    </div>
  );
};
