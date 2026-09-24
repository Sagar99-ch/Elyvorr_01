import { internalQuery, internalMutation } from "./_generated/server";

import { v } from "convex/values";

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const MAX_WAYBILL_LENGTH = 100;
const MAX_PICKUP_ID_LENGTH = 100;

const MAX_STATUS_LENGTH = 200;
const MAX_STATUS_CODE_LENGTH = 100;

const MAX_TRACKING_URL_LENGTH = 2000;

/**
 * Locks are temporary.
 *
 * If an action crashes before releasing the lock,
 * another request can reclaim it after this duration.
 */
const LOCK_DURATION_MS = 2 * 60 * 1000;

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function clean(value) {
  return String(value ?? "").trim();
}

function validateWaybill(value) {
  const waybill = clean(value);

  if (!waybill) {
    throw new Error("Delhivery waybill is required.");
  }

  if (waybill.length > MAX_WAYBILL_LENGTH) {
    throw new Error("Invalid Delhivery waybill.");
  }

  return waybill;
}

function validatePickupId(value) {
  const pickupId = clean(value);

  if (!pickupId) {
    throw new Error("Invalid Delhivery pickup ID.");
  }

  if (pickupId.length > MAX_PICKUP_ID_LENGTH) {
    throw new Error("Invalid Delhivery pickup ID.");
  }

  return pickupId;
}

function validateStatus(value) {
  const status = clean(value);

  if (!status) {
    return "Unknown";
  }

  if (status.length > MAX_STATUS_LENGTH) {
    return status.slice(0, MAX_STATUS_LENGTH);
  }

  return status;
}

function validateStatusCode(value) {
  const statusCode = clean(value);

  if (!statusCode) {
    return "";
  }

  if (statusCode.length > MAX_STATUS_CODE_LENGTH) {
    return statusCode.slice(0, MAX_STATUS_CODE_LENGTH);
  }

  return statusCode;
}

function validateTrackingUrl(value) {
  const url = clean(value);

  if (!url) {
    throw new Error("Tracking URL is required.");
  }

  if (url.length > MAX_TRACKING_URL_LENGTH) {
    throw new Error("Invalid tracking URL.");
  }

  return url;
}

function validateTimestamp(value, fieldName) {
  const timestamp = Number(value);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return timestamp;
}

function validateLockToken(value) {
  const token = clean(value);

  if (!token || token.length > 500) {
    throw new Error("Invalid Delhivery lock token.");
  }

  return token;
}

/**
 * =========================================================
 * GET ORDER FOR DELHIVERY
 * =========================================================
 *
 * Old orders may not contain shipping information inside
 * their item snapshot.
 *
 * Existing order snapshot is preferred.
 * Current product shipping information is used only
 * when the snapshot value is missing.
 * =========================================================
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

    const enrichedItems = [];

    for (const item of order.items || []) {
      const product = await ctx.db.get(item.productId);

      const enrichedItem = {
        ...item,

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
 * ACQUIRE DELHIVERY SHIPMENT LOCK
 * =========================================================
 *
 * This is an internal mutation because the lock operation
 * must happen atomically inside Convex.
 *
 * Returns:
 *
 * acquired: true
 *     Lock successfully acquired.
 *
 * acquired: false
 *     Another request currently owns the lock.
 *
 * alreadyCreated: true
 *     Shipment already has a waybill.
 * =========================================================
 */

export const acquireShipmentLock = internalMutation({
  args: {
    orderId: v.id("orders"),
    lockToken: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const lockToken = validateLockToken(args.lockToken);

    /**
     * Shipment already exists.
     */

    if (order.delhiveryWaybill) {
      return {
        acquired: false,

        alreadyCreated: true,

        waybill: order.delhiveryWaybill,
      };
    }

    const now = Date.now();

    const existingLockAt = order.delhiveryShipmentLockAt;

    const existingLockToken = order.delhiveryShipmentLockToken;

    /**
     * Existing active lock.
     */

    if (
      existingLockAt &&
      existingLockToken &&
      now - existingLockAt < LOCK_DURATION_MS
    ) {
      /**
       * Same request retrying.
       */

      if (existingLockToken === lockToken) {
        return {
          acquired: true,

          alreadyCreated: false,

          reused: true,
        };
      }

      /**
       * Different request.
       */

      return {
        acquired: false,

        alreadyCreated: false,

        locked: true,
      };
    }

    /**
     * Lock is missing or stale.
     *
     * Acquire it.
     */

    await ctx.db.patch(args.orderId, {
      delhiveryShipmentLockAt: now,

      delhiveryShipmentLockToken: lockToken,

      updatedAt: now,
    });

    return {
      acquired: true,

      alreadyCreated: false,

      reused: false,
    };
  },
});

