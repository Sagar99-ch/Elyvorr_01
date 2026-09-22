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
    // These details are used by Delhivery.
    // Existing product data remains compatible.

    // Example: ELY-DARK-50
    sku: v.optional(v.string()),

    // Packed product weight in KG
    // Example: 0.250
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
        // Used by Delhivery
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

    // Razorpay Order ID
    razorpayOrderId: v.optional(v.string()),

    // ===================================================
    // ORDER STATUS
    // ===================================================

    orderStatus: v.string(),

    // ===================================================
    // OLD SHIPROCKET FIELDS
    // ===================================================
    // Kept temporarily so existing orders/data do not
    // break during migration to Delhivery.

    shiprocketOrderId: v.optional(v.string()),
    shiprocketShipmentId: v.optional(v.string()),

    // ===================================================
    // COMMON SHIPPING FIELDS
    // ===================================================

    // AWB / Waybill
    awbCode: v.optional(v.string()),

    // Courier name
    courierName: v.optional(v.string()),

    // Current shipping status
    shippingStatus: v.optional(v.string()),

    // Tracking URL
    trackingUrl: v.optional(v.string()),

    // Shipping timestamps
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),

    // ===================================================
    // DELHIVERY
    // ===================================================

    // Delhivery Waybill / AWB
    delhiveryWaybill: v.optional(v.string()),

    // Delhivery pickup request ID
    delhiveryPickupId: v.optional(v.string()),

    // Current Delhivery status
    delhiveryStatus: v.optional(v.string()),

    // Delhivery status code
    delhiveryStatusCode: v.optional(v.string()),

    // Time when shipment was manifested/created
    delhiveryManifestedAt: v.optional(v.number()),

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
    .index("by_awbCode", ["awbCode"])

    // Delhivery indexes
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
  // ADMIN OTP
  // =====================================================

  adminOtps: defineTable({
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
