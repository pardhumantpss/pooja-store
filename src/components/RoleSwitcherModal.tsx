import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Package, 
  User, 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  BarChart3, 
  Boxes, 
  ShoppingBag,
  ArrowRight,
  Plus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSwitchRole: (role: UserRole, customUser?: Partial<UserProfile>) => Promise<void>;
  demoUsers?: UserProfile[];
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchRole,
  demoUsers = []
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('customer');
  const [customDepartment, setCustomDepartment] = useState('');
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleDefinitions: {
    role: UserRole;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    badge: string;
    capabilities: string[];
  }[] = [
    {
      role: 'admin',
      title: 'Store Owner & Executive Admin',
      description: 'Unrestricted enterprise control: financials, product profitability analysis, inventory, system malfunction triggers, and gateway failovers.',
      icon: Crown,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      badge: 'Full Access',
      capabilities: ['View Gross Profit & Margin Matrix', 'Real-time System Malfunction Trigger & Recovery', 'Inventory Restock & Catalog Controls', 'Live Transaction Monitoring']
    },
    {
      role: 'analyst',
      title: 'Financial & Revenue Analyst',
      description: 'Deep profit intelligence: analyze which products benefit the store most, simulate price/cost adjustments, and monitor margins.',
      icon: BarChart3,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
      badge: 'Analytics Specialist',
      capabilities: ['Analyze Top & Least Benefiting Products', 'What-If Price & Cost Margin Simulator', 'Category Revenue Contribution Breakdown', 'COGS vs Gross Profit Trends']
    },
    {
      role: 'inventory_manager',
      title: 'Supply Chain & Inventory Officer',
      description: 'Warehouse logistics: live stock monitoring, SKU thresholds, automated purchase events, and restock batches.',
      icon: Boxes,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30 hover:border-indigo-500/60',
      badge: 'Warehouse Lead',
      capabilities: ['Real-time Stock Delta Adjustments', 'Low Stock & Threshold Alerts', 'Variant-level Stock Balancing', 'Warehouse Fulfillment Logs']
    },
    {
      role: 'customer',
      title: 'Verified VIP Shopper',
      description: 'End-user retail experience: browse live catalog, encrypted payment gateway checkout, order tracking, and delivery notifications.',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      badge: 'Shopper View',
      capabilities: ['Encrypted 3D-Secure Payment Checkout', 'Live Barcode Order Tracking & Manifests', 'AI Shopping Concierge Queries', 'Customer Notifications']
    }
  ];

  const handleSelectRole = async (role: UserRole) => {
    try {
      setLoadingRole(role);
      await onSwitchRole(role);
      onClose();
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCreateCustomUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    try {
      setLoadingRole('custom');
      await onSwitchRole(customRole, {
        name: customName,
        email: customEmail,
        role: customRole,
        department: customDepartment || (customRole === 'admin' ? 'Executive' : customRole === 'analyst' ? 'Finance' : customRole === 'inventory_manager' ? 'Supply Chain' : 'Retail Member'),
        badge: customRole === 'admin' ? 'Custom Admin' : customRole === 'analyst' ? 'Custom Analyst' : customRole === 'inventory_manager' ? 'Custom Officer' : 'Custom Shopper'
      });
      setIsCustomMode(false);
      onClose();
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#161b26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Dynamic Role-Based Access</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Pooja Store RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Switch perspective dynamically to experience tailored permissions, financial analytics, and operational tools.
              </p>
            </div>
          </div>
          <button
            id="close-role-switcher-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Status */}
        {currentUser && (
          <div className="px-6 py-3 bg-[#0d1017] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-white/20 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentUser.name}</span>
                  <span className="text-slate-400">({currentUser.email})</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentUser.department || 'Active User'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Current Role:</span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!isCustomMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleDefinitions.map((def) => {
                const IconComponent = def.icon;
                const isCurrent = currentUser?.role === def.role;
                const isLoading = loadingRole === def.role;

                return (
                  <div
                    key={def.role}
                    id={`role-card-${def.role}`}
                    onClick={() => handleSelectRole(def.role)}
                    className={`relative p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isCurrent 
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-950/50' 
                        : `bg-[#161b24] ${def.borderColor} hover:bg-[#1c222e]`
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${def.bgColor} border border-white/10 flex items-center justify-center ${def.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                              {def.title}
                            </h3>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {def.badge}
                            </span>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                        {def.description}
                      </p>

                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Key Capabilities:
                        </span>
                        {def.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 shrink-0"></div>
                            <span className="truncate">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      id={`switch-to-${def.role}-btn`}
                      disabled={isLoading}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/10 hover:bg-indigo-600 text-white hover:shadow-md'
                      }`}
                    >
                      {isLoading ? (
                        <span>Switching Session...</span>
                      ) : isCurrent ? (
                        <span>Currently Active</span>
                      ) : (
                        <>
                          <span>Switch to {def.badge}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateCustomUser} className="space-y-4 bg-[#161b24] p-6 rounded-xl border border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create & Login Custom Staff / Member</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Pooja Sharma"
                    className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. pooja@poojastore.com"
                    className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Role</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                  >
                    <option value="admin">Store Owner / Admin (Full Access)</option>
                    <option value="analyst">Financial Analyst (Profit & Revenue)</option>
                    <option value="inventory_manager">Inventory Manager (Stock & Supply)</option>
                    <option value="customer">VIP Customer (Shopping & Orders)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Title</label>
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="e.g. Strategic Operations"
                    className="w-full px-3 py-2 bg-[#0e121a] text-white rounded-lg border border-white/10 text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingRole === 'custom'}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {loadingRole === 'custom' ? 'Creating...' : 'Create & Switch Role'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#161b26] border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isCustomMode ? '← Back to Preset Roles' : '+ Create Custom Profile'}
          </button>
          <span className="text-slate-500">
            Pooja Store v2.4 • Dynamic Role-Based Session
          </span>
        </div>

      </div>
    </div>
  );
};
