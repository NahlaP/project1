

// og
// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseS.js
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Container, Row, Col, Card, Button, Form, Alert, Table,
//   Toast, ToastContainer,               // ⬅️ add
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";
// import BackBar from "../components/BackBar";

// // API base: keep '' so /api is proxied by Next when backendBaseUrl is empty
// const API = backendBaseUrl || "";

// // Build a public S3 URL from a plain key (for instant preview)
// const absFromKey = (key) =>
//   key && s3Bucket && s3Region
//     ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
//     : "";

// // Helpers
// const readErr = async (res) => {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// };
// const isPresigned = (url) =>
//   /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
// const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

// function WhyChooseEditorPage() {
//   const [state, setState] = useState({
//     description: "",
//     stats: [],
//     progressBars: [],
//     bgOverlay: 0.5,
//     bgImageKey: "",    // S3 key to persist in DB
//     displayUrl: "",    // absolute (pre-signed or public) URL for preview
//   });

//   // draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreviewUrl, setDraftPreviewUrl] = useState("");
//   const lastObjUrlRef = useRef("");

//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);

//   // toast (floater)
//   const [showToast, setShowToast] = useState(false);      // ⬅️ add

//   const GET_URL = `${API}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const PUT_URL = GET_URL;
//   const UPLOAD_BG_URL = `${GET_URL}/bg`;
//   const DELETE_BG_URL = `${GET_URL}/bg`;

//   const loadData = async () => {
//     setError("");
//     const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const j = await res.json();

//     // server returns: bgImageKey (key) and/or bgImageUrl (pre-signed URL)
//     const serverKey = typeof j?.bgImageKey === "string" ? j.bgImageKey : "";
//     const serverUrl = typeof j?.bgImageUrl === "string" ? j.bgImageUrl : absFromKey(serverKey);

//     setState((p) => ({
//       ...p,
//       description: j?.description || "",
//       stats: Array.isArray(j?.stats) ? j.stats : [],
//       progressBars: Array.isArray(j?.progressBars) ? j.progressBars : [],
//       bgOverlay: typeof j?.bgOverlay === "number" ? j.bgOverlay : 0.5,
//       bgImageKey: serverKey,
//       displayUrl: bust(serverUrl || ""),
//     }));
//   };

//   useEffect(() => { loadData().catch((e) => setError(String(e.message || e))); }, []);

//   // ------- form change helpers -------
//   const handleChange = (key, value) => setState((prev) => ({ ...prev, [key]: value }));
//   const updateArray = (field, idx, key, value) => {
//     const updated = [...(state[field] || [])];
//     if (!updated[idx]) updated[idx] = {};
//     updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
//     setState((p) => ({ ...p, [field]: updated }));
//   };
//   const addItem = (field, item) => setState((p) => ({ ...p, [field]: [...(p[field] || []), item] }));
//   const removeItem = (field, idx) => {
//     const updated = [...(state[field] || [])];
//     updated.splice(idx, 1);
//     setState((p) => ({ ...p, [field]: updated }));
//   };

//   // ------- choose bg locally (preview only) -------
//   const onPickLocalBg = (file) => {
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); return; }
//     const url = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//     }
//     lastObjUrlRef.current = url;
//     setDraftFile(file);
//     setDraftPreviewUrl(url);
//     setError("");
//   };

//   // ------- save all (text + arrays + overlay + bgImageKey) -------
//   const handleSave = async () => {
//     setSaving(true); setError("");
//     try {
//       let keyToPersist = state.bgImageKey || "";

//       // 1) If a new file was selected, upload it now and capture the S3 key
//       if (draftFile) {
//         const form = new FormData();
//         form.append("image", draftFile);
//         const up = await fetch(UPLOAD_BG_URL, { method: "POST", body: form });
//         if (!up.ok) throw new Error(await readErr(up));
//         const uj = await up.json();

//         const uploadedKey =
//           uj?.result?.bgImageKey ||
//           uj?.result?.bgImageUrl ||
//           uj?.bgImageKey ||
//           uj?.key ||
//           "";

//         if (!uploadedKey) throw new Error("Upload succeeded but no key was returned.");
//         keyToPersist = uploadedKey;
//       }

//       // 2) Persist document (only the key, not the preview URL)
//       const payload = {
//         description: state.description,
//         stats: state.stats,
//         progressBars: state.progressBars,
//         bgOverlay: state.bgOverlay,
//         bgImageKey: keyToPersist,
//       };

//       const put = await fetch(PUT_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!put.ok) throw new Error(await readErr(put));

//       // 3) Refresh from server (to get fresh pre-signed URL if provided)
//       await loadData();

//       // 4) Clear draft preview
//       if (lastObjUrlRef.current) {
//         try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//         lastObjUrlRef.current = "";
//       }
//       setDraftFile(null);
//       setDraftPreviewUrl("");

