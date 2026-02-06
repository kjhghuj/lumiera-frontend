import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

// --- MOCK DATA FOR HERO ---
const HERO_STORY = {
    id: 1,
    slug: "how-to-choose-your-first-vibrator",
    category: "Featured Story",
    title: 'The Art of Slowing Down: Why "Me-Time" is the Ultimate Luxury.',
    excerpt:
        "In a world that never stops, reclaiming your pleasure is a radical act of self-care. Here is how to start your ritual.",
    image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2000",
    readTime: "6 min read",
};

export default function JournalHero() {
    return (
        <section className="relative w-full h-[75vh] lg:h-[650px] flex flex-col lg:flex-row overflow-hidden bg-[#F5F3EF]">
            {/* Mobile Overlay / Desktop Image */}
            <div className="relative w-full lg:w-[55%] h-full order-1 lg:order-2">
                <ImageWithFallback
                    src={HERO_STORY.image}
                    alt={HERO_STORY.title}
                    fill
                    className="object-cover lg:hover:scale-105 transition-transform duration-[2s] ease-out"
                />
                {/* Mobile Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            </div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 lg:static lg:w-[45%] lg:bg-cream lg:flex lg:flex-col lg:justify-center lg:px-20 lg:py-0 order-2 lg:order-1 z-10">
                <div className="animate-fade-in-up">
                    <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/90 lg:text-terracotta mb-6">
                        {HERO_STORY.category}
                    </span>
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white lg:text-charcoal mb-8 leading-tight">
                        {HERO_STORY.title}
                    </h1>
                    <p className="text-gray-200 lg:text-charcoal-light font-light text-base lg:text-lg leading-relaxed mb-10 max-w-md hidden md:block">
                        {HERO_STORY.excerpt}
                    </p>
                    <Link
                        href={`/journal/${HERO_STORY.slug}`}
                        className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-white lg:text-charcoal border-b border-white lg:border-terracotta pb-2 hover:text-terracotta hover:border-terracotta transition-colors"
                    >
                        Read The Story <ArrowRight size={14} className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
