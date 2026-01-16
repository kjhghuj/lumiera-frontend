import Link from "next/link";
import { formatPrice } from "@/lib/medusa";
import { LoadingSpinner } from "./utils";
import StripeWalletButton from "./StripeWalletButton";

export default function OrderSummary({
  cart, // Add cart prop
  subtotal,
  shipping,
  tax,
  discount,
  total,
  currencyCode,
  itemCount,
  isLoading
}: {
  cart: any; // Add cart prop type
  subtotal: number;
  shipping: number | null;
  tax: number;
  discount: number;
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

      {/* Wallet Buttons */}
      {!isLoading && itemCount > 0 && (
         <StripeWalletButton cart={cart} amount={total} currency={currencyCode} />
      )}

      {/* Shipping Selector (Mock for UI requirement) */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-charcoal mb-3">Shipping Method</label>
        <div className="flex items-center gap-3 p-3 bg-white border border-terracotta rounded-lg cursor-default">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-terracotta">
            <div className="w-2.5 h-2.5 rounded-full bg-terracotta"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-charcoal">Standard Delivery</div>
            <div className="text-xs text-charcoal-light">3-5 Business Days</div>
          </div>
          <div className="text-sm font-medium text-green-600">Free</div>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal-light">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-charcoal font-medium">
            {formatPrice(subtotal, currencyCode)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">
              -{formatPrice(discount, currencyCode)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-charcoal-light">Shipping</span>
          <span className="text-charcoal font-medium">
            <span className="text-green-600">Free</span>
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
      <Link href="/checkout">
        <button
          disabled={isLoading || itemCount === 0}
          className="w-full bg-terracotta text-white py-4 rounded-full hover:bg-terracotta-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </button>
      </Link>

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
