

// document.addEventListener("DOMContentLoaded", initAppointment);

// async function initAppointment() {
//   const API = "http://localhost:5000/api/appointment";
//   const BASE_URL = "http://localhost:5000"; // used for relative image paths
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Grab elements by ID
//   const wrap = byId("appointment-section");
//   const titleEl = byId("appointment-title");
//   const descEl = byId("appointment-description");
//   const addrEl = byId("office-address");
//   const timeEl = byId("office-time");
//   const serviceSel = byId("service");

//   try {
//     const res = await fetch(`${API}/${userId}/${templateId}`);
//     if (!res.ok) throw new Error("Failed to fetch appointment section");

//     const data = await res.json();
//     console.log("✅ Appointment section data:", data);

//     // ✅ Update text content
//     if (titleEl) titleEl.textContent = data.title || "Appointment Title";
//     if (descEl) descEl.textContent = data.subtitle || "Appointment Description";
//     if (addrEl) addrEl.textContent = data.officeAddress || "Office Address";
//     if (timeEl) timeEl.textContent = data.officeTime || "Office Time";

//     // ✅ Set background image
//     if (wrap && data.backgroundImage) {
//       const bgUrl = data.backgroundImage.startsWith("http")
//         ? data.backgroundImage
//         : `${BASE_URL}${data.backgroundImage}`;

//       wrap.style.backgroundImage = `url('${bgUrl}')`;
//       wrap.style.backgroundSize = "cover";
//       wrap.style.backgroundPosition = "center";
//       wrap.style.backgroundRepeat = "no-repeat";
//     }

//     // ✅ Populate dropdown services
//     if (serviceSel && Array.isArray(data.services)) {
//       serviceSel.innerHTML = ""; // Clear previous options
//       data.services.forEach((service) => {
//         const opt = document.createElement("option");
//         opt.value = service;
//         opt.textContent = service;
//         serviceSel.appendChild(opt);
//       });
//     }
//   } catch (err) {
//     console.error("❌ Failed to initialize appointment section:", err);
//   }
// }

// function byId(id) {
//   return document.getElementById(id);
// }


// document.addEventListener("DOMContentLoaded", initAppointment);

// async function initAppointment() {
//   const BASE_URL = "https://project1backend-2xvq.onrender.com";
//   const API = `${BASE_URL}/api/appointment`;
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Grab elements by ID
//   const wrap = byId("appointment-section");
//   const titleEl = byId("appointment-title");
//   const descEl = byId("appointment-description");
//   const addrEl = byId("office-address");
//   const timeEl = byId("office-time");
//   const serviceSel = byId("service");

//   try {
//     const res = await fetch(`${API}/${userId}/${templateId}`);
//     if (!res.ok) throw new Error("Failed to fetch appointment section");

//     const data = await res.json();
//     console.log("✅ Appointment section data:", data);

//     // ✅ Update text content
//     if (titleEl) titleEl.textContent = data.title || "Appointment Title";
//     if (descEl) descEl.textContent = data.subtitle || "Appointment Description";
//     if (addrEl) addrEl.textContent = data.officeAddress || "Office Address";
//     if (timeEl) timeEl.textContent = data.officeTime || "Office Time";

//     // ✅ Set background image
//     if (wrap && data.backgroundImage) {
//       const bgUrl = data.backgroundImage.startsWith("http")
//         ? data.backgroundImage
//         : `${BASE_URL}${data.backgroundImage}`;

//       wrap.style.backgroundImage = `url('${bgUrl}')`;
//       wrap.style.backgroundSize = "cover";
//       wrap.style.backgroundPosition = "center";
//       wrap.style.backgroundRepeat = "no-repeat";
//     }

//     // ✅ Populate dropdown services
//     if (serviceSel && Array.isArray(data.services)) {
//       serviceSel.innerHTML = ""; // Clear previous options
//       data.services.forEach((service) => {
//         const opt = document.createElement("option");
//         opt.value = service;
//         opt.textContent = service;
//         serviceSel.appendChild(opt);
//       });
//     }
//   } catch (err) {
//     console.error("❌ Failed to initialize appointment section:", err);
//   }
// }

// function byId(id) {
//   return document.getElementById(id);
// }




document.addEventListener("DOMContentLoaded", initAppointment);

async function initAppointment() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin path → Vercel rewrites to EC2
  const API = `/api/appointment/${userId}/${templateId}`;

  // Grab elements by ID
  const wrap = byId("appointment-section");
  const titleEl = byId("appointment-title");
  const descEl = byId("appointment-description");
  const addrEl = byId("office-address");
  const timeEl = byId("office-time");
  const serviceSel = byId("service");

  try {
    const res = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`Failed to fetch appointment section: HTTP ${res.status}`);

    const data = await res.json();
    // console.log("✅ Appointment section data:", data);

    // ✅ Update text content (with safe fallbacks)
    if (titleEl) titleEl.textContent = data.title || "Appointment Title";
    if (descEl) descEl.textContent = data.subtitle || data.description || "Appointment Description";
    if (addrEl) addrEl.textContent = data.officeAddress || "Office Address";
    if (timeEl) timeEl.textContent = data.officeTime || data.officeHours || "Office Time";

    // ✅ Set background image (go through Vercel proxy if "/uploads/...")
    if (wrap && data.backgroundImage) {
      const relOrAbs = normalizeImageUrl(data.backgroundImage);
      const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const bgUrl = withCacheBuster(relOrAbs, version);

      wrap.style.backgroundImage = `url("${bgUrl}")`;
      wrap.style.backgroundSize = "cover";
      wrap.style.backgroundPosition = "center";
      wrap.style.backgroundRepeat = "no-repeat";
    }

    // ✅ Populate dropdown services (supports strings or objects)
    if (serviceSel) {
      serviceSel.innerHTML = ""; // Clear previous options
      const services = Array.isArray(data.services) ? data.services : [];
      services.forEach((s) => {
        const label = typeof s === "string" ? s : (s?.name || s?.label || "");
        if (!label) return;
        const opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        serviceSel.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("❌ Failed to initialize appointment section:", err);
  }
}

function byId(id) {
  return document.getElementById(id);
}

// Convert absolute http(s) URLs that point to /uploads/* into relative paths
// so they pass through the Vercel proxy. Leave external HTTPS URLs (e.g., S3) as-is.
function normalizeImageUrl(url) {
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      // If it's like http://3.109.207.179/uploads/...
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
