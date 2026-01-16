"use client";

import { useState, useCallback } from "react";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import ProductInfo from "./ProductInfo";
import { formatPrice } from "@/lib/medusa";
import { StoreProduct, StoreProductVariant, StoreProductCategory } from "@/lib/types";

interface ProductImage {
  url?: string;
}

interface ProductClientProps {
  product: StoreProduct;
  images: ProductImage[];
  thumbnail?: string | null;  // 商品级别缩略图
  category?: StoreProductCategory | null;
  regionId?: string;
  currencyCode: string;
  price?: number;
  originalPrice?: number;
  isBestSeller: boolean;
  isNew: boolean;
  isOnSale: boolean;
  discountPercentage: number;
}

export default function ProductClient({
  product,
  images,
  thumbnail,
  category,
  regionId,
  currencyCode,
  price,
  originalPrice,
  isBestSeller,
  isNew,
  isOnSale,
  discountPercentage,
}: ProductClientProps) {
  // State to track the currently selected variant
  const [selectedVariant, setSelectedVariant] = useState<StoreProductVariant | null>(null);

  // Callback to receive variant changes from ProductActions
  const handleVariantChange = useCallback((variant: StoreProductVariant | null) => {
    setSelectedVariant(variant);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Image Gallery - 支持变体图片切换，切换SKU时显示对应变体图片 */}
      <ProductGallery
        images={images}
        thumbnail={thumbnail}
        title={product.title || "Product"}
        selectedVariant={selectedVariant}
        isBestSeller={isBestSeller}
        isNew={isNew}
        isOnSale={isOnSale}
        discountPercentage={discountPercentage}
      />

      {/* Product Info */}
      <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
        {/* Category Badge */}
        {category && (
          <a 
            href={`/shop?category=${category.handle}`}
            className="text-xs uppercase tracking-widest text-terracotta hover:text-terracotta-dark transition-colors inline-block"
          >
            {category.name}
          </a>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
          {product.title}
        </h1>

        {/* Subtitle */}
        {product.subtitle && (
          <p className="text-charcoal-light text-lg">{product.subtitle}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <p className="text-2xl sm:text-3xl text-charcoal font-medium">
            {formatPrice(price, currencyCode)}
          </p>
          {isOnSale && originalPrice && (
            <>
              <p className="text-lg text-charcoal-light line-through">
                {formatPrice(originalPrice, currencyCode)}
              </p>
              <span className="text-sm font-medium text-terracotta bg-terracotta/10 px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="prose prose-sm text-charcoal-light max-w-none">
            <p className="leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Product Actions (Variants, Quantity, Add to Cart) */}
        <div className="pt-4">
          <ProductActions
            product={product}
            regionId={regionId}
            onVariantChange={handleVariantChange}
          />
        </div>

        {/* Product Info Accordion */}
        <ProductInfo product={product} />

        {/* Trust Badges */}
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 text-sm text-charcoal-light">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sage flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>100% Discreet Packaging</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-charcoal-light">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sage flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <span>Free UK Shipping over £50</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-charcoal-light">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sage flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>30-Day Easy Returns</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-charcoal-light">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sage flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <span>Body-Safe Materials</span>
          </div>
        </div>
      </div>
    </div>
  );
}
