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




// // backend/controllers/contact.controller.ts
// import { Request, Response } from 'express';
// import ContactInfo from '../models/Contact';

// const ALLOWED = [
//   // SIR
//   'subtitle','titleStrong','titleLight','buttonText','formAction',
//   // GYM
//   'address','phone','email',
//   'socialLinks.facebook','socialLinks.twitter','socialLinks.youtube','socialLinks.linkedin',
//   'businessHours.mondayToFriday','businessHours.saturday','businessHours.sunday',
// ] as const;

// function pickAllowed(body: any) {
//   const out: any = {};
//   if (!body || typeof body !== 'object') return out;
//   for (const k of ALLOWED) {
//     if (k.includes('.')) {
//       const [p, c] = k.split('.');
//       if (body?.[p]?.[c] !== undefined) {
//         out[p] = out[p] || {};
//         out[p][c] = body[p][c];
//       }
//     } else if (body[k] !== undefined) {
//       out[k] = body[k];
//     }
//   }
//   return out;
// }

// export const getContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const info = await ContactInfo.findOne({ userId, templateId }).lean();
//     res.json(info || {});
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch contact info' });
//   }
// };

// export const saveContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = req.params;
//     const update = pickAllowed(req.body);

//     const result = await ContactInfo.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update, $setOnInsert: { userId, templateId } },
//       { new: true, upsert: true }
//     ).lean();

//     res.json({ message: '✅ Contact info saved', result });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save contact info' });
//   }
// };







// // backend/controllers/contact.controller.ts
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import ContactInfo from "../models/Contact";

// dotenv.config();

// /* ------------------------------------------------------------------ */
// /* Whitelist of fields we allow to persist (both SIR and GYM variants) */
// /* ------------------------------------------------------------------ */
// const ALLOWED = [
//   // SIR
//   "subtitle",
//   "titleStrong",
//   "titleLight",
//   "buttonText",
//   "formAction",

//   // GYM
//   "address",
//   "phone",
//   "email",
//   "socialLinks.facebook",
//   "socialLinks.twitter",
//   "socialLinks.youtube",
//   "socialLinks.linkedin",
//   "businessHours.mondayToFriday",
//   "businessHours.saturday",
//   "businessHours.sunday",
// ] as const;
// type AllowedKey = (typeof ALLOWED)[number];

// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "sir-template-1",
// });

// /* ---------------------------- template defaults ---------------------------- */
// /** Only include keys that are in ALLOWED. */
// const CONTACT_DEFAULTS: Record<string, Record<string, any>> = {
//   // Bayone / SIR
//   "sir-template-1": {
//     subtitle: "- Contact Us",
//     titleStrong: "Get In",
//     titleLight: "Touch",
//     buttonText: "Let's Talk",
//     formAction:
//       "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
//   },

//   // Gym example
//   "gym-template-1": {
//     address: "221B Baker Street, London",
//     phone: "+44 20 7946 0958",
//     email: "contact@gympro.example",
//     socialLinks: {
//       facebook: "https://facebook.com/gympro",
//       twitter: "https://twitter.com/gympro",
//       youtube: "https://youtube.com/@gympro",
//       linkedin: "https://linkedin.com/company/gympro",
//     },
//     businessHours: {
//       mondayToFriday: "6:00 AM – 9:00 PM",
//       saturday: "7:00 AM – 7:00 PM",
//       sunday: "8:00 AM – 2:00 PM",
//     },
//   },
// };

// /* --------------------------------- helpers --------------------------------- */
// function pickAllowed(body: any) {
//   const out: any = {};
//   if (!body || typeof body !== "object") return out;

//   for (const k of ALLOWED) {
//     if (k.includes(".")) {
//       const [p, c] = k.split(".");
//       if (body?.[p]?.[c] !== undefined) {
//         out[p] = out[p] || {};
//         out[p][c] = body[p][c];
//       }
//     } else if (body[k] !== undefined) {
//       out[k] = body[k];
//     }
//   }
//   return out;
// }

// /** Shallow merge of stored doc onto defaults (defaults fill the gaps). */
// function mergeWithDefaults(templateId: string, stored: any | null) {
//   const base = CONTACT_DEFAULTS[templateId] || {};
//   if (!stored) return base;

//   const out: any = { ...base };

//   // top-level simple keys
//   for (const k of [
//     "subtitle",
//     "titleStrong",
//     "titleLight",
//     "buttonText",
//     "formAction",
//     "address",
//     "phone",
//     "email",
//   ]) {
//     if (stored?.[k] !== undefined) out[k] = stored[k];
//   }

//   // nested: socialLinks
//   if (base.socialLinks || stored?.socialLinks) {
//     out.socialLinks = {
//       ...(base.socialLinks || {}),
//       ...(stored?.socialLinks || {}),
//     };
//   }

//   // nested: businessHours
//   if (base.businessHours || stored?.businessHours) {
//     out.businessHours = {
//       ...(base.businessHours || {}),
//       ...(stored?.businessHours || {}),
//     };
//   }

//   return out;
// }

// /* --------------------------------- handlers -------------------------------- */

// /** GET: user override if present; otherwise template defaults. */
// export const getContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await ContactInfo.findOne({ userId, templateId }).lean();

//     if (doc) {
//       // merge on top of defaults so newly added default fields show up
//       const merged = mergeWithDefaults(templateId, doc);
//       return res.json({ _source: "user", userId, templateId, ...merged });
//     }

