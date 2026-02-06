import { Metadata } from "next";
import { getArticles, Article } from "@/lib/cms";
import JournalHero from "@/components/journal/JournalHero";
import JournalContent from "@/components/journal/JournalContent";
import NewsletterSection from "@/components/journal/NewsletterSection";

// SEO Metadata
export const metadata: Metadata = {
  title: "Journal | Lumiera - Wellness & Intimacy Insights",
  description:
    "Explore our curated collection of articles on sexual wellness, relationships, product guides, and self-care rituals. Expert insights for your intimate journey.",
  openGraph: {
    title: "Journal | Lumiera",
    description:
      "Explore our curated collection of articles on sexual wellness, relationships, product guides, and self-care rituals.",
    type: "website",
  },
};

const CATEGORIES = [
  "All Stories",
  "Sexual Wellness",
  "Relationship Advice",
  "Product Guides",
  "Culture & Art",
];

// Focus Article ID - could also be managed via Strapi "featured" field
const FOCUS_ARTICLE_ID = 4;

export default async function JournalPage() {
  // Fetch articles from Strapi CMS
  const articles = await getArticles();

  // Find focus article and filter grid articles
  const focusArticle = articles.find((a: Article) => a.id === FOCUS_ARTICLE_ID);
  const gridArticles = articles.filter((a: Article) => a.id !== FOCUS_ARTICLE_ID);

  return (
    <div className="bg-cream min-h-screen pt-[72px] lg:pt-[88px]">
      {/* 1. HERO SECTION */}
      <JournalHero />

      {/* 2. FILTER BAR + ARTICLE GRID (shared state) */}
      <JournalContent
        articles={gridArticles}
        focusArticle={focusArticle}
        categories={CATEGORIES}
      />

      {/* 3. NEWSLETTER */}
      <NewsletterSection />
    </div>
  );
}
