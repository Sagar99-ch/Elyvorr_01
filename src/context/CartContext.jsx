import { createContext, useContext, useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const CartContext = createContext(null);

// =====================================================
// CREATE / GET UNIQUE BROWSER SESSION
// =====================================================

function getSessionId() {
  const storageKey = "elyvorr_session_id";

  try {
    let sessionId = localStorage.getItem(storageKey);

    // Validate existing ID
    if (sessionId && typeof sessionId === "string" && sessionId.length >= 20) {
      return sessionId;
    }

    // Create a completely new browser session
    const newSessionId = crypto.randomUUID();

    localStorage.setItem(storageKey, newSessionId);

    return newSessionId;
  } catch (error) {
    // Fallback if localStorage is unavailable
    console.warn(
      "ELYVORR: localStorage unavailable. Using temporary session.",
      error
    );

    return crypto.randomUUID();
  }
}

// =====================================================
// CART PROVIDER
// =====================================================

export function CartProvider({ children }) {
  // =====================================================
  // SESSION
  // =====================================================

  const [sessionId] = useState(() => getSessionId());

  // IMPORTANT DEBUG
  console.log("ELYVORR CART SESSION:", sessionId);

  // =====================================================
  // CART
  // =====================================================

  const cartItems = useQuery(api.cart.getCart, {
    sessionId,
  });

  // =====================================================
  // PRODUCTS
  // =====================================================

  const products = useQuery(api.products.getAll, {
    includeInactive: true,
  });

  // =====================================================
  // MUTATIONS
  // =====================================================

  const addItemMutation = useMutation(api.cart.addItem);
  const increaseMutation = useMutation(api.cart.increaseQuantity);
  const decreaseMutation = useMutation(api.cart.decreaseQuantity);
  const removeMutation = useMutation(api.cart.removeItem);
  const clearMutation = useMutation(api.cart.clearCart);

  // =====================================================
  // ADD TO BAG
  // =====================================================

  const addToBag = async (product) => {
    if (!product?.id) {
      console.error("ELYVORR: Product ID is missing");
      return;
    }

    try {
      console.log("ELYVORR: Adding product to session:", {
        sessionId,
        productId: product.id,
      });

      await addItemMutation({
        sessionId,
        productId: product.id,
      });
    } catch (error) {
      console.error("ELYVORR: Failed to add product to bag:", error);

      throw error;
    }
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

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

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

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

  // =====================================================
  // REMOVE FROM BAG
  // =====================================================

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

  // =====================================================
  // CLEAR BAG
  // =====================================================

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

  // =====================================================
  // ENRICH CART ITEMS
  // =====================================================

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

        name: item.name ?? product?.name,

        volume: item.volume ?? product?.volume,

        image: item.image ?? product?.image,

        reviews: item.reviews ?? product?.reviews,

        oldPrice: item.oldPrice ?? product?.oldPrice,
      };
    });
  }, [cartItems, products]);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = useMemo(() => {
    return enrichedCartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }, [enrichedCartItems]);

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = useMemo(() => {
    return enrichedCartItems.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [enrichedCartItems]);

  // =====================================================
  // DISCOUNT
  // =====================================================

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

  // =====================================================
  // LOADING
  // =====================================================

  const isLoading = cartItems === undefined || products === undefined;

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

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

    discount,

    // Useful for debugging / checkout
    sessionId,
  };

  // =====================================================
  // PROVIDER
  // =====================================================

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
