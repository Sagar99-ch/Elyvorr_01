/**
 * =========================================================
 * ELYVORR — ADMIN AUTHORIZATION
 * =========================================================
 *
 * Server-side admin session verification.
 *
 * IMPORTANT:
 * Never trust admin authentication from the frontend.
 * Every protected Convex function must verify the session
 * token using this helper.
 *
 * =========================================================
 */

export async function requireAdmin(ctx, sessionToken) {
  // =======================================================
  // BASIC VALIDATION
  // =======================================================

  if (
    !sessionToken ||
    typeof sessionToken !== "string" ||
    sessionToken.trim().length === 0
  ) {
    throw new Error("Unauthorized: Admin session required.");
  }

  const token = sessionToken.trim();

  // Prevent absurdly large input from reaching the database.
  if (token.length > 512) {
    throw new Error("Unauthorized: Invalid admin session.");
  }

  // =======================================================
  // FIND SESSION
  // =======================================================

  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("sessionToken", token))
    .unique();

  if (!session) {
    throw new Error("Unauthorized: Invalid admin session.");
  }

  // =======================================================
  // SESSION EXPIRATION
  // =======================================================

  if (!Number.isFinite(session.expiresAt) || Date.now() >= session.expiresAt) {
    // Delete expired session so it cannot be reused.
    await ctx.db.delete(session._id);

    throw new Error("Unauthorized: Admin session has expired.");
  }

  // =======================================================
  // LOAD ADMIN USER
  // =======================================================

  const admin = await ctx.db.get(session.adminId);

  if (!admin) {
    // Session points to a deleted admin.
    await ctx.db.delete(session._id);

    throw new Error("Unauthorized: Admin account not found.");
  }

  // =======================================================
  // ACTIVE CHECK
  // =======================================================

  if (!admin.isActive) {
    throw new Error("Unauthorized: Admin account is disabled.");
  }

  // =======================================================
  // RETURN ADMIN
  // =======================================================

  return admin;
}
