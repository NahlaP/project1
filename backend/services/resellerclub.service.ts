// // backend/services/resellerclub.service.ts

// // Use Node's built-in fetch (Node 18+)
// const fetchFn: typeof fetch = (globalThis as any).fetch;

// // Simple AED price table – adjust later to real values
// const TLD_PRICE_TABLE_AED: Record<string, number> = {
//   com: 45,
//   net: 40,
//   org: 38,
//   ae: 70,
// };

// export type RawAvailabilityMap = Record<
//   string,
//   { status: string; classkey?: string; actiontype?: string; entityid?: number }
// >;

// export type DomainAvailability = {
//   domain: string;
//   status: "available" | "taken" | "unknown";
//   rawStatus: string;
// };

// export type DomainQuote = DomainAvailability & {
//   tld: string;
//   priceAed: number | null;
//   includedAed: number;
//   extraAed: number;
//   isFreeWithPlan: boolean;
// };

// /**
//  * Get config fresh from process.env every time.
//  * This avoids issues with early destructuring.
//  */
// function getConfig() {
//   const apiBaseRaw =
//     process.env.RESELLERCLUB_API_BASE || "https://httpapi.com/api";
//   const apiBase = apiBaseRaw.replace(/\/+$/, "");

//   const userId = process.env.RESELLERCLUB_USERID;
//   const apiKey = process.env.RESELLERCLUB_API_KEY;
//   const includedAed = Number(process.env.DOMAIN_INCLUDED_AED || 50);

//   if (!userId || !apiKey) {
//     // Debug log so we can see what's actually there
//     console.error("❌ ResellerClub ENV MISSING:", {
//       RESELLERCLUB_API_BASE: process.env.RESELLERCLUB_API_BASE,
//       RESELLERCLUB_USERID: userId,
//       RESELLERCLUB_API_KEY: apiKey
//         ? apiKey.slice(0, 4) + "****"
//         : undefined,
//     });
//     throw new Error(
//       "ResellerClub API not configured. Set RESELLERCLUB_USERID and RESELLERCLUB_API_KEY in .env"
//     );
//   }

//   return {
//     apiBase,
//     userId,
//     apiKey,
//     includedAed,
//   };
// }

// /**
//  * Build URL with auth params.
//  */
// function buildUrl(path: string, params: URLSearchParams) {
//   const { apiBase, userId, apiKey } = getConfig();

//   params.set("auth-userid", userId);
//   params.set("api-key", apiKey);

//   return `${apiBase}${path}?${params.toString()}`;
// }

// /**
//  * Low-level: call ResellerClub /domains/available.json
//  */
// export async function checkDomainAvailabilityRaw(
//   domainName: string,
//   tlds: string[] = ["com"]
// ): Promise<RawAvailabilityMap> {
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
//     url.replace(
//       process.env.RESELLERCLUB_API_KEY || "",
//       "****"
//     )
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

//   return json as RawAvailabilityMap;
// }

// /**
//  * Convenience: returns a simple list for UI.
//  */
// export async function checkDomainAvailability(
//   domainName: string,
//   tlds: string[] = ["com"]
// ): Promise<DomainAvailability[]> {
//   const raw = await checkDomainAvailabilityRaw(domainName, tlds);
//   const result: DomainAvailability[] = [];

//   for (const [fullDomain, info] of Object.entries(raw)) {
//     const rawStatus = info?.status || "unknown";
//     const status: DomainAvailability["status"] =
//       rawStatus === "available" ? "available" : rawStatus ? "taken" : "unknown";

//     result.push({
//       domain: fullDomain,
//       status,
//       rawStatus,
//     });
//   }

//   return result;
// }

// /**
//  * Get availability + simple price + “free up to DOMAIN_INCLUDED_AED” logic
//  * for a single TLD.
//  */
// export async function getDomainQuote(
//   domainName: string,
//   tld: string
// ): Promise<DomainQuote> {
//   const { includedAed } = getConfig();

//   const cleanTld = tld.replace(/^\./, "").toLowerCase();
//   const availabilityList = await checkDomainAvailability(domainName, [
//     cleanTld,
//   ]);

//   const fullDomain = `${domainName.toLowerCase()}.${cleanTld}`;
//   const availability =
//     availabilityList.find((d) => d.domain === fullDomain) ??
//     ({
//       domain: fullDomain,
//       status: "unknown",
//       rawStatus: "unknown",
//     } as DomainAvailability);

//   const priceAed = TLD_PRICE_TABLE_AED[cleanTld] ?? null;

//   let isFreeWithPlan = false;
//   let extraAed = 0;

//   if (priceAed != null) {
//     if (priceAed <= includedAed) {
//       isFreeWithPlan = true;
//       extraAed = 0;
//     } else {
//       isFreeWithPlan = false;
//       extraAed = priceAed - includedAed;
//     }
//   }

//   return {
//     ...availability,
//     tld: cleanTld,
//     priceAed,
//     includedAed,
//     extraAed,
//     isFreeWithPlan,
//   };
// }























// backend/services/resellerclub.service.ts

