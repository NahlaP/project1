

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


document.addEventListener("DOMContentLoaded", initAppointment);

async function initAppointment() {
  const BASE_URL = "https://project1backend-2xvq.onrender.com";
  const API = `${BASE_URL}/api/appointment`;
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Grab elements by ID
  const wrap = byId("appointment-section");
  const titleEl = byId("appointment-title");
  const descEl = byId("appointment-description");
  const addrEl = byId("office-address");
  const timeEl = byId("office-time");
  const serviceSel = byId("service");

  try {
    const res = await fetch(`${API}/${userId}/${templateId}`);
    if (!res.ok) throw new Error("Failed to fetch appointment section");

    const data = await res.json();
    console.log("✅ Appointment section data:", data);

    // ✅ Update text content
    if (titleEl) titleEl.textContent = data.title || "Appointment Title";
    if (descEl) descEl.textContent = data.subtitle || "Appointment Description";
    if (addrEl) addrEl.textContent = data.officeAddress || "Office Address";
    if (timeEl) timeEl.textContent = data.officeTime || "Office Time";

    // ✅ Set background image
    if (wrap && data.backgroundImage) {
      const bgUrl = data.backgroundImage.startsWith("http")
        ? data.backgroundImage
        : `${BASE_URL}${data.backgroundImage}`;

      wrap.style.backgroundImage = `url('${bgUrl}')`;
      wrap.style.backgroundSize = "cover";
      wrap.style.backgroundPosition = "center";
      wrap.style.backgroundRepeat = "no-repeat";
    }

    // ✅ Populate dropdown services
    if (serviceSel && Array.isArray(data.services)) {
      serviceSel.innerHTML = ""; // Clear previous options
      data.services.forEach((service) => {
        const opt = document.createElement("option");
        opt.value = service;
        opt.textContent = service;
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
