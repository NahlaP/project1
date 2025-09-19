

// controllers/team.controller.ts
import { Request, Response } from "express";
import TeamMember from "../models/TeamMember";
import { s3 } from "../lib/s3";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const presign = async (key?: string) => {
  if (!key) return "";
  if (key.startsWith("/uploads/")) return ""; // legacy path fallback
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn: 60 }
  );
};

// List team members (returns presigned URLs)
export const getTeam = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const team = await TeamMember.find({ userId, templateId }).sort({ createdAt: 1 });

  const withUrls = await Promise.all(
    team.map(async (m) => {
      const obj = m.toObject();
      const imageKey = obj.imageUrl || ""; // store the S3 key in imageUrl field
      const imageUrl = await presign(imageKey);
      return { ...obj, imageKey, imageUrl };
    })
  );

  res.json(withUrls);
};

// Create a member (accepts file upload or body.imageKey / body.imageUrl)
export const createTeamMember = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { name, role, socials } = req.body;

  const file = (req as any).file;
  // prefer uploaded file key; else allow passing an existing key
  const incomingKey = file?.key || req.body.imageKey || req.body.imageUrl || "";

  const member = await TeamMember.create({
    userId,
    templateId,
    name,
    role,
    socials,
    imageUrl: incomingKey, // store S3 key here
  });

  const signed = await presign(member.imageUrl);
  res.json({
    message: "✅ Member created",
    data: {
      ...member.toObject(),
      imageKey: member.imageUrl,
      imageUrl: signed,
    },
  });
};

// Update (text + optional new image)
export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, imageKey, imageUrl: imageFromBody, removeImage } = req.body;

    const member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ message: "Team member not found" });

    if (name) member.name = name;
    if (role) member.role = role;

    const file = (req as any).file;
    if (file?.key) {
      member.imageUrl = file.key; // use uploaded file’s S3 key
    } else if (imageKey) {
      member.imageUrl = imageKey; // use provided key
    } else if (imageFromBody) {
      member.imageUrl = imageFromBody; // treat as key if you pass one
    } else if (removeImage === "true" || removeImage === true) {
      // optional best-effort delete if it’s on S3
      if (member.imageUrl && !member.imageUrl.startsWith("/uploads/")) {
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

    const updated = await member.save();
    const signed = await presign(updated.imageUrl);
    res.json({
      message: "✅ Team member updated",
      data: {
        ...updated.toObject(),
        imageKey: updated.imageUrl,
        imageUrl: signed,
      },
    });
  } catch (err) {
    console.error("❌ Failed to update team member:", err);
    res.status(500).json({ message: "Failed to update team member" });
  }
};

// Delete member (best-effort delete image from S3)
export const deleteTeamMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await TeamMember.findById(id);
  if (doc?.imageUrl && !doc.imageUrl.startsWith("/uploads/")) {
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
  res.json({ message: "✅ Deleted" });
};





// // cpanel
// // controllers/team.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import TeamMember from "../models/TeamMember";

// dotenv.config();

// /** helper: get ids from params with safe defaults */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
// });

// /** helper: sign short-lived JWT for cPanel upload */
// function signUploadToken(payload: Record<string, any>) {
//   const now = Math.floor(Date.now() / 1000);
//   const exp = now + Number(process.env.TOKEN_TTL_SECONDS || 180);
//   return jwt.sign({ iat: now, exp, ...payload }, process.env.JWT_SECRET!, {
//     algorithm: "HS256",
//   });
// }

// /** GET: list team members (return stored public URLs as-is) */
// export const getTeam = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const team = await TeamMember.find({ userId, templateId }).sort({ createdAt: 1 });

//     const out = team.map((m) => {
//       const obj = m.toObject();
//       return {
//         ...obj,
//         imageKey: "",                 // legacy empty to satisfy older UIs
//         imageUrl: obj.imageUrl || "", // public URL we store
//       };
//     });

