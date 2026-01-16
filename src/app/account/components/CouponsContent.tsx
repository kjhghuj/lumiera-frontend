import { useState } from "react";
import { Ticket, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

// Helper to get auth token
const getAuthToken = () => localStorage.getItem("medusa_auth_token");

export function CouponsContent({ user }: { user: any }) {
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const collectedCoupons: string[] = (user?.metadata?.coupons as string[]) || [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
  };

  const handleRedeem = async () => {
    if (!couponCode.trim()) return;
    setRedeeming(true);
    setRedeemMessage(null);
    const token = getAuthToken();

    // Simulate validation (or strict check if you have an API for it)
    // Ideally we should check if code exists in backend via a "check-coupon" endpoint,
    // but per plan we are just storing it in metadata for now.

    const newCode = couponCode.trim().toUpperCase();

    if (collectedCoupons.includes(newCode)) {
      setRedeemMessage({ text: "You have already collected this coupon.", type: 'error' });
      setRedeeming(false);
      return;
    }

    try {
      const newCoupons = [...collectedCoupons, newCode];

      // Update customer metadata
      const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          metadata: {
            ...user?.metadata,
            coupons: newCoupons
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Again, user state in context won't auto-update.
        // Ideally invoke a refreshUser from context.
        setRedeemMessage({ text: "Coupon redeemed! (Refresh if not visible)", type: 'success' });
        setCouponCode("");
      } else {
        throw new Error("Failed to redeem coupon");
      }
    } catch (error) {
      setRedeemMessage({ text: "Failed to redeem. Please try again.", type: 'error' });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-gray-100">
      <h2 className="font-serif text-2xl text-charcoal mb-6">My Coupons</h2>

      {/* Redeem Section */}
      <div className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="font-medium text-charcoal mb-4">Redeem New Coupon</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-terracotta uppercase font-mono"
          />
          <button
            onClick={handleRedeem}
            disabled={!couponCode.trim() || redeeming}
            className="bg-terracotta text-white px-6 py-3 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
          </button>
        </div>
        {redeemMessage && (
          <p className={`text-sm mt-3 ${redeemMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {redeemMessage.text}
          </p>
        )}
      </div>

      {/* Coupons List */}
      <div>
        <h3 className="font-medium text-charcoal mb-4">Your Wallet</h3>
        {collectedCoupons.length === 0 ? (
          <div className="text-center py-8 text-charcoal-light">
            <Ticket size={32} className="mx-auto mb-2 opacity-50" />
            <p>You haven&apos;t collected any coupons yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collectedCoupons.map((code) => (
              <div key={code} className="relative bg-white border-2 border-dashed border-terracotta/30 p-4 rounded-lg flex items-center justify-between group">
                {/* Left notch */}
                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-r border-terracotta/30"></div>
                {/* Right notch */}
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-l border-terracotta/30"></div>

                <div className="pl-4">
                  <span className="block text-xs text-charcoal-light uppercase tracking-wider mb-1">Coming Soon</span>
                  <span className="font-mono text-xl font-bold text-terracotta">{code}</span>
                </div>

                <div className="pr-4">
                  <button
                    onClick={() => handleCopy(code)}
                    className={`text-xs uppercase tracking-widest transition-colors ${copiedCode === code ? "text-green-600 font-bold" : "text-charcoal-light hover:text-charcoal underline"}`}
                  >
                    {copiedCode === code ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