//       // 5) show floater ✅
//       setShowToast(true);
//     } catch (e) {
//       setError(String(e.message || e));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteBg = async () => {
//     setError("");
//     try {
//       const res = await fetch(DELETE_BG_URL, { method: "DELETE" });
//       if (!res.ok) throw new Error(await readErr(res));
//       await res.json();
//       setState((p) => ({ ...p, bgImageKey: "", displayUrl: "" }));
//       if (lastObjUrlRef.current) {
//         try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//         lastObjUrlRef.current = "";
//       }
//       setDraftFile(null);
//       setDraftPreviewUrl("");
//     } catch (e) {
//       setError(String(e.message || e));
//     }
//   };

//   const refreshPreview = async () => {
//     try { await loadData(); }
//     catch (e) { setError(String(e.message || e)); }
//   };

//   const previewBg = draftPreviewUrl || state.displayUrl;

//   return (
//     <Container fluid className="py-4">
//       <Row><Col><h4 className="fw-bold">🏆 Why Choose Us Section</h4> <BackBar /></Col></Row>

//       {/* keep only error alerts */}
//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card
//             className="p-0 overflow-hidden"
//             style={{
//               backgroundImage: previewBg ? `url(${previewBg})` : "none",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               position: "relative",
//               minHeight: 480,
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 background: `rgba(0,0,0,${state.bgOverlay ?? 0})`,
//               }}
//             />
//             <div className="p-4 position-relative" style={{ zIndex: 2 }}>
//               <h1 className="display-6 text-white text-uppercase mb-4">
//                 Why You Should Choose Our Services
//               </h1>
//               <p className="text-light mb-4">
//                 {state.description || "Description here..."}
//               </p>

//               <Row className="mb-4">
//                 {(state.stats || []).map((s, i) => (
//                   <Col key={i} sm={6}>
//                     <div className="flex-column text-center border border-5 border-primary p-5">
//                       <h1 className="text-white">{s.value}</h1>
//                       <p className="text-white text-uppercase mb-0">{s.label}</p>
//                     </div>
//                   </Col>
//                 ))}
//               </Row>

//               <div className="border border-5 border-primary border-bottom-0 p-4">
//                 {(state.progressBars || []).map((bar, i) => (
//                   <div key={i} className="mb-3">
//                     <div className="d-flex justify-content-between mb-2">
//                       <span className="text-white text-uppercase">{bar.label}</span>
//                       <span className="text-white">{bar.percent}%</span>
//                     </div>
//                     <div className="progress">
//                       <div
//                         className="progress-bar bg-primary"
//                         role="progressbar"
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                         aria-valuenow={bar.percent}
//                         style={{ width: `${bar.percent}%` }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <Row className="mb-4">
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Background Image</Form.Label>
//               <div className="d-flex gap-2">
//                 {/* preview-only; upload occurs on Save */}
//                 <Form.Control
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => onPickLocalBg(e.target.files?.[0] || null)}
//                 />
//                 <Button variant="outline-secondary" onClick={refreshPreview}>Refresh preview</Button>
//               </div>
//               {previewBg && (
//                 <div className="mt-2 d-flex align-items-center gap-2">
//                   <img
//                     src={previewBg}
//                     alt="bg"
//                     style={{ height: 60, borderRadius: 4 }}
//                     onError={() => setError("Preview failed (URL may have expired). Click Refresh preview.")}
//                   />
//                   <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
//                     Remove
//                   </Button>
//                 </div>
//               )}
//               <div className="small text-muted mt-1">
//                 <strong>Stored key:</strong> {state.bgImageKey || "(none)"}{" "}
//                 {draftPreviewUrl && <em className="ms-2">(Draft selected – not saved yet)</em>}
//               </div>
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Overlay (0 - 1)</Form.Label>
//               <Form.Range
//                 min={0}
//                 max={1}
//                 step={0.05}
//                 value={state.bgOverlay ?? 0.5}
//                 onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
//               />
//               <div className="text-muted small">{state.bgOverlay ?? 0.5}</div>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Form.Group className="mb-4">
//           <Form.Label>Description</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={3}
//             value={state.description || ""}
//             onChange={(e) => handleChange("description", e.target.value)}
//           />
//         </Form.Group>

