import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import "./AdminPage.css";

/**
 * AdminPage.jsx  ← BONUS (not in original plan, but essential)
 *
 * PURPOSE:
 * This page is ONLY accessible to users with role = "ADMIN".
 * It is the admin control panel — a separate, privileged area of the app.
 *
 * WHY THIS PAGE EXISTS (and why it's separate from ProfilePage):
 * In a real app, admins need to do things regular users cannot:
 *   - View all registered users
 *   - Change user roles (promote someone to admin)
 *   - Deactivate/delete accounts
 *   - See system-level stats
 *
 * Keeping this on a separate route (/admin) means:
 *   1. Regular users who somehow reach /admin get redirected to /unauthorised
 *   2. The admin UI can be completely different from the user UI
 *   3. Backend APIs for admin actions can enforce role checks independently
 *
 * ACCESS CONTROL:
 * In App.jsx, the /admin route is wrapped with:
 *   <ProtectedRoute requiredRole="ADMIN">
 * If a USER role tries to access /admin → redirected to /unauthorised
 * If no token at all → redirected to /auth
 *
 * FLOW:
 * Admin logs in → AuthContext detects role=ADMIN → navigate("/admin")
 * OR: Admin is on /dashboard and clicks "Admin Panel" button in the nav
 *
 * CONNECTS TO:
 * - AuthContext.jsx    (reads user.role to confirm ADMIN)
 * - ProtectedRoute.jsx (enforces role guard at route level)
 * - authApi.js         (in a full app: would call /api/admin/users etc.)
 */

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Mock user data — in a real app, fetch from GET /api/admin/users
  const mockUsers = [
    { id: 1, name: "Devesh Tenguriya", email: "devesh@example.com", role: "ADMIN",  status: "Active" },
    { id: 2, name: "Priya Sharma",     email: "priya@example.com",   role: "USER",   status: "Active" },
    { id: 3, name: "Rahul Verma",      email: "rahul@example.com",   role: "USER",   status: "Active" },
    { id: 4, name: "Sneha Nair",       email: "sneha@example.com",   role: "USER",   status: "Inactive" },
  ];

  const stats = [
    { label: "Total Users",    value: mockUsers.length,                                  icon: "👥" },
    { label: "Active Users",   value: mockUsers.filter(u => u.status === "Active").length, icon: "✅" },
    { label: "Admins",         value: mockUsers.filter(u => u.role === "ADMIN").length,    icon: "🛡️" },
    { label: "Inactive Users", value: mockUsers.filter(u => u.status === "Inactive").length, icon: "⏸️" },
  ];

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">⬡</span>
          <span>AuthSystem</span>
        </div>

        <nav className="admin-nav">
          <button className="admin-nav-item active">
            <span>📊</span> Dashboard
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/dashboard")}>
            <span>👤</span> My Profile
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {user?.fullName?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="admin-sidebar-name">{user?.fullName}</p>
              <p className="admin-sidebar-role">Administrator</p>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Manage users and monitor system activity</p>
          </div>
          <span className="admin-role-badge">ADMIN</span>
        </div>

        {/* Stats row */}
        <div className="admin-stats">
          {stats.map((s) => (
            <div className="admin-stat-card" key={s.label}>
              <span className="admin-stat-icon">{s.icon}</span>
              <div>
                <p className="admin-stat-value">{s.value}</p>
                <p className="admin-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h2>Registered Users</h2>
            <span className="admin-table-count">{mockUsers.length} users</span>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id}>
                  <td className="admin-td-id">{u.id}</td>
                  <td className="admin-td-name">{u.name}</td>
                  <td className="admin-td-email">{u.email}</td>
                  <td>
                    <span className={`admin-role-tag ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-tag ${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn edit">Edit</button>
                      <button className="admin-action-btn delete">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notice about mock data */}
        <p className="admin-mock-notice">
          ⚠️ User data above is mock data for UI demonstration.
          Wire up <code>GET /api/admin/users</code> in authApi.js to load real users.
        </p>
      </main>
    </div>
  );
}