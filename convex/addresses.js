import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/*
==================================================
GET SAVED ADDRESS
==================================================
*/

export const getAddress = query({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

/*
==================================================
SAVE / UPDATE ADDRESS
==================================================
*/

export const saveAddress = mutation({
  args: {
    sessionId: v.string(),

    fullName: v.string(),
    mobile: v.string(),

    address: v.string(),

    city: v.string(),
    state: v.string(),
    pincode: v.string(),
  },

  handler: async (ctx, args) => {
    const existingAddress = await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const addressData = {
      fullName: args.fullName.trim(),
      mobile: args.mobile.trim(),

      address: args.address.trim(),

      city: args.city.trim(),
      state: args.state.trim(),
      pincode: args.pincode.trim(),

      updatedAt: Date.now(),
    };

    // Update existing address
    if (existingAddress) {
      await ctx.db.patch(existingAddress._id, addressData);

      return existingAddress._id;
    }

    // Create new address
    return await ctx.db.insert("addresses", {
      sessionId: args.sessionId,

      ...addressData,

      createdAt: Date.now(),
    });
  },
});

/*
==================================================
DELETE ADDRESS
==================================================
*/

export const deleteAddress = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingAddress = await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!existingAddress) {
      return false;
    }

    await ctx.db.delete(existingAddress._id);

    return true;
  },
});
