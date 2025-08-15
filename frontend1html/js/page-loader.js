







// Dynamic Page Renderer (Vercel proxy friendly + presigned image auto-refresh)

const userId = "demo-user";
const templateId = "gym-template-1";

const sectionApiMap = {
  hero: "/api/hero",
  about: "/api/about",
  whychooseus: "/api/whychoose",
  services: "/api/services",
  appointment: "/api/appointment",
  team: "/api/team",
  testimonials: "/api/testimonial",
  contact: "/api/contact-info",
};

function $(sel) { return document.querySelector(sel); }

function urlWithTs(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

async function getJson(url) {
  const res = await fetch(urlWithTs(url), { cache: "no-store", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  return res.json();
}

// Keep S3 https URLs as-is. For relative, ensure leading slash and normalize /uploads
function normalizeImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      // If absolute /uploads on same-origin-like backend, we can drop origin
      if (u.pathname.startsWith("/uploads/")) return `${u.pathname}${u.search || ""}`;
      return url; // external (e.g., S3) stays absolute
    } catch { return url; }
  }
  // ensure leading slash for "uploads/foo.jpg"
  if (!url.startsWith("/")) url = "/" + url;
  return url;
}

function withCacheBuster(url, version) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version || Date.now())}`;
}

// Retry helper for presigned images (hero/testimonials/team/services)
// onerror -> refetch section once -> reapply src
async function setImgWithAutoRefresh(imgEl, getSrc, refreshSectionOnce) {
  let tried = false;

  const apply = async () => {
    const src = getSrc();
    if (!src) return;
    imgEl.src = src;
  };

  imgEl.onerror = async () => {
    if (tried) return; // only one retry
    tried = true;
    try {
      await refreshSectionOnce();
      await apply();
    } catch (e) {
      // leave placeholder; avoid infinite loops
      console.warn("Image refresh failed:", e);
    }
  };

  await apply();
}

async function renderPage() {
  const container = document.getElementById("dynamic-page-content");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let slug = urlParams.get("slug");

  // Fetch all sections first (and use it to find default page if needed)
  let allSections = [];
  try {
    const sectionsUrl = `/api/sections?userId=${encodeURIComponent(userId)}&templateId=${encodeURIComponent(templateId)}`;
    allSections = await getJson(sectionsUrl);
  } catch (e) {
    console.error("❌ Error loading sections:", e);
    container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
    return;
  }

  // Default to first visible page if no slug
  if (!slug) {
    const firstPage = (allSections || [])
      .filter(s => String(s.type || "").toLowerCase() === "page" && s.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

    if (firstPage?.slug) {
      location.replace(`page.html?slug=${encodeURIComponent(firstPage.slug)}`);
      return;
    } else {
      slug = "home-page";
      location.replace(`page.html?slug=${encodeURIComponent(slug)}`);
      return;
    }
  }

  // Find the page entry
  const page = (allSections || []).find(
    s => s.slug === slug && String(s.type || "").toLowerCase() === "page"
  );

  if (!page) {
    container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>";
    return;
  }

  // Sections assigned to this page
  const assignedSections = (allSections || [])
    .filter((s) => s.parentPageId === page._id && (s.visible !== false))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!assignedSections.length) {
    container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>";
    return;
  }

  container.innerHTML = "";

  // Cache last-fetched payloads by type so onerror can re-fetch once
  const cacheByType = {};

  for (const section of assignedSections) {
    const apiBase = sectionApiMap[section.type];
    if (!apiBase) continue;

    // function to fetch and memoize this section type
    const fetchSection = async () => {
      const data = await getJson(`${apiBase}/${userId}/${templateId}`);
      cacheByType[section.type] = data;
      return data;
    };

    try {
      const data = await fetchSection();
      let html = "";

      /* -------- HERO -------- */
      if (section.type === "hero") {
        const getHeroSrc = () => {
          const d = cacheByType.hero || {};
          // Use presigned URL if present; otherwise normalize local uploads
          const raw = d.imageUrl ?? d.image?.url ?? "";
          const normalized = /^https?:\/\//i.test(raw) ? raw : normalizeImageUrl(raw);
          return withCacheBuster(normalized, d.updatedAt ? new Date(d.updatedAt).getTime() : Date.now());
        };

        const title = (data.title ?? data.content ?? "Welcome to our site");

        html += `
          <div class="container-fluid p-0 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                <div class="carousel-item active" style="min-height: 100vh; position: relative;">
                  <img id="hero-image" class="w-100 h-100" style="object-fit: cover; max-height: 100vh;" alt="Hero Image" />
                  <div class="carousel-caption" style="background: rgba(0, 0, 0, 0.5); padding: 4rem; text-align: left;">
                    <h1 class="display-3 text-white mb-4" id="hero-title">${title}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML("beforeend", html);

        // Wire auto-refresh for presigned URL
        const heroImg = document.getElementById("hero-image");
        await setImgWithAutoRefresh(heroImg, getHeroSrc, fetchSection);
      }

      /* -------- ABOUT -------- */
      else if (section.type === "about") {
        const imgRel = normalizeImageUrl(data.imageUrl || "");
        const imgSrc = withCacheBuster(imgRel, data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now());

        html += `
        <div class="container-fluid pt-6 pb-6" id="about-section">
          <div class="container">
            <div class="row g-5">
              <div class="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                <div class="about-img">
                  <img id="about-img" class="img-fluid w-100" src="" alt="${data.imageAlt || "About Image"}" style="max-height: 350px; object-fit: cover" />
                </div>
              </div>
              <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                <h1 class="display-6 text-uppercase mb-4">${data.title || "About Title"}</h1>
                <p class="mb-4">${data.description || ""}</p>
                <div class="row g-5 mb-4">
                  ${(data.bullets || []).map((b) => `
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
        container.insertAdjacentHTML("beforeend", html);

        // Assign + auto-refresh once if it fails (use same fetchSection)
        const aboutImg = document.getElementById("about-img");
        await setImgWithAutoRefresh(
          aboutImg,
          () => withCacheBuster(normalizeImageUrl((cacheByType.about || {}).imageUrl || data.imageUrl || ""), Date.now()),
          fetchSection
        );
      }

      /* -------- WHY CHOOSE US -------- */
      else if (section.type === "whychooseus") {
        const bgRel = normalizeImageUrl(data.bgImageUrl || "");
        const bgSrc = withCacheBuster(bgRel, data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now());
        const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;

        html += `
        <div class="container-fluid feature mt-6 mb-6 wow fadeIn" data-wow-delay="0.1s" id="whychoose-wrapper"
             style="position: relative; background-image: url('${bgSrc}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #000; z-index: 0;">
          <div id="whychoose-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,${overlay}); z-index: 1;"></div>
          <div class="container position-relative" style="z-index: 2;">
            <div class="row g-0 justify-content-end">
              <div class="col-lg-6 pt-5">
                <div class="mt-5">
                  <h1 id="whychoose-title" class="display-6 text-white text-uppercase mb-4 wow fadeIn" data-wow-delay="0.3s">
                    ${data.title || "Why You Should Choose Our Fitness Services"}
                  </h1>
                  <p id="whychoose-desc" class="text-light mb-4 wow fadeIn" data-wow-delay="0.4s">${data.description || ""}</p>
                  <div id="whychoose-stats" class="row g-4 pt-2 mb-4">
                    ${(data.stats || []).map((stat, index) => `
                      <div class="col-sm-6 wow fadeIn" data-wow-delay="0.${index + 5}s">
                        <div class="flex-column text-center border border-5 border-primary p-5">
                          <h1 class="text-white">${stat.value}</h1>
                          <p class="text-white text-uppercase mb-0">${stat.label}</p>
                        </div>
                      </div>`).join("")}
                  </div>
                  <div class="border border-5 border-primary border-bottom-0 p-5">
                    <div id="whychoose-progress">
                      ${(data.progressBars || []).map((bar, index) => `
                        <div class="experience mb-4 wow fadeIn" data-wow-delay="0.${index + 7}s">
                          <div class="d-flex justify-content-between mb-2">
                            <span class="text-white text-uppercase">${bar.label}</span>
                            <span class="text-white">${bar.percent}%</span>
                          </div>
                          <div class="progress">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${bar.percent}%"
                                 aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                        </div>`).join("")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        container.insertAdjacentHTML("beforeend", html);
      }

      /* -------- SERVICES -------- */
      else if (section.type === "services") {
        html += `
        <section class="container-xxl service py-5">
          <div class="container">
            <div class="text-center mx-auto mb-5">
              <h1 class="display-6 mb-3">${section.title || "Our Services"}</h1>
            </div>
            <div class="row g-4" id="services-grid"></div>
          </div>
        </section>`;
        container.insertAdjacentHTML("beforeend", html);

        const grid = $("#services-grid");
        (data.services || []).forEach((item, index) => {
          const delay = item.delay || `0.${index + 1}s`;
          const node = document.createElement("div");
          node.className = "col-lg-3 col-md-6 wow fadeInUp";
          node.setAttribute("data-wow-delay", delay);
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
          const getSrc = () => {
            const raw = item.imageUrl || "";
            const rel = normalizeImageUrl(raw);
            return withCacheBuster(rel || "/img/service-placeholder.jpg");
          };
          setImgWithAutoRefresh(imgEl, getSrc, fetchSection);
        });
      }

      /* -------- APPOINTMENT -------- */
      else if (section.type === "appointment") {
        const bgRel = normalizeImageUrl(data.backgroundImage || "");
        const bgSrc = withCacheBuster(bgRel, data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now());
        html += `
        <section class="container-fluid appoinment mt-6 mb-6 py-5 wow fadeIn" id="appointment-section"
          style="background-image: url('${bgSrc}'); background-size: cover; background-position: center;">
          <div class="container pt-5">
            <div class="row gy-5 gx-0">
              <div class="col-lg-6 pe-lg-5">
                <h1 class="display-6 text-uppercase text-white mb-4">${data.title || "Book Your Appointment"}</h1>
                <p class="text-white mb-5">${data.subtitle || ""}</p>
                <div class="d-flex align-items-start mb-3">
                  <div class="btn-lg-square bg-white me-3"><i class="bi bi-geo-alt text-dark fs-3"></i></div>
                  <div><h5 class="text-white mb-2">Office Address</h5><p class="text-white mb-0">${data.officeAddress || ""}</p></div>
                </div>
                <div class="d-flex align-items-start">
                  <div class="btn-lg-square bg-white me-3"><i class="bi bi-clock text-dark fs-3"></i></div>
                  <div><h5 class="text-white mb-2">Office Time</h5><p class="text-white mb-0">${data.officeTime || ""}</p></div>
                </div>
              </div>
              <div class="col-lg-6">
                <form>
                  <div class="row g-3">
                    <div class="col-12 col-sm-6"><input type="text" class="form-control bg-light border-0 px-4" placeholder="Your Name" required></div>
                    <div class="col-12 col-sm-6"><input type="email" class="form-control bg-light border-0 px-4" placeholder="Your Email" required></div>
                    <div class="col-12 col-sm-6"><input type="text" class="form-control bg-light border-0 px-4" placeholder="Mobile" required></div>
                    <div class="col-12 col-sm-6">
                      <select id="service" class="form-select bg-light border-0 px-4">
                        ${(Array.isArray(data.services) ? data.services : []).map((s) => `<option>${typeof s === "string" ? s : (s?.name || s?.label || "")}</option>`).join("")}
                      </select>
                    </div>
                    <div class="col-12"><textarea class="form-control bg-light border-0 px-4" rows="4" placeholder="Message"></textarea></div>
                    <div class="col-12"><button class="btn btn-primary w-100 py-3" type="submit">Submit</button></div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>`;
        container.insertAdjacentHTML("beforeend", html);
      }

      /* -------- TEAM -------- */
      else if (section.type === "team") {
        html += `
        <section class="container-xxl py-5">
          <div class="container">
            <div class="text-center mx-auto mb-5">
              <h1 class="display-6 mb-3">${section.title || "Our Team"}</h1>
            </div>
            <div class="row g-4" id="team-grid"></div>
          </div>
        </section>`;
        container.insertAdjacentHTML("beforeend", html);

        const grid = $("#team-grid");
        (Array.isArray(data) ? data : []).forEach((member, index) => {
          const node = document.createElement("div");
          node.className = "col-lg-3 col-md-6 wow fadeInUp";
          node.setAttribute("data-wow-delay", `0.${index + 1}s`);
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
          const getSrc = () => {
            const rel = normalizeImageUrl(member.imageUrl || "");
            return withCacheBuster(rel || "/img/team-placeholder.jpg", member.updatedAt ? new Date(member.updatedAt).getTime() : Date.now());
          };
          setImgWithAutoRefresh(imgEl, getSrc, fetchSection);
        });
      }

      /* -------- TESTIMONIALS -------- */
      else if (section.type === "testimonials") {
        const list = Array.isArray(data) ? data : [];

        const makeCard = (item) => {
          const stars = '<i class="far fa-star text-primary me-1"></i>'.repeat(item.rating || 5);
          return `
            <div class="testimonial-item bg-white p-4">
              <div class="d-flex align-items-center mb-3">
                <img class="img-fluid flex-shrink-0 rounded-circle testi-img" style="width:50px;height:50px;"
                     alt="${item.name || "Client"}">
                <div class="ps-3">
                  <div class="mb-1">${stars}</div>
                  <h5 class="mb-1">${item.name || ""}</h5>
                  <small>${item.profession || ""}</small>
                </div>
              </div>
              <p class="mb-0">${item.message || ""}</p>
            </div>`;
        };

        const animatedImagesHtml = list.slice(0, 4).map((item, i) => `
          <div class="wow fadeInUp" data-wow-delay="${0.2 + i * 0.2}s">
            <img class="img-fluid rounded-circle w-100 h-100 testi-big" alt="${item.name || "Client"}" style="object-fit:cover;">
          </div>
        `).join("");

        html += `
        <section class="container-fluid pt-6 pb-6">
          <div class="container">
            <div class="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style="max-width: 600px;">
              <h1 class="display-6 text-uppercase mb-5">${section.title || "What They’re Talking About Our Training Work"}</h1>
            </div>
            <div class="row g-5 align-items-center">
              <div class="col-lg-5 wow fadeInUp" data-wow-delay="0.3s">
                <div class="testimonial-img" id="testimonial-image-list">${animatedImagesHtml}</div>
              </div>
              <div class="col-lg-7 wow fadeInUp" data-wow-delay="0.5s">
                <div class="owl-carousel testimonial-carousel" id="testimonial-carousel">
                  ${list.map(makeCard).join("")}
                </div>
              </div>
            </div>
          </div>
        </section>`;
        container.insertAdjacentHTML("beforeend", html);

        // Wire images + auto refresh
        const bigImgs = Array.from(document.querySelectorAll(".testi-big"));
        bigImgs.forEach((el, i) => {
          const item = list[i];
          const getSrc = () => {
            const rel = normalizeImageUrl(item?.imageUrl || "");
            return withCacheBuster(rel || "/img/testimonial-placeholder.jpg", item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now());
          };
          setImgWithAutoRefresh(el, getSrc, fetchSection);
        });

        const smallImgs = Array.from(document.querySelectorAll(".testi-img"));
        smallImgs.forEach((el, i) => {
          const item = list[i];
          const getSrc = () => {
            const rel = normalizeImageUrl(item?.imageUrl || "");
            return withCacheBuster(rel || "/img/testimonial-placeholder.jpg", item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now());
          };
          setImgWithAutoRefresh(el, getSrc, fetchSection);
        });

        // Re-init OwlCarousel
        setTimeout(() => {
          if (window.$ && typeof window.$.fn?.owlCarousel === "function") {
            const $carousel = $(".testimonial-carousel");
            if ($carousel.length) {
              try {
                $carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
                $carousel.find(".owl-stage-outer").children().unwrap();
              } catch {}
              $carousel.owlCarousel({ autoplay: true, smartSpeed: 1000, dots: true, loop: true, items: 1, margin: 25 });
            }
          }
        }, 200);
      }

      /* -------- CONTACT -------- */
      else if (section.type === "contact") {
        html += `
        <section class="container-fluid bg-dark text-white-50 footer pt-5 mt-5">
          <div class="container py-5">
            <div class="row g-5">
              <div class="col-lg-4 col-md-6">
                <h5 class="text-white mb-4">Our Office</h5>
                <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>${data.office || data.address || "No office info"}</p>
                <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>${data.phone || ""}</p>
                <p class="mb-2"><i class="fa fa-envelope me-3"></i>${data.email || ""}</p>
              </div>
              <div class="col-lg-4 col-md-6">
                <h5 class="text-white mb-4">Business Hours</h5>
                <p class="mb-1">Monday - Friday: ${data.weekday || data?.businessHours?.mondayToFriday || "-"}</p>
                <p class="mb-1">Saturday: ${data.saturday || data?.businessHours?.saturday || "-"}</p>
                <p class="mb-1">Sunday: ${data.sunday || data?.businessHours?.sunday || "-"}</p>
              </div>
            </div>
          </div>
          <div class="container">
            <div class="copyright">
              <div class="row">
                <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                  &copy; ${new Date().getFullYear()} ${data.copyright || "gym"}, All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </section>`;
        container.insertAdjacentHTML("beforeend", html);
      }

    } catch (err) {
      console.error(`❌ Failed to load section: ${section.type}`, err);
      container.insertAdjacentHTML("beforeend", `<p class="text-danger">❌ Error loading ${section.type}</p>`);
    }
  }
}

renderPage();
















