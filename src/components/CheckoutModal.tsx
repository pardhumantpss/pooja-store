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
  Package, 
  Clock, 
  Smartphone, 
  QrCode, 
  Building, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  DollarSign, 
  RefreshCw,
  Copy,
  Receipt
} from 'lucide-react';
import { CartItem, Order, PaymentDetails, PaymentType, ShippingAddress, ShippingOption } from '../types';
import { soundFx } from '../lib/soundFx';
import { api } from '../lib/api';

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
    estimatedDays: '2-3 Business Days',
    carrier: 'BlueDart / FedEx Ground',
    description: 'Complimentary insured shipping with live manifest tracking'
  },
  {
    id: 'express',
    name: 'Express Air Courier',
    price: 9.99,
    estimatedDays: '1-2 Business Days',
    carrier: 'DHL / BlueDart Express',
    description: 'Priority courier with signature delivery requirement'
  },
  {
    id: 'overnight',
    name: 'Priority Same-Day Dispatch',
    price: 19.99,
    estimatedDays: 'Next Morning',
    carrier: 'Pooja Direct Express',
    description: 'Immediate climate-controlled priority courier handoff'
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

  const [currentStep, setCurrentStep] = useState<'shipping' | 'delivery' | 'payment' | '3ds_auth' | 'upi_pending' | 'processing' | 'confirmed'>('shipping');

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Riya Sen',
    email: 'riya.sen@example.com',
    phone: '+91 98765 12340',
    street: '42 MG Road, Indiranagar',
    apartment: 'Floor 3, Apt 302',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
  });

  // Shipping Method
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(SHIPPING_OPTIONS[0]);

  // Payment Form State
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardholderName, setCardholderName] = useState('Riya Sen');
  const [upiId, setUpiId] = useState('riyasen@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [testMalfunctionMode, setTestMalfunctionMode] = useState(false);

  // 3D Secure / OTP Simulation
  const [otpCode, setOtpCode] = useState('882910');
  const [otpCountdown, setOtpCountdown] = useState(120);

  // UPI Live Timer State (5 minutes)
  const [upiCountdown, setUpiCountdown] = useState(300);
  const [upiCopied, setUpiCopied] = useState(false);

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

  // Timer countdown for UPI QR
  useEffect(() => {
    let timer: any;
    if (currentStep === 'upi_pending' && upiCountdown > 0) {
      timer = setInterval(() => {
        setUpiCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, upiCountdown]);

  // Timer countdown for 3DS OTP
  useEffect(() => {
    let timer: any;
    if (currentStep === '3ds_auth' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

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
  const fillTestCard = (type: 'visa' | 'mastercard' | 'amex' | 'rupay') => {
    soundFx.playClick();
    if (type === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setCardExp('12/28');
      setCardCvv('888');
    } else if (type === 'mastercard') {
      setCardNumber('5555 5555 5555 4444');
      setCardExp('08/29');
      setCardCvv('321');
    } else if (type === 'amex') {
      setCardNumber('3782 8224 6310 005');
      setCardExp('11/27');
      setCardCvv('4321');
    } else {
      setCardNumber('6080 1234 5678 9012');
      setCardExp('05/30');
      setCardCvv('999');
    }
  };

  const handleProceedToPaymentAuth = () => {
    soundFx.playClick();
    if (paymentType === 'card') {
      setCurrentStep('3ds_auth');
    } else if (paymentType === 'upi') {
      setCurrentStep('upi_pending');
      setUpiCountdown(300);
    } else {
      handleFinalizePayment();
    }
  };

  const handleFinalizePayment = async () => {
    soundFx.playClick();
    setCurrentStep('processing');
    setCheckoutError(null);

    // Sequence of visual processing steps for high-assurance feedback
    setProcessingStage('Validating inventory locks & warehouse SKU allocation...');
    await new Promise((r) => setTimeout(r, 450));

    if (testMalfunctionMode) {
      setProcessingStage('Simulating Payment Gateway Latency Spike & Failover...');
      await new Promise((r) => setTimeout(r, 650));
      setCheckoutError('Payment Gateway Primary Bank Node Timed Out (ERR_GATEWAY_504). Self-healing redundancy triggered. Please retry with fallback gateway.');
      setCurrentStep('payment');
      return;
    }

    setProcessingStage('Authorizing cryptographic payment capture with Gateway...');
    await new Promise((r) => setTimeout(r, 550));

    setProcessingStage('Finalizing order manifest & generating tracking barcode...');

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
            lastFour: paymentType === 'card' 
              ? cardNumber.replace(/\s/g, '').slice(-4) 
              : paymentType === 'upi' ? upiId.slice(0, 4) : '8821',
            brand: paymentType === 'card' 
              ? (cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : cardNumber.startsWith('6') ? 'RuPay' : 'Amex')
              : paymentType === 'upi' ? 'UPI Instant' : paymentType === 'netbanking' ? selectedBank : paymentType === 'cod' ? 'Cash on Delivery' : 'Digital Wallet',
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
      soundFx.playSuccess();

      // Trigger Confetti Blast
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing error. Please try again.');
      setCurrentStep('payment');
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('poojastore@okaxis');
    setUpiCopied(true);
    soundFx.playClick();
    setTimeout(() => setUpiCopied(false), 2000);
  };

  const printReceipt = () => {
    soundFx.playClick();
    window.print();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={() => { if (currentStep !== 'processing') onClose(); }}
      />

      {/* Main Modal Card */}
      <div className="relative bg-[#0d0d11] text-slate-300 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-[#161b22]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white font-serif">
                {currentStep === 'confirmed' ? 'Order Confirmed & Paid' : 'Pooja Store Real-Time Gateway'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> 256-bit TLS Encrypted
                </span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Live Node Active
                </span>
              </div>
            </div>
          </div>

          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {['shipping', 'delivery', 'payment'].includes(currentStep) && (
          <div className="px-6 py-3 bg-[#11141c] border-b border-white/5 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${currentStep === 'shipping' ? 'text-indigo-400 font-bold' : 'text-emerald-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'shipping' ? 'bg-indigo-600 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                1
              </div>
              <span>Address</span>
            </div>

            <div className="w-8 h-px bg-white/10" />

            <div className={`flex items-center gap-1.5 ${currentStep === 'delivery' ? 'text-indigo-400 font-bold' : currentStep === 'payment' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'delivery' ? 'bg-indigo-600 text-white' : currentStep === 'payment' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                2
              </div>
              <span>Shipping</span>
            </div>

            <div className="w-8 h-px bg-white/10" />

            <div className={`flex items-center gap-1.5 ${currentStep === 'payment' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'payment' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                3
              </div>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Global Checkout Error Banner */}
          {checkoutError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold text-rose-200">Payment Gateway Incident</p>
                <p className="text-rose-300/90 text-[11px] mt-0.5 leading-relaxed">{checkoutError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: SHIPPING ADDRESS */}
          {currentStep === 'shipping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shipping Destination</h3>
                <span className="text-[11px] text-indigo-400">All India & Worldwide Coverage</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Mobile Phone (For Delivery SMS)</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="e.g. 42 MG Road, Indiranagar"
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Apartment / Suite (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.apartment || ''}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                    placeholder="Floor 3, Apt 302"
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">State / Province</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY METHOD */}
          {currentStep === 'delivery' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Delivery Tier</h3>
              <div className="space-y-2.5">
                {SHIPPING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => { soundFx.playClick(); setSelectedShipping(opt); }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedShipping.id === opt.id
                        ? 'border-indigo-500 bg-indigo-600/10 ring-1 ring-indigo-500'
                        : 'border-white/5 bg-[#161b22] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${selectedShipping.id === opt.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{opt.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-mono">
                            {opt.carrier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                        <p className="text-[11px] text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ETA: {opt.estimatedDays}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-white text-sm font-mono">
                        {opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {currentStep === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Gateway Selection</h3>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Gateway Tokenization
                </span>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); setPaymentType('card'); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'card'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px]">Card (3DS 2.0)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); setPaymentType('upi'); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'upi'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">UPI / QR Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); setPaymentType('netbanking'); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'netbanking'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px]">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); setPaymentType('apple_pay'); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                    paymentType === 'apple_pay'
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-white/5 bg-[#161b22] text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">Apple / G-Pay</span>
                </button>
              </div>

              {/* CARD ENTRY FORM */}
              {paymentType === 'card' && (
                <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-3 animate-in fade-in">
                  
                  {/* Test Cards Selector */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px]">
                    <span className="font-semibold text-slate-400">Quick Test Cards:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillTestCard('visa')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                      >
                        Visa
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('mastercard')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                      >
                        Mastercard
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('rupay')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                      >
                        RuPay
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('amex')}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
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
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-mono font-bold text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
                      placeholder="Riya Sen"
                      className="w-full px-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* UPI ENTRY FORM */}
              {paymentType === 'upi' && (
                <div className="p-5 bg-[#161b22] text-white rounded-2xl space-y-4 border border-white/5 animate-in fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                      <div className="w-full h-full bg-[#0d1017] rounded-xl flex flex-col items-center justify-center p-1 text-center border border-indigo-500/20">
                        <QrCode className="w-10 h-10 text-emerald-400" />
                        <span className="text-[7px] text-slate-400 font-mono uppercase mt-0.5">POOJA-UPI</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">Instant UPI Dynamic QR</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          0% Fee
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Scan with Google Pay, PhonePe, Paytm, BHIM, or CRED to approve instantly.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400">Merchant VPA:</span>
                        <span className="font-bold text-indigo-300 bg-white/5 px-2 py-0.5 rounded">poojastore@okaxis</span>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                        >
                          {upiCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Or Enter Customer UPI ID (VPA)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="flex-1 px-3 py-2 bg-[#0d0d11] border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => { soundFx.playClick(); setUpiId('riyasen@okaxis'); }}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 cursor-pointer"
                      >
                        Demo VPA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NETBANKING */}
              {paymentType === 'netbanking' && (
                <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Select Banking Portal</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold">Direct API Token Clearing</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => { soundFx.playClick(); setSelectedBank(b); }}
                        className={`p-2.5 rounded-xl border text-left font-medium transition cursor-pointer flex items-center gap-2 ${
                          selectedBank === b 
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 ring-1 ring-indigo-500' 
                            : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                        <span className="truncate">{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* APPLE PAY / GPAY */}
              {paymentType === 'apple_pay' && (
                <div className="p-6 bg-[#161b22] text-white rounded-2xl text-center space-y-3 border border-white/5 animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mx-auto text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm">One-Touch Biometric Express Checkout</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Authenticate securely with Face ID or Fingerprint on your mobile browser. Payment card will be tokenized seamlessly.
                  </p>
                </div>
              )}

              {/* MALFUNCTION SIMULATION DRILL CHECKBOX */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Gateway Latency & Malfunction Test Mode</span>
                    <span className="text-[10px] text-slate-400">Simulate 504 timeout & self-healing failover notification</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={testMalfunctionMode}
                  onChange={(e) => setTestMalfunctionMode(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {/* Itemized Total Recap */}
              <div className="p-4 rounded-2xl bg-[#161b22] border border-white/5 text-xs space-y-1.5">
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
                  <span>Estimated GST / Tax (8.25%)</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/5 font-mono">
                  <span>Total Amount Due</span>
                  <span className="text-emerald-400 font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3.5: UPI QR REAL-TIME PENDING SCREEN */}
          {currentStep === 'upi_pending' && (
            <div className="p-6 bg-[#161b22] rounded-3xl border border-indigo-500/40 space-y-5 text-center animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Gateway Scan</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Expires in {formatTime(upiCountdown)}
                </span>
              </div>

              {/* Dynamic QR Box */}
              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto shadow-2xl flex items-center justify-center relative">
                <div className="w-full h-full bg-[#0d1017] rounded-xl flex flex-col items-center justify-center p-2 text-center border-2 border-indigo-500/30">
                  <QrCode className="w-24 h-24 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-white font-mono font-bold mt-1">POOJA-SECURE-QR</span>
                </div>
                <div className="absolute -bottom-2.5 bg-emerald-500 text-slate-950 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                  Live Gateway Active
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">Scan with Any UPI App</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Awaiting payment notification for <span className="font-mono font-bold text-white">${total.toFixed(2)}</span> to <span className="text-indigo-300 font-mono">poojastore@okaxis</span>.
                </p>
              </div>

              {/* Instant Test Simulator Button */}
              <div className="pt-2 space-y-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleFinalizePayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-emerald-200" />
                  <span>Simulate UPI App Approval & Complete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('payment')}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ← Choose Different Payment Method
                </button>
              </div>
            </div>
          )}

          {/* STEP 3.6: 3D SECURE 2.0 VERIFICATION MODAL */}
          {currentStep === '3ds_auth' && (
            <div className="p-6 bg-[#161b22] rounded-3xl border border-indigo-500/40 space-y-5 text-center animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-indigo-400/30 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 shadow-lg">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-base text-white">3D Secure 2.0 Bank Authorization</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your issuing bank has transmitted a one-time OTP code to registered mobile <span className="text-white font-mono">{shippingAddress.phone}</span>.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Enter 6-Digit OTP</span>
                  <span className="font-mono text-amber-400 text-[11px]">{formatTime(otpCountdown)}</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl py-3 bg-[#0d0d11] border border-indigo-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* One-Click Auto-Fill Demo OTP */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { soundFx.playClick(); setOtpCode('882910'); }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Auto-fill Demo OTP (882910)
                  </button>
                  <button
                    type="button"
                    onClick={() => { soundFx.playClick(); setOtpCountdown(120); }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <div className="max-w-xs mx-auto space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleFinalizePayment}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer block"
                >
                  Verify & Pay ${total.toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('payment')}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer block mx-auto"
                >
                  ← Back to Payment Options
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING ANIMATION */}
          {currentStep === 'processing' && (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Lock className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-white">Authorizing Live Encrypted Transaction...</h3>
                <p className="text-xs text-indigo-400 font-semibold max-w-sm animate-pulse leading-relaxed">
                  {processingStage}
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 font-mono">
                  AES-256 GCM • End-to-End Cryptographic Tunnel
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMED ORDER & OFFICIAL TAX INVOICE */}
          {currentStep === 'confirmed' && completedOrder && (
            <div className="space-y-6 animate-in zoom-in-95">
              
              {/* Success Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-emerald-300 font-serif">
                  Thank You, {completedOrder.shippingAddress.fullName}!
                </h3>
                <p className="text-xs text-emerald-400/90 leading-relaxed">
                  Payment authorized successfully. Inventory locks captured and real-time transaction notification broadcasted to store operations.
                </p>
              </div>

              {/* Order Meta Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#161b22] rounded-xl border border-white/5">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Order Reference</span>
                  <span className="font-mono font-bold text-white text-xs">{completedOrder.orderNumber}</span>
                </div>
                <div className="p-3.5 bg-[#161b22] rounded-xl border border-white/5">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Carrier Tracking Manifest</span>
                  <span className="font-bold text-indigo-400 text-xs font-mono">{completedOrder.trackingNumber}</span>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Purchase</h4>
                <div className="border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden bg-[#161b22]">
                  {completedOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-11 h-11 rounded-xl object-cover bg-[#1c2128]" />
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</span>
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
              <div className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-1.5 text-xs">
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
                  <span>GST / Tax (8.25%)</span>
                  <span className="font-mono text-white">${completedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-white/5 font-mono">
                  <span>Paid in Full</span>
                  <span className="text-emerald-400">${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions: Print Receipt & Done */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={printReceipt}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Download / Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Buttons (For Steps 1-3) */}
        {['shipping', 'delivery', 'payment'].includes(currentStep) && (
          <div className="p-4 border-t border-white/5 bg-[#161b22]/80 flex items-center justify-between">
            {currentStep !== 'shipping' ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (currentStep === 'delivery') setCurrentStep('shipping');
                  if (currentStep === 'payment') setCurrentStep('delivery');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {currentStep === 'shipping' && (
              <button
                type="button"
                id="checkout-to-delivery-btn"
                onClick={() => { soundFx.playClick(); setCurrentStep('delivery'); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Continue to Delivery <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 'delivery' && (
              <button
                type="button"
                id="checkout-to-payment-btn"
                onClick={() => { soundFx.playClick(); setCurrentStep('payment'); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 'payment' && (
              <button
                type="button"
                id="checkout-pay-btn"
                onClick={handleProceedToPaymentAuth}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Pay ${total.toFixed(2)} Securely <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
