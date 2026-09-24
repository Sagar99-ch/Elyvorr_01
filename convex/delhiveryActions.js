"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

const STAGING_BASE_URL = "https://staging-express.delhivery.com";
const PRODUCTION_BASE_URL = "https://track.delhivery.com";

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

function getBaseUrl() {
  const environment = String(
    process.env.DELHIVERY_ENV || "staging"
  ).toLowerCase();

  return environment === "production" ? PRODUCTION_BASE_URL : STAGING_BASE_URL;
}

function getToken() {
  const token = process.env.DELHIVERY_API_TOKEN;

  if (!token) {
    throw new Error("DELHIVERY_API_TOKEN is not configured in Convex.");
  }

  return token.trim();
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
    const quantity = Math.max(1, Number(item.quantity || 1));

    weight += Math.max(0, Number(item.weight || 0)) * quantity;

    length = Math.max(length, Number(item.length || 0));

    breadth = Math.max(breadth, Number(item.breadth || 0));

    height = Math.max(height, Number(item.height || 0));
  }

  if (weight <= 0 || length <= 0 || breadth <= 0 || height <= 0) {
    throw new Error(
      "Shipping data is missing. Please add weight, length, breadth and height to the product before creating the Delhivery shipment."
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
 * TEST CONNECTION
 * =========================================================
 */

export const testConnection = action({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

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
 * This is intentionally public because customers
 * can check pincode serviceability during checkout.
 * =========================================================
 */

export const checkServiceability = action({
  args: {
    pincode: v.string(),
  },

  handler: async (ctx, args) => {
    const pincode = clean(args.pincode);

    if (!/^\d{6}$/.test(pincode)) {
      throw new Error("Please enter a valid 6-digit pincode.");
    }

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
 * =========================================================
 */

export const createShipment = action({
  args: {
    orderId: v.id("orders"),
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    /**
     * getOrderForDelhivery()
     *
     * IMPORTANT:
     * This enriches old order items with current
     * product shipping data.
     */

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    /**
     * Payment
     */

    if (order.paymentStatus !== "paid") {
      throw new Error("Only paid orders can be sent to Delhivery.");
    }

    /**
     * Already created
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
     * Customer validation
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

    /**
     * Items
     */

    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new Error("Order has no products.");
    }

    /**
     * Package
     */

    const pkg = packageDetails(order.items);

    /**
     * Quantity
     */

    const quantity = order.items.reduce(
      (total, item) => total + Math.max(1, Number(item.quantity || 1)),
      0
    );

    /**
     * Product description
     */

    const products = order.items
      .map(
        (item) =>
          `${clean(item.name)} x${Math.max(1, Number(item.quantity || 1))}`
      )
      .join(", ");

    /**
     * Pickup location
     */

    const pickupLocation = clean(process.env.DELHIVERY_PICKUP_LOCATION);

    if (!pickupLocation) {
      throw new Error("DELHIVERY_PICKUP_LOCATION is not configured in Convex.");
    }

    /**
     * Serviceability
     */

    const serviceability = await request(
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(
        clean(order.pincode)
      )}`
    );

    const deliveryCodes = serviceability?.delivery_codes;

    const serviceable = Array.isArray(deliveryCodes)
      ? deliveryCodes.length > 0
      : Boolean(deliveryCodes);

    if (!serviceable) {
      throw new Error(
        `Delhivery does not show serviceability for pincode ${clean(
          order.pincode
        )}.`
      );
    }

    /**
     * Shipment payload
     */

    const shipment = {
      name: clean(order.customerName),

      phone: clean(order.mobile),

      add: clean(order.address),

      city: clean(order.city),

      state: clean(order.state),

      country: "India",

      pin: clean(order.pincode),

      order: clean(order.orderNumber),

      payment_mode: "Prepaid",

      products_desc: products || "Perfume",

      total_amount: Number(order.total || 0),

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

      client: process.env.DELHIVERY_CLIENT_NAME,
    };

    /**
     * Optional GST
     */

    if (process.env.DELHIVERY_SELLER_GST_TIN) {
      shipment.seller_gst_tin = clean(process.env.DELHIVERY_SELLER_GST_TIN);
    }

    /**
     * Optional HSN
     */

    if (process.env.DELHIVERY_DEFAULT_HSN) {
      shipment.hsn_code = clean(process.env.DELHIVERY_DEFAULT_HSN);
    }

    /**
     * Delhivery payload
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
     * Create shipment
     */

    const response = await formRequest("/api/cmu/create.json", body);

    /**
     * Package
     */

    const packages = Array.isArray(response?.packages) ? response.packages : [];

    const firstPackage = packages[0] || null;

    const waybill = firstPackage?.waybill ? String(firstPackage.waybill) : "";

    if (!waybill) {
      throw new Error(
        `Delhivery returned no waybill: ${JSON.stringify(response)}`
      );
    }

    /**
     * Tracking URL
     */

    const trackingUrl = `${getBaseUrl()}/api/v1/packages/json/?waybill=${encodeURIComponent(
      waybill
    )}&verbose=1`;

    /**
     * Save shipment
     */

    await ctx.runMutation(internal.delhivery.saveDelhiveryShipment, {
      orderId: args.orderId,

      delhiveryWaybill: waybill,

      delhiveryStatus: clean(firstPackage?.status || "Manifested"),

      trackingUrl,

      delhiveryManifestedAt: Date.now(),
    });

    return {
      success: true,

      alreadyCreated: false,

      waybill,

      trackingUrl,

      status: clean(firstPackage?.status || "Manifested"),

      response,
    };
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
    await requireAdmin(ctx, args.sessionToken);

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!order.delhiveryWaybill) {
      throw new Error("This order does not have a Delhivery waybill.");
    }

    const response = await request(
      `/api/v1/packages/json/?waybill=${encodeURIComponent(
        order.delhiveryWaybill
      )}&verbose=1`
    );

    const shipment = response?.ShipmentData?.[0]?.Shipment;

    const status = clean(
      shipment?.Status?.Status || order.delhiveryStatus || "Unknown"
    );

    const statusCode = clean(shipment?.Status?.StatusCode || "");

    let deliveredAt;

    if (shipment?.DeliveryDate) {
      const date = new Date(shipment.DeliveryDate).getTime();

      if (Number.isFinite(date)) {
        deliveredAt = date;
      }
    }

    let statusDate;

    const possibleDate =
      shipment?.Status?.StatusDateTime || shipment?.Status?.StatusDate;

    if (possibleDate) {
      const date = new Date(possibleDate).getTime();

      if (Number.isFinite(date)) {
        statusDate = date;
      }
    }

    await ctx.runMutation(internal.delhivery.saveDelhiveryTracking, {
      orderId: args.orderId,

      delhiveryStatus: status,

      delhiveryStatusCode: statusCode,

      delhiveryStatusDate: statusDate,

      deliveredAt,

      updatedAt: Date.now(),
    });

    return {
      success: true,

      waybill: order.delhiveryWaybill,

      status,

      statusCode,

      response,
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
    await requireAdmin(ctx, args.sessionToken);

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!order.delhiveryWaybill) {
      throw new Error("Create the Delhivery shipment first.");
    }

    const response = await request(
      `/api/p/packing_slip?wbns=${encodeURIComponent(
        order.delhiveryWaybill
      )}&pdf=True`
    );

    const pdfUrl =
      response?.packages?.[0]?.pdf_download_link ||
      response?.pdf_download_link ||
      response?.url ||
      null;

    return {
      success: true,

      waybill: order.delhiveryWaybill,

      pdfUrl,

      response,
    };
  },
});

/**
 * =========================================================
 * CREATE PICKUP REQUEST
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
    await requireAdmin(ctx, args.sessionToken);

    const order = await ctx.runQuery(internal.delhivery.getOrderForDelhivery, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!order.delhiveryWaybill) {
      throw new Error("Create the Delhivery shipment first.");
    }

    const pickupLocation = clean(process.env.DELHIVERY_PICKUP_LOCATION);

    if (!pickupLocation) {
      throw new Error("DELHIVERY_PICKUP_LOCATION is not configured in Convex.");
    }

    const count = Math.max(1, Number(args.expectedPackageCount || 1));

    const body = new URLSearchParams({
      pickup_time: clean(args.pickupTime),

      pickup_date: clean(args.pickupDate),

      pickup_location: pickupLocation,

      expected_package_count: String(count),
    }).toString();

    const response = await formRequest("/fm/request/new/", body);

    const pickupId =
      response?.pickup_id != null ? String(response.pickup_id) : "";

    await ctx.runMutation(internal.delhivery.saveDelhiveryPickup, {
      orderId: args.orderId,

      delhiveryPickupId: pickupId || undefined,

      delhiveryStatus: "pickup_scheduled",

      updatedAt: Date.now(),
    });

    return {
      success: true,

      pickupId: pickupId || null,

      response,
    };
  },
});
