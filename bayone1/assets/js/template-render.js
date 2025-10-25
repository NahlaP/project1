


// // sir-template-1/v1/template-render.js
// (function () {
//   function abs(base, url) {
//     if (!url) return url;
//     if (/^(?:https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("#")) {
//       return url;
//     }
//     if (url.startsWith("/")) return url; // absolute on current host (rare here)
//     return base.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
//   }

//   async function fetchText(url) {
//     const res = await fetch(url, { cache: "no-store" });
//     if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
//     return res.text();
//   }

//   async function getJSON(url) {
//     const res = await fetch(url, { cache: "no-store" });
//     if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
//     return res.json();
//   }

//   async function renderBodyInto(mount, html, assetsBase) {
//     // extract body
//     const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
//     const inner = m ? m[1] : html;

//     // create a DOM we can manipulate
//     const tmp = document.createElement("div");
//     tmp.innerHTML = inner;

//     // rewrite relative URLs inside the body
//     const rewrite = (node, attr) => {
//       const v = node.getAttribute(attr);
//       const fixed = abs(assetsBase, v);
//       if (fixed !== v) node.setAttribute(attr, fixed);
//     };

//     tmp.querySelectorAll("img[src]").forEach(n => rewrite(n, "src"));
//     tmp.querySelectorAll("source[src]").forEach(n => rewrite(n, "src"));
//     tmp.querySelectorAll("video[src]").forEach(n => rewrite(n, "src"));
//     tmp.querySelectorAll("audio[src]").forEach(n => rewrite(n, "src"));
//     tmp.querySelectorAll("a[href]").forEach(n => rewrite(n, "href"));
//     tmp.querySelectorAll("link[href]").forEach(n => rewrite(n, "href"));
//     tmp.querySelectorAll("[style]").forEach(n => {
//       const st = n.getAttribute("style");
//       if (st && /url\(/i.test(st)) {
//         n.setAttribute("style", st.replace(/url\((['"]?)([^'")]+)\1\)/gi, (all, q, p) => {
//           return "url(" + abs(assetsBase, p) + ")";
//         }));
//       }
//     });

//     // remove any inline <script> from the template body (we’ll drive Hero ourselves)
//     tmp.querySelectorAll("script").forEach(s => s.remove());

//     // inject
//     mount.innerHTML = "";
//     while (tmp.firstChild) mount.appendChild(tmp.firstChild);
//   }

//   async function syncHero({ apiBase, userId, templateId }) {
//     if (!apiBase) return;

//     try {
//       const hero = await getJSON(`${apiBase}/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}?t=${Date.now()}`);
//       const headline = hero?.headline || hero?.content || hero?.content?.headline || "";
//       const videoUrl = hero?.videoUrl || "";
//       const posterUrl = hero?.posterUrl || "";

//       const h1 = document.querySelector(".land-header .caption h1");
//       if (h1 && headline) h1.textContent = headline;

//       const source = document.querySelector('section.about source[type="video/mp4"]');
//       const video = source ? source.closest("video") : null;

//       if (source && videoUrl) {
//         source.src = videoUrl;
//         if (posterUrl && video) video.poster = posterUrl;
//         if (video) video.load();
//       }
//     } catch (e) {
//       console.warn("Hero fetch failed:", e.message || e);
//     }
//   }

//   // Expose callable from page-loader
//   window.TemplateRender = async function (mount, { manifest }) {
//     const assetsBase = manifest.assetsBase;
//     const entryUrl = abs(assetsBase, manifest.entry);

//     try {
//       const html = await fetchText(entryUrl);
//       await renderBodyInto(mount, html, assetsBase);

//       // read globals pushed by the host page
//       const ION = window.ION7 || {};
//       const apiBase   = ION.API_BASE || window.API_BASE || "";
//       const userId    = ION.userId || "demo-user";
//       const templateId= ION.templateId || manifest.templateId || "sir-template-1";

//       // ONLY Hero is synced (your requirement)
//       await syncHero({ apiBase, userId, templateId });
//     } catch (e) {
//       console.error("TemplateRender error:", e);
//       mount.innerHTML = "<main style='padding:24px'><h2>Failed to load template</h2></main>";
//     }
//   };
// })();







/* ===========================================================
   ION7 TEMPLATE RENDERER - sir-template-1/v1/template-render.js
   =========================================================== */

