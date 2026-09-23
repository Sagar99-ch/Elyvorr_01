import { createContext, useContext, useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";

const CartContext = createContext(null);

// =====================================================
// UNIQUE CART SESSION
// =====================================================
//
// IMPORTANT:
//
// We intentionally use a versioned session key.
//
// Old keys such as:
// - elyvorr_session_id
//
// are NOT used.
//
// This prevents an old/corrupted/shared browser session
// from being reused.
//
// =====================================================

const CART_SESSION_KEY = "elyvorr_cart_session_v2";

// =====================================================
// CREATE NEW SESSION
// =====================================================

function createNewSessionId() {
  const newSessionId = crypto.randomUUID();

  try {
    localStorage.setItem(CART_SESSION_KEY, newSessionId);
  } catch (error) {
    console.warn("ELYVORR: Unable to save cart session.", error);
  }

  return newSessionId;
}

// =====================================================
// GET SESSION ID
// =====================================================

function getSessionId() {
  try {
    const existingSession = localStorage.getItem(CART_SESSION_KEY);

    if (
      existingSession &&
      typeof existingSession === "string" &&
      existingSession.length >= 20
    ) {
      return existingSession;
    }

    return createNewSessionId();
  } catch (error) {
    console.warn(
      "ELYVORR: localStorage unavailable. Creating temporary session.",
      error
    );

    return crypto.randomUUID();
  }
}

// =====================================================
// CART PROVIDER
// =====================================================

export function CartProvider({ children }) {
  // ===================================================
  // SESSION
  // ===================================================

  const [sessionId] = useState(() => getSessionId());

  // ===================================================
  // CART QUERY
  // ===================================================

  const cartItems = useQuery(api.cart.getCart, {
    sessionId,
  });

  // ===================================================
  // PRODUCTS
  // ===================================================

  const products = useQuery(api.products.getAll, {
    includeInactive: true,
  });

  // ===================================================
  // MUTATIONS
  // ===================================================

  const addItemMutation = useMutation(api.cart.addItem);

  const increaseMutation = useMutation(api.cart.increaseQuantity);

  const decreaseMutation = useMutation(api.cart.decreaseQuantity);

  const removeMutation = useMutation(api.cart.removeItem);

  const clearMutation = useMutation(api.cart.clearCart);

  // ===================================================
  // ADD TO BAG
  // ===================================================

  const addToBag = async (product) => {
    const productId = product?.id || product?._id;

    if (!productId) {
      console.error("ELYVORR: Product ID is missing.");

      return;
    }

    try {
      await addItemMutation({
        sessionId,
        productId,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to add product:", error);

      throw error;
    }
  };

  // ===================================================
  // INCREASE
  // ===================================================

  const increaseQuantity = async (productId) => {
    try {
      await increaseMutation({
        sessionId,
        productId,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to increase quantity:", error);

      throw error;
    }
  };

  // ===================================================
  // DECREASE
  // ===================================================

  const decreaseQuantity = async (productId) => {
    try {
      await decreaseMutation({
        sessionId,
        productId,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to decrease quantity:", error);

      throw error;
    }
  };

  // ===================================================
  // REMOVE
  // ===================================================

  const removeFromBag = async (productId) => {
    try {
      await removeMutation({
        sessionId,
        productId,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to remove product:", error);

      throw error;
    }
  };

  // ===================================================
  // CLEAR BAG
  // ===================================================

  const clearBag = async () => {
    try {
      await clearMutation({
        sessionId,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to clear bag:", error);

      throw error;
    }
  };

  // ===================================================
  // ENRICH CART ITEMS
  // ===================================================

  const enrichedCartItems = useMemo(() => {
    if (!cartItems || !products) {
      return [];
    }

    return cartItems.map((item) => {
      const product = products.find(
        (product) => product._id === item.productId || product._id === item.id
      );

      return {
        ...item,

        name: item.name ?? product?.name ?? "",

        volume: item.volume ?? product?.volume ?? "",

        image: item.image ?? product?.image ?? "",

        reviews: item.reviews ?? product?.reviews ?? 0,

        oldPrice: item.oldPrice ?? product?.oldPrice ?? 0,

        price: item.price ?? product?.price ?? 0,

        discount:
          item.discount !== undefined
            ? item.discount
            : (product?.discount ?? 0),
      };
    });
  }, [cartItems, products]);

  // ===================================================
  // TOTAL ITEMS
  // ===================================================

  const totalItems = useMemo(() => {
    return enrichedCartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }, [enrichedCartItems]);

  // ===================================================
  // SUBTOTAL
  // ===================================================
  //
  // IMPORTANT:
  //
  // Backend uses product.price as the actual selling
  // price.
  //
  // Therefore subtotal must also use product.price.
  //
  // ===================================================

  const subtotal = useMemo(() => {
    return enrichedCartItems.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [enrichedCartItems]);

  // ===================================================
  // DISPLAY SAVING
  // ===================================================
  //
  // IMPORTANT:
  //
  // oldPrice = MRP/reference price
  // price    = actual selling price
  //
  // Example:
  //
  // oldPrice = ₹399
  // price    = ₹299
  //
  // Saving = ₹100
  //
  // This is DISPLAY SAVING only.
  //
  // It must NOT be subtracted from subtotal again,
  // because product.price is already the selling price.
  //
  // ===================================================

  const discount = useMemo(() => {
    return enrichedCartItems.reduce((total, item) => {
      const oldPrice = Number(item.oldPrice || 0);

      const currentPrice = Number(item.price || 0);

      const quantity = Number(item.quantity || 0);

      const savingPerItem =
        oldPrice > currentPrice ? oldPrice - currentPrice : 0;

      return total + savingPerItem * quantity;
    }, 0);
  }, [enrichedCartItems]);

  // ===================================================
  // LOADING
  // ===================================================

  const isLoading = cartItems === undefined || products === undefined;

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = {
    cartItems: enrichedCartItems,

    isLoading,

    addToBag,

    increaseQuantity,

    decreaseQuantity,

    removeFromBag,

    clearBag,

    totalItems,

    subtotal,

    // Display saving only.
    // DO NOT subtract this from subtotal.
    discount,

    // IMPORTANT:
    // PaymentPage must use this exact session ID.
    sessionId,
  };

  // ===================================================
  // PROVIDER
  // ===================================================

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// =====================================================
// HOOK
// =====================================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
