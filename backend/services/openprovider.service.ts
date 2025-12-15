



// // backend/services/openprovider.service.ts
// import axios, { AxiosInstance } from "axios";

// type LoginResp = {
//   code: number;
//   desc: string;
//   data?: { token: string; reseller_id: number };
// };

// type Money = { price: number | null; currency: string | null };

// export class OpenproviderService {
//   private http: AxiosInstance;
//   private token: string | null = null;
//   private tokenExpiresAtMs = 0;

//   constructor() {
//     const baseURL =
//       process.env.OPENPROVIDER_BASE_URL || "https://api.openprovider.eu/v1beta";

//     this.http = axios.create({
//       baseURL,
//       timeout: 30_000,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   private get ttlMs() {
//     const ttlSeconds = Number(process.env.OPENPROVIDER_TOKEN_TTL_SECONDS || 172800); // 48h
//     return ttlSeconds * 1000;
//   }

//   private async loginAndCacheToken() {
//     const username = process.env.OPENPROVIDER_USERNAME;
//     const password = process.env.OPENPROVIDER_PASSWORD;

//     if (!username || !password) {
//       throw new Error("Missing OPENPROVIDER_USERNAME or OPENPROVIDER_PASSWORD in env.");
//     }

//     const { data } = await this.http.post<LoginResp>("/auth/login", { username, password });

//     if (!data?.data?.token) {
//       throw new Error(`Openprovider login failed: ${data?.desc || "no token returned"}`);
//     }

//     this.token = data.data.token;
//     this.tokenExpiresAtMs = Date.now() + this.ttlMs;
//     return this.token;
//   }

//   private async getToken() {
//     // refresh 60s early
//     if (this.token && Date.now() < this.tokenExpiresAtMs - 60_000) {
//       return this.token;
//     }
//     return this.loginAndCacheToken();
//   }

//   private async authed() {
//     const token = await this.getToken();

//     return axios.create({
//       baseURL: this.http.defaults.baseURL,
//       timeout: 30_000,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//   }

//   /** Simple health/test: confirms token generation works */
//   async whoAmI() {
//     await this.authed();
//     return { ok: true, tokenActive: true };
//   }

//   private splitDomain(domain: string) {
//     const cleaned = String(domain || "").trim().toLowerCase();
//     const parts = cleaned.split(".").filter(Boolean);

//     if (parts.length < 2) {
//       throw new Error("Invalid domain. Use format like google.com");
//     }

//     const extension = parts.pop() as string;
//     const name = parts.join(".");
//     return { name, extension, domain: `${name}.${extension}` };
//   }

//   private normalizeMoneyFromCheckResult(result: any): Money {
//     // Openprovider shapes can vary; we try the best known paths.
//     const resellerPrice =
//       result?.price?.reseller?.price ??
//       result?.price?.reseller_price ??
//       result?.reseller?.price ??
//       null;

//     const resellerCurrency =
//       result?.price?.reseller?.currency ??
//       result?.price?.reseller_currency ??
//       result?.reseller?.currency ??
//       null;

//     const productPrice =
//       result?.price?.product?.price ??
//       result?.price?.product_price ??
//       result?.product?.price ??
//       null;

//     const productCurrency =
//       result?.price?.product?.currency ??
//       result?.price?.product_currency ??
//       result?.product?.currency ??
//       null;

//     const price =
//       typeof resellerPrice === "number"
//         ? resellerPrice
//         : typeof productPrice === "number"
//         ? productPrice
//         : null;

//     const currency =
//       (typeof resellerCurrency === "string" && resellerCurrency) ||
//       (typeof productCurrency === "string" && productCurrency) ||
//       null;

//     return { price, currency };
//   }

//   private normalizeMoneyFromTransferPrice(raw: any): Money {
//     // Transfer pricing endpoint might return arrays or nested
//     // We attempt common shapes:
//     const resellerPrice =
//       raw?.data?.price?.reseller?.price ??
//       raw?.price?.reseller?.price ??
//       raw?.data?.reseller?.price ??
//       raw?.reseller?.price ??
//       null;

