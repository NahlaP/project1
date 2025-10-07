



(() => {
  'use strict';

  const appRoot = document.getElementById('app-root');
  const spinner = document.getElementById('spinner');

  // lock scroll while loading
  document.documentElement.classList.add('__lock');
  const showSpinner = () => spinner && (spinner.style.display = 'flex');
  const hideSpinner = () => {
    if (spinner) { spinner.style.opacity = '0'; setTimeout(() => spinner.remove(), 260); }
    document.documentElement.classList.remove('__lock');
  };
  showSpinner();

  // ---------- CONFIG ----------
  const userId     = window.APP_USER_ID     || "demo-user";
  const templateId = window.APP_TEMPLATE_ID || "gym-template-1";

  const CPANEL_BASE = (window.CPANEL_BASE || `${location.protocol}//${location.host}`).replace(/\/+$/, "");
  const API_PROXY   = `${CPANEL_BASE}/api-proxy.php`;

  const S3_BUCKET = window.APP_S3_BUCKET || "project1-uploads-12345";
  const S3_REGION = window.APP_S3_REGION || "ap-south-1";

  const sectionApiMap = {
    hero:         `${API_PROXY}?path=/hero`,
    about:        `${API_PROXY}?path=/about`,
    whychooseus:  `${API_PROXY}?path=/whychoose`,
    services:     `${API_PROXY}?path=/services`,
    appointment:  `${API_PROXY}?path=/appointment`,
    team:         `${API_PROXY}?path=/team`,
    testimonials: `${API_PROXY}?path=/testimonial`,
    contact:      `${API_PROXY}?path=/contact-info`,
  };

  // ---------- HELPERS ----------
  const isHttp      = (u) => /^https?:\/\//i.test(u || "");
  const isPresigned = (u) => /\bX-Amz-(Signature|Credential|Algorithm|Date|Expires|SignedHeaders)=/i.test(u || "");

  const upgradeToHttpsIfNeeded = (url) => {
    if (!url) return "";
    if (isPresigned(url)) return url; // do not touch presigned URLs
    if (location.protocol === "https:" && /^http:\/\//i.test(url)) {
      return url.replace(/^http:\/\//i, "https://");
    }
    return url;
  };

  async function getJson(url) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${sep}v=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
    return res.json();
  }

  function withCacheBusterSafe(url, ts) {
    if (!url) return "";
    if (isPresigned(url)) return upgradeToHttpsIfNeeded(url);
    const upgraded = upgradeToHttpsIfNeeded(url);
    return `${upgraded}${upgraded.includes("?") ? "&" : "?"}v=${encodeURIComponent(ts || Date.now())}`;
  }

  function toAbsoluteCpanel(p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return upgradeToHttpsIfNeeded(p);
    return `${CPANEL_BASE}/${String(p).replace(/^\/+/, "")}`;
  }

  // Main resolver: accepts full URLs, S3 keys, or local paths.
  async function resolveAssetUrl(rawOrKey) {
    const raw = String(rawOrKey || "");
    if (!raw) return "";

    // already a URL?
    if (isHttp(raw)) return upgradeToHttpsIfNeeded(raw);

    // not a leading slash => likely a key -> ask backend for a presigned URL
    if (!raw.startsWith("/")) {
      try {
        const r = await fetch(`${API_PROXY}?path=/upload/file-url&key=${encodeURIComponent(raw)}`, {
          headers: { Accept: "application/json" }, cache: "no-store"
        });
        if (r.ok) {
          const j = await r.json();
          const u = j?.url || j?.signedUrl || "";
          if (u) return upgradeToHttpsIfNeeded(u);
        }
      } catch {}
      // fallback to public object URL
      const clean = raw.replace(/^\/+/, "");
      return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${clean}`;
    }

    // local asset under cPanel
    return toAbsoluteCpanel(raw);
  }

  function stripAnimationsAndUnhide(root) {
    root.querySelectorAll(".wow, .animate, [data-wow-delay]").forEach(el => {
      el.classList.remove("wow","fadeIn","fadeInUp","fadeInDown","fadeInLeft","fadeInRight","animated");
      el.removeAttribute("data-wow-delay");
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.style.animation = "none";
      el.style.transition = "none";
    });
  }

  // Wait for header/footer scripts to populate text/links
  function waitForHeaderFooter(timeoutMs = 1400) {
    const t0 = performance.now();
    return new Promise((resolve) => {
      const ok = () => {
        const navReady  = !!document.querySelector('#navbarCollapse .navbar-nav, #navbarCollapse a, #navbarCollapse li');
        const topReady  = !!document.getElementById('topbar-email')?.textContent?.trim();
        const footReady = !!document.getElementById('footer-address')?.textContent?.trim();
        return navReady && topReady && footReady;
      };
      if (ok()) return resolve();
      const id = setInterval(() => {
        if (ok() || performance.now() - t0 > timeoutMs) { clearInterval(id); resolve(); }
      }, 50);
    });
  }

  // ---------- RENDERERS ----------
  function rHero(data) {
    const title = (data.title ?? data.content ?? "Welcome to our site");
    const html = `
      <div class="container-fluid p-0 mb-6">
        <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item active" style="min-height:100vh;position:relative;">
              <img id="hero-image" class="w-100 h-100" style="object-fit:cover;max-height:100vh;" alt="Hero Image" />
              <div class="carousel-caption" style="background:rgba(0,0,0,.5);padding:4rem;text-align:left;">
                <h1 class="display-3 text-white mb-4" id="hero-title">${title}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    const postRender = async (root) => {
      const img = root.querySelector('#hero-image');
      const v = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const raw = data.imageUrl || data.imageKey || data.image?.url || "";
      const url = await resolveAssetUrl(raw);
      img.src = withCacheBusterSafe(url, v);
    };
    return { html, postRender };
  }

  function rAbout(data) {
    const html = `
      <div class="container-fluid pt-6 pb-6" id="about-section">
        <div class="container">
          <div class="row g-5">
            <div class="col-lg-6">
              <div class="about-img">
                <img id="about-img" class="img-fluid w-100" alt="${data.imageAlt || "About Image"}" style="max-height:350px;object-fit:cover" />
              </div>
            </div>
            <div class="col-lg-6">
              <h1 class="display-6 text-uppercase mb-4">${data.title || "About Title"}</h1>
              <p class="mb-4">${data.description || ""}</p>
              <div class="row g-5 mb-4">
                ${(data.bullets || []).map(b => `
                  <div class="col-sm-6">
                    <div class="d-flex align-items-center">
                      <div class="flex-shrink-0 btn-xl-square bg-light me-3"><i class="fa fa-check-square fa-2x text-primary"></i></div>
                      <h5 class="lh-base text-uppercase mb-0">${typeof b === "string" ? b : (b?.text ?? "")}</h5>
                    </div>
                  </div>`).join("")}
              </div>
              <div class="border border-5 border-primary p-4 text-center mt-4">
                <h4 class="lh-base text-uppercase mb-0">${data.highlight || "Highlight"}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    const postRender = async (root) => {
      const img = root.querySelector('#about-img');
      const v   = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const raw = data.imageUrl || data.imageKey || "";
      const url = await resolveAssetUrl(raw);
      img.src = withCacheBusterSafe(url, v);
    };
    return { html, postRender };
  }

  function rWhyChoose(data) {
    const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
    const v       = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
    const html = `
      <div class="container-fluid feature mt-6 mb-6" id="whychoose-wrapper" style="position:relative;background:#000;">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,${overlay});"></div>
        <div class="container position-relative">
          <div class="row g-0 justify-content-end">
            <div class="col-lg-6 pt-5">
              <div class="mt-5">
                <h1 class="display-6 text-white text-uppercase mb-4">${data.title || "Why Choose Us"}</h1>
                <p class="text-light mb-4">${data.description || ""}</p>
                <div class="row g-4 pt-2 mb-4">
                  ${(data.stats || []).map(stat => `
                    <div class="col-sm-6">
                      <div class="flex-column text-center border border-5 border-primary p-5">
                        <h1 class="text-white">${stat.value}</h1>
                        <p class="text-white text-uppercase mb-0">${stat.label}</p>
                      </div>
                    </div>`).join("")}
                </div>
                <div class="border border-5 border-primary border-bottom-0 p-5">
                  ${(data.progressBars || []).map(bar => `
                    <div class="experience mb-4">
                      <div class="d-flex justify-content-between mb-2">
                        <span class="text-white text-uppercase">${bar.label}</span>
                        <span class="text-white">${bar.percent}%</span>
                      </div>
                      <div class="progress">
                        <div class="progress-bar bg-primary" role="progressbar" style="width:${bar.percent}%"
                             aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                    </div>`).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    const postRender = async (root) => {
      const wrap = root.querySelector('#whychoose-wrapper');
      const bgRaw = data.bgImageUrl || data.bgImageKey || data.bgImage || "";
      if (!bgRaw || !wrap) return;
      const bgUrl = withCacheBusterSafe(await resolveAssetUrl(bgRaw), v);
      wrap.style.backgroundImage = `url('${bgUrl}')`;
      wrap.style.backgroundSize = 'cover';
      wrap.style.backgroundRepeat = 'no-repeat';
      wrap.style.backgroundPosition = 'center';
    };
    return { html, postRender };
  }

  function rServices(data) {
    const html = `
      <section class="container-xxl service py-5">
        <div class="container">
          <div class="text-center mx-auto mb-5">
            <h1 class="display-6 mb-3">${data.title || "Our Services"}</h1>
          </div>
          <div class="row g-4" id="services-grid"></div>
        </div>
      </section>`;
    const postRender = async (root) => {
      const grid = root.querySelector("#services-grid");
      if (!grid) return;
      for (const item of (data.services || [])) {
        const node = document.createElement("div");
        node.className = "col-lg-3 col-md-6";
        node.innerHTML = `
          <div class="service-item">
            <div class="service-inner pb-5">
              <img class="img-fluid w-100 svc-img" alt="${item.title || "Service"}">
              <div class="service-text px-5 pt-4">
                <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
                <p>${item.description || "No description available."}</p>
              </div>
              <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
                ${item.buttonText || "Read More"} <i class="bi bi-chevron-double-right ms-1"></i>
              </a>
            </div>
          </div>`;
        grid.appendChild(node);

        const imgEl = node.querySelector(".svc-img");
        const v   = item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
        const raw = item.imageUrl || item.imageKey || "";
        const url = await resolveAssetUrl(raw);
        imgEl.src = withCacheBusterSafe(url, v);
      }
    };
    return { html, postRender };
  }

  function rAppointment(data) {
    const html = `
      <section class="container-fluid appoinment mt-6 mb-6 py-5" id="appointment-section"
        style="background-size:cover;background-position:center;">
        <div class="container pt-5">
          <div class="row gy-5 gx-0">
            <div class="col-lg-6 pe-lg-5">
              <h1 class="display-6 text-uppercase text-white mb-4">${data.title || "Book Your Appointment"}</h1>
              <p class="text-white mb-5">${data.subtitle || ""}</p>
            </div>
            <div class="col-lg-6">
              <form>
                <div class="row g-3">
                  <div class="col-12 col-sm-6"><input type="text" class="form-control bg-light border-0 px-4" placeholder="Your Name" required></div>
                  <div class="col-12 col-sm-6"><input type="email" class="form-control bg-light border-0 px-4" placeholder="Your Email" required></div>
                  <div class="col-12"><textarea class="form-control bg-light border-0 px-4" rows="4" placeholder="Message"></textarea></div>
                  <div class="col-12"><button class="btn btn-primary w-100 py-3" type="submit">Submit</button></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>`;
    const postRender = async (root) => {
      const v  = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const raw = data.backgroundImageUrl || data.backgroundImageKey || data.backgroundImage || "";
      const bg = withCacheBusterSafe(await resolveAssetUrl(raw), v);
      const sec = root.querySelector("#appointment-section");
      if (sec && bg) sec.style.backgroundImage = `url('${bg}')`;
    };
    return { html, postRender };
  }

  function rTeam(data) {
    const html = `
      <section class="container-xxl py-5">
        <div class="container">
          <div class="text-center mx-auto mb-5">
            <h1 class="display-6 mb-3">${data.title || "Our Team"}</h1>
          </div>
          <div class="row g-4" id="team-grid"></div>
        </div>
      </section>`;
    const postRender = async (root) => {
      const grid = root.querySelector("#team-grid");
      if (!grid) return;
      const list = Array.isArray(data) ? data : (data.members || []);
      for (const member of list) {
        const node = document.createElement("div");
        node.className = "col-lg-3 col-md-6";
        node.innerHTML = `
          <div class="team-item bg-light">
            <div class="overflow-hidden">
              <img class="img-fluid w-100 team-img" alt="${member.name || "Member"}" />
            </div>
            <div class="text-center p-4">
              <h5 class="fw-bold mb-2">${member.name || ""}</h5>
              <p class="text-uppercase text-muted">${member.role || ""}</p>
            </div>
          </div>`;
        grid.appendChild(node);

        const imgEl = node.querySelector(".team-img");
        const v   = member.updatedAt ? new Date(member.updatedAt).getTime() : Date.now();
        const raw = member.imageUrl || member.imageKey || "";
        const url = await resolveAssetUrl(raw);
        imgEl.src = withCacheBusterSafe(url, v);
      }
    };
    return { html, postRender };
  }

  function rTestimonials(data) {
    const list = Array.isArray(data) ? data : (data.items || []);
    const starsTpl = (n=5) => '<i class="far fa-star text-primary me-1"></i>'.repeat(n);

    const html = `
      <section class="container-fluid pt-6 pb-6">
        <div class="container">
          <div class="text-center mx-auto" style="max-width:600px;">
            <h1 class="display-6 text-uppercase mb-5">${data.title || "What They’re Saying"}</h1>
          </div>
          <div class="row g-5 align-items-center">
            <div class="col-lg-5">
              <div class="testimonial-img" id="testimonial-image-list">
                ${list.slice(0, 4).map(item => `
                  <div>
                    <img class="img-fluid rounded-circle w-100 h-100 testi-big" alt="${item.name || "Client"}" style="object-fit:cover;">
                  </div>`).join("")}
              </div>
            </div>
            <div class="col-lg-7">
              <div class="owl-carousel testimonial-carousel" id="testimonial-carousel">
                ${list.map(item => `
                  <div class="testimonial-item bg-white p-4">
                    <div class="d-flex align-items-center mb-3">
                      <img class="img-fluid flex-shrink-0 rounded-circle testi-img" style="width:50px;height:50px;" alt="${item.name || "Client"}">
                      <div class="ps-3">
                        <div class="mb-1">${starsTpl(item.rating || 5)}</div>
                        <h5 class="mb-1">${item.name || ""}</h5>
                        <small>${item.title || item.profession || ""}</small>
                      </div>
                    </div>
                    <p class="mb-0">${item.message || ""}</p>
                  </div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </section>`;
    const postRender = async (root) => {
      const bigImgs = Array.from(root.querySelectorAll(".testi-big"));
      const smallImgs = Array.from(root.querySelectorAll(".testi-img"));
      for (let i = 0; i < bigImgs.length; i++) {
        const el = bigImgs[i]; const item = list[i];
        const v = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
        const raw = item?.imageUrl || item?.imageKey || "";
        const url = await resolveAssetUrl(raw);
        el.src = withCacheBusterSafe(url, v);
      }
      for (let i = 0; i < smallImgs.length; i++) {
        const el = smallImgs[i]; const item = list[i];
        const v = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
        const raw = item?.imageUrl || item?.imageKey || "";
        const url = await resolveAssetUrl(raw);
        el.src = withCacheBusterSafe(url, v);
      }
    };
    return { html, postRender };
  }

  function rContact(data) {
    const hours = data.businessHours || {};
    const socials = data.socialLinks || {};
    const normalize = (u) => { try { return /^https?:\/\//i.test(u) ? u : `https://${u}`; } catch { return u; } };

    const socialsHtml = ["facebook", "twitter", "youtube", "linkedin"].map((k) => {
      const href = socials[k];
      if (!href) return "";
      const icon = k === "facebook" ? "fab fa-facebook-f"
                : k === "twitter"  ? "fab fa-twitter"
                : k === "youtube"  ? "fab fa-youtube"
                : "fab fa-linkedin-in";
      return `<a class="btn btn-square btn-light me-2" href="${normalize(href)}" target="_blank" rel="noopener"><i class="${icon}"></i></a>`;
    }).join("");

    const html = `
      <section class="container-xxl py-6" id="contact-section">
        <div class="container">
          <div class="row g-5">
            <div class="col-lg-5">
              <h2 class="display-6 text-uppercase mb-4">${data.title || "Contact Us"}</h2>
              <p class="mb-3"><i class="fa fa-map-marker-alt text-primary me-3"></i>${data.address || data.office || "-"}</p>
              <p class="mb-3"><i class="fa fa-phone-alt text-primary me-3"></i>${data.phone ? `<a href="tel:${String(data.phone).replace(/\s+/g, "")}">${data.phone}</a>` : "-"}</p>
              <p class="mb-3"><i class="fa fa-envelope text-primary me-3"></i>${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : "-"}</p>
              <div class="d-flex pt-2">${socialsHtml}</div>
            </div>
            <div class="col-lg-7">
              <h5 class="text-uppercase mb-4">Business Hours</h5>
              <div class="row">
                <div class="col-sm-6 mb-3"><p class="text-uppercase mb-0">Monday - Friday</p><p class="mb-0">${hours.mondayToFriday || hours.weekday || "-"}</p></div>
                <div class="col-sm-6 mb-3"><p class="text-uppercase mb-0">Saturday</p><p class="mb-0">${hours.saturday || "-"}</p></div>
                <div class="col-sm-6"><p class="text-uppercase mb-0">Sunday</p><p class="mb-0">${hours.sunday || "-"}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="container-fluid text-body copyright py-4">
        <div class="container">
          <div class="row">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; ${new Date().getFullYear()} ${data.copyright || "gym"}, All Rights Reserved.
            </div>
          </div>
        </div>
      </section>`;
    return { html, postRender: async () => {} };
  }

  const RENDERERS = {
    hero: rHero,
    about: rAbout,
    whychooseus: rWhyChoose,
    services: rServices,
    appointment: rAppointment,
    team: rTeam,
    testimonials: rTestimonials,
    contact: rContact,
  };

  // ---------- MAIN ----------
  async function renderPage() {
    const live = document.getElementById("dynamic-page-content");
    if (!live) return;

    if (document.readyState === 'loading') {
      await new Promise(res => document.addEventListener('DOMContentLoaded', res, { once: true }));
    }

    // 1) sections list
    let allSections = [];
    try {
      const sectionsUrl = `${API_PROXY}?path=/sections&userId=${encodeURIComponent(userId)}&templateId=${encodeURIComponent(templateId)}`;
      allSections = await getJson(sectionsUrl);
    } catch (e) {
      console.error("❌ Error loading sections:", e);
      live.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
      appRoot.hidden = false;
      hideSpinner();
      return;
    }

    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) {
      const firstPage = (allSections || [])
        .filter(s => String(s.type || "").toLowerCase() === "page" && s.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      location.replace(`page.html?slug=${encodeURIComponent(firstPage?.slug || "home-page")}`);
      return;
    }

    const page = (allSections || []).find(s => s.slug === slug && String(s.type || "").toLowerCase() === "page");
    if (!page) {
      live.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>";
      appRoot.hidden = false; hideSpinner(); return;
    }

    const assignedSections = (allSections || [])
      .filter(s => s.parentPageId === page._id && (s.visible !== false))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (!assignedSections.length) {
      live.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>";
      appRoot.hidden = false; hideSpinner(); return;
    }

    // 2) data fetch in parallel
    const fetchOne = (type) => {
      const base = sectionApiMap[type];
      if (!base) return Promise.resolve(null);
      const url = `${base}/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
      return getJson(url);
    };
    const dataList = await Promise.all(
      assignedSections.map(s => fetchOne(s.type).catch(e => ({ __error: e })))
    );

    // 3) build off-DOM
    const offscreen = document.createElement("div");
    const postTasks = [];

    assignedSections.forEach((section, idx) => {
      const data = dataList[idx];
      if (!data || data.__error) {
        const err = document.createElement("p");
        err.className = "text-danger";
        err.textContent = `❌ Error loading ${section.type}`;
        offscreen.appendChild(err);
        return;
      }
      const renderer = RENDERERS[section.type];
      if (!renderer) return;

      const { html, postRender } = renderer(data, () => fetchOne(section.type));
      const wrap = document.createElement("div");
      wrap.id = `section-${section.type}`;
      wrap.innerHTML = html;
      offscreen.appendChild(wrap);
      if (typeof postRender === "function") postTasks.push(() => postRender(offscreen));
    });

    // 4) run post renders in parallel
    await Promise.allSettled(postTasks.map(fn => fn()));

    // 5) swap to live DOM
    stripAnimationsAndUnhide(offscreen);
    live.innerHTML = offscreen.innerHTML;
    live.style.visibility = 'visible';

    // 6) wait a moment for header/footer scripts, then reveal app
    await waitForHeaderFooter(1400);
    appRoot.hidden = false;

    // 7) init Owl if present
    if (window.$ && typeof window.$.fn?.owlCarousel === "function") {
      const $carousel = $(".testimonial-carousel");
      if ($carousel.length) {
        try {
          $carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
          $carousel.find(".owl-stage-outer").children().unwrap();
        } catch {}
        $carousel.owlCarousel({ autoplay:true, smartSpeed:1000, dots:true, loop:true, items:1, margin:25 });
      }
    }

    hideSpinner();
  }

  renderPage();
})();

