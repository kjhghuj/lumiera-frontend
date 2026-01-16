"use client";

import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative h-[90vh] lg:h-screen w-full overflow-hidden bg-cream">
      <Image
        src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000"
        alt="Silk Texture"
        fill
        priority
        className="object-cover transition-transform duration-[20s] scale-110 hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cream/90 via-white/20 to-transparent lg:bg-gradient-to-r lg:from-cream/80 lg:via-white/30 lg:to-transparent"></div>

      <div className="absolute inset-0 flex items-end lg:items-center p-6 lg:p-20">
        <div className="max-w-xl animate-fade-in mb-12 lg:mb-0 lg:ml-12">
          <h1 className="font-serif text-5xl lg:text-7xl text-charcoal mb-6 leading-[1.1]">
            Intimacy,
            <br />
            Reimagined.
          </h1>
          <p className="text-charcoal text-lg lg:text-xl font-light mb-10 tracking-wide max-w-sm">
            Premium wellness essentials designed for your pleasure and
            self-discovery.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-terracotta text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-all duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
