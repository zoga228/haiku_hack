import type {
  Category,
  Interest,
  JourneyStep,
  Marketplace,
  MarketplaceVariant,
  PaymentMethod,
  Product,
} from "@/types/commerce";

type ProductSeed = {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  imageUrl: string;
  marketplaceImages?: Partial<Record<Marketplace, string>>;
  description: string;
  tags: string[];
  specs: Record<string, string>;
  basePriceKzt: number;
  rating: number;
  minParticipants: number;
  currentParticipants: number;
  originCountry: string;
  paymentMethods?: PaymentMethod[];
  marketplaces?: Marketplace[];
};

export const interests: Interest[] = [
  {
    label: "Electronics",
    description: "Phones, wearables, audio, cameras, chargers, and smart home.",
  },
  {
    label: "Beauty",
    description: "Skincare, hair tools, SPF, dermocosmetics, and makeup kits.",
  },
  {
    label: "Home",
    description: "Kitchen appliances, cleaning, storage, bedding, and lighting.",
  },
  {
    label: "Fashion",
    description: "Outerwear, shoes, bags, sportswear, and accessories.",
  },
  {
    label: "Kids",
    description: "STEM toys, school supplies, baby care, and safety products.",
  },
  {
    label: "Travel",
    description: "Luggage, organizers, adapters, camping, and flight accessories.",
  },
  {
    label: "Auto",
    description: "Car electronics, detailing, storage, covers, and tools.",
  },
  {
    label: "Sports",
    description: "Home fitness, cycling, recovery, outdoor, and training gear.",
  },
  {
    label: "Pets",
    description: "Feeders, grooming, carriers, beds, toys, and hygiene.",
  },
  {
    label: "Office",
    description: "Desk setup, stationery, chairs, monitors, and productivity tools.",
  },
  {
    label: "Health",
    description: "Home diagnostics, wellness devices, recovery, and daily care.",
  },
  {
    label: "Groceries",
    description: "Pantry boxes, tea, coffee, snacks, household consumables.",
  },
];

export const categoryMap: Record<Category, string[]> = {
  Electronics: [
    "Smartphones",
    "Headphones",
    "Wearables",
    "Charging",
    "Cameras",
    "Smart home",
  ],
  Beauty: [
    "Skincare sets",
    "Hair tools",
    "Sunscreen",
    "Makeup tools",
    "Dermocosmetics",
  ],
  Home: [
    "Coffee",
    "Air quality",
    "Storage",
    "Cleaning",
    "Lighting",
    "Textiles",
  ],
  Fashion: [
    "Sneakers",
    "Outerwear",
    "Bags",
    "Basics",
    "Accessories",
    "Sportswear",
  ],
  Kids: ["STEM", "School", "Baby care", "Safety", "Creative toys"],
  Travel: ["Backpacks", "Luggage", "Adapters", "Organizers", "Camping"],
  Auto: ["Dash cams", "Detailing", "Organizers", "Tire care", "Electronics"],
  Sports: ["Fitness", "Cycling", "Recovery", "Outdoor", "Training"],
  Pets: ["Feeders", "Grooming", "Carriers", "Beds", "Toys"],
  Office: ["Desk setup", "Stationery", "Chairs", "Monitors", "Lighting"],
  Health: ["Diagnostics", "Massage", "Hygiene", "Sleep", "Wellness"],
  Groceries: ["Coffee", "Tea", "Snacks", "Pantry", "Cleaning supplies"],
};

const defaultPaymentMethods: PaymentMethod[] = ["Kaspi", "Card", "Wallet"];

const marketplaceOrder: Marketplace[] = [
  "Amazon",
  "AliExpress",
  "Alibaba",
  "Trendyol",
  "Temu",
  "eBay",
  "Shein",
  "Ozon",
];

const marketplacePriceFactor: Record<Marketplace, number> = {
  Amazon: 1.16,
  AliExpress: 0.9,
  Alibaba: 0.78,
  Trendyol: 1.02,
  Temu: 0.86,
  eBay: 1.08,
  Shein: 0.94,
  Ozon: 1.04,
};

const marketplaceCountries: Record<Marketplace, string> = {
  Amazon: "US",
  AliExpress: "CN",
  Alibaba: "CN",
  Trendyol: "TR",
  Temu: "CN",
  eBay: "US",
  Shein: "CN",
  Ozon: "KZ",
};

