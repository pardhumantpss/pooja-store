import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, X, Sparkles, MapPin, Zap } from 'lucide-react';
import { Product } from '../types';
import { soundFx } from '../lib/soundFx';

interface LiveActivityToasterProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

interface ActivityEvent {
  id: string;
  name: string;
  city: string;
  action: 'purchased' | 'viewing' | 'joined_vip';
  productTitle?: string;
  productImage?: string;
  productId?: string;
  timeAgo: string;
}

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'London', 'Singapore'];
const FIRST_NAMES = ['Ananya', 'Aarav', 'Priya', 'Kabir', 'Rohan', 'Sneha', 'Vikram', 'Meera', 'Aditya', 'Tanvi', 'Elena', 'Marcus'];

export const LiveActivityToaster: React.FC<LiveActivityToasterProps> = ({ products, onSelectProduct }) => {
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed || !products || products.length === 0) return;

    // Trigger first event after 4 seconds
    const initialTimeout = setTimeout(() => {
      triggerRandomEvent();
    }, 4000);

    // Trigger recurring event every 16-24 seconds
    const interval = setInterval(() => {
      triggerRandomEvent();
    }, 18000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products, isDismissed]);

  const triggerRandomEvent = () => {
    if (!products || products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const timeAgoSecs = Math.floor(8 + Math.random() * 45);

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      name: randomName,
      city: randomCity,
      action: Math.random() > 0.3 ? 'purchased' : 'viewing',
      productTitle: randomProduct.title,
      productImage: randomProduct.thumbnail || randomProduct.images[0],
      productId: randomProduct.id,
      timeAgo: `${timeAgoSecs}s ago`,
    };

    setCurrentEvent(newEvent);
    setIsVisible(true);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  const handleCardClick = () => {
    if (currentEvent && currentEvent.productId && onSelectProduct) {
      soundFx.playClick();
      const matched = products.find(p => p.id === currentEvent.productId);
      if (matched) {
        onSelectProduct(matched);
      }
    }
  };

  if (!currentEvent || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div 
        onClick={handleCardClick}
        className="bg-[#0e111a]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3.5 cursor-pointer hover:border-indigo-500/50 transition group"
      >
        {/* Product Thumbnail or User Avatar */}
        <div className="relative shrink-0">
          <img
            src={currentEvent.productImage}
            alt={currentEvent.productTitle}
            className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow">
            ✓
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="font-semibold text-white">{currentEvent.name}</span>
            <span>from</span>
            <span className="text-slate-300 font-medium flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-indigo-400" />
              {currentEvent.city}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition truncate mt-0.5">
            {currentEvent.action === 'purchased' ? 'Just purchased ' : 'Is viewing '}
            <span className="font-bold text-white">{currentEvent.productTitle}</span>
          </p>

          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> Verified Order
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono">{currentEvent.timeAgo}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition cursor-pointer self-start"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
