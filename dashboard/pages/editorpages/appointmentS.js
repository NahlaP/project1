

// // pages/editorpages/appointmentS.js
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Alert,
//   Table,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId as defaultUserId } from "../../lib/config";
// import { api } from "../../lib/api";
// import BackBar from "../components/BackBar";

// /** Resolve templateId from: URL ?templateId=... -> backend selection -> fallback */
// function useResolvedTemplateId(userId) {
//   const [templateId, setTemplateId] = useState("");
//   const router = require("next/router").useRouter();

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTemplateId(fromUrl);
//         return;
//       }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTemplateId(t);
//           return;
//         }
//       } catch {}
//       if (!off) setTemplateId("gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, require("next/router").useRouter().query.templateId]);

//   return templateId;
// }

// const ABS = /^https?:\/\//i;

// function AppointmentEditorPage() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [data, setData] = useState({
//     // Editor-facing fields
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "", // S3 key OR absolute url (from template)
//     backgroundImageUrl: "", // direct/presigned (server)
//     services: [],
//   });

//   const [serverPreviewUrl, setServerPreviewUrl] = useState("");
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [newService, setNewService] = useState("");
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Helper: get a presigned URL for any stored S3 key
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json();
//       return json?.url || json?.signedUrl || json || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   // Load existing Appointment doc (user override → template defaults)
//   useEffect(() => {
//     if (!templateId) return;

//     let abort = false;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(templateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const result = await res.json();
//         if (abort) return;

//         if (result) {
//           // Map template field names to editor fields
//           const mapped = {
//             ...result,
//             title: result.title ?? result.headingLeft ?? "",
//             subtitle: result.subtitle ?? result.descriptionLeft ?? "",
//             services: Array.isArray(result.services) ? result.services : [],
//             // backgroundImage may be:
//             //  - a server-provided presigned `backgroundImageUrl`
//             //  - an absolute template URL in `backgroundImage`
//             //  - an S3 key in `backgroundImage`
//           };

//           setData((p) => ({ ...p, ...mapped }));

//           // Choose best preview URL
//           if (mapped.backgroundImageUrl) {
//             setServerPreviewUrl(mapped.backgroundImageUrl);
//           } else if (mapped.backgroundImage && ABS.test(mapped.backgroundImage)) {
//             setServerPreviewUrl(mapped.backgroundImage);
//           } else if (mapped.backgroundImage) {
//             const url = await getSignedUrlFor(mapped.backgroundImage);
//             if (!abort) setServerPreviewUrl(url || "");
//           } else {
//             setServerPreviewUrl("");
//           }
//         }
//       } catch (err) {
//         if (!abort) console.error("❌ Failed to load appointment section", err);
//       }
//     })();

//     return () => {
//       abort = true;
//       if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, templateId]);

//   const handleChange = (key, value) => {
//     setData((prev) => ({ ...prev, [key]: value }));
//   };

//   // Choose file → local preview
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
//     setSuccess("");
//   };

//   /** Upload draft image if any (field name: "image") */
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile) return null;

//     // Preferred route with user/template in path
//     const form = new FormData();
//     form.append("image", draftFile);
//     const url = `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//       userId
//     )}/${encodeURIComponent(templateId)}/image`;
//     const res = await fetch(url, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || `Upload failed (${res.status})`);
//     }
//     const j = await res.json().catch(() => ({}));
//     return j?.imageKey || j?.key || null;
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       // Upload file if picked
//       const newKey = await uploadDraftIfNeeded();

//       const payload = {
//         title: data.title || "",
//         subtitle: data.subtitle || "",
//         officeAddress: data.officeAddress || "",
//         officeTime: data.officeTime || "",
//         services: Array.isArray(data.services) ? data.services : [],
//         // if a new image was uploaded, use it; otherwise keep key if it’s a key
//         // (we do not store absolute template URLs in DB)
//         backgroundImage: newKey
//           ? newKey
//           : ABS.test(data.backgroundImage)
//           ? ""
//           : data.backgroundImage || "",
//       };

//       const res = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );
//       const result = await res.json().catch(() => ({}));
//       if (result?.message || result?.ok)
//         setSuccess("✅ Appointment section updated!");

