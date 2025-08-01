



// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Step 1: Get slug from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const slug = urlParams.get("slug");

//   if (!slug) {
//     document.getElementById("dynamic-page-content").innerHTML =
//       "<p class='text-danger'>❌ No slug specified in URL.</p>";
//     return;
//   }

//   try {
//     // Step 2: Fetch all sections
//     const res = await fetch(`http://localhost:5000/api/sections/${userId}/${templateId}`);
//     const all = await res.json();

//     // Step 3: Find the page by slug
//     const page = all.find((s) => s.type === "page" && s.slug === slug);

//     if (!page) {
//       document.getElementById("dynamic-page-content").innerHTML =
//         "<p class='text-danger'>❌ Page not found.</p>";
//       return;
//     }

//     // Step 4: Render Page Header
//     let html = `
//       <h1 class="mb-3">${page.title}</h1>
//       ${page.content?.subtitle ? `<p>${page.content.subtitle}</p>` : ""}
//       <hr/>
//     `;

//     // ✅ Step 5: Fetch all sections that belong to this page using parentPageId
//     const attachedSections = all.filter((s) => s.parentPageId === page._id);

//     if (attachedSections.length === 0) {
//       html += `<p class="text-muted">No sections yet for this page.</p>`;
//     } else {
//       for (const section of attachedSections) {
//         html += `
//           <section class="mb-5">
//             <h3>${section.title}</h3>
//             <p>${section.content?.description || "No content."}</p>
//           </section>
//         `;
//       }
//     }

//     document.getElementById("dynamic-page-content").innerHTML = html;
//   } catch (err) {
//     console.error("Failed to load page data:", err);
//     document.getElementById("dynamic-page-content").innerHTML =
//       "<p class='text-danger'>❌ Failed to load page content.</p>";
//   }
// });




// const backendUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// const container = document.getElementById("dynamic-page-content");

// const sectionApiMap = {
//   hero: "/api/hero",
//   about: "/api/about",
//   whychooseus: "/api/whychoose",
//   services: "/api/services",
//   appointment: "/api/appointment",
//   team: "/api/team",
//   testimonials: "/api/testimonial",
//   contact: "/api/contact-info",
// };

// async function renderPage() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const slug = urlParams.get("slug");

//   if (!slug) {
//     container.innerHTML = "<h3 class='text-danger'>❌ Invalid page URL</h3>";
//     return;
//   }

//   try {
//     const pageRes = await fetch(`${backendUrl}/api/sections?userId=${userId}&templateId=${templateId}`);
//     const allSections = await pageRes.json();
//     const page = allSections.find((s) => s.slug === slug && s.type === "page");

//     if (!page) {
//       container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>";
//       return;
//     }

//     const assignedSections = allSections.filter((s) => s.parentPageId === page._id);

//     if (!assignedSections.length) {
//       container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>";
//       return;
//     }

//     container.innerHTML = "";

//     for (const section of assignedSections) {
//       const apiPath = sectionApiMap[section.type];
//       if (!apiPath) continue;

//       try {
//         const res = await fetch(`${backendUrl}${apiPath}/${userId}/${templateId}`);
//         const data = await res.json();

//         let html = "";

    //         if (section.type === "about") {
    //           const imgSrc = data.imageUrl ? `${backendUrl}${data.imageUrl}?t=${Date.now()}` : "";
    //           html += `
    //             <section class="container py-5" id="about-section">
    //               <div class="row g-5">
    //                 <div class="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
    //                   <h1 class="display-6 text-uppercase mb-4">${data.title || "About Us"}</h1>
    //                   <p class="mb-4">${data.description || ""}</p>
    //                   <h5 class="mb-4 text-primary">${data.highlight || ""}</h5>
    //                   <div class="row gy-3">
    //                     ${(data.bullets || []).map((b) => `
    //                       <div class="col-sm-6">
//                         <div class="d-flex align-items-center">
//                           <div class="flex-shrink-0 btn-xl-square bg-light me-3">
//                             <i class="fa fa-check-square fa-2x text-primary"></i>
//                           </div>
//                           <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
//                         </div>
//                       </div>`).join("")}
//                   </div>
//                 </div>
//                 <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
//                   <img class="img-fluid rounded" src="${imgSrc}" alt="About Image" />
//                 </div>
//               </div>
//             </section>`;
//         } else if (section.type === "whychooseus") {
//           const bg = data.bgImageUrl ? `background-image: url('${backendUrl}${data.bgImageUrl}')` : "";
//           const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;

