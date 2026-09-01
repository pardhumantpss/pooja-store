import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw, 
  Sliders, 
  ArrowUpRight, 
  HelpCircle, 
  Layers, 
  PieChart, 
  CheckCircle2,
  ChevronRight,
  Calculator,
  ShieldAlert
} from 'lucide-react';
import { ProductProfitAnalysis, StoreProfitSummary } from '../types';
import { api } from '../lib/api';

interface ProfitAnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const ProfitAnalyticsDrawer: React.FC<ProfitAnalyticsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [data, setData] = useState<StoreProfitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<ProductProfitAnalysis | null>(null);

  // Simulation State
  const [simPrice, setSimPrice] = useState<number>(0);
  const [simCost, setSimCost] = useState<number>(0);
  const [simVolumeBoost, setSimVolumeBoost] = useState<number>(10);
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const summary = await api.getProductProfitability();
      setData(summary);
      if (summary.topBenefitingProduct) {
        setSelectedAnalysis(summary.topBenefitingProduct);
        setSimPrice(summary.topBenefitingProduct.price);
        setSimCost(summary.topBenefitingProduct.costPrice);
      }
    } catch (err) {
      console.error('Failed to fetch profit analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const handleSelectProductForSim = (analysis: ProductProfitAnalysis) => {
    setSelectedAnalysis(analysis);
    setSimPrice(analysis.price);
    setSimCost(analysis.costPrice);
    setSimResult(null);
  };

  const handleRunSimulation = async () => {
    if (!selectedAnalysis) return;
    try {
      setSimulating(true);
      const res = await api.simulatePriceMargin({
        productId: selectedAnalysis.productId,
        simulatedPrice: simPrice,
        simulatedCostPrice: simCost,
        simulatedVolumeBoost: simVolumeBoost
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  const filteredAnalyses = data?.productAnalyses.filter((p) => {
    if (filterClass === 'all') return true;
    return p.classification === filterClass;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f131a] border-l border-white/10 w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#141923] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Product Profitability & Benefit Intelligence</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Pooja Store Revenue Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Identify which products generate the highest gross profit, evaluate cost-of-goods (COGS), and simulate pricing scenarios.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalytics}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="close-profit-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        {loading || !data ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm">Calculating store unit economics & profit matrix...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#151a24] p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
                <p className="text-xl font-black text-white mt-1">
                  ${data.totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">{data.totalUnitsSold} total units sold</span>
              </div>

              <div className="bg-[#151a24] p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cost of Goods (COGS)</span>
                <p className="text-xl font-black text-slate-300 mt-1">
                  ${data.totalCostOfGoods.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500">Supplier inventory cost</span>
              </div>

              <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Net Gross Profit</span>
                <p className="text-xl font-black text-emerald-400 mt-1">
                  +${data.netGrossProfit.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400/80 font-medium">Store profit retained</span>
              </div>

              <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Avg Gross Margin</span>
                <p className="text-xl font-black text-indigo-300 mt-1">
                  {data.averageMarginPercent}%
                </p>
                <span className="text-[10px] text-indigo-400/80 font-medium">Blended margin health</span>
              </div>
            </div>

            {/* Top Benefiting vs Least Benefiting Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* TOP PERFORMER */}
              {data.topBenefitingProduct && (
                <div 
                  onClick={() => handleSelectProductForSim(data.topBenefitingProduct!)}
                  className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 relative cursor-pointer hover:border-emerald-500/70 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <Award className="w-4 h-4" /> #1 Top Benefiting Product
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Benefit Score: {data.topBenefitingProduct.benefitScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <img 
                      src={data.topBenefitingProduct.thumbnail} 
                      alt={data.topBenefitingProduct.title}
                      className="w-14 h-14 rounded-lg object-cover bg-black/40 border border-emerald-500/30 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm truncate">{data.topBenefitingProduct.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                        <span>Price: <b className="text-white">${data.topBenefitingProduct.price}</b></span>
                        <span>COGS: <b className="text-slate-400">${data.topBenefitingProduct.costPrice}</b></span>
                        <span>Margin: <b className="text-emerald-400">{data.topBenefitingProduct.grossMarginPercent}%</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Profit Generated:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">+${data.topBenefitingProduct.grossProfit.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 mt-1 italic">
                    💡 {data.topBenefitingProduct.recommendation}
                  </p>
                </div>
              )}

              {/* LEAST BENEFITING */}
              {data.leastBenefitingProduct && (
                <div 
                  onClick={() => handleSelectProductForSim(data.leastBenefitingProduct!)}
                  className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 relative cursor-pointer hover:border-amber-500/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" /> Optimization Opportunity (Lowest Drag)
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      Benefit Score: {data.leastBenefitingProduct.benefitScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <img 
                      src={data.leastBenefitingProduct.thumbnail} 
                      alt={data.leastBenefitingProduct.title}
                      className="w-14 h-14 rounded-lg object-cover bg-black/40 border border-amber-500/20 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm truncate">{data.leastBenefitingProduct.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                        <span>Price: <b className="text-white">${data.leastBenefitingProduct.price}</b></span>
                        <span>COGS: <b className="text-slate-400">${data.leastBenefitingProduct.costPrice}</b></span>
                        <span>Margin: <b className="text-amber-400">{data.leastBenefitingProduct.grossMarginPercent}%</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Profit Generated:</span>
                    <span className="text-amber-300 font-extrabold text-sm">+${data.leastBenefitingProduct.grossProfit.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 mt-1 italic">
                    ⚠️ {data.leastBenefitingProduct.recommendation}
                  </p>
                </div>
              )}

            </div>

            {/* Price & Margin "What-If" Simulator */}
            {selectedAnalysis && (
              <div className="bg-[#161b26] p-5 rounded-xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      Price & Profit Simulation: <span className="text-indigo-300">{selectedAnalysis.title}</span>
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Current Profit: <b className="text-emerald-400">${selectedAnalysis.grossProfit}</b> ({selectedAnalysis.grossMarginPercent}% margin)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Retail Price ($)</label>
                    <input 
                      type="number" 
                      value={simPrice}
                      onChange={(e) => setSimPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Supplier Cost ($)</label>
                    <input 
                      type="number" 
                      value={simCost}
                      onChange={(e) => setSimCost(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Sales Volume Delta (%)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="-50" 
                        max="100" 
                        value={simVolumeBoost}
                        onChange={(e) => setSimVolumeBoost(Number(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <span className="text-xs font-bold text-indigo-300 w-12 text-right">
                        {simVolumeBoost >= 0 ? `+${simVolumeBoost}%` : `${simVolumeBoost}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={simulating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{simulating ? 'Calculating Projections...' : 'Simulate Projected Profit Impact'}</span>
                  </button>

                  {simResult && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">Projected Margin: <b className="text-indigo-300">{simResult.projected.margin}%</b></span>
                      <span className="text-slate-400">New Profit: <b className="text-emerald-400">${simResult.projected.profit}</b></span>
                      <span className={`font-extrabold ${simResult.projected.profitDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simResult.projected.profitDelta >= 0 ? `+${simResult.projected.percentGain}% Net Gain` : `${simResult.projected.percentGain}% Drop`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filter Tabs for Matrix */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification:</span>
                <div className="flex items-center gap-1.5 bg-[#151a24] p-1 rounded-lg border border-white/5 text-xs">
                  <button
                    onClick={() => setFilterClass('all')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterClass === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    All ({data.productAnalyses.length})
                  </button>
                  <button
                    onClick={() => setFilterClass('star_performer')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterClass === 'star_performer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⭐ Stars
                  </button>
                  <button
                    onClick={() => setFilterClass('cash_cow')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterClass === 'cash_cow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    💰 Cash Cows
                  </button>
                  <button
                    onClick={() => setFilterClass('high_margin_gem')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterClass === 'high_margin_gem' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    💎 Margin Gems
                  </button>
                  <button
                    onClick={() => setFilterClass('low_margin_drag')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${filterClass === 'low_margin_drag' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    ⚠️ Low Margin
                  </button>
                </div>
              </div>
            </div>

            {/* Product Matrix Table / Card View */}
            <div className="space-y-3">
              {filteredAnalyses.map((item, idx) => {
                const isSelected = selectedAnalysis?.productId === item.productId;

                return (
                  <div
                    key={item.productId}
                    onClick={() => handleSelectProductForSim(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isSelected 
                        ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg' 
                        : 'bg-[#151a24] border-white/5 hover:bg-[#1b212e] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.classification === 'star_performer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            item.classification === 'cash_cow' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            item.classification === 'high_margin_gem' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {item.classification.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {item.brand} • {item.subcategory || item.category}
                        </p>
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="flex items-center gap-6 text-xs shrink-0">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Price / COGS</span>
                        <span className="font-semibold text-white">${item.price} / <b className="text-slate-400">${item.costPrice}</b></span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Units Sold</span>
                        <span className="font-bold text-indigo-300">{item.unitsSold} units</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Gross Margin</span>
                        <span className={`font-extrabold ${item.grossMarginPercent >= 45 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.grossMarginPercent}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Profit</span>
                        <span className="font-extrabold text-sm text-emerald-400">
                          +${item.grossProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Breakdown */}
            <div className="bg-[#151a24] p-5 rounded-xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>Category Profitability & Margin Contribution</span>
              </h3>
              <div className="space-y-3">
                {data.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{cat.categoryName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Rev: ${cat.revenue.toLocaleString()}</span>
                        <span className="font-bold text-emerald-400">Profit: +${cat.profit.toLocaleString()}</span>
                        <span className="text-indigo-300 font-bold">({cat.marginPercent}% margin)</span>
                      </div>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(10, (cat.profit / data.netGrossProfit) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
