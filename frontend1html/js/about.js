// // frontend1html/js/about.js
// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const BACKEND = `http://localhost:5000/api/about/${userId}/${templateId}`;

//   try {
//     const res = await fetch(BACKEND);
//     const about = await res.json();
//     if (!about) return;

//     // Basic info
//     document.getElementById("about-title").textContent =
//       about.title || "About Title";
//     document.getElementById("about-desc").textContent =
//       about.description || "";
//     document.getElementById("about-highlight").textContent =
//       about.highlight || "";

//     // Image
//   imgEl.src = `${about.imageUrl}?t=${Date.now()}`;

//     // Bullets
//     const bulletsWrap = document.getElementById("about-bullets");
//     bulletsWrap.innerHTML = "";
//     (about.bullets || []).forEach((b) => {
//       const col = document.createElement("div");
//       col.className = "col-sm-6";
//       col.innerHTML = `
//         <div class="d-flex align-items-center">
//           <div class="flex-shrink-0 btn-xl-square bg-light me-3">
//             <i class="fa fa-check-square fa-2x text-primary"></i>
//           </div>
//           <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
//         </div>`;
//       bulletsWrap.appendChild(col);
//     });
//   } catch (e) {
//     console.error("❌ Failed to load about:", e);
//   }
// });
// frontend1html/js/about.js
document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";
  const BACKEND = `http://localhost:5000/api/about/${userId}/${templateId}`;

  try {
    const res = await fetch(BACKEND);
    const about = await res.json();
    if (!about) return;

    // Grab elements once
    const titleEl = document.getElementById("about-title");
    const descEl = document.getElementById("about-desc");
    const highlightEl = document.getElementById("about-highlight");
    const imgEl = document.getElementById("about-img");
    const bulletsWrap = document.getElementById("about-bullets");

    // Basic info
    titleEl.textContent = about.title || "About Title";
    descEl.textContent = about.description || "";
    highlightEl.textContent = about.highlight || "";

    // Image  (make sure /uploads is served statically from backend)
    if (about.imageUrl && imgEl) {
      // ensure it’s absolute to your backend and cache-bust
      const src =
        (about.imageUrl.startsWith("http")
          ? about.imageUrl
          : `http://localhost:5000${about.imageUrl}`) + `?t=${Date.now()}`;
      imgEl.src = src;
      imgEl.alt = about.imageAlt || "About Image";
    }

    // Bullets
    bulletsWrap.innerHTML = "";
    (about.bullets || []).forEach((b) => {
      const col = document.createElement("div");
      col.className = "col-sm-6";
      col.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="flex-shrink-0 btn-xl-square bg-light me-3">
            <i class="fa fa-check-square fa-2x text-primary"></i>
          </div>
          <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
        </div>`;
      bulletsWrap.appendChild(col);
    });
  } catch (e) {
    console.error("❌ Failed to load about:", e);
  }
});
