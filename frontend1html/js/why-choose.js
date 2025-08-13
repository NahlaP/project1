

// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const BACKEND = `http://localhost:5000/api/whychoose/${userId}/${templateId}`;

//   try {
//     const res = await fetch(BACKEND);
//     const data = await res.json();

//     if (!data) return;

//     // Apply background image
//     const wrapper = document.getElementById("whychoose-wrapper");
//     if (wrapper && data.bgImageUrl) {
//       wrapper.style.backgroundImage = `url(http://localhost:5000${data.bgImageUrl})`;
//     }

//     // Apply overlay darkness
//     const overlay = document.getElementById("whychoose-overlay");
//     if (overlay) {
//       const opacity = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
//       overlay.style.background = `rgba(0, 0, 0, ${opacity})`;
//     }

//     // Title (optional)
//     const titleEl = document.getElementById("whychoose-title");
//     if (titleEl) titleEl.textContent = "Why You Should Choose Our Fitness Services";

//     // Description
//     const descEl = document.getElementById("whychoose-desc");
//     if (descEl) descEl.textContent = data.description || "";

//     // Stats
//     const statsWrap = document.getElementById("whychoose-stats");
//     statsWrap.innerHTML = "";
//     (data.stats || []).forEach((stat, index) => {
//       const col = document.createElement("div");
//       col.className = `col-sm-6 wow fadeIn`;
//       col.setAttribute("data-wow-delay", `0.${index + 4}s`);
//       col.innerHTML = `
//         <div class="flex-column text-center border border-5 border-primary p-5">
//           <h1 class="text-white">${stat.value}</h1>
//           <p class="text-white text-uppercase mb-0">${stat.label}</p>
//         </div>`;
//       statsWrap.appendChild(col);
//     });

//     // Progress Bars
//     const progressWrap = document.getElementById("whychoose-progress");
//     progressWrap.innerHTML = "";
//     (data.progressBars || []).forEach((bar, index) => {
//       const wrap = document.createElement("div");
//       wrap.className = `experience mb-4 wow fadeIn`;
//       wrap.setAttribute("data-wow-delay", `0.${index + 6}s`);
//       wrap.innerHTML = `
//         <div class="d-flex justify-content-between mb-2">
//           <span class="text-white text-uppercase">${bar.label}</span>
//           <span class="text-white">${bar.percent}%</span>
//         </div>
//         <div class="progress">
//           <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="${bar.percent}"
//                aria-valuemin="0" aria-valuemax="100" style="width: ${bar.percent}%"></div>
//         </div>`;
//       progressWrap.appendChild(wrap);
//     });
//   } catch (err) {
//     console.error("❌ Failed to load Why Choose Us section:", err);
//   }
// });
document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";
  const BACKEND_BASE = "https://project1backend-2xvq.onrender.com";
  const API = `${BACKEND_BASE}/api/whychoose/${userId}/${templateId}`;

  try {
    const res = await fetch(API);
    const data = await res.json();
    if (!data) return;

    // Background Image
    const wrapper = document.getElementById("whychoose-wrapper");
    if (wrapper && data.bgImageUrl) {
      wrapper.style.backgroundImage = `url(${makeAbsoluteUrl(data.bgImageUrl, BACKEND_BASE)})`;
    }

    // Overlay
    const overlay = document.getElementById("whychoose-overlay");
    if (overlay) {
      const opacity = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
      overlay.style.background = `rgba(0, 0, 0, ${opacity})`;
    }

    // Title
    const titleEl = document.getElementById("whychoose-title");
    if (titleEl) titleEl.textContent = "Why You Should Choose Our Fitness Services";

    // Description
    const descEl = document.getElementById("whychoose-desc");
    if (descEl) descEl.textContent = data.description || "";

    // Stats
    const statsWrap = document.getElementById("whychoose-stats");
    statsWrap.innerHTML = "";
    (data.stats || []).forEach((stat, index) => {
      const col = document.createElement("div");
      col.className = "col-sm-6 wow fadeIn";
      col.setAttribute("data-wow-delay", `0.${index + 4}s`);
      col.innerHTML = `
        <div class="flex-column text-center border border-5 border-primary p-5">
          <h1 class="text-white">${stat.value}</h1>
          <p class="text-white text-uppercase mb-0">${stat.label}</p>
        </div>`;
      statsWrap.appendChild(col);
    });

    // Progress Bars
    const progressWrap = document.getElementById("whychoose-progress");
    progressWrap.innerHTML = "";
    (data.progressBars || []).forEach((bar, index) => {
      const wrap = document.createElement("div");
      wrap.className = "experience mb-4 wow fadeIn";
      wrap.setAttribute("data-wow-delay", `0.${index + 6}s`);
      wrap.innerHTML = `
        <div class="d-flex justify-content-between mb-2">
          <span class="text-white text-uppercase">${bar.label}</span>
          <span class="text-white">${bar.percent}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-primary" role="progressbar"
               aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"
               style="width: ${bar.percent}%"></div>
        </div>`;
      progressWrap.appendChild(wrap);
    });

    // Re-init WOW animations
    if (typeof WOW !== "undefined") {
      new WOW().init();
    }

  } catch (err) {
    console.error("❌ Failed to load Why Choose Us section:", err);
  }
});

// Helper function
function makeAbsoluteUrl(path, base) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
