







// cpanel
// (() => {
//   'use strict';

//   // -----------------------------------------
//   // CONFIG
//   // -----------------------------------------
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Base (https://ion7.mavsketch.com) — can be overridden by setting window.CPANEL_BASE in HTML
//   const CPANEL_BASE = (window.CPANEL_BASE || `${location.protocol}//${location.host}`).replace(/\/+$/, "");

//   // Our PHP proxy on cPanel that calls the EC2 backend server-side
//   const API_PROXY = `${CPANEL_BASE}/api-proxy.php`;

//   // Map of section names -> API path (we append /:userId/:templateId when fetching)
//   const sectionApiMap = {
//     hero:           `${API_PROXY}?path=/hero`,
//     about:          `${API_PROXY}?path=/about`,
//     whychooseus:    `${API_PROXY}?path=/whychoose`,
//     services:       `${API_PROXY}?path=/services`,
//     appointment:    `${API_PROXY}?path=/appointment`,
//     team:           `${API_PROXY}?path=/team`,
//     testimonials:   `${API_PROXY}?path=/testimonial`,
//     contact:        `${API_PROXY}?path=/contact-info`,
//   };

//   // -----------------------------------------
//   // HELPERS
//   // -----------------------------------------
//   const qs = (sel) => document.querySelector(sel);

//   function urlWithTs(url) {
//     const sep = url.includes("?") ? "&" : "?";
//     return `${url}${sep}v=${Date.now()}`;
//   }

//   async function getJson(url) {
//     const res = await fetch(urlWithTs(url), { cache: "no-store", headers: { Accept: "application/json" } });
//     if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
//     return res.json();
//   }

//   const isHttp = (u) => /^https?:\/\//i.test(u || "");
//   const withCacheBusterSafe = (url, version) => url ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version || Date.now())}` : url;

//   // Convert relative path -> absolute on *this* cPanel host
//   function toAbsoluteCpanel(p) {
//     if (!p) return "";
//     if (/^https?:\/\//i.test(p)) return p;
//     return `${CPANEL_BASE}/${String(p).replace(/^\/+/, "")}`;
//   }

//   /**
//    * Extract ONLY the cPanel upload URL:
//    * - Accept: full URLs containing `/uploads/`
//    * - Accept: relative paths starting with `/uploads/` or `uploads/`
//    * - (Keeps back-compat for old `/assets/img/` if you still have any)
//    */
//   function getCpanelAssetUrlOnly(raw) {
//     if (!raw) return "";
//     const s = String(raw);

//     // already absolute with /uploads/
//     if (/^https?:\/\/[^/]+\/uploads\//i.test(s)) return s;

//     // relative /uploads/...
//     if (/^\/?uploads\//i.test(s)) return toAbsoluteCpanel(s);

//     // (back-compat) absolute /assets/img/...
//     if (/^https?:\/\/[^/]+\/assets\/img\//i.test(s)) return s;

//     // (back-compat) relative /assets/img/...
//     if (/^\/?assets\/img\//i.test(s)) return toAbsoluteCpanel(s);

//     // sometimes the URL is encoded inside a string – try to extract it
//     try {
//       const dec = decodeURIComponent(s);
//       const mUploads = dec.match(/https?:\/\/[^/]+\/uploads\/[^\s"'&]+/i);
//       if (mUploads && mUploads[0]) return mUploads[0];
//       const mAssets = dec.match(/https?:\/\/[^/]+\/assets\/img\/[^\s"'&]+/i);
//       if (mAssets && mAssets[0]) return mAssets[0];
//     } catch {}

//     return "";
//   }

//   // Retry helper for images (kept from your original)
//   async function setImgWithAutoRefresh(imgEl, getSrcAsync, refreshSectionOnce) {
//     let tried = false;
//     const apply = async () => {
//       const src = await getSrcAsync();
//       if (src) imgEl.src = src;
//     };
//     imgEl.onerror = async () => {
//       if (tried) return;
//       tried = true;
//       try { await refreshSectionOnce(); await apply(); } catch (e) { console.warn("Image refresh failed:", e); }
//     };
//     await apply();
//   }

//   // -----------------------------------------
//   // RENDER
//   // -----------------------------------------
//   async function renderPage() {
//     const container = document.getElementById("dynamic-page-content");
//     if (!container) return;

//     const urlParams = new URLSearchParams(window.location.search);
//     let slug = urlParams.get("slug");

//     // Load all sections (use proxy -> EC2 backend)
//     let allSections = [];
//     try {
//       const sectionsUrl = `${API_PROXY}?path=/sections&userId=${encodeURIComponent(userId)}&templateId=${encodeURIComponent(templateId)}`;
//       allSections = await getJson(sectionsUrl);
//     } catch (e) {
//       console.error("❌ Error loading sections:", e);
//       container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
//       return;
//     }

//     if (!slug) {
//       const firstPage = (allSections || [])
//         .filter(s => String(s.type || "").toLowerCase() === "page" && s.visible !== false)
//         .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
//       location.replace(`page.html?slug=${encodeURIComponent(firstPage?.slug || "home-page")}`);
//       return;
//     }

//     const page = (allSections || []).find(s => s.slug === slug && String(s.type || "").toLowerCase() === "page");
//     if (!page) { container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>"; return; }

//     const assignedSections = (allSections || [])
//       .filter(s => s.parentPageId === page._id && (s.visible !== false))
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     if (!assignedSections.length) { container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>"; return; }

//     container.innerHTML = "";
//     const cacheByType = {};

//     for (const section of assignedSections) {
//       const apiBase = sectionApiMap[section.type];
//       if (!apiBase) continue;

//       // fetch one section via proxy -> EC2
//       const fetchSection = async () => {
//         const url = `${apiBase}/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//         const data = await getJson(url);
//         cacheByType[section.type] = data;
//         return data;
//       };

//       try {
//         const data = await fetchSection();
//         let html = "";

//         // ---------- HERO ----------
//         if (section.type === "hero") {
//           const title = (data.title ?? data.content ?? "Welcome to our site");
//           html += `
//             <div class="container-fluid p-0 mb-6">
//               <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
//                 <div class="carousel-inner">
//                   <div class="carousel-item active" style="min-height: 100vh; position: relative;">
//                     <img id="hero-image" class="w-100 h-100" style="object-fit: cover; max-height: 100vh;" alt="Hero Image" />
//                     <div class="carousel-caption" style="background: rgba(0,0,0,0.5); padding: 4rem; text-align: left;">
//                       <h1 class="display-3 text-white mb-4" id="hero-title">${title}</h1>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>`;
//           container.insertAdjacentHTML("beforeend", html);

//           const rawHero = data.imageUrl ?? data.image?.url ?? "";
//           const cpanelUrl = getCpanelAssetUrlOnly(rawHero);
//           const heroImg = document.getElementById("hero-image");
//           if (heroImg && cpanelUrl) {
//             const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
//             heroImg.src = withCacheBusterSafe(cpanelUrl, version);
//             heroImg.alt = data.imageAlt || "Hero Image";
//           }
//         }

//         // ---------- ABOUT ----------
//         else if (section.type === "about") {
//           html += `
//           <div class="container-fluid pt-6 pb-6" id="about-section">
//             <div class="container">
//               <div class="row g-5">
//                 <div class="col-lg-6">
//                   <div class="about-img">
//                     <img id="about-img" class="img-fluid w-100" alt="${data.imageAlt || "About Image"}" style="max-height: 350px; object-fit: cover" />
//                   </div>
//                 </div>
//                 <div class="col-lg-6">
//                   <h1 class="display-6 text-uppercase mb-4">${data.title || "About Title"}</h1>
//                   <p class="mb-4">${data.description || ""}</p>
//                   <div class="row g-5 mb-4">
//                     ${(data.bullets || []).map((b) => `
//                       <div class="col-sm-6">
//                         <div class="d-flex align-items-center">
//                           <div class="flex-shrink-0 btn-xl-square bg-light me-3"><i class="fa fa-check-square fa-2x text-primary"></i></div>
//                           <h5 class="lh-base text-uppercase mb-0">${typeof b === "string" ? b : (b?.text ?? "")}</h5>
//                         </div>
//                       </div>`).join("")}
//                   </div>
//                   <div class="border border-5 border-primary p-4 text-center mt-4">
//                     <h4 class="lh-base text-uppercase mb-0">${data.highlight || "Highlight"}</h4>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>`;
//           container.insertAdjacentHTML("beforeend", html);

//           const aboutImg = document.getElementById("about-img");
//           await setImgWithAutoRefresh(
//             aboutImg,
//             async () => {
//               const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
//               const raw = (cacheByType.about || data).imageUrl || "";
//               const cp = getCpanelAssetUrlOnly(raw);
//               return cp ? withCacheBusterSafe(cp, version) : "";
//             },
//             fetchSection
//           );
//         }

//         // ---------- WHY CHOOSE US ----------
//         else if (section.type === "whychooseus") {
//           const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
//           const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
//           const cpBg = getCpanelAssetUrlOnly(data.bgImageUrl || "");
//           const bgFinal = cpBg ? withCacheBusterSafe(cpBg, version) : "";

//           html += `
//           <div class="container-fluid feature mt-6 mb-6" id="whychoose-wrapper"
//                style="position: relative; ${bgFinal ? `background-image: url('${bgFinal}');` : ""} background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #000; z-index: 0;">
//             <div id="whychoose-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,${overlay}); z-index: 1;"></div>
//             <div class="container position-relative" style="z-index: 2;">
//               <div class="row g-0 justify-content-end">
//                 <div class="col-lg-6 pt-5">
//                   <div class="mt-5">
//                     <h1 id="whychoose-title" class="display-6 text-white text-uppercase mb-4">${data.title || "Why You Should Choose Our Fitness Services"}</h1>
//                     <p id="whychoose-desc" class="text-light mb-4">${data.description || ""}</p>
//                     <div id="whychoose-stats" class="row g-4 pt-2 mb-4">
//                       ${(data.stats || []).map((stat) => `
//                         <div class="col-sm-6">
//                           <div class="flex-column text-center border border-5 border-primary p-5">
//                             <h1 class="text-white">${stat.value}</h1>
//                             <p class="text-white text-uppercase mb-0">${stat.label}</p>
//                           </div>
//                         </div>`).join("")}
//                     </div>
//                     <div class="border border-5 border-primary border-bottom-0 p-5" id="whychoose-progress">
//                       ${(data.progressBars || []).map((bar) => `
//                         <div class="experience mb-4">
//                           <div class="d-flex justify-content-between mb-2">
//                             <span class="text-white text-uppercase">${bar.label}</span>
//                             <span class="text-white">${bar.percent}%</span>
//                           </div>
//                           <div class="progress">
//                             <div class="progress-bar bg-primary" role="progressbar" style="width: ${bar.percent}%"
//                                  aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
//                           </div>
//                         </div>`).join("")}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>`;
//           container.insertAdjacentHTML("beforeend", html);
//         }

//         // ---------- SERVICES ----------
//         else if (section.type === "services") {
//           html += `
//           <section class="container-xxl service py-5">
//             <div class="container">
//               <div class="text-center mx-auto mb-5">
//                 <h1 class="display-6 mb-3">${section.title || "Our Services"}</h1>
//               </div>
//               <div class="row g-4" id="services-grid"></div>
//             </div>
//           </section>`;
//           container.insertAdjacentHTML("beforeend", html);

//           const grid = qs("#services-grid");
//           for (const [index, item] of (data.services || []).entries()) {
//             const delay = item.delay || `0.${index + 1}s`;
//             const node = document.createElement("div");
//             node.className = "col-lg-3 col-md-6";
//             node.setAttribute("data-wow-delay", delay);
//             node.innerHTML = `
//               <div class="service-item">
//                 <div class="service-inner pb-5">
//                   <img class="img-fluid w-100 svc-img" alt="${item.title || "Service"}">
//                   <div class="service-text px-5 pt-4">
//                     <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
//                     <p>${item.description || "No description available."}</p>
//                   </div>
//                   <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                     ${item.buttonText || "Read More"} <i class="bi bi-chevron-double-right ms-1"></i>
//                   </a>
//                 </div>
//               </div>`;
//             grid.appendChild(node);

//             const imgEl = node.querySelector(".svc-img");
//             await setImgWithAutoRefresh(
//               imgEl,
//               async () => {
//                 const version = item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
//                 const cp = getCpanelAssetUrlOnly(item.imageUrl || "");
//                 return cp ? withCacheBusterSafe(cp, version) : "";
//               },
//               fetchSection
//             );
//           }
//         }

//         // ---------- APPOINTMENT ----------
// else if (section.type === "appointment") {
//   const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
//   const cpBg = getCpanelAssetUrlOnly(data.backgroundImage || "");
//   const bgFinal = cpBg ? withCacheBusterSafe(cpBg, version) : "";

//   html += `
//   <section
//     class="container-fluid appoinment mt-6 mb-6 py-5 wow fadeIn"
//     id="appointment-section"
//     style="${bgFinal ? `background-image: url('${bgFinal}');` : ""} background-size: cover; background-position: center;"
//     data-wow-delay="0.1s"
//   >
//     <div class="container pt-5">
//       <div class="row gy-5 gx-0">
//         <div class="col-lg-6 pe-lg-5">
//           <h1 class="display-6 text-uppercase text-white mb-4">${data.title || "Book Your Appointment"}</h1>
//           <p class="text-white mb-5">${data.subtitle || ""}</p>

//           <div class="d-flex align-items-start mb-3">
//             <div class="btn-lg-square bg-white me-3"><i class="bi bi-geo-alt text-dark fs-3"></i></div>
//             <div>
//               <h5 class="text-white mb-2">Office Address</h5>
//               <p class="text-white mb-0">${data.officeAddress || ""}</p>
//             </div>
//           </div>

//           <div class="d-flex align-items-start">
//             <div class="btn-lg-square bg-white me-3"><i class="bi bi-clock text-dark fs-3"></i></div>
//             <div>
//               <h5 class="text-white mb-2">Office Time</h5>
//               <p class="text-white mb-0">${data.officeTime || ""}</p>
//             </div>
//           </div>
//         </div>

//         <div class="col-lg-6">
//           <form>
//             <div class="row g-3">
//               <div class="col-12 col-sm-6">
//                 <input type="text" class="form-control bg-light border-0 px-4" placeholder="Your Name" required>
//               </div>
//               <div class="col-12 col-sm-6">
//                 <input type="email" class="form-control bg-light border-0 px-4" placeholder="Your Email" required>
//               </div>
//               <div class="col-12 col-sm-6">
//                 <input type="text" class="form-control bg-light border-0 px-4" placeholder="Mobile" required>
//               </div>
//               <div class="col-12 col-sm-6">
//                 <select id="service" class="form-select bg-light border-0 px-4">
//                   ${(Array.isArray(data.services) ? data.services : [])
//                     .map(s => `<option>${typeof s === "string" ? s : (s?.name || s?.label || "")}</option>`)
//                     .join("")}
//                 </select>
//               </div>
//               <div class="col-12">
//                 <textarea class="form-control bg-light border-0 px-4" rows="4" placeholder="Message"></textarea>
//               </div>
//               <div class="col-12">
//                 <button class="btn btn-primary w-100 py-3" type="submit">Submit</button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   </section>`;
//   container.insertAdjacentHTML("beforeend", html);
// }


//         // ---------- TEAM ----------
//         else if (section.type === "team") {
//           html += `
//           <section class="container-xxl py-5">
//             <div class="container">
//               <div class="text-center mx-auto mb-5">
//                 <h1 class="display-6 mb-3">${section.title || "Our Team"}</h1>
//               </div>
//               <div class="row g-4" id="team-grid"></div>
//             </div>
//           </section>`;
//           container.insertAdjacentHTML("beforeend", html);

//           const grid = qs("#team-grid");
//           const list = Array.isArray(data) ? data : [];
//           for (const member of list) {
//             const node = document.createElement("div");
//             node.className = "col-lg-3 col-md-6";
//             node.innerHTML = `
//               <div class="team-item bg-light">
//                 <div class="overflow-hidden">
//                   <img class="img-fluid w-100 team-img" alt="${member.name || "Member"}" />
//                 </div>
//                 <div class="text-center p-4">
//                   <h5 class="fw-bold mb-2">${member.name || ""}</h5>
//                   <p class="text-uppercase text-muted">${member.role || ""}</p>
//                 </div>
//               </div>`;
//             grid.appendChild(node);

//             const imgEl = node.querySelector(".team-img");
//             await setImgWithAutoRefresh(
//               imgEl,
//               async () => {
//                 const version = member.updatedAt ? new Date(member.updatedAt).getTime() : Date.now();
//                 const cp = getCpanelAssetUrlOnly(member.imageUrl || "");
//                 return cp ? withCacheBusterSafe(cp, version) : "";
//               },
//               fetchSection
//             );
//           }
//         }

//        // -------- TESTIMONIALS (cPanel-only images) --------
// else if (section.type === "testimonials") {
//   const list = Array.isArray(data) ? data : [];

//   const makeCard = (item) => {
//     const stars = '<i class="far fa-star text-primary me-1"></i>'.repeat(item.rating || 5);
//     return `
//       <div class="testimonial-item bg-white p-4">
//         <div class="d-flex align-items-center mb-3">
//           <img class="img-fluid flex-shrink-0 rounded-circle testi-img" style="width:50px;height:50px;" alt="${item.name || "Client"}">
//           <div class="ps-3">
//             <div class="mb-1">${stars}</div>
//             <h5 class="mb-1">${item.name || ""}</h5>
//             <small>${item.profession || ""}</small>
//           </div>
//         </div>
//         <p class="mb-0">${item.message || ""}</p>
//       </div>`;
//   };

//   const animatedImagesHtml = list.slice(0, 4).map((item, i) => `
//     <div class="wow fadeInUp" data-wow-delay="${0.2 + i * 0.2}s">
//       <img class="img-fluid rounded-circle w-100 h-100 testi-big" alt="${item.name || "Client"}" style="object-fit:cover;">
//     </div>`).join("");

//   html += `
//   <section class="container-fluid pt-6 pb-6">
//     <div class="container">
//       <div class="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style="max-width: 600px;">
//         <h1 class="display-6 text-uppercase mb-5">${section.title || "What They’re Talking About Our Training Work"}</h1>
//       </div>
//       <div class="row g-5 align-items-center">
//         <div class="col-lg-5 wow fadeInUp" data-wow-delay="0.3s">
//           <div class="testimonial-img" id="testimonial-image-list">${animatedImagesHtml}</div>
//         </div>
//         <div class="col-lg-7 wow fadeInUp" data-wow-delay="0.5s">
//           <div class="owl-carousel testimonial-carousel" id="testimonial-carousel">
//             ${list.map(makeCard).join("")}
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>`;
//   container.insertAdjacentHTML("beforeend", html);

//   // big image circles
//   const bigImgs = Array.from(document.querySelectorAll(".testi-big"));
//   for (let i = 0; i < bigImgs.length; i++) {
//     const el = bigImgs[i];
//     const item = list[i];
//     await setImgWithAutoRefresh(
//       el,
//       async () => {
//         const version = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
//         const cp = getCpanelAssetUrlOnly(item?.imageUrl || "");
//         return cp ? withCacheBusterSafe(cp, version) : "";
//       },
//       fetchSection
//     );
//   }

//   // small avatar circles inside cards
//   const smallImgs = Array.from(document.querySelectorAll(".testi-img"));
//   for (let i = 0; i < smallImgs.length; i++) {
//     const el = smallImgs[i];
//     const item = list[i];
//     await setImgWithAutoRefresh(
//       el,
//       async () => {
//         const version = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
//         const cp = getCpanelAssetUrlOnly(item?.imageUrl || "");
//         return cp ? withCacheBusterSafe(cp, version) : "";
//       },
//       fetchSection
//     );
//   }

//   // Re-init OwlCarousel (uses jQuery’s $)
//   setTimeout(() => {
//     if (window.$ && typeof window.$.fn?.owlCarousel === "function") {
//       const $carousel = $(".testimonial-carousel");
//       if ($carousel.length) {
//         try {
//           $carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
//           $carousel.find(".owl-stage-outer").children().unwrap();
//         } catch {}
//         $carousel.owlCarousel({
//           autoplay: true,
//           smartSpeed: 1000,
//           dots: true,
//           loop: true,
//           items: 1,
//           margin: 25
//         });
//       }
//     }
//   }, 200);
// }


//         // ---------- CONTACT ----------
//         else if (section.type === "contact") {
//           // ... (same as your current version)
//         }

//       } catch (err) {
//         console.error(`❌ Failed to load section: ${section.type}`, err);
//         container.insertAdjacentHTML("beforeend", `<p class="text-danger">❌ Error loading ${section.type}</p>`);
//       }
//     }
//   }

//   renderPage();
// })();











(() => {
  'use strict';

  // -----------------------------------------
  // CONFIG
  // -----------------------------------------
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Base (e.g. https://ion7.mavsketch.com) — can be overridden by setting window.CPANEL_BASE in HTML
  const CPANEL_BASE = (window.CPANEL_BASE || `${location.protocol}//${location.host}`).replace(/\/+$/, "");

  // Our PHP proxy on cPanel that calls the EC2 backend server-side
  const API_PROXY = `${CPANEL_BASE}/api-proxy.php`;

  // Map of section names -> API path (we append /:userId/:templateId when fetching)
  const sectionApiMap = {
    hero:           `${API_PROXY}?path=/hero`,
    about:          `${API_PROXY}?path=/about`,
    whychooseus:    `${API_PROXY}?path=/whychoose`,
    services:       `${API_PROXY}?path=/services`,
    appointment:    `${API_PROXY}?path=/appointment`,
    team:           `${API_PROXY}?path=/team`,
    testimonials:   `${API_PROXY}?path=/testimonial`,
    contact:        `${API_PROXY}?path=/contact-info`,
  };

  // -----------------------------------------
  // HELPERS
  // -----------------------------------------
  const qs = (sel) => document.querySelector(sel);

  function urlWithTs(url) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${Date.now()}`;
  }

  async function getJson(url) {
    const res = await fetch(urlWithTs(url), { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
    return res.json();
  }

  const isHttp = (u) => /^https?:\/\//i.test(u || "");
  const isKey  = (u) => /^(sections|uploads)\//i.test(u || "");
  const isPresigned = (u) => /\bX-Amz-(Signature|Credential|Algorithm|Date|Expires|SignedHeaders)=/i.test(u || "");

  // cache-bust only non-presigned URLs (so we don't break AWS signatures)
  const withCacheBusterSafe = (url, version) =>
    (url && !isPresigned(url))
      ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version || Date.now())}`
      : url;

  // Make a relative path absolute on this cPanel host
  function toAbsoluteCpanel(p) {
    if (!p) return "";
    if (isHttp(p)) return p;
    return `${CPANEL_BASE}/${String(p).replace(/^\/+/, "")}`;
  }

  // Universal resolver: accepts presigned S3 URL, S3 key, or cPanel /uploads
  async function resolveImageUrl(raw) {
    if (!raw) return "";

    // a) already http(s) (S3 presigned or any CDN) -> use as-is
    if (isHttp(raw)) return raw;

    // b) relative cPanel uploads/assets -> make absolute
    if (/^\/?(uploads|assets\/img)\//i.test(raw)) {
      return toAbsoluteCpanel(raw);
    }

    // c) S3 key like "sections/.../file.jpg" -> ask backend (via PHP proxy) for presigned URL
    if (isKey(raw)) {
      const url = `${API_PROXY}?path=/upload/file-url&key=${encodeURIComponent(raw)}`;
      try {
        const r = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          return j?.url || j?.signedUrl || j || "";
        }
      } catch (_) {}
    }

    // d) last resort: try to make it absolute to cPanel
    return toAbsoluteCpanel(raw);
  }

  // Retry helper for images
  async function setImgWithAutoRefresh(imgEl, getSrcAsync, refreshSectionOnce) {
    let tried = false;
    const apply = async () => {
      const src = await getSrcAsync();
      if (src) imgEl.src = src;
    };
    imgEl.onerror = async () => {
      if (tried) return;
      tried = true;
      try { await refreshSectionOnce(); await apply(); } catch (e) { console.warn("Image refresh failed:", e); }
    };
    await apply();
  }

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  async function renderPage() {
    const container = document.getElementById("dynamic-page-content");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get("slug");

    // Load all sections (use proxy -> EC2 backend)
    let allSections = [];
    try {
      const sectionsUrl = `${API_PROXY}?path=/sections&userId=${encodeURIComponent(userId)}&templateId=${encodeURIComponent(templateId)}`;
      allSections = await getJson(sectionsUrl);
    } catch (e) {
      console.error("❌ Error loading sections:", e);
      container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
      return;
    }

    if (!slug) {
      const firstPage = (allSections || [])
        .filter(s => String(s.type || "").toLowerCase() === "page" && s.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      location.replace(`page.html?slug=${encodeURIComponent(firstPage?.slug || "home-page")}`);
      return;
    }

    const page = (allSections || []).find(s => s.slug === slug && String(s.type || "").toLowerCase() === "page");
    if (!page) { container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>"; return; }

    const assignedSections = (allSections || [])
      .filter(s => s.parentPageId === page._id && (s.visible !== false))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (!assignedSections.length) { container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>"; return; }

    container.innerHTML = "";
    const cacheByType = {};

    for (const section of assignedSections) {
      const apiBase = sectionApiMap[section.type];
      if (!apiBase) continue;

      // fetch one section via proxy -> EC2
      const fetchSection = async () => {
        const url = `${apiBase}/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
        const data = await getJson(url);
        cacheByType[section.type] = data;
        return data;
      };

      try {
        const data = await fetchSection();
        let html = "";

        // ---------- HERO ----------
        if (section.type === "hero") {
          const title = (data.title ?? data.content ?? "Welcome to our site");
          html += `
            <div class="container-fluid p-0 mb-6">
              <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                  <div class="carousel-item active" style="min-height: 100vh; position: relative;">
                    <img id="hero-image" class="w-100 h-100" style="object-fit: cover; max-height: 100vh;" alt="Hero Image" />
                    <div class="carousel-caption" style="background: rgba(0,0,0,0.5); padding: 4rem; text-align: left;">
                      <h1 class="display-3 text-white mb-4" id="hero-title">${title}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
          container.insertAdjacentHTML("beforeend", html);

          const heroImg = document.getElementById("hero-image");
          if (heroImg) {
            const rawHero = data.imageUrl ?? data.image?.url ?? data.imageKey ?? "";
            const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
            const finalUrl = await resolveImageUrl(rawHero);
            if (finalUrl) {
              heroImg.src = withCacheBusterSafe(finalUrl, version);
              heroImg.alt = data.imageAlt || "Hero Image";
            }
          }
        }

        // ---------- ABOUT ----------
        else if (section.type === "about") {
          html += `
          <div class="container-fluid pt-6 pb-6" id="about-section">
            <div class="container">
              <div class="row g-5">
                <div class="col-lg-6">
                  <div class="about-img">
                    <img id="about-img" class="img-fluid w-100" alt="${data.imageAlt || "About Image"}" style="max-height: 350px; object-fit: cover" />
                  </div>
                </div>
                <div class="col-lg-6">
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

          const aboutImg = document.getElementById("about-img");
          await setImgWithAutoRefresh(
            aboutImg,
            async () => {
              const d = cacheByType.about || data;
              const raw = d.imageUrl || d.imageKey || "";
              const version = d.updatedAt ? new Date(d.updatedAt).getTime() : Date.now();
              const u = await resolveImageUrl(raw);
              return withCacheBusterSafe(u, version);
            },
            fetchSection
          );
        }

        // ---------- WHY CHOOSE US ----------
        else if (section.type === "whychooseus") {
          const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
          const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
          const bgRaw = data.bgImageUrl || data.bgImageKey || "";
          const bgUrl = await resolveImageUrl(bgRaw);
          const bgFinal = bgUrl ? withCacheBusterSafe(bgUrl, version) : "";

          html += `
          <div class="container-fluid feature mt-6 mb-6" id="whychoose-wrapper"
              style="position: relative; ${bgFinal ? `background-image: url('${bgFinal}');` : ""} background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #000; z-index: 0;">
            <div id="whychoose-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,${overlay}); z-index: 1;"></div>
            <div class="container position-relative" style="z-index: 2;">
              <div class="row g-0 justify-content-end">
                <div class="col-lg-6 pt-5">
                  <div class="mt-5">
                    <h1 id="whychoose-title" class="display-6 text-white text-uppercase mb-4">${data.title || "Why You Should Choose Our Fitness Services"}</h1>
                    <p id="whychoose-desc" class="text-light mb-4">${data.description || ""}</p>
                    <div id="whychoose-stats" class="row g-4 pt-2 mb-4">
                      ${(data.stats || []).map((stat) => `
                        <div class="col-sm-6">
                          <div class="flex-column text-center border border-5 border-primary p-5">
                            <h1 class="text-white">${stat.value}</h1>
                            <p class="text-white text-uppercase mb-0">${stat.label}</p>
                          </div>
                        </div>`).join("")}
                    </div>
                    <div class="border border-5 border-primary border-bottom-0 p-5" id="whychoose-progress">
                      ${(data.progressBars || []).map((bar) => `
                        <div class="experience mb-4">
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
          </div>`;
          container.insertAdjacentHTML("beforeend", html);
        }

        // ---------- SERVICES ----------
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

          const grid = qs("#services-grid");
          for (const [index, item] of (data.services || []).entries()) {
            const delay = item.delay || `0.${index + 1}s`;
            const node = document.createElement("div");
            node.className = "col-lg-3 col-md-6";
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
            await setImgWithAutoRefresh(
              imgEl,
              async () => {
                const version = item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
                const u = await resolveImageUrl(item.imageUrl || item.imageKey || "");
                return withCacheBusterSafe(u, version);
              },
              fetchSection
            );
          }
        }

        // ---------- APPOINTMENT ----------
        else if (section.type === "appointment") {
          const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
          const bgRaw = data.backgroundImageUrl || data.backgroundImage || "";
          const bgUrl = await resolveImageUrl(bgRaw);
          const bgFinal = bgUrl ? withCacheBusterSafe(bgUrl, version) : "";

          html += `
          <section
            class="container-fluid appoinment mt-6 mb-6 py-5 wow fadeIn"
            id="appointment-section"
            style="${bgFinal ? `background-image: url('${bgFinal}');` : ""} background-size: cover; background-position: center;"
            data-wow-delay="0.1s"
          >
            <div class="container pt-5">
              <div class="row gy-5 gx-0">
                <div class="col-lg-6 pe-lg-5">
                  <h1 class="display-6 text-uppercase text-white mb-4">${data.title || "Book Your Appointment"}</h1>
                  <p class="text-white mb-5">${data.subtitle || ""}</p>

                  <div class="d-flex align-items-start mb-3">
                    <div class="btn-lg-square bg-white me-3"><i class="bi bi-geo-alt text-dark fs-3"></i></div>
                    <div>
                      <h5 class="text-white mb-2">Office Address</h5>
                      <p class="text-white mb-0">${data.officeAddress || ""}</p>
                    </div>
                  </div>

                  <div class="d-flex align-items-start">
                    <div class="btn-lg-square bg-white me-3"><i class="bi bi-clock text-dark fs-3"></i></div>
                    <div>
                      <h5 class="text-white mb-2">Office Time</h5>
                      <p class="text-white mb-0">${data.officeTime || ""}</p>
                    </div>
                  </div>
                </div>

                <div class="col-lg-6">
                  <form>
                    <div class="row g-3">
                      <div class="col-12 col-sm-6">
                        <input type="text" class="form-control bg-light border-0 px-4" placeholder="Your Name" required>
                      </div>
                      <div class="col-12 col-sm-6">
                        <input type="email" class="form-control bg-light border-0 px-4" placeholder="Your Email" required>
                      </div>
                      <div class="col-12 col-sm-6">
                        <input type="text" class="form-control bg-light border-0 px-4" placeholder="Mobile" required>
                      </div>
                      <div class="col-12 col-sm-6">
                        <select id="service" class="form-select bg-light border-0 px-4">
                          ${(Array.isArray(data.services) ? data.services : [])
                            .map(s => `<option>${typeof s === "string" ? s : (s?.name || s?.label || "")}</option>`)
                            .join("")}
                        </select>
                      </div>
                      <div class="col-12">
                        <textarea class="form-control bg-light border-0 px-4" rows="4" placeholder="Message"></textarea>
                      </div>
                      <div class="col-12">
                        <button class="btn btn-primary w-100 py-3" type="submit">Submit</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>`;
          container.insertAdjacentHTML("beforeend", html);
        }

        // ---------- TEAM ----------
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

          const grid = qs("#team-grid");
          const list = Array.isArray(data) ? data : [];
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
            await setImgWithAutoRefresh(
              imgEl,
              async () => {
                const version = member.updatedAt ? new Date(member.updatedAt).getTime() : Date.now();
                const u = await resolveImageUrl(member.imageUrl || member.imageKey || "");
                return withCacheBusterSafe(u, version);
              },
              fetchSection
            );
          }
        }

        // ---------- TESTIMONIALS ----------
        else if (section.type === "testimonials") {
          const list = Array.isArray(data) ? data : [];

          const makeCard = (item) => {
            const stars = '<i class="far fa-star text-primary me-1"></i>'.repeat(item.rating || 5);
            return `
              <div class="testimonial-item bg-white p-4">
                <div class="d-flex align-items-center mb-3">
                  <img class="img-fluid flex-shrink-0 rounded-circle testi-img" style="width:50px;height:50px;" alt="${item.name || "Client"}">
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
            </div>`).join("");

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

          // Big image circles
          const bigImgs = Array.from(document.querySelectorAll(".testi-big"));
          for (let i = 0; i < bigImgs.length; i++) {
            const el = bigImgs[i];
            const item = list[i];
            await setImgWithAutoRefresh(
              el,
              async () => {
                const version = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
                const u = await resolveImageUrl(item?.imageUrl || item?.imageKey || "");
                return withCacheBusterSafe(u, version);
              },
              fetchSection
            );
          }

          // Small avatar circles inside cards
          const smallImgs = Array.from(document.querySelectorAll(".testi-img"));
          for (let i = 0; i < smallImgs.length; i++) {
            const el = smallImgs[i];
            const item = list[i];
            await setImgWithAutoRefresh(
              el,
              async () => {
                const version = item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
                const u = await resolveImageUrl(item?.imageUrl || item?.imageKey || "");
                return withCacheBusterSafe(u, version);
              },
              fetchSection
            );
          }

          // Re-init OwlCarousel (uses jQuery’s $)
          setTimeout(() => {
            if (window.$ && typeof window.$.fn?.owlCarousel === "function") {
              const $carousel = $(".testimonial-carousel");
              if ($carousel.length) {
                try {
                  $carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
                  $carousel.find(".owl-stage-outer").children().unwrap();
                } catch {}
                $carousel.owlCarousel({
                  autoplay: true,
                  smartSpeed: 1000,
                  dots: true,
                  loop: true,
                  items: 1,
                  margin: 25
                });
              }
            }
          }, 200);
        }

        // ---------- CONTACT ----------
        else if (section.type === "contact") {
          // Keep your existing contact renderer here if you have one.
        }

      } catch (err) {
        console.error(`❌ Failed to load section: ${section.type}`, err);
        container.insertAdjacentHTML("beforeend", `<p class="text-danger">❌ Error loading ${section.type}</p>`);
      }
    }
  }

  renderPage();
})();

