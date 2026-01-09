import { COMPANY_INFO } from "@/lib/constants";

export const metadata = {
  title: "Returns & Refunds | LUMIERA",
};

export default function ReturnsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-charcoal mb-8">
          Returns & Refunds
        </h1>

        <div className="prose prose-lg text-charcoal-light">
          <h2>30-Day Returns</h2>
          <p>
            We offer a 30-day return policy on all unopened and unused products
            in their original packaging. Due to the intimate nature of our
            products, we cannot accept returns on items that have been opened or
            used for hygiene reasons.
          </p>

          <h2>How to Return</h2>
          <ol>
            <li>Contact us at hello@lumiera.com with your order number</li>
            <li>We&apos;ll provide you with a returns label</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Drop off at your nearest postal service</li>
          </ol>

          <h2>Refund Processing</h2>
          <p>
            Once we receive your return, we will inspect the item and process
            your refund within 5-7 business days. Refunds will be credited to
            your original payment method.
          </p>

          <h2>Faulty Products</h2>
          <p>
            If you receive a faulty product, please contact us immediately. We
            will arrange a replacement or full refund including return shipping
            costs.
          </p>

          <h2>Warranty</h2>
          <p>
            All LUMIERA devices come with a 1-year warranty against
            manufacturing defects. This does not cover normal wear and tear or
            damage caused by misuse.
          </p>

          <p className="text-sm text-gray-400 mt-8">{COMPANY_INFO.name}</p>
        </div>
      </div>
    </div>
  );
}
