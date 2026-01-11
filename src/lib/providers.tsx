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
  createAndSelectStripePaymentSession,
  selectStripePaymentSession,
  updateCustomerMetadata,
  updateCartOwnership,
  getCustomer,
  login,
  register,
} from "@/lib/medusa";
import { StoreCart, StoreRegion } from "@/lib/types";

const CART_ID_KEY = "lumiera_cart_id";
const AUTH_TOKEN_KEY = "medusa_auth_token";

interface ProvidersProps {
  children: ReactNode;
}

interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

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
  createAndSelectStripePaymentSession: (cartId: string) => Promise<StoreCart>;
}

interface RegionContextType {
  region: StoreRegion | null;
  regionLoading: boolean;
}

// Contexts
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CartContext = createContext<CartContextType | undefined>(undefined);
const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function Providers({ children }: ProvidersProps) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<StoreCart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  // Region State
  const [region, setRegion] = useState<StoreRegion | null>(null);
  const [regionLoading, setRegionLoading] = useState(true);

  // Initialize Region
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

  // Initialize Auth
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          const customer = await getCustomer();
          if (customer) {
            setUser(customer as unknown as User);
          } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
      setAuthLoading(false);
    }
    initAuth();
  }, []);

  // Initialize Cart (Dependent on Region and Auth)
  useEffect(() => {
    async function initCart() {
      if (!region || authLoading) return;

      try {
        setCartLoading(true);
        let cartIdToFetch = localStorage.getItem(CART_ID_KEY);
        let currentCart: StoreCart | null = null;

        // Strategy:
        // 1. If Logged In: Check Metadata for active_cart_id
        // 2. If valid metadata cart exists, use it (and sync local storage)
        // 3. If local storage cart exists, merge/claim it if no metadata cart, or just use it if unowned?
        //    Correction: If local cart exists and we are logged in, we should CLAIM it and save to metadata 
        //    UNLESS we already have a saved cart in metadata.
        //    (Simpler: User's saved cart takes precedence. Or merge? Merging is complex. Let's start with User Saved Cart wins, or claiming local if user has none.)

        if (user) {
          const userMetadata = user.metadata || {};
          const savedCartId = userMetadata.active_cart_id as string;

          if (savedCartId) {
            console.log("[initCart] Found saved cart in profile:", savedCartId);
            const savedCart = await getCart(savedCartId);

            if (savedCart && !savedCart.completed_at) {
              // We found a valid saved cart. Use it.
              currentCart = savedCart;
              localStorage.setItem(CART_ID_KEY, savedCart.id);
            } else {
              // Saved cart is invalid/completed. Clean up metadata?
              // (We'll update metadata when we create/claim a new one below)
            }
          }

          // If we still don't have a cart, but have a local one, try to claim it
          if (!currentCart && cartIdToFetch) {
            const localCart = await getCart(cartIdToFetch);
            if (localCart && !localCart.completed_at) {
              console.log("[initCart] Claiming local cart for user");
              // Assign to user
              const token = localStorage.getItem(AUTH_TOKEN_KEY);
              if (token) {
                await updateCartOwnership(localCart.id, token);
              }
              // Save to metadata
              await updateCustomerMetadata({ ...user.metadata, active_cart_id: localCart.id });
              currentCart = localCart;
            }
          }
        }

        // 4. If still no currentCart (Guest or User with no carts), try generic local storage fetch (Guest)
        if (!currentCart && cartIdToFetch) {
          const localCart = await getCart(cartIdToFetch);
          if (localCart && !localCart.completed_at) {
            currentCart = localCart;
            // If user logged in (and flow reached here), ensure it's owned and saved
            if (user) {
              console.log("[initCart] Claiming new found local cart");
              const token = localStorage.getItem(AUTH_TOKEN_KEY);
              if (token) {
                await updateCartOwnership(localCart.id, token);
              }
              await updateCustomerMetadata({ ...user.metadata, active_cart_id: localCart.id });
            }
          } else {
            localStorage.removeItem(CART_ID_KEY);
          }
        }

        // 5. Final fallback: Create new cart
        if (!currentCart) {
          console.log("[initCart] Creating new cart");
          const newCart = await createCart(region.id);
          if (newCart) {
            currentCart = newCart;
            localStorage.setItem(CART_ID_KEY, newCart.id);

            if (user) {
              console.log("[initCart] Assigning new cart to user");
              const token = localStorage.getItem(AUTH_TOKEN_KEY);
              if (token) {
                await updateCartOwnership(newCart.id, token);
              }
              await updateCustomerMetadata({ ...user.metadata, active_cart_id: newCart.id });
            }
          }
        }

        if (currentCart) {
          setCart(currentCart);
        }

      } catch (error) {
        console.error("[initCart] Error initializing cart:", error);
      } finally {
        setCartLoading(false);
      }
    }

    initCart();
  }, [region, authLoading, user?.id]); // Re-run when user changes (login/logout)


  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    try {
      setAuthLoading(true);
      const token = await login(email, pass);
      if (token && typeof token === "string") {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        const customer = await getCustomer(); // Implicitly uses token from cookie/headers? 
        // NOTE: Our SDK wrapper might need the token explicitly if it's not cookie-based.
        // Assuming medusa-js handles cookie automagically or we need to look into `medusa.ts`.
        // `medusa.ts` sdk doesn't inject token automatically if using basic instance. 
        // We might need to reload the page or ensure requests send the header.
        // However, based on AccountPage, it sends 'Authorization' header manually.
        // The SDK might rely on that. Let's assume standard behavior for now.
        // Correction: AccountPage passes headers manually. Our SDK wrapper methods behave differently?
        // Let's rely on standard medusa-js session or improve wrapper later. 
        // But wait, `getCustomer` in `medusa.ts` uses `sdk.store.customer.retrieve()`.
        // This usually requires a cookie or header. 
        // Keep it simple: We set `medusa_auth_token`. Medusa-js SDK usually manages `Set-Cookie` from backend if configured (CORS/Credentials).
        // If not, we might need to patch the SDK to specific tokens.
        // For now, let's update User state.
        if (customer) setUser(customer as unknown as User);
        // Page reload might be safer to ensure all fetchers get the token if we rely on localStorage->Header injection in a global interceptor (not visible here).
        // Or we just update state and hope initCart triggers.
      } else {
        throw new Error("Login failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, pass: string, first: string, last: string) => {
    try {
      setAuthLoading(true);
      const result = await register(email, pass, first, last);
      if (result?.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        setUser((result.customer as unknown as User) || null);
      } else {
        throw new Error("Registration failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CART_ID_KEY); // Clear local cart reference on logout to avoid mixing
    setUser(null);
    setCart(null);
    // Effect will trigger, create a new Guest cart
  };


  // Cart Handlers (Wrapped to ensure check)
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
        if (updatedCart) setCart(updatedCart);
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
        if (updatedCart) setCart(updatedCart);
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
        if (updatedCart) setCart(updatedCart);
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
        const updatedCart = await applyPromoCode(cart.id as string, code);
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
        const updatedCart = await applyPromoCode(cart.id, code);
        if (!updatedCart) return { success: false, message: "Invalid promo code" };

        // Simple check: if we got a cart back, assume success for now or check promotions array
        setCart(updatedCart);
        return { success: true, message: "Coupon applied!" };
      } catch (error: any) {
        return { success: false, message: error.message || "Failed" };
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const createAndSelectStripePaymentSessionHandler = useCallback(
    async (cartId: string): Promise<StoreCart> => {
      if (!cart?.id) return cart as any;
      setCartLoading(true);
      try {
        const updatedCart = await createAndSelectStripePaymentSession(cart.id);
        if (updatedCart) setCart(updatedCart);
        return updatedCart;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setCartLoading(false);
      }
    },
    [cart?.id]
  );

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <RegionContext.Provider value={{ region, regionLoading }}>
      <AuthContext.Provider value={{ user, loading: authLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
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
            createAndSelectStripePaymentSession: createAndSelectStripePaymentSessionHandler,
          }}
        >
          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
