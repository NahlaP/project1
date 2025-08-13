export const toSlug = (str: string) =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const makeUniqueSlug = async (
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = toSlug(base);
  if (!slug) slug = 'page';

  let i = 1;
  let final = slug;
  while (await exists(final)) {
    i += 1;
    final = `${slug}-${i}`;
  }
  return final;
};
