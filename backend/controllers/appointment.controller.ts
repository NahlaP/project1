import { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";

// GET /api/appointment/:userId/:templateId
export const getAppointmentSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, templateId } = req.params;
    const data: IAppointment | null = await Appointment.findOne({ userId, templateId });
    res.status(200).json(data || {});
  } catch (error) {
    console.error("Error fetching appointment section:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/appointment/:userId/:templateId
export const updateAppointmentSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, templateId } = req.params;
    const payload = req.body;

    const updated: IAppointment = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: payload },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Updated", data: updated });
  } catch (error) {
    console.error("Error updating appointment section:", error);
    res.status(500).json({ message: "Server error" });
  }
};
