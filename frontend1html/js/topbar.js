
// document.addEventListener("DOMContentLoaded", async () => {
//   try {
//     const res = await fetch("http://localhost:5000/api/topbar/demo-user/gym-template-1");
//     const topbar = await res.json();

//     // DOM references
//     const logoTextEl = document.getElementById("logo-text");
//     const logoImageEl = document.getElementById("logo-image"); // 👈 Add this <img> tag in HTML
//     const addressEl = document.getElementById("topbar-address");
//     const emailEl = document.getElementById("topbar-email");
//     const phoneEl = document.getElementById("topbar-phone");
//     const facebookEl = document.getElementById("social-facebook");
//     const twitterEl = document.getElementById("social-twitter");
//     const linkedinEl = document.getElementById("social-linkedin");

//     // ----- Logo -----
//     if (topbar.logoType === "text") {
//       if (logoTextEl) {
//         logoTextEl.style.display = "block";
//         logoTextEl.textContent = topbar.logoText || "WELDORK";
//         logoTextEl.style.fontSize = `${topbar.logoSize || 24}px`;
//       }
//       if (logoImageEl) logoImageEl.style.display = "none";
//     } else if (topbar.logoType === "image" && topbar.logoUrl) {
//       if (logoImageEl) {
//         logoImageEl.style.display = "inline-block";
//         logoImageEl.src = `http://localhost:5000${topbar.logoUrl}`;
//         logoImageEl.width = topbar.logoWidth || 150;
//         logoImageEl.height = topbar.logoHeight || 50;
//       }
//       if (logoTextEl) logoTextEl.style.display = "none";
//     }

//     // ----- Contact Info -----
//     if (addressEl && topbar.address)
//       addressEl.innerHTML = `<i class="fa fa-map-marker-alt me-3"></i>${topbar.address}`;
//     if (emailEl && topbar.email)
//       emailEl.innerHTML = `<i class="fa fa-envelope me-3"></i>${topbar.email}`;
//     if (phoneEl && topbar.phone)
//       phoneEl.innerHTML = `<i class="fa fa-phone-alt me-3"></i>${topbar.phone}`;

//     // ----- Social Links -----
//     if (facebookEl && topbar.socialLinks?.facebook)
//       facebookEl.href = topbar.socialLinks.facebook;
//     if (twitterEl && topbar.socialLinks?.twitter)
//       twitterEl.href = topbar.socialLinks.twitter;
//     if (linkedinEl && topbar.socialLinks?.linkedin)
//       linkedinEl.href = topbar.socialLinks.linkedin;
//   } catch (err) {
//     console.error("❌ Failed to load topbar:", err);
//   }
// });


document.addEventListener("DOMContentLoaded", async () => {
  const USER_ID = "demo-user";
  const TEMPLATE_ID = "gym-template-1";

  // Same-origin → Vercel rewrites to EC2
  const API_URL = `/api/topbar/${USER_ID}/${TEMPLATE_ID}`;

  try {
    const res = await fetch(API_URL, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const topbar = (await res.json()) || {};

    // DOM refs
    const logoTextEl = byId("logo-text");
    const logoImageEl = byId("logo-image");
    const addressEl = byId("topbar-address");
    const emailEl = byId("topbar-email");
    const phoneEl = byId("topbar-phone");
    const facebookEl = byId("social-facebook");
    const twitterEl = byId("social-twitter");
    const linkedinEl = byId("social-linkedin");

    /* ---------- Logo ---------- */
    const logoType = topbar.logoType || (topbar.logoUrl ? "image" : "text");
    if (logoType === "text") {
      if (logoTextEl) {
        logoTextEl.style.display = "block";
        logoTextEl.textContent = topbar.logoText || "WELDORK";
        if (topbar.logoSize) logoTextEl.style.fontSize = `${topbar.logoSize}px`;
      }
      if (logoImageEl) logoImageEl.style.display = "none";
    } else if (logoType === "image" && topbar.logoUrl) {
      if (logoImageEl) {
        const relOrAbs = normalizeImageUrl(topbar.logoUrl);
        const version = topbar.updatedAt ? new Date(topbar.updatedAt).getTime() : Date.now();
        logoImageEl.style.display = "inline-block";
        logoImageEl.src = withCacheBuster(relOrAbs, version);
        logoImageEl.width = topbar.logoWidth || 150;
        logoImageEl.height = topbar.logoHeight || 50;
        logoImageEl.alt = topbar.logoAlt || "Logo";
      }
      if (logoTextEl) logoTextEl.style.display = "none";
    }

    /* ---------- Contact Info ---------- */
    if (addressEl) {
      addressEl.innerHTML = `<i class="fa fa-map-marker-alt me-3"></i>${escapeHtml(topbar.address || "")}`;
    }
    if (emailEl) {
      const email = topbar.email || "";
      emailEl.innerHTML = `<i class="fa fa-envelope me-3"></i>${escapeHtml(email)}`;
      // if it's an <a>, set mailto:
      if (emailEl.tagName === "A" && email) emailEl.href = `mailto:${email}`;
    }
    if (phoneEl) {
      const phone = topbar.phone || "";
      phoneEl.innerHTML = `<i class="fa fa-phone-alt me-3"></i>${escapeHtml(phone)}`;
      if (phoneEl.tagName === "A" && phone) phoneEl.href = `tel:${phone.replace(/\s+/g, "")}`;
    }

    /* ---------- Social Links ---------- */
    if (facebookEl) setSocialHref(facebookEl, topbar.socialLinks?.facebook);
    if (twitterEl) setSocialHref(twitterEl, topbar.socialLinks?.twitter);
    if (linkedinEl) setSocialHref(linkedinEl, topbar.socialLinks?.linkedin);
  } catch (err) {
    console.error("❌ Failed to load topbar:", err);
  }
});

/* ---------------- helpers ---------------- */
function byId(id) { return document.getElementById(id); }

function normalizeImageUrl(url) {
  if (!url) return "";
  // If absolute and points to /uploads/*, convert to relative so it passes Vercel proxy
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/uploads/")) return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
      return url; // external HTTPS (e.g., S3) is fine
    } catch { return url; }
  }
  // Already relative (e.g., "/uploads/...") — perfect
  return url;
}

function withCacheBuster(url, version) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

function setSocialHref(aEl, url) {
  if (!aEl) return;
  if (url) {
    aEl.href = normalizeUrl(url);
    aEl.classList.remove("d-none");
    aEl.setAttribute("rel", "noopener");
    aEl.setAttribute("target", "_blank");
  } else {
    aEl.classList.add("d-none");
    aEl.removeAttribute("href");
  }
}

function normalizeUrl(u) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}
