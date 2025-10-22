// // C:\Users\97158\Desktop\project1\backend\controllers\projects.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Projects, { ProjectItem, ProjectsDocument } from "../models/Projects";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Projects presign failed:", key, e);
//     return "";
//   }
// }

// const ABS_RX = /^https?:\/\//i;
// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS_RX.test(k)) return ""; // never persist full URLs
//   return k;
// };

// type IncomingProjectRow = {
//   imageUrl?: string;      // may be an S3 key (we’ll clean it) or empty
//   imageKey?: string;      // preferred: S3 key
//   imageAlt?: string;
//   tag?: string;
//   title?: string;
//   year?: string | number;
//   href?: string;
//   order?: number;
// };

// /**
//  * Normalize incoming rows and optionally preserve previous imageUrl
//  * when the client didn't intend to change it.
//  */
// function normalizeProjects(
//   input: any,
//   previous?: ProjectItem[]
// ): ProjectItem[] | undefined {
//   if (!Array.isArray(input)) return undefined;

//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingProjectRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevImg = hadPrev ? (prev[i].imageUrl || "") : "";

//     // prefer explicit imageKey; fall back to imageUrl; else keep previous
//     const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
//     const imageUrl = candidateKey || prevImg;

//     return {
//       imageUrl,
//       imageAlt:
//         typeof row?.imageAlt === "string" && row.imageAlt
//           ? row.imageAlt
//           : hadPrev
//           ? prev[i].imageAlt || "Project image"
//           : "Project image",
//       tag: typeof row?.tag === "string" ? row.tag : hadPrev ? prev[i].tag || "" : "",
//       title:
//         typeof row?.title === "string" ? row.title : hadPrev ? prev[i].title || "" : "",
//       year:
//         typeof row?.year === "number" || typeof row?.year === "string"
//           ? String(row.year)
//           : hadPrev
//           ? prev[i].year || ""
//           : "",
//       href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "" : "",
//       order:
//         Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
//     };
//   });
// }

// /* ---------------- handlers ---------------- */

// /** GET: user override or fallback to template defaultSections[type='works'] */
// export const getProjects = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();
//     if (doc && (doc.projects?.length || 0) > 0) {
//       const projects = await Promise.all(
//         doc.projects.map(async (p) => ({
//           imageUrl: (await presignOrEmpty(p.imageUrl)) || "",
//           imageKey: p.imageUrl || "",
//           imageAlt: p.imageAlt || "Project image",
//           tag: p.tag || "",
//           title: p.title || "",
//           year: p.year || "",
//           href: p.href || "",
//           order: p.order ?? 0,
//         }))
//       );
//       return res.json({ _source: "user", projects });
//     }

//     // 2) template fallback
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections)
//       ? tpl.defaultSections
//       : [];
//     // find the first "works" section
//     const fallback = defaults
//       .filter((s: any) => String(s?.type).toLowerCase() === "works")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (!fallback) return res.json({ _source: "template-none", projects: [] });

//     const arr = Array.isArray(fallback?.content?.projects)
//       ? fallback.content.projects
//       : [];

//     const projects = await Promise.all(
//       arr.map(async (p: any, i: number) => {
//         const k = p?.imageKey || p?.imageUrl || "";
//         let img = "";
//         let key = "";
//         if (k && !ABS_RX.test(String(k))) {
//           img = await presignOrEmpty(String(k));
//           key = String(k);
//         } else if (ABS_RX.test(String(k))) {
//           img = String(k);
//           key = "";
//         }
//         return {
//           imageUrl: img,
//           imageKey: key,
//           imageAlt: String(p?.imageAlt ?? "Project image"),
//           tag: String(p?.tag ?? ""),
//           title: String(p?.title ?? ""),
//           year: String(p?.year ?? ""),
//           href: String(p?.href ?? ""),
//           order: Number.isFinite(p?.order) ? Number(p?.order) : i,
//         };
//       })
//     );

//     return res.json({ _source: "template", projects });
//   } catch (e) {
//     console.error("getProjects error:", e);
//     return res.status(500).json({ error: "Failed to fetch Projects" });
//   }
// };

// /** PUT: upsert the full projects array (preserves old image if not changed) */
// export const upsertProjects = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const existing = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();

//     const incoming = normalizeProjects((req.body || {}).projects, existing?.projects);
//     if (!incoming) return res.status(400).json({ error: "Missing projects array" });

//     const doc = await Projects.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { projects: incoming } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ Projects saved",
//       count: doc.projects.length,
//     });
//   } catch (e) {
//     console.error("upsertProjects error:", e);
//     return res.status(500).json({ error: "Failed to save Projects" });
//   }
// };

