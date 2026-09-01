import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  RefreshCw, 
  Zap, 
  ArrowUpRight,
  TrendingDown,
  Layers,
  Search
} from 'lucide-react';
import { Product } from '../types';

interface AdminInventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateStock: (productId: string, newStock: number, variantId?: string) => Promise<void>;
  onTriggerSimulatedPurchase: () => void;
  onResetAllInventory: () => Promise<void>;
}

export const AdminInventoryDrawer: React.FC<AdminInventoryDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateStock,
  onTriggerSimulatedPurchase,
  onResetAllInventory,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const totalStockUnits = products.reduce((acc, p) => {
    if (p.variants && p.variants.length > 0) {
      return acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0);
    }
    return acc + p.stock;
  }, 0);

  const lowStockProducts = products.filter((p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.some((v) => v.stock <= p.lowStockThreshold);
    }
    return p.stock <= p.lowStockThreshold;
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterLowStockOnly) {
      return matchesSearch && (p.stock <= p.lowStockThreshold || (p.variants && p.variants.some(v => v.stock <= p.lowStockThreshold)));
    }
    return matchesSearch;
  });

  const handleStockChange = async (productId: string, currentStock: number, delta: number, variantId?: string) => {
    const next = Math.max(0, currentStock + delta);
    const key = `${productId}-${variantId || 'base'}`;
    setIsUpdating(key);
    await onUpdateStock(productId, next, variantId);
    setIsUpdating(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-2xl bg-[#0d0d11] text-slate-300 h-full shadow-2xl flex flex-col z-10 border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#161b22] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base">Real-Time Inventory Engine</h2>
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor and adjust SKU-level stock in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Inventory Metrics Bar */}
        <div className="p-4 bg-[#161b22]/50 border-b border-white/5 grid grid-cols-3 gap-3">
          <div className="bg-[#161b22] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total SKUs</span>
            <p className="text-lg font-bold text-white font-mono">{products.length}</p>
          </div>
          <div className="bg-[#161b22] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Stock Units</span>
            <p className="text-lg font-bold text-white font-mono">{totalStockUnits}</p>
          </div>
          <div className="bg-[#161b22] p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Low Stock Alerts</span>
            <p className="text-lg font-bold text-amber-400 font-mono">{lowStockProducts.length}</p>
          </div>
        </div>

        {/* Live Simulator Quick Bar */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-200 font-medium">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Simulate a live customer purchase to watch store stock drop automatically:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onTriggerSimulatedPurchase}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-lg shadow-amber-600/20"
            >
              <Zap className="w-3 h-3" />
              <span>Simulate Order</span>
            </button>
            <button
              onClick={onResetAllInventory}
              className="px-2.5 py-1.5 bg-white/5 border border-amber-500/30 text-amber-300 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              title="Reset all stock to defaults"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Search & Filter bar inside inventory */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-[#161b22]/30">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Product title, or Brand..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0d0d11] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={filterLowStockOnly}
              onChange={(e) => setFilterLowStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-indigo-600 rounded bg-[#0d0d11] border-white/10"
            />
            <span>Low Stock Only ({lowStockProducts.length})</span>
          </label>
        </div>

        {/* Products Stock List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProducts.map((product) => {
            const hasVariants = product.variants && product.variants.length > 0;

            return (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-[#161b22] border border-white/5 space-y-2.5"
              >
                {/* Product Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-[#1c2128] border border-white/5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {product.brand}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate">
                        {product.title}
                      </h4>
                    </div>
                  </div>

                  {/* Base Stock (if no variants) */}
                  {!hasVariants && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-1">
                        <span className={`text-xs font-bold block font-mono ${
                          product.stock === 0 ? 'text-rose-400' : product.stock <= product.lowStockThreshold ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {product.stock} units
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {product.stock === 0 ? 'Out of stock' : product.stock <= product.lowStockThreshold ? 'Low stock' : 'Adequate'}
                        </span>
                      </div>

                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-[#0d0d11]">
                        <button
                          onClick={() => handleStockChange(product.id, product.stock, -1)}
                          disabled={product.stock <= 0}
                          className="px-2 py-1 hover:bg-white/5 text-slate-400 font-bold text-xs disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleStockChange(product.id, product.stock, +5)}
                          className="px-2.5 py-1 hover:bg-white/5 text-slate-300 font-bold text-xs border-l border-white/10 cursor-pointer"
                          title="Restock +5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockChange(product.id, product.stock, +1)}
                          className="px-2 py-1 hover:bg-white/5 text-slate-400 font-bold text-xs border-l border-white/10 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Variant-Level Breakdown */}
                {hasVariants && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Color & Size Stock Variations:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.variants!.map((v) => (
                        <div
                          key={v.id}
                          className="p-2 bg-[#0d0d11] rounded-xl border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20"
                              style={{ backgroundColor: v.colorHex || '#475569' }}
                            />
                            <span className="font-medium text-slate-300">{v.colorName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`font-bold font-mono text-[11px] ${
                              v.stock === 0 ? 'text-rose-400' : v.stock <= product.lowStockThreshold ? 'text-amber-400' : 'text-slate-200'
                            }`}>
                              {v.stock}
                            </span>
                            <div className="flex items-center border border-white/10 rounded bg-[#161b22]">
                              <button
                                onClick={() => handleStockChange(product.id, v.stock, -1, v.id)}
                                disabled={v.stock <= 0}
                                className="px-1.5 py-0.5 hover:bg-white/5 text-slate-400 disabled:opacity-30 cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleStockChange(product.id, v.stock, 1, v.id)}
                                className="px-1.5 py-0.5 hover:bg-white/5 text-slate-400 border-l border-white/10 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
