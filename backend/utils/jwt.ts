// backend/utils/jwt.ts
import jwt, { type SignOptions } from "jsonwebtoken";

export type JwtPayload = { uid: string; email: string; role: string; name: string };

// --- normalize env ---
const RAW_JWT_SECRET = (process.env.JWT_SECRET ?? "").trim();
if (!RAW_JWT_SECRET) throw new Error("Missing JWT_SECRET");
const JWT_SECRET: jwt.Secret = RAW_JWT_SECRET;

// Convert env to the exact union type jsonwebtoken expects
function normalizeExpires(raw: unknown): SignOptions["expiresIn"] {
  const v = String(raw ?? "7d").trim();
  // number of seconds? allow digits-only as number
  if (/^\d+$/.test(v)) return Number(v);
  // otherwise treat as ms StringValue ("7d", "1h", "30m", etc.)
  return v as unknown as SignOptions["expiresIn"];
}

const JWT_EXPIRES: SignOptions["expiresIn"] = normalizeExpires(process.env.JWT_EXPIRES);
export const COOKIE_NAME = process.env.COOKIE_NAME || "ion7_auth";

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
