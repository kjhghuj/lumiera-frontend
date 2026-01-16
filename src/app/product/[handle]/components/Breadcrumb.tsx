interface BreadcrumbProps {
  product: any;
  category?: any;
}

export function Breadcrumb({ product, category }: BreadcrumbProps) {
  return (
    <nav className="mb-8 text-sm">
      <ol className="flex items-center gap-2 text-charcoal-light">
        <li>
          <a href="/" className="hover:text-charcoal transition-colors">Home</a>
        </li>
        <li>/</li>
        <li>
          <a href="/shop" className="hover:text-charcoal transition-colors">Shop</a>
        </li>
        {category && (
          <>
            <li>/</li>
            <li>
              <a
                href={`/shop?category=${category.handle}`}
                className="hover:text-charcoal transition-colors"
              >
                {category.name}
              </a>
            </li>
          </>
        )}
        <li>/</li>
        <li className="text-charcoal truncate max-w-[200px]">{product.title}</li>
      </ol>
    </nav>
  );
}
