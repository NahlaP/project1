// // pages/api/emails/backups.js
// import fs from "fs";
// import path from "path";

// export const config = { api: { bodyParser: false } };

// const BACKUP_FILE = process.env.EMAIL_BACKUP_FILE || path.join(process.cwd(), "email-backups.json");

// export default async function handler(req, res) {
//   try {
//     const data = fs.existsSync(BACKUP_FILE)
//       ? JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"))
//       : { items: [] };
//     // newest first
//     data.items.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
//     res.status(200).json({ items: data.items });
//   } catch (e) {
//     console.error("backups list error", e);
//     res.status(500).json({ error: "Failed to read backups" });
//   }
// }




// pages/api/emails/backups.js
import { CPANEL_USER, getUAPI } from "../../../lib/cpanel";

export const config = { api: { bodyParser: false } };

const BACKUPS_ROOT = (process.env.EMAIL_BACKUP_DIR_ABS || `/home/${CPANEL_USER}/email_backups`).replace(/\/+$/, "");

async function readJSON(path) {
  const r = await getUAPI("Fileman/get_file_content", { path });
  try { return JSON.parse(r?.json?.data?.content || "{}"); } catch { return {}; }
}

export default async function handler(req, res) {
  try {
    // list emails (top-level dirs)
    const d = await getUAPI("Fileman/list_files", { dir: BACKUPS_ROOT, types: "dir" });
    const emails = Array.isArray(d?.json?.data) ? d.json.data.map(x => x.name) : [];

    const items = [];
    for (const email of emails) {
      // list stamps
      const d2 = await getUAPI("Fileman/list_files", { dir: `${BACKUPS_ROOT}/${email}`, types: "dir" });
      const stamps = Array.isArray(d2?.json?.data) ? d2.json.data.map(x => x.name).sort().reverse() : [];
      if (!stamps.length) continue;

      // read newest meta.json for display
      const latest = stamps[0];
      const meta = await readJSON(`${BACKUPS_ROOT}/${email}/${latest}/meta.json`);
      items.push({
        email,
        created_at: latest.replace(/-/g, ":").replace(/T/, " ").replace(/_/g, ":"), // optional cosmetic
        quotaMB: meta.unlimited ? 0 : (meta.quotaMB || 0),
        unlimited: !!meta.unlimited,
        stamp: latest,
      });
    }

    // newest first (by stamp already)
    res.status(200).json({ items });
  } catch (e) {
    console.error("backups list error", e);
    res.status(500).json({ error: "Failed to read backups" });
  }
}
