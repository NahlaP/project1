
document.addEventListener("DOMContentLoaded", initTestimonials);

async function initTestimonials() {
  const API = "http://localhost:5000/api/testimonial";
  const ASSET_BASE = "http://localhost:5000";
  const userId = "demo-user";
  const templateId = "gym-template-1";

  const carousel = document.querySelector(".testimonial-carousel");
  const imageList = document.getElementById("testimonial-image-list");

  if (!carousel) {
    console.warn("No .testimonial-carousel found in DOM");
    return;
  }

  try {
    const res = await fetch(`${API}/${userId}/${templateId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();

    console.log("✅ Testimonials loaded:", list);

    carousel.innerHTML = "";
    if (imageList) imageList.innerHTML = "";

    list.forEach((t) => {
      const stars = '<i class="far fa-star text-primary"></i>'.repeat(t.rating || 5);
      const imgSrc = makeAbsoluteUrl(t.imageUrl, ASSET_BASE);

      // Test image
      if (imgSrc) {
        const probe = new Image();
        probe.onload = () => console.log("✅ Loaded image:", imgSrc);
        probe.onerror = () => console.error("❌ Failed image:", imgSrc);
        probe.src = imgSrc;
      }

      // =======================
      // Right Side (Carousel)
      // =======================
      const item = document.createElement("div");
      item.className = "testimonial-item wow fadeInUp";
      item.setAttribute("data-wow-delay", "0.2s");

      item.innerHTML = `
        <div class="d-flex align-items-center mb-4">
          ${imgSrc ? `<img class="img-fluid rounded-circle me-3" style="width: 80px; height: 80px; object-fit: cover;" src="${imgSrc}" alt="${t.name}" onerror="this.style.display='none';">` : ""}
          <div class="ms-3">
            <div class="mb-2">${stars}</div>
            <h5 class="text-uppercase mb-1">${t.name || ""}</h5>
            <span class="text-muted">${t.profession || ""}</span>
          </div>
        </div>
        <p class="fs-5">${t.message || ""}</p>
      `;

      carousel.appendChild(item);

      // =======================
      // Left Side (Flip Images)
      // =======================
      if (imageList && imgSrc) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "animated flip infinite mb-3";
        imgWrap.innerHTML = `
          <img src="${imgSrc}" class="img-fluid rounded" alt="${t.name}" style="width: 100%; object-fit: cover;" onerror="this.style.display='none';" />
        `;
        imageList.appendChild(imgWrap);
      }
    });

    // =======================
    // Re-init WOW animations
    // =======================
    if (typeof WOW !== "undefined") {
      new WOW().init();
    }

    // =======================
    // Re-init Owl Carousel
    // =======================
    if (window.$ && typeof window.$.fn.owlCarousel === 'function') {
      $(".testimonial-carousel").owlCarousel("destroy"); // in case already initialized
      $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        dots: true,
        loop: true,
        items: 1,
        margin: 25,
      });
    } else {
      console.warn("⚠️ OwlCarousel not available");
    }

  } catch (err) {
    console.error("❌ Failed to load testimonials:", err);
  }
}

function makeAbsoluteUrl(url, base) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
