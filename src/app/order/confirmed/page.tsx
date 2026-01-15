"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Icons
function CheckIcon() {
  return (
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-charcoal-light">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

export default function OrderConfirmedPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success") === "true";
    const orderNum = urlParams.get("order");
    const userEmail = urlParams.get("email");

    if (success && orderNum) {
      setOrderId(orderNum);
      if (userEmail) setEmail(userEmail);
    }
    // Artificial small delay for smooth transition
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setRegistering(true);
    setRegisterError(null);

    try {
      // Direct call to Medusa backend register
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          first_name: "Customer", // Fallback, usually we'd pass name too
          last_name: "",
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create account");
      }

      setRegisterSuccess(true);
      // Optional: Auto login? For now just show success.
    } catch (err: any) {
      console.error(err);
      setRegisterError(err.message || "Registration failed. You might already have an account.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-charcoal font-medium">Processing Confirmation...</p>
      </div>
    );
  }

  // Error State: Missing Order ID
  if (!orderId) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16 px-6">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-red-500 mb-4 mx-auto w-12 h-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-charcoal mb-4">Order Not Found</h1>
          <p className="text-charcoal-light mb-8">We couldn't retrieve the order details. Attempting to redirect you...</p>
          <Link href="/shop" className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-charcoal-light transition-colors">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Success Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
          <CheckIcon />
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-4">Order Confirmed!</h1>
          <p className="text-charcoal-light text-lg mb-8">
            Thank you for your purchase. We've received your order and sent a confirmation email to <span className="font-medium text-charcoal">{email || "your email"}</span>.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 inline-block w-full max-w-sm mx-auto">
            <p className="text-sm text-charcoal-light uppercase tracking-wider mb-2">Order Number</p>
            <p className="font-mono text-xl sm:text-2xl text-charcoal font-bold tracking-widest">{orderId}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="bg-charcoal text-white px-8 py-4 rounded-full hover:bg-charcoal-light transition-colors font-medium min-w-[200px]">
              Continue Shopping
            </Link>
            <Link href="/account" className="bg-white border border-gray-200 text-charcoal px-8 py-4 rounded-full hover:border-charcoal transition-colors font-medium min-w-[200px]">
              View Order Details
            </Link>
          </div>
        </div>

        {/* Quick Account Creation - Only if we have email and not successful yet */}
        {email && !registerSuccess && (
          <div className="bg-terracotta/5 rounded-2xl p-8 sm:p-10 border border-terracotta/20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:flex-1">
                <h2 className="font-serif text-2xl text-charcoal mb-3">Save your information?</h2>
                <p className="text-charcoal-light mb-4">
                  Create an account to checkout faster next time, track your orders, and receive exclusive offers.
                </p>
                <div className="flex items-center gap-2 text-sm text-charcoal-light">
                  <CheckIconSmall />
                  <span>Secure & Private</span>
                </div>
              </div>

              <div className="w-full md:w-auto md:min-w-[300px]">
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Create Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-terracotta/30 rounded-lg focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <div className="absolute left-3 top-3.5">
                        <LockIcon />
                      </div>
                    </div>
                  </div>

                  {registerError && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{registerError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta-dark transition-colors font-medium disabled:opacity-70"
                  >
                    {registering ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success State for Registration */}
        {registerSuccess && (
          <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="font-serif text-xl text-charcoal mb-2">Account Created!</h2>
            <p className="text-charcoal-light">
              Your account has been successfully created. You can now log in to view your order history.
            </p>
            <Link href="/account" className="inline-block mt-4 text-terracotta font-medium hover:underline">
              Go to My Account →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

function CheckIconSmall() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  )
}
