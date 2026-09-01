import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CATEGORIES, INITIAL_PRODUCTS, MOCK_REVIEWS_POOL, DEMO_USERS, INITIAL_NOTIFICATIONS } from './src/data/mockProducts.js';

// Setup ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Live State
let products: any[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS)).map((p: any, idx: number) => {
  // Ensure every product has costPrice and unitsSold for profitability analysis
  const costRatio = 0.35 + ((idx * 7) % 30) / 100; // 35% to 65% COGS
  const costPrice = p.costPrice || Number((p.price * costRatio).toFixed(2));
  const unitsSold = p.unitsSold || (idx === 0 ? 124 : idx === 1 ? 88 : idx === 2 ? 65 : 20 + ((idx * 13) % 70));
  return {
    ...p,
    costPrice,
    unitsSold,
    supplier: p.supplier || (idx % 2 === 0 ? 'Pooja Direct Artisans Ltd' : 'Apex Global Precision Corp'),
  };
});

let categories = JSON.parse(JSON.stringify(CATEGORIES));
let orders: any[] = [];
let inventoryHistory: any[] = [];
let totalRevenue = 38450;
let totalOrders = 84;
let users = JSON.parse(JSON.stringify(DEMO_USERS));
let currentUser = users.admin; // Default to Store Admin/Owner
let notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let paymentIntents: Record<string, any> = {};
let liveShoppersCount = 38;

// Archived / Deleted Products & Deletion Audit Trail
let archivedProducts: any[] = [
  {
    id: 'arch-sample-01',
    originalProduct: {
      id: 'prod-legacy-09',
      title: 'Solace Pure Copper Brass Diya Set',
      subtitle: 'Handcrafted Heritage Brassware (Archived Batch)',
      category: 'pooja-essentials',
      subcategory: 'diyas-lamps',
      brand: 'Pooja Heritage',
      price: 45,
      originalPrice: 55,
      discountPercent: 18,
      rating: 4.8,
      reviewCount: 32,
      stock: 0,
      lowStockThreshold: 5,
      sku: 'POOJA-DIY-CP-09',
      thumbnail: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Hand-hammered pure copper diyas for sacred celebrations. Archived due to supplier re-tooling.',
      highlights: ['100% pure copper core', 'Heat-tempered base', 'Traditional temple craftsmanship'],
      specs: { 'Material': 'Pure Copper', 'Weight': '350g', 'Origin': 'Varanasi, India' },
      tags: ['Diya', 'Copper', 'Handmade', 'Archived'],
      badges: ['Discontinued'],
      costPrice: 19.5,
      unitsSold: 94,
      supplier: 'Varanasi Artisan Guild'
    },
    deletedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedBy: 'Store Admin (Arjun Mehta)',
    reason: 'End of seasonal run - replaced by 2026 Brass Deluxe collection.',
    previousStock: 0,
    previousPrice: 45,
    previousUnitsSold: 94
  }
];

let deletionLogs: any[] = [
  {
    id: 'del-log-101',
    productId: 'prod-legacy-09',
    productTitle: 'Solace Pure Copper Brass Diya Set',
    sku: 'POOJA-DIY-CP-09',
    category: 'pooja-essentials',
    deletedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedBy: 'Store Admin (Arjun Mehta)',
    reason: 'End of seasonal run - replaced by 2026 Brass Deluxe collection.',
    unitsRemoved: 0,
    estimatedValueLost: 0,
    action: 'archived'
  }
];

// System Health & Malfunction State
let systemHealth = {
  status: 'healthy', // 'healthy' | 'degraded' | 'critical'
  gatewayStatus: 'active', // 'active' | 'failover_secondary' | 'degraded'
  gatewayLatencyMs: 145,
  uptimePercent: 99.98,
  dbSyncStatus: 'synced',
  activeMalfunctionsCount: 0,
  lastHeartbeat: new Date().toISOString(),
};

