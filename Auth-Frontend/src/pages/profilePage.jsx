import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const pts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/auth");
    } catch {
      navigate("/auth");
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === "ROLE_ADMIN") return "#ff6b35";
    if (role === "ROLE_USER") return "#00f5ff";
    return "#a855f7";
  };

  const getRoleLabel = (role) => {
    if (role === "ROLE_ADMIN") return "Administrator";
    if (role === "ROLE_USER") return "Standard User";
    return role || "Unknown";
  };

  const getPermissions = () => {
    if (!user?.authorities) return [];
    return user.authorities.filter(a => !a.startsWith("ROLE_"));
  };

  const getInitials = () => {
    const name = user?.username || user?.email || "U";
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const permissions = getPermissions();

  return (
    <div className="profile-root">
      {/* Animated background */}
      <div className="profile-bg">
        <div className="profile-grid-overlay" />
        <div className="profile-orb orb1" />
        <div className="profile-orb orb2" />
        <div className="profile-orb orb3" />
        {particles.map(p => (
          <div key={p.id} className="profile-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }} />
        ))}
      </div>

      {/* Top navigation bar */}
      <nav className="profile-nav">
        <div className="profile-nav-brand">
          <span className="profile-nav-logo">⬡</span>
          <span>AuthSystem</span>
        </div>
        <div className="profile-nav-actions">
          {isAdmin && (
            <button className="profile-nav-btn admin-btn" onClick={() => navigate("/admin")}>
              <span>⚡</span> Admin Panel
            </button>
          )}
          <button
            className="profile-nav-btn logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <><span className="btn-spinner" /> Signing out...</>
            ) : (
              <><span>→</span> Sign Out</>
            )}
          </button>
        </div>
      </nav>

      <div className="profile-content">
        {/* Hero card */}
        <div className="profile-hero">
          <div className="profile-avatar-ring">
            <div className="profile-avatar">
              <span>{getInitials()}</span>
            </div>
            <div className="profile-avatar-status" />
          </div>

          <div className="profile-hero-info">
            <div className="profile-hero-name">
              {user?.username || "User"}
            </div>
            <div className="profile-hero-email">{user?.email}</div>
            <div className="profile-role-badge" style={{
              borderColor: getRoleBadgeColor(user?.role),
              color: getRoleBadgeColor(user?.role),
              boxShadow: `0 0 12px ${getRoleBadgeColor(user?.role)}40`
            }}>
              <span className="role-dot" style={{ background: getRoleBadgeColor(user?.role) }} />
              {getRoleLabel(user?.role)}
            </div>
          </div>

          <div className="profile-hero-stats">
            <div className="stat-item">
              <div className="stat-value">{permissions.length}</div>
              <div className="stat-label">Permissions</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">Active</div>
              <div className="stat-label">Status</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-value">JWT</div>
              <div className="stat-label">Auth Type</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {["overview", "security", "permissions"].map(tab => (
            <button
              key={tab}
              className={`profile-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "👤"} {tab === "security" && "🔐"} {tab === "permissions" && "🛡️"}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="profile-tab-content">

          {activeTab === "overview" && (
            <div className="profile-cards-grid">
              <div className="profile-card">
                <div className="card-header">
                  <span className="card-icon">👤</span>
                  <span>Account Info</span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Username</span>
                    <span className="info-value">{user?.username || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role</span>
                    <span className="info-value" style={{ color: getRoleBadgeColor(user?.role) }}>
                      {getRoleLabel(user?.role)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{formatDate()}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <div className="card-header">
                  <span className="card-icon">📊</span>
                  <span>Session Info</span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Auth Method</span>
                    <span className="info-value highlight">JWT Bearer Token</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Token Expiry</span>
                    <span className="info-value">15 minutes</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Refresh Token</span>
                    <span className="info-value">7 days</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Status</span>
                    <span className="info-value status-active">● Active</span>
                  </div>
                </div>
              </div>

              <div className="profile-card quick-actions-card">
                <div className="card-header">
                  <span className="card-icon">⚡</span>
                  <span>Quick Actions</span>
                </div>
                <div className="card-body actions-grid">
                  {isAdmin && (
                    <button className="action-btn admin-action" onClick={() => navigate("/admin")}>
                      <span>🛠️</span>
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button className="action-btn" onClick={() => setActiveTab("security")}>
                    <span>🔐</span>
                    <span>Security</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab("permissions")}>
                    <span>🛡️</span>
                    <span>Permissions</span>
                  </button>
                  <button className="action-btn logout-action" onClick={handleLogout}>
                    <span>→</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="profile-cards-grid">
              <div className="profile-card full-width">
                <div className="card-header">
                  <span className="card-icon">🔐</span>
                  <span>Security Overview</span>
                </div>
                <div className="card-body">
                  <div className="security-item">
                    <div className="security-icon good">✓</div>
                    <div className="security-info">
                      <div className="security-title">Password Authentication</div>
                      <div className="security-desc">Your password is securely hashed with BCrypt</div>
                    </div>
                    <div className="security-status good">Secure</div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon good">✓</div>
                    <div className="security-info">
                      <div className="security-title">JWT Token Auth</div>
                      <div className="security-desc">Stateless authentication with signed tokens</div>
                    </div>
                    <div className="security-status good">Active</div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon good">✓</div>
                    <div className="security-info">
                      <div className="security-title">Refresh Token Rotation</div>
                      <div className="security-desc">Tokens are rotated on every refresh for security</div>
                    </div>
                    <div className="security-status good">Enabled</div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon warn">!</div>
                    <div className="security-info">
                      <div className="security-title">Two-Factor Authentication</div>
                      <div className="security-desc">Add an extra layer of security (Phase 5)</div>
                    </div>
                    <div className="security-status warn">Coming Soon</div>
                  </div>
                  <div className="security-item">
                    <div className="security-icon warn">!</div>
                    <div className="security-info">
                      <div className="security-title">Email Verification</div>
                      <div className="security-desc">Verify your email address (Phase 5)</div>
                    </div>
                    <div className="security-status warn">Coming Soon</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="profile-cards-grid">
              <div className="profile-card full-width">
                <div className="card-header">
                  <span className="card-icon">🛡️</span>
                  <span>Your Permissions</span>
                  <span className="card-badge">{permissions.length} total</span>
                </div>
                <div className="card-body">
                  {permissions.length > 0 ? (
                    <div className="permissions-grid">
                      {permissions.map((perm, i) => (
                        <div key={i} className="permission-chip">
                          <span className="perm-dot" />
                          {perm}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-permissions">
                      <span>🔒</span>
                      <p>No granular permissions assigned yet.</p>
                      <p className="empty-sub">Permissions will appear here after Phase 4 setup.</p>
                    </div>
                  )}

                  <div className="role-permissions-info">
                    <div className="rp-title">Role Access Level</div>
                    <div className="rp-row">
                      <span className="rp-role" style={{ color: getRoleBadgeColor(user?.role) }}>
                        {getRoleLabel(user?.role)}
                      </span>
                      <span className="rp-desc">
                        {user?.role === "ROLE_ADMIN"
                          ? "Full system access — can manage users, view all data, and perform admin operations"
                          : "Standard access — can view profile and access user-level resources"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}