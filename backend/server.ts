



// // cpanel
// // server.ts
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

// // ---------- CORS (allow-list) ----------
// const allowList: (RegExp | string)[] = [
//   /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i, // new cPanel domain(s)
//   // keep old temporarily if needed:
//   // /^https?:\/\/([a-z0-9-]+\.)*sogimchurch\.com(:\d+)?$/i,
//   /^http:\/\/localhost(:\d+)?$/i,
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
// // --------------------------------------

// // ---------- Body parsers & limits ----------
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// // ------------------------------------------

// // ---------- Ensure local upload dir exists (if you use multer/temp) ----------
// try {
//   const up = path.join(__dirname, "..", "uploads");
//   fs.mkdirSync(up, { recursive: true });
// } catch {}
// // ---------------------------------------------------------------------------

// // ---------- Health checks ----------
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) =>
//   res.json({ ok: true, message: "Backend is live!" })
// );
// // -----------------------------------

// // ---------- Optional static (if you use it) ----------
// const staticDir = path.join(__dirname, "..", "frontend1html");
// console.log("📂 Serving static HTML from:", staticDir);
// app.use("/frontend1html", express.static(staticDir));
// // -----------------------------------------------

// /**
//  * Safe mount helper:
//  * - Defers loading each router until here (so parse errors are caught per-file)
//  * - Logs which prefix fails if path-to-regexp throws
//  */
// function safeMount(prefix: string, loader: () => any) {
//   try {
//     const mod = loader();
//     const routes = (mod && (mod.default ?? mod)) as any; // support default export
//     app.use(prefix, routes);
//     console.log(`✅ Mounted ${prefix}`);
//   } catch (e: any) {
//     console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
//     throw e; // keep to stop boot; remove if you want best-effort
//   }
// }

// // ---------- API routes (lazy require for clearer errors) ----------
// safeMount("/api/upload",      () => require("./routes/upload.routes"));
// safeMount("/api/auth",        () => require("./routes/auth.routes"));
// safeMount("/api/sections",    () => require("./routes/section.routes"));
// safeMount("/api/topbar",      () => require("./routes/topbar.routes"));
// safeMount("/api/navbar",      () => require("./routes/navbar.routes"));
// safeMount("/api/hero",        () => require("./routes/hero.routes"));
// safeMount("/api/about",       () => require("./routes/about.routes"));
// safeMount("/api/whychoose",   () => require("./routes/whyChooseUs.routes"));
// safeMount("/api/services",    () => require("./routes/service.routes"));
// safeMount("/api/appointment", () => require("./routes/appointment.routes"));
// safeMount("/api/team",        () => require("./routes/team.routes"));
// safeMount("/api/testimonial", () => require("./routes/testimonial.routes"));
// safeMount("/api/contact-info",() => require("./routes/contact.routes"));
// safeMount("/api",             () => require("./routes/page.routes"));
// // ----------------------------------

// // ---------- 404 for unknown API routes ----------
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
// // -----------------------------------------------

// // ---------- Global error handler ----------
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
// // --------------------------------------------------------------------

// // ---------- DB + start ----------
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
// // ---------------------------------









// cpanel
// server.ts
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

// Bind to loopback so Nginx (127.0.0.1) can proxy to us
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1";

// Trust the proxy (cookies, req.ip, etc.)
app.set("trust proxy", 1);

// ---------- CORS (allow-list) ----------
const allowList: (RegExp | string)[] = [
  /^https?:\/\/([a-z0-9-]+\.)*mavsketch\.com(:\d+)?$/i,
  // add your public EC2 IP:
  /^https?:\/\/3\.109\.207\.179(:\d+)?$/i,
  /^http:\/\/localhost(:\d+)?$/i,
  /\.vercel\.app$/i,
];


app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman/no Origin header
      const ok = allowList.some((rule) =>
        typeof rule === "string" ? origin === rule : rule.test(origin)
      );
      cb(ok ? null : new Error("CORS blocked"), ok);
    },
    credentials: true,
  })
);
// OPTIONAL global preflight for Express 5 (use RegExp, NOT a string)
// app.options(/.*/, cors());
// --------------------------------------

// ---------- Body parsers & limits ----------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// ------------------------------------------

// ---------- Ensure local upload dir exists (if you use multer/temp) ----------
try {
  const up = path.join(__dirname, "..", "uploads");
  fs.mkdirSync(up, { recursive: true });
} catch {}
// ---------------------------------------------------------------------------

// ---------- Health checks ----------
app.get("/", (_req, res) => res.send("✅ Backend is live!"));
app.get(["/api", "/api/"], (_req, res) =>
  res.json({ ok: true, message: "Backend is live!" })
);
// -----------------------------------

// ---------- Optional static (if you use it) ----------
const staticDir = path.join(__dirname, "..", "frontend1html");
console.log("📂 Serving static HTML from:", staticDir);
app.use("/frontend1html", express.static(staticDir));
// -----------------------------------------------

/**
 * Safe mount helper:
 * - Defers loading each router until here (so parse errors are caught per-file)
 * - Logs which prefix fails if path-to-regexp throws
 */
function safeMount(prefix: string, loader: () => any) {
  try {
    const mod = loader();
    const routes = (mod && (mod.default ?? mod)) as any; // support default export
    app.use(prefix, routes);
    console.log(`✅ Mounted ${prefix}`);
  } catch (e: any) {
    console.error(`🛑 Failed mounting ${prefix}:`, e?.message || e);
    throw e; // keep to stop boot; remove if you want best-effort
  }
}

// ---------- API routes (lazy require for clearer errors) ----------
safeMount("/api/upload",      () => require("./routes/upload.routes"));
safeMount("/api/auth",        () => require("./routes/auth.routes"));
safeMount("/api/sections",    () => require("./routes/section.routes"));
safeMount("/api/topbar",      () => require("./routes/topbar.routes"));
safeMount("/api/navbar",      () => require("./routes/navbar.routes"));
safeMount("/api/hero",        () => require("./routes/hero.routes"));
safeMount("/api/about",       () => require("./routes/about.routes"));
safeMount("/api/whychoose",   () => require("./routes/whyChooseUs.routes"));
safeMount("/api/services",    () => require("./routes/service.routes"));
safeMount("/api/appointment", () => require("./routes/appointment.routes"));
safeMount("/api/team",        () => require("./routes/team.routes"));
safeMount("/api/testimonial", () => require("./routes/testimonial.routes"));
safeMount("/api/contact-info",() => require("./routes/contact.routes"));
safeMount("/api",             () => require("./routes/page.routes"));
// ----------------------------------

// ---------- 404 for unknown API routes ----------
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
// -----------------------------------------------

// ---------- Global error handler ----------
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.status || err.statusCode || 500;
    const msg =
      err.message ||
      (typeof err === "string" ? err : "Internal Server Error");
    console.error("🛑 Error:", msg, err?.stack || "");
    res.status(status).json({ error: msg });
  }
);
// --------------------------------------------------------------------

// ---------- DB + start ----------
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
    console.error("🔴 MongoDB connection error:", err);
    // still start server so health endpoints work even if DB is down
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
    });
  });
// ---------------------------------
