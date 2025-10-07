// import { uapiGet } from "../../../lib/cpanel";

// const ALLOW = new Set([
//   // Email (read)
//   "Email/list_pops_with_disk",
//   "Email/get_main_account_disk_usage",
//   "Email/list_forwarders",
//   "Email/list_autoresponders",
//   "Email/list_filters",
//   "Email/trace_delivery",

//   // Domains / DNS
//   "DomainInfo/list_domains",
//   "SubDomain/listsubdomains",
//   "AddonDomain/listaddondomains",
//   "ZoneEdit/fetchzone_records",

//   // Disk / FTP
//   "DiskUsage/get_disk_usage",
//   "Ftp/list_ftp",

//   // DBs
//   "MysqlFE/listdbs",
//   "MysqlFE/listusers",

//   // Cron / SSL / Stats
//   "Cron/listcron",
//   "SSL/list_certs",
//   "StatsBar/get_stats",
// ]);

// export default async function handler(req, res) {
//   try {
//     const parts = req.query.uapi || [];
//     const [mod, func] = [parts[0], parts[1]];
//     if (!mod || !func) return res.status(400).json({ error: "Use /api/cpanel/<Module>/<Function>" });

//     const key = `${mod}/${func}`;
//     if (!ALLOW.has(key)) return res.status(403).json({ error: `Not allowed: ${key}` });

//     const params = { ...req.query };
//     delete params.uapi;

//     const r = await uapiGet(mod, func, params);
//     if (!r.ok || !r.json) {
//       return res.status(r.status || 502).json({ error: "UAPI error", status: r.status, preview: r.text?.slice(0, 600) });
//     }
//     return res.status(200).json(r.json);
//   } catch (e) {
//     console.error("cpanel GET proxy error:", e);
//     return res.status(500).json({ error: "Proxy failed" });
//   }
// }
