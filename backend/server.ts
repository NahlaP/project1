// og
// // works with stripe
// // server.ts  (cpanel / aws friendly)
// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import path from "path";
// import fs from "fs";
// import cors from "cors";

// const app = express();

// // Bind to loopback so Nginx (127.0.0.1) can proxy to us
// const PORT = Number(process.env.PORT || 5000);
// const HOST = process.env.HOST || "127.0.0.1";

// // Trust the proxy (cookies, req.ip, etc.)
// app.set("trust proxy", 1);

// /* ----------------------------- CORS (allow-list) ---------------------------- */
// const allowList: (RegExp | string)[] = [
//   /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
//   // add your public EC2 IP:
//   /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,
//   /^http:\/\/localhost(:\d+)?$/i,
//   /^http:\/\/127\.0\.0\.1(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /^http:\/\/localhost(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /\.vercel\.app$/i,
// ];

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true); // curl/postman/no Origin header
//       const ok = allowList.some((rule) =>
//         typeof rule === "string" ? origin === rule : rule.test(origin)
//       );
//       cb(ok ? null : new Error("CORS blocked"), ok);
//     },
//     credentials: true,
//   })
// );
// // OPTIONAL global preflight for Express 5 (use RegExp, NOT a string)
// // app.options(/.*/, cors());

// /* ------------------------- ensure uploads directory ------------------------- */
// try {
//   const up = path.join(__dirname, "..", "uploads");
//   fs.mkdirSync(up, { recursive: true });
// } catch {}

// /* --------------------------------- health ---------------------------------- */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) =>
//   res.json({ ok: true, message: "Backend is live!" })
// );

// /* ---------------------------- static (optional) ----------------------------- */
// const staticDir = path.join(__dirname, "..", "frontend1html");
// console.log("📂 Serving static HTML from:", staticDir);
// app.use("/frontend1html", express.static(staticDir));

// /* ---------------------------- safe mount helper ----------------------------- */
// function safeMount(prefix: string, loader: () => any) {
//   try {
//     const mod = loader();
//     const routes = (mod && (mod.default ?? mod)) as any; // support default export
//     app.use(prefix, routes);
//     console.log(`✅ Mounted ${prefix}`);
//   } catch (e: any) {
//     console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
//     throw e; // stop boot so you notice bad routes
//   }
// }

// /* -------------------------------------------------------------------------- */
// /* 🔴 IMPORTANT: Stripe webhook MUST be mounted BEFORE express.json() so that
//    the route can read the *raw* request body for signature verification.     */
// /* -------------------------------------------------------------------------- */
// safeMount("/api/stripe", () => require("./routes/stripe.webhook"));

// /* ------------------------- Body parsers & limits ---------------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* ------------------------------- API routes -------------------------------- */
// safeMount("/api/templates",      () => require("./routes/template.routes"));
// safeMount("/api/upload",         () => require("./routes/upload.routes"));
// safeMount("/api/auth",           () => require("./routes/auth.routes"));
// safeMount("/api/plans",          () => require("./routes/plans.routes"));
// safeMount("/api/billing",        () => require("./routes/billing.routes")); // ⬅️ NEW
// safeMount("/api/sections",       () => require("./routes/section.routes"));
// safeMount("/api/topbar",         () => require("./routes/topbar.routes"));
// safeMount("/api/navbar",         () => require("./routes/navbar.routes"));
// safeMount("/api/hero",           () => require("./routes/hero.routes"));
// safeMount("/api/about",          () => require("./routes/about.routes"));
// safeMount("/api/whychoose",      () => require("./routes/whyChooseUs.routes"));
// safeMount("/api/services",       () => require("./routes/service.routes"));
// safeMount("/api/appointment",    () => require("./routes/appointment.routes"));
// safeMount("/api/team",           () => require("./routes/team.routes"));
// safeMount("/api/testimonial",    () => require("./routes/testimonial.routes"));
// safeMount("/api/contact-info",   () => require("./routes/contact.routes"));
// safeMount("/api/projects",       () => require("./routes/projects.routes"));
// safeMount("/api/marquee",        () => require("./routes/marquee.routes"));
// safeMount("/api/brands",         () => require("./routes/brands.routes"));
// safeMount("/api/blogs",          () => require("./routes/blogs.routes"));
// safeMount("/api/footer",         () => require("./routes/footer.routes"));
// safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
// safeMount("/api",                () => require("./routes/page.routes"));

