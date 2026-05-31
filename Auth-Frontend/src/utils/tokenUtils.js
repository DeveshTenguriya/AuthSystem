// ─── DECODE JWT PAYLOAD ───────────────────────────────────────────────────────
// Reads the payload without any library — server still verifies signature
export function decodeToken(token) {
  try {
    const base64  = token.split(".")[1];
    const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ─── CHECK EXPIRY ─────────────────────────────────────────────────────────────
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ─── EXTRACT ROLE ─────────────────────────────────────────────────────────────
// Your Spring Boot puts roles as:
//   { "roles": ["ROLE_ADMIN"] }  or  { "authorities": ["ROLE_ADMIN"] }
// This handles both shapes and returns the first role string
export function getRoleFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  //Your Spring Boot puts everything in "authorities"
    const authorities = decoded.authorities || decoded.roles || [];
    const list = Array.isArray(authorities) ? authorities : [authorities];

    // ✅ Prioritize ROLE_ADMIN over ROLE_USER
      if (list.includes("ROLE_ADMIN") || list.includes("ADMIN")) return "ROLE_ADMIN";
      if (list.includes("ROLE_USER") || list.includes("USER")) return "ROLE_USER";

    // ✅ Find the entry that starts with ROLE_ (ignores permissions like READ_PROFILE)
      const role = list.find(a => a.startsWith("ROLE_"));
      return role || null;

//  // Try all common Spring Boot role field names
//  const roles =
//    decoded.roles        ||
//    decoded.authorities  ||
//    decoded.role         ||
//    [];
//
//  // Handle both array and string
//  const raw = Array.isArray(roles) ? roles[0] : roles;
//  return raw || null;
}

// ─── ROLE CHECKS ─────────────────────────────────────────────────────────────
// Usage: isAdmin(token) → true / false
export function isAdmin(token) {
  return getRoleFromToken(token) === "ROLE_ADMIN";
}

export function isUser(token) {
  return getRoleFromToken(token) === "ROLE_USER";
}

// ─── EXTRACT USER INFO FROM TOKEN ────────────────────────────────────────────
// Builds a user object from the JWT payload
export function getUserFromToken(token) {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
     email:       decoded.sub || decoded.email || null,
        username:    decoded.sub || null,           // ✅spring puts
        role:        getRoleFromToken(token),        // ✅ ROLE_ADMIN or ROLE_USER
        authorities: decoded.authorities || [],     // ✅ all permissions
        exp:         decoded.exp || null,
  };
}