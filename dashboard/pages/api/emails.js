

// export default async function handler(req, res) {
//   const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
//   const CPANEL_USER = (process.env.CPANEL_USER || "mavsketc").trim();
//   const CPANEL_TOKEN = (process.env.CPANEL_TOKEN || "RBZDE5ACU3GHIOKGATTTXCHO7V1AJNYO").trim(); // keep fallback in dev

//   // Normalize base → ensure it ends with /execute (once)
//   let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
//   if (!/\/execute$/.test(BASE)) BASE += "/execute";

//   const headers = {
//     Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
//     Accept: "application/json",
//     "User-Agent": "ION7-Dashboard/1.3",
//   };

//   const toNum = (v, d = 0) => {
//     const n = Number(v);
//     return Number.isFinite(n) ? n : d;
//   };

//   async function get(url) {
//     const r = await fetch(url, { method: "GET", headers });
//     const text = await r.text();
//     const ct = (r.headers.get("content-type") || "").toLowerCase();
//     let json = null;
//     if (ct.includes("application/json")) {
//       try { json = JSON.parse(text); } catch {}
//     }
//     return { ok: r.ok, status: r.status, ct, text, json };
//   }

//   // Build a URL with api.version=1 and extra params
//   function uapi(path, params = {}) {
//     const u = new URL(`${BASE}/${path}`);
//     u.searchParams.set("api.version", "1");
//     for (const [k, v] of Object.entries(params)) {
//       if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
//     }
//     return u.toString();
//   }

//   // Recursive/“deep” disk usage (sums children, tries trailing slash + show_hidden + depth)
//   async function getRecursiveBytes(dir) {
//     const candidates = [
//       uapi("DiskUsage/get_disk_usage", { dir, show_hidden: 1, depth: 10 }),
//       uapi("DiskUsage/get_disk_usage", { dir, show_hidden: 1 }),
//       uapi("DiskUsage/get_disk_usage", { dir: dir.endsWith("/") ? dir : `${dir}/`, show_hidden: 1, depth: 10 }),
//     ];

//     for (const url of candidates) {
//       const r = await get(url);
//       if (r.ok && r.json) {
//         const arr = Array.isArray(r.json.data) ? r.json.data : [];
//         let bytes = 0;
//         for (const it of arr) {
//           const b = Number(it?.bytes ?? it?.disk_used);
//           if (Number.isFinite(b)) bytes += b;
//         }
//         if (bytes > 0) return bytes;
//       }
//     }
//     return 0;
//   }

//   try {
//     // 1) POP/IMAP mailboxes (this is what cPanel counts as "Used")
//     const popsRes = await get(uapi("Email/list_pops_with_disk"));
//     if (!popsRes.ok || !popsRes.json) {
//       return res.status(502).json({
//         error: "list_pops_with_disk failed",
//         status: popsRes.status,
//         contentType: popsRes.ct,
//         bodyPreview: popsRes.text?.slice(0, 400),
//       });
//     }

//     const pops = Array.isArray(popsRes.json.data) ? popsRes.json.data : [];
//     const mailboxCount = pops.length; // cPanel's "Used" count (System excluded)

//     const rows = pops.map((it) => {
//       const suspended =
//         it.suspended_incoming === 1 ||
//         it.suspended_login === 1 ||
//         it.suspended_outgoing === 1;

//       const quotaStr = String(it.txtdiskquota ?? "").toLowerCase();
//       const unlimited = quotaStr === "unlimited" || toNum(it._diskquota) === 0;

//       const usedMB = toNum(it.diskused); // MB
//       const percent = unlimited ? null : toNum(it.diskusedpercent_float);
//       const allocGB = unlimited ? null : (toNum(it.txtdiskquota) / 1024);

//       return {
//         email: it.email,
//         user: it.user,
//         domain: it.domain,
//         restrictions: suspended ? "Restricted" : "Unrestricted",
//         usedHuman:
//           usedMB >= 1024 ? `${(usedMB / 1024).toFixed(2)} GB` : `${usedMB.toFixed(2)} MB`,
//         allocatedHuman: unlimited ? "∞" : `${allocGB.toFixed(2)} GB`,
//         percent,
//         unlimited,
//         exceeded: !unlimited && usedMB >= (toNum(it.txtdiskquota) || 0),
//         system: false,
//       };
//     });

//     // 2) System account usage (Email/* first; if 0, compute recursively)
//     let usedMainBytes = 0;

