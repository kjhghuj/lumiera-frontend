
// --- TYPES ---
export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  details: string;
  material: string;
  images: string[];
  videoUrl?: string; // Optional
  variants?: { id: string; name: string; colorCode: string }[];
  isBestSeller?: boolean;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
}

export interface Testimonial {
  text: string;
  author: string;
}

// Support for rich article content
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "inline-product"; productId: string; context: string };

export interface Article {
  id: number;
  slug: string;
  category: string;
  title: string;
  author?: string; // Added
  date?: string; // Added
  excerpt: string;
  image: string;
  readTime: string;
  content?: ArticleBlock[]; // Added
  relatedArticleIds?: number[]; // Added
  featuredProductId?: string; // Added, ID string from PRODUCTS
}

// --- CONSTANTS ---

export const COMPANY_INFO = {
  name: "LUMIERA LTD",
  regNo: "UK-8829104",
  address: "123 Wellness Way, London, UK",
};

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "The Rose",
    subtitle: "Sonic clitoral stimulator for targeted pleasure.",
    category: "Solo Play",
    price: 49.0,
    rating: 4.9,
    reviewCount: 128,
    description:
      "A rhythm for every mood. From a gentle tease to a powerful pulse, explore 10 patterns designed to guide you to the peak. Its soft silicone texture mimics the delicate touch of a petal, creating a sensation that feels like a natural extension of your body.",
    details:
      "Size: 65mm x 45mm • Material: Medical Grade Silicone • Run Time: 90 Mins • IPX7 Waterproof",
    material: "Medical Grade Silicone",
    images: [
      "https://images.unsplash.com/photo-1596464716154-10a6e2e7d7a1?auto=format&fit=crop&q=80&w=1200", // Main
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1200", // Lifestyle
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1200", // Packaging
    ],
    videoUrl:
      "https://videos.pexels.com/video-files/7247348/7247348-hd_1080_1920_30fps.mp4", // Abstract texture video
    variants: [
      { id: "v1", name: "Blush", colorCode: "#EFC0C0" },
      { id: "v2", name: "Midnight", colorCode: "#2C2C2C" },
      { id: "v3", name: "Sage", colorCode: "#7F8C72" },
    ],
    isBestSeller: true,
  },
  {
    id: "p2",
    name: "The Wand",
    subtitle: "Deep, rumbly vibrations for full-body relaxation.",
    category: "Solo Play",
    price: 119.0,
    rating: 4.8,
    reviewCount: 84,
    description:
      "Engineered with low-frequency motor technology to guide you toward deeper relaxation. A perfect companion for your evening ritual, whether used for intimate moments or releasing tension in the neck and shoulders.",
    details:
      "Size: 210mm x 45mm • Flexible Head • 2.5 hours usage time • Magnetic Charging",
    material: "Bodysafe Silicone & ABS",
    images: [
      "https://images.unsplash.com/photo-1617135002579-29bf4d4d12dc?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1200",
    ],
    variants: [
      { id: "v1", name: "Terracotta", colorCode: "#B08B7D" },
      { id: "v2", name: "Cream", colorCode: "#F5F5F5" },
    ],
  },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "how-to-choose-your-first-vibrator",
    category: "Product Guide",
    title: "How to Choose Your First Vibrator Without Feeling Overwhelmed",
    author: "The Editorial Team",
    date: "Oct 24, 2023",
    excerpt:
      "Size, material, vibration patterns—we break down the jargon so you can choose with confidence.",
    image:
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min read",
    featuredProductId: "p1",
    relatedArticleIds: [2, 3],
    content: [
      {
        type: "paragraph",
        text: "There is a misconception that intimacy is something shared only between two people. But before we can truly connect with another, we must first learn the language of our own bodies.",
      },
      {
        type: "blockquote",
        text: "Intimacy is not a performance. It is a conversation you have with yourself, where no words are needed.",
      },
      {
        type: "paragraph",
        text: "When choosing your first companion, texture and sound are just as important as power. Medical-grade silicone warms to your body temperature almost instantly, creating a seamless sensation.",
      },
      {
        type: "inline-product",
        productId: "p1",
        context: "We recommend starting with something gentle yet versatile...",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1200",
        caption: "Photo by LUMIERA Studio showing the soft-touch texture.",
      },
    ],
  },
  {
    id: 4,
    slug: "silicone-101-myths",
    category: "Deep Dive",
    title: "Silicone 101: 5 Myths You Need to Stop Believing",
    excerpt:
      "Not all materials are created equal. We dive deep into medical-grade silicone, why it's the gold standard for safety.",
    image:
      "https://images.unsplash.com/photo-1596464716154-10a6e2e7d7a1?auto=format&fit=crop&q=80&w=1600",
    readTime: "10 min read",
    content: [], // Placeholder
  },
  // ... other articles with basic data
  {
    id: 2,
    slug: "the-5-love-languages-of-the-bedroom",
    category: "Relationships",
    title: "The 5 Love Languages of the Bedroom",
    excerpt:
      "Communication is key. Discover how to translate your partner's desires.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
    readTime: "5 min read",
  },
  {
    id: 3,
    slug: "pelvic-floor-health",
    category: "Wellness",
    title: "Why Pelvic Floor Health is More Important Than You Think",
    excerpt:
      "It's not just about pleasure. Strong pelvic health is the foundation of physical wellbeing.",
    image:
      "https://images.unsplash.com/photo-1556228720-19875b1d564b?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
  },
  {
    id: 5,
    slug: "destigmatizing-pleasure",
    category: "Culture",
    title: "Destigmatizing Pleasure: A Brief History",
    excerpt:
      "From ancient artifacts to modern taboos, how our view of intimacy has evolved.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
  },
  {
    id: 6,
    slug: "nighttime-routine-better-sleep",
    category: "Rituals",
    title: "Creating a Nighttime Routine for Better Sleep",
    excerpt: "Disconnect to reconnect. Simple steps to unwind before bed.",
    image:
      "https://images.unsplash.com/photo-1522771753035-4a53c9d13185?auto=format&fit=crop&q=80&w=800",
    readTime: "3 min read",
  },
  {
    id: 7,
    slug: "the-science-of-touch",
    category: "Wellness",
    title: "The Science of Touch",
    excerpt:
      "Why physical contact releases oxytocin and reduces stress levels instantly.",
    image:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800",
    readTime: "5 min read",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Finally, a brand that doesn't make me feel awkward. The packaging was so beautiful and discreet.",
    author: "Elena, Berlin",
  },
  {
    text: "The Rose changed my self-care routine completely. It feels less like a toy and more like wellness.",
    author: "Sarah, London",
  },
  {
    text: "Incredible quality. The silicone is so soft and the motor is deep and rumbly, not buzzy.",
    author: "Marc & Chloe, Paris",
  },
];

