import React, { useState, useEffect } from 'react';
import { Clock, Compass, Anchor, Ship } from "lucide-react";

const TimerCountdown = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  function calculateTimeLeft() {
    if (!startTime) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const difference = +new Date(startTime) - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const calculatedProps = calculateTimeLeft();
      
      if (calculatedProps.days === 0 && 
          calculatedProps.hours === 0 && 
          calculatedProps.minutes === 0 && 
          calculatedProps.seconds === 0) {
        clearInterval(timer);
        setTimeLeft(calculatedProps);
        return;
      }
      
      setTimeLeft(calculatedProps);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const TimeBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-br from-amber-900/80 via-amber-950/90 to-black/90 border-2 border-amber-600/40 rounded-xl w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center mb-3 shadow-2xl shadow-amber-900/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 to-transparent"></div>
        <span className="text-3xl sm:text-5xl font-bold text-amber-100 font-mono relative z-10 drop-shadow-lg">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-amber-400/90 text-xs sm:text-sm uppercase tracking-widest font-bold">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Decorative Icons */}
      <div className="absolute top-20 left-10 opacity-20 hidden lg:block">
        <Anchor className="w-24 h-24 text-amber-500" style={{ animation: 'float-gentle 8s ease-in-out infinite' }} />
      </div>
      <div className="absolute top-32 right-16 opacity-20 hidden lg:block">
        <Ship className="w-20 h-20 text-amber-600" style={{ animation: 'float-gentle 7s ease-in-out infinite 1s' }} />
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Main Content Box */}
        <div className="bg-gradient-to-br from-stone-900/60 via-amber-950/40 to-stone-900/60 backdrop-blur-xl border-2 border-amber-700/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          {/* Top Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}></div>
              <div className="relative bg-gradient-to-br from-amber-600/30 to-amber-900/30 p-6 rounded-full border-2 border-amber-500/40">
                <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400" style={{ animation: 'float-gentle 4s ease-in-out infinite' }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
            The Hunt Begins In
          </h1>

          
          {/* Timer Grid */}
          <div className="grid grid-cols-4 gap-4 sm:gap-8 mb-10 max-w-3xl mx-auto">
            <TimeBox value={timeLeft.days} label="DAYS" />
            <TimeBox value={timeLeft.hours} label="HOURS" />
            <TimeBox value={timeLeft.minutes} label="MINUTES" />
            <TimeBox value={timeLeft.seconds} label="SECONDS" />
          </div>

          {/* Bottom Quote */}
          <div className="border-t border-amber-700/30 pt-8 mt-8">
            <div className="flex items-center justify-center gap-3 text-amber-300/70 italic text-sm sm:text-base max-w-xl mx-auto text-center">
              <Compass className="w-5 h-5 flex-shrink-0 opacity-60" />
              <p className="leading-relaxed">
                "Patience is the first key to the treasure. Sharpen your mind, explorer."
              </p>
              <Compass className="w-5 h-5 flex-shrink-0 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerCountdown;