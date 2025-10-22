// // og


// import { Request, Response } from "express";
// import TeamMember from "../models/TeamMember";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
//   PutObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// /* -------- helpers -------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   // ignore legacy local paths
//   if (/^\/uploads\//.test(key)) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return "";
//   }
// }

// function cleanKeyCandidate(candidate?: string) {
//   let key = String(candidate ?? "");
//   if (!key) return "";
//   // strip accidental local path
//   key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // ignore full URLs; we only store S3 keys in DB
//   if (/^https?:\/\//i.test(key)) return "";
//   return key;
// }

// // NEW: make sure socials becomes an object (FormData sends strings)
// function normalizeSocials(input: any) {
//   if (input == null) return undefined;
//   if (typeof input === "string") {
//     try {
//       const obj = JSON.parse(input);
//       return obj && typeof obj === "object" ? obj : {};
//     } catch {
//       return {};
//     }
//   }
//   if (typeof input === "object") return input;
//   return {};
// }

// /* -------- handlers -------- */

// // List team (returns imageKey + presigned imageUrl)
// export const getTeam = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const team = await TeamMember.find({ userId, templateId }).sort({ createdAt: 1 });

//     const withUrls = await Promise.all(
//       team.map(async (m) => {
//         const obj = m.toObject();
//         const imageKey = obj.imageUrl || "";
//         const imageUrl = await presignOrEmpty(imageKey);
//         return { ...obj, imageKey, imageUrl };
//       })
//     );

//     return res.json(withUrls);
//   } catch (e) {
//     console.error("getTeam error:", e);
//     return res.status(500).json({ error: "Failed to fetch team" });
//   }
// };

// // Create member (multipart optional OR body.imageKey/body.imageUrl)
// export const createTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { name, role, socials } = (req.body || {}) as any;

//     const file = (req as any).file;
//     const incomingKey =
//       file?.key ||
//       cleanKeyCandidate((req.body as any).imageKey ?? (req.body as any).imageUrl) ||
//       "";

//     const member = await TeamMember.create({
//       userId,
//       templateId,
//       name,
//       role,
//       socials: normalizeSocials(socials) ?? {},
//       imageUrl: incomingKey, // store S3 key here
//     });

//     const signed = await presignOrEmpty(member.imageUrl);
//     return res.json({
//       message: "✅ Member created",
//       data: {
//         ...member.toObject(),
//         imageKey: member.imageUrl || "",
//         imageUrl: signed,
//       },
//     });
//   } catch (e) {
//     console.error("createTeamMember error:", e);
//     return res.status(500).json({ error: "Failed to create team member" });
//   }
// };

// // Update member (multipart optional, or pass imageKey/imageUrl/removeImage)
// export const updateTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       role,
//       imageKey,
//       imageUrl: imageFromBody,
//       removeImage,
//       socials,
//     } = (req.body || {}) as any;

//     const member = await TeamMember.findById(id);
//     if (!member) return res.status(404).json({ message: "Team member not found" });

//     if (name !== undefined) member.name = name;
//     if (role !== undefined) member.role = role;
//     if (socials !== undefined) member.socials = normalizeSocials(socials) ?? {};

//     const file = (req as any).file;
//     if (file?.key) {
//       member.imageUrl = file.key;
//     } else {
//       const key = cleanKeyCandidate(imageKey ?? imageFromBody);
//       if (key) {
//         member.imageUrl = key;
//       } else if (removeImage === "true" || removeImage === true) {
//         if (member.imageUrl && !/^\/uploads\//.test(member.imageUrl)) {
//           try {
//             await s3.send(
//               new DeleteObjectCommand({
//                 Bucket: process.env.S3_BUCKET!,
//                 Key: member.imageUrl,
//               })
//             );
//           } catch {
//             // ignore delete errors
//           }
//         }
//         member.imageUrl = "";
//       }
//     }

//     const updated = await member.save();
//     const signed = await presignOrEmpty(updated.imageUrl);
//     return res.json({
//       message: "✅ Team member updated",
//       data: {
//         ...updated.toObject(),
//         imageKey: updated.imageUrl || "",
//         imageUrl: signed,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Failed to update team member:", err);
//     return res.status(500).json({ message: "Failed to update team member" });
//   }
// };

