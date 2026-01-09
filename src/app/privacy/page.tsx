import { COMPANY_INFO } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy | LUMIERA",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-charcoal mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg text-charcoal-light">
          <p className="text-sm text-gray-400">Last updated: January 2026</p>

          <h2>Your Privacy Matters</h2>
          <p>
            At LUMIERA, we understand the sensitive nature of our products and
            are committed to protecting your privacy. This policy explains how
            we collect, use, and safeguard your information.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Name and contact details for order processing</li>
            <li>Payment information (processed securely via third parties)</li>
            <li>Delivery address</li>
            <li>Email for order updates and marketing (with consent)</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Send marketing communications (only with your consent)</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your
            data. All transactions are encrypted using SSL technology.
          </p>

          <h2>Discreet Billing</h2>
          <p>
            For your privacy, all charges will appear as
            &ldquo;SP-UK-STORE&rdquo; on your bank statement. No reference to
            LUMIERA or our products will appear.
          </p>

          <h2>Your Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            For privacy-related queries, contact us at{" "}
            <a href="mailto:privacy@lumiera.com" className="text-terracotta">
              privacy@lumiera.com
            </a>
          </p>

          <p className="text-sm text-gray-400 mt-8">
            {COMPANY_INFO.name} | {COMPANY_INFO.address}
          </p>
        </div>
      </div>
    </div>
  );
}
