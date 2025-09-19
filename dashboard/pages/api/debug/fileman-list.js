// pages/api/debug/fileman-list.js
import { getUAPI } from "../../../lib/cpanel";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const dir = String(req.query.dir || "");
  if (!dir) return res.status(400).json({ error: "dir required" });

  try {
    const r = await getUAPI("Fileman/list_files", { dir, types: "dir,file" });
    const ct = r?.headers?.get?.("content-type") || "";

    if (ct.includes("text/html") || (r.text || "").startsWith("<!DOCTYPE")) {
      return res.status(403).json({
        error: "Fileman not authorized (token can’t access File Manager).",
        hint: "Regenerate the API token with File Manager permissions.",
        preview: (r.text || "").slice(0, 200),
      });
    }

    if (Array.isArray(r?.json?.data)) {
      return res.status(200).json({
        dir,
        count: r.json.data.length,
        names: r.json.data.map(x => x.name),
      });
    }
    return res.status(502).json({ error: "Unexpected response", raw: r.text?.slice(0, 200) });
  } catch (e) {
    return res.status(500).json({ error: "Request failed", message: String(e) });
  }
}