// /* --------------------- 404 for unknown API routes -------------------------- */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /* --------------------------- Global error handler -------------------------- */
// app.use(
//   (
//     err: any,
//     _req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
//   ) => {
//     const status = err.status || err.statusCode || 500;
//     const msg =
//       err.message ||
//       (typeof err === "string" ? err : "Internal Server Error");
//     console.error("🛑 Error:", msg, err?.stack || "");
//     res.status(status).json({ error: msg });
//   }
// );

// /* ------------------------------- DB + start -------------------------------- */
// const mongoUri = process.env.MONGO_URI || "";
// mongoose
//   .connect(mongoUri)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server listening at http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("🔴 MongoDB connection error:", err);
//     // still start server so health endpoints work even if DB is down
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
//     });
//   });




















// // server.ts  (cpanel / aws friendly)
// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import path from "path";
// import fs from "fs";
// import cors from "cors";

// const app = express();

// // Bind to loopback so Nginx (127.0.0.1) can proxy to us
// const PORT = Number(process.env.PORT || 5000);
// const HOST = process.env.HOST || "127.0.0.1";

// // Trust the proxy (cookies, req.ip, etc.)
// app.set("trust proxy", 1);

// /* ----------------------------- CORS (allow-list) ---------------------------- */
// const allowList: (RegExp | string)[] = [
//   /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
//   /^https?:\/\/ion7devtemplate\.mavsketch\.com(:\d+)?$/i,
//   // add your public EC2 IP:
//   /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,
//   /^http:\/\/localhost(:\d+)?$/i,
//   /^http:\/\/127\.0\.0\.1(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /^http:\/\/localhost(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /\.vercel\.app$/i,
// ];

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true); // curl/postman/no Origin header
//       const ok = allowList.some((rule) =>
//         typeof rule === "string" ? origin === rule : rule.test(origin)
//       );
//       cb(ok ? null : new Error("CORS blocked"), ok);
//     },
//     credentials: true,
//   })
// );
// // Optional global preflight
// // app.options(/.*/, cors());

// /* ------------------------- ensure uploads directory ------------------------- */
// try {
//   const up = path.join(__dirname, "..", "uploads");
//   fs.mkdirSync(up, { recursive: true });
// } catch {}

// /* --------------------------------- health ---------------------------------- */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) =>
//   res.json({ ok: true, message: "Backend is live!" })
// );

// /* ---------------------------- static (optional) ----------------------------- */
// const staticDir = path.join(__dirname, "..", "frontend1html");
// console.log("📂 Serving static HTML from:", staticDir);
// app.use("/frontend1html", express.static(staticDir));

// /* ---------------------------- safe mount helper ----------------------------- */
// function safeMount(prefix: string, loader: () => any) {
//   const label = prefix;
//   try {
//     const mod = loader();
//     const routes = (mod && (mod.default ?? mod)) as any; // support default export
//     app.use(prefix, routes);
//     console.log(`✅ Mounted ${label}`);
//   } catch (e: any) {
//     console.error(`🛑 Failed mounting ${label}:`, e?.message || e);
//     throw e; // stop boot so you notice bad routes
//   }
// }

// /* -------------------------------------------------------------------------- */
// /* 🔴 IMPORTANT: Stripe webhook MUST be mounted BEFORE express.json()
//    so the route can read the *raw* request body for signature verification.   */
// /* -------------------------------------------------------------------------- */
// // Mount webhook under /api/billing so final path is /api/billing/webhook
// safeMount("/api/billing", () => require("./routes/stripe.webhook"));

