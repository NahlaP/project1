import { uapiPost } from "../../../lib/cpanel";

// Only allow safe, intentional functions.
const ALLOW_WRITE = new Set([
  // Email CRUD & controls
  "Email/add_pop",          // create mailbox
  "Email/delete_pop",       // delete mailbox
  "Email/editquota",        // change quota (MB, 0=unlimited)
  "Email/passwd_pop",       // change password

  "Email/suspend_login",
  "Email/unsuspend_login",
  "Email/suspend_incoming",
  "Email/unsuspend_incoming",
  "Email/suspend_outgoing",
  "Email/unsuspend_outgoing",

  // Forwarders
  "Email/add_forwarder",
  "Email/delete_forwarder",

  // Autoresponders
  "Email/add_autoresponder",
  "Email/delete_autoresponder",

  // Filters (simple allow—build UI as needed)
  "Email/add_filter",
  "Email/delete_filter",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  try {
    const { mod, func, params } = req.body || {};
    if (!mod || !func) return res.status(400).json({ error: "Missing mod/func" });

    const key = `${mod}/${func}`;
    if (!ALLOW_WRITE.has(key)) {
      return res.status(403).json({ error: `Not allowed: ${key}` });
    }

    const r = await uapiPost(mod, func, params || {});
    if (!r.ok || !r.json) {
      return res.status(r.status || 502).json({ error: "UAPI exec error", status: r.status, preview: r.text?.slice(0, 600) });
    }
    return res.status(200).json(r.json);
  } catch (e) {
    console.error("cpanel exec error:", e);
    return res.status(500).json({ error: "Exec failed" });
  }
}
