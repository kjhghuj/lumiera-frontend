"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart, useRegion } from "@/lib/providers";
import { getProductsByIds } from "@/lib/medusa";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise, productImageCache } from "./components/utils";

// Components
import CartLoading from "./components/CartLoading";
import EmptyCart from "./components/EmptyCart";
import CartItem from "./components/CartItem";
import CouponSection from "./components/CouponSection";
import OrderSummary from "./components/OrderSummary";

// Main Cart Page Component
function CartContent() {
  const { cart, cartLoading, cartCount, updateItem, removeItem, applyBetterCoupon, removePromoCode } = useCart();
  const { region } = useRegion();
  const searchParams = useSearchParams();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({});

  // Batch fetch missing product images
  useEffect(() => {
    async function fetchMissingImages() {
      if (!cart?.items || !region?.id) return;

      const idsToFetch: string[] = [];

      cart.items.forEach((item) => {
        const variant = item.variant as any;
        const hasItemThumbnail = !!item.thumbnail;
        const hasVariantImage = variant?.images && variant.images.length > 0;
        const hasProductThumbnail = !!variant?.product?.thumbnail;
        const hasProductImage = variant?.product?.images && variant.product.images.length > 0;
        const hasCache = item.product_id && productImageCache[item.product_id];

        if (!hasItemThumbnail && !hasVariantImage && !hasProductThumbnail && !hasProductImage && !hasCache && item.product_id) {
            if (!idsToFetch.includes(item.product_id)) {
                idsToFetch.push(item.product_id);
            }
        }
      });

      if (idsToFetch.length > 0) {
        try {
          const products = await getProductsByIds(idsToFetch, region.id);
          const newResolved: Record<string, string> = {};

          products.forEach((product: any) => {
            const imageUrl = product.thumbnail || product.images?.[0]?.url;
            if (imageUrl && product.id) {
              productImageCache[product.id] = imageUrl;
              newResolved[product.id] = imageUrl;
            }
          });

          if (Object.keys(newResolved).length > 0) {
            setResolvedImages(prev => ({ ...prev, ...newResolved }));
          }
        } catch (error) {
          console.error("Failed to batch fetch product images:", error);
        }
      } else {
        // Just sync cache to state for any items that might have been cached previously but not in state
         const newResolved: Record<string, string> = {};
         cart.items.forEach(item => {
             if (item.product_id && productImageCache[item.product_id] && !resolvedImages[item.product_id]) {
                 newResolved[item.product_id] = productImageCache[item.product_id];
             }
         });
         if (Object.keys(newResolved).length > 0) {
             setResolvedImages(prev => ({ ...prev, ...newResolved }));
         }
      }
    }

    fetchMissingImages();
  }, [cart?.items, region?.id, resolvedImages]);

  // Auto-apply coupon from URL
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam && cart && !cartLoading) {
      // Check if already applied to avoid loop
      const alreadyApplied = cart.promotions?.some((p: any) => p.code === codeParam.toUpperCase());
      if (!alreadyApplied) {
        applyBetterCoupon(codeParam.toUpperCase());
      }
    }
  }, [searchParams, cart, cartLoading, applyBetterCoupon]);

  // Auto-reset if cart is completed (fixes "Cart already completed" stuck state)
  const { refreshCart } = useCart();
  useEffect(() => {
    if (cart && cart.completed_at) {
      refreshCart();
    }
  }, [cart, refreshCart]);

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

  const handleApplyPromoCode = async (code: string) => {
    setPromoLoading(true);
    try {
      // Use the smart "better coupon" logic instead of basic apply
      return await applyBetterCoupon(code);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromoCode = async (code: string) => {
    setPromoLoading(true);
    try {
      await removePromoCode(code);
    } catch (error) {
      console.error("Failed to remove promo code:", error);
    } finally {
      setPromoLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart?.item_subtotal || 0;
  const shipping = cart?.shipping_total || null;
  const tax = cart?.tax_total || 0;
  const discount = cart?.discount_total || 0;
  const total = cart?.total || subtotal;

  // Get applied promo codes from cart
  const appliedCodes: string[] = (cart as any)?.promotions?.map((p: any) => p.code) || [];

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
                    fallbackImage={item.product_id ? (resolvedImages[item.product_id] || productImageCache[item.product_id]) : null}
                  />
                ))}
              </div>

              {/* Coupon Section - Mobile Only (Below items) */}
              <div className="lg:hidden mt-6">
                <CouponSection
                  cart={cart}
                  appliedCodes={appliedCodes}
                  currencyCode={currencyCode}
                  onApplyCode={handleApplyPromoCode}
                  onRemoveCode={handleRemovePromoCode}
                  isLoading={promoLoading}
                />
              </div>

              {/* Mobile Order Summary Trigger */}
              <div className="lg:hidden mt-4">
                <Elements stripe={stripePromise}>
                  <OrderSummary
                    cart={cart}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    discount={discount}
                    total={total}
                    currencyCode={currencyCode}
                    itemCount={cartCount}
                    isLoading={updatingItemId !== null}
                  />
                </Elements>
              </div>
            </div>

            {/* Desktop Order Summary & Coupon (Right Sidebar) */}
            <div className="hidden lg:block space-y-8">
              {/* Coupon Section - Desktop Only (Above Summary) */}
              <CouponSection
                cart={cart}
                appliedCodes={appliedCodes}
                currencyCode={currencyCode}
                onApplyCode={handleApplyPromoCode}
                onRemoveCode={handleRemovePromoCode}
                isLoading={promoLoading}
              />

              <Elements stripe={stripePromise}>
                <OrderSummary
                  cart={cart}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  discount={discount}
                  total={total}
                  currencyCode={currencyCode}
                  itemCount={cartCount}
                  isLoading={updatingItemId !== null}
                />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartContent />
    </Suspense>
  );
}
