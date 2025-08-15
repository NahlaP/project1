
// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const API_BASE = "http://localhost:5000";
//   const RES_URL = `${API_BASE}/api/services/${userId}/${templateId}`;

//   try {
//     const res = await fetch(RES_URL);
//     const data = await res.json();

//     if (!data || !Array.isArray(data.services)) return;

//     const container = document.getElementById("service-wrapper");
//     const title = document.getElementById("service-title");

//     if (title) {
//       title.textContent = "Reliable & High-Quality Welding Services";
//     }

//     if (!container) return;
//     container.innerHTML = ""; // Clear previous nodes

//     data.services
//       .slice()
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .forEach((item, index) => {
//         const col = document.createElement("div");
//         col.className = "col-lg-3 col-md-6 wow fadeInUp";
//         col.setAttribute("data-wow-delay", item.delay || `0.${index + 1}s`);

//         const imgSrc = item.imageUrl
//           ? `${API_BASE}${item.imageUrl}?t=${Date.now()}`
//           : "/img/service-placeholder.jpg"; // fallback image

//         col.innerHTML = `
//           <div class="service-item">
//             <div class="service-inner pb-5">
//               <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service Image'}">
//               <div class="service-text px-5 pt-4">
//                 <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
//                 <p>${item.description || "No description available."}</p>
//               </div>
//               <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                 ${item.buttonText || "Read More"}
//                 <i class="bi bi-chevron-double-right ms-1"></i>
//               </a>
//             </div>
//           </div>`;
          
//         container.appendChild(col);
//       });
//   } catch (error) {
//     console.error("❌ Could not load services:", error);
//   }
// });


// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const API_BASE = "https://project1backend-2xvq.onrender.com";
//   const RES_URL = `${API_BASE}/api/services/${userId}/${templateId}`;

//   try {
//     const res = await fetch(RES_URL);
//     const data = await res.json();

//     if (!data || !Array.isArray(data.services)) return;

//     const container = document.getElementById("service-wrapper");
//     const title = document.getElementById("service-title");

//     if (title) {
//       title.textContent = "Reliable & High-Quality Welding Services";
//     }

//     if (!container) return;
//     container.innerHTML = ""; // Clear previous nodes

//     data.services
//       .slice()
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .forEach((item, index) => {
//         const col = document.createElement("div");
//         col.className = "col-lg-3 col-md-6 wow fadeInUp";
//         col.setAttribute("data-wow-delay", item.delay || `0.${index + 1}s`);

//         const imgSrc = item.imageUrl
//           ? `${API_BASE}${item.imageUrl}?t=${Date.now()}`
//           : "/img/service-placeholder.jpg"; // fallback image

//         col.innerHTML = `
//           <div class="service-item">
//             <div class="service-inner pb-5">
//               <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service Image'}">
//               <div class="service-text px-5 pt-4">
//                 <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
//                 <p>${item.description || "No description available."}</p>
//               </div>
//               <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                 ${item.buttonText || "Read More"}
//                 <i class="bi bi-chevron-double-right ms-1"></i>
//               </a>
//             </div>
//           </div>`;
          
//         container.appendChild(col);
//       });
//   } catch (error) {
//     console.error("❌ Could not load services:", error);
//   }
// });



document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin path → Vercel rewrites to EC2
  const API = `/api/services/${userId}/${templateId}`;

  const container = document.getElementById("service-wrapper");
  const titleEl = document.getElementById("service-title");
  if (!container) return;

  try {
    const res = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const services = Array.isArray(data?.services)
      ? data.services
      : Array.isArray(data)
      ? data
      : [];

    // Title (prefer API title, fallback to your preferred string)
    if (titleEl) {
      titleEl.textContent =
        data?.title ||
        data?.heading ||
        "Reliable & High-Quality Welding Services";
    }

    if (!services.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = ""; // Clear previous nodes

    services
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .forEach((item, index) => {
        const col = document.createElement("div");
        col.className = "col-lg-3 col-md-6 wow fadeInUp";
        col.setAttribute("data-wow-delay", item?.delay || `0.${index + 1}s`);

        const imgRel = normalizeImageUrl(item?.imageUrl || "");
        const imgSrc = withCacheBuster(
          imgRel || "/img/service-placeholder.jpg",
          item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now()
        );

        col.innerHTML = `
          <div class="service-item">
            <div class="service-inner pb-5">
              <img class="img-fluid w-100" src="${imgSrc}" alt="${escapeHtml(item?.title || 'Service Image')}">
              <div class="service-text px-5 pt-4">
                <h5 class="text-uppercase">${escapeHtml(item?.title || "Untitled")}</h5>
                <p>${escapeHtml(item?.description || "No description available.")}</p>
              </div>
              <a class="btn btn-light px-3" href="${toHref(item?.buttonHref)}">
                ${escapeHtml(item?.buttonText || "Read More")}
                <i class="bi bi-chevron-double-right ms-1"></i>
              </a>
            </div>
          </div>`;
        container.appendChild(col);
      });
  } catch (error) {
    console.error("❌ Could not load services:", error);
  }
});

/* ---------------- helpers ---------------- */

function normalizeImageUrl(url) {
  if (!url) return "";
  // If absolute and points to /uploads/*, convert to relative so it goes through Vercel proxy
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/uploads/")) {
        return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
      }
      return url; // External HTTPS (e.g., S3) is fine
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

function toHref(href) {
  if (!href) return "#";
  if (/^https?:\/\//i.test(href)) return href;           // external
  if (href.startsWith("#")) return href;                  // anchor
  if (href.includes("page.html?slug=")) return href;     // dynamic page
  // Internal page: strip leading "/" and optional ".html", then ensure ".html"
  const cleaned = href.replace(/^\/+/, "").replace(/\.html$/i, "");
  return `${cleaned}.html`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}
