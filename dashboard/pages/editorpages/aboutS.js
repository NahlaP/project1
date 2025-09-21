
// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Table,
//   Toast,
//   ToastContainer,
//   Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import {
//   backendBaseUrl,
//   userId,
//   templateId,
//   s3Bucket,
//   s3Region,
// } from "../../lib/config";
// import BackBar from "../components/BackBar";

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


// const readErr = async (res) => {
//   const txt = await res.text().catch(() => "");
//   try {
//     const j = JSON.parse(txt);
//     return j?.error || j?.message || txt || `HTTP ${res.status}`;
//   } catch {
//     return txt || `HTTP ${res.status}`;
//   }
// };

// function AboutEditorPage() {
//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",
//     imageAlt: "",
//     bullets: [],
//   });

//   // local draft image (preview until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [error, setError] = useState("");


//   const GET_URL = `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const PUT_URL = GET_URL;
//   const TOKEN_URL = `${GET_URL}/upload-token`; // ask backend for cPanel token

//   // Load current About (server returns public imageUrl as-is)
//   const loadAbout = async () => {
//     setError("");
//     const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const data = await res.json();
//     if (data) setAbout((p) => ({ ...p, ...data }));
//   };

//   useEffect(() => {
//     loadAbout().catch((e) => setError(String(e.message || e)));
//   }, []);

//   // keep your image "sections/..." rewriter
//   useEffect(() => {
//     const rewrite = () => {
//       const imgs = document.querySelectorAll("img");
//       imgs.forEach((img) => {
//         const raw = img.getAttribute("src") || "";
//         if (!isAbs(raw) && !raw.startsWith("/") && /^sections\//i.test(raw)) {
//           const fixed = toAbs(raw);
//           if (fixed && fixed !== raw) {
//             img.src = fixed;
//             img.setAttribute("data-rewritten", "true");
//           }
//         }
//       });
//     };
//     rewrite();
//     const mo = new MutationObserver((muts) => {
//       let needs = false;
//       for (const m of muts) {
//         if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG") needs = true;
//         if (m.type === "childList") needs = true;
//       }
//       if (needs) rewrite();
//     });
//     mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
//     return () => mo.disconnect();
//   }, []);

//   // field helpers
//   const handleChange = (key, value) => setAbout((prev) => ({ ...prev, [key]: value }));
//   const handleBulletChange = (idx, value) => {
//     const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
//     if (!updated[idx]) updated[idx] = { text: "" };
//     updated[idx].text = value;
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };
//   const addBullet = () =>
//     setAbout((p) => ({
//       ...p,
//       bullets: [...(Array.isArray(p.bullets) ? p.bullets : []), { text: "" }],
//     }));
//   const removeBullet = (idx) => {
//     const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
//     updated.splice(idx, 1);
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };

//   // choose file -> preview only
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

// const uploadViaCpanel = async (file) => {
//   // 1) ask backend for short-lived token + upload URL
//   const meta = {
//     filename: file.name,
//     size: file.size,
//     type: file.type || "application/octet-stream",
//   };
//   const m1 = await fetch(TOKEN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(meta),
//   });
//   if (!m1.ok) throw new Error(await readErr(m1));
//   const { token, uploadUrl } = await m1.json();

//   // 2) upload to cPanel using the SAME header Hero uses
//   const fd = new FormData();
//   fd.append("file", file);

//   const m2 = await fetch(uploadUrl, {
//     method: "POST",
//     headers: { "X-ION7-Token": token },
//     body: fd,
//   });
//   if (!m2.ok) throw new Error(await readErr(m2));
//   const j = await m2.json();

//   const url =
//     j?.url || j?.imageUrl || j?.publicUrl || j?.href || j?.link || j?.location || "";
//   if (!/^https?:\/\//i.test(url)) throw new Error("cPanel upload did not return a public URL");
//   return url;
// };


//   const handleSave = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       // 1) if a new local file is selected, upload now to cPanel
//       let imageUrlToSave = about.imageUrl || "";
//       if (draftFile) {
//         imageUrlToSave = await uploadViaCpanel(draftFile);
//       }

//       // 2) save document (text + imageUrl if present)
//       const payload = {
//         title: about.title || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageAlt: about.imageAlt || "",
//         bullets: Array.isArray(about.bullets) ? about.bullets : [],
//         ...(imageUrlToSave ? { imageUrl: imageUrlToSave } : {}),
//       };

