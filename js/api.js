const LOCAL_BACKEND = "http://127.0.0.1:5000";
const LIVE_BACKEND = "https://ai-backend-1-7kxh.onrender.com";
const API_OVERRIDE_KEY = "apiBaseOverride";

function normalizeBaseUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiBase() {
  const params = new URLSearchParams(window.location.search);
  const queryOverride = normalizeBaseUrl(params.get("api"));
  if (queryOverride) {
    localStorage.setItem(API_OVERRIDE_KEY, queryOverride);
    return queryOverride;
  }

  const savedOverride = normalizeBaseUrl(localStorage.getItem(API_OVERRIDE_KEY));
  if (savedOverride) return savedOverride;

  return isLocalHost(window.location.hostname) ? LOCAL_BACKEND : LIVE_BACKEND;
}

export function setApiBaseOverride(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) return false;
  localStorage.setItem(API_OVERRIDE_KEY, normalized);
  return true;
}

export function clearApiBaseOverride() {
  localStorage.removeItem(API_OVERRIDE_KEY);
}

export const API_BASE = resolveApiBase();
export const API = `${API_BASE}/api`;
