// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Container, Row, Col, Card, Button, Form, Toast, ToastContainer, Badge
// } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import BackBar from "../components/BackBar";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) { if (!off) setTpl(fromUrl); return; }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) { setTpl(t); return; }
//       } catch {}
//       if (!off) setTpl(defaultTemplateId || "sir-template-1");
//     })();
//     return () => { off = true; };
//   }, [router.query.templateId, userId]);
//   return tpl;
// }

// const ABS = /^https?:\/\//i;
// const toAbs = (u) => (!u ? "" : ABS.test(u) ? u : u.startsWith("/") ? `${backendBaseUrl}${u}` : `${backendBaseUrl}/${u}`);

// function BlogQuickEditor() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [items, setItems] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false);

//   const [drafts, setDrafts] = useState({});
//   const lastUrlsRef = useRef({});

//   const url = useMemo(() => {
//     if (!templateId) return "";
//     return `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   useEffect(() => {
//     if (!url) return;
//     (async () => {
//       try {
//         const res = await fetch(`${url}?_=${Date.now()}`, { headers: { Accept: "application/json" } });
//         const json = await res.json().catch(() => ({}));
//         setItems(Array.isArray(json?.items) ? json.items : []);
//       } catch (e) {
//         console.error("load blogs", e);
//         setItems([]);
//       }
//     })();
//   }, [url]);

//   useEffect(() => {
//     return () => {
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//     };
//   }, []);

//   const setField = (i, k) => (e) => {
//     const v = e?.target?.value ?? e;
//     setItems((prev) => {
//       const next = [...prev];
//       next[i] = { ...next[i], [k]: k === "order" ? Number(v) : v };
//       return next;
//     });
//   };

//   const add = () =>
//     setItems((p) => [
//       ...p,
//       { title: "", excerpt: "", tag: "", date: "", href: "blog-details.html", imageUrl: "", delay: ".2", order: (p.length || 0) + 1 },
//     ]);

//   const remove = (i) => setItems((p) => p.filter((_, j) => j !== i));

//   const onPickLocal = (i, file) => {
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { alert("Image must be ≤ 10 MB"); return; }
//     const rowKey = (items[i]?._id ? String(items[i]._id) : `idx-${i}`);
//     const obj = URL.createObjectURL(file);
//     const prev = lastUrlsRef.current[rowKey];
//     if (prev) { try { URL.revokeObjectURL(prev); } catch {} }
//     lastUrlsRef.current[rowKey] = obj;
//     setDrafts((d) => ({ ...d, [rowKey]: { file, url: obj, index: i } }));
//   };

//   const uploadForKnown = async (postId, file) => {
//     const form = new FormData();
//     form.append("image", file);
//     const res = await fetch(
//       `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/${encodeURIComponent(postId)}/image`,
//       { method: "POST", body: form }
//     );
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     return res.json();
//   };

//   const saveAll = async () => {
//     if (!url) return;
//     setSaving(true);
//     try {
//       // upload drafts for rows with _id
//       let working = [...items];
//       for (const [key, d] of Object.entries(drafts)) {
//         const idx = d.index;
//         const row = working[idx];
//         if (row?._id && d.file) {
//           const up = await uploadForKnown(row._id, d.file);
//           if (up?.result?.items) {
//             working = up.result.items;
//           } else if (up?.key) {
//             working[idx] = { ...row, imageUrl: up.key };
//           }
//         }
//       }

//       const payload = {
//         items: working.map((x, i) => ({
//           title: x.title || "",
//           excerpt: x.excerpt || "",
//           tag: x.tag || "",
//           date: x.date || "",
//           href: x.href || "blog-details.html",
//           imageUrl: x.imageKey || x.imageUrl || "",
//           delay: x.delay || `.${(i % 3) + 2}`,
//           order: Number.isFinite(x.order) ? Number(x.order) : i + 1,
//         })),
//       };

