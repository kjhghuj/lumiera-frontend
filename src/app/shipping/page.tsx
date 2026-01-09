import { COMPANY_INFO } from "@/lib/constants";

export const metadata = {
  title: "Shipping & Delivery | LUMIERA",
};

export default function ShippingPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-charcoal mb-8">
          Shipping & Delivery
        </h1>

        <div className="prose prose-lg text-charcoal-light">
          <h2>Delivery Times</h2>
          <p>
            We aim to dispatch all orders within 1-2 business days. Once
            dispatched, delivery times are as follows:
          </p>
          <ul>
            <li>
              <strong>UK Standard:</strong> 2-4 business days
            </li>
            <li>
              <strong>UK Express:</strong> 1-2 business days
            </li>
            <li>
              <strong>EU Standard:</strong> 5-7 business days
            </li>
            <li>
              <strong>International:</strong> 7-14 business days
            </li>
          </ul>

          <h2>Discreet Packaging</h2>
          <p>
            All orders are shipped in plain, unmarked packaging with no
            indication of the contents. The sender name will appear as
            &ldquo;SP-UK-STORE&rdquo; on your bank statement and shipping label.
          </p>

          <h2>Free Shipping</h2>
          <p>
            We offer free UK standard shipping on orders over £50. International
            free shipping is available on orders over £100.
          </p>

          <h2>Tracking</h2>
          <p>
            Once your order has been dispatched, you will receive a confirmation
            email with tracking information. You can track your order at any
            time through our website.
          </p>

          <h2>Contact</h2>
          <p>
            For any shipping queries, please contact us at{" "}
            <a href="mailto:hello@lumiera.com" className="text-terracotta">
              hello@lumiera.com
            </a>
          </p>

          <p className="text-sm text-gray-400 mt-8">{COMPANY_INFO.name}</p>
        </div>
      </div>
    </div>
  );
}
