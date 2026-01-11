"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function OrderConfirmedPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success") === "true";
    const orderNum = urlParams.get("order");

    if (success && orderNum) {
      setOrderNumber(orderNum);
      setLoading(false);
    } else {
      setLoading(false);
    }

    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="max-w-[800px] mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-charcoal-light">Processing order...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-green-600">
                  <polyline points="20 6 9 17 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="23 22 23 12 23 12 4.5 22 4.5 22 4.5 23 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl text-charcoal">Order Confirmed!</h1>
            </div>

            {orderNumber ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="font-serif text-xl text-charcoal mb-6">Thank You for Your Order</h2>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-4">
                    <span className="text-charcoal-light">Order Number:</span>
                    <span className="font-mono text-charcoal font-bold">{orderNumber}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-4">
                    <span className="text-charcoal-light">Status:</span>
                    <span className="text-green-600 font-bold">Confirmed</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-charcoal-light">
                      Your order has been successfully processed. You will receive an email confirmation shortly with your order details.
                    </p>
                    <p className="text-charcoal-light">
                      Order total will be charged to the payment method you selected during checkout.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <Link
                    href="/shop"
                    className="block w-full text-center bg-charcoal text-white py-4 rounded-full hover:bg-charcoal-light transition-colors"
                  >
                    Continue Shopping
                  </Link>

                  <Link
                    href="/account"
                    className="block w-full text-center border border-gray-200 text-charcoal py-4 rounded-full hover:border-terracotta transition-colors"
                  >
                    View Order History
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="text-red-600 mb-4">
                    <div className="w-16 h-16 mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-red-600">
                        <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="font-serif text-xl text-charcoal mb-4">Order Not Found</h2>
                    <p className="text-charcoal-light mb-6">
                      We couldn't find your order details. This might be due to:
                    </p>
                    <ul className="list-disc list-inside text-charcoal-light space-y-2 mb-6">
                      <li>The order was already completed or cancelled</li>
                      <li>The session has expired</li>
                      <li>There was an error processing your payment</li>
                    </ul>
                    <Link
                      href="/shop"
                      className="inline-block bg-charcoal text-white px-6 py-3 rounded-full hover:bg-charcoal-light transition-colors"
                    >
                      Return to Shop
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
