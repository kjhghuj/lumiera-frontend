import { notFound } from "next/navigation";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ARTICLES } from "@/lib/constants";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16">
      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Journal
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 mb-12">
        <span className="text-xs uppercase tracking-widest text-terracotta mb-4 block">
          {article.category}
        </span>
        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-6">
          {article.title}
        </h1>
        <p className="text-charcoal-light text-lg">{article.excerpt}</p>
        <div className="mt-6 text-sm text-gray-400">{article.readTime}</div>
      </header>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="relative aspect-[16/9] overflow-hidden">
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 prose prose-lg">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
          nisl vel tincidunt lacinia, nisl nisl aliquam nisl, vel aliquam nisl
          nisl vel nisl. Sed euismod, nisl vel tincidunt lacinia, nisl nisl
          aliquam nisl, vel aliquam nisl nisl vel nisl.
        </p>
        <p>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
          Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis
          natoque penatibus et magnis dis parturient montes, nascetur ridiculus
          mus.
        </p>
        <h2>Understanding Your Body</h2>
        <p>
          Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam
          id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi
          porta gravida at eget metus.
        </p>
        <p>
          Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis
          vestibulum. Sed posuere consectetur est at lobortis. Cras mattis
          consectetur purus sit amet fermentum.
        </p>
        <h2>The Science Behind Pleasure</h2>
        <p>
          Vestibulum id ligula porta felis euismod semper. Morbi leo risus,
          porta ac consectetur ac, vestibulum at eros. Duis mollis, est non
          commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec
          elit.
        </p>
      </article>

      {/* Share / Related */}
      <div className="max-w-3xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100">
        <Link
          href="/journal"
          className="text-terracotta text-sm uppercase tracking-widest hover:underline"
        >
          Read More Articles →
        </Link>
      </div>
    </div>
  );
}
