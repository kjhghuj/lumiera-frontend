"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StoreProduct } from "@/lib/types";
import { formatPrice } from "@/lib/medusa";

// Default placeholder image when no product image available
const PLACEHOLDER_IMAGE = "/placeholder.svg";
// Local fallback images - avoid external URLs that may resolve to private IPs
const FALLBACK_IMAGES = [
  "/products/generic.svg",
  "/products/rose.svg",
  "/products/wand.svg",
];

// Get a consistent fallback image based on product ID
function getFallbackImage(productId?: string): string {
  if (!productId) return FALLBACK_IMAGES[0];
  const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

interface ProductCardProps {
  product: StoreProduct;
  regionCurrency?: string;
}

export default function ProductCard({ product, regionCurrency = "GBP" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get product images
  const images = product.images || [];
  const fallbackImage = getFallbackImage(product.id);
  const mainImage = images[0]?.url || (imageError ? fallbackImage : PLACEHOLDER_IMAGE);
  const secondaryImage = images[1]?.url || mainImage;

  // Get the cheapest variant price
  const price = product.variants?.[0]?.calculated_price?.calculated_amount;
  const compareAtPrice = product.variants?.[0]?.calculated_price?.original_amount;

  // Check if product has a "best seller" tag or collection
  const isBestSeller = product.tags?.some(
    (tag) => tag.value?.toLowerCase() === "best seller" || tag.value?.toLowerCase() === "bestseller"
  );

  // Get category from product's first category
  const category = product.categories?.[0]?.name || "Wellness";

  return (
    <div className="group relative">
      <Link href={`/product/${product.handle}`} className="block">
        <div
          className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 mb-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Image */}
          <Image
            src={mainImage}
            alt={product.title || "Product"}
            fill
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
          {/* Secondary "Lifestyle" Image */}
          <Image
            src={secondaryImage}
            alt={`${product.title} lifestyle`}
            fill
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />

          {isBestSeller && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-charcoal text-[10px] uppercase tracking-widest px-3 py-1">
              Best Seller
            </span>
          )}

          {compareAtPrice && compareAtPrice > (price || 0) && (
            <span className="absolute top-4 right-4 bg-terracotta text-white text-[10px] uppercase tracking-widest px-3 py-1">
              Sale
            </span>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif text-lg text-charcoal group-hover:text-terracotta transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
              {category}
            </p>
          </div>
          <div className="text-right">
            <span className="text-terracotta font-medium">
              {formatPrice(price, regionCurrency)}
            </span>
            {compareAtPrice && compareAtPrice > (price || 0) && (
              <span className="block text-xs text-gray-400 line-through">
                {formatPrice(compareAtPrice, regionCurrency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
