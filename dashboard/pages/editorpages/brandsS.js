


// // C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\brandsS.js
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Container, Row, Col, Card, Button, Form, Toast, ToastContainer,
//   Alert, Badge
// } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   s3Bucket,
//   s3Region,
// } from "../../lib/config";
// import { api } from "../../lib/api";
// import BackBar from "../components/BackBar";

// /* -------------------- Config -------------------- */
// const API = backendBaseUrl || "";
// const MAX_BRANDS = 5; // exactly 5 like your template

// const ABS_RX = /^https?:\/\//i;
// const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);
// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;                     // presigned from backend
//   if (u.startsWith("/")) return u;            // absolute path from /public
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
//   }
//   return u;
// };

// // Resolve templateId like Projects: (?templateId) -> selected template -> fallback
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tid, setTid] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) { if (!off) setTid(fromUrl); return; }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) { setTid(t); return; }
//       } catch {}
//       if (!off) setTid("sir-template-1");
//     })();
//     return () => { off = true; };
//   }, [router.query.templateId, userId]);
//   return tid;
// }

// /* -------------------- Hard defaults (match your static theme) -------------------- */
// const TEMPLATE_DEFAULTS = {
//   "sir-template-1": {
//     items: [
//       { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1", imageKey: "" },
//       { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2", imageKey: "" },
//       { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3", imageKey: "" },
//       { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4", imageKey: "" },
//       { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5", imageKey: "" },
//     ],
//   },
// };

// /* ============================= PAGE ============================== */
// function BrandsStudioPage() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   // fixed-length UI rows like Projects
//   const emptyRow = { imageUrl: "", imageKey: "", href: "#0", alt: "" };
//   const [items, setItems] = useState(Array.from({ length: MAX_BRANDS }, () => ({ ...emptyRow })));

//   const [saving, setSaving] = useState(false);
//   const [resetting, setResetting] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   // local drafts (upload during Save)
//   const [drafts, setDrafts] = useState(
//     Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" }))
//   );
//   const lastUrlsRef = useRef(Array(MAX_BRANDS).fill(null));

//   const apiUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/brands/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   // apply template defaults (non-destructive fill) whenever template changes
//   useEffect(() => {
//     const d = TEMPLATE_DEFAULTS["sir-template-1"]?.items || [];
//     setItems((prev) => {
//       const merged = Array.from({ length: MAX_BRANDS }, (_, i) => ({
//         ...emptyRow,
//         ...(prev[i] || {}),
//         ...(d[i] || {}),
//       }));
//       return merged;
//     });
//     setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
//     setErrorMsg("");
//   }, [templateId]);

//   // fetch current override/template from backend
//   const loadBrands = async () => {
//     if (!apiUrl) return;
//     const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//     const data = await res.json().catch(() => ({}));
//     const list = Array.isArray(data?.items) ? data.items : [];
//     // pad/trim to MAX_BRANDS and keep both imageUrl (presigned) + imageKey (key)
//     setItems(() =>
//       Array.from({ length: MAX_BRANDS }, (_, i) => ({
//         ...emptyRow,
//         ...(list[i] || {}),
//         imageUrl: list[i]?.imageUrl || "", // presigned for preview
//         imageKey: list[i]?.imageKey || "", // persisted key
//       }))
//     );
//   };

//   useEffect(() => {
//     if (!apiUrl) return;
//     (async () => {
//       try {
//         await loadBrands();
//       } catch (e) {
//         console.error("❌ Load brands failed", e);
//         setErrorMsg("Failed to load brands.");
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [apiUrl]);

//   // setters
//   const setField = (i, key) => (e) =>
//     setItems((prev) => {
//       const next = [...prev];
//       next[i] = { ...next[i], [key]: e.target.value };
//       return next;
//     });