//           html += `
//             <section class="container-fluid py-5" style="background-size: cover; background-position: center; ${bg}">
//               <div style="background: rgba(0,0,0,${overlay}); padding: 4rem; border-radius: 10px;">
//                 <div class="text-center mb-5">
//                   <h1 class="text-white">${section.title || "Why Choose Us"}</h1>
//                   <p class="text-white">${data.description || ""}</p>
//                 </div>
//                 <div class="row g-4 mb-5">
//                   ${(data.stats || []).map((stat, index) => `
//                     <div class="col-sm-6 wow fadeIn" data-wow-delay="0.${index + 4}s">
//                       <div class="flex-column text-center border border-5 border-primary p-5">
//                         <h1 class="text-white">${stat.value}</h1>
//                         <p class="text-white text-uppercase mb-0">${stat.label}</p>
//                       </div>
//                     </div>`).join("")}
//                 </div>
//                 ${(data.progressBars || []).map((bar, index) => `
//                   <div class="experience mb-4 wow fadeIn" data-wow-delay="0.${index + 6}s">
//                     <div class="d-flex justify-content-between mb-2">
//                       <span class="text-white text-uppercase">${bar.label}</span>
//                       <span class="text-white">${bar.percent}%</span>
//                     </div>
//                     <div class="progress">
//                       <div class="progress-bar bg-primary" role="progressbar" style="width: ${bar.percent}%"
//                         aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
//                     </div>
//                   </div>`).join("")}
//               </div>
//             </section>`;
//         } else if (section.type === "services") {
//           html += `
//             <section class="container-xxl service py-5">
//               <div class="container">
//                 <div class="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s">
//                   <h1 class="display-6 mb-3">${section.title || "Our Services"}</h1>
//                 </div>
//                 <div class="row g-4">
//                   ${(data.services || []).map((item, index) => {
//                     const delay = item.delay || `0.${index + 1}s`;
//                     const imgSrc = item.imageUrl ? `${backendUrl}${item.imageUrl}?t=${Date.now()}` : "/img/service-placeholder.jpg";
//                     return `
//                       <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="${delay}">
//                         <div class="service-item">
//                           <div class="service-inner pb-5">
//                             <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service'}">
//                             <div class="service-text px-5 pt-4">
//                               <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
//                               <p>${item.description || "No description available."}</p>
//                             </div>
//                             <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                               ${item.buttonText || "Read More"}
//                               <i class="bi bi-chevron-double-right ms-1"></i>
//                             </a>
//                           </div>
//                         </div>
//                       </div>`;
//                   }).join("")}
//                 </div>
//               </div>
//             </section>`;
//         } else {
//           html += `
//             <section class="container my-5">
//               <h3>${section.title || section.type}</h3>
//               <p>${JSON.stringify(data)}</p>
//             </section>`;
//         }

//         container.innerHTML += html;

//       } catch (err) {
//         console.error(`❌ Failed to load section: ${section.type}`, err);
//         container.innerHTML += `<p class="text-danger">❌ Error loading ${section.type}</p>`;
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error loading page:", err);
//     container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
//   }
// }

// renderPage();
// const backendUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// const container = document.getElementById("dynamic-page-content");

// const sectionApiMap = {
//   hero: "/api/hero",
//   about: "/api/about",
//   whychooseus: "/api/whychoose",
//   services: "/api/services",
//   appointment: "/api/appointment",
//   team: "/api/team",
//   testimonials: "/api/testimonial",
//   contact: "/api/contact-info",
// };

// async function renderPage() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const slug = urlParams.get("slug");

//   if (!slug) {
//     container.innerHTML = "<h3 class='text-danger'>❌ Invalid page URL</h3>";
//     return;
//   }

//   try {
//     const pageRes = await fetch(`${backendUrl}/api/sections?userId=${userId}&templateId=${templateId}`);
//     const allSections = await pageRes.json();
//     const page = allSections.find((s) => s.slug === slug && s.type === "page");

//     if (!page) {
//       container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>";
//       return;
//     }

//     const assignedSections = allSections.filter((s) => s.parentPageId === page._id);
//     if (!assignedSections.length) {
//       container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>";
//       return;
//     }

