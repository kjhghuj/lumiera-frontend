import { CardElement } from "@stripe/react-stripe-js";

interface ContactFormProps {
  billingData: any;
  setBillingData: (data: any) => void;
  cardData: any;
  setCardData: (data: any) => void;
}

export function ContactForm({ billingData, setBillingData, cardData, setCardData }: ContactFormProps) {
  return (
    <>
      <div className="mb-8">
        <h2 className="font-serif text-xl text-charcoal mb-4">Contact Information</h2>
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Name</label>
              <input
                type="text"
                value={billingData.name}
                onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Phone Number</label>
              <input
                type="tel"
                value={billingData.phone}
                onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Email</label>
            <input
              type="email"
              value={billingData.email}
              onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
              required
            />
          </div>
        </div>

        <h2 className="font-serif text-xl text-charcoal mb-4">Shipping Address</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Address</label>
            <textarea
              value={billingData.address}
              onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta min-h-[80px] rounded-lg"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">City</label>
              <input
                type="text"
                value={billingData.city}
                onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Postal Code</label>
              <input
                type="text"
                value={billingData.postalCode}
                onChange={(e) => setBillingData({ ...billingData, postalCode: e.target.value })}
                className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Country</label>
            <select
              value={billingData.country}
              onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
              required
            >
              <option value="">Select Country</option>
              <option value="gb">United Kingdom</option>
              <option value="us">United States</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
            </select>
          </div>
        </div>

        <h2 className="font-serif text-xl text-charcoal mb-4 mt-8">Payment Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Card Information</label>
            <div className="w-full border border-gray-200 px-4 py-3 focus-within:border-terracotta rounded-lg bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#2c2c2c',
                      '::placeholder': { color: '#9ca3af' },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-terracotta rounded-lg"
              placeholder="John Doe"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
}