//   // choose file -> local preview (upload on Save)
//   const pickFile = (i) => (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { alert("Logo must be ≤ 10 MB"); e.target.value = ""; return; }
//     const objUrl = URL.createObjectURL(file);
//     if (lastUrlsRef.current[i]) URL.revokeObjectURL(lastUrlsRef.current[i]);
//     lastUrlsRef.current[i] = objUrl;
//     setDrafts((prev) => { const n = [...prev]; n[i] = { file, preview: objUrl }; return n; });
//   };

//   // upload one draft (if any) -> returns relative S3 key
//   const uploadDraftIfAny = async (i) => {
//     const draft = drafts[i];
//     if (!draft?.file) return null;
//     const url = `${apiUrl}/image/${i}`;
//     const form = new FormData();
//     form.append("image", draft.file);
//     const res = await fetch(url, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || `Upload failed (brand ${i + 1})`);
//     }
//     const data = await res.json().catch(() => ({}));
//     return data?.imageKey || null; // controller should mirror projects: return key + presigned url
//   };

//   // Save (uploads any drafts first, then PUT keys)
//   const handleSave = async () => {
//     if (!apiUrl) return;
//     setSaving(true);
//     setErrorMsg("");
//     try {
//       const uploadedKeys = await Promise.all(
//         Array.from({ length: MAX_BRANDS }, (_, i) => uploadDraftIfAny(i))
//       );

//       const body = {
//         items: items.map((b, i) => ({
//           href: b.href || "#0",
//           alt: b.alt || "",
//           imageKey: uploadedKeys[i] ? uploadedKeys[i] : (b.imageKey || ""),
//         })),
//       };

//       const res = await fetch(apiUrl, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//         cache: "no-store",
//       });
//       const okJson = (res.headers.get("content-type") || "").toLowerCase().includes("application/json");
//       const data = okJson ? await res.json().catch(() => ({})) : null;
//       if (!res.ok) {
//         const txt = okJson ? (data?.error || data?.message) : await res.text().catch(() => "");
//         throw new Error(txt || `Save failed (${res.status})`);
//       }

//       await loadBrands();

//       // clear local previews
//       setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
//       lastUrlsRef.current.forEach((u, i) => { if (u) URL.revokeObjectURL(u); lastUrlsRef.current[i] = null; });

//       setShowToast(true);
//     } catch (e) {
//       setErrorMsg(e?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ONE Reset button (server reset → refetch), same as Projects
//   const handleReset = async () => {
//     if (!apiUrl) return;
//     setResetting(true);
//     setErrorMsg("");
//     try {
//       const res = await fetch(`${apiUrl}/reset`, { method: "POST", headers: { Accept: "application/json" }, cache: "no-store" });
//       const okJson = (res.headers.get("content-type") || "").toLowerCase().includes("application/json");
//       const data = okJson ? await res.json().catch(() => ({})) : null;
//       if (!res.ok) {
//         const txt = okJson ? (data?.error || data?.message) : await res.text().catch(() => "");
//         throw new Error(txt || `Reset failed (${res.status})`);
//       }

//       await loadBrands();

//       setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
//       lastUrlsRef.current.forEach((u, i) => { if (u) URL.revokeObjectURL(u); lastUrlsRef.current[i] = null; });

//       setShowToast(true);
//     } catch (e) {
//       setErrorMsg(e?.message || "Reset failed");
//     } finally {
//       setResetting(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">🏷 Brands</h4>
//             <BackBar />
//           </div>
//           <div className="text-end small">
//             <div>
//               template: <code>{templateId || "(resolving…)"}</code>{" "}
//               <Badge bg="secondary">max {MAX_BRANDS} items</Badge>
//             </div>
//             {apiUrl && (
//               <div className="text-muted" title={apiUrl}>
//                 endpoint: <code>/api/brands/{defaultUserId}/{templateId}</code>
//               </div>
//             )}
//           </div>
//         </Col>
//       </Row>

//       {errorMsg ? (
//         <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
//       ) : null}