//     const resellerCurrency =
//       raw?.data?.price?.reseller?.currency ??
//       raw?.price?.reseller?.currency ??
//       raw?.data?.reseller?.currency ??
//       raw?.reseller?.currency ??
//       null;

//     const productPrice =
//       raw?.data?.price?.product?.price ??
//       raw?.price?.product?.price ??
//       raw?.data?.product?.price ??
//       raw?.product?.price ??
//       null;

//     const productCurrency =
//       raw?.data?.price?.product?.currency ??
//       raw?.price?.product?.currency ??
//       raw?.data?.product?.currency ??
//       raw?.product?.currency ??
//       null;

//     const price =
//       typeof resellerPrice === "number"
//         ? resellerPrice
//         : typeof productPrice === "number"
//         ? productPrice
//         : null;

//     const currency =
//       (typeof resellerCurrency === "string" && resellerCurrency) ||
//       (typeof productCurrency === "string" && productCurrency) ||
//       null;

//     return { price, currency };
//   }

//   /**
//    * ✅ Single domain check (availability only)
//    * POST /domains/check
//    */
//   async domainCheck(domain: string) {
//     const h = await this.authed();
//     const { name, extension } = this.splitDomain(domain);

//     const payload = {
//       domains: [{ name, extension }],
//       with_price: false,
//       with_whois: false,
//     };

//     try {
//       const { data } = await h.post("/domains/check", payload);
//       return data;
//     } catch (err: any) {
//       const status = err?.response?.status;
//       const body = err?.response?.data;
//       throw new Error(
//         `Openprovider domainCheck failed (${status}): ${
//           body ? JSON.stringify(body) : err?.message || "unknown error"
//         }`
//       );
//     }
//   }

//   /**
//    * ✅ Multi-TLD search + pricing
//    * POST /domains/check with with_price:true
//    */
//   async searchDomainsWithPrice(name: string, tlds: string[]) {
//     const h = await this.authed();

//     const cleanName = String(name || "").trim().toLowerCase();
//     if (!cleanName) throw new Error("name required");

//     const cleanTlds = (tlds || [])
//       .map((x) => String(x || "").trim().toLowerCase().replace(/^\./, ""))
//       .filter(Boolean);

//     if (cleanTlds.length === 0) throw new Error("tlds required");

//     const payload = {
//       domains: cleanTlds.map((ext) => ({ name: cleanName, extension: ext })),
//       with_price: true,
//       with_whois: false,
//     };

//     try {
//       const { data } = await h.post("/domains/check", payload);
//       return data;
//     } catch (err: any) {
//       const status = err?.response?.status;
//       const body = err?.response?.data;
//       throw new Error(
//         `Openprovider searchDomainsWithPrice failed (${status}): ${
//           body ? JSON.stringify(body) : err?.message || "unknown error"
//         }`
//       );
//     }
//   }

//   /**
//    * ✅ NEW: Quote (normalized) for checkout
//    * - For "new": use /domains/check with with_price:true on exactly this domain
//    * - Returns: { domain, available?, price, currency, raw }
//    */
//   async registrationQuote(domain: string) {
//     const h = await this.authed();
//     const { name, extension, domain: fullDomain } = this.splitDomain(domain);

//     const payload = {
//       domains: [{ name, extension }],
//       with_price: true,
//       with_whois: false,
//     };

//     try {
//       const { data } = await h.post("/domains/check", payload);

//       const results =
//         data?.data?.results ||
//         data?.results ||
//         data?.data?.data?.results ||
//         [];

//       const first = Array.isArray(results) ? results[0] : null;

//       const status = String(first?.status || "").toLowerCase();
//       const available = status === "free" || status === "available";

//       const money = this.normalizeMoneyFromCheckResult(first);

