import api from "./axiosInstance";

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────
// These match your Spring Boot Phase 2 + 3 endpoints exactly

export const authApi = {
  // POST /api/v1/auth/login
  // Body: { email, password }
  // Returns: { accessToken, refreshToken, role, ... }
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  // POST /api/v1/auth/register
  // Body: { fullName, email, password, phone?, role? }
  // Returns: { accessToken, refreshToken, ... }
  register: (payload) =>
    api.post("/auth/register", payload),

  // POST /api/v1/auth/refresh
  // Body: { refreshToken }
  // Returns: { accessToken, refreshToken (rotated) }
  refresh: (refreshToken) =>
    api.post("/auth/refresh", { refreshToken }),

  // POST /api/v1/auth/logout
  // Header: Authorization: Bearer <token>
  logout: (refreshToken) =>
      api.post("/auth/logout", { refreshToken }),


  // GET /api/v1/auth/me  (optional — if you have this endpoint)
  // Returns current user profile from token
  me: () =>
    api.get("/auth/me"),

    validateToken: (token) =>
      api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      }),

      
};