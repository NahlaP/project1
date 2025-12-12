// local fine

// // server.ts
// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import path from "path";
// import fs from "fs";
// import cors from "cors";

// const app = express();

// /* -----------------------------------------------------------
//    Network config
//    ----------------------------------------------------------- */
// const PORT = Number(process.env.PORT || 5000);
// /** IMPORTANT: listen on 0.0.0.0 so external hosts (cPanel) can reach it */
// const HOST = process.env.HOST || "0.0.0.0";

// app.set("trust proxy", 1);

// /* -----------------------------------------------------------
//    CORS (allow-list)
//    - allows your cPanel proxy + S3 bucket + localhost
//    ----------------------------------------------------------- */
// const allowList: (RegExp | string)[] = [
//   // *.mavsketch.com (incl. ion7devtemplate.mavsketch.com)
//   /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
//   /^https?:\/\/ion7devtemplate\.mavsketch\.com(:\d+)?$/i,

//   // S3 bucket hosting the templates
//   /^https?:\/\/ion7-templates\.s3\.ap-south-1\.amazonaws\.com(:\d+)?$/i,

//   // (Optional) if you later front S3 with CloudFront, allow it here:
//   // /^https?:\/\/[a-z0-9.-]+\.cloudfront\.net(:\d+)?$/i,

//   // Your EC2 public host (rarely used as an Origin, but harmless)
//   /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,

//   // Local dev
//   /^http:\/\/localhost(:\d+)?$/i,
//   /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
//   /\.vercel\.app$/i,
// ];

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true); // non-browser / curl
//       const ok = allowList.some((rule) =>
//         typeof rule === "string" ? origin === rule : rule.test(origin)
//       );
//       if (!ok) {
//         // helpful for debugging CORS
//         console.warn("CORS blocked:", origin);
//       }
//       return cb(ok ? null : new Error("CORS blocked"), ok);
//     },
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );

// /* -----------------------------------------------------------
//    Ensure /uploads exists
//    ----------------------------------------------------------- */
// try {
//   fs.mkdirSync(path.join(__dirname, "..", "uploads"), { recursive: true });
// } catch {
//   /* ignore */
// }

// /* -----------------------------------------------------------
//    Health
//    ----------------------------------------------------------- */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get("/api/health", (_req, res) => res.json({ ok: true, message: "Backend is live!" }));

// /* -----------------------------------------------------------
//    Static (optional)
//    ----------------------------------------------------------- */
// const staticDir = path.join(__dirname, "..", "frontend1html");
// app.use("/frontend1html", express.static(staticDir));

// /* -----------------------------------------------------------
//    Safe mount helper
//    ----------------------------------------------------------- */
// function safeMount(prefix: string, loader: () => any) {
//   try {
//     const mod = loader();
//     const routes = (mod?.default ?? mod?.router ?? mod) as any;

//     const isRouter =
//       !!routes &&
//       (typeof routes === "function" ||
//         (typeof routes === "object" && typeof routes.use === "function"));

//     if (!isRouter) throw new Error("route module did not export an Express router");

//     app.use(prefix, routes);
//     console.log(`✅ Mounted ${prefix}`);
//   } catch (e: any) {
//     console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
//     throw e;
//   }
// }

// /* -----------------------------------------------------------
//    Stripe webhook (must be before body parsers)
//    ----------------------------------------------------------- */
// safeMount("/api/billing", () => require("./routes/stripe.webhook"));

// /* -----------------------------------------------------------
//    Parsers
//    ----------------------------------------------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* -----------------------------------------------------------
//    Core routes
//    ----------------------------------------------------------- */
// safeMount("/api/auth",           () => require("./routes/auth.routes"));
// safeMount("/api/auth", () => require("./routes/changeauth.routes"));
// safeMount("/api/plans",          () => require("./routes/plans.routes"));
// safeMount("/api/email-manager", () => require("./routes/emailManager.routes"));

// safeMount("/api/domain",         () => require("./routes/domain.routes"));


// /* Billing (runtime APIs) */
// safeMount("/api/billing",        () => require("./routes/billing.elements.routes"));
// safeMount("/api/billing",        () => require("./routes/billing.verify.routes"));
// // STORAGE ROUTES (safe mount)
// safeMount("/api/storage", () => require("./routes/storage.routes"));
// safeMount("/api/visitors", () => require("./routes/visitor.routes"));
// /* App feature routes */
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
// safeMount("/api/media",          () => require("./routes/media.routes"));
// safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
// safeMount("/api",                () => require("./routes/page.routes"));

