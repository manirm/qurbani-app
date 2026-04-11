'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function EidCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    // Target date for Eid-ul-Adha 2026 (Approx May 27)
    const target = new Date('2026-05-27T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-8 rounded-3xl glass border-secondary/20 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 text-secondary font-semibold tracking-widest uppercase text-sm">
          <Timer className="w-4 h-4" />
          <span>Counting down to Eid-ul-Adha</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-bold text-foreground mb-2 tabular-nums">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-secondary font-medium uppercase text-xs tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-foreground/60 text-sm italic font-light">
          Insha'Allah • May 27, 2026
        </div>
      </div>
    </div>
  );
}
