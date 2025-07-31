// controllers/team.controller.ts
import { Request, Response } from "express";
import TeamMember from "../models/TeamMember";

export const getTeam = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const team = await TeamMember.find({ userId, templateId }).sort({ createdAt: 1 });
  res.json(team);
};

// Create
export const createTeamMember = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { name, role, imageUrl, socials } = req.body;

  const member = await TeamMember.create({
    userId,
    templateId,
    name,
    role,
    imageUrl,
    socials,
  });

  res.json({ message: "Member created", data: member });
};

// Update (text fields + imageUrl if sent)
// export const updateTeamMember = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const payload = req.body;

//   const updated = await TeamMember.findByIdAndUpdate(id, { $set: payload }, { new: true });
//   if (!updated) return res.status(404).json({ message: "Not found" });

//   res.json({ message: "Member updated", data: updated });
// };

// Update ONLY imageUrl after you upload with /api/upload/team
export const updateTeamMemberImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

  const updated = await TeamMember.findByIdAndUpdate(id, { $set: { imageUrl } }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });

  res.json({ message: "Image updated", data: updated });
};

export const deleteTeamMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  await TeamMember.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};

export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, imageUrl: imageFromBody } = req.body;

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Update text fields
    if (name) member.name = name;
    if (role) member.role = role;

    // Update image
    if (req.file) {
      member.imageUrl = `/uploads/team/${req.file.filename}`;
    } else if (imageFromBody) {
      member.imageUrl = imageFromBody;
    }

    const updated = await member.save();
    res.json({ message: "Team member updated", data: updated });
  } catch (err) {
    console.error("❌ Failed to update team member:", err);
    res.status(500).json({ message: "Failed to update team member" });
  }
};
