import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Eye, 
  ShoppingCart, 
  Check, 
  X, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Archive,
  ArrowRight
} from 'lucide-react';
import { Product, Category, UserProfile, PageView } from '../types';

interface ProductListingPageProps {
  products: Product[];
  categories: Category[];
  currentUser: UserProfile;
  onNavigate: (page: PageView) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCreateProduct: (productData: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string, reason?: string) => Promise<void>;
  onBulkDelete: (ids: string[], reason?: string) => Promise<void>;
  onRefresh: () => void;
}

const PRESET_THUMBNAILS = [
  { label: 'Brass Diya', url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Incense & Herbs', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
  { label: 'Idol & Murti', url: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pooja Thali Set', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luxury Bell / Shankh', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80' },
  { label: 'Aromatic Oils', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80' },
];

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  products,
  categories,
  currentUser,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDelete,
  onRefresh,
}) => {
  // View & Filter States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'margin' | 'sales'>('name');
  
  // Selection for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBrand, setNewBrand] = useState('Pooja Heritage');
  const [newCategory, setNewCategory] = useState(categories[1]?.id || 'pooja-essentials');
  const [newSubcategory, setNewSubcategory] = useState('all');
  const [newPrice, setNewPrice] = useState<number | ''>(49);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | ''>(59);
  const [newCostPrice, setNewCostPrice] = useState<number | ''>(22);
  const [newStock, setNewStock] = useState<number | ''>(25);
  const [newLowStockThreshold, setNewLowStockThreshold] = useState<number | ''>(5);
  const [newSku, setNewSku] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(PRESET_THUMBNAILS[0].url);
  const [newDescription, setNewDescription] = useState('');
  const [newHighlights, setNewHighlights] = useState('Hand-carved with sacred perfection\n100% pure authentic materials\nBlessed and energized before dispatch');
  const [newBadge, setNewBadge] = useState('New Arrival');
  const [newTags, setNewTags] = useState('Authentic, Sacred, Handcrafted');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics Calculations
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock > p.lowStockThreshold).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalInventoryUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalCostValue = products.reduce((acc, p) => acc + ((p.costPrice || p.price * 0.45) * p.stock), 0);
    const avgMargin = totalInventoryValue > 0 
      ? (((totalInventoryValue - totalCostValue) / totalInventoryValue) * 100).toFixed(1)
      : '0';

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalInventoryUnits,
      totalInventoryValue,
      avgMargin
    };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Stock Status
      if (stockStatusFilter === 'in_stock' && p.stock <= p.lowStockThreshold) return false;
      if (stockStatusFilter === 'low_stock' && (p.stock === 0 || p.stock > p.lowStockThreshold)) return false;
      if (stockStatusFilter === 'out_of_stock' && p.stock > 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'stock_asc') return a.stock - b.stock;
      if (sortBy === 'stock_desc') return b.stock - a.stock;
      if (sortBy === 'sales') return (b.unitsSold || 0) - (a.unitsSold || 0);
      if (sortBy === 'margin') {
        const marginA = ((a.price - (a.costPrice || a.price * 0.45)) / a.price) * 100;
        const marginB = ((b.price - (b.costPrice || b.price * 0.45)) / b.price) * 100;
        return marginB - marginA;
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter, sortBy]);

  // Handle Add Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      showToast('Please enter a product title and price.');
      return;
    }

    setIsProcessing(true);
    try {
      const generatedSku = newSku.trim() || `POOJA-${newCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const highlightsArray = newHighlights.split('\n').map(h => h.trim()).filter(Boolean);
      const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

      await onCreateProduct({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || `${newBrand} Exclusive Edition`,
        brand: newBrand.trim(),
        category: newCategory,
        subcategory: newSubcategory,
        price: Number(newPrice),
        originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
        costPrice: newCostPrice ? Number(newCostPrice) : Number((Number(newPrice) * 0.45).toFixed(2)),
        stock: Number(newStock) || 0,
        lowStockThreshold: Number(newLowStockThreshold) || 5,
        sku: generatedSku,
        thumbnail: newThumbnail,
        images: [newThumbnail],
        description: newDescription.trim() || `Authentic ${newTitle} crafted for spiritual elegance.`,
        highlights: highlightsArray.length > 0 ? highlightsArray : ['Authentic craftsmanship', 'Inspected for purity'],
        badges: newBadge ? [newBadge] : ['New Arrival'],
        tags: tagsArray.length > 0 ? tagsArray : [newBrand, newCategory],
      });

      setIsAddModalOpen(false);
      resetAddForm();
      showToast(`Product "${newTitle}" added to live store!`);
    } catch (err: any) {
      showToast(`Failed to create product: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAddForm = () => {
    setNewTitle('');
    setNewSubtitle('');
    setNewPrice(49);
    setNewOriginalPrice(59);
    setNewCostPrice(22);
    setNewStock(25);
    setNewSku('');
    setNewDescription('');
  };

  // Handle Quick Stock Adjust
  const handleQuickStock = async (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    try {
      await onUpdateProduct(product.id, { stock: nextStock });
      showToast(`Stock for ${product.title} updated to ${nextStock}`);
    } catch (err: any) {
      showToast(`Error updating stock: ${err.message}`);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsProcessing(true);
    try {
      await onUpdateProduct(editingProduct.id, {
        title: editingProduct.title,
        subtitle: editingProduct.subtitle,
        brand: editingProduct.brand,
        price: Number(editingProduct.price),
        costPrice: Number(editingProduct.costPrice),
        stock: Number(editingProduct.stock),
        lowStockThreshold: Number(editingProduct.lowStockThreshold),
        category: editingProduct.category,
        thumbnail: editingProduct.thumbnail,
      });
      setEditingProduct(null);
      showToast(`Product "${editingProduct.title}" updated successfully!`);
    } catch (err: any) {
      showToast(`Failed to update: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Single Delete Confirm
  const handleSingleDelete = async () => {
    if (!deleteCandidate) return;
    setIsProcessing(true);
    try {
      await onDeleteProduct(deleteCandidate.id, deleteReason || 'Manual decommissioning from listing page');
      setDeleteCandidate(null);
      setDeleteReason('');
      showToast(`Product "${deleteCandidate.title}" moved to archive.`);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Bulk Selection
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // Bulk Delete Action
  const handleBulkDeleteSelected = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to archive and remove ${selectedProductIds.length} selected products?`)) return;

    setIsProcessing(true);
    try {
      await onBulkDelete(selectedProductIds, 'Bulk removal via Product Listing Page');
      setSelectedProductIds([]);
      showToast(`Archived ${selectedProductIds.length} products successfully.`);
    } catch (err: any) {
      showToast(`Bulk delete failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'SKU', 'Brand', 'Category', 'Price', 'CostPrice', 'MarginPct', 'Stock', 'UnitsSold', 'Rating'];
    const rows = filteredProducts.map(p => {
      const margin = (((p.price - (p.costPrice || p.price * 0.45)) / p.price) * 100).toFixed(1);
      return [
        `"${p.id}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.brand}"`,
        `"${p.category}"`,
        p.price,
        p.costPrice || (p.price * 0.45).toFixed(2),
        margin,
        p.stock,
        p.unitsSold || 0,
        p.rating
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pooja_store_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Product catalog exported as CSV!');
  };

  return (
    <div className="flex-1 bg-[#0a0a0c] text-slate-300 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-400/30 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#161b22] via-[#1a202c] to-[#12161f] p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Catalog Management
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Live Cloud Sync
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Product Listing Directory
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Comprehensive inventory directory, instant stock updates, and catalog governance
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('products_deleting')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              title="Go to Product Deletion & Archive Manager"
            >
              <Archive className="w-4 h-4" />
              <span>Deletion & Archive Hub</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Total SKUs
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{stats.totalProducts}</p>
            <span className="text-[10px] text-slate-500">Active catalog items</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              In Stock
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{stats.inStock}</p>
            <span className="text-[10px] text-slate-500">Healthy buffer</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Low Stock
            </span>
            <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{stats.lowStock}</p>
            <span className="text-[10px] text-slate-500">Below threshold</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" />
              Out of Stock
            </span>
            <p className="text-xl font-bold text-rose-400 mt-1 font-mono">{stats.outOfStock}</p>
            <span className="text-[10px] text-slate-500">Immediate restock needed</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              Catalog Value
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">${stats.totalInventoryValue.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">{stats.totalInventoryUnits} total units</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Avg Margin
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{stats.avgMargin}%</p>
            <span className="text-[10px] text-slate-500">Profit yield</span>
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by title, SKU, brand, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({products.filter(p => p.category === cat.id).length})
                  </option>
                ))}
              </select>

              {/* Stock Status Selector */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock Only</option>
                <option value="low_stock">Low Stock (≤ threshold)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="name">Sort: Title (A-Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="margin">Gross Margin % (High to Low)</option>
                <option value="sales">Units Sold (High to Low)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#0a0a0c] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onRefresh}
                className="p-2 bg-[#0a0a0c] hover:bg-slate-800 border border-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                title="Refresh Product Feeds"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedProductIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedProductIds.length} products selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Archive Selected</span>
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product List Content (Table or Grid) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#161b22] p-12 rounded-2xl border border-white/5 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                No catalog items match your search "{searchQuery}" and selected filters. Try clearing or relaxing filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* High-Density Responsive Table View */
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0f1217] text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={selectAllFiltered}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category & Brand</th>
                    <th className="p-4">Price & COGS</th>
                    <th className="p-4">Margin %</th>
                    <th className="p-4">Live Stock</th>
                    <th className="p-4">Sales & Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const cost = p.costPrice || (p.price * 0.45);
                    const margin = (((p.price - cost) / p.price) * 100).toFixed(1);
                    const marginNum = Number(margin);

                    return (
                      <tr 
                        key={p.id}
                        className={`hover:bg-white/[0.02] transition ${isSelected ? 'bg-amber-500/[0.04]' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Product Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-slate-900 flex-shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <h4 
                                onClick={() => onSelectProduct(p)}
                                className="font-bold text-white text-sm hover:text-amber-400 transition cursor-pointer truncate"
                                title={p.title}
                              >
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] text-slate-400">SKU: {p.sku}</span>
                                {p.badges && p.badges.length > 0 && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    {p.badges[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="p-4">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-white/5 capitalize">
                              {p.category.replace(/-/g, ' ')}
                            </span>
                            <p className="text-slate-400 text-xs mt-1">{p.brand}</p>
                          </div>
                        </td>

                        {/* Price & COGS */}
                        <td className="p-4 font-mono">
                          <div>
                            <span className="text-white font-bold text-sm">${p.price.toFixed(2)}</span>
                            {p.originalPrice && (
                              <span className="text-slate-500 line-through text-[11px] ml-1.5">
                                ${p.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              COGS: ${cost.toFixed(2)}
                            </p>
                          </div>
                        </td>

                        {/* Margin % */}
                        <td className="p-4 font-mono">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            marginNum >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            marginNum >= 35 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {margin}%
                          </span>
                        </td>

                        {/* Live Stock & Quick Adjust */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-[#0a0a0c] border border-white/10 rounded-lg p-0.5">
                              <button
                                onClick={() => handleQuickStock(p, -1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                                title="Decrease stock"
                              >
                                -
                              </button>
                              <span className={`px-2 font-mono font-bold text-xs ${
                                p.stock === 0 ? 'text-rose-400' :
                                p.stock <= p.lowStockThreshold ? 'text-amber-400' :
                                'text-emerald-400'
                              }`}>
                                {p.stock}
                              </span>
                              <button
                                onClick={() => handleQuickStock(p, 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                                title="Increase stock"
                              >
                                +
                              </button>
                            </div>

                            {p.stock === 0 ? (
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                Sold Out
                              </span>
                            ) : p.stock <= p.lowStockThreshold ? (
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                Low
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Sales & Rating */}
                        <td className="p-4">
                          <div className="text-xs">
                            <span className="text-white font-medium">{p.unitsSold || 0} sold</span>
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                              <span>★ {p.rating.toFixed(1)}</span>
                              <span className="text-slate-500">({p.reviewCount})</span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onAddToCart(p)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(p)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                              title="Delete / Archive Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Visual Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              const cost = p.costPrice || (p.price * 0.45);
              const margin = (((p.price - cost) / p.price) * 100).toFixed(1);

              return (
                <div 
                  key={p.id}
                  className={`bg-[#161b22] rounded-2xl border transition shadow-lg overflow-hidden flex flex-col ${
                    isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer bg-black/60"
                      />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-bold">
                        {p.sku}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.stock === 0 ? 'bg-rose-500 text-white' :
                        p.stock <= p.lowStockThreshold ? 'bg-amber-500 text-slate-950' :
                        'bg-emerald-500/90 text-slate-950'
                      }`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="capitalize">{p.brand}</span>
                        <span className="text-amber-400">★ {p.rating.toFixed(1)}</span>
                      </div>
                      <h4 
                        onClick={() => onSelectProduct(p)}
                        className="font-bold text-white text-sm hover:text-amber-400 cursor-pointer line-clamp-1"
                      >
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
                      <div>
                        <span className="text-base font-bold text-white">${p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-400 ml-2 font-semibold">
                          {margin}% margin
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- ADD NEW PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-[#161b22] rounded-2xl border border-white/10 shadow-2xl p-6 text-slate-300 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create New Catalog Product</h3>
                  <p className="text-xs text-slate-400">Add a new item with instant SKU allocation and live stock buffer</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Brass Panch Aarti Lamp"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Subtitle / Edition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handcrafted Traditional Temple Brassware"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Retail Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Retail Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Cost Price (COGS) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Cost Price / COGS ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Initial Stock Count (Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Custom SKU (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POOJA-BRS-9021"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Thumbnail Image Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Product Thumbnail Image URL
                </label>
                <input
                  type="url"
                  required
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500 mb-2"
                />

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 font-bold">Quick Presets:</span>
                  {PRESET_THUMBNAILS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewThumbnail(preset.url)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                        newThumbnail === preset.url
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Elaborate on the spiritual purity, craftsmanship, dimensions, and materials..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Key Feature Highlights (One per line)
                </label>
                <textarea
                  rows={2}
                  value={newHighlights}
                  onChange={(e) => setNewHighlights(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Product to Store</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- QUICK EDIT PRODUCT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#161b22] rounded-2xl border border-white/10 shadow-2xl p-6 text-slate-300 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Product Details</h3>
                  <p className="text-xs text-slate-400">SKU: {editingProduct.sku}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice || (editingProduct.price * 0.45)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.lowStockThreshold}
                    onChange={(e) => setEditingProduct({ ...editingProduct, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- SINGLE DELETE CONFIRMATION DIALOG --- */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#161b22] rounded-2xl border border-rose-500/30 shadow-2xl p-6 text-slate-300 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Archive Product from Catalog?</h3>
                <p className="text-xs text-rose-400">Item will be decommissioned and moved to Archive</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 flex items-center gap-3">
                <img
                  src={deleteCandidate.thumbnail}
                  alt={deleteCandidate.title}
                  className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-slate-900 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{deleteCandidate.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">SKU: {deleteCandidate.sku} • Stock: {deleteCandidate.stock} units</p>
                  <p className="text-xs text-amber-400 font-mono">${deleteCandidate.price.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Reason for Decommissioning / Deletion
                </label>
                <input
                  type="text"
                  placeholder="e.g. End of batch, supplier discontinued, low demand..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Non-destructive soft delete
                </p>
                <p>
                  You can restore this product anytime from the <span className="text-white font-bold">Deletion & Archive Hub</span> without losing product metadata.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSingleDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Authorize Archival</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
