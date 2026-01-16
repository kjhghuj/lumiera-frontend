import { ProductCard } from "@/components";

interface ProductGridProps {
  products: any[];
  region: any;
  category?: string;
}

export function ProductGrid({ products, region, category }: ProductGridProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              regionCurrency={region?.currency_code?.toUpperCase() || "GBP"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-charcoal-light text-lg mb-4">
            {category
              ? "No products found in this category."
              : "No products available yet."}
          </p>
          <p className="text-sm text-gray-400">
            Connect your Medusa backend to display products.
          </p>
        </div>
      )}
    </div>
  );
}
