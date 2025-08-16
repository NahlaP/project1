









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










import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

// routes
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

// IMPORTANT: bind to IPv4 loopback so Nginx (127.0.0.1) can reach us
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1";

// Trust the proxy so req.ip / secure cookies work
app.set("trust proxy", 1);

/** CORS — run BEFORE routes */
const allowList = [
  /\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/,
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const ok = allowList.some((re) => re.test(origin));
      return ok ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

/** Health checks */
app.get("/", (_req, res) => res.send("✅ Backend is live!"));
app.get(["/api", "/api/"], (_req, res) =>
  res.json({ ok: true, message: "Backend is live!" })
);

/** Static (optional) */
console.log("📂 Serving static HTML from:", path.join(__dirname, "..", "frontend1html"));
app.use("/frontend1html", express.static(path.join(__dirname, "..", "frontend1html")));

/** API routes */
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

/** 404 for unknown API routes */
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

/** DB + start server */
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("🟢 MongoDB connected!");
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("🔴 MongoDB connection error:", err);
    // still start server so health endpoint works even if DB is down
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server (no DB) at http://${HOST}:${PORT}`);
    });
  });
