import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { authApi } from "../api/authApi";
import "./AuthPage.css";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleTokenFromUrl } = useAuth();      // ✅ fixed — useAuth has no "login", use handleTokenFromUrl
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
        // ✅ authApi.login instead of loginUser
        console.log("Sending login:", { email: form.email, password: form.password });
        response = await authApi.login(form.email, form.password);
      } else {
        // ✅ authApi.register instead of registerUser
        response = await authApi.register({
          username: form.username,
          email: form.email,
          password: form.password,
        });
      }

      const { accessToken, refreshToken } = response.data;

      // ✅ save tokens via handleTokenFromUrl (matches your AuthContext)
      const result = await handleTokenFromUrl(accessToken, refreshToken);

      if (!result.success) {
        setError(result.error || "Authentication failed");
        return;
      }


      if (response.data.role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/profile");   // ✅ fixed — your route is /profile not /dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">⬡</span>
          <span className="auth-brand-name">AuthSystem</span>
        </div>

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
          <div className={`auth-tab-indicator ${tab === "register" ? "right" : ""}`} />
        </div>

       <form className="auth-form" onSubmit={handleSubmit}>
                 {tab === "register" && (
                   <div className="auth-field">
                     <label htmlFor="username">Username</label>  {/* ✅ was fullName */}
                     <input
                       id="username"
                       name="username"           // ✅ was fullName
                       type="text"
                       placeholder="Enter your name"      // ✅ updated placeholder
                       value={form.username}     // ✅ was form.fullName
                       onChange={handleChange}
                       required
                       autoComplete="username"   // ✅ was name
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

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <span className="auth-spinner" />
              : tab === "login" ? "Sign In" : "Create Account"
            }
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