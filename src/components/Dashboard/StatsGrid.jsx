import React from 'react';
import { QrCode } from "lucide-react";

const StatsGrid = ({ onOpenScanner }) => (
  <div className="w-full">
    {/* Scanner Box with Styled Corners */}
    <div className="bg-linear-to-br from-amber-900/40 to-stone-900/40 border border-amber-700/30 rounded-xl p-8 sm:p-12 relative flex flex-col items-center justify-center min-h-[320px]">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-600/50 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-600/50 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-600/50 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-600/50 rounded-br-xl"></div>

      {/* QR Content */}
      <div className="flex flex-col items-center gap-10 w-full max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full animate-pulse"></div>
          <QrCode className="w-28 h-28 text-amber-500/30 relative" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-amber-100 text-xl font-bold tracking-wide">Ready for the Next Clue?</h3>
          <p className="text-amber-200/50 text-sm">Scan the QR code found at the location to unlock your next challenge.</p>
        </div>

        <button 
          onClick={onOpenScanner} 
          className="w-full bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-amber-50 font-black py-5 px-8 rounded-xl border border-amber-400/30 shadow-2xl shadow-amber-950/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
        >
          <div className="w-2.5 h-2.5 bg-amber-200 rounded-full animate-pulse group-hover:bg-amber-100"></div>
          <span className="uppercase tracking-widest text-sm">Scan Qr</span>
        </button>
      </div>
    </div>
  </div>
);

export default StatsGrid;