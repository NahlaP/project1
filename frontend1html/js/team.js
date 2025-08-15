// document.addEventListener("DOMContentLoaded", loadTeamSection);

// async function loadTeamSection() {
//   const API = "http://localhost:5000/api/team";
//   const userId = "demo-user";
//   const templateId = "gym-template-1";
//   const wrapper = document.querySelector(".team .row");

//   try {
//     const res = await fetch(`${API}/${userId}/${templateId}`);
//     const data = await res.json();

//     wrapper.innerHTML = "";

//     data.forEach((member, index) => {
//       const delay = 0.3 + index * 0.1;
//       const socials = member.socials || {};

//       const col = document.createElement("div");
//       col.className = `col-lg-3 col-md-6 wow fadeInUp`;
//       col.setAttribute("data-wow-delay", `${delay.toFixed(1)}s`);

//       // ✅ Fix image URL here
//       const imageUrl = member.imageUrl
//         ? `http://localhost:5000${member.imageUrl}`
//         : "/img/default.jpg";

//       col.innerHTML = `
//         <div class="team-item">
//           <div class="position-relative overflow-hidden">
//             <img class="img-fluid w-100" src="${imageUrl}" alt="${member.name}">
//             <div class="team-social">
//               ${socials.facebook ? `<a class="btn btn-square btn-dark mx-1" href="${socials.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ""}
//               ${socials.twitter ? `<a class="btn btn-square btn-dark mx-1" href="${socials.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ""}
//               ${socials.linkedin ? `<a class="btn btn-square btn-dark mx-1" href="${socials.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ""}
//               ${socials.youtube ? `<a class="btn btn-square btn-dark mx-1" href="${socials.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ""}
//             </div>
//           </div>
//           <div class="text-center p-4">
//             <h5 class="mb-1">${member.name}</h5>
//             <span>${member.role}</span>
//           </div>
//         </div>
//       `;

//       wrapper.appendChild(col);
//     });
//   } catch (err) {
//     console.error("❌ Failed to load team members:", err);
//   }
// }


document.addEventListener("DOMContentLoaded", loadTeamSection);

async function loadTeamSection() {
  const userId = "demo-user";
  const templateId = "gym-template-1";

  // Same-origin path → Vercel rewrites to EC2
  const API = `/api/team/${userId}/${templateId}`;

  // Try common wrappers: ".team .row" (your template) or a fallback id
  const wrapper =
    document.querySelector(".team .row") ||
    document.getElementById("team-wrapper");
  if (!wrapper) return;

  try {
    const res = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    const members = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

    wrapper.innerHTML = "";

    members.forEach((member, index) => {
      const delay = (0.3 + index * 0.1).toFixed(1);
      const socials = member?.socials || {};

      const col = document.createElement("div");
      col.className = "col-lg-3 col-md-6 wow fadeInUp";
      col.setAttribute("data-wow-delay", `${delay}s`);

      const imgRel = normalizeImageUrl(member?.imageUrl || "");
      const imgSrc = withCacheBuster(
        imgRel || "/img/team-placeholder.jpg",
        member?.updatedAt ? new Date(member.updatedAt).getTime() : Date.now()
      );

      col.innerHTML = `
        <div class="team-item bg-light">
          <div class="position-relative overflow-hidden">
            <img class="img-fluid w-100"
                 src="${imgSrc}"
                 alt="${escapeHtml(member?.name || "Member")}"
                 onerror="this.src='/img/team-placeholder.jpg'">
            <div class="team-social">
              ${socialLink(socials.facebook, "fab fa-facebook-f")}
              ${socialLink(socials.twitter, "fab fa-twitter")}
              ${socialLink(socials.linkedin, "fab fa-linkedin-in")}
              ${socialLink(socials.youtube, "fab fa-youtube")}
            </div>
          </div>
          <div class="text-center p-4">
            <h5 class="mb-1">${escapeHtml(member?.name || "")}</h5>
            <span>${escapeHtml(member?.role || "")}</span>
          </div>
        </div>
      `;

      wrapper.appendChild(col);
    });
  } catch (err) {
    console.error("❌ Failed to load team members:", err);
  }
}

/* ---------------- helpers ---------------- */

function normalizeImageUrl(url) {
  if (!url) return "";
  // If absolute and points to /uploads/*, make it relative so it passes Vercel proxy
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/uploads/")) {
        return `${u.pathname}${u.search || ""}`; // -> "/uploads/..."
      }
      return url; // external HTTPS (e.g., S3) is fine
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

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

function normalizeUrl(u) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function socialLink(url, iconClass) {
  if (!url) return "";
  const safe = normalizeUrl(url);
  return `<a class="btn btn-square btn-dark mx-1" href="${safe}" target="_blank" rel="noopener">
            <i class="${iconClass}"></i>
          </a>`;
}