//       const res = await fetch(PUT_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       // 3) refresh server state
//       await loadAbout();

//       // 4) clear local draft preview
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         URL.revokeObjectURL(lastObjUrlRef.current);
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");

//       setShowToast(true);
//     } catch (err) {
//       setError(String(err.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Preview priority: draft -> server URL -> placeholder
//   const safePreviewSrc = useMemo(
//     () => draftPreview || toAbs(about?.imageUrl) || "/img/about.jpg",
//     [draftPreview, about?.imageUrl]
//   );

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">ℹ️ About Section</h4>
//           <BackBar />
//         </Col>
//       </Row>

//       {error ? (
//         <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>
//           {error}
//         </Alert>
//       ) : null}

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4">
//             <div className="row g-5">
//               <div className="col-lg-6">
//                 <img
//                   src={safePreviewSrc}
//                   alt={about.imageAlt || "About Image"}
//                   className="img-fluid"
//                   style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
//                 />
//               </div>
//               <div className="col-lg-6">
//                 <h1 className="display-6 text-uppercase mb-4">
//                   {about.title || "About title..."}
//                 </h1>
//                 <p className="mb-4">{about.description || "Description..."}</p>

//                 <div className="row g-5 mb-4">
//                   {(about.bullets || []).map((b, i) => (
//                     <div key={i} className="col-sm-6">
//                       <div className="d-flex align-items-center">
//                         <div className="flex-shrink-0 btn-xl-square bg-light me-3">
//                           <i className="fa fa-check-square fa-2x text-primary"></i>
//                         </div>
//                         <h5 className="lh-base text-uppercase mb-0">
//                           {b?.text || ""}
//                         </h5>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="border border-5 border-primary p-4 text-center mt-4">
//                   <h4 className="lh-base text-uppercase mb-0">
//                     {about.highlight || "Highlight text..."}
//                   </h4>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <Row className="mb-3">
//           <Col md={8}>
//             <Form.Group>
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 value={about.title || ""}
//                 onChange={(e) => handleChange("title", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Image (choose – preview only)</Form.Label>
//               {/* only sets local preview; upload happens in Save */}
//               <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col>
//             <Form.Group>
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={4}
//                 value={about.description || ""}
//                 onChange={(e) => handleChange("description", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col>
//             <Form.Group>
//               <Form.Label>Highlight (bottom bordered text)</Form.Label>
//               <Form.Control
//                 value={about.highlight || ""}
//                 onChange={(e) => handleChange("highlight", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <h6 className="fw-bold mt-3 mb-2">Bullets</h6>
//         <Table striped bordered>
//           <thead>
//             <tr>
//               <th style={{ width: "80%" }}>Text</th>
//               <th style={{ width: "20%" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(about.bullets || []).map((b, idx) => (
//               <tr key={idx}>
//                 <td>
//                   <Form.Control
//                     value={b?.text || ""}
//                     onChange={(e) => handleBulletChange(idx, e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => removeBullet(idx)}
//                   >
//                     ❌ Remove
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={2}>
//                 <Button variant="outline-primary" size="sm" onClick={addBullet}>
//                   ➕ Add Bullet
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <div className="d-flex justify-content-end">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save"}
//           </Button>
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
//           <Toast.Body className="text-white">
//             ✅ Saved successfully.
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// AboutEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AboutEditorPage;


































// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId,
  templateId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || "";
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// Convert a RELATIVE key like "sections/about/xyz.jpg" into ABSOLUTE S3 URL
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return u; // root-relative OK
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