// Initial sample recent orders
orders.push({
  id: 'ord-9821',
  orderNumber: 'POOJA-9821-9382',
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  items: [
    {
      id: 'prod-01-v-01-black',
      productId: 'prod-01',
      title: 'Aura Horizon Studio ANC Headphones',
      price: 349,
      quantity: 1,
      selectedColor: 'Matte Obsidian',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      sku: 'AUR-HP-900-BLK'
    }
  ],
  subtotal: 349,
  discount: 0,
  shippingCost: 0,
  shippingOption: {
    id: 'standard',
    name: 'Standard Insured Delivery',
    price: 0,
    estimatedDays: '2-3 Business Days',
    carrier: 'FedEx SmartPost'
  },
  tax: 27.92,
  total: 376.92,
  shippingAddress: {
    fullName: 'Riya Sen',
    email: 'riya.sen@example.com',
    phone: '+91 98765 12340',
    street: '42 MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India'
  },
  paymentDetails: {
    type: 'card',
    lastFour: '4242',
    brand: 'Visa',
    transactionId: 'tx_sec_99482710384',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  status: 'processing',
  trackingNumber: 'TRK-POOJA-8472910',
  trackingCarrier: 'BlueDart / FedEx Express',
  estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  timeline: [
    { status: 'confirmed', label: 'Order Confirmed & Paid', description: 'Cryptographic payment authorization verified via RazorPay / Stripe Gateway.', timestamp: '4 hours ago', completed: true },
    { status: 'processing', label: 'Fulfillment & Quality Check', description: 'Item picked from automated climate warehouse.', timestamp: '2 hours ago', completed: true, current: true },
    { status: 'shipped', label: 'Departed Facility', description: 'Awaiting handoff to BlueDart courier hub.', timestamp: 'Pending', completed: false },
    { status: 'delivered', label: 'Delivered', description: 'Signed signature delivery to recipient.', timestamp: 'Pending', completed: false }
  ]
});

// Gemini AI Client Lazy Initializer
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get All Categories
  app.get('/api/categories', (req, res) => {
    // Recalculate dynamic counts based on live products
    const updatedCategories = categories.map((cat: any) => {
      if (cat.id === 'all') {
        return { ...cat, itemCount: products.length };
      }
      const count = products.filter((p: any) => p.category === cat.id).length;
      const updatedSub = cat.subcategories.map((sub: any) => {
        if (sub.id === 'all') return { ...sub, itemCount: count };
        const subCount = products.filter((p: any) => p.category === cat.id && p.subcategory === sub.id).length;
        return { ...sub, itemCount: subCount };
      });
      return { ...cat, itemCount: count, subcategories: updatedSub };
    });
    res.json(updatedCategories);
  });

  // Get Products with filtering, search, brand, stock, and sorting
  app.get('/api/products', (req, res) => {
    const { category, subcategory, search, minPrice, maxPrice, brands, inStockOnly, onSaleOnly, sort } = req.query;

    let filtered = [...products];

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Subcategory filter
    if (subcategory && subcategory !== 'all') {
      filtered = filtered.filter((p) => p.subcategory === subcategory);
    }

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q)) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Price range
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    // Brands
    if (brands && typeof brands === 'string') {
      const brandList = brands.split(',').filter(Boolean);
      if (brandList.length > 0) {
        filtered = filtered.filter((p) => brandList.includes(p.brand));
      }
    }

    // In Stock Only
    if (inStockOnly === 'true') {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // On Sale Only
    if (onSaleOnly === 'true') {
      filtered = filtered.filter((p) => p.discountPercent && p.discountPercent > 0);
    }

    // Sorting
    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      filtered.reverse();
    } else {
      // Default: Popular / Featured
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.reviewCount - a.reviewCount);
    }

    res.json(filtered);
  });

  // Get Single Product by ID
  app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // --- PRODUCT MANAGEMENT: CREATE, UPDATE, DELETE & ARCHIVE ---

  // 1. Create New Product
  app.post('/api/products', (req, res) => {
    const {
      title,
      subtitle,
      category = 'pooja-essentials',
      subcategory = 'all',
      brand = 'Pooja Heritage',
      price,
      originalPrice,
      costPrice,
      stock = 10,
      lowStockThreshold = 5,
      sku,
      thumbnail,
      images = [],
      description,
      highlights = [],
      specs = {},
      variants = [],
      badges = ['New Arrival'],
      tags = [],
      isFeatured = false,
      supplier = 'Pooja Direct Artisans'
    } = req.body;

    if (!title || !price || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Product title and a valid price are required' });
    }

    const numPrice = Number(price);
    const numCost = costPrice ? Number(costPrice) : Number((numPrice * 0.45).toFixed(2));
    const numStock = Number(stock) || 0;
    const cleanSku = sku ? String(sku).toUpperCase().trim() : `POOJA-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const defaultImg = thumbnail || (images && images[0]) || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
    const allImages = images.length > 0 ? images : [defaultImg];

    const newProduct = {
      id: newId,
      title: String(title).trim(),
      subtitle: subtitle ? String(subtitle).trim() : `${brand} Premium Edition`,
      category,
      subcategory: subcategory || 'all',
      brand: brand || 'Pooja Heritage',
      price: numPrice,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercent: originalPrice && Number(originalPrice) > numPrice 
        ? Math.round(((Number(originalPrice) - numPrice) / Number(originalPrice)) * 100)
        : undefined,
      rating: 5.0,
      reviewCount: 0,
      stock: numStock,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      sku: cleanSku,
      thumbnail: defaultImg,
      images: allImages,
      description: description || `${title} crafted with supreme artisanal precision.`,
      highlights: highlights.length > 0 ? highlights : ['Hand-inspected for highest quality', 'Ethically sourced and crafted', 'Fast express fulfillment'],
      specs: Object.keys(specs).length > 0 ? specs : { 'Material': 'Premium Grade', 'Origin': 'Handcrafted' },
      variants: Array.isArray(variants) ? variants : [],
      badges: Array.isArray(badges) ? badges : ['New Arrival'],
      tags: Array.isArray(tags) ? tags : [brand, category],
      isFeatured: Boolean(isFeatured),
      costPrice: numCost,
      unitsSold: 0,
      supplier,
    };

    products.unshift(newProduct);

    // Record inventory initial stock event
    inventoryHistory.push({
      productId: newProduct.id,
      title: newProduct.title,
      previousStock: 0,
      newStock: newProduct.stock,
      timestamp: new Date().toISOString(),
      reason: 'restock',
      quantityDelta: newProduct.stock,
    });

    // Send catalog notification
    notifications.unshift({
      id: `notif-prod-add-${Date.now()}`,
      type: 'transaction',
      severity: 'success',
      title: `Product Created: ${newProduct.title}`,
      message: `Added SKU #${newProduct.sku} (${newProduct.brand}) with initial stock of ${newProduct.stock} units.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      metadata: {
        productId: newProduct.id,
        sku: newProduct.sku,
        price: newProduct.price,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product successfully added to store catalog',
      product: newProduct,
      totalCount: products.length
    });
  });

  // 2. Update Existing Product
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const current = products[index];
    const prevStock = current.stock;
    const updates = req.body;

    const updatedProduct = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      costPrice: updates.costPrice !== undefined ? Number(updates.costPrice) : current.costPrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
      lowStockThreshold: updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : current.lowStockThreshold,
    };

    if (updates.originalPrice && Number(updates.originalPrice) > updatedProduct.price) {
      updatedProduct.originalPrice = Number(updates.originalPrice);
      updatedProduct.discountPercent = Math.round(((updatedProduct.originalPrice - updatedProduct.price) / updatedProduct.originalPrice) * 100);
    }

    products[index] = updatedProduct;

    if (updatedProduct.stock !== prevStock) {
      inventoryHistory.push({
        productId: updatedProduct.id,
        title: updatedProduct.title,
        previousStock: prevStock,
        newStock: updatedProduct.stock,
        timestamp: new Date().toISOString(),
        reason: 'manual_adjustment',
        quantityDelta: updatedProduct.stock - prevStock,
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  });

  // 3. Delete / Archive Single Product
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { reason, deletedBy } = req.body || {};
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [removed] = products.splice(index, 1);
    const userWhoDeleted = deletedBy || (currentUser ? currentUser.name : 'Store Admin');
    const deleteReason = reason || 'Manual catalog cleanup / product decommissioning';

    const archiveItem = {
      id: `arch-${Date.now()}-${removed.id}`,
      originalProduct: removed,
      deletedAt: new Date().toISOString(),
      deletedBy: userWhoDeleted,
      reason: deleteReason,
      previousStock: removed.stock,
      previousPrice: removed.price,
      previousUnitsSold: removed.unitsSold || 0,
    };

    archivedProducts.unshift(archiveItem);

    const logEntry = {
      id: `del-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: removed.id,
      productTitle: removed.title,
      sku: removed.sku,
      category: removed.category,
      deletedAt: new Date().toISOString(),
      deletedBy: userWhoDeleted,
      reason: deleteReason,
      unitsRemoved: removed.stock,
      estimatedValueLost: Number((removed.price * removed.stock).toFixed(2)),
      action: 'archived' as const
    };

    deletionLogs.unshift(logEntry);

    // Record inventory adjustment event
    inventoryHistory.push({
      productId: removed.id,
      title: removed.title,
      previousStock: removed.stock,
      newStock: 0,
      timestamp: new Date().toISOString(),
      reason: 'manual_adjustment',
      quantityDelta: -removed.stock,
    });

    // Broadcast system notification
    notifications.unshift({
      id: `notif-del-${Date.now()}`,
      type: 'malfunction',
      severity: 'warning',
      title: `Product Removed from Catalog: ${removed.title}`,
      message: `Archived SKU #${removed.sku} (${removed.stock} units removed) by ${userWhoDeleted}.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      metadata: {
        productId: removed.id,
        sku: removed.sku,
        unitsRemoved: removed.stock
      }
    });

    res.json({
      success: true,
      message: `Product "${removed.title}" successfully archived and removed from store catalog.`,
      archivedItem: archiveItem,
      remainingCount: products.length
    });
  });

  // 4. Bulk Delete / Archive Products
  app.post('/api/products/bulk-delete', (req, res) => {
    const { productIds, reason, deletedBy } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Array of productIds is required' });
    }

    const userWhoDeleted = deletedBy || (currentUser ? currentUser.name : 'Store Admin');
    const deleteReason = reason || 'Batch catalog removal';
    const deletedItems: any[] = [];
    let totalUnitsRemoved = 0;
    let totalValueLost = 0;

    productIds.forEach((id: string) => {
      const idx = products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const [removed] = products.splice(idx, 1);
        deletedItems.push(removed);
        totalUnitsRemoved += removed.stock;
        totalValueLost += (removed.price * removed.stock);

        const archiveItem = {
          id: `arch-${Date.now()}-${removed.id}`,
          originalProduct: removed,
          deletedAt: new Date().toISOString(),
          deletedBy: userWhoDeleted,
          reason: deleteReason,
          previousStock: removed.stock,
          previousPrice: removed.price,
          previousUnitsSold: removed.unitsSold || 0,
        };
        archivedProducts.unshift(archiveItem);

        deletionLogs.unshift({
          id: `del-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: removed.id,
          productTitle: removed.title,
          sku: removed.sku,
          category: removed.category,
          deletedAt: new Date().toISOString(),
          deletedBy: userWhoDeleted,
          reason: deleteReason,
          unitsRemoved: removed.stock,
          estimatedValueLost: Number((removed.price * removed.stock).toFixed(2)),
          action: 'archived'
        });
      }
    });

    notifications.unshift({
      id: `notif-bulk-del-${Date.now()}`,
      type: 'malfunction',
      severity: 'warning',
      title: `Bulk Deletion: ${deletedItems.length} Products Removed`,
      message: `Batch archived ${deletedItems.length} items (${totalUnitsRemoved} units) by ${userWhoDeleted}.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
    });

    res.json({
      success: true,
      message: `Successfully deleted ${deletedItems.length} products.`,
      deletedCount: deletedItems.length,
      totalUnitsRemoved,
      totalValueLost: Number(totalValueLost.toFixed(2)),
      remainingCount: products.length
    });
  });

  // 5. Get Archived / Recycle Bin Products
  app.get('/api/products/archived', (req, res) => {
    res.json({
      archivedProducts,
      count: archivedProducts.length
    });
  });

  // 6. Restore Product from Archive / Recycle Bin
  app.post('/api/products/:id/restore', (req, res) => {
    const { id } = req.params;
    const index = archivedProducts.findIndex((a) => a.id === id || a.originalProduct.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Archived product not found in recycle bin' });
    }

    const [archived] = archivedProducts.splice(index, 1);
    const restoredProduct = archived.originalProduct;

    // Check if ID collision in active products
    const alreadyExists = products.some((p) => p.id === restoredProduct.id);
    if (!alreadyExists) {
      products.unshift(restoredProduct);
    } else {
      restoredProduct.id = `prod-${Date.now().toString(36)}`;
      products.unshift(restoredProduct);
    }

    // Log restore event
    deletionLogs.unshift({
      id: `del-log-res-${Date.now()}`,
      productId: restoredProduct.id,
      productTitle: restoredProduct.title,
      sku: restoredProduct.sku,
      category: restoredProduct.category,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser ? currentUser.name : 'Store Admin',
      reason: 'Restored from Recycle Bin',
      unitsRemoved: 0,
      estimatedValueLost: 0,
      action: 'restored'
    });

    notifications.unshift({
      id: `notif-restore-${Date.now()}`,
      type: 'transaction',
      severity: 'success',
      title: `Product Restored: ${restoredProduct.title}`,
      message: `Restored SKU #${restoredProduct.sku} to active store catalog.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
    });

    res.json({
      success: true,
      message: `"${restoredProduct.title}" has been restored to the active catalog!`,
      restoredProduct,
      activeCount: products.length,
      archivedCount: archivedProducts.length
    });
  });

  // 7. Permanently Purge Product from Archive
  app.post('/api/products/:id/purge', (req, res) => {
    const { id } = req.params;
    const index = archivedProducts.findIndex((a) => a.id === id || a.originalProduct.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Archived product not found' });
    }

    const [purged] = archivedProducts.splice(index, 1);

    deletionLogs.unshift({
      id: `del-log-purge-${Date.now()}`,
      productId: purged.originalProduct.id,
      productTitle: purged.originalProduct.title,
      sku: purged.originalProduct.sku,
      category: purged.originalProduct.category,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser ? currentUser.name : 'Store Admin',
      reason: 'Permanent purge from recycle bin',
      unitsRemoved: 0,
      estimatedValueLost: 0,
      action: 'purged'
    });

    res.json({
      success: true,
      message: `"${purged.originalProduct.title}" permanently erased from archives.`,
      archivedCount: archivedProducts.length
    });
  });

  // 8. Get Product Deletion Audit Log
  app.get('/api/products/deletion-log', (req, res) => {
    res.json(deletionLogs);
  });

  // Real-time Inventory Snapshot / Ticker
  app.get('/api/inventory/live', (req, res) => {
    const stockMap: Record<string, { stock: number; variants?: Record<string, number> }> = {};
    products.forEach((p) => {
      const variantStock: Record<string, number> = {};
      if (p.variants) {
        p.variants.forEach((v: any) => {
          variantStock[v.id] = v.stock;
        });
      }
      stockMap[p.id] = {
        stock: p.stock,
        variants: Object.keys(variantStock).length > 0 ? variantStock : undefined,
      };
    });

    res.json({
      timestamp: new Date().toISOString(),
      stocks: stockMap,
      recentEvents: inventoryHistory.slice(-10),
    });
  });

  // Add Product Review
  app.post('/api/products/:id/reviews', (req, res) => {
    const { author, rating, title, comment } = req.body;
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      author: author || 'Verified Shopper',
      rating: Number(rating) || 5,
      date: 'Just now',
      title: title || 'Exceptional Quality',
      comment: comment || 'Very satisfied with this item.',
      verified: true,
    };

    product.reviewCount += 1;
    product.rating = Number(((product.rating * (product.reviewCount - 1) + newReview.rating) / product.reviewCount).toFixed(1));

    res.json({ success: true, review: newReview, updatedProduct: product });
  });

  // Validate Cart for Real-Time Stock Availability
  app.post('/api/checkout/validate-cart', (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    const issues: string[] = [];
    const stockSnapshot: Record<string, number> = {};

    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        issues.push(`Product "${item.title}" is no longer available.`);
        continue;
      }

      let available = prod.stock;
      if (item.variantId && prod.variants) {
        const v = prod.variants.find((vr: any) => vr.id === item.variantId);
        if (v) available = v.stock;
      }

      stockSnapshot[item.id] = available;

      if (available <= 0) {
        issues.push(`"${item.title}" (${item.selectedColor || 'Standard'}) is currently sold out.`);
      } else if (item.quantity > available) {
        issues.push(`Only ${available} unit(s) left in stock for "${item.title}". Please adjust your cart.`);
      }
    }

    res.json({
      valid: issues.length === 0,
      issues,
      stockSnapshot,
    });
  });

  // Process Secure Checkout & Inventory Decrement
  app.post('/api/checkout/process-payment', (req, res) => {
    const { items, shippingAddress, shippingOption, paymentMethod, promoCode } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return res.status(400).json({ error: 'Incomplete shipping address' });
    }

    // Atomic Stock Verification
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(409).json({ error: `Item "${item.title}" is no longer available.` });
      }

      let available = prod.stock;
      if (item.variantId && prod.variants) {
        const v = prod.variants.find((vr: any) => vr.id === item.variantId);
        if (v) available = v.stock;
      }

      if (item.quantity > available) {
        return res.status(409).json({
          error: `Insufficient stock for "${item.title}". Requested ${item.quantity}, but only ${available} available.`,
          currentStock: available,
        });
      }
    }

    // Calculate itemized finances
    let subtotal = 0;
    items.forEach((it: any) => {
      subtotal += it.price * it.quantity;
    });

    let discount = 0;
    if (promoCode) {
      const code = String(promoCode).toUpperCase().trim();
      if (code === 'WELCOME10') {
        discount = subtotal * 0.1;
      } else if (code === 'SAVE20' && subtotal >= 100) {
        discount = 20;
      } else if (code === 'FREESHIP') {
        // Handled in shipping
      }
    }

    const shippingPrice = promoCode === 'FREESHIP' ? 0 : (shippingOption?.price || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * 0.0825).toFixed(2));
    const total = Number((taxableAmount + shippingPrice + tax).toFixed(2));

    // Decrement Live Inventory & Increment Units Sold
    const stockUpdates: any[] = [];
    items.forEach((item: any) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const oldStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.unitsSold = (prod.unitsSold || 0) + item.quantity;

        if (item.variantId && prod.variants) {
          const v = prod.variants.find((vr: any) => vr.id === item.variantId);
          if (v) {
            v.stock = Math.max(0, v.stock - item.quantity);
          }
        }

        const invEvent = {
          productId: prod.id,
          title: prod.title,
          previousStock: oldStock,
          newStock: prod.stock,
          timestamp: new Date().toISOString(),
          reason: 'purchase',
          quantityDelta: -item.quantity,
        };
        inventoryHistory.push(invEvent);
        stockUpdates.push(invEvent);

        // Check if low stock threshold crossed
        if (prod.stock <= prod.lowStockThreshold && prod.stock > 0) {
          notifications.unshift({
            id: `notif-stock-${Date.now()}-${prod.id}`,
            type: 'stock_alert',
            severity: 'warning',
            title: `Low Stock Trigger: ${prod.title}`,
            message: `Only ${prod.stock} unit(s) left in warehouse for SKU ${prod.sku}. Consider restocking.`,
            timestamp: 'Just now',
            read: false,
            targetRole: 'inventory_manager',
            metadata: {
              productId: prod.id,
              productTitle: prod.title,
            }
          });
        }
      }
    });

    // Generate Order Record
    const orderNumber = `POOJA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `tx_sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const trackingNum = `TRK-POOJA-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const carrier = shippingOption?.name?.includes('Overnight') ? 'BlueDart Air Express' : 'FedEx Insured Ground';

    const order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items,
      subtotal,
      discount,
      promoCode,
      shippingCost: shippingPrice,
      shippingOption: shippingOption || {
        id: 'standard',
        name: 'Standard Insured Delivery',
        price: 0,
        estimatedDays: '3-4 Business Days',
        carrier: 'Standard Ground',
      },
      tax,
      total,
      shippingAddress,
      paymentDetails: {
        type: paymentMethod?.type || 'card',
        lastFour: paymentMethod?.lastFour || (paymentMethod?.cardNumber ? paymentMethod.cardNumber.slice(-4) : '8821'),
        brand: paymentMethod?.brand || 'Visa',
        transactionId: txId,
        timestamp: new Date().toISOString(),
      },
      status: 'confirmed',
      trackingNumber: trackingNum,
      trackingCarrier: carrier,
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeline: [
        {
          status: 'confirmed',
          label: 'Order Confirmed & Payment Captured',
          description: 'Payment authorized via 256-bit SSL encrypted gateway.',
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          status: 'processing',
          label: 'Warehouse Fulfillment & Quality Inspection',
          description: 'Picking items from automated high-density fulfillment center.',
          timestamp: 'Estimated 2 hours',
          completed: false,
        },
        {
          status: 'shipped',
          label: `Handoff to ${carrier}`,
          description: 'Tracking manifest created and barcode attached.',
          timestamp: 'Pending dispatch',
          completed: false,
        },
        {
          status: 'delivered',
          label: 'Delivered',
          description: 'Contactless signature delivery at destination.',
          timestamp: 'Pending',
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    orders.unshift(order);
    totalRevenue += total;
    totalOrders += 1;

    // Dispatch real-time transaction notification
    notifications.unshift({
      id: `notif-tx-${Date.now()}`,
      type: 'transaction',
      severity: 'success',
      title: `Order Captured: #${orderNumber}`,
      message: `Processed $${total} via ${paymentMethod?.brand || 'Encrypted Gateway'} for ${shippingAddress.fullName}.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: total,
        txId,
        carrier
      }
    });

    res.json({
      success: true,
      order,
      stockUpdates,
    });
  });

  // --- REAL-TIME PAYMENT GATEWAY INTENTS & INSTANT VERIFICATION ---
  app.post('/api/payment/create-intent', (req, res) => {
    const { amount, currency = 'USD', paymentMethod, itemsCount = 1 } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const intentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const txId = `tx_live_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `POOJA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const upiQrPayload = `upi://pay?pa=poojastore@okaxis&pn=Pooja%20Store&am=${amount}&cu=USD&tn=Order%20${orderNumber}`;

    const intent = {
      intentId,
      transactionId: txId,
      orderNumber,
      amount: Number(amount),
      currency,
      gatewayProvider: paymentMethod === 'upi' ? 'UPI-Direct' : paymentMethod === 'netbanking' ? 'HDFC-Bank' : 'RazorPay',
      status: 'awaiting_payment', // 'created' | 'awaiting_payment' | 'authorized' | 'captured' | 'failed'
      upiQrPayload,
      expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      challengeUrl: `https://gateway.poojastore.internal/auth/3ds/${intentId}`,
      createdAt: new Date().toISOString(),
    };

    paymentIntents[intentId] = intent;

    res.json({
      success: true,
      intent,
    });
  });

  app.get('/api/payment/status/:intentId', (req, res) => {
    const { intentId } = req.params;
    const intent = paymentIntents[intentId];
    if (!intent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }
    res.json({ success: true, intent });
  });

  // Real-time verification of OTP for 3DS or COD
  app.post('/api/payment/verify-otp', (req, res) => {
    const { otp, intentId, type } = req.body;
    const cleanOtp = String(otp || '').trim();

    // Standard simulated valid OTPs: '882910', '123456', or any 6-digit code
    if (cleanOtp.length >= 4 && cleanOtp !== '000000') {
      if (intentId && paymentIntents[intentId]) {
        paymentIntents[intentId].status = 'authorized';
      }
      return res.json({
        success: true,
        verified: true,
        message: '3D-Secure Cryptographic Token verified successfully',
        authorizationCode: `AUTH_${Date.now().toString(36).toUpperCase()}`,
      });
    }

    res.status(400).json({
      success: false,
      verified: false,
      error: 'Invalid OTP code. Please use standard demo OTP (882910).',
    });
  });

  // Real-time simulated UPI App approval webhook
  app.post('/api/payment/simulate-qr-scan', (req, res) => {
    const { intentId } = req.body;
    if (intentId && paymentIntents[intentId]) {
      paymentIntents[intentId].status = 'authorized';
      paymentIntents[intentId].authorizedAt = new Date().toISOString();
      return res.json({
        success: true,
        intent: paymentIntents[intentId],
        message: 'UPI App authorized payment in real time!',
      });
    }
    res.json({ success: true, message: 'Simulated payment authorization verified' });
  });

  // --- Dynamic Role-Based Authentication & User Profiles ---
  app.get('/api/auth/current-user', (req, res) => {
    res.json(currentUser);
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ authenticated: !!currentUser, user: currentUser });
  });

  app.get('/api/auth/users', (req, res) => {
    res.json(Object.values(users));
  });

  // User Registration
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone, role = 'customer' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const emailKey = email.toLowerCase().trim();
    const existing = Object.values(users).find((u: any) => u.email.toLowerCase() === emailKey);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }

    const userId = `usr-reg-${Date.now()}`;
    const newUser = {
      id: userId,
      name: name.trim(),
      email: emailKey,
      role: role as any,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      department: role === 'customer' ? 'VIP Member' : 'Store Operations',
      phone: phone || '+91 98000 00000',
      badge: role === 'admin' ? 'Store Admin' : role === 'analyst' ? 'Financial Analyst' : role === 'inventory_manager' ? 'Inventory Officer' : 'Verified Member',
      permissions: users[role]?.permissions || ['view_own_orders', 'place_orders', 'leave_reviews'],
      loyaltyPoints: 100, // Welcome bonus
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ordersCount: 0,
    };

    users[userId] = newUser;
    currentUser = newUser;

    // Welcome Notification
    notifications.unshift({
      id: `notif-welcome-${Date.now()}`,
      type: 'transaction',
      severity: 'success',
      title: `Welcome to Pooja Store, ${newUser.name}!`,
      message: `Your account is active with 100 complimentary VIP loyalty reward points.`,
      timestamp: 'Just now',
      read: false,
      targetRole: newUser.role,
    });

    res.json({
      success: true,
      message: 'Account created successfully!',
      user: newUser,
    });
  });

  // User Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const emailKey = String(email).toLowerCase().trim();
    
    // Check if matching registered or demo user
    let matchedUser: any = Object.values(users).find((u: any) => u.email.toLowerCase() === emailKey);

    if (!matchedUser && role && users[role]) {
      matchedUser = users[role];
    }

    if (!matchedUser) {
      // Auto-provision demo account for quick frictionless testing
      const roleType = (role as any) || 'customer';
      const nameParts = emailKey.split('@')[0].split('.');
      const formattedName = nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Valued Shopper';

      matchedUser = {
        id: `usr-${Date.now()}`,
        name: formattedName,
        email: emailKey,
        role: roleType,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        department: roleType === 'customer' ? 'VIP Member' : 'Operations',
        phone: '+91 98765 43210',
        badge: roleType === 'admin' ? 'Store Admin' : roleType === 'analyst' ? 'Financial Analyst' : roleType === 'inventory_manager' ? 'Inventory Officer' : 'Verified Member',
        permissions: users[roleType]?.permissions || ['view_own_orders', 'place_orders'],
        loyaltyPoints: 150,
        memberSince: 'Sep 2026',
        ordersCount: 1,
      };
      users[matchedUser.id] = matchedUser;
    }

    currentUser = matchedUser;

    notifications.unshift({
      id: `notif-login-${Date.now()}`,
      type: 'transaction',
      severity: 'info',
      title: `User Signed In: ${currentUser.name}`,
      message: `Authenticated as ${currentUser.badge} (${currentUser.email}).`,
      timestamp: 'Just now',
      read: true,
      targetRole: currentUser.role,
    });

    res.json({
      success: true,
      message: `Welcome back, ${currentUser.name}!`,
      user: currentUser,
    });
  });

  // User Logout
  app.post('/api/auth/logout', (req, res) => {
    // Reset to Customer default
    currentUser = users.customer || {
      id: 'usr-guest',
      name: 'Guest Shopper',
      email: 'guest@poojastore.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      badge: 'Guest Shopper',
      permissions: ['place_orders', 'view_own_orders'],
    };

    res.json({ success: true, message: 'Logged out successfully', user: currentUser });
  });

  // Forgot Password
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    res.json({
      success: true,
      message: `Password reset link has been dispatched to ${email}. Please check your inbox.`,
    });
  });

  app.post('/api/auth/switch-role', (req, res) => {
    const { role, customUser } = req.body;
    if (role && users[role]) {
      currentUser = users[role];
    } else if (customUser && customUser.name && customUser.role) {
      currentUser = {
        ...customUser,
        id: customUser.id || `usr-${Date.now()}`,
        avatar: customUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        permissions: users[customUser.role]?.permissions || ['view_own_orders', 'place_orders'],
      };
      users[currentUser.id] = currentUser;
    } else {
      return res.status(400).json({ error: 'Invalid user or role' });
    }

    // Record user activity
    notifications.unshift({
      id: `notif-auth-${Date.now()}`,
      type: 'transaction',
      severity: 'info',
      title: `User Session Active: ${currentUser.name}`,
      message: `Switched to role "${currentUser.badge}" with department "${currentUser.department || 'Operations'}".`,
      timestamp: 'Just now',
      read: true,
      targetRole: currentUser.role,
    });

    res.json({ success: true, user: currentUser });
  });

  // --- Product Profitability & Benefit Analysis Engine ---
  app.get('/api/analytics/product-profitability', (req, res) => {
    const analyses = products.map((p) => {
      const price = Number(p.price);
      const costPrice = Number(p.costPrice || (price * 0.45).toFixed(2));
      const unitsSold = Number(p.unitsSold || 0);
      const stock = Number(p.stock || 0);

      const totalRevenue = Number((price * unitsSold).toFixed(2));
      const totalCost = Number((costPrice * unitsSold).toFixed(2));
      const grossProfit = Number((totalRevenue - totalCost).toFixed(2));
      const grossMarginPercent = Number((((price - costPrice) / price) * 100).toFixed(1));
      const inventoryValue = Number((costPrice * stock).toFixed(2));
      const potentialProfit = Number(((price - costPrice) * stock).toFixed(2));

      // Classification Matrix
      let classification: 'star_performer' | 'cash_cow' | 'high_margin_gem' | 'low_margin_drag' = 'cash_cow';
      let recommendation = '';
      let benefitScore = 50;

      if (grossMarginPercent >= 50 && unitsSold >= 40) {
        classification = 'star_performer';
        recommendation = 'Top core profit driver: Maintain high inventory buffer, prioritize in homepage spotlight.';
        benefitScore = Math.min(100, Math.round(75 + (grossProfit / 1000) * 2 + grossMarginPercent * 0.2));
      } else if (grossMarginPercent < 50 && unitsSold >= 50) {
        classification = 'cash_cow';
        recommendation = 'High volume champion: Consistent cash generation. Explore small 3-5% price hike or supplier bulk discount.';
        benefitScore = Math.min(95, Math.round(65 + (grossProfit / 1200) * 2));
      } else if (grossMarginPercent >= 50 && unitsSold < 40) {
        classification = 'high_margin_gem';
        recommendation = 'High margin upside: Lucrative unit economics. Boost discovery via AI Concierge and targeted email campaign.';
        benefitScore = Math.min(90, Math.round(60 + grossMarginPercent * 0.4));
      } else {
        classification = 'low_margin_drag';
        recommendation = 'Low margin drag: Review supplier COGS or bundle with higher-margin accessories to protect bottom line.';
        benefitScore = Math.max(20, Math.round(30 + (grossProfit / 2000)));
      }

      return {
        productId: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        thumbnail: p.thumbnail,
        price,
        costPrice,
        unitsSold,
        stock,
        totalRevenue,
        totalCost,
        grossProfit,
        grossMarginPercent,
        inventoryValue,
        potentialProfit,
        classification,
        benefitScore,
        recommendation,
        isBenefitingOverall: grossProfit > 1500 && grossMarginPercent >= 35,
      };
    });

    // Sort by Total Gross Profit descending
    analyses.sort((a, b) => b.grossProfit - a.grossProfit);

    const totalRev = analyses.reduce((acc, it) => acc + it.totalRevenue, 0);
    const totalCost = analyses.reduce((acc, it) => acc + it.totalCost, 0);
    const netGrossProfit = Number((totalRev - totalCost).toFixed(2));
    const totalUnits = analyses.reduce((acc, it) => acc + it.unitsSold, 0);
    const averageMarginPercent = totalRev > 0 ? Number(((netGrossProfit / totalRev) * 100).toFixed(1)) : 0;

    // Category breakdown
    const catMap: Record<string, { revenue: number; cost: number; units: number }> = {};
    analyses.forEach((a) => {
      if (!catMap[a.category]) {
        catMap[a.category] = { revenue: 0, cost: 0, units: 0 };
      }
      catMap[a.category].revenue += a.totalRevenue;
      catMap[a.category].cost += a.totalCost;
      catMap[a.category].units += a.unitsSold;
    });

    const categoryBreakdown = Object.keys(catMap).map((catId) => {
      const catObj = categories.find((c: any) => c.id === catId);
      const d = catMap[catId];
      const profit = d.revenue - d.cost;
      return {
        category: catId,
        categoryName: catObj ? catObj.name : catId,
        revenue: Number(d.revenue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        marginPercent: d.revenue > 0 ? Number(((profit / d.revenue) * 100).toFixed(1)) : 0,
        unitsSold: d.units,
      };
    });

    categoryBreakdown.sort((a, b) => b.profit - a.profit);

    res.json({
      totalRevenue: totalRev,
      totalCostOfGoods: totalCost,
      netGrossProfit,
      averageMarginPercent,
      totalUnitsSold: totalUnits,
      topBenefitingProduct: analyses[0],
      leastBenefitingProduct: analyses[analyses.length - 1],
      productAnalyses: analyses,
      categoryBreakdown,
    });
  });

  // Price & Margin Simulation
  app.post('/api/analytics/simulate-price-margin', (req, res) => {
    const { productId, simulatedPrice, simulatedCostPrice, simulatedVolumeBoost } = req.body;
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentPrice = prod.price;
    const currentCost = prod.costPrice || currentPrice * 0.45;
    const currentUnits = prod.unitsSold || 50;

    const newPrice = typeof simulatedPrice === 'number' ? simulatedPrice : currentPrice;
    const newCost = typeof simulatedCostPrice === 'number' ? simulatedCostPrice : currentCost;
    const volumeMultiplier = 1 + (Number(simulatedVolumeBoost || 0) / 100);
    const newUnits = Math.round(currentUnits * volumeMultiplier);

    const currentProfit = (currentPrice - currentCost) * currentUnits;
    const projectedRevenue = newPrice * newUnits;
    const projectedCost = newCost * newUnits;
    const projectedProfit = projectedRevenue - projectedCost;
    const profitDelta = projectedProfit - currentProfit;
    const projectedMargin = Number((((newPrice - newCost) / newPrice) * 100).toFixed(1));

    res.json({
      productId: prod.id,
      title: prod.title,
      current: {
        price: currentPrice,
        costPrice: currentCost,
        units: currentUnits,
        profit: Number(currentProfit.toFixed(2)),
        margin: Number((((currentPrice - currentCost) / currentPrice) * 100).toFixed(1)),
      },
      projected: {
        price: newPrice,
        costPrice: newCost,
        units: newUnits,
        revenue: Number(projectedRevenue.toFixed(2)),
        profit: Number(projectedProfit.toFixed(2)),
        margin: projectedMargin,
        profitDelta: Number(profitDelta.toFixed(2)),
        percentGain: currentProfit > 0 ? Number(((profitDelta / currentProfit) * 100).toFixed(1)) : 0,
      }
    });
  });

  // --- Real-time Notifications & Malfunction Alerts ---
  app.get('/api/notifications', (req, res) => {
    const { role } = req.query;
    let filtered = [...notifications];
    if (role && typeof role === 'string' && role !== 'all') {
      filtered = filtered.filter((n) => n.targetRole === 'all' || n.targetRole === role);
    }
    res.json(filtered);
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { id } = req.body;
    if (id) {
      const n = notifications.find((it: any) => it.id === id);
      if (n) n.read = true;
    } else {
      notifications.forEach((n: any) => { n.read = true; });
    }
    res.json({ success: true, count: notifications.filter((n: any) => !n.read).length });
  });

  // Admin: Trigger Simulated System Malfunction or Anomaly
  app.post('/api/notifications/trigger-malfunction', (req, res) => {
    const { type, customMessage, severity } = req.body;

    const malfunctionTypes: Record<string, { title: string; defaultMsg: string; code: string; recovery: string }> = {
      payment_gateway_timeout: {
        title: 'Payment Gateway 504 Timeout Alert',
        defaultMsg: 'Primary payment processor encountered latency spike exceeding 3,000ms. Fallback gateway initiated.',
        code: 'ERR_GATEWAY_TIMEOUT_504',
        recovery: 'Switched to redundant backup processor. Retry pending transactions.',
      },
      inventory_desync: {
        title: 'Inventory Sync Anomaly Detected',
        defaultMsg: 'High concurrency checkout caused a 2-unit stock variance between warehouse buffer and frontend cache.',
        code: 'ERR_INV_RACE_CONDITION',
        recovery: 'Automated lock reconciler executed. Stock counts re-aligned.',
      },
      webhook_failure: {
        title: 'Courier Logistics Webhook Malfunction',
        defaultMsg: 'Delivery status webhook dropped 3 tracking updates due to partner endpoint HTTP 502.',
        code: 'ERR_LOGISTICS_WEBHOOK_502',
        recovery: 'Queued exponential backoff replay worker.',
      },
      high_api_latency: {
        title: 'High API Latency & Memory Pressure',
        defaultMsg: 'AI Shopping Concierge endpoint latency elevated to 920ms under heavy shopper traffic.',
        code: 'WARN_HIGH_LATENCY',
        recovery: 'Auto-scaled server worker threads and activated edge cache.',
      },
    };

    const targetType = malfunctionTypes[type] || malfunctionTypes.payment_gateway_timeout;

    systemHealth.status = severity === 'critical' ? 'critical' : 'degraded';
    systemHealth.gatewayStatus = 'failover_secondary';
    systemHealth.activeMalfunctionsCount += 1;

    const newNotification = {
      id: `malfunc-${Date.now()}`,
      type: 'malfunction',
      severity: severity || 'critical',
      title: targetType.title,
      message: customMessage || targetType.defaultMsg,
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      isResolved: false,
      metadata: {
        errorCode: targetType.code,
        recoveryAction: targetType.recovery,
      }
    };

    notifications.unshift(newNotification);

    res.json({
      success: true,
      notification: newNotification,
      systemHealth,
    });
  });

  // Admin: Resolve Malfunction
  app.post('/api/notifications/resolve', (req, res) => {
    const { id } = req.body;
    const target = notifications.find((n: any) => n.id === id);
    if (target) {
      target.isResolved = true;
      target.read = true;
    }

    const unresolvedCount = notifications.filter((n: any) => n.type === 'malfunction' && !n.isResolved).length;
    systemHealth.activeMalfunctionsCount = unresolvedCount;
    if (unresolvedCount === 0) {
      systemHealth.status = 'healthy';
      systemHealth.gatewayStatus = 'active';
    }

    // Broadcast recovery notice
    notifications.unshift({
      id: `resolved-${Date.now()}`,
      type: 'malfunction',
      severity: 'success',
      title: `Resolved: ${target ? target.title : 'System Anomaly'}`,
      message: 'System self-diagnostic completed. All payment gateways and warehouse feeds operational.',
      timestamp: 'Just now',
      read: false,
      targetRole: 'all',
      isResolved: true,
    });

    res.json({ success: true, systemHealth, notifications });
  });

  // System Health Status
  app.get('/api/system/health', (req, res) => {
    systemHealth.lastHeartbeat = new Date().toISOString();
    systemHealth.gatewayLatencyMs = systemHealth.status === 'healthy' ? Math.floor(120 + Math.random() * 40) : Math.floor(450 + Math.random() * 300);
    res.json(systemHealth);
  });

  // Get Order By ID
  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Get All Orders
  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  // Admin / Store Manager: Update or Restock Inventory
  app.post('/api/inventory/update', (req, res) => {
    const { productId, variantId, newStock, deltaStock, price, title } = req.body;

    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousStock = prod.stock;

    if (variantId && prod.variants) {
      const v = prod.variants.find((vr: any) => vr.id === variantId);
      if (v) {
        if (typeof newStock === 'number') {
          v.stock = Math.max(0, newStock);
        } else if (typeof deltaStock === 'number') {
          v.stock = Math.max(0, v.stock + deltaStock);
        }
      }
      // Re-sum total product stock
      prod.stock = prod.variants.reduce((acc: number, item: any) => acc + item.stock, 0);
    } else {
      if (typeof newStock === 'number') {
        prod.stock = Math.max(0, newStock);
      } else if (typeof deltaStock === 'number') {
        prod.stock = Math.max(0, prod.stock + deltaStock);
      }
    }

    if (typeof price === 'number' && price > 0) {
      prod.price = price;
    }
    if (title && typeof title === 'string') {
      prod.title = title;
    }

    const invEvent = {
      productId: prod.id,
      title: prod.title,
      previousStock,
      newStock: prod.stock,
      timestamp: new Date().toISOString(),
      reason: deltaStock && deltaStock > 0 ? 'restock' : 'manual_adjustment',
      quantityDelta: prod.stock - previousStock,
    };
    inventoryHistory.push(invEvent);

    res.json({
      success: true,
      updatedProduct: prod,
      inventoryEvent: invEvent,
    });
  });

  // Simulate Random Purchase (for real-time stock drop demonstration)
  app.post('/api/inventory/simulate-purchase', (req, res) => {
    const available = products.filter((p) => p.stock > 0);
    if (available.length === 0) {
      return res.json({ message: 'All items sold out' });
    }
    const target = available[Math.floor(Math.random() * available.length)];
    target.stock = Math.max(0, target.stock - 1);

    if (target.variants && target.variants.length > 0) {
      const v = target.variants.find((vr: any) => vr.stock > 0) || target.variants[0];
      if (v) v.stock = Math.max(0, v.stock - 1);
    }

    const invEvent = {
      productId: target.id,
      title: target.title,
      previousStock: target.stock + 1,
      newStock: target.stock,
      timestamp: new Date().toISOString(),
      reason: 'purchase',
      quantityDelta: -1,
    };
    inventoryHistory.push(invEvent);

    res.json({ success: true, product: target, event: invEvent });
  });

  // Reset Inventory to Defaults
  app.post('/api/inventory/reset', (req, res) => {
    products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    categories = JSON.parse(JSON.stringify(CATEGORIES));
    inventoryHistory = [];
    res.json({ success: true, products });
  });

  // Store Analytics & Stats
  app.get('/api/stats', (req, res) => {
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const totalInventoryCount = products.reduce((acc, p) => acc + p.stock, 0);

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalInventoryCount,
      lowStockCount,
      outOfStockCount,
      activeLiveShoppers: Math.floor(28 + Math.random() * 15),
    });
  });

  // Server-side Gemini AI Shopping Concierge (both endpoints /api/ai/assistant and /api/ai/concierge)
  const aiHandler = async (req: express.Request, res: express.Response) => {
    const query = req.body.message || req.body.query || '';

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query or message is required' });
    }

    const gemini = getGeminiClient();

    // Prepare live store inventory context
    const inventorySummary = products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      stock: p.stock,
      inStock: p.stock > 0,
      badges: p.badges || [],
      highlights: p.highlights,
    }));

    if (!gemini) {
      // Graceful fallback if no GEMINI_API_KEY is configured
      const q = query.toLowerCase();
      const matched = products.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q))
      ).slice(0, 3);

      return res.json({
        reply: matched.length > 0
          ? `I found ${matched.length} great option(s) in Pooja Store matching "${query}". Here are our top recommendations currently in stock with immediate dispatch:`
          : `Welcome to Pooja Store! We have a curated range of high-end Audio, Wearables, Apparel, Ergonomic Living, and Gourmet Specialty items with live inventory. How can I help you today?`,
        recommendedProductIds: matched.map((p) => p.id),
      });
    }

    try {
      const systemInstruction = `You are Pooja AI, an ultra-knowledgeable, sophisticated, and friendly AI Shopping Concierge for "Pooja Store".
You have real-time access to our live inventory catalog and profit metrics:
${JSON.stringify(inventorySummary, null, 2)}

Instructions:
1. Answer customer queries with precise, helpful, and concise advice (e.g. recommending items by budget, category, feature, gift ideas, or compatibility).
2. Always mention live stock availability (e.g. "We currently have 7 units in stock", "Only 2 left in stock!").
3. Return your response in JSON format with fields:
   - "reply": Markdown formatted string with elegant, helpful styling and bullet points.
   - "recommendedProductIds": Array of matching product ID strings from the catalog (max 3-4 items).
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      let parsed = { reply: '', recommendedProductIds: [] };
      try {
        parsed = JSON.parse(responseText);
      } catch (err) {
        parsed = { reply: responseText, recommendedProductIds: [] };
      }

      res.json({
        reply: parsed.reply || "Here are recommendations tailored to your request:",
        recommendedProductIds: Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [],
      });
    } catch (err: any) {
      console.error('Gemini Assistant Error:', err);
      // Fallback
      res.json({
        reply: `Here are our best matching selections currently available with live inventory tracking:`,
        recommendedProductIds: products.slice(0, 3).map((p) => p.id),
      });
    }
  };

  app.post('/api/ai/assistant', aiHandler);
  app.post('/api/ai/concierge', aiHandler);

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pooja Store server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
