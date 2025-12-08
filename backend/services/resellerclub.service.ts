// // backend/services/resellerclub.service.ts

// // Use Node's built-in fetch (Node 18+).
// // If your TypeScript complains, make sure "lib" in tsconfig includes "dom" OR just keep this as any.
// const fetchFn: typeof fetch = (globalThis as any).fetch;

// const {
//   RESELLERCLUB_API_BASE,
//   RESELLERCLUB_USERID,
//   RESELLERCLUB_API_KEY,
// } = process.env;

// // Default to live HTTP API if env not set
// const API_BASE = (RESELLERCLUB_API_BASE || "https://httpapi.com/api").replace(
//   /\/+$/,
//   ""
// );

// function assertConfig() {
//   if (!RESELLERCLUB_USERID || !RESELLERCLUB_API_KEY) {
//     throw new Error(
//       "ResellerClub API not configured. Set RESELLERCLUB_USERID and RESELLERCLUB_API_KEY in .env"
//     );
//   }
// }

// function buildUrl(path: string, params: URLSearchParams) {
//   assertConfig();

//   params.set("auth-userid", RESELLERCLUB_USERID!);
//   params.set("api-key", RESELLERCLUB_API_KEY!);

//   return `${API_BASE}${path}?${params.toString()}`;
// }

// /**
//  * Check domain availability using ResellerClub HTTP API.
//  *
//  * Example:
//  *  domainName = "mavsketch"
//  *  tlds = ["com", "net"]
//  */
// export async function checkDomainAvailability(
//   domainName: string,
//   tlds: string[] = ["com"]
// ) {
//   const cleanName = domainName.trim().toLowerCase();
//   if (!cleanName) {
//     throw new Error("domainName is required");
//   }

//   const params = new URLSearchParams();
//   params.set("domain-name", cleanName);

//   tlds.forEach((tld) => {
//     const cleanTld = tld.replace(/^\./, "").trim().toLowerCase();
//     if (cleanTld) params.append("tlds", cleanTld);
//   });

//   const url = buildUrl("/domains/available.json", params);

//   console.log(
//     "[ResellerClub] Availability check:",
//     url.replace(RESELLERCLUB_API_KEY!, "****")
//   );

//   if (!fetchFn) {
//     throw new Error(
//       "global fetch is not available. Make sure you are running on Node.js 18+."
//     );
//   }

//   const res = await fetchFn(url, { method: "GET" });

//   let json: any = {};
//   try {
//     json = await res.json();
//   } catch (e) {
//     console.error("[ResellerClub] Failed to parse JSON:", e);
//   }

//   if (!res.ok) {
//     console.error("[ResellerClub] HTTP error", res.status, json);
//     throw new Error(
//       `ResellerClub availability HTTP ${res.status} - ${
//         json?.message || JSON.stringify(json)
//       }`
//     );
//   }

//   // Example Response:
//   // {
//   //   "example.com": { "status": "available", ... },
//   //   "example.net": { "status": "regthroughothers", ... }
//   // }
//   return json as Record<
//     string,
//     { status: string; classkey?: string; actiontype?: string; entityid?: number }
//   >;
// }
