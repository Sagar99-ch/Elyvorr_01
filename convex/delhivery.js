import { internalQuery, internalMutation } from "./_generated/server";

import { v } from "convex/values";

/**
 * =========================================================
 * GET ORDER FOR DELHIVERY
 * =========================================================
 *
 * Important:
 * Old orders may not contain shipping information inside
 * their item snapshot.
 *
 * So we fetch the latest product shipping information and
 * merge it into the order items.
 */

export const getOrderForDelhivery = internalQuery({
  args: {
    orderId: v.id("orders"),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    /**
     * Enrich order items with current product shipping data.
     *
     * Existing order snapshot is preferred.
     * If missing, product table is used.
     */

    const enrichedItems = [];

    for (const item of order.items || []) {
      const product = await ctx.db.get(item.productId);

      const enrichedItem = {
        ...item,

        /**
         * Existing order value first.
         * Otherwise use current product value.
         */

        sku: item.sku ?? product?.sku,

        weight: item.weight ?? product?.weight,

        length: item.length ?? product?.length,

        breadth: item.breadth ?? product?.breadth,

        height: item.height ?? product?.height,
      };

      enrichedItems.push(enrichedItem);
    }

    return {
      ...order,

      items: enrichedItems,
    };
  },
});

/**
 * =========================================================
 * SAVE DELHIVERY SHIPMENT
 * =========================================================
 */

export const saveDelhiveryShipment = internalMutation({
  args: {
    orderId: v.id("orders"),

    delhiveryWaybill: v.string(),

    delhiveryStatus: v.string(),

    trackingUrl: v.string(),

    delhiveryManifestedAt: v.number(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * Don't overwrite a different
     * existing Delhivery waybill.
     */

    if (
      order.delhiveryWaybill &&
      order.delhiveryWaybill !== args.delhiveryWaybill
    ) {
      throw new Error("This order already has a different Delhivery waybill.");
    }

    await ctx.db.patch(args.orderId, {
      /**
       * Delhivery
       */

      delhiveryWaybill: args.delhiveryWaybill,

      delhiveryStatus: args.delhiveryStatus,

      delhiveryManifestedAt: args.delhiveryManifestedAt,

      /**
       * Common shipping fields
       */

      awbCode: args.delhiveryWaybill,

      trackingUrl: args.trackingUrl,

      shippingStatus: args.delhiveryStatus,

      shippedAt: args.delhiveryManifestedAt,

      /**
       * Order
       */

      orderStatus: "shipped",

      updatedAt: Date.now(),
    });

    return {
      success: true,

      waybill: args.delhiveryWaybill,
    };
  },
});

/**
 * =========================================================
 * SAVE DELHIVERY TRACKING
 * =========================================================
 */

export const saveDelhiveryTracking = internalMutation({
  args: {
    orderId: v.id("orders"),

    delhiveryStatus: v.string(),

    delhiveryStatusCode: v.string(),

    delhiveryStatusDate: v.optional(v.number()),

    deliveredAt: v.optional(v.number()),

    updatedAt: v.number(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const rawStatus = String(args.delhiveryStatus || "").trim();

    const status = rawStatus.toLowerCase();

    const patch = {
      delhiveryStatus: rawStatus || "Unknown",

      delhiveryStatusCode: args.delhiveryStatusCode || "",

      shippingStatus: rawStatus || "Unknown",

      updatedAt: args.updatedAt,
    };

    /**
     * Delivered
     */

    if (status.includes("delivered")) {
      patch.orderStatus = "delivered";

      if (args.deliveredAt) {
        patch.deliveredAt = args.deliveredAt;
      } else if (args.delhiveryStatusDate) {
        patch.deliveredAt = args.delhiveryStatusDate;
      }
    }

    /**
     * Shipped / transit
     */
    else if (
      status.includes("manifest") ||
      status.includes("ready to ship") ||
      status.includes("ready for pickup") ||
      status.includes("in transit") ||
      status.includes("out for delivery") ||
      status.includes("dispatched") ||
      status.includes("picked")
    ) {
      patch.orderStatus = "shipped";

      if (!order.shippedAt) {
        patch.shippedAt = args.updatedAt;
      }
    }

    /**
     * Cancelled
     */
    else if (status.includes("cancel")) {
      patch.orderStatus = "cancelled";
    }

    await ctx.db.patch(args.orderId, patch);

    return {
      success: true,

      status: rawStatus || "Unknown",
    };
  },
});

/**
 * =========================================================
 * SAVE DELHIVERY PICKUP
 * =========================================================
 */

export const saveDelhiveryPickup = internalMutation({
  args: {
    orderId: v.id("orders"),

    delhiveryPickupId: v.optional(v.string()),

    delhiveryStatus: v.string(),

    updatedAt: v.number(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const patch = {
      delhiveryStatus: args.delhiveryStatus,

      shippingStatus: args.delhiveryStatus,

      updatedAt: args.updatedAt,
    };

    if (args.delhiveryPickupId) {
      patch.delhiveryPickupId = args.delhiveryPickupId;
    }

    await ctx.db.patch(args.orderId, patch);

    return {
      success: true,

      pickupId: args.delhiveryPickupId || order.delhiveryPickupId || null,
    };
  },
});
