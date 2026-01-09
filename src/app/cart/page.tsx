"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, useRegion } from "@/lib/providers";
import { formatPrice, getProductById } from "@/lib/medusa";
import { StoreCartLineItem } from "@/lib/types";

// Placeholder images
const PLACEHOLDER_IMAGE = "/placeholder.svg";
const FALLBACK_IMAGE = "/products/generic.svg"; // Use local SVG as fallback

// Cache for product images to avoid repeated API calls
const productImageCache: Record<string, string> = {};

// Icons
function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// Cart Item Component
function CartItem({
  item,
  currencyCode,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  regionId
}: {
  item: StoreCartLineItem;
  currencyCode: string;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
  regionId?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  /**
   * Image priority order:
   * 1. Cart item thumbnail (item.thumbnail)
   * 2. Variant's product thumbnail/image (item.variant?.product?.thumbnail or images)
   * 3. Product main image (fetched via API if needed)
   * 4. Placeholder image
   */
  useEffect(() => {
    async function resolveProductImage() {
      // Priority 1: Cart item's own thumbnail
      if (item.thumbnail) {
        setProductImage(item.thumbnail);
        setImageLoading(false);
        return;
      }

      // Priority 2: Variant's product thumbnail or first image
      const variant = item.variant as any;

      // Check for specific variant images first (Fix for SKUs showing wrong image)
      if (variant?.images && variant.images.length > 0) {
        setProductImage(variant.images[0].url);
        setImageLoading(false);
        return;
      }

      if (variant?.product?.thumbnail) {
        setProductImage(variant.product.thumbnail);
        setImageLoading(false);
        return;
      }
      if (variant?.product?.images && variant.product.images.length > 0) {
        setProductImage(variant.product.images[0].url);
        setImageLoading(false);
        return;
      }

      // Priority 3: Fetch product to get main image
      const productId = item.product_id;
      if (productId) {
        // Check cache first to avoid repeated API calls
        if (productImageCache[productId]) {
          setProductImage(productImageCache[productId]);
          setImageLoading(false);
          return;
        }

        try {
          const product = await getProductById(productId, regionId);
          if (product) {
            // Try product thumbnail first, then first image
            const imageUrl = product.thumbnail || product.images?.[0]?.url;
            if (imageUrl) {
              productImageCache[productId] = imageUrl;
              setProductImage(imageUrl);
              setImageLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to fetch product image:", error);
        }
      }

      // Priority 4: No image found, will use placeholder
      setProductImage(null);
      setImageLoading(false);
    }

    resolveProductImage();
  }, [item.thumbnail, item.variant, item.product_id, regionId]);

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

// Empty Cart Component
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-charcoal-light mb-6">
        <ShoppingBagIcon />
      </div>
      <h2 className="font-serif text-2xl text-charcoal mb-3">
        Your cart is empty
      </h2>
      <p className="text-charcoal-light text-center max-w-md mb-8">
        Looks like you haven&apos;t added any items to your cart yet.
        Explore our collection and find something you&apos;ll love.
      </p>
      <Link
        href="/shop"
        className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-charcoal-light transition-colors font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

// Loading State
function CartLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LoadingSpinner />
      <p className="mt-4 text-charcoal-light">Loading your cart...</p>
    </div>
  );
}

// Order Summary Component
function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
  currencyCode,
  itemCount,
  isLoading
}: {
  subtotal: number;
  shipping: number | null;
  tax: number;
  total: number;
  currencyCode: string;
  itemCount: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-cream rounded-2xl p-6 lg:p-8 sticky top-24">
      <h2 className="font-serif text-xl text-charcoal mb-6">
        Order Summary
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal-light">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-charcoal font-medium">
            {formatPrice(subtotal, currencyCode)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-charcoal-light">Shipping</span>
          <span className="text-charcoal font-medium">
            {shipping !== null ? formatPrice(shipping, currencyCode) : 'Calculated at checkout'}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-charcoal-light">Tax</span>
            <span className="text-charcoal font-medium">
              {formatPrice(tax, currencyCode)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between">
            <span className="font-serif text-lg text-charcoal">Total</span>
            <span className="font-serif text-lg text-charcoal">
              {formatPrice(total, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        disabled={isLoading || itemCount === 0}
        className="w-full mt-6 bg-terracotta text-white py-4 rounded-full hover:bg-terracotta-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Processing...
          </>
        ) : (
          'Proceed to Checkout'
        )}
      </button>

      {/* Continue Shopping */}
      <Link
        href="/shop"
        className="block w-full mt-3 text-center text-charcoal-light hover:text-charcoal transition-colors py-2"
      >
        Continue Shopping
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-charcoal-light mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Secure checkout
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-light mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          Discreet packaging
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-light">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          100% body-safe materials
        </div>
      </div>
    </div>
  );
}

// Main Cart Page Component
export default function CartPage() {
  const { cart, cartLoading, cartCount, updateItem, removeItem } = useCart();
  const { region } = useRegion();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const currencyCode = cart?.currency_code?.toUpperCase() || region?.currency_code?.toUpperCase() || "GBP";

  const handleUpdateQuantity = async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingItemId(lineItemId);
    try {
      await updateItem(lineItemId, quantity);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setUpdatingItemId(lineItemId);
    try {
      await removeItem(lineItemId);
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Calculate totals
  const subtotal = cart?.item_subtotal || 0;
  const shipping = cart?.shipping_total || null;
  const tax = cart?.tax_total || 0;
  const total = cart?.total || subtotal;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl text-charcoal">
            Shopping Cart
          </h1>
          {cartCount > 0 && !cartLoading && (
            <p className="text-charcoal-light mt-2">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {/* Loading State */}
        {cartLoading && <CartLoading />}

        {/* Empty Cart */}
        {!cartLoading && (!cart || !cart.items || cart.items.length === 0) && (
          <EmptyCart />
        )}

        {/* Cart Content */}
        {!cartLoading && cart && cart.items && cart.items.length > 0 && (
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                    onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                    onRemove={() => handleRemoveItem(item.id)}
                    isUpdating={updatingItemId === item.id}
                    regionId={region?.id}
                  />
                ))}
              </div>

              {/* Mobile Order Summary Trigger */}
              <div className="lg:hidden mt-8">
                <OrderSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  currencyCode={currencyCode}
                  itemCount={cartCount}
                  isLoading={updatingItemId !== null}
                />
              </div>
            </div>

            {/* Desktop Order Summary */}
            <div className="hidden lg:block">
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                currencyCode={currencyCode}
                itemCount={cartCount}
                isLoading={updatingItemId !== null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