// /* ------------------------- Body parsers & limits ---------------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* ------------------------------- API routes -------------------------------- */
// safeMount("/api/templates",      () => require("./routes/template.routes"));
// safeMount("/api/upload",         () => require("./routes/upload.routes"));
// safeMount("/api/auth",           () => require("./routes/auth.routes"));
// safeMount("/api",          () => require("./routes/me.routes"));
// safeMount("/api/plans",          () => require("./routes/plans.routes"));
// safeMount("/api/billing", () => require("./routes/billing.embedded.routes"));
// safeMount("/api/billing", () => require("./routes/billing.elements.routes"));
// safeMount("/api/billing",        () => require("./routes/billing.routes")); // checkout + session
// safeMount("/api/sections",       () => require("./routes/section.routes"));
// safeMount("/api/topbar",         () => require("./routes/topbar.routes"));
// safeMount("/api/navbar",         () => require("./routes/navbar.routes"));
// safeMount("/api/hero",           () => require("./routes/hero.routes"));
// safeMount("/api/about",          () => require("./routes/about.routes"));
// safeMount("/api/whychoose",      () => require("./routes/whyChooseUs.routes"));
// safeMount("/api/services",       () => require("./routes/service.routes"));
// safeMount("/api/appointment",    () => require("./routes/appointment.routes"));
// safeMount("/api/team",           () => require("./routes/team.routes"));
// safeMount("/api/testimonial",    () => require("./routes/testimonial.routes"));
// safeMount("/api/contact-info",   () => require("./routes/contact.routes"));
// safeMount("/api/projects",       () => require("./routes/projects.routes"));
// safeMount("/api/marquee",        () => require("./routes/marquee.routes"));
// safeMount("/api/brands",         () => require("./routes/brands.routes"));
// safeMount("/api/blogs",          () => require("./routes/blogs.routes"));
// safeMount("/api/footer",         () => require("./routes/footer.routes"));
// safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
// safeMount("/api",                () => require("./routes/page.routes"));

// /* --------------------- 404 for unknown API routes -------------------------- */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /* --------------------------- Global error handler -------------------------- */
// app.use(
//   (
//     err: any,
//     _req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
//   ) => {
//     const status = err.status || err.statusCode || 500;
//     const msg =
//       err.message ||
//       (typeof err === "string" ? err : "Internal Server Error");
//     console.error("🛑 Error:", msg, err?.stack || "");
//     res.status(status).json({ error: msg });
//   }
// );

// /* ------------------------------- DB + start -------------------------------- */
// const mongoUri = process.env.MONGO_URI || "";
// mongoose
//   .connect(mongoUri)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server listening at http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("🔴 MongoDB connection error:", err);
//     // still start server so health endpoints work even if DB is down
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
//     });
//   });






// // original

// // server.ts
// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import path from "path";
// import fs from "fs";
// import cors from "cors";

// const app = express();
// const PORT = Number(process.env.PORT || 5000);
// const HOST = process.env.HOST || "127.0.0.1";

// app.set("trust proxy", 1);

// /* ------------------------ CORS (allow-list) ------------------------ */
// const allowList: (RegExp | string)[] = [
//   /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
//   /^https?:\/\/ion7devtemplate\.mavsketch\.com(:\d+)?$/i,
//   /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,
//   /^http:\/\/localhost(:\d+)?$/i,
//   /^http:\/\/127\.0\.0\.1(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /^http:\/\/localhost(:3000|:5000|:5500|:5501|:5173)?$/i,
//   /\.vercel\.app$/i,
// ];

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);
//       const ok = allowList.some((rule) =>
//         typeof rule === "string" ? origin === rule : rule.test(origin)
//       );
//       return cb(ok ? null : new Error("CORS blocked"), ok);
//     },
//     credentials: true,
//   })
// );

// /* ------------------------ Ensure /uploads -------------------------- */
// try {
//   fs.mkdirSync(path.join(__dirname, "..", "uploads"), { recursive: true });
// } catch { /* ignore */ }

// /* ---------------------------- Health ------------------------------ */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get("/api/health", (_req, res) => res.json({ ok: true, message: "Backend is live!" }));

// /* ------------------------ Static (optional) ------------------------ */
// const staticDir = path.join(__dirname, "..", "frontend1html");
// app.use("/frontend1html", express.static(staticDir));

// /* ---------------------- Safe mount helper ------------------------- */
// function safeMount(prefix: string, loader: () => any) {
//   try {
//     const mod = loader();
//     // Accept default export, named 'router', or module itself.
//     const routes = (mod?.default ?? mod?.router ?? mod) as any;

//     const isRouter =
//       !!routes &&
//       (typeof routes === "function" ||
//         // express.Router() object has .use function
//         (typeof routes === "object" && typeof routes.use === "function"));

//     if (!isRouter) throw new Error("route module did not export an Express router");

//     app.use(prefix, routes);
//     console.log(`✅ Mounted ${prefix}`);
//   } catch (e: any) {
//     console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
//     throw e;
//   }
// }

