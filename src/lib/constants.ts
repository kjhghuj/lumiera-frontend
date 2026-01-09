import { Article, Testimonial } from "./types";

export const COMPANY_INFO = {
  name: "LUMIERA LTD",
  regNo: "UK-8829104",
  address: "123 Wellness Way, London, UK",
};

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "how-to-choose-your-first-vibrator",
    category: "Product Guide",
    title: "How to Choose Your First Vibrator Without Feeling Overwhelmed",
    excerpt:
      "Size, material, vibration patterns—we break down the jargon so you can choose with confidence.",
    image:
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min read",
  },
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
    id: 4,
    slug: "silicone-101-myths",
    category: "Deep Dive",
    title: "Silicone 101: 5 Myths You Need to Stop Believing",
    excerpt:
      "Not all materials are created equal. We dive deep into medical-grade silicone, why it's the gold standard for safety, and how to spot cheap imitations that could harm your body.",
    image:
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1600",
    readTime: "10 min read",
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
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};
