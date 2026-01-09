"use client";

import { useState, useEffect } from "react";
import { Package, Truck, ShieldCheck, Lock } from "lucide-react";

const usps = [
  { icon: <Package size={16} />, text: "100% Discreet Packaging" },
  { icon: <Truck size={16} />, text: "Fast Shipping UK & EU" },
  { icon: <ShieldCheck size={16} />, text: "Body-Safe Materials" },
  { icon: <Lock size={16} />, text: "SSL Secure Payment" },
];

export default function HomeUSPBar() {
  const [uspIndex, setUspIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUspIndex((prev) => (prev + 1) % usps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#F5F3EF] border-b border-border">
      {/* Mobile: Auto Slider */}
      <div className="lg:hidden h-12 flex items-center justify-center overflow-hidden">
        <div className="flex items-center gap-2 text-charcoal-light text-xs uppercase tracking-widest animate-fade-in transition-opacity duration-500">
          <span className="text-sage">{usps[uspIndex].icon}</span>
          <span>{usps[uspIndex].text}</span>
        </div>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden lg:grid max-w-[1400px] mx-auto px-8 py-4 grid-cols-4 divide-x divide-gray-200">
        {usps.map((usp, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center gap-3 text-xs uppercase tracking-widest text-charcoal-light"
          >
            <span className="text-sage">{usp.icon}</span>
            <span>{usp.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
