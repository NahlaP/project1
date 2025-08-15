
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


// const userId = "demo-user";
// const templateId = "gym-template-1";
// const backendBaseUrl = "https://project1backend-2xvq.onrender.com"; // ✅ LIVE backend

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


document.addEventListener("DOMContentLoaded", initHero);

async function initHero() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin path -> Vercel rewrites to EC2
  const API = `/api/hero/${userId}/${templateId}`;

  const titleEl = byId("hero-title");
  const imgEl = byId("hero-image");

  try {
    const res = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) || {};

    // Title (support multiple possible field names)
    const title =
      data.title ??
      data.content ??   // some backends use "content"
      data.heading ??   // or "heading"
      "";

    if (titleEl && title) {
      titleEl.textContent = title;
    }

    // Image
    const imageUrlRaw = data.imageUrl ?? data.image?.url ?? "";
    if (imgEl && imageUrlRaw) {
      const relOrAbs = normalizeImageUrl(imageUrlRaw);
      const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
      const src = withCacheBuster(relOrAbs, version);

      imgEl.src = src;
      imgEl.alt = data.imageAlt || "Hero Image";

      // Styling (keep your existing behavior)
      imgEl.style.width = "100%";
      imgEl.style.height = "100vh";
      imgEl.style.objectFit = "cover";
      imgEl.loading = "eager";
      imgEl.decoding = "async";
    }
  } catch (err) {
    console.error("❌ Failed to load hero section:", err);
    if (titleEl && !titleEl.textContent) titleEl.textContent = "Welcome!";
  }
}

function byId(id) {
  return document.getElementById(id);
}

// Convert absolute http(s) URLs that point to /uploads/* into relative paths
// so they pass through the Vercel proxy. Leave external HTTPS (e.g., S3) as-is.
function normalizeImageUrl(url) {
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/uploads/")) {
        return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
      }
      return url; // keep external (must be HTTPS)
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
