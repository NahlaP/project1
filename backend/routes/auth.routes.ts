
// // local fine
// // backend/routes/auth.routes.ts
// import { Router } from "express";
// import { signup, login, me } from "../controllers/auth.controller";
// import { requireAuth } from "../middleware/auth.middleware";

// const r = Router();

// r.post("/signup", signup);
// r.post("/login", login);
// r.get("/me", requireAuth, me);

// // ✅ LOGOUT: clears auth cookie
// r.post("/logout", (req, res) => {
//   const cookieName = process.env.COOKIE_NAME || "auth_token";

//   res.clearCookie(cookieName, {
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.COOKIE_SECURE === "true",
//   });

//   // clear old dev cookie if present
//   res.clearCookie("ion7dev_auth", {
//     path: "/",
//     sameSite: "lax",
//     secure: process.env.COOKIE_SECURE === "true",
//   });

//   return res.json({ ok: true });
// });

// export default r;





// backend/routes/auth.routes.ts
import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

r.post("/signup", signup);
r.post("/login", login);
r.get("/me", requireAuth, me);

// ✅ LOGOUT: clears auth cookie
r.post("/logout", (req, res) => {
  const cookieName = process.env.COOKIE_NAME || "ion7dev_auth";
  const secure = process.env.COOKIE_SECURE === "true";

  res.clearCookie(cookieName, {
    path: "/",
    sameSite: "lax",
    secure,
  });

  // just in case any old name survived
  res.clearCookie("auth_token", {
    path: "/",
    sameSite: "lax",
    secure,
  });

  return res.json({ ok: true });
});

export default r;
