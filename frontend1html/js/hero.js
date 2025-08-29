


// document.addEventListener("DOMContentLoaded", initHero);

// async function initHero() {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";

//   // Same-origin path -> Vercel rewrites to EC2
//   const API = `/api/hero/${userId}/${templateId}`;

//   const titleEl = byId("hero-title");
//   const imgEl = byId("hero-image");

//   try {
//     const res = await fetch(API, {
//       cache: "no-store",
//       headers: { Accept: "application/json" }
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = (await res.json()) || {};

//     // Title (support multiple possible field names)
//     const title =
//       data.title ??
//       data.content ??   // some backends use "content"
//       data.heading ??   // or "heading"
//       "";

//     if (titleEl && title) {
//       titleEl.textContent = title;
//     }

//     // Image
//     const imageUrlRaw = data.imageUrl ?? data.image?.url ?? "";
//     if (imgEl && imageUrlRaw) {
//       const relOrAbs = normalizeImageUrl(imageUrlRaw);
//       const version = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
//       const src = withCacheBuster(relOrAbs, version);

//       imgEl.src = src;
//       imgEl.alt = data.imageAlt || "Hero Image";

//       // Styling (keep your existing behavior)
//       imgEl.style.width = "100%";
//       imgEl.style.height = "100vh";
//       imgEl.style.objectFit = "cover";
//       imgEl.loading = "eager";
//       imgEl.decoding = "async";
//     }
//   } catch (err) {
//     console.error("❌ Failed to load hero section:", err);
//     if (titleEl && !titleEl.textContent) titleEl.textContent = "Welcome!";
//   }
// }

// function byId(id) {
//   return document.getElementById(id);
// }

// // Convert absolute http(s) URLs that point to /uploads/* into relative paths
// // so they pass through the Vercel proxy. Leave external HTTPS (e.g., S3) as-is.
// function normalizeImageUrl(url) {
//   if (!url) return null;

//   if (/^https?:\/\//i.test(url)) {
//     try {
//       const u = new URL(url);
//       if (u.pathname.startsWith("/uploads/")) {
//         return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
//       }
//       return url; // keep external (must be HTTPS)
//     } catch {
//       return url;
//     }
//   }

//   // Already relative (e.g., "/uploads/...") — perfect
//   return url;
// }

// function withCacheBuster(url, version) {
//   if (!url) return url;
//   const sep = url.includes("?") ? "&" : "?";
//   return `${url}${sep}v=${encodeURIComponent(version)}`;
// }





// frontend1html/js/hero.js
document.addEventListener("DOMContentLoaded", initHero);

async function initHero() {
  const userId = "demo-user";
  const templateId = "gym-template-1";
  const API = `/api/hero/${userId}/${templateId}`;

  const titleEl = byId("hero-title");
  const imgEl   = byId("hero-image");

  try {
    const res = await fetch(API, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("Hero API:", data); // <-- see exactly what backend returns

    // Title
    const title = data.title ?? data.content ?? data.heading ?? "";
    if (titleEl && title) titleEl.textContent = title;

    // Image (handle plain cPanel URL or presigned S3 that embeds a URL)
    const raw = data.imageUrl ?? data.image?.url ?? "";
    const clean = unwrapIfPresigned(raw); // <- turns long S3 link into https://sogimchurch.com/...
    if (imgEl && clean) {
      imgEl.src = withCacheBuster(clean);
      imgEl.alt = data.imageAlt || "Hero Image";
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

function byId(id) { return document.getElementById(id); }

// If backend accidentally returns a presigned S3 URL that *contains* a percent-encoded URL,
// extract and decode it (so we end up with https://sogimchurch.com/assets/img/xxx.jpg).
function unwrapIfPresigned(u) {
  if (!u) return u;
  // quick accept: if it's already a normal https URL to sogimchurch, keep it
  if (/^https?:\/\/sogimchurch\.com\//i.test(u)) return u;

  const i = u.indexOf(".amazonaws.com/");
  if (i !== -1) {
    const tail = u.slice(i + ".amazonaws.com/".length);
    try {
      const decoded = decodeURIComponent(tail);
      if (/^https?:\/\//i.test(decoded)) return decoded;
    } catch (_) {}
  }
  return u;
}

function withCacheBuster(url) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}