/**
 * =========================================================
 * RELEASE DELHIVERY SHIPMENT LOCK
 * =========================================================
 */

export const releaseShipmentLock = internalMutation({
  args: {
    orderId: v.id("orders"),
    lockToken: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const lockToken = validateLockToken(args.lockToken);

    /**
     * Only the owner of the lock can release it.
     */

    if (order.delhiveryShipmentLockToken !== lockToken) {
      return {
        success: false,
        released: false,
      };
    }

    await ctx.db.patch(args.orderId, {
      delhiveryShipmentLockAt: undefined,

      delhiveryShipmentLockToken: undefined,

      updatedAt: Date.now(),
    });

    return {
      success: true,
      released: true,
    };
  },
});

/**
 * =========================================================
 * ACQUIRE DELHIVERY PICKUP LOCK
 * =========================================================
 */

export const acquirePickupLock = internalMutation({
  args: {
    orderId: v.id("orders"),
    lockToken: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const lockToken = validateLockToken(args.lockToken);

    /**
     * Pickup already exists.
     */

    if (order.delhiveryPickupId) {
      return {
        acquired: false,

        alreadyCreated: true,

        pickupId: order.delhiveryPickupId,
      };
    }

    const now = Date.now();

    const existingLockAt = order.delhiveryPickupLockAt;

    const existingLockToken = order.delhiveryPickupLockToken;

    /**
     * Existing active lock.
     */

    if (
      existingLockAt &&
      existingLockToken &&
      now - existingLockAt < LOCK_DURATION_MS
    ) {
      /**
       * Same request retrying.
       */

      if (existingLockToken === lockToken) {
        return {
          acquired: true,

          alreadyCreated: false,

          reused: true,
        };
      }

      /**
       * Different request.
       */

      return {
        acquired: false,

        alreadyCreated: false,

        locked: true,
      };
    }

    /**
     * Missing/stale lock.
     */

    await ctx.db.patch(args.orderId, {
      delhiveryPickupLockAt: now,

      delhiveryPickupLockToken: lockToken,

      updatedAt: now,
    });

    return {
      acquired: true,

      alreadyCreated: false,

      reused: false,
    };
  },
});

/**
 * =========================================================
 * RELEASE DELHIVERY PICKUP LOCK
 * =========================================================
 */

