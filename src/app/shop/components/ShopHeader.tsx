
export function ShopHeader({ category }: { category?: string }) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4">
        {category
          ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
          : "Shop All"}
      </h1>
      <p className="text-charcoal-light max-w-2xl">
        Explore our collection of premium wellness essentials, crafted with
        body-safe materials and designed for your pleasure.
      </p>
    </div>
  );
}