//       return {
//         domain: fullDomain,
//         available,
//         status,
//         price: money.price,
//         currency: money.currency,
//         raw: data,
//       };
//     } catch (err: any) {
//       const status = err?.response?.status;
//       const body = err?.response?.data;
//       throw new Error(
//         `Openprovider registrationQuote failed (${status}): ${
//           body ? JSON.stringify(body) : err?.message || "unknown error"
//         }`
//       );
//     }
//   }

//   /**
//    * ✅ Transfer price
//    * GET /domains/prices?domain.name=...&domain.extension=...&operation=transfer
//    */
//   async transferPrice(domain: string) {
//     const h = await this.authed();
//     const { name, extension } = this.splitDomain(domain);

//     try {
//       const { data } = await h.get("/domains/prices", {
//         params: {
//           "domain.name": name,
//           "domain.extension": extension,
//           operation: "transfer",
//         },
//       });
//       return data;
//     } catch (err: any) {
//       const status = err?.response?.status;
//       const body = err?.response?.data;
//       throw new Error(
//         `Openprovider transferPrice failed (${status}): ${
//           body ? JSON.stringify(body) : err?.message || "unknown error"
//         }`
//       );
//     }
//   }

//   /**
//    * ✅ NEW: Transfer quote (normalized) for checkout
//    * Returns: { domain, price, currency, raw }
//    */
//   async transferQuote(domain: string) {
//     const { domain: fullDomain } = this.splitDomain(domain);
//     const raw = await this.transferPrice(fullDomain);
//     const money = this.normalizeMoneyFromTransferPrice(raw);

//     return {
//       domain: fullDomain,
//       price: money.price,
//       currency: money.currency,
//       raw,
//     };
//   }
// }























// backend/services/openprovider.service.ts
import axios, { AxiosInstance } from "axios";

type LoginResp = {
  code: number;
  desc: string;
  data?: { token: string; reseller_id: number };
};

type Money = { price: number | null; currency: string | null };

type DomainParts = { name: string; extension: string; domain: string };

export class OpenproviderService {
  private http: AxiosInstance;
  private token: string | null = null;
  private tokenExpiresAtMs = 0;

  constructor() {
    const baseURL =
      process.env.OPENPROVIDER_BASE_URL || "https://api.openprovider.eu/v1beta";

    this.http = axios.create({
      baseURL,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });
  }

  private get ttlMs() {
    const ttlSeconds = Number(process.env.OPENPROVIDER_TOKEN_TTL_SECONDS || 172800); // 48h
    return ttlSeconds * 1000;
  }

  private async loginAndCacheToken() {
    const username = process.env.OPENPROVIDER_USERNAME;
    const password = process.env.OPENPROVIDER_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing OPENPROVIDER_USERNAME or OPENPROVIDER_PASSWORD in env.");
    }

    const { data } = await this.http.post<LoginResp>("/auth/login", { username, password });

    if (!data?.data?.token) {
      throw new Error(`Openprovider login failed: ${data?.desc || "no token returned"}`);
    }

