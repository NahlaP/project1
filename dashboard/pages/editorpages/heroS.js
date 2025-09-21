


// // pages/editorpages/heroS.js
// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert, Toast, ToastContainer
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";
// import BackBar from "../components/BackBar";

// const API = backendBaseUrl || "";

// const readErr = async (res) => {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// };

// function HeroEditorPage() {
//   // server-saved state
//   const [state, setState] = useState({ content: "", imageUrl: "" });

  
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [showToast, setShowToast] = useState(false);

//   const GET_URL = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const PUT_URL = GET_URL; // PUT text/url
//   const TOKEN_URL = `${GET_URL}/upload-token`; // asks backend for cPanel token

//   const loadHero = async () => {
//     setError("");
//     const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const data = await res.json();
//     setState({
//       content: data?.content || "",
//       imageUrl: data?.imageUrl || "", 
//     });
//   };

//   useEffect(() => { loadHero().catch((e) => setError(String(e.message || e))); }, []);
//   useEffect(() => () => { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); }, []);

//   // choose file -> only preview locally (no upload yet)
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 10 * 1024 * 1024) {
//       setError("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }

//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//     setError("");
//   };

//   // Upload a draft image via cPanel flow → returns public URL string
//   const uploadViaCpanel = async (file) => {
//     // 1) ask backend for short-lived token & upload URL
//     const meta = {
//       filename: file.name,
//       size: file.size,
//       type: file.type || "application/octet-stream",
//     };
//     const m1 = await fetch(TOKEN_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(meta),
//     });
//     if (!m1.ok) throw new Error(await readErr(m1));
//     const { token, uploadUrl } = await m1.json();

//     // 2) upload directly to cPanel
//     const fd = new FormData();
//     fd.append("file", file);
//     const m2 = await fetch(uploadUrl, {
//       method: "POST",
//       headers: { "X-ION7-Token": token },
//       body: fd,
//     });
//     if (!m2.ok) throw new Error(await readErr(m2));
//     const j = await m2.json();
//     const url = j?.url || "";
//     if (!/^https?:\/\//i.test(url)) throw new Error("cPanel upload did not return a public URL");
//     return url;
//   };

//   const onSave = async () => {
//     setSaving(true); setError("");
//     try {
//       // 1) If a new local file is selected, upload to cPanel now
//       let imageUrlToSave = state.imageUrl || "";
//       if (draftFile) {
//         imageUrlToSave = await uploadViaCpanel(draftFile);
//       }

//       // 2) Save hero doc (content + imageUrl if present)
//       const payload = {
//         content: state.content || "",
//         ...(imageUrlToSave ? { imageUrl: imageUrlToSave } : {}),
//       };
//       const res = await fetch(PUT_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       // 3) refresh server data
//       await loadHero();

//       // 4) clear local draft preview
//       setDraftFile(null);
//       if (lastObjUrlRef.current) { URL.revokeObjectURL(lastObjUrlRef.current); lastObjUrlRef.current = null; }
//       setDraftPreview("");

//       setShowToast(true);
//     } catch (err) {
//       setError(String(err.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🖼️ Hero Section</h4>
//           <BackBar />
//         </Col>
//       </Row>

//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         <div className="row g-5">
//           <div className="col-lg-6">
//             {(draftPreview || state.imageUrl) ? (
//               <RBImage
//                 src={draftPreview || state.imageUrl}
//                 alt="Hero preview"
//                 className="img-fluid"
//                 style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//               />
//             ) : (
//               <div className="text-muted">No image chosen yet</div>
//             )}

//             <div className="d-flex gap-2 mt-2">
//               <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//               <Button variant="outline-secondary" onClick={() => loadHero()}>
//                 Refresh server image
//               </Button>
//             </div>

//             <div className="small text-muted mt-2">
//               <div><strong>Stored URL:</strong> {state.imageUrl || "(none)"} </div>
//               <div>
//                 <strong>Draft selected:</strong>{" "}
//                 {draftFile ? `${draftFile.name} (unsaved)` : "(no draft)"}
//               </div>
//             </div>
//           </div>

//           <div className="col-lg-6">
//             <Form.Group className="mb-3">
//               <Form.Label>Hero Headline</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={state.content || ""}
//                 onChange={(e) => setState((p) => ({ ...p, content: e.target.value }))}
//                 placeholder="Write a motivational welcome message..."
//               />
//             </Form.Group>

//             <div className="d-flex justify-content-end">
//               <Button onClick={onSave} disabled={saving}>
//                 {saving ? "Saving…" : "💾 Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Floating toast */}
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

// HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default HeroEditorPage;













// og
// pages/editorpages/heroS.js
"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container, Row, Col, Card, Form, Button, Image as RBImage, Alert, Toast, ToastContainer
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || ""; 

const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
};

