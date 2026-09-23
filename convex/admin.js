import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  action,
} from "./_generated/server";

import { internal } from "./_generated/api";

import { v } from "convex/values";

/**
 * =========================================================
 * ELYVORR — ADMIN AUTHENTICATION
 * =========================================================
 *
 * Security features:
 *
 * - PBKDF2 password hashing
 * - Legacy SHA-256 hash verification for migration
 * - Random session tokens
 * - Login rate limiting
 * - Session expiration
 * - Admin active-status validation
 * - Credential-change protection
 * - Session revocation after password change
 *
 * =========================================================
 */

// =========================================================
// CONSTANTS
// =========================================================

const PBKDF2_ITERATIONS = 100_000;

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

const LOGIN_MAX_ATTEMPTS = 5;

const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000;

// =========================================================
// HELPERS
// =========================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ");
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

function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.length >= 5 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

// =========================================================
// SHA-256 — LEGACY PASSWORD SUPPORT
// =========================================================

async function sha256(value) {
  const data = new TextEncoder().encode(value);

  const digest = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(new Uint8Array(digest));
}

// =========================================================
// PBKDF2 PASSWORD HASH
// =========================================================

async function createPasswordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return [
    "pbkdf2",
    PBKDF2_ITERATIONS,
    bytesToHex(salt),
    bytesToHex(new Uint8Array(derivedBits)),
  ].join("$");
}

// =========================================================
// VERIFY PBKDF2 PASSWORD
// =========================================================

async function verifyPasswordHash(password, storedHash) {
  if (typeof storedHash !== "string" || !storedHash) {
    return false;
  }

  // -------------------------------------------------------
  // NEW PBKDF2 FORMAT
  // -------------------------------------------------------

  if (storedHash.startsWith("pbkdf2$")) {
    const parts = storedHash.split("$");

    if (parts.length !== 4) {
      return false;
    }

    const iterations = Number(parts[1]);

    const saltHex = parts[2];

    const originalHash = parts[3];

    if (
      !Number.isInteger(iterations) ||
      iterations < 10_000 ||
      iterations > 1_000_000
    ) {
      return false;
    }

    const saltBytes = new Uint8Array(saltHex.length / 2);

    for (let i = 0; i < saltBytes.length; i++) {
      saltBytes[i] = parseInt(saltHex.substr(i * 2, 2), 16);
    }

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const newHash = bytesToHex(new Uint8Array(derivedBits));

    return newHash === originalHash;
  }

  // -------------------------------------------------------
  // LEGACY HASH FORMAT
  // -------------------------------------------------------

  // Old format:
  //
  // salt:sha256
  //
  // Keep this temporarily so existing admin accounts
  // continue to work.
  if (storedHash.includes(":")) {
    const separator = storedHash.indexOf(":");

    const salt = storedHash.slice(0, separator);

    const originalHash = storedHash.slice(separator + 1);

    const data = new TextEncoder().encode(`${salt}:${password}`);

    const digest = await crypto.subtle.digest("SHA-256", data);

    const newHash = bytesToHex(new Uint8Array(digest));

    return newHash === originalHash;
  }

  return false;
}

// =========================================================
// CREATE LEGACY HASH
// =========================================================
// Kept only for compatibility with old setup flows.
// New passwords always use PBKDF2.
// =========================================================

async function createLegacyHash(value) {
  const salt = randomHex(16);

  const hash = await sha256(`${salt}:${value}`);

  return `${salt}:${hash}`;
}

// =========================================================
// INTERNAL — FIND ADMIN
// =========================================================

