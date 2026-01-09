import Image from "next/image";
import Link from "next/link";
import { ARTICLES } from "@/lib/constants";

export const metadata = {
  title: "Journal | LUMIERA",
  description: "Explore articles about wellness, intimacy, relationships, and self-care.",
};

export default function JournalPage() {
  // Featured article (first one)
  const featured = ARTICLES[0];
  const articles = ARTICLES.slice(1);

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4">
          The Journal
        </h1>
        <p className="text-charcoal-light max-w-2xl">
          Explore stories about wellness, intimacy, and self-discovery. Breaking
          taboos, one article at a time.
        </p>
      </div>

      {/* Featured Article */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Link href={`/journal/${featured.slug}`} className="group block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center py-8">
              <span className="text-xs uppercase tracking-widest text-terracotta mb-4">
                {featured.category}
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-4 group-hover:text-terracotta transition-colors">
                {featured.title}
              </h2>
              <p className="text-charcoal-light mb-6">{featured.excerpt}</p>
              <span className="text-xs uppercase tracking-widest text-charcoal-light">
                {featured.readTime}
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Article Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="text-xs uppercase tracking-widest text-terracotta mb-2 block">
                {article.category}
              </span>
              <h3 className="font-serif text-xl text-charcoal mb-2 group-hover:text-terracotta transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-charcoal-light line-clamp-2 mb-2">
                {article.excerpt}
              </p>
              <span className="text-xs text-gray-400">{article.readTime}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