//     const sysRes = await get(uapi("Email/get_main_account_disk_usage"));
//     if (sysRes.ok && sysRes.json) usedMainBytes = toNum(sysRes.json?.data?.[0]?.bytes, 0);

//     if (!usedMainBytes) {
//       usedMainBytes = await getRecursiveBytes(`/home/${CPANEL_USER}/mail`);
//     }
//     const usedMainMB = usedMainBytes / (1024 * 1024);

//     rows.push({
//       email: CPANEL_USER,   // appears alphabetically with others
//       user: CPANEL_USER,
//       domain: "",
//       restrictions: "Unrestricted",
//       usedHuman:
//         usedMainMB >= 1024 ? `${(usedMainMB / 1024).toFixed(2)} GB` : `${usedMainMB.toFixed(2)} MB`,
//       allocatedHuman: "∞",
//       percent: null,        // unlimited/system → no %
//       unlimited: true,
//       exceeded: false,
//       system: true,
//       description:
//         "The system user email account accepts mail addressed to your cPanel username on the server’s hostname.",
//     });

//     // 3) Sort exactly like cPanel: Account (email) A→Z
//     rows.sort((a, b) => {
//       const ea = String(a.email || "").toLowerCase();
//       const eb = String(b.email || "").toLowerCase();
//       if (ea < eb) return -1;
//       if (ea > eb) return 1;
//       return 0;
//     });

//     return res.status(200).json({
//       header: { available: "∞", used: mailboxCount },
//       rows,
//     });
//   } catch (e) {
//     console.error("emails API fatal:", e);
//     return res.status(500).json({ error: "Failed to load emails" });
//   }
// }






// // og

// // pages/api/emails.js
// export const config = { api: { bodyParser: true } };

// const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
// const CPANEL_USER     = (process.env.CPANEL_USER || "mavsketc").trim();
// const CPANEL_TOKEN    = (process.env.CPANEL_TOKEN || "RBZDE5ACU3GHIOKGATTTXCHO7V1AJNYO").trim(); // dev fallback

// let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
// if (!/\/execute$/.test(BASE)) BASE += "/execute";

// const HEADERS = {
//   Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
//   Accept: "application/json",
//   "User-Agent": "ION7-Dashboard/1.3",
// };

// const toNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
// const mb = (bytes) => bytes / (1024 * 1024);

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
//   return { ok: r.ok, status: r.status, text, json, ct: r.headers.get("content-type") || "" };
// }

// export default async function handler(req, res) {
//   try {
//     if (req.method === "POST") {
//       // CREATE mailbox  (UAPI Email::add_pop)
//       const { domain, user, password, quotaMB, sendWelcome } = req.body || {};
//       if (!domain || !user || !password) {
//         return res.status(400).json({ error: "domain, user, password are required" });
//       }
//       const params = {
//         domain,
//         email: user,                           // username-part only
//         password,
//         quota: Math.max(0, toNum(quotaMB, 0)), // MiB; 0 = unlimited
//         send_welcome_email: sendWelcome ? 1 : 0,
//       };
//       const r = await uget("Email/add_pop", params);   // docs: add_pop
//       const ok = !!r.json?.result?.status;
//       if (!ok) {
//         return res.status(502).json({
//           error: "add_pop failed",
//           details: r.json?.result?.errors || r.json?.errors || r.text?.slice(0, 400),
//         });
//       }
//       return res.status(200).json({ ok: true, created: `${user}@${domain}` });
//     }

//     if (req.method === "DELETE") {
//       // BULK DELETE mailboxes (UAPI Email::delete_pop)
//       const { emails, destroy } = req.body || {};
//       if (!Array.isArray(emails) || emails.length === 0) {
//         return res.status(400).json({ error: "emails[] required" });
//       }
//       const results = [];
//       for (const full of emails) {
//         const [user, domain] = String(full).split("@");
//         if (!user || !domain) {
//           results.push({ email: full, ok: false, error: "invalid address" });
//           continue;
//         }
//         const r = await uget("Email/delete_pop", { email: user, domain, destroy: destroy ? 1 : 0 });
//         const ok = !!r.json?.result?.status;
//         results.push({ email: full, ok, error: ok ? null : (r.json?.result?.errors || r.text?.slice(0, 200)) });
//       }
//       const anyFail = results.some(x => !x.ok);
//       return res.status(anyFail ? 207 : 200).json({ results });
//     }

