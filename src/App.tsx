import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  CategoryNav 
} from './components/CategoryNav';
import { 
  FilterSidebar 
} from './components/FilterSidebar';
import { 
  ProductCard 
} from './components/ProductCard';
import { 
  ProductDetailModal 
} from './components/ProductDetailModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  OrderTrackingModal 
} from './components/OrderTrackingModal';
import { 
  AdminInventoryDrawer 
} from './components/AdminInventoryDrawer';
import { 
  AiShoppingDrawer 
} from './components/AiShoppingDrawer';
import { 
  LivePurchaseTicker 
} from './components/LivePurchaseTicker';
import { 
  RoleSwitcherModal 
} from './components/RoleSwitcherModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  LiveStoreBanner 
} from './components/LiveStoreBanner';
import { 
  LiveActivityToaster 
} from './components/LiveActivityToaster';
import { 
  ProfitAnalyticsDrawer 
} from './components/ProfitAnalyticsDrawer';
import { 
  SystemNotificationsDrawer 
} from './components/SystemNotificationsDrawer';
import { 
  ProductListingPage 
} from './components/ProductListingPage';
import { 
  ProductDeletingPage 
} from './components/ProductDeletingPage';
import { 
  fetchProducts, 
  fetchCategories, 
  fetchOrders, 
  updateProductStock, 
  simulatePurchase, 
  resetInventory,
  api
} from './lib/api';
import { CATEGORIES, INITIAL_PRODUCTS } from './data/mockProducts';
import { 
  Product, 
  Category, 
  CartItem, 
  FilterState, 
  Order,
  UserProfile,
  UserRole,
  SystemNotification,
  PageView
} from './types';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Activity, 
  ArrowRight,
  Zap,
  ShoppingBag,
  SlidersHorizontal,
  Flame,
  Check,
  TrendingUp,
  BarChart3,
  Bell,
  Crown,
  Package,
  Archive,
  Trash2
} from 'lucide-react';

