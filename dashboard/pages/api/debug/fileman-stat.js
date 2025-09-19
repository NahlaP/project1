// pages/api/debug/fileman-stat.js
import { getUAPI } from "../../../lib/cpanel";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const path = String(req.query.path || "");
  if (!path) return res.status(400).json({ error: "path required" });

  try {
    const r = await getUAPI("Fileman/stat", { path });
    const ct = r?.headers?.get?.("content-type") || "";

    // if cPanel returns HTML login page, the token isn't allowed
    if (ct.includes("text/html") || (r.text || "").startsWith("<!DOCTYPE")) {
      return res.status(403).json({
        error: "Fileman not authorized (token can’t access File Manager).",
        hint: "Regenerate the API token with File Manager permissions.",
        preview: (r.text || "").slice(0, 200),
      });
    }

    if (Array.isArray(r?.json?.data)) return res.status(200).json(r.json.data[0]);
    return res.status(502).json({ error: "Unexpected response", raw: r.text?.slice(0, 200) });
  } catch (e) {
    return res.status(500).json({ error: "Request failed", message: String(e) });
  }
}