export const getAdminByEmail = internalQuery({
  args: {
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    if (!isValidEmail(email)) {
      return null;
    }

    return await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

// =========================================================
// INTERNAL — CREATE ADMIN
// =========================================================

export const createAdmin = internalMutation({
  args: {
    fullName: v.string(),

    email: v.string(),

    passwordHash: v.string(),
  },

  handler: async (ctx, args) => {
    const fullName = normalizeName(args.fullName);

    const email = normalizeEmail(args.email);

    if (fullName.length < 2 || fullName.length > 100) {
      throw new Error("Full name must be between 2 and 100 characters.");
    }

    if (!isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }

    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const now = Date.now();

    const adminId = await ctx.db.insert("adminUsers", {
      fullName,

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

// =========================================================
// CREATE FIRST ADMIN
// =========================================================
//
// IMPORTANT:
// This endpoint is protected by ADMIN_SETUP_KEY.
//
// After the first admin exists, it cannot create another
// admin with the same email.
// =========================================================

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

    if (
      typeof args.setupKey !== "string" ||
      args.setupKey.length < 16 ||
      args.setupKey !== configuredKey
    ) {
      throw new Error("Invalid admin setup key.");
    }

    const fullName = normalizeName(args.fullName);

    const email = normalizeEmail(args.email);

    const password = args.password;

    if (fullName.length < 2 || fullName.length > 100) {
      throw new Error("Full name must be between 2 and 100 characters.");
    }

    if (!isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      throw new Error("Password must be between 8 and 128 characters.");
    }

    const existingAdmin = await ctx.runQuery(internal.admin.getAdminByEmail, {
      email,
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await createPasswordHash(password);

    return await ctx.runMutation(internal.admin.createAdmin, {
      fullName,

      email,

      passwordHash,
    });
  },
});

// =========================================================
// ONE-TIME ADMIN SETUP
// =========================================================

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

    if (setupKey.length < 16) {
      throw new Error("ADMIN_SETUP_KEY must be at least 16 characters.");
    }

    if (setupPassword.length < 8 || setupPassword.length > 128) {
      throw new Error("Admin password must be between 8 and 128 characters.");
    }

    const email = normalizeEmail(setupEmail);

    const fullName = normalizeName(setupName);

    if (!isValidEmail(email)) {
      throw new Error("ADMIN_SETUP_EMAIL is invalid.");
    }

    if (fullName.length < 2 || fullName.length > 100) {
      throw new Error("ADMIN_SETUP_NAME is invalid.");
    }

    const existingAdmin = await ctx.runQuery(internal.admin.getAdminByEmail, {
      email,
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await createPasswordHash(setupPassword);

    return await ctx.runMutation(internal.admin.createAdmin, {
      fullName,

      email,

      passwordHash,
    });
  },
});

// =========================================================
// ADMIN LOGIN
// =========================================================

export const login = mutation({
  args: {
    email: v.string(),

    password: v.string(),
  },

  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    if (!isValidEmail(email)) {
      throw new Error("Invalid email or password.");
    }

    if (
      typeof args.password !== "string" ||
      args.password.length === 0 ||
      args.password.length > 128
    ) {
      throw new Error("Invalid email or password.");
    }

    // =====================================================
    // CHECK LOGIN LOCK
    // =====================================================

    const loginAttempt = await ctx.db
      .query("adminLoginAttempts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const now = Date.now();

    if (loginAttempt?.lockedUntil && now < loginAttempt.lockedUntil) {
      throw new Error(
        "Too many failed login attempts. Please try again later."
      );
    }

    // =====================================================
    // FIND ADMIN
    // =====================================================

    const admin = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!admin || !admin.isActive) {
      await recordFailedLogin(ctx, email, loginAttempt);

      throw new Error("Invalid email or password.");
    }

    // =====================================================
    // VERIFY PASSWORD
    // =====================================================

    const passwordValid = await verifyPasswordHash(
      args.password,
      admin.passwordHash
    );

    if (!passwordValid) {
      await recordFailedLogin(ctx, email, loginAttempt);

      throw new Error("Invalid email or password.");
    }

    // =====================================================
    // SUCCESSFUL LOGIN
    // =====================================================

    if (loginAttempt) {
      await ctx.db.delete(loginAttempt._id);
    }

    // =====================================================
    // CREATE SESSION
    // =====================================================

    const sessionToken = randomHex(32);

    const expiresAt = now + SESSION_DURATION;

    await ctx.db.insert("adminSessions", {
      adminId: admin._id,

      sessionToken,

      expiresAt,

      createdAt: now,
    });

    return {
      success: true,

      sessionToken,

      expiresAt,

      admin: {
        id: admin._id,

        fullName: admin.fullName,

        email: admin.email,
      },
    };
  },
});

// =========================================================
// FAILED LOGIN HELPER
// =========================================================

async function recordFailedLogin(ctx, email, existingAttempt) {
  const now = Date.now();

  if (!existingAttempt) {
    await ctx.db.insert("adminLoginAttempts", {
      email,

      attempts: 1,

      lastAttemptAt: now,

      lockedUntil: undefined,
    });

    return;
  }

  const attempts = Number(existingAttempt.attempts || 0) + 1;

  const shouldLock = attempts >= LOGIN_MAX_ATTEMPTS;

  await ctx.db.patch(existingAttempt._id, {
    attempts,

    lastAttemptAt: now,

    lockedUntil: shouldLock ? now + LOGIN_LOCKOUT_DURATION : undefined,
  });
}

// =========================================================
// VERIFY ADMIN SESSION
// =========================================================

export const verifySession = query({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    if (typeof args.sessionToken !== "string" || !args.sessionToken.trim()) {
      return null;
    }

    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) =>
        q.eq("sessionToken", args.sessionToken.trim())
      )
      .unique();

    if (!session) {
      return null;
    }

    if (
      !Number.isFinite(session.expiresAt) ||
      Date.now() >= session.expiresAt
    ) {
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

      expiresAt: session.expiresAt,
    };
  },
});

// =========================================================
// UPDATE ADMIN CREDENTIALS / PROFILE
// =========================================================

export const updateCredentials = mutation({
  args: {
    sessionToken: v.string(),

    currentPassword: v.string(),

    fullName: v.optional(v.string()),

    newEmail: v.optional(v.string()),

    newPassword: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // ===================================================
    // FIND SESSION
    // ===================================================

    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) =>
        q.eq("sessionToken", args.sessionToken.trim())
      )
      .unique();

    if (!session) {
      throw new Error("Your admin session is invalid. Please login again.");
    }

    // ===================================================
    // SESSION EXPIRY
    // ===================================================

    if (Date.now() >= session.expiresAt) {
      throw new Error("Your admin session has expired. Please login again.");
    }

    // ===================================================
    // GET ADMIN
    // ===================================================

    const admin = await ctx.db.get(session.adminId);

    if (!admin || !admin.isActive) {
      throw new Error("Admin account is not active.");
    }

    // ===================================================
    // VERIFY CURRENT PASSWORD
    // ===================================================

    const passwordValid = await verifyPasswordHash(
      args.currentPassword,
      admin.passwordHash
    );

    if (!passwordValid) {
      throw new Error("Current password is incorrect.");
    }

    // ===================================================
    // CHECK CHANGES
    // ===================================================

    if (args.fullName === undefined && !args.newEmail && !args.newPassword) {
      throw new Error("Please enter a new name, email or password.");
    }

    const updates = {};

    let passwordChanged = false;

    // ===================================================
    // NAME CHANGE
    // ===================================================

    if (args.fullName !== undefined) {
      const fullName = normalizeName(args.fullName);

      if (fullName.length < 2 || fullName.length > 100) {
        throw new Error("Full name must be between 2 and 100 characters.");
      }

      if (fullName !== admin.fullName) {
        updates.fullName = fullName;
      }
    }

    // ===================================================
    // EMAIL CHANGE
    // ===================================================

    if (args.newEmail) {
      const email = normalizeEmail(args.newEmail);

      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (email === admin.email) {
        throw new Error("New email is the same as your current email.");
      }

      const existingAdmin = await ctx.db
        .query("adminUsers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      if (existingAdmin) {
        throw new Error("This email is already being used by another admin.");
      }

      updates.email = email;
    }

    // ===================================================
    // PASSWORD CHANGE
    // ===================================================

    if (args.newPassword) {
      if (args.newPassword.length < 8 || args.newPassword.length > 128) {
        throw new Error("New password must be between 8 and 128 characters.");
      }

      const samePassword = await verifyPasswordHash(
        args.newPassword,
        admin.passwordHash
      );

      if (samePassword) {
        throw new Error(
          "New password must be different from your current password."
        );
      }

      updates.passwordHash = await createPasswordHash(args.newPassword);

      passwordChanged = true;
    }

    // ===================================================
    // UPDATE TIMESTAMP
    // ===================================================

    updates.updatedAt = Date.now();

    // ===================================================
    // SAVE ADMIN
    // ===================================================

    await ctx.db.patch(admin._id, updates);

    // ===================================================
    // REVOKE OTHER SESSIONS AFTER PASSWORD CHANGE
    // ===================================================

    if (passwordChanged) {
      const sessions = await ctx.db
        .query("adminSessions")
        .withIndex("by_admin", (q) => q.eq("adminId", admin._id))
        .collect();

      for (const adminSession of sessions) {
        if (adminSession._id !== session._id) {
          await ctx.db.delete(adminSession._id);
        }
      }
    }

    // ===================================================
    // GET UPDATED ADMIN
    // ===================================================

    const updatedAdmin = await ctx.db.get(admin._id);

    return {
      success: true,

      message: "Admin details updated successfully.",

      admin: {
        id: updatedAdmin._id,

        fullName: updatedAdmin.fullName,

        email: updatedAdmin.email,
      },
    };
  },
});

// =========================================================
// LOGOUT
// =========================================================

export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },

  handler: async (ctx, args) => {
    if (typeof args.sessionToken !== "string" || !args.sessionToken.trim()) {
      return {
        success: true,
      };
    }

    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) =>
        q.eq("sessionToken", args.sessionToken.trim())
      )
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
