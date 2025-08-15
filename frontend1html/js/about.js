
// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const BACKEND = `http://localhost:5000/api/about/${userId}/${templateId}`;

//   try {
//     const res = await fetch(BACKEND);
//     const about = await res.json();
//     if (!about) return;

//     // Grab elements once
//     const titleEl = document.getElementById("about-title");
//     const descEl = document.getElementById("about-desc");
//     const highlightEl = document.getElementById("about-highlight");
//     const imgEl = document.getElementById("about-img");
//     const bulletsWrap = document.getElementById("about-bullets");

//     // Basic info
//     titleEl.textContent = about.title || "About Title";
//     descEl.textContent = about.description || "";
//     highlightEl.textContent = about.highlight || "";

//     // Image  (make sure /uploads is served statically from backend)
//     if (about.imageUrl && imgEl) {
//       // ensure it’s absolute to your backend and cache-bust
//       const src =
//         (about.imageUrl.startsWith("http")
//           ? about.imageUrl
//           : `http://localhost:5000${about.imageUrl}`) + `?t=${Date.now()}`;
//       imgEl.src = src;
//       imgEl.alt = about.imageAlt || "About Image";
//     }

//     // Bullets
//     bulletsWrap.innerHTML = "";
//     (about.bullets || []).forEach((b) => {
//       const col = document.createElement("div");
//       col.className = "col-sm-6";
//       col.innerHTML = `
//         <div class="d-flex align-items-center">
//           <div class="flex-shrink-0 btn-xl-square bg-light me-3">
//             <i class="fa fa-check-square fa-2x text-primary"></i>
//           </div>
//           <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
//         </div>`;
//       bulletsWrap.appendChild(col);
//     });
//   } catch (e) {
//     console.error("❌ Failed to load about:", e);
//   }
// });


// document.addEventListener("DOMContentLoaded", async () => {
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const backendUrl = "https://project1backend-2xvq.onrender.com";

//   const BACKEND = `${backendUrl}/api/about/${userId}/${templateId}`;

//   try {
//     const res = await fetch(BACKEND);
//     const about = await res.json();
//     if (!about) return;

//     // Grab elements once
//     const titleEl = document.getElementById("about-title");
//     const descEl = document.getElementById("about-desc");
//     const highlightEl = document.getElementById("about-highlight");
//     const imgEl = document.getElementById("about-img");
//     const bulletsWrap = document.getElementById("about-bullets");

//     // Basic info
//     if (titleEl) titleEl.textContent = about.title || "About Title";
//     if (descEl) descEl.textContent = about.description || "";
//     if (highlightEl) highlightEl.textContent = about.highlight || "";

//     // Image
//     if (about.imageUrl && imgEl) {
//       const src = (about.imageUrl.startsWith("http")
//         ? about.imageUrl
//         : `${backendUrl}${about.imageUrl}`) + `?t=${Date.now()}`;
//       imgEl.src = src;
//       imgEl.alt = about.imageAlt || "About Image";
//     }

//     // Bullets
//     if (bulletsWrap) {
//       bulletsWrap.innerHTML = "";
//       (about.bullets || []).forEach((b) => {
//         const col = document.createElement("div");
//         col.className = "col-sm-6";
//         col.innerHTML = `
//           <div class="d-flex align-items-center">
//             <div class="flex-shrink-0 btn-xl-square bg-light me-3">
//               <i class="fa fa-check-square fa-2x text-primary"></i>
//             </div>
//             <h5 class="lh-base text-uppercase mb-0">${b.text}</h5>
//           </div>`;
//         bulletsWrap.appendChild(col);
//       });
//     }
//   } catch (e) {
//     console.error("❌ Failed to load about:", e);
//   }
// });








document.addEventListener("DOMContentLoaded", async () => {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Build endpoint via same-origin path -> Vercel rewrites to EC2
  const BACKEND = `/api/about/${userId}/${templateId}`;

  // --- Helpers ---
  const $ = (id) => document.getElementById(id);

  const normalizeImageUrl = (url) => {
    if (!url) return null;

    if (/^https?:\/\//i.test(url)) {
      try {
        const u = new URL(url);
        // If backend sent something like http://3.109.207.179/uploads/...
        // return just the pathname so it becomes "/uploads/..."
        if (u.pathname.startsWith("/uploads/")) {
          return `${u.pathname}${u.search || ""}`;
        }
        return url; // S3 or other external absolute URL is fine (must be HTTPS)
      } catch {
        return url;
      }
    }

    // Already relative (e.g., "/uploads/...") — perfect
    return url;
  };

  const withCacheBuster = (url, version) => {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${encodeURIComponent(version)}`;
  };

  try {
    const res = await fetch(BACKEND, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error(`About fetch failed: HTTP ${res.status}`);
    }

    const about = await res.json();
    if (!about) return;

    // Grab elements once
    const titleEl = $("about-title");
    const descEl = $("about-desc");
    const highlightEl = $("about-highlight");
    const imgEl = $("about-img");
    const bulletsWrap = $("about-bullets");

    // Basic info
    if (titleEl) titleEl.textContent = about.title || "About Title";
    if (descEl) descEl.textContent = about.description || "";
    if (highlightEl) highlightEl.textContent = about.highlight || "";

    // Image
    if (imgEl && about.imageUrl) {
      const relOrAbs = normalizeImageUrl(about.imageUrl);
      const version =
        about.updatedAt ? new Date(about.updatedAt).getTime() : Date.now();
      const imgSrc = withCacheBuster(relOrAbs, version);

      imgEl.src = imgSrc;
      imgEl.alt = about.imageAlt || "About Image";
      // Optional: ensure image renders if hidden by default styles
      imgEl.loading = "eager";
      imgEl.decoding = "async";
    }

    // Bullets
    if (bulletsWrap) {
      bulletsWrap.innerHTML = "";

      const bullets = Array.isArray(about.bullets) ? about.bullets : [];
      bullets.forEach((b) => {
        const text = typeof b === "string" ? b : (b?.text ?? "");
        if (!text) return;

        const col = document.createElement("div");
        col.className = "col-sm-6";
        col.innerHTML = `
          <div class="d-flex align-items-center">
            <div class="flex-shrink-0 btn-xl-square bg-light me-3">
              <i class="fa fa-check-square fa-2x text-primary"></i>
            </div>
            <h5 class="lh-base text-uppercase mb-0">${text}</h5>
          </div>`;
        bulletsWrap.appendChild(col);
      });
    }
  } catch (e) {
    console.error("❌ Failed to load about:", e);
    // Optional: show a simple fallback UI
    const titleEl = document.getElementById("about-title");
    if (titleEl && !titleEl.textContent) {
      titleEl.textContent = "About";
    }
  }
});
