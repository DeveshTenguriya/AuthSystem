import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/authApi";
import {
  decodeToken,
  isTokenExpired,
  getUserFromToken,
} from "../utils/tokenUtils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);   // checking storage / URL on mount
  const [validating, setValidating] = useState(false);  // validating token from URL

  // ── ON MOUNT: restore session from localStorage ─────────────────────────────
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken && !isTokenExpired(accessToken)) {
      const userData = getUserFromToken(accessToken);
      const stored   = JSON.parse(localStorage.getItem("user") || "{}");
      setUser({ ...userData, ...stored });
    } else if (accessToken) {
      // Token exists but expired — clear it
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  // ── HANDLE TOKEN FROM URL ────────────────────────────────────────────────────
  // Call this from the /auth page when ?accessToken=xxx&refreshToken=xxx is in URL
  // Flow: extract → validate with backend → store → redirect to /profile
  const handleTokenFromUrl = useCallback(async (accessToken, refreshToken) => {
    setValidating(true);

    try {
      // Step 1 — Quick client-side check first (expired?)
      if (isTokenExpired(accessToken)) {
        throw new Error("Token is expired");
      }

      // Step 2 — Validate with backend (sends token, expects 200)
      // If your backend doesn't have /api/auth/me yet,
      // comment out this block and skip straight to Step 3
      try {
        await authApi.validateToken(accessToken);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          throw new Error("Token rejected by server");
        }
        // If endpoint doesn't exist (404) — skip validation, trust client decode
        if (err.response?.status !== 404) throw err;
      }

      // Step 3 — Store tokens
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Step 4 — Build user from token
      const userData = getUserFromToken(accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message || "Invalid token" };
    } finally {
      setValidating(false);
    }
  }, []);

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        // POST /api/auth/logout → { message: "Logged out successfully" }
        await authApi.logout(refreshToken);
      }
    } catch (_) {
      // Clear locally even if API call fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;
  const role            = user?.role || null;

  // Role helpers — matches your Spring ROLE_ADMIN / ROLE_USER
  const isAdmin = role === "ROLE_ADMIN";
  const isUser  = role === "ROLE_USER";

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      validating,
      isAuthenticated,
      role,
      isAdmin,
      isUser,
      handleTokenFromUrl,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;


}