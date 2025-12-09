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

// Optional fallback AED price table – only used if live call fails
const TLD_PRICE_TABLE_AED: Record<string, number> = {
  com: 45,
  net: 40,
  org: 38,
  ae: 70,
  // you can add more fallback values here if you want:
  // store: 200,
  // online: 150,
};

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
  priceAed: number | null;     // real reseller price in your selling currency
  includedAed: number;         // free credit from env
  extraAed: number;            // price - includedAed (if any)
  isFreeWithPlan: boolean;     // price <= includedAed
  currency?: string;           // e.g. "AED" from ResellerClub
};

/**
 * Get config fresh from process.env every time.
 * This avoids issues with early destructuring.
 */
function getConfig() {
  const apiBaseRaw =
    process.env.RESELLERCLUB_API_BASE || "https://httpapi.com/api";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");

  const userId = process.env.RESELLERCLUB_USERID;
  const apiKey = process.env.RESELLERCLUB_API_KEY;
  const includedAed = Number(process.env.DOMAIN_INCLUDED_AED || 50);

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
  };
}

/**
 * Build URL with auth params.
 */
function buildUrl(path: string, params: URLSearchParams) {
  const { apiBase, userId, apiKey } = getConfig();

  params.set("auth-userid", userId);
  params.set("api-key", apiKey);

  return `${apiBase}${path}?${params.toString()}`;
}

/* -------------------------------------------------------------------------- */
/*  AVAILABILITY                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Low-level: call ResellerClub /domains/available.json
 */
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

/**
 * Convenience: returns a simple list for UI.
 */
export async function checkDomainAvailability(
  domainName: string,
  tlds: string[] = ["com"]
): Promise<DomainAvailability[]> {
  const raw = await checkDomainAvailabilityRaw(domainName, tlds);
  const result: DomainAvailability[] = [];

  for (const [fullDomain, info] of Object.entries(raw)) {
    const rawStatus = info?.status || "unknown";
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
/*  PRICE (LIVE FROM RESELLERCLUB)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Shape of /domains/premium-check.json (we only care about price fields).
 * Using loose typing here to avoid TS errors like "privacy-protection".
 */
type PremiumCheckResponse = {
  premium?: boolean;
  costHash?: {
    create?: string;
    renew?: string;
    transfer?: string;
    sellingCurrencySymbol?: string;
    [key: string]: any;
  };
  resellerCostPriceHash?: {
    create?: string;
    renew?: string;
    transfer?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

/**
 * Call /domains/premium-check.json and return the "create" price
 * in your selling currency (typically AED).
 */
async function fetchResellerPriceForDomain(
  fullDomain: string
): Promise<{ price: number | null; currency?: string }> {
  if (!fetchFn) {
    throw new Error(
      "global fetch is not available. Make sure you are running on Node.js 18+."
    );
  }

  const params = new URLSearchParams();
  params.set("domain-name", fullDomain);

  const url = buildUrl("/domains/premium-check.json", params);

  console.log(
    "[ResellerClub] Premium check (price):",
    url.replace(process.env.RESELLERCLUB_API_KEY || "", "****")
  );

  const res = await fetchFn(url, { method: "GET" });
  let json: PremiumCheckResponse | any = {};
  try {
    json = (await res.json()) as PremiumCheckResponse;
  } catch (e) {
    console.error("[ResellerClub] premium-check JSON parse error:", e);
  }

  if (!res.ok) {
    console.error("[ResellerClub] premium-check HTTP error", res.status, json);
    throw new Error(
      `ResellerClub premium-check HTTP ${res.status} - ${
        (json && json.message) || JSON.stringify(json)
      }`
    );
  }

  // Prefer customer price in costHash.create
  const cost = json.costHash || {};
  const createPriceStr: string | undefined =
    cost.create ||
    // fallback to renew/transfer just in case
    cost.renew ||
    cost.transfer;

  const rawCurrency: string | undefined = cost.sellingCurrencySymbol;

  if (!createPriceStr) {
    return { price: null, currency: rawCurrency };
  }

  const numeric = Number(createPriceStr);
  if (Number.isNaN(numeric)) {
    return { price: null, currency: rawCurrency };
  }

  return { price: numeric, currency: rawCurrency };
}

/* -------------------------------------------------------------------------- */
/*  QUOTE = AVAILABILITY + PRICE + FREE CREDIT LOGIC                          */
/* -------------------------------------------------------------------------- */

/**
 * Get availability + live ResellerClub price + “free up to DOMAIN_INCLUDED_AED”
 * logic for a single TLD.
 */
export async function getDomainQuote(
  domainName: string,
  tld: string
): Promise<DomainQuote> {
  const { includedAed } = getConfig();

  const cleanName = domainName.trim().toLowerCase();
  const cleanTld = tld.replace(/^\./, "").toLowerCase();
  const fullDomain = `${cleanName}.${cleanTld}`;

  // 1) Availability (same as before)
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

  // 2) Live price from ResellerClub
  let priceAed: number | null = null;
  let currency: string | undefined;

  try {
    const { price, currency: cur } = await fetchResellerPriceForDomain(
      fullDomain
    );
    priceAed = price;
    currency = cur;
  } catch (err) {
    console.error(
      "[ResellerClub] premium-check failed, falling back to static table:",
      err
    );
    // Fallback ONLY if live API fails
    priceAed = TLD_PRICE_TABLE_AED[cleanTld] ?? null;
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
