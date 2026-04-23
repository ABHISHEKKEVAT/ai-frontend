const LOCAL_BACKEND = "http://127.0.0.1:5000";
const RENDER_BACKEND = "https://ai-backend-1-7kxh.onrender.com";
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalhost ? LOCAL_BACKEND : RENDER_BACKEND;
export const API = `${API_BASE}/api`;
