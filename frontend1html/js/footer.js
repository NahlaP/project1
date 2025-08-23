

// document.addEventListener("DOMContentLoaded", initFooter);

// async function initFooter() {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Same-origin -> Vercel rewrites to EC2
//   const API = `/api/contact-info/${userId}/${templateId}`;

//   try {
//     const res = await fetch(API, {
//       cache: "no-store",
//       headers: { Accept: "application/json" }
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = (await res.json()) || {};

//     // Office
//     setText("#footer-address", data.address);
//     setText("#footer-phone", data.phone);
//     setText("#footer-email", data.email);

//     // Socials
//     const socials = data.socialLinks || {};
//     setSocial("#footer-facebook", socials.facebook);
//     setSocial("#footer-twitter", socials.twitter);
//     setSocial("#footer-youtube", socials.youtube);
//     setSocial("#footer-linkedin", socials.linkedin);

//     // Business Hours
//     const hours = data.businessHours || {};
//     setText("#footer-hours-mf", hours.mondayToFriday);
//     setText("#footer-hours-sat", hours.saturday);
//     setText("#footer-hours-sun", hours.sunday);

//     // If you later add a gallery, render it here:
//     // renderGallery(data.gallery || []);
//   } catch (err) {
//     console.error("❌ Failed to load footer contact info:", err);
//   }
// }

// function qs(sel) {
//   return document.querySelector(sel);
// }

// function setText(sel, val) {
//   const el = qs(sel);
//   if (!el) return;
//   if (val && typeof val === "string") {
//     el.textContent = val;
//     // If it's an <a> with tel: or mailto:, set href too
//     if (el.tagName === "A") {
//       if (sel.includes("phone")) el.href = `tel:${val.replace(/\s+/g, "")}`;
//       if (sel.includes("email")) el.href = `mailto:${val}`;
//     }
//   }
//   // else: keep existing default text in the HTML
// }

// function setSocial(sel, url) {
//   const el = qs(sel);
//   if (!el) return;
//   if (url) {
//     el.href = normalizeUrl(url);
//     el.classList.remove("d-none");
//   } else {
//     el.classList.add("d-none");
//   }
// }


// function normalizeUrl(u) {
//   try {
//     if (!/^https?:\/\//i.test(u)) return `https://${u}`;
//     return u;
//   } catch {
//     return u;
//   }
// }


// frontend1html/js/footer.js — scoped, no global collisions
(() => {
  const USER_ID = "demo-user";
  const TEMPLATE_ID = "gym-template-1";
  const API_BASE = window.__API_BASE__ || ""; // dev-proxy on localhost

  const $sel = (s) => document.querySelector(s);

  function setText(sel, val) {
    const el = $sel(sel);
    if (!el || !val) return;
    el.textContent = val;
    // Optional: if you ever switch spans to <a>, auto-link phone/email
    if (el.tagName === "A") {
      if (sel.includes("phone")) el.href = `tel:${String(val).replace(/\s+/g, "")}`;
      if (sel.includes("email")) el.href = `mailto:${val}`;
    }
  }

  function normalizeUrl(u) {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  }

  function setSocial(sel, url) {
    const a = $sel(sel);
    if (!a) return;
    if (url) {
      a.href = normalizeUrl(url);
      a.classList.remove("d-none");
    } else {
      a.classList.add("d-none");
    }
  }

  async function initFooter() {
    try {
      const res = await fetch(`${API_BASE}/api/contact-info/${USER_ID}/${TEMPLATE_ID}`, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) || {};

      // Contact text
      setText("#footer-address", data.address || data.office || "");
      setText("#footer-phone",   data.phone || "");
      setText("#footer-email",   data.email || "");

      // Hours (support both flat and nested)
      const hrs = data.businessHours || {};
      setText("#footer-hours-mf",  data.weekday || hrs.mondayToFriday || "");
      setText("#footer-hours-sat", data.saturday || hrs.saturday || "");
      setText("#footer-hours-sun", data.sunday   || hrs.sunday   || "");

      // Socials (accept either socialLinks or socials)
      const socials = data.socialLinks || data.socials || {};
      setSocial("#footer-facebook", socials.facebook);
      setSocial("#footer-twitter",  socials.twitter);
      setSocial("#footer-youtube",  socials.youtube);
      setSocial("#footer-linkedin", socials.linkedin);
    } catch (err) {
      console.error("❌ Failed to load footer contact info:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }
})();