//       {/* Preview – 5 logos, dark bg so white marks are visible */}
//       <Card className="p-3 mb-4">
//         <div className="d-flex flex-wrap gap-3">
//           {items.map((b, i) => (
//             <div key={i} className="border rounded p-2" style={{ width: 200 }}>
//               <div className="ratio ratio-1x1 mb-2" style={{ background: "#111" }}>
//                 {drafts[i].preview || b.imageUrl ? (
//                   <img
//                     src={drafts[i].preview || toAbs(b.imageUrl)}
//                     alt={b.alt || ""}
//                     style={{ objectFit: "contain", padding: 8 }}
//                   />
//                 ) : (
//                   <div className="d-flex align-items-center justify-content-center text-muted">
//                     No logo
//                   </div>
//                 )}
//               </div>
//               <div className="small text-truncate">{b.alt || `Brand ${i + 1}`}</div>
//               <div className="small text-muted">{(b.href && b.href !== "#0") ? "link ✓" : "no link"}</div>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Editor – 5 cards like Projects */}
//       <Row className="g-3">
//         {items.map((b, i) => (
//           <Col md={6} lg={4} key={i}>
//             <Card className="p-3 h-100">
//               <div className="mb-2 fw-semibold">Brand #{i + 1}</div>

//               <Form.Group className="mb-2">
//                 <Form.Label>Logo (upload on Save)</Form.Label>
//                 <Form.Control type="file" accept="image/*" onChange={pickFile(i)} />
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Alt text</Form.Label>
//                 <Form.Control value={b.alt || ""} onChange={setField(i, "alt")} placeholder={`Brand ${i + 1}`} />
//               </Form.Group>

//               <Form.Group>
//                 <Form.Label>Link (href)</Form.Label>
//                 <Form.Control value={b.href || ""} onChange={setField(i, "href")} placeholder="#0 or https://…" />
//               </Form.Group>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <div className="d-flex justify-content-end gap-2 mt-3">
//         <Button
//           variant="outline-secondary"
//           onClick={handleReset}
//           disabled={resetting || !templateId}
//           title="Reset to template defaults"
//         >
//           {resetting ? "Resetting…" : "↺ Reset to Defaults"}
//         </Button>
//         <Button onClick={handleSave} disabled={saving || !templateId}>
//           {saving ? "Saving…" : "💾 Save"}
//         </Button>
//       </div>

//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
//           <Toast.Body className="text-white">✅ Done.</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// BrandsStudioPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default BrandsStudioPage;







// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\brandsS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Toast, ToastContainer,
  Alert, Badge
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* -------------------- Constants -------------------- */
const MAX_BRANDS = 5; // exactly 5 like your template

