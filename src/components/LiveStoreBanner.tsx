import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, ShieldCheck, Zap, Users, Clock, ArrowRight } from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface LiveStoreBannerProps {
  onPromoClick?: (code: string) => void;
}

export const LiveStoreBanner: React.FC<LiveStoreBannerProps> = ({ onPromoClick }) => {
  // Live flash sale countdown (e.g. 4 hours from current session)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });
  const [liveShoppers, setLiveShoppers] = useState(38);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 59, seconds: 59 };
      });
    }, 1000);

    // Random slight jitter in live shoppers to make it feel natural
    const shopperTimer = setInterval(() => {
      setLiveShoppers(prev => Math.min(58, Math.max(28, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(shopperTimer);
    };
  }, []);

  const handleCopyPromo = (code: string) => {
    soundFx.playClick();
    if (onPromoClick) onPromoClick(code);
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-gradient-to-r from-[#0d0f17] via-[#161b2e] to-[#0d0f17] text-white border-b border-indigo-500/20 py-2 px-3 text-xs overflow-hidden relative select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Users className="w-3 h-3 ml-0.5" />
            <span className="font-mono font-bold">{liveShoppers}</span>
            <span className="hidden sm:inline">Shoppers Live</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Real-Time Payment Gateway & 3DS Active</span>
          </div>
        </div>

        {/* Center: Live Deal Countdown */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-400 font-bold tracking-tight">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>Flash Deal Drop:</span>
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
            <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>:
            <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>:
            <span className="text-amber-400">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
          </div>
        </div>

        {/* Right: Quick Promo Code Pills */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden lg:inline">Use code:</span>
          <button
            id="banner-promo-save20"
            onClick={() => handleCopyPromo('SAVE20')}
            className="px-2.5 py-0.5 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
          >
            <span>SAVE20</span>
            <span className="text-[9px] text-indigo-200">($20 off)</span>
          </button>
          <button
            id="banner-promo-freeship"
            onClick={() => handleCopyPromo('FREESHIP')}
            className="px-2.5 py-0.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
          >
            <span>FREESHIP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
