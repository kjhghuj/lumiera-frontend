import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatPrice, getShippingOptions, addShippingMethod } from "@/lib/medusa";
import { useCart } from "@/lib/providers";
import { LoadingSpinner } from "./utils";
import StripeWalletButton from "./StripeWalletButton";
import { ChevronDown, Check, Truck } from "lucide-react";

export default function OrderSummary({
  cart,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  currencyCode,
  itemCount,
  isLoading: isParentLoading
}: {
  cart: any;
  subtotal: number;
  shipping: number | null;
  tax: number;
  discount: number;
  total: number;
  currencyCode: string;
  itemCount: number;
  isLoading: boolean;
}) {
  const { refreshCart } = useCart();
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [updatingShipping, setUpdatingShipping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchOptions() {
      if (cart?.id) {
        setLoadingMethods(true);
        const options = await getShippingOptions(cart.id);
        setShippingOptions(options);
        setLoadingMethods(false);

        // Restore local selection if exists
        const savedInfo = localStorage.getItem(`lumiera_shipping_${cart.id}`);
        if (savedInfo) {
          setLocalSelectedId(savedInfo);
        }

        // Auto-select cheapest shipping if no method is currently selected
        const hasExistingMethod = cart?.shipping_methods?.[0]?.shipping_option_id || savedInfo;
        if (!hasExistingMethod && options.length > 0) {
          // Sort by price (ascending) and select cheapest
          const sortedOptions = [...options].sort((a, b) => (a.amount || 0) - (b.amount || 0));
          const cheapestOption = sortedOptions[0];
          if (cheapestOption) {
            console.log("[Shipping] Auto-selecting cheapest option:", cheapestOption.name, cheapestOption.amount);
            // Auto-apply the cheapest shipping method
            try {
              await addShippingMethod(cart.id, cheapestOption.id);
              setLocalSelectedId(cheapestOption.id);
              localStorage.setItem(`lumiera_shipping_${cart.id}`, cheapestOption.id);
              await refreshCart();
            } catch (error) {
              console.error("[Shipping] Failed to auto-select shipping:", error);
            }
          }
        }
      }
    }
    fetchOptions();
  }, [cart?.id]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShippingSelect = async (optionId: string) => {
    if (updatingShipping) return;
    setUpdatingShipping(true);
    setIsOpen(false);

    // Optimistic update
    setLocalSelectedId(optionId);
    if (cart?.id) localStorage.setItem(`lumiera_shipping_${cart.id}`, optionId);

    try {
      await addShippingMethod(cart.id, optionId);
      await refreshCart();
    } catch (error) {
      console.error("Failed to selecting shipping method:", error);
    } finally {
      setUpdatingShipping(false);
    }
  };

  // Priority: Cart data > Local state
  const currentShippingOptionId = cart?.shipping_methods?.[0]?.shipping_option_id || localSelectedId;
  const selectedOption = shippingOptions.find(o => o.id === currentShippingOptionId);
  const isLoading = isParentLoading || updatingShipping;

  return (
    <div className="bg-cream rounded-2xl p-6 lg:p-8 sticky top-24 shadow-sm border border-stone-100">
      <h2 className="font-serif text-xl text-charcoal mb-6 flex items-center gap-2">
        Order Summary
      </h2>

      {/* Shipping Selector */}
      <div className="mb-8 relative" ref={dropdownRef}>
        <label className="block text-xs uppercase tracking-widest text-charcoal-light mb-3 font-medium">Shipping Method</label>

        {loadingMethods ? (
          <div className="h-12 w-full bg-white border border-gray-200 rounded-lg flex items-center justify-center text-charcoal-light gap-2 text-sm">
            <LoadingSpinner /> Loading options...
          </div>
        ) : shippingOptions.length === 0 ? (
          <div className="text-sm text-charcoal-light italic p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Enter shipping address to see options.
          </div>
        ) : (
          <div className="relative">
            {/* Trigger Button */}
            <button
              onClick={() => !updatingShipping && setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between bg-white border rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/10 ${isOpen ? "border-terracotta ring-2 ring-terracotta/10" : "border-gray-200"
                } ${updatingShipping ? "opacity-70 cursor-wait" : ""}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-charcoal-light shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-charcoal truncate block">
                    {selectedOption ? selectedOption.name : "Select a method"}
                  </span>
                  {selectedOption && (
                    <span className="text-xs text-charcoal-light mt-0.5">
                      {selectedOption.amount === 0 ? "Free Shipping" : formatPrice(selectedOption.amount, currencyCode)}
                    </span>
                  )}
                </div>
              </div>
              {updatingShipping ? (
                <LoadingSpinner />
              ) : (
                <ChevronDown className={`w-4 h-4 text-charcoal-light transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                <div className="p-1.5 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {shippingOptions.map((option) => {
                    const isSelected = currentShippingOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleShippingSelect(option.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${isSelected
                          ? "bg-stone-50 text-charcoal font-medium"
                          : "text-charcoal-light hover:bg-stone-50 hover:text-charcoal"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-terracotta bg-terracotta" : "border-gray-300"
                            }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{option.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${option.amount === 0 ? "text-green-600 font-medium" : "text-charcoal-light"}`}>
                            {option.amount === 0 ? "Free" : formatPrice(option.amount, currencyCode)}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-6 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light">Subtotal</span>
          <span className="text-charcoal font-medium">
            {formatPrice(subtotal, currencyCode)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">
              -{formatPrice(discount, currencyCode)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm group relative">
          <span className="text-charcoal-light flex items-center gap-1.5">
            Shipping
            {!selectedOption && <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>}
          </span>
          <span className="text-charcoal font-medium">
            {shipping !== null ? (
              shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shipping, currencyCode)
              )
            ) : (
              <span className="text-charcoal-light text-xs italic">Calculated at checkout</span>
            )}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-light">Tax</span>
            <span className="text-charcoal font-medium">
              {formatPrice(tax, currencyCode)}
            </span>
          </div>
        )}

        <div className="pt-4 mt-2">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-serif text-lg text-charcoal">Total</span>
            <span className="font-serif text-2xl text-charcoal font-medium">
              {formatPrice(total, currencyCode)}
            </span>
          </div>
          <p className="text-xs text-right text-charcoal-light">Including taxes and duties</p>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-8 space-y-4">
        {/* Warning if no shipping selected */}
        {!selectedOption && shippingOptions.length > 0 && !loadingMethods && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Please select a shipping method to proceed
          </div>
        )}

        <Link href="/checkout">
          <button
            disabled={isLoading || itemCount === 0 || !selectedOption || loadingMethods}
            className="w-full bg-charcoal text-white py-4 rounded-xl hover:bg-black transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-charcoal/10 hover:shadow-xl hover:shadow-charcoal/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          >
            {isLoading || loadingMethods ? (
              <>
                <LoadingSpinner />
                <span>Processing...</span>
              </>
            ) : !selectedOption ? (
              <span>Select Shipping to Checkout</span>
            ) : (
              <span>Proceed to Checkout</span>
            )}
          </button>
        </Link>

        {/* Wallet Buttons - HIDDEN per request */}
        {/* {!isLoading && itemCount > 0 && (
          <div className="pt-2">
            <StripeWalletButton cart={cart} amount={total} currency={currencyCode} />
          </div>
        )} */}

        {/* Continue Shopping */}
        <Link
          href="/shop"
          className="block w-full text-center text-xs uppercase tracking-widest text-charcoal-light hover:text-terracotta transition-colors py-2"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-y-3 gap-x-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-charcoal-light">
          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          Secure checkout
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-charcoal-light">
          <div className="w-1 h-1 bg-charcoal-light rounded-full"></div>
          Discreet packaging
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-charcoal-light col-span-2">
          <div className="w-1 h-1 bg-charcoal-light rounded-full"></div>
          100% body-safe materials
        </div>
      </div>
    </div>
  );
}
