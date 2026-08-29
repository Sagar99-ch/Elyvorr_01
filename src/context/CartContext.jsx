import { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const CartContext = createContext(null);

function getSessionId() {
  const storageKey = "elyvorr_session_id";

  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

export function CartProvider({ children }) {
  // =====================================================
  // SESSION
  // =====================================================

  const [sessionId] = useState(() => getSessionId());

  // =====================================================
  // CART
  // =====================================================

  const cartItems = useQuery(api.cart.getCart, {
    sessionId,
  });

  // =====================================================
  // PRODUCTS
  // Used to get oldPrice for discount calculation
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
      console.error("Product ID is missing");
      return;
    }

    try {
      await addItemMutation({
        sessionId,
        productId: product.id,
      });
    } catch (error) {
      console.error("Failed to add product to bag:", error);
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
      console.error("Failed to increase quantity:", error);
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
      console.error("Failed to decrease quantity:", error);
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
      console.error("Failed to remove product:", error);
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
      console.error("Failed to clear bag:", error);
    }
  };

  // =====================================================
  // ENRICH CART ITEMS
  //
  // Cart API gives us price/quantity.
  // Products API gives us oldPrice.
  //
  // We combine both here.
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

        // Product information
        name: item.name ?? product?.name,
        volume: item.volume ?? product?.volume,
        image: item.image ?? product?.image,
        reviews: item.reviews ?? product?.reviews,

        // IMPORTANT:
        // Get oldPrice from product if cart item doesn't have it
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
  //
  // Example:
  // ₹299 × 2 = ₹598
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
  //
  // Example:
  // oldPrice = ₹399
  // price    = ₹299
  // saving   = ₹100
  //
  // quantity 2
  // discount = ₹200
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
