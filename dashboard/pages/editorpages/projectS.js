// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Toast,
//   ToastContainer,
//   Alert,
//   Badge,
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

// /* ------------------------------------------------------------------
//    Template profile (SIR shows a “works” strip with up to 6 projects)
// -------------------------------------------------------------------*/
// const MAX_PROJECTS = 6;

// const TEMPLATE_DEFAULTS = {
//   "sir-template-1": {
//     projects: [
//       { tag: "Digital Design", title: "Retouch Photo", year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
//       { tag: "Branding",       title: "Earthmade Aroma", year: "2023", href: "project2.html", imageUrl: "", imageKey: "" },
//       { tag: "Branding",       title: "Bank Rebranding", year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
//       { tag: "Product Design", title: "The joy of music", year: "2023", href: "project4.html", imageUrl: "", imageKey: "" },
//       { tag: "Digital Art",    title: "Blue Adobe MAX",  year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
//       { tag: "Web Design",     title: "Carved Wood",     year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
//     ],
//   },
// };

// const API = backendBaseUrl || "";
// const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;
//   if (u.startsWith("/")) return u;
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
//   }
//   return u;
// };

// // Resolve templateId: (1) ?templateId, (2) backend selection, (3) fallback
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tid, setTid] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl = typeof router.query.templateId === "string" && router.query.templateId.trim();
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

// /* ============================= PAGE ============================== */
// function ProjectStudioPage() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [projects, setProjects] = useState(
//     Array.from({ length: MAX_PROJECTS }, () => ({
//       tag: "", title: "", year: "", href: "", imageUrl: "", imageKey: ""
//     }))
//   );
//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   // Keep a local per-index draft file & preview
//   const [drafts, setDrafts] = useState(
//     Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" }))
//   );
//   const lastUrlsRef = useRef(Array(MAX_PROJECTS).fill(null));

//   const apiUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   // Defaults for template
//   useEffect(() => {
//     const d = TEMPLATE_DEFAULTS["sir-template-1"]?.projects || [];
//     setProjects((prev) => {
//       const merged = Array.from({ length: MAX_PROJECTS }, (_, i) => ({ ...prev[i], ...(d[i] || {}) }));
//       return merged;
//     });
//     setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
//   }, [templateId]);

//   // Load current
//   useEffect(() => {
//     if (!apiUrl) return;
//     (async () => {
//       try {
//         const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//         const data = await res.json().catch(() => ({}));
//         const list = Array.isArray(data?.projects) ? data.projects : [];
//         // The backend returns presigned imageUrl (+ imageKey). Keep both.
//         setProjects((prev) => {
//           const merged = Array.from({ length: MAX_PROJECTS }, (_, i) => ({
//             ...prev[i],
//             ...(list[i] || {}),
//             imageUrl: (list[i]?.imageUrl || ""), // presigned for preview
//             imageKey: (list[i]?.imageKey || prev[i]?.imageKey || "")
//           }));
//           return merged;
//         });
//       } catch (e) {
//         console.error("❌ Load projects failed", e);
//         setErrorMsg("Failed to load projects.");
//       }
//     })();
//   }, [apiUrl]);

//   // field setters
//   const setField = (i, key) => (e) =>
//     setProjects((prev) => {
//       const next = [...prev];
//       next[i] = { ...next[i], [key]: e.target.value };
//       return next;
//     });

//   // choose file for index -> local preview (upload on Save)
//   const pickFile = (i) => (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 15 * 1024 * 1024) {
//       alert("Image must be ≤ 15 MB");
//       e.target.value = "";
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     if (lastUrlsRef.current[i]) URL.revokeObjectURL(lastUrlsRef.current[i]);
//     lastUrlsRef.current[i] = objUrl;
//     setDrafts((prev) => {
//       const next = [...prev];
//       next[i] = { file, preview: objUrl };
//       return next;
//     });
//   };

//   // upload a single draft if present, returns relative key or null
//   const uploadDraftIfAny = async (i) => {
//     const draft = drafts[i];
//     if (!draft?.file) return null;
//     const url = `${apiUrl}/image/${i}`;
//     const form = new FormData();
//     form.append("image", draft.file);
//     const res = await fetch(url, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || `Upload failed (index ${i + 1})`);
//     }
//     const data = await res.json().catch(() => ({}));
//     // controller returns { imageKey, imageUrl }
//     return data?.imageKey || null;
//   };

