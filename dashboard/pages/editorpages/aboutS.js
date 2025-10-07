




// og
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

// // Convert a RELATIVE key like "sections/about/xyz.jpg" into ABSOLUTE S3 URL
// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;
//   if (u.startsWith("/")) return u; // root-relative OK
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
//   }
//   return u;
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

//   // local draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false); // <-- floater

//   // Load current About
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         const data = await res.json();
//         if (data) setAbout((p) => ({ ...p, ...data }));
//       } catch (err) {
//         console.error("❌ Failed to load About section", err);
//       }
//     })();
//   }, []);

//   // Rewriter for any "sections/..." <img> that slip in
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

//   // choose file -> local preview ONLY (no upload)
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       alert("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//   };

//   // used only by Save
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile) return null;
//     const form = new FormData();
//     form.append("image", draftFile);
//     const res = await fetch(`${API}/api/about/${userId}/${templateId}/image`, {
//       method: "POST",
//       body: form,
//     });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     const data = await res.json();
//     // Expect relative URL back
//     return data?.result?.imageUrl || data?.imageUrl || null;
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       // 1) If a new file was chosen, upload now and capture relative URL
//       const newRelUrl = await uploadDraftIfNeeded();

//       // 2) Build payload (send relative URL if new one arrived)
//       const payload = {
//         title: about.title || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageAlt: about.imageAlt || "",
//         bullets: Array.isArray(about.bullets) ? about.bullets : [],
//         imageUrl: newRelUrl ? newRelUrl : (about.imageUrl || ""),
//       };

//       // 3) Save doc
//       const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();

//       if (data?.message || data?.ok) {
//         // refresh to normalize from server
//         const fresh = await fetch(`${API}/api/about/${userId}/${templateId}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         const freshData = await fresh.json();
//         setAbout((p) => ({ ...p, ...freshData }));

//         // clear draft preview
//         setDraftFile(null);
//         if (lastObjUrlRef.current) {
//           URL.revokeObjectURL(lastObjUrlRef.current);
//           lastObjUrlRef.current = null;
//         }
//         setDraftPreview("");

//         // show floater
//         setShowToast(true);
//       }
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Always render a preview: draft first, then S3 absolute, then local placeholder
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

//       {/* Floating toast (floater) */}
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


































// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
// "use client";

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

// const API = backendBaseUrl || "";
// const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// // Convert a RELATIVE key like "sections/about/xyz.jpg" into ABSOLUTE S3 URL
// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;
//   if (u.startsWith("/")) return u; // root-relative OK (served by your backend)
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
//   }
//   return u;
// };

// // Resolve the templateId we should use (1) URL ?templateId=, (2) backend selection, (3) fallback
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tid, setTid] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" && router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTid(fromUrl);
//         return;
//       }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTid(t);
//           return;
//         }
//       } catch {}
//       // fallback template if nothing else
//       if (!off) setTid("gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [router.query.templateId, userId]);

//   return tid;
// }

// function AboutEditorPage() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",
//     imageAlt: "",
//     bullets: [],
//   });

//   // local draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false); // floater

//   // Build API URLs once templateId is known
//   const aboutGetPutUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   const aboutUploadUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/image`;
//   }, [userId, templateId]);

//   // Load current About
//   useEffect(() => {
//     if (!aboutGetPutUrl) return;
//     (async () => {
//       try {
//         const res = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         const data = await res.json().catch(() => ({}));
//         if (data) setAbout((p) => ({ ...p, ...data }));
//       } catch (err) {
//         console.error("❌ Failed to load About section", err);
//       }
//     })();
//   }, [aboutGetPutUrl]);

//   // Rewriter for any "sections/..." <img> that slip in (defensive)
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
//         if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG")
//           needs = true;
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

//   // choose file -> local preview ONLY (no upload yet)
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       alert("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//   };

//   // used only by Save
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile || !aboutUploadUrl) return null;
//     const form = new FormData();
//     form.append("image", draftFile);
//     const res = await fetch(aboutUploadUrl, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     const data = await res.json().catch(() => ({}));
//     // Expect relative URL back
//     return data?.result?.imageUrl || data?.imageUrl || null;
//   };

//   const handleSave = async () => {
//     if (!aboutGetPutUrl) return;
//     setSaving(true);
//     try {
//       // 1) If a new file was chosen, upload now and capture relative URL
//       const newRelUrl = await uploadDraftIfNeeded();

//       // 2) Build payload (send relative URL if new one arrived)
//       const payload = {
//         title: about.title || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageAlt: about.imageAlt || "",
//         bullets: Array.isArray(about.bullets) ? about.bullets : [],
//         imageUrl: newRelUrl ? newRelUrl : about.imageUrl || "",
//       };

//       // 3) Save doc
//       const res = await fetch(aboutGetPutUrl, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json().catch(() => ({}));

//       if (data?.message || data?.ok || res.ok) {
//         // refresh to normalize from server
//         const fresh = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         const freshData = await fresh.json().catch(() => ({}));
//         setAbout((p) => ({ ...p, ...freshData }));