// /* ---- Stripe WEBHOOK must be BEFORE express.json (raw body needed) ---- */
// safeMount("/api/billing", () => require("./routes/stripe.webhook"));

// /* ---------------------------- Parsers ----------------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* --------------------------- Core routes -------------------------- */
// safeMount("/api/auth",           () => require("./routes/auth.routes"));
// // ⚠️ Removed: /api/me — use GET /api/auth/me from auth.routes
// safeMount("/api/plans",          () => require("./routes/plans.routes"));

// /* --------------------- Billing (runtime APIs) --------------------- */
// safeMount("/api/billing",        () => require("./routes/billing.elements.routes"));
// safeMount("/api/billing", () => require("./routes/billing.verify.routes"));
// /* ------------------------ App feature routes ---------------------- */
// safeMount("/api/templates",      () => require("./routes/template.routes"));
// safeMount("/api/upload",         () => require("./routes/upload.routes"));
// safeMount("/api/sections",       () => require("./routes/section.routes"));
// safeMount("/api/topbar",         () => require("./routes/topbar.routes"));
// safeMount("/api/navbar",         () => require("./routes/navbar.routes"));
// safeMount("/api/hero",           () => require("./routes/hero.routes"));
// safeMount("/api/about",          () => require("./routes/about.routes"));
// safeMount("/api/whychoose",      () => require("./routes/whyChooseUs.routes"));
// safeMount("/api/services",       () => require("./routes/service.routes"));
// safeMount("/api/appointment",    () => require("./routes/appointment.routes"));
// safeMount("/api/team",           () => require("./routes/team.routes"));
// safeMount("/api/testimonial",    () => require("./routes/testimonial.routes"));
// safeMount("/api/contact-info",   () => require("./routes/contact.routes"));
// safeMount("/api/projects",       () => require("./routes/projects.routes"));
// safeMount("/api/marquee",        () => require("./routes/marquee.routes"));
// safeMount("/api/brands",         () => require("./routes/brands.routes"));
// safeMount("/api/blogs",          () => require("./routes/blogs.routes"));
// safeMount("/api/footer",         () => require("./routes/footer.routes"));
// safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
// safeMount("/api",                () => require("./routes/page.routes"));

// /* -------------------- 404 for unknown API paths ------------------- */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /* -------------------------- Error handler ------------------------- */
// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   const status = err.status || err.statusCode || 500;
//   const msg = err.message || (typeof err === "string" ? err : "Internal Server Error");
//   console.error("🛑 Error:", msg);
//   res.status(status).json({ error: msg });
// });

// /* ----------------------- DB connect + start ----------------------- */
// const mongoUri = process.env.MONGO_URI || "";
// mongoose
//   .connect(mongoUri)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server listening at http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("🔴 MongoDB connection error:", err?.message || err);
//     // start server even if DB fails (optional)
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
//     });
//   });
















// server.ts
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

/* -----------------------------------------------------------
   Network config
   ----------------------------------------------------------- */
const PORT = Number(process.env.PORT || 5000);
/** IMPORTANT: listen on 0.0.0.0 so external hosts (cPanel) can reach it */
const HOST = process.env.HOST || "0.0.0.0";

app.set("trust proxy", 1);

/* -----------------------------------------------------------
   CORS (allow-list)
   - allows your cPanel proxy + S3 bucket + localhost
   ----------------------------------------------------------- */
