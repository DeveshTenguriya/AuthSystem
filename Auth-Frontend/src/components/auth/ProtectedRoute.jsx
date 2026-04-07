import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

// ─── PROTECTED ROUTE ──────────────────────────
//
// Usage:
//
//   Any authenticated user:
//   <ProtectedRoute><ProfilePage /></ProtectedRoute>
//
//   ROLE_ADMIN only:
//   <ProtectedRoute requiredRole="ROLE_ADMIN"><AdminPage /></ProtectedRoute>
//
// Access matrix:
//   ROLE_ADMIN → /admin ✅  /profile ✅
//   ROLE_USER  → /admin ❌  /profile ✅
//   No token   → both   ❌  redirected to /auth

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Still reading from localStorage on first render
  if (loading) {
    return <FullPageSpinner />;
  }

  // Not logged in → go to /auth, remember where they were going
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Role check
  // ROLE_ADMIN passes everything (no requiredRole restriction applies to them)
  if (requiredRole && role !== requiredRole && role !== "ROLE_ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function FullPageSpinner() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#f5f5f4",
    }}>
      <div style={{
        width: "22px", height: "22px",
        borderRadius: "50%",
        border: "2px solid #d6d3d1",
        borderTopColor: "#059669",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}