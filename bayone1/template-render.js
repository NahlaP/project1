// // Minimal renderer for ION7: loads your entry HTML and injects its <body> into #app
// window.TemplateRender = async function (mount, { manifest, content }) {
//   try {
//     // fetch the template's main HTML file from S3
//     const html = await fetch(manifest.assetsBase + manifest.entry, { cache: "no-store" }).then(r => r.text());

//     // extract only what's inside <body>...</body> so we don't nest full HTML inside the page
//     const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
//     const inner = bodyMatch ? bodyMatch[1] : html;
//     mount.innerHTML = inner;

//     // optional: example of using backend content
//     if (content?.siteTitle) document.title = content.siteTitle;

//   } catch (e) {
//     console.error("TemplateRender error:", e);
//     mount.innerHTML = "<main style='padding:24px'><h1>Failed to load template</h1></main>";
//   }
// };















// sir-template-1/v1/template-render.js
(function () {
  function abs(base, url) {
    if (!url) return url;
    if (/^(?:https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("#")) {
      return url;
    }
    if (url.startsWith("/")) return url; // absolute on current host (rare here)
    return base.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.text();
  }

  async function getJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.json();
  }

  async function renderBodyInto(mount, html, assetsBase) {
    // extract body
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const inner = m ? m[1] : html;

    // create a DOM we can manipulate
    const tmp = document.createElement("div");
    tmp.innerHTML = inner;

    // rewrite relative URLs inside the body
    const rewrite = (node, attr) => {
      const v = node.getAttribute(attr);
      const fixed = abs(assetsBase, v);
      if (fixed !== v) node.setAttribute(attr, fixed);
    };

    tmp.querySelectorAll("img[src]").forEach(n => rewrite(n, "src"));
    tmp.querySelectorAll("source[src]").forEach(n => rewrite(n, "src"));
    tmp.querySelectorAll("video[src]").forEach(n => rewrite(n, "src"));
    tmp.querySelectorAll("audio[src]").forEach(n => rewrite(n, "src"));
    tmp.querySelectorAll("a[href]").forEach(n => rewrite(n, "href"));
    tmp.querySelectorAll("link[href]").forEach(n => rewrite(n, "href"));
    tmp.querySelectorAll("[style]").forEach(n => {
      const st = n.getAttribute("style");
      if (st && /url\(/i.test(st)) {
        n.setAttribute("style", st.replace(/url\((['"]?)([^'")]+)\1\)/gi, (all, q, p) => {
          return "url(" + abs(assetsBase, p) + ")";
        }));
      }
    });

    // remove any inline <script> from the template body (we’ll drive Hero ourselves)
    tmp.querySelectorAll("script").forEach(s => s.remove());

    // inject
    mount.innerHTML = "";
    while (tmp.firstChild) mount.appendChild(tmp.firstChild);
  }

  async function syncHero({ apiBase, userId, templateId }) {
    if (!apiBase) return;

    try {
      const hero = await getJSON(`${apiBase}/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}?t=${Date.now()}`);
      const headline = hero?.headline || hero?.content || hero?.content?.headline || "";
      const videoUrl = hero?.videoUrl || "";
      const posterUrl = hero?.posterUrl || "";

      const h1 = document.querySelector(".land-header .caption h1");
      if (h1 && headline) h1.textContent = headline;

      const source = document.querySelector('section.about source[type="video/mp4"]');
      const video = source ? source.closest("video") : null;

      if (source && videoUrl) {
        source.src = videoUrl;
        if (posterUrl && video) video.poster = posterUrl;
        if (video) video.load();
      }
    } catch (e) {
      console.warn("Hero fetch failed:", e.message || e);
    }
  }

  // Expose callable from page-loader
  window.TemplateRender = async function (mount, { manifest }) {
    const assetsBase = manifest.assetsBase;
    const entryUrl = abs(assetsBase, manifest.entry);

    try {
      const html = await fetchText(entryUrl);
      await renderBodyInto(mount, html, assetsBase);

      // read globals pushed by the host page
      const ION = window.ION7 || {};
      const apiBase   = ION.API_BASE || window.API_BASE || "";
      const userId    = ION.userId || "demo-user";
      const templateId= ION.templateId || manifest.templateId || "sir-template-1";

      // ONLY Hero is synced (your requirement)
      await syncHero({ apiBase, userId, templateId });
    } catch (e) {
      console.error("TemplateRender error:", e);
      mount.innerHTML = "<main style='padding:24px'><h2>Failed to load template</h2></main>";
    }
  };
})();
