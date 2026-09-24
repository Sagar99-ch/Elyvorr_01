import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================================================
// HELPERS
// ==================================================

function validateSessionId(sessionId) {
  if (typeof sessionId !== "string") {
    throw new Error("Invalid session.");
  }

  const value = sessionId.trim();

  if (!value || value.length > 200) {
    throw new Error("Invalid session.");
  }

  return value;
}

function cleanString(value, fieldName, minLength, maxLength) {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${fieldName}.`);
  }

  const cleaned = value.trim();

  if (cleaned.length < minLength || cleaned.length > maxLength) {
    throw new Error(
      `${fieldName} must be between ${minLength} and ${maxLength} characters.`
    );
  }

  return cleaned;
}

function validateMobile(value) {
  const mobile = cleanString(value, "mobile", 10, 15);

  // Indian mobile number
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error("Please enter a valid mobile number.");
  }

  return mobile;
}

function validatePincode(value) {
  const pincode = cleanString(value, "pincode", 6, 6);

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Please enter a valid 6-digit pincode.");
  }

  return pincode;
}

// ==================================================
// GET SAVED ADDRESS
// ==================================================

export const getAddress = query({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    return await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();
  },
});

// ==================================================
// SAVE / UPDATE ADDRESS
// ==================================================

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
    const sessionId = validateSessionId(args.sessionId);

    const fullName = cleanString(args.fullName, "full name", 2, 100);

    const mobile = validateMobile(args.mobile);

    const address = cleanString(args.address, "address", 5, 500);

    const city = cleanString(args.city, "city", 2, 100);

    const state = cleanString(args.state, "state", 2, 100);

    const pincode = validatePincode(args.pincode);

    const existingAddress = await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    const now = Date.now();

    const addressData = {
      fullName,
      mobile,
      address,
      city,
      state,
      pincode,
      updatedAt: now,
    };

    // ==================================================
    // UPDATE EXISTING ADDRESS
    // ==================================================

    if (existingAddress) {
      await ctx.db.patch(existingAddress._id, addressData);

      return existingAddress._id;
    }

    // ==================================================
    // CREATE NEW ADDRESS
    // ==================================================

    return await ctx.db.insert("addresses", {
      sessionId,
      ...addressData,
      createdAt: now,
    });
  },
});

// ==================================================
// DELETE ADDRESS
// ==================================================

export const deleteAddress = mutation({
  args: {
    sessionId: v.string(),
  },

  handler: async (ctx, args) => {
    const sessionId = validateSessionId(args.sessionId);

    const existingAddress = await ctx.db
      .query("addresses")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!existingAddress) {
      return false;
    }

    await ctx.db.delete(existingAddress._id);

    return true;
  },
});
