import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Star, 
  Check, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  X
} from 'lucide-react';
import { FilterState } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableBrands: string[];
  totalMatches: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableBrands,
  totalMatches,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleBrandToggle = (brand: string) => {
    const nextBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ brands: nextBrands });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <h2 className="font-bold text-xs text-white uppercase tracking-[0.2em]">
            Filter Catalog
          </h2>
        </div>
        <button
          id="reset-filters-btn"
          onClick={onResetFilters}
          className="text-xs font-medium text-slate-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Real-time Stock & Availability Toggles */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Stock & Inventory
        </h3>
        
        {/* In-Stock Only Toggle */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161b22] border border-white/5 hover:border-white/10 cursor-pointer transition">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-200">
              In-Stock Items Only
            </span>
          </div>
          <input
            id="filter-instock-toggle"
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="w-4 h-4 text-indigo-600 bg-black/40 rounded border-white/10 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
          />
        </label>

        {/* On Sale / Special Offers */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161b22] border border-white/5 hover:border-white/10 cursor-pointer transition">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-200">
              On Sale / Discounted
            </span>
          </div>
          <input
            id="filter-onsale-toggle"
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => onFilterChange({ onSaleOnly: e.target.checked })}
            className="w-4 h-4 text-indigo-600 bg-black/40 rounded border-white/10 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
          />
        </label>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Price Range
          </h3>
          <span className="text-xs font-medium text-indigo-400 font-mono">
            ${filters.minPrice} - ${filters.maxPrice}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Min ($)
            </label>
            <input
              id="filter-min-price-input"
              type="number"
              min={0}
              max={1000}
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: Math.max(0, Number(e.target.value)) })}
              className="w-full px-2.5 py-1.5 bg-[#161b22] border border-white/10 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Max ($)
            </label>
            <input
              id="filter-max-price-input"
              type="number"
              min={10}
              max={2000}
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: Math.min(2000, Number(e.target.value)) })}
              className="w-full px-2.5 py-1.5 bg-[#161b22] border border-white/10 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <input
          id="filter-price-slider"
          type="range"
          min={30}
          max={1000}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Brand Filters */}
      {availableBrands.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Curated Brands
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const isChecked = filters.brands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 text-indigo-600 bg-black/40 rounded border-white/10 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span className={isChecked ? 'font-bold text-white' : 'font-normal'}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Minimum Rating
        </h3>
        <div className="space-y-1.5">
          {[
            { label: '4.8 ★ & Above', rating: 4.8 },
            { label: '4.5 ★ & Above', rating: 4.5 },
            { label: '4.0 ★ & Above', rating: 4.0 },
          ].map((item) => {
            const isSelected = filters.ratings.includes(item.rating);
            return (
              <button
                key={item.rating}
                id={`filter-rating-${item.rating}`}
                onClick={() => {
                  const next = isSelected ? [] : [item.rating];
                  onFilterChange({ ratings: next });
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-[#161b22] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-[#161b22] border border-white/5 text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Checkout</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Real-time stock reservation lock on checkout. 256-bit SSL encrypted tokenization.
        </p>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-[#0d0d11] p-5 rounded-2xl border border-white/5 shadow-2xl">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#0d0d11] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-white/10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <h3 className="font-bold text-base text-white">Filters</h3>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition cursor-pointer"
              >
                Show {totalMatches} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
