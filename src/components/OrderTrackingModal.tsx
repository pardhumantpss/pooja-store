import React, { useState } from 'react';
import { 
  X, 
  Search, 
  PackageCheck, 
  Truck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Package
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  if (!isOpen) return null;

  const [lookupQuery, setLookupQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [searched, setSearched] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return;

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress.email.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q)
    );

    setSelectedOrder(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative bg-[#0d0d11] text-slate-300 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#161b22]/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Track Shipment & Order Status</h2>
              <p className="text-xs text-slate-500">Live multi-carrier logistics tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lookup Form */}
        <div className="p-5 border-b border-white/5 bg-[#161b22]/40">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Enter Order # (e.g. AUR-9821-9382) or Email"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Lookup
            </button>
          </form>

          {/* Quick Select from existing orders */}
          {orders.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold shrink-0">Recent:</span>
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrder(o);
                    setLookupQuery(o.orderNumber);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition font-mono shrink-0 cursor-pointer ${
                    selectedOrder?.id === o.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {o.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {selectedOrder ? (
            <>
              {/* Top Banner Status */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Shipment Status
                  </span>
                  <h3 className="text-lg font-bold text-white capitalize">
                    {selectedOrder.status === 'processing'
                      ? 'Warehouse Packing & Inspection'
                      : selectedOrder.status === 'confirmed'
                      ? 'Order Verified & Authorized'
                      : 'In Transit with Courier'}
                  </h3>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    Estimated Delivery: <strong>{selectedOrder.estimatedDelivery}</strong>
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-indigo-500/20 sm:pl-4">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Tracking Number</span>
                  <span className="font-mono text-xs font-bold text-white">{selectedOrder.trackingNumber}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">{selectedOrder.trackingCarrier}</span>
                </div>
              </div>

              {/* Visual Logistics Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Logistics Progression</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {selectedOrder.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 bg-[#0d0d11] flex items-center justify-center ${
                        event.completed
                          ? 'border-indigo-500 text-indigo-400'
                          : 'border-slate-700 text-slate-700'
                      }`}>
                        {event.completed && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${event.completed ? 'text-white' : 'text-slate-500'}`}>
                          {event.label}
                        </span>
                        <span className="text-[10px] text-slate-500">{event.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Address & Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Destination Address</span>
                  </div>
                  <p className="text-slate-200 font-semibold">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-slate-400">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-slate-400">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-slate-400">{selectedOrder.shippingAddress.country}</p>
                </div>

                <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payment Verification</span>
                  </div>
                  <p className="text-slate-400">
                    Method: <strong className="text-slate-200 capitalize">{selectedOrder.paymentDetails.brand || 'Card'} ending in ••{selectedOrder.paymentDetails.lastFour}</strong>
                  </p>
                  <p className="text-slate-400">
                    Tx ID: <span className="font-mono text-[10px] text-slate-300">{selectedOrder.paymentDetails.transactionId}</span>
                  </p>
                  <p className="text-slate-400">
                    Total: <strong className="text-white font-mono">${selectedOrder.total.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              {/* Items in shipment */}
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Packages in this order</h4>
                <div className="border border-white/5 rounded-xl divide-y divide-white/5 bg-[#161b22] overflow-hidden">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={it.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-[#1c2128]" />
                        <div>
                          <span className="font-bold text-white block">{it.title}</span>
                          <span className="text-[10px] text-slate-500">Qty: {it.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-white font-mono">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">No Order Found</h4>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Please verify your order number or email. You can also click one of the recent order pills above.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
