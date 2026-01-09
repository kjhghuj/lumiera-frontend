import { Suspense } from "react";
import { getProducts, getCategories, getRegion } from "@/lib/medusa";
import { ProductCard } from "@/components";
import ShopFilters from "./ShopFilters";

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

async function getShopData() {
  const region = await getRegion("gb");
  const [{ products }, categories] = await Promise.all([
    getProducts(region?.id, 50),
    getCategories(),
  ]);

  return { products, categories, region };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sort } = await searchParams;
  const { products, categories, region } = await getShopData();

  // Filter by category if specified
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter((p) =>
      p.categories?.some(
        (c) =>
          c.handle?.toLowerCase() === category.toLowerCase() ||
          c.name?.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  // Sort products
  if (sort === "price-asc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        (a.variants?.[0]?.calculated_price?.calculated_amount || 0) -
        (b.variants?.[0]?.calculated_price?.calculated_amount || 0)
    );
  } else if (sort === "price-desc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        (b.variants?.[0]?.calculated_price?.calculated_amount || 0) -
        (a.variants?.[0]?.calculated_price?.calculated_amount || 0)
    );
  } else if (sort === "newest") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    );
  }

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4">
          {category
            ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
            : "Shop All"}
        </h1>
        <p className="text-charcoal-light max-w-2xl">
          Explore our collection of premium wellness essentials, crafted with
          body-safe materials and designed for your pleasure.
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-12" />}>
        <ShopFilters
          categories={categories}
          currentCategory={category}
          currentSort={sort}
          productCount={filteredProducts.length}
        />
      </Suspense>

      {/* Product Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
    </div>
  );
}
