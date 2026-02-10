import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Loader2 } from "lucide-react";
import { getProductsWithVariantImages } from "@/lib/medusa";
import { useRegion } from "@/lib/providers";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

// Helper to get auth token
const getAuthToken = () => localStorage.getItem("medusa_auth_token");

interface OrderItem {
  id: string;
  title: string;
  variant_title?: string;
  variant_id?: string;
  product_id?: string;
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

export function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { region } = useRegion();
  // Map variant_id -> image URL for variant-specific images
  const [variantImageMap, setVariantImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  // Resolve variant images once orders are loaded
  useEffect(() => {
    async function resolveVariantImages() {
      if (!orders.length || !region?.id) return;

      // Collect unique product IDs from all order items
      const productIds = new Set<string>();
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          if (item.variant_id && item.product_id && !variantImageMap[item.variant_id]) {
            productIds.add(item.product_id);
          }
        });
      });

      if (productIds.size === 0) return;

      try {
        const products = await getProductsWithVariantImages(Array.from(productIds), region.id);
        if (!products || products.length === 0) return;

        const newVariantImages: Record<string, string> = {};

        products.forEach((product: any) => {
          const productImage = product.thumbnail || product.images?.[0]?.url;

          if (product.variants) {
            product.variants.forEach((variant: any) => {
              if (!variant.id) return;

              if (variant.thumbnail) {
                newVariantImages[variant.id] = variant.thumbnail;
              } else if (variant.images && variant.images.length > 0) {
                const sorted = [...variant.images].sort((a: any, b: any) => (a.rank ?? 999) - (b.rank ?? 999));
                newVariantImages[variant.id] = sorted[0].url;
              } else if (productImage) {
                newVariantImages[variant.id] = productImage;
              }
            });
          }
        });

        if (Object.keys(newVariantImages).length > 0) {
          setVariantImageMap(prev => ({ ...prev, ...newVariantImages }));
        }
      } catch (error) {
        console.error("Failed to fetch variant images for orders:", error);
      }
    }

    resolveVariantImages();
  }, [orders, region?.id]);

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingOrders(true);
    try {
      // Request variant_id and product_id fields for variant image resolution
      const response = await fetch(`${BACKEND_URL}/store/orders?fields=+items.variant_id,+items.product_id`, {
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

  // Get the best image for an order item
  const getItemImage = (item: OrderItem): string | undefined => {
    // Priority 1: Variant-specific image (resolved from product API)
    if (item.variant_id && variantImageMap[item.variant_id]) {
      return variantImageMap[item.variant_id];
    }
    // Priority 2: Item thumbnail (product-level)
    return item.thumbnail;
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

  return (
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
                  {order.items.map((item) => {
                    const imageSrc = getItemImage(item);
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                          {imageSrc && (
                            <img src={imageSrc} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal truncate">{item.title}</p>
                          <p className="text-xs text-charcoal-light">{item.variant_title} × {item.quantity}</p>
                        </div>
                        <p className="text-sm text-charcoal">{formatPrice(item.unit_price)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
