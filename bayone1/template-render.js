// Minimal renderer for ION7: loads your entry HTML and injects its <body> into #app
window.TemplateRender = async function (mount, { manifest, content }) {
  try {
    // fetch the template's main HTML file from S3
    const html = await fetch(manifest.assetsBase + manifest.entry, { cache: "no-store" }).then(r => r.text());

    // extract only what's inside <body>...</body> so we don't nest full HTML inside the page
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const inner = bodyMatch ? bodyMatch[1] : html;
    mount.innerHTML = inner;

    // optional: example of using backend content
    if (content?.siteTitle) document.title = content.siteTitle;

  } catch (e) {
    console.error("TemplateRender error:", e);
    mount.innerHTML = "<main style='padding:24px'><h1>Failed to load template</h1></main>";
  }
};
