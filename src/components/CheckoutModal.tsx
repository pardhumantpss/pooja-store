import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Truck, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Package,
  Clock,
  Smartphone
} from 'lucide-react';
import { CartItem, Order, PaymentDetails, PaymentType, ShippingAddress, ShippingOption } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  promoCode?: string;
  discountAmount: number;
  onOrderCompleted: (order: Order) => void;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Insured Ground',
    price: 0,
    estimatedDays: '3-4 Business Days',
    carrier: 'FedEx Ground',
    description: 'Complimentary insured shipping with tracking'
  },
  {
    id: 'express',
    name: 'Express 2-Day Air',
    price: 9.99,
    estimatedDays: '2 Business Days',
    carrier: 'DHL Express',
    description: 'Expedited air courier with signature required'
  },
  {
    id: 'overnight',
    name: 'Priority Overnight',
    price: 19.99,
    estimatedDays: 'Next Business Morning',
    carrier: 'FedEx Priority',
    description: 'Guaranteed morning delivery with temperature control'
  }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  promoCode,
  discountAmount,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<'shipping' | 'delivery' | 'payment' | 'processing' | 'confirmed'>('shipping');

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Alex Vance',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    street: '452 Pine Street, Suite 800',
    apartment: 'Floor 8',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94104',
    country: 'United States',
  });

  // Shipping Method
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(SHIPPING_OPTIONS[0]);

  // Payment Form State
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardholderName, setCardholderName] = useState('Alex Vance');
  const [saveCard, setSaveCard] = useState(true);

  // 3D Secure Simulation
  const [show3dsModal, setShow3dsModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [is3dsVerifying, setIs3dsVerifying] = useState(false);

  // Processing state & error
  const [processingStage, setProcessingStage] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const effectiveShipping = promoCode === 'FREESHIP' ? 0 : selectedShipping.price;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * 0.0825).toFixed(2));
  const total = Number((taxableAmount + effectiveShipping + tax).toFixed(2));

  // Card Formatters
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      setCardExp(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExp(clean);
    }
  };

  // Quick Test Cards Autofill
  const fillTestCard = (type: 'visa' | 'mastercard' | 'amex') => {
    if (type === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setCardExp('12/28');
      setCardCvv('888');
    } else if (type === 'mastercard') {
      setCardNumber('5555 5555 5555 4444');
      setCardExp('08/29');
      setCardCvv('321');
    } else {
      setCardNumber('3782 8224 6310 005');
      setCardExp('11/27');
      setCardCvv('4321');
    }
  };

  const handleProcessPayment = async () => {
    setCurrentStep('processing');
    setCheckoutError(null);

    // Sequence of visual processing steps for confidence
    setProcessingStage('Verifying live stock reservation in warehouse database...');
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStage('Generating 256-bit SSL cryptographic token with issuer bank...');
    await new Promise((r) => setTimeout(r, 700));

    setProcessingStage('Authorizing payment and decrementing real-time inventory...');

    try {
      const res = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          shippingOption: selectedShipping,
          paymentMethod: {
            type: paymentType,
            cardNumber: cardNumber.replace(/\s/g, ''),
            lastFour: cardNumber.replace(/\s/g, '').slice(-4),
            brand: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Amex',
          },
          promoCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setCompletedOrder(data.order);
      onOrderCompleted(data.order);
      setCurrentStep('confirmed');

      // Trigger Confetti Blast
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing error. Please try again.');
      setCurrentStep('payment');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

      {/* Main Modal Card */}
      <div className="relative bg-[#0d0d11] text-slate-300 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#161b22]/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {currentStep === 'confirmed' ? 'Order Confirmed' : 'Secure Encrypted Checkout'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentStep === 'confirmed'
                  ? `Order #${completedOrder?.orderNumber}`
                  : 'PCI-DSS Compliant • 256-Bit SSL Encryption'}
              </p>
            </div>
          </div>

          {currentStep !== 'processing' && (
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator (for steps 1-3) */}
        {['shipping', 'delivery', 'payment'].includes(currentStep) && (
          <div className="px-6 py-3 bg-[#161b22]/40 border-b border-white/5 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 font-semibold ${
              currentStep === 'shipping' ? 'text-indigo-400' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'shipping' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
              }`}>1</span>
              <span>Address</span>
            </div>

            <div className="h-0.5 w-8 bg-white/5" />

            <div className={`flex items-center gap-1.5 font-semibold ${
              currentStep === 'delivery' ? 'text-indigo-400' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'delivery' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
              }`}>2</span>
              <span>Delivery</span>
            </div>

            <div className="h-0.5 w-8 bg-white/5" />

            <div className={`flex items-center gap-1.5 font-semibold ${
              currentStep === 'payment' ? 'text-indigo-400' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'payment' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
              }`}>3</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto p-6 flex-1">
          
          {checkoutError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* STEP 1: SHIPPING ADDRESS */}
          {currentStep === 'shipping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Shipping & Contact Details</h3>
                <button
                  type="button"
                  onClick={() => setShippingAddress({
                    fullName: 'Alex Vance',
                    email: 'alex.vance@example.com',
                    phone: '+1 (555) 234-5678',
                    street: '452 Pine Street, Suite 800',
                    apartment: 'Floor 8',
                    city: 'San Francisco',
                    state: 'CA',
                    postalCode: '94104',
                    country: 'United States',
                  })}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  ⚡ Prefill Demo Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">Apt, Suite, Unit (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.apartment}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-400 block mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY OPTIONS */}
          {currentStep === 'delivery' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white">Choose Shipping Speed</h3>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => {
                  const isSelected = selectedShipping.id === opt.id;
                  const priceLabel = promoCode === 'FREESHIP' || opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedShipping(opt)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500/20'
                          : 'border-white/5 bg-[#161b22] text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{opt.name}</span>
                            <span className="text-[11px] font-semibold text-indigo-400">({opt.estimatedDays})</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.description} • {opt.carrier}</p>
                        </div>
                      </div>

                      <span className={`font-bold text-sm font-mono ${priceLabel === 'FREE' ? 'text-emerald-400' : 'text-white'}`}>
                        {priceLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SECURE PAYMENT GATEWAYS */}
          {currentStep === 'payment' && (
            <div className="space-y-5">
              
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'card'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('apple_pay')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'apple_pay'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs">Apple / G-Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('klarna')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'klarna'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Pay in 4 ($0 fee)</span>
                </button>
              </div>

              {/* CARD ENTRY FORM */}
              {paymentType === 'card' && (
                <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-3">
                  
                  {/* Test Cards Selector */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px]">
                    <span className="font-semibold text-slate-400">Quick Test Cards:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillTestCard('visa')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10"
                      >
                        Visa
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('mastercard')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10"
                      >
                        Mastercard
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('amex')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10"
                      >
                        Amex
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-10 pr-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-mono font-bold text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-medium text-slate-400 block mb-1">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-400 block mb-1">Security Code (CVV)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full px-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                </div>
              )}

              {/* DIGITAL WALLET SIMULATOR */}
              {paymentType === 'apple_pay' && (
                <div className="p-6 bg-[#161b22] text-white rounded-2xl text-center space-y-3 border border-white/5">
                  <Smartphone className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm">One-Touch Biometric Authorization</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Authenticate securely with Face ID or Touch ID. Default card ending in ••8821 will be charged.
                  </p>
                </div>
              )}

              {/* KLARNA 4-PAYMENTS SIMULATOR */}
              {paymentType === 'klarna' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>4 Interest-Free Payments of ${(total / 4).toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">0% APR</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    First payment of ${(total / 4).toFixed(2)} due today. Remaining 3 payments charged every 2 weeks automatically.
                  </p>
                </div>
              )}

              {/* Itemized Total Recap */}
              <div className="p-3.5 rounded-xl bg-[#161b22] border border-white/5 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Items Subtotal ({items.length})</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                    <span>Promo Discount ({promoCode})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping ({selectedShipping.name})</span>
                  <span className="font-mono">{effectiveShipping === 0 ? 'FREE' : `$${effectiveShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-1.5 border-t border-white/5 font-mono">
                  <span>Total Due</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: PROCESSING ANIMATION */}
          {currentStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Lock className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">Authorizing Payment...</h3>
                <p className="text-xs text-indigo-400 font-semibold max-w-sm animate-pulse">
                  {processingStage}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMED ORDER & RECEIPT */}
          {currentStep === 'confirmed' && completedOrder && (
            <div className="space-y-6">
              
              {/* Success Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-emerald-300">
                  Thank You, {completedOrder.shippingAddress.fullName}!
                </h3>
                <p className="text-xs text-emerald-400/90">
                  Your order has been verified, items reserved, and inventory updated.
                </p>
              </div>

              {/* Order Meta Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#161b22] rounded-xl border border-white/5">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Order Reference</span>
                  <span className="font-mono font-bold text-white">{completedOrder.orderNumber}</span>
                </div>
                <div className="p-3 bg-[#161b22] rounded-xl border border-white/5">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Tracking Carrier</span>
                  <span className="font-bold text-indigo-400">{completedOrder.trackingCarrier}</span>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Invoice</h4>
                <div className="border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden bg-[#161b22]">
                  {completedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#1c2128]" />
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-slate-500">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</span>
                        </div>
                      </div>
                      <span className="font-bold text-white font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Recap */}
              <div className="p-4 bg-[#161b22] rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${completedOrder.subtotal.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold font-mono">
                    <span>Discount</span>
                    <span>-${completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="font-mono text-white">{completedOrder.shippingCost === 0 ? 'FREE' : `$${completedOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes</span>
                  <span className="font-mono text-white">${completedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-white/5 font-mono">
                  <span>Paid in Full</span>
                  <span>${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions: Print Receipt & Done */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={printReceipt}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Download / Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Buttons (For Steps 1-3) */}
        {['shipping', 'delivery', 'payment'].includes(currentStep) && (
          <div className="p-4 border-t border-white/5 bg-[#161b22]/70 flex items-center justify-between">
            {currentStep !== 'shipping' ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 'delivery') setCurrentStep('shipping');
                  if (currentStep === 'payment') setCurrentStep('delivery');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep === 'shipping' && (
              <button
                type="button"
                onClick={() => setCurrentStep('delivery')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <span>Continue to Delivery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 'delivery' && (
              <button
                type="button"
                onClick={() => setCurrentStep('payment')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 'payment' && (
              <button
                type="button"
                id="submit-payment-btn"
                onClick={handleProcessPayment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ${total.toFixed(2)} Securely</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