const marketplaceSellers: Record<Marketplace, string> = {
  Amazon: "Global Store",
  AliExpress: "Factory Choice",
  Alibaba: "Verified Wholesale",
  Trendyol: "Regional Seller",
  Temu: "Direct Deal",
  eBay: "Top Rated Seller",
  Shein: "Fashion Supply",
  Ozon: "Local Partner",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function marketplaceUrl(marketplace: Marketplace, query: string) {
  const encoded = encodeURIComponent(query);

  const urls: Record<Marketplace, string> = {
    Amazon: `https://www.amazon.com/s?k=${encoded}`,
    AliExpress: `https://www.aliexpress.com/wholesale?SearchText=${encoded}`,
    Alibaba: `https://www.alibaba.com/trade/search?SearchText=${encoded}`,
    Trendyol: `https://www.trendyol.com/sr?q=${encoded}`,
    Temu: `https://www.temu.com/search_result.html?search_key=${encoded}`,
    eBay: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
    Shein: `https://www.shein.com/pdsearch/${encoded}/`,
    Ozon: `https://www.ozon.ru/search/?text=${encoded}`,
  };

  return urls[marketplace];
}

function marketplaceImageUrl(seed: ProductSeed, marketplace: Marketplace) {
  return seed.marketplaceImages?.[marketplace] ?? seed.imageUrl;
}

function buildVariants(seed: ProductSeed): MarketplaceVariant[] {
  const marketplaces = seed.marketplaces ?? marketplaceOrder.slice(0, 5);

  return marketplaces.map((marketplace, index) => {
    const priceKzt = Math.round(
      (seed.basePriceKzt * marketplacePriceFactor[marketplace] +
        index * 850) /
        100,
    ) * 100;
    const wholesaleDiscount = marketplace === "Alibaba" ? 0.72 : 0.82;
    const wholesalePriceKzt = Math.round((priceKzt * wholesaleDiscount) / 100) * 100;

    return {
      id: `${seed.id}-${slugify(marketplace)}`,
      marketplace,
      title: `${seed.name} - ${marketplace} offer`,
      seller: marketplaceSellers[marketplace],
      imageUrl: marketplaceImageUrl(seed, marketplace),
      priceKzt,
      wholesalePriceKzt,
      minWholesaleQty: marketplace === "Alibaba" ? 20 : 8 + index * 4,
      deliveryEstimate: `${7 + index * 2}-${11 + index * 3} days`,
      rating: Math.min(5, Number((seed.rating - 0.15 + index * 0.05).toFixed(1))),
      reviews: 240 + index * 137,
      originCountry: marketplaceCountries[marketplace],
      sourceUrl: marketplaceUrl(marketplace, seed.name),
    };
  });
}

function createProduct(seed: ProductSeed): Product {
  const variants = buildVariants(seed);
  const bestRetail = variants.reduce((best, item) =>
    item.priceKzt < best.priceKzt ? item : best,
  );
  const bestWholesale = variants.reduce((best, item) =>
    item.wholesalePriceKzt < best.wholesalePriceKzt ? item : best,
  );

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    subcategory: seed.subcategory,
    marketplace: bestRetail.marketplace,
    originCountry: seed.originCountry,
    imageUrl: bestRetail.imageUrl,
    description: seed.description,
    tags: seed.tags,
    specs: seed.specs,
    variants,
    retailPriceKzt: bestRetail.priceKzt,
    groupPriceKzt: bestWholesale.wholesalePriceKzt,
    minParticipants: seed.minParticipants,
    currentParticipants: seed.currentParticipants,
    deliveryEstimate: bestRetail.deliveryEstimate,
    rating: seed.rating,
    paymentMethods: seed.paymentMethods ?? defaultPaymentMethods,
    localizedNote:
      "Prices are shown in KZT. External links open marketplace search pages for the same product.",
  };
}

