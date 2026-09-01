import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Clock, 
  Flame, 
  Sparkles,
  Info,
  User,
  MessageSquarePlus
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { MOCK_REVIEWS_POOL } from '../data/mockProducts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variantId?: string, quantity?: number) => void;
  onBuyNow: (product: Product, variantId?: string, quantity?: number) => void;
  onSubmitReview?: (productId: string, review: { author: string; rating: number; title: string; comment: string }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onSubmitReview,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(MOCK_REVIEWS_POOL);

  const hasVariants = product.variants && product.variants.length > 0;
  const currentVariant = hasVariants ? product.variants![selectedVariantIndex] : null;
  const availableStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, currentVariant?.id, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onBuyNow(product, currentVariant?.id, quantity);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim() || 'Verified Customer',
      rating: reviewRating,
      date: 'Just now',
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      verified: true,
    };

    setLocalReviews([newRev, ...localReviews]);
    if (onSubmitReview) {
      onSubmitReview(product.id, {
        author: newRev.author,
        rating: newRev.rating,
        title: newRev.title,
        comment: newRev.comment,
      });
    }

    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
      setReviewTitle('');
      setReviewComment('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#0d0d11] text-slate-300 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition z-20 cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Active Image with Zoom Frame */}
              <div className="relative aspect-4/3 sm:aspect-square rounded-2xl bg-[#161b22] overflow-hidden border border-white/5">
                <img
                  src={product.images[activeImageIndex] || product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.discountPercent && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-500/90 text-white shadow-md">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                  {isLowStock && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      Only {availableStock} left in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Selector */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Box */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#161b22] border border-white/5 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-[11px] font-bold text-white">Express Delivery</span>
                  <span className="text-[10px] text-slate-500">Ships within 24h</span>
                </div>
                <div className="flex flex-col items-center border-x border-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-bold text-white">2-Year Warranty</span>
                  <span className="text-[10px] text-slate-500">Full coverage</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-[11px] font-bold text-white">30-Day Returns</span>
                  <span className="text-[10px] text-slate-500">Hassle-free</span>
                </div>
              </div>

            </div>

            {/* Right Column: Product Specs, Variants, Stock, Purchase */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                
                {/* Brand & SKU */}
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                    {product.brand}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">SKU: {currentVariant?.sku || product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {product.title}
                </h1>

                {/* Rating & Review counter */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-200">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({product.reviewCount} reviews)</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Authentic
                  </span>
                </div>

                {/* Price & Savings */}
                <div className="mt-4 p-4 rounded-2xl bg-[#161b22] border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white font-mono">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-600 line-through font-mono">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Taxes calculated at checkout. Free shipping over $100.
                    </span>
                  </div>

                  {/* Real-time stock status badge */}
                  <div className="text-right">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Only {availableStock} Units Left
                        </span>
                        <span className="text-[10px] text-amber-400/80 font-medium mt-0.5">
                          High demand in cart
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {availableStock} in stock (Ready to Ship)
                      </span>
                    )}
                  </div>
                </div>

                {/* Variants Selection */}
                {hasVariants && (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Color / Finish:
                      </span>
                      <span className="font-semibold text-indigo-400">
                        {currentVariant?.colorName} {currentVariant?.size ? `• ${currentVariant.size}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {product.variants!.map((variant, idx) => (
                        <button
                          key={variant.id}
                          id={`modal-variant-${variant.id}`}
                          onClick={() => {
                            setSelectedVariantIndex(idx);
                            setQuantity(1);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            selectedVariantIndex === idx
                              ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-2 ring-indigo-500/20'
                              : 'border-white/10 bg-[#161b22] text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                            style={{ backgroundColor: variant.colorHex || '#475569' }}
                          />
                          <span>{variant.colorName}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({variant.stock} left)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Live Stock Reservation Meter */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Quantity</span>
                    <span className="text-slate-500 font-normal">
                      Max available: {availableStock}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-[#161b22]">
                      <button
                        id="qty-decrement-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="px-3.5 py-2 text-slate-400 hover:bg-white/5 disabled:opacity-30 cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-bold text-white text-sm">
                        {quantity}
                      </span>
                      <button
                        id="qty-increment-btn"
                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                        disabled={quantity >= availableStock || isOutOfStock}
                        className="px-3.5 py-2 text-slate-400 hover:bg-white/5 disabled:opacity-30 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Stock Bar Meter */}
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (availableStock / Math.max(15, availableStock)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Add to Cart & Buy Now */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                      isOutOfStock
                        ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                        : addedAnimation
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 ${
                      isOutOfStock
                        ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Instant Checkout</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom Tabs: Overview, Specs, Customer Reviews */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 border-b border-white/5 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-semibold pb-1 transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Description & Highlights
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-semibold pb-1 transition cursor-pointer ${
                  activeTab === 'specs'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-semibold pb-1 transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Customer Reviews</span>
                <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  {localReviews.length}
                </span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-5">
              {activeTab === 'overview' && (
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>{product.description}</p>
                  
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-[0.2em] pt-2">
                    Key Highlights
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="p-3 bg-[#161b22] rounded-xl border border-white/5 flex justify-between">
                      <span className="font-medium text-slate-400">{key}:</span>
                      <span className="font-bold text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Header with Add Review Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Verified Customer Feedback</h4>
                      <p className="text-xs text-slate-500">Rated {product.rating} / 5 by authenticated purchasers</p>
                    </div>
                    <button
                      id="open-review-form-btn"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Write Review</span>
                    </button>
                  </div>

                  {/* Add Review Form */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-4 bg-[#161b22] rounded-2xl border border-indigo-500/30 space-y-3">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Share Your Experience</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">Your Name</label>
                          <input
                            type="text"
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            placeholder="e.g. Alex Morgan"
                            className="w-full px-3 py-1.5 bg-[#0d0d11] border border-white/10 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">Rating</label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-[#0d0d11] border border-white/10 rounded-lg text-xs font-bold text-white"
                          >
                            <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                            <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                            <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Headline</label>
                        <input
                          type="text"
                          required
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Unbelievable soundstage and battery life!"
                          className="w-full px-3 py-1.5 bg-[#0d0d11] border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Review Comments</label>
                        <textarea
                          required
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Detail your thoughts on build quality, packaging, and daily usage..."
                          className="w-full px-3 py-1.5 bg-[#0d0d11] border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition"
                        >
                          {reviewSubmitted ? 'Submitted!' : 'Publish Verified Review'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {localReviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-[#161b22] rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-white block">{rev.author}</span>
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" /> Verified Purchase
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-500">{rev.date}</span>
                          </div>
                        </div>
                        <h5 className="font-bold text-xs text-white">{rev.title}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
