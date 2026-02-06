import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, Facebook, Twitter, Link as LinkIcon, ArrowRight } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getProductById, getRegion } from "@/lib/medusa";
import { getArticleBySlug, getRelatedArticles, Article, ArticleBlock } from "@/lib/cms";
import ReadingProgressBar from "@/components/journal/ReadingProgressBar";
import MobileStickyBar from "@/components/journal/MobileStickyBar";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found | Lumiera" };
  }

  return {
    title: `${article.title} | Lumiera Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image }],
      type: "article",
      authors: [article.author || "The Editorial Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

// --- SUB-COMPONENTS (Server) ---

import { StoreProduct } from "@/lib/types";
import { formatPrice } from "@/lib/medusa";

// ... existing imports ...

// Helper to get price
const getProductPrice = (product: StoreProduct) => {
  const price = product.variants?.[0]?.calculated_price?.calculated_amount;
  return price ? price / 100 : 0;
};

// Helper to get image
const getProductImage = (product: StoreProduct) => {
  return product.thumbnail || product.images?.[0]?.url || "";
};

const StickySidebar = ({ product }: { product: StoreProduct | null | undefined }) => {
  if (!product) return null;

  const price = getProductPrice(product);
  const imageUrl = getProductImage(product);
  const category = product.categories?.[0]?.name || "Wellness";

  return (
    <div className="sticky top-32 w-full animate-fade-in-up">
      <div className="bg-white border border-gray-100 p-5 rounded-sm shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
          <span className="text-[9px] uppercase tracking-[0.2em] text-terracotta font-bold">
            Featured Item
          </span>
        </div>

        <Link href={`/product/${product.handle}`} className="group block">
          <div className="aspect-[4/5] bg-[#F9F8F6] mb-4 overflow-hidden rounded-sm relative">
            <ImageWithFallback
              src={imageUrl}
              alt={product.title}
              fill
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-serif text-lg text-charcoal group-hover:text-terracotta transition-colors leading-tight">
                {product.title}
              </h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                {category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-terracotta font-bold text-sm">
                €{price.toFixed(2)}
              </p>
            </div>
          </div>

          <button className="w-full bg-charcoal text-white py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-terracotta transition-colors shadow-sm">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

const InlineProductBlock = ({ product }: { product: StoreProduct }) => {
  const price = getProductPrice(product);
  const imageUrl = getProductImage(product);

  return (
    <div className="my-10 bg-[#F9F8F6] p-6 rounded-sm border border-gray-100 lg:hidden shadow-sm">
      <p className="text-xs font-serif italic text-charcoal-light mb-4 border-b border-gray-200 pb-2">
        &quot;We recommend pairing this practice with...&quot;
      </p>
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-white flex-shrink-0 rounded-sm overflow-hidden border border-gray-100 relative">
          <ImageWithFallback
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center flex-1">
          <h4 className="font-serif text-lg text-charcoal leading-tight mb-1">
            {product.title}
          </h4>
          <p className="text-terracotta text-sm font-bold mb-3">
            €{price.toFixed(2)}
          </p>
          <Link
            href={`/product/${product.handle}`}
            className="inline-block text-[10px] uppercase tracking-widest font-bold text-charcoal border border-charcoal text-center py-2 px-4 hover:bg-charcoal hover:text-white transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
};

// Content block renderer
const ContentRenderer = ({
  content,
  featuredProduct,
}: {
  content: ArticleBlock[];
  featuredProduct: StoreProduct | null | undefined;
}) => {
  return (
    <>
      {content.map((block, idx) => {
        if (block.type === "paragraph") {
          const isFirst = idx === 0;
          return (
            <div
              key={idx}
              className={`text-lg md:text-xl font-light leading-[1.8] text-charcoal-light ${isFirst ? "flow-root" : ""
                }`}
            >
              {isFirst && block.text ? (
                <span className="float-left mr-3 text-6xl font-serif text-terracotta leading-[0.8] pt-2">
                  {block.text.charAt(0)}
                </span>
              ) : null}
              {isFirst && block.text ? block.text.slice(1) : block.text}
            </div>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={idx}
              className="my-12 p-8 bg-[#F9F8F6] border-l-4 border-terracotta rounded-r-sm"
            >
              <p className="font-serif text-2xl md:text-3xl italic text-charcoal leading-snug">
                &quot;{block.text}&quot;
              </p>
            </blockquote>
          );
        }

        if (block.type === "image" && block.src) {
          return (
            <figure key={idx} className="w-full my-8 block">
              <div className="w-full h-auto min-h-[400px] overflow-hidden rounded-sm shadow-sm relative aspect-[16/9]">
                <ImageWithFallback
                  src={block.src}
                  alt={block.caption || "Article visual"}
                  fill
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s]"
                />
              </div>
              {block.caption && (
                <figcaption className="text-center text-xs text-gray-400 mt-4 uppercase tracking-wider">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (
          block.type === "inline-product" &&
          featuredProduct &&
          featuredProduct.id === block.productId
        ) {
          return <InlineProductBlock key={idx} product={featuredProduct} />;
        }

        // Heading blocks from Strapi
        if (block.type === "heading") {
          const className = "font-serif text-2xl md:text-3xl text-charcoal mt-12 mb-6";
          if (block.level === 1) return <h1 key={idx} className={className}>{block.text}</h1>;
          if (block.level === 3) return <h3 key={idx} className={className}>{block.text}</h3>;
          if (block.level === 4) return <h4 key={idx} className={className}>{block.text}</h4>;
          return <h2 key={idx} className={className}>{block.text}</h2>;
        }

        // List blocks from Strapi
        if (block.type === "list" && block.items) {
          return (
            <ul
              key={idx}
              className="list-disc list-inside space-y-2 text-lg text-charcoal-light font-light ml-4"
            >
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </>
  );
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Fetch article from Strapi CMS
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Fetch related articles if available
  const relatedArticles = article.relatedArticleIds
    ? await getRelatedArticles(article.relatedArticleIds)
    : [];

  // Get default region for context
  const region = await getRegion("gb");
  const cleanedProductId = article.featuredProductId?.trim();

  // Find featured product from Medusa
  const featuredProduct = cleanedProductId
    ? await getProductById(cleanedProductId, region?.id)
    : undefined;

  console.log(`[JournalDebug] Loading article: ${article.title}`);
  console.log(`[JournalDebug] Raw ID: "${article.featuredProductId}"`);
  console.log(`[JournalDebug] Cleaned ID: "${cleanedProductId}"`);
  console.log(`[JournalDebug] Region ID: ${region?.id}`);
  console.log(`[JournalDebug] Product found:`, featuredProduct ? "YES" : "NO");
  if (featuredProduct) console.log(`[JournalDebug] Product Data: ${featuredProduct.id} - ${featuredProduct.title}`);

  return (
    <div className="bg-cream min-h-screen pt-[72px] lg:pt-[88px]">
      {/* 0. READING PROGRESS BAR (Client Component) */}
      <ReadingProgressBar />

      {/* 1. ARTICLE HEADER */}
      <header className="max-w-[1000px] mx-auto px-6 lg:px-8 pt-12 lg:pt-24 pb-12 text-center relative z-10">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-8 flex items-center justify-center gap-2">
          <Link
            href="/journal"
            className="hover:text-terracotta transition-colors"
          >
            Journal
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-charcoal">{article.category}</span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-charcoal mb-8 leading-[1.15] tracking-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-charcoal-light">
          <span>{article.date || "Oct 24, 2023"}</span>
          <span className="w-1 h-1 bg-terracotta rounded-full"></span>
          <span>{article.readTime}</span>
          <span className="w-1 h-1 bg-terracotta rounded-full"></span>
          <span>By {article.author || "The Editorial Team"}</span>
        </div>
      </header>

      {/* Hero Image */}
      <div className="w-full max-w-[1200px] mx-auto px-4 lg:px-8 mb-16 lg:mb-24 relative z-0">
        <div className="aspect-[3/2] lg:aspect-[21/9] overflow-hidden rounded-sm shadow-sm relative">
          <ImageWithFallback
            src={article.image}
            alt={article.imageAlt}
            fill
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 relative z-0 items-start">
        {/* Left Column: Content */}
        <div className="lg:col-span-9 lg:pr-12 flex flex-col min-w-0">
          {/* Share Links */}
          <div className="flex gap-6 mb-12 text-gray-400 border-b border-gray-100 pb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-charcoal self-center mr-auto">
              Share Story
            </span>
            <Share2
              size={18}
              className="hover:text-terracotta cursor-pointer transition-colors"
            />
            <Facebook
              size={18}
              className="hover:text-terracotta cursor-pointer transition-colors"
            />
            <Twitter
              size={18}
              className="hover:text-terracotta cursor-pointer transition-colors"
            />
            <LinkIcon
              size={18}
              className="hover:text-terracotta cursor-pointer transition-colors"
            />
          </div>

          {/* Typography Content Wrapper */}
          <div className="font-sans text-charcoal-light space-y-8 flex-1">
            {article.content && article.content.length > 0 ? (
              <ContentRenderer
                content={article.content}
                featuredProduct={featuredProduct}
              />
            ) : (
              <p className="text-lg text-charcoal-light">
                {article.excerpt} (Full content coming soon)
              </p>
            )}
          </div>

          {/* Author Bio */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h4 className="font-serif text-lg text-charcoal mb-2">
              About The Editorial Team
            </h4>
            <p className="text-sm font-light text-charcoal-light leading-relaxed">
              Our team of wellness experts, sexologists, and writers are
              dedicated to creating a safe, inclusive space for exploration. We
              believe that knowledge is the key to unlocking pleasure.
            </p>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-3 pl-8 border-l border-gray-100 min-h-full">
          <StickySidebar product={featuredProduct} />
        </div>
      </div>

      {/* 3. READ NEXT */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="bg-white py-24 border-t border-gray-100 relative z-10">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta mb-4 block">
                Up Next
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
                Continue Reading
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {relatedArticles.map((relArticle) => (
                <Link
                  key={relArticle.id}
                  href={`/journal/${relArticle.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/9] bg-gray-100 mb-6 overflow-hidden rounded-sm relative">
                    <ImageWithFallback
                      src={relArticle.image}
                      alt={relArticle.imageAlt}
                      fill
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                    <span>{relArticle.category}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{relArticle.readTime}</span>
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal group-hover:text-terracotta transition-colors leading-tight">
                    {relArticle.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE STICKY BOTTOM BAR (Client Component) */}
      <MobileStickyBar />

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: [article.image],
            datePublished: article.date ? new Date(article.date).toISOString() : undefined,
            author: {
              "@type": "Person",
              name: article.author || "The Editorial Team",
            },
            publisher: {
              "@type": "Organization",
              name: "Lumiera",
              logo: {
                "@type": "ImageObject",
                url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://lumiera.com"}/logo.png`,
              },
            },
            description: article.excerpt,
          }),
        }}
      />
    </div>
  );
}