//     // GET = list mailboxes (your existing logic)
//     const popsRes = await uget("Email/list_pops_with_disk");
//     if (!popsRes.ok || !popsRes.json) {
//       return res.status(502).json({
//         error: "list_pops_with_disk failed",
//         status: popsRes.status,
//         bodyPreview: popsRes.text?.slice(0, 400),
//       });
//     }

//     const pops = Array.isArray(popsRes.json.data) ? popsRes.json.data : [];
//     const rows = pops.map((it) => {
//       const suspended = it.suspended_incoming === 1 || it.suspended_login === 1 || it.suspended_outgoing === 1;
//       const quotaStr = String(it.txtdiskquota ?? "").toLowerCase();
//       const unlimited = quotaStr === "unlimited" || toNum(it._diskquota) === 0;

//       const usedMB = toNum(it.diskused); // MB
//       const percent = unlimited ? null : toNum(it.diskusedpercent_float);
//       const allocGB = unlimited ? null : toNum(it.txtdiskquota) / 1024;

//       return {
//         email: it.email,
//         user: it.user,
//         domain: it.domain,
//         restrictions: suspended ? "Restricted" : "Unrestricted",
//         usedHuman: usedMB >= 1024 ? `${(usedMB / 1024).toFixed(2)} GB` : `${usedMB.toFixed(2)} MB`,
//         allocatedHuman: unlimited ? "∞" : `${(allocGB || 0).toFixed(2)} GB`,
//         percent,
//         unlimited,
//         exceeded: !unlimited && usedMB >= (toNum(it.txtdiskquota) || 0),
//         system: false,
//       };
//     });

//     // System/main usage (Email::get_main_account_disk_usage; fallback to DiskUsage)
//     let usedMainBytes = 0;
//     const sysRes = await uget("Email/get_main_account_disk_usage");
//     if (sysRes.ok && sysRes.json) usedMainBytes = toNum(sysRes.json?.data?.[0]?.bytes, 0);
//     if (!usedMainBytes) {
//       const d1 = await uget("DiskUsage/get_disk_usage", { dir: `/home/${CPANEL_USER}/mail`, show_hidden: 1, depth: 10 });
//       if (Array.isArray(d1.json?.data)) {
//         usedMainBytes = d1.json.data.reduce((a, it) => a + (Number(it?.bytes ?? it?.disk_used) || 0), 0);
//       }
//     }
//     const usedMainMB = mb(usedMainBytes);
//     rows.push({
//       email: CPANEL_USER, user: CPANEL_USER, domain: "",
//       restrictions: "Unrestricted",
//       usedHuman: usedMainMB >= 1024 ? `${(usedMainMB / 1024).toFixed(2)} GB` : `${usedMainMB.toFixed(2)} MB`,
//       allocatedHuman: "∞", percent: null, unlimited: true, exceeded: false, system: true,
//       description: "The system user email account accepts mail addressed to your cPanel username on the server’s hostname.",
//     });

//     rows.sort((a, b) => String(a.email || "").localeCompare(String(b.email || ""), undefined, { sensitivity: "base" }));

//     return res.status(200).json({ header: { available: "∞", used: pops.length }, rows });
//   } catch (e) {
//     console.error("emails API fatal:", e);
//     return res.status(500).json({ error: "Failed to load emails" });
//   }
// }











// pages/api/emails.js
export const config = { api: { bodyParser: true } };

const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
const CPANEL_USER     = (process.env.CPANEL_USER || "mavsketc").trim();
const CPANEL_TOKEN    = (process.env.CPANEL_TOKEN || "RBZDE5ACU3GHIOKGATTTXCHO7V1AJNYO").trim(); // dev fallback

let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
if (!/\/execute$/.test(BASE)) BASE += "/execute";

const HEADERS = {
  Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
  Accept: "application/json",
  "User-Agent": "ION7-Dashboard/1.3",
};

const toNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const mb = (bytes) => bytes / (1024 * 1024);

// success helper: different cPanel shapes
const okStatus = (j) =>
  j?.status === 1 || j?.result?.status === 1 || j?.metadata?.result === 1;

