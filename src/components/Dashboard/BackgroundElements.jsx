import React from 'react';
import { Map, Anchor, Key, Scroll } from "lucide-react";

const BackgroundElements = () => (
  <>
    <style jsx global>{`
      @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
    `}</style>
    <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
      <Map className="absolute top-10 left-10 w-8 h-8 text-amber-600/20" style={{ animation: 'float 6s ease-in-out infinite' }} />
      <Anchor className="absolute top-40 right-20 w-10 h-10 text-amber-700/20" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
      <Key className="absolute bottom-20 left-16 w-6 h-6 text-amber-500/20" style={{ animation: 'float 7s ease-in-out infinite 2s' }} />
      <Scroll className="absolute bottom-40 right-10 w-8 h-8 text-amber-600/20" style={{ animation: 'float 9s ease-in-out infinite 1.5s' }} />
    </div>
  </>
);

export default BackgroundElements;