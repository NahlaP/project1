

// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// /** Resolve templateId in this order:
//  *  1) ?templateId=… in URL
//  *  2) backend-selected template for the user
//  *  3) config fallback (legacy)
//  */
// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL param
//       const sp =
//         typeof window !== "undefined"
//           ? new URLSearchParams(window.location.search)
//           : null;
//       const fromUrl = sp?.get("templateId")?.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl);
//         return;
//       }
//       // 2) Backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}
//       // 3) Fallback
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);
//   return tpl;
// }

// // Helper to presign S3 key via backend
// async function presignKey(key) {
//   if (!key) return "";
//   try {
//     const res = await fetch(
//       `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//     );
//     const json = await res.json().catch(() => ({}));
//     return json?.url || json?.signedUrl || "";
//   } catch {
//     return "";
//   }
// }

// export default function TestimonialPreview() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [testimonials, setTestimonials] = useState([]);

//   const displayUrlFor = useMemo(
//     () => async (t) => {
//       // Full URL already?
//       if (t?.imageUrl && /^https?:\/\//i.test(t.imageUrl)) return t.imageUrl;

//       // S3 key present? (imageKey OR non-absolute imageUrl)
//       const key =
//         t?.imageKey ||
//         (t?.imageUrl && !/^https?:\/\//i.test(t.imageUrl) ? t.imageUrl : "");

//       if (key) {
//         const url = await presignKey(key);
//         if (url) return url;
//       }

//       // Legacy /uploads
//       if (
//         typeof t?.imageUrl === "string" &&
//         t.imageUrl.startsWith("/uploads/")
//       ) {
//         return `${backendBaseUrl}${t.imageUrl}`;
//       }
//       return "";
//     },
//     []
//   );

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/testimonial/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(templateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const data = await res.json().catch(() => null);

//         // ✅ Accept both shapes: [] or { items: [] }
//         const arr = Array.isArray(data)
//           ? data
//           : Array.isArray(data?.items)
//           ? data.items
//           : [];

//         const withUrls = await Promise.all(
//           arr.map(async (t) => ({
//             ...t,
//             displayUrl: await displayUrlFor(t),
//           }))
//         );
//         setTestimonials(withUrls);
//       } catch (e) {
//         console.error("❌ Failed to fetch testimonials", e);
//         setTestimonials([]);
//       }
//     })();
//   }, [templateId, userId, displayUrlFor]);

//   const first = testimonials[0];

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//       }}
//     >
//       {/* Left: Client Image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: first?.displayUrl
//             ? `url(${first.displayUrl})`
//             : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {!first?.displayUrl && (
//           <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Right: Testimonial Content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <h5 className="fw-bold text-uppercase mb-2">What Clients Say</h5>

//         {first ? (
//           <>
//             <strong className="text-uppercase">{first.name}</strong>
//             <small className="text-muted mb-2">{first.profession}</small>
//             <p className="mb-2">{first.message}</p>
//             <div className="text-warning mb-2">
//               {Array.from({
//                 length: Math.max(0, Math.min(5, first.rating || 5)),
//               }).map((_, i) => (
//                 <i className="fas fa-star" key={i}></i>
//               ))}
//             </div>
//           </>
//         ) : (
//           <p className="text-muted">No testimonials available.</p>
//         )}
//       </div>
//     </div>
//   );
// }












// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// /** Resolve templateId in this order:
//  *  1) ?templateId=… in URL
//  *  2) backend-selected template for the user
//  *  3) config fallback (legacy)
//  */
// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL param
//       const sp =
//         typeof window !== "undefined"
//           ? new URLSearchParams(window.location.search)
//           : null;
//       const fromUrl = sp?.get("templateId")?.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl);
//         return;
//       }
//       // 2) Backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}
//       // 3) Fallback
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);
//   return tpl;
// }

// // small helpers
// const ABS = /^https?:\/\//i;
// const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number(n || 0)));
// const normArr = (data) =>
//   Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

// // Helper to presign S3 key via backend
// async function presignKey(key) {
//   if (!key) return "";
//   try {
//     const res = await fetch(
//       `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`,
//       { credentials: "include", cache: "no-store" }
//     );
//     const json = await res.json().catch(() => ({}));
//     return json?.url || json?.signedUrl || "";
//   } catch {
//     return "";
//   }
// }

// export default function TestimonialPreview() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [testimonials, setTestimonials] = useState([]);

//   const displayUrlFor = useMemo(
//     () => async (t) => {
//       // Full URL already?
//       if (t?.imageUrl && ABS.test(t.imageUrl)) return t.imageUrl;

//       // S3 key present? (imageKey OR non-absolute imageUrl)
//       const key =
//         t?.imageKey ||
//         (t?.imageUrl && !ABS.test(t.imageUrl) ? t.imageUrl : "");

//       if (key) {
//         const url = await presignKey(key);
//         if (url) return url;
//       }

//       // Legacy /uploads
//       if (typeof t?.imageUrl === "string" && t.imageUrl.startsWith("/uploads/")) {
//         return `${backendBaseUrl}${t.imageUrl}`;
//       }
//       return "";
//     },
//     []
//   );

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/testimonial/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
//           { headers: { Accept: "application/json" }, credentials: "include", cache: "no-store" }
//         );
//         const data = await res.json().catch(() => null);
//         const arr = normArr(data);

//         const withUrls = await Promise.all(
//           arr.map(async (t) => ({
//             ...t,
//             displayUrl: await displayUrlFor(t),
//             rating: clamp(t?.rating, 0, 5),
//           }))
//         );
//         setTestimonials(withUrls);
//       } catch (e) {
//         console.error("❌ Failed to fetch testimonials", e);
//         setTestimonials([]);
//       }
//     })();
//   }, [templateId, userId, displayUrlFor]);

