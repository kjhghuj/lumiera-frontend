const baseUrl = "http://localhost:9000";
const storeId = "pk_4c567b5cd395c4947001c58e74da8d70918c9076d6f1b9474a95e947ed2cf91f";

async function run() {
    const url = `${baseUrl}/store/products?limit=5`;
    console.log(`Getting ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                'x-publishable-api-key': storeId
            }
        });
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Count:", data.count);
        console.log("Products:", data.products ? data.products.length : "N/A");
        if (data.products) {
            data.products.forEach(p => console.log(p.handle));
        }
    } catch (e) {
        console.log("Error:", e);
    }
}
run();
