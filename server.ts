import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { CATEGORIES, INITIAL_PRODUCTS, MOCK_REVIEWS_POOL } from './src/data/mockProducts.js';

// Setup ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Live State
let products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let categories = JSON.parse(JSON.stringify(CATEGORIES));
let orders: any[] = [];
let inventoryHistory: any[] = [];
let totalRevenue = 14850;
let totalOrders = 38;

// Initial sample recent orders
orders.push({
  id: 'ord-9821',
  orderNumber: 'AUR-9821-9382',
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
    fullName: 'David K. Sterling',
    email: 'david.sterling@example.com',
    phone: '+1 (555) 392-8192',
    street: '742 Evergreen Terrace',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'United States'
  },
  paymentDetails: {
    type: 'card',
    lastFour: '4242',
    brand: 'Visa',
    transactionId: 'tx_sec_99482710384',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  status: 'processing',
  trackingNumber: 'TRK-AUR-8472910',
  trackingCarrier: 'FedEx Express',
  estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  timeline: [
    { status: 'confirmed', label: 'Order Confirmed & Paid', description: 'Cryptographic payment authorization verified.', timestamp: '4 hours ago', completed: true },
    { status: 'processing', label: 'Fulfillment & Quality Check', description: 'Item picked from automated climate warehouse.', timestamp: '2 hours ago', completed: true, current: true },
    { status: 'shipped', label: 'Departed Facility', description: 'Awaiting handoff to FedEx courier hub.', timestamp: 'Pending', completed: false },
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

    // Decrement Live Inventory
    const stockUpdates: any[] = [];
    items.forEach((item: any) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const oldStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);

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
      }
    });

    // Generate Order Record
    const orderNumber = `AUR-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `tx_sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const trackingNum = `TRK-AURA-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const carrier = shippingOption?.name?.includes('Overnight') ? 'FedEx Priority Overnight' : 'DHL Express Worldwide';

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
          label: 'Order Confirmed & Paid',
          description: 'Payment authorized via 256-bit SSL encrypted gateway.',
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          status: 'processing',
          label: 'Fulfillment & Warehouse Packaging',
          description: 'Picking items from high-speed fulfillment hub.',
          timestamp: 'Estimated 2 hours',
          completed: false,
        },
        {
          status: 'shipped',
          label: `Handoff to ${carrier}`,
          description: 'Tracking number generated and assigned.',
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

    res.json({
      success: true,
      order,
      stockUpdates,
    });
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
          ? `I found ${matched.length} great option(s) in our store matching "${query}". Here are our top recommendations currently in stock with immediate dispatch:`
          : `Welcome to Aura Commerce! We have a curated range of high-end Audio, Wearables, Apparel, Ergonomic Living, and Gourmet Specialty items with live inventory. How can I help you today?`,
        recommendedProductIds: matched.map((p) => p.id),
      });
    }

    try {
      const systemInstruction = `You are Aura, an ultra-knowledgeable, sophisticated, and friendly AI Shopping Concierge for "Aura Commerce".
You have real-time access to our live inventory catalog:
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
    console.log(`Aura Commerce server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
