




// og code works in postman
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import HeroSection from "../models/HeroSection";

// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// const userId = "demo-user";
// const templateId = "gym-template-1";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// /** Generate Hero text only */
// export const generateHero = async (_req: Request, res: Response) => {
//   try {
//     const textPrompt =
//       "Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.";

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: textPrompt }],
//     });

//     const content = completion.choices[0].message?.content?.trim() || "";

//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { content }, // only text
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       content: updated.content,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Hero text generation failed:", err);
//     res.status(500).json({ error: "Failed to generate hero text" });
//   }
// };

// /** Save Hero content; store S3 key if provided */
// export const saveHero = async (req: Request, res: Response) => {
//   const { content, imageKey, imageUrl } = req.body;
//   if (!content) return res.status(400).json({ error: "Missing content" });

//   const update: any = { content };
//   const key = imageKey || imageUrl; // accept either field name
//   if (key) update.imageUrl = key;   // store the S3 object key (not a URL)

//   try {
//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       update,
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       content: updated.content,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Save Hero error:", err);
//     res.status(500).json({ error: "Failed to save Hero section" });
//   }
// };

// /** Get Hero content; return presigned URL if key exists */
// export const getHero = async (_req: Request, res: Response) => {
//   try {
//     const hero = await HeroSection.findOne({ userId, templateId });
//     if (!hero) return res.status(404).json({ content: "", imageUrl: "", imageKey: "" });

//     let signedUrl = "";
//     if (hero.imageUrl) {
//       signedUrl = await getSignedUrl(
//         s3,
//         new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: hero.imageUrl }),
//         { expiresIn: 60 }
//       );
//     }

//     res.status(200).json({
//       content: hero.content,
//       imageUrl: signedUrl,             // temporary URL to view
//       imageKey: hero.imageUrl || "",   // raw S3 key
//     });
//   } catch (err) {
//     console.error("Get Hero error:", err);
//     res.status(500).json({ error: "Failed to fetch Hero section" });
//   }
// };

// /** Upload Hero image via multer-s3; store the S3 key */
// export const uploadHeroImage = async (req: Request, res: Response) => {
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No image uploaded" });

//   const key: string = file.key;       // e.g. "sections/hero/169...-image.jpg"
//   const bucket: string = file.bucket;

//   try {
//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { imageUrl: key },               // store the S3 key in DB
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       message: "✅ Hero image uploaded",
//       key,
//       bucket,
//     });
//   } catch (err) {
//     console.error("Upload Hero Image error:", err);
//     res.status(500).json({ error: "Failed to upload hero image" });
//   }
// };

// export const clearHeroImage = async (_req: Request, res: Response) => {
//   try {
//     const result = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { imageUrl: "" },
//       { new: true }
//     );
//     res.status(200).json({ message: "Image cleared", result });
//   } catch (err) {
//     console.error("Clear image failed:", err);
//     res.status(500).json({ error: "Failed to clear image" });
//   }
// };










// // og works with change content only not image
// // controllers/hero.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import HeroSection from "../models/HeroSection";

// import { s3 } from "../lib/s3";
// import { GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// const userId = "demo-user";
// const templateId = "gym-template-1";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// /** Generate Hero text only */
// export const generateHero = async (_req: Request, res: Response) => {
//   try {
//     const textPrompt =
//       "Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.";

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: textPrompt }],
//     });

//     const content = completion.choices[0].message?.content?.trim() || "";

