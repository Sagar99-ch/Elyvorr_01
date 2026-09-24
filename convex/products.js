import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

// =====================================================
// GET ALL PRODUCTS
// =====================================================

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

// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getById = query({
  args: {
    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    return product;
  },
});

// =====================================================
// ADD PRODUCT
// =====================================================

export const add = mutation({
  args: {
    sessionToken: v.string(),

    name: v.string(),
    volume: v.string(),
    price: v.float64(),
    oldPrice: v.optional(v.float64()),

    // Order Summary discount
    discount: v.optional(v.float64()),

    reviews: v.optional(v.float64()),
    badge: v.optional(v.string()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),

    stock: v.float64(),

    // =================================================
    // DELHIVERY SHIPPING DETAILS
    // =================================================

    sku: v.optional(v.string()),
    weight: v.optional(v.float64()),
    length: v.optional(v.float64()),
    breadth: v.optional(v.float64()),
    height: v.optional(v.float64()),

    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    // =================================================
    // ADMIN AUTHENTICATION
    // =================================================

    await requireAdmin(ctx, args.sessionToken);

    // =================================================
    // VALIDATION
    // =================================================

    if (args.price < 0) {
      throw new Error("Price cannot be negative.");
    }

    if (args.stock < 0) {
      throw new Error("Stock cannot be negative.");
    }

    if (
      args.discount !== undefined &&
      (args.discount < 0 || args.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100.");
    }

    if (args.weight !== undefined && args.weight <= 0) {
      throw new Error("Weight must be greater than 0.");
    }

    if (args.length !== undefined && args.length <= 0) {
      throw new Error("Length must be greater than 0.");
    }

    if (args.breadth !== undefined && args.breadth <= 0) {
      throw new Error("Breadth must be greater than 0.");
    }

    if (args.height !== undefined && args.height <= 0) {
      throw new Error("Height must be greater than 0.");
    }

    // =================================================
    // INSERT PRODUCT
    // =================================================

    return await ctx.db.insert("products", {
      name: args.name,
      volume: args.volume,
      price: args.price,
      oldPrice: args.oldPrice,

      // Discount percentage
      discount: args.discount ?? 0,

      reviews: args.reviews ?? 0,

      badge: args.badge,

      image: args.image,

      images: args.images,

      stock: args.stock,

      // Delhivery
      sku: args.sku,
      weight: args.weight,
      length: args.length,
      breadth: args.breadth,
      height: args.height,

      isActive: args.isActive ?? true,

      createdAt: Date.now(),
    });
  },
});

// =====================================================
// UPDATE PRODUCT
// =====================================================

export const update = mutation({
  args: {
    sessionToken: v.string(),

    id: v.id("products"),

    name: v.optional(v.string()),
    volume: v.optional(v.string()),
    price: v.optional(v.float64()),
    oldPrice: v.optional(v.float64()),

    // Order Summary discount
    discount: v.optional(v.float64()),

    reviews: v.optional(v.float64()),
    badge: v.optional(v.string()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),

    stock: v.optional(v.float64()),

    // =================================================
    // DELHIVERY SHIPPING DETAILS
    // =================================================

    sku: v.optional(v.string()),
    weight: v.optional(v.float64()),
    length: v.optional(v.float64()),
    breadth: v.optional(v.float64()),
    height: v.optional(v.float64()),

    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    // =================================================
    // ADMIN AUTHENTICATION
    // =================================================

    await requireAdmin(ctx, args.sessionToken);

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found.");
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (args.price !== undefined && args.price < 0) {
      throw new Error("Price cannot be negative.");
    }

    if (args.stock !== undefined && args.stock < 0) {
      throw new Error("Stock cannot be negative.");
    }

    if (
      args.discount !== undefined &&
      (args.discount < 0 || args.discount > 100)
    ) {
      throw new Error("Discount must be between 0 and 100.");
    }

    if (args.weight !== undefined && args.weight <= 0) {
      throw new Error("Weight must be greater than 0.");
    }

    if (args.length !== undefined && args.length <= 0) {
      throw new Error("Length must be greater than 0.");
    }

    if (args.breadth !== undefined && args.breadth <= 0) {
      throw new Error("Breadth must be greater than 0.");
    }

    if (args.height !== undefined && args.height <= 0) {
      throw new Error("Height must be greater than 0.");
    }

    // =================================================
    // REMOVE ID + SESSION TOKEN FROM PATCH OBJECT
    // =================================================

    const { id, sessionToken, ...updates } = args;

    // =================================================
    // UPDATE PRODUCT
    // =================================================

    await ctx.db.patch(id, updates);

    return await ctx.db.get(id);
  },
});

// =====================================================
// UPDATE STOCK
// =====================================================

export const updateStock = mutation({
  args: {
    sessionToken: v.string(),

    id: v.id("products"),

    stock: v.float64(),
  },

  handler: async (ctx, args) => {
    // =================================================
    // ADMIN AUTHENTICATION
    // =================================================

    await requireAdmin(ctx, args.sessionToken);

    // =================================================
    // VALIDATION
    // =================================================

    if (args.stock < 0) {
      throw new Error("Stock cannot be negative.");
    }

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found.");
    }

    // =================================================
    // UPDATE STOCK
    // =================================================

    await ctx.db.patch(args.id, {
      stock: args.stock,
    });

    return await ctx.db.get(args.id);
  },
});

// =====================================================
// REMOVE PRODUCT
// =====================================================

export const remove = mutation({
  args: {
    sessionToken: v.string(),

    id: v.id("products"),
  },

  handler: async (ctx, args) => {
    // =================================================
    // ADMIN AUTHENTICATION
    // =================================================

    await requireAdmin(ctx, args.sessionToken);

    // =================================================
    // FIND PRODUCT
    // =================================================

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found.");
    }

    // =================================================
    // DELETE PRODUCT
    // =================================================

    await ctx.db.delete(args.id);

    return {
      success: true,
    };
  },
});
