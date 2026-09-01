import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Boxes, 
  Zap, 
  ShieldAlert, 
  RefreshCw, 
  Activity, 
  Server, 
  Radio, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SystemNotification, UserProfile } from '../types';
import { api } from '../lib/api';

interface SystemNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectOrder?: (orderId: string) => void;
}

export const SystemNotificationsDrawer: React.FC<SystemNotificationsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectOrder
}) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [simulatingMalfunction, setSimulatingMalfunction] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const list = await api.getNotifications(currentUser?.role);
      const health = await api.getSystemHealth();
      setNotifications(list);
      setSystemHealth(health);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, currentUser]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerMalfunction = async (type: string) => {
    try {
      setSimulatingMalfunction(true);
      await api.triggerMalfunction({ type, severity: 'critical' });
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingMalfunction(false);
    }
  };

  const handleResolveMalfunction = async (id: string) => {
    try {
      await api.resolveMalfunction(id);
      await fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (selectedFilter === 'all') return true;
    return n.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f131a] border-l border-white/10 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#141923] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Live Transactions & Malfunction Monitor</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Audited real-time log for transactions, supply triggers, and automated gateway failover incidents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 transition-colors cursor-pointer"
            >
              Mark Read
            </button>
            <button
              id="close-notifications-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* System Gateway Health Status Card */}
        {systemHealth && (
          <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
            systemHealth.status === 'healthy' 
              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemHealth.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemHealth.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
              </span>
              <span className="font-bold">
                {systemHealth.status === 'healthy' ? 'All Payment Gateways & Store Services Healthy' : 'Incident Active: Secondary Gateway Failover Activated'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-300 font-medium">
              <span>Latency: <b className="text-white">{systemHealth.gatewayLatencyMs}ms</b></span>
              <span>Uptime: <b className="text-emerald-400">{systemHealth.uptimePercent}%</b></span>
            </div>
          </div>
        )}

        {/* Admin Diagnostic Malfunction Simulator Drill */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'analyst') && (
          <div className="px-6 py-3 bg-[#131722] border-b border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Admin Incident Simulation Drills (Test Malfunction Alerts)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={simulatingMalfunction}
                onClick={() => handleTriggerMalfunction('payment_gateway_timeout')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Trigger Gateway 504 Timeout
              </button>
              <button
                disabled={simulatingMalfunction}
                onClick={() => handleTriggerMalfunction('inventory_desync')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
              >
                ⚠️ Trigger Inventory Desync
              </button>
              <button
                disabled={simulatingMalfunction}
                onClick={() => handleTriggerMalfunction('webhook_failure')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
              >
                📦 Trigger Courier Webhook Drop
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="px-6 py-2.5 bg-[#0d1017] border-b border-white/5 flex items-center gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            All Logs ({notifications.length})
          </button>
          <button
            onClick={() => setSelectedFilter('transaction')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === 'transaction' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            💳 Transactions
          </button>
          <button
            onClick={() => setSelectedFilter('malfunction')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === 'malfunction' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            🚨 Malfunctions
          </button>
          <button
            onClick={() => setSelectedFilter('stock_alert')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === 'stock_alert' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            📦 Stock Alerts
          </button>
          <button
            onClick={() => setSelectedFilter('financial')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedFilter === 'financial' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            📊 Profit Milestones
          </button>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 text-slate-500 text-sm">
              No notifications matching this category.
            </div>
          ) : (
            filtered.map((n) => {
              const isMalfunction = n.type === 'malfunction';
              const isTransaction = n.type === 'transaction';
              const isStock = n.type === 'stock_alert';
              const isFinancial = n.type === 'financial';

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    !n.read 
                      ? isMalfunction 
                        ? 'bg-rose-950/30 border-rose-500/50 shadow-md' 
                        : 'bg-indigo-950/30 border-indigo-500/40 shadow-sm'
                      : 'bg-[#151a24] border-white/5 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isMalfunction ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        isTransaction ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        isStock ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {isMalfunction ? <AlertTriangle className="w-4 h-4" /> :
                         isTransaction ? <DollarSign className="w-4 h-4" /> :
                         isStock ? <Boxes className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        {/* Metadata Details */}
                        {n.metadata && (
                          <div className="mt-2.5 p-2 bg-black/30 rounded-lg border border-white/5 text-[11px] text-slate-400 space-y-1">
                            {n.metadata.orderNumber && (
                              <div className="flex items-center justify-between">
                                <span>Order Number:</span>
                                <b className="text-indigo-300">{n.metadata.orderNumber}</b>
                              </div>
                            )}
                            {n.metadata.amount && (
                              <div className="flex items-center justify-between">
                                <span>Authorized Total:</span>
                                <b className="text-emerald-400">${n.metadata.amount}</b>
                              </div>
                            )}
                            {n.metadata.errorCode && (
                              <div className="flex items-center justify-between text-rose-300">
                                <span>Diagnostic Code:</span>
                                <b className="font-mono">{n.metadata.errorCode}</b>
                              </div>
                            )}
                            {n.metadata.recoveryAction && (
                              <div className="text-emerald-300/90 text-[10px]">
                                🛡️ Auto-Recovery: {n.metadata.recoveryAction}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                          <span>{n.timestamp}</span>
                          <span>•</span>
                          <span className="capitalize">Target: {n.targetRole}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button if unresolved malfunction */}
                    {isMalfunction && !n.isResolved && currentUser?.role === 'admin' && (
                      <button
                        onClick={() => handleResolveMalfunction(n.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141923] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Live WebSocket / Poll Dispatch Active
          </span>
          <span className="text-slate-500">
            Pooja Store Telemetry v2.4
          </span>
        </div>

      </div>
    </div>
  );
};
