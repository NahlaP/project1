// // controllers/team.controller.ts
// import { Request, Response } from "express";
// import TeamMember from "../models/TeamMember";

// export const getTeam = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const team = await TeamMember.find({ userId, templateId }).sort({ createdAt: 1 });
//   res.json(team);
// };

// // Create
// export const createTeamMember = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { name, role, imageUrl, socials } = req.body;

//   const member = await TeamMember.create({
//     userId,
//     templateId,
//     name,
//     role,
//     imageUrl,
//     socials,
//   });

//   res.json({ message: "Member created", data: member });
// };

// export const updateTeamMemberImage = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { imageUrl } = req.body;
//   if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

//   const updated = await TeamMember.findByIdAndUpdate(id, { $set: { imageUrl } }, { new: true });
//   if (!updated) return res.status(404).json({ message: "Not found" });

//   res.json({ message: "Image updated", data: updated });
// };

// export const deleteTeamMember = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   await TeamMember.findByIdAndDelete(id);
//   res.json({ message: "Deleted" });
// };

// export const updateTeamMember = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, role, imageUrl: imageFromBody } = req.body;

//     const member = await TeamMember.findById(id);
//     if (!member) {
//       return res.status(404).json({ message: "Team member not found" });
//     }

//     // Update text fields
//     if (name) member.name = name;
//     if (role) member.role = role;

//     // Update image
//     if (req.file) {
//       member.imageUrl = `/uploads/team/${req.file.filename}`;
//     } else if (imageFromBody) {
//       member.imageUrl = imageFromBody;
//     }

//     const updated = await member.save();
//     res.json({ message: "Team member updated", data: updated });
//   } catch (err) {
//     console.error("❌ Failed to update team member:", err);
//     res.status(500).json({ message: "Failed to update team member" });
//   }
// };




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
