import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/medusa";
import { StoreCartLineItem } from "@/lib/types";
import { PLACEHOLDER_IMAGE, FALLBACK_IMAGE, MinusIcon, PlusIcon, TrashIcon } from "./utils";

export default function CartItem({
  item,
  currencyCode,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  regionId,
  variantImage,
  fallbackImage,
}: {
  item: StoreCartLineItem;
  currencyCode: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
  regionId?: string;
  variantImage?: string;
  fallbackImage?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  /**
   * Image priority order (matching ProductGallery logic):
   * 1. Variant-specific image (resolved from product API by variant_id)
   * 2. Cart item thumbnail (item.thumbnail)
   * 3. Product fallback image (fetched via API)
   * 4. Placeholder image
   */
  useEffect(() => {
    // Priority 1: Variant-specific image (resolved from product API)
    if (variantImage) {
      setProductImage(variantImage);
      setImageLoading(false);
      return;
    }

    // Priority 2: Cart item's own thumbnail
    if (item.thumbnail) {
      setProductImage(item.thumbnail);
      setImageLoading(false);
      return;
    }

    // Priority 3: Global fallback (product-level image)
    if (fallbackImage) {
      setProductImage(fallbackImage);
      setImageLoading(false);
      return;
    }

    // Priority 4: No image found
    setProductImage(null);
    setImageLoading(false);
  }, [variantImage, item.thumbnail, fallbackImage]);

  // Determine final image source with error handling
  const getImageSrc = () => {
    // If image load failed, use fallback
    if (imageError) {
      return FALLBACK_IMAGE;
    }
    // If we have a product image, use it
    if (productImage) {
      return productImage;
    }
    // While loading, show placeholder
    if (imageLoading) {
      return PLACEHOLDER_IMAGE;
    }
    // No image available, use fallback
    return FALLBACK_IMAGE;
  };

  const imageSrc = getImageSrc();

  // Handle image load error
  const handleImageError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setImageError(true);
  };

  const productTitle = item.product_title || (item as any).product?.title || item.variant?.product?.title || "Product";
  const variantTitle = item.variant_title || item.variant?.title;

  // Get the price
  const unitPrice = item.unit_price || 0;
  const lineTotal = item.total || unitPrice * item.quantity;

  return (
    <div className={`flex gap-4 py-6 border-b border-gray-200 ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Product Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-cream rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt={productTitle}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, 128px"
          onError={handleImageError}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div>
            <h3 className="font-serif text-lg text-charcoal truncate pr-4">
              {productTitle}
            </h3>
            {variantTitle && variantTitle !== productTitle && (
              <p className="text-sm text-charcoal-light mt-1">
                {variantTitle}
              </p>
            )}
          </div>

          {/* Remove Button - Desktop */}
          <button
            onClick={onRemove}
            disabled={isUpdating}
            className="hidden sm:flex items-center justify-center w-8 h-8 text-charcoal-light hover:text-terracotta transition-colors disabled:opacity-50"
            aria-label="Remove item"
          >
            <TrashIcon />
          </button>
        </div>

        {/* Price */}
        <p className="text-charcoal font-medium mt-2">
          {formatPrice(unitPrice, currencyCode)}
        </p>

        {/* Quantity Controls & Mobile Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:border-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="w-8 text-center font-medium text-charcoal">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:border-charcoal transition-colors disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <PlusIcon />
            </button>
          </div>

          {/* Line Total & Mobile Remove */}
          <div className="flex items-center gap-4">
            <p className="font-serif text-lg text-charcoal">
              {formatPrice(lineTotal, currencyCode)}
            </p>
            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="sm:hidden flex items-center justify-center w-8 h-8 text-charcoal-light hover:text-terracotta transition-colors disabled:opacity-50"
              aria-label="Remove item"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