//   const handleSave = async () => {
//     if (!apiUrl) return;
//     setSaving(true);
//     setErrorMsg("");
//     try {
//       // 1) upload any new images
//       const uploadedKeys = await Promise.all(
//         Array.from({ length: MAX_PROJECTS }, (_, i) => uploadDraftIfAny(i))
//       );

//       // 2) prepare payload
//       const body = {
//         projects: projects.map((p, i) => ({
//           tag: p.tag || "",
//           title: p.title || "",
//           year: p.year || "",
//           href: p.href || "",
//           // If we uploaded a new file, send its relative key; otherwise keep prior key.
//           imageKey: uploadedKeys[i] ? uploadedKeys[i] : (p.imageKey || ""),
//         })),
//       };

//       // 3) PUT
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

//       // 4) refresh from server
//       const fresh = await fetch(`${apiUrl}?_=${Date.now()}`, {
//         headers: { Accept: "application/json" },
//         cache: "no-store",
//       });
//       const freshJson = await fresh.json().catch(() => ({}));
//       const list = Array.isArray(freshJson?.projects) ? freshJson.projects : [];
//       setProjects((prev) => {
//         const merged = Array.from({ length: MAX_PROJECTS }, (_, i) => ({
//           ...prev[i],
//           ...(list[i] || {}),
//           imageUrl: (list[i]?.imageUrl || ""),    // presigned for preview
//           imageKey: (list[i]?.imageKey || prev[i]?.imageKey || "")
//         }));
//         return merged;
//       });

//       // 5) clear draft previews
//       setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
//       lastUrlsRef.current.forEach((u, i) => { if (u) URL.revokeObjectURL(u); lastUrlsRef.current[i] = null; });

//       setShowToast(true);
//     } catch (e) {
//       setErrorMsg(e?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">🗂 Projects (SIR “works”)</h4>
//             <BackBar />
//           </div>
//           <div className="text-end small">
//             <div>
//               template: <code>{templateId || "(resolving…)"}</code>{" "}
//               <Badge bg="secondary">max {MAX_PROJECTS} items</Badge>
//             </div>
//             {apiUrl && (
//               <div className="text-muted" title={apiUrl}>
//                 endpoint: <code>/api/projects/{defaultUserId}/{templateId}</code>
//               </div>
//             )}
//           </div>
//         </Col>
//       </Row>

//       {errorMsg ? (
//         <Row className="mb-3">
//           <Col>
//             <Alert variant="danger" className="mb-0">{errorMsg}</Alert>
//           </Col>
//         </Row>
//       ) : null}

//       {/* Preview-strip styled like SIR */}
//       <Card className="p-3 mb-4">
//         <div className="d-flex flex-wrap gap-3">
//           {projects.map((p, i) => (
//             <div key={i} className="border rounded p-2" style={{ width: 280 }}>
//               <div className="ratio ratio-16x9 mb-2" style={{ background: "#111" }}>
//                 {drafts[i].preview || p.imageUrl ? (
//                   <img src={drafts[i].preview || toAbs(p.imageUrl)} alt="" style={{ objectFit: "cover" }} />
//                 ) : (
//                   <div className="d-flex align-items-center justify-content-center text-muted">No image</div>
//                 )}
//               </div>
//               <div className="small opacity-75">{p.tag || "Tag"}</div>
//               <div className="fw-semibold">{p.title || "Title"}</div>
//               <div className="d-flex justify-content-between">
//                 <span className="text-muted">{p.year || "Year"}</span>
//                 <span className="text-muted">{p.href ? "link ✓" : "no link"}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Editor grid */}
//       <Row className="g-3">
//         {projects.map((p, i) => (
//           <Col md={6} lg={4} key={i}>
//             <Card className="p-3 h-100">
//               <div className="mb-2 fw-semibold">Project #{i + 1}</div>