// // Delete member (best-effort S3 delete)
// export const deleteTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const doc = await TeamMember.findById(id);
//     if (doc?.imageUrl && !/^\/uploads\//.test(doc.imageUrl)) {
//       try {
//         await s3.send(
//           new DeleteObjectCommand({
//             Bucket: process.env.S3_BUCKET!,
//             Key: doc.imageUrl,
//           })
//         );
//       } catch {
//         // ignore
//       }
//     }
//     await TeamMember.findByIdAndDelete(id);
//     return res.json({ message: "✅ Deleted" });
//   } catch (e) {
//     console.error("deleteTeamMember error:", e);
//     return res.status(500).json({ error: "Failed to delete team member" });
//   }
// };

// // OPTIONAL: base64 image upload (attach/update a member’s image by id)
// export const uploadTeamImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { id, userId, templateId } = req.params;
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const member = await TeamMember.findOne({ _id: id, userId, templateId });
//     if (!member) return res.status(404).json({ error: "Team member not found" });

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/team/${id}/${Date.now()}-${baseName}${ext}`;

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: buf,
//         ContentType:
//           ext === ".png" ? "image/png" :
//           ext === ".webp" ? "image/webp" :
//           ext === ".gif" ? "image/gif" : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     member.imageUrl = key;
//     const updated = await member.save();
//     const signed = await presignOrEmpty(updated.imageUrl);

//     return res.json({
//       message: "✅ Team image uploaded (base64)",
//       data: {
//         ...updated.toObject(),
//         imageKey: updated.imageUrl || "",
//         imageUrl: signed,
//       },
//     });
//   } catch (e) {
//     console.error("uploadTeamImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload team image (base64)" });
//   }
// };












// backend/controllers/team.controller.ts
import { Request, Response } from "express";
import TeamMember from "../models/TeamMember";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TemplateModel } from "../models/TemplateV";

/* -------- helpers -------- */
const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  // ignore legacy local paths
  if (/^\/uploads\//.test(key)) return "";
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

function cleanKeyCandidate(candidate?: string) {
  let key = String(candidate ?? "");
  if (!key) return "";
  // strip accidental local path
  key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // ignore full URLs; we only store S3 keys in DB
  if (ABS.test(key)) return "";
  return key.replace(/^\/+/, "");
}

// turn socials into an object (FormData sends strings)
function normalizeSocials(input: any) {
  if (input == null) return undefined;
  if (typeof input === "string") {
    try {
      const obj = JSON.parse(input);
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }
  if (typeof input === "object") return input;
  return {};
}

/* ----- Template CDN absolutizer (assets/... or img/...) → CDN URL ----- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p: string, tag = "v1") => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  if (
    p.startsWith("assets/") ||
    p.startsWith("img/") ||
    p.startsWith("css/") ||
    p.startsWith("js/") ||
    p.startsWith("lib/")
  ) {
    return templateCdnBase(templateId, tag) + p.replace(/^\/+/, "");
  }
  return p;
};

/* ----- Pick defaults from versions[] or legacy and return tag used ----- */
function pickVersionDefaults(
  tpl: any,
  verTag?: string
): { tagUsed: string; defaults: any[] } {
  let tagUsed = "legacy";
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag &&
        tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    return {
      tagUsed,
      defaults: Array.isArray(chosen?.defaultSections)
        ? chosen.defaultSections
        : [],
    };
  }
  return {
    tagUsed,
    defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [],
  };
}

/* -------- handlers -------- */

// GET team (user overrides → template defaults)
export const getTeam = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // 1) user team
    const team = await TeamMember.find({ userId, templateId }).sort({
      createdAt: 1,
    });

    if (team.length) {
      const withUrls = await Promise.all(
        team.map(async (m) => {
          const obj = m.toObject();
          const imageKey = obj.imageUrl || "";
          const imageUrl = await presignOrEmpty(imageKey);
          return { _source: "user", ...obj, imageKey, imageUrl };
        })
      );
      return res.json(withUrls);
    }

    // 2) template defaults (e.g., gym-template seed)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const row =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "team")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (row?.content?.members && Array.isArray(row.content.members)) {
      const out = row.content.members.map((m: any, idx: number) => {
        const raw = String(m?.imageUrl || m?.image || "");
        const imageUrl =
          ABS.test(raw)
            ? raw
            : raw && (raw.startsWith("assets/") || raw.startsWith("img/"))
            ? absolutizeTemplateAsset(templateId, raw, tagUsed)
            : "";
        return {
          _source: "template",
          _idx: idx,
          userId,
          templateId,
          name: String(m?.name ?? ""),
          role: String(m?.role ?? m?.title ?? ""),
          socials:
            typeof m?.socials === "object" && m?.socials
              ? m.socials
              : undefined,
          imageKey: "", // template assets are absolute URLs, not keys
          imageUrl,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        };
      });
      return res.json(out);
    }

    // 3) nothing
    return res.json([]);
  } catch (e) {
    console.error("getTeam error:", e);
    return res.status(500).json({ error: "Failed to fetch team" });
  }
};

// Create member (multipart optional OR body.imageKey/body.imageUrl)
export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { name, role, socials } = (req.body || {}) as any;

    const file = (req as any).file;
    const incomingKey =
      file?.key ||
      cleanKeyCandidate((req.body as any).imageKey ?? (req.body as any).imageUrl) ||
      "";

    const member = await TeamMember.create({
      userId,
      templateId,
      name,
      role,
      socials: normalizeSocials(socials) ?? {},
      imageUrl: incomingKey, // store S3 key here
    });

    const signed = await presignOrEmpty(member.imageUrl);
    return res.json({
      message: "✅ Member created",
      data: {
        ...member.toObject(),
        imageKey: member.imageUrl || "",
        imageUrl: signed,
      },
    });
  } catch (e) {
    console.error("createTeamMember error:", e);
    return res.status(500).json({ error: "Failed to create team member" });
  }
};

// Update member (multipart optional, or pass imageKey/imageUrl/removeImage)
export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      imageKey,
      imageUrl: imageFromBody,
      removeImage,
      socials,
    } = (req.body || {}) as any;

    const member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (socials !== undefined) member.socials = normalizeSocials(socials) ?? {};

    const file = (req as any).file;
    if (file?.key) {
      member.imageUrl = file.key;
    } else {
      const key = cleanKeyCandidate(imageKey ?? imageFromBody);
      if (key) {
        member.imageUrl = key;
      } else if (removeImage === "true" || removeImage === true) {
        if (member.imageUrl && !/^\/uploads\//.test(member.imageUrl)) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: member.imageUrl,
              })
            );
          } catch {
            // ignore delete errors
          }
        }
        member.imageUrl = "";
      }
    }

    const updated = await member.save();
    const signed = await presignOrEmpty(updated.imageUrl);
    return res.json({
      message: "✅ Team member updated",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: signed,
      },
    });
  } catch (err) {
    console.error("❌ Failed to update team member:", err);
    return res.status(500).json({ message: "Failed to update team member" });
  }
};

// Delete member (best-effort S3 delete)
export const deleteTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await TeamMember.findById(id);
    if (doc?.imageUrl && !/^\/uploads\//.test(doc.imageUrl)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: doc.imageUrl,
          })
        );
      } catch {
        // ignore
      }
    }
    await TeamMember.findByIdAndDelete(id);
    return res.json({ message: "✅ Deleted" });
  } catch (e) {
    console.error("deleteTeamMember error:", e);
    return res.status(500).json({ error: "Failed to delete team member" });
  }
};

// OPTIONAL: base64 image upload (attach/update a member’s image by id)
export const uploadTeamImageBase64 = async (req: Request, res: Response) => {
  try {
    const { id, userId, templateId } = req.params as any;
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const member = await TeamMember.findOne({ _id: id, userId, templateId });
    if (!member) return res.status(404).json({ error: "Team member not found" });

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext =
      (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime =
        (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) ||
        "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/team/${id}/${Date.now()}-${baseName}${ext}`;

    const b64 =
      typeof dataUrl === "string" && dataUrl.includes(",")
        ? dataUrl.split(",")[1]
        : typeof base64 === "string"
        ? base64
        : "";
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType:
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
            ? "image/gif"
            : "image/jpeg",
        ACL: "private",
      })
    );

    member.imageUrl = key;
    const updated = await member.save();
    const signed = await presignOrEmpty(updated.imageUrl);

    return res.json({
      message: "✅ Team image uploaded (base64)",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl || "",
        imageUrl: signed,
      },
    });
  } catch (e) {
    console.error("uploadTeamImageBase64 error:", e);
    return res
      .status(500)
      .json({ error: "Failed to upload team image (base64)" });
  }
};

/* ---- Reset: wipe user members so GET falls back to template defaults ---- */
// POST /api/team/:userId/:templateId/reset
export const resetTeam = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    await TeamMember.deleteMany({ userId, templateId });
    return res.json({ message: "✅ Team reset to template defaults (on next GET)" });
  } catch (e) {
    console.error("resetTeam error:", e);
    return res.status(500).json({ error: "Failed to reset team" });
  }
};
