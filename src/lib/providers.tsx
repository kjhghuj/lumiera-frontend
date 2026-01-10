"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  createCart,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getRegion,
  applyPromoCode,
  removePromoCode,
  applyBetterCoupon as applyBetterCouponAPI, // Assuming this is the API function
} from "@/lib/medusa";
import { StoreCart, StoreRegion } from "@/lib/types";

// Define CartContextType directly in this file as per instruction
interface CartContextType {
  cart: StoreCart | null;
  cartLoading: boolean;
  cartCount: number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: (code: string) => Promise<boolean>;
  applyBetterCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
}

interface RegionContextType {
  region: StoreRegion | null;
  regionLoading: boolean;
}

// Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Region Context
const RegionContext = createContext<RegionContextType | undefined>(undefined);

const CART_ID_KEY = "lumiera_cart_id";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [region, setRegion] = useState<StoreRegion | null>(null);
  const [regionLoading, setRegionLoading] = useState(true);

  // Initialize region
  useEffect(() => {
    async function initRegion() {
      try {
        const fetchedRegion = await getRegion("gb");
        setRegion(fetchedRegion);
      } catch (error) {
        console.error("Failed to fetch region:", error);
      } finally {
        setRegionLoading(false);
      }
    }
    initRegion();
  }, []);

  // Initialize cart
  useEffect(() => {
    async function initCart() {
      if (!region) return;

      try {
        const storedCartId = localStorage.getItem(CART_ID_KEY);
        console.log("[initCart] Stored cart ID:", storedCartId);

        if (storedCartId) {
          const existingCart = await getCart(storedCartId);
          console.log("[initCart] Existing cart result:", existingCart?.id, "completed_at:", existingCart?.completed_at);

          // Use falsy check (!completed_at) instead of === null because it may be undefined
          if (existingCart && !existingCart.completed_at) {
            console.log("[initCart] Using existing cart with", existingCart.items?.length || 0, "items");
            setCart(existingCart);
            setCartLoading(false);
            return;
          }

          // Cart doesn't exist or is completed, clear the stored ID
          console.log("[initCart] Clearing invalid cart ID");
          localStorage.removeItem(CART_ID_KEY);
        }

        // Create new cart
        console.log("[initCart] Creating new cart for region:", region.id);
        const newCart = await createCart(region.id);
        if (newCart) {
          console.log("[initCart] New cart created:", newCart.id);
          localStorage.setItem(CART_ID_KEY, newCart.id);
          setCart(newCart);
        }
      } catch (error) {
        console.error("[initCart] Failed to initialize cart:", error);
      } finally {
        setCartLoading(false);
      }
    }

    if (region && !regionLoading) {
      initCart();
    }
  }, [region, regionLoading]);

  const refreshCart = useCallback(async () => {
    if (!cart?.id) return;
    const updatedCart = await getCart(cart.id);
    if (updatedCart) {
      setCart(updatedCart);
    }
  }, [cart?.id]);

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      if (!cart?.id) return;
      setCartLoading(true);
      try {
        const updatedCart = await addToCart(cart.id, variantId, quantity);
        if (updatedCart) {
          setCart(updatedCart);
        }
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart?.id) return;
      setCartLoading(true);
      try {
        const updatedCart = await updateCartItem(cart.id, lineItemId, quantity);
        if (updatedCart) {
          setCart(updatedCart);
        }
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart?.id) return;
      setCartLoading(true);
      try {
        const updatedCart = await removeFromCart(cart.id, lineItemId);
        if (updatedCart) {
          setCart(updatedCart);
        }
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const applyPromoCodeHandler = useCallback(
    async (code: string): Promise<boolean> => {
      if (!cart?.id) return false;
      setCartLoading(true);
      try {
        const updatedCart = await applyPromoCode(cart.id, code);
        if (updatedCart) {
          setCart(updatedCart);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to apply promo code:", error);
        throw error;
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const removePromoCodeHandler = useCallback(
    async (code: string): Promise<boolean> => {
      if (!cart?.id) return false;
      setCartLoading(true);
      try {
        const updatedCart = await removePromoCode(cart.id, code);
        if (updatedCart) {
          setCart(updatedCart);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to remove promo code:", error);
        throw error;
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const applyBetterCouponHandler = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      if (!cart?.id) return { success: false, message: "Cart not found" };

      setCartLoading(true);
      try {
        // 1. Get current total
        const currentTotal = cart.total || 0;

        // 2. Apply new coupon (check if better)
        console.log("[SmartCoupon] Testing code:", code, "Current Total:", currentTotal);

        const updatedCart = await applyPromoCode(cart.id, code);

        if (!updatedCart) {
          return { success: false, message: "Invalid promo code" };
        }

        const newTotal = updatedCart.total || 0;
        console.log("[SmartCoupon] New Total:", newTotal);

        // 3. Compare totals (Lower is better)
        // If new total is LOWER than current total, it's a better deal.
        // OR if new total is same but we didn't have a discount before? 
        // Actually, if total is same, we assume no benefit. Revert to keep previous state/code.
        // UNLESS the previous state had NO code?
        // Let's stick to strict improvement: New Total < Current Total

        if (newTotal < currentTotal) {
          // Keep the new state
          setCart(updatedCart);
          return { success: true, message: "Coupon applied successfully!" };
        } else {
          // Revert: remove the newly applied code
          console.log("[SmartCoupon] New code not better. Reverting.");
          await removePromoCode(cart.id, code);
          // Fetch cart again to ensure clean state
          const revertedCart = await getCart(cart.id);
          if (revertedCart) setCart(revertedCart);

          if (newTotal === currentTotal) {
            return { success: false, message: "This coupon does not provide any additional discount." };
          }
          return { success: false, message: "Current coupon offers a better deal." };
        }

      } catch (error: any) {
        console.error("Failed to apply smart coupon:", error);
        return { success: false, message: error.message || "Failed to check coupon" };
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id, cart?.total]
  );

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <RegionContext.Provider value={{ region, regionLoading }}>
      <CartContext.Provider
        value={{
          cart,
          cartLoading,
          cartCount,
          addItem,
          updateItem,
          removeItem,
          refreshCart,
          applyPromoCode: applyPromoCodeHandler,
          removePromoCode: removePromoCodeHandler,
          applyBetterCoupon: applyBetterCouponHandler,
        }}
      >
        {children}
      </CartContext.Provider>
    </RegionContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
