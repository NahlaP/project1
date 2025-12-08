


// // dashboard/lib/apiAnalytics.js
// import { backendBaseUrl } from "./config";

// // Fetch site-visitor analytics for a user + template
// // GET /api/analytics/summary/:userId/:templateId
// export async function fetchTemplateVisitorSummary(userId, templateId) {
//   if (!userId || !templateId) {
//     return { totalVisitors: 0, days: [] };
//   }

//   const url = `${backendBaseUrl}/api/analytics/summary/${encodeURIComponent(
//     userId
//   )}/${encodeURIComponent(templateId)}`;

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//     credentials: "include", // send auth cookie to backend
//   });

//   let json = {};
//   try {
//     json = await res.json();
//   } catch {
//     // ignore parse errors; handle via res.ok below
//   }

//   if (!res.ok || json.ok === false) {
//     const msg = json.error || json.message || `Analytics HTTP ${res.status}`;
//     throw new Error(msg);
//   }

//   // backend can return either { data: {...} } or plain { ... }
//   const payload = json.data || json;

//   return {
//     totalVisitors: payload.totalVisitors || 0,
//     days: Array.isArray(payload.days) ? payload.days : [],
//   };
// }
















// dashboard/lib/apiAnalytics.js
import { backendBaseUrl } from "./config";

const TOKEN_KEY =
  process.env.NEXT_PUBLIC_COOKIE_NAME || "ion7dev_auth"; // same key used in login

function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Fetch site-visitor analytics for a user + template
// GET /api/analytics/summary/:userId/:templateId
export async function fetchTemplateVisitorSummary(userId, templateId) {
  if (!userId || !templateId) {
    return { totalVisitors: 0, days: [] };
  }

  const url = `${backendBaseUrl}/api/analytics/summary/${encodeURIComponent(
    userId
  )}/${encodeURIComponent(templateId)}`;

  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
  };

  // Attach Bearer token if present
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
    // ❌ DO NOT use credentials: "include"; we are not using cookies now
  });

  let json = {};
  try {
    json = await res.json();
  } catch {
    // ignore if response body is empty
  }

  if (!res.ok || json.ok === false) {
    const msg = json.error || json.message || `Analytics HTTP ${res.status}`;
    throw new Error(msg);
  }

  const payload = json.data || json;

  return {
    totalVisitors: payload.totalVisitors || 0,
    days: Array.isArray(payload.days) ? payload.days : [],
  };
}