// /** POST: upload image for a specific project index */
// export const uploadProjectImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // e.g. "sections/projects/<timestamp>-name.jpg"
//   try {
//     const doc = await Projects.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { [`projects.${idx}.imageUrl`]: key } },
//       { new: true, upsert: true }
//     );

//     const url = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ Project image uploaded",
//       index: idx,
//       imageUrl: url,
//       imageKey: key,
//       total: doc.projects.length,
//     });
//   } catch (e) {
//     console.error("uploadProjectImage error:", e);
//     return res.status(500).json({ error: "Failed to upload project image" });
//   }
// };

// /** DELETE: remove an image for a project index (and clear DB key) */
// export const deleteProjectImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   try {
//     const doc = await Projects.findOne({ userId, templateId });
//     if (!doc || !doc.projects[idx] || !doc.projects[idx].imageUrl) {
//       return res.status(404).json({ error: "No image set for this index" });
//     }

//     const key = doc.projects[idx].imageUrl;
//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }));
//     } catch { /* ignore S3 delete errors */ }

//     doc.projects[idx].imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", index: idx });
//   } catch (e) {
//     console.error("deleteProjectImage error:", e);
//     return res.status(500).json({ error: "Failed to remove project image" });
//   }
// };



























// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Projects, { ProjectItem, ProjectsDocument } from "../models/Projects";
// import { TemplateModel } from "../models/Template";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// const ABS_RX = /^https?:\/\//i;

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Projects presign failed:", key, e);
//     return "";
//   }
// }

// const cleanKey = (candidate?: string) => {
//   let k = String(candidate ?? "");
//   if (!k) return "";
//   // strip accidental local absolute paths
//   k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (ABS_RX.test(k)) return ""; // never persist full URLs
//   return k;
// };

// type IncomingProjectRow = {
//   imageUrl?: string; // may be an S3 key (we’ll clean it) or empty
//   imageKey?: string; // preferred: S3 key
//   imageAlt?: string;
//   tag?: string;
//   title?: string;
//   year?: string | number;
//   href?: string;
//   order?: number;
// };

// function normalizeProjects(
//   input: any,
//   previous?: ProjectItem[]
// ): ProjectItem[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const prev = Array.isArray(previous) ? previous : [];

//   return (input as IncomingProjectRow[]).map((row, i) => {
//     const hadPrev = !!prev[i];
//     const prevImg = hadPrev ? (prev[i].imageUrl || "") : "";
//     const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
//     const imageUrl = candidateKey || prevImg;

//     return {
//       imageUrl,
//       imageAlt:
//         typeof row?.imageAlt === "string" && row.imageAlt
//           ? row.imageAlt
//           : hadPrev
//           ? prev[i].imageAlt || "Project image"
//           : "Project image",
//       tag: typeof row?.tag === "string" ? row.tag : hadPrev ? prev[i].tag || "" : "",
//       title: typeof row?.title === "string" ? row.title : hadPrev ? prev[i].title || "" : "",
//       year:
//         typeof row?.year === "number" || typeof row?.year === "string"
//           ? String(row.year)
//           : hadPrev
//           ? prev[i].year || ""
//           : "",
//       href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "" : "",
//       order: Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
//     };
//   });
// }

// /* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
// const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
// const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
// const templateCdnBase = (templateId: string) =>
//   `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/v1/`;

// const absolutizeTemplateAsset = (templateId: string, p: string) => {
//   if (!p) return "";
//   if (ABS_RX.test(p)) return p;
//   if (p.startsWith("assets/")) return templateCdnBase(templateId) + p.replace(/^\/+/, "");
//   return p;
// };

// /* ----- Hardcoded SIR defaults (matches your static HTML) ----- */
// function sirStaticDefaults(templateId: string) {
//   const mk = (n: number, tag: string, title: string, href: string, year = "2023") => ({
//     imageUrl: absolutizeTemplateAsset(templateId, `assets/imgs/works/full/${n}.jpg`),
//     imageKey: "", // template assets are absolute, not keys
//     imageAlt: "Project image",
//     tag,
//     title,
//     year,
//     href,
//     order: n - 1,
//   });

//   return [
//     mk(1, "Digital Design", "Retouch Photo", "project1.html"),
//     mk(2, "Branding", "Earthmade Aroma", "project2.html"),
//     mk(3, "Branding", "Bank Rebranding", "project3.html"),
//     mk(4, "Product Design", "The joy of music", "project4.html"),
//     mk(5, "Digital Art", "Blue Adobe MAX", "project1.html"),
//     mk(6, "Web Design", "Carved Wood", "project3.html"),
//   ];
// }