    this.token = data.data.token;
    this.tokenExpiresAtMs = Date.now() + this.ttlMs;
    return this.token;
  }

  private async getToken() {
    // refresh 60s early
    if (this.token && Date.now() < this.tokenExpiresAtMs - 60_000) {
      return this.token;
    }
    return this.loginAndCacheToken();
  }

  private async authed() {
    const token = await this.getToken();

    return axios.create({
      baseURL: this.http.defaults.baseURL,
      timeout: 30_000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /** Simple health/test: confirms token generation works */
  async whoAmI() {
    await this.authed();
    return { ok: true, tokenActive: true };
  }

  private splitDomain(domain: string): DomainParts {
    const cleaned = String(domain || "").trim().toLowerCase();
    const parts = cleaned.split(".").filter(Boolean);

    if (parts.length < 2) {
      throw new Error("Invalid domain. Use format like google.com");
    }

    const extension = parts.pop() as string;
    const name = parts.join(".");
    return { name, extension, domain: `${name}.${extension}` };
  }

  private normalizeMoneyFromCheckResult(result: any): Money {
    // Openprovider shapes can vary; we try the best known paths.
    const resellerPrice =
      result?.price?.reseller?.price ??
      result?.price?.reseller_price ??
      result?.reseller?.price ??
      null;

    const resellerCurrency =
      result?.price?.reseller?.currency ??
      result?.price?.reseller_currency ??
      result?.reseller?.currency ??
      null;

    const productPrice =
      result?.price?.product?.price ??
      result?.price?.product_price ??
      result?.product?.price ??
      null;

    const productCurrency =
      result?.price?.product?.currency ??
      result?.price?.product_currency ??
      result?.product?.currency ??
      null;

    const price =
      typeof resellerPrice === "number"
        ? resellerPrice
        : typeof productPrice === "number"
        ? productPrice
        : null;

    const currency =
      (typeof resellerCurrency === "string" && resellerCurrency) ||
      (typeof productCurrency === "string" && productCurrency) ||
      null;

    return { price, currency };
  }

  private normalizeMoneyFromTransferPrice(raw: any): Money {
    const resellerPrice =
      raw?.data?.price?.reseller?.price ??
      raw?.price?.reseller?.price ??
      raw?.data?.reseller?.price ??
      raw?.reseller?.price ??
      null;

    const resellerCurrency =
      raw?.data?.price?.reseller?.currency ??
      raw?.price?.reseller?.currency ??
      raw?.data?.reseller?.currency ??
      raw?.reseller?.currency ??
      null;

    const productPrice =
      raw?.data?.price?.product?.price ??
      raw?.price?.product?.price ??
      raw?.data?.product?.price ??
      raw?.product?.price ??
      null;

    const productCurrency =
      raw?.data?.price?.product?.currency ??
      raw?.price?.product?.currency ??
      raw?.data?.product?.currency ??
      raw?.product?.currency ??
      null;

    const price =
      typeof resellerPrice === "number"
        ? resellerPrice
        : typeof productPrice === "number"
        ? productPrice
        : null;

    const currency =
      (typeof resellerCurrency === "string" && resellerCurrency) ||
      (typeof productCurrency === "string" && productCurrency) ||
      null;

    return { price, currency };
  }

  /* ===================== CHECK / QUOTES ===================== */

  /**
   * ✅ Single domain check (availability only)
   * POST /domains/check
   */
  async domainCheck(domain: string) {
    const h = await this.authed();
    const { name, extension } = this.splitDomain(domain);

    const payload = {
      domains: [{ name, extension }],
      with_price: false,
      with_whois: false,
    };

    try {
      const { data } = await h.post("/domains/check", payload);
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider domainCheck failed (${status}): ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }

  /**
   * ✅ Multi-TLD search + pricing
   * POST /domains/check with with_price:true
   */
  async searchDomainsWithPrice(name: string, tlds: string[]) {
    const h = await this.authed();

    const cleanName = String(name || "").trim().toLowerCase();
    if (!cleanName) throw new Error("name required");

    const cleanTlds = (tlds || [])
      .map((x) => String(x || "").trim().toLowerCase().replace(/^\./, ""))
      .filter(Boolean);

    if (cleanTlds.length === 0) throw new Error("tlds required");

    const payload = {
      domains: cleanTlds.map((ext) => ({ name: cleanName, extension: ext })),
      with_price: true,
      with_whois: false,
    };

    try {
      const { data } = await h.post("/domains/check", payload);
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider searchDomainsWithPrice failed (${status}): ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }

  /**
   * ✅ Quote (normalized) for checkout
   * For "new": /domains/check with with_price:true on exactly this domain
   */
  async registrationQuote(domain: string) {
    const h = await this.authed();
    const { name, extension, domain: fullDomain } = this.splitDomain(domain);

    const payload = {
      domains: [{ name, extension }],
      with_price: true,
      with_whois: false,
    };

    try {
      const { data } = await h.post("/domains/check", payload);

      const results =
        data?.data?.results ||
        data?.results ||
        data?.data?.data?.results ||
        [];

      const first = Array.isArray(results) ? results[0] : null;

      const status = String(first?.status || "").toLowerCase();
      const available = status === "free" || status === "available";

      const money = this.normalizeMoneyFromCheckResult(first);

      return {
        domain: fullDomain,
        available,
        status,
        price: money.price,
        currency: money.currency,
        raw: data,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider registrationQuote failed (${status}): ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }

  /**
   * ✅ Transfer price
   * GET /domains/prices?domain.name=...&domain.extension=...&operation=transfer
   */
  async transferPrice(domain: string) {
    const h = await this.authed();
    const { name, extension } = this.splitDomain(domain);

    try {
      const { data } = await h.get("/domains/prices", {
        params: {
          "domain.name": name,
          "domain.extension": extension,
          operation: "transfer",
        },
      });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider transferPrice failed (${status}): ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }

  /**
   * ✅ Transfer quote (normalized) for checkout
   */
  async transferQuote(domain: string) {
    const { domain: fullDomain } = this.splitDomain(domain);
    const raw = await this.transferPrice(fullDomain);
    const money = this.normalizeMoneyFromTransferPrice(raw);

    return {
      domain: fullDomain,
      price: money.price,
      currency: money.currency,
      raw,
    };
  }

  /* ===================== PURCHASE / ACTIONS ===================== */

  /**
   * ✅ REGISTER DOMAIN (after Stripe payment)
   * POST /domains/register
   *
   * Note:
   * - You MUST pass a valid Openprovider contact handle (OPCxxxx-XX).
   * - Period = years (usually 1).
   */
  async registerDomain(args: {
    domain: string;
    period?: number; // years
    ownerHandle: string;
    adminHandle?: string;
    techHandle?: string;
    billingHandle?: string;
    nameservers?: string[];
  }) {
    const h = await this.authed();
    const { name, extension, domain: fullDomain } = this.splitDomain(args.domain);

    if (!args.ownerHandle) throw new Error("ownerHandle is required");

    const payload: any = {
      domain: { name, extension },
      period: args.period ?? 1,

      owner_handle: args.ownerHandle,
      admin_handle: args.adminHandle ?? args.ownerHandle,
      tech_handle: args.techHandle ?? args.ownerHandle,
      billing_handle: args.billingHandle ?? args.ownerHandle,

      ...(args.nameservers?.length
        ? { name_servers: args.nameservers.map((ns) => ({ name: ns })) }
        : {}),
    };

    try {
      const { data } = await h.post("/domains/register", payload);
      return { domain: fullDomain, raw: data };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider registerDomain failed (${status}) ${fullDomain}: ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }

  /**
   * ✅ SUBMIT TRANSFER (after Stripe payment)
   * POST /domains/transfer
   *
   * Note:
   * - authCode is required for transfer
   * - You MUST pass a valid contact handle (OPCxxxx-XX)
   */
  async submitTransfer(args: {
    domain: string;
    authCode: string;
    ownerHandle: string;
    adminHandle?: string;
    techHandle?: string;
    billingHandle?: string;
    nameservers?: string[];
  }) {
    const h = await this.authed();
    const { name, extension, domain: fullDomain } = this.splitDomain(args.domain);

    if (!args.ownerHandle) throw new Error("ownerHandle is required");
    if (!args.authCode) throw new Error("authCode is required");

    const payload: any = {
      domain: { name, extension },
      auth_code: args.authCode,

      owner_handle: args.ownerHandle,
      admin_handle: args.adminHandle ?? args.ownerHandle,
      tech_handle: args.techHandle ?? args.ownerHandle,
      billing_handle: args.billingHandle ?? args.ownerHandle,

      ...(args.nameservers?.length
        ? { name_servers: args.nameservers.map((ns) => ({ name: ns })) }
        : {}),
    };

    try {
      const { data } = await h.post("/domains/transfer", payload);
      return { domain: fullDomain, raw: data };
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      throw new Error(
        `Openprovider submitTransfer failed (${status}) ${fullDomain}: ${
          body ? JSON.stringify(body) : err?.message || "unknown error"
        }`
      );
    }
  }
}
