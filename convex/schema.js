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

    // NEW
    // Order Summary discount percentage
    // Example: 10 = 10% discount
    discount: v.optional(v.number()),

    reviews: v.number(),
    badge: v.optional(v.string()),
    image: v.string(),
    images: v.optional(v.array(v.string())),
    stock: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
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
    customerName: v.string(),
    mobile: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),

    // -----------------------------------------------------
    // ORDER ITEMS
    // -----------------------------------------------------

    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        volume: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.string(),
      })
    ),

    // -----------------------------------------------------
    // ORDER TOTALS
    // -----------------------------------------------------

    subtotal: v.number(),
    discount: v.number(),
    shipping: v.number(),
    gst: v.number(),
    total: v.number(),

    // -----------------------------------------------------
    // PAYMENT
    // -----------------------------------------------------

    paymentStatus: v.string(),
    paymentId: v.optional(v.string()),

    // Razorpay Order ID
    razorpayOrderId: v.optional(v.string()),

    // -----------------------------------------------------
    // ORDER STATUS
    // -----------------------------------------------------

    orderStatus: v.string(),

    // -----------------------------------------------------
    // TIMESTAMPS
    // -----------------------------------------------------

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_order_status", ["orderStatus"])
    .index("by_razorpayOrderId", ["razorpayOrderId"]),

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
