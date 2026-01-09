"use client";

import { useState, useEffect } from "react";

export default function AgeVerificationModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on client side
    const isVerified = localStorage.getItem("lumiera_age_verified");
    if (!isVerified) {
      setIsVisible(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem("lumiera_age_verified", "true");
    setIsVisible(false);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[10px]" />

      {/* Content */}
      <div className="relative bg-cream max-w-md w-full p-8 md:p-12 text-center shadow-2xl rounded-sm animate-fade-in">
        <h2 className="font-serif text-3xl text-charcoal mb-4">
          Welcome to LUMIERA.
        </h2>
        <p className="text-charcoal-light mb-8 text-sm leading-relaxed">
          Our site contains age-restricted products designed for adult wellness
          and intimacy. By entering, you confirm you are 18 years or older.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerify}
            className="w-full bg-terracotta text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-terracotta-dark transition-colors"
          >
            I am 18+
          </button>
          <button
            onClick={handleExit}
            className="w-full bg-transparent border border-gray-300 text-gray-400 py-3 text-sm uppercase tracking-widest hover:text-charcoal hover:border-charcoal transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