//   const first = testimonials[0];

//   const goEdit = () => {
//     const q = new URLSearchParams({ templateId: String(templateId || "") });
//     router.push(`/editorpages/testimonialS?${q}`);
//   };

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//       }}
//     >
//       {/* Left: Client Image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: first?.displayUrl ? `url(${first.displayUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {!first?.displayUrl && (
//           <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Right: Testimonial Content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <div className="d-flex justify-content-between align-items-start mb-2">
//           <h5 className="fw-bold text-uppercase mb-0">What Clients Say</h5>
//           <button
//             type="button"
//             onClick={goEdit}
//             className="btn btn-outline-dark btn-sm"
//             title="Edit Testimonials"
//           >
//             ✏️ Edit
//           </button>
//         </div>

//         {first ? (
//           <>
//             <strong className="text-uppercase">{first.name || "Client Name"}</strong>
//             <small className="text-muted mb-2">
//               {first.profession || first.role || ""}
//             </small>
//             <p className="mb-2">{first.message || ""}</p>
//             <div className="text-warning mb-2">
//               {Array.from({ length: first.rating || 0 }).map((_, i) => (
//                 <i className="fas fa-star" key={`f-${i}`}></i>
//               ))}
//               {Array.from({ length: Math.max(0, 5 - (first.rating || 0)) }).map(
//                 (_, i) => (
//                   <i className="far fa-star" key={`e-${i}`}></i>
//                 )
//               )}
//             </div>
//             {testimonials.length > 1 && (
//               <small className="text-muted">
//                 +{testimonials.length - 1} more testimonial
//                 {testimonials.length - 1 > 1 ? "s" : ""}
//               </small>
//             )}
//           </>
//         ) : (
//           <p className="text-muted">No testimonials available.</p>
//         )}
//       </div>
//     </div>
//   );
// }




















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ---------------- helpers ---------------- */
const ABS = /^https?:\/\//i;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number(n || 0)));
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(
    String(url || "")
  );
const bust = (url) =>
  !url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

const normArr = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

// Presign any S3 key via backend (supports {url} or {signedUrl})
async function presignKey(key) {
  if (!key) return "";
  try {
    const r = await fetch(
      `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`,
      { credentials: "include", cache: "no-store" }
    );
    const j = await r.json().catch(() => ({}));
    return j?.url || j?.signedUrl || "";
  } catch {
    return "";
  }
}

export default function TestimonialPreview() {
  const router = useRouter();
  const { userId, templateId } = useIonContext(); // ✅ single source of truth

  const [items, setItems] = useState([]);

  const displayUrlFor = useMemo(
    () => async (t) => {
      // Already a full URL?
      if (t?.imageUrl && ABS.test(t.imageUrl)) return bust(t.imageUrl);

      // S3 key present? (imageKey OR non-absolute imageUrl)
      const key =
        t?.imageKey ||
        (t?.imageUrl && !ABS.test(t.imageUrl) ? String(t.imageUrl) : "");

      if (key) {
        const url = await presignKey(key);
        if (url) return bust(url);
      }

      // Legacy /uploads path from backend
      if (typeof t?.imageUrl === "string" && t.imageUrl.startsWith("/uploads/")) {
        return bust(`${backendBaseUrl}${t.imageUrl}`);
      }

      return "";
    },
    []
  );

  useEffect(() => {
    if (!userId || !templateId) return;

    let off = false;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/testimonial/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
          { headers: { Accept: "application/json" }, credentials: "include", cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        const arr = normArr(data);

        const withUrls = await Promise.all(
          arr.map(async (t) => ({
            ...t,
            rating: clamp(t?.rating, 0, 5),
            displayUrl: await displayUrlFor(t),
            _id: t._id || t.id,
          }))
        );

        if (!off) setItems(withUrls);
      } catch (e) {
        if (!off) setItems([]);
        console.error("❌ Failed to fetch testimonials", e);
      }
    })();

    return () => {
      off = true;
    };
  }, [userId, templateId, displayUrlFor]);

  const first = items[0];

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/testimonialS?${q.toString()}`);
  };

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Left: Client Image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: first?.displayUrl ? `url(${first.displayUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        {!first?.displayUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="fw-bold text-uppercase mb-0">What Clients Say</h5>
          <button
            type="button"
            onClick={goEdit}
            className="btn btn-outline-dark btn-sm"
            title="Edit Testimonials"
          >
            ✏️ Edit
          </button>
        </div>

        {first ? (
          <>
            <div className="text-muted small mb-1">
              template: <code>{templateId || "…"}</code>
            </div>
            <strong className="text-uppercase">
              {first.name || "Client Name"}
            </strong>
            <small className="text-muted mb-2 d-block">
              {first.profession || first.role || ""}
            </small>
            <p className="mb-2">{first.message || ""}</p>
            <div className="text-warning mb-2">
              {Array.from({ length: first.rating || 0 }).map((_, i) => (
                <i className="fas fa-star" key={`f-${i}`}></i>
              ))}
              {Array.from({ length: Math.max(0, 5 - (first.rating || 0)) }).map(
                (_, i) => (
                  <i className="far fa-star" key={`e-${i}`}></i>
                )
              )}
            </div>
            {items.length > 1 && (
              <small className="text-muted">
                +{items.length - 1} more testimonial
                {items.length - 1 > 1 ? "s" : ""}
              </small>
            )}
          </>
        ) : (
          <>
            <div className="text-muted small mb-1">
              template: <code>{templateId || "…"}</code>
            </div>
            <p className="text-muted">No testimonials available.</p>
          </>
        )}
      </div>
    </div>
  );
}
