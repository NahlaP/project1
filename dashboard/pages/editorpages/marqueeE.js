// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// const API = backendBaseUrl || "";

// /* Resolve templateId the same way as other previews (Page builder passes ?templateId) */
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tid, setTid] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL param
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTid(fromUrl.trim());
//         return;
//       }

//       // 2) backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) { setTid(t); return; }
//       } catch {}

//       // 3) default
//       if (!off) setTid("sir-template-1");
//     })();
//     return () => { off = true; };
//   }, [router.query.templateId, userId]);

//   return tid;
// }

// export default function MarqueePreview() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const apiUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/marquee/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     if (!apiUrl) return;
//     (async () => {
//       try {
//         const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error();
//         const data = await res.json().catch(() => ({}));
//         const arr = Array.isArray(data?.items) ? data.items : [];
//         setItems(arr.map((x) => ({ text: x.text || "", icon: x.icon || "*" })));
//       } catch {
//         setItems([]);
//       }
//     })();
//   }, [apiUrl]);

//   const goEdit = () => {
//     const q = new URLSearchParams({ templateId: String(templateId || "") });
//     router.push(`/editorpages/marqueeS?${q}`);
//   };

//   // build a single row duplicated so animation loops seamlessly
//   const row = (items.length ? items : [{ text: "UI-UX Experience", icon: "*" }])
//     .map((it, i) => (
//       <div key={`a-${i}`} className="mx-4 d-flex align-items-center">
//         <span className="fw-semibold">{it.text}</span>
//         <span className="opacity-50 ms-3">{it.icon}</span>
//       </div>
//     ));
//   const rowDup = row.concat(
//     row.map((el, i) =>
//       React.cloneElement(el, { key: `b-${i}` })
//     )
//   );

//   return (
//     <div
//       className="d-flex w-100"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: 20,
//         overflow: "hidden",
//         backgroundColor: "#f8f9fa",
//       }}
//     >
//       {/* Left: animated marquee preview */}
//       <div style={{ width: "50%", height: "100%", background: "#111", color: "#fff" }}>
//         <style>{`
//           @keyframes marqueeSlide {
//             0%   { transform: translateX(0); }
//             100% { transform: translateX(-50%); }
//           }
//         `}</style>
//         <div
//           className="h-100 d-flex flex-column justify-content-center"
//           style={{ overflow: "hidden" }}
//         >
//           {/* Row 1 */}
//           <div
//             className="d-flex"
//             style={{
//               whiteSpace: "nowrap",
//               animation: "marqueeSlide 20s linear infinite",
//               willChange: "transform",
//             }}
//           >
//             {rowDup}
//           </div>
//           {/* Row 2 (slower / offset for nice effect) */}
//           <div
//             className="d-flex mt-3"
//             style={{
//               whiteSpace: "nowrap",
//               animation: "marqueeSlide 28s linear infinite",
//               willChange: "transform",
//             }}
//           >
//             {rowDup}
//           </div>
//         </div>
//       </div>

//       {/* Right: list + edit button (same pattern/size as About/Projects) */}
//       <div
//         className="d-flex flex-column justify-content-center px-4 py-3"
//         style={{ width: "50%", height: "127%", overflowY: "auto" }}
//       >
//         <div className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
//           Marquee (running ticker)
//         </div>

//         {items.length ? (
//           <ul className="mb-2" style={{ paddingLeft: "1.1rem" }}>
//             {items.slice(0, 6).map((it, i) => (
//               <li key={i} className="mb-1">
//                 <span className="fw-semibold me-2">{it.text}</span>
//                 <span className="text-muted">{it.icon}</span>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <div className="text-muted mb-2">No marquee items.</div>
//         )}

//         <div className="d-flex align-items-center gap-3 mt-2">
//           {/* <Button size="sm" variant="outline-dark" onClick={goEdit}>
//             ✏️ Edit Marquee Section
//           </Button> */}
//           <small className="text-muted">
//             template: <code>{templateId || "…"}</code>
//           </small>
//         </div>
//       </div>
//     </div>
//   );
// }


















// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\marqueeE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

const API = backendBaseUrl || "";

export default function MarqueePreview() {
  const router = useRouter();
  const { userId, templateId } = useIonContext();

  const apiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${API}/api/marquee/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "include", // carry cookies/JWT
        });
        if (!res.ok) throw new Error();
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data?.items) ? data.items : [];
        setItems(arr.map((x) => ({ text: x?.text || "", icon: x?.icon || "*" })));
      } catch {
        setItems([]);
      }
    })();
  }, [apiUrl]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/marqueeS?${q}`);
  };

  // build a row and duplicate it so animation loops seamlessly
  const baseRow = (items.length ? items : [{ text: "UI-UX Experience", icon: "*" }]).map(
    (it, i) => (
      <div key={`a-${i}`} className="mx-4 d-flex align-items-center">
        <span className="fw-semibold">{it.text}</span>
        <span className="opacity-50 ms-3">{it.icon}</span>
      </div>
    )
  );
  const rowDup = baseRow.concat(baseRow.map((el, i) => React.cloneElement(el, { key: `b-${i}` })));

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Left: animated marquee preview */}
      <div style={{ width: "50%", height: "100%", background: "#111", color: "#fff" }}>
        <style>{`
          @keyframes marqueeSlide {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div className="h-100 d-flex flex-column justify-content-center" style={{ overflow: "hidden" }}>
          {/* Row 1 */}
          <div
            className="d-flex"
            style={{
              whiteSpace: "nowrap",
              animation: "marqueeSlide 20s linear infinite",
              willChange: "transform",
            }}
          >
            {rowDup}
          </div>
          {/* Row 2 (offset for effect) */}
          <div
            className="d-flex mt-3"
            style={{
              whiteSpace: "nowrap",
              animation: "marqueeSlide 28s linear infinite",
              willChange: "transform",
            }}
          >
            {rowDup}
          </div>
        </div>
      </div>

      {/* Right: list + edit button (same sizing as other previews) */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        <div className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
          Marquee (running ticker)
        </div>

        {items.length ? (
          <ul className="mb-2" style={{ paddingLeft: "1.1rem" }}>
            {items.slice(0, 6).map((it, i) => (
              <li key={i} className="mb-1">
                <span className="fw-semibold me-2">{it.text}</span>
                <span className="text-muted">{it.icon}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted mb-2">No marquee items.</div>
        )}

        <div className="d-flex align-items-center gap-3 mt-2">
          <Button size="sm" variant="outline-dark" onClick={goEdit}>
            ✏️ Edit Marquee Section
          </Button>
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
