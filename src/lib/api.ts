import { Category, FilterState, Order, Product, StoreStats } from '../types';

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
