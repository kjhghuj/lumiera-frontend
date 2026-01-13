"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User as UserIcon, Package, MapPin, LogOut, Plus, Trash2, Edit, ChevronRight, Loader2, Ticket } from "lucide-react";
import { useAuth } from "@/lib/providers";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

type Tab = "profile" | "orders" | "addresses" | "coupons";

// Re-using interfaces for local component specific props/state if needed
// But leveraging global user for main identity

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
  is_default_shipping?: boolean;
}

interface OrderItem {
  id: string;
  title: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  thumbnail?: string;
}

interface Order {
  id: string;
  display_id: number;
  created_at: string;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  total: number;
  currency_code: string;
  items: OrderItem[];
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  // Global Auth
  const { user, loading: authLoading, login, logout } = useAuth();

  // Local UI state
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Helper to get auth token for direct fetches
  const getAuthToken = () => localStorage.getItem("medusa_auth_token");

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  // Data fetching effects
  useEffect(() => {
    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && activeTab === "addresses") {
      fetchAddresses();
    }
  }, [user, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await login(email, password);
    } catch (error: any) {
      setLoginError(error.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/account"); // Refresh or stay
  };

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingOrders(true);
    try {
      const response = await fetch(`${BACKEND_URL}/store/orders`, {
        headers: {
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const response = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
        headers: {
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");
    const token = getAuthToken();

    try {
      const response = await fetch(`${BACKEND_URL}/store/customers/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Since user comes from AuthContext, we ideally should function to update it there.
        // For now, we'll force a reload to get fresh data or just let it be.
        setProfileMessage("Profile updated successfully! (Refresh to see changes globally)");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      setProfileMessage("Failed to save changes. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (formData: FormData) => {
    const addressData = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      address_1: formData.get("address1") as string,
      address_2: formData.get("address2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postalCode") as string,
      country_code: (formData.get("country") as string).toLowerCase().slice(0, 2),
      phone: formData.get("phone") as string,
      is_default_shipping: formData.get("isDefault") === "on",
    };

    const token = getAuthToken();

    try {
      const url = editingAddress
        ? `${BACKEND_URL}/store/customers/me/addresses/${editingAddress.id}`
        : `${BACKEND_URL}/store/customers/me/addresses`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        setShowAddressModal(false);
        setEditingAddress(null);
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const token = getAuthToken();

    try {
      await fetch(`${BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          "x-publishable-api-key": API_KEY,
          "Authorization": `Bearer ${token}`,
        },
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "completed": case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount: number, currency: string = "gbp") => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-6">
          <h1 className="font-serif text-4xl text-charcoal mb-8 text-center">
            My Account
          </h1>

          {justRegistered && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 text-sm text-center">
              ✓ Account created successfully! Please sign in.
            </div>
          )}

          <div className="bg-white p-8 border border-gray-100">
            <h2 className="font-serif text-xl text-charcoal mb-6">Sign In</h2>

            {loginError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-terracotta text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="#" className="text-sm text-charcoal-light hover:text-terracotta">
                Forgot password?
              </Link>
            </div>

            <hr className="my-8 border-gray-100" />

            <div className="text-center">
              <p className="text-sm text-charcoal-light mb-4">
                Don&apos;t have an account?
              </p>
              <Link
                href="/register"
                className="text-sm uppercase tracking-widest text-terracotta font-bold hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Content
  const ProfileContent = () => (
    <div className="bg-white p-8 border border-gray-100">
      <h2 className="font-serif text-2xl text-charcoal mb-6">Profile Details</h2>

      {profileMessage && (
        <div className={`mb-4 p-4 text-sm ${profileMessage.includes("success") ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"} border`}>
          {profileMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal bg-gray-50"
            disabled
          />
          <p className="text-xs text-charcoal-light mt-1">Email cannot be changed</p>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={savingProfile}
        className="mt-6 bg-charcoal text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
        {savingProfile ? "Saving..." : "Save Changes"}
      </button>

      {/* DEV ONLY: Test Email Button */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-charcoal mb-4">[DEV] Test Tools</h3>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${BACKEND_URL}/store/test-email`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": API_KEY
                  },
                  body: JSON.stringify({
                    email: user?.email,
                    first_name: firstName,
                    last_name: lastName
                  })
                });
                const data = await res.json();
                alert(res.ok ? "Email sent!" : "Failed: " + data.message);
              } catch (e) {
                alert("Error sending email: " + e);
              }
            }}
            className="bg-gray-200 text-charcoal px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-300"
          >
            Send Test Welcome Email
          </button>
        </div>
      )}
    </div>
  );

  // Orders Content
  const OrdersContent = () => (
    <div className="bg-white p-8 border border-gray-100">
      <h2 className="font-serif text-2xl text-charcoal mb-6">Order History</h2>

      {loadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-charcoal-light mb-4">No orders yet</p>
          <Link
            href="/shop"
            className="inline-block bg-terracotta text-white px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-100 p-6 hover:border-gray-200 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium text-charcoal">Order #{order.display_id}</p>
                  <p className="text-sm text-charcoal-light">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider ${getStatusColor(order.fulfillment_status || order.status)}`}>
                    {order.fulfillment_status || order.status}
                  </span>
                  <span className="font-medium text-charcoal">{formatPrice(order.total, order.currency_code)}</span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                        {item.thumbnail && (
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{item.title}</p>
                        <p className="text-xs text-charcoal-light">{item.variant_title} × {item.quantity}</p>
                      </div>
                      <p className="text-sm text-charcoal">{formatPrice(item.unit_price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Coupons Content
  const CouponsContent = () => {
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
  };

  // Addresses Content
  const AddressesContent = () => (
    <div className="bg-white p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-charcoal">Saved Addresses</h2>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowAddressModal(true);
          }}
          className="flex items-center gap-2 text-sm text-terracotta hover:underline"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {loadingAddresses ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-charcoal-light mb-4">No saved addresses</p>
          <button
            onClick={() => setShowAddressModal(true)}
            className="inline-block bg-terracotta text-white px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-100 p-6 relative">
              {address.is_default_shipping && (
                <span className="absolute top-4 right-4 text-xs bg-terracotta/10 text-terracotta px-2 py-1 uppercase tracking-wider">
                  Default
                </span>
              )}
              <p className="font-medium text-charcoal">{address.first_name} {address.last_name}</p>
              <p className="text-sm text-charcoal-light mt-2">{address.address_1}</p>
              {address.address_2 && <p className="text-sm text-charcoal-light">{address.address_2}</p>}
              <p className="text-sm text-charcoal-light">{address.city}, {address.postal_code}</p>
              <p className="text-sm text-charcoal-light">{address.country_code?.toUpperCase()}</p>
              {address.phone && <p className="text-sm text-charcoal-light mt-2">{address.phone}</p>}

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => {
                    setEditingAddress(address);
                    setShowAddressModal(true);
                  }}
                  className="text-sm text-charcoal hover:text-terracotta flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl text-charcoal">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAddress(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">First Name</label>
                  <input
                    name="firstName"
                    defaultValue={editingAddress?.first_name}
                    className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={editingAddress?.last_name}
                    className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Address Line 1</label>
                <input
                  name="address1"
                  defaultValue={editingAddress?.address_1}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Address Line 2 (Optional)</label>
                <input
                  name="address2"
                  defaultValue={editingAddress?.address_2}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">City</label>
                  <input
                    name="city"
                    defaultValue={editingAddress?.city}
                    className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Postal Code</label>
                  <input
                    name="postalCode"
                    defaultValue={editingAddress?.postal_code}
                    className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Country</label>
                <select
                  name="country"
                  defaultValue={editingAddress?.country_code || "gb"}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                  required
                >
                  <option value="gb">United Kingdom</option>
                  <option value="us">United States</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="nl">Netherlands</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-charcoal mb-2">Phone (Optional)</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editingAddress?.phone}
                  className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-charcoal"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  defaultChecked={editingAddress?.is_default_shipping}
                  className="w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-sm text-charcoal">Set as default address</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                  }}
                  className="flex-1 border border-gray-200 py-3 uppercase tracking-widest text-xs font-bold text-charcoal hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-terracotta text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-terracotta-dark transition-colors"
                >
                  {editingAddress ? "Update" : "Add"} Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-charcoal">My Account</h1>
          <p className="text-sm text-charcoal-light">
            Welcome, {user?.first_name || user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "profile" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
                  }`}
              >
                <UserIcon size={18} />
                <span className="text-sm">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "orders" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
                  }`}
              >
                <Package size={18} />
                <span className="text-sm">Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "addresses" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
                  }`}
              >
                <MapPin size={18} />
                <span className="text-sm">Addresses</span>
              </button>
              <button
                onClick={() => setActiveTab("coupons")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "coupons" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
                  }`}
              >
                <Ticket size={20} />
                <span className="text-sm">Coupons</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-charcoal hover:bg-red-50 hover:text-red-600 transition-colors"

              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" && <ProfileContent />}
            {activeTab === "orders" && <OrdersContent />}
            {activeTab === "addresses" && <AddressesContent />}
            {activeTab === "coupons" && <CouponsContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
