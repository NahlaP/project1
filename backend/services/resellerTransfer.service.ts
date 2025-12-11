// backend/services/resellerTransfer.service.ts
import axios from "axios";

const BASE = process.env.RESELLERCLUB_API_BASE!;
const RC_USER = process.env.RESELLERCLUB_USERID!;
const RC_KEY = process.env.RESELLERCLUB_API_KEY!;

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
  const params = new URLSearchParams({
    "auth-userid": RC_USER,
    "api-key": RC_KEY,
  });
  return `${BASE}${path}?${params.toString()}`;
}

/**
 * Returns original transfer cost for a TLD from ResellerClub.
 */
export async function getTldTransferCost(tld: string): Promise<number | null> {
  const key = PRICE_KEYS[tld];

  if (!key) {
    throw new Error(`No product key configured for TLD: ${tld}`);
  }

  const url = buildUrl("/products/customer-price.json");

  const res = await axios.get(url);
  const data = res.data || {};
  const product = data[key];

  if (!product) {
    throw new Error(`No pricing data found for productKey ${key} (tld=${tld})`);
  }

  const raw =
    product.addtransferdomain?.["1"] ??
    product.transferdomain?.["1"] ??
    null;

  if (!raw) {
    return null; // transfer not set for this tld
  }

  const num = parseFloat(raw);
  if (Number.isNaN(num)) {
    throw new Error(`Transfer cost is not a valid number for ${tld}: ${raw}`);
  }

  return num;
}
