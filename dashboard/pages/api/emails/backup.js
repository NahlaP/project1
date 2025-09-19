// // pages/api/emails/backup.js
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
// const toNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

// async function uget(pathname, params = {}) {
//   const u = new URL(`${BASE}/${pathname}`);
//   u.searchParams.set("api.version", "1");
//   for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
//   const r = await fetch(u, { headers: HEADERS });
//   const text = await r.text();
//   let json = null; try { json = JSON.parse(text); } catch {}
//   return { ok: r.ok, status: r.status, text, json };
// }

// function readStore() {
//   try { return JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8")); } catch { return { items: [] }; }
// }
// function writeStore(store) {
//   fs.writeFileSync(BACKUP_FILE, JSON.stringify(store, null, 2));
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
//   try {
//     const want = Array.isArray(req.body?.emails) ? req.body.emails.map(String) : [];

//     // list all to find details
//     const pops = await uget("Email/list_pops_with_disk");
//     const list = Array.isArray(pops.json?.data) ? pops.json.data : [];

//     // which to back up: provided list or all (non-system)
//     const targets = want.length
//       ? list.filter(it => want.includes(it.email))
//       : list;

//     const store = readStore();
//     const now = new Date().toISOString();

//     const results = targets.map(it => {
//       const email = String(it.email);
//       const unlimited = String(it.txtdiskquota ?? "").toLowerCase() === "unlimited" || toNum(it._diskquota) === 0;
//       const quotaMB = unlimited ? 0 : toNum(it.txtdiskquota) || toNum(it._diskquota) || 0;

//       // upsert by email
//       const rec = {
//         email,
//         user: it.user,
//         domain: it.domain,
//         quotaMB,
//         unlimited,
//         created_at: now,
//       };

//       const idx = store.items.findIndex(x => x.email === email);
//       if (idx >= 0) store.items[idx] = rec; else store.items.push(rec);
//       return { email, ok: true };
//     });

//     writeStore(store);
//     return res.status(200).json({ results });
//   } catch (e) {
//     console.error("backup error", e);
//     return res.status(500).json({ error: "Backup failed" });
//   }
// }




// pages/api/emails/backup.js
import { CPANEL_USER, getUAPI, postUAPI } from "../../../lib/cpanel";

export const config = { api: { bodyParser: true } };

const MODE = (process.env.EMAIL_BACKUP_MODE || "fileman").trim();

// We will NOT hardcode /home; we'll detect it.
const CANDIDATE_HOMES = [
  "/home", "/home2", "/home3", "/home4", "/home5",
  "/home6", "/home7", "/home8", "/home9"
];

const ok = (j) => !!(j?.status === 1 || j?.metadata?.result === 1 || j?.result?.status === 1);
const toNum = (v, d=0) => (Number.isFinite(+v) ? +v : d);
const isHTML = (t) => typeof t === "string" && /<html[\s>]/i.test(t);

// ---------- helpers ----------
async function listDirs(dir) {
  const r = await getUAPI("Fileman/list_files", { dir, types: "dir" });
  return Array.isArray(r?.json?.data) ? r.json.data.map(x => String(x.name)) : [];
}
async function pathExists(absPath) {
  const parent = absPath.replace(/\/+$/, "").split("/").slice(0, -1).join("/") || "/";
  const name = absPath.replace(/\/+$/, "").split("/").pop();
  const names = await listDirs(parent);
  return names.includes(name);
}
async function ensureDir(absPath) {
  await postUAPI("Fileman/mkdir", { path: absPath });
}
async function copyDir(src, dst) {
  return postUAPI("Fileman/fileop", { op: "copy", from: src, to: dst, doubledecode: 0 });
}
async function saveJSON(absPath, filename, obj) {
  const content = JSON.stringify(obj, null, 2);
  return postUAPI("Fileman/save_file", { dir: absPath, file: filename, data: content });
}

// Detect the real home prefix ( /home or /home2 … ) for this account.
let detectedHome = null;
async function getHomePrefix() {
  if (detectedHome) return detectedHome;
  for (const base of CANDIDATE_HOMES) {
    const cand = `${base}/${CPANEL_USER}`;
    if (await pathExists(cand)) { detectedHome = base; return base; }
  }
  // Fallback to /home if we really can’t detect (better than nothing)
  detectedHome = "/home";
  return detectedHome;
}

// Build Maildir path after we know the home prefix
async function resolveMaildirPath(domain, user) {
  const HOME = await getHomePrefix();
  return `${HOME}/${CPANEL_USER}/mail/${domain}/${user}`;
}

