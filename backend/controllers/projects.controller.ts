// C:\Users\97158\Desktop\project1\backend\controllers\projects.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Projects, { ProjectItem, ProjectsDocument } from "../models/Projects";
import { TemplateModel } from "../models/Template";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

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

const ABS_RX = /^https?:\/\//i;
const cleanKey = (candidate?: string) => {
  let k = String(candidate ?? "");
  if (!k) return "";
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS_RX.test(k)) return ""; // never persist full URLs
  return k;
};

type IncomingProjectRow = {
  imageUrl?: string;      // may be an S3 key (we’ll clean it) or empty
  imageKey?: string;      // preferred: S3 key
  imageAlt?: string;
  tag?: string;
  title?: string;
  year?: string | number;
  href?: string;
  order?: number;
};

/**
 * Normalize incoming rows and optionally preserve previous imageUrl
 * when the client didn't intend to change it.
 */
function normalizeProjects(
  input: any,
  previous?: ProjectItem[]
): ProjectItem[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const prev = Array.isArray(previous) ? previous : [];

  return (input as IncomingProjectRow[]).map((row, i) => {
    const hadPrev = !!prev[i];
    const prevImg = hadPrev ? (prev[i].imageUrl || "") : "";

    // prefer explicit imageKey; fall back to imageUrl; else keep previous
    const candidateKey = cleanKey(row?.imageKey ?? row?.imageUrl);
    const imageUrl = candidateKey || prevImg;

    return {
      imageUrl,
      imageAlt:
        typeof row?.imageAlt === "string" && row.imageAlt
          ? row.imageAlt
          : hadPrev
          ? prev[i].imageAlt || "Project image"
          : "Project image",
      tag: typeof row?.tag === "string" ? row.tag : hadPrev ? prev[i].tag || "" : "",
      title:
        typeof row?.title === "string" ? row.title : hadPrev ? prev[i].title || "" : "",
      year:
        typeof row?.year === "number" || typeof row?.year === "string"
          ? String(row.year)
          : hadPrev
          ? prev[i].year || ""
          : "",
      href: typeof row?.href === "string" ? row.href : hadPrev ? prev[i].href || "" : "",
      order:
        Number.isFinite(row?.order) ? Number(row!.order) : hadPrev ? prev[i].order ?? i : i,
    };
  });
}

/* ---------------- handlers ---------------- */

/** GET: user override or fallback to template defaultSections[type='works'] */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const doc = await Projects.findOne({ userId, templateId }).lean<ProjectsDocument | null>();
    if (doc && (doc.projects?.length || 0) > 0) {
      const projects = await Promise.all(
        doc.projects.map(async (p) => ({
          imageUrl: (await presignOrEmpty(p.imageUrl)) || "",
          imageKey: p.imageUrl || "",
          imageAlt: p.imageAlt || "Project image",
          tag: p.tag || "",
          title: p.title || "",
          year: p.year || "",
          href: p.href || "",
          order: p.order ?? 0,
        }))
      );
      return res.json({ _source: "user", projects });
    }

    // 2) template fallback
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections)
      ? tpl.defaultSections
      : [];
    // find the first "works" section
    const fallback = defaults
      .filter((s: any) => String(s?.type).toLowerCase() === "works")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    if (!fallback) return res.json({ _source: "template-none", projects: [] });

    const arr = Array.isArray(fallback?.content?.projects)
      ? fallback.content.projects
      : [];

    const projects = await Promise.all(
      arr.map(async (p: any, i: number) => {
        const k = p?.imageKey || p?.imageUrl || "";
        let img = "";
        let key = "";
        if (k && !ABS_RX.test(String(k))) {
          img = await presignOrEmpty(String(k));
          key = String(k);
        } else if (ABS_RX.test(String(k))) {
          img = String(k);
          key = "";
        }
        return {
          imageUrl: img,
          imageKey: key,
          imageAlt: String(p?.imageAlt ?? "Project image"),
          tag: String(p?.tag ?? ""),
          title: String(p?.title ?? ""),
          year: String(p?.year ?? ""),
          href: String(p?.href ?? ""),
          order: Number.isFinite(p?.order) ? Number(p?.order) : i,
        };
      })
    );

    return res.json({ _source: "template", projects });
  } catch (e) {
    console.error("getProjects error:", e);
    return res.status(500).json({ error: "Failed to fetch Projects" });
  }
};

/** PUT: upsert the full projects array (preserves old image if not changed) */
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

    return res.json({
      message: "✅ Projects saved",
      count: doc.projects.length,
    });
  } catch (e) {
    console.error("upsertProjects error:", e);
    return res.status(500).json({ error: "Failed to save Projects" });
  }
};

/** POST: upload image for a specific project index */
export const uploadProjectImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const idx = Math.max(0, parseInt((req.params as any).index, 10) || 0);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key; // e.g. "sections/projects/<timestamp>-name.jpg"
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
