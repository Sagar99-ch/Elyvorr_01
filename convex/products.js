import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ==================================================
 * GET ALL ACTIVE PRODUCTS
 * ==================================================
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

/**
 * ==================================================
 * GET SINGLE PRODUCT
 * ==================================================
 */
export const getById = query({
  args: {
    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * ==================================================
 * ADD PRODUCT
 * ==================================================
 */
export const add = mutation({
  args: {
    name: v.string(),
    volume: v.string(),
    price: v.number(),
    oldPrice: v.optional(v.number()),

    // =================================================
    // ORDER DISCOUNT
    // Example: 10 = 10%
    // =================================================
    discount: v.optional(v.number()),

    reviews: v.number(),
    badge: v.optional(v.string()),

    // Main product image
    image: v.string(),

    // Additional product images
    images: v.optional(v.array(v.string())),

    stock: v.number(),
  },

  handler: async (ctx, args) => {
    // =================================================
    // VALIDATE DISCOUNT
    // =================================================

    if (
      args.discount !== undefined &&
      (args.discount < 0 || args.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100.");
    }

    // =================================================
    // CREATE PRODUCT
    // =================================================

    const productId = await ctx.db.insert("products", {
      name: args.name,
      volume: args.volume,
      price: args.price,
      oldPrice: args.oldPrice,

      // IMPORTANT
      discount: args.discount,

      reviews: args.reviews,
      badge: args.badge,

      image: args.image,
      images: args.images,

      stock: args.stock,

      isActive: true,
      createdAt: Date.now(),
    });

    return productId;
  },
});

/**
 * ==================================================
 * UPDATE PRODUCT
 * ==================================================
 */
export const update = mutation({
  args: {
    id: v.id("products"),

    name: v.optional(v.string()),
    volume: v.optional(v.string()),
    price: v.optional(v.number()),
    oldPrice: v.optional(v.number()),

    // =================================================
    // ORDER DISCOUNT
    // Example: 10 = 10%
    // =================================================
    discount: v.optional(v.number()),

    reviews: v.optional(v.number()),
    badge: v.optional(v.string()),

    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),

    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // =================================================
    // CHECK PRODUCT
    // =================================================

    const existingProduct = await ctx.db.get(id);

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // =================================================
    // VALIDATE DISCOUNT
    // =================================================

    if (
      updates.discount !== undefined &&
      (updates.discount < 0 || updates.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100.");
    }

    // =================================================
    // REMOVE UNDEFINED VALUES
    // =================================================

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    // =================================================
    // UPDATE
    // =================================================

    await ctx.db.patch(id, cleanUpdates);

    return await ctx.db.get(id);
  },
});

/**
 * ==================================================
 * DELETE / REMOVE PRODUCT
 *
 * Soft delete
 * ==================================================
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

    await ctx.db.patch(args.id, {
      isActive: false,
    });

    return {
      success: true,
      message: "Product removed successfully",
    };
  },
});

/**
 * ==================================================
 * UPDATE STOCK
 * ==================================================
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