const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    items: [
      { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1", imageKey: "" },
      { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2", imageKey: "" },
      { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3", imageKey: "" },
      { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4", imageKey: "" },
      { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5", imageKey: "" },
    ],
  },
};

/* -------------------- Helpers -------------------- */
const ABS_RX = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);

/** Build an absolute URL usable in <img src>:
 * - absolute: return as-is
 * - /public path: return as-is
 * - S3 key: build https://<bucket>.s3.<region>.amazonaws.com/<key>
 * - otherwise: return input
 */
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;                 // absolute/presigned from backend
  if (u.startsWith("/")) return u;        // absolute path on same host (/public)
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(u).replace(/^\/+/, "")}`;
  }
  return u;
};

/* ============================= PAGE ============================== */
function BrandsStudioPage() {
  // ✅ single source of truth (same pattern as Projects)
  const { userId, templateId } = useIonContext();

  // fixed-length UI rows
  const emptyRow = { imageUrl: "", imageKey: "", href: "#0", alt: "", displayUrl: "" };
  const [items, setItems] = useState(Array.from({ length: MAX_BRANDS }, () => ({ ...emptyRow })));

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // local drafts (upload during Save)
  const [drafts, setDrafts] = useState(
    Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" }))
  );
  const lastUrlsRef = useRef(Array(MAX_BRANDS).fill(null)); // revokeObjectURL later

  const apiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/brands/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  /* -------- On template change: show template defaults immediately -------- */
  useEffect(() => {
    if (!templateId) return;
    const d = (TEMPLATE_DEFAULTS["sir-template-1"]?.items || []).slice(0, MAX_BRANDS);

    const withDefaults = Array.from({ length: MAX_BRANDS }, (_, i) => ({
      imageUrl: d[i]?.imageUrl || "",
      imageKey: "",
      href: d[i]?.href || "#0",
      alt: d[i]?.alt || `Brand ${i + 1}`,
      displayUrl: toAbs(d[i]?.imageUrl || ""),
    }));
    setItems(withDefaults);

    // reset local draft previews
    setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
    lastUrlsRef.current.forEach((u, idx) => {
      if (u) URL.revokeObjectURL(u);
      lastUrlsRef.current[idx] = null;
    });
    setErrorMsg("");
  }, [templateId]);

  /* ------------------------- Load from backend (overlay) ------------------------- */
  const loadBrands = async () => {
    if (!apiUrl) return;

    const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.items) ? data.items : [];

    if (!list.length) {
      // No server overrides — keep the defaults currently shown.
      return;
    }

    // Overlay server values onto the existing (default) UI
    setItems((prev) =>
      Array.from({ length: MAX_BRANDS }, (_, i) => {
        const srv = list[i] || {};
        const merged = {
          ...prev[i],
          ...srv,
        };

        // Prefer presigned/absolute from server; else build from key/url we have
        const urlForDisplay =
          (srv.imageUrl && isAbs(srv.imageUrl)) ? srv.imageUrl :
          (srv.imageUrl) ? toAbs(srv.imageUrl) :
          (srv.imageKey) ? toAbs(srv.imageKey) :
          prev[i]?.displayUrl || "";

        return {
          ...merged,
          displayUrl: urlForDisplay,
        };
      })
    );
  };

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        await loadBrands();
      } catch (e) {
        console.error("❌ Load brands failed", e);
        setErrorMsg("Failed to load brands.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  /* ------------------------- Field setters & file picks ------------------------- */
  const setField = (i, key) => (e) =>
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: e.target.value };
      return next;
    });

  // choose file -> local preview (upload on Save)
  const pickFile = (i) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Logo must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastUrlsRef.current[i]) URL.revokeObjectURL(lastUrlsRef.current[i]);
    lastUrlsRef.current[i] = objUrl;
    setDrafts((prev) => {
      const n = [...prev];
      n[i] = { file, preview: objUrl };
      return n;
    });
  };

  // upload one draft (if any) -> returns relative S3 key
  const uploadDraftIfAny = async (i) => {
    const draft = drafts[i];
    if (!draft?.file) return null;
    const url = `${apiUrl}/image/${i}`;
    const form = new FormData();
    form.append("image", draft.file);
    const res = await fetch(url, { method: "POST", body: form, credentials: "include" });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Upload failed (brand ${i + 1})`);
    }
    const data = await res.json().catch(() => ({}));
    // Controller should respond with { imageKey, imageUrl? }
    return data?.imageKey || null;
  };

  /* --------------------------------- Save --------------------------------- */
  const handleSave = async () => {
    if (!apiUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const uploadedKeys = await Promise.all(
        Array.from({ length: MAX_BRANDS }, (_, i) => uploadDraftIfAny(i))
      );

      const body = {
        items: items.map((b, i) => ({
          href: b.href || "#0",
          alt: b.alt || "",
          imageKey: uploadedKeys[i] ? uploadedKeys[i] : (b.imageKey || ""),
        })),
      };

      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      });
      const okJson = (res.headers.get("content-type") || "").toLowerCase().includes("application/json");
      const data = okJson ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = okJson ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Save failed (${res.status})`);
      }

      await loadBrands();

      // clear local previews
      setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => { if (u) URL.revokeObjectURL(u); lastUrlsRef.current[i] = null; });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------- Reset (PUT defaults locally) ---------------------- */
  const handleReset = async () => {
    if (!apiUrl) return;
    setResetting(true);
    setErrorMsg("");
    try {
      const d = (TEMPLATE_DEFAULTS["sir-template-1"]?.items || []).slice(0, MAX_BRANDS);

      // Build default payload (only keys/hrefs/alts; shipped assets live in theme)
      const payload = {
        items: Array.from({ length: MAX_BRANDS }, (_, i) => ({
          href: d[i]?.href || "#0",
          alt: d[i]?.alt || `Brand ${i + 1}`,
          imageKey: "", // we don't persist shipped image URLs; frontend resolves them
        })),
      };

      // PUT defaults (works as reset even if server has no /reset route)
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        credentials: "include",
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const j = ct.includes("application/json") ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = ct.includes("application/json") ? (j?.error || j?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Reset failed (${res.status})`);
      }

      // Immediately show defaults
      const withDefaults = Array.from({ length: MAX_BRANDS }, (_, i) => ({
        imageUrl: d[i]?.imageUrl || "",
        imageKey: "",
        href: d[i]?.href || "#0",
        alt: d[i]?.alt || `Brand ${i + 1}`,
        displayUrl: toAbs(d[i]?.imageUrl || ""),
      }));
      setItems(withDefaults);

      // Overlay any server-calculated fields if the backend returns them on GET
      await loadBrands();

      // Clear draft previews
      setDrafts(Array.from({ length: MAX_BRANDS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => { if (u) URL.revokeObjectURL(u); lastUrlsRef.current[i] = null; });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  /* --------------------------------- UI --------------------------------- */
  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🏷 Brands</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">max {MAX_BRANDS} items</Badge>
            </div>
            {apiUrl && (
              <div className="text-muted" title={apiUrl}>
                endpoint: <code>/api/brands/{userId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
      ) : null}

      {/* Preview – 5 logos */}
      <Card className="p-3 mb-4">
        <div className="d-flex flex-wrap gap-3">
          {items.map((b, i) => (
            <div key={i} className="border rounded p-2" style={{ width: 200 }}>
              <div className="ratio ratio-1x1 mb-2" style={{ background: "#111" }}>
                {drafts[i].preview || b.displayUrl || toAbs(b.imageUrl) ? (
                  <img
                    src={drafts[i].preview || b.displayUrl || toAbs(b.imageUrl)}
                    alt={b.alt || ""}
                    style={{ objectFit: "contain", padding: 8 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted">
                    No logo
                  </div>
                )}
              </div>
              <div className="small text-truncate">{b.alt || `Brand ${i + 1}`}</div>
              <div className="small text-muted">{(b.href && b.href !== "#0") ? "link ✓" : "no link"}</div>
              {b.imageKey ? (
                <div className="text-muted small mt-1" title={b.imageKey}>
                  key: <code>{String(b.imageKey).slice(0, 24)}…</code>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {/* Editor – 5 cards */}
      <Row className="g-3">
        {items.map((b, i) => (
          <Col md={6} lg={4} key={i}>
            <Card className="p-3 h-100">
              <div className="mb-2 fw-semibold">Brand #{i + 1}</div>

              <Form.Group className="mb-2">
                <Form.Label>Logo (upload on Save)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={pickFile(i)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Alt text</Form.Label>
                <Form.Control value={b.alt || ""} onChange={setField(i, "alt")} placeholder={`Brand ${i + 1}`} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Link (href)</Form.Label>
                <Form.Control value={b.href || ""} onChange={setField(i, "href")} placeholder="#0 or https://…" />
              </Form.Group>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
          variant="outline-secondary"
          onClick={handleReset}
          disabled={resetting || !templateId}
          title="Reset to template defaults"
        >
          {resetting ? "Resetting…" : "↺ Reset to Defaults"}
        </Button>
        <Button onClick={handleSave} disabled={saving || !templateId}>
          {saving ? "Saving…" : "💾 Save"}
        </Button>
      </div>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

BrandsStudioPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default BrandsStudioPage;