//         // clear draft preview
//         setDraftFile(null);
//         if (lastObjUrlRef.current) {
//           URL.revokeObjectURL(lastObjUrlRef.current);
//           lastObjUrlRef.current = null;
//         }
//         setDraftPreview("");

//         // show floater
//         setShowToast(true);
//       } else {
//         const txt = await res.text().catch(() => "");
//         alert("❌ Save failed: " + (txt || "Unknown error"));
//       }
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Always render a preview: draft first, then S3 absolute, then local placeholder
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

//                 <div className="mt-3 small text-muted">
//                   <span>Template: </span>
//                   <code>{templateId || "(resolving…)"}</code>
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
//           <Button onClick={handleSave} disabled={saving || !templateId}>
//             {saving ? "Saving…" : "💾 Save"}
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

// AboutEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AboutEditorPage;




























// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
// "use client";

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
//    TEMPLATE PROFILES (what each template exposes in the About section)
// -------------------------------------------------------------------*/
// const TEMPLATE_PROFILES = {
//   "sir-template-1": {
//     about: {
//       fields: {
//         subtitle: true,
//         title: true,
//         lines: true,          // up to 3 animated lines
//         description: true,
//         highlight: true,
//         videoUrl: true,       // sir prefers video
//         posterUrl: true,
//         imageUrl: false,
//         imageAlt: false,
//         services: true,       // 3 tiles
//         bullets: false,
//       },
//     },
//   },
//   "gym-template-1": {
//     about: {
//       fields: {
//         subtitle: true,
//         title: true,
//         lines: false,
//         description: true,
//         highlight: true,
//         videoUrl: false,
//         posterUrl: false,
//         imageUrl: true,       // gym prefers image
//         imageAlt: true,
//         services: false,
//         bullets: true,
//       },
//     },
//   },
// };

// /* --------- FALLBACK (allow all fields if template unknown) --------- */
// const ALL_ABOUT_FIELDS = {
//   subtitle: true,
//   title: true,
//   lines: true,
//   description: true,
//   highlight: true,
//   imageUrl: true,
//   imageAlt: true,
//   videoUrl: true,
//   posterUrl: true,
//   services: true,
//   bullets: true,
// };

// /* -------------------------- DEFAULT CONTENT -------------------------- */
// const TEMPLATE_DEFAULTS = {
//   "sir-template-1": {
//     about: {
//       subtitle: "- About Us",
//       title:
//         "brands – building insightful strategy\ncreating unique designs.",
//       lines: ["building strategy", "creating unique designs", "since 2019"],
//       description: "",
//       highlight: "Your vision, our craft.",
//       videoUrl: "",
//       posterUrl: "",
//       services: [
//         { tag: "Branding", heading: "Branding & Design", href: "/about.html" },
//         {
//           tag: "Branding",
//           heading: "Brand Strategy & Voice",
//           href: "/about.html",
//         },
//         {
//           tag: "Design",
//           heading: "Digital & Web Design",
//           href: "/about.html",
//         },
//       ],
//     },
//   },
//   "gym-template-1": {
//     about: {
//       subtitle: "- About Us",
//       title: "Train smart. Live strong.",
//       description: "",
//       highlight: "Start today.",
//       imageUrl: "",
//       imageAlt: "About image",
//       bullets: [{ text: "" }, { text: "" }, { text: "" }],
//     },
//   },
// };

// /* ----------------------------- HELPERS ------------------------------ */
// const API = backendBaseUrl || "";
// const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;
//   if (u.startsWith("/")) return u;
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(
//       /^\/+/,
//       ""
//     )}`;
//   }
//   return u;
// };

// // which fields are allowed for this template/section
// const getAllowed = (templateId, section) => {
//   const m = TEMPLATE_PROFILES?.[templateId]?.[section]?.fields;
//   if (m && Object.keys(m).length) return m;
//   console.warn(
//     "[AboutEditor] Unknown templateId or empty profile:",
//     templateId,
//     "— using fallback (all fields)."
//   );
//   return ALL_ABOUT_FIELDS;
// };

// const pickAllowed = (obj, allowedMap) => {
//   const map = allowedMap && Object.keys(allowedMap).length ? allowedMap : null;
//   if (!map) return { ...obj };
//   const out = {};
//   Object.keys(allowedMap).forEach((k) => {
//     if (allowedMap[k] && obj[k] !== undefined) out[k] = obj[k];
//   });
//   return out;
// };

// // Resolve templateId: (1) ?templateId, (2) backend selection, (3) fallback
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tid, setTid] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTid(fromUrl);
//         return;
//       }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTid(t);
//           return;
//         }
//       } catch {}
//       if (!off) setTid("gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [router.query.templateId, userId]);

//   return tid;
// }

// /* ============================= PAGE ============================== */
// function AboutEditorPage() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const allowed = useMemo(() => getAllowed(templateId, "about"), [templateId]);

