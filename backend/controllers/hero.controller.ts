


// video url



import { Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import HeroSection from "../models/HeroSection";
import { TemplateModel } from "../models/Template";
import { s3 } from "../lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ---------------- helpers ---------------- */
const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "gym-template-1",
});

async function presign(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("Presign failed for key:", key, e);
    return "";
  }
}

/* ---------------- handlers ---------------- */

export const generateHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const textPrompt =
      "Write a gym coach website hero headline (1-2 lines). Include brand/name, role, and motivation. Return plain text only.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: textPrompt }],
    });

    const content = completion.choices[0].message?.content?.trim() || "";

    const updated = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { content },
      { upsert: true, new: true }
    );

    return res.json({
      content: updated.content || "",
      imageKey: updated.imageUrl || "",
      videoKey: updated.videoKey || "",
      posterKey: updated.posterKey || "",
    });
  } catch (err) {
    console.error("Hero text generation failed:", err);
    return res.status(500).json({ error: "Failed to generate hero text" });
  }
};

/** PUT/POST: save headline + (optional) imageKey + (optional) videoKey/posterKey */
export const upsertHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const body = (req.body || {}) as any;

    const rawContent = body.content ?? body.data?.content ?? "";
    const content = typeof rawContent === "string" ? rawContent : "";

    // accept either ...Key or ...Url (we store only keys)
    const cleanKey = (v: unknown) => {
      let k = String(v || "");
      k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
      if (/^https?:\/\//i.test(k)) k = "";
      return k;
    };

    const imageKey  = cleanKey(body.imageKey  ?? body.imageUrl);
    const videoKey  = cleanKey(body.videoKey  ?? body.videoUrl);
    const posterKey = cleanKey(body.posterKey ?? body.posterUrl);

    const update: Record<string, any> = {};
    if (typeof content === "string") update.content = content;
    if (imageKey) update.imageUrl = imageKey;
    if (videoKey) update.videoKey = videoKey;
    if (posterKey) update.posterKey = posterKey;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({
      message: "✅ Saved",
      content: doc.content || "",
      imageKey: doc.imageUrl || "",
      videoKey: doc.videoKey || "",
      posterKey: doc.posterKey || "",
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Save Hero error:", err);
    return res.status(500).json({ error: "Failed to save Hero section" });
  }
};

/** GET: user override OR fallback to template default */
export const getHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const hero = await HeroSection.findOne({ userId, templateId });
    if (hero && (hero.content || hero.imageUrl || hero.videoKey)) {
      return res.json({
        _source: "user",
        content: hero.content || "",
        imageUrl: await presign(hero.imageUrl),
        imageKey: hero.imageUrl || "",
        videoUrl: await presign(hero.videoKey),
        videoKey: hero.videoKey || "",
        posterUrl: await presign(hero.posterKey),
        posterKey: hero.posterKey || "",
      });
    }

    // 2) template default (first 'hero' section)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
    const fallback = defaults
      .filter((s: any) => s?.type === "hero")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    if (!fallback) {
      return res.json({
        _source: "template-none",
        content: "",
        imageUrl: "",
        imageKey: "",
        videoUrl: "",
        videoKey: "",
        posterUrl: "",
        posterKey: "",
      });
    }

    const fContent = String(
      fallback.content?.content ??
        fallback.content?.text ??
        fallback.content ??
        ""
    );

    let imageUrl = "";
    if (fallback.content?.imageKey) imageUrl = await presign(String(fallback.content.imageKey));
    else if (fallback.content?.imageUrl && /^https?:\/\//i.test(fallback.content.imageUrl)) {
      imageUrl = String(fallback.content.imageUrl);
    }

    let videoUrl = "";
    if (fallback.content?.videoKey) videoUrl = await presign(String(fallback.content.videoKey));
    else if (fallback.content?.videoUrl && /^https?:\/\//i.test(fallback.content.videoUrl)) {
      videoUrl = String(fallback.content.videoUrl);
    }

    let posterUrl = "";
    if (fallback.content?.posterKey) posterUrl = await presign(String(fallback.content.posterKey));
    else if (fallback.content?.posterUrl && /^https?:\/\//i.test(fallback.content.posterUrl)) {
      posterUrl = String(fallback.content.posterUrl);
    }

    return res.json({
      _source: "template",
      content: fContent,
      imageUrl,
      imageKey: String(fallback.content?.imageKey || ""),
      videoUrl,
      videoKey: String(fallback.content?.videoKey || ""),
      posterUrl,
      posterKey: String(fallback.content?.posterKey || ""),
    });
  } catch (err) {
    console.error("Get Hero error:", err);
    return res.status(500).json({ error: "Failed to fetch Hero section" });
  }
};

/** POST /image: upload hero image (field: image) */
export const uploadHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No image uploaded" });

  const key: string = file.key;
  const bucket: string = file.bucket;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "✅ Hero image uploaded",
      bucket,
      key,
      imageUrl: await presign(key),
      imageKey: doc.imageUrl || "",
    });
  } catch (err) {
    console.error("Upload Hero Image error:", err);
    return res.status(500).json({ error: "Failed to upload hero image" });
  }
};

/** POST /video: upload hero video (field: video) */
export const uploadHeroVideo = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No video uploaded" });

  const key: string = file.key;
  const bucket: string = file.bucket;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { videoKey: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "🎬 Hero video uploaded",
      bucket,
      key,
      videoUrl: await presign(key),
      videoKey: doc.videoKey || "",
    });
  } catch (err) {
    console.error("Upload Hero Video error:", err);
    return res.status(500).json({ error: "Failed to upload hero video" });
  }
};

/** POST /poster: upload poster image (field: poster) */
export const uploadHeroPoster = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No poster uploaded" });

  const key: string = file.key;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { posterKey: key } },
      { new: true, upsert: true }
    );

    return res.json({
      message: "🖼️ Poster uploaded",
      posterUrl: await presign(key),
      posterKey: doc.posterKey || "",
    });
  } catch (err) {
    console.error("Upload Poster error:", err);
    return res.status(500).json({ error: "Failed to upload poster image" });
  }
};

export const clearHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
  } catch (err) {
    console.error("Clear image failed", err);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};

export const clearHeroVideo = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { videoKey: "", posterKey: "" } },
      { new: true }
    );
    return res.json({
      message: "Video cleared",
      videoKey: doc?.videoKey || "",
      posterKey: doc?.posterKey || "",
    });
  } catch (err) {
    console.error("Clear video failed", err);
    return res.status(500).json({ error: "Failed to clear video" });
  }
};


// --- add at bottom of hero.controller.ts ---
export const resetHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { content: "", imageUrl: "", videoKey: "", posterKey: "" } },
      { upsert: true }
    );
    return res.json({ message: "✅ Hero reset to template defaults" });
  } catch (err) {
    console.error("Reset Hero error:", err);
    return res.status(500).json({ error: "Failed to reset hero" });
  }
};
