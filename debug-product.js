
async function checkProducts() {
    try {
        const apiKey = 'pk_4c567b5cd395c4947001c58e74da8d70918c9076d6f1b9474a95e947ed2cf91f';
        // We explicitly request variant images
        const url = 'http://localhost:9000/store/products?fields=*variants.images,*images';

        console.log('Fetching:', url);
        const response = await fetch(url, {
            headers: {
                'x-publishable-api-key': apiKey
            }
        });

        if (!response.ok) {
            console.log('Response not ok:', response.status);
            return;
        }

        const data = await response.json();

        const fs = require('fs');

        // console.log(`Total Products Found: ${data.products.length}`);
        const results = data.products.map(p => ({
            title: p.title,
            handle: p.handle,
            variants: p.variants.map(v => ({
                title: v.title,
                imageCount: v.images?.length || 0,
                firstImageUrl: v.images?.[0]?.url || 'N/A'
            }))
        }));

        fs.writeFileSync('debug_results.json', JSON.stringify(results, null, 2));
        console.log('Results written to debug_results.json');

    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