//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { content }, // only text
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({
//       content: updated.content,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Hero text generation failed:", err);
//     return res.status(500).json({ error: "Failed to generate hero text" });
//   }
// };

// /** Save Hero content; store S3 key if provided (tolerant + clearer errors) */
// export const saveHero = async (req: Request, res: Response) => {
//   try {
//     // Helpful once: see what the browser actually sent
//     console.log("saveHero body:", req.body);

//     const body = (req.body || {}) as any;

//     // Accept either {content} or {data:{content}}
//     const rawContent = body.content ?? body.data?.content ?? "";
//     const finalContent = (rawContent ?? "").toString();

//     if (!finalContent.trim()) {
//       return res.status(400).json({ error: "Missing content" });
//     }

//     // Accept either imageKey or imageUrl (raw S3 object key)
//     const key = (body.imageKey ?? body.imageUrl ?? "").toString();

//     const update: Record<string, any> = { content: finalContent };
//     if (key) update.imageUrl = key;

//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       update,
//       { upsert: true, new: true, runValidators: true }
//     );

//     return res.status(200).json({
//       content: updated.content,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err: any) {
//     // Surface schema/validation problems as 400 (clear to client)
//     if (err?.name === "ValidationError") {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("Save Hero error:", err);
//     return res.status(500).json({ error: "Failed to save Hero section" });
//   }
// };

// /** Get Hero content; return presigned URL if key exists */
// export const getHero = async (_req: Request, res: Response) => {
//   try {
//     const hero = await HeroSection.findOne({ userId, templateId });
//     if (!hero) {
//       return res
//         .status(404)
//         .json({ content: "", imageUrl: "", imageKey: "" });
//     }

//     let signedUrl = "";
//     if (hero.imageUrl) {
//       try {
//         signedUrl = await getSignedUrl(
//           s3,
//           new GetObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: hero.imageUrl,
//           }),
//           { expiresIn: 60 }
//         );
//       } catch (e) {
//         // If signing fails, still return content + imageKey so UI can retry presign
//         console.warn("Presign failed for key:", hero.imageUrl, e);
//       }
//     }

//     return res.status(200).json({
//       content: hero.content,
//       imageUrl: signedUrl, // temporary URL to view
//       imageKey: hero.imageUrl || "", // raw S3 key
//     });
//   } catch (err) {
//     console.error("Get Hero error:", err);
//     return res.status(500).json({ error: "Failed to fetch Hero section" });
//   }
// };

// /** Upload Hero image via multer-s3; store the S3 key */
// export const uploadHeroImage = async (req: Request, res: Response) => {
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No image uploaded" });

//   const key: string = file.key; // e.g. "sections/hero/169...-image.jpg"
//   const bucket: string = file.bucket;

//   try {
//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { imageUrl: key }, // store the S3 key in DB
//       { new: true, upsert: true }
//     );

//     return res.status(200).json({
//       message: "✅ Hero image uploaded",
//       key,
//       bucket,
//       imageKey: updated.imageUrl || "",
//     });
//   } catch (err) {
//     console.error("Upload Hero Image error:", err);
//     return res.status(500).json({ error: "Failed to upload hero image" });
//   }
// };

// export const clearHeroImage = async (_req: Request, res: Response) => {
//   try {
//     const result = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { imageUrl: "" },
//       { new: true }
//     );
//     return res.status(200).json({ message: "Image cleared", result });
//   } catch (err) {
//     console.error("Clear image failed:", err);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };



// controllers/hero.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import HeroSection from "../models/HeroSection";
import { s3 } from "../lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** helper: get ids from params */
const ids = (req: Request) => ({
  userId: req.params.userId || "demo-user",
  templateId: req.params.templateId || "gym-template-1",
});

/** Generate Hero text only */
export const generateHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const textPrompt =
      "Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.";

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
      content: updated.content,
      imageKey: updated.imageUrl || "",
    });
  } catch (err) {
    console.error("Hero text generation failed:", err);
    return res.status(500).json({ error: "Failed to generate hero text" });
  }
};

/** PUT: save text and/or imageKey (S3 key) */
export const upsertHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    console.log("HERO PUT body:", req.body);

    const body = (req.body || {}) as any;
    const rawContent = body.content ?? body.data?.content ?? "";
    const content = String(rawContent ?? "");

    const keyCandidate = String(body.imageKey ?? body.imageUrl ?? "");
    const key =
      keyCandidate && !/^https?:\/\//i.test(keyCandidate) ? keyCandidate : "";

    const update: Record<string, any> = {};
    if (content.trim()) update.content = content;
    if (key) update.imageUrl = key; // store S3 key in imageUrl field

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
      content: doc.content,
      imageKey: doc.imageUrl || "",
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Save Hero error:", err);
    return res.status(500).json({ error: "Failed to save Hero section" });
  }
};

/** GET: content + presigned URL (if key exists) */
export const getHero = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const hero = await HeroSection.findOne({ userId, templateId });
    if (!hero) return res.json({ content: "", imageUrl: "", imageKey: "" });

    let signedUrl = "";
    if (hero.imageUrl) {
      try {
        signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: hero.imageUrl as string,
          }),
          { expiresIn: 300 }
        );
      } catch (e) {
        console.warn("Presign failed for key:", hero.imageUrl, e);
      }
    }

    return res.json({
      content: hero.content,
      imageUrl: signedUrl,
      imageKey: hero.imageUrl || "",
    });
  } catch (err) {
    console.error("Get Hero error:", err);
    return res.status(500).json({ error: "Failed to fetch Hero section" });
  }
};

/** POST /image: upload via multer-s3 and store S3 key */
export const uploadHeroImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No image uploaded" });

  const key: string = file.key;       // "sections/hero/<timestamp>-<name>.jpg"
  const bucket: string = file.bucket;

  try {
    const doc = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },     // store S3 key
      { new: true, upsert: true }
    );

    const imageUrl = await getSignedUrl(
      s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }), { expiresIn: 300 }
    );

    return res.json({ message: "✅ Hero image uploaded", bucket, key, imageUrl, imageKey: doc.imageUrl || "" });
  } catch (err) {
    console.error("Upload Hero Image error:", err);
    return res.status(500).json({ error: "Failed to upload hero image" });
  }
};

/** optional */
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
    console.error("Clear image failed:", err);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};