//     return res.json(out);
//   } catch (err) {
//     console.error("getTeam error:", err);
//     return res.status(500).json({ error: "Failed to fetch team" });
//   }
// };

// /** POST: create member (imageUrl must be public http(s) URL if provided) */
// export const createTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { name, role, socials, imageUrl, image } = (req.body || {}) as any;

//     const url = String(imageUrl ?? image ?? "").trim();
//     if (url && !/^https?:\/\//i.test(url)) {
//       return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//     }

//     const member = await TeamMember.create({
//       userId,
//       templateId,
//       name,
//       role,
//       socials,
//       imageUrl: url || "",
//     });

//     return res.json({
//       message: "✅ Member created",
//       data: {
//         ...member.toObject(),
//         imageKey: "",                 // legacy
//         imageUrl: member.imageUrl || "",
//       },
//     });
//   } catch (err) {
//     console.error("createTeamMember error:", err);
//     return res.status(500).json({ error: "Failed to create team member" });
//   }
// };

// /** PATCH: update member (text + optional public image URL) */
// export const updateTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;
//     const { name, role, socials, imageUrl, image, removeImage } = (req.body || {}) as any;

//     const member = await TeamMember.findById(id);
//     if (!member) return res.status(404).json({ message: "Team member not found" });

//     if (typeof name !== "undefined") member.name = name;
//     if (typeof role !== "undefined") member.role = role;
//     if (typeof socials !== "undefined") member.socials = socials;

//     const incomingUrl = String(imageUrl ?? image ?? "").trim();
//     if (incomingUrl) {
//       if (!/^https?:\/\//i.test(incomingUrl)) {
//         return res.status(400).json({ error: "imageUrl must be a public http(s) URL" });
//       }
//       member.imageUrl = incomingUrl;
//     } else if (removeImage === "true" || removeImage === true) {
//       member.imageUrl = "";
//     }

//     const updated = await member.save();
//     return res.json({
//       message: "✅ Team member updated",
//       data: {
//         ...updated.toObject(),
//         imageKey: "",                  // legacy
//         imageUrl: updated.imageUrl || "",
//       },
//     });
//   } catch (err) {
//     console.error("❌ Failed to update team member:", err);
//     return res.status(500).json({ message: "Failed to update team member" });
//   }
// };

// /** DELETE: remove member (no storage deletion needed) */
// export const deleteTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;
//     await TeamMember.findByIdAndDelete(id);
//     return res.json({ message: "✅ Deleted" });
//   } catch (err) {
//     console.error("deleteTeamMember error:", err);
//     return res.status(500).json({ error: "Failed to delete team member" });
//   }
// };

// /** NEW: clear only the member image URL */
// export const clearTeamMemberImage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params as any;
//     const updated = await TeamMember.findByIdAndUpdate(
//       id,
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Team member not found" });
//     return res.json({ message: "Image cleared", data: updated });
//   } catch (err) {
//     console.error("clearTeamMemberImage error:", err);
//     return res.status(500).json({ error: "Failed to clear team member image" });
//   }
// };

// /** NEW: issue short-lived token + upload URL for cPanel (same flow as hero) */
// export const getTeamUploadToken = async (req: Request, res: Response) => {
//   try {
//     const { filename, size, type } = (req.body || {}) as any;
//     if (!filename || !size || !type) {
//       return res.status(400).json({ error: "filename, size, type required" });
//     }
//     const base = (process.env.CPANEL_BASE_URL || "").replace(/\/+$/, "");
//     if (!base) {
//       return res.status(500).json({ error: "CPANEL_BASE_URL not configured" });
//     }
//     const uploadUrl = `${base}/api/upload.php`;
//     const token = signUploadToken({ scope: "upload", filename, size, type });
//     return res.json({
//       token,
//       uploadUrl,
//       expiresIn: Number(process.env.TOKEN_TTL_SECONDS || 180),
//     });
//   } catch (e) {
//     console.error("getTeamUploadToken error:", e);
//     return res.status(500).json({ error: "Failed to create upload token" });
//   }
// };
