// backend/utils/recordMedia.ts  (NEW FILE)

import Media from "../models/Media";

export async function recordMedia({
  userId,
  templateId,
  type,
  url,
  key,
  name,
  size,
  mime,
}: {
  userId: string;
  templateId: string;
  type: "image" | "video";
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mime?: string;
}) {
  if (!userId || !templateId || !url) return;

  // avoid duplicates if same key uploaded again
  const exists = key
    ? await Media.findOne({ userId, templateId, key }).lean()
    : null;

  if (exists) return;

  await Media.create({
    userId,
    templateId,
    type,
    url,
    key,
    name,
    size,
    mime,
  });
}
