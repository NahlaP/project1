// backend/controllers/changeauth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signJwt } from "../utils/jwt";

type Env = {
  COOKIE_NAME?: string;
  COOKIE_SECURE?: string;
};

const { COOKIE_NAME, COOKIE_SECURE } = process.env as Env;
const cookieName = COOKIE_NAME || "auth_token";
const cookieSecure = COOKIE_SECURE === "true";

type AuthedReq = Request & { user?: { userId: string; email?: string } };

function setAuthCookie(res: Response, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/* ---------------------------------------------------
 * PATCH /api/auth/profile   (Account details widget)
 * body: { fullName?, company?, country? }
 * --------------------------------------------------- */
export async function updateProfile(req: AuthedReq, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const fullName = req.body.fullName?.toString().trim();
    const company =
      req.body.company !== undefined
        ? req.body.company.toString().trim()
        : undefined;
    const country =
      req.body.country !== undefined
        ? req.body.country.toString().trim()
        : undefined;

    const update: any = {};
    if (fullName) update.fullName = fullName;
    if (company !== undefined) update.company = company || null;
    if (country !== undefined) update.country = country || null;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "No profile fields to update" });
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const plain =
      typeof (user as any).toObject === "function"
        ? (user as any).toObject()
        : user;
    delete plain.password;

    return res.json({ success: true, user: plain });
  } catch (e) {
    console.error("[changeauth.updateProfile] error", e);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}

/* ---------------------------------------------------
 * POST /api/auth/change-email
 * body: { currentPassword, newEmail }
 * --------------------------------------------------- */
export async function changeEmail(req: AuthedReq, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const currentPassword = String(req.body?.currentPassword || "");
    const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();

    if (!currentPassword || !newEmail) {
      return res
        .status(400)
        .json({ error: "currentPassword and newEmail are required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (user.email === newEmail) {
      return res
        .status(400)
        .json({ error: "New email must be different from current email" });
    }

    const existing = await User.findOne({
      _id: { $ne: userId },
      email: newEmail,
    });
    if (existing) {
      return res.status(409).json({ error: "Email is already in use" });
    }

    user.email = newEmail;
    await user.save();

    // issue new JWT so token email matches new email
    const token = signJwt({ userId: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    const plain =
      typeof (user as any).toObject === "function"
        ? (user as any).toObject()
        : user;
    delete plain.password;

    return res.json({ success: true, user: plain, token });
  } catch (e) {
    console.error("[changeauth.changeEmail] error", e);
    return res.status(500).json({ error: "Failed to change email" });
  }
}

/* ---------------------------------------------------
 * POST /api/auth/change-password
 * body: { currentPassword, newPassword }
 * --------------------------------------------------- */
export async function changePassword(req: AuthedReq, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include uppercase & number",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res
        .status(400)
        .json({ error: "New password must be different from old password" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // Optional: issue fresh token (user id + email same, but nice to rotate)
    const token = signJwt({ userId: user._id.toString(), email: user.email });
    setAuthCookie(res, token);

    return res.json({ success: true });
  } catch (e) {
    console.error("[changeauth.changePassword] error", e);
    return res.status(500).json({ error: "Failed to change password" });
  }
}