const allowList: (RegExp | string)[] = [
  // *.mavsketch.com (incl. ion7devtemplate.mavsketch.com)
  /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
  /^https?:\/\/ion7devtemplate\.mavsketch\.com(:\d+)?$/i,

  // S3 bucket hosting the templates
  /^https?:\/\/ion7-templates\.s3\.ap-south-1\.amazonaws\.com(:\d+)?$/i,

  // (Optional) if you later front S3 with CloudFront, allow it here:
  // /^https?:\/\/[a-z0-9.-]+\.cloudfront\.net(:\d+)?$/i,

  // Your EC2 public host (rarely used as an Origin, but harmless)
  /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,

  // Local dev
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
  /\.vercel\.app$/i,
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser / curl
      const ok = allowList.some((rule) =>
        typeof rule === "string" ? origin === rule : rule.test(origin)
      );
      if (!ok) {
        // helpful for debugging CORS
        console.warn("CORS blocked:", origin);
      }
      return cb(ok ? null : new Error("CORS blocked"), ok);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

/* -----------------------------------------------------------
   Ensure /uploads exists
   ----------------------------------------------------------- */
try {
  fs.mkdirSync(path.join(__dirname, "..", "uploads"), { recursive: true });
} catch {
  /* ignore */
}

/* -----------------------------------------------------------
   Health
   ----------------------------------------------------------- */
app.get("/", (_req, res) => res.send("✅ Backend is live!"));
app.get("/api/health", (_req, res) => res.json({ ok: true, message: "Backend is live!" }));

/* -----------------------------------------------------------
   Static (optional)
   ----------------------------------------------------------- */
const staticDir = path.join(__dirname, "..", "frontend1html");
app.use("/frontend1html", express.static(staticDir));

/* -----------------------------------------------------------
   Safe mount helper
   ----------------------------------------------------------- */
function safeMount(prefix: string, loader: () => any) {
  try {
    const mod = loader();
    const routes = (mod?.default ?? mod?.router ?? mod) as any;

    const isRouter =
      !!routes &&
      (typeof routes === "function" ||
        (typeof routes === "object" && typeof routes.use === "function"));

    if (!isRouter) throw new Error("route module did not export an Express router");

    app.use(prefix, routes);
    console.log(`✅ Mounted ${prefix}`);
  } catch (e: any) {
    console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
    throw e;
  }
}

/* -----------------------------------------------------------
   Stripe webhook (must be before body parsers)
   ----------------------------------------------------------- */
safeMount("/api/billing", () => require("./routes/stripe.webhook"));

/* -----------------------------------------------------------
   Parsers
   ----------------------------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* -----------------------------------------------------------
   Core routes
   ----------------------------------------------------------- */
safeMount("/api/auth",           () => require("./routes/auth.routes"));
safeMount("/api/plans",          () => require("./routes/plans.routes"));

/* Billing (runtime APIs) */
safeMount("/api/billing",        () => require("./routes/billing.elements.routes"));
safeMount("/api/billing",        () => require("./routes/billing.verify.routes"));

/* App feature routes */
safeMount("/api/templates",      () => require("./routes/template.routes"));
safeMount("/api/upload",         () => require("./routes/upload.routes"));
safeMount("/api/sections",       () => require("./routes/section.routes"));
safeMount("/api/topbar",         () => require("./routes/topbar.routes"));
safeMount("/api/navbar",         () => require("./routes/navbar.routes"));
safeMount("/api/hero",           () => require("./routes/hero.routes"));
safeMount("/api/about",          () => require("./routes/about.routes"));
safeMount("/api/whychoose",      () => require("./routes/whyChooseUs.routes"));
safeMount("/api/services",       () => require("./routes/service.routes"));
safeMount("/api/appointment",    () => require("./routes/appointment.routes"));
safeMount("/api/team",           () => require("./routes/team.routes"));
safeMount("/api/testimonial",    () => require("./routes/testimonial.routes"));
safeMount("/api/contact-info",   () => require("./routes/contact.routes"));
safeMount("/api/projects",       () => require("./routes/projects.routes"));
safeMount("/api/marquee",        () => require("./routes/marquee.routes"));
safeMount("/api/brands",         () => require("./routes/brands.routes"));
safeMount("/api/blogs",          () => require("./routes/blogs.routes"));
safeMount("/api/footer",         () => require("./routes/footer.routes"));
safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
safeMount("/api",                () => require("./routes/page.routes"));

/* 404 for unknown API paths */
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

/* Global error handler */
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const msg = err.message || (typeof err === "string" ? err : "Internal Server Error");
    console.error("🛑 Error:", msg);
    res.status(status).json({ error: msg });
  }
);

/* -----------------------------------------------------------
   DB connect + start
   ----------------------------------------------------------- */
const mongoUri = process.env.MONGO_URI || "";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("🟢 MongoDB connected!");
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server listening at http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("🔴 MongoDB connection error:", err?.message || err);
    // Optional: start server even if DB fails
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
    });
  });

/* -----------------------------------------------------------
   Helpful startup summary (appears once)
   ----------------------------------------------------------- */
process.on("listening", () => {
  console.log("CORS allow-list:");
  for (const r of allowList) console.log(" •", r.toString());
});
