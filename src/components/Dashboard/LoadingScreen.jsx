import React from 'react';
import { Compass } from "lucide-react";

const LoadingScreen = () => (
  <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center p-4">
    <style jsx global>{`
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes ping-slow { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
    `}</style>
    <div className="text-center space-y-4">
      <div className="relative inline-block">
        <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500 mx-auto" style={{ animation: 'spin-slow 3s linear infinite' }} />
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/50" style={{ animation: 'ping-slow 2s ease-out infinite' }} />
      </div>
      <p className="text-amber-100 text-sm sm:text-base font-medium">Preparing your adventure...</p>
    </div>
  </div>
);

export default LoadingScreen;