// Use Node's built-in fetch (Node 18+)
const fetchFn: typeof fetch = (globalThis as any).fetch;

export type RawAvailabilityMap = Record<
  string,
  { status: string; classkey?: string; actiontype?: string; entityid?: number }
>;

export type DomainAvailability = {
  domain: string;
  status: "available" | "taken" | "unknown";
  rawStatus: string;
};

export type DomainQuote = DomainAvailability & {
  tld: string;
  priceAed: number | null; // real reseller price in your selling currency (AED)
  includedAed: number; // free credit from env
  extraAed: number; // price - includedAed (if any)
  isFreeWithPlan: boolean; // price <= includedAed
  currency?: string; // e.g. "AED" from ResellerClub
};

/* -------------------------------------------------------------------------- */
/*  CONFIG + URL HELPER                                                       */
/* -------------------------------------------------------------------------- */

function getConfig() {
  const apiBaseRaw =
    process.env.RESELLERCLUB_API_BASE || "https://httpapi.com/api";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");

  const userId = process.env.RESELLERCLUB_USERID;
  const apiKey = process.env.RESELLERCLUB_API_KEY;
  const includedAed = Number(process.env.DOMAIN_INCLUDED_AED || 50);
  const currency = process.env.RESELLERCLUB_CURRENCY || "AED";

  if (!userId || !apiKey) {
    console.error("❌ ResellerClub ENV MISSING:", {
      RESELLERCLUB_API_BASE: process.env.RESELLERCLUB_API_BASE,
      RESELLERCLUB_USERID: userId,
      RESELLERCLUB_API_KEY: apiKey ? apiKey.slice(0, 4) + "****" : undefined,
    });
    throw new Error(
      "ResellerClub API not configured. Set RESELLERCLUB_USERID and RESELLERCLUB_API_KEY in .env"
    );
  }

  return {
    apiBase,
    userId,
    apiKey,
    includedAed,
    currency,
  };
}

function buildUrl(path: string, params: URLSearchParams) {
  const { apiBase, userId, apiKey } = getConfig();

  params.set("auth-userid", userId);
  params.set("api-key", apiKey);

  return `${apiBase}${path}?${params.toString()}`;
}

/* -------------------------------------------------------------------------- */
/*  AVAILABILITY                                                              */
/* -------------------------------------------------------------------------- */

export async function checkDomainAvailabilityRaw(
  domainName: string,
  tlds: string[] = ["com"]
): Promise<RawAvailabilityMap> {
  const cleanName = domainName.trim().toLowerCase();
  if (!cleanName) {
    throw new Error("domainName is required");
  }

  const params = new URLSearchParams();
  params.set("domain-name", cleanName);

  tlds.forEach((tld) => {
    const cleanTld = tld.replace(/^\./, "").trim().toLowerCase();
    if (cleanTld) params.append("tlds", cleanTld);
  });

  const url = buildUrl("/domains/available.json", params);

  console.log(
    "[ResellerClub] Availability check:",
    url.replace(process.env.RESELLERCLUB_API_KEY || "", "****")
  );

  if (!fetchFn) {
    throw new Error(
      "global fetch is not available. Make sure you are running on Node.js 18+."
    );
  }

  const res = await fetchFn(url, { method: "GET" });

  let json: any = {};
  try {
    json = await res.json();
  } catch (e) {
    console.error("[ResellerClub] Failed to parse JSON:", e);
  }

  if (!res.ok) {
    console.error("[ResellerClub] HTTP error", res.status, json);
    throw new Error(
      `ResellerClub availability HTTP ${res.status} - ${
        json?.message || JSON.stringify(json)
      }`
    );
  }

  return json as RawAvailabilityMap;
}

