import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/*
==================================================
GET CART
==================================================
*/

export const getCart = query({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const items = [];

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);

      if (!product || !product.isActive) {
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

/*
==================================================
ADD TO CART
==================================================
*/

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("This product is currently unavailable");
    }

    if (product.stock <= 0) {
      throw new Error("This product is out of stock");
    }

    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", args.sessionId).eq("productId", args.productId)
      )
      .unique();

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      if (newQuantity > product.stock) {
        throw new Error("Not enough stock available");
      }

      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        updatedAt: Date.now(),
      });

      return existingItem._id;
    }

    return await ctx.db.insert("cart", {
      sessionId: args.sessionId,
      productId: args.productId,
      quantity: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/*
==================================================
INCREASE QUANTITY
==================================================
*/

export const increaseQuantity = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", args.sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    const newQuantity = cartItem.quantity + 1;

    if (newQuantity > product.stock) {
      throw new Error("Not enough stock available");
    }

    await ctx.db.patch(cartItem._id, {
      quantity: newQuantity,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/*
==================================================
DECREASE QUANTITY
==================================================
*/

export const decreaseQuantity = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", args.sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      return false;
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

/*
==================================================
REMOVE FROM CART
==================================================
*/

export const removeItem = mutation({
  args: {
    sessionId: v.string(),
    productId: v.id("products"),
  },

  handler: async (ctx, args) => {
    const cartItem = await ctx.db
      .query("cart")
      .withIndex("by_session_product", (q) =>
        q.eq("sessionId", args.sessionId).eq("productId", args.productId)
      )
      .unique();

    if (!cartItem) {
      return false;
    }

    await ctx.db.delete(cartItem._id);

    return true;
  },
});

/*
==================================================
CLEAR CART
==================================================
*/

export const clearCart = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return true;
  },
});