//       // Refresh from server (also refresh preview URL)
//       const r2 = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}`,
//         { headers: { Accept: "application/json" }, cache: "no-store" }
//       );
//       const j2 = await r2.json().catch(() => ({}));
//       if (j2) {
//         const mapped = {
//           ...j2,
//           title: j2.title ?? j2.headingLeft ?? "",
//           subtitle: j2.subtitle ?? j2.descriptionLeft ?? "",
//         };
//         setData((p) => ({ ...p, ...mapped }));

//         const newUrl =
//           mapped.backgroundImageUrl ||
//           (mapped.backgroundImage && ABS.test(mapped.backgroundImage)
//             ? mapped.backgroundImage
//             : mapped.backgroundImage
//             ? await getSignedUrlFor(mapped.backgroundImage)
//             : "");
//         setServerPreviewUrl(newUrl || "");
//       }

//       // Clear local draft
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         URL.revokeObjectURL(lastObjUrlRef.current);
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const bgUrl = draftPreview || serverPreviewUrl || "";

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">📆 Appointment Section</h4>
//             <div className="small text-muted">
//               template: <code>{templateId || "…"}</code>
//             </div>
//           </div>
//             <BackBar />
//         </Col>
//       </Row>

//       {success && <Alert variant="success" className="mt-3">{success}</Alert>}

//       {/* Preview */}
//       <Row className="mb-4 mt-3">
//         <Col>
//           <Card className="p-4" style={{ background: "#f9f9f9" }}>
//             <Row>
//               <Col lg={6}>
//                 <div
//                   style={{
//                     backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     minHeight: "500px",
//                     borderRadius: "8px",
//                     backgroundColor: "#f0f0f0",
//                   }}
//                 />
//               </Col>
//               <Col lg={6}>
//                 <h1 className="display-6 text-uppercase mb-4">
//                   {data.title || "Appointment title..."}
//                 </h1>
//                 <p className="mb-4">{data.subtitle || "Subtitle..."}</p>
//                 <p>
//                   <strong>Office Address:</strong> {data.officeAddress}
//                 </p>
//                 <p>
//                   <strong>Office Time:</strong> {data.officeTime}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Services:</strong>
//                 </p>
//                 <ul className="mb-0">
//                   {(data.services || []).map((service, i) => (
//                     <li key={i}>{service}</li>
//                   ))}
//                 </ul>
//               </Col>
//             </Row>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <Form.Group className="mb-3">
//           <Form.Label>Title</Form.Label>
//           <Form.Control
//             value={data.title}
//             onChange={(e) => handleChange("title", e.target.value)}
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Subtitle</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={2}
//             value={data.subtitle}
//             onChange={(e) => handleChange("subtitle", e.target.value)}
//           />
//         </Form.Group>

//         <Row className="mb-3">
//           <Col>
//             <Form.Group>
//               <Form.Label>Office Address</Form.Label>
//               <Form.Control
//                 value={data.officeAddress}
//                 onChange={(e) => handleChange("officeAddress", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col>
//             <Form.Group>
//               <Form.Label>Office Time</Form.Label>
//               <Form.Control
//                 value={data.officeTime}
//                 onChange={(e) => handleChange("officeTime", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Form.Group className="mb-4">
//           <Form.Label>Background Image</Form.Label>
//           <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//           <div className="form-text">
//             Max 10 MB. New image is uploaded only when you click{" "}
//             <strong>Save</strong>.
//           </div>
//         </Form.Group>

//         <h6 className="fw-bold mt-3 mb-2">Services</h6>
//         <Table striped bordered>
//           <thead>
//             <tr>
//               <th style={{ width: "80%" }}>Service</th>
//               <th style={{ width: "20%" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(data.services || []).map((service, idx) => (
//               <tr key={idx}>
//                 <td>{service}</td>
//                 <td>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => {
//                       const updated = (data.services || []).filter(
//                         (_, i) => i !== idx
//                       );
//                       setData((p) => ({ ...p, services: updated }));
//                     }}
//                   >
//                     ❌ Remove
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={2}>
//                 <Row>
//                   <Col>
//                     <Form.Control
//                       placeholder="New service"
//                       value={newService}
//                       onChange={(e) => setNewService(e.target.value)}
//                     />
//                   </Col>
//                   <Col sm="auto">
//                     <Button
//                       variant="outline-primary"
//                       onClick={() => {
//                         if (newService.trim()) {
//                           setData((p) => ({
//                             ...p,
//                             services: [
//                               ...(p.services || []),
//                               newService.trim(),
//                             ],
//                           }));
//                           setNewService("");
//                         }
//                       }}
//                     >
//                       ➕ Add Service
//                     </Button>
//                   </Col>
//                 </Row>
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
//     </Container>
//   );
// }

// AppointmentEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AppointmentEditorPage;



























// // ogs
// // pages/editorpages/appointmentS.js
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Alert,
//   Table,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId as defaultUserId } from "../../lib/config";
// import { api } from "../../lib/api";
// import BackBar from "../components/BackBar";

// /** Resolve templateId from: URL ?templateId=... -> backend selection -> fallback */
// function useResolvedTemplateId(userId) {
//   const [templateId, setTemplateId] = useState("");
//   const router = require("next/router").useRouter();

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTemplateId(fromUrl);
//         return;
//       }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTemplateId(t);
//           return;
//         }
//       } catch {}
//       if (!off) setTemplateId("gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, require("next/router").useRouter().query.templateId]);

//   return templateId;
// }

// const ABS = /^https?:\/\//i;

// function AppointmentEditorPage() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [data, setData] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",
//     backgroundImageUrl: "",
//     services: [],
//   });

//   const [serverPreviewUrl, setServerPreviewUrl] = useState("");
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [newService, setNewService] = useState("");
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [resetting, setResetting] = useState(false); // 👈 added

//   // Helper: get a presigned URL for any stored S3 key
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json();
//       return json?.url || json?.signedUrl || json || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   // Load existing Appointment doc (user override → template defaults)
//   useEffect(() => {
//     if (!templateId) return;

//     let abort = false;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const result = await res.json();
//         if (abort) return;

//         if (result) {
//           const mapped = {
//             ...result,
//             title: result.title ?? result.headingLeft ?? "",
//             subtitle: result.subtitle ?? result.descriptionLeft ?? "",
//             services: Array.isArray(result.services) ? result.services : [],
//           };

//           setData((p) => ({ ...p, ...mapped }));

//           if (mapped.backgroundImageUrl) {
//             setServerPreviewUrl(mapped.backgroundImageUrl);
//           } else if (mapped.backgroundImage && ABS.test(mapped.backgroundImage)) {
//             setServerPreviewUrl(mapped.backgroundImage);
//           } else if (mapped.backgroundImage) {
//             const url = await getSignedUrlFor(mapped.backgroundImage);
//             if (!abort) setServerPreviewUrl(url || "");
//           } else {
//             setServerPreviewUrl("");
//           }
//         }
//       } catch (err) {
//         if (!abort) console.error("❌ Failed to load appointment section", err);
//       }
//     })();

//     return () => {
//       abort = true;
//       if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userId, templateId]);

//   const handleChange = (key, value) => {
//     setData((prev) => ({ ...prev, [key]: value }));
//   };

//   // Choose file → local preview
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
//     setSuccess("");
//   };

//   /** Upload draft image if any (field name: "image") */
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile) return null;

//     const form = new FormData();
//     form.append("image", draftFile);
//     const url = `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//       userId
//     )}/${encodeURIComponent(templateId)}/image`;
//     const res = await fetch(url, { method: "POST", body: form });
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || `Upload failed (${res.status})`);
//     }
//     const j = await res.json().catch(() => ({}));
//     return j?.imageKey || j?.key || null;
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const newKey = await uploadDraftIfNeeded();

//       const payload = {
//         title: data.title || "",
//         subtitle: data.subtitle || "",
//         officeAddress: data.officeAddress || "",
//         officeTime: data.officeTime || "",
//         services: Array.isArray(data.services) ? data.services : [],
//         backgroundImage: newKey
//           ? newKey
//           : ABS.test(data.backgroundImage)
//           ? ""
//           : data.backgroundImage || "",
//       };

//       const res = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );
//       const result = await res.json().catch(() => ({}));
//       if (result?.message || result?.ok)
//         setSuccess("✅ Appointment section updated!");

