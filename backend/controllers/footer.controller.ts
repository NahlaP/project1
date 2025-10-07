import { Request, Response } from 'express';
import Footer from '../models/Footer';

export const getFooter = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const doc = await Footer.findOne({ userId, templateId }).lean();
    res.json(doc || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch footer' });
  }
};

const ALLOWED = [
  'topSubtitle','emailLabel','emailHref',
  'logoUrl',
  'officeAddress','officePhone','officePhoneHref',
  'copyrightHtml',
  'social','links'
] as const;

function pickAllowed(body: any) {
  const out: any = {};
  if (!body || typeof body !== 'object') return out;
  for (const k of ALLOWED) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

export const saveFooter = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const update = pickAllowed(req.body);

    const result = await Footer.findOneAndUpdate(
      { userId, templateId },
      { $set: update, $setOnInsert: { userId, templateId } },
      { new: true, upsert: true }
    ).lean();

    res.json({ message: '✅ Footer saved', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save footer' });
  }
};