export async function checkDomainAvailability(
  domainName: string,
  tlds: string[] = ["com"]
): Promise<DomainAvailability[]> {
  const raw = await checkDomainAvailabilityRaw(domainName, tlds);
  const result: DomainAvailability[] = [];

  for (const [fullDomain, info] of Object.entries(raw)) {
    const rawStatus = (info as any)?.status || "unknown";
    const status: DomainAvailability["status"] =
      rawStatus === "available" ? "available" : rawStatus ? "taken" : "unknown";

    result.push({
      domain: fullDomain,
      status,
      rawStatus,
    });
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*  PRICE FROM /products/customer-price.json (TLD PRODUCT KEY)                */
/* -------------------------------------------------------------------------- */

type CustomerPriceResponse = {
  privacy_protection?: string | number;
  premium_dns?: string | number;
  [productKey: string]: any;
};


function getProductKeyForTld(tld: string): string | null {
  const clean = tld.replace(/^\./, "").toLowerCase();

  const envMap: Record<string, string | undefined> = {
    com: process.env.RESELLERCLUB_TLDKEY_COM,
    net: process.env.RESELLERCLUB_TLDKEY_NET,
    org: process.env.RESELLERCLUB_TLDKEY_ORG,
    info: process.env.RESELLERCLUB_TLDKEY_INFO,
    store: process.env.RESELLERCLUB_TLDKEY_STORE,
    online: process.env.RESELLERCLUB_TLDKEY_ONLINE,
    ae: process.env.RESELLERCLUB_TLDKEY_AE,
  };

  const key = envMap[clean];
  if (!key) {
    console.error(
      "[ResellerClub] No product-key configured for TLD:",
      clean
    );
    return null;
  }

  return key;
}

















// function getProductKeyForTld(tld: string): string | null {
//   const clean = tld.replace(/^\./, "").toLowerCase();

//   const envMap: Record<string, string | undefined> = {
//     com: process.env.RESELLERCLUB_PRICEKEY_COM,
//     net: process.env.RESELLERCLUB_PRICEKEY_NET,
//     org: process.env.RESELLERCLUB_PRICEKEY_ORG,
//     info: process.env.RESELLERCLUB_PRICEKEY_INFO,
//     store: process.env.RESELLERCLUB_PRICEKEY_STORE,
//     online: process.env.RESELLERCLUB_PRICEKEY_ONLINE,
//     ae: process.env.RESELLERCLUB_PRICEKEY_AE,
//     biz: process.env.RESELLERCLUB_PRICEKEY_BIZ, // ✅ ADD THIS
//   };

//   const key = envMap[clean];
//   if (!key) {
//     console.error("[ResellerClub] No PRICE product-key configured for TLD:", clean);
//     return null;
//   }

//   return key;
// }






/**
 * Call /products/customer-price.json for the TLD and read the 1-year
 * "addnewdomain" price for the product-key (e.g. domcno for .com).
 */
async function fetchTldPriceAed(
  tld: string
): Promise<{ price: number | null; currency?: string }> {
  if (!fetchFn) {
    throw new Error(
      "global fetch is not available. Make sure you are running on Node.js 18+."
    );
  }

  const { currency } = getConfig();
  const productKey = getProductKeyForTld(tld);

  if (!productKey) {
    // No env set → cannot get price
    return { price: null, currency };
  }

  const params = new URLSearchParams();
  params.set("currency", currency);
  params.set("product-key", productKey);

  const url = buildUrl("/products/customer-price.json", params);

  console.log(
    "[ResellerClub] customer-price:",
    url.replace(process.env.RESELLERCLUB_API_KEY || "", "****")
  );

  const res = await fetchFn(url, { method: "GET" });
  let json: CustomerPriceResponse | any = {};
  try {
    json = (await res.json()) as CustomerPriceResponse;
  } catch (e) {
    console.error("[ResellerClub] customer-price JSON parse error:", e);
  }

  if (!res.ok) {
    console.error("[ResellerClub] customer-price HTTP error", res.status, json);
    throw new Error(
      `ResellerClub customer-price HTTP ${res.status} - ${
        (json && json.message) || JSON.stringify(json)
      }`
    );
  }

  const productNode = (json as any)[productKey] || {};
  const addNew = productNode.addnewdomain || {};
  const oneYearStr: string | number | undefined = addNew["1"];

  if (oneYearStr === undefined || oneYearStr === null) {
    console.warn(
      "[ResellerClub] No 1-year addnewdomain price found for product-key",
      productKey
    );
    return { price: null, currency };
  }

  const numeric = Number(oneYearStr);
  if (!Number.isFinite(numeric)) {
    console.warn(
      "[ResellerClub] Non-numeric price for product-key",
      productKey,
      "value:",
      oneYearStr
    );
    return { price: null, currency };
  }

  return { price: numeric, currency };
}

/* -------------------------------------------------------------------------- */
/*  QUOTE = AVAILABILITY + REAL PRICE + FREE CREDIT LOGIC                     */
/* -------------------------------------------------------------------------- */

export async function getDomainQuote(
  domainName: string,
  tld: string
): Promise<DomainQuote> {
  const { includedAed } = getConfig();

  const cleanName = domainName.trim().toLowerCase();
  const cleanTld = tld.replace(/^\./, "").toLowerCase();
  const fullDomain = `${cleanName}.${cleanTld}`;

  // 1) Availability
  const availabilityList = await checkDomainAvailability(cleanName, [
    cleanTld,
  ]);

  const availability =
    availabilityList.find((d) => d.domain === fullDomain) ??
    ({
      domain: fullDomain,
      status: "unknown",
      rawStatus: "unknown",
    } as DomainAvailability);

  // 2) Live price based on TLD product-key (no hard-coded price)
  let priceAed: number | null = null;
  let currency: string | undefined;

  try {
    const { price, currency: cur } = await fetchTldPriceAed(cleanTld);
    priceAed = price;
    currency = cur;
  } catch (err) {
    console.error("[ResellerClub] customer-price failed:", err);
    // keep priceAed = null so UI can show "Price unavailable"
  }

  // 3) Apply “included in plan” logic
  let isFreeWithPlan = false;
  let extraAed = 0;

  if (priceAed != null) {
    if (priceAed <= includedAed) {
      isFreeWithPlan = true;
      extraAed = 0;
    } else {
      isFreeWithPlan = false;
      extraAed = priceAed - includedAed;
    }
  }

  return {
    ...availability,
    tld: cleanTld,
    priceAed,
    includedAed,
    extraAed,
    isFreeWithPlan,
    currency,
  };
}
