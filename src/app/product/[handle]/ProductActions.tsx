"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/providers";
import { formatPrice } from "@/lib/medusa";
import { StoreProduct, StoreProductVariant } from "@/lib/types";

interface ProductActionsProps {
  product: StoreProduct;
  regionId?: string;
  onVariantChange?: (variant: StoreProductVariant | null) => void;
}

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

function ShoppingBagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

export default function ProductActions({ product, onVariantChange }: ProductActionsProps) {
  const router = useRouter();
  const { addItem, cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const variants = product.variants || [];
  const options = product.options || [];

  // Initialize selected options with first value of each option
  useMemo(() => {
    if (options.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initialOptions: Record<string, string> = {};
      options.forEach(option => {
        if (option.values && option.values.length > 0) {
          initialOptions[option.id] = option.values[0].value;
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [options, selectedOptions]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (variants.length === 1) return variants[0];

    return variants.find(variant => {
      if (!variant.options) return false;
      return variant.options.every(variantOption => {
        const selectedValue = selectedOptions[variantOption.option_id || ""];
        return selectedValue === variantOption.value;
      });
    });
  }, [variants, selectedOptions]);

  // Notify parent component when selected variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant || null);
    }
  }, [selectedVariant, onVariantChange]);

  // Since we cannot query inventory_quantity without sales_channel_id,
  // we assume products are in stock unless explicitly marked otherwise
  // In a production environment, you would configure a single sales channel
  // or pass sales_channel_id to the inventory query
  const isInStock = !selectedVariant?.manage_inventory || selectedVariant?.inventory_quantity !== 0;

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionId]: value }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    setIsAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      alert(`Failed to add to cart: ${error.message || "Unknown error"}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return;
    setIsBuyingNow(true);
    try {
      await addItem(selectedVariant.id, quantity);
      // Navigate directly to cart/checkout after adding item
      router.push("/cart");
    } catch (error) {
      console.error("Failed to add item for buy now:", error);
      setIsBuyingNow(false);
    }
  };

  // Combined loading state for disabling buttons
  const isProcessing = isAdding || isBuyingNow || cartLoading;

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    // Allow increasing quantity (max 10 for safety)
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  // Get price from selected variant
  const price = selectedVariant?.calculated_price?.calculated_amount;
  const originalPrice = selectedVariant?.calculated_price?.original_amount;
  const currencyCode = selectedVariant?.calculated_price?.currency_code?.toUpperCase() || "GBP";
  const isOnSale = originalPrice && price && originalPrice > price;

  return (
    <div className="space-y-6">
      {/* Option Selectors */}
      {options.map((option) => (
        <div key={option.id}>
          <h3 className="text-xs uppercase tracking-widest text-charcoal mb-3 flex items-center justify-between">
            <span>{option.title}</span>
            {selectedOptions[option.id] && (
              <span className="normal-case tracking-normal text-charcoal-light">
                {selectedOptions[option.id]}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isSelected = selectedOptions[option.id] === value.value;

              // Assume all variants are in stock since we can't query inventory
              // without sales_channel_id in the current API configuration
              const hasStock = true;

              return (
                <button
                  key={value.id}
                  onClick={() => handleOptionChange(option.id, value.value)}
                  disabled={!hasStock}
                  className={`px-4 py-2.5 text-sm border rounded-md transition-all ${isSelected
                    ? "bg-charcoal text-white border-charcoal"
                    : hasStock
                      ? "border-gray-200 text-charcoal hover:border-charcoal"
                      : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                    }`}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price Display (for variant-specific pricing) */}
      {variants.length > 1 && price && (
        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-xl font-medium text-charcoal">
            {formatPrice(price, currencyCode)}
          </span>
          {isOnSale && originalPrice && (
            <span className="text-sm text-charcoal-light line-through">
              {formatPrice(originalPrice, currencyCode)}
            </span>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-charcoal mb-3">
          Quantity
        </h3>
        <div className="flex items-center">
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="px-6 py-3 text-center min-w-[60px] font-medium">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Container */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isProcessing || !selectedVariant?.id || !isInStock}
          className={`w-full py-4 rounded-full uppercase tracking-widest text-sm font-bold transition-all flex items-center justify-center gap-2 ${justAdded
            ? "bg-sage text-white"
            : isInStock
              ? "bg-terracotta text-white hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          {justAdded ? (
            <>
              <CheckIcon />
              Added to Cart!
            </>
          ) : isAdding ? (
            <>
              <LoadingSpinner />
              Adding...
            </>
          ) : !isInStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBagIcon />
              Add to Cart
            </>
          )}
        </button>

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={isProcessing || !selectedVariant?.id || !isInStock}
          className={`w-full py-4 rounded-full uppercase tracking-widest text-sm font-bold transition-all flex items-center justify-center gap-2 ${isInStock
            ? "bg-charcoal text-white hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          {isBuyingNow ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : !isInStock ? (
            "Out of Stock"
          ) : (
            <>
              <BoltIcon />
              Buy Now
            </>
          )}
        </button>
      </div>

      {/* View Cart Link */}
      {justAdded && (
        <Link
          href="/cart"
          className="block w-full text-center py-3 border border-charcoal text-charcoal rounded-full uppercase tracking-widest text-sm font-medium hover:bg-charcoal hover:text-white transition-colors"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}
