export const SAMPLE_OUTFITS = [
  {
    id: 1,
    title: "Indian Contemporary Silk Ensemble",
    category: "Festive Editorial",
    matchScore: 96,
    items: ["Bordeaux Raw Silk Kurta", "Deep Green Embroidered Jacket", "Cream Tapered Trousers", "Handcrafted Loafers"],
    palette: ["#6C151E", "#0F3D3A", "#F5DABF", "#1C1A18"],
    weatherSync: "24°C • Warm & Breezy",
    tags: ["Contemporary Luxe", "High Harmony", "Editorial"]
  },
  {
    id: 2,
    title: "Deep Emerald Tailored Layering",
    category: "Formal Minimal",
    matchScore: 94,
    items: ["Deep Green Wool Blazer", "Cream Cashmere Knit", "Charcoal Tailored Slacks", "Leather Oxford Shoes"],
    palette: ["#0F3D3A", "#F5DABF", "#1C1A18", "#D8C5B5"],
    weatherSync: "20°C • Evening Mild",
    tags: ["Architectural Fit", "Sophisticated", "Night Out"]
  },
  {
    id: 3,
    title: "Cream & Bordeaux Heritage Casual",
    category: "Smart Leisure",
    matchScore: 91,
    items: ["Cream Oversized Linen Shirt", "Bordeaux Chino Trousers", "Muted Beige Minimal Sneakers"],
    palette: ["#F5DABF", "#6C151E", "#D8C5B5", "#F7EFE7"],
    weatherSync: "26°C • Sunny",
    tags: ["Effortless", "Breathable", "Weekend"]
  }
];

export const UNDERUSED_ITEMS = [
  {
    name: "Bordeaux Velvet Nehru Vest",
    lastWorn: "38 days ago",
    suggestion: "Pair with your Cream Silk Shirt for an effortless contemporary look."
  },
  {
    name: "Deep Green Handloom Stole",
    lastWorn: "52 days ago",
    suggestion: "Elevate your Charcoal Suit for Friday evening gatherings."
  },
  {
    name: "Cream Cashmere Wrap Coat",
    lastWorn: "29 days ago",
    suggestion: "Ideal accent layer for upcoming 18°C autumn evenings."
  }
];

export const WARDROBE_STATS = {
  totalItems: 48,
  outfitsCreated: 12,
  underusedCount: 3,
  weatherTemp: "24°C",
  styleMatchIndex: "94%",
  dominantPalette: "Bordeaux, Emerald & Cream"
};