// /* ---------------- handlers ---------------- */

// /** GET: user override → else template → else hardcoded SIR defaults */
// export const getProjects = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const doc = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();
//     if (doc && (doc.projects?.length || 0) > 0) {
//       const projects = await Promise.all(
//         doc.projects.map(async (p) => {
//           const raw = p.imageUrl || "";
//           const img = ABS_RX.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
//           return {
//             imageUrl: img,
//             imageKey: ABS_RX.test(raw) ? "" : raw,
//             imageAlt: p.imageAlt || "Project image",
//             tag: p.tag || "",
//             title: p.title || "",
//             year: p.year || "",
//             href: p.href || "",
//             order: p.order ?? 0,
//           };
//         })
//       );
//       return res.json({ _source: "user", projects });
//     }

//     // 2) DB template defaults (if any)
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => String(s?.type).toLowerCase() === "works")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (fallback && Array.isArray(fallback?.content?.projects) && fallback.content.projects.length) {
//       const arr = fallback.content.projects;
//       const projects = await Promise.all(
//         arr.map(async (p: any, i: number) => {
//           const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
//           let img = "";
//           let key = "";

//           if (ABS_RX.test(candidate)) {
//             img = candidate;
//           } else if (candidate.startsWith("assets/")) {
//             img = absolutizeTemplateAsset(templateId, candidate);
//           } else if (candidate) {
//             key = candidate;
//             img = await presignOrEmpty(candidate);
//           }

//           return {
//             imageUrl: img,
//             imageKey: key,
//             imageAlt: String(p?.imageAlt ?? "Project image"),
//             tag: String(p?.tag ?? ""),
//             title: String(p?.title ?? ""),
//             year: String(p?.year ?? ""),
//             href: String(p?.href ?? ""),
//             order: Number.isFinite(p?.order) ? Number(p?.order) : i,
//           };
//         })
//       );

//       return res.json({ _source: "template", projects });
//     }

//     // 3) Hard fallback — your static six items for sir-template-1
//     if (templateId === "sir-template-1") {
//       return res.json({ _source: "hardcoded", projects: sirStaticDefaults(templateId) });
//     }

//     return res.json({ _source: "template-none", projects: [] });
//   } catch (e) {
//     console.error("getProjects error:", e);
//     return res.status(500).json({ error: "Failed to fetch Projects" });
//   }
// };

// /** PUT: upsert the full projects array (keys only; preserves previous if empty) */
// export const upsertProjects = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const existing = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();

//     const incoming = normalizeProjects((req.body || {}).projects, existing?.projects);
//     if (!incoming) return res.status(400).json({ error: "Missing projects array" });

//     const doc = await Projects.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { projects: incoming } },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({ message: "✅ Projects saved", count: doc.projects.length });
//   } catch (e) {
//     console.error("upsertProjects error:", e);
//     return res.status(500).json({ error: "Failed to save Projects" });
//   }
// };

// /** POST: RESET — delete override so GET falls back to template/hardcoded */
// export const resetProjects = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await Projects.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetProjects error:", e);
//     return res.status(500).json({ error: "Failed to reset Projects" });
//   }
// };

// /** POST: upload image for a specific project index */
// export const uploadProjectImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // "sections/projects/<timestamp>-name.jpg"
//   try {
//     const doc = await Projects.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { [`projects.${idx}.imageUrl`]: key } },
//       { new: true, upsert: true }
//     );

//     const url = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ Project image uploaded",
//       index: idx,
//       imageUrl: url,
//       imageKey: key,
//       total: doc.projects.length,
//     });
//   } catch (e) {
//     console.error("uploadProjectImage error:", e);
//     return res.status(500).json({ error: "Failed to upload project image" });
//   }
// };

// /** DELETE: remove an image for a project index (and clear DB key) */
// export const deleteProjectImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
//   try {
//     const doc = await Projects.findOne({ userId, templateId });
//     if (!doc || !doc.projects[idx] || !doc.projects[idx].imageUrl) {
//       return res.status(404).json({ error: "No image set for this index" });
//     }

//     const key = doc.projects[idx].imageUrl;
//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//       }));
//     } catch { /* ignore S3 delete errors */ }

//     doc.projects[idx].imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", index: idx });
//   } catch (e) {
//     console.error("deleteProjectImage error:", e);
//     return res.status(500).json({ error: "Failed to remove project image" });
//   }
// };
















// backend/controllers/projects.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Projects, { ProjectItem, ProjectsDocument } from "../models/Projects";
import { TemplateModel } from "../models/TemplateV"; // <— VERSIONED model
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

const ABS_RX = /^https?:\/\//i;

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Projects presign failed:", key, e);
    return "";
  }
}

