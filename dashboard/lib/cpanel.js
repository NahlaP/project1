// lib/cpanel.js
const BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
const CPANEL_USER = (process.env.CPANEL_USER || "mavsketc").trim();
const CPANEL_TOKEN = (process.env.CPANEL_TOKEN || "RBZDE5ACU3GHIOKGATTTXCHO7V1AJNYO").trim();

// normalize: ensure ".../execute"
let BASE = BASE_RAW.replace(/\/+$/, "");
if (!/\/execute$/.test(BASE)) BASE += "/execute";

export const HEADERS = {
  Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
  Accept: "application/json",
  "User-Agent": "ION7-Dashboard/1.3",
};

export function uapi(path, params = {}) {
  const u = new URL(`${BASE}/${path}`);
  u.searchParams.set("api.version", "1");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export async function getUAPI(path, params) {
  const r = await fetch(uapi(path, params), { method: "GET", headers: HEADERS });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, json, text, headers: r.headers };
}

export async function postUAPI(path, bodyParams) {
  // UAPI accepts POST form data as well
  const url = `${BASE}/${path}?api.version=1`;
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(bodyParams || {})) {
    if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, json, text, headers: r.headers };
}

export { CPANEL_USER };