//       // Refresh
//       const r2 = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
//         { headers: { Accept: "application/json" }, cache: "no-store" }
//       );
//       const j2 = await r2.json().catch(() => ({}));
//       if (j2) {
//         const mapped = {
//           ...j2,
//           title: j2.title ?? j2.headingLeft ?? "",
//           subtitle: j2.subtitle ?? j2.descriptionLeft ?? "",
//         };
//         setData((p) => ({ ...p, ...mapped }));

//         const newUrl =
//           mapped.backgroundImageUrl ||
//           (mapped.backgroundImage && ABS.test(mapped.backgroundImage)
//             ? mapped.backgroundImage
//             : mapped.backgroundImage
//             ? await getSignedUrlFor(mapped.backgroundImage)
//             : "");
//         setServerPreviewUrl(newUrl || "");
//       }

//       // Clear draft
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         URL.revokeObjectURL(lastObjUrlRef.current);
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* 🔁 Reset to Defaults — minimal addition */
//   const handleReset = async () => {
//     if (!templateId || resetting) return;
//     setResetting(true);
//     setSuccess("");
//     try {
//       const r = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}/reset`,
//         { method: "POST", headers: { Accept: "application/json" } }
//       );
//       if (!r.ok) {
//         const t = await r.text().catch(() => "");
//         throw new Error(t || `Reset failed (${r.status})`);
//       }

//       // Reload after reset
//       const res = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//           userId
//         )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
//         { headers: { Accept: "application/json" }, cache: "no-store" }
//       );
//       const j = await res.json().catch(() => ({}));

//       const mapped = {
//         ...j,
//         title: j.title ?? j.headingLeft ?? "",
//         subtitle: j.subtitle ?? j.descriptionLeft ?? "",
//         services: Array.isArray(j.services) ? j.services : [],
//       };
//       setData((p) => ({ ...p, ...mapped }));

//       const newUrl =
//         mapped.backgroundImageUrl ||
//         (mapped.backgroundImage && ABS.test(mapped.backgroundImage)
//           ? mapped.backgroundImage
//           : mapped.backgroundImage
//           ? await getSignedUrlFor(mapped.backgroundImage)
//           : "");
//       setServerPreviewUrl(newUrl || "");

//       // Clear local draft preview
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         URL.revokeObjectURL(lastObjUrlRef.current);
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");

//       setSuccess("↺ Reset to defaults done.");
//     } catch (e) {
//       alert("❌ Reset failed: " + (e?.message || e));
//     } finally {
//       setResetting(false);
//     }
//   };

//   const bgUrl = draftPreview || serverPreviewUrl || "";

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col className="d-flex align-items-center justify-content-between">
//           <div>
//             <h4 className="fw-bold">📆 Appointment Section</h4>
//             <div className="small text-muted">
//               template: <code>{templateId || "…"}</code>
//             </div>
//           </div>
//           <BackBar />
//         </Col>
//       </Row>

//       {success && <Alert variant="success" className="mt-3">{success}</Alert>}

//       {/* Preview */}
//       <Row className="mb-4 mt-3">
//         <Col>
//           <Card className="p-4" style={{ background: "#f9f9f9" }}>
//             <Row>
//               <Col lg={6}>
//                 <div
//                   style={{
//                     backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     minHeight: "500px",
//                     borderRadius: "8px",
//                     backgroundColor: "#f0f0f0",
//                   }}
//                 />
//               </Col>
//               <Col lg={6}>
//                 <h1 className="display-6 text-uppercase mb-4">
//                   {data.title || "Appointment title..."}
//                 </h1>
//                 <p className="mb-4">{data.subtitle || "Subtitle..."}</p>
//                 <p>
//                   <strong>Office Address:</strong> {data.officeAddress}
//                 </p>
//                 <p>
//                   <strong>Office Time:</strong> {data.officeTime}
//                 </p>
//                 <p className="mb-1">
//                   <strong>Services:</strong>
//                 </p>
//                 <ul className="mb-0">
//                   {(data.services || []).map((service, i) => (
//                     <li key={i}>{service}</li>
//                   ))}
//                 </ul>
//               </Col>
//             </Row>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <Form.Group className="mb-3">
//           <Form.Label>Title</Form.Label>
//           <Form.Control
//             value={data.title}
//             onChange={(e) => handleChange("title", e.target.value)}
//           />
//         </Form.Group>

