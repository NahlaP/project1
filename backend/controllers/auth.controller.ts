

// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import User from "../models/User";
// import { signJwt } from "../utils/jwt";
// import { getSubscriptionState } from "../services/subscription.state";
// import { ensureCustomer } from "../services/stripe.service";

// type Env = { DEMO_EMAIL?: string; DEMO_PASSWORD?: string };
// const { DEMO_EMAIL, DEMO_PASSWORD } = process.env as Env;

// /* --------------------- signup --------------------- */
// export async function signup(req: Request, res: Response) {
//   try {
//     const fullName = String(req.body?.fullName || "").trim();
//     const company  = String(req.body?.company  || "").trim() || null;
//     const country  = String(req.body?.country  || "").trim() || null;
//     const email    = String(req.body?.email    || "").trim().toLowerCase();
//     const password = String(req.body?.password || "");

//     if (!fullName || !email || !password) {
//       return res.status(400).json({ error: "fullName, email, password are required" });
//     }
//     if (await User.findOne({ email })) return res.status(409).json({ error: "Email already registered" });
//     if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
//       return res.status(400).json({ error: "Password must be 8+ chars, include uppercase & number" });
//     }

//     const hash = await bcrypt.hash(password, 10);
//     const user = await User.create({ fullName, company, country, email, password: hash, loginCount: 0, lastLoginAt: null });

//     try { await ensureCustomer(user._id.toString()); } catch {}

//     const token = signJwt({ userId: user._id.toString(), email: user.email });

//     const { next, user: fresh, status } = await getSubscriptionState(user._id.toString());

//     return res.status(201).json({
//       success: true,
//       token,
//       next,
//       meta: {
//         firstLogin: true,
//         needsPlan: next !== "dashboard",
//         subscriptionStatus: fresh.subscriptionStatus || null,
//         priceId: fresh.priceId || null,
//         status,
//       },
//     });
//   } catch {
//     return res.status(500).json({ error: "Signup failed" });
//   }
// }

// /* ---------------------- login --------------------- */
// export async function login(req: Request, res: Response) {
//   try {
//     const email    = String(req.body?.email    || "").trim().toLowerCase();
//     const password = String(req.body?.password || "");
//     if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

//     // Demo user path (optional)
//     if (DEMO_EMAIL && DEMO_PASSWORD &&
//         email === DEMO_EMAIL.toLowerCase() &&
//         password === DEMO_PASSWORD) {
//       let demo = await User.findOne({ email });
//       if (!demo) {
//         const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
//         demo = await User.create({ fullName: "Demo User", email, password: hash });
//       }
//       const firstLoginDemo = !demo.lastLoginAt;
//       demo.loginCount = (demo.loginCount || 0) + 1;
//       demo.lastLoginAt = new Date();
//       await demo.save();

//       try { await ensureCustomer(demo._id.toString()); } catch {}

//       const token = signJwt({ userId: demo._id.toString(), email: demo.email });
//       const { next, user: fresh, status } = await getSubscriptionState(demo._id.toString());

//       return res.json({
//         success: true,
//         token,
//         next,
//         meta: {
//           firstLogin: firstLoginDemo,
//           needsPlan: next !== "dashboard",
//           subscriptionStatus: fresh.subscriptionStatus || null,
//           priceId: fresh.priceId || null,
//           status,
//         },
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user || !user.password) return res.status(401).json({ error: "Invalid email or password" });
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ error: "Invalid email or password" });

//     const firstLogin = !user.lastLoginAt;
//     user.loginCount = (user.loginCount || 0) + 1;
//     user.lastLoginAt = new Date();
//     await user.save();

//     try { await ensureCustomer(user._id.toString()); } catch {}

//     const token = signJwt({ userId: user._id.toString(), email: user.email });
//     const { next, user: fresh, status } = await getSubscriptionState(user._id.toString());

//     return res.json({
//       success: true,
//       token,
//       next,
//       meta: {
//         firstLogin,
//         needsPlan: next !== "dashboard",
//         subscriptionStatus: fresh.subscriptionStatus || null,
//         priceId: fresh.priceId || null,
//         status,
//       },
//     });
//   } catch {
//     return res.status(500).json({ error: "Login failed" });
//   }
// }

// /* ----------------------- me ----------------------- */
// export async function me(req: Request & { user?: { userId: string } }, res: Response) {
//   try {
//     const { next, user: fresh, status } = await getSubscriptionState(req.user!.userId);
//     const sanitized = fresh?.toObject ? { ...fresh.toObject(), password: undefined } : fresh;