//   const [about, setAbout] = useState({
//     title: "",
//     subtitle: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",
//     imageAlt: "",
//     videoUrl: "",
//     posterUrl: "",
//     lines: [],
//     services: [
//       { tag: "", heading: "", href: "" },
//       { tag: "", heading: "", href: "" },
//       { tag: "", heading: "", href: "" },
//     ],
//     bullets: [],
//   });

//   // local draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   // Build API URLs once templateId is known
//   const aboutGetPutUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/about/${encodeURIComponent(
//       userId
//     )}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   const aboutUploadUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/about/${encodeURIComponent(
//       userId
//     )}/${encodeURIComponent(templateId)}/image`;
//   }, [userId, templateId]);

//   // Reset UI to template defaults when template changes
//   useEffect(() => {
//     const tplDefaults = TEMPLATE_DEFAULTS?.[templateId]?.about || {};
//     setAbout((prev) => ({
//       ...prev,
//       ...tplDefaults,
//     }));
//     setDraftFile(null);
//     setDraftPreview("");
//     setErrorMsg("");
//   }, [templateId]);

//   // Load current About (template-scoped)
//   useEffect(() => {
//     if (!aboutGetPutUrl) return;
//     (async () => {
//       try {
//         const res = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });
//         if (res.status === 204) return;
//         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//         const data = await res.json().catch(() => ({}));

//         const safe = pickAllowed(data || {}, allowed);

//         setAbout((prev) => {
//           const merged = { ...prev, ...safe };
//           merged.lines = Array.isArray(merged.lines) ? merged.lines : [];
//           const sv = Array.isArray(merged.services) ? merged.services : [];
//           merged.services = [
//             sv[0] || { tag: "", heading: "", href: "" },
//             sv[1] || { tag: "", heading: "", href: "" },
//             sv[2] || { tag: "", heading: "", href: "" },
//           ];
//           merged.bullets = Array.isArray(merged.bullets) ? merged.bullets : [];
//           return merged;
//         });
//       } catch (err) {
//         console.error("❌ Failed to load About section", err);
//         setErrorMsg("Failed to load About section data.");
//       }
//     })();
//   }, [aboutGetPutUrl, allowed]);

//   // Rewriter for any "sections/..." <img> (defensive)
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
//         if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG")
//           needs = true;
//         if (m.type === "childList") needs = true;
//       }
//       if (needs) rewrite();
//     });
//     mo.observe(document.body, {
//       subtree: true,
//       childList: true,
//       attributes: true,
//       attributeFilter: ["src"],
//     });
//     return () => mo.disconnect();
//   }, []);

//   // field helpers
//   const handleChange = (key, value) =>
//     setAbout((prev) => ({ ...prev, [key]: value }));

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

//   const setField = (k) => (e) => handleChange(k, e.target.value);

//   const setLine = (i, v) =>
//     setAbout((p) => {
//       const lines = Array.isArray(p.lines) ? [...p.lines] : [];
//       lines[i] = v;
//       return { ...p, lines };
//     });

//   const setService = (i, key, v) =>
//     setAbout((p) => {
//       const arr = Array.isArray(p.services) ? [...p.services] : [{}, {}, {}];
//       if (!arr[i]) arr[i] = { tag: "", heading: "", href: "" };
//       arr[i] = { ...arr[i], [key]: v };
//       return { ...p, services: arr };
//     });

//   // choose file -> local preview ONLY (no upload yet)
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       alert("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//   };

//   // used only by Save
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile || !aboutUploadUrl || !allowed.imageUrl) return null;
//     const form = new FormData();
//     form.append("image", draftFile);
//     const res = await fetch(aboutUploadUrl, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     const data = await res.json().catch(() => ({}));
//     return data?.result?.imageUrl || data?.imageUrl || null; // expect relative key
//   };

//   const handleSave = async () => {
//     if (!aboutGetPutUrl) return;
//     setSaving(true);
//     setErrorMsg("");
//     try {
//       const newRelUrl = await uploadDraftIfNeeded();

//       const payload = {
//         title: about.title || "",
//         subtitle: about.subtitle || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageAlt: about.imageAlt || "",
//         videoUrl: about.videoUrl || "",
//         posterUrl: about.posterUrl || "",
//         lines: Array.isArray(about.lines) ? about.lines : [],
//         services: Array.isArray(about.services)
//           ? about.services.slice(0, 3)
//           : [],
//         bullets: Array.isArray(about.bullets) ? about.bullets : [],
//         imageUrl: newRelUrl ? newRelUrl : about.imageUrl || "",
//       };

//       const safePayload = pickAllowed(payload, allowed);

//       const res = await fetch(aboutGetPutUrl, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(safePayload),
//         cache: "no-store",
//       });

//       const ctype = (res.headers.get("content-type") || "").toLowerCase();
//       const isJson = ctype.includes("application/json");
//       const data = isJson ? await res.json().catch(() => ({})) : null;

//       if (!res.ok) {
//         const txt = !isJson
//           ? await res.text().catch(() => "")
//           : data?.message || "";
//         throw new Error(txt || `Save failed (${res.status})`);
//       }

