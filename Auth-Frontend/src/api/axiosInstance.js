import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAndRedirect();
        return Promise.reject(error);
      }

      try {
        // ✅ Now correctly uses BASE_URL which already includes /api
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccess = data.accessToken;
        localStorage.setItem("accessToken", newAccess);

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        clearAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/auth";
}

export default api;

//Complete Flow Diagram
 // ```
//  Every API call
//        ↓
//  Request Interceptor → adds Bearer token
//        ↓
//  Backend processes request
//        ↓
//        ├── 200 OK → Response Interceptor passes through ✅
//        │
//        └── 401 Unauthorized
//                ↓
//            Has refreshToken in localStorage?
//                ├── NO → clearAndRedirect() → /auth ❌
//                └── YES
//                        ↓
//                    POST /auth/refresh
//                        ├── FAILS → clearAndRedirect() → /auth ❌
//                        └── SUCCESS
//                                ↓
//                            Save new accessToken
//                            Retry original request ✅
//                            User sees nothing