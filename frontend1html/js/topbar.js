
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



// // js/topbar.js
// document.addEventListener("DOMContentLoaded", async () => {
//   const USER_ID = "demo-user";
//   const TEMPLATE_ID = "gym-template-1";
//   const API_URL = `/api/topbar/${USER_ID}/${TEMPLATE_ID}`;

//   const $ = (id) => document.getElementById(id);

//   const logoTextEl = $("logo-text");
//   const logoImgEl  = $("logo-image");

//   const addressEl  = $("topbar-address");
//   const emailEl    = $("topbar-email");
//   const phoneEl    = $("topbar-phone");
//   const fbEl       = $("social-facebook");
//   const twEl       = $("social-twitter");
//   const liEl       = $("social-linkedin");

//   try {
//     const res = await fetch(API_URL, { cache: "no-store", headers: { Accept: "application/json" } });
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const t = await res.json();

//     // --- LOGO ---
//     // Show image whenever a URL exists. No S3, no rewriting, use the URL as-is.
//     const url = String(t.logoUrl || "").trim();
//     if (url) {
//       if (logoImgEl) {
//         logoImgEl.style.display = "inline-block";
//         logoImgEl.src    = url;                    // use cPanel URL directly
//         logoImgEl.alt    = t.logoAlt || "Logo";
//         logoImgEl.width  = t.logoWidth  || 150;
//         logoImgEl.height = t.logoHeight || 50;
//       }
//       if (logoTextEl) logoTextEl.style.display = "none";
//     } else {
//       if (logoTextEl) {
//         logoTextEl.style.display = "block";
//         logoTextEl.textContent = t.logoText || "WELDORK";
//         logoTextEl.style.fontSize = `${t.logoSize || 48}px`;
//       }
//       if (logoImgEl) logoImgEl.style.display = "none";
//     }

//     // --- CONTACT INFO ---
//     if (addressEl) addressEl.innerHTML = `<i class="fa fa-map-marker-alt me-3"></i>${escapeHtml(t.address || "")}`;

//     if (emailEl) {
//       const e = t.email || "";
//       emailEl.innerHTML = `<i class="fa fa-envelope me-3"></i>${escapeHtml(e)}`;
//       if (emailEl.tagName === "A" && e) emailEl.href = `mailto:${e}`;
//     }

//     if (phoneEl) {
//       const p = t.phone || "";
//       phoneEl.innerHTML = `<i class="fa fa-phone-alt me-3"></i>${escapeHtml(p)}`;
//       if (phoneEl.tagName === "A" && p) phoneEl.href = `tel:${p.replace(/\s+/g, "")}`;
//     }

//     // --- SOCIAL ---
//     setSocial(fbEl, t.socialLinks?.facebook);
//     setSocial(twEl, t.socialLinks?.twitter);
//     setSocial(liEl, t.socialLinks?.linkedin);
//   } catch (err) {
//     console.error("❌ topbar load failed:", err);
//   }

//   function setSocial(a, href) {
//     if (!a) return;
//     if (href) {
//       a.href = /^https?:\/\//i.test(href) ? href : `https://${href}`;
//       a.classList.remove("d-none");
//       a.target = "_blank";
//       a.rel = "noopener";
//     } else {
//       a.classList.add("d-none");
//       a.removeAttribute("href");
//     }
//   }

//   function escapeHtml(str) {
//     return String(str).replace(/[&<>"']/g, (m) => ({
//       "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
//     }[m]));
//   }
// });
