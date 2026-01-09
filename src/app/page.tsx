import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Truck, ShieldCheck, Lock } from "lucide-react";
import { getProducts, getRegion, getProductsByCollection, getCollections } from "@/lib/medusa";
import { ProductCard } from "@/components";
import { TESTIMONIALS } from "@/lib/constants";
import HomeUSPBar from "./HomeUSPBar";

export const revalidate = 60; // Revalidate every 60 seconds

async function getFeaturedProducts() {
  // Get region for pricing
  const region = await getRegion("gb");
  
  // Try to get best sellers collection first
  const collections = await getCollections();
  const bestSellersCollection = collections.find(
    (c) => c.handle === "best-sellers" || c.title?.toLowerCase().includes("best")
  );
  
  if (bestSellersCollection) {
    const products = await getProductsByCollection(bestSellersCollection.id, region?.id);
    return { products: products.slice(0, 4), region };
  }
  
  // Fallback to all products
  const { products } = await getProducts(region?.id, 4);
  return { products, region };
}

export default async function HomePage() {
  const { products, region } = await getFeaturedProducts();

  const categories = [
    {
      name: "Solo Pleasure",
      description: "Discover tools designed for your personal journey.",
      href: "/shop?category=solo-play",
      image:
        "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1200",
      size: "large",
    },
    {
      name: "Couples' Play",
      href: "/shop?category=couples",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
      size: "small",
    },
    {
      name: "Wellness & Care",
      href: "/shop?category=wellness",
      image:
        "https://images.unsplash.com/photo-1556228720-19875b1d564b?auto=format&fit=crop&q=80&w=800",
      size: "small",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] lg:h-screen w-full overflow-hidden bg-cream">
        <Image
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000"
          alt="Silk Texture"
          fill
          priority
          className="object-cover transition-transform duration-[20s] scale-110 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/90 via-white/20 to-transparent lg:bg-gradient-to-r lg:from-cream/80 lg:via-white/30 lg:to-transparent"></div>

        <div className="absolute inset-0 flex items-end lg:items-center p-6 lg:p-20">
          <div className="max-w-xl animate-fade-in mb-12 lg:mb-0 lg:ml-12">
            <h1 className="font-serif text-5xl lg:text-7xl text-charcoal mb-6 leading-[1.1]">
              Intimacy,
              <br />
              Reimagined.
            </h1>
            <p className="text-charcoal text-lg lg:text-xl font-light mb-10 tracking-wide max-w-sm">
              Premium wellness essentials designed for your pleasure and
              self-discovery.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-terracotta text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-all duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* USP Bar - Client Component */}
      <HomeUSPBar />

      {/* Category Grid */}
      <section className="py-16 lg:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 h-auto lg:h-[600px]">
          {/* Solo (Large Left) */}
          <Link
            href={categories[0].href}
            className="group relative overflow-hidden h-[400px] lg:h-full lg:row-span-2"
          >
            <Image
              src={categories[0].image}
              alt={categories[0].name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-terracotta/20 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8">
              <h3 className="font-serif text-3xl lg:text-4xl text-white mb-2">
                {categories[0].name}
              </h3>
              <p className="text-white/80 text-sm hidden lg:block mb-4 max-w-xs">
                {categories[0].description}
              </p>
              <span className="inline-flex items-center text-white text-xs uppercase tracking-widest border-b border-white pb-1 group-hover:text-cream group-hover:border-cream transition-colors">
                Shop Now <ArrowRight size={12} className="ml-2" />
              </span>
            </div>
          </Link>

          {/* Right Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden h-[300px] lg:h-full"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-terracotta/20 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-serif text-2xl lg:text-3xl text-white">
                    {cat.name}
                  </h3>
                  <span className="mt-2 inline-flex items-center text-white/0 group-hover:text-white text-xs uppercase tracking-widest transition-all transform translate-y-2 group-hover:translate-y-0">
                    Shop <ArrowRight size={12} className="ml-2" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers / Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-6 lg:px-8 mb-10 flex justify-between items-end">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2">
                Curated Favorites
              </h2>
              <p className="text-charcoal-light text-sm">
                Loved by our community.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest border-b border-charcoal pb-1 hover:text-terracotta hover:border-terracotta transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Product Grid */}
          <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto lg:overflow-visible px-6 lg:px-8 pb-8 no-scrollbar snap-x snap-mandatory">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="min-w-[280px] lg:min-w-0 snap-center">
                  <ProductCard
                    product={product}
                    regionCurrency={region?.currency_code?.toUpperCase() || "GBP"}
                  />
                </div>
              ))
            ) : (
              // Placeholder when no products
              <div className="col-span-4 text-center py-12 text-charcoal-light">
                <p>Products coming soon. Connect your Medusa backend to see products here.</p>
              </div>
            )}
            {/* Mobile Spacer */}
            <div className="min-w-[20px] lg:hidden"></div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 lg:py-32 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl lg:text-6xl text-charcoal mb-8 leading-tight">
            &ldquo;Pleasure is Natural.&rdquo;
          </h2>
          <p className="font-sans text-lg lg:text-xl text-charcoal-light leading-relaxed max-w-2xl mx-auto mb-10 font-light">
            We believe in a world where self-care includes sexual wellness. No
            shame, just joy. Designed in London, enjoyed worldwide.
          </p>
          <p className="font-serif italic text-terracotta text-lg">
            — The LUMIERA Team.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-8 border border-gray-100 text-center"
              >
                <div className="flex justify-center text-terracotta mb-4 gap-1 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="font-serif text-lg text-charcoal mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  — {t.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
