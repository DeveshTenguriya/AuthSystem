import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import "./UnauthorisedPage.css";

/**
 * UnauthorisedPage.jsx  ← BONUS (not in original plan, but necessary)
 *
 * PURPOSE:

 *
 * CRITICAL DISTINCTION — TWO DIFFERENT ACCESS FAILURES:
 *
 *   1. NOT LOGGED IN at all → redirect to /auth (login page)
 *      Handled by: ProtectedRoute when token is missing/expired
 *
 *   2. LOGGED IN but WRONG ROLE → show this UnauthorisedPage (/unauthorised)
 *      Handled by: ProtectedRoute when role doesn't match requiredRole
 *      Example: A USER role trying to visit /admin
 *
 * WHY NOT JUST REDIRECT TO /auth?
 * Because the user IS authenticated — they have a valid token.
 * Sending them to login would be confusing ("I'm already logged in!").
 * Instead, show a clear message: "You're logged in but you can't access this."
 *
 * EXAMPLE SCENARIO:
 * 1. Devesh (role=USER) is logged in and somehow navigates to /admin
 * 2. ProtectedRoute checks: token ✅, role=USER ❌ (needs ADMIN)
 * 3. ProtectedRoute redirects to /unauthorised
 * 4. This page renders: "Access Denied — you don't have permission"
 * 5. User clicks "Go to Dashboard" → back to their allowed area
 *
 * CONNECTS TO:
 * - ProtectedRoute.jsx  (the guard that redirects here)
 * - AuthContext.jsx      (reads role to show context-specific message)
 * - App.jsx             (registered as route /unauthorised)
 */

export default function UnauthorisedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Send them to the right place based on their actual role
    if (user?.role === "ADMIN") {
      navigate("/admin");
    } else if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="unauth-root">
      <div className="unauth-bg">
        <div className="unauth-blob b1" />
        <div className="unauth-blob b2" />
      </div>

      <div className="unauth-card">
        {/* Big error visual */}
        <div className="unauth-icon-wrap">
          <div className="unauth-shield">🛡️</div>
          <div className="unauth-cross">✕</div>
        </div>

        <div className="unauth-code">403</div>
        <h1 className="unauth-title">Access Denied</h1>
        <p className="unauth-message">
          {user
            ? <>
                You're signed in as <strong>{user.fullName}</strong> ({user.role}),
                but this page requires a higher permission level.
              </>
            : "You don't have permission to view this page."}
        </p>

        {/* Contextual actions */}
        <div className="unauth-actions">
          <button className="unauth-btn primary" onClick={handleGoBack}>
            ← Go to {user?.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
          </button>
          {user && (
            <button
              className="unauth-btn secondary"
              onClick={() => { logout(); navigate("/auth"); }}
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Explanation block */}
        <div className="unauth-info">
          <p className="unauth-info-title">Why am I seeing this?</p>
          <p className="unauth-info-body">
            Some pages are restricted to specific roles (e.g., Admin only).
            Your current role — <code>{user?.role || "UNKNOWN"}</code> — does not
            have access to the page you tried to visit.
            Contact your administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    </div>
  );
}