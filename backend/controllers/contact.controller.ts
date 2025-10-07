// import { Request, Response } from 'express';
// import ContactInfo from '../models/Contact';

// export const getContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const info = await ContactInfo.findOne({ userId, templateId });
//     res.json(info || {});
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch contact info' });
//   }
// };

// export const saveContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const update = req.body;

//     const existing = await ContactInfo.findOneAndUpdate(
//       { userId, templateId },
//       update,
//       { new: true, upsert: true }
//     );

//     res.json({ message: '✅ Contact info saved', result: existing });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save contact info' });
//   }
// };




// backend/controllers/contact.controller.ts
import { Request, Response } from 'express';
import ContactInfo from '../models/Contact';

const ALLOWED = [
  // SIR
  'subtitle','titleStrong','titleLight','buttonText','formAction',
  // GYM
  'address','phone','email',
  'socialLinks.facebook','socialLinks.twitter','socialLinks.youtube','socialLinks.linkedin',
  'businessHours.mondayToFriday','businessHours.saturday','businessHours.sunday',
] as const;

function pickAllowed(body: any) {
  const out: any = {};
  if (!body || typeof body !== 'object') return out;
  for (const k of ALLOWED) {
    if (k.includes('.')) {
      const [p, c] = k.split('.');
      if (body?.[p]?.[c] !== undefined) {
        out[p] = out[p] || {};
        out[p][c] = body[p][c];
      }
    } else if (body[k] !== undefined) {
      out[k] = body[k];
    }
  }
  return out;
}

export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const info = await ContactInfo.findOne({ userId, templateId }).lean();
    res.json(info || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
};

export const saveContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = req.params;
    const update = pickAllowed(req.body);

    const result = await ContactInfo.findOneAndUpdate(
      { userId, templateId },
      { $set: update, $setOnInsert: { userId, templateId } },
      { new: true, upsert: true }
    ).lean();

    res.json({ message: '✅ Contact info saved', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contact info' });
  }
};
