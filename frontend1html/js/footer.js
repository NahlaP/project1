// document.addEventListener('DOMContentLoaded', initFooter);

// async function initFooter() {
//   const backendUrl = 'http://localhost:5000';
//   const userId = 'demo-user';
//   const templateId = 'gym-template-1';

//   const API = `${backendUrl}/api/contact-info/${userId}/${templateId}`;

//   try {
//     const res = await fetch(API);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const data = await res.json() || {};

//     // Office
//     setText('#footer-address', data.address);
//     setText('#footer-phone', data.phone);
//     setText('#footer-email', data.email);

//     // Socials
//     const socials = data.socialLinks || {};
//     setSocial('#footer-facebook', socials.facebook);
//     setSocial('#footer-twitter', socials.twitter);
//     setSocial('#footer-youtube', socials.youtube);
//     setSocial('#footer-linkedin', socials.linkedin);

//     // Business Hours
//     const hours = data.businessHours || {};
//     setText('#footer-hours-mf', hours.mondayToFriday);
//     setText('#footer-hours-sat', hours.saturday);
//     setText('#footer-hours-sun', hours.sunday);

//     // If you later save gallery to backend, populate it here
//     // renderGallery(data.gallery || []);

//   } catch (err) {
//     console.error('❌ Failed to load footer contact info:', err);
//   }
// }

// function qs(sel) {
//   return document.querySelector(sel);
// }

// function setText(sel, val) {
//   const el = qs(sel);
//   if (!el) return;
//   el.textContent = val || el.textContent; // keep default if empty
// }

// function setSocial(sel, url) {
//   const el = qs(sel);
//   if (!el) return;
//   if (url) {
//     el.href = url;
//     el.classList.remove('d-none');
//   } else {
//     el.classList.add('d-none');
//   }
// }

// document.addEventListener('DOMContentLoaded', initFooter);

// async function initFooter() {
//   const backendUrl = 'https://project1backend-2xvq.onrender.com';
//   const userId = 'demo-user';
//   const templateId = 'gym-template-1';

//   const API = `${backendUrl}/api/contact-info/${userId}/${templateId}`;

//   try {
//     const res = await fetch(API);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const data = await res.json() || {};

//     // Office
//     setText('#footer-address', data.address);
//     setText('#footer-phone', data.phone);
//     setText('#footer-email', data.email);

//     // Socials
//     const socials = data.socialLinks || {};
//     setSocial('#footer-facebook', socials.facebook);
//     setSocial('#footer-twitter', socials.twitter);
//     setSocial('#footer-youtube', socials.youtube);
//     setSocial('#footer-linkedin', socials.linkedin);

//     // Business Hours
//     const hours = data.businessHours || {};
//     setText('#footer-hours-mf', hours.mondayToFriday);
//     setText('#footer-hours-sat', hours.saturday);
//     setText('#footer-hours-sun', hours.sunday);

//     // Future Gallery section
//     // renderGallery(data.gallery || []);

//   } catch (err) {
//     console.error('❌ Failed to load footer contact info:', err);
//   }
// }

// function qs(sel) {
//   return document.querySelector(sel);
// }

// function setText(sel, val) {
//   const el = qs(sel);
//   if (!el) return;
//   el.textContent = val || el.textContent; // retain default if empty
// }

// function setSocial(sel, url) {
//   const el = qs(sel);
//   if (!el) return;
//   if (url) {
//     el.href = url;
//     el.classList.remove('d-none');
//   } else {
//     el.classList.add('d-none');
//   }
// }



document.addEventListener("DOMContentLoaded", initFooter);

async function initFooter() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin -> Vercel rewrites to EC2
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
    setSocial("#footer-twitter", socials.twitter);
    setSocial("#footer-youtube", socials.youtube);
    setSocial("#footer-linkedin", socials.linkedin);

    // Business Hours
    const hours = data.businessHours || {};
    setText("#footer-hours-mf", hours.mondayToFriday);
    setText("#footer-hours-sat", hours.saturday);
    setText("#footer-hours-sun", hours.sunday);

    // If you later add a gallery, render it here:
    // renderGallery(data.gallery || []);
  } catch (err) {
    console.error("❌ Failed to load footer contact info:", err);
  }
}

function qs(sel) {
  return document.querySelector(sel);
}

function setText(sel, val) {
  const el = qs(sel);
  if (!el) return;
  if (val && typeof val === "string") {
    el.textContent = val;
    // If it's an <a> with tel: or mailto:, set href too
    if (el.tagName === "A") {
      if (sel.includes("phone")) el.href = `tel:${val.replace(/\s+/g, "")}`;
      if (sel.includes("email")) el.href = `mailto:${val}`;
    }
  }
  // else: keep existing default text in the HTML
}

function setSocial(sel, url) {
  const el = qs(sel);
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
    if (!/^https?:\/\//i.test(u)) return `https://${u}`;
    return u;
  } catch {
    return u;
  }
}
