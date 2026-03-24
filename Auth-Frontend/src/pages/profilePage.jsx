import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import "./ProfilePage.css";

/**
 * ProfilePage.jsx  (= DashboardPage.jsx from the original plan)
 *
 * PURPOSE:
 * This is the MAIN LANDING PAGE after a successful login for regular users (role = USER).
 * It shows the logged-in user's information and gives them a home base inside the app.
 *
 * Think of this as the "dashboard" — the first thing a user sees after signing in.
 * In a bigger app, you'd add feature cards, stats, recent activity, etc. here.
 * Right now it shows: welcome message, user details, role badge, and logout button.
 *
 * WHY IT'S CALLED ProfilePage AND NOT DashboardPage:
 * Because the data it currently shows is all about the user's own profile (name, email, role).
 * As the app grows, you'd split this into a DashboardPage (stats/widgets) and ProfilePage
 * (edit name, change password, etc.). For an MVP auth system, one page is enough.
 *
 * FLOW:
 * Login success → AuthContext saves user → navigate("/dashboard") → this page renders
 * User clicks Logout → AuthContext clears tokens → navigate("/auth")
 *
 * ACCESS CONTROL:
 * Wrapped in <ProtectedRoute> in App.jsx — if no token, user is redirected to /auth
 * automatically before this page even renders.
 *
 * CONNECTS TO:
 * - AuthContext.jsx    (reads user info: fullName, email, role)
 * - tokenUtils.js      (logout clears localStorage)
 * - ProtectedRoute.jsx (guards this route)
 */

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Pull initials for the avatar
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div className="profile-root">
      {/* Subtle background texture */}
      <div className="profile-bg">
        <div className="profile-bg-circle c1" />
        <div className="profile-bg-circle c2" />
      </div>

      {/* Top navigation bar */}
      <header className="profile-nav">
        <div className="profile-nav-brand">
          <span className="profile-nav-logo">⬡</span>
          <span>AuthSystem</span>
        </div>
        <div className="profile-nav-right">
          {user?.role === "ADMIN" && (
            <button className="profile-nav-btn" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}
          <button className="profile-nav-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="profile-main">
        {/* Welcome banner */}
        <div className="profile-welcome">
          <p className="profile-welcome-sub">Welcome back,</p>
          <h1 className="profile-welcome-name">{user?.fullName || "User"}</h1>
        </div>

        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-card-header">
            {/* Avatar with initials */}
            <div className="profile-avatar">{initials}</div>
            <div className="profile-card-info">
              <h2 className="profile-card-name">{user?.fullName}</h2>
              <p className="profile-card-email">{user?.email}</p>
            </div>
            {/* Role badge */}
            <span className={`profile-badge ${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </div>

          <div className="profile-divider" />

          {/* Details grid */}
          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Full Name</span>
              <span className="profile-detail-value">{user?.fullName}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Email Address</span>
              <span className="profile-detail-value">{user?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Account Role</span>
              <span className="profile-detail-value">{user?.role}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Status</span>
              <span className="profile-detail-value status-active">● Active</span>
            </div>
          </div>
        </div>

        {/* Action cards row */}
        <div className="profile-actions">
          <div className="profile-action-card">
            <span className="profile-action-icon">🔐</span>
            <h3>Secure Session</h3>
            <p>Your session is protected with JWT tokens and auto-refreshes silently.</p>
          </div>
          <div className="profile-action-card">
            <span className="profile-action-icon">🛡️</span>
            <h3>Role-Based Access</h3>
            <p>Access to pages and features is controlled by your account role.</p>
          </div>
          <div className="profile-action-card">
            <span className="profile-action-icon">⚡</span>
            <h3>Spring Boot API</h3>
            <p>Powered by a Spring Security backend with refresh token rotation.</p>
          </div>
        </div>
      </main>
    </div>
  );


}