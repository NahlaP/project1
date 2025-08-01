
// const userId = "demo-user";
// const templateId = "gym-template-1";
// const backendBaseUrl = "http://localhost:5000";

// fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`)
//   .then((res) => res.json())
//   .then((data) => {
//     const { content, imageUrl } = data;

//     // Update title
//     const heroTitleEl = document.getElementById("hero-title");
//     if (content && heroTitleEl) {
//       heroTitleEl.innerText = content;
//     }

//     // Update image
//     const heroImageEl = document.getElementById("hero-image");
//     if (imageUrl && heroImageEl) {
//       const fullImageUrl = imageUrl.startsWith("http")
//         ? imageUrl
//         : `${backendBaseUrl}${imageUrl}`;
//       heroImageEl.src = fullImageUrl;

//       heroImageEl.style.width = "100%";
//       heroImageEl.style.height = "100vh";
//       heroImageEl.style.objectFit = "cover";
//     }
//   })
//   .catch((err) => {
//     console.error("❌ Failed to load hero section:", err);
//     const fallback = document.getElementById("hero-title");
//     if (fallback) fallback.innerText = "Welcome!";
//   });


const userId = "demo-user";
const templateId = "gym-template-1";
const backendBaseUrl = "https://project1backend-2xvq.onrender.com"; // ✅ LIVE backend

fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`)
  .then((res) => res.json())
  .then((data) => {
    const { content, imageUrl } = data;

    // Update title
    const heroTitleEl = document.getElementById("hero-title");
    if (content && heroTitleEl) {
      heroTitleEl.innerText = content;
    }

    // Update image
    const heroImageEl = document.getElementById("hero-image");
    if (imageUrl && heroImageEl) {
      const fullImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${backendBaseUrl}${imageUrl}`;
      heroImageEl.src = fullImageUrl;

      heroImageEl.style.width = "100%";
      heroImageEl.style.height = "100vh";
      heroImageEl.style.objectFit = "cover";
    }
  })
  .catch((err) => {
    console.error("❌ Failed to load hero section:", err);
    const fallback = document.getElementById("hero-title");
    if (fallback) fallback.innerText = "Welcome!";
  });