//       // Refresh from server
//       const fresh = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
//         headers: { Accept: "application/json" },
//         cache: "no-store",
//       });
//       if (fresh.status !== 204) {
//         const freshData = await fresh.json().catch(() => ({}));
//         const safeFresh = pickAllowed(freshData || {}, allowed);

//         setAbout((p) => {
//           const merged = { ...p, ...safeFresh };
//           merged.lines = Array.isArray(merged.lines) ? merged.lines : [];
//           const sv = Array.isArray(merged.services) ? merged.services : [];
//           merged.services = [
//             sv[0] || { tag: "", heading: "", href: "" },
//             sv[1] || { tag: "", heading: "", href: "" },
//             sv[2] || { tag: "", heading: "", href: "" },
//           ];
//           merged.bullets = Array.isArray(merged.bullets) ? merged.bullets : [];
//           return merged;
//         });
//       }

//       // clear draft preview
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         URL.revokeObjectURL(lastObjUrlRef.current);
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");

//       setShowToast(true);
//     } catch (err) {
//       setErrorMsg(err?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Preview media decision (respect template profile)
//   const safeImagePreview = useMemo(
//     () => draftPreview || toAbs(about?.imageUrl) || "/img/about.jpg",
//     [draftPreview, about?.imageUrl]
//   );

//   const showVideo = !!(allowed.videoUrl && about.videoUrl);
//   const showImage = !!allowed.imageUrl;

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">ℹ️ About Section</h4>
//             <BackBar />
//           </div>

//           {/* Debug */}
//           <div className="text-end small">
//             <div>
//               template: <code>{templateId || "(resolving…)"}</code>{" "}
//               <Badge bg="secondary">
//                 allowed fields:{" "}
//                 {Object.keys(allowed)
//                   .filter((k) => allowed[k])
//                   .join(", ") || "ALL (fallback)"}
//               </Badge>
//             </div>
//             {aboutGetPutUrl && (
//               <div className="text-muted" title={aboutGetPutUrl}>
//                 <span>endpoint:</span>{" "}
//                 <code>/api/about/{defaultUserId}/{templateId}</code>
//               </div>
//             )}
//           </div>
//         </Col>
//       </Row>

//       {errorMsg ? (
//         <Row className="mb-3">
//           <Col>
//             <Alert variant="danger" className="mb-0">
//               {errorMsg}
//             </Alert>
//           </Col>
//         </Row>
//       ) : null}

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4">
//             <div className="row g-5">
//               <div className="col-lg-6">
//                 {showVideo ? (
//                   <video
//                     controls
//                     playsInline
//                     muted
//                     loop
//                     poster={about.posterUrl || undefined}
//                     style={{
//                       width: "100%",
//                       maxHeight: 350,
//                       objectFit: "cover",
//                       borderRadius: 8,
//                     }}
//                   >
//                     <source src={about.videoUrl} />
//                   </video>
//                 ) : showImage ? (
//                   <img
//                     src={safeImagePreview}
//                     alt={about.imageAlt || "About Image"}
//                     className="img-fluid"
//                     style={{
//                       maxHeight: "350px",
//                       objectFit: "cover",
//                       width: "100%",
//                     }}
//                   />
//                 ) : (
//                   <div className="text-muted">
//                     This template has no media for About.
//                   </div>
//                 )}
//               </div>

//               <div className="col-lg-6">
//                 {allowed.subtitle && (
//                   <small className="text-muted d-block mb-1">
//                     {about.subtitle || "- About Us"}
//                   </small>
//                 )}
//                 <h1 className="display-6 text-uppercase mb-2">
//                   {about.title || "About title..."}
//                 </h1>

//                 {allowed.lines && (
//                   <div className="mb-3">
//                     {(about.lines || [])
//                       .slice(0, 3)
//                       .map((ln, i) => (
//                         <div key={i} className="opacity-75">
//                           {ln}
//                         </div>
//                       ))}
//                   </div>
//                 )}

//                 <p className="mb-4">{about.description || "Description..."}</p>

//                 {allowed.services && (
//                   <div className="row g-3 mb-4">
//                     {(about.services || []).map((s, i) => (
//                       <div key={i} className="col-sm-6">
//                         <div className="p-3 border rounded h-100">
//                           <div className="small opacity-75">
//                             {s?.tag || "Tag"}
//                           </div>
//                           <div className="fw-semibold">
//                             {s?.heading || "Heading"}
//                           </div>
//                           {s?.href ? (
//                             <a
//                               href={s.href}
//                               target="_blank"
//                               rel="noreferrer"
//                             >
//                               View Details →
//                             </a>
//                           ) : (
//                             <span className="text-muted">No link</span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="border border-5 border-primary p-3 text-center mt-2">
//                   <h5 className="lh-base text-uppercase mb-0">
//                     {about.highlight || "Highlight text..."}
//                   </h5>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         {/* Title */}
//         <Row className="mb-3">
//           <Col md={8}>
//             <Form.Group>
//               <Form.Label>Title</Form.Label>
//               <Form.Control value={about.title || ""} onChange={setField("title")} />
//             </Form.Group>
//           </Col>

