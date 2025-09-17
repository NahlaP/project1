// // pages/api/email-domains.js
// const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
// const CPANEL_USER     = (process.env.CPANEL_USER || "mavsketc").trim();
// const CPANEL_TOKEN    = (process.env.CPANEL_TOKEN || "RBZDE5ACU3GHIOKGATTTXCHO7V1AJNYO").trim();

// let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
// if (!/\/execute$/.test(BASE)) BASE += "/execute";

// const HEADERS = {
//   Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
//   Accept: "application/json",
//   "User-Agent": "ION7-Dashboard/1.3",
// };

// export default async function handler(req, res) {
//   try {
//     const u = new URL(`${BASE}/Email/list_mail_domains`);
//     u.searchParams.set("api.version", "1");
//     const r = await fetch(u, { headers: HEADERS });
//     const json = await r.json().catch(() => null);
//     const data = Array.isArray(json?.result?.data) ? json.result.data : [];
//     const domains = data.map(d => d.domain).filter(Boolean);
//     return res.status(200).json({ domains });
//   } catch (e) {
//     return res.status(500).json({ domains: [] });
//   }
// }




// // pages/api/email-domains.js
// export const config = { api: { bodyParser: false } };

// const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
// const CPANEL_USER     = (process.env.CPANEL_USER || "mavsketc").trim();
// const CPANEL_TOKEN    = (process.env.CPANEL_TOKEN || "").trim();

// let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
// if (!/\/execute$/.test(BASE)) BASE += "/execute";

// const HEADERS = {
//   Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
//   Accept: "application/json",
//   "User-Agent": "ION7-Dashboard/1.3",
// };

// async function uget(path, params = {}) {
//   const u = new URL(`${BASE}/${path}`);
//   u.searchParams.set("api.version", "1");
//   for (const [k, v] of Object.entries(params)) {
//     if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
//   }
//   const r = await fetch(u, { headers: HEADERS });
//   const text = await r.text();
//   let json = null;
//   try { json = JSON.parse(text); } catch {}
//   return { ok: r.ok, status: r.status, text, json };
// }

// export default async function handler(req, res) {
//   try {
//     // Email::list_mail_domains returns domains available for mailbox creation
//     const r = await uget("Email/list_mail_domains");
//     if (!r.ok || !Array.isArray(r.json?.data)) {
//       return res.status(502).json({
//         error: "list_mail_domains failed",
//         details: r.json?.errors || r.text?.slice(0, 400),
//       });
//     }
//     // Normalize like: ["mavsketch.com","addon.example.com", ...]
//     const domains = r.json.data
//       .map(d => d?.domain || d)
//       .filter(Boolean)
//       .sort((a,b)=>a.localeCompare(b));
//     res.status(200).json({ domains });
//   } catch (e) {
//     console.error("email-domains API fatal:", e);
//     res.status(500).json({ error: "Failed to load domains" });
//   }
// }
