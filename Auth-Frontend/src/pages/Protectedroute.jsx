import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

/**
 * ProtectedRoute.jsx
 *
 * Guards routes based on:
 * 1. Authentication — is the user logged in?
 * 2. Role — does the user have the required role?
 *
 * Usage:
 * <ProtectedRoute>                          → any logged in user
 * <ProtectedRoute requiredRole="ROLE_ADMIN"> → admin only
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role, loading } = useAuth();

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0f",
        color: "#00f5ff",
        fontSize: "1.2rem",
        fontFamily: "'Space Mono', monospace",
        gap: "12px"
      }}>
        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⬡</span>
        <span>Verifying session...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but wrong role → redirect to unauthorized
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}