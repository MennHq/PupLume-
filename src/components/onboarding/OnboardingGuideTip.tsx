import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export const OnboardingGuideTip: React.FC = () => {
  const [tipMessage, setTipMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleGuide = (e: any) => {
      if (e.detail?.message) {
        setTipMessage(e.detail.message);
      }
    };

    window.addEventListener('show-onboarding-guide', handleGuide);
    return () => window.removeEventListener('show-onboarding-guide', handleGuide);
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!tipMessage) return;
    const timer = setTimeout(() => {
      setTipMessage(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [tipMessage]);

  if (!tipMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-2rem)] px-2 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#2C211B] text-white p-4 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-[#E8DDD3]/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center font-bold shrink-0 text-sm">
            💡
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-[#F3E7DA] block text-[10px] uppercase tracking-wider">
              Onboarding Guide
            </span>
            <span className="font-medium text-white/95 leading-snug">
              {tipMessage}
            </span>
          </div>
        </div>

        <button
          onClick={() => setTipMessage(null)}
          className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Dismiss tip"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
