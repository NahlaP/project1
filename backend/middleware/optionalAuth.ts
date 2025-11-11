// backend/middleware/optionalAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function optionalAuth(req: any, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = { userId: payload?.userId };
    }
  } catch {
    // ignore if token invalid or missing
  }
  next();
}
