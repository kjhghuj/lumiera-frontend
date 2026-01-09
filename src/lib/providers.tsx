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
} from "@/lib/medusa";
import { StoreCart, StoreRegion, CartContextType, RegionContextType } from "@/lib/types";

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

        if (storedCartId) {
          const existingCart = await getCart(storedCartId);
          if (existingCart && existingCart.completed_at === null) {
            setCart(existingCart);
            setCartLoading(false);
            return;
          }
        }

        // Create new cart
        const newCart = await createCart(region.id);
        if (newCart) {
          localStorage.setItem(CART_ID_KEY, newCart.id);
          setCart(newCart);
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
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