//           {/* Image chooser only if template allows image */}
//           {allowed.imageUrl && (
//             <Col md={4}>
//               <Form.Group>
//                 <Form.Label>Image (choose – preview only)</Form.Label>
//                 <Form.Control
//                   type="file"
//                   accept="image/*"
//                   onChange={onPickLocal}
//                 />
//                 <Form.Text>Upload happens on Save.</Form.Text>
//               </Form.Group>
//             </Col>
//           )}
//         </Row>

//         {/* Subtitle + Image Alt (guarded) */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Subtitle</Form.Label>
//               {allowed.subtitle ? (
//                 <Form.Control
//                   value={about.subtitle || ""}
//                   onChange={setField("subtitle")}
//                 />
//               ) : (
//                 <Form.Control disabled placeholder="Not used by this template" />
//               )}
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Image ALT</Form.Label>
//               {allowed.imageAlt ? (
//                 <Form.Control
//                   value={about.imageAlt || ""}
//                   onChange={setField("imageAlt")}
//                 />
//               ) : (
//                 <Form.Control disabled placeholder="Not used by this template" />
//               )}
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Animated lines */}
//         {allowed.lines && (
//           <Row className="mb-3">
//             <Col>
//               <Form.Label>Animated Lines (max 3)</Form.Label>
//               <Row className="g-2">
//                 {[0, 1, 2].map((i) => (
//                   <Col md={4} key={i}>
//                     <Form.Control
//                       placeholder={`Line ${i + 1}`}
//                       value={about.lines?.[i] || ""}
//                       onChange={(e) => setLine(i, e.target.value)}
//                     />
//                   </Col>
//                 ))}
//               </Row>
//             </Col>
//           </Row>
//         )}

//         {/* Media URLs */}
//         <Row className="mb-3">
//           {allowed.videoUrl && (
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Video URL (mp4/webm/ogg)</Form.Label>
//                 <Form.Control
//                   value={about.videoUrl || ""}
//                   onChange={setField("videoUrl")}
//                 />
//                 <Form.Text>
//                   Leave empty to use Image instead (if enabled).
//                 </Form.Text>
//               </Form.Group>
//             </Col>
//           )}
//           {allowed.posterUrl && (
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Poster URL (for video)</Form.Label>
//                 <Form.Control
//                   value={about.posterUrl || ""}
//                   onChange={setField("posterUrl")}
//                 />
//               </Form.Group>
//             </Col>
//           )}
//         </Row>

//         {/* Description */}
//         <Row className="mb-3">
//           <Col>
//             <Form.Group>
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={4}
//                 value={about.description || ""}
//                 onChange={setField("description")}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Highlight */}
//         <Row className="mb-4">
//           <Col>
//             <Form.Group>
//               <Form.Label>Highlight (bottom bordered text)</Form.Label>
//               <Form.Control
//                 value={about.highlight || ""}
//                 onChange={setField("highlight")}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Services (sir) */}
//         {allowed.services && (
//           <div className="mb-4">
//             <h6 className="fw-bold">Inline Services (3 items)</h6>
//             <Row className="g-3">
//               {[0, 1, 2].map((i) => (
//                 <Col md={4} key={i}>
//                   <Card className="p-3 h-100">
//                     <div className="mb-2 text-muted">Item #{i + 1}</div>
//                     <Form.Group className="mb-2">
//                       <Form.Label>Tag (small label)</Form.Label>
//                       <Form.Control
//                         value={about.services?.[i]?.tag || ""}
//                         onChange={(e) => setService(i, "tag", e.target.value)}
//                       />
//                     </Form.Group>
//                     <Form.Group className="mb-2">
//                       <Form.Label>Heading</Form.Label>
//                       <Form.Control
//                         value={about.services?.[i]?.heading || ""}
//                         onChange={(e) =>
//                           setService(i, "heading", e.target.value)
//                         }
//                       />
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label>Link (href)</Form.Label>
//                       <Form.Control
//                         value={about.services?.[i]?.href || ""}
//                         onChange={(e) => setService(i, "href", e.target.value)}
//                       />
//                     </Form.Group>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           </div>
//         )}

//         {/* Bullets (gym) */}
//         {allowed.bullets && (
//           <>
//             <h6 className="fw-bold mt-3 mb-2">Bullets</h6>
//             <Table striped bordered>
//               <thead>
//                 <tr>
//                   <th style={{ width: "80%" }}>Text</th>
//                   <th style={{ width: "20%" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(about.bullets || []).map((b, idx) => (
//                   <tr key={idx}>
//                     <td>
//                       <Form.Control
//                         value={b?.text || ""}
//                         onChange={(e) =>
//                           handleBulletChange(idx, e.target.value)
//                         }
//                       />
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => removeBullet(idx)}
//                       >
//                         ❌ Remove
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//                 <tr>
//                   <td colSpan={2}>
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={addBullet}
//                     >
//                       ➕ Add Bullet
//                     </Button>
//                   </td>
//                 </tr>
//               </tbody>
//             </Table>
//           </>
//         )}