//     container.innerHTML = "";

//     for (const section of assignedSections) {
//       const apiPath = sectionApiMap[section.type];
//       if (!apiPath) continue;

//       try {
//         const res = await fetch(`${backendUrl}${apiPath}/${userId}/${templateId}`);
//         const data = await res.json();
//         let html = "";

//      // === HERO Section ===
//         if (section.type === "hero") {
//           const heroImg = data.imageUrl ? `${backendUrl}${data.imageUrl}` : "";
//           html += `
//             <div class="container-fluid p-0 mb-6 wow fadeIn" data-wow-delay="0.1s">
//               <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
//                 <div class="carousel-inner">
//                   <div class="carousel-item active" style="min-height: 100vh; position: relative;">
//                     <img id="hero-image" class="w-100 h-100" style="object-fit: cover; max-height: 100vh;" src="${heroImg}" alt="Hero Image" />
//                     <div class="carousel-caption" style="background: rgba(0, 0, 0, 0.5); padding: 4rem; text-align: left;">
//                       <h1 class="display-3 text-white mb-4" id="hero-title">${data.content || "Welcome to our site"}</h1>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>`;
//         }

//         // === About Section ===
//         if (section.type === "about") {
//           const imgSrc = data.imageUrl ? `${backendUrl}${data.imageUrl}?t=${Date.now()}` : "";
//           html += `
//             <section class="container py-5" id="about-section">
//               <div class="row g-5">
//                 <div class="col-lg-6">
//                   <h1 class="display-6 text-uppercase mb-4">${data.title || "About Us"}</h1>
//                   <p class="mb-4">${data.description || ""}</p>
//                   <h5 class="mb-4 text-primary">${data.highlight || ""}</h5>
//                   <div class="row gy-3">
//                     ${(data.bullets || []).map((b) => `
//                       <div class="col-sm-6">
//                         <div class="d-flex align-items-center">
//                           <div class="flex-shrink-0 btn-xl-square bg-light me-3">
//                             <i class="fa fa-check-square fa-2x text-primary"></i>
//                           </div>
//                           <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
//                         </div>
//                       </div>`).join("")}
//                   </div>
//                 </div>
//                 <div class="col-lg-6">
//                   <img class="img-fluid rounded" src="${imgSrc}" alt="About Image" />
//                 </div>
//               </div>
//             </section>`;
//         }

//         // === Why Choose Us Section ===
//         else if (section.type === "whychooseus") {
//           const bg = data.bgImageUrl ? `background-image: url('${backendUrl}${data.bgImageUrl}')` : "";
//           const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;

//           html += `
//             <section class="container-fluid py-5" style="background-size: cover; background-position: center; ${bg}">
//               <div style="background: rgba(0,0,0,${overlay}); padding: 4rem; border-radius: 10px;">
//                 <div class="text-center mb-5">
//                   <h1 class="text-white">${section.title || "Why Choose Us"}</h1>
//                   <p class="text-white">${data.description || ""}</p>
//                 </div>
//                 <div class="row g-4 mb-5">
//                   ${(data.stats || []).map((stat, index) => `
//                     <div class="col-sm-6 wow fadeIn" data-wow-delay="0.${index + 4}s">
//                       <div class="flex-column text-center border border-5 border-primary p-5">
//                         <h1 class="text-white">${stat.value}</h1>
//                         <p class="text-white text-uppercase mb-0">${stat.label}</p>
//                       </div>
//                     </div>`).join("")}
//                 </div>
//                 ${(data.progressBars || []).map((bar, index) => `
//                   <div class="experience mb-4 wow fadeIn" data-wow-delay="0.${index + 6}s">
//                     <div class="d-flex justify-content-between mb-2">
//                       <span class="text-white text-uppercase">${bar.label}</span>
//                       <span class="text-white">${bar.percent}%</span>
//                     </div>
//                     <div class="progress">
//                       <div class="progress-bar bg-primary" style="width: ${bar.percent}%"
//                         role="progressbar" aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
//                     </div>
//                   </div>`).join("")}
//               </div>
//             </section>`;
//         }

