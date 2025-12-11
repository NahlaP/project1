// backend/services/resellerTransfer.service.ts

const fetchFn: typeof fetch = (globalThis as any).fetch;

const BASE = process.env.RESELLERCLUB_API_BASE!;
const RC_USER = process.env.RESELLERCLUB_USERID!;
const RC_KEY = process.env.RESELLERCLUB_API_KEY!;

// PRICE KEYS (from your .env)
const PRICE_KEYS: Record<string, string> = {
  com: process.env.RESELLERCLUB_PRICEKEY_COM!,
  net: process.env.RESELLERCLUB_PRICEKEY_NET!,
  org: process.env.RESELLERCLUB_PRICEKEY_ORG!,
  info: process.env.RESELLERCLUB_PRICEKEY_INFO!,
  store: process.env.RESELLERCLUB_PRICEKEY_STORE!,
  online: process.env.RESELLERCLUB_PRICEKEY_ONLINE!,
  ae: process.env.RESELLERCLUB_PRICEKEY_AE!,
  biz: process.env.RESELLERCLUB_PRICEKEY_BIZ!,
};

function buildUrl(path: string) {
  return `${BASE}${path}?auth-userid=${RC_USER}&api-key=${RC_KEY}`;
}

export async function getTldTransferCost(tld: string): Promise<number | null> {
  const key = PRICE_KEYS[tld];

  if (!key) {
    throw new Error(`No product key for TLD: ${tld}`);
  }

  const url = buildUrl("/products/customer-price.json");
  const res = await fetchFn(url);

  if (!res.ok) {
    throw new Error(`ResellerClub Error: ${res.status}`);
  }

  const data = await res.json();
  const product = data[key];

  if (!product) {
    throw new Error(`Pricing not found for TLD: ${tld}`);
  }

  // Transfer price is inside: addtransferdomain["1"]
  const costStr =
    product.addtransferdomain?.["1"] ??
    product.transferdomain?.["1"] ??
    null;

  if (!costStr) return null;

  return parseFloat(costStr); // AED amount
}
