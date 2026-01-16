"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Solo Pleasure",
    description: "Discover tools designed for your personal journey.",
    href: "/shop?category=solo-play",
    image:
      "https://images.unsplash.com/photo-1616627561950-9f8405d7b972?auto=format&fit=crop&q=80&w=1200",
    size: "large",
  },
  {
    name: "Couples' Play",
    href: "/shop?category=couples",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
    size: "small",
  },
  {
    name: "Wellness & Care",
    href: "/shop?category=wellness",
    image:
      "https://images.unsplash.com/photo-1556228720-19875b1d564b?auto=format&fit=crop&q=80&w=800",
    size: "small",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 lg:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 h-auto lg:h-[600px]">
        {/* Solo (Large Left) */}
        <Link
          href={CATEGORIES[0].href}
          className="group relative overflow-hidden h-[400px] lg:h-full lg:row-span-2"
        >
          <Image
            src={CATEGORIES[0].image}
            alt={CATEGORIES[0].name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-terracotta/20 transition-colors duration-500" />
          <div className="absolute bottom-8 left-8">
            <h3 className="font-serif text-3xl lg:text-4xl text-white mb-2">
              {CATEGORIES[0].name}
            </h3>
            <p className="text-white/80 text-sm hidden lg:block mb-4 max-w-xs">
              {CATEGORIES[0].description}
            </p>
            <span className="inline-flex items-center text-white text-xs uppercase tracking-widest border-b border-white pb-1 group-hover:text-cream group-hover:border-cream transition-colors">
              Shop Now <ArrowRight size={12} className="ml-2" />
            </span>
          </div>
        </Link>

        {/* Right Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
          {CATEGORIES.slice(1).map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative overflow-hidden h-[300px] lg:h-full"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-terracotta/20 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-serif text-2xl lg:text-3xl text-white">
                  {cat.name}
                </h3>
                <span className="mt-2 inline-flex items-center text-white/0 group-hover:text-white text-xs uppercase tracking-widest transition-all transform translate-y-2 group-hover:translate-y-0">
                  Shop <ArrowRight size={12} className="ml-2" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
