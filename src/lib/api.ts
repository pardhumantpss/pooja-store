import { Category, FilterState, Order, Product, StoreStats, UserProfile, UserRole, StoreProfitSummary, SystemNotification } from '../types';

export const api = {
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getProducts(filters: Partial<FilterState> = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.subcategory && filters.subcategory !== 'all') params.append('subcategory', filters.subcategory);
    if (filters.searchQuery) params.append('search', filters.searchQuery);
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.brands && filters.brands.length > 0) params.append('brands', filters.brands.join(','));
    if (filters.inStockOnly) params.append('inStockOnly', 'true');
    if (filters.onSaleOnly) params.append('onSaleOnly', 'true');
    if (filters.sortBy) params.append('sort', filters.sortBy);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<{ success: boolean; message: string; product: Product; totalCount: number }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; message: string; product: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async deleteProduct(id: string, reason?: string, deletedBy?: string): Promise<{ success: boolean; message: string; archivedItem: import('../types').ArchivedProduct; remainingCount: number }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, deletedBy }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
  },

  async bulkDeleteProducts(productIds: string[], reason?: string, deletedBy?: string): Promise<{ success: boolean; message: string; deletedCount: number; totalUnitsRemoved: number; totalValueLost: number; remainingCount: number }> {
    const res = await fetch('/api/products/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, reason, deletedBy }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bulk delete products');
    return data;
  },

  async getArchivedProducts(): Promise<{ archivedProducts: import('../types').ArchivedProduct[]; count: number }> {
    const res = await fetch('/api/products/archived');
    if (!res.ok) throw new Error('Failed to fetch archived products');
    return res.json();
  },

  async restoreProduct(id: string): Promise<{ success: boolean; message: string; restoredProduct: Product; activeCount: number; archivedCount: number }> {
    const res = await fetch(`/api/products/${id}/restore`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore product');
    return data;
  },

  async purgeProduct(id: string): Promise<{ success: boolean; message: string; archivedCount: number }> {
    const res = await fetch(`/api/products/${id}/purge`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to purge product');
    return data;
  },

  async getDeletionLogs(): Promise<import('../types').ProductDeletionLog[]> {
    const res = await fetch('/api/products/deletion-log');
    if (!res.ok) throw new Error('Failed to fetch deletion logs');
    return res.json();
  },

  async getLiveInventory(): Promise<{ timestamp: string; stocks: Record<string, { stock: number; variants?: Record<string, number> }>; recentEvents: any[] }> {
    const res = await fetch('/api/inventory/live');
    if (!res.ok) throw new Error('Failed to fetch live inventory');
    return res.json();
  },

  async validateCart(items: any[]): Promise<{ valid: boolean; issues: string[]; stockSnapshot: Record<string, number> }> {
    const res = await fetch('/api/checkout/validate-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to validate cart');
    return res.json();
  },

  async processPayment(payload: {
    items: any[];
    shippingAddress: any;
    shippingOption: any;
    paymentMethod: any;
    promoCode?: string;
  }): Promise<{ success: boolean; order: Order; stockUpdates: any[] }> {
    const res = await fetch('/api/checkout/process-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment failed');
    }
    return data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateInventory(payload: {
    productId: string;
    variantId?: string;
    newStock?: number;
    deltaStock?: number;
    price?: number;
    title?: string;
  }): Promise<{ success: boolean; updatedProduct: Product; inventoryEvent: any }> {
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update inventory');
    return res.json();
  },

  async getStats(): Promise<StoreStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch store stats');
    return res.json();
  },

  async askAiAssistant(query: string): Promise<{ reply: string; recommendedProductIds: string[] }> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to query assistant');
    return res.json();
  },

  async addReview(productId: string, review: { author: string; rating: number; title: string; comment: string }) {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Auth & Account
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch('/api/auth/current-user');
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  async register(payload: { name: string; email: string; password?: string; phone?: string; role?: UserRole }): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(payload: { email: string; password?: string; role?: UserRole }): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async logout(): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Logout failed');
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request reset');
    return data;
  },

  // Real-time Payment Gateway Methods
  async createPaymentIntent(payload: {
    amount: number;
    currency?: string;
    paymentMethod: string;
    itemsCount?: number;
  }): Promise<{ success: boolean; intent: import('../types').PaymentGatewayIntent }> {
    const res = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create payment intent');
    return data;
  },

  async verifyPaymentOtp(payload: {
    otp: string;
    intentId?: string;
    type?: string;
  }): Promise<{ success: boolean; verified: boolean; message: string; authorizationCode?: string }> {
    const res = await fetch('/api/payment/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'OTP Verification failed');
    return data;
  },

  async simulateUpiAppScan(intentId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/payment/simulate-qr-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentId }),
    });
    return res.json();
  },

  async getPaymentStatus(intentId: string): Promise<{ success: boolean; intent: any }> {
    const res = await fetch(`/api/payment/status/${intentId}`);
    return res.json();
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch('/api/auth/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async switchRole(role: UserRole, customUser?: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, customUser }),
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  },

  // Profitability Analytics
  async getProductProfitability(): Promise<StoreProfitSummary> {
    const res = await fetch('/api/analytics/product-profitability');
    if (!res.ok) throw new Error('Failed to fetch profitability analytics');
    return res.json();
  },

  async simulatePriceMargin(payload: {
    productId: string;
    simulatedPrice?: number;
    simulatedCostPrice?: number;
    simulatedVolumeBoost?: number;
  }) {
    const res = await fetch('/api/analytics/simulate-price-margin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to simulate pricing');
    return res.json();
  },

  // Notifications & Malfunction Alerts
  async getNotifications(role?: string): Promise<SystemNotification[]> {
    const url = role ? `/api/notifications?role=${encodeURIComponent(role)}` : '/api/notifications';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationsRead(id?: string): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to mark notifications read');
    return res.json();
  },

  async triggerMalfunction(payload: { type: string; customMessage?: string; severity?: string }) {
    const res = await fetch('/api/notifications/trigger-malfunction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to trigger malfunction');
    return res.json();
  },

  async resolveMalfunction(id?: string) {
    const res = await fetch('/api/notifications/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to resolve malfunction');
    return res.json();
  },

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    gatewayStatus: string;
    gatewayLatencyMs: number;
    uptimePercent: number;
    activeMalfunctionsCount: number;
    lastHeartbeat: string;
  }> {
    const res = await fetch('/api/system/health');
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  }
};

// Named exports for React components
export const fetchProducts = (filters: Partial<FilterState> = {}) => api.getProducts(filters);
export const fetchCategories = () => api.getCategories();
export const fetchOrders = () => api.getAllOrders();
export const updateProductStock = async (productId: string, newStock: number, variantId?: string): Promise<Product> => {
  const result = await api.updateInventory({ productId, newStock, variantId });
  return result.updatedProduct;
};
export const simulatePurchase = async (): Promise<{ product: Product }> => {
  const res = await fetch('/api/inventory/simulate-purchase', { method: 'POST' });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
};
export const resetInventory = async (): Promise<Product[]> => {
  const res = await fetch('/api/inventory/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Reset failed');
  const data = await res.json();
  return data.products;
};