function AboutEditorPage() {
  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    imageUrl: "",
    imageAlt: "",
    bullets: [],
  });

  // local draft image (preview-only until Save)
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false); // <-- floater

  // Load current About
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const data = await res.json();
        if (data) setAbout((p) => ({ ...p, ...data }));
      } catch (err) {
        console.error("❌ Failed to load About section", err);
      }
    })();
  }, []);

  // Rewriter for any "sections/..." <img> that slip in
  useEffect(() => {
    const rewrite = () => {
      const imgs = document.querySelectorAll("img");
      imgs.forEach((img) => {
        const raw = img.getAttribute("src") || "";
        if (!isAbs(raw) && !raw.startsWith("/") && /^sections\//i.test(raw)) {
          const fixed = toAbs(raw);
          if (fixed && fixed !== raw) {
            img.src = fixed;
            img.setAttribute("data-rewritten", "true");
          }
        }
      });
    };
    rewrite();
    const mo = new MutationObserver((muts) => {
      let needs = false;
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG") needs = true;
        if (m.type === "childList") needs = true;
      }
      if (needs) rewrite();
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
    return () => mo.disconnect();
  }, []);

  // field helpers
  const handleChange = (key, value) => setAbout((prev) => ({ ...prev, [key]: value }));

  const handleBulletChange = (idx, value) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    if (!updated[idx]) updated[idx] = { text: "" };
    updated[idx].text = value;
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const addBullet = () =>
    setAbout((p) => ({
      ...p,
      bullets: [...(Array.isArray(p.bullets) ? p.bullets : []), { text: "" }],
    }));

  const removeBullet = (idx) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    updated.splice(idx, 1);
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  // choose file -> local preview ONLY (no upload)
  const onPickLocal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    lastObjUrlRef.current = objUrl;

    setDraftFile(file);
    setDraftPreview(objUrl);
  };

  // used only by Save
  const uploadDraftIfNeeded = async () => {
    if (!draftFile) return null;
    const form = new FormData();
    form.append("image", draftFile);
    const res = await fetch(`${API}/api/about/${userId}/${templateId}/image`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    const data = await res.json();
    // Expect relative URL back
    return data?.result?.imageUrl || data?.imageUrl || null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1) If a new file was chosen, upload now and capture relative URL
      const newRelUrl = await uploadDraftIfNeeded();

      // 2) Build payload (send relative URL if new one arrived)
      const payload = {
        title: about.title || "",
        description: about.description || "",
        highlight: about.highlight || "",
        imageAlt: about.imageAlt || "",
        bullets: Array.isArray(about.bullets) ? about.bullets : [],
        imageUrl: newRelUrl ? newRelUrl : (about.imageUrl || ""),
      };

      // 3) Save doc
      const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data?.message || data?.ok) {
        // refresh to normalize from server
        const fresh = await fetch(`${API}/api/about/${userId}/${templateId}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const freshData = await fresh.json();
        setAbout((p) => ({ ...p, ...freshData }));

        // clear draft preview
        setDraftFile(null);
        if (lastObjUrlRef.current) {
          URL.revokeObjectURL(lastObjUrlRef.current);
          lastObjUrlRef.current = null;
        }
        setDraftPreview("");

        // show floater
        setShowToast(true);
      }
    } catch (err) {
      alert("❌ Save failed: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Always render a preview: draft first, then S3 absolute, then local placeholder
  const safePreviewSrc = useMemo(
    () => draftPreview || toAbs(about?.imageUrl) || "/img/about.jpg",
    [draftPreview, about?.imageUrl]
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">ℹ️ About Section</h4>
          <BackBar />
        </Col>
      </Row>

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                <img
                  src={safePreviewSrc}
                  alt={about.imageAlt || "About Image"}
                  className="img-fluid"
                  style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
                />
              </div>
              <div className="col-lg-6">
                <h1 className="display-6 text-uppercase mb-4">
                  {about.title || "About title..."}
                </h1>
                <p className="mb-4">{about.description || "Description..."}</p>

                <div className="row g-5 mb-4">
                  {(about.bullets || []).map((b, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                          <i className="fa fa-check-square fa-2x text-primary"></i>
                        </div>
                        <h5 className="lh-base text-uppercase mb-0">
                          {b?.text || ""}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-5 border-primary p-4 text-center mt-4">
                  <h4 className="lh-base text-uppercase mb-0">
                    {about.highlight || "Highlight text..."}
                  </h4>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={about.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Image (choose – preview only)</Form.Label>
              {/* only sets local preview; upload happens in Save */}
              <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={about.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Highlight (bottom bordered text)</Form.Label>
              <Form.Control
                value={about.highlight || ""}
                onChange={(e) => handleChange("highlight", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <h6 className="fw-bold mt-3 mb-2">Bullets</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Text</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(about.bullets || []).map((b, idx) => (
              <tr key={idx}>
                <td>
                  <Form.Control
                    value={b?.text || ""}
                    onChange={(e) => handleBulletChange(idx, e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeBullet(idx)}
                  >
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Button variant="outline-primary" size="sm" onClick={addBullet}>
                  ➕ Add Bullet
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save"}
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
          <Toast.Body className="text-white">
            ✅ Saved successfully.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

AboutEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AboutEditorPage;

