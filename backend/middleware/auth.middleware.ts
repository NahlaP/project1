



// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// export interface AuthedUser {
//   userId: string;
//   email?: string;
// }
// declare module "express-serve-static-core" {
//   interface Request {
//     user?: AuthedUser;
//   }
// }

// export function requireAuth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const h = req.headers.authorization || "";
//     const m = h.match(/^Bearer\s+(.+)$/i);
//     if (!m) return res.status(401).json({ error: "Missing token" });

//     const payload = jwt.verify(m[1], JWT_SECRET) as { userId?: string; id?: string; email?: string };
//     const userId = payload.userId || (payload as any).id;
//     if (!userId) return res.status(401).json({ error: "Invalid token" });

//     req.user = { userId, email: payload.email };
//     return next();
//   } catch (e) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }












import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthedUser { userId: string; email?: string }
declare module "express-serve-static-core" { interface Request { user?: AuthedUser } }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const m = (req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
    const token =
      (m && m[1]) ||
      (req as any).cookies?.auth_token ||           // cookie fallback
      (req.query.token as string | undefined);

    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifyJwt(token);
    if (!payload?.userId) return res.status(401).json({ error: "Invalid token" });

    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