//               <Form.Group className="mb-2">
//                 <Form.Label>Image (upload on Save)</Form.Label>
//                 <Form.Control type="file" accept="image/*" onChange={pickFile(i)} />
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Tag (small label)</Form.Label>
//                 <Form.Control value={p.tag || ""} onChange={setField(i, "tag")} />
//               </Form.Group>

//               <Form.Group className="mb-2">
//                 <Form.Label>Title</Form.Label>
//                 <Form.Control value={p.title || ""} onChange={setField(i, "title")} />
//               </Form.Group>

//               <Row className="mb-2">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Year</Form.Label>
//                     <Form.Control value={p.year || ""} onChange={setField(i, "year")} />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Link (href)</Form.Label>
//                     <Form.Control value={p.href || ""} onChange={setField(i, "href")} />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <div className="d-flex justify-content-end mt-3">
//         <Button onClick={handleSave} disabled={saving || !templateId}>
//           {saving ? "Saving…" : "💾 Save"}
//         </Button>
//       </div>

//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast
//           bg="success"
//           onClose={() => setShowToast(false)}
//           show={showToast}
//           delay={2200}
//           autohide
//         >
//           <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// ProjectStudioPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ProjectStudioPage;































// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\projectS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Toast,
  ToastContainer,
  Alert,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/* ------------------------------------------------------------------
   SIR template shows a “works” strip with up to 6 projects
-------------------------------------------------------------------*/
const MAX_PROJECTS = 6;

const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    projects: [
      { tag: "Digital Design", title: "Retouch Photo", year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
      { tag: "Branding",       title: "Earthmade Aroma", year: "2023", href: "project2.html", imageUrl: "", imageKey: "" },
      { tag: "Branding",       title: "Bank Rebranding", year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
      { tag: "Product Design", title: "The joy of music", year: "2023", href: "project4.html", imageUrl: "", imageKey: "" },
      { tag: "Digital Art",    title: "Blue Adobe MAX",  year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
      { tag: "Web Design",     title: "Carved Wood",     year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
    ],
  },
};

const API = backendBaseUrl || "";
const ABS_RX = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;                     // presigned from backend
  if (u.startsWith("/")) return u;            // absolute path
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

// Resolve templateId: (1) ?templateId, (2) backend selection, (3) fallback
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTid(fromUrl);
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTid(t);
          return;
        }
      } catch {}
      if (!off) setTid("sir-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);
  return tid;
}