//         <Form.Group className="mb-3">
//           <Form.Label>Subtitle</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={2}
//             value={data.subtitle}
//             onChange={(e) => handleChange("subtitle", e.target.value)}
//           />
//         </Form.Group>

//         <Row className="mb-3">
//           <Col>
//             <Form.Group>
//               <Form.Label>Office Address</Form.Label>
//               <Form.Control
//                 value={data.officeAddress}
//                 onChange={(e) => handleChange("officeAddress", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col>
//             <Form.Group>
//               <Form.Label>Office Time</Form.Label>
//               <Form.Control
//                 value={data.officeTime}
//                 onChange={(e) => handleChange("officeTime", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Form.Group className="mb-4">
//           <Form.Label>Background Image</Form.Label>
//           <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//           <div className="form-text">
//             Max 10 MB. New image is uploaded only when you click{" "}
//             <strong>Save</strong>.
//           </div>
//         </Form.Group>

//         <h6 className="fw-bold mt-3 mb-2">Services</h6>
//         <Table striped bordered>
//           <thead>
//             <tr>
//               <th style={{ width: "80%" }}>Service</th>
//               <th style={{ width: "20%" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(data.services || []).map((service, idx) => (
//               <tr key={idx}>
//                 <td>{service}</td>
//                 <td>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => {
//                       const updated = (data.services || []).filter(
//                         (_, i) => i !== idx
//                       );
//                       setData((p) => ({ ...p, services: updated }));
//                     }}
//                   >
//                     ❌ Remove
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={2}>
//                 <Row>
//                   <Col>
//                     <Form.Control
//                       placeholder="New service"
//                       value={newService}
//                       onChange={(e) => setNewService(e.target.value)}
//                     />
//                   </Col>
//                   <Col sm="auto">
//                     <Button
//                       variant="outline-primary"
//                       onClick={() => {
//                         if (newService.trim()) {
//                           setData((p) => ({
//                             ...p,
//                             services: [
//                               ...(p.services || []),
//                               newService.trim(),
//                             ],
//                           }));
//                           setNewService("");
//                         }
//                       }}
//                     >
//                       ➕ Add Service
//                     </Button>
//                   </Col>
//                 </Row>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <div className="d-flex justify-content-end gap-2">
//           {/* 👇 minimal Reset button */}
//           <Button
//             variant="outline-secondary"
//             onClick={handleReset}
//             disabled={resetting || !templateId}
//             title="Reset to template defaults"
//           >
//             {resetting ? "Resetting…" : "↺ Reset to Defaults"}
//           </Button>

//           <Button onClick={handleSave} disabled={saving || !templateId}>
//             {saving ? "Saving…" : "💾 Save"}
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// AppointmentEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AppointmentEditorPage;















// pages/editorpages/appointmentS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table, Toast, ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* --------------------------- per-template profiles --------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    appointment: {
      fields: {
        title: true,
        subtitle: true,
        officeAddress: true,
        officeTime: true,
        services: true,
        backgroundImage: true,   // S3 key to persist
        backgroundImageUrl: true // absolute URL (optional from backend)
      },
      defaults: {
        title: "Book an Appointment",
        subtitle: "Tell us what you need — we’ll schedule you quickly.",
        officeAddress: "Dubai Media City, Building X",
        officeTime: "Sun–Thu, 9:00–18:00",
        services: ["Brand Strategy", "UI/UX Design", "Web Development"],
        backgroundImage: "",
        backgroundImageUrl: "",
      },
    },
  },
  "gym-template-1": {
    appointment: {
      fields: {
        title: true,
        subtitle: true,
        officeAddress: true,
        officeTime: true,
        services: true,
        backgroundImage: true,
        backgroundImageUrl: true
      },
      defaults: {
        title: "Schedule Your Session",
        subtitle: "Personal training tailored to your goals.",
        officeAddress: "Al Qusais, Street 12",
        officeTime: "Daily, 6:00–22:00",
        services: ["Strength Training", "Mobility", "Endurance"],
        backgroundImage: "",
        backgroundImageUrl: "",
      },
    },
  },
};

const API = backendBaseUrl || "";

/* --------------------------------- helpers --------------------------------- */
const isHttp = (s) => /^https?:\/\//i.test(String(s || ""));
const clamp = (n, lo, hi) => {
  const x = Number.isFinite(+n) ? +n : lo;
  return Math.min(hi, Math.max(lo, x));
};
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

