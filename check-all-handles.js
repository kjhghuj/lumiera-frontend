
async function checkAll() {
    const baseUrl = 'http://localhost:9000';
    const storeId = 'pk_4c567b5cd395c4947001c58e74da8d70918c9076d6f1b9474a95e947ed2cf91f';
    const url = `${baseUrl}/store/products?publishable_api_key=${storeId}&limit=100`;

    console.log(`Checking: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Total Products: ${data.products.length}`);
        data.products.forEach(p => console.log(`- ${p.title} (${p.handle})`));
    } catch (e) {
        console.log(e);
    }
}
checkAll();
