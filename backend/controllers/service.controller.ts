import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Service from "../models/Service";

// Get all services
export const getServices = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const doc = await Service.findOne({ userId, templateId });
  res.json(doc || {});
};

// Bulk replace all services
export const upsertServices = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const { services } = req.body;

  const updated = await Service.findOneAndUpdate(
    { userId, templateId },
    { $set: { services } },
    { new: true, upsert: true }
  );

  res.json({ message: "✅ Services updated", result: updated });
};

// Add a single service
export const addService = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const newService = req.body;

  const doc = await Service.findOneAndUpdate(
    { userId, templateId },
    { $push: { services: newService } },
    { new: true, upsert: true }
  );

  res.json({ message: "✅ Service added", result: doc });
};

// Update a single service by ID
export const updateService = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;
  const update = req.body;

  const doc = await Service.findOneAndUpdate(
    { userId, templateId, "services._id": serviceId },
    {
      $set: {
        "services.$.title": update.title,
        "services.$.description": update.description,
        "services.$.imageUrl": update.imageUrl,
        "services.$.delay": update.delay,
        "services.$.order": update.order,
        "services.$.buttonText": update.buttonText,
        "services.$.buttonHref": update.buttonHref,
      },
    },
    { new: true }
  );

  res.json({ message: "✅ Service updated", result: doc });
};

// Delete a service by ID
export const deleteServiceById = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;

  const doc = await Service.findOneAndUpdate(
    { userId, templateId },
    { $pull: { services: { _id: serviceId } } },
    { new: true }
  );

  res.json({ message: "✅ Service deleted", result: doc });
};

// Upload image and attach to service
export const uploadServiceImage = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `/uploads/services/${req.file.filename}`;
  const doc = await Service.findOne({ userId, templateId });

  if (!doc) {
    return res.json({ message: "✅ Image uploaded (no service doc)", imageUrl });
  }

  const service = doc.services.find((s) => String(s._id) === serviceId);
  if (service) {
    service.imageUrl = imageUrl;
    await doc.save();
    return res.json({ message: "✅ Image uploaded & service updated", result: doc });
  }

  res.json({ message: "✅ Image uploaded", imageUrl });
};

// Delete image from disk and service
export const deleteServiceImage = async (req: Request, res: Response) => {
  const { userId, templateId, serviceId } = req.params;

  const doc = await Service.findOne({ userId, templateId });
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const service = doc.services.find((s) => String(s._id) === serviceId);
  if (!service || !service.imageUrl) {
    return res.status(404).json({ error: "Service or image not found" });
  }

  const absolute = path.join(
    process.cwd(),
    "uploads",
    service.imageUrl.replace("/uploads/", "")
  );

  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);

  service.imageUrl = "";
  await doc.save();

  res.json({ message: "✅ Image removed", result: doc });
};
