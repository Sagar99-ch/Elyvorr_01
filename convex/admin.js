import { action, internalMutation, mutation, query } from "./_generated/server";

import { internal } from "./_generated/api";
import { v } from "convex/values";

// =====================================================
// HELPERS
// =====================================================

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);

  crypto.getRandomValues(bytes);

  return bytesToHex(bytes);
}

async function hashValue(value, salt) {
  const data = new TextEncoder().encode(`${salt}:${value}`);

  const digest = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(new Uint8Array(digest));
}

async function createHash(value) {
  const salt = randomHex(16);

  const hash = await hashValue(value, salt);

  return `${salt}:${hash}`;
}

async function verifyHash(value, storedHash) {
  const separator = storedHash.indexOf(":");

  if (separator === -1) {
    return false;
  }

  const salt = storedHash.slice(0, separator);

  const originalHash = storedHash.slice(separator + 1);

  const newHash = await hashValue(value, salt);

  return newHash === originalHash;
}

// =====================================================
// INTERNAL — FIND ADMIN
// =====================================================

export const getAdminByEmail = query({
  args: {
    email: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .unique();
  },
});

// =====================================================
// INTERNAL — CREATE ADMIN
// =====================================================

export const createAdmin = internalMutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const now = Date.now();

    const adminId = await ctx.db.insert("adminUsers", {
      fullName: args.fullName.trim(),

      email,

      passwordHash: args.passwordHash,

      isActive: true,

      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      adminId,
    };
  },
});

// =====================================================
// CREATE FIRST ADMIN
// =====================================================

export const setupAdmin = action({
  args: {
    setupKey: v.string(),

    fullName: v.string(),

    email: v.string(),

    password: v.string(),
  },

  handler: async (ctx, args) => {
    const configuredKey = process.env.ADMIN_SETUP_KEY;

    if (!configuredKey) {
      throw new Error("ADMIN_SETUP_KEY is not configured.");
    }

    if (args.setupKey !== configuredKey) {
      throw new Error("Invalid admin setup key.");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (!args.fullName.trim()) {
      throw new Error("Full name is required.");
    }

    const email = normalizeEmail(args.email);

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    const passwordHash = await createHash(args.password);

    return await ctx.runMutation(internal.admin.createAdmin, {
      fullName: args.fullName.trim(),

      email,

      passwordHash,
    });
  },
});

// =====================================================
// ONE-TIME ADMIN SETUP — NO CLI JSON REQUIRED
// =====================================================

export const setupFirstAdmin = action({
  args: {},

  handler: async (ctx) => {
    const setupKey = process.env.ADMIN_SETUP_KEY;

    const setupEmail = process.env.ADMIN_SETUP_EMAIL;

    const setupName = process.env.ADMIN_SETUP_NAME;

    const setupPassword = process.env.ADMIN_SETUP_PASSWORD;

    if (!setupKey) {
      throw new Error("ADMIN_SETUP_KEY is not configured.");
    }

    if (!setupEmail) {
      throw new Error("ADMIN_SETUP_EMAIL is not configured.");
    }

    if (!setupName) {
      throw new Error("ADMIN_SETUP_NAME is not configured.");
    }

    if (!setupPassword) {
      throw new Error("ADMIN_SETUP_PASSWORD is not configured.");
    }

    if (setupPassword.length < 8) {
      throw new Error("Admin password must be at least 8 characters.");
    }

    const email = normalizeEmail(setupEmail);

    const existingAdmin = await ctx.runQuery(internal.admin.getAdminByEmail, {
      email,
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await createHash(setupPassword);

    return await ctx.runMutation(internal.admin.createAdmin, {
      fullName: setupName.trim(),
      email,
      passwordHash,
    });
  },
});

// =====================================================
// ADMIN LOGIN
// =====================================================

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    const admin = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!admin || !admin.isActive) {
      throw new Error("Invalid email or password.");
    }

    const passwordValid = await verifyHash(args.password, admin.passwordHash);

    if (!passwordValid) {
      throw new Error("Invalid email or password.");
    }

    // =================================================
    // CREATE SESSION
    // =================================================

    const sessionToken = randomHex(32);

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("adminSessions", {
      adminId: admin._id,

      sessionToken,

      expiresAt,

      createdAt: Date.now(),
    });

    return {
      success: true,

      sessionToken,

      admin: {
        id: admin._id,

        fullName: admin.fullName,

        email: admin.email,
      },
    };
  },
});

// =====================================================
// VERIFY ADMIN SESSION
// =====================================================

export const verifySession = query({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      return null;
    }

    const admin = await ctx.db.get(session.adminId);

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      id: admin._id,

      fullName: admin.fullName,

      email: admin.email,
    };
  },
});

// =====================================================
// LOGOUT
// =====================================================

export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();

    if (!session) {
      return {
        success: true,
      };
    }

    await ctx.db.delete(session._id);

    return {
      success: true,
    };
  },
});
