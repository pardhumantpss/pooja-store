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
  Activity,
  Bell,
  User,
  Crown,
  AlertTriangle,
  BarChart3,
  Volume2,
  VolumeX,
  LogIn,
  UserPlus,
  Package,
  Trash2
} from 'lucide-react';
import { Category, Product, UserProfile, PageView } from '../types';
import { soundFx } from '../lib/soundFx';

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
  currentUser: UserProfile | null;
  onOpenRoleSwitcher: () => void;
  onOpenProfitAnalytics: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal?: () => void;
  unreadNotificationsCount?: number;
  activeMalfunctionsCount?: number;
  currentPage?: PageView;
  onNavigate?: (page: PageView) => void;
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
  currentUser,
  onOpenRoleSwitcher,
  onOpenProfitAnalytics,
  onOpenNotifications,
  onOpenAuthModal,
  unreadNotificationsCount = 0,
  activeMalfunctionsCount = 0,
  currentPage = 'shop',
  onNavigate,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(soundFx.isEnabled());
  const searchRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  const toggleSound = () => {
    const next = soundFx.toggle();
    setIsSoundOn(next);
    if (next) soundFx.playNotification();
  };

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

  const getRoleBadge = () => {
    if (!currentUser) return { label: 'Customer', icon: User, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    switch (currentUser.role) {
      case 'admin':
        return { label: 'Admin', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'financial_analyst':
        return { label: 'Analyst', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'inventory_manager':
        return { label: 'Inventory', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      default:
        return { label: 'Customer', icon: User, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

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
            <span className="tracking-wide">Pooja Store Live Inventory</span>
          </div>
          <span className="hidden md:inline text-slate-700">•</span>
          <span className="hidden md:inline text-slate-400">
            Instant Multi-Gateway Checkout (UPI, Cards, NetBanking) & Real-Time Profit Engine
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          
          {/* Dynamic Role Login Switcher */}
          <button
            id="nav-role-switcher-btn"
            onClick={onOpenRoleSwitcher}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${roleInfo.bg} ${roleInfo.color} font-semibold transition hover:brightness-125 cursor-pointer`}
            title="Switch Dynamic User Role"
          >
            <RoleIcon className="w-3 h-3" />
            <span className="max-w-[120px] truncate">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'} ({roleInfo.label})</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          <span className="text-slate-800">|</span>

          {/* Profit Analytics Drawer Trigger */}
          <button
            id="nav-profit-analytics-btn"
            onClick={onOpenProfitAnalytics}
            className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer font-semibold"
            title="Product Profitability & Margin Analytics"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profit Analysis</span>
          </button>

          <span className="text-slate-800">|</span>

          {/* System Notifications & Malfunctions Center */}
          <button
            id="nav-notifications-btn"
            onClick={onOpenNotifications}
            className="relative text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
            title="Transaction Updates & System Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Alerts</span>
            {(unreadNotificationsCount > 0 || activeMalfunctionsCount > 0) && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeMalfunctionsCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white'
              }`}>
                {activeMalfunctionsCount > 0 ? `! ${activeMalfunctionsCount}` : unreadNotificationsCount}
              </span>
            )}
          </button>

          <span className="text-slate-800">|</span>

          <button 
            id="nav-track-order-top"
            onClick={onOpenTracking}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Orders</span>
          </button>
          
          <span className="text-slate-800">|</span>

          <button 
            id="nav-admin-portal-top"
            onClick={onOpenAdmin}
            className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stock Control</span>
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-all duration-200">
                <span className="font-bold font-serif text-lg">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  POOJA STORE
                </span>
                <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-slate-500 -mt-1">
                  ELEGANT COMMERCE & ANALYTICS
                </span>
              </div>
            </a>

            {/* Primary Page Navigation Links */}
            {onNavigate && (
              <nav className="hidden xl:flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => onNavigate('shop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentPage === 'shop'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Storefront
                </button>
                <button
                  onClick={() => onNavigate('products_listing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'products_listing'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Product Directory</span>
                </button>
                <button
                  onClick={() => onNavigate('products_deleting')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'products_deleting'
                      ? 'bg-rose-500 text-white font-bold shadow'
                      : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Deletion Hub</span>
                </button>
              </nav>
            )}

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
                placeholder="Search inventory, audio, electronics, fashion, groceries..."
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

            {/* Sound FX Toggle */}
            <button
              id="nav-sound-toggle-btn"
              onClick={toggleSound}
              className={`p-2.5 rounded-full border transition cursor-pointer ${
                isSoundOn 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
              }`}
              title={isSoundOn ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

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

            {/* Sign In / Account Modal Trigger */}
            {onOpenAuthModal && (
              <button
                id="nav-auth-modal-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-indigo-600 border border-white/15 hover:border-indigo-500 transition-all duration-150 cursor-pointer shadow-sm"
                title="Sign In or Register Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentUser?.name ? 'Account' : 'Sign In'}</span>
              </button>
            )}

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
