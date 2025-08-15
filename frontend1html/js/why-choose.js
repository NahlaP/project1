

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



document.addEventListener("DOMContentLoaded", initWhyChoose);

async function initWhyChoose() {
  const userId = "demo-user";
  const templateId = "gym-template-1";
  // Same-origin → Vercel rewrites to EC2
  const API = `/api/whychoose/${userId}/${templateId}`;

  try {
    const res = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data) return;

    /* ---------- Background Image ---------- */
    const wrapper = document.getElementById("whychoose-wrapper");
    if (wrapper) {
      const bgRel = normalizeImageUrl(data.bgImageUrl || "");
      const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const bgSrc = withCacheBuster(bgRel, version);
      if (bgSrc) {
        wrapper.style.backgroundImage = `url("${bgSrc}")`;
        wrapper.style.backgroundSize = "contain";
        wrapper.style.backgroundRepeat = "no-repeat";
        wrapper.style.backgroundPosition = "center center";
        wrapper.style.backgroundColor = "#000";
      }
    }

    /* ---------- Overlay ---------- */
    const overlay = document.getElementById("whychoose-overlay");
    if (overlay) {
      const opacity = typeof data.bgOverlay === "number" ? data.bgOverlay : 0.5;
      overlay.style.background = `rgba(0, 0, 0, ${opacity})`;
    }

    /* ---------- Title & Description ---------- */
    const titleEl = document.getElementById("whychoose-title");
    if (titleEl) {
      titleEl.textContent =
        data.title || "Why You Should Choose Our Fitness Services";
    }
    const descEl = document.getElementById("whychoose-desc");
    if (descEl) descEl.textContent = data.description || "";

    /* ---------- Stats ---------- */
    const statsWrap = document.getElementById("whychoose-stats");
    if (statsWrap) {
      statsWrap.innerHTML = "";
      (data.stats || []).forEach((stat, index) => {
        const col = document.createElement("div");
        col.className = "col-sm-6 wow fadeIn";
        col.setAttribute("data-wow-delay", `0.${index + 5}s`);
        col.innerHTML = `
          <div class="flex-column text-center border border-5 border-primary p-5">
            <h1 class="text-white">${escapeHtml(stat?.value ?? "")}</h1>
            <p class="text-white text-uppercase mb-0">${escapeHtml(stat?.label ?? "")}</p>
          </div>`;
        statsWrap.appendChild(col);
      });
    }

    /* ---------- Progress Bars ---------- */
    const progressWrap = document.getElementById("whychoose-progress");
    if (progressWrap) {
      progressWrap.innerHTML = "";
      (data.progressBars || []).forEach((bar, index) => {
        const pct = clampPercent(bar?.percent);
        const wrap = document.createElement("div");
        wrap.className = "experience mb-4 wow fadeIn";
        wrap.setAttribute("data-wow-delay", `0.${index + 7}s`);
        wrap.innerHTML = `
          <div class="d-flex justify-content-between mb-2">
            <span class="text-white text-uppercase">${escapeHtml(bar?.label ?? "")}</span>
            <span class="text-white">${pct}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar bg-primary"
                 role="progressbar"
                 style="width: ${pct}%"
                 aria-valuenow="${pct}"
                 aria-valuemin="0"
                 aria-valuemax="100"></div>
          </div>`;
        progressWrap.appendChild(wrap);
      });
    }

    /* ---------- Re-init WOW animations ---------- */
    if (typeof WOW !== "undefined") {
      new WOW().init();
    }
  } catch (err) {
    console.error("❌ Failed to load Why Choose Us section:", err);
  }
}

/* ---------------- helpers ---------------- */

function normalizeImageUrl(url) {
  if (!url) return "";
  // If absolute and points to /uploads/*, convert to relative so it passes Vercel proxy
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/uploads/")) {
        return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
      }
      return url; // external HTTPS (e.g., S3) is fine
    } catch {
      return url;
    }
  }
  // Already relative (e.g., "/uploads/...") — perfect
  return url;
}

function withCacheBuster(url, version) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

function clampPercent(v) {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
