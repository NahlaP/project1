
// document.addEventListener("DOMContentLoaded", initTestimonials);

// async function initTestimonials() {
//   const API = "http://localhost:5000/api/testimonial";
//   const ASSET_BASE = "http://localhost:5000";
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   const carousel = document.querySelector(".testimonial-carousel");
//   const imageList = document.getElementById("testimonial-image-list");

//   if (!carousel) {
//     console.warn("No .testimonial-carousel found in DOM");
//     return;
//   }

//   try {
//     const res = await fetch(`${API}/${userId}/${templateId}`);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const list = await res.json();

//     console.log("✅ Testimonials loaded:", list);

//     carousel.innerHTML = "";
//     if (imageList) imageList.innerHTML = "";

//     list.forEach((t) => {
//       const stars = '<i class="far fa-star text-primary"></i>'.repeat(t.rating || 5);
//       const imgSrc = makeAbsoluteUrl(t.imageUrl, ASSET_BASE);

//       // Test image
//       if (imgSrc) {
//         const probe = new Image();
//         probe.onload = () => console.log("✅ Loaded image:", imgSrc);
//         probe.onerror = () => console.error("❌ Failed image:", imgSrc);
//         probe.src = imgSrc;
//       }

//       // =======================
//       // Right Side (Carousel)
//       // =======================
//       const item = document.createElement("div");
//       item.className = "testimonial-item wow fadeInUp";
//       item.setAttribute("data-wow-delay", "0.2s");

//       item.innerHTML = `
//         <div class="d-flex align-items-center mb-4">
//           ${imgSrc ? `<img class="img-fluid rounded-circle me-3" style="width: 80px; height: 80px; object-fit: cover;" src="${imgSrc}" alt="${t.name}" onerror="this.style.display='none';">` : ""}
//           <div class="ms-3">
//             <div class="mb-2">${stars}</div>
//             <h5 class="text-uppercase mb-1">${t.name || ""}</h5>
//             <span class="text-muted">${t.profession || ""}</span>
//           </div>
//         </div>
//         <p class="fs-5">${t.message || ""}</p>
//       `;

//       carousel.appendChild(item);

//       // =======================
//       // Left Side (Flip Images)
//       // =======================
//       if (imageList && imgSrc) {
//         const imgWrap = document.createElement("div");
//         imgWrap.className = "animated flip infinite mb-3";
//         imgWrap.innerHTML = `
//           <img src="${imgSrc}" class="img-fluid rounded" alt="${t.name}" style="width: 100%; object-fit: cover;" onerror="this.style.display='none';" />
//         `;
//         imageList.appendChild(imgWrap);
//       }
//     });

//     // =======================
//     // Re-init WOW animations
//     // =======================
//     if (typeof WOW !== "undefined") {
//       new WOW().init();
//     }

//     // =======================
//     // Re-init Owl Carousel
//     // =======================
//     if (window.$ && typeof window.$.fn.owlCarousel === 'function') {
//       $(".testimonial-carousel").owlCarousel("destroy"); // in case already initialized
//       $(".testimonial-carousel").owlCarousel({
//         autoplay: true,
//         smartSpeed: 1000,
//         dots: true,
//         loop: true,
//         items: 1,
//         margin: 25,
//       });
//     } else {
//       console.warn("⚠️ OwlCarousel not available");
//     }

//   } catch (err) {
//     console.error("❌ Failed to load testimonials:", err);
//   }
// }

// function makeAbsoluteUrl(url, base) {
//   if (!url) return null;
//   return url.startsWith("http") ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`;
// }




document.addEventListener("DOMContentLoaded", initTestimonials);

async function initTestimonials() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin → Vercel rewrites to EC2
  const API = `/api/testimonial/${userId}/${templateId}`;

  const carousel = document.querySelector(".testimonial-carousel");
  const imageList = document.getElementById("testimonial-image-list");
  if (!carousel) {
    console.warn("No .testimonial-carousel found in DOM");
    return;
  }

  try {
    const res = await fetch(API, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    // console.log("✅ Testimonials loaded:", list);

    carousel.innerHTML = "";
    if (imageList) imageList.innerHTML = "";

    list.forEach((t, i) => {
      const imgRel = normalizeImageUrl(t?.imageUrl || "");
      const imgSrc = withCacheBuster(
        imgRel || "/img/testimonial-placeholder.jpg",
        t?.updatedAt ? new Date(t.updatedAt).getTime() : Date.now()
      );

      const stars = '<i class="far fa-star text-primary"></i>'.repeat(t?.rating || 5);

      // Right side (Carousel)
      const item = document.createElement("div");
      item.className = "testimonial-item wow fadeInUp";
      item.setAttribute("data-wow-delay", "0.2s");
      item.innerHTML = `
        <div class="d-flex align-items-center mb-4">
          <img class="img-fluid rounded-circle me-3"
               style="width:80px;height:80px;object-fit:cover;"
               src="${imgSrc}"
               alt="${escapeHtml(t?.name || "Client")}"
               onerror="this.style.display='none';">
          <div class="ms-3">
            <div class="mb-2">${stars}</div>
            <h5 class="text-uppercase mb-1">${escapeHtml(t?.name || "")}</h5>
            <span class="text-muted">${escapeHtml(t?.profession || "")}</span>
          </div>
        </div>
        <p class="fs-5">${escapeHtml(t?.message || "")}</p>
      `;
      carousel.appendChild(item);

      // Left side (Animated images)
      if (imageList && imgSrc) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "wow fadeInUp mb-3";
        imgWrap.setAttribute("data-wow-delay", `${0.2 + i * 0.2}s`);
        imgWrap.innerHTML = `
          <img src="${imgSrc}"
               class="img-fluid rounded"
               alt="${escapeHtml(t?.name || "Client")}"
               style="width:100%;object-fit:cover;"
               onerror="this.style.display='none';" />
        `;
        imageList.appendChild(imgWrap);
      }
    });

    // Re-init WOW animations
    if (typeof WOW !== "undefined") {
      new WOW().init();
    }

    // Re-init OwlCarousel
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
    } else {
      console.warn("⚠️ OwlCarousel not available");
    }
  } catch (err) {
    console.error("❌ Failed to load testimonials:", err);
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

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}