//         <div className="d-flex justify-content-end">
//           <Button onClick={handleSave} disabled={saving || !templateId}>
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
"use client";

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
   TEMPLATE PROFILES (what each template exposes in the About section)
-------------------------------------------------------------------*/
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: true,          // up to 3 animated lines
        description: true,
        highlight: true,
        videoUrl: true,       // sir prefers video
        posterUrl: true,
        imageUrl: false,
        imageAlt: false,
        services: true,       // 3 tiles
        bullets: false,
      },
    },
  },
  "gym-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: false,
        description: true,
        highlight: true,
        videoUrl: false,
        posterUrl: false,
        imageUrl: true,       // gym prefers image
        imageAlt: true,
        services: false,
        bullets: true,
      },
    },
  },
};

/* --------- FALLBACK (allow all fields if template unknown) --------- */
const ALL_ABOUT_FIELDS = {
  subtitle: true,
  title: true,
  lines: true,
  description: true,
  highlight: true,
  imageUrl: true,
  imageAlt: true,
  videoUrl: true,
  posterUrl: true,
  services: true,
  bullets: true,
};

/* -------------------------- DEFAULT CONTENT -------------------------- */
const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    about: {
      subtitle: "- About Us",
      title:
        "brands – building insightful strategy\ncreating unique designs.",
      lines: ["building strategy", "creating unique designs", "since 2019"],
      description: "",
      highlight: "Your vision, our craft.",
      videoUrl: "",
      posterUrl: "",
      services: [
        { tag: "Branding", heading: "Branding & Design", href: "/about.html" },
        {
          tag: "Branding",
          heading: "Brand Strategy & Voice",
          href: "/about.html",
        },
        {
          tag: "Design",
          heading: "Digital & Web Design",
          href: "/about.html",
        },
      ],
    },
  },
  "gym-template-1": {
    about: {
      subtitle: "- About Us",
      title: "Train smart. Live strong.",
      description: "",
      highlight: "Start today.",
      imageUrl: "",
      imageAlt: "About image",
      bullets: [{ text: "" }, { text: "" }, { text: "" }],
    },
  },
};

