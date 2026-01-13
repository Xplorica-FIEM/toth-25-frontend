// pages/landing.jsx - Minimal Immersive Landing Page
import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Sparkles, ArrowRight, Key } from "lucide-react";

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden flex items-center justify-center">
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.8); }
        }
      `}</style>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-md px-6 space-y-8 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-amber-600 to-amber-800 border-4 border-amber-500/50 flex items-center justify-center shadow-2xl"
            style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
            <Compass className="w-12 h-12 text-amber-100" 
              style={{ animation: 'spin-slow 8s linear infinite' }} />
          </div>
        </div>

        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-100 tracking-tight">
            Trails of the Hunt
          </h1>
          <p className="text-xl sm:text-2xl text-amber-300 font-serif italic">
            TOTH '25
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-4">
          <Link href="/register">
            <button className="w-full group px-8 py-4 bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-2xl border-2 border-amber-500/50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}>
              <Sparkles className="w-5 h-5" />
              <span>Begin Your Quest</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          {/* <Link href="/login">
            <button className="w-full px-8 py-4 bg-stone-900/70 hover:bg-stone-900/90 backdrop-blur-sm text-amber-100 font-bold text-lg rounded-xl border-2 border-amber-700/50 hover:border-amber-600 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <Key className="w-5 h-5" />
              <span>Continue Adventure</span>
            </button>
          </Link> */}
        </div>

        {/* Footer */}
        <div className="text-center text-amber-200/40 text-xs pt-6">
          <p className="flex items-center justify-center gap-1.5">
            <span>Built with</span>
            <span className="text-red-400 animate-pulse">♥</span>
            <span>from</span>
            <span className="text-amber-400 font-bold">XplOriCa</span>
          </p>
        </div>
      </div>
    </div>
  );
}