(async () => {
  /* ------------ Config ------------ */
  const QS = new URLSearchParams(location.search);
  const ION7 = window.ION7 || {};

  // Your proxy on cPanel (DO NOT include ?path here)
  const API_PROXY = (ION7.API_BASE || "https://ion7devtemplate.mavsketch.com/api-proxy.php").replace(/\?+.*/,'');
  const userId     = ION7.userId     || QS.get('uid') || "demo-user";
  const templateId = ION7.templateId || QS.get('tpl') || "sir-template-1";
  const version    = ION7.version    || QS.get('ver') || "v1";

  // If you use another uploads bucket, change here:
  const UPLOADS_BUCKET = ION7.uploadsBucket || "project1-uploads-12345";
  const UPLOADS_REGION = ION7.uploadsRegion || "ap-south-1";
  const fromKey = (k) =>
    k ? `https://${UPLOADS_BUCKET}.s3.${UPLOADS_REGION}.amazonaws.com/${String(k).replace(/^\/+/, "")}` : "";

  /* ------------ Helpers ------------ */
  const bust = (u) => u + (u.includes("?") ? "&" : "?") + "t=" + Date.now();

  // Build a proxied API URL: /api/<path>/<userId>/<templateId>
  const api = (p) => bust(`${API_PROXY}?path=/api/${p}/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`);

  // Try a list of endpoints, return the first successful JSON
  async function fetchFirst(paths) {
    for (const p of paths) {
      try {
        const r = await fetch(api(p), { cache: "no-store", headers: { Accept: "application/json" } });
        if (!r.ok) continue;
        const j = await r.json();
        if (j && !j.error) return j;
      } catch (e) {
        console.warn("fetch failed:", p, e);
      }
    }
    return null;
  }

  /* ===========================================================
     HERO
     =========================================================== */
  try {
    const hero = await fetchFirst(["hero"]);
    if (hero) {
      const headline =
        hero.headline || hero.title || (typeof hero.content === "string" ? hero.content : hero?.content?.headline) || "";
      if (headline) {
        const h1 = document.querySelector(".land-header .caption h1");
        if (h1) h1.textContent = headline;
      }
      const videoUrl = hero.videoUrl || fromKey(hero.videoKey) || hero?.content?.videoUrl;
      if (videoUrl) {
        const vid = document.querySelector("section.about video");
        const src = vid?.querySelector("source");
        if (src) src.src = videoUrl;
        if (vid) vid.load();
      }
    }
  } catch (e) { console.warn("hero:", e); }

  /* ===========================================================
     ABOUT
     =========================================================== */
  try {
    const about = await fetchFirst(["about"]);
    if (about) {
      const sub = document.querySelector(".about .sec-head .sub-title");
      if (sub && (about.subtitle || about.subTitle)) sub.textContent = about.subtitle || about.subTitle;

      const wrap = document.querySelector(".about .intro .text-reval");
      if (wrap && Array.isArray(about.lines)) {
        wrap.innerHTML = about.lines.map((t) => `<span class="text">${t}</span>`).join("");
      }

      const vid = about.videoUrl || fromKey(about.videoKey);
      if (vid) {
        const v = document.querySelector("section.about video");
        const s = v?.querySelector("source");
        if (s) s.src = vid;
        if (v) v.load();
      }
    }
  } catch (e) { console.warn("about:", e); }

  /* ===========================================================
     PROJECTS / WORKS
     =========================================================== */
/* Projects / Works */
try {
  const data = await fetchFirst(["projects","works","portfolio","projectList","workList"]);
  const list = Array.isArray(data?.items) ? data.items
             : Array.isArray(data?.projects) ? data.projects
             : Array.isArray(data) ? data
             : [];

  console.log("ION7 projects count:", list.length, data); // <-- keep for debug

  if (list.length) {
    const section = document.querySelector("section.works");
    if (section) {
      section.innerHTML = list.map(p => `
        <div class="panel">
          <div class="item">
            <div class="img">
              <img src="${p.imageUrl || fromKey(p.imageKey) || ''}" alt="${p.imageAlt || ''}">
            </div>
            <div class="cont d-flex align-items-center">
              <div>
                <span>${p.tag || p.category || ''}</span>
                <h5>${p.title || ''}</h5>
              </div>
              <div class="ml-auto"><h6>${p.year || ''}</h6></div>
            </div>
            <a href="${p.href || '#0'}" class="link-overlay animsition-link"></a>
          </div>
        </div>
      `).join("");
    }
  }
} catch (e) { console.warn("projects:", e); }


  /* ===========================================================
     MARQUEE / WHY CHOOSE
     =========================================================== */
  try {
    const data = await fetchFirst(["marquee", "whychoose", "whychooseus"]);
    const rows =
      (Array.isArray(data?.items) && data.items) ||
      (Array.isArray(data?.rows?.[0]) && data.rows[0]) ||
      [];
    if (rows.length) {
      document.querySelectorAll(".marquee .main-marq .box, .marquee .box").forEach((box) => {
        box.innerHTML = rows.map((label) => `
          <div class="item">
            <h4 class="d-flex align-items-center">
              <span>${label}</span><span class="ml-50 stroke icon">*</span>
            </h4>
          </div>
        `).join("");
      });
    }
  } catch (e) { console.warn("marquee:", e); }

  /* ===========================================================
     BRANDS / CLIENTS
     =========================================================== */
  try {
    const brands = await fetchFirst(["brands", "clients"]);
    const list = Array.isArray(brands?.items) ? brands.items
                : Array.isArray(brands?.logos) ? brands.logos
                : [];
    const wrap = document.querySelector("#content-carousel-container-unq-clients .swiper-wrapper");
    if (wrap && list.length) {
      wrap.innerHTML = list.map((b) => `
        <div class="swiper-slide">
          <div class="item">
            <div class="img icon-img-100">
              <a href="${b.href || "#0"}">
                <img src="${b.imageUrl || b.src || fromKey(b.imageKey) || ''}" alt="">
              </a>
            </div>
          </div>
        </div>
      `).join("");
      if (window.initSwiper5) window.initSwiper5();
    }
  } catch (e) { console.warn("brands:", e); }

  /* ===========================================================
     SERVICES / ACCORDION
     =========================================================== */
  try {
    const services = await fetchFirst(["services", "servicesAccordion"]);
    if (services) {
      if (services.subtitle || services.subTitle) {
        const el = document.querySelector(".section-padding .sec-head .sub-title");
        if (el) el.textContent = services.subtitle || services.subTitle;
      }
      if (services.title || services.titleRich) {
        const h3 = document.querySelector(".section-padding .sec-head h3");
        if (h3) h3.innerHTML = services.titleRich || services.title;
      }
      if (services.leftStat?.value || services.years) {
        const stat = document.querySelector(".section-padding .exp h2");
        if (stat) stat.textContent = (services.leftStat?.value || (services.years + "+")).toString();
      }

      const items = Array.isArray(services.items) ? services.items
                   : Array.isArray(services.accordion) ? services.accordion
                   : [];
      const acc = document.querySelector(".accordion.bord.full-width");
      if (acc && items.length) {
        acc.querySelectorAll(".item").forEach(n => n.remove());
        acc.innerHTML = items.map((s, i) => `
          <div class="item mb-20 wow fadeInUp" data-wow-delay="${0.1 * (i + 1)}s">
            <div class="title"><h4>${s.title || "Service"}</h4><span class="ico"></span></div>
            <div class="accordion-info"><p>${s.description || s.text || s.body || ""}</p></div>
          </div>
        `).join("");
      }
    }
  } catch (e) { console.warn("services:", e); }

  /* ===========================================================
     BLOGS
     =========================================================== */
  try {
    const blog = await fetchFirst(["blog", "blogs", "blogList"]);
    const posts = Array.isArray(blog?.items) ? blog.items : [];
    if (posts.length) {
      const cont = document.querySelector("section.blog-list .container");
      if (cont) {
        cont.querySelectorAll(".item.block").forEach((n) => n.remove());
        cont.insertAdjacentHTML(
          "beforeend",
          posts.map((b, i) => `
            <div class="item block wow fadeInUp" data-wow-delay=".${i * 2}s" data-fx="3">
              <a href="${b.href || "blog-details.html"}" class="block__link animsition-link" data-img="${b.imageUrl || fromKey(b.imageKey) || ''}"></a>
              <div class="row">
                <div class="col-lg-6 cont">
                  <div class="info"><span class="tag">${b.tag || ""}</span><span class="date">${b.date || ""}</span></div>
                  <h3 class="text-u">${b.title || "Untitled"}</h3>
                </div>
                <div class="col-lg-3 offset-lg-3 d-flex align-items-center justify-end">
                  <div class="ml-auto">
                    <a href="${b.href || "blog-details.html"}" class="more mt-15 animsition-link"><span>Continue Read</span></a>
                  </div>
                </div>
              </div>
            </div>
          `).join("")
        );
      }
    }
  } catch (e) { console.warn("blog:", e); }

  /* ===========================================================
     CONTACT + FOOTER
     =========================================================== */
  try {
    const data = await fetchFirst(["contact", "footer"]);
    if (data) {
      if (data.email)  { const a = document.querySelector("footer .eml h2 a"); if (a) a.textContent = data.email; }
      if (data.phone)  { const a = document.querySelector("footer .column h5 a"); if (a) a.textContent = data.phone; }
      if (data.address){ const p = document.querySelector("footer .column p");  if (p) p.textContent = data.address; }
      if (data.logoUrl){ const i = document.querySelector("footer .logo img");  if (i) i.src = data.logoUrl; }

      const socials = data.socials || data.social || {};
      // array form: [{label,href}], or object form: {facebook:..., twitter:...}
      const mapToHref = (label) => {
        if (Array.isArray(socials)) {
          const m = socials.find(s => (s.label || '').toLowerCase() === label);
          return m?.href;
        }
        return socials[label];
      };
      document.querySelectorAll("footer a").forEach((a) => {
        const t = (a.textContent || "").trim().toLowerCase();
        const h = mapToHref(t);
        if (h) a.href = h;
      });

      if (data.form?.action || data.formAction) {
        const f = document.querySelector("#contact-form");
        if (f) f.setAttribute("action", data.form?.action || data.formAction);
      }
    }
  } catch (e) { console.warn("contact/footer:", e); }

  console.log("✅ ION7 sir-template-1 — all sections loaded");
})();