// /* 404 for unknown API paths */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /* Global error handler */
// app.use(
//   (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const msg = err.message || (typeof err === "string" ? err : "Internal Server Error");
//     console.error("🛑 Error:", msg);
//     res.status(status).json({ error: msg });
//   }
// );

// /* -----------------------------------------------------------
//    DB connect + start
//    ----------------------------------------------------------- */
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
//     // Optional: start server even if DB fails
//    app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server listening at http://0.0.0.0:${PORT}`);
// });

//   });

// /* -----------------------------------------------------------
//    Helpful startup summary (appears once)
//    ----------------------------------------------------------- */
// process.on("listening", () => {
//   console.log("CORS allow-list:");
//   for (const r of allowList) console.log(" •", r.toString());
// });














// server.ts
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser"; // ⭐ NEW

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
   Cookies
   ----------------------------------------------------------- */
// ⭐ MUST be before routes that use requireAuth
app.use(cookieParser());

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
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, message: "Backend is live!" })
);

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
safeMount("/api/auth", () => require("./routes/auth.routes"));
safeMount("/api/auth", () => require("./routes/changeauth.routes"));
safeMount("/api/plans", () => require("./routes/plans.routes"));
safeMount("/api/email-manager", () => require("./routes/emailManager.routes"));

safeMount("/api/domain", () => require("./routes/domain.routes"));
safeMount("/api/domain", () => require("./routes/domaintransfer.routes"));
safeMount("/api/resellerclub", () => require("./routes/resellerclub.routes"));
safeMount("/api/openprovider", () => require("./routes/openprovider.routes"));
/* Billing (runtime APIs) */
safeMount("/api/billing", () => require("./routes/billing.elements.routes"));
safeMount("/api/billing", () => require("./routes/billing.verify.routes"));

// STORAGE ROUTES (safe mount)
safeMount("/api/storage", () => require("./routes/storage.routes"));
safeMount("/api/visitors", () => require("./routes/visitor.routes"));
safeMount("/api/analytics", () => require("./routes/analytics.routes"));

/* App feature routes */
safeMount("/api/templates", () => require("./routes/template.routes"));
safeMount("/api/upload", () => require("./routes/upload.routes"));
safeMount("/api/sections", () => require("./routes/section.routes"));
safeMount("/api/topbar", () => require("./routes/topbar.routes"));
safeMount("/api/navbar", () => require("./routes/navbar.routes"));
safeMount("/api/hero", () => require("./routes/hero.routes"));
safeMount("/api/about", () => require("./routes/about.routes"));
safeMount("/api/whychoose", () => require("./routes/whyChooseUs.routes"));
safeMount("/api/services", () => require("./routes/service.routes"));
safeMount("/api/appointment", () => require("./routes/appointment.routes"));
safeMount("/api/team", () => require("./routes/team.routes"));
safeMount("/api/testimonial", () => require("./routes/testimonial.routes"));
safeMount("/api/contact-info", () => require("./routes/contact.routes"));
safeMount("/api/projects", () => require("./routes/projects.routes"));
safeMount("/api/marquee", () => require("./routes/marquee.routes"));
safeMount("/api/brands", () => require("./routes/brands.routes"));
safeMount("/api/blogs", () => require("./routes/blogs.routes"));
safeMount("/api/footer", () => require("./routes/footer.routes"));
safeMount("/api/media", () => require("./routes/media.routes"));
safeMount("/api/template-reset", () => require("./routes/templatereset.routes"));
safeMount("/api", () => require("./routes/page.routes"));

/* 404 for unknown API paths */
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

/* Global error handler */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.status || err.statusCode || 500;
    const msg =
      err.message || (typeof err === "string" ? err : "Internal Server Error");
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
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening at http://0.0.0.0:${PORT}`);
    });
  });

/* -----------------------------------------------------------
   Helpful startup summary (appears once)
   ----------------------------------------------------------- */
process.on("listening", () => {
  console.log("CORS allow-list:");
  for (const r of allowList) console.log(" •", r.toString());
});
