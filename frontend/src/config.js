// Frontend configuration
const config = {
  // ✅ Backend URL priority:
  // 1. VITE_BACKEND_URL (frontend env var in Render)
  // 2. VITE_API_URL (alternate env var name)
  // 3. Render backend deployment URL (production)
  // 4. Localhost (for local dev)
  backendUrl: (() => {
    const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;

    // ✅ Default Render backend URL
    return "https://herbal-garden-backend.onrender.com";
  })(),

  // ✅ API endpoints
  api: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      me: "/api/users/profile",
      google: "/api/auth/google",
      googleCallback: "/api/auth/google/callback",
    },
    plants: "/api/plants",
    notes: "/api/notes",
    quizzes: "/api/quizzes",
    models: "/api/models",
    images: "/api/images",
  },

  // ✅ Cookie settings
  cookieOptions: {
    path: "/",
    secure: import.meta.env.PROD, // only HTTPS in production
    sameSite: import.meta.env.DEV ? "lax" : "none", // stricter in prod
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// ✅ Log config in dev mode (for debugging)
if (import.meta.env.DEV) {
  console.log("🔧 Current configuration:", {
    mode: import.meta.env.MODE,
    backendUrl: config.backendUrl,
    api: config.api,
  });
}

export default config;
