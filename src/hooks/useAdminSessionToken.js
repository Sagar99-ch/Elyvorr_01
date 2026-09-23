import { useState } from "react";

const STORAGE_KEY = "elyvorr_admin_session";

export function useAdminSessionToken() {
  const [sessionToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to read admin session:", error);
      return null;
    }
  });

  return sessionToken;
}
