// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const API_BASE = "http://localhost:5000";               // <— prefix for images
//   const RES_URL  = `${API_BASE}/api/services/${userId}/${templateId}`;

//   try {
//     const res = await fetch(RES_URL);
//     const data = await res.json();
//     if (!data || !data.services) return;

//     const container = document.getElementById("service-wrapper");
//     const title = document.getElementById("service-title");

//     if (title) title.textContent = "Reliable & High-Quality Welding Services";
//     if (!container) return;

//     // Clear old nodes if you hot-reload
//     container.innerHTML = "";

//     data.services
//       .slice()
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .forEach((item, index) => {
//         const col = document.createElement("div");
//         col.className = "col-lg-3 col-md-6 wow fadeInUp";
//         col.setAttribute("data-wow-delay", item.delay || `0.${index + 1}s`);

//         const imgSrc = item.imageUrl
//           ? `${API_BASE}${item.imageUrl}?t=${Date.now()}` // cache-bust
//           : "/img/service-placeholder.jpg"; // fallback if you want

//         col.innerHTML = `
//           <div class="service-item">
//             <div class="service-inner pb-5">
//               <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || ''}">
//               <div class="service-text px-5 pt-4">
//                 <h5 class="text-uppercase">${item.title || ""}</h5>
//                 <p>${item.description || ""}</p>
//               </div>
//               <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
//                 ${item.buttonText || "Read More"}
//                 <i class="bi bi-chevron-double-right ms-1"></i>
//               </a>
//             </div>
//           </div>`;
//         container.appendChild(col);
//       });
//   } catch (e) {
//     console.error("❌ Could not load services:", e);
//   }
// });
document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";
  const API_BASE = "http://localhost:5000";
  const RES_URL = `${API_BASE}/api/services/${userId}/${templateId}`;

  try {
    const res = await fetch(RES_URL);
    const data = await res.json();

    if (!data || !Array.isArray(data.services)) return;

    const container = document.getElementById("service-wrapper");
    const title = document.getElementById("service-title");

    if (title) {
      title.textContent = "Reliable & High-Quality Welding Services";
    }

    if (!container) return;
    container.innerHTML = ""; // Clear previous nodes

    data.services
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((item, index) => {
        const col = document.createElement("div");
        col.className = "col-lg-3 col-md-6 wow fadeInUp";
        col.setAttribute("data-wow-delay", item.delay || `0.${index + 1}s`);

        const imgSrc = item.imageUrl
          ? `${API_BASE}${item.imageUrl}?t=${Date.now()}`
          : "/img/service-placeholder.jpg"; // fallback image

        col.innerHTML = `
          <div class="service-item">
            <div class="service-inner pb-5">
              <img class="img-fluid w-100" src="${imgSrc}" alt="${item.title || 'Service Image'}">
              <div class="service-text px-5 pt-4">
                <h5 class="text-uppercase">${item.title || "Untitled"}</h5>
                <p>${item.description || "No description available."}</p>
              </div>
              <a class="btn btn-light px-3" href="${item.buttonHref || "#"}">
                ${item.buttonText || "Read More"}
                <i class="bi bi-chevron-double-right ms-1"></i>
              </a>
            </div>
          </div>`;
          
        container.appendChild(col);
      });
  } catch (error) {
    console.error("❌ Could not load services:", error);
  }
});