//     return res.json({
//       user: sanitized,
//       next, // "dashboard" | "checkout" | "choose-plan"
//       meta: {
//         needsPlan: next !== "dashboard",
//         subscriptionStatus: fresh?.subscriptionStatus || null,
//         priceId: fresh?.priceId || null,
//         status,
//       },
//     });
//   } catch {
//     return res.status(500).json({ error: "Failed to load profile" });
//   }
// }











// backend/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signJwt } from "../utils/jwt";
import { getSubscriptionState } from "../services/subscription.state";
import { ensureCustomer } from "../services/stripe.service";

type Env = { DEMO_EMAIL?: string; DEMO_PASSWORD?: string; COOKIE_NAME?: string; COOKIE_SECURE?: string };
const { DEMO_EMAIL, DEMO_PASSWORD, COOKIE_NAME, COOKIE_SECURE } = process.env as Env;

const cookieName = COOKIE_NAME || "auth_token";
const cookieSecure = COOKIE_SECURE === "true";

/* helper to set auth cookie */
function setAuthCookie(res: Response, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,  // false in dev, true in prod HTTPS
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/* --------------------- signup --------------------- */
export async function signup(req: Request, res: Response) {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const company  = String(req.body?.company  || "").trim() || null;
    const country  = String(req.body?.country  || "").trim() || null;
    const email    = String(req.body?.email    || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "fullName, email, password are required" });
    }
    if (await User.findOne({ email })) return res.status(409).json({ error: "Email already registered" });
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: "Password must be 8+ chars, include uppercase & number" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName, company, country, email, password: hash,
      loginCount: 0, lastLoginAt: null
    });

    try { await ensureCustomer(user._id.toString()); } catch {}

    const token = signJwt({ userId: user._id.toString(), email: user.email });

    // ✅ set cookie
    setAuthCookie(res, token);

    const { next, user: fresh, status } = await getSubscriptionState(user._id.toString());

    return res.status(201).json({
      success: true,
      token,
      next,
      meta: {
        firstLogin: true,
        needsPlan: next !== "dashboard",
        subscriptionStatus: fresh.subscriptionStatus || null,
        priceId: fresh.priceId || null,
        status,
      },
    });
  } catch {
    return res.status(500).json({ error: "Signup failed" });
  }
}

/* ---------------------- login --------------------- */
export async function login(req: Request, res: Response) {
  try {
    const email    = String(req.body?.email    || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    // Demo user path (optional)
    if (DEMO_EMAIL && DEMO_PASSWORD &&
        email === DEMO_EMAIL.toLowerCase() &&
        password === DEMO_PASSWORD) {
      let demo = await User.findOne({ email });
      if (!demo) {
        const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
        demo = await User.create({ fullName: "Demo User", email, password: hash });
      }
      const firstLoginDemo = !demo.lastLoginAt;
      demo.loginCount = (demo.loginCount || 0) + 1;
      demo.lastLoginAt = new Date();
      await demo.save();

      try { await ensureCustomer(demo._id.toString()); } catch {}

      const token = signJwt({ userId: demo._id.toString(), email: demo.email });

      // ✅ set cookie
      setAuthCookie(res, token);

      const { next, user: fresh, status } = await getSubscriptionState(demo._id.toString());

      return res.json({
        success: true,
        token,
        next,
        meta: {
          firstLogin: firstLoginDemo,
          needsPlan: next !== "dashboard",
          subscriptionStatus: fresh.subscriptionStatus || null,
          priceId: fresh.priceId || null,
          status,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid email or password" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const firstLogin = !user.lastLoginAt;
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date();
    await user.save();

    try { await ensureCustomer(user._id.toString()); } catch {}

    const token = signJwt({ userId: user._id.toString(), email: user.email });

    // ✅ set cookie
    setAuthCookie(res, token);

    const { next, user: fresh, status } = await getSubscriptionState(user._id.toString());

    return res.json({
      success: true,
      token,
      next,
      meta: {
        firstLogin,
        needsPlan: next !== "dashboard",
        subscriptionStatus: fresh.subscriptionStatus || null,
        priceId: fresh.priceId || null,
        status,
      },
    });
  } catch {
    return res.status(500).json({ error: "Login failed" });
  }
}

/* ----------------------- me ----------------------- */
export async function me(req: Request & { user?: { userId: string } }, res: Response) {
  try {
    const { next, user: fresh, status } = await getSubscriptionState(req.user!.userId);
    const sanitized = fresh?.toObject ? { ...fresh.toObject(), password: undefined } : fresh;

    return res.json({
      user: sanitized,
      next,
      meta: {
        needsPlan: next !== "dashboard",
        subscriptionStatus: fresh?.subscriptionStatus || null,
        priceId: fresh?.priceId || null,
        status,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to load profile" });
  }
}