//       const res = await fetch(url, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json().catch(() => null);
//       if (!res.ok) throw new Error(json?.error || json?.message || "Save failed");

//       // refresh
//       const fresh = await fetch(`${url}?_=${Date.now()}`, { headers: { Accept: "application/json" } });
//       const freshJson = await fresh.json().catch(() => ({}));
//       setItems(Array.isArray(freshJson?.items) ? freshJson.items : []);

//       // clear drafts
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//       setDrafts({});

//       setShowToast(true);
//     } catch (e) {
//       alert("❌ Save failed: " + (e?.message || e));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row className="mb-3">
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">📝 Quick Blog Editor</h4>
//             <BackBar />
//           </div>
//           <div className="small text-muted">
//             template: <code>{templateId || "…"}</code>{" "}
//             <Badge bg="secondary">{items.length} posts</Badge>
//           </div>
//         </Col>
//       </Row>

//       <Row>
//         {/* Editor */}
//         <Col lg={6}>
//           <Card className="p-3 mb-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h6 className="fw-bold mb-0">Edit</h6>
//               <div className="d-flex gap-2">
//                 <Button variant="outline-primary" onClick={add}>➕ Add</Button>
//                 <Button onClick={saveAll} disabled={saving || !templateId}>
//                   {saving ? "Saving…" : "💾 Save"}
//                 </Button>
//               </div>
//             </div>

