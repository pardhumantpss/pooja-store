import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Truck, 
  AlertTriangle, 
  Check,
  Lock
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  promoCode: string;
  onApplyPromoCode: (code: string) => boolean;
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  promoCode,
  onApplyPromoCode,
  discountAmount,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState(promoCode);
  const [codeMessage, setCodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const finalShipping = promoCode === 'FREESHIP' || subtotal >= freeShippingThreshold ? 0 : 9.99;
  const estimatedTax = Number((Math.max(0, subtotal - discountAmount) * 0.0825).toFixed(2));
  const estimatedTotal = Number((Math.max(0, subtotal - discountAmount) + finalShipping + estimatedTax).toFixed(2));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const success = onApplyPromoCode(inputCode.trim());
    if (success) {
      setCodeMessage({ type: 'success', text: `Promo code "${inputCode.toUpperCase()}" applied!` });
    } else {
      setCodeMessage({ type: 'error', text: 'Invalid code. Try "WELCOME10", "SAVE20", or "FREESHIP".' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-[#0d0d11] text-slate-300 h-full shadow-2xl flex flex-col z-10 border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#161b22]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Your Cart</h2>
              <p className="text-xs text-slate-500">{items.length} unique item(s) selected</p>
            </div>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Tracker */}
        <div className="px-5 py-3 bg-[#161b22]/40 border-b border-white/5">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-400 font-bold">You unlocked Free Express Shipping!</span>
              ) : (
                <span>Add <strong className="text-white">${amountToFreeShipping.toFixed(2)}</strong> for Free Delivery</span>
              )}
            </span>
            <span className="text-indigo-400 text-[11px] font-bold">{Math.round(shippingProgress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                shippingProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Discover audiophile tech, minimalist carry, and gourmet essentials with live stock availability.
                </p>
              </div>
              <button
                id="cart-empty-explore-btn"
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
              >
                Explore Curated Collection
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isAtMaxStock = item.quantity >= item.currentAvailableStock;
              const isStockCritical = item.currentAvailableStock <= 3;

              return (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#161b22] border border-white/5 flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-18 h-18 rounded-xl object-cover bg-[#1c2128] border border-white/5 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-white truncate">
                          {item.title}
                        </h4>
                        <button
                          id={`remove-cart-item-${item.id}`}
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedColor && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.selectedColorHex || '#475569' }}
                          />
                          <span>{item.selectedColor}</span>
                          {item.selectedSize && <span>• {item.selectedSize}</span>}
                        </div>
                      )}

                      {/* Real-time stock status badge in cart */}
                      <div className="mt-1">
                        {isStockCritical ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Only {item.currentAvailableStock} left in stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            ✓ {item.currentAvailableStock} available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="font-bold text-sm text-white font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-[#0d0d11]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-400 hover:bg-white/5 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isAtMaxStock}
                          className="px-2 py-0.5 text-slate-400 hover:bg-white/5 disabled:opacity-30 font-bold text-xs cursor-pointer"
                          title={isAtMaxStock ? 'Max stock reached' : 'Add one more'}
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout & Financial Breakdown */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/5 bg-[#161b22]/70 space-y-4">
            
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Promo Code (e.g. WELCOME10)"
                    className="w-full pl-8 pr-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-semibold text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
                <button
                  id="apply-promo-btn"
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {codeMessage && (
                <p className={`text-[11px] font-semibold ${
                  codeMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {codeMessage.text}
                </p>
              )}
            </form>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white font-mono">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                  <span>Discount ({promoCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{finalShipping === 0 ? <strong className="text-emerald-400">FREE</strong> : <span className="font-mono">${finalShipping.toFixed(2)}</span>}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8.25%)</span>
                <span className="font-semibold text-white font-mono">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 font-mono">
                <span>Estimated Total</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Payment Gateway</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
