"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";
import { randomUUID } from "node:crypto";

/**
 * =========================================================
 * DELHIVERY BASE URLS
 * =========================================================
 */

const STAGING_BASE_URL = "https://staging-express.delhivery.com";
const PRODUCTION_BASE_URL = "https://track.delhivery.com";

/**
 * =========================================================
 * LIMITS
 * =========================================================
 */

const MAX_SESSION_TOKEN_LENGTH = 500;

const MAX_PACKAGE_WEIGHT_KG = 100;
const MAX_PACKAGE_LENGTH_CM = 200;
const MAX_PACKAGE_BREADTH_CM = 200;
const MAX_PACKAGE_HEIGHT_CM = 200;

const MAX_PACKAGE_COUNT = 1000;

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

function getBaseUrl() {
  const environment = String(process.env.DELHIVERY_ENV || "staging")
    .trim()
    .toLowerCase();

  return environment === "production" ? PRODUCTION_BASE_URL : STAGING_BASE_URL;
}

function getToken() {
  const token = process.env.DELHIVERY_API_TOKEN;

  if (!token || typeof token !== "string" || !token.trim()) {
    throw new Error("DELHIVERY_API_TOKEN is not configured in Convex.");
  }

  return token.trim();
}

/**
 * =========================================================
 * ADMIN SESSION VALIDATION
 * =========================================================
 */

function validateSessionToken(sessionToken) {
  if (
    typeof sessionToken !== "string" ||
    !sessionToken.trim() ||
    sessionToken.trim().length > MAX_SESSION_TOKEN_LENGTH
  ) {
    throw new Error("Invalid admin session.");
  }

  return sessionToken.trim();
}

/**
 * =========================================================
 * LOCK TOKEN
 * =========================================================
 */

function createLockToken() {
  return randomUUID();
}

/**
 * =========================================================
 * RESPONSE PARSER
 * =========================================================
 */

async function parseResponse(response) {
  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      `Delhivery API error (${response.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * =========================================================
 * JSON REQUEST
 * =========================================================
 */

async function request(path, options = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,

    headers: {
      Authorization: `Token ${getToken()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
}

/**
 * =========================================================
 * FORM REQUEST
 * =========================================================
 */

async function formRequest(path, body) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",

    headers: {
      Authorization: `Token ${getToken()}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body,
  });

  return parseResponse(response);
}

/**
 * =========================================================
 * CLEAN
 * =========================================================
 */

function clean(value) {
  return String(value ?? "").trim();
}

/**
 * =========================================================
 * PACKAGE DETAILS
 * =========================================================
 */

function packageDetails(items) {
  let weight = 0;

  let length = 0;
  let breadth = 0;
  let height = 0;

  for (const item of items) {
    const rawQuantity = Number(item.quantity);

    const quantity =
      Number.isInteger(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

    const itemWeight = Number(item.weight || 0);
    const itemLength = Number(item.length || 0);
    const itemBreadth = Number(item.breadth || 0);
    const itemHeight = Number(item.height || 0);

    if (
      !Number.isFinite(itemWeight) ||
      !Number.isFinite(itemLength) ||
      !Number.isFinite(itemBreadth) ||
      !Number.isFinite(itemHeight)
    ) {
      throw new Error("Invalid shipping dimensions found in the order.");
    }

    if (itemWeight < 0 || itemLength < 0 || itemBreadth < 0 || itemHeight < 0) {
      throw new Error("Shipping dimensions cannot be negative.");
    }

    weight += itemWeight * quantity;

    length = Math.max(length, itemLength);
    breadth = Math.max(breadth, itemBreadth);
    height = Math.max(height, itemHeight);
  }

  if (weight <= 0 || length <= 0 || breadth <= 0 || height <= 0) {
    throw new Error(
      "Shipping data is missing. Please add weight, length, breadth and height to the product before creating the Delhivery shipment."
    );
  }

  if (weight > MAX_PACKAGE_WEIGHT_KG) {
    throw new Error(
      `Package weight cannot exceed ${MAX_PACKAGE_WEIGHT_KG} KG.`
    );
  }

  if (length > MAX_PACKAGE_LENGTH_CM) {
    throw new Error(
      `Package length cannot exceed ${MAX_PACKAGE_LENGTH_CM} CM.`
    );
  }

  if (breadth > MAX_PACKAGE_BREADTH_CM) {
    throw new Error(
      `Package breadth cannot exceed ${MAX_PACKAGE_BREADTH_CM} CM.`
    );
  }

  if (height > MAX_PACKAGE_HEIGHT_CM) {
    throw new Error(
      `Package height cannot exceed ${MAX_PACKAGE_HEIGHT_CM} CM.`
    );
  }

  return {
    weight: Number(weight.toFixed(3)),
    length: Math.round(length),
    breadth: Math.round(breadth),
    height: Math.round(height),
  };
}

/**
 * =========================================================
 * PINCODE VALIDATION
 * =========================================================
 */

function validatePincode(pincode) {
  const value = clean(pincode);

  if (!/^\d{6}$/.test(value)) {
    throw new Error("Please enter a valid 6-digit pincode.");
  }

  return value;
}

/**
 * =========================================================
 * ORDER TOTAL VALIDATION
 * =========================================================
 */

function validateOrderTotal(total) {
  const value = Number(total);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid order total.");
  }

  return Number(value.toFixed(2));
}

/**
 * =========================================================
 * QUANTITY VALIDATION
 * =========================================================
 */

function getSafeQuantity(quantity) {
  const value = Number(quantity);

  if (!Number.isInteger(value) || value <= 0 || value > 100) {
    throw new Error("Invalid product quantity in order.");
  }

  return value;
}

/**
 * =========================================================
 * TEST CONNECTION
 * =========================================================
 */

export const testConnection = action({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionToken = validateSessionToken(args.sessionToken);

    await requireAdmin(ctx, sessionToken);

    const response = await request(
      "/c/api/pin-codes/json/?filter_codes=456010"
    );

    return {
      success: true,
      environment: process.env.DELHIVERY_ENV || "staging",
      response,
    };
  },
});

/**
 * =========================================================
 * CHECK SERVICEABILITY
 *
 * PUBLIC
 *
 * Customers can check pincode serviceability during checkout.
 * =========================================================
 */

export const checkServiceability = action({
  args: {
    pincode: v.string(),
  },

  handler: async (ctx, args) => {
    const pincode = validatePincode(args.pincode);

    const response = await request(
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`
    );

    const deliveryCodes = response?.delivery_codes;

    const serviceable = Array.isArray(deliveryCodes)
      ? deliveryCodes.length > 0
      : Boolean(deliveryCodes);

    return {
      success: true,
      pincode,
      serviceable,
      response,
    };
  },
});

