"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import {
  ShieldCheck,
  PenTool,
  Leaf,
  Mail,
  MapPin,
  Building2,
} from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="bg-cream w-full pt-16 lg:pt-24">
      {/* 1. THE MANIFESTO (Text Left, Image Right) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 mb-24 lg:mb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text */}
          <div className="flex-1 order-2 lg:order-1 animate-fade-in-up">
            <h1 className="font-serif text-4xl lg:text-6xl text-charcoal mb-8 leading-[1.1]">
              Pleasure is a Ritual,
              <br />
              <span className="italic text-terracotta">Not a Taboo.</span>
            </h1>
            <div className="prose text-charcoal-light font-light text-lg leading-relaxed space-y-6">
              <p>
                For too long, the adult industry has been defined by neon lights
                and vulgarity. At{" "}
                <span className="font-bold text-charcoal">LUMIERA</span>, we
                believe intimacy is a fundamental part of wellness—just like
                skincare, meditation, or a good night&#39;s sleep.
              </p>
              <p>
                We started in London with a simple mission: to create intimate
                companions that honor your body and look beautiful on your
                nightstand. No shame. No secrets. Just pure, natural joy.
              </p>
            </div>
          </div>

          {/* Visual: Mood Shot */}
          <div className="flex-1 order-1 lg:order-2 w-full h-[500px] lg:h-[700px] bg-gray-100 relative overflow-hidden group">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1200"
              alt="Morning light on sheets"
              fill
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-terracotta/5 mix-blend-multiply"></div>
          </div>
        </div>
      </section>

      {/* 2. OUR STANDARDS (3 Column Icons) */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {/* Standard 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                <Leaf size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-4">
                Uncompromising Quality
              </h3>
              <p className="text-charcoal-light font-light leading-relaxed text-sm lg:text-base px-4">
                We only use FDA-approved, medical-grade silicone. Velvety soft,
                hypoallergenic, and 100% body-safe.
                <span className="block mt-2 font-medium">
                  If we wouldn&#39;t use it ourselves, we won&#39;t sell it.
                </span>
              </p>
            </div>

            {/* Standard 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                <PenTool size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-4">
                Design-Led Aesthetics
              </h3>
              <p className="text-charcoal-light font-light leading-relaxed text-sm lg:text-base px-4">
                Functionality meets art. Our curated collection features
                ergonomic designs that blend seamlessly into your modern
                lifestyle. Quiet, elegant, and powerful.
              </p>
            </div>

            {/* Standard 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-4">
                Your Secret is Safe
              </h3>
              <p className="text-charcoal-light font-light leading-relaxed text-sm lg:text-base px-4">
                Privacy is our obsession. From our encrypted payment systems to
                our unbranded packaging, your business remains yours alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ORIGIN STORY (Image Left, Text Right) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Visual: Studio Shot */}
          <div className="flex-1 w-full h-[400px] lg:h-[600px] bg-gray-100 relative overflow-hidden order-1">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=1200"
              alt="Design Studio"
              fill
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          {/* Text */}
          <div className="flex-1 order-2">
            <h2 className="font-serif text-3xl lg:text-5xl text-charcoal mb-8">
              From Our Studio
              <br />
              to Your Sanctuary.
            </h2>
            <div className="prose text-charcoal-light font-light text-lg leading-relaxed space-y-6">
              <p>
                Founded in the UK, LUMIERA began as a conversation between
                friends tired of the &#39;sleazy&#39; shopping experience in
                traditional adult stores. We wanted to create a space that felt
                safe, inclusive, and sophisticated.
              </p>
              <p>
                Today, we serve thousands of customers across Europe, curating
                the finest wellness tools from around the globe and delivering
                them with care. Every product is hand-tested in our London
                studio before it ever reaches our shelves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPLIANCE & CONTACT FOOTER (For Auditors/Trust) */}
      <section className="bg-[#F5F5F5] py-20 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl text-charcoal mb-8">
            Get in Touch
          </h2>

          <div className="space-y-6 text-sm text-charcoal-light font-light">
            <p className="leading-relaxed">
              Have a question about a product or your order? Our team is here to
              help.
              <br />
              We operate strictly according to UK consumer law to ensure your
              rights and safety.
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 py-6 border-y border-gray-300/50">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-terracotta" />
                <span>support@lumiera.co (Mon-Fri, 9am-5pm GMT)</span>
              </div>
              <div className="hidden md:block w-[1px] h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-terracotta" />
                <span>{COMPANY_INFO.address}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gray-400">
                <Building2 size={12} />
                <span>Company Reg: {COMPANY_INFO.regNo}</span>
              </div>
              <p className="text-[10px] text-gray-400 max-w-lg mx-auto leading-relaxed">
                LUMIERA is a trading name of {COMPANY_INFO.name}. All products
                are sold as adult novelties. We utilize 256-bit SSL encryption
                for all transactions. Your bank statement will appear as
                &#39;SP-UK-STORE&#39;.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