export function App() {
  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Role & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'usr_admin_01',
    name: 'Alex Vance',
    email: 'alex.vance@poojastore.internal',
    role: 'admin',
    department: 'Store Executive & Founder',
    permissions: ['*'],
  });

  // Dedicated Page Routing State
  const [currentPage, setCurrentPage] = useState<PageView>('shop');

  // Navigation & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    subcategories: [],
    minPrice: 0,
    maxPrice: 1000,
    ratings: [],
    inStockOnly: false,
    onSaleOnly: false,
    brands: [],
    tags: [],
  });

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfitAnalyticsOpen, setIsProfitAnalyticsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Notifications & System Health Status
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activeMalfunctionsCount, setActiveMalfunctionsCount] = useState(0);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Initial Data Load & User Init
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [prodsData, catsData, ordersData, userData, notifsData, healthData] = await Promise.all([
          fetchProducts().catch(() => INITIAL_PRODUCTS),
          fetchCategories().catch(() => CATEGORIES),
          fetchOrders().catch(() => []),
          api.getCurrentUser().catch(() => null),
          api.getNotifications().catch(() => []),
          api.getSystemHealth().catch(() => null),
        ]);
        if (prodsData && prodsData.length > 0) setProducts(prodsData);
        if (catsData && catsData.length > 0) setCategories(catsData);
        if (ordersData) setOrders(ordersData);
        if (userData) setCurrentUser(userData);
        if (notifsData) setNotifications(notifsData);
        if (healthData) setActiveMalfunctionsCount(healthData.activeMalfunctionsCount || 0);
      } catch (err) {
        console.error('Failed to load initial data, using fallbacks:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Periodic Stock & Notification Sync (every 6 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const [freshProducts, freshNotifs, freshHealth] = await Promise.all([
          fetchProducts().catch(() => null),
          api.getNotifications(currentUser?.role).catch(() => null),
          api.getSystemHealth().catch(() => null),
        ]);

        if (freshProducts) {
          setProducts(freshProducts);

          // Update cart items with live available stock
          setCartItems((currentCart) =>
            currentCart.map((item) => {
              const match = freshProducts.find((p) => p.id === item.productId);
              if (!match) return item;
              let liveStock = match.stock;
              if (item.variantId && match.variants) {
                const vMatch = match.variants.find((v) => v.id === item.variantId);
                if (vMatch) liveStock = vMatch.stock;
              }
              return {
                ...item,
                currentAvailableStock: liveStock,
                quantity: Math.min(item.quantity, Math.max(1, liveStock)),
              };
            })
          );
        }

        if (freshNotifs) setNotifications(freshNotifs);
        if (freshHealth) setActiveMalfunctionsCount(freshHealth.activeMalfunctionsCount || 0);
      } catch (err) {
        // Silent background sync
      }
    }, 6000);

    return () => clearInterval(syncInterval);
  }, [currentUser]);

  // Handle Switch User Role
  const handleSwitchRole = async (role: UserRole, customUser?: Partial<UserProfile>) => {
    try {
      const res = await api.switchRole(role, customUser);
      if (res.user) {
        setCurrentUser(res.user);
        // Refresh notifications for this role
        const freshNotifs = await api.getNotifications(res.user.role);
        setNotifications(freshNotifs);
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Available brands derived from current product pool
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Subcategory
        if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) {
          return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchBrand && !matchCategory && !matchTags) return false;
        }
        // Price Filter
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }
        // In Stock Only
        if (filters.inStockOnly && p.stock <= 0) {
          return false;
        }
        // On Sale Only
        if (filters.onSaleOnly && !p.discountPercent) {
          return false;
        }
        // Brands
        if (filters.brands.length > 0 && !filters.brands.includes(p.brand)) {
          return false;
        }
        // Rating
        if (filters.ratings.length > 0) {
          const minRequired = Math.min(...filters.ratings);
          if (p.rating < minRequired) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.badges?.includes('New Arrival') ? 1 : 0) - (a.badges?.includes('New Arrival') ? 1 : 0);
        // Default: Popular / Featured
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy, filters]);

  // Cart Management Handlers
  const handleAddToCart = (product: Product, selectedVariantId?: string, quantity: number = 1) => {
    const variant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];
    const availableStock = variant ? variant.stock : product.stock;

    if (availableStock <= 0) return;

    const cartItemId = `${product.id}-${variant ? variant.id : 'base'}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const nextQty = Math.min(availableStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: nextQty, currentAvailableStock: availableStock }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          variantId: variant?.id,
          title: product.title,
          price: product.price,
          quantity: Math.min(availableStock, quantity),
          image: product.thumbnail,
          selectedColor: variant?.colorName,
          selectedColorHex: variant?.colorHex,
          selectedSize: variant?.size,
          currentAvailableStock: availableStock,
          sku: variant?.sku || product.sku,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, selectedVariantId?: string, quantity: number = 1) => {
    handleAddToCart(product, selectedVariantId, quantity);
    setActiveProductModal(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: Math.min(item.currentAvailableStock, newQuantity) }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Promo Code Validation
  const handleApplyPromoCode = (code: string): boolean => {
    const upper = code.toUpperCase();
    const subtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    if (upper === 'WELCOME10') {
      setPromoCode('WELCOME10');
      setDiscountAmount(Number((subtotal * 0.1).toFixed(2)));
      return true;
    }
    if (upper === 'SAVE20') {
      setPromoCode('SAVE20');
      setDiscountAmount(Number((subtotal * 0.2).toFixed(2)));
      return true;
    }
    if (upper === 'FREESHIP') {
      setPromoCode('FREESHIP');
      setDiscountAmount(0);
      return true;
    }
    return false;
  };

  // Wishlist Toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Admin Stock Handlers
  const handleAdminUpdateStock = async (productId: string, newStock: number, variantId?: string) => {
    try {
      const updated = await updateProductStock(productId, newStock, variantId);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const handleTriggerSimulatedPurchase = async () => {
    try {
      const result = await simulatePurchase();
      if (result.product) {
        setProducts((prev) => prev.map((p) => (p.id === result.product.id ? result.product : p)));
      }
    } catch (err) {
      console.error('Simulated purchase failed:', err);
    }
  };

  const handleResetInventory = async () => {
    try {
      const fresh = await resetInventory();
      setProducts(fresh);
    } catch (err) {
      console.error('Reset inventory failed:', err);
    }
  };

  const handleOrderCompleted = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setPromoCode('');
    setDiscountAmount(0);
    try {
      const freshNotifs = await api.getNotifications(currentUser?.role);
      setNotifications(freshNotifs);
    } catch (err) {
      // Silent refresh
    }
  };

  // Product CRUD Handlers for Dedicated Listing and Deletion Pages
  const handleCreateProduct = async (productData: Partial<Product>) => {
    const res = await api.createProduct(productData);
    if (res.product) {
      setProducts((prev) => [res.product, ...prev]);
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const res = await api.updateProduct(id, updates);
    if (res.product) {
      setProducts((prev) => prev.map((p) => (p.id === id ? res.product : p)));
    }
  };

  const handleDeleteProduct = async (id: string, reason?: string, deletedBy?: string) => {
    await api.deleteProduct(id, reason, deletedBy || currentUser?.name);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBulkDeleteProducts = async (ids: string[], reason?: string, deletedBy?: string) => {
    await api.bulkDeleteProducts(ids, reason, deletedBy || currentUser?.name);
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col font-sans text-slate-300 selection:bg-indigo-500 selection:text-white">
      
      {/* 0. Live Store Promotional Marquee & Shoppers Ticker */}
      <LiveStoreBanner onPromoClick={(code) => handleApplyPromoCode(code)} />

      {/* 1. Global Navigation Bar */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubcategory('all');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => {}}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAiAssistant={() => setIsAiOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        allProducts={products}
        onSelectProduct={(p) => setActiveProductModal(p)}
        liveInventoryActive={true}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpenProfitAnalytics={() => setIsProfitAnalyticsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
        activeMalfunctionsCount={activeMalfunctionsCount}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* 2. Main View Routing (Storefront, Product Directory, Deletion Hub) */}
      {currentPage === 'products_listing' ? (
        <ProductListingPage
          products={products}
          categories={categories}
          currentUser={currentUser!}
          onNavigate={setCurrentPage}
          onSelectProduct={(p) => setActiveProductModal(p)}
          onAddToCart={handleAddToCart}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onBulkDelete={handleBulkDeleteProducts}
          onRefresh={async () => {
            const prods = await fetchProducts();
            setProducts(prods);
          }}
        />
      ) : currentPage === 'products_deleting' ? (
        <ProductDeletingPage
          products={products}
          currentUser={currentUser!}
          onNavigate={setCurrentPage}
          onDeleteProduct={handleDeleteProduct}
          onBulkDelete={handleBulkDeleteProducts}
          onRefreshProducts={async () => {
            const prods = await fetchProducts();
            setProducts(prods);
          }}
        />
      ) : (
        <>
          {/* Interactive Category & Subcategory Pill Strip */}
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setSelectedSubcategory('all');
            }}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProductsCount={filteredProducts.length}
            onToggleMobileFilter={() => setIsMobileFilterOpen(true)}
          />

          {/* Hero Feature Spotlight Banner (Curated & Functional) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="relative rounded-3xl overflow-hidden bg-[#161b22] text-white p-6 sm:p-10 border border-white/10 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pooja Store • Real-Time Stock & Profit Engine</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif leading-tight text-white">
                  Precision Crafted Hardware, Apparel & Electronics.
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every item is tracked at warehouse SKU resolution with dynamic profit margin intelligence, 256-bit encrypted checkout with instant UPI & card tokenization, and multi-role user dashboards.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="hero-explore-audio-btn"
                    onClick={() => {
                      setSelectedCategory('audio');
                      setSelectedSubcategory('all');
                    }}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <span>Audiophile Gear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="hero-explore-directory-btn"
                    onClick={() => setCurrentPage('products_listing')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <span>Manage Product Directory</span>
                  </button>

                  <button
                    id="hero-profit-analytics-btn"
                    onClick={() => setIsProfitAnalyticsOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Profit Intelligence</span>
                  </button>
                </div>
              </div>

              {/* Quick Value Pillars */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/5 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Live Stock Verification</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Express Insured Transit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Catalog Content Area (Sidebar + Grid) */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
            <div className="flex gap-8">
              
              {/* Left Refinement Sidebar */}
              <FilterSidebar
                filters={filters}
                onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
                onResetFilters={() =>
                  setFilters({
                    category: 'all',
                    subcategories: [],
                    minPrice: 0,
                    maxPrice: 1000,
                    ratings: [],
                    inStockOnly: false,
                    onSaleOnly: false,
                    brands: [],
                    tags: [],
                  })
                }
                availableBrands={availableBrands}
                totalMatches={filteredProducts.length}
                isMobileOpen={isMobileFilterOpen}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />

              {/* Right Product Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, idx) => (
                      <div key={idx} className="bg-[#161b22] rounded-2xl border border-white/5 p-4 space-y-4 animate-pulse">
                        <div className="aspect-square bg-[#1c2128] rounded-xl" />
                        <div className="h-4 bg-[#1c2128] rounded w-2/3" />
                        <div className="h-3 bg-[#1c2128] rounded w-full" />
                        <div className="h-6 bg-[#1c2128] rounded w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="bg-[#161b22] rounded-3xl border border-white/5 p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white text-lg">No products match your current filters</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try adjusting your price range, clearing brand checkboxes, or checking out all departments.
                    </p>
                    <button
                      id="reset-all-catalog-btn"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
                        setSearchQuery('');
                        setFilters({
                          category: 'all',
                          subcategories: [],
                          minPrice: 0,
                          maxPrice: 1000,
                          ratings: [],
                          inStockOnly: false,
                          onSaleOnly: false,
                          brands: [],
                          tags: [],
                        });
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/20"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setActiveProductModal(p)}
                        onAddToCart={handleAddToCart}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </>
      )}

      {/* 5. Footer */}
      <footer className="bg-[#0d0d11] border-t border-white/10 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400">
          <div className="space-y-3">
            <span className="font-bold text-base text-white tracking-wider block">POOJA STORE</span>
            <p className="text-slate-400 leading-relaxed">
              Curated hardware, technical textiles, and lifestyle essentials backed by real-time inventory, profit intelligence, dynamic multi-role access, and encrypted payment gateways.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Departments</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setSelectedSubcategory('all');
                    }}
                    className="hover:text-white transition cursor-pointer"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Operations & Portals</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentPage('products_listing')} className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">Product Directory</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('products_deleting')} className="hover:text-rose-400 transition cursor-pointer flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold text-rose-300">Catalog Deletion & Archive</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsRoleSwitcherOpen(true)} className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dynamic Role Switcher</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsProfitAnalyticsOpen(true)} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Product Profitability Analysis</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsNotificationsOpen(true)} className="hover:text-indigo-400 transition cursor-pointer flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Transaction & Malfunction Center</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsAdminOpen(true)} className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Warehouse Stock Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsTrackingOpen(true)} className="hover:text-white transition cursor-pointer">
                  Track Existing Order
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Guaranteed Security</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Protected by PCI-DSS Level 1 compliant multi-gateways with dynamic 3D-Secure 2.0 tokenization and UPI verification.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 / AES-256 Validated</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Product Detail & Quick View Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onSubmitReview={(prodId, rev) => {
          // Review submitted
        }}
      />

      {/* 7. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        promoCode={promoCode}
        onApplyPromoCode={handleApplyPromoCode}
        discountAmount={discountAmount}
      />

      {/* 8. Full 4-Step Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        promoCode={promoCode}
        discountAmount={discountAmount}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 9. Order Tracking & Logistics Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orders={orders}
      />

      {/* 10. Real-Time Admin Inventory & Stock Control Drawer */}
      <AdminInventoryDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateStock={handleAdminUpdateStock}
        onTriggerSimulatedPurchase={handleTriggerSimulatedPurchase}
        onResetAllInventory={handleResetInventory}
      />

      {/* 11. AI Shopping Concierge Drawer (Gemini Powered) */}
      <AiShoppingDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        allProducts={products}
        onSelectProduct={(p) => setActiveProductModal(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* 12. Live Real-Time Purchase Notifications Ticker */}
      <LivePurchaseTicker
        products={products}
        onSelectProduct={(p) => setActiveProductModal(p)}
      />

      {/* 13. Dynamic Role-Based Login & Perspective Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
      />

      {/* 13.5 Dedicated User Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* 13.6 Live Shopper Activity Floating Toaster */}
      <LiveActivityToaster
        products={products}
        onSelectProduct={(p) => setActiveProductModal(p)}
      />

      {/* 14. Product Profitability & Margin Analytics Drawer */}
      <ProfitAnalyticsDrawer
        isOpen={isProfitAnalyticsOpen}
        onClose={() => setIsProfitAnalyticsOpen(false)}
        onSelectProduct={(productId) => {
          const found = products.find((p) => p.id === productId);
          if (found) {
            setActiveProductModal(found);
            setIsProfitAnalyticsOpen(false);
          }
        }}
      />

      {/* 15. System Notifications & Malfunction Alerts Drawer */}
      <SystemNotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
        onSelectOrder={(orderId) => {
          setIsNotificationsOpen(false);
          setIsTrackingOpen(true);
        }}
      />

    </div>
  );
}

export default App;
