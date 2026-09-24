import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================================================
// HELPERS
// ==================================================

function validateSessionId(sessionId) {
  if (typeof sessionId !== "string") {
    throw new Error("Invalid session.");
  }

  const normalized = sessionId.trim();

  if (!normalized) {
    throw new Error("Invalid session.");
  }

  // Prevent unnecessarily large session identifiers
  if (normalized.length > 200) {
    throw new Error("Invalid session.");
  }

  return normalized;
}

function validateQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 100;
}

// ==================================================
// GET CART
// ==================================================

export const getCart = query({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    const items = [];

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      // Missing/deleted product ko UI mein show nahi karenge
      if (!product || !product.isActive) {
        continue;
      }

      // Ignore corrupted/invalid cart quantities
      if (!validateQuantity(cartItem.quantity)) {
        continue;
      }

      items.push({
        ...product,
        id: product._id,
        quantity: cartItem.quantity,
        cartId: cartItem._id,
      });
    }

    return items;
  },
});

// ==================================================
// CLEANUP STALE CART ITEMS
// ==================================================

export const cleanupCart = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    let removedCount = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      if (
        !product ||
        !product.isActive ||
        !validateQuantity(cartItem.quantity)
      ) {
        await ctx.db.delete(cartItem._id);
        removedCount++;
      }
    }

    return {
      success: true,
      removedCount,
    };
  },
});

// ==================================================
// ADD TO CART
// ==================================================

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("This product is currently unavailable");
    }

    if (!Number.isInteger(product.stock) || product.stock <= 0) {
      throw new Error("This product is out of stock");
    }

    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", sessionId).eq("productId", args.productId)
      )
      .unique();

    if (existingItem) {
      if (!validateQuantity(existingItem.quantity)) {
        throw new Error("Invalid cart quantity.");
      }

      const newQuantity = existingItem.quantity + 1;

      if (newQuantity > product.stock) {
        throw new Error("Not enough stock available");
      }

      if (newQuantity > 100) {
        throw new Error("Maximum quantity reached");
      }

      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        updatedAt: Date.now(),
      });

      return existingItem._id;
    }

    return await ctx.db.insert("cart", {
      sessionId,
      productId: args.productId,
      quantity: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ==================================================
// INCREASE QUANTITY
// ==================================================

export const increaseQuantity = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("This product is currently unavailable");
    }

    if (!Number.isInteger(product.stock) || product.stock <= 0) {
      throw new Error("This product is out of stock");
    }

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (!validateQuantity(cartItem.quantity)) {
      throw new Error("Invalid cart quantity.");
    }

    const newQuantity = cartItem.quantity + 1;

    if (newQuantity > product.stock) {
      throw new Error("Not enough stock available");
    }

    if (newQuantity > 100) {
      throw new Error("Maximum quantity reached");
    }

    await ctx.db.patch(cartItem._id, {
      quantity: newQuantity,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ==================================================
// DECREASE QUANTITY
// ==================================================

export const decreaseQuantity = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      return false;
    }

    if (!validateQuantity(cartItem.quantity)) {
      await ctx.db.delete(cartItem._id);
      return true;
    }

    if (cartItem.quantity <= 1) {
      await ctx.db.delete(cartItem._id);
      return true;
    }

    await ctx.db.patch(cartItem._id, {
      quantity: cartItem.quantity - 1,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ==================================================
// REMOVE FROM CART
// ==================================================

export const removeItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      return false;
    }

    await ctx.db.delete(cartItem._id);

    return true;
  },
});

// ==================================================
// CLEAR CART
// ==================================================

export const clearCart = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return true;
  },
});

// ==================================================
// BUY NOW
// Clears existing cart and adds only selected product
// ==================================================

export const buyNow = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    // ==================================================
    // CHECK PRODUCT
    // ==================================================

    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("This product is currently unavailable");
    }

    if (!Number.isInteger(product.stock) || product.stock <= 0) {
      throw new Error("This product is out of stock");
    }

    // ==================================================
    // CLEAR EXISTING CART
    // ==================================================

    const existingCartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    for (const item of existingCartItems) {
      await ctx.db.delete(item._id);
    }

    // ==================================================
    // ADD SELECTED PRODUCT
    // ==================================================

    const cartId = await ctx.db.insert("cart", {
      sessionId,
      productId: args.productId,
      quantity: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return cartId;
  },
});
