import { createContext, useContext, useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const CartContext = createContext(null);

/*
==================================================
CREATE / GET SESSION ID
==================================================
*/

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
  /*
  ==================================================
  SESSION
  ==================================================
  */

  const [sessionId] = useState(() => getSessionId());

  /*
  ==================================================
  CONVEX QUERY
  ==================================================
  */

  const cartItems = useQuery(api.cart.getCart, {
    sessionId,
  });

  /*
  ==================================================
  CONVEX MUTATIONS
  ==================================================
  */

  const addItemMutation = useMutation(api.cart.addItem);

  const increaseMutation = useMutation(api.cart.increaseQuantity);

  const decreaseMutation = useMutation(api.cart.decreaseQuantity);

  const removeMutation = useMutation(api.cart.removeItem);

  const clearMutation = useMutation(api.cart.clearCart);

  /*
  ==================================================
  ADD TO BAG
  ==================================================
  */

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

  /*
  ==================================================
  INCREASE QUANTITY
  ==================================================
  */

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

  /*
  ==================================================
  DECREASE QUANTITY
  ==================================================
  */

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

  /*
  ==================================================
  REMOVE FROM BAG
  ==================================================
  */

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

  /*
  ==================================================
  CLEAR BAG
  ==================================================
  */

  const clearBag = async () => {
    try {
      await clearMutation({
        sessionId,
      });
    } catch (error) {
      console.error("Failed to clear bag:", error);
    }
  };

  /*
  ==================================================
  TOTAL ITEMS
  ==================================================
  */

  const totalItems = useMemo(() => {
    if (!cartItems) {
      return 0;
    }

    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  /*
  ==================================================
  SUBTOTAL
  ==================================================
  */

  const subtotal = useMemo(() => {
    if (!cartItems) {
      return 0;
    }

    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /*
  ==================================================
  CONTEXT VALUE
  ==================================================
  */

  const value = {
    cartItems: cartItems ?? [],

    isLoading: cartItems === undefined,

    addToBag,

    increaseQuantity,

    decreaseQuantity,

    removeFromBag,

    clearBag,

    totalItems,

    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/*
==================================================
USE CART
==================================================
*/

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
