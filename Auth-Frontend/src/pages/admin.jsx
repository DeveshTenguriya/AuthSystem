import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import api from "../api/axiosInstance";
import "./AdminPage.css";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } catch (_) {}
    navigate("/auth");
  };

  const testEndpoint = async (key, method, url, label) => {
    setTesting(t => ({ ...t, [key]: true }));
    try {
      const res = method === "GET"
        ? await api.get(url)
        : await api.post(url);
      setTestResults(r => ({ ...r, [key]: { success: true, data: JSON.stringify(res.data), label } }));
    } catch (err) {
      setTestResults(r => ({
        ...r,
        [key]: { success: false, data: err.response?.data?.message || err.message, label }
      }));
    } finally {
      setTesting(t => ({ ...t, [key]: false }));
    }
  };

  const stats = [
    { icon: "👥", label: "Total Users", value: "—", color: "#00f5ff" },
    { icon: "🛡️", label: "Active Roles", value: "2", color: "#a855f7" },
    { icon: "🔑", label: "Permissions", value: "4", color: "#ff6b35" },
    { icon: "🔐", label: "Auth Type", value: "JWT", color: "#00ff88" },
  ];

  const endpoints = [
    { key: "profile", method: "GET", url: "/users/profile", label: "GET /users/profile", perm: "READ_PROFILE", color: "#00f5ff" },
    { key: "create", method: "POST", url: "/users", label: "POST /users", perm: "CREATE_USER", color: "#00ff88" },
    { key: "delete", method: "DELETE", url: "/users/1", label: "DELETE /users/1", perm: "DELETE_USER", color: "#ef4444" },
    { key: "me", method: "GET", url: "/auth/me", label: "GET /auth/me", perm: "Authenticated", color: "#a855f7" },
  ];

  return (
    <div className="admin-root">
      {/* Background */}
      <div className="admin-bg">
        <div className="admin-grid-overlay" />
        <div className="admin-orb orb1" />
        <div className="admin-orb orb2" />
        <div className="admin-scanline" />
      </div>

      {/* Nav */}
      <nav className="admin-nav">
        <div className="admin-nav-left">
          <span className="admin-nav-logo">⬡</span>
          <span className="admin-nav-title">AuthSystem</span>
          <span className="admin-nav-badge">ADMIN</span>
        </div>
        <div className="admin-nav-right">
          <button className="admin-nav-btn user-btn" onClick={() => navigate("/profile")}>
            <span>👤</span> Profile
          </button>
          <button
            className="admin-nav-btn logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? <><span className="admin-spinner" /> Signing out...</> : <><span>→</span> Sign Out</>}
          </button>
        </div>
      </nav>

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-text">
            <div className="admin-greeting">
              Welcome back, <span className="admin-name">{user?.username || "Admin"}</span>
            </div>
            <div className="admin-subtitle">System Administration Dashboard</div>
          </div>
          <div className="admin-header-tag">
            <span className="tag-dot" />
            System Online
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="admin-stat-card" style={{ '--accent': s.color }}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-glow" style={{ background: s.color }} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "endpoints", label: "🔌 API Tester" },
            { id: "roles", label: "🛡️ Roles" },
            { id: "system", label: "⚙️ System" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-tab-content">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="admin-grid-2">
              <div className="admin-card">
                <div className="admin-card-header">
                  <span>👤</span> Admin Profile
                </div>
                <div className="admin-card-body">
                  {[
                    ["Username", user?.username],
                    ["Email", user?.email],
                    ["Role", user?.role],
                    ["Access Level", "Full System Access"],
                    ["Session", "Active"],
                  ].map(([label, value]) => (
                    <div key={label} className="admin-info-row">
                      <span className="admin-info-label">{label}</span>
                      <span className="admin-info-value">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <span>🔐</span> Auth System Status
                </div>
                <div className="admin-card-body">
                  {[
                    ["JWT Authentication", "✅ Active"],
                    ["Refresh Tokens", "✅ Rotating"],
                    ["BCrypt Password Hash", "✅ Enabled"],
                    ["Role-Based Access", "✅ Enforced"],
                    ["Method Security", "✅ @PreAuthorize"],
                    ["CORS Policy", "✅ Configured"],
                  ].map(([label, value]) => (
                    <div key={label} className="admin-info-row">
                      <span className="admin-info-label">{label}</span>
                      <span className="admin-info-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card admin-full-width">
                <div className="admin-card-header">
                  <span>⚡</span> Quick Actions
                </div>
                <div className="admin-card-body">
                  <div className="admin-actions-grid">
                    <button className="admin-action-btn" onClick={() => setActiveTab("endpoints")}>
                      <span>🔌</span>
                      <span>Test API Endpoints</span>
                    </button>
                    <button className="admin-action-btn" onClick={() => setActiveTab("roles")}>
                      <span>🛡️</span>
                      <span>View Roles</span>
                    </button>
                    <button className="admin-action-btn" onClick={() => navigate("/profile")}>
                      <span>👤</span>
                      <span>My Profile</span>
                    </button>
                    <button className="admin-action-btn danger" onClick={handleLogout}>
                      <span>→</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API TESTER TAB */}
          {activeTab === "endpoints" && (
            <div className="admin-endpoints">
              <div className="admin-card admin-full-width">
                <div className="admin-card-header">
                  <span>🔌</span> Live API Endpoint Tester
                  <span className="admin-card-sub">Click to test endpoints with your current token</span>
                </div>
                <div className="admin-card-body">
                  {endpoints.map(ep => (
                    <div key={ep.key} className="endpoint-row">
                      <div className="endpoint-info">
                        <span className={`endpoint-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                        <span className="endpoint-url">{ep.label}</span>
                        <span className="endpoint-perm">{ep.perm}</span>
                      </div>
                      <button
                        className="endpoint-test-btn"
                        style={{ borderColor: ep.color, color: ep.color }}
                        onClick={() => testEndpoint(ep.key, ep.method, ep.url, ep.label)}
                        disabled={testing[ep.key]}
                      >
                        {testing[ep.key] ? "Testing..." : "▶ Test"}
                      </button>
                      {testResults[ep.key] && (
                        <div className={`endpoint-result ${testResults[ep.key].success ? "success" : "error"}`}>
                          <span>{testResults[ep.key].success ? "✅" : "❌"}</span>
                          <span>{testResults[ep.key].data}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ROLES TAB */}
          {activeTab === "roles" && (
            <div className="admin-grid-2">
              {[
                {
                  name: "ROLE_ADMIN",
                  color: "#ff6b35",
                  desc: "Full system administrator access",
                  permissions: ["CREATE_USER", "DELETE_USER", "READ_USERS", "READ_PROFILE"],
                },
                {
                  name: "ROLE_USER",
                  color: "#00f5ff",
                  desc: "Standard user access",
                  permissions: ["READ_PROFILE"],
                },
              ].map(role => (
                <div key={role.name} className="admin-card">
                  <div className="admin-card-header">
                    <span>🛡️</span>
                    <span style={{ color: role.color }}>{role.name}</span>
                  </div>
                  <div className="admin-card-body">
                    <p className="role-desc">{role.desc}</p>
                    <div className="role-perms-title">Permissions:</div>
                    <div className="role-perms-grid">
                      {role.permissions.map(p => (
                        <div key={p} className="role-perm-chip" style={{ borderColor: role.color + "40", color: role.color }}>
                          <span className="perm-dot" style={{ background: role.color }} />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === "system" && (
            <div className="admin-grid-2">
              <div className="admin-card">
                <div className="admin-card-header"><span>🔧</span> Backend</div>
                <div className="admin-card-body">
                  {[
                    ["Framework", "Spring Boot 3"],
                    ["Security", "Spring Security 6"],
                    ["JWT Library", "jjwt"],
                    ["Database", "PostgreSQL / MySQL"],
                    ["ORM", "Hibernate / JPA"],
                    ["Port", "8080"],
                  ].map(([k, v]) => (
                    <div key={k} className="admin-info-row">
                      <span className="admin-info-label">{k}</span>
                      <span className="admin-info-value">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <div className="admin-card-header"><span>⚛️</span> Frontend</div>
                <div className="admin-card-body">
                  {[
                    ["Framework", "React 18"],
                    ["Build Tool", "Vite"],
                    ["HTTP Client", "Axios"],
                    ["Routing", "React Router v6"],
                    ["State", "Context API"],
                    ["Port", "3000"],
                  ].map(([k, v]) => (
                    <div key={k} className="admin-info-row">
                      <span className="admin-info-label">{k}</span>
                      <span className="admin-info-value">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card admin-full-width">
                <div className="admin-card-header"><span>🗺️</span> Upcoming Phases</div>
                <div className="admin-card-body">
                  {[
                    { phase: "Phase 4", title: "Permission System", desc: "User → Role → Permission (RBAC)", status: "Next" },
                    { phase: "Phase 5", title: "Account Security", desc: "Account locking, login attempts, email verification", status: "Planned" },
                    { phase: "Phase 6", title: "Redis Blacklist", desc: "Token blacklisting for instant logout", status: "Planned" },
                  ].map(p => (
                    <div key={p.phase} className="phase-row">
                      <div className="phase-badge">{p.phase}</div>
                      <div className="phase-info">
                        <div className="phase-title">{p.title}</div>
                        <div className="phase-desc">{p.desc}</div>
                      </div>
                      <div className={`phase-status ${p.status.toLowerCase()}`}>{p.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          )}

        </div>
      </div>
    </div>
  );
}