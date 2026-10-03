import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import ProtectedRoute   from "./pages/ProtectedRoute";

import AuthPage          from "./pages/authPage";
import ProfilePage       from "./pages/profilePage";
import AdminPage         from "./pages/admin";
import UnauthorizedPage  from "./pages/unauthorisedPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── PUBLIC ───────────────────────────────────────────────────────
              /auth → landing page
                    → reads ?accessToken=xxx&refreshToken=xxx from URL
                    → OR shows manual paste form
          */}
          <Route path="/auth" element={<AuthPage />} />

          {/* ── PROTECTED: ROLE_USER + ROLE_ADMIN ────────────────────────── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ── PROTECTED: ROLE_ADMIN only ────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* ── UNAUTHORIZED ─────────────────────────────────────────────── */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── REDIRECTS ────────────────────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/auth"    replace />} />
          <Route path="*"  element={<Navigate to="/auth"    replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
