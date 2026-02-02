"use client";

import { useState, useCallback } from "react";
import { Package, Truck, RotateCcw, ShieldCheck } from "lucide-react";
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

        {/* Trust Badges - Styled to match HomeUSPBar */}
        <div className="pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Package size={16} />, text: "100% Discreet Packaging" },
              { icon: <Truck size={16} />, text: "Free UK Shipping" },
              { icon: <RotateCcw size={16} />, text: "30-Day Returns" },
              { icon: <ShieldCheck size={16} />, text: "Body-Safe Materials" },
            ].map((usp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-sm bg-[#F5F3EF] border border-[#E8E6E3]/60 group hover:border-sage/30 transition-colors"
              >
                <span className="text-sage flex-shrink-0 group-hover:scale-110 transition-transform">{usp.icon}</span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium leading-tight">
                  {usp.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
