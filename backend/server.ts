









// // ✅ Load env BEFORE anything else
// import "dotenv/config";

// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";

// // routes
// import uploadRoutes from "./routes/upload.routes";
// import authRoutes from "./routes/auth.routes";
// import sectionRoutes from "./routes/section.routes";
// import topbarRoutes from "./routes/topbar.routes";
// import navbarRoutes from "./routes/navbar.routes";
// import heroRoutes from "./routes/hero.routes";
// import aboutRoutes from "./routes/about.routes";
// import whyChooseUsRoutes from "./routes/whyChooseUs.routes";
// import serviceRoutes from "./routes/service.routes";
// import appointmentRoutes from "./routes/appointment.routes";
// import teamRoutes from "./routes/team.routes";
// import testimonialRoutes from "./routes/testimonial.routes";
// import contactRoutes from "./routes/contact.routes";
// import pageRoutes from "./routes/page.routes";

// const app = express();

// /** CORS — BEFORE routes */
// const allowList = [
//   /\.vercel\.app$/,
//   /^http:\/\/localhost:\d+$/,
//   /^http:\/\/127\.0\.0\.1:\d+$/,
//   /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/
// ];

// app.use(cors({
//   origin(origin, cb) {
//     if (!origin) return cb(null, true);
//     const ok = allowList.some(re => re.test(origin));
//     return ok ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true,
//   methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
//   allowedHeaders: ["Content-Type","Authorization"],
// }));

// app.use(express.json());

// // Health
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));

// // (You can keep serving your static HTML if needed)
// console.log("📂 Serving static HTML from:", path.join(__dirname, "..", "frontend1html"));
// app.use("/frontend1html", express.static(path.join(__dirname, "..", "frontend1html")));

// // ❌ Local disk uploads no longer used (files go to S3)
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // API routes
// app.use("/api/upload", uploadRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/sections", sectionRoutes);
// app.use("/api/topbar", topbarRoutes);
// app.use("/api/navbar", navbarRoutes);
// app.use("/api/hero", heroRoutes);
// app.use("/api/about", aboutRoutes);
// app.use("/api/whychoose", whyChooseUsRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/appointment", appointmentRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/testimonial", testimonialRoutes);
// app.use("/api/contact-info", contactRoutes);
// app.use("/api", pageRoutes);

// // DB + server start
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     const PORT = Number(process.env.PORT) || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => console.error("🔴 MongoDB connection error:", err));





// // og code
// // ✅ Load env BEFORE anything else
// import "dotenv/config";

// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";

// // routes
// import uploadRoutes from "./routes/upload.routes";
// import authRoutes from "./routes/auth.routes";
// import sectionRoutes from "./routes/section.routes";
// import topbarRoutes from "./routes/topbar.routes";
// import navbarRoutes from "./routes/navbar.routes";
// import heroRoutes from "./routes/hero.routes";
// import aboutRoutes from "./routes/about.routes";
// import whyChooseUsRoutes from "./routes/whyChooseUs.routes";
// import serviceRoutes from "./routes/service.routes";
// import appointmentRoutes from "./routes/appointment.routes";
// import teamRoutes from "./routes/team.routes";
// import testimonialRoutes from "./routes/testimonial.routes";
// import contactRoutes from "./routes/contact.routes";
// import pageRoutes from "./routes/page.routes";

// const app = express();

// // Let Express trust Nginx/X-Forwarded-* headers
// app.set("trust proxy", 1);

// /** CORS — BEFORE routes */
// const allowList = [
//   /\.vercel\.app$/,
//   /^http:\/\/localhost:\d+$/,
//   /^http:\/\/127\.0\.0\.1:\d+$/,
//   /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
// ];

// app.use(
//   cors({
//     origin(origin, cb) {
//       if (!origin) return cb(null, true);
//       const ok = allowList.some((re) => re.test(origin));
//       return ok ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json({ limit: "10mb" }));

// // server.ts
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) => res.send("✅ Backend is live!")); // must be real code, not // commented


// // (You can keep serving your static HTML if needed)
// console.log("📂 Serving static HTML from:", path.join(__dirname, "..", "frontend1html"));
// app.use("/frontend1html", express.static(path.join(__dirname, "..", "frontend1html")));