const cleanKey = (candidate?: string) => {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip accidental local absolute paths
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS_RX.test(k)) return ""; // never persist full URLs
  return k.replace(/^\/+/, "");
};

type IncomingProjectRow = {
  imageUrl?: string; // may be S3 key (we’ll clean it) or assets/... or absolute
  imageKey?: string; // preferred: S3 key
  imageAlt?: string;
  tag?: string;      // alias: category
  category?: string; // legacy alias => tag
  title?: string;
  year?: string | number;
  href?: string;
  order?: number;
};

function normalizeProjects(
  input: any,
  previous?: ProjectItem[]
): ProjectItem[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const prev = Array.isArray(previous) ? previous : [];

  return (input as IncomingProjectRow[]).map((row, i) => {
    const hadPrev = !!prev[i];
    const prevImg = hadPrev ? (prev[i].imageUrl || "") : "";
    const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
    const imageUrl = candidateKey || prevImg;

    const tag = (typeof row?.tag === "string" && row.tag) ||
                (typeof row?.category === "string" && row.category) ||
                (hadPrev ? prev[i].tag || "" : "");

    return {
      imageUrl,
      imageAlt:
        typeof row?.imageAlt === "string" && row.imageAlt
          ? row.imageAlt
          : hadPrev
          ? prev[i].imageAlt || "Project image"
          : "Project image",
      tag,
      title: typeof row?.title === "string" ? row.title : hadPrev ? prev[i].title || "" : "",
      year:
        typeof row?.year === "number" || typeof row?.year === "string"
          ? String(row.year)
          : hadPrev
          ? prev[i].year || ""
          : "",
      href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "" : "",
      order: Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
    };
  });
}

/* ----- template asset absolutizer (assets/... -> CDN URL) ---- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, verTag: string | undefined, p: string) => {
  if (!p) return "";
  if (ABS_RX.test(p)) return p;
  if (p.startsWith("assets/")) return templateCdnBase(templateId, verTag || "v1") + p.replace(/^\/+/, "");
  return p;
};

/* ----- Version defaults picker (supports items[] or projects[]) ----- */
function pickVersionProjects(tpl: any, verTag?: string) {
  const chosen =
    (verTag && tpl?.versions?.find((v: any) => v.tag === verTag)) ||
    (tpl?.currentTag && tpl?.versions?.find((v: any) => v.tag === tpl.currentTag)) ||
    tpl?.versions?.[0];

  const tagUsed = chosen?.tag || verTag || tpl?.currentTag || "v1";
  const defaults = Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [];

  const section = defaults
    .filter((s: any) => {
      const t = String(s?.type || "").toLowerCase();
      return t === "works" || t === "projects";
    })
    .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

  const content = section?.content || {};
  let arr: any[] = [];

  if (Array.isArray(content.projects)) arr = content.projects;
  else if (Array.isArray(content.items)) arr = content.items;

  return { arr, tagUsed };
}

/* ----- Hardcoded SIR defaults (matches your static HTML) ----- */
function sirStaticDefaults(templateId: string, verTag?: string) {
  const mk = (n: number, tag: string, title: string, href: string, year = "2023") => ({
    imageUrl: absolutizeTemplateAsset(templateId, verTag, `assets/imgs/works/full/${n}.jpg`),
    imageKey: "", // template assets are absolute, not keys
    imageAlt: "Project image",
    tag,
    title,
    year,
    href,
    order: n - 1,
  });

  return [
    mk(1, "Digital Design", "Retouch Photo", "project1.html"),
    mk(2, "Branding", "Earthmade Aroma", "project2.html"),
    mk(3, "Branding", "Bank Rebranding", "project3.html"),
    mk(4, "Product Design", "The joy of music", "project4.html"),
    mk(5, "Digital Art", "Blue Adobe MAX", "project1.html"),
    mk(6, "Web Design", "Carved Wood", "project3.html"),
  ];
}

/* ---------------- handlers ---------------- */