/**
 * =========================================================
 * CREATE SHIPMENT
 *
 * IMPORTANT:
 * Uses DB lock before calling Delhivery.
 * This prevents concurrent admin clicks from creating
 * multiple external shipments for the same order.
 * =========================================================
 */

export const createShipment = action({
  args: {
    orderId: v.id("orders"),
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionToken = validateSessionToken(args.sessionToken);

    await requireAdmin(ctx, sessionToken);

    /**
     * -------------------------------------------------------
     * GET ORDER
     * -------------------------------------------------------
     */

    let order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * -------------------------------------------------------
     * PAYMENT
     * -------------------------------------------------------
     */

    if (order.paymentStatus !== "paid") {
      throw new Error("Only paid orders can be sent to Delhivery.");
    }

    /**
     * -------------------------------------------------------
     * ALREADY CREATED
     * -------------------------------------------------------
     */

    if (order.delhiveryWaybill) {
      return {
        success: true,
        alreadyCreated: true,
        waybill: order.delhiveryWaybill,
        trackingUrl: order.trackingUrl || null,
        status: order.delhiveryStatus || null,
      };
    }

    /**
     * -------------------------------------------------------
     * CUSTOMER VALIDATION
     * -------------------------------------------------------
     */

    const customerFields = [
      "customerName",
      "mobile",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of customerFields) {
      if (!clean(order[field])) {
        throw new Error(`Customer ${field} is missing.`);
      }
    }

    const pincode = validatePincode(order.pincode);

    /**
     * -------------------------------------------------------
     * ITEMS
     * -------------------------------------------------------
     */

    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new Error("Order has no products.");
    }

    /**
     * -------------------------------------------------------
     * PACKAGE
     * -------------------------------------------------------
     */

    const pkg = packageDetails(order.items);

    /**
     * -------------------------------------------------------
     * QUANTITY
     * -------------------------------------------------------
     */

    let quantity = 0;

    for (const item of order.items) {
      quantity += getSafeQuantity(item.quantity);
    }

    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
      throw new Error("Invalid total package quantity.");
    }

    /**
     * -------------------------------------------------------
     * PRODUCT DESCRIPTION
     * -------------------------------------------------------
     */

    const products = order.items
      .map((item) => {
        const itemQuantity = getSafeQuantity(item.quantity);

        return `${clean(item.name)} x${itemQuantity}`;
      })
      .join(", ");

    /**
     * -------------------------------------------------------
     * PICKUP LOCATION
     * -------------------------------------------------------
     */

    const pickupLocation = clean(process.env.DELHIVERY_PICKUP_LOCATION);

    if (!pickupLocation) {
      throw new Error("DELHIVERY_PICKUP_LOCATION is not configured in Convex.");
    }

    /**
     * -------------------------------------------------------
     * ORDER TOTAL
     * -------------------------------------------------------
     */

    const totalAmount = validateOrderTotal(order.total);

    /**
     * -------------------------------------------------------
     * SERVICEABILITY
     * -------------------------------------------------------
     */

    const serviceability = await request(
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`
    );

    const deliveryCodes = serviceability?.delivery_codes;

    const serviceable = Array.isArray(deliveryCodes)
      ? deliveryCodes.length > 0
      : Boolean(deliveryCodes);

    if (!serviceable) {
      throw new Error(
        `Delhivery does not show serviceability for pincode ${pincode}.`
      );
    }

    /**
     * -------------------------------------------------------
     * ACQUIRE DATABASE LOCK
     * -------------------------------------------------------
     *
     * The lock is acquired BEFORE the external Delhivery API
     * call.
     */

    const lockToken = createLockToken();

    const lockResult = await ctx.runMutation(
      internal.delhivery.acquireShipmentLock,
      {
        orderId: args.orderId,
        lockToken,
      }
    );

    /**
     * Another request may have created the shipment while
     * this action was doing the validation/serviceability check.
     */

    if (lockResult?.alreadyCreated) {
      return {
        success: true,
        alreadyCreated: true,
        waybill: lockResult.waybill,
        trackingUrl: lockResult.trackingUrl || null,
        status: lockResult.status || null,
      };
    }

    if (!lockResult?.acquired) {
      throw new Error(
        "Shipment creation is already in progress for this order. Please wait a moment."
      );
    }

    /**
     * IMPORTANT:
     * Once the lock is acquired, an external request may happen.
     *
     * We deliberately do NOT automatically release the lock after
     * an ambiguous Delhivery API failure because the external
     * request might have succeeded while the response was lost.
     *
     * The DB lock expires automatically after its configured
     * timeout.
     */

    let externalRequestStarted = false;
    let waybillReceived = false;

    try {
      /**
       * -------------------------------------------------------
       * RE-FETCH ORDER AFTER LOCK
       * -------------------------------------------------------
       *
       * Prevents stale data from being used after the lock.
       */

      order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
        orderId: args.orderId,
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.paymentStatus !== "paid") {
        throw new Error("Only paid orders can be sent to Delhivery.");
      }

      /**
       * Another request may have completed before this lock
       * was obtained/rechecked.
       */

      if (order.delhiveryWaybill) {
        await ctx.runMutation(internal.delhivery.releaseShipmentLock, {
          orderId: args.orderId,
          lockToken,
        });

        return {
          success: true,
          alreadyCreated: true,
          waybill: order.delhiveryWaybill,
          trackingUrl: order.trackingUrl || null,
          status: order.delhiveryStatus || null,
        };
      }

      /**
       * -------------------------------------------------------
       * SHIPMENT PAYLOAD
       * -------------------------------------------------------
       */

      const shipment = {
        name: clean(order.customerName),

        phone: clean(order.mobile),

        add: clean(order.address),

        city: clean(order.city),

        state: clean(order.state),

        country: "India",

        pin: validatePincode(order.pincode),

        order: clean(order.orderNumber),

        payment_mode: "Prepaid",

        products_desc: products || "Perfume",

        total_amount: validateOrderTotal(order.total),

        quantity,

        weight: pkg.weight,

        shipment_length: pkg.length,

        shipment_width: pkg.breadth,

        shipment_height: pkg.height,

        seller_name: clean(process.env.DELHIVERY_SELLER_NAME || "ELYVORR"),

        seller_add: clean(process.env.DELHIVERY_SELLER_ADDRESS || ""),

        seller_inv: clean(order.orderNumber),

        order_date: new Date(order.createdAt || Date.now())
          .toISOString()
          .slice(0, 10),

        client: clean(process.env.DELHIVERY_CLIENT_NAME || ""),
      };

      /**
       * -------------------------------------------------------
       * OPTIONAL GST
       * -------------------------------------------------------
       */

      if (process.env.DELHIVERY_SELLER_GST_TIN) {
        shipment.seller_gst_tin = clean(process.env.DELHIVERY_SELLER_GST_TIN);
      }

      /**
       * -------------------------------------------------------
       * OPTIONAL HSN
       * -------------------------------------------------------
       */

      if (process.env.DELHIVERY_DEFAULT_HSN) {
        shipment.hsn_code = clean(process.env.DELHIVERY_DEFAULT_HSN);
      }

      /**
       * -------------------------------------------------------
       * DELHIVERY PAYLOAD
       * -------------------------------------------------------
       */

      const payload = {
        shipments: [shipment],

        pickup_location: {
          name: pickupLocation,
        },
      };

      const body = `format=json&data=${encodeURIComponent(
        JSON.stringify(payload)
      )}`;

      /**
       * -------------------------------------------------------
       * CREATE SHIPMENT
       * -------------------------------------------------------
       */

      externalRequestStarted = true;

      const response = await formRequest("/api/cmu/create.json", body);

      /**
       * -------------------------------------------------------
       * RESPONSE
       * -------------------------------------------------------
       */

      const packages = Array.isArray(response?.packages)
        ? response.packages
        : [];

      const firstPackage = packages[0] || null;

      const waybill = firstPackage?.waybill
        ? String(firstPackage.waybill).trim()
        : "";

      if (!waybill) {
        throw new Error(
          "Delhivery returned no waybill. The shipment lock will expire automatically before another attempt."
        );
      }

      waybillReceived = true;

      /**
       * -------------------------------------------------------
       * TRACKING URL
       * -------------------------------------------------------
       */

      const trackingUrl =
        `${getBaseUrl()}/api/v1/packages/json/?waybill=` +
        `${encodeURIComponent(waybill)}&verbose=1`;

      /**
       * -------------------------------------------------------
       * SAVE SHIPMENT
       *
       * lockToken proves that this action owns the lock.
       *
       * saveDelhiveryShipment also clears the lock atomically.
       * -------------------------------------------------------
       */

      await ctx.runMutation(internal.delhivery.saveDelhiveryShipment, {
        orderId: args.orderId,

        delhiveryWaybill: waybill,

        delhiveryStatus: clean(firstPackage?.status || "Manifested"),

        trackingUrl,

        delhiveryManifestedAt: Date.now(),

        lockToken,
      });

      /**
       * -------------------------------------------------------
       * RESPONSE
       * -------------------------------------------------------
       */

      return {
        success: true,

        alreadyCreated: false,

        waybill,

        trackingUrl,

        status: clean(firstPackage?.status || "Manifested"),
      };
    } catch (error) {
      /**
       * -------------------------------------------------------
       * LOCK FAILURE HANDLING
       * -------------------------------------------------------
       *
       * If the external Delhivery request has NOT started,
       * release the lock immediately.
       *
       * If the external request has started, keep the lock until
       * it expires. This prevents another admin request from
       * immediately creating a possible duplicate shipment when
       * the external result is ambiguous.
       */

      if (!externalRequestStarted) {
        try {
          await ctx.runMutation(internal.delhivery.releaseShipmentLock, {
            orderId: args.orderId,
            lockToken,
          });
        } catch {
          // Lock expiry will clean it up automatically.
        }
      } else if (!waybillReceived) {
        // Keep lock intentionally.
      } else {
        // Waybill was received but DB save may have failed.
        // Keep lock intentionally to avoid duplicate creation.
      }

      throw error;
    }
  },
});

/**
 * =========================================================
 * TRACK SHIPMENT
 * =========================================================
 */

export const trackShipment = action({
  args: {
    orderId: v.id("orders"),
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionToken = validateSessionToken(args.sessionToken);

    await requireAdmin(ctx, sessionToken);

    /**
     * -------------------------------------------------------
     * GET ORDER
     * -------------------------------------------------------
     */

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * -------------------------------------------------------
     * WAYBILL
     * -------------------------------------------------------
     */

    if (!order.delhiveryWaybill) {
      throw new Error("This order does not have a Delhivery waybill.");
    }

    const waybill = clean(order.delhiveryWaybill);

    /**
     * -------------------------------------------------------
     * TRACK
     * -------------------------------------------------------
     */

    const response = await request(
      `/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}&verbose=1`
    );

    const shipment = response?.ShipmentData?.[0]?.Shipment;

    const status = clean(
      shipment?.Status?.Status || order.delhiveryStatus || "Unknown"
    );

    const statusCode = clean(shipment?.Status?.StatusCode || "");

    /**
     * -------------------------------------------------------
     * DELIVERY DATE
     * -------------------------------------------------------
     */

    let deliveredAt;

    if (shipment?.DeliveryDate) {
      const date = new Date(shipment.DeliveryDate).getTime();

      if (Number.isFinite(date)) {
        deliveredAt = date;
      }
    }

    /**
     * -------------------------------------------------------
     * STATUS DATE
     * -------------------------------------------------------
     */

    let statusDate;

    const possibleDate =
      shipment?.Status?.StatusDateTime || shipment?.Status?.StatusDate;

    if (possibleDate) {
      const date = new Date(possibleDate).getTime();

      if (Number.isFinite(date)) {
        statusDate = date;
      }
    }

    /**
     * -------------------------------------------------------
     * SAVE TRACKING
     * -------------------------------------------------------
     */

    await ctx.runMutation(internal.delhivery.saveDelhiveryTracking, {
      orderId: args.orderId,

      delhiveryStatus: status,

      delhiveryStatusCode: statusCode,

      delhiveryStatusDate: statusDate,

      deliveredAt,

      updatedAt: Date.now(),
    });

    /**
     * -------------------------------------------------------
     * RETURN ONLY REQUIRED DATA
     * -------------------------------------------------------
     */

    return {
      success: true,

      waybill,

      status,

      statusCode,

      deliveredAt: deliveredAt || null,

      statusDate: statusDate || null,
    };
  },
});

/**
 * =========================================================
 * GENERATE LABEL
 * =========================================================
 */

export const generateLabel = action({
  args: {
    orderId: v.id("orders"),
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionToken = validateSessionToken(args.sessionToken);

    await requireAdmin(ctx, sessionToken);

    /**
     * -------------------------------------------------------
     * GET ORDER
     * -------------------------------------------------------
     */

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * -------------------------------------------------------
     * WAYBILL
     * -------------------------------------------------------
     */

    if (!order.delhiveryWaybill) {
      throw new Error("Create the Delhivery shipment first.");
    }

    const waybill = clean(order.delhiveryWaybill);

    /**
     * -------------------------------------------------------
     * GENERATE LABEL
     * -------------------------------------------------------
     */

    const response = await request(
      `/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=True`
    );

    const pdfUrl =
      response?.packages?.[0]?.pdf_download_link ||
      response?.pdf_download_link ||
      response?.url ||
      null;

    return {
      success: true,

      waybill,

      pdfUrl,
    };
  },
});

/**
 * =========================================================
 * CREATE PICKUP REQUEST
 *
 * Uses a DB lock so two admin requests cannot create
 * duplicate pickup requests simultaneously.
 * =========================================================
 */

export const createPickupRequest = action({
  args: {
    orderId: v.id("orders"),

    pickupDate: v.string(),

    pickupTime: v.string(),

    expectedPackageCount: v.optional(v.number()),

    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionToken = validateSessionToken(args.sessionToken);

    await requireAdmin(ctx, sessionToken);

    /**
     * -------------------------------------------------------
     * GET ORDER
     * -------------------------------------------------------
     */

    let order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * -------------------------------------------------------
     * ALREADY SCHEDULED
     * -------------------------------------------------------
     */

    if (order.delhiveryPickupId) {
      return {
        success: true,

        alreadyCreated: true,

        pickupId: order.delhiveryPickupId,
      };
    }

    /**
     * -------------------------------------------------------
     * WAYBILL
     * -------------------------------------------------------
     */

    if (!order.delhiveryWaybill) {
      throw new Error("Create the Delhivery shipment first.");
    }

    /**
     * -------------------------------------------------------
     * PICKUP LOCATION
     * -------------------------------------------------------
     */

    const pickupLocation = clean(process.env.DELHIVERY_PICKUP_LOCATION);

    if (!pickupLocation) {
      throw new Error("DELHIVERY_PICKUP_LOCATION is not configured in Convex.");
    }

    /**
     * -------------------------------------------------------
     * PICKUP DATE
     * -------------------------------------------------------
     */

    const pickupDate = clean(args.pickupDate);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      throw new Error("Invalid pickup date. Use YYYY-MM-DD.");
    }

    const pickupDateObject = new Date(`${pickupDate}T00:00:00`);

    if (Number.isNaN(pickupDateObject.getTime())) {
      throw new Error("Invalid pickup date.");
    }

    /**
     * -------------------------------------------------------
     * PICKUP TIME
     * -------------------------------------------------------
     */

    const pickupTime = clean(args.pickupTime);

    if (!/^\d{2}:\d{2}$/.test(pickupTime)) {
      throw new Error("Invalid pickup time. Use HH:MM.");
    }

    const [hours, minutes] = pickupTime.split(":").map(Number);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid pickup time.");
    }

    /**
     * -------------------------------------------------------
     * PACKAGE COUNT
     * -------------------------------------------------------
     */

    const count = Number(args.expectedPackageCount ?? 1);

    if (!Number.isInteger(count) || count < 1 || count > MAX_PACKAGE_COUNT) {
      throw new Error(
        `Package count must be between 1 and ${MAX_PACKAGE_COUNT}.`
      );
    }

    /**
     * -------------------------------------------------------
     * ACQUIRE PICKUP LOCK
     * -------------------------------------------------------
     */

    const lockToken = createLockToken();

    const lockResult = await ctx.runMutation(
      internal.delhivery.acquirePickupLock,
      {
        orderId: args.orderId,
        lockToken,
      }
    );

    /**
     * Another request already created the pickup.
     */

    if (lockResult?.alreadyCreated) {
      return {
        success: true,

        alreadyCreated: true,

        pickupId: lockResult.pickupId,
      };
    }

    if (!lockResult?.acquired) {
      throw new Error(
        "Pickup request is already being created for this order. Please wait a moment."
      );
    }

    let externalRequestStarted = false;
    let pickupIdReceived = false;

    try {
      /**
       * -------------------------------------------------------
       * RE-FETCH ORDER AFTER LOCK
       * -------------------------------------------------------
       */

      order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
        orderId: args.orderId,
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.delhiveryPickupId) {
        await ctx.runMutation(internal.delhivery.releasePickupLock, {
          orderId: args.orderId,
          lockToken,
        });

        return {
          success: true,

          alreadyCreated: true,

          pickupId: order.delhiveryPickupId,
        };
      }

      if (!order.delhiveryWaybill) {
        throw new Error("Create the Delhivery shipment first.");
      }

      /**
       * -------------------------------------------------------
       * REQUEST BODY
       * -------------------------------------------------------
       */

      const body = new URLSearchParams({
        pickup_time: pickupTime,

        pickup_date: pickupDate,

        pickup_location: pickupLocation,

        expected_package_count: String(count),
      }).toString();

      /**
       * -------------------------------------------------------
       * CREATE PICKUP
       * -------------------------------------------------------
       */

      externalRequestStarted = true;

      const response = await formRequest("/fm/request/new/", body);

      /**
       * -------------------------------------------------------
       * PICKUP ID
       * -------------------------------------------------------
       */

      const pickupId =
        response?.pickup_id != null ? String(response.pickup_id).trim() : "";

      if (!pickupId) {
        throw new Error(
          "Delhivery returned no pickup ID. The pickup lock will expire automatically before another attempt."
        );
      }

      pickupIdReceived = true;

      /**
       * -------------------------------------------------------
       * SAVE PICKUP
       *
       * saveDelhiveryPickup verifies lock ownership and clears
       * the lock after successfully saving.
       * -------------------------------------------------------
       */

      await ctx.runMutation(internal.delhivery.saveDelhiveryPickup, {
        orderId: args.orderId,

        delhiveryPickupId: pickupId,

        delhiveryStatus: "pickup_scheduled",

        updatedAt: Date.now(),

        lockToken,
      });

      /**
       * -------------------------------------------------------
       * RESPONSE
       * -------------------------------------------------------
       */

      return {
        success: true,

        alreadyCreated: false,

        pickupId,
      };
    } catch (error) {
      /**
       * -------------------------------------------------------
       * LOCK FAILURE HANDLING
       * -------------------------------------------------------
       *
       * Before external request:
       * release immediately.
       *
       * After external request:
       * keep lock temporarily because the external result
       * may be ambiguous.
       */

      if (!externalRequestStarted) {
        try {
          await ctx.runMutation(internal.delhivery.releasePickupLock, {
            orderId: args.orderId,
            lockToken,
          });
        } catch {
          // Lock expiry will clean it up automatically.
        }
      } else if (!pickupIdReceived) {
        // Keep lock intentionally.
      } else {
        // Pickup ID received but DB save may have failed.
        // Keep lock intentionally.
      }

      throw error;
    }
  },
});