//         // === Services Section ===
//         else if (section.type === "services") {
//           html += `
//             <section class="container-xxl service py-5">
//               <div class="container">
//                 <div class="text-center mx-auto mb-5">
//                   <h1 class="display-6 mb-3">${section.title || "Our Services"}</h1>
//                 </div>
//                 <div class="row g-4">
//                   ${(data.services || []).map((item, index) => {
//                     const delay = item.delay || `0.${index + 1}s`;
//                     const imgSrc = item.imageUrl ? `${backendUrl}${item.imageUrl}?t=${Date.now()}` : "/img/service-placeholder.jpg";
//                     return `
//                       <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="${delay}">
//                         <div class="service-item">
//                           <div class="service-inner pb-5">
//                             <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service'}">
//                             <div class="service-text px-5 pt-4">
//                               <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
//                               <p>${item.description || "No description available."}</p>
//                             </div>
//                             <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                               ${item.buttonText || "Read More"}
//                               <i class="bi bi-chevron-double-right ms-1"></i>
//                             </a>
//                           </div>
//                         </div>
//                       </div>`;
//                   }).join("")}
//                 </div>
//               </div>
//             </section>`;
//         }

//         // === Appointment Section ===
//         else if (section.type === "appointment") {
//           const bgUrl = data.backgroundImage
//             ? (data.backgroundImage.startsWith("http")
//               ? data.backgroundImage
//               : `${backendUrl}${data.backgroundImage}`) + `?t=${Date.now()}`
//             : "";

//           html += `
//             <section class="container-fluid appoinment mt-6 mb-6 py-5 wow fadeIn" id="appointment-section"
//               style="background-image: url('${bgUrl}'); background-size: cover; background-position: center;">
//               <div class="container pt-5">
//                 <div class="row gy-5 gx-0">
//                   <div class="col-lg-6 pe-lg-5">
//                     <h1 class="display-6 text-uppercase text-white mb-4" id="appointment-title">
//                       ${data.title || "Book Your Appointment"}
//                     </h1>
//                     <p class="text-white mb-5" id="appointment-description">
//                       ${data.subtitle || ""}
//                     </p>
//                     <div class="d-flex align-items-start mb-3">
//                       <div class="btn-lg-square bg-white me-3">
//                         <i class="bi bi-geo-alt text-dark fs-3"></i>
//                       </div>
//                       <div>
//                         <h5 class="text-white mb-2">Office Address</h5>
//                         <p class="text-white mb-0" id="office-address">${data.officeAddress || ""}</p>
//                       </div>
//                     </div>
//                     <div class="d-flex align-items-start">
//                       <div class="btn-lg-square bg-white me-3">
//                         <i class="bi bi-clock text-dark fs-3"></i>
//                       </div>
//                       <div>
//                         <h5 class="text-white mb-2">Office Time</h5>
//                         <p class="text-white mb-0" id="office-time">${data.officeTime || ""}</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div class="col-lg-6">
//                     <form>
//                       <div class="row g-3">
//                         <div class="col-12 col-sm-6">
//                           <input type="text" class="form-control bg-light border-0 px-4" placeholder="Your Name" required>
//                         </div>
//                         <div class="col-12 col-sm-6">
//                           <input type="email" class="form-control bg-light border-0 px-4" placeholder="Your Email" required>
//                         </div>
//                         <div class="col-12 col-sm-6">
//                           <input type="text" class="form-control bg-light border-0 px-4" placeholder="Mobile" required>
//                         </div>
//                         <div class="col-12 col-sm-6">
//                           <select id="service" class="form-select bg-light border-0 px-4">
//                             ${(data.services || []).map(service => `<option>${service}</option>`).join("")}
//                           </select>
//                         </div>
//                         <div class="col-12">
//                           <textarea class="form-control bg-light border-0 px-4" rows="4" placeholder="Message"></textarea>
//                         </div>
//                         <div class="col-12">
//                           <button class="btn btn-primary w-100 py-3" type="submit">Submit</button>
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </section>`;
//         }

//         // === Fallback ===
//         else {
//           html += `
//             <section class="container my-5">
//               <h3>${section.title || section.type}</h3>
//               <p>${JSON.stringify(data)}</p>
//             </section>`;
//         }

//         container.innerHTML += html;
//       } catch (err) {
//         console.error(`❌ Failed to load section: ${section.type}`, err);
//         container.innerHTML += `<p class="text-danger">❌ Error loading ${section.type}</p>`;
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error loading page:", err);
//     container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
//   }
// }

// renderPage();




const backendUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

