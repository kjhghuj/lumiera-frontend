import Link from "next/link";
import { ProductCard } from "@/components";

export function FeaturedProducts({ products, region }: { products: any[]; region: any }) {
  return (
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
  );
}
