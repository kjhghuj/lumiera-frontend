"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/providers";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

export default function CheckoutPage() {
  const { cart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
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

    if (!cart?.id || cart.items?.length === 0) {
      setError("Your cart is empty or invalid");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cart.id}/payment-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          provider_id: "stripe",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment session");
      }

      const data = await response.json();
      console.log("[Checkout] Payment session created:", data);

      if (!data.cart?.payment_session?.data?.client_secret) {
        throw new Error("Payment session not available");
      }

      const clientSecret = data.cart.payment_session.data.client_secret;
      window.location.href = `/checkout/confirm?client_secret=${clientSecret}`;
    } catch (error: any) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to create payment session");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="max-w-[800px] mx-auto px-6">
        <Link href="/cart" className="inline-block mb-6 text-charcoal-light hover:text-terracotta">
          ← Back to Cart
        </Link>

        <h1 className="font-serif text-3xl text-charcoal mb-8">
          Checkout
        </h1>

        {processing && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-charcoal-light">Processing payment...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="mt-4 text-red-600 hover:text-red-700 underline block"
            >
              Try Again
            </button>
          </div>
        )}

        {!processing && !error && (
          <Elements stripe={stripePromise}>
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h2 className="font-serif text-xl text-charcoal mb-4">Shipping Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={billingData.firstName}
                      onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={billingData.lastName}
                      onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={billingData.email}
                      onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Address
                    </label>
                    <textarea
                      value={billingData.address}
                      onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta min-h-[100px] rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={billingData.city}
                      onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={billingData.postalCode}
                      onChange={(e) => setBillingData({ ...billingData, postalCode: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Country
                    </label>
                    <select
                      value={billingData.country}
                      onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>
                </div>

                <h2 className="font-serif text-xl text-charcoal mb-4 mt-8">Payment Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Card Information
                    </label>
                    <div className="w-full border border-gray-200 px-4 py-3 focus-within:border-terracotta rounded-lg">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#2c2c2c',
                              '::placeholder': {
                                color: '#9ca3af',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                      Cardholder Name
                    </label>
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
                  disabled={processing}
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
          </Elements>
        )}
      </div>
    </div>
  );
}