// // ❌ Local disk uploads no longer used (files go to S3)
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // API routes
// app.use("/api/upload", uploadRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/sections", sectionRoutes);
// app.use("/api/topbar", topbarRoutes);
// app.use("/api/navbar", navbarRoutes);
// app.use("/api/hero", heroRoutes);
// app.use("/api/about", aboutRoutes);
// app.use("/api/whychoose", whyChooseUsRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/appointment", appointmentRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/testimonial", testimonialRoutes);
// app.use("/api/contact-info", contactRoutes);
// app.use("/api", pageRoutes);

// // Optional: 404 for unknown API routes
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// // DB + server start
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     const PORT = Number(process.env.PORT) || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => console.error("🔴 MongoDB connection error:", err));













// og2
// // server.ts
// import "dotenv/config";

// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";

// // routes
// import uploadRoutes from "./routes/upload.routes";
// import authRoutes from "./routes/auth.routes";
// import sectionRoutes from "./routes/section.routes";
// import topbarRoutes from "./routes/topbar.routes";
// import navbarRoutes from "./routes/navbar.routes";
// import heroRoutes from "./routes/hero.routes";
// import aboutRoutes from "./routes/about.routes";
// import whyChooseUsRoutes from "./routes/whyChooseUs.routes";
// import serviceRoutes from "./routes/service.routes";
// import appointmentRoutes from "./routes/appointment.routes";
// import teamRoutes from "./routes/team.routes";
// import testimonialRoutes from "./routes/testimonial.routes";
// import contactRoutes from "./routes/contact.routes";
// import pageRoutes from "./routes/page.routes";

// const app = express();

// // Bind to IPv4 loopback so Nginx (127.0.0.1) reaches us
// const PORT = Number(process.env.PORT || 5000);
// const HOST = process.env.HOST || "127.0.0.1";

// // Trust the proxy so req.ip / secure cookies work
// app.set("trust proxy", 1);

// /** ---------- CORS (fix) ---------- */
// // Add your public origin and DO NOT throw on mismatch.
// // Also auto-allow same-origin (Origin host === request Host).
// const allowList = [
//   /\.vercel\.app$/,
//   /^https?:\/\/localhost(?::\d+)?$/,
//   /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
//   /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?$/,
//   /^https?:\/\/3\.109\.207\.179(?::\d+)?$/, // <-- your public IP
// ];

// // Wrap cors() so we can read req.headers.host
// app.use((req, res, next) => {
//   cors({
//     origin(origin, cb) {
//       // No Origin header -> non-CORS or curl -> allow
//       if (!origin) return cb(null, true);

//       // Always allow same-origin
//       try {
//         const o = new URL(origin);
//         // req.headers.host like "3.109.207.179" or "3.109.207.179:80"
//         const reqHost = String(req.headers.host || "");
//         if (o.host === reqHost) return cb(null, true);
//       } catch {
//         /* ignore parse errors */
//       }

//       // Allow if on our whitelist
//       const ok = allowList.some((re) => re.test(origin));
//       // IMPORTANT: don't throw -> just return false (no CORS headers) instead of 500
//       return cb(null, ok);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })(req, res, next);
// });
// /** ---------- /CORS ---------- */

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// /** Health checks */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) =>
//   res.json({ ok: true, message: "Backend is live!" })
// );

// /** Static (optional) */
// console.log("📂 Serving static HTML from:", path.join(__dirname, "..", "frontend1html"));
// app.use("/frontend1html", express.static(path.join(__dirname, "..", "frontend1html")));

// /** API routes */
// app.use("/api/upload", uploadRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/sections", sectionRoutes);
// app.use("/api/topbar", topbarRoutes);
// app.use("/api/navbar", navbarRoutes);
// app.use("/api/hero", heroRoutes);
// app.use("/api/about", aboutRoutes);
// app.use("/api/whychoose", whyChooseUsRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/appointment", appointmentRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/testimonial", testimonialRoutes);
// app.use("/api/contact-info", contactRoutes);
// app.use("/api", pageRoutes);

// /** 404 for unknown API routes */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /** DB + start server */
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server running at http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("🔴 MongoDB connection error:", err);
//     // still start server so health endpoints work even if DB is down
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
//     });
//   });





// // server.ts
// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import path from "path";