/** GET: user override → versioned template defaults → hardcoded → [] */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = String((req.query?.ver ?? "") as string).trim() || undefined;

    // 1) user override
    const doc = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();
    if (doc && (doc.projects?.length || 0) > 0) {
      const projects = await Promise.all(
        doc.projects.map(async (p) => {
          const raw = p.imageUrl || "";
          const img = ABS_RX.test(raw) ? raw : (await presignOrEmpty(raw)) || "";
          return {
            imageUrl: img,
            imageKey: ABS_RX.test(raw) ? "" : raw,
            imageAlt: p.imageAlt || "Project image",
            tag: p.tag || "",
            title: p.title || "",
            year: p.year || "",
            href: p.href || "",
            order: p.order ?? 0,
          };
        })
      );
      return res.json({ _source: "user", projects });
    }

    // 2) versioned template defaults (TemplateV)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    if (tpl) {
      const { arr, tagUsed } = pickVersionProjects(tpl, verTag);

      if (Array.isArray(arr) && arr.length) {
        const projects = await Promise.all(
          arr.map(async (p: any, i: number) => {
            // candidate can be imageKey or imageUrl
            const candidate = String(p?.imageKey ?? p?.imageUrl ?? "");
            let img = "";
            let key = "";

            if (ABS_RX.test(candidate)) {
              img = candidate;
            } else if (candidate.startsWith("assets/")) {
              img = absolutizeTemplateAsset(templateId, tagUsed, candidate);
            } else if (candidate) {
              key = candidate; // an S3 key stored in template (rare)
              img = await presignOrEmpty(candidate);
            }

            // allow "category" alias for tag
            const tag =
              typeof p?.tag === "string" && p.tag
                ? p.tag
                : typeof p?.category === "string"
                ? p.category
                : "";

            return {
              imageUrl: img,
              imageKey: key,
              imageAlt: String(p?.imageAlt ?? "Project image"),
              tag: String(tag),
              title: String(p?.title ?? ""),
              year: String(p?.year ?? ""),
              href: String(p?.href ?? ""),
              order: Number.isFinite(p?.order) ? Number(p?.order) : i,
            };
          })
        );

        return res.json({ _source: "template", versionTag: tagUsed, projects });
      }
    }

    // 3) Hard fallback — your static six items for sir-template-1
    if (templateId === "sir-template-1") {
      return res.json({
        _source: "hardcoded",
        versionTag: verTag || "v1",
        projects: sirStaticDefaults(templateId, verTag),
      });
    }

    // 4) none
    return res.json({ _source: "template-none", projects: [] });
  } catch (e) {
    console.error("getProjects error:", e);
    return res.status(500).json({ error: "Failed to fetch Projects" });
  }
};

/** PUT: upsert the full projects array (keys only; preserves previous if empty) */
export const upsertProjects = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const existing = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();

    const incoming = normalizeProjects((req.body || {}).projects, existing?.projects);
    if (!incoming) return res.status(400).json({ error: "Missing projects array" });

    const doc = await Projects.findOneAndUpdate(
      { userId, templateId },
      { $set: { projects: incoming } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ message: "✅ Projects saved", count: doc.projects.length });
  } catch (e) {
    console.error("upsertProjects error:", e);
    return res.status(500).json({ error: "Failed to save Projects" });
  }
};

/** POST: RESET — delete override so GET falls back to template/hardcoded */
export const resetProjects = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await Projects.deleteMany({ userId, templateId });
    return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
  } catch (e) {
    console.error("resetProjects error:", e);
    return res.status(500).json({ error: "Failed to reset Projects" });
  }
};

/** POST: upload image for a specific project index (multer-s3 single file) */
export const uploadProjectImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key; // "sections/projects/<timestamp>-name.jpg"
  try {
    const doc = await Projects.findOneAndUpdate(
      { userId, templateId },
      { $set: { [`projects.${idx}.imageUrl`]: key } },
      { new: true, upsert: true }
    );

    const url = await presignOrEmpty(key);
    return res.json({
      message: "✅ Project image uploaded",
      index: idx,
      imageUrl: url,
      imageKey: key,
      total: doc.projects.length,
    });
  } catch (e) {
    console.error("uploadProjectImage error:", e);
    return res.status(500).json({ error: "Failed to upload project image" });
  }
};

/** DELETE: remove an image for a project index (and clear DB key) */
export const deleteProjectImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
  try {
    const doc = await Projects.findOne({ userId, templateId });
    if (!doc || !doc.projects[idx] || !doc.projects[idx].imageUrl) {
      return res.status(404).json({ error: "No image set for this index" });
    }

    const key = doc.projects[idx].imageUrl;
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      }));
    } catch { /* ignore S3 delete errors */ }

    doc.projects[idx].imageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Image removed", index: idx });
  } catch (e) {
    console.error("deleteProjectImage error:", e);
    return res.status(500).json({ error: "Failed to remove project image" });
  }
};