// Where to store backups (under the same detected home)
async function getBackupsRoot() {
  const HOME = await getHomePrefix();
  const root = process.env.EMAIL_BACKUP_DIR_ABS || `${HOME}/${CPANEL_USER}/email_backups`;
  return root.replace(/\/+$/, "");
}

// (optional) collect mailbox settings like forwarders/autoresponder/filters
async function exportSettings(email, quotaMB, unlimited) {
  const [user, domain] = String(email).split("@");
  const settings = { email, domain, user, quotaMB, unlimited, forwarders: [], autoresponder: null, filters: [] };
  try {
    const fw = await getUAPI("Email/list_forwarders", { domain });
    if (Array.isArray(fw?.json?.data)) {
      settings.forwarders = fw.json.data
        .filter(f => [f.dest, f.forward, f.address, f.forwarder].map(v => String(v||"").toLowerCase()).includes(email.toLowerCase()))
        .map(f => ({ dest: f.dest || f.forward || f.address || f.forwarder, fwdto: f.fwdto || f.target || f.forward_to }));
    }
  } catch {}
  try {
    const ar = await getUAPI("Email/list_autoresponders", { domain });
    if (Array.isArray(ar?.json?.data)) {
      const one = ar.json.data.find(x => String(x.email).toLowerCase() === email.toLowerCase());
      if (one) settings.autoresponder = {
        subject: one.subject || "", from: one.from || "", body: one.body || "",
        is_html: one.is_html ? 1 : 0, start: one.start || "", stop: one.stop || "", interval: toNum(one.interval, 8),
      };
    }
  } catch {}
  try {
    const af = await getUAPI("Email/list_account_filters", { account: email });
    if (Array.isArray(af?.json?.data)) settings.filters.push(...af.json.data.map(x => ({ scope: "account", name: x.filtername, rules: x.rules, actions: x.actions })));
    const uf = await getUAPI("Email/list_mailbox_filters", { account: email });
    if (Array.isArray(uf?.json?.data)) settings.filters.push(...uf.json.data.map(x => ({ scope: "mailbox", name: x.filtername, rules: x.rules, actions: x.actions })));
  } catch {}
  return settings;
}

// ---------- handler ----------
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (MODE !== "fileman") return res.status(400).json({ error: "EMAIL_BACKUP_MODE must be 'fileman' for real backups" });

  try {
    const emails = Array.isArray(req.body?.emails) ? req.body.emails.map(String) : [];
    if (!emails.length) return res.status(400).json({ error: "emails[] required" });

    const list = await getUAPI("Email/list_pops_with_disk");
    const items = Array.isArray(list?.json?.data) ? list.json.data : [];
    const map = new Map(items.map(it => [String(it.email).toLowerCase(), it]));

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const BACKUPS_ROOT = await getBackupsRoot();
    await ensureDir(BACKUPS_ROOT);

    const results = [];
    for (const email of emails) {
      const it = map.get(email.toLowerCase());
      if (!it) { results.push({ email, ok: false, error: "Mailbox not found (UAPI+FS)" , debug: { countAll: items.length }}); continue; }

      const quotaStr = String(it.txtdiskquota ?? "").toLowerCase();
      const unlimited = quotaStr === "unlimited" || toNum(it._diskquota) === 0;
      const quotaMB = unlimited ? 0 : (toNum(it.txtdiskquota) || toNum(it._diskquota) || 0);

      const [user, domain] = email.split("@");
      const src = await resolveMaildirPath(domain, user);

      // confirm source exists now that we detect /homeN
      if (!(await pathExists(src))) {
        results.push({ email, ok: false, error: `Source Maildir not found: ${src}` });
        continue;
      }

      const dstBase = `${BACKUPS_ROOT}/${email}`;
      const dst = `${dstBase}/${stamp}`;
      await ensureDir(dstBase);
      await ensureDir(dst);

      // copy Maildir folder
      const c = await copyDir(src, `${dst}/${user}`);
      if (!ok(c.json)) {
        const text = c?.text || "";
        results.push({
          email, ok: false,
          error: isHTML(text) ? "Fileman not authorized (HTML login returned)" : "File copy failed",
          detail: text.slice(0, 400)
        });
        continue;
      }

      // write meta.json
      const meta = await exportSettings(email, quotaMB, unlimited);
      const w = await saveJSON(dst, "meta.json", meta);
      if (!ok(w.json)) {
        results.push({ email, ok: true, backupPath: dst, warning: "Mail copied, meta.json write failed", detail: w.text?.slice(0, 300) });
        continue;
      }

      results.push({ email, ok: true, backupPath: dst });
    }

    const anyFail = results.some(r => !r.ok);
    res.status(anyFail ? 207 : 200).json({ results });
  } catch (e) {
    console.error("backup fatal", e);
    res.status(500).json({ error: "Backup failed" });
  }
}
