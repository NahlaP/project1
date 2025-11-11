



// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
// import { api } from "../../lib/api";

// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
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
//       // 3) Fallback to legacy default
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => { off = true; };
//   }, [userId]);
//   return tpl;
// }

// export default function ServicesPagePreview() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [servicesDoc, setServicesDoc] = useState({ services: [] });

//   // presign any S3 key via backend
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json().catch(() => ({}));
//       return json?.url || json?.signedUrl || "";
//     } catch {
//       return "";
//     }
//   };

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`
//         );
//         const doc = (await res.json()) || { services: [] };

//         // build displayUrl per service item
//         const services = await Promise.all(
//           (doc.services || []).map(async (item) => {
//             // prefer absolute URL
//             if (item.imageUrl && /^https?:\/\//i.test(item.imageUrl)) {
//               return { ...item, displayUrl: item.imageUrl };
//             }
//             // if backend returned only a key (imageKey or relative imageUrl), presign it
//             const key =
//               item.imageKey ||
//               (item.imageUrl && !/^https?:\/\//i.test(item.imageUrl)
//                 ? item.imageUrl
//                 : "");
//             if (key) {
//               const url = await getSignedUrlFor(key);
//               return { ...item, displayUrl: url || "" };
//             }
//             return { ...item, displayUrl: "" };
//           })
//         );

//         setServicesDoc({ ...doc, services });
//       } catch (e) {
//         console.error("❌ Failed to fetch services", e);
//         setServicesDoc({ services: [] });
//       }
//     })();
//   }, [userId, templateId]);

//   // Only show two items in the compact preview card
//   const items = useMemo(
//     () => (servicesDoc.services || []).slice(0, 2),
//     [servicesDoc.services]
//   );

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//         padding: "20px",
//       }}
//     >
//       {/* Left: Services Grid */}
//       <div
//         className="d-flex flex-wrap gap-3"
//         style={{ width: "70%", height: "100%", overflowY: "auto" }}
//       >
//         {items.map((item) => (
//           <div
//             key={item._id || item.title}
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             {item.displayUrl ? (
//               <img
//                 src={item.displayUrl}
//                 alt={item.title || "Service"}
//                 style={{
//                   width: "100%",
//                   height: "100px",
//                   objectFit: "cover",
//                   borderRadius: "8px",
//                   marginBottom: "8px",
//                 }}
//               />
//             ) : null}

//             <h6 className="fw-bold mb-1">{item.title || "Service Title"}</h6>
//             <p className="small mb-1 text-muted">
//               {item.description || "Service description..."}
//             </p>
//             {item.buttonText && (
//               <a
//                 href={item.buttonHref || "#"}
//                 className="btn btn-outline-primary btn-sm mt-auto"
//               >
//                 {item.buttonText}
//               </a>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Right: placeholder column for symmetry */}
//       <div
//         className="d-flex align-items-end justify-content-end flex-column ps-3"
//         style={{ width: "30%" }}
//       />
//     </div>
//   );
// }

















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* Which fields exist per template (preview will only render these) */
const SERVICES_PROFILES = {
  "sir-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: false,
      buttonText: false,
      buttonHref: false,
    },
  },
  "gym-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: true,
      buttonText: true,
      buttonHref: true,
    },
  },
};

const ABS = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS.test(u);

/** Ask backend to presign an S3 key (or relative path) */
async function presign(key) {
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

export default function ServicesPagePreview() {
  const { userId, templateId } = useIonContext();
  const allowed =
    (templateId && SERVICES_PROFILES[templateId]?.fields) ||
    SERVICES_PROFILES["gym-template-1"].fields; // safe default

  const [servicesDoc, setServicesDoc] = useState({ services: [] });

  // fetch services for current user/template (cookie-auth)
  useEffect(() => {
    if (!userId || !templateId) return;
    let off = false;

    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/services/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
          { credentials: "include", cache: "no-store" }
        );
        const doc = (await res.json().catch(() => ({}))) || { services: [] };
        const items = Array.isArray(doc.services) ? doc.services : [];

        // build displayUrl respecting template’s fields
        const withUrls = await Promise.all(
          items.map(async (it) => {
            if (!allowed.imageUrl) return { ...it, displayUrl: "" };
            if (it.imageUrl && isAbs(it.imageUrl)) return { ...it, displayUrl: it.imageUrl };
            const key =
              it.imageKey ||
              (it.imageUrl && !isAbs(it.imageUrl) ? it.imageUrl : "");
            const url = key ? await presign(key) : "";
            return { ...it, displayUrl: url };
          })
        );

        if (!off) setServicesDoc({ services: withUrls });
      } catch (e) {
        if (!off) setServicesDoc({ services: [] });
        console.error("❌ servicesE preview fetch failed:", e);
      }
    })();

    return () => {
      off = true;
    };
  }, [userId, templateId, allowed.imageUrl]);

  // compact card: show first 2
  const items = useMemo(
    () => (servicesDoc.services || []).slice(0, 2),
    [servicesDoc.services]
  );

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Left: two-tile preview grid */}
      <div
        className="d-flex flex-wrap gap-3"
        style={{ width: "70%", height: "100%", overflowY: "auto" }}
      >
        {items.map((item, idx) => (
          <div
            key={item._id || `${item.title || "svc"}-${idx}`}
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
            }}
          >
            {allowed.imageUrl && item.displayUrl ? (
              <img
                src={item.displayUrl}
                alt={item.title || "Service"}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              />
            ) : null}

            <h6 className="fw-bold mb-1">{item.title || "Service Title"}</h6>

            {allowed.description && (
              <p className="small mb-1 text-muted">
                {item.description || "Service description..."}
              </p>
            )}

            {allowed.buttonText && item.buttonText ? (
              <a
                href={allowed.buttonHref ? (item.buttonHref || "#") : "#"}
                className="btn btn-outline-primary btn-sm mt-auto"
              >
                {item.buttonText}
              </a>
            ) : null}
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-muted small">No services yet.</div>
        )}
      </div>

      {/* Right spacer for symmetry (keeps card sizes consistent with others) */}
      <div
        className="d-flex align-items-end justify-content-end flex-column ps-3"
        style={{ width: "30%" }}
      />
    </div>
  );
}