/* ============================= PAGE ============================== */
function ProjectStudioPage() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  // Always keep exactly MAX_PROJECTS slots in UI
  const emptyRow = { tag: "", title: "", year: "", href: "", imageUrl: "", imageKey: "" };
  const [projects, setProjects] = useState(
    Array.from({ length: MAX_PROJECTS }, () => ({ ...emptyRow }))
  );

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Keep a local per-index draft file & preview (upload on Save)
  const [drafts, setDrafts] = useState(
    Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" }))
  );
  const lastUrlsRef = useRef(Array(MAX_PROJECTS).fill(null)); // revokeObjectURL later

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // Template defaults → fill UI (non-destructive)
  useEffect(() => {
    const d = TEMPLATE_DEFAULTS["sir-template-1"]?.projects || [];
    setProjects((prev) => {
      const merged = Array.from({ length: MAX_PROJECTS }, (_, i) => ({
        ...emptyRow,
        ...(prev[i] || {}),
        ...(d[i] || {}),
      }));
      return merged;
    });
    setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
  }, [templateId]);

  // Load current from backend
  const loadProjects = async () => {
    if (!apiUrl) return;
    const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.projects) ? data.projects : [];

    setProjects(() => {
      // pad/trim to exactly MAX_PROJECTS
      const padded = Array.from({ length: MAX_PROJECTS }, (_, i) => ({
        ...emptyRow,
        ...(list[i] || {}),
        imageUrl: list[i]?.imageUrl || "", // presigned for preview
        imageKey: list[i]?.imageKey || "", // S3 key persisted in DB
      }));
      return padded;
    });
  };

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        await loadProjects();
      } catch (e) {
        console.error("❌ Load projects failed", e);
        setErrorMsg("Failed to load projects.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // field setters
  const setField = (i, key) => (e) =>
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: e.target.value };
      return next;
    });

  // choose file for index -> local preview (upload on Save)
  const pickFile = (i) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Image must be ≤ 15 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastUrlsRef.current[i]) URL.revokeObjectURL(lastUrlsRef.current[i]);
    lastUrlsRef.current[i] = objUrl;
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = { file, preview: objUrl };
      return next;
    });
  };

  // upload a single draft if present, returns relative key or null
  const uploadDraftIfAny = async (i) => {
    const draft = drafts[i];
    if (!draft?.file) return null;
    const url = `${apiUrl}/image/${i}`;
    const form = new FormData();
    form.append("image", draft.file);
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Upload failed (index ${i + 1})`);
    }
    const data = await res.json().catch(() => ({}));
    // controller returns { imageKey, imageUrl }
    return data?.imageKey || null;
  };

  const handleSave = async () => {
    if (!apiUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // 1) upload any new images
      const uploadedKeys = await Promise.all(
        Array.from({ length: MAX_PROJECTS }, (_, i) => uploadDraftIfAny(i))
      );

      // 2) prepare payload (keys only)
      const body = {
        projects: projects.map((p, i) => ({
          tag: p.tag || "",
          title: p.title || "",
          year: p.year || "",
          href: p.href || "",
          // If we uploaded a new file, send its relative key; otherwise keep prior key.
          imageKey: uploadedKeys[i] ? uploadedKeys[i] : (p.imageKey || ""),
          // (imageAlt is fixed in controller as "Project image" unless you add it to UI)
        })),
      };

      // 3) PUT
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const okJson = (res.headers.get("content-type") || "")
        .toLowerCase()
        .includes("application/json");
      const data = okJson ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = okJson ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Save failed (${res.status})`);
      }

      // 4) refresh from server
      await loadProjects();

      // 5) clear draft previews
      setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => {
        if (u) URL.revokeObjectURL(u);
        lastUrlsRef.current[i] = null;
      });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!apiUrl) return;
    setResetting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${apiUrl}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const okJson = (res.headers.get("content-type") || "")
        .toLowerCase()
        .includes("application/json");
      const data = okJson ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = okJson ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Reset failed (${res.status})`);
      }

      // reload fresh data
      await loadProjects();

      // clear drafts
      setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => {
        if (u) URL.revokeObjectURL(u);
        lastUrlsRef.current[i] = null;
      });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🗂 Projects (SIR “works”)</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">max {MAX_PROJECTS} items</Badge>
            </div>
            {apiUrl && (
              <div className="text-muted" title={apiUrl}>
                endpoint: <code>/api/projects/{defaultUserId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">{errorMsg}</Alert>
          </Col>
        </Row>
      ) : null}

      {/* Preview-strip styled like SIR */}
      <Card className="p-3 mb-4">
        <div className="d-flex flex-wrap gap-3">
          {projects.map((p, i) => (
            <div key={i} className="border rounded p-2" style={{ width: 280 }}>
              <div className="ratio ratio-16x9 mb-2" style={{ background: "#111" }}>
                {drafts[i].preview || p.imageUrl ? (
                  <img
                    src={drafts[i].preview || toAbs(p.imageUrl)}
                    alt=""
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="small opacity-75">{p.tag || "Tag"}</div>
              <div className="fw-semibold">{p.title || "Title"}</div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">{p.year || "Year"}</span>
                <span className="text-muted">{p.href ? "link ✓" : "no link"}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Editor grid */}
      <Row className="g-3">
        {projects.map((p, i) => (
          <Col md={6} lg={4} key={i}>
            <Card className="p-3 h-100">
              <div className="mb-2 fw-semibold">Project #{i + 1}</div>

              <Form.Group className="mb-2">
                <Form.Label>Image (upload on Save)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={pickFile(i)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Tag (small label)</Form.Label>
                <Form.Control value={p.tag || ""} onChange={setField(i, "tag")} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control value={p.title || ""} onChange={setField(i, "title")} />
              </Form.Group>

              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Year</Form.Label>
                    <Form.Control value={p.year || ""} onChange={setField(i, "year")} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Link (href)</Form.Label>
                    <Form.Control value={p.href || ""} onChange={setField(i, "href")} />
                  </Form.Group>
                </Col>
              </Row>
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
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ProjectStudioPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ProjectStudioPage;


