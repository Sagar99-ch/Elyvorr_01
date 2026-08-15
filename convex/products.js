import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/*
==================================================
GET ALL ACTIVE PRODUCTS
==================================================
*/
export const getAll = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    if (args.includeInactive) {
      return products;
    }

    return products.filter((product) => product.isActive);
  },
});

/*
==================================================
GET SINGLE PRODUCT
==================================================
*/

export const getById = query({
  args: {
    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/*
==================================================
ADD PRODUCT
==================================================
*/

export const add = mutation({
  args: {
    name: v.string(),
    volume: v.string(),

    price: v.number(),
    oldPrice: v.optional(v.number()),

    reviews: v.number(),

    badge: v.optional(v.string()),

    image: v.string(),

    stock: v.number(),
  },

  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      name: args.name,
      volume: args.volume,

      price: args.price,
      oldPrice: args.oldPrice,

      reviews: args.reviews,

      badge: args.badge,

      image: args.image,

      stock: args.stock,

      isActive: true,

      createdAt: Date.now(),
    });

    return productId;
  },
});

/*
==================================================
UPDATE PRODUCT
==================================================
*/

export const update = mutation({
  args: {
    id: v.id("products"),

    name: v.optional(v.string()),
    volume: v.optional(v.string()),

    price: v.optional(v.number()),
    oldPrice: v.optional(v.number()),

    reviews: v.optional(v.number()),

    badge: v.optional(v.string()),

    image: v.optional(v.string()),

    stock: v.optional(v.number()),

    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existingProduct = await ctx.db.get(id);

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);

    return await ctx.db.get(id);
  },
});

/*
==================================================
DELETE PRODUCT
==================================================
*/

export const remove = mutation({
  args: {
    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  },
});

/*
==================================================
UPDATE STOCK
==================================================
*/

export const updateStock = mutation({
  args: {
    id: v.id("products"),
    stock: v.number(),
  },

  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (args.stock < 0) {
      throw new Error("Stock cannot be negative");
    }

    await ctx.db.patch(args.id, {
      stock: args.stock,
    });

    return await ctx.db.get(args.id);
  },
});
