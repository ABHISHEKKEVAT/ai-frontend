const LOCAL_BACKEND = "http://127.0.0.1:5000";
const LIVE_BACKEND = "https://ai-backend-1-7kxh.onrender.com";

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export const API_BASE = isLocalHost(window.location.hostname) ? LOCAL_BACKEND : LIVE_BACKEND;
export const API = `${API_BASE}/api`;