function HeroEditorPage() {
  // server-saved state
  const [state, setState] = useState({ content: "", imageKey: "", displayUrl: "" });

  // local draft image (preview-only until Save)
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(""); // kept for logic; not rendered as Alert
  const [error, setError] = useState("");

  // floater (toast)
  const [showToast, setShowToast] = useState(false);

  const GET_URL    = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  const PUT_URL    = GET_URL;            // PUT text/key
  const UPLOAD_URL = `${GET_URL}/image`; // POST image (used only inside Save)

  const loadHero = async () => {
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const data = await res.json();
    setState({
      content:  data?.content  || "",
      imageKey: data?.imageKey || "",
      displayUrl: data?.imageUrl || absFromKey(data?.imageKey || ""),
    });
  };

  useEffect(() => { loadHero().catch((e) => setError(String(e.message || e))); }, []);

  useEffect(() => {
    return () => { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); };
  }, []);

  // choose file -> only preview locally (no upload)
  const onPickLocal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be ≤ 10 MB");
      e.target.value = "";
      return;
    }

    const objUrl = URL.createObjectURL(file);
    if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    lastObjUrlRef.current = objUrl;

    setDraftFile(file);
    setDraftPreview(objUrl);
    setSuccess("");
    setError("");
  };

  // helper used ONLY in Save
  const uploadDraftIfNeeded = async () => {
    if (!draftFile) return null;
    const form = new FormData();
    form.append("image", draftFile); // multer expects "image"
    const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json(); // { imageKey/key, imageUrl? }
    return (j?.imageKey || j?.key || "").replace(/^\/+/, "");
  };

  const onSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      // 1) If user chose a new file, upload it now
      const newKey = await uploadDraftIfNeeded();

      // 2) Save doc (include imageKey only if changed)
      const payload = {
        content: state.content || "",
        ...(newKey ? { imageKey: newKey } : {}),
      };

      const res = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readErr(res));

      // 3) refresh server data (gets signed URL etc.)
      await loadHero();

      // 4) clear local draft preview
      setDraftFile(null);
      setDraftPreview("");
      if (lastObjUrlRef.current) { URL.revokeObjectURL(lastObjUrlRef.current); lastObjUrlRef.current = null; }

      setSuccess("✅ Saved!");
      setShowToast(true); // <-- show floater
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🖼️ Hero Section</h4>
          <BackBar />
        </Col>
      </Row>

      {/* Keep error Alert; success is shown via the toast floater */}
      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <div className="row g-5">
          <div className="col-lg-6">
            {(draftPreview || state.displayUrl) ? (
              <RBImage
                src={draftPreview || state.displayUrl}
                alt="Hero preview"
                className="img-fluid"
                style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
              />
            ) : (
              <div className="text-muted">No image chosen yet</div>
            )}

            <div className="d-flex gap-2 mt-2">
              {/* only sets local preview; no upload */}
              <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
              <Button variant="outline-secondary" onClick={() => loadHero()}>
                Refresh server image
              </Button>
            </div>

            <div className="small text-muted mt-2">
              <div><strong>Stored key:</strong> {state.imageKey || "(none)"} </div>
              <div>
                <strong>Draft selected:</strong>{" "}
                {draftFile ? `${draftFile.name} (unsaved)` : "(no draft)"}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <Form.Group className="mb-3">
              <Form.Label>Hero Headline</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={state.content || ""}
                onChange={(e) => setState((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write a motivational welcome message..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "💾 Save"}
              </Button>
            </div>
          </div>
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
          <Toast.Body className="text-white">
            ✅ Saved successfully.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;



