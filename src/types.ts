export interface ProductVariant {
  id: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  stock: number;
  sku: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  avatar?: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  stock: number; // live server stock count
  lowStockThreshold: number;
  sku: string;
  images: string[];
  thumbnail: string;
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  variants?: ProductVariant[];
  badges?: string[]; // e.g. "Bestseller", "Low Stock", "New Arrival", "Staff Pick"
  tags: string[];
  isFeatured?: boolean;
  costPrice?: number; // COGS (Cost of Goods Sold)
  unitsSold?: number;
  supplier?: string;
}

export type UserRole = 'customer' | 'admin' | 'analyst' | 'inventory_manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  phone?: string;
  badge: string;
  permissions: string[];
  loyaltyPoints?: number;
  memberSince?: string;
  ordersCount?: number;
  savedAddresses?: ShippingAddress[];
}

export interface ProductProfitAnalysis {
  productId: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  thumbnail: string;
  price: number;
  costPrice: number;
  unitsSold: number;
  stock: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  inventoryValue: number;
  potentialProfit: number;
  classification: 'star_performer' | 'cash_cow' | 'high_margin_gem' | 'low_margin_drag';
  benefitScore: number; // 0 - 100
  recommendation: string;
  isBenefitingOverall: boolean;
}

export interface StoreProfitSummary {
  totalRevenue: number;
  totalCostOfGoods: number;
  netGrossProfit: number;
  averageMarginPercent: number;
  totalUnitsSold: number;
  topBenefitingProduct: ProductProfitAnalysis;
  leastBenefitingProduct: ProductProfitAnalysis;
  productAnalyses: ProductProfitAnalysis[];
  categoryBreakdown: {
    category: string;
    categoryName: string;
    revenue: number;
    profit: number;
    marginPercent: number;
    unitsSold: number;
  }[];
}

export type NotificationType = 'transaction' | 'stock_alert' | 'malfunction' | 'financial';
export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole: 'all' | UserRole;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productTitle?: string;
    amount?: number;
    txId?: string;
    errorCode?: string;
    carrier?: string;
    recoveryAction?: string;
  };
  isResolved?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  itemCount: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
  bannerImage: string;
  subcategories: SubCategory[];
}

export interface CartItem {
  id: string; // unique cart entry key: `${productId}-${variantId || 'default'}`
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedSize?: string;
  variantId?: string;
  currentAvailableStock: number;
  sku: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  carrier: string;
  description: string;
}

export type PaymentType = 'card' | 'upi' | 'netbanking' | 'apple_pay' | 'google_pay' | 'paypal' | 'cod' | 'klarna';

export interface PaymentGatewayIntent {
  intentId: string;
  transactionId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  gatewayProvider: 'RazorPay' | 'Stripe' | 'UPI-Direct' | 'HDFC-Bank';
  status: 'created' | 'awaiting_payment' | 'authorized' | 'captured' | 'failed';
  upiQrPayload?: string;
  expiresAt: string;
  challengeUrl?: string;
}

export interface PaymentDetails {
  type: PaymentType;
  cardNumber?: string;
  cardExp?: string;
  cardCvv?: string;
  cardholderName?: string;
  walletAccount?: string;
  lastFour?: string;
  brand?: string;
}

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingCost: number;
  shippingOption: ShippingOption;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentDetails: {
    type: PaymentType;
    lastFour?: string;
    brand?: string;
    transactionId: string;
    timestamp: string;
  };
  status: OrderStatus;
  trackingNumber: string;
  trackingCarrier: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
}

export interface FilterState {
  category: string;
  subcategory: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  ratings: number[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface InventoryEvent {
  productId: string;
  title: string;
  previousStock: number;
  newStock: number;
  timestamp: string;
  reason: 'purchase' | 'restock' | 'manual_adjustment';
  quantityDelta: number;
}

export interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  totalInventoryCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeLiveShoppers: number;
}

export type PageView = 'shop' | 'products_listing' | 'products_deleting';

export interface ArchivedProduct {
  id: string;
  originalProduct: Product;
  deletedAt: string;
  deletedBy: string;
  reason: string;
  previousStock: number;
  previousPrice: number;
  previousUnitsSold: number;
}

export interface ProductDeletionLog {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  category: string;
  deletedAt: string;
  deletedBy: string;
  reason: string;
  unitsRemoved: number;
  estimatedValueLost: number;
  action: 'archived' | 'restored' | 'purged';
}