//     // fall back to defaults
//     const base = CONTACT_DEFAULTS[templateId] || {};
//     return res.json({ _source: "template", userId, templateId, ...base });
//   } catch (err) {
//     console.error("getContactInfo error:", err);
//     res.status(500).json({ error: "Failed to fetch contact info" });
//   }
// };

// /** PUT: upsert only ALLOWED fields. */
// export const saveContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const update = pickAllowed(req.body);

//     const result = await ContactInfo.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { ...update, userId, templateId } },
//       { new: true, upsert: true, runValidators: true }
//     ).lean();

//     res.json({ message: "✅ Contact info saved", result });
//   } catch (err) {
//     console.error("saveContactInfo error:", err);
//     res.status(500).json({ error: "Failed to save contact info" });
//   }
// };

// /** POST: RESET — delete user override so GET falls back to template defaults. */
// export const resetContactInfo = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await ContactInfo.deleteMany({ userId, templateId });
//     return res.json({
//       ok: true,
//       deleted: r.deletedCount ?? 0,
//       message: "✅ Contact info reset to template defaults",
//     });
//   } catch (err) {
//     console.error("resetContactInfo error:", err);
//     res.status(500).json({ error: "Failed to reset contact info" });
//   }
// };















// backend/controllers/contact.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import ContactInfo from "../models/Contact";

dotenv.config();

/* ------------------------------------------------------------------ */
/* Whitelist of fields we allow to persist (both SIR and GYM variants) */
/* ------------------------------------------------------------------ */
const ALLOWED = [
  // SIR
  "subtitle",
  "titleStrong",
  "titleLight",
  "buttonText",
  "formAction",

  // GYM
  "address",
  "phone",
  "email",
  "socialLinks.facebook",
  "socialLinks.twitter",
  "socialLinks.youtube",
  "socialLinks.linkedin",
  "businessHours.mondayToFriday",
  "businessHours.saturday",
  "businessHours.sunday",
] as const;
type AllowedKey = (typeof ALLOWED)[number];

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "sir-template-1",
});

/* ---------------------------- template defaults ---------------------------- */
/** Only include keys that are in ALLOWED. */
const CONTACT_DEFAULTS: Record<string, Record<string, any>> = {
  // Bayone / SIR
  "sir-template-1": {
    subtitle: "- Contact Us",
    titleStrong: "Get In",
    titleLight: "Touch",
    buttonText: "Let's Talk",
    formAction: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
  },

  // GYM — UPDATED to match your footer HTML defaults
  "gym-template-1": {
    address: "123 Street, New York, USA",
    phone: "+012 345 67890",
    email: "info@example.com",
    socialLinks: {
      twitter: "#",
      facebook: "#",
      youtube: "#",
      linkedin: "#",
    },
    businessHours: {
      mondayToFriday: "09:00 am - 07:00 pm",
      saturday: "09:00 am - 12:00 pm",
      sunday: "Closed",
    },
  },
};

/* --------------------------------- helpers --------------------------------- */
function pickAllowed(body: any) {
  const out: any = {};
  if (!body || typeof body !== "object") return out;

  for (const k of ALLOWED) {
    if (k.includes(".")) {
      const [p, c] = k.split(".");
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

/** Shallow merge of stored doc onto defaults (defaults fill the gaps). */
function mergeWithDefaults(templateId: string, stored: any | null) {
  const base = CONTACT_DEFAULTS[templateId] || {};
  if (!stored) return base;

  const out: any = { ...base };

  // top-level simple keys
  for (const k of [
    "subtitle",
    "titleStrong",
    "titleLight",
    "buttonText",
    "formAction",
    "address",
    "phone",
    "email",
  ]) {
    if (stored?.[k] !== undefined) out[k] = stored[k];
  }

  // nested: socialLinks
  if (base.socialLinks || stored?.socialLinks) {
    out.socialLinks = {
      ...(base.socialLinks || {}),
      ...(stored?.socialLinks || {}),
    };
  }

  // nested: businessHours
  if (base.businessHours || stored?.businessHours) {
    out.businessHours = {
      ...(base.businessHours || {}),
      ...(stored?.businessHours || {}),
    };
  }

  return out;
}

/* --------------------------------- handlers -------------------------------- */

/** GET: user override if present; otherwise template defaults. */
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await ContactInfo.findOne({ userId, templateId }).lean();

    if (doc) {
      // merge on top of defaults so newly added default fields show up
      const merged = mergeWithDefaults(templateId, doc);
      return res.json({ _source: "user", userId, templateId, ...merged });
    }

    // fall back to defaults
    const base = CONTACT_DEFAULTS[templateId] || {};
    return res.json({ _source: "template", userId, templateId, ...base });
  } catch (err) {
    console.error("getContactInfo error:", err);
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
};

/** PUT: upsert only ALLOWED fields. */
export const saveContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const update = pickAllowed(req.body);

    const result = await ContactInfo.findOneAndUpdate(
      { userId, templateId },
      { $set: { ...update, userId, templateId } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ message: "✅ Contact info saved", result });
  } catch (err) {
    console.error("saveContactInfo error:", err);
    res.status(500).json({ error: "Failed to save contact info" });
  }
};

/** POST: RESET — delete user override so GET falls back to template defaults. */
export const resetContactInfo = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await ContactInfo.deleteMany({ userId, templateId });
    return res.json({
      ok: true,
      deleted: r.deletedCount ?? 0,
      message: "✅ Contact info reset to template defaults",
    });
  } catch (err) {
    console.error("resetContactInfo error:", err);
    res.status(500).json({ error: "Failed to reset contact info" });
  }
};
