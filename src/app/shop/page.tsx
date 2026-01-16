import { Suspense } from "react";
import { getProducts, getCategories, getRegion } from "@/lib/medusa";
import ShopFilters from "./components/ShopFilters";
import { ShopHeader } from "./components/ShopHeader";
import { ProductGrid } from "./components/ProductGrid";

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
      <ShopHeader category={category} />

      <Suspense fallback={<div className="h-12" />}>
        <ShopFilters
          categories={categories}
          currentCategory={category}
          currentSort={sort}
          productCount={filteredProducts.length}
        />
      </Suspense>

      <ProductGrid
        products={filteredProducts}
        region={region}
        category={category}
      />
    </div>
  );
}
