


// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\blogE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// /* ---------------- Template resolver ---------------- */
// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const sp =
//         typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
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
//       if (!off) setTpl(defaultTemplateId || "sir-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);
//   return tpl;
// }

// /* ---------------- Blog Preview ---------------- */
// export default function BlogPagePreview() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [blogDoc, setBlogDoc] = useState({ items: [] });

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
//             templateId
//           )}`
//         );
//         const doc = (await res.json()) || { items: [] };
//         setBlogDoc(doc);
//       } catch (e) {
//         console.error("❌ Failed to fetch blogs", e);
//         setBlogDoc({ items: [] });
//       }
//     })();
//   }, [userId, templateId]);

//   // Only show 2 posts in compact preview
//   const posts = useMemo(
//     () => (blogDoc.items || []).slice(0, 2),
//     [blogDoc.items]
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
//       {/* Left: Blog Grid */}
//       <div
//         className="d-flex flex-wrap gap-3"
//         style={{ width: "70%", height: "100%", overflowY: "auto" }}
//       >
//         {posts.map((post, idx) => (
//           <div
//             key={post._id || idx}
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h6 className="fw-bold mb-1">{post.title || "Blog Title"}</h6>
//             <p
//               className="small mb-1 text-muted"
//               style={{
//                 lineHeight: 1.3,
//                 display: "-webkit-box",
//                 WebkitLineClamp: 3,
//                 WebkitBoxOrient: "vertical",
//                 overflow: "hidden",
//               }}
//             >
//               {post.excerpt || "Blog excerpt goes here…"}
//             </p>
//             <a
//               href={post.href || "#"}
//               className="btn btn-outline-primary btn-sm mt-auto"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Read More
//             </a>
//           </div>
//         ))}

//         {/* Balance the grid if < 2 posts */}
//         {posts.length === 1 && (
//           <div
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//               visibility: "hidden",
//             }}
//           />
//         )}
//       </div>

//       {/* Right: placeholder column for symmetry */}
//       <div
//         className="d-flex align-items-end justify-content-end flex-column ps-3"
//         style={{ width: "30%" }}
//       />
//     </div>
//   );
// }



















// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\blogE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// /* ---------------- Template resolver ---------------- */
// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const sp =
//         typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
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
//       if (!off) setTpl(defaultTemplateId || "sir-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);
//   return tpl;
// }

// /* ---------------- Blog Preview ---------------- */
// export default function BlogPagePreview() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [blogDoc, setBlogDoc] = useState({ items: [] });
//   const [resetting, setResetting] = useState(false);

//   // tiny helper so we can reuse after reset
//   const load = async () => {
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
//           templateId
//         )}?_=${Date.now()}`
//       );
//       const doc = (await res.json()) || { items: [] };
//       setBlogDoc(doc);
//     } catch (e) {
//       console.error("❌ Failed to fetch blogs", e);
//       setBlogDoc({ items: [] });
//     }
//   };

//   useEffect(() => {
//     if (!templateId) return;
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, templateId]);

//   // Reset to defaults -> POST /reset then reload
//   const handleReset = async () => {
//     if (!templateId || resetting) return;
//     setResetting(true);
//     try {
//       const r = await fetch(
//         `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
//           templateId
//         )}/reset`,
//         { method: "POST", headers: { Accept: "application/json" } }
//       );
//       if (!r.ok) {
//         const t = await r.text().catch(() => "");
//         throw new Error(t || `Reset failed (${r.status})`);
//       }
//       await load();
//     } catch (e) {
//       console.error("❌ Reset failed", e);
//       // optional: toast/alert could be added here if you want
//     } finally {
//       setResetting(false);
//     }
//   };

//   // Only show 2 posts in compact preview
//   const posts = useMemo(
//     () => (blogDoc.items || []).slice(0, 2),
//     [blogDoc.items]
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
//         position: "relative", // for the reset button
//       }}
//     >
//       {/* Minimal reset button (top-right) */}
//       <button
//         onClick={handleReset}
//         disabled={resetting || !templateId}
//         style={{
//           position: "absolute",
//           top: 8,
//           right: 8,
//           fontSize: 12,
//           padding: "6px 10px",
//           borderRadius: 8,
//           border: "1px solid #d0d5dd",
//           background: "#fff",
//           cursor: resetting ? "not-allowed" : "pointer",
//         }}
//         title="Reset to Defaults"
//       >
//         {resetting ? "Resetting…" : "↺ Reset"}
//       </button>

