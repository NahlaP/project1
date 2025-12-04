// // dashboard/lib/apiAnalytics.js
// import { backendBaseUrl } from "./config";

// // Fetch site-visitor analytics for a user + template
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
//     credentials: "include", // browser sends auth cookie
//   });

//   let json = {};
//   try {
//     json = await res.json();
//   } catch {
//     // ignore parse errors, we'll throw below if needed
//   }

//   if (!res.ok || json.ok === false) {
//     const msg =
//       json.error || json.message || `Analytics HTTP ${res.status}`;
//     throw new Error(msg);
//   }

//   // Support both { data: { ... } } and plain { ... }
//   const payload = json.data || json;

//   return {
//     totalVisitors: payload.totalVisitors || 0,
//     days: Array.isArray(payload.days) ? payload.days : [],
//   };
// }














// dashboard/lib/apiAnalytics.js
import { backendBaseUrl } from "./config";

// Fetch site-visitor analytics for a user + template
// GET /api/analytics/summary/:userId/:templateId
export async function fetchTemplateVisitorSummary(userId, templateId) {
  if (!userId || !templateId) {
    return { totalVisitors: 0, days: [] };
  }

  const url = `${backendBaseUrl}/api/analytics/summary/${encodeURIComponent(
    userId
  )}/${encodeURIComponent(templateId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include", // send auth cookie to backend
  });

  let json = {};
  try {
    json = await res.json();
  } catch {
    // ignore parse errors; handle via res.ok below
  }

  if (!res.ok || json.ok === false) {
    const msg = json.error || json.message || `Analytics HTTP ${res.status}`;
    throw new Error(msg);
  }

  // backend can return either { data: {...} } or plain { ... }
  const payload = json.data || json;

  return {
    totalVisitors: payload.totalVisitors || 0,
    days: Array.isArray(payload.days) ? payload.days : [],
  };
}
