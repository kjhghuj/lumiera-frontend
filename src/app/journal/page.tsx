"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ARTICLES } from "@/lib/constants";

// --- MOCK DATA FOR HERO ---
// In a real app, this might come from a CMS or specific "featured" flag
const HERO_STORY = {
  id: 1,
  slug: "how-to-choose-your-first-vibrator",
  category: "Featured Story",
  title: 'The Art of Slowing Down: Why "Me-Time" is the Ultimate Luxury.',
  excerpt:
    "In a world that never stops, reclaiming your pleasure is a radical act of self-care. Here is how to start your ritual.",
  image:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2000",
  readTime: "6 min read",
};

const CATEGORIES = [
  "All Stories",
  "Sexual Wellness",
  "Relationship Advice",
  "Product Guides",
  "Culture & Art",
];

// Focus Article (using one of our existing articles to mimic the layout)
// We'll use the one with id: 4 ("Silicone 101") if available, or a fallback
const FOCUS_ARTICLE_ID = 4;
const focusArticleData = ARTICLES.find((a) => a.id === FOCUS_ARTICLE_ID);

// --- COMPONENTS ---

const ArticleCard = ({ article }: { article: (typeof ARTICLES)[0] }) => (
  <Link
    href={`/journal/${article.slug}`}
    className="group cursor-pointer flex flex-col h-full block"
  >
    <div className="relative overflow-hidden rounded-sm bg-gray-100 aspect-[3/2] mb-6">
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors z-10 duration-500" />
      <ImageWithFallback
        src={article.image}
        alt={article.title}
        fill
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
      />
    </div>
    <div className="flex flex-col flex-grow">
      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
          {article.category}
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock size={10} /> {article.readTime}
        </span>
      </div>
      <h3 className="font-serif text-xl lg:text-2xl text-charcoal leading-tight mb-3 group-hover:text-terracotta transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-charcoal-light font-light line-clamp-3 leading-relaxed">
        {article.excerpt}
      </p>
    </div>
  </Link>
);

const FocusCard = () => {
  if (!focusArticleData) return null;

  return (
    <Link
      href={`/journal/${focusArticleData.slug}`}
      className="group cursor-pointer w-full bg-[#2C2C2C] rounded-sm overflow-hidden flex flex-col md:flex-row my-16 shadow-lg block"
    >
      {/* Left Image (2/3) */}
      <div className="w-full md:w-2/3 h-72 md:h-auto relative overflow-hidden">
        <ImageWithFallback
          src={focusArticleData.image}
          alt={focusArticleData.title}
          fill
          className="object-cover opacity-90 transition-transform duration-[1.5s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      </div>
      {/* Right Text (1/3) */}
      <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center text-white relative">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta mb-4">
          {focusArticleData.category}
        </span>
        <h3 className="font-serif text-2xl md:text-3xl mb-6 leading-tight group-hover:text-terracotta transition-colors">
          {focusArticleData.title}
        </h3>
        <p className="text-gray-400 font-light text-sm leading-relaxed mb-8 border-l border-gray-600 pl-4">
          {focusArticleData.excerpt}
        </p>
        <div className="flex items-center text-xs uppercase tracking-widest font-bold text-white group-hover:text-terracotta transition-colors mt-auto">
          Read Story{" "}
          <ArrowRight
            size={14}
            className="ml-2 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
};

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("All Stories");

  const gridArticles = ARTICLES.filter((a) => a.id !== FOCUS_ARTICLE_ID);

  return (
    <div className="bg-cream min-h-screen pt-[72px] lg:pt-[88px]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[75vh] lg:h-[650px] flex flex-col lg:flex-row overflow-hidden bg-[#F5F3EF]">
        {/* Mobile Overlay / Desktop Image */}
        <div className="relative w-full lg:w-[55%] h-full order-1 lg:order-2">
          <ImageWithFallback
            src={HERO_STORY.image}
            alt={HERO_STORY.title}
            fill
            className="object-cover lg:hover:scale-105 transition-transform duration-[2s] ease-out"
          />
          {/* Mobile Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
        </div>

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 lg:static lg:w-[45%] lg:bg-cream lg:flex lg:flex-col lg:justify-center lg:px-20 lg:py-0 order-2 lg:order-1 z-10">
          <div className="animate-fade-in-up">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/90 lg:text-terracotta mb-6">
              {HERO_STORY.category}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white lg:text-charcoal mb-8 leading-tight">
              {HERO_STORY.title}
            </h1>
            <p className="text-gray-200 lg:text-charcoal-light font-light text-base lg:text-lg leading-relaxed mb-10 max-w-md hidden md:block">
              {HERO_STORY.excerpt}
            </p>
            <Link
              href={`/journal/${HERO_STORY.slug}`}
              className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-white lg:text-charcoal border-b border-white lg:border-terracotta pb-2 hover:text-terracotta hover:border-terracotta transition-colors"
            >
              Read The Story <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STICKY FILTER BAR */}
      <div className="sticky top-[72px] lg:top-[88px] z-30 bg-cream/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8 py-4 overflow-x-auto no-scrollbar lg:justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 lg:p-0 rounded-full lg:rounded-none border lg:border-none text-xs uppercase tracking-widest transition-all ${activeCategory === cat
                    ? "bg-terracotta border-terracotta text-white lg:bg-transparent lg:text-charcoal lg:border-b-2 lg:border-terracotta font-bold"
                    : "border-gray-200 text-gray-500 hover:text-terracotta hover:border-terracotta"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. THE GRID */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
        {/* Row 1: First 3 Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {gridArticles.slice(0, 3).map((article, idx) => (
            <div
              key={article.id}
              style={{ animationDelay: `${idx * 100}ms` }}
              className="animate-fade-in-up"
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {/* Focus Card */}
        <div className="animate-fade-in-up">
          <FocusCard />
        </div>

        {/* Row 2: Remaining Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mt-16">
          {gridArticles.slice(3).map((article) => (
            <div key={article.id} className="animate-fade-in-up">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. NEWSLETTER */}
      <section className="bg-[#F5F3EF] py-24 border-t border-gray-200">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-4">
            Intimacy in your inbox.
          </h2>
          <p className="text-charcoal-light font-light mb-8 leading-relaxed">
            Join our community for wellness tips, exclusive product launches,
            and <span className="font-medium text-terracotta">10% off your first order</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-terracotta rounded-sm"
            />
            <button className="bg-charcoal text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-terracotta transition-colors rounded-sm shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider">
            Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
