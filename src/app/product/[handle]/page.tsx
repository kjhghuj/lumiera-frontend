import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedProductByHandle, getProducts, getRegion } from "@/lib/medusa";
import ProductClient from "./ProductClient";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

// Generate static paths for products
export async function generateStaticParams() {
  try {
    const region = await getRegion("gb");
    const { products } = await getProducts(region?.id, 100);
    return products.map((product) => ({
      handle: product.handle,
    }));
  } catch {
    return [];
  }
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const region = await getRegion("gb");
  const product = await getCachedProductByHandle(handle, region?.id);

  if (!product) {
    return {
      title: "Product Not Found | LUMIERA",
      description: "The product you are looking for could not be found.",
    };
  }

  const price = product.variants?.[0]?.calculated_price?.calculated_amount;
  const currencyCode = region?.currency_code?.toUpperCase() || "GBP";

  return {
    title: `${product.title} | LUMIERA`,
    description: product.description || `Shop ${product.title} at LUMIERA - Premium intimate wellness products.`,
    openGraph: {
      title: product.title || "LUMIERA Product",
      description: product.description || "Premium intimate wellness product",
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      type: "website",
    },
    other: {
      "product:price:amount": price ? String(price / 100) : "",
      "product:price:currency": currencyCode,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const region = await getRegion("gb");
  const product = await getCachedProductByHandle(handle, region?.id);

  // Debug log to see API response
  if (product && handle === 'the-duo') {
    console.log(`[Server] Product Data for ${handle}:`);
    console.log(JSON.stringify(product, null, 2));
  }

  if (!product) {
    notFound();
  }

  const images = product.images || [];
  const thumbnail = product.thumbnail;  // 商品级别缩略图作为回退
  const category = product.categories?.[0];
  const price = product.variants?.[0]?.calculated_price?.calculated_amount;
  const originalPrice = product.variants?.[0]?.calculated_price?.original_amount;
  const currencyCode = region?.currency_code?.toUpperCase() || "GBP";

  // Determine if product is on sale
  const isOnSale = !!(originalPrice && price && originalPrice > price);
  const discountPercentage = isOnSale
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Check for product tags/badges
  const tags = product.tags || [];
  const isBestSeller = tags.some(t => t.value?.toLowerCase().includes("best") || t.value?.toLowerCase().includes("popular"));
  const isNew = tags.some(t => t.value?.toLowerCase().includes("new"));

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
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

        {/* Product Content - Client Component */}
        <ProductClient
          product={product}
          images={images}
          thumbnail={thumbnail}
          category={category}
          regionId={region?.id}
          currencyCode={currencyCode}
          price={price ?? undefined}
          originalPrice={originalPrice ?? undefined}
          isBestSeller={isBestSeller}
          isNew={isNew}
          isOnSale={isOnSale}
          discountPercentage={discountPercentage}
        />
      </div>
    </div>
  );
}
