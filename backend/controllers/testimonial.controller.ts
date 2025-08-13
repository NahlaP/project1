
// import { Request, Response } from "express";
// import Testimonial from "../models/Testimonial";

// // GET all testimonials for a user/template
// export const getTestimonials = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const testimonials = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });
//     res.status(200).json(testimonials);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch testimonials" });
//   }
// };

// // POST new testimonial
// export const createTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const { name, profession, message, rating } = req.body;

//     let imageUrl = "";

//     // If using upload directly (via /api/testimonial/:userId/:templateId with multer)
//     if (req.file) {
//       imageUrl = `/uploads/testimonials/${req.file.filename}`;
//     } else if (req.body.imageUrl) {
//       // Fallback if image uploaded via /api/upload
//       imageUrl = req.body.imageUrl;
//     }

//     const newTestimonial = await Testimonial.create({
//       userId,
//       templateId,
//       name,
//       profession,
//       message,
//       rating,
//       imageUrl,
//     });

//     res.status(201).json(newTestimonial);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create testimonial" });
//   }
// };

// // DELETE testimonial
// export const deleteTestimonial = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Testimonial.findByIdAndDelete(id);
//     if (!deleted) return res.status(404).json({ error: "Testimonial not found" });

//     res.status(200).json({ message: "Testimonial deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete testimonial" });
//   }
// };

import { Request, Response } from "express";

import Testimonial, { ITestimonial } from "../models/Testimonial";
// GET all testimonials for a user/template
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const testimonials = await Testimonial.find({ userId, templateId }).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// POST new testimonial
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const { name, profession, message, rating } = req.body;

    let imageUrl = "";

    // If using upload directly (via /api/testimonial/:userId/:templateId with multer)
    if (req.file) {
      imageUrl = `/uploads/testimonials/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // Fallback if image uploaded via /api/upload
      imageUrl = req.body.imageUrl;
    }

    const newTestimonial = await Testimonial.create({
      userId,
      templateId,
      name,
      profession,
      message,
      rating,
      imageUrl,
    });

    res.status(201).json(newTestimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// DELETE testimonial
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Testimonial not found" });

    res.status(200).json({ message: "Testimonial deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};

// controllers/testimonial.controller.ts
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, profession, message, rating, imageUrl, removeImage } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ error: "Testimonial not found" });

    // Update fields if present
    if (name) testimonial.name = name;
    if (profession) testimonial.profession = profession;
    if (message) testimonial.message = message;
    if (rating !== undefined) testimonial.rating = Number(rating);

    // Handle image upload
    if (req.file) {
      testimonial.imageUrl = `/uploads/testimonials/${req.file.filename}`;
    } else if (imageUrl) {
      testimonial.imageUrl = imageUrl;
    } else if (removeImage === "true") {
      testimonial.imageUrl = undefined;
    }

    const updated = await testimonial.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};
