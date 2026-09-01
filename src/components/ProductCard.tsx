import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Eye, 
  Heart, 
  Check, 
  AlertCircle, 
  Zap, 
  ShieldCheck,
  Users
} from 'lucide-react';
import { Product } from '../types';
import { soundFx } from '../lib/soundFx';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, selectedVariantId?: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [addedRecently, setAddedRecently] = useState(false);

  // Stable live viewers count per product
  const liveViewers = useMemo(() => {
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 3 + (seed % 14);
  }, [product.id]);

  const hasVariants = product.variants && product.variants.length > 0;
  const currentVariant = hasVariants ? product.variants![selectedVariantIndex] : null;
  const currentStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= product.lowStockThreshold;

  const displayImage = isHovered && product.images.length > 1 
    ? product.images[1] 
    : product.thumbnail;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    soundFx.playAddToCart();
    onAddToCart(product, currentVariant?.id);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1600);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
      className="group relative bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden shadow-2xl hover:border-white/15 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 sm:aspect-square bg-[#1c2128] overflow-hidden">
        
        {/* Main Product Image */}
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercent && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/90 text-white shadow-md tracking-wider">
              {product.discountPercent}% OFF
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              {currentStock} Left
            </span>
          )}
          {product.badges && product.badges.includes('Bestseller') && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white border border-white/10 shadow-sm">
              Bestseller
            </span>
          )}
          {product.badges && product.badges.includes('Staff Pick') && !isLowStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600/80 backdrop-blur-xs text-white border border-indigo-400/30 shadow-sm">
              Staff Pick
            </span>
          )}
        </div>

        {/* Top Right Live Viewers Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-white">{liveViewers}</span> viewing
          </span>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-semibold shadow-xl hover:bg-white/20 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-300" />
            <span>Quick View</span>
          </button>
        </div>

      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>

          {/* Subtitle / Description excerpt */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>

          {/* Color / Variant Swatches */}
          {hasVariants && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Colors:
              </span>
              {product.variants!.map((variant, idx) => (
                <button
                  key={variant.id}
                  id={`variant-swatch-${variant.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariantIndex(idx);
                  }}
                  title={`${variant.colorName || 'Variant'} (${variant.stock} in stock)`}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 relative cursor-pointer ${
                    selectedVariantIndex === idx 
                      ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#161b22] scale-110' 
                      : 'hover:scale-105 border-white/20'
                  }`}
                  style={{ backgroundColor: variant.colorHex || '#475569' }}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-1 font-medium truncate max-w-[100px]">
                {currentVariant?.colorName}
              </span>
            </div>
          )}

        </div>

        {/* Price, Real-Time Stock Status, and Add-to-Cart Row */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          
          {/* Price Block */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-white font-mono">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-600 line-through font-mono">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            {/* Real-Time Stock Ticker Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOutOfStock ? (
                <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  {currentStock} remaining
                </span>
              ) : (
                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentStock} in stock
                </span>
              )}
            </div>
          </div>

          {/* Action Button: Add to Cart */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              isOutOfStock
                ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                : addedRecently
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
