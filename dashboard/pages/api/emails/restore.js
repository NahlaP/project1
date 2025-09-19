// // pages/api/emails/restore.js
// import fs from "fs";
// import path from "path";

// export const config = { api: { bodyParser: true } };

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

// const BACKUP_FILE = process.env.EMAIL_BACKUP_FILE || path.join(process.cwd(), "email-backups.json");

// async function uget(pathname, params = {}) {
//   const u = new URL(`${BASE}/${pathname}`);
//   u.searchParams.set("api.version", "1");
//   for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
//   const r = await fetch(u, { headers: HEADERS });
//   const text = await r.text();
//   let json = null; try { json = JSON.parse(text); } catch {}
//   return { ok: r.ok, status: r.status, text, json };
// }
// const isTrue = (v) => v === 1 || v === "1" || v === true || v === "true";
// const okStatus = (j) => !!(isTrue(j?.status) || isTrue(j?.result?.status) || isTrue(j?.metadata?.result));

// const genPass = (len = 16) => {
//   const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
//   let p = ""; for (let i = 0; i < len; i++) p += alphabet[Math.floor(Math.random()*alphabet.length)];
//   return p;
// };

// function readStore() {
//   try { return JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8")); } catch { return { items: [] }; }
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

//   try {
//     const emails = Array.isArray(req.body?.emails) ? req.body.emails.map(String) : (req.body?.email ? [String(req.body.email)] : []);
//     if (emails.length === 0) return res.status(400).json({ error: "email(s) required" });

//     const store = readStore();
//     const out = [];

//     for (const full of emails) {
//       const rec = store.items.find(x => x.email === full);
//       if (!rec) { out.push({ email: full, ok: false, error: "No backup found" }); continue; }

//       const [user, domain] = String(rec.email).split("@");
//       const password = req.body?.password || genPass(16);
//       const quota = rec.unlimited ? 0 : Number(rec.quotaMB || 0);

//       const r = await uget("Email/add_pop", {
//         domain,
//         email: user,
//         password,
//         quota,
//         send_welcome_email: 0,
//       });
//       const ok = okStatus(r.json);
//       out.push({ email: full, ok, password: ok ? password : undefined, error: ok ? undefined : (r.json?.result?.errors || r.text?.slice(0, 200)) });
//     }

//     const anyFail = out.some(x => !x.ok);
//     res.status(anyFail ? 207 : 200).json({ results: out });
//   } catch (e) {
//     console.error("restore error", e);
//     res.status(500).json({ error: "Restore failed" });
//   }
// }





// pages/api/emails/restore.js
import { CPANEL_USER, getUAPI, postUAPI } from "../../../lib/cpanel";

export const config = { api: { bodyParser: true } };

const BACKUPS_ROOT = (process.env.EMAIL_BACKUP_DIR_ABS || `/home/${CPANEL_USER}/email_backups`).replace(/\/+$/, "");

const ok = (j) =>
  !!(j?.status === 1 || j?.metadata?.result === 1 || j?.result?.status === 1);

const toNum = (v, d=0) => (Number.isFinite(+v) ? +v : d);

const genPass = (len = 16) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
  let p = ""; for (let i = 0; i < len; i++) p += alphabet[Math.floor(Math.random()*alphabet.length)];
  return p;
};

async function readJSON(path) {
  const r = await getUAPI("Fileman/get_file_content", { path });
  try { return JSON.parse(r?.json?.data?.content || "{}"); } catch { return {}; }
}

async function copyDir(src, dst) {
  return postUAPI("Fileman/fileop", { op: "copy", from: src, to: dst, doubledecode: 0 });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const email = String(req.body?.email || "");
    if (!email.includes("@")) return res.status(400).json({ error: "email required" });

    const stamp = String(req.body?.stamp || "latest"); // allow explicit stamp, else newest
    const [user, domain] = email.split("@");

    // resolve backup path
    let chosenStamp = stamp;
    if (stamp === "latest") {
      const l2 = await getUAPI("Fileman/list_files", { dir: `${BACKUPS_ROOT}/${email}`, types: "dir" });
      const stamps = Array.isArray(l2?.json?.data) ? l2.json.data.map(x => x.name).sort().reverse() : [];
      if (!stamps.length) return res.status(404).json({ error: "No backup found for email" });
      chosenStamp = stamps[0];
    }

    const base = `${BACKUPS_ROOT}/${email}/${chosenStamp}`;
    const meta = await readJSON(`${base}/meta.json`);
    const quota = meta.unlimited ? 0 : toNum(meta.quotaMB, 0);
    const password = req.body?.password || genPass(16);

    // 1) Re-create mailbox
    const create = await postUAPI("Email/add_pop", {
      domain, email: user, password, quota, send_welcome_email: 0,
    });
    if (!ok(create.json)) {
      return res.status(502).json({ error: "add_pop failed", details: create.text?.slice(0, 200) });
    }

    // 2) Restore Maildir files
    const src = `${base}/${user}`;
    const dst = `/home/${CPANEL_USER}/mail/${domain}/${user}`;
    const c = await copyDir(src, dst);
    if (!ok(c.json)) {
      return res.status(502).json({ error: "File restore failed" });
    }

    // 3) Re-apply settings
    // Forwarders
    if (Array.isArray(meta.forwarders)) {
      for (const f of meta.forwarders) {
        // add_forwarder: address (localpart), domain, fwdopt=forward, fwdemail
        const local = String(f.dest || "").split("@")[0] || user;
        const t = await postUAPI("Email/add_forwarder", {
          domain,
          address: local,
          fwdopt: "forward",
          fwdemail: f.fwdto,
        });
        // ignore soft errors (already exists etc.)
      }
    }

    // Autoresponder
    if (meta.autoresponder && typeof meta.autoresponder === "object") {
      const a = meta.autoresponder;
      await postUAPI("Email/add_auto_responder", {
        email, from: a.from || "", subject: a.subject || "",
        body: a.body || "", is_html: a.is_html ? 1 : 0,
        start: a.start || "", stop: a.stop || "", interval: toNum(a.interval, 8),
      });
    }

    // Filters
    if (Array.isArray(meta.filters)) {
      for (const flt of meta.filters) {
        // two scopes: account / mailbox
        // We’ll use store_filter with 'account' or 'user' flags depending on scope
        const isAccount = flt.scope === "account";
        await postUAPI("Email/store_filter", {
          account: email,
          filtername: flt.name || `restored-${Date.now()}`,
          // UAPI expects JSON-ish rules/actions; we saved what cPanel returned
          // If store_filter complains, you may need to adapt schema based on your server version.
          // Common form:
          rules: JSON.stringify(flt.rules || []),
          actions: JSON.stringify(flt.actions || []),
          oldfiltername: "",
          // flags (some builds require these):
          "type": isAccount ? "account" : "mailbox",
        });
      }
    }

    return res.status(200).json({ results: [{ email, ok: true, password, stamp: chosenStamp }] });
  } catch (e) {
    console.error("restore fatal", e);
    return res.status(500).json({ error: "Restore failed" });
  }
}