// // routes
// import uploadRoutes from "./routes/upload.routes";
// import authRoutes from "./routes/auth.routes";
// import sectionRoutes from "./routes/section.routes";
// import topbarRoutes from "./routes/topbar.routes";
// import navbarRoutes from "./routes/navbar.routes";
// import heroRoutes from "./routes/hero.routes";
// import aboutRoutes from "./routes/about.routes";
// import whyChooseUsRoutes from "./routes/whyChooseUs.routes";
// import serviceRoutes from "./routes/service.routes";
// import appointmentRoutes from "./routes/appointment.routes";
// import teamRoutes from "./routes/team.routes";
// import testimonialRoutes from "./routes/testimonial.routes";
// import contactRoutes from "./routes/contact.routes";
// import pageRoutes from "./routes/page.routes";

// const app = express();

// // Bind to IPv4 loopback so Nginx (127.0.0.1) reaches us
// const PORT = Number(process.env.PORT || 5000);
// const HOST = process.env.HOST || "127.0.0.1";

// // Trust the proxy so req.ip / secure cookies work
// app.set("trust proxy", 1);

// /** ---------- VERY PERMISSIVE CORS (no throws) ---------- */
// app.use((req, res, next) => {
//   const origin = (req.headers.origin as string) || "*";
//   // mirror origin or allow all when no Origin header (curl, server-to-server)
//   res.header("Access-Control-Allow-Origin", origin);
//   res.header("Vary", "Origin"); // proper caching
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,POST,PUT,PATCH,DELETE,OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization"
//   );

//   // Short-circuit preflight here (don’t let it reach routers)
//   if (req.method === "OPTIONS") {
//     return res.status(204).end();
//   }
//   next();
// });
// /** ---------- /CORS ---------- */

// // Body parsers
// app.use(express.json({ limit: "50mb" }));               // allow big JSON too
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /** Health checks */
// app.get("/", (_req, res) => res.send("✅ Backend is live!"));
// app.get(["/api", "/api/"], (_req, res) =>
//   res.json({ ok: true, message: "Backend is live!" })
// );

// /** Static (optional) */
// console.log("📂 Serving static HTML from:", path.join(__dirname, "..", "frontend1html"));
// app.use("/frontend1html", express.static(path.join(__dirname, "..", "frontend1html")));

// /** API routes */
// app.use("/api/upload", uploadRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/sections", sectionRoutes);
// app.use("/api/topbar", topbarRoutes);
// app.use("/api/navbar", navbarRoutes);
// app.use("/api/hero", heroRoutes);
// app.use("/api/about", aboutRoutes);
// app.use("/api/whychoose", whyChooseUsRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/appointment", appointmentRoutes);
// app.use("/api/team", teamRoutes);
// app.use("/api/testimonial", testimonialRoutes);
// app.use("/api/contact-info", contactRoutes);
// app.use("/api", pageRoutes);

// /** 404 for unknown API routes */
// app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// /** DB + start server */
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log("🟢 MongoDB connected!");
//     app.listen(PORT, HOST, () => {
//       console.log(`🚀 Server running at http://${HOST}:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("🔴 MongoDB connection error:", err);
//     // still start server so health endpoints work even if DB is down
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

// ---- your existing routes ----
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";
import sectionRoutes from "./routes/section.routes";
import topbarRoutes from "./routes/topbar.routes";
import navbarRoutes from "./routes/navbar.routes";
import heroRoutes from "./routes/hero.routes";
import aboutRoutes from "./routes/about.routes";
import whyChooseUsRoutes from "./routes/whyChooseUs.routes";
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import teamRoutes from "./routes/team.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import contactRoutes from "./routes/contact.routes";
import pageRoutes from "./routes/page.routes";

const app = express();

// Bind to loopback so Nginx (127.0.0.1) can proxy to us
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1";

// Trust the proxy (cookies, req.ip, etc.)
app.set("trust proxy", 1);

// ---------- CORS (permissive so the editor works) ----------
app.use(cors({ origin: (_o, cb) => cb(null, true), credentials: true }));
app.options("*", cors());
// -----------------------------------------------------------

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

// ---------- API routes ----------
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/topbar", topbarRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/whychoose", whyChooseUsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/contact-info", contactRoutes);
app.use("/api", pageRoutes);
// ----------------------------------

// ---------- 404 for unknown API routes ----------
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
// -----------------------------------------------

// ---------- Global error handler (surfacing multer/S3/etc.) ----------
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
