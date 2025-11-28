// backend/utils/cpanel.ts

// NOTE: do NOT "import fetch from 'node-fetch'" here because node-fetch v3 is ESM-only
// and our backend is running in CommonJS via ts-node-dev. We instead use a small helper
// that uses global fetch (Node 18+) or dynamically imports node-fetch.

const BASE_RAW = (process.env.CPANEL_BASE || "https://mavsketch.com:2083").trim();
const CPANEL_USER = (process.env.CPANEL_USER || "mavsketc").trim();
const CPANEL_TOKEN = (process.env.CPANEL_TOKEN || "").trim();

let BASE = BASE_RAW.replace(/\/+$/, "");
if (!/\/execute$/.test(BASE)) BASE += "/execute";

if (!CPANEL_TOKEN) {
  console.error("[cpanelUapi] WARNING: CPANEL_TOKEN is empty in env");
}

// cache the resolved fetch implementation
let cachedFetch: any = null;

async function getFetch(): Promise<typeof fetch> {
  // if Node already has global fetch (Node 18+), use it
  if (!cachedFetch) {
    if (typeof (globalThis as any).fetch === "function") {
      cachedFetch = (globalThis as any).fetch.bind(globalThis);
    } else {
      // fall back to node-fetch via dynamic import (ESM-safe)
      const mod: any = await import("node-fetch");
      cachedFetch = (mod.default || mod) as typeof fetch;
    }
  }
  return cachedFetch;
}

function buildUrl(module: string, func: string, params?: Record<string, any>) {
  const u = new URL(`${BASE}/${module}/${func}`);
  u.searchParams.set("api.version", "1");
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      u.searchParams.set(k, String(v));
    }
  });
  return u.toString();
}

/**
 * Call cPanel UAPI
 * Example: cpanelUapi("Email", "list_pops_with_disk")
 */
export async function cpanelUapi(
  module: string,
  func: string,
  params?: Record<string, any>
): Promise<any> {
  const url = buildUrl(module, func, params);
  console.log("[cpanelUapi] GET", url);

  const fetchImpl = await getFetch();

  const res = await fetchImpl(url, {
    method: "GET",
    headers: {
      Authorization: `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`,
      Accept: "application/json",
      "User-Agent": "ION7-Backend/1.0",
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("[cpanelUapi] Failed to parse JSON", e);
    console.error(text.slice(0, 500));
    throw new Error(`cPanel returned non-JSON (HTTP ${res.status})`);
  }

  // cPanel UAPI: json.status === 1 means success
  if (!res.ok || json.status !== 1) {
    console.error("[cpanelUapi] UAPI error", {
      httpStatus: res.status,
      status: json.status,
      errors: json.errors,
    });
    const msg =
      (Array.isArray(json.errors) && json.errors.join("; ")) ||
      `cPanel UAPI error (HTTP ${res.status}, status ${json.status})`;
    throw new Error(msg);
  }

  return json;
}
