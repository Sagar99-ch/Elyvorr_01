import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// CREATE CONTACT ENQUIRY
// =====================================================

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },

  handler: async (ctx, args) => {
    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      phone: args.phone,

      subject: args.subject,
      message: args.message,

      status: "new",

      createdAt: Date.now(),
    });

    return contactId;
  },
});

// =====================================================
// ADMIN — GET ALL CONTACT ENQUIRIES
// =====================================================

export const getAll = query({
  args: {},

  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("desc").collect();
  },
});

// =====================================================
// ADMIN — UPDATE CONTACT STATUS
// =====================================================

export const updateStatus = mutation({
  args: {
    id: v.id("contacts"),
    status: v.string(),
  },

  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);

    if (!contact) {
      throw new Error("Contact enquiry not found.");
    }

    const allowedStatuses = ["new", "read", "replied", "resolved"];

    if (!allowedStatuses.includes(args.status)) {
      throw new Error("Invalid contact status.");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    return {
      success: true,
    };
  },
});

// =====================================================
// ADMIN — DELETE CONTACT
// =====================================================

export const remove = mutation({
  args: {
    id: v.id("contacts"),
  },

  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);

    if (!contact) {
      throw new Error("Contact enquiry not found.");
    }

    await ctx.db.delete(args.id);

    return {
      success: true,
    };
  },
});