//       {/* Left: Blog Grid */}
//       <div
//         className="d-flex flex-wrap gap-3"
//         style={{ width: "70%", height: "100%", overflowY: "auto" }}
//       >
//         {posts.map((post, idx) => (
//           <div
//             key={post._id || idx}
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <h6 className="fw-bold mb-1">{post.title || "Blog Title"}</h6>
//             <p
//               className="small mb-1 text-muted"
//               style={{
//                 lineHeight: 1.3,
//                 display: "-webkit-box",
//                 WebkitLineClamp: 3,
//                 WebkitBoxOrient: "vertical",
//                 overflow: "hidden",
//               }}
//             >
//               {post.excerpt || "Blog excerpt goes here…"}
//             </p>
//             <a
//               href={post.href || "#"}
//               className="btn btn-outline-primary btn-sm mt-auto"
//               target="_blank"
//               rel="noreferrer"
//             >
//               Read More
//             </a>
//           </div>
//         ))}

//         {/* Balance the grid if < 2 posts */}
//         {posts.length === 1 && (
//           <div
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//               visibility: "hidden",
//             }}
//           />
//         )}
//       </div>

//       {/* Right: placeholder column for symmetry */}
//       <div
//         className="d-flex align-items-end justify-content-end flex-column ps-3"
//         style={{ width: "30%" }}
//       />
//     </div>
//   );
// }















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\blogE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

/* ---------------- Template resolver ---------------- */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL ?templateId=
      const sp =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const fromUrl = sp?.get("templateId")?.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl);
        return;
      }
      // 2) Backend-selected
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      // 3) Fallback
      if (!off) setTpl(defaultTemplateId || "sir-template-1");
    })();
    return () => {
      off = true;
    };
  }, [userId]);
  return tpl;
}

/* ---------------- Blog Preview (896 × 290) ---------------- */
export default function BlogPagePreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [blogDoc, setBlogDoc] = useState({ items: [] });
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
          templateId
        )}?_=${Date.now()}`,
        { headers: { Accept: "application/json" }, cache: "no-store", credentials: "include" }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      const doc = (await res.json()) || { items: [] };
      setBlogDoc(doc);
      setErr("");
    } catch (e) {
      console.error("❌ Failed to fetch blogs", e);
      setBlogDoc({ items: [] });
      setErr(String(e?.message || "Failed to load blogs"));
    }
  };

  useEffect(() => {
    if (!templateId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, templateId]);

  // Reset to defaults -> POST /reset then reload
  const handleReset = async () => {
    if (!templateId || resetting) return;
    setResetting(true);
    try {
      const r = await fetch(
        `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
          templateId
        )}/reset`,
        { method: "POST", headers: { Accept: "application/json" }, credentials: "include" }
      );
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Reset failed (${r.status})`);
      }
      await load();
    } catch (e) {
      console.error("❌ Reset failed", e);
      setErr(String(e?.message || "Reset failed"));
    } finally {
      setResetting(false);
    }
  };

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/blogS?${q.toString()}`);
  };

  // Only show 2 posts in compact preview
  const posts = useMemo(() => (blogDoc.items || []).slice(0, 2), [blogDoc.items]);

  return (
    <div
      className="d-flex w-100 shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #EEF1F4",
        background: "#f8f9fa",
      }}
    >
      {/* LEFT (50%): heading/meta + actions */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "100%", background: "#FFFFFF" }}
      >
        <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
          - News
        </div>
        <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem", lineHeight: 1.2 }}>
          Blog & <span className="fw-normal">Insights</span>
        </h4>
        <div
          className="small text-muted"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {(posts[0]?.excerpt || posts[0]?.title) ? (posts[0]?.excerpt || posts[0]?.title) : "Preview only."}
        </div>

        <div className="d-flex align-items-center gap-2 mt-3">
          <button
            onClick={handleReset}
            disabled={resetting || !templateId}
            className="btn btn-outline-secondary btn-sm"
            title="Reset to Defaults"
          >
            {resetting ? "Resetting…" : "↺ Reset to Default"}
          </button>

          <button
            onClick={goEdit}
            disabled={!templateId}
            className="btn btn-outline-dark btn-sm"
            title="Open Blog editor"
          >
            ✏️ Edit Blogs
          </button>
        </div>

        {err ? (
          <div className="small text-danger mt-2" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {err}
          </div>
        ) : null}
      </div>

      {/* RIGHT (50%): two compact post cards (scrollable if content overflows) */}
      <div
        className="d-flex gap-2 p-3"
        style={{ width: "50%", height: "100%", overflowY: "auto", background: "#FFFFFF" }}
      >
        {[0, 1].map((i) => {
          const p = posts[i];
          return (
            <div
              key={p?._id || i}
              className="border rounded p-2 d-flex flex-column"
              style={{
                width: "50%",
                backgroundColor: "#f8f9fa",
                minWidth: 0,
              }}
            >
              <div className="small text-muted mb-1">
                <span className="me-3">{p?.tag || "Tag"}</span>
                <span>{p?.date || "Date"}</span>
              </div>
              <div className="fw-semibold text-truncate" title={p?.title || "Blog Title"}>
                {p?.title || "Blog Title"}
              </div>
              <div
                className="small text-muted my-2"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p?.excerpt || "Blog excerpt goes here…"}
              </div>
              <div className="mt-auto text-end">
                <a
                  href={p?.href || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  Read More
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