async function uget(path, params = {}) {
  const u = new URL(`${BASE}/${path}`);
  u.searchParams.set("api.version", "1");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  }
  const r = await fetch(u, { headers: HEADERS });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, text, json, ct: r.headers.get("content-type") || "" };
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      // CREATE mailbox  (UAPI Email::add_pop)
      const { domain, user, password, quotaMB, sendWelcome } = req.body || {};
      if (!domain || !user || !password) {
        return res.status(400).json({ error: "domain, user, password are required" });
      }
      const params = {
        domain,
        email: user,                           // username-part only
        password,
        quota: Math.max(0, toNum(quotaMB, 0)), // MiB; 0 = unlimited
        send_welcome_email: sendWelcome ? 1 : 0,
      };
      const r = await uget("Email/add_pop", params);
      const ok = okStatus(r.json);
      if (!ok) {
        return res.status(502).json({
          error: "add_pop failed",
          details: r.json?.errors || r.json?.result?.errors || r.text?.slice(0, 400),
        });
      }
      return res.status(200).json({ ok: true, created: `${user}@${domain}` });
    }

    if (req.method === "DELETE") {
      // BULK DELETE mailboxes (UAPI Email::delete_pop)
      const { emails, destroy } = req.body || {};
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: "emails[] required" });
      }
      const results = [];
      for (const full of emails) {
        const [user, domain] = String(full).split("@");
        if (!user || !domain) {
          results.push({ email: full, ok: false, error: "invalid address" });
          continue;
        }
        const r = await uget("Email/delete_pop", { email: user, domain, destroy: destroy ? 1 : 0 });
        const ok = okStatus(r.json);
        results.push({
          email: full,
          ok,
          error: ok ? null : (r.json?.errors || r.json?.result?.errors || r.text?.slice(0, 200)),
        });
      }
      const anyFail = results.some(x => !x.ok);
      return res.status(anyFail ? 207 : 200).json({ results });
    }

    // GET = list mailboxes
    const popsRes = await uget("Email/list_pops_with_disk");
    if (!popsRes.ok || !popsRes.json) {
      return res.status(502).json({
        error: "list_pops_with_disk failed",
        status: popsRes.status,
        bodyPreview: popsRes.text?.slice(0, 400),
      });
    }

    const pops = Array.isArray(popsRes.json.data) ? popsRes.json.data : [];
    const rows = pops.map((it) => {
      const suspended = it.suspended_incoming === 1 || it.suspended_login === 1 || it.suspended_outgoing === 1;
      const quotaStr = String(it.txtdiskquota ?? "").toLowerCase();
      const unlimited = quotaStr === "unlimited" || toNum(it._diskquota) === 0;

      const usedMB = toNum(it.diskused); // MB
      const percent = unlimited ? null : toNum(it.diskusedpercent_float);
      const allocGB = unlimited ? null : toNum(it.txtdiskquota) / 1024;

      return {
        email: it.email,
        user: it.user,
        domain: it.domain,
        restrictions: suspended ? "Restricted" : "Unrestricted",
        usedHuman: usedMB >= 1024 ? `${(usedMB / 1024).toFixed(2)} GB` : `${usedMB.toFixed(2)} MB`,
        allocatedHuman: unlimited ? "∞" : `${(allocGB || 0).toFixed(2)} GB`,
        percent,
        unlimited,
        exceeded: !unlimited && usedMB >= (toNum(it.txtdiskquota) || 0),
        system: false,
      };
    });

    // System/main usage
    let usedMainBytes = 0;
    const sysRes = await uget("Email/get_main_account_disk_usage");
    if (sysRes.ok && sysRes.json) usedMainBytes = toNum(sysRes.json?.data?.[0]?.bytes, 0);
    if (!usedMainBytes) {
      const d1 = await uget("DiskUsage/get_disk_usage", { dir: `/home/${CPANEL_USER}/mail`, show_hidden: 1, depth: 10 });
      if (Array.isArray(d1.json?.data)) {
        usedMainBytes = d1.json.data.reduce((a, it) => a + (Number(it?.bytes ?? it?.disk_used) || 0), 0);
      }
    }
    const usedMainMB = mb(usedMainBytes);
    rows.push({
      email: CPANEL_USER,
      user: CPANEL_USER,
      domain: "",
      restrictions: "Unrestricted",
      usedHuman: usedMainMB >= 1024 ? `${(usedMainMB / 1024).toFixed(2)} GB` : `${usedMainMB.toFixed(2)} MB`,
      allocatedHuman: "∞",
      percent: null,
      unlimited: true,
      exceeded: false,
      system: true,
      description: "The system user email account accepts mail addressed to your cPanel username on the server’s hostname.",
    });

    rows.sort((a, b) =>
      String(a.email || "").localeCompare(String(b.email || ""), undefined, { sensitivity: "base" })
    );

    return res.status(200).json({ header: { available: "∞", used: pops.length }, rows });
  } catch (e) {
    console.error("emails API fatal:", e);
    return res.status(500).json({ error: "Failed to load emails" });
  }
}
