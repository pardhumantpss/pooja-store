import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Departments',
    description: 'Explore our entire curated collection with real-time stock availability.',
    icon: 'LayoutGrid',
    itemCount: 24,
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'all', name: 'All Products', itemCount: 24 }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    description: 'Studio acoustics, intelligent wearables, and next-gen workstation accessories.',
    icon: 'Headphones',
    itemCount: 6,
    bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'audio', name: 'Audiophile & Headphones', itemCount: 3 },
      { id: 'wearables', name: 'Smart Wearables & Tech', itemCount: 2 },
      { id: 'desk', name: 'Workstation Accessories', itemCount: 1 }
    ]
  },
  {
    id: 'fashion',
    name: 'Apparel & Leathercraft',
    description: 'Timeless tailored garments, Japanese selvedge, and minimalist full-grain goods.',
    icon: 'Shirt',
    itemCount: 5,
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'outerwear', name: 'Jackets & Coats', itemCount: 2 },
      { id: 'bags', name: 'Bags & Carry', itemCount: 2 },
      { id: 'footwear', name: 'Footwear & Boots', itemCount: 1 }
    ]
  },
  {
    id: 'home',
    name: 'Home & Living',
    description: 'Scandinavian furniture, warm architectural illumination, and pour-over coffee craft.',
    icon: 'Armchair',
    itemCount: 5,
    bannerImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'furniture', name: 'Ergonomic & Living', itemCount: 2 },
      { id: 'lighting', name: 'Ambient Lighting', itemCount: 2 },
      { id: 'kitchen', name: 'Barista & Kitchen', itemCount: 1 }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Adventure',
    description: 'Technical mountain gear, precision recovery tools, and ultra-durable carry.',
    icon: 'Compass',
    itemCount: 4,
    bannerImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'recovery', name: 'Recovery & Performance', itemCount: 2 },
      { id: 'outdoors', name: 'Camping & Trail', itemCount: 2 }
    ]
  },
  {
    id: 'gourmet',
    name: 'Artisanal & Gourmet',
    description: 'Single-origin micro-lot beans, organic botanical extracts, and small-batch pantry essentials.',
    icon: 'Coffee',
    itemCount: 4,
    bannerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=80',
    subcategories: [
      { id: 'coffee', name: 'Specialty Coffee', itemCount: 2 },
      { id: 'botanicals', name: 'Organic Teas & Herbs', itemCount: 2 }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Electronics
  {
    id: 'prod-01',
    title: 'Aura Horizon Studio ANC Headphones',
    subtitle: 'Planar magnetic acoustic drivers with adaptive hybrid noise cancellation',
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Aura Studio',
    price: 349,
    originalPrice: 420,
    discountPercent: 17,
    rating: 4.9,
    reviewCount: 142,
    stock: 7,
    lowStockThreshold: 10,
    sku: 'AUR-HP-900',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Crafted with precision-machined aluminum housings and memory-foam lambskin ear cushions. The Horizon Studio delivers lossless 24-bit/96kHz high-resolution audio over ultra-low-latency wireless connectivity, with 40-hour continuous battery life.',
    highlights: [
      'Custom 45mm planar magnetic transducers',
      'Hybrid active noise cancellation with 4 transparency levels',
      '40-hour playback with 10-minute fast charging',
      'Multipoint Bluetooth 5.3 + USB-C lossless audio input'
    ],
    specs: {
      'Frequency Response': '10Hz - 45,000Hz',
      'Impedance': '32 Ohms',
      'Weight': '275 grams',
      'Battery': '850 mAh Li-ion (40h runtime)',
      'Connectivity': 'Bluetooth 5.3, USB-C, 3.5mm Aux'
    },
    variants: [
      { id: 'v-01-black', colorName: 'Matte Obsidian', colorHex: '#18181b', stock: 4, sku: 'AUR-HP-900-BLK' },
      { id: 'v-01-silver', colorName: 'Lunar Silver', colorHex: '#cbd5e1', stock: 3, sku: 'AUR-HP-900-SLV' }
    ],
    badges: ['Bestseller', 'Staff Pick'],
    tags: ['wireless', 'noise-cancelling', 'audiophile', 'hifi', 'usb-c'],
    isFeatured: true
  },
  {
    id: 'prod-02',
    title: 'Vanguard Chrono Smartwatch Titanium',
    subtitle: 'Aerospace-grade titanium casing with sapphire glass and 14-day battery',
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'Vanguard',
    price: 489,
    originalPrice: 550,
    discountPercent: 11,
    rating: 4.8,
    reviewCount: 98,
    stock: 4, // Low stock!
    lowStockThreshold: 5,
    sku: 'VAN-WT-700',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Engineered for athletes, travelers, and executives. The Vanguard Chrono features dual-band multi-constellation GPS, biometric ECG sensor, and an always-on 1.4-inch AMOLED display visible in direct desert sunlight.',
    highlights: [
      'Grade 5 Titanium bezel with scratchproof sapphire crystal',
      '100-meter water resistance with dive computer metrics',
      'Advanced optical heart rate, SpO2, and HRV sleep diagnostics',
      'Up to 14 days of battery life on a single charge'
    ],
    specs: {
      'Display': '1.4" AMOLED (454 x 454 px, 1500 nits)',
      'Case Material': 'Titanium Grade 5',
      'Water Rating': '10 ATM (100 meters)',
      'Sensors': 'ECG, Optical PPG, Compass, Altimeter, Gyroscope'
    },
    variants: [
      { id: 'v-02-slate', colorName: 'Space Grey', colorHex: '#334155', stock: 2, sku: 'VAN-WT-700-GRY' },
      { id: 'v-02-silver', colorName: 'Raw Titanium', colorHex: '#94a3b8', stock: 2, sku: 'VAN-WT-700-RAW' }
    ],
    badges: ['Low Stock', 'Premium'],
    tags: ['smartwatch', 'titanium', 'fitness', 'gps', 'ecg'],
    isFeatured: true
  },
  {
    id: 'prod-03',
    title: 'Lumina Wireless Desk Charging Mat',
    subtitle: 'Hand-stitched Tuscan leather with dual 15W Qi2 wireless charging zones',
    category: 'electronics',
    subcategory: 'desk',
    brand: 'Lumina Craft',
    price: 119,
    rating: 4.7,
    reviewCount: 64,
    stock: 18,
    lowStockThreshold: 5,
    sku: 'LUM-PAD-100',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Elevate your workspace aesthetic with supple vegetable-tanned leather and magnetic alignment charging. Powers your phone and earbuds simultaneously without cable clutter.',
    highlights: [
      'Genuine Italian vegetable-tanned leather surface',
      'Dual 15W Qi2 fast charging coils with thermal regulation',
      'Braided 2-meter USB-C power delivery cable included',
      'Anti-slip cork base made from sustainable bark'
    ],
    specs: {
      'Dimensions': '800mm x 350mm x 4mm',
      'Charging Standard': 'Qi2 15W + 15W Simultaneous',
      'Input': 'USB-C PD 3.0 (45W Recommended)',
      'Materials': 'Top-Grain Leather, Natural Cork, Aluminum'
    },
    variants: [
      { id: 'v-03-saddle', colorName: 'Saddle Tan', colorHex: '#b45309', stock: 10, sku: 'LUM-PAD-100-TAN' },
      { id: 'v-03-black', colorName: 'Midnight Black', colorHex: '#0f172a', stock: 8, sku: 'LUM-PAD-100-BLK' }
    ],
    badges: ['Top Rated'],
    tags: ['desk-mat', 'wireless-charger', 'leather', 'workspace'],
    isFeatured: false
  },
  {
    id: 'prod-04',
    title: 'Sonosfera Acoustic Bookshelf Monitors',
    subtitle: 'Pair of handcrafted walnut speakers with custom silk dome tweeters',
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Aura Studio',
    price: 580,
    originalPrice: 650,
    discountPercent: 11,
    rating: 5.0,
    reviewCount: 38,
    stock: 3, // Low stock
    lowStockThreshold: 4,
    sku: 'AUR-SPK-400',
    thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Acoustically tuned solid North American walnut cabinets. Features class-D amplification, optical inputs, Bluetooth aptX HD, and dedicated subwoofer pre-out.',
    highlights: [
      'Solid hardwood walnut acoustic chambers',
      '120W total peak power with bi-amplified architecture',
      'Optical, RCA, AUX, and aptX HD Bluetooth inputs'
    ],
    specs: {
      'Power Output': '60W RMS per channel (120W total)',
      'Drivers': '4.5" Kevlar Woofers + 1" Silk Tweeters',
      'Dimensions': '240mm x 150mm x 180mm each'
    },
    variants: [
      { id: 'v-04-walnut', colorName: 'Natural Walnut', colorHex: '#78350f', stock: 2, sku: 'AUR-SPK-400-WAL' },
      { id: 'v-04-oak', colorName: 'White Oak', colorHex: '#d6d3d1', stock: 1, sku: 'AUR-SPK-400-OAK' }
    ],
    badges: ['Low Stock', 'Staff Pick'],
    tags: ['speakers', 'bookshelf', 'walnut', 'audiophile', 'hifi'],
    isFeatured: true
  },
  {
    id: 'prod-05',
    title: 'Pulse True Wireless ANC Earbuds',
    subtitle: 'Spatial audio with dynamic head tracking and IPX5 splash resistance',
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Aura Studio',
    price: 179,
    rating: 4.6,
    reviewCount: 215,
    stock: 22,
    lowStockThreshold: 8,
    sku: 'AUR-EB-200',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Compact wireless audio powerhouse with 8 hours in-ear playback and 32 total hours in the wireless charging case. Features adaptive wind cancellation and 6-mic beamforming clarity.',
    highlights: [
      'Dynamic spatial audio with real-time head tracking',
      'Wind-reduction acoustic mesh design',
      'Qi wireless charging case with battery LED indicators'
    ],
    specs: {
      'Driver Size': '11mm Graphene driver',
      'Battery Life': '8 hours (32 hours with case)',
      'Water Rating': 'IPX5 Water & Sweat resistant'
    },
    variants: [
      { id: 'v-05-white', colorName: 'Frost White', colorHex: '#f8fafc', stock: 12, sku: 'AUR-EB-200-WHT' },
      { id: 'v-05-matte', colorName: 'Stealth Black', colorHex: '#18181b', stock: 10, sku: 'AUR-EB-200-BLK' }
    ],
    badges: ['Bestseller'],
    tags: ['earbuds', 'wireless', 'anc', 'ipx5'],
    isFeatured: false
  },
  {
    id: 'prod-06',
    title: 'Aura Smart Ring Health Tracker',
    subtitle: 'Ultra-thin medical-grade titanium tracker for sleep, recovery, and stress',
    category: 'electronics',
    subcategory: 'wearables',
    brand: 'Vanguard',
    price: 299,
    originalPrice: 349,
    discountPercent: 14,
    rating: 4.8,
    reviewCount: 89,
    stock: 9,
    lowStockThreshold: 6,
    sku: 'VAN-RNG-300',
    thumbnail: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Weightless titanium smart ring with medical-grade infrared optical sensors. Seamlessly syncs with iOS & Android with zero subscription fees.',
    highlights: [
      'Sub-millimeter biometric ring weighing under 4 grams',
      'Body temperature, sleep staging, and readiness score',
      '7-day battery life with magnetic puck charger'
    ],
    specs: {
      'Material': 'Titanium with PVD Diamond-Like Coating',
      'Weight': '3.2 grams',
      'Water Resistance': '50 meters'
    },
    variants: [
      { id: 'v-06-gold', colorName: 'Brushed Gold', colorHex: '#eab308', size: 'Size 9', stock: 4, sku: 'VAN-RNG-GLD-9' },
      { id: 'v-06-black', colorName: 'Stealth Black', colorHex: '#27272a', size: 'Size 10', stock: 5, sku: 'VAN-RNG-BLK-10' }
    ],
    badges: ['New Arrival'],
    tags: ['smart-ring', 'sleep', 'biometrics', 'titanium'],
    isFeatured: false
  },

  // 2. Fashion & Leathercraft
  {
    id: 'prod-07',
    title: 'Atelier Minimalist Daypack 20L',
    subtitle: 'Weatherproof Cordura fabric with Italian vegetable-tanned leather accents',
    category: 'fashion',
    subcategory: 'bags',
    brand: 'Komorebi Goods',
    price: 210,
    rating: 4.9,
    reviewCount: 176,
    stock: 5,
    lowStockThreshold: 6,
    sku: 'KOM-BP-20L',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Designed for daily commute and weekend trips. Features a dedicated suspended 16-inch laptop compartment, hidden passport security pocket, and magnetic Fidlock buckles.',
    highlights: [
      'Waterproof 500D Cordura nylon with YKK AquaGuard zippers',
      'Suspended padded laptop sleeve fits up to 16" MacBook Pro',
      'Magnetic quick-release chest strap and luggage pass-through'
    ],
    specs: {
      'Capacity': '20 Liters',
      'Dimensions': '48cm x 30cm x 16cm',
      'Weight': '850 grams'
    },
    variants: [
      { id: 'v-07-charcoal', colorName: 'Charcoal Grey', colorHex: '#374151', stock: 3, sku: 'KOM-BP-20L-CHR' },
      { id: 'v-07-olive', colorName: 'Forest Olive', colorHex: '#3f6212', stock: 2, sku: 'KOM-BP-20L-OLV' }
    ],
    badges: ['Bestseller', 'Staff Pick'],
    tags: ['backpack', 'commute', 'cordura', 'laptop-bag'],
    isFeatured: true
  },
  {
    id: 'prod-08',
    title: 'Merino Wool Structured Overshirt',
    subtitle: '100% extra-fine Italian merino wool with horn buttons and double chest pockets',
    category: 'fashion',
    subcategory: 'outerwear',
    brand: 'Atelier Nord',
    price: 245,
    originalPrice: 280,
    discountPercent: 12,
    rating: 4.8,
    reviewCount: 52,
    stock: 6,
    lowStockThreshold: 6,
    sku: 'NOR-SH-300',
    thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Heavyweight 380gsm boiled merino wool woven in Biella, Italy. Naturally thermo-regulating, odor-resistant, and tailored with a clean relaxed boxy silhouette.',
    highlights: [
      '380gsm heavyweight Italian Merino wool',
      'Genuine matte horn button closures',
      'Naturally water-repellent and breathable'
    ],
    specs: {
      'Composition': '100% Extra-fine Merino Wool',
      'Origin': 'Made in Portugal with Italian Yarn',
      'Care': 'Dry Clean or Gentle Cold Hand Wash'
    },
    variants: [
      { id: 'v-08-m-navy', colorName: 'Deep Navy', colorHex: '#1e3a8a', size: 'M', stock: 3, sku: 'NOR-SH-300-NAV-M' },
      { id: 'v-08-l-navy', colorName: 'Deep Navy', colorHex: '#1e3a8a', size: 'L', stock: 2, sku: 'NOR-SH-300-NAV-L' },
      { id: 'v-08-m-camel', colorName: 'Warm Camel', colorHex: '#d97706', size: 'M', stock: 1, sku: 'NOR-SH-300-CAM-M' }
    ],
    badges: ['Premium'],
    tags: ['merino-wool', 'jacket', 'overshirt', 'menswear'],
    isFeatured: false
  },
  {
    id: 'prod-09',
    title: 'Heritage Goodyear-Welted Chelsea Boots',
    subtitle: 'Waxed commander leather with Vibram lug soles and elastic gussets',
    category: 'fashion',
    subcategory: 'footwear',
    brand: 'Atelier Nord',
    price: 360,
    rating: 4.9,
    reviewCount: 84,
    stock: 4,
    lowStockThreshold: 5,
    sku: 'NOR-BT-500',
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Built to endure decades of all-weather wear. Goodyear welted construction allows endless resoling, while waxed reverse kudu leather gains rich patina with every step.',
    highlights: [
      '360° Goodyear Storm Welt construction',
      'Vibram lightweight Commando rubber outsole',
      'Poron anti-fatigue cork footbed molds to foot shape'
    ],
    specs: {
      'Upper': 'CF Stead Waxed Commander Leather',
      'Sole': 'Vibram Arctic Grip Rubber',
      'Construction': 'Goodyear Welted (Recraftable)'
    },
    variants: [
      { id: 'v-09-42-tan', colorName: 'Tobacco Brown', colorHex: '#78350f', size: 'US 9 / EU 42', stock: 2, sku: 'NOR-BT-500-TOB-42' },
      { id: 'v-09-43-tan', colorName: 'Tobacco Brown', colorHex: '#78350f', size: 'US 10 / EU 43', stock: 2, sku: 'NOR-BT-500-TOB-43' }
    ],
    badges: ['Low Stock'],
    tags: ['chelsea-boots', 'leather', 'goodyear-welt', 'footwear'],
    isFeatured: true
  },
  {
    id: 'prod-10',
    title: 'Full-Grain Leather Bifold & Card Wallet',
    subtitle: 'Slimline RFID-shielded wallet crafted from Horween Chromexcel leather',
    category: 'fashion',
    subcategory: 'bags',
    brand: 'Komorebi Goods',
    price: 85,
    rating: 4.7,
    reviewCount: 110,
    stock: 25,
    lowStockThreshold: 8,
    sku: 'KOM-WL-100',
    thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Ultra-compact profile holds up to 10 cards and flat cash without pocket bulge. Hand-burnished edges with Japanese poly-cord stitching.',
    highlights: [
      'Horween USA vegetable retanned pull-up leather',
      'Integrated aerospace aluminum RFID blocking liner',
      'Quick-draw exterior thumb slot for frequent transit cards'
    ],
    specs: {
      'Dimensions': '10.5cm x 7.5cm x 0.8cm',
      'Capacity': '8-10 Cards + Cash'
    },
    variants: [
      { id: 'v-10-bourbon', colorName: 'Bourbon Tan', colorHex: '#9a3412', stock: 15, sku: 'KOM-WL-100-BRB' },
      { id: 'v-10-black', colorName: 'Onyx Black', colorHex: '#09090b', stock: 10, sku: 'KOM-WL-100-BLK' }
    ],
    badges: [],
    tags: ['wallet', 'leather', 'rfid', 'edc'],
    isFeatured: false
  },
  {
    id: 'prod-11',
    title: 'Stormproof Technical Shell Parka',
    subtitle: '3-Layer GORE-TEX Pro membrane with taped seams and storm hood',
    category: 'fashion',
    subcategory: 'outerwear',
    brand: 'Atelier Nord',
    price: 495,
    originalPrice: 560,
    discountPercent: 12,
    rating: 4.9,
    reviewCount: 45,
    stock: 3,
    lowStockThreshold: 4,
    sku: 'NOR-PK-700',
    thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Extreme protection against downpours and mountain blizzards. Articulated sleeves permit complete mobility, with waterproof pit vents for rapid thermal dumping.',
    highlights: [
      '28,000mm waterproof rating with GORE-TEX Pro',
      'Cohaesive cord-lock hood adjustment system',
      'RECCO avalanche rescue reflector embedded in left arm'
    ],
    specs: {
      'Fabric': '100% Recycled Nylon with ePTFE membrane',
      'Weight': '490 grams'
    },
    variants: [
      { id: 'v-11-m-sage', colorName: 'Alpine Sage', colorHex: '#475569', size: 'M', stock: 2, sku: 'NOR-PK-700-SAG-M' },
      { id: 'v-11-l-sage', colorName: 'Alpine Sage', colorHex: '#475569', size: 'L', stock: 1, sku: 'NOR-PK-700-SAG-L' }
    ],
    badges: ['Low Stock'],
    tags: ['parka', 'gore-tex', 'outerwear', 'waterproof'],
    isFeatured: false
  },

  // 3. Home & Living
  {
    id: 'prod-12',
    title: 'Ergoline Kinetic Task Chair',
    subtitle: 'Harmonic self-adjusting tilt mechanism with breathable 3D woven mesh',
    category: 'home',
    subcategory: 'furniture',
    brand: 'Ergoline Studios',
    price: 720,
    originalPrice: 850,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 168,
    stock: 6,
    lowStockThreshold: 5,
    sku: 'ERG-CHR-800',
    thumbnail: 'https://images.unsplash.com/photo-1580481077190-7361346d1808?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1580481077190-7361346d1808?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Designed in Copenhagen for optimal spinal alignment during 10+ hour work sessions. Dynamic lumbar support adapts continuously to your posture without manual knobs.',
    highlights: [
      'Adaptive kinetic tilt mechanism automatically balances your weight',
      '3D multi-directional pivot armrests with soft PU pads',
      'Polished recycled aluminum chassis tested to 300 lbs capacity'
    ],
    specs: {
      'Height Range': '102cm - 114cm',
      'Seat Depth': '46cm',
      'Warranty': '12-Year Full Structural Warranty'
    },
    variants: [
      { id: 'v-12-grey', colorName: 'Mineral Grey', colorHex: '#64748b', stock: 4, sku: 'ERG-CHR-800-GRY' },
      { id: 'v-12-black', colorName: 'Graphite Black', colorHex: '#1e293b', stock: 2, sku: 'ERG-CHR-800-BLK' }
    ],
    badges: ['Bestseller', 'Staff Pick'],
    tags: ['ergonomic-chair', 'office', 'workspace', 'copenhagen'],
    isFeatured: true
  },
  {
    id: 'prod-13',
    title: 'Aura Halo Ambient Brass Desk Lamp',
    subtitle: 'Touch-dimmable warm circadian LED with machined solid brass stem',
    category: 'home',
    subcategory: 'lighting',
    brand: 'Lumina Craft',
    price: 185,
    rating: 4.8,
    reviewCount: 92,
    stock: 8,
    lowStockThreshold: 5,
    sku: 'LUM-LMP-200',
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Diffuses 95+ CRI glare-free light across your entire desk surface. Optical touch switch on base smoothly adjusts color temperature from 2200K sunset amber to 4000K daylight.',
    highlights: [
      '95+ CRI High-fidelity LED reduces eye fatigue',
      'Touch-sensitive stepless dimmer & 2200K-4000K temperature slide',
      'Solid spun brass shade with heavy counterbalanced base'
    ],
    specs: {
      'Luminous Flux': '800 Lumens (60W equivalent)',
      'Power Draw': '10W LED (50,000 hour lifespan)',
      'Dimensions': '42cm H x 22cm W'
    },
    variants: [
      { id: 'v-13-brass', colorName: 'Brushed Brass', colorHex: '#ca8a04', stock: 5, sku: 'LUM-LMP-200-BRS' },
      { id: 'v-13-matte', colorName: 'Matte Charcoal', colorHex: '#27272a', stock: 3, sku: 'LUM-LMP-200-CHR' }
    ],
    badges: ['Top Rated'],
    tags: ['lamp', 'lighting', 'brass', 'desk-setup'],
    isFeatured: false
  },
  {
    id: 'prod-14',
    title: 'Precision Temperature Pour-Over Kettle',
    subtitle: 'Gooseneck spout with PID digital base and 60-minute heat hold',
    category: 'home',
    subcategory: 'kitchen',
    brand: 'Aura Studio',
    price: 155,
    originalPrice: 175,
    discountPercent: 11,
    rating: 4.9,
    reviewCount: 130,
    stock: 11,
    lowStockThreshold: 5,
    sku: 'AUR-KTL-300',
    thumbnail: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'The ultimate tool for coffee purists. Counterbalanced ergonomic handle provides steady pouring flow rate, while the high-contrast LCD displays set point and real-time liquid temp.',
    highlights: [
      '1200W rapid heating elements boils 0.9L in under 3 minutes',
      'PID temperature controller accurate to ±1°F / 0.5°C',
      'Built-in extraction brew stopwatch for consistent bloom timing'
    ],
    specs: {
      'Capacity': '0.9 Liters (30 oz)',
      'Material': '304 Food-Grade Stainless Steel'
    },
    variants: [
      { id: 'v-14-black', colorName: 'Matte Black', colorHex: '#18181b', stock: 7, sku: 'AUR-KTL-300-BLK' },
      { id: 'v-14-cream', colorName: 'Warm White & Birch', colorHex: '#fef08a', stock: 4, sku: 'AUR-KTL-300-WHT' }
    ],
    badges: ['Bestseller'],
    tags: ['coffee-kettle', 'barista', 'pour-over', 'kitchen'],
    isFeatured: true
  },
  {
    id: 'prod-15',
    title: 'Nordic Solid Oak Floating Shelf Set',
    subtitle: 'Pack of 2 solid European white oak shelves with concealed steel brackets',
    category: 'home',
    subcategory: 'furniture',
    brand: 'Ergoline Studios',
    price: 135,
    rating: 4.7,
    reviewCount: 42,
    stock: 14,
    lowStockThreshold: 5,
    sku: 'ERG-SHF-200',
    thumbnail: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sustainably harvested FSC-certified oak treated with natural matte beeswax. Includes heavy-duty drywall & masonry anchor hardware rated to 45 lbs load per shelf.',
    highlights: [
      '100% Solid European Oak (no veneer or particle board)',
      'Precision concealed floating brackets create seamless zero-gap look',
      'Natural organic wax finish repels moisture and staining'
    ],
    specs: {
      'Dimensions': '60cm L x 20cm D x 3.5cm T (each)',
      'Max Load': '20 kg (45 lbs) per shelf'
    },
    variants: [
      { id: 'v-15-natural', colorName: 'Natural Oak', colorHex: '#e2e8f0', stock: 9, sku: 'ERG-SHF-200-NAT' },
      { id: 'v-15-smoked', colorName: 'Smoked Walnut Finish', colorHex: '#581c87', stock: 5, sku: 'ERG-SHF-200-SMK' }
    ],
    badges: [],
    tags: ['shelving', 'oak', 'furniture', 'nordic'],
    isFeatured: false
  },
  {
    id: 'prod-16',
    title: 'Kinfolk Ceramic Tabletop Lantern',
    subtitle: 'Hand-thrown stoneware with frosted glass chimney for warm candle glow',
    category: 'home',
    subcategory: 'lighting',
    brand: 'Lumina Craft',
    price: 68,
    rating: 4.8,
    reviewCount: 56,
    stock: 19,
    lowStockThreshold: 5,
    sku: 'LUM-LTN-100',
    thumbnail: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Designed for quiet evenings and dining outdoors. Accommodates standard tea lights and pillar candles, diffusing radiant ambient warmth.',
    highlights: [
      'Individually wheel-thrown terracotta stoneware',
      'Heat-resistant borosilicate glass shade',
      'Brass wire carry handle with quick detach'
    ],
    specs: {
      'Dimensions': '18cm H x 12cm Dia',
      'Weight': '600 grams'
    },
    variants: [
      { id: 'v-16-terracotta', colorName: 'Terracotta Rust', colorHex: '#ea580c', stock: 11, sku: 'LUM-LTN-100-RST' },
      { id: 'v-16-chalk', colorName: 'Chalk White', colorHex: '#fafafa', stock: 8, sku: 'LUM-LTN-100-WHT' }
    ],
    badges: [],
    tags: ['lantern', 'ceramic', 'decor', 'lighting'],
    isFeatured: false
  },

  // 4. Fitness & Adventure
  {
    id: 'prod-17',
    title: 'Titan Deep-Tissue Percussive Massager',
    subtitle: 'Whisper-quiet brushless 60W motor with 16mm amplitude therapy stroke',
    category: 'fitness',
    subcategory: 'recovery',
    brand: 'Vanguard',
    price: 260,
    originalPrice: 320,
    discountPercent: 18,
    rating: 4.9,
    reviewCount: 194,
    stock: 8,
    lowStockThreshold: 6,
    sku: 'VAN-MSG-900',
    thumbnail: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Accelerates muscular recovery and dissolves deep fascia knots. Features 5 calibrated speed settings (1750 - 3200 PPM), 6 custom silicone attachment heads, and ergonomic multi-grip handle.',
    highlights: [
      '16mm true percussive amplitude delivers 60 lbs stall force',
      'QuietGlide sound reduction technology (<45dB)',
      '6 interchangeable attachments including heated titanium head'
    ],
    specs: {
      'Battery Life': '5 Hours per charge',
      'Stall Force': '60 lbs (27 kg)',
      'Weight': '1.1 kg (2.4 lbs)'
    },
    variants: [
      { id: 'v-17-gunmetal', colorName: 'Gunmetal Titanium', colorHex: '#334155', stock: 5, sku: 'VAN-MSG-900-GMT' },
      { id: 'v-17-matte', colorName: 'Matte Onyx', colorHex: '#09090b', stock: 3, sku: 'VAN-MSG-900-BLK' }
    ],
    badges: ['Bestseller'],
    tags: ['massage-gun', 'recovery', 'fitness', 'percussive'],
    isFeatured: true
  },
  {
    id: 'prod-18',
    title: 'Nomad Ultralight 2-Person Backpacking Tent',
    subtitle: 'Silicone-coated ripstop nylon weighing just 980g with carbon fiber poles',
    category: 'fitness',
    subcategory: 'outdoors',
    brand: 'Atelier Nord',
    price: 390,
    rating: 4.8,
    reviewCount: 68,
    stock: 2, // Very low stock!
    lowStockThreshold: 4,
    sku: 'NOR-TNT-200',
    thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Engineered for thru-hikers and alpine mountaineering. Free-standing dome structure withstands 50 knot gusts, featuring dual vestibules and high-flow micro-mesh ventilation.',
    highlights: [
      'Ultra-packable trail weight under 1 kilogram (2.1 lbs)',
      'Easton carbon fiber interlocking pole system',
      'Dual dry-entry vestibules protect gear from torrential rains'
    ],
    specs: {
      'Capacity': '2 Persons',
      'Floor Area': '2.7 sq meters (29 sq ft)',
      'Packed Size': '38cm x 12cm'
    },
    variants: [
      { id: 'v-18-alpine', colorName: 'Alpine Olive', colorHex: '#365314', stock: 2, sku: 'NOR-TNT-200-OLV' }
    ],
    badges: ['Low Stock', 'Staff Pick'],
    tags: ['tent', 'camping', 'ultralight', 'outdoors'],
    isFeatured: false
  },
  {
    id: 'prod-19',
    title: 'HydroVault Vacuum Insulated Canteen 32oz',
    subtitle: 'Triple-walled 18/8 kitchen-grade steel keeps drinks ice cold for 36 hours',
    category: 'fitness',
    subcategory: 'outdoors',
    brand: 'Vanguard',
    price: 48,
    rating: 4.9,
    reviewCount: 310,
    stock: 35,
    lowStockThreshold: 10,
    sku: 'VAN-BTL-32',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Rugged powder-coated steel flask with wide-mouth opening, magnetic cap keeper, and zero condensation sweat. 100% BPA and toxin free.',
    highlights: [
      'Keeps cold for 36 hours, piping hot for 18 hours',
      'Textured silicone slip-resistant impact boot included',
      'Dishwasher safe with leakproof flip chug lid'
    ],
    specs: {
      'Volume': '950 ml (32 fluid oz)',
      'Weight (Empty)': '410 grams'
    },
    variants: [
      { id: 'v-19-black', colorName: 'Matte Black', colorHex: '#18181b', stock: 20, sku: 'VAN-BTL-32-BLK' },
      { id: 'v-19-sage', colorName: 'Glacier Blue', colorHex: '#0284c7', stock: 15, sku: 'VAN-BTL-32-BLU' }
    ],
    badges: ['Bestseller'],
    tags: ['water-bottle', 'insulated', 'outdoors', 'fitness'],
    isFeatured: false
  },
  {
    id: 'prod-20',
    title: 'Aura Recovery Acupressure Mat & Pillow Set',
    subtitle: 'Organic linen and natural coconut fiber mat with 6,200 stimulator points',
    category: 'fitness',
    subcategory: 'recovery',
    brand: 'Aura Studio',
    price: 79,
    rating: 4.7,
    reviewCount: 78,
    stock: 12,
    lowStockThreshold: 5,
    sku: 'AUR-MAT-100',
    thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Releases endorphins, eases back tension, and induces deep restorative sleep. Crafted with certified organic flax linen and biodegradable buckwheat hull fill.',
    highlights: [
      '6,200 non-toxic recyclable HIPS plastic pressure points',
      'Organic breathable linen exterior with natural coconut coir core',
      'Includes contoured neck & cervical spine pillow'
    ],
    specs: {
      'Mat Dimensions': '72cm x 43cm',
      'Pillow Dimensions': '38cm x 15cm'
    },
    variants: [
      { id: 'v-20-sand', colorName: 'Natural Sand', colorHex: '#d6d3d1', stock: 8, sku: 'AUR-MAT-100-SND' },
      { id: 'v-20-slate', colorName: 'Slate Charcoal', colorHex: '#334155', stock: 4, sku: 'AUR-MAT-100-SLT' }
    ],
    badges: [],
    tags: ['acupressure', 'yoga', 'recovery', 'sleep'],
    isFeatured: false
  },

  // 5. Artisanal & Gourmet
  {
    id: 'prod-21',
    title: 'Gesha Village Single-Origin Micro-Lot Coffee',
    subtitle: 'Anaerobic natural process beans from Gesha Village, Bench Maji, Ethiopia (250g)',
    category: 'gourmet',
    subcategory: 'coffee',
    brand: 'Aura Roastworks',
    price: 36,
    rating: 5.0,
    reviewCount: 88,
    stock: 10,
    lowStockThreshold: 6,
    sku: 'AUR-COF-GESHA',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Exquisite cup profile featuring intoxicating aromatics of jasmine blossoms, bergamot, candied peach, and wild honey. Roasted weekly in small 5kg micro-batches.',
    highlights: [
      '100% Gesha 1931 varietal grown at 2,050 meters elevation',
      'Score: 91.5 SCAA Specialty Grade',
      'Direct-trade partnership with local smallholders'
    ],
    specs: {
      'Tasting Notes': 'Jasmine, White Peach, Bergamot, Honey',
      'Roast Level': 'Light-Medium Filter Roast',
      'Net Weight': '250 grams (Whole Bean)'
    },
    variants: [
      { id: 'v-21-whole', colorName: 'Whole Bean', size: '250g Bag', stock: 6, sku: 'AUR-COF-GSH-WB' },
      { id: 'v-21-ground', colorName: 'Pour-Over Ground', size: '250g Bag', stock: 4, sku: 'AUR-COF-GSH-PO' }
    ],
    badges: ['Staff Pick', 'Bestseller'],
    tags: ['coffee', 'gesha', 'specialty-coffee', 'gourmet'],
    isFeatured: true
  },
  {
    id: 'prod-22',
    title: 'Kyoto Ceremonial Grade Uji Matcha',
    subtitle: 'First-harvest stone-ground tencha tea leaves from historic Uji, Kyoto (40g tin)',
    category: 'gourmet',
    subcategory: 'botanicals',
    brand: 'Komorebi Goods',
    price: 42,
    rating: 4.9,
    reviewCount: 112,
    stock: 15,
    lowStockThreshold: 5,
    sku: 'KOM-MTC-40',
    thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Luminous jade-green powder boasting intense umami sweetness, silky froth, and zero bitterness. Shaded for 30 days prior to hand-picking.',
    highlights: [
      '100% Single-cultivar Okumidori tea leaves from Uji',
      'Traditional granite stone-mill ground for microscopic particle silkiness',
      'Hermetically sealed airtight nitrogen-flushed gold tin'
    ],
    specs: {
      'Origin': 'Uji, Kyoto Prefecture, Japan',
      'Net Weight': '40 grams (approx. 20-25 servings)'
    },
    variants: [
      { id: 'v-22-tin', colorName: 'Ceremonial Gold Tin', size: '40g', stock: 15, sku: 'KOM-MTC-40-GLD' }
    ],
    badges: ['Top Rated'],
    tags: ['matcha', 'tea', 'japanese', 'uji', 'superfood'],
    isFeatured: false
  },
  {
    id: 'prod-23',
    title: 'Organic Botanical Tisane Herbal Tea Flight',
    subtitle: 'Collection of 4 loose-leaf calming infusions: Chamomile, Lavender, Mint, adaptogens',
    category: 'gourmet',
    subcategory: 'botanicals',
    brand: 'Aura Roastworks',
    price: 32,
    rating: 4.8,
    reviewCount: 64,
    stock: 18,
    lowStockThreshold: 5,
    sku: 'AUR-TEA-FLT',
    thumbnail: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Caffeine-free therapeutic blends featuring whole Egyptian chamomile flower heads, French provence lavender, ashwagandha root, and organic spearmint.',
    highlights: [
      '100% Certified USDA Organic wildcrafted botanicals',
      'Zero artificial flavors, pesticides, or GMOs',
      'Packaged in recyclable UV-blocking amber glass jars'
    ],
    specs: {
      'Jars': '4 x 45g Glass Jars (approx. 60 cups total)',
      'Caffeine': 'Caffeine-Free Herbal'
    },
    variants: [
      { id: 'v-23-set', colorName: 'Amber Jar Gift Box', stock: 18, sku: 'AUR-TEA-FLT-SET' }
    ],
    badges: ['New Arrival'],
    tags: ['herbal-tea', 'organic', 'calm', 'gift-set'],
    isFeatured: false
  },
  {
    id: 'prod-24',
    title: 'Cold-Pressed Tuscan Extra Virgin Olive Oil',
    subtitle: 'Early-harvest Frantoio and Leccino estate olives with peppery polyphenol finish (500ml)',
    category: 'gourmet',
    subcategory: 'coffee', // pantry
    brand: 'Komorebi Goods',
    price: 38,
    rating: 4.9,
    reviewCount: 75,
    stock: 9,
    lowStockThreshold: 5,
    sku: 'KOM-EVOO-500',
    thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Milled within 4 hours of tree harvest in Tuscany. Acidity under 0.18% with intense notes of green artichoke, fresh-cut grass, and vibrant peppery throat catch.',
    highlights: [
      'High Polyphenols (>650 mg/kg antioxidant profile)',
      'Protected Geographical Indication (IGP Toscana)',
      'UV-protective matte dark bottle with non-drip pourer'
    ],
    specs: {
      'Harvest Year': '2025/2026 Estate Vintage',
      'Volume': '500 ml (16.9 fl oz)'
    },
    variants: [
      { id: 'v-24-500', colorName: '500ml Dark Glass', size: '500ml', stock: 9, sku: 'KOM-EVOO-500-BTL' }
    ],
    badges: ['Staff Pick'],
    tags: ['olive-oil', 'evoo', 'tuscany', 'gourmet'],
    isFeatured: false
  }
];

export const MOCK_REVIEWS_POOL = [
  {
    id: 'r-1',
    author: 'Elena Rostova',
    rating: 5,
    date: '2 days ago',
    title: 'Exceeded all my expectations — absolute craftsmanship',
    comment: 'The quality of materials and finish is phenomenal. Arrived within 2 days with real-time tracking updates at every step. Will definitely buy again.',
    verified: true
  },
  {
    id: 'r-2',
    author: 'Marcus Vance',
    rating: 5,
    date: '1 week ago',
    title: 'Top-tier build and seamless checkout',
    comment: 'I checked out using Apple Pay in 10 seconds. The stock reservation gave me confidence since there were only 3 items left when I bought.',
    verified: true
  },
  {
    id: 'r-3',
    author: 'Sophia Lin',
    rating: 4,
    date: '2 weeks ago',
    title: 'Sublime design, feels premium in hand',
    comment: 'Minor delay on carrier delivery due to weekend weather, but customer support was attentive and the item itself is perfection.',
    verified: true
  }
];
