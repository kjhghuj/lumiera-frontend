"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { StoreProductCategory } from "@/lib/types";

interface ShopFiltersProps {
  categories: StoreProductCategory[];
  currentCategory?: string;
  currentSort?: string;
  productCount: number;
}

export default function ShopFilters({
  categories,
  currentCategory,
  currentSort,
  productCount,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-y border-gray-100">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("category", null)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              !currentCategory
                ? "bg-charcoal text-white border-charcoal"
                : "border-gray-200 text-charcoal hover:border-charcoal"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.handle || "")}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                currentCategory === cat.handle
                  ? "bg-charcoal text-white border-charcoal"
                  : "border-gray-200 text-charcoal hover:border-charcoal"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-charcoal-light">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          <select
            value={currentSort || "featured"}
            onChange={(e) =>
              updateFilter("sort", e.target.value === "featured" ? null : e.target.value)
            }
            className="text-xs uppercase tracking-widest border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-charcoal"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
