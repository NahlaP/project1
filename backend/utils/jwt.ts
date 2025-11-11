

// import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

// const RAW_SECRET = (process.env.JWT_SECRET ?? "").trim();
// if (!RAW_SECRET) throw new Error("Missing JWT_SECRET");
// const JWT_SECRET: Secret = RAW_SECRET as Secret;

// const RAW_EXPIRES = (process.env.JWT_EXPIRES_IN ?? "7d").trim();
// const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
//   /^\d+$/.test(RAW_EXPIRES) ? Number(RAW_EXPIRES) : (RAW_EXPIRES as any);

// export type JwtPayload = { userId: string; email?: string };

// export function signJwt(payload: JwtPayload): string {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }
// export function verifyJwt<T = JwtPayload>(token: string): T {
//   return jwt.verify(token, JWT_SECRET) as T;
// }





import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

const RAW_SECRET = (process.env.JWT_SECRET ?? "").trim();
if (!RAW_SECRET) throw new Error("Missing JWT_SECRET");
const JWT_SECRET: Secret = RAW_SECRET as Secret;

const RAW_EXPIRES = (process.env.JWT_EXPIRES_IN ?? "7d").trim();
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  /^\d+$/.test(RAW_EXPIRES) ? Number(RAW_EXPIRES) : (RAW_EXPIRES as any);

export type JwtPayload = { userId: string; email?: string };

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
