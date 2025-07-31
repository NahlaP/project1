// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const BACKEND_URL = `http://localhost:5000/api/topbar/${userId}/${templateId}`;

//   try {
//     const res = await fetch(BACKEND_URL);
//     if (!res.ok) throw new Error("Topbar not found");
//     const topbar = await res.json();

//     // Logo
//     const logoEl = document.getElementById("logo-text");
//     if (logoEl) {
//       if (topbar.logoText) logoEl.textContent = topbar.logoText;
//       if (topbar.logoSize) logoEl.style.fontSize = `${topbar.logoSize}px`;
//     }

//     // Address, Email, Phone
//     const addressEl = document.getElementById("topbar-address");
//     const emailEl = document.getElementById("topbar-email");
//     const phoneEl = document.getElementById("topbar-phone");

//     if (addressEl && topbar.address)
//       addressEl.innerHTML = `<i class="fa fa-map-marker-alt me-3"></i>${topbar.address}`;
//     if (emailEl && topbar.email)
//       emailEl.innerHTML = `<i class="fa fa-envelope me-3"></i>${topbar.email}`;
//     if (phoneEl && topbar.phone)
//       phoneEl.innerHTML = `<i class="fa fa-phone-alt me-3"></i>${topbar.phone}`;

//     // Social
//     if (topbar.socialLinks) {
//       const { facebook, twitter, linkedin } = topbar.socialLinks;
//       const fbEl = document.getElementById("social-facebook");
//       const twEl = document.getElementById("social-twitter");
//       const liEl = document.getElementById("social-linkedin");

//       if (fbEl && facebook) fbEl.href = facebook;
//       if (twEl && twitter) twEl.href = twitter;
//       if (liEl && linkedin) liEl.href = linkedin;
//     }
//   } catch (err) {
//     console.error("❌ Failed to load topbar:", err);
//   }
// });
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/topbar/demo-user/gym-template-1");
    const topbar = await res.json();

    // DOM references
    const logoTextEl = document.getElementById("logo-text");
    const logoImageEl = document.getElementById("logo-image"); // 👈 Add this <img> tag in HTML
    const addressEl = document.getElementById("topbar-address");
    const emailEl = document.getElementById("topbar-email");
    const phoneEl = document.getElementById("topbar-phone");
    const facebookEl = document.getElementById("social-facebook");
    const twitterEl = document.getElementById("social-twitter");
    const linkedinEl = document.getElementById("social-linkedin");

    // ----- Logo -----
    if (topbar.logoType === "text") {
      if (logoTextEl) {
        logoTextEl.style.display = "block";
        logoTextEl.textContent = topbar.logoText || "WELDORK";
        logoTextEl.style.fontSize = `${topbar.logoSize || 24}px`;
      }
      if (logoImageEl) logoImageEl.style.display = "none";
    } else if (topbar.logoType === "image" && topbar.logoUrl) {
      if (logoImageEl) {
        logoImageEl.style.display = "inline-block";
        logoImageEl.src = `http://localhost:5000${topbar.logoUrl}`;
        logoImageEl.width = topbar.logoWidth || 150;
        logoImageEl.height = topbar.logoHeight || 50;
      }
      if (logoTextEl) logoTextEl.style.display = "none";
    }

    // ----- Contact Info -----
    if (addressEl && topbar.address)
      addressEl.innerHTML = `<i class="fa fa-map-marker-alt me-3"></i>${topbar.address}`;
    if (emailEl && topbar.email)
      emailEl.innerHTML = `<i class="fa fa-envelope me-3"></i>${topbar.email}`;
    if (phoneEl && topbar.phone)
      phoneEl.innerHTML = `<i class="fa fa-phone-alt me-3"></i>${topbar.phone}`;

    // ----- Social Links -----
    if (facebookEl && topbar.socialLinks?.facebook)
      facebookEl.href = topbar.socialLinks.facebook;
    if (twitterEl && topbar.socialLinks?.twitter)
      twitterEl.href = topbar.socialLinks.twitter;
    if (linkedinEl && topbar.socialLinks?.linkedin)
      linkedinEl.href = topbar.socialLinks.linkedin;
  } catch (err) {
    console.error("❌ Failed to load topbar:", err);
  }
});