/* ----------------------------- HELPERS ------------------------------ */
const API = backendBaseUrl || "";
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return u;
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(
      /^\/+/,
      ""
    )}`;
  }
  return u;
};

// which fields are allowed for this template/section
const getAllowed = (templateId, section) => {
  const m = TEMPLATE_PROFILES?.[templateId]?.[section]?.fields;
  if (m && Object.keys(m).length) return m;
  console.warn(
    "[AboutEditor] Unknown templateId or empty profile:",
    templateId,
    "— using fallback (all fields)."
  );
  return ALL_ABOUT_FIELDS;
};

const pickAllowed = (obj, allowedMap) => {
  const map = allowedMap && Object.keys(allowedMap).length ? allowedMap : null;
  if (!map) return { ...obj };
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (allowedMap[k] && obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
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
      if (!off) setTid("gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

/* ============================= PAGE ============================== */
function AboutEditorPage() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const allowed = useMemo(() => getAllowed(templateId, "about"), [templateId]);

  const [about, setAbout] = useState({
    title: "",
    subtitle: "",
    description: "",
    highlight: "",
    imageUrl: "",
    imageAlt: "",
    videoUrl: "",
    posterUrl: "",
    lines: [],
    services: [
      { tag: "", heading: "", href: "" },
      { tag: "", heading: "", href: "" },
      { tag: "", heading: "", href: "" },
    ],
    bullets: [],
  });

  // local draft image (preview-only until Save)
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Build API URLs once templateId is known
  const aboutGetPutUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/about/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  const aboutUploadUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/about/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}/image`;
  }, [userId, templateId]);

  // Reset UI to template defaults when template changes
  useEffect(() => {
    const tplDefaults = TEMPLATE_DEFAULTS?.[templateId]?.about || {};
    setAbout((prev) => ({
      ...prev,
      ...tplDefaults,
    }));
    setDraftFile(null);
    setDraftPreview("");
    setErrorMsg("");
  }, [templateId]);

  // Load current About (template-scoped)
  useEffect(() => {
    if (!aboutGetPutUrl) return;
    (async () => {
      try {
        const res = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (res.status === 204) return;
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json().catch(() => ({}));

        const safe = pickAllowed(data || {}, allowed);

        setAbout((prev) => {
          const merged = { ...prev, ...safe };

          // ------- FIX 1: map API services {title} --> UI {heading} -------
          const sv = Array.isArray(merged.services) ? merged.services : [];
          const mapped =
            sv.map((s) => ({
              tag: s?.tag || "",
              heading: s?.heading ?? s?.title ?? "",
              href: s?.href || "",
            })) || [];
          // ensure exactly 3 slots
          merged.services = [
            mapped[0] || { tag: "", heading: "", href: "" },
            mapped[1] || { tag: "", heading: "", href: "" },
            mapped[2] || { tag: "", heading: "", href: "" },
          ];

          merged.lines = Array.isArray(merged.lines) ? merged.lines : [];
          merged.bullets = Array.isArray(merged.bullets) ? merged.bullets : [];
          return merged;
        });
      } catch (err) {
        console.error("❌ Failed to load About section", err);
        setErrorMsg("Failed to load About section data.");
      }
    })();
  }, [aboutGetPutUrl, allowed]);

  // Rewriter for any "sections/..." <img> (defensive)
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
        if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG")
          needs = true;
        if (m.type === "childList") needs = true;
      }
      if (needs) rewrite();
    });
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    return () => mo.disconnect();
  }, []);

  // field helpers
  const handleChange = (key, value) =>
    setAbout((prev) => ({ ...prev, [key]: value }));

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

  const setField = (k) => (e) => handleChange(k, e.target.value);

  const setLine = (i, v) =>
    setAbout((p) => {
      const lines = Array.isArray(p.lines) ? [...p.lines] : [];
      lines[i] = v;
      return { ...p, lines };
    });

  const setService = (i, key, v) =>
    setAbout((p) => {
      const arr = Array.isArray(p.services) ? [...p.services] : [{}, {}, {}];
      if (!arr[i]) arr[i] = { tag: "", heading: "", href: "" };
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, services: arr };
    });

  // choose file -> local preview ONLY (no upload yet)
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
    if (!draftFile || !aboutUploadUrl || !allowed.imageUrl) return null;
    const form = new FormData();
    form.append("image", draftFile);
    const res = await fetch(aboutUploadUrl, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    const data = await res.json().catch(() => ({}));
    return data?.result?.imageUrl || data?.imageUrl || null; // expect relative key
  };

  const handleSave = async () => {
    if (!aboutGetPutUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const newRelUrl = await uploadDraftIfNeeded();

      // ------- FIX 2: send ONLY {tag, heading, href} (no lingering title) -------
      const servicesForSave = Array.isArray(about.services)
        ? about.services.slice(0, 3).map((s) => ({
            tag: s?.tag || "",
            heading: s?.heading || "",
            href: s?.href || "",
          }))
        : [];

      const payload = {
        title: about.title || "",
        subtitle: about.subtitle || "",
        description: about.description || "",
        highlight: about.highlight || "",
        imageAlt: about.imageAlt || "",
        videoUrl: about.videoUrl || "",
        posterUrl: about.posterUrl || "",
        lines: Array.isArray(about.lines) ? about.lines : [],
        services: servicesForSave,
        bullets: Array.isArray(about.bullets) ? about.bullets : [],
        imageUrl: newRelUrl ? newRelUrl : about.imageUrl || "",
      };

      const safePayload = pickAllowed(payload, allowed);

      const res = await fetch(aboutGetPutUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
        cache: "no-store",
      });

      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      const isJson = ctype.includes("application/json");
      const data = isJson ? await res.json().catch(() => ({})) : null;

      if (!res.ok) {
        const txt = !isJson
          ? await res.text().catch(() => "")
          : data?.message || "";
        throw new Error(txt || `Save failed (${res.status})`);
      }

      // Refresh from server
      const fresh = await fetch(`${aboutGetPutUrl}?_=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (fresh.status !== 204) {
        const freshData = await fresh.json().catch(() => ({}));
        const safeFresh = pickAllowed(freshData || {}, allowed);

        setAbout((p) => {
          const merged = { ...p, ...safeFresh };

          // keep mapping from API into UI shape
          const sv = Array.isArray(merged.services) ? merged.services : [];
          const mapped =
            sv.map((s) => ({
              tag: s?.tag || "",
              heading: s?.heading ?? s?.title ?? "",
              href: s?.href || "",
            })) || [];
          merged.services = [
            mapped[0] || { tag: "", heading: "", href: "" },
            mapped[1] || { tag: "", heading: "", href: "" },
            mapped[2] || { tag: "", heading: "", href: "" },
          ];

          merged.lines = Array.isArray(merged.lines) ? merged.lines : [];
          merged.bullets = Array.isArray(merged.bullets) ? merged.bullets : [];
          return merged;
        });
      }

      // clear draft preview
      setDraftFile(null);
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }
      setDraftPreview("");

      setShowToast(true);
    } catch (err) {
      setErrorMsg(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Preview media decision (respect template profile)
  const safeImagePreview = useMemo(
    () => draftPreview || toAbs(about?.imageUrl) || "/img/about.jpg",
    [draftPreview, about?.imageUrl]
  );

  const showVideo = !!(allowed.videoUrl && about.videoUrl);
  const showImage = !!allowed.imageUrl;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">ℹ️ About Section</h4>
            <BackBar />
          </div>

          {/* Debug */}
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">
                allowed fields:{" "}
                {Object.keys(allowed)
                  .filter((k) => allowed[k])
                  .join(", ") || "ALL (fallback)"}
              </Badge>
            </div>
            {aboutGetPutUrl && (
              <div className="text-muted" title={aboutGetPutUrl}>
                <span>endpoint:</span>{" "}
                <code>/api/about/{defaultUserId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">
              {errorMsg}
            </Alert>
          </Col>
        </Row>
      ) : null}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                {showVideo ? (
                  <video
                    controls
                    playsInline
                    muted
                    loop
                    poster={about.posterUrl || undefined}
                    style={{
                      width: "100%",
                      maxHeight: 350,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  >
                    <source src={about.videoUrl} />
                  </video>
                ) : showImage ? (
                  <img
                    src={safeImagePreview}
                    alt={about.imageAlt || "About Image"}
                    className="img-fluid"
                    style={{
                      maxHeight: "350px",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                ) : (
                  <div className="text-muted">
                    This template has no media for About.
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                {allowed.subtitle && (
                  <small className="text-muted d-block mb-1">
                    {about.subtitle || "- About Us"}
                  </small>
                )}
                <h1 className="display-6 text-uppercase mb-2">
                  {about.title || "About title..."}
                </h1>

                {allowed.lines && (
                  <div className="mb-3">
                    {(about.lines || [])
                      .slice(0, 3)
                      .map((ln, i) => (
                        <div key={i} className="opacity-75">
                          {ln}
                        </div>
                      ))}
                  </div>
                )}

                <p className="mb-4">{about.description || "Description..."}</p>

                {allowed.services && (
                  <div className="row g-3 mb-4">
                    {(about.services || []).map((s, i) => (
                      <div key={i} className="col-sm-6">
                        <div className="p-3 border rounded h-100">
                          <div className="small opacity-75">
                            {s?.tag || "Tag"}
                          </div>
                          <div className="fw-semibold">
                            {s?.heading || "Heading"}
                          </div>
                          {s?.href ? (
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Details →
                            </a>
                          ) : (
                            <span className="text-muted">No link</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-5 border-primary p-3 text-center mt-2">
                  <h5 className="lh-base text-uppercase mb-0">
                    {about.highlight || "Highlight text..."}
                  </h5>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        {/* Title */}
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control value={about.title || ""} onChange={setField("title")} />
            </Form.Group>
          </Col>

          {/* Image chooser only if template allows image */}
          {allowed.imageUrl && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>Image (choose – preview only)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={onPickLocal}
                />
                <Form.Text>Upload happens on Save.</Form.Text>
              </Form.Group>
            </Col>
          )}
        </Row>

        {/* Subtitle + Image Alt (guarded) */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Subtitle</Form.Label>
              {allowed.subtitle ? (
                <Form.Control
                  value={about.subtitle || ""}
                  onChange={setField("subtitle")}
                />
              ) : (
                <Form.Control disabled placeholder="Not used by this template" />
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Image ALT</Form.Label>
              {allowed.imageAlt ? (
                <Form.Control
                  value={about.imageAlt || ""}
                  onChange={setField("imageAlt")}
                />
              ) : (
                <Form.Control disabled placeholder="Not used by this template" />
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Animated lines */}
        {allowed.lines && (
          <Row className="mb-3">
            <Col>
              <Form.Label>Animated Lines (max 3)</Form.Label>
              <Row className="g-2">
                {[0, 1, 2].map((i) => (
                  <Col md={4} key={i}>
                    <Form.Control
                      placeholder={`Line ${i + 1}`}
                      value={about.lines?.[i] || ""}
                      onChange={(e) => setLine(i, e.target.value)}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        {/* Media URLs */}
        <Row className="mb-3">
          {allowed.videoUrl && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Video URL (mp4/webm/ogg)</Form.Label>
                <Form.Control
                  value={about.videoUrl || ""}
                  onChange={setField("videoUrl")}
                />
                <Form.Text>
                  Leave empty to use Image instead (if enabled).
                </Form.Text>
              </Form.Group>
            </Col>
          )}
          {allowed.posterUrl && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Poster URL (for video)</Form.Label>
                <Form.Control
                  value={about.posterUrl || ""}
                  onChange={setField("posterUrl")}
                />
              </Form.Group>
            </Col>
          )}
        </Row>

        {/* Description */}
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={about.description || ""}
                onChange={setField("description")}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Highlight */}
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Highlight (bottom bordered text)</Form.Label>
              <Form.Control
                value={about.highlight || ""}
                onChange={setField("highlight")}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Services (sir) */}
        {allowed.services && (
          <div className="mb-4">
            <h6 className="fw-bold">Inline Services (3 items)</h6>
            <Row className="g-3">
              {[0, 1, 2].map((i) => (
                <Col md={4} key={i}>
                  <Card className="p-3 h-100">
                    <div className="mb-2 text-muted">Item #{i + 1}</div>
                    <Form.Group className="mb-2">
                      <Form.Label>Tag (small label)</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.tag || ""}
                        onChange={(e) => setService(i, "tag", e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Heading</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.heading || ""}
                        onChange={(e) =>
                          setService(i, "heading", e.target.value)
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Link (href)</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.href || ""}
                        onChange={(e) => setService(i, "href", e.target.value)}
                      />
                    </Form.Group>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Bullets (gym) */}
        {allowed.bullets && (
          <>
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
                        onChange={(e) =>
                          handleBulletChange(idx, e.target.value)
                        }
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
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addBullet}
                    >
                      ➕ Add Bullet
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>

      {/* Floating toast */}
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