const productSeeds: ProductSeed[] = [
  {
    id: "iphone-15-case-magsafe",
    name: "MagSafe Silicone Case for iPhone 15",
    category: "Electronics",
    subcategory: "Smartphones",
    imageUrl:
      "https://images.unsplash.com/photo-1603313011108-4f2eb9237f3d?auto=format&fit=crop&w=900&q=80",
    description: "Protective phone case with magnetic charging alignment.",
    tags: ["iphone", "case", "magsafe", "accessory"],
    specs: { material: "Silicone", compatibility: "iPhone 15", feature: "MagSafe" },
    basePriceKzt: 9800,
    rating: 4.6,
    minParticipants: 40,
    currentParticipants: 32,
    originCountry: "CN",
  },
  {
    id: "wireless-anc-headphones",
    name: "Wireless ANC Headphones",
    category: "Electronics",
    subcategory: "Headphones",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description: "Over-ear headphones with active noise cancellation.",
    tags: ["audio", "work", "travel", "bluetooth"],
    specs: { battery: "42h", codec: "AAC/SBC", charging: "USB-C" },
    basePriceKzt: 88000,
    rating: 4.7,
    minParticipants: 120,
    currentParticipants: 96,
    originCountry: "US",
  },
  {
    id: "smart-fitness-watch",
    name: "Smart Fitness Watch",
    category: "Electronics",
    subcategory: "Wearables",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30e?auto=format&fit=crop&w=900&q=80",
    description: "Daily health tracker with heart rate and activity metrics.",
    tags: ["fitness", "health", "wearable", "budget"],
    specs: { display: "1.8 inch", sensors: "HR, SpO2", waterproof: "IP68" },
    basePriceKzt: 36000,
    rating: 4.4,
    minParticipants: 80,
    currentParticipants: 68,
    originCountry: "CN",
  },
  {
    id: "gan-fast-charger-65w",
    name: "65W GaN Fast Charger",
    category: "Electronics",
    subcategory: "Charging",
    imageUrl:
      "https://images.unsplash.com/photo-1603539444875-76e7684265f6?auto=format&fit=crop&w=900&q=80",
    description: "Compact charger for laptop, tablet, and phone.",
    tags: ["charger", "usb-c", "laptop", "travel"],
    specs: { power: "65W", ports: "2 USB-C + USB-A", plug: "EU adapter" },
    basePriceKzt: 17600,
    rating: 4.5,
    minParticipants: 55,
    currentParticipants: 49,
    originCountry: "CN",
  },
  {
    id: "indoor-security-camera",
    name: "2K Indoor Security Camera",
    category: "Electronics",
    subcategory: "Cameras",
    imageUrl:
      "https://m.media-amazon.com/images/I/61fRiMDwB2L._AC_SL1500_.jpg",
    description: "Smart camera with motion alerts and night vision.",
    tags: ["camera", "home security", "wifi", "smart home"],
    specs: { resolution: "2K", storage: "microSD/cloud", view: "360 degree" },
    basePriceKzt: 28900,
    rating: 4.5,
    minParticipants: 70,
    currentParticipants: 37,
    originCountry: "CN",
  },
  {
    id: "smart-led-strip-kit",
    name: "Smart RGB LED Strip Kit",
    category: "Electronics",
    subcategory: "Smart home",
    imageUrl:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=900&q=80",
    description: "App-controlled lighting strip for rooms and workspaces.",
    tags: ["lighting", "rgb", "smart home", "decor"],
    specs: { length: "10m", control: "App + remote", power: "12V" },
    basePriceKzt: 14200,
    rating: 4.3,
    minParticipants: 90,
    currentParticipants: 82,
    originCountry: "CN",
  },
  {
    id: "k-beauty-skincare-set",
    name: "K-Beauty Skincare Set",
    category: "Beauty",
    subcategory: "Skincare sets",
    imageUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    description: "Cleanser, toner, serum, and cream routine bundle.",
    tags: ["skincare", "routine", "bundle", "gift"],
    specs: { steps: "4", skinType: "Normal/dry", origin: "Korea" },
    basePriceKzt: 49200,
    rating: 4.8,
    minParticipants: 60,
    currentParticipants: 60,
    originCountry: "KR",
  },
  {
    id: "ionic-hair-dryer",
    name: "Ionic Hair Dryer",
    category: "Beauty",
    subcategory: "Hair tools",
    imageUrl:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80",
    description: "Fast drying hair tool with concentrator nozzle.",
    tags: ["hair", "dryer", "beauty tool", "salon"],
    specs: { power: "1800W", modes: "3 heat / 2 speed", plug: "EU" },
    basePriceKzt: 31800,
    rating: 4.4,
    minParticipants: 44,
    currentParticipants: 28,
    originCountry: "CN",
  },
  {
    id: "mineral-sunscreen-spf50",
    name: "Mineral Sunscreen SPF50",
    category: "Beauty",
    subcategory: "Sunscreen",
    imageUrl:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80",
    description: "Daily SPF cream for face and neck.",
    tags: ["spf", "skincare", "daily care", "dermo"],
    specs: { spf: "50", volume: "50ml", finish: "Natural" },
    basePriceKzt: 12600,
    rating: 4.6,
    minParticipants: 100,
    currentParticipants: 71,
    originCountry: "KR",
  },
  {
    id: "makeup-brush-set-12",
    name: "12-Piece Makeup Brush Set",
    category: "Beauty",
    subcategory: "Makeup tools",
    imageUrl:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    description: "Soft brushes for face, eyes, contour, and powder.",
    tags: ["makeup", "brushes", "tools", "beauty"],
    specs: { pieces: "12", bristles: "Synthetic", case: "Included" },
    basePriceKzt: 10900,
    rating: 4.3,
    minParticipants: 75,
    currentParticipants: 64,
    originCountry: "CN",
  },
  {
    id: "portable-espresso-maker",
    name: "Portable Espresso Maker",
    category: "Home",
    subcategory: "Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    description: "Compact espresso tool for home, office, and travel.",
    tags: ["coffee", "kitchen", "travel", "gift"],
    specs: { pressure: "18 bar", capacity: "80ml", power: "Manual" },
    basePriceKzt: 42200,
    rating: 4.5,
    minParticipants: 50,
    currentParticipants: 42,
    originCountry: "TR",
  },
  {
    id: "hepa-air-purifier",
    name: "HEPA Air Purifier",
    category: "Home",
    subcategory: "Air quality",
    imageUrl:
      "https://images.unsplash.com/photo-1585772434312-9c8f795b6b87?auto=format&fit=crop&w=900&q=80",
    description: "Room purifier for dust, pollen, and odors.",
    tags: ["air purifier", "home", "hepa", "health"],
    specs: { area: "30 m2", filter: "H13 HEPA", noise: "24 dB" },
    basePriceKzt: 64200,
    rating: 4.6,
    minParticipants: 35,
    currentParticipants: 22,
    originCountry: "CN",
  },
  {
    id: "vacuum-storage-bags",
    name: "Vacuum Storage Bag Set",
    category: "Home",
    subcategory: "Storage",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
    description: "Space-saving bags for clothes, bedding, and travel.",
    tags: ["storage", "home", "organizer", "travel"],
    specs: { pieces: "8", sizes: "S/M/L", pump: "Included" },
    basePriceKzt: 11800,
    rating: 4.2,
    minParticipants: 120,
    currentParticipants: 103,
    originCountry: "CN",
  },
  {
    id: "robot-vacuum",
    name: "Robot Vacuum Cleaner",
    category: "Home",
    subcategory: "Cleaning",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    description: "Smart cleaner with mapping and scheduled cleaning.",
    tags: ["robot vacuum", "cleaning", "smart home", "floor"],
    specs: { suction: "3000Pa", battery: "150 min", mapping: "Lidar" },
    basePriceKzt: 128000,
    rating: 4.5,
    minParticipants: 24,
    currentParticipants: 17,
    originCountry: "CN",
  },
  {
    id: "memory-foam-pillow",
    name: "Memory Foam Pillow",
    category: "Home",
    subcategory: "Textiles",
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
    description: "Ergonomic pillow for neck support.",
    tags: ["sleep", "pillow", "home textile", "comfort"],
    specs: { material: "Memory foam", cover: "Washable", size: "60x40cm" },
    basePriceKzt: 18400,
    rating: 4.4,
    minParticipants: 65,
    currentParticipants: 61,
    originCountry: "CN",
  },
  {
    id: "running-sneakers",
    name: "Lightweight Running Sneakers",
    category: "Fashion",
    subcategory: "Sneakers",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Breathable sneakers for daily running and walking.",
    tags: ["sneakers", "running", "sportswear", "shoes"],
    specs: { upper: "Mesh", sole: "EVA", sizes: "36-45" },
    basePriceKzt: 34600,
    rating: 4.4,
    minParticipants: 70,
    currentParticipants: 52,
    originCountry: "VN",
    marketplaces: ["Trendyol", "AliExpress", "Temu", "Shein", "eBay"],
  },
  {
    id: "waterproof-windbreaker",
    name: "Waterproof Windbreaker Jacket",
    category: "Fashion",
    subcategory: "Outerwear",
    imageUrl:
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=900&q=80",
    description: "Light jacket for rain, wind, and daily commuting.",
    tags: ["jacket", "outerwear", "rain", "travel"],
    specs: { shell: "Polyester", waterproof: "5000mm", sizes: "XS-XXL" },
    basePriceKzt: 42800,
    rating: 4.3,
    minParticipants: 48,
    currentParticipants: 35,
    originCountry: "TR",
    marketplaces: ["Trendyol", "Shein", "AliExpress", "Temu", "eBay"],
  },
  {
    id: "crossbody-bag",
    name: "Minimal Crossbody Bag",
    category: "Fashion",
    subcategory: "Bags",
    imageUrl:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    description: "Compact daily bag with phone and wallet compartments.",
    tags: ["bag", "fashion", "daily", "accessory"],
    specs: { material: "PU leather", strap: "Adjustable", pockets: "3" },
    basePriceKzt: 17200,
    rating: 4.2,
    minParticipants: 95,
    currentParticipants: 74,
    originCountry: "CN",
    marketplaces: ["Shein", "Trendyol", "AliExpress", "Temu", "eBay"],
  },
  {
    id: "cotton-tshirt-pack",
    name: "Cotton T-Shirt 3-Pack",
    category: "Fashion",
    subcategory: "Basics",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Plain cotton tees for everyday wear.",
    tags: ["t-shirt", "basics", "cotton", "bundle"],
    specs: { material: "100% cotton", count: "3", sizes: "S-XXL" },
    basePriceKzt: 15400,
    rating: 4.1,
    minParticipants: 130,
    currentParticipants: 112,
    originCountry: "TR",
    marketplaces: ["Trendyol", "Shein", "Temu", "AliExpress", "Ozon"],
  },
  {
    id: "kids-stem-robot-kit",
    name: "Kids STEM Robot Kit",
    category: "Kids",
    subcategory: "STEM",
    imageUrl:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=900&q=80",
    description: "Education kit for robotics and basic programming.",
    tags: ["education", "kids", "robot", "school"],
    specs: { age: "8+", modules: "12", battery: "AA" },
    basePriceKzt: 26400,
    rating: 4.3,
    minParticipants: 100,
    currentParticipants: 88,
    originCountry: "CN",
  },
  {
    id: "school-backpack-ergonomic",
    name: "Ergonomic School Backpack",
    category: "Kids",
    subcategory: "School",
    imageUrl:
      "https://images.unsplash.com/photo-1509762774605-f07235a08f1f?auto=format&fit=crop&w=900&q=80",
    description: "Light backpack with padded straps and organizer pockets.",
    tags: ["school", "backpack", "kids", "organizer"],
    specs: { capacity: "20L", weight: "650g", pockets: "6" },
    basePriceKzt: 22600,
    rating: 4.4,
    minParticipants: 75,
    currentParticipants: 53,
    originCountry: "CN",
  },
  {
    id: "baby-bottle-warmer",
    name: "Baby Bottle Warmer",
    category: "Kids",
    subcategory: "Baby care",
    imageUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
    description: "Compact warmer with timer for bottles and jars.",
    tags: ["baby", "warmer", "care", "feeding"],
    specs: { modes: "Milk/food/sterilize", timer: "Yes", power: "220V" },
    basePriceKzt: 23800,
    rating: 4.4,
    minParticipants: 45,
    currentParticipants: 30,
    originCountry: "CN",
  },
  {
    id: "child-safety-locks",
    name: "Child Safety Lock Set",
    category: "Kids",
    subcategory: "Safety",
    imageUrl:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=900&q=80",
    description: "Cabinet, drawer, and door safety locks for home.",
    tags: ["safety", "baby", "home", "locks"],
    specs: { pieces: "20", adhesive: "3M", color: "Transparent" },
    basePriceKzt: 7600,
    rating: 4.2,
    minParticipants: 150,
    currentParticipants: 121,
    originCountry: "CN",
  },
  {
    id: "lightweight-travel-backpack",
    name: "Lightweight Travel Backpack",
    category: "Travel",
    subcategory: "Backpacks",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Carry-on backpack with laptop pocket and organizer panels.",
    tags: ["travel", "backpack", "carry-on", "daily"],
    specs: { capacity: "35L", laptop: "15.6 inch", material: "Nylon" },
    basePriceKzt: 31600,
    rating: 4.6,
    minParticipants: 75,
    currentParticipants: 51,
    originCountry: "CN",
  },
  {
    id: "hard-shell-suitcase-24",
    name: "24-Inch Hard Shell Suitcase",
    category: "Travel",
    subcategory: "Luggage",
    imageUrl:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=900&q=80",
    description: "Spinner suitcase for medium trips.",
    tags: ["suitcase", "luggage", "travel", "spinner"],
    specs: { size: "24 inch", wheels: "360 spinner", lock: "TSA" },
    basePriceKzt: 58800,
    rating: 4.5,
    minParticipants: 32,
    currentParticipants: 24,
    originCountry: "CN",
  },
  {
    id: "universal-travel-adapter",
    name: "Universal Travel Adapter",
    category: "Travel",
    subcategory: "Adapters",
    imageUrl:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
    description: "Multi-country adapter with USB-C and USB-A ports.",
    tags: ["adapter", "travel", "charger", "usb-c"],
    specs: { regions: "US/EU/UK/AU", ports: "4", power: "30W" },
    basePriceKzt: 14800,
    rating: 4.5,
    minParticipants: 110,
    currentParticipants: 86,
    originCountry: "CN",
  },
  {
    id: "packing-cubes-set",
    name: "Packing Cubes Set",
    category: "Travel",
    subcategory: "Organizers",
    imageUrl:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80",
    description: "Clothing organizers for suitcase and backpack packing.",
    tags: ["packing cubes", "organizer", "travel", "storage"],
    specs: { pieces: "6", material: "Nylon mesh", sizes: "Mixed" },
    basePriceKzt: 12400,
    rating: 4.4,
    minParticipants: 140,
    currentParticipants: 134,
    originCountry: "CN",
  },
  {
    id: "dash-cam-4k",
    name: "4K Dash Cam",
    category: "Auto",
    subcategory: "Dash cams",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    description: "Car camera with night recording and parking mode.",
    tags: ["dash cam", "car", "camera", "safety"],
    specs: { resolution: "4K", storage: "microSD", feature: "Parking mode" },
    basePriceKzt: 46400,
    rating: 4.5,
    minParticipants: 45,
    currentParticipants: 31,
    originCountry: "CN",
  },
  {
    id: "car-vacuum-cleaner",
    name: "Cordless Car Vacuum Cleaner",
    category: "Auto",
    subcategory: "Detailing",
    imageUrl:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80",
    description: "Portable vacuum for seats, mats, and trunk cleaning.",
    tags: ["car", "vacuum", "cleaning", "detailing"],
    specs: { suction: "9000Pa", battery: "25 min", charging: "USB-C" },
    basePriceKzt: 25200,
    rating: 4.2,
    minParticipants: 65,
    currentParticipants: 48,
    originCountry: "CN",
  },
  {
    id: "trunk-organizer",
    name: "Foldable Trunk Organizer",
    category: "Auto",
    subcategory: "Organizers",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    description: "Storage organizer for tools, groceries, and travel gear.",
    tags: ["car", "organizer", "trunk", "storage"],
    specs: { compartments: "3", material: "Oxford fabric", foldable: "Yes" },
    basePriceKzt: 15800,
    rating: 4.3,
    minParticipants: 100,
    currentParticipants: 73,
    originCountry: "CN",
  },
  {
    id: "portable-tire-inflator",
    name: "Portable Tire Inflator",
    category: "Auto",
    subcategory: "Tire care",
    imageUrl:
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=900&q=80",
    description: "Digital air compressor for tires, bikes, and balls.",
    tags: ["car", "tire", "compressor", "tool"],
    specs: { pressure: "150 PSI", power: "12V", display: "Digital" },
    basePriceKzt: 27800,
    rating: 4.4,
    minParticipants: 55,
    currentParticipants: 42,
    originCountry: "CN",
  },
  {
    id: "adjustable-dumbbells",
    name: "Adjustable Dumbbell Pair",
    category: "Sports",
    subcategory: "Fitness",
    imageUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
    description: "Compact home gym dumbbells with selectable weight.",
    tags: ["fitness", "home gym", "dumbbells", "strength"],
    specs: { range: "2-24kg", pair: "Yes", plates: "Selector dial" },
    basePriceKzt: 145000,
    rating: 4.6,
    minParticipants: 18,
    currentParticipants: 11,
    originCountry: "CN",
  },
  {
    id: "cycling-helmet-led",
    name: "Cycling Helmet with LED",
    category: "Sports",
    subcategory: "Cycling",
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
    description: "Lightweight helmet with rear LED safety light.",
    tags: ["cycling", "helmet", "safety", "outdoor"],
    specs: { size: "M/L", light: "Rear LED", weight: "280g" },
    basePriceKzt: 26800,
    rating: 4.3,
    minParticipants: 60,
    currentParticipants: 46,
    originCountry: "CN",
  },
  {
    id: "massage-gun",
    name: "Percussion Massage Gun",
    category: "Sports",
    subcategory: "Recovery",
    imageUrl:
      "https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=900&q=80",
    description: "Muscle recovery device with multiple attachments.",
    tags: ["recovery", "massage", "sports", "wellness"],
    specs: { speeds: "6", heads: "4", battery: "2500mAh" },
    basePriceKzt: 33400,
    rating: 4.4,
    minParticipants: 55,
    currentParticipants: 40,
    originCountry: "CN",
  },
  {
    id: "waterproof-trekking-poles",
    name: "Foldable Trekking Poles",
    category: "Sports",
    subcategory: "Outdoor",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    description: "Adjustable poles for hiking and mountain walks.",
    tags: ["hiking", "outdoor", "trekking", "travel"],
    specs: { material: "Aluminum", length: "65-135cm", pair: "Yes" },
    basePriceKzt: 22400,
    rating: 4.2,
    minParticipants: 70,
    currentParticipants: 58,
    originCountry: "CN",
  },
  {
    id: "automatic-pet-feeder",
    name: "Automatic Pet Feeder",
    category: "Pets",
    subcategory: "Feeders",
    imageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    description: "Programmable feeder for cats and small dogs.",
    tags: ["pets", "feeder", "cat", "dog"],
    specs: { capacity: "4L", schedule: "6 meals/day", power: "USB + battery" },
    basePriceKzt: 36200,
    rating: 4.5,
    minParticipants: 45,
    currentParticipants: 36,
    originCountry: "CN",
  },
  {
    id: "pet-grooming-kit",
    name: "Pet Grooming Kit",
    category: "Pets",
    subcategory: "Grooming",
    imageUrl:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
    description: "Clippers and combs for at-home grooming.",
    tags: ["pets", "grooming", "clipper", "care"],
    specs: { tools: "6", charging: "USB", noise: "Low" },
    basePriceKzt: 21800,
    rating: 4.3,
    minParticipants: 80,
    currentParticipants: 59,
    originCountry: "CN",
  },
  {
    id: "folding-pet-carrier",
    name: "Folding Pet Carrier",
    category: "Pets",
    subcategory: "Carriers",
    imageUrl:
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
    description: "Soft carrier for small cats and dogs.",
    tags: ["pets", "carrier", "travel", "cat"],
    specs: { size: "Airline cabin", material: "Oxford fabric", foldable: "Yes" },
    basePriceKzt: 18400,
    rating: 4.4,
    minParticipants: 75,
    currentParticipants: 69,
    originCountry: "CN",
  },
  {
    id: "orthopedic-pet-bed",
    name: "Orthopedic Pet Bed",
    category: "Pets",
    subcategory: "Beds",
    imageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    description: "Soft bed with removable washable cover.",
    tags: ["pets", "bed", "dog", "cat"],
    specs: { filling: "Foam", cover: "Washable", sizes: "S/M/L" },
    basePriceKzt: 24600,
    rating: 4.3,
    minParticipants: 60,
    currentParticipants: 45,
    originCountry: "CN",
  },
  {
    id: "standing-desk-converter",
    name: "Standing Desk Converter",
    category: "Office",
    subcategory: "Desk setup",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    description: "Height-adjustable desktop riser for laptop and monitor.",
    tags: ["office", "desk", "standing desk", "ergonomic"],
    specs: { height: "12 levels", load: "15kg", width: "80cm" },
    basePriceKzt: 68800,
    rating: 4.5,
    minParticipants: 28,
    currentParticipants: 18,
    originCountry: "CN",
  },
  {
    id: "gel-pen-bulk-set",
    name: "Gel Pen Bulk Set",
    category: "Office",
    subcategory: "Stationery",
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    description: "Bulk writing set for school, office, and teams.",
    tags: ["stationery", "pens", "office", "school"],
    specs: { pieces: "60", ink: "0.5mm", colors: "Black/blue/red" },
    basePriceKzt: 9800,
    rating: 4.2,
    minParticipants: 180,
    currentParticipants: 141,
    originCountry: "CN",
  },
  {
    id: "ergonomic-office-chair",
    name: "Ergonomic Office Chair",
    category: "Office",
    subcategory: "Chairs",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
    description: "Adjustable mesh chair for long work sessions.",
    tags: ["chair", "office", "ergonomic", "work"],
    specs: { support: "Lumbar", armrest: "Adjustable", load: "120kg" },
    basePriceKzt: 95500,
    rating: 4.4,
    minParticipants: 22,
    currentParticipants: 14,
    originCountry: "CN",
  },
  {
    id: "portable-monitor-156",
    name: "15.6-Inch Portable Monitor",
    category: "Office",
    subcategory: "Monitors",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    description: "USB-C external screen for laptop and travel work.",
    tags: ["monitor", "office", "laptop", "usb-c"],
    specs: { size: "15.6 inch", resolution: "FHD", input: "USB-C/HDMI" },
    basePriceKzt: 74400,
    rating: 4.5,
    minParticipants: 30,
    currentParticipants: 21,
    originCountry: "CN",
  },
  {
    id: "digital-blood-pressure-monitor",
    name: "Digital Blood Pressure Monitor",
    category: "Health",
    subcategory: "Diagnostics",
    imageUrl:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80",
    description: "Upper-arm monitor with memory and large display.",
    tags: ["health", "diagnostics", "blood pressure", "home"],
    specs: { cuff: "22-42cm", memory: "2 users", power: "USB/battery" },
    basePriceKzt: 28600,
    rating: 4.5,
    minParticipants: 65,
    currentParticipants: 46,
    originCountry: "CN",
  },
  {
    id: "electric-toothbrush-set",
    name: "Electric Toothbrush Set",
    category: "Health",
    subcategory: "Hygiene",
    imageUrl:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80",
    description: "Rechargeable toothbrush with spare heads.",
    tags: ["hygiene", "toothbrush", "health", "daily"],
    specs: { modes: "5", heads: "4", battery: "30 days" },
    basePriceKzt: 23800,
    rating: 4.4,
    minParticipants: 90,
    currentParticipants: 62,
    originCountry: "CN",
  },
  {
    id: "sleep-eye-mask-weighted",
    name: "Weighted Sleep Eye Mask",
    category: "Health",
    subcategory: "Sleep",
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    description: "Soft weighted mask for rest and travel sleep.",
    tags: ["sleep", "mask", "travel", "wellness"],
    specs: { weight: "250g", cover: "Washable", material: "Cotton" },
    basePriceKzt: 9200,
    rating: 4.2,
    minParticipants: 120,
    currentParticipants: 87,
    originCountry: "CN",
  },
  {
    id: "posture-corrector",
    name: "Adjustable Posture Corrector",
    category: "Health",
    subcategory: "Wellness",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
    description: "Support strap for posture training during desk work.",
    tags: ["posture", "wellness", "office", "support"],
    specs: { sizes: "S-XL", material: "Neoprene", adjustable: "Yes" },
    basePriceKzt: 13200,
    rating: 4.1,
    minParticipants: 100,
    currentParticipants: 77,
    originCountry: "CN",
  },
  {
    id: "specialty-coffee-beans-1kg",
    name: "Specialty Coffee Beans 1kg",
    category: "Groceries",
    subcategory: "Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80",
    description: "Whole-bean coffee for espresso and filter brewing.",
    tags: ["coffee", "beans", "groceries", "pantry"],
    specs: { weight: "1kg", roast: "Medium", type: "Arabica blend" },
    basePriceKzt: 14800,
    rating: 4.6,
    minParticipants: 80,
    currentParticipants: 69,
    originCountry: "BR",
  },
  {
    id: "matcha-tea-set",
    name: "Matcha Tea Starter Set",
    category: "Groceries",
    subcategory: "Tea",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80",
    description: "Matcha powder with whisk and bowl accessories.",
    tags: ["tea", "matcha", "wellness", "gift"],
    specs: { powder: "100g", tools: "Whisk/spoon/bowl", grade: "Ceremonial" },
    basePriceKzt: 18400,
    rating: 4.5,
    minParticipants: 70,
    currentParticipants: 44,
    originCountry: "JP",
  },
  {
    id: "protein-snack-box",
    name: "Protein Snack Box",
    category: "Groceries",
    subcategory: "Snacks",
    imageUrl:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80",
    description: "Mixed snack box for office, school, and fitness bags.",
    tags: ["snacks", "protein", "office", "fitness"],
    specs: { pieces: "24", type: "Bars/nuts", shelfLife: "6 months" },
    basePriceKzt: 21600,
    rating: 4.3,
    minParticipants: 95,
    currentParticipants: 81,
    originCountry: "TR",
  },
  {
    id: "eco-cleaning-tablets",
    name: "Eco Cleaning Tablet Pack",
    category: "Groceries",
    subcategory: "Cleaning supplies",
    imageUrl:
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=900&q=80",
    description: "Concentrated cleaning tablets for reusable spray bottles.",
    tags: ["cleaning", "home", "eco", "supplies"],
    specs: { pieces: "30", scents: "3", use: "Kitchen/bathroom/glass" },
    basePriceKzt: 9800,
    rating: 4.2,
    minParticipants: 160,
    currentParticipants: 122,
    originCountry: "CN",
  },
];

export const products: Product[] = productSeeds.map(createProduct);

export const journeySteps: JourneyStep[] = [
  {
    title: "Search or choose category",
    description:
      "User searches product names or opens a detailed category such as dash cams, sunscreen, or office chairs.",
  },
  {
    title: "Compare marketplace variants",
    description:
      "Each product has multiple marketplace offers with price, wholesale price, seller, delivery, and external link.",
  },
  {
    title: "Sort by price",
    description:
      "Users sort retail and wholesale options by price.",
  },
];