//             <div className="d-grid gap-3">
//               {items.map((it, i) => {
//                 const rowKey = it?._id ? String(it._id) : `idx-${i}`;
//                 const cover = drafts[rowKey]?.url || toAbs(it.imageUrl);
//                 return (
//                   <Card key={rowKey} className="p-3">
//                     <div className="d-flex gap-3">
//                       <div style={{ width: 120 }}>
//                         {cover ? (
//                           <img
//                             src={cover}
//                             alt=""
//                             style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 4 }}
//                           />
//                         ) : (
//                           <div
//                             className="bg-light border rounded d-flex align-items-center justify-content-center"
//                             style={{ width: 120, height: 80 }}
//                           >
//                             <span className="text-muted small">No image</span>
//                           </div>
//                         )}
//                         <Form.Control
//                           className="mt-2"
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => {
//                             const f = e.target.files?.[0];
//                             if (!f) return;
//                             onPickLocal(i, f);
//                             try { e.target.value = ""; } catch {}
//                           }}
//                         />
//                       </div>

//                       <div className="flex-grow-1">
//                         <Row className="g-2">
//                           <Col sm={8}>
//                             <Form.Control
//                               placeholder="Title"
//                               value={it.title || ""}
//                               onChange={setField(i, "title")}
//                             />
//                           </Col>
//                           <Col sm={4}>
//                             <Form.Control
//                               placeholder="Tag"
//                               value={it.tag || ""}
//                               onChange={setField(i, "tag")}
//                             />
//                           </Col>
//                           <Col sm={8}>
//                             <Form.Control
//                               placeholder="Link (href)"
//                               value={it.href || ""}
//                               onChange={setField(i, "href")}
//                             />
//                           </Col>
//                           <Col sm={4}>
//                             <Form.Control
//                               placeholder="Date"
//                               value={it.date || ""}
//                               onChange={setField(i, "date")}
//                             />
//                           </Col>
//                           <Col sm={8}>
//                             <Form.Control
//                               as="textarea"
//                               rows={2}
//                               placeholder="Excerpt"
//                               value={it.excerpt || ""}
//                               onChange={setField(i, "excerpt")}
//                             />
//                           </Col>
//                           <Col sm={2}>
//                             <Form.Control
//                               type="number"
//                               placeholder="Order"
//                               value={it.order ?? 0}
//                               onChange={setField(i, "order")}
//                             />
//                           </Col>
//                           <Col sm={2}>
//                             <Form.Control
//                               placeholder="Delay"
//                               value={it.delay || ""}
//                               onChange={setField(i, "delay")}
//                             />
//                           </Col>
//                         </Row>
//                       </div>
//                     </div>

//                     <div className="text-end mt-3">
//                       <Button variant="outline-danger" size="sm" onClick={() => remove(i)}>
//                         Delete
//                       </Button>
//                     </div>
//                   </Card>
//                 );
//               })}
//               {items.length === 0 && (
//                 <div className="text-center text-muted py-5">No posts yet. Click “Add”.</div>
//               )}
//             </div>
//           </Card>
//         </Col>

//         {/* Live Preview */}
//         <Col lg={6}>
//           <Card className="p-4">
//             <div className="sec-head mb-3">
//               <span className="sub-title mb-1 opacity-75">- News</span>
//               <h4 className="text-uppercase fw-bold mb-0">Blog & <span className="fw-light">Insights</span></h4>
//             </div>

//             <div className="d-grid gap-3">
//               {items
//                 .slice()
//                 .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//                 .map((it, i) => {
//                   const cover = toAbs(it.imageUrl);
//                   return (
//                     <div key={it._id || i} className="border rounded p-3">
//                       <div className="row g-3 align-items-center">
//                         <div className="col-lg-6">
//                           <div className="d-flex align-items-center gap-3">
//                             {cover ? (
//                               <img
//                                 src={cover}
//                                 alt=""
//                                 style={{ width: 100, height: 66, objectFit: "cover", borderRadius: 4 }}
//                               />
//                             ) : null}
//                             <div>
//                               <div className="small text-muted">
//                                 <span className="me-3">{it.tag || "Tag"}</span>
//                                 <span>{it.date || "Date"}</span>
//                               </div>
//                               <h6 className="mb-1">{it.title || "Post title…"}</h6>
//                               <div className="small opacity-75 text-truncate" style={{ maxWidth: 380 }}>
//                                 {it.excerpt || "Excerpt…"}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="col-lg-3 offset-lg-3 text-end">
//                           <a className="btn btn-light btn-sm" href={it.href || "#"} target="_blank" rel="noreferrer">
//                             Continue Read →
//                           </a>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Toast */}
//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
//           <Toast.Body className="text-white">✅ Saved.</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// BlogQuickEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default BlogQuickEditor;


















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\blogE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
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

/* ---------------- Blog Preview ---------------- */
export default function BlogPagePreview() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [blogDoc, setBlogDoc] = useState({ items: [] });

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(
            templateId
          )}`
        );
        const doc = (await res.json()) || { items: [] };
        setBlogDoc(doc);
      } catch (e) {
        console.error("❌ Failed to fetch blogs", e);
        setBlogDoc({ items: [] });
      }
    })();
  }, [userId, templateId]);

  // Only show 2 posts in compact preview
  const posts = useMemo(
    () => (blogDoc.items || []).slice(0, 2),
    [blogDoc.items]
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
      {/* Left: Blog Grid */}
      <div
        className="d-flex flex-wrap gap-3"
        style={{ width: "70%", height: "100%", overflowY: "auto" }}
      >
        {posts.map((post, idx) => (
          <div
            key={post._id || idx}
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
            }}
          >
            <h6 className="fw-bold mb-1">{post.title || "Blog Title"}</h6>
            <p
              className="small mb-1 text-muted"
              style={{
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.excerpt || "Blog excerpt goes here…"}
            </p>
            <a
              href={post.href || "#"}
              className="btn btn-outline-primary btn-sm mt-auto"
              target="_blank"
              rel="noreferrer"
            >
              Read More
            </a>
          </div>
        ))}

        {/* Balance the grid if < 2 posts */}
        {posts.length === 1 && (
          <div
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
              visibility: "hidden",
            }}
          />
        )}
      </div>

      {/* Right: placeholder column for symmetry */}
      <div
        className="d-flex align-items-end justify-content-end flex-column ps-3"
        style={{ width: "30%" }}
      />
    </div>
  );
}
