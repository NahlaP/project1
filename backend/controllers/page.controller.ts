
import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

/**
 * POST /pages/generate
 * Body: { title: string, slug: string }
 * Creates a new static HTML file in frontend1html directory.
 */
export const generateStaticPage = async (req: Request, res: Response) => {
  try {
    const { title, slug } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: 'title and slug are required' });
    }

    const safeFileName = slug.replace(/[^a-z0-9-_]/gi, '');
    const filePath = path.join(__dirname, '../../frontend1html', `${safeFileName}.html`);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-5">
    <h1>${title}</h1>
    <div id="dynamic-content"></div>
    <script src="js/page-loader.js"></script>
  </div>
</body>
</html>
`;

    await fs.writeFile(filePath, html, 'utf-8');

    res.json({ ok: true, filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate static page' });
  }
};
