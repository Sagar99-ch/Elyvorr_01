import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  // =====================================================
  // PRODUCTS
  // =====================================================

  products: defineTable({
    name: v.string(),

    volume: v.string(),

    price: v.number(),

    oldPrice: v.optional(v.number()),

    // Product discount percentage
    // Example: 10 = 10% OFF
    discount: v.optional(v.number()),

    reviews: v.number(),

    badge: v.optional(v.string()),

    image: v.string(),

    images: v.optional(v.array(v.string())),

    stock: v.number(),

    isActive: v.boolean(),

    createdAt: v.number(),

    // ===================================================
    // SHIPPING PRODUCT DETAILS
    // ===================================================

    sku: v.optional(v.string()),

    // Packed product weight in KG
    weight: v.optional(v.number()),

    // Packed dimensions in CM
    length: v.optional(v.number()),

    breadth: v.optional(v.number()),

    height: v.optional(v.number()),
  }).index("by_name", ["name"]),

  // =====================================================
  // CART
  // =====================================================

  cart: defineTable({
    sessionId: v.string(),

    productId: v.id("products"),

    quantity: v.number(),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_product", ["sessionId", "productId"]),

  // =====================================================
  // ADDRESSES
  // =====================================================

  addresses: defineTable({
    sessionId: v.string(),

    fullName: v.string(),

    mobile: v.string(),

    address: v.string(),

    city: v.string(),

    state: v.string(),

    pincode: v.string(),

    createdAt: v.number(),

    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // =====================================================
  // ORDERS
  // =====================================================

  orders: defineTable({
    sessionId: v.string(),

    orderNumber: v.string(),

    // ===================================================
    // CUSTOMER
    // ===================================================

    customerName: v.string(),

    mobile: v.string(),

    address: v.string(),

    city: v.string(),

    state: v.string(),

    pincode: v.string(),

    // ===================================================
    // ORDER ITEMS
    // ===================================================

    items: v.array(
      v.object({
        productId: v.id("products"),

        name: v.string(),

        volume: v.string(),

        price: v.number(),

        quantity: v.number(),

        image: v.string(),

        // Product shipping snapshot
        sku: v.optional(v.string()),

        weight: v.optional(v.number()),

        length: v.optional(v.number()),

        breadth: v.optional(v.number()),

        height: v.optional(v.number()),
      })
    ),

    // ===================================================
    // ORDER TOTALS
    // ===================================================

    subtotal: v.number(),

    discount: v.number(),

    shipping: v.number(),

    gst: v.number(),

    total: v.number(),

    // ===================================================
    // PAYMENT
    // ===================================================

    paymentStatus: v.string(),

    paymentId: v.optional(v.string()),

    razorpayOrderId: v.optional(v.string()),

    // ===================================================
    // ORDER STATUS
    // ===================================================

    orderStatus: v.string(),

    // ===================================================
    // INVENTORY RESERVATION
    // ===================================================

    stockReserved: v.optional(v.boolean()),

    stockReservedAt: v.optional(v.number()),

    stockReservationExpiresAt: v.optional(v.number()),

    stockReleasedAt: v.optional(v.number()),

    // ===================================================
    // OLD SHIPROCKET FIELDS
    // ===================================================

    // Kept temporarily for existing data compatibility.
    shiprocketOrderId: v.optional(v.string()),

    shiprocketShipmentId: v.optional(v.string()),

    // ===================================================
    // COMMON SHIPPING FIELDS
    // ===================================================

    awbCode: v.optional(v.string()),

    courierName: v.optional(v.string()),

    shippingStatus: v.optional(v.string()),

    trackingUrl: v.optional(v.string()),

    shippedAt: v.optional(v.number()),

    deliveredAt: v.optional(v.number()),

    // ===================================================
    // DELHIVERY
    // ===================================================

    delhiveryWaybill: v.optional(v.string()),

    delhiveryPickupId: v.optional(v.string()),

    delhiveryStatus: v.optional(v.string()),

    delhiveryStatusCode: v.optional(v.string()),

    delhiveryManifestedAt: v.optional(v.number()),

    // ===================================================
    // DELHIVERY SHIPMENT LOCK
    // ===================================================
    //
    // Used to prevent two admin requests from creating
    // the same Delhivery shipment simultaneously.
    //
    // Lock is temporary and can be reclaimed if stale.
    //

    delhiveryShipmentLockAt: v.optional(v.number()),

    delhiveryShipmentLockToken: v.optional(v.string()),

    // ===================================================
    // DELHIVERY PICKUP LOCK
    // ===================================================
    //
    // Used to prevent duplicate pickup requests.
    //

    delhiveryPickupLockAt: v.optional(v.number()),

    delhiveryPickupLockToken: v.optional(v.string()),

    // ===================================================
    // TIMESTAMPS
    // ===================================================

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])

    .index("by_order_number", ["orderNumber"])

    .index("by_payment_status", ["paymentStatus"])

    .index("by_order_status", ["orderStatus"])

    .index("by_razorpayOrderId", ["razorpayOrderId"])

    .index("by_paymentId", ["paymentId"])

    .index("by_awbCode", ["awbCode"])

    .index("by_delhivery_waybill", ["delhiveryWaybill"])

    .index("by_delhivery_pickup_id", ["delhiveryPickupId"]),

  // =====================================================
  // CONTACT ENQUIRIES
  // =====================================================

  contacts: defineTable({
    name: v.string(),

    email: v.string(),

    phone: v.optional(v.string()),

    subject: v.string(),

    message: v.string(),

    status: v.string(),

    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // =====================================================
  // ADMIN USERS
  // =====================================================

  adminUsers: defineTable({
    email: v.string(),

    fullName: v.string(),

    passwordHash: v.string(),

    isActive: v.boolean(),

    createdAt: v.number(),

    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // =====================================================
  // ADMIN SESSIONS
  // =====================================================

  adminSessions: defineTable({
    adminId: v.id("adminUsers"),

    sessionToken: v.string(),

    createdAt: v.number(),

    expiresAt: v.number(),
  })
    .index("by_token", ["sessionToken"])

    .index("by_admin", ["adminId"]),

  // =====================================================
  // ADMIN LOGIN ATTEMPTS
  // =====================================================

  adminLoginAttempts: defineTable({
    email: v.string(),

    failedCount: v.number(),

    lockedUntil: v.optional(v.number()),

    lastAttemptAt: v.number(),
  }).index("by_email", ["email"]),

  // =====================================================
  // ADMIN OTP
  // =====================================================

  adminOtps: defineTable({
    email: v.string(),

    // IMPORTANT:
    // This should contain a HASH of the OTP,
    // not the plaintext OTP.
    otp: v.string(),

    expiresAt: v.number(),

    createdAt: v.number(),
  })
    .index("by_email", ["email"])

    .index("by_expiresAt", ["expiresAt"]),
});
