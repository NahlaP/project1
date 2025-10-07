(() => {
  'use strict';
  // for quick verification in console:
  window.__FOOTER_VERSION__ = 'v3';

  // local-only selector helper (won’t clash with page-loader.js or jQuery)
  const $$ = (sel) => document.querySelector(sel);

  document.addEventListener('DOMContentLoaded', initFooter);

  async function initFooter() {
    const userId = "demo-user";
    const templateId = "gym-template-1";
    const API = `/api/contact-info/${userId}/${templateId}`;

    try {
      const res = await fetch(API, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) || {};

      // Office
      setText("#footer-address", data.address);
      setText("#footer-phone", data.phone);
      setText("#footer-email", data.email);

      // Socials
      const socials = data.socialLinks || {};
      setSocial("#footer-facebook", socials.facebook);
      setSocial("#footer-twitter",  socials.twitter);
      setSocial("#footer-youtube",  socials.youtube);
      setSocial("#footer-linkedin", socials.linkedin);

      // Business Hours
      const hours = data.businessHours || {};
      setText("#footer-hours-mf",  hours.mondayToFriday);
      setText("#footer-hours-sat", hours.saturday);
      setText("#footer-hours-sun", hours.sunday);
    } catch (err) {
      console.error("❌ Failed to load footer contact info:", err);
    }
  }

  function setText(sel, val) {
    const el = $$(sel);
    if (!el) return;
    if (val && typeof val === "string") {
      el.textContent = val;
      if (el.tagName === "A") {
        if (sel.includes("phone")) el.href = `tel:${val.replace(/\s+/g, "")}`;
        if (sel.includes("email")) el.href = `mailto:${val}`;
      }
    }
  }

  function setSocial(sel, url) {
    const el = $$(sel);
    if (!el) return;
    if (url) {
      el.href = normalizeUrl(url);
      el.classList.remove("d-none");
    } else {
      el.classList.add("d-none");
    }
  }

  function normalizeUrl(u) {
    try {
      return /^https?:\/\//i.test(u) ? u : `https://${u}`;
    } catch {
      return u;
    }
  }
})();
