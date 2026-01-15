"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/providers";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

function CheckoutForm() {
  const { cart, refreshCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardData, setCardData] = useState({
    name: "",
  });

  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Redirect if cart is invalid OR already completed
    if (!cart?.id || cart.items?.length === 0 || cart.completed_at) {
      if (cart?.completed_at) {
        // If completed, trigger a refresh to clear it and create new one
        refreshCart();
        router.push("/cart"); // or /account
        return;
      }
      setError("Your cart is empty or invalid");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    try {
      // 0.1 Update Cart with Email and Address (CRITICAL STEP)
      console.log("[Checkout] Updating cart with customer info...");
      const updateCartResponse = await fetch(`/api/medusa/store/carts/${cart.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          email: billingData.email,
          shipping_address: {
            first_name: billingData.firstName,
            last_name: billingData.lastName,
            address_1: billingData.address,
            city: billingData.city,
            country_code: billingData.country,
            postal_code: billingData.postalCode,
          },
          billing_address: {
            first_name: billingData.firstName,
            last_name: billingData.lastName,
            address_1: billingData.address,
            city: billingData.city,
            country_code: billingData.country,
            postal_code: billingData.postalCode,
          }
        }),
      });

      if (!updateCartResponse.ok) {
        console.warn("[Checkout] Failed to update cart contact info", await updateCartResponse.json());
        // We might want to throw here, but maybe let it proceed? 
        // Better to throw because order will be anon/empty address otherwise.
        throw new Error("Failed to save shipping information.");
      }

      // 0.2 Auto-select Default Shipping Method
      console.log("[Checkout] Selecting shipping method...");
      const shippingOptionsResponse = await fetch(`/api/medusa/store/shipping-options?cart_id=${cart.id}`, {
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        }
      });

      if (shippingOptionsResponse.ok) {
        const { shipping_options } = await shippingOptionsResponse.json();
        if (shipping_options && shipping_options.length > 0) {
          const defaultOption = shipping_options[0];
          console.log("[Checkout] Selected shipping option:", defaultOption.name);

          await fetch(`/api/medusa/store/carts/${cart.id}/shipping-methods`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
            body: JSON.stringify({ option_id: defaultOption.id }),
          });
        }
      }

      // 1. Create Payment Session & Get Client Secret
      console.log("[Checkout] Creating payment session...");
      const response = await fetch(`/api/checkout/${cart.id}/payment-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: "pp_stripe_stripe"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize payment");
      }

      const data = await response.json();
      const clientSecret = data.client_secret;

      if (!clientSecret) {
        throw new Error("Failed to get payment client secret");
      }

      console.log("[Checkout] Client secret obtained. Confirming with Stripe...");

      // 2. Confirm Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${billingData.firstName} ${billingData.lastName}`,
            email: billingData.email,
            address: {
              line1: billingData.address,
              city: billingData.city,
              postal_code: billingData.postalCode,
              country: billingData.country,
            },
          },
        },
      });

      if (result.error) {
        console.error("[Checkout] Stripe error:", result.error);
        throw new Error(result.error.message);
      }

      console.log("[Checkout] Payment confirmed:", result.paymentIntent);

      // 3. Complete Cart (Place Order)
      // Using proxy to backend: /api/medusa/store/carts/{id}/complete
      console.log("[Checkout] Completing cart...");
      const completeResponse = await fetch(`/api/medusa/store/carts/${cart.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        // If 404/500, it might be the proxy failing. But let's assume it works or we'll debug.
        throw new Error(errorData.message || "Failed to complete order");
      }

      const completeData = await completeResponse.json();
      console.log("[Checkout] Order completed:", completeData);

      // Support both Medusa v1 ({ type: "order", data: ... }) and v2/direct ({ order: ... }) response formats
      const orderData = completeData.order || (completeData.type === "order" ? completeData.data : null);

      if (orderData) {
        // Success!
        // Redirect FIRST, then refresh cart to avoid re-rendering issues causing navigation aborts
        const redirectUrl = `/order/confirmed?success=true&order=${orderData.display_id || orderData.id}&email=${encodeURIComponent(billingData.email)}&first_name=${encodeURIComponent(billingData.firstName)}&last_name=${encodeURIComponent(billingData.lastName)}`;
        console.log("[Checkout] Redirecting to:", redirectUrl);
        router.push(redirectUrl);

        // Refresh cart afterwards (no await needed for navigation)
        refreshCart().catch(err => console.error("Background cart refresh failed:", err));
      } else if (completeData.type === "cart") {
        // Should not happen if payment succeeded, but Medusa flows can be complex.
        // If error, it usually throws.
        throw new Error("Cart completion returned cart status (payment failed?)");
      } else {
        console.warn("[Checkout] Unrecognized completion response, fallback redirect to Account:", completeData);
        // Fallback success check
        await refreshCart();
        router.push("/account"); // Fallback
      }

    } catch (error: any) {
      console.error("[Checkout] Error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            type="button"
            className="mt-4 text-red-600 hover:text-red-700 underline block"
          >
            Try Again
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h2 className="font-serif text-xl text-charcoal mb-4">Shipping Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">First Name</label>
                <input
                  type="text"
                  value={billingData.firstName}
                  onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Last Name</label>
                <input
                  type="text"
                  value={billingData.lastName}
                  onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Email</label>
              <input
                type="email"
                value={billingData.email}
                onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Address</label>
              <textarea
                value={billingData.address}
                onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta min-h-[80px] rounded-lg"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">City</label>
                <input
                  type="text"
                  value={billingData.city}
                  onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Postal Code</label>
                <input
                  type="text"
                  value={billingData.postalCode}
                  onChange={(e) => setBillingData({ ...billingData, postalCode: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Country</label>
              <select
                value={billingData.country}
                onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                required
              >
                <option value="">Select Country</option>
                <option value="gb">United Kingdom</option>
                <option value="us">United States</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
              </select>
            </div>
          </div>

          <h2 className="font-serif text-xl text-charcoal mb-4 mt-8">Payment Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Card Information</label>
              <div className="w-full border border-gray-200 px-4 py-3 focus-within:border-terracotta rounded-lg bg-white">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#2c2c2c',
                        '::placeholder': { color: '#9ca3af' },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Cardholder Name</label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing || !stripe || !elements}
            className="w-full mt-8 bg-terracotta text-white py-4 rounded-full hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm uppercase tracking-wider"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              "Complete Payment"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="max-w-[800px] mx-auto px-6">
        <Link href="/cart" className="inline-block mb-6 text-charcoal-light hover:text-terracotta">
          ← Back to Cart
        </Link>
        <h1 className="font-serif text-3xl text-charcoal mb-8">Checkout</h1>

        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
