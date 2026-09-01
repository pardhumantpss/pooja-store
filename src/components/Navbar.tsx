import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles, 
  PackageCheck, 
  Layers, 
  ChevronDown, 
  Heart, 
  Flame, 
  X,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Category, Product } from '../types';

interface NavbarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenAiAssistant: () => void;
  onOpenTracking: () => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  liveInventoryActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin,
  onOpenAiAssistant,
  onOpenTracking,
  allProducts,
  onSelectProduct,
  liveInventoryActive,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  // Filter products for autocomplete
  const searchResults = searchQuery.trim().length > 0 
    ? allProducts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setIsDeptMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0d0d11]/90 backdrop-blur-md border-b border-white/5 transition-all duration-200">
      {/* Top Notification & Live Status Bar */}
      <div className="bg-[#08080a] text-slate-400 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">Live Inventory Sync</span>
          </div>
          <span className="hidden md:inline text-slate-700">•</span>
          <span className="hidden md:inline text-slate-400">
            Complimentary Insured Express Delivery on Orders Over $100
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button 
            id="nav-track-order-top"
            onClick={onOpenTracking}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Track Order</span>
          </button>
          <span className="text-slate-800">|</span>
          <button 
            id="nav-admin-portal-top"
            onClick={onOpenAdmin}
            className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Store Admin</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSelectCategory('all'); }}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500 transition-all duration-200">
                <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  CORE.STORE
                </span>
                <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-slate-500 -mt-1">
                  ELEGANT COMMERCE
                </span>
              </div>
            </a>

            {/* Department Mega Dropdown */}
            <div className="relative hidden lg:block" ref={deptRef}>
              <button
                id="departments-dropdown-btn"
                onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isDeptMenuOpen 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Departments</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDeptMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDeptMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#161b22] rounded-xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                    Product Departments
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsDeptMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                        selectedCategory === cat.id 
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-2 border-indigo-500' 
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        {cat.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Live Search Bar with Instant Autocomplete */}
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative">
              <input
                id="search-products-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search inventory, hardware, audio, accessories..."
                className="w-full pl-10 pr-10 py-2 bg-white/5 hover:bg-white/10 focus:bg-[#161b22] text-white placeholder:text-slate-600 rounded-full text-sm border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 outline-none"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Popover */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <div className="p-3 bg-[#1c2128] border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Products matching "{searchQuery}"</span>
                  <span>{searchResults.length} result(s)</span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          setIsSearchFocused(false);
                        }}
                        className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img 
                          src={prod.thumbnail} 
                          alt={prod.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {prod.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{prod.brand}</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-400">${prod.price}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {prod.stock > 0 ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              prod.stock <= prod.lowStockThreshold 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {prod.stock <= prod.lowStockThreshold ? `${prod.stock} remaining` : `${prod.stock} in stock`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No products found matching "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Shopping Assistant Trigger */}
            <button
              id="nav-ai-assistant-btn"
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all duration-150 cursor-pointer shadow-sm"
              title="Ask AI Shopping Concierge"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Concierge</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-150 flex items-center gap-2 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-300" />
              <span className="hidden md:inline font-semibold text-sm text-white">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