async function presignKey(key) {
  if (!key) return "";
  try {
    const r = await fetch(`${API}/api/upload/file-url?key=${encodeURIComponent(key)}`, {
      credentials: "include",
    });
    const j = await r.json().catch(() => ({}));
    return j?.url || j?.signedUrl || "";
  } catch {
    return "";
  }
}

const getAllowed = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.appointment?.fields || {};
const getDefaults = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.appointment?.defaults || {};
const pickAllowed = (obj, allowed) => {
  const out = {};
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/* ---------------------------------- page ---------------------------------- */
function AppointmentEditorPage() {
  const { userId, templateId } = useIonContext(); // 🔗 same as hero/why-choose
  const allowed = useMemo(() => getAllowed(templateId), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId), [templateId]);

  const [state, setState] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    services: [],
    backgroundImage: "",    // key we persist
    backgroundImageUrl: "", // server may return absolute URL
  });

  const [displayUrl, setDisplayUrl] = useState("");
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", variant: "success" });
  const [newService, setNewService] = useState("");

  // Build endpoints only when we have IDs
  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(
      templateId
    )}`;
    return {
      GET_URL: base,
      PUT_URL: base,
      UP_IMAGE: `${base}/image`,
      RESET: `${base}/reset`,
    };
  }, [userId, templateId]);

  // On template switch → apply defaults locally
  useEffect(() => {
    setState((p) => ({ ...p, ...defaults }));
    setDraftFile(null);
    setDraftPreview("");
    setError("");
  }, [defaults, templateId]);

  // Compute preview URL (prefer full URL; otherwise presign key)
  const computePreview = useMemo(
    () => async (doc) => {
      const full = doc?.backgroundImageUrl;
      if (isHttp(full)) return bust(full);
      const key = doc?.backgroundImage || (full && !isHttp(full) ? String(full) : "");
      if (key) {
        const url = await presignKey(key);
        return bust(url || "");
      }
      return "";
    },
    []
  );

  // Load current appointment (server → state with defaults fallback)
  const loadAppointment = async () => {
    if (!endpoints) return;
    setError("");
    const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json().catch(() => ({}));

    const merged = {
      ...defaults,
      ...(typeof j === "object" ? j : {}),
    };

    // normalize a couple of legacy field names if backend sends them
    const normalized = {
      title: merged.title ?? merged.headingLeft ?? "",
      subtitle: merged.subtitle ?? merged.descriptionLeft ?? "",
      officeAddress: merged.officeAddress ?? "",
      officeTime: merged.officeTime ?? "",
      services: Array.isArray(merged.services) ? merged.services : [],
      backgroundImage: merged.backgroundImage ?? "",
      backgroundImageUrl: merged.backgroundImageUrl ?? "",
    };

    const safe = pickAllowed(normalized, allowed);
    setState((p) => ({ ...p, ...safe }));

    const show = await computePreview(safe);
    setDisplayUrl(show);
  };

  useEffect(() => {
    if (!endpoints) return;
    loadAppointment().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, allowed]);

  useEffect(() => {
    return () => {
      if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    };
  }, []);

  /* ---------------------------- draft image pick ---------------------------- */
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
    setError("");
  };

  /* --------------------------------- upload -------------------------------- */
  const uploadIfNeeded = async () => {
    if (!endpoints || !draftFile || !allowed.backgroundImage) return { backgroundImage: "" };
    const form = new FormData();
    form.append("image", draftFile);
    const r = await fetch(`${endpoints.UP_IMAGE}?_=${Date.now()}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!r.ok) throw new Error(await readErr(r));
    const j = await r.json().catch(() => ({}));
    const key = j?.imageKey || j?.key || "";
    return { backgroundImage: key };
  };

  /* ---------------------------------- save ---------------------------------- */
  const onSave = async () => {
    if (!endpoints) return;
    if (!userId || !templateId) {
      setError("Missing user/template.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const uploaded = await uploadIfNeeded();

      const fullPayload = {
        title: state.title || "",
        subtitle: state.subtitle || "",
        officeAddress: state.officeAddress || "",
        officeTime: state.officeTime || "",
        services: Array.isArray(state.services) ? state.services : [],
        ...(uploaded.backgroundImage
          ? { backgroundImage: uploaded.backgroundImage }
          : isHttp(state.backgroundImage)
          ? {} // if an absolute URL somehow landed in backgroundImage, ignore it
          : { backgroundImage: state.backgroundImage || "" }),
      };

      const safePayload = pickAllowed(fullPayload, allowed);

      const res = await fetch(`${endpoints.PUT_URL}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await readErr(res));

      await loadAppointment();

      // clear local draft
      setDraftFile(null);
      setDraftPreview("");
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }

      setToast({ show: true, msg: "✅ Saved.", variant: "success" });
    } catch (e) {
      setError(String(e.message || e));
      setToast({ show: true, msg: "❌ Save failed.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------- reset --------------------------------- */
  const onResetDefault = async () => {
    if (!endpoints) return;
    setResetting(true);
    setError("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));

      await loadAppointment();

      // clear local draft preview
      setDraftFile(null);
      setDraftPreview("");
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }

      setToast({ show: true, msg: "↺ Reset to defaults done.", variant: "success" });
    } catch (e) {
      setError(String(e.message || e));
      setToast({ show: true, msg: "❌ Reset failed.", variant: "danger" });
    } finally {
      setResetting(false);
    }
  };

  /* --------------------------------- ui --------------------------------- */
  const bgUrl = draftPreview || displayUrl || "";
  const addService = () => {
    const s = (newService || "").trim();
    if (!s) return;
    setState((p) => ({ ...p, services: [...(p.services || []), s] }));
    setNewService("");
  };
  const removeService = (idx) =>
    setState((p) => ({ ...p, services: (p.services || []).filter((_, i) => i !== idx) }));

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">📆 Appointment Section</h4>
            <div className="small text-muted">
              template: <code>{templateId || "…"}</code>
            </div>
          </div>
          <BackBar />
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </Alert>
      )}

      {/* Preview */}
      <Row className="mb-4 mt-3">
        <Col>
          <Card className="p-4" style={{ background: "#f9f9f9" }}>
            <Row>
              <Col lg={6}>
                <div
                  style={{
                    backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: "460px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              </Col>
              <Col lg={6}>
                <h1 className="display-6 text-uppercase mb-3">
                  {state.title || "Appointment title…"}
                </h1>
                <p className="mb-3">{state.subtitle || "Subtitle…"}</p>
                <p className="mb-1">
                  <strong>Office Address:</strong> {state.officeAddress || "—"}
                </p>
                <p className="mb-3">
                  <strong>Office Time:</strong> {state.officeTime || "—"}
                </p>
                <p className="mb-1"><strong>Services:</strong></p>
                <ul className="mb-0">
                  {(state.services || []).map((s, i) => <li key={i}>{s}</li>)}
                  {!state.services?.length && <li className="text-muted">No services yet.</li>}
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            value={state.title}
            onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={state.subtitle}
            onChange={(e) => setState((p) => ({ ...p, subtitle: e.target.value }))}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control
                value={state.officeAddress}
                onChange={(e) => setState((p) => ({ ...p, officeAddress: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Time</Form.Label>
              <Form.Control
                value={state.officeTime}
                onChange={(e) => setState((p) => ({ ...p, officeTime: e.target.value }))}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Background Image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
          <div className="form-text">
            Max 10 MB. New image uploads when you click <strong>Save</strong>.
          </div>
        </Form.Group>

        <h6 className="fw-bold mt-3 mb-2">Services</h6>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Service</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.services || []).map((service, idx) => (
              <tr key={idx}>
                <td>{service}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeService(idx)}>
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Row className="g-2">
                  <Col>
                    <Form.Control
                      placeholder="New service"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                    />
                  </Col>
                  <Col sm="auto">
                    <Button variant="outline-primary" onClick={addService}>
                      ➕ Add Service
                    </Button>
                  </Col>
                </Row>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={onResetDefault}
            disabled={resetting || !templateId || !userId}
            title="Reset to template defaults"
          >
            {resetting ? "Resetting…" : "↺ Reset to Defaults"}
          </Button>

          <Button onClick={onSave} disabled={saving || !templateId || !userId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          delay={2200}
          autohide
          bg={toast.variant === "danger" ? "danger" : "success"}
        >
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

AppointmentEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AppointmentEditorPage;
