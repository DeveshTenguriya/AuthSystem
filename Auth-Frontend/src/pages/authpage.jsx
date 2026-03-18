import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { loginUser, registerUser } from "../api/authApi";
import "./AuthPage.css";

/**
 * AuthPage.jsx
 *
 * PURPOSE:
 * This is the ENTRY POINT of the entire app. It handles two things:
 *   1. LOGIN  — existing user submits email + password → gets JWT tokens → goes to /dashboard
 *   2. REGISTER — new user submits name + email + password → account created → auto-login
 *
 * It replaces BOTH LoginPage.jsx and RegisterPage.jsx from the original plan.
 * Instead of two separate routes, login and register are tabs on one page.
 * This is a common modern pattern (used by Notion, Linear, Vercel, etc.)
 *
 * FLOW:
 * User lands here → picks Login or Register tab → submits form
 * → calls Spring Boot /api/auth/login or /api/auth/register
 * → on success: saves tokens via AuthContext → redirects to /dashboard
 * → on error: shows inline error message
 *
 * CONNECTS TO:
 * - authApi.js         (makes the actual HTTP calls)
 * - AuthContext.jsx    (saves the token + user state globally)
 * - ProtectedRoute.jsx (this page is the destination after logout)
 */

export default function AuthPage() {
  const [tab, setTab] = useState("login");         // "login" | "register"
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;

      if (tab === "login") {
        // POST /api/auth/login  →  { accessToken, refreshToken, role, email, fullName }
        response = await loginUser({ email: form.email, password: form.password });
      } else {
        // POST /api/auth/register  →  same shape as login response
        response = await registerUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        });
      }

      // Save tokens + user info into context (and localStorage via tokenUtils)
      login(response.data);

      // Role-based redirect: admins go to /admin, everyone else to /dashboard
      if (response.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Animated background grid */}
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      <div className="auth-card">
        {/* Brand mark */}
        <div className="auth-brand">
          <span className="auth-logo">⬡</span>
          <span className="auth-brand-name">AuthSystem</span>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Register
          </button>
          {/* Sliding indicator */}
          <div className={`auth-tab-indicator ${tab === "register" ? "right" : ""}`} />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full name — only shown on register tab */}
          {tab === "register" && (
            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Devesh Tenguriya"
                value={form.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
          </div>

          {/* Inline error */}
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="auth-switch-btn"
            onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
          >
            {tab === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}