//         <h6 className="fw-bold">📊 Stats</h6>
//         <Table bordered size="sm">
//           <thead>
//             <tr><th>Label</th><th>Value</th><th>Action</th></tr>
//           </thead>
//           <tbody>
//             {(state.stats || []).map((s, i) => (
//               <tr key={i}>
//                 <td>
//                   <Form.Control
//                     value={s.label}
//                     onChange={(e) => updateArray("stats", i, "label", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Form.Control
//                     type="number"
//                     value={s.value}
//                     onChange={(e) => updateArray("stats", i, "value", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button size="sm" variant="outline-danger" onClick={() => removeItem("stats", i)}>❌</Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={3}>
//                 <Button size="sm" variant="outline-primary" onClick={() => addItem("stats", { label: "", value: 0 })}>
//                   ➕ Add Stat
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
//         <Table bordered size="sm">
//           <thead>
//             <tr><th>Label</th><th>Percent</th><th>Action</th></tr>
//           </thead>
//           <tbody>
//             {(state.progressBars || []).map((b, i) => (
//               <tr key={i}>
//                 <td>
//                   <Form.Control
//                     value={b.label}
//                     onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Form.Control
//                     type="number"
//                     value={b.percent}
//                     onChange={(e) => updateArray("progressBars", i, "percent", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button size="sm" variant="outline-danger" onClick={() => removeItem("progressBars", i)}>❌</Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={3}>
//                 <Button size="sm" variant="outline-primary" onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
//                   ➕ Add Progress Bar
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <div className="text-end">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save Changes"}
//           </Button>
//         </div>
//       </Card>

//       {/* Floating toast (floater) */}
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

// WhyChooseEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default WhyChooseEditorPage;
















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseS.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table,
  Toast, ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

// API base: keep '' so /api is proxied by Next when backendBaseUrl is empty
const API = backendBaseUrl || "";

// Build a public S3 URL from a plain key (for instant preview)
const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

// Helpers
const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

/** Resolve templateId in this order:
 *  1) ?templateId=… in URL
 *  2) backend-selected template for the user
 *  3) config fallback (legacy)
 */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL param
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
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
      if (!off) setTpl(defaultTemplateId || "gym-template-1");
    })();
    return () => { off = true; };
  }, [userId]);
  return tpl;
}

function WhyChooseEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [state, setState] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgOverlay: 0.5,
    bgImageKey: "",    // S3 key to persist in DB
    displayUrl: "",    // absolute (pre-signed or public) URL for preview
  });

  // draft image (preview-only until Save)
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreviewUrl, setDraftPreviewUrl] = useState("");
  const lastObjUrlRef = useRef("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // toast (floater)
  const [showToast, setShowToast] = useState(false);

  const GET_URL = templateId
    ? `${API}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`
    : "";
  const PUT_URL = GET_URL;
  const UPLOAD_BG_URL = GET_URL ? `${GET_URL}/bg` : "";
  const DELETE_BG_URL = GET_URL ? `${GET_URL}/bg` : "";

  const loadData = async () => {
    if (!GET_URL) return;
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json();

    // server returns: bgImageKey (key) and/or bgImageUrl (pre-signed URL)
    const serverKey = typeof j?.bgImageKey === "string" ? j.bgImageKey : "";
    const serverUrl = typeof j?.bgImageUrl === "string" ? j.bgImageUrl : absFromKey(serverKey);

    setState((p) => ({
      ...p,
      description: j?.description || "",
      stats: Array.isArray(j?.stats) ? j.stats : [],
      progressBars: Array.isArray(j?.progressBars) ? j.progressBars : [],
      bgOverlay: typeof j?.bgOverlay === "number" ? j.bgOverlay : 0.5,
      bgImageKey: serverKey,
      displayUrl: bust(serverUrl || ""),
    }));
  };

  // load whenever the effective templateId changes
  useEffect(() => {
    if (!templateId) return;
    loadData().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // ------- form change helpers -------
  const handleChange = (key, value) => setState((prev) => ({ ...prev, [key]: value }));
  const updateArray = (field, idx, key, value) => {
    const updated = [...(state[field] || [])];
    if (!updated[idx]) updated[idx] = {};
    updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
    setState((p) => ({ ...p, [field]: updated }));
  };
  const addItem = (field, item) => setState((p) => ({ ...p, [field]: [...(p[field] || []), item] }));
  const removeItem = (field, idx) => {
    const updated = [...(state[field] || [])];
    updated.splice(idx, 1);
    setState((p) => ({ ...p, [field]: updated }));
  };

  // ------- choose bg locally (preview only) -------
  const onPickLocalBg = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); return; }
    const url = URL.createObjectURL(file);
    if (lastObjUrlRef.current) {
      try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    }
    lastObjUrlRef.current = url;
    setDraftFile(file);
    setDraftPreviewUrl(url);
    setError("");
  };

  // ------- save all (text + arrays + overlay + bgImageKey) -------
  const handleSave = async () => {
    if (!PUT_URL) return;
    setSaving(true); setError("");
    try {
      let keyToPersist = state.bgImageKey || "";

      // 1) If a new file was selected, upload it now and capture the S3 key
      if (draftFile) {
        const form = new FormData();
        form.append("image", draftFile);
        const up = await fetch(UPLOAD_BG_URL, { method: "POST", body: form });
        if (!up.ok) throw new Error(await readErr(up));
        const uj = await up.json();

        const uploadedKey =
          uj?.result?.bgImageKey ||
          uj?.bgImageKey ||
          uj?.key ||
          "";

        if (!uploadedKey) throw new Error("Upload succeeded but no key was returned.");
        keyToPersist = uploadedKey;
      }

      // 2) Persist document (only the key, not the preview URL)
      const payload = {
        description: state.description,
        stats: state.stats,
        progressBars: state.progressBars,
        bgOverlay: state.bgOverlay,
        bgImageKey: keyToPersist,
      };

      const put = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!put.ok) throw new Error(await readErr(put));

      // 3) Refresh from server (to get fresh pre-signed URL if provided)
      await loadData();

      // 4) Clear draft preview
      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
        lastObjUrlRef.current = "";
      }
      setDraftFile(null);
      setDraftPreviewUrl("");

      // 5) show floater ✅
      setShowToast(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBg = async () => {
    if (!DELETE_BG_URL) return;
    setError("");
    try {
      const res = await fetch(DELETE_BG_URL, { method: "DELETE" });
      if (!res.ok) throw new Error(await readErr(res));
      await res.json();
      setState((p) => ({ ...p, bgImageKey: "", displayUrl: "" }));
      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
        lastObjUrlRef.current = "";
      }
      setDraftFile(null);
      setDraftPreviewUrl("");
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const refreshPreview = async () => {
    try { await loadData(); }
    catch (e) { setError(String(e.message || e)); }
  };

  const previewBg = draftPreviewUrl || state.displayUrl;

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🏆 Why Choose Us Section</h4> <BackBar /></Col></Row>

      {/* keep only error alerts */}
      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-0 overflow-hidden"
            style={{
              backgroundImage: previewBg ? `url(${previewBg})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              minHeight: 480,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(0,0,0,${state.bgOverlay ?? 0})`,
              }}
            />
            <div className="p-4 position-relative" style={{ zIndex: 2 }}>
              <h1 className="display-6 text-white text-uppercase mb-4">
                Why You Should Choose Our Services
              </h1>
              <p className="text-light mb-4">
                {state.description || "Description here..."}
              </p>

              <Row className="mb-4">
                {(state.stats || []).map((s, i) => (
                  <Col key={i} sm={6}>
                    <div className="flex-column text-center border border-5 border-primary p-5">
                      <h1 className="text-white">{s.value}</h1>
                      <p className="text-white text-uppercase mb-0">{s.label}</p>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="border border-5 border-primary border-bottom-0 p-4">
                {(state.progressBars || []).map((bar, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white text-uppercase">{bar.label}</span>
                      <span className="text-white">{bar.percent}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bar.percent}
                        style={{ width: `${bar.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Background Image</Form.Label>
              <div className="d-flex gap-2">
                {/* preview-only; upload occurs on Save */}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickLocalBg(e.target.files?.[0] || null)}
                />
                <Button variant="outline-secondary" onClick={refreshPreview}>Refresh preview</Button>
              </div>
              {previewBg && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={previewBg}
                    alt="bg"
                    style={{ height: 60, borderRadius: 4 }}
                    onError={() => setError("Preview failed (URL may have expired). Click Refresh preview.")}
                  />
                  <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
                    Remove
                  </Button>
                </div>
              )}
              <div className="small text-muted mt-1">
                <strong>Stored key:</strong> {state.bgImageKey || "(none)"}{" "}
                {draftPreviewUrl && <em className="ms-2">(Draft selected – not saved yet)</em>}
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Overlay (0 - 1)</Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
                value={state.bgOverlay ?? 0.5}
                onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
              />
              <div className="text-muted small">{state.bgOverlay ?? 0.5}</div>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={state.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Form.Group>

        <h6 className="fw-bold">📊 Stats</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Value</th><th>Action</th></tr>
          </thead>
          <tbody>
            {(state.stats || []).map((s, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={s.label}
                    onChange={(e) => updateArray("stats", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={s.value}
                    onChange={(e) => updateArray("stats", i, "value", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("stats", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary" onClick={() => addItem("stats", { label: "", value: 0 })}>
                  ➕ Add Stat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Percent</th><th>Action</th></tr>
          </thead>
          <tbody>
            {(state.progressBars || []).map((b, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={b.label}
                    onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={b.percent}
                    onChange={(e) => updateArray("progressBars", i, "percent", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("progressBars", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary" onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
                  ➕ Add Progress Bar
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save Changes"}
          </Button>
        </div>
      </Card>

      {/* Floating toast (floater) */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default WhyChooseEditorPage;






















