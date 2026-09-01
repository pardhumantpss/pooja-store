import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Archive, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Search, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  Package, 
  History, 
  ArrowLeft, 
  FileSpreadsheet, 
  Download, 
  Check, 
  Sparkles,
  Info,
  Clock,
  User,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Product, ArchivedProduct, ProductDeletionLog, UserProfile, PageView } from '../types';
import { api } from '../lib/api';

interface ProductDeletingPageProps {
  products: Product[];
  currentUser: UserProfile;
  onNavigate: (page: PageView) => void;
  onDeleteProduct: (id: string, reason?: string) => Promise<void>;
  onBulkDelete: (ids: string[], reason?: string) => Promise<void>;
  onRefreshProducts: () => void;
}

export const ProductDeletingPage: React.FC<ProductDeletingPageProps> = ({
  products,
  currentUser,
  onNavigate,
  onDeleteProduct,
  onBulkDelete,
  onRefreshProducts,
}) => {
  // Tabs: 'active_clean' | 'archive_bin' | 'audit_log'
  const [activeTab, setActiveTab] = useState<'active_clean' | 'archive_bin' | 'audit_log'>('active_clean');
  
  // Data States
  const [archivedProducts, setArchivedProducts] = useState<ArchivedProduct[]>([]);
  const [deletionLogs, setDeletionLogs] = useState<ProductDeletionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Catalog Deletion selection & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'zero_stock' | 'zero_sales' | 'high_value'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchReason, setBatchReason] = useState('Catalog decommissioning & inventory refresh');

  // Confirmation Modals
  const [activeDeleteModal, setActiveDeleteModal] = useState<{
    isOpen: boolean;
    product?: Product;
    isBulk?: boolean;
    ids?: string[];
  }>({ isOpen: false });

  const [purgeTarget, setPurgeTarget] = useState<ArchivedProduct | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load archived items and audit logs on mount or tab change
  const loadArchiveAndLogs = async () => {
    setIsLoading(true);
    try {
      const [archData, logData] = await Promise.all([
        api.getArchivedProducts(),
        api.getDeletionLogs(),
      ]);
      setArchivedProducts(archData.archivedProducts || []);
      setDeletionLogs(logData || []);
    } catch (err: any) {
      console.error('Failed to load archive data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchiveAndLogs();
  }, [activeTab]);

  // Filtered active products for decommissioning
  const filteredActiveProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (riskFilter === 'zero_stock' && p.stock > 0) return false;
      if (riskFilter === 'zero_sales' && (p.unitsSold || 0) > 0) return false;
      if (riskFilter === 'high_value' && (p.price * p.stock) < 1000) return false;

      return true;
    });
  }, [products, searchQuery, riskFilter]);

  // Quick Select Presets
  const selectZeroStock = () => {
    const zeroStockIds = products.filter(p => p.stock === 0).map(p => p.id);
    setSelectedIds(zeroStockIds);
    showToast(`Selected ${zeroStockIds.length} zero-stock products.`);
  };

  const selectZeroSales = () => {
    const zeroSalesIds = products.filter(p => (p.unitsSold || 0) === 0).map(p => p.id);
    setSelectedIds(zeroSalesIds);
    showToast(`Selected ${zeroSalesIds.length} zero-sales products.`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredActiveProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredActiveProducts.map(p => p.id));
    }
  };

  // Execution: Bulk Delete
  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedIds, batchReason, currentUser.name);
      setSelectedIds([]);
      setActiveDeleteModal({ isOpen: false });
      setConfirmationInput('');
      await loadArchiveAndLogs();
      onRefreshProducts();
      showToast(`Successfully moved ${selectedIds.length} items to Recycle Bin.`);
    } catch (err: any) {
      showToast(`Bulk delete failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execution: Single Delete
  const handleExecuteSingleDelete = async () => {
    if (!activeDeleteModal.product) return;
    setIsProcessing(true);
    try {
      await onDeleteProduct(activeDeleteModal.product.id, batchReason, currentUser.name);
      setActiveDeleteModal({ isOpen: false });
      setConfirmationInput('');
      await loadArchiveAndLogs();
      onRefreshProducts();
      showToast(`Product "${activeDeleteModal.product.title}" archived successfully.`);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execution: 1-Click Restore
  const handleRestoreProduct = async (archiveId: string, title: string) => {
    setIsProcessing(true);
    try {
      await api.restoreProduct(archiveId);
      await loadArchiveAndLogs();
      onRefreshProducts();
      showToast(`Restored "${title}" back to active catalog!`);
    } catch (err: any) {
      showToast(`Failed to restore: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execution: Permanent Purge
  const handlePurgeProduct = async () => {
    if (!purgeTarget) return;
    setIsProcessing(true);
    try {
      await api.purgeProduct(purgeTarget.id);
      setPurgeTarget(null);
      await loadArchiveAndLogs();
      showToast(`Product permanently deleted from archives.`);
    } catch (err: any) {
      showToast(`Purge failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Deletion Audit Trail CSV
  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Action', 'Product Title', 'SKU', 'Category', 'Deleted At', 'Performed By', 'Units Removed', 'Value Impact', 'Reason'];
    const rows = deletionLogs.map(l => [
      `"${l.id}"`,
      `"${l.action.toUpperCase()}"`,
      `"${l.productTitle.replace(/"/g, '""')}"`,
      `"${l.sku}"`,
      `"${l.category}"`,
      `"${new Date(l.deletedAt).toLocaleString()}"`,
      `"${l.deletedBy}"`,
      l.unitsRemoved,
      l.estimatedValueLost,
      `"${(l.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalog_deletion_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit Log exported to CSV!');
  };

  // Calculate Impact Metrics for Selected Items
  const selectedMetrics = useMemo(() => {
    const selectedProds = products.filter(p => selectedIds.includes(p.id));
    const totalUnits = selectedProds.reduce((acc, p) => acc + p.stock, 0);
    const totalValue = selectedProds.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalRevenueHistorical = selectedProds.reduce((acc, p) => acc + (p.price * (p.unitsSold || 0)), 0);

    return {
      count: selectedProds.length,
      totalUnits,
      totalValue,
      totalRevenueHistorical
    };
  }, [products, selectedIds]);

  return (
    <div className="flex-1 bg-[#0a0a0c] text-slate-300 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-500 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-rose-400/30 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1c1214] via-[#1a141e] to-[#12161f] p-6 rounded-2xl border border-rose-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onNavigate('products_listing')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Directory
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                Catalog Governance & Cleanup
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Archive className="w-7 h-7 text-rose-400" />
              Product Deletion & Archive Hub
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Safely decommission items, perform bulk catalog purges, restore archived items, and audit inventory history
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigate('products_listing')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Product Directory</span>
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span>View Live Storefront</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Active Catalog
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{products.length}</p>
            <span className="text-[10px] text-slate-500">Live for shoppers</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-rose-400" />
              Recycle Bin / Archived
            </span>
            <p className="text-xl font-bold text-rose-400 mt-1 font-mono">{archivedProducts.length}</p>
            <span className="text-[10px] text-slate-500">Restorable anytime</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Units in Archive
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {archivedProducts.reduce((acc, a) => acc + (a.previousStock || 0), 0)}
            </p>
            <span className="text-[10px] text-slate-500">Removed from shelf</span>
          </div>

          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              Audit Trail Entries
            </span>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{deletionLogs.length}</p>
            <span className="text-[10px] text-slate-500">Logged actions</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => setActiveTab('active_clean')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition cursor-pointer ${
              activeTab === 'active_clean'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Active Deletion & Decommissioning ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive_bin')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition cursor-pointer ${
              activeTab === 'archive_bin'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recycle Bin & Restores ({archivedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition cursor-pointer ${
              activeTab === 'audit_log'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Deletion Audit Log ({deletionLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE CATALOG DELETION */}
        {activeTab === 'active_clean' && (
          <div className="space-y-4">
            
            {/* Toolbar and Quick Selection Presets */}
            <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5 space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search active items to decommission..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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

                {/* Risk Filter & Quick Selection Presets */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Select:</span>
                  
                  <button
                    onClick={selectZeroStock}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition cursor-pointer"
                  >
                    Zero Stock ({products.filter(p => p.stock === 0).length})
                  </button>

                  <button
                    onClick={selectZeroSales}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition cursor-pointer"
                  >
                    Zero Sales ({products.filter(p => (p.unitsSold || 0) === 0).length})
                  </button>

                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-[#0a0a0c] border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">All Products</option>
                    <option value="zero_stock">Zero Stock Items</option>
                    <option value="zero_sales">Zero Sales History</option>
                    <option value="high_value">High Inventory Value (&gt;$1,000)</option>
                  </select>

                  <button
                    onClick={loadArchiveAndLogs}
                    className="p-2 bg-[#0a0a0c] hover:bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition"
                    title="Refresh list"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bulk Action Sticky Bar if selected */}
              {selectedIds.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-xs">
                        {selectedMetrics.count} Items Selected
                      </span>
                      <span className="text-xs text-rose-300 font-semibold">
                        Impact: {selectedMetrics.totalUnits} units removed • ${selectedMetrics.totalValue.toLocaleString()} inventory value
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Soft-deletion preserves order history and moves products to Recycle Bin for 1-click restore.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDeleteModal({ isOpen: true, isBulk: true, ids: selectedIds })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive {selectedIds.length} Selected</span>
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Products Table */}
            <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0f1217] text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredActiveProducts.length && filteredActiveProducts.length > 0}
                          onChange={selectAll}
                          className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Product to Decommission</th>
                      <th className="p-4">SKU & Category</th>
                      <th className="p-4">Stock Buffer</th>
                      <th className="p-4">Retail Value</th>
                      <th className="p-4">Units Sold</th>
                      <th className="p-4">Decommission Safety</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredActiveProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      const value = p.price * p.stock;
                      const isZeroStock = p.stock === 0;
                      const isZeroSales = (p.unitsSold || 0) === 0;

                      return (
                        <tr 
                          key={p.id}
                          className={`hover:bg-white/[0.02] transition ${isSelected ? 'bg-rose-500/[0.04]' : ''}`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(p.id)}
                              className="rounded border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.thumbnail}
                                alt={p.title}
                                className="w-10 h-10 rounded-lg object-cover border border-white/10 bg-slate-900 flex-shrink-0"
                              />
                              <div className="min-w-0 max-w-xs">
                                <h4 className="font-bold text-white text-xs truncate" title={p.title}>
                                  {p.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">{p.brand}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono">
                            <span className="text-white font-bold">{p.sku}</span>
                            <p className="text-[10px] text-slate-500 capitalize">{p.category.replace(/-/g, ' ')}</p>
                          </td>

                          <td className="p-4 font-mono">
                            <span className={`font-bold ${isZeroStock ? 'text-rose-400' : p.stock <= p.lowStockThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {p.stock} units
                            </span>
                          </td>

                          <td className="p-4 font-mono">
                            <span className="text-white">${value.toFixed(2)}</span>
                            <p className="text-[10px] text-slate-500">${p.price.toFixed(2)} ea</p>
                          </td>

                          <td className="p-4">
                            <span className="text-slate-300 font-medium">{p.unitsSold || 0} sold</span>
                          </td>

                          <td className="p-4">
                            {isZeroStock ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                Safe • Out of Stock
                              </span>
                            ) : isZeroSales ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                                Low Risk • 0 Sales
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                Active • {p.stock} units
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => setActiveDeleteModal({ isOpen: true, product: p, isBulk: false })}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Decommission</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECYCLE BIN & RESTORES */}
        {activeTab === 'archive_bin' && (
          <div className="space-y-4">
            
            <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recycle Bin & Archived Catalog Items</h3>
                  <p className="text-xs text-slate-400">
                    Restoring any product returns it immediately to the active storefront with original pricing and SKU
                  </p>
                </div>
              </div>

              <button
                onClick={loadArchiveAndLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Archive</span>
              </button>
            </div>

            {archivedProducts.length === 0 ? (
              <div className="bg-[#161b22] p-12 rounded-2xl border border-white/5 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Archive className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Recycle Bin is Empty</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No archived products found. Any products decommissioned from the active catalog will appear here for 1-click restore.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedProducts.map((item) => {
                  const orig = item.originalProduct;
                  return (
                    <div 
                      key={item.id}
                      className="bg-[#161b22] rounded-2xl border border-white/5 hover:border-white/15 transition p-4 flex flex-col justify-between space-y-4 shadow-xl"
                    >
                      <div className="space-y-3">
                        
                        {/* Top info and thumbnail */}
                        <div className="flex items-start gap-3">
                          <img
                            src={orig.thumbnail}
                            alt={orig.title}
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-slate-900 flex-shrink-0 grayscale opacity-80"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              Archived
                            </span>
                            <h4 className="font-bold text-white text-sm mt-1 truncate" title={orig.title}>
                              {orig.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-mono">SKU: {orig.sku}</p>
                          </div>
                        </div>

                        {/* Deletion details */}
                        <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Archived:
                            </span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {new Date(item.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1 text-[11px]">
                              <User className="w-3 h-3 text-slate-500" />
                              By:
                            </span>
                            <span className="text-slate-300 font-medium text-[11px]">
                              {item.deletedBy}
                            </span>
                          </div>

                          {item.reason && (
                            <div className="pt-1 border-t border-white/5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Reason:</p>
                              <p className="text-xs text-slate-300 italic">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleRestoreProduct(item.id, orig.title)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>1-Click Restore</span>
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => setPurgeTarget(item)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                          title="Permanently Purge from Database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: DELETION AUDIT TRAIL */}
        {activeTab === 'audit_log' && (
          <div className="space-y-4">
            
            <div className="bg-[#161b22] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Product Deletion & Governance Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable record of all catalog archivals, restores, and permanent purges
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAuditCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit CSV</span>
                </button>
                <button
                  onClick={loadArchiveAndLogs}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0f1217] text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-4">Action</th>
                      <th className="p-4">Product / SKU</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Performed By</th>
                      <th className="p-4">Units Affected</th>
                      <th className="p-4">Estimated Value</th>
                      <th className="p-4">Reason / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {deletionLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No audit log events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      deletionLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                              log.action === 'archived' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              log.action === 'restored' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {log.action}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-white">{log.productTitle}</p>
                            <span className="font-mono text-[11px] text-slate-500">{log.sku}</span>
                          </td>

                          <td className="p-4 text-slate-400 font-mono text-[11px]">
                            {new Date(log.deletedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>

                          <td className="p-4 font-medium text-slate-200">
                            {log.deletedBy}
                          </td>

                          <td className="p-4 font-mono text-slate-300">
                            {log.unitsRemoved} units
                          </td>

                          <td className="p-4 font-mono text-slate-300">
                            ${(log.estimatedValueLost || 0).toFixed(2)}
                          </td>

                          <td className="p-4 text-slate-400 italic max-w-xs truncate" title={log.reason}>
                            {log.reason || 'Catalog maintenance'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* --- DELETION CONFIRMATION MODAL --- */}
      {activeDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#161b22] rounded-2xl border border-rose-500/40 shadow-2xl p-6 text-slate-300 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {activeDeleteModal.isBulk ? `Confirm Bulk Decommissioning (${selectedIds.length} Items)` : 'Confirm Product Decommissioning'}
                </h3>
                <p className="text-xs text-rose-400">
                  Items will be soft-deleted and moved to Recycle Bin
                </p>
              </div>
            </div>

            <div className="py-4 space-y-4">
              {activeDeleteModal.isBulk ? (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Products Affected:</span>
                    <span className="font-bold text-white font-mono">{selectedMetrics.count} items</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Warehouse Stock Removed:</span>
                    <span className="font-bold text-white font-mono">{selectedMetrics.totalUnits} units</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Retail Value Removed:</span>
                    <span className="font-bold text-white font-mono">${selectedMetrics.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              ) : activeDeleteModal.product ? (
                <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10 flex items-center gap-3">
                  <img
                    src={activeDeleteModal.product.thumbnail}
                    alt={activeDeleteModal.product.title}
                    className="w-12 h-12 rounded-lg object-cover border border-white/10 bg-slate-900 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{activeDeleteModal.product.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">SKU: {activeDeleteModal.product.sku} • Stock: {activeDeleteModal.product.stock} units</p>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Reason for Deletion / Archival (Saved to Audit Trail)
                </label>
                <input
                  type="text"
                  required
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  This action removes the product from customer search and store shelves immediately. You can restore this item at any time from the <strong className="text-white">Recycle Bin</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveDeleteModal({ isOpen: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={activeDeleteModal.isBulk ? handleExecuteBulkDelete : handleExecuteSingleDelete}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Authorize Archival</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PERMANENT PURGE CONFIRMATION MODAL --- */}
      {purgeTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#161b22] rounded-2xl border border-rose-600 shadow-2xl p-6 text-slate-300 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Erase Product?</h3>
                <p className="text-xs text-rose-400 font-semibold">Irreversible Database Action</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-300">
                You are about to permanently purge <strong className="text-white">"{purgeTarget.originalProduct.title}"</strong> (SKU: {purgeTarget.originalProduct.sku}) from the recycle bin.
              </p>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                ⚠️ This item cannot be restored once purged.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPurgeTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePurgeProduct}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Purge</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
