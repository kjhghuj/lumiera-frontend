"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/providers";
import { CheckoutError } from "./components/CheckoutError";
import { ContactForm } from "./components/ContactForm";
import { SubmitButton } from "./components/SubmitButton";

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
    name: "", // Combined name
    phone: "",
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
      // Split name into first and last
      const nameParts = billingData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

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
            first_name: firstName,
            last_name: lastName,
            phone: billingData.phone,
            address_1: billingData.address,
            city: billingData.city,
            country_code: billingData.country,
            postal_code: billingData.postalCode,
          },
          billing_address: {
            first_name: firstName,
            last_name: lastName,
            phone: billingData.phone,
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
            name: billingData.name,
            email: billingData.email,
            phone: billingData.phone,
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
        // Re-derive names for redirect
        const namePartsRedirect = billingData.name.trim().split(" ");
        const firstNameRedirect = namePartsRedirect[0] || "";
        const lastNameRedirect = namePartsRedirect.length > 1 ? namePartsRedirect.slice(1).join(" ") : "";

        const redirectUrl = `/order/confirmed?success=true&order=${orderData.id}&email=${encodeURIComponent(billingData.email)}&first_name=${encodeURIComponent(firstNameRedirect)}&last_name=${encodeURIComponent(lastNameRedirect)}`;
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
      <CheckoutError error={error} onClear={() => setError(null)} />
      <form onSubmit={handleSubmit}>
        <ContactForm
          billingData={billingData}
          setBillingData={setBillingData}
          cardData={cardData}
          setCardData={setCardData}
        />
        <SubmitButton processing={processing} disabled={processing || !stripe || !elements} />
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
