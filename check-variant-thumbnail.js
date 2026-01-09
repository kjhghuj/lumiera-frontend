
const baseUrl = "http://localhost:9000";
const storeId = "pk_4c567b5cd395c4947001c58e74da8d70918c9076d6f1b9474a95e947ed2cf91f";

async function checkThumbnails() {
    const fields = "*variants.id,*variants.title,*variants.thumbnail,*variants.images";
    const url = `${baseUrl}/store/products?handle=the-duo&fields=${fields}`;

    console.log(`Fetching ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                'x-publishable-api-key': storeId
            }
        });
        const data = await res.json();

        if (!data.products || data.products.length === 0) {
            console.log("The Duo not found.");
            return;
        }

        const product = data.products[0];
        console.log(`Product: ${product.title} (${product.handle})`);

        product.variants.forEach(v => {
            console.log(`Variant: ${v.title} -> Thumbnail: ${v.thumbnail}`);
        });

    } catch (e) {
        console.error("Error fetching data:", e);
    }
}

checkThumbnails();
