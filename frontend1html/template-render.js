// Minimal renderer for ION7: loads your entry HTML and injects its <body> into #app
window.TemplateRender = async function (mount, { manifest, content } = {}) {
  try {
    // 1) Fetch manifest if not passed in
    if (!manifest) {
      const base = `${location.protocol}//${location.host}`;
      // Example default manifest path if you serve through cPanel proxy or static path:
      // adjust to your real path if needed, or pass manifest explicitly from your app.
      const defaultManifestUrl = `${base}/gym-template/v1/manifest.json`;
      manifest = await fetch(defaultManifestUrl, { cache: "no-store" }).then(r => r.json());
    }

    const entryUrl = (manifest.assetsBase || "") + (manifest.entry || "index.html");

    // 2) Fetch the entry HTML
    const html = await fetch(entryUrl, { cache: "no-store" }).then(r => r.text());

    // 3) Extract only the body so we don't nest full HTML inside the page
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const inner = bodyMatch ? bodyMatch[1] : html;

    // 4) Inject into the mount element
    mount.innerHTML = inner;

    // Optional: set title from backend content
    if (content?.siteTitle) document.title = content.siteTitle;

  } catch (e) {
    console.error("TemplateRender error:", e);
    mount.innerHTML = "<main style='padding:24px'><h1>Failed to load template</h1></main>";
  }
};
