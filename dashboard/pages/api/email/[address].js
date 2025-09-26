// pages/api/email/[address].js
export const config = { api: { bodyParser: true } };

const CPANEL_BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
const CPANEL_USER     = (process.env.CPANEL_USER || "mavsketc").trim();
const CPANEL_TOKEN    = (process.env.CPANEL_TOKEN || "").trim();

let BASE = CPANEL_BASE_RAW.replace(/\/+$/, "");
if (!/\/execute$/.test(BASE)) BASE += "/execute";

const HEADERS = {
  Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
  Accept: "application/json",
  "User-Agent": "ION7-Dashboard/1.3",
};

function u(path, params = {}) {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("api.version", "1");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}
const ok = (j) =>
  j?.status === 1 ||
  j?.metadata?.result === 1 ||
  (Array.isArray(j?.data) && j.data.some(d => d?.status === 1)) ||
  (Array.isArray(j?.result?.data) && j.result.data.some(d => d?.status === 1));

function errText(j, t) {
  const errs = []
    .concat(j?.errors || [])
    .concat(j?.result?.errors || [])
    .concat(j?.metadata?.reason ? [j.metadata.reason] : []);
  if (errs.length) return errs.map(e => (typeof e === "string" ? e : JSON.stringify(e))).join("; ");
  return t?.slice(0, 400) || "Unknown error";
}

async function GET(path, params) {
  const r = await fetch(u(path, params), { headers: HEADERS });
  const t = await r.text(); let j=null; try{ j=JSON.parse(t);}catch{}
  return { r, j, t };
}
async function POST(path, body) {
  const form = new URLSearchParams();
  for (const [k,v] of Object.entries(body||{})) if (v!==undefined && v!==null) form.append(k,String(v));
  const r = await fetch(`${BASE}/${path}?api.version=1`, {
    method: "POST",
    headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const t = await r.text(); let j=null; try{ j=JSON.parse(t);}catch{}
  return { r, j, t };
}

function split(addr) {
  const [emailUser, domain] = String(addr||"").toLowerCase().split("@");
  if (!emailUser || !domain) throw new Error("invalid email address");
  return { emailUser, domain, full: `${emailUser}@${domain}` };
}

/** Try Email/* with FULL, fallback to local+domain on "not found" mailbox text */
async function postEmailWithCompat(fn, { emailUser, domain, full }, extra = {}) {
  let r = await POST(`Email/${fn}`, { email: full, ...extra });
  if (ok(r.j)) return r;
  const text = `${errText(r.j, r.t)}`.toLowerCase();
  if (text.includes("do not have an email account named") || text.includes("does not exist")) {
    r = await POST(`Email/${fn}`, { email: emailUser, domain, ...extra });
  }
  return r;
}

async function setQuotaCompat({ emailUser, domain, full }, quotaMB) {

  let r = await POST("Email/set_quota", { email: full, quota: quotaMB });
  if (ok(r.j)) return r;
  const text = `${errText(r.j, r.t)}`.toLowerCase();
  if (text.includes("could not find the function") || text.includes("not found") || text.includes("unknown function")) {
    // Legacy API
    r = await POST("Email/edit_pop_quota", { email: emailUser, domain, quota: quotaMB });
  }
  return r;
}

export default async function handler(req, res) {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: "address required" });

  try {
    const ids = split(address);

    if (req.method === "GET") {
      const { j } = await GET("Email/list_pops_with_disk");
      const row = (j?.data || []).find(d => d?.email?.toLowerCase() === ids.full);
      if (!row) return res.status(404).json({ error: "mailbox not found" });

      const suspended = {
        incoming: row.suspended_incoming === 1,
        outgoing: row.suspended_outgoing === 1,
        login:    row.suspended_login    === 1,
      };
      const unlimited =
        String(row.txtdiskquota||"").toLowerCase() === "unlimited" ||
        Number(row._diskquota) === 0;

      return res.json({
        email: row.email,
        user: row.user,
        domain: row.domain,
        suspended,
        usedMB: Number(row.diskused)||0,
        quotaMB: unlimited ? 0 : Number(row.txtdiskquota)||0,
        unlimited,
      });
    }

    if (req.method === "DELETE") {
      const destroy = req.query.destroy ? 1 : 0;
      const r = await POST("Email/delete_pop", { email: ids.emailUser, domain: ids.domain, destroy });
      if (!ok(r.j)) return res.status(502).json({ error: errText(r.j, r.t) });
      return res.json({ ok: true });
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const ops = [];
      const debug = [];

      // password (full, fallback)
      if (typeof body.password === "string" && body.password.length > 0) {
        const r = await postEmailWithCompat("passwd_pop", ids, { password: body.password });
        debug.push(["passwd_pop", errText(r.j, r.t)]);
        if (!ok(r.j)) return res.status(502).json({ ok: false, step: "passwd_pop", error: errText(r.j, r.t) });
      }

      // quota (0 == unlimited) — with fallback to edit_pop_quota
      if (typeof body.quotaMB === "number" || typeof body.unlimited === "boolean") {
        const quota = body.unlimited ? 0 : Math.max(0, Number(body.quotaMB||0));
        const r = await setQuotaCompat(ids, quota);
        debug.push(["quota", errText(r.j, r.t)]);
        if (!ok(r.j)) return res.status(502).json({ ok: false, step: "quota", error: errText(r.j, r.t) });
      }

      // restrictions
      const toggles = body.suspended || {};
      const doToggle = async (flag, fnSuspend, fnUnsuspend, label) => {
        if (typeof flag !== "boolean") return;
        const fn = flag ? fnSuspend : fnUnsuspend;
        const r = await postEmailWithCompat(fn, ids);
        debug.push([label, errText(r.j, r.t)]);
        if (!ok(r.j)) return { fail: true, label, error: errText(r.j, r.t) };
        return { fail: false };
      };

      for (const [flag, s, u, label] of [
        [toggles.incoming, "suspend_incoming", "unsuspend_incoming", "incoming"],
        [toggles.outgoing, "suspend_outgoing", "unsuspend_outgoing", "outgoing"],
        [toggles.login,    "suspend_login",    "unsuspend_login",    "login"],
      ]) {
        const r = await doToggle(flag, s, u, label);
        if (r?.fail) return res.status(502).json({ ok: false, step: label, error: r.error });
      }

      return res.json({ ok: true, debug });
    }

    res.setHeader("Allow", "GET,PATCH,DELETE");
    return res.status(405).end("Method Not Allowed");
  } catch (e) {
    console.error("manage mailbox error:", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
}