export const releasePickupLock = internalMutation({
  args: {
    orderId: v.id("orders"),
    lockToken: v.string(),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const lockToken = validateLockToken(args.lockToken);

    /**
     * Only the owner can release.
     */

    if (order.delhiveryPickupLockToken !== lockToken) {
      return {
        success: false,
        released: false,
      };
    }

    await ctx.db.patch(args.orderId, {
      delhiveryPickupLockAt: undefined,

      delhiveryPickupLockToken: undefined,

      updatedAt: Date.now(),
    });

    return {
      success: true,
      released: true,
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

    lockToken: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const waybill = validateWaybill(args.delhiveryWaybill);

    const status = validateStatus(args.delhiveryStatus);

    const trackingUrl = validateTrackingUrl(args.trackingUrl);

    const manifestedAt = validateTimestamp(
      args.delhiveryManifestedAt,
      "manifested timestamp"
    );

    /**
     * Same waybill = idempotent success.
     */

    if (order.delhiveryWaybill === waybill) {
      return {
        success: true,

        alreadySaved: true,

        waybill,
      };
    }

    /**
     * Different existing waybill.
     */

    if (order.delhiveryWaybill) {
      throw new Error("This order already has a different Delhivery waybill.");
    }

    /**
     * If lockToken is supplied, verify ownership.
     */

    if (args.lockToken) {
      const lockToken = validateLockToken(args.lockToken);

      if (order.delhiveryShipmentLockToken !== lockToken) {
        throw new Error(
          "Delhivery shipment lock is no longer owned by this request."
        );
      }
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      delhiveryWaybill: waybill,

      delhiveryStatus: status,

      delhiveryManifestedAt: manifestedAt,

      awbCode: waybill,

      trackingUrl,

      shippingStatus: status,

      shippedAt: manifestedAt,

      orderStatus: "shipped",

      /**
       * Shipment creation is complete.
       * Clear lock.
       */

      delhiveryShipmentLockAt: undefined,

      delhiveryShipmentLockToken: undefined,

      updatedAt: now,
    });

    return {
      success: true,

      alreadySaved: false,

      waybill,
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

    const rawStatus = validateStatus(args.delhiveryStatus);

    const status = rawStatus.toLowerCase();

    const statusCode = validateStatusCode(args.delhiveryStatusCode);

    const now = Date.now();

    const patch = {
      delhiveryStatus: rawStatus,

      delhiveryStatusCode: statusCode,

      shippingStatus: rawStatus,

      updatedAt: now,
    };

    /**
     * Delivered
     */

    if (status.includes("delivered")) {
      patch.orderStatus = "delivered";

      if (args.deliveredAt != null) {
        patch.deliveredAt = validateTimestamp(
          args.deliveredAt,
          "delivered timestamp"
        );
      } else if (args.delhiveryStatusDate != null) {
        patch.deliveredAt = validateTimestamp(
          args.delhiveryStatusDate,
          "status timestamp"
        );
      } else if (order.deliveredAt) {
        patch.deliveredAt = order.deliveredAt;
      } else {
        patch.deliveredAt = now;
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
      /**
       * Never downgrade delivered.
       */

      if (order.orderStatus !== "delivered") {
        patch.orderStatus = "shipped";
      }

      if (!order.shippedAt) {
        patch.shippedAt = now;
      }
    }

    /**
     * Cancelled
     */
    else if (status.includes("cancel")) {
      if (order.orderStatus !== "delivered") {
        patch.orderStatus = "cancelled";
      }
    }

    await ctx.db.patch(args.orderId, patch);

    return {
      success: true,

      status: rawStatus,
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

    lockToken: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const status = validateStatus(args.delhiveryStatus);

    let pickupId;

    if (args.delhiveryPickupId) {
      pickupId = validatePickupId(args.delhiveryPickupId);
    }

    /**
     * Same pickup ID = idempotent success.
     */

    if (pickupId && order.delhiveryPickupId === pickupId) {
      return {
        success: true,

        alreadySaved: true,

        pickupId,
      };
    }

    /**
     * Different pickup ID.
     */

    if (
      order.delhiveryPickupId &&
      pickupId &&
      order.delhiveryPickupId !== pickupId
    ) {
      throw new Error(
        "This order already has a different Delhivery pickup ID."
      );
    }

    /**
     * Verify lock ownership when supplied.
     */

    if (args.lockToken) {
      const lockToken = validateLockToken(args.lockToken);

      if (order.delhiveryPickupLockToken !== lockToken) {
        throw new Error(
          "Delhivery pickup lock is no longer owned by this request."
        );
      }
    }

    const patch = {
      delhiveryStatus: status,

      shippingStatus: status,

      /**
       * Pickup request completed.
       * Clear lock.
       */

      delhiveryPickupLockAt: undefined,

      delhiveryPickupLockToken: undefined,

      updatedAt: Date.now(),
    };

    if (pickupId) {
      patch.delhiveryPickupId = pickupId;
    }

    await ctx.db.patch(args.orderId, patch);

    return {
      success: true,

      alreadySaved: false,

      pickupId: pickupId || order.delhiveryPickupId || null,
    };
  },
});
