"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { StoreProductVariant } from "@/lib/types";

// Placeholder images
const PLACEHOLDER_IMAGE = "/placeholder.svg";
const FALLBACK_IMAGE = "/placeholder.svg"; // Use local placeholder as fallback

interface ProductImage {
  url?: string;
  id?: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  thumbnail?: string | null;  // 商品级别缩略图作为最终回退
  selectedVariant?: StoreProductVariant | null;
  isBestSeller?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
}

export default function ProductGallery({
  images,
  title,
  thumbnail,
  selectedVariant,
  isBestSeller,
  isNew,
  isOnSale,
  discountPercentage
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * 图片获取优先级（与后端 API 数据结构对齐）：
   * 
   * 根据 API_DOCUMENTATION.md，后端数据结构如下：
   * - variant.images: 变体专属图片数组 [{ id, url }]（用于SKU切换时显示对应图片）
   * - product.images: 商品图片数组 [{ id, url }]
   * - product.thumbnail: 商品缩略图 URL
   * 
   * 图片获取优先级：
   * 1. 首选：变体专属图片 (variant.images) - 切换SKU时显示对应变体图片
   * 2. 次选：商品图片数组 (product.images) - 变体无图片时回退
   * 3. 再次：商品缩略图 (product.thumbnail) - 无图片数组时回退
   * 4. 最后：占位图
   */
  const displayImages = useMemo(() => {
    const result: ProductImage[] = [];
    const seenUrls = new Set<string>();

    const addImage = (url?: string, id?: string) => {
      if (url && !seenUrls.has(url)) {
        result.push({ url, id });
        seenUrls.add(url);
      }
    };

    // 1. Priority: Variant Media (Locked to current SKU)
    const variantThumbnail = (selectedVariant as any)?.thumbnail;
    const variantImages = (selectedVariant as any)?.images;

    // Add variant thumbnail first
    if (variantThumbnail) {
      addImage(variantThumbnail);
    }

    // Add other variant-specific images
    if (variantImages && Array.isArray(variantImages)) {
      variantImages.forEach((img: any) => addImage(img.url, img.id));
    }

    // 2. Secondary: Product Gallery (All other angles/details)
    if (images && Array.isArray(images)) {
      images.forEach((img: any) => addImage(img.url, img.id));
    }

    // 3. Fallback: Product Thumbnail
    if (thumbnail) {
      addImage(thumbnail);
    }

    // 4. Final Fallback: Placeholder
    if (result.length === 0) {
      return [{ url: PLACEHOLDER_IMAGE }];
    }

    return result;
  }, [selectedVariant, images, thumbnail]);

  // Reset to first image when variant changes, with smooth transition
  useEffect(() => {
    if (selectedVariant) {
      setIsTransitioning(true);
      // Small delay to trigger CSS transition
      const timer = setTimeout(() => {
        setSelectedIndex(0);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedVariant]);

  const getImageSrc = (index: number) => {
    const imageKey = `${selectedVariant?.id || 'product'}_${index}`;
    if (imageErrors[imageKey]) return FALLBACK_IMAGE;
    return displayImages[index]?.url || PLACEHOLDER_IMAGE;
  };

  const handleImageError = (index: number) => {
    const imageKey = `${selectedVariant?.id || 'product'}_${index}`;
    console.warn(`Image failed to load: ${displayImages[index]?.url}`);
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const displayImagesCount = displayImages.length;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-cream rounded-lg overflow-hidden cursor-zoom-in"
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsZoomed(true);
        }}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Product Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isBestSeller && (
            <span className="bg-charcoal text-white text-xs uppercase tracking-wider px-3 py-1.5 font-medium">
              Best Seller
            </span>
          )}
          {isNew && (
            <span className="bg-sage text-white text-xs uppercase tracking-wider px-3 py-1.5 font-medium">
              New
            </span>
          )}
          {isOnSale && discountPercentage && discountPercentage > 0 && (
            <span className="bg-terracotta text-white text-xs uppercase tracking-wider px-3 py-1.5 font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Main Image with transition effect */}
        <div className={`relative w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={getImageSrc(selectedIndex)}
            alt={`${title}${selectedVariant ? ` - ${selectedVariant.title || 'Variant'}` : ''} - Image ${selectedIndex + 1}`}
            fill
            priority
            className={`object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
              }`}
            style={isZoomed ? {
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            } : undefined}
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={() => handleImageError(selectedIndex)}
          />
        </div>

        {/* Image Navigation Arrows */}
        {displayImagesCount > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => prev === 0 ? displayImagesCount - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex(prev => prev === displayImagesCount - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImagesCount > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {selectedIndex + 1} / {displayImagesCount}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {
        displayImagesCount > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {displayImages.slice(0, 4).map((image, idx) => (
              <button
                key={`thumb-${selectedVariant?.id || 'product'}-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square bg-cream rounded-lg overflow-hidden transition-all ${selectedIndex === idx
                  ? 'ring-2 ring-charcoal ring-offset-2'
                  : 'hover:opacity-80'
                  }`}
              >
                <Image
                  src={getImageSrc(idx)}
                  alt={`${title} - Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  onError={() => handleImageError(idx)}
                />
              </button>
            ))}
            {displayImagesCount > 4 && (
              <button
                onClick={() => setSelectedIndex(4)}
                className="relative aspect-square bg-cream rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <Image
                  src={getImageSrc(4)}
                  alt={`${title} - More images`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  onError={() => handleImageError(4)}
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium">+{displayImagesCount - 4}</span>
                </div>
              </button>
            )}
          </div>
        )
      }

      {/* Mobile Dots Indicator */}
      {
        displayImagesCount > 1 && (
          <div className="flex justify-center gap-2 lg:hidden">
            {displayImages.map((_, idx) => (
              <button
                key={`dot-${selectedVariant?.id || 'product'}-${idx}`}
                onClick={() => setSelectedIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${selectedIndex === idx ? 'bg-charcoal' : 'bg-gray-300'
                  }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )
      }
    </div >
  );
}
