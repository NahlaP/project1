import { Request, Response } from 'express';
import ContactInfo from '../models/Contact';

export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const info = await ContactInfo.findOne({ userId, templateId });
    res.json(info || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
};

export const saveContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const update = req.body;

    const existing = await ContactInfo.findOneAndUpdate(
      { userId, templateId },
      update,
      { new: true, upsert: true }
    );

    res.json({ message: '✅ Contact info saved', result: existing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contact info' });
  }
};