const container = document.getElementById("dynamic-page-content");

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

async function renderPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  if (!slug) {
    // container.innerHTML = "<h3 class='text-danger'>❌ Invalid page URL</h3>";
      window.location.href = "page.html?slug=home-page";
    return;
  }

  try {
    const pageRes = await fetch(`${backendUrl}/api/sections?userId=${userId}&templateId=${templateId}`);
    const allSections = await pageRes.json();
    const page = allSections.find((s) => s.slug === slug && s.type === "page");

    if (!page) {
      container.innerHTML = "<h3 class='text-danger'>❌ Page not found</h3>";
      return;
    }

    const assignedSections = allSections.filter((s) => s.parentPageId === page._id);
    if (!assignedSections.length) {
      container.innerHTML = "<h3 class='text-warning'>❌ No sections found for this page.</h3>";
      return;
    }

    container.innerHTML = "";

    for (const section of assignedSections) {
      const apiPath = sectionApiMap[section.type];
      if (!apiPath) continue;

      try {
        const res = await fetch(`${backendUrl}${apiPath}/${userId}/${templateId}`);
        const data = await res.json();
        let html = "";

        if (section.type === "hero") {
          const heroImg = data.imageUrl ? `${backendUrl}${data.imageUrl}` : "";
          html += `
            <div class="container-fluid p-0 mb-6 wow fadeIn" data-wow-delay="0.1s">
              <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                  <div class="carousel-item active" style="min-height: 100vh; position: relative;">
                    <img id="hero-image" class="w-100 h-100" style="object-fit: cover; max-height: 100vh;" src="${heroImg}" alt="Hero Image" />
                    <div class="carousel-caption" style="background: rgba(0, 0, 0, 0.5); padding: 4rem; text-align: left;">
                      <h1 class="display-3 text-white mb-4" id="hero-title">${data.content || "Welcome to our site"}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        }



else if (section.type === "about") {
  const imgSrc = data.imageUrl ? `${backendUrl}${data.imageUrl}?t=${Date.now()}` : "";

  html += `
    <!-- About Start -->
    <div class="container-fluid pt-6 pb-6" id="about-section">
      <div class="container">
        <div class="row g-5">
          <!-- About Image -->
          <div class="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
            <div class="about-img">
              <img
                class="img-fluid w-100"
                src="${imgSrc}"
                alt="${data.imageAlt || "About Image"}"
                style="max-height: 350px; object-fit: cover"
              />
            </div>
          </div>

          <!-- About Content -->
          <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
            <h1 class="display-6 text-uppercase mb-4">${data.title || "About Title"}</h1>
            <p class="mb-4">${data.description || ""}</p>

            <div class="row g-5 mb-4">
              ${(data.bullets || []).map((b) => `
                <div class="col-sm-6">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0 btn-xl-square bg-light me-3">
                      <i class="fa fa-check-square fa-2x text-primary"></i>
                    </div>
                    <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="border border-5 border-primary p-4 text-center mt-4">
              <h4 class="lh-base text-uppercase mb-0">${data.highlight || "Highlight"}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- About End -->
  `;
}
else if (section.type === "whychooseus") {
  const bgUrl = data.bgImageUrl ? `${backendUrl}${data.bgImageUrl}` : "";
  const overlay = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;

  html += `
    <!-- Features Start -->
    <div
      class="container-fluid feature mt-6 mb-6 wow fadeIn"
      data-wow-delay="0.1s"
      id="whychoose-wrapper"
      style="position: relative; background-image: url('${bgUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center center; background-color: #000; z-index: 0;"
    >
      <!-- 🔳 Overlay with semi-transparent dark effect -->
      <div
        id="whychoose-overlay"
        style="position: absolute; inset: 0; background: rgba(0, 0, 0, ${overlay}); z-index: 1;"
      ></div>

      <!-- ✅ Content Area -->
      <div class="container position-relative" style="z-index: 2;">
        <div class="row g-0 justify-content-end">
          <div class="col-lg-6 pt-5">
            <div class="mt-5">
              <h1
                id="whychoose-title"
                class="display-6 text-white text-uppercase mb-4 wow fadeIn"
                data-wow-delay="0.3s"
              >
                  Why You Should Choose Our Fitness Services
              </h1>

              <p
                id="whychoose-desc"
                class="text-light mb-4 wow fadeIn"
                data-wow-delay="0.4s"
              >
                ${data.description || ""}
              </p>

              <div id="whychoose-stats" class="row g-4 pt-2 mb-4">
                ${(data.stats || []).map((stat, index) => `
                  <div class="col-sm-6 wow fadeIn" data-wow-delay="0.${index + 5}s">
                    <div class="flex-column text-center border border-5 border-primary p-5">
                      <h1 class="text-white">${stat.value}</h1>
                      <p class="text-white text-uppercase mb-0">${stat.label}</p>
                    </div>
                  </div>
                `).join("")}
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
                        <div
                          class="progress-bar bg-primary"
                          role="progressbar"
                          style="width: ${bar.percent}%"
                          aria-valuenow="${bar.percent}"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Features End -->
  `;
}



        else if (section.type === "services") {
          html += `
            <section class="container-xxl service py-5">
              <div class="container">
                <div class="text-center mx-auto mb-5">
                  <h1 class="display-6 mb-3">${section.title || "Our Services"}</h1>
                </div>
                <div class="row g-4">
                  ${(data.services || []).map((item, index) => {
                    const delay = item.delay || `0.${index + 1}s`;
                    const imgSrc = item.imageUrl ? `${backendUrl}${item.imageUrl}?t=${Date.now()}` : "/img/service-placeholder.jpg";
                    return `
                      <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="${delay}">
                        <div class="service-item">
                          <div class="service-inner pb-5">
                            <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service'}">
                            <div class="service-text px-5 pt-4">
                              <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
                              <p>${item.description || "No description available."}</p>
                            </div>
                            <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
                              ${item.buttonText || "Read More"}
                              <i class="bi bi-chevron-double-right ms-1"></i>
                            </a>
                          </div>
                        </div>
                      </div>`;
                  }).join("")}
                </div>
              </div>
            </section>`;
        }

        else if (section.type === "appointment") {
          const bgUrl = data.backgroundImage
            ? (data.backgroundImage.startsWith("http")
              ? data.backgroundImage
              : `${backendUrl}${data.backgroundImage}`) + `?t=${Date.now()}`
            : "";

          html += `
            <section class="container-fluid appoinment mt-6 mb-6 py-5 wow fadeIn" id="appointment-section"
              style="background-image: url('${bgUrl}'); background-size: cover; background-position: center;">
              <div class="container pt-5">
                <div class="row gy-5 gx-0">
                  <div class="col-lg-6 pe-lg-5">
                    <h1 class="display-6 text-uppercase text-white mb-4">${data.title || "Book Your Appointment"}</h1>
                    <p class="text-white mb-5">${data.subtitle || ""}</p>
                    <div class="d-flex align-items-start mb-3">
                      <div class="btn-lg-square bg-white me-3">
                        <i class="bi bi-geo-alt text-dark fs-3"></i>
                      </div>
                      <div>
                        <h5 class="text-white mb-2">Office Address</h5>
                        <p class="text-white mb-0">${data.officeAddress || ""}</p>
                      </div>
                    </div>
                    <div class="d-flex align-items-start">
                      <div class="btn-lg-square bg-white me-3">
                        <i class="bi bi-clock text-dark fs-3"></i>
                      </div>
                      <div>
                        <h5 class="text-white mb-2">Office Time</h5>
                        <p class="text-white mb-0">${data.officeTime || ""}</p>
                      </div>
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
                            ${(data.services || []).map(service => `<option>${service}</option>`).join("")}
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
        }
        // === Team Section ===
        else if (section.type === "team") {
          html += `
            <section class="container-xxl py-5">
              <div class="container">
                <div class="text-center mx-auto mb-5">
                  <h1 class="display-6 mb-3">${section.title || "Our Team"}</h1>
                </div>
                <div class="row g-4">
                  ${(data || []).map((member, index) => {
                    const img = member.imageUrl ? `${backendUrl}${member.imageUrl}` : "/img/team-placeholder.jpg";
                    return `
                      <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.${index + 1}s">
                        <div class="team-item bg-light">
                          <div class="overflow-hidden">
                            <img class="img-fluid w-100" src="${img}" alt="${member.name}" />
                          </div>
                          <div class="text-center p-4">
                            <h5 class="fw-bold mb-2">${member.name}</h5>
                            <p class="text-uppercase text-muted">${member.role}</p>
                          </div>
                        </div>
                      </div>`;
                  }).join("")}
                </div>
              </div>
            </section>`;
        }
else if (section.type === "testimonials") {
  const testimonials = data || [];

  const animatedImagesHtml = testimonials.slice(0, 4).map((item, i) => {
    const img = item.imageUrl ? `${backendUrl}${item.imageUrl}` : "/img/testimonial-placeholder.jpg";
    return `
      <div class="wow fadeInUp" data-wow-delay="${0.2 + i * 0.2}s">
        <img class="img-fluid rounded-circle w-100 h-100" 
             src="${img}" 
             alt="${item.name || 'Client'}"
             onerror="this.style.display='none';"
             style="object-fit: cover;" />
      </div>
    `;
  }).join("");

  const carouselHtml = testimonials.map((item) => {
    if (!item.message || !item.name) return "";
    const img = item.imageUrl ? `${backendUrl}${item.imageUrl}` : "/img/testimonial-placeholder.jpg";
    const stars = '<i class="far fa-star text-primary me-1"></i>'.repeat(item.rating || 5);
    return `
      <div class="testimonial-item bg-white p-4">
        <div class="d-flex align-items-center mb-3">
          <img class="img-fluid flex-shrink-0 rounded-circle" 
               src="${img}" 
               style="width: 50px; height: 50px;" 
               onerror="this.remove()">
          <div class="ps-3">
            <div class="mb-1">${stars}</div>
            <h5 class="mb-1">${item.name}</h5>
            <small>${item.profession}</small>
          </div>
        </div>
        <p class="mb-0">${item.message}</p>
      </div>`;
  }).join("");

  html += `
    <section class="container-fluid pt-6 pb-6">
      <div class="container">
        <div class="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style="max-width: 600px;">
          <h1 class="display-6 text-uppercase mb-5">${section.title || "What They’re Talking About Our Training Work"}</h1>
        </div>

        <div class="row g-5 align-items-center">
          <div class="col-lg-5 wow fadeInUp" data-wow-delay="0.3s">
            <div class="testimonial-img" id="testimonial-image-list">
              ${animatedImagesHtml}
            </div>
          </div>

          <div class="col-lg-7 wow fadeInUp" data-wow-delay="0.5s">
            <div class="owl-carousel testimonial-carousel" id="testimonial-carousel">
              ${carouselHtml}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

 


        // === Contact Section ===
        else if (section.type === "contact") {
          html += `
            <section class="container-fluid bg-dark text-white-50 footer pt-5 mt-5">
              <div class="container py-5">
                <div class="row g-5">
                  <div class="col-lg-4 col-md-6">
                    <h5 class="text-white mb-4">Our Office</h5>
                    <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>${data.office || "No office info"}</p>
                    <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>${data.phone || ""}</p>
                    <p class="mb-2"><i class="fa fa-envelope me-3"></i>${data.email || ""}</p>
                  </div>
                  <div class="col-lg-4 col-md-6">
                    <h5 class="text-white mb-4">Business Hours</h5>
                    <p class="mb-1">Monday - Friday: ${data.weekday || "-"}</p>
                    <p class="mb-1">Saturday: ${data.saturday || "-"}</p>
                    <p class="mb-1">Sunday: ${data.sunday || "-"}</p>
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
        }

        container.innerHTML += html;

setTimeout(() => {
  if (window.$ && typeof window.$.fn.owlCarousel === "function") {
    const $carousel = $(".testimonial-carousel");

    try {
      $carousel.trigger("destroy.owl.carousel").removeClass("owl-loaded");
      $carousel.find(".owl-stage-outer").children().unwrap();
    } catch (e) {
      console.warn("Owl destroy warning:", e);
    }

    $carousel.owlCarousel({
      autoplay: true,
      smartSpeed: 1000,
      dots: true,
      loop: true,
      items: 1,
      margin: 25,
    });
  }
}, 200); // slight delay ensures DOM is rendered


      } catch (err) {
        console.error(`❌ Failed to load section: ${section.type}`, err);
        container.innerHTML += `<p class="text-danger">❌ Error loading ${section.type}</p>`;
      }
    }
  } catch (err) {
    console.error("❌ Error loading page:", err);
    container.innerHTML = "<h3 class='text-danger'>❌ Error loading page.</h3>";
  }
}

renderPage();
        
