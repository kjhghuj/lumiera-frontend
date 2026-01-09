import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Story | LUMIERA",
  description: "Learn about LUMIERA's mission to redefine intimacy through design, safety, and open conversation.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556228720-19875b1d564b?auto=format&fit=crop&q=80&w=2000"
          alt="About LUMIERA"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-serif text-5xl lg:text-7xl text-white text-center">
            Our Story
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl lg:text-5xl text-charcoal mb-8">
            Redefining Intimacy
          </h2>
          <p className="text-charcoal-light text-lg lg:text-xl leading-relaxed mb-8">
            LUMIERA was born from a simple belief: that sexual wellness is an
            essential part of self-care. We create premium products that
            celebrate pleasure without shame, combining Nordic design principles
            with body-safe innovation.
          </p>
          <p className="text-charcoal-light text-lg lg:text-xl leading-relaxed">
            Our mission is to destigmatize intimate wellness and empower
            everyone to embrace their desires with confidence, curiosity, and
            joy.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-charcoal text-center mb-16">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Body-Safe",
                description:
                  "Every product is crafted from medical-grade, non-toxic materials that are gentle on your body.",
              },
              {
                title: "Discreet",
                description:
                  "Plain packaging, neutral billing, and complete privacy. Your intimate life stays private.",
              },
              {
                title: "Sustainable",
                description:
                  "We minimize environmental impact through recyclable packaging and responsible manufacturing.",
              },
              {
                title: "Inclusive",
                description:
                  "Pleasure is for everyone. Our products are designed to be enjoyed by all bodies and identities.",
              },
            ].map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-terracotta/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-terracotta font-serif text-xl">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3">
                  {value.title}
                </h3>
                <p className="text-charcoal-light text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-[#F9F8F6]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <blockquote className="font-serif text-3xl lg:text-4xl text-charcoal mb-8 italic">
            &ldquo;We believe pleasure is a fundamental part of wellness, not
            something to be hidden away.&rdquo;
          </blockquote>
          <p className="text-terracotta uppercase tracking-widest text-sm">
            — The LUMIERA Team
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-charcoal mb-6">
            Ready to Explore?
          </h2>
          <p className="text-charcoal-light mb-8">
            Discover our collection of thoughtfully designed wellness
            essentials.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-terracotta text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