export const GEMINI_SYSTEM_INSTRUCTION = `
You are 'Lumi', a warm, empathetic, and professional Wellness Concierge for LUMIERA, a premium sexual wellness brand.
Your goal is to de-stigmatize intimacy and help users find the right products based on their needs, while maintaining a Nordic, minimalist, and safe atmosphere.

Brand Values: Self-care, Intimacy, Sophistication, Safety.

Guidelines:
- Keep responses concise (under 80 words usually).
- Use polite, non-explicit language (e.g., use "intimacy", "pleasure", "self-discovery" instead of crude terms).
- If a user asks for a recommendation, suggest products with a focus on benefits (relaxation, connection) rather than just mechanics.
- If asked about shipping, reassure them it is 100% discreet with "SP-UK-STORE" on the bank statement.
- Be helpful but respect boundaries.
`;

export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Shop All", path: "/shop" },
  { name: "Story", path: "/about" },
  { name: "Journal", path: "/journal" },
];

export const FOOTER_LINKS = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Solo Play", href: "/shop?category=solo-play" },
    { name: "Couples", href: "/shop?category=couples" },
    { name: "Wellness", href: "/shop?category=wellness" },
  ],
  company: [
    { name: "Our Story", href: "/about" },
    { name: "Journal", href: "/journal" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Track My Order", href: "/order/lookup" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};
