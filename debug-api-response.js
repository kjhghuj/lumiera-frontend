
// Native fetch (Node 18+)

async function fetchProduct() {
    const baseUrl = 'http://localhost:9000';
    const storeId = 'pk_4c567b5cd395c4947001c58e74da8d70918c9076d6f1b9474a95e947ed2cf91f';
    const handle = 'the-duo';

    // Exact fields from storefront/src/lib/medusa.ts
    const fields = "*variants.calculated_price,*variants.options,*variants.images,*images,*categories,*tags";

    const url = `${baseUrl}/store/products?handle=${handle}&fields=${fields}&publishable_api_key=${storeId}`;

    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            const product = data.products[0];
            console.log("Product Title:", product.title);
            console.log("Total Product Images:", product.images.length);

            product.variants.forEach(v => {
                console.log(`\nVariant: ${v.title} (SKU: ${v.sku})`);
                if (v.images) {
                    console.log(`  Has ${v.images.length} specific images:`);
                    v.images.forEach(img => {
                        console.log(`  - ${img.url}`);
                    });
                } else {
                    console.log("  No specific images (images property is undefined/null)");
                }
            });
        } else {
            console.log("Product not found");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

fetchProduct();
