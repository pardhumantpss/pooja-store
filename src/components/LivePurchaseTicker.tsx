import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, CheckCircle, Flame, X } from 'lucide-react';
import { Product } from '../types';

interface LivePurchaseTickerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

interface PurchaseNotification {
  city: string;
  product: Product;
  timeAgo: string;
}

const CITIES = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Chicago, IL',
  'Miami, FL',
  'Denver, CO',
  'Boston, MA',
];

export const LivePurchaseTicker: React.FC<LivePurchaseTickerProps> = ({
  products,
  onSelectProduct,
}) => {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || products.length === 0) return;

    // Trigger initial notification after 6 seconds
    const initialTimer = setTimeout(() => {
      triggerRandomNotice();
    }, 6000);

    // Recurring interval every 18 seconds
    const interval = setInterval(() => {
      triggerRandomNotice();
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products, dismissed]);

  const triggerRandomNotice = () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];

    setNotification({
      city: randomCity,
      product: randomProduct,
      timeAgo: 'Just now',
    });
    setVisible(true);

    // Hide after 5.5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5500);
  };

  if (!notification || !visible || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div 
        onClick={() => onSelectProduct(notification.product)}
        className="bg-[#161b22]/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={notification.product.thumbnail}
              alt=""
              className="w-11 h-11 rounded-xl object-cover bg-[#1c2128] border border-white/5"
            />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161b22]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">Verified Purchase</span>
              <span>•</span>
              <span className="truncate">{notification.city}</span>
            </div>
            <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
              {notification.product.title}
            </p>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="font-bold text-white font-mono">${notification.product.price}</span>
              <span className="text-slate-500">•</span>
              <span className={`font-semibold ${
                notification.product.stock <= notification.product.lowStockThreshold ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {notification.product.stock} units left
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 transition"
          title="Dismiss alerts"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
