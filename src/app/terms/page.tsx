import { COMPANY_INFO } from "@/lib/constants";

export const metadata = {
  title: "Terms & Conditions | LUMIERA",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-charcoal mb-8">
          Terms & Conditions
        </h1>

        <div className="prose prose-lg text-charcoal-light">
          <p className="text-sm text-gray-400">Last updated: January 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to LUMIERA. By accessing our website and purchasing our
            products, you agree to be bound by these terms and conditions.
          </p>

          <h2>2. Age Restriction</h2>
          <p>
            Our products are intended for adults aged 18 and over. By using our
            website, you confirm that you are at least 18 years old.
          </p>

          <h2>3. Products</h2>
          <p>
            All product descriptions, images, and specifications are provided
            for informational purposes. While we strive for accuracy, slight
            variations may occur.
          </p>

          <h2>4. Pricing</h2>
          <p>
            All prices are displayed in GBP and include VAT where applicable. We
            reserve the right to change prices at any time without notice.
          </p>

          <h2>5. Payment</h2>
          <p>
            We accept major credit/debit cards and PayPal. All transactions are
            processed securely. The charge will appear as
            &ldquo;SP-UK-STORE&rdquo; on your statement.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website, including images, text, and designs,
            are the property of LUMIERA and may not be used without permission.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            LUMIERA shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of our products or
            services.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms shall be governed by the laws of England and Wales. Any
            disputes shall be subject to the exclusive jurisdiction of the
            courts of England.
          </p>

          <p className="text-sm text-gray-400 mt-8">
            {COMPANY_INFO.name} | Reg: {COMPANY_INFO.regNo}
          </p>
        </div>
      </div>
    </div>
  );
}
