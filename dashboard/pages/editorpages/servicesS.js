

// og
// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesS.js
// "use client";

// import React, { useEffect, useState, useRef } from "react";
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
// import { backendBaseUrl, userId, templateId } from "../../lib/config";
// import BackBar from "../components/BackBar";

// function ServicesEditorPage() {
//   const [servicesDoc, setServicesDoc] = useState({ services: [] });
//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [showToast, setShowToast] = useState(false); // floater

//   // draft previews per service: { [serviceId or "idx-#"]: { file, url } }
//   const [drafts, setDrafts] = useState({});
//   const lastUrlsRef = useRef({}); // for revoking Object URLs

//   // row refs & highlighting for "Edit" jumps
//   const rowRefs = useRef({}); // { key: HTMLTableRowElement }
//   const [highlightKey, setHighlightKey] = useState(null);

//   // --- helpers
//   const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
//   const absUrl = (u) => {
//     if (!u) return "";
//     if (isAbs(u)) return u;
//     if (backendBaseUrl) {
//       if (u.startsWith("/")) return `${backendBaseUrl}${u}`;
//       return `${backendBaseUrl}/${u}`;
//     }
//     return u;
//   };

//   const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch(
//         `${backendBaseUrl}/api/services/${userId}/${templateId}`,
//         { headers: { Accept: "application/json" }, cache: "no-store" }
//       );
//       const json = await res.json();
//       setServicesDoc(json || { services: [] });
//     })();

//     return () => {
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//     };
//   }, []);

//   const updateService = (idx, key, value) => {
//     const updated = [...(servicesDoc.services || [])];
//     if (!updated[idx]) return;
//     updated[idx][key] = key === "order" ? Number(value) : value;
//     setServicesDoc((p) => ({ ...p, services: updated }));
//   };

//   const addService = () => {
//     setServicesDoc((p) => ({
//       ...p,
//       services: [
//         ...(p.services || []),
//         {
//           title: "",
//           description: "",
//           imageUrl: "",
//           delay: "0.1s",
//           order: (p.services?.length || 0) + 1,
//           buttonText: "Read More",
//           buttonHref: "#",
//         },
//       ],
//     }));
//   };

//   const removeService = (idx) => {
//     const updated = [...(servicesDoc.services || [])];
//     const removed = updated.splice(idx, 1)[0];
//     const k = keyFor(removed, idx);
//     const lu = lastUrlsRef.current[k];
//     if (lu) {
//       try { URL.revokeObjectURL(lu); } catch {}
//       delete lastUrlsRef.current[k];
//     }
//     setDrafts((d) => {
//       const { [k]: _, ...rest } = d;
//       return rest;
//     });
//     setServicesDoc((p) => ({ ...p, services: updated }));
//   };

//   // Pick local file -> set draft preview ONLY
//   const onPickLocal = (file, svcKey) => {
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       alert("Image must be ≤ 10 MB");
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     const prev = lastUrlsRef.current[svcKey];
//     if (prev) {
//       try { URL.revokeObjectURL(prev); } catch {}
//     }
//     lastUrlsRef.current[svcKey] = objUrl;

//     setDrafts((d) => ({ ...d, [svcKey]: { file, url: objUrl } }));
//     setSuccess("");
//   };

//   // Upload a single draft (service must have _id)
//   const uploadSingleDraft = async (serviceId, file) => {
//     const form = new FormData();
//     form.append("image", file);
//     const res = await fetch(
//       `${backendBaseUrl}/api/services/${userId}/${templateId}/${serviceId}/image`,
//       { method: "POST", body: form }
//     );
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     const json = await res.json();
//     return json;
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       let workingDoc = { ...(servicesDoc || {}), services: [...(servicesDoc.services || [])] };

//       // 1) Upload drafts for services that already have an _id
//       for (let idx = 0; idx < workingDoc.services.length; idx++) {
//         const svc = workingDoc.services[idx];
//         const k = keyFor(svc, idx);
//         const draft = drafts[k];
//         if (draft?.file && svc?._id) {
//           const up = await uploadSingleDraft(svc._id, draft.file);
//           if (up?.result?.services) {
//             workingDoc = up.result; // backend returned full doc
//           } else if (up?.imageUrl) {
//             workingDoc.services[idx] = { ...svc, imageUrl: up.imageUrl };
//           }
//         }
//       }

//       // 2) Save the full services doc
//       const putRes = await fetch(
//         `${backendBaseUrl}/api/services/${userId}/${templateId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(workingDoc),
//         }
//       );
//       const putJson = await putRes.json();
//       if (putJson) setServicesDoc(putJson);

//       // 3) Clear drafts after successful save
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//       setDrafts({});

//       setSuccess("✅ Saved!");
//       setShowToast(true); // show floater
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Scroll to a specific service row and highlight it
//   const jumpToEdit = (rowKey) => {
//     const row = rowRefs.current[rowKey];
//     if (!row) return;
//     row.scrollIntoView({ behavior: "smooth", block: "center" });
//     const el = row.querySelector("input, textarea, select");
//     if (el) {
//       try { el.focus(); } catch {}
//     }
//     setHighlightKey(rowKey);
//     setTimeout(() => setHighlightKey(null), 1500);
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🧰 Services Section</h4> <BackBar />
//         </Col>
//       </Row>

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4">
//             <div className="text-center mx-auto" style={{ maxWidth: 600 }}>
//               <h1 className="display-6 text-uppercase mb-5">
//                 Reliable &amp; High-Value Gym Services
//               </h1>
//             </div>

//             <div className="row g-4">
//               {(servicesDoc.services || [])
//                 .slice()
//                 .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//                 .map((s, i) => {
//                   const k = keyFor(s, i);
//                   const shown = drafts[k]?.url || absUrl(s.imageUrl);
//                   return (
//                     <div
//                       className="col-lg-3 col-md-6"
//                       key={s._id || i}
//                       data-wow-delay={s.delay || `0.${i + 1}s`}
//                     >
//                       <div className="service-item">
//                         <div className="service-inner pb-5">
//                           {shown ? (
//                             <img className="img-fluid w-100" src={shown} alt="" />
//                           ) : null}
//                           <div className="service-text px-5 pt-4">
//                             <h5 className="text-uppercase">
//                               {s.title || "Service Title"}
//                             </h5>
//                             <p>{s.description || "Service description..."}</p>
//                           </div>

//                           <div className="d-flex gap-2 px-5">
//                             <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
//                               {s.buttonText || "Read More"}
//                               <i className="bi bi-chevron-double-right ms-1"></i>
//                             </a>
//                             <Button
//                               variant="outline-primary"
//                               size="sm"
//                               onClick={() => jumpToEdit(k)}
//                             >
//                               Edit
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5 className="fw-bold">Edit Services</h5>
//           <Button variant="outline-primary" onClick={addService}>
//             ➕ Add Service
//           </Button>
//         </div>

//         <Table bordered responsive size="sm">
//           <thead>
//             <tr>
//               <th style={{ width: 120 }}>Order</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th style={{ width: 130 }}>Delay</th>
//               <th>Image</th>
//               <th>Button Text</th>
//               <th>Button Link</th>
//               <th style={{ width: 160 }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(servicesDoc.services || []).map((s, idx) => {
//               const k = keyFor(s, idx);
//               const thumb = drafts[k]?.url || absUrl(s.imageUrl);
//               const isHighlighted = highlightKey === k;
//               return (
//                 <tr
//                   key={s._id || idx}
//                   ref={(el) => (rowRefs.current[k] = el)}
//                   className={isHighlighted ? "table-warning" : undefined}
//                   style={isHighlighted ? { transition: "background-color .6s" } : undefined}
//                 >
//                   <td>
//                     <Form.Control
//                       type="number"
//                       value={s.order ?? 0}
//                       onChange={(e) => updateService(idx, "order", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.title || ""}
//                       onChange={(e) => updateService(idx, "title", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       as="textarea"
//                       rows={2}
//                       value={s.description || ""}
//                       onChange={(e) => updateService(idx, "description", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.delay || ""}
//                       onChange={(e) => updateService(idx, "delay", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     {thumb ? (
//                       <img
//                         src={thumb}
//                         alt=""
//                         style={{
//                           width: 60,
//                           height: 60,
//                           objectFit: "cover",
//                           display: "block",
//                           marginBottom: 6,
//                         }}
//                       />
//                     ) : null}
//                     <Form.Control
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const f = e.target.files?.[0];
//                         if (!f) return;
//                         onPickLocal(f, k);
//                         try { e.target.value = ""; } catch {}
//                       }}
//                     />
//                     {!s._id && drafts[k]?.file && (
//                       <small className="text-muted d-block mt-1">
//                         (Save first to create this service, then the image will be uploaded.)
//                       </small>
//                     )}
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.buttonText || ""}
//                       onChange={(e) => updateService(idx, "buttonText", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.buttonHref || ""}
//                       onChange={(e) => updateService(idx, "buttonHref", e.target.value)}
//                     />
//                   </td>

//                   {/* Keep TD as table-cell; put flex on inner div so row bg isn't cut */}
//                   <td className="align-middle">
//                     <div className="d-flex gap-2 flex-wrap">
//                       <Button
//                         size="sm"
//                         variant="outline-secondary"
//                         onClick={() => jumpToEdit(k)}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => removeService(idx)}
//                       >
//                         ❌
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>

//         <div className="text-end">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save Services"}
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
//             {success || "Saved successfully."}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// ServicesEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ServicesEditorPage;














// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesS.js
// "use client";

// import React, { useEffect, useState, useRef } from "react";
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
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";
// import BackBar from "../components/BackBar";

// function useResolvedTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
//   const fromUrl = qs?.get("templateId")?.trim();

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
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
//       // 3) Fallback to legacy default
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => { off = true; };
//   }, [fromUrl, userId]);

//   return tpl;
// }

// function ServicesEditorPage() {
//   const userId = defaultUserId;
//   const effectiveTemplateId = useResolvedTemplateId(userId);

//   const [servicesDoc, setServicesDoc] = useState({ services: [] });
//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState("");
//   const [showToast, setShowToast] = useState(false); // floater

//   // draft previews per service: { [serviceId or "idx-#"]: { file, url } }
//   const [drafts, setDrafts] = useState({});
//   const lastUrlsRef = useRef({}); // for revoking Object URLs

//   // row refs & highlighting for "Edit" jumps
//   const rowRefs = useRef({}); // { key: HTMLTableRowElement }
//   const [highlightKey, setHighlightKey] = useState(null);

//   // --- helpers
//   const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
//   const absUrl = (u) => {
//     if (!u) return "";
//     if (isAbs(u)) return u;
//     if (u.startsWith("/")) return `${backendBaseUrl}${u}`;
//     return `${backendBaseUrl}/${u}`;
//   };

//   const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

//   // Load current services for the active template
//   useEffect(() => {
//     if (!effectiveTemplateId) return;
//     let abort = false;

//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(effectiveTemplateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const json = await res.json().catch(() => ({}));
//         if (abort) return;
//         setServicesDoc(json || { services: [] });
//       } catch (e) {
//         if (!abort) setServicesDoc({ services: [] });
//         console.error("❌ Failed to load services", e);
//       }
//     })();

//     return () => { abort = true; };
//   }, [userId, effectiveTemplateId]);

//   useEffect(() => {
//     return () => {
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//     };
//   }, []);

//   const updateService = (idx, key, value) => {
//     const updated = [...(servicesDoc.services || [])];
//     if (!updated[idx]) return;
//     updated[idx][key] = key === "order" ? Number(value) : value;
//     setServicesDoc((p) => ({ ...p, services: updated }));
//   };

//   const addService = () => {
//     setServicesDoc((p) => ({
//       ...p,
//       services: [
//         ...(p.services || []),
//         {
//           title: "",
//           description: "",
//           imageUrl: "",
//           delay: "0.1s",
//           order: (p.services?.length || 0) + 1,
//           buttonText: "Read More",
//           buttonHref: "#",
//         },
//       ],
//     }));
//   };

//   const removeService = (idx) => {
//     const updated = [...(servicesDoc.services || [])];
//     const removed = updated.splice(idx, 1)[0];
//     const k = keyFor(removed, idx);
//     const lu = lastUrlsRef.current[k];
//     if (lu) {
//       try { URL.revokeObjectURL(lu); } catch {}
//       delete lastUrlsRef.current[k];
//     }
//     setDrafts((d) => {
//       const { [k]: _, ...rest } = d;
//       return rest;
//     });
//     setServicesDoc((p) => ({ ...p, services: updated }));
//   };

//   // Pick local file -> set draft preview ONLY
//   const onPickLocal = (file, svcKey) => {
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       alert("Image must be ≤ 10 MB");
//       return;
//     }
//     const objUrl = URL.createObjectURL(file);
//     const prev = lastUrlsRef.current[svcKey];
//     if (prev) {
//       try { URL.revokeObjectURL(prev); } catch {}
//     }
//     lastUrlsRef.current[svcKey] = objUrl;

//     setDrafts((d) => ({ ...d, [svcKey]: { file, url: objUrl } }));
//     setSuccess("");
//   };

//   // Upload a single draft (service must have _id)
//   const uploadSingleDraft = async (serviceId, file) => {
//     const form = new FormData();
//     form.append("image", file);
//     const res = await fetch(
//       `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(effectiveTemplateId)}/${encodeURIComponent(serviceId)}/image`,
//       { method: "POST", body: form }
//     );
//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(txt || "Upload failed");
//     }
//     const json = await res.json();
//     return json;
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       let workingDoc = { ...(servicesDoc || {}), services: [...(servicesDoc.services || [])] };

//       // 1) Upload drafts for services that already have an _id
//       for (let idx = 0; idx < workingDoc.services.length; idx++) {
//         const svc = workingDoc.services[idx];
//         const k = keyFor(svc, idx);
//         const draft = drafts[k];
//         if (draft?.file && svc?._id) {
//           const up = await uploadSingleDraft(svc._id, draft.file);
//           if (up?.result?.services) {
//             workingDoc = up.result; // backend returned full doc
//           } else if (up?.imageUrl) {
//             workingDoc.services[idx] = { ...svc, imageUrl: up.imageUrl };
//           }
//         }
//       }

//       // 2) Save the full services doc
//       const putRes = await fetch(
//         `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(effectiveTemplateId)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(workingDoc),
//         }
//       );
//       const putJson = await putRes.json().catch(() => null);
//       if (putJson) setServicesDoc(putJson);

//       // 3) Clear drafts after successful save
//       Object.values(lastUrlsRef.current).forEach((u) => {
//         try { if (u) URL.revokeObjectURL(u); } catch {}
//       });
//       lastUrlsRef.current = {};
//       setDrafts({});

//       setSuccess("✅ Saved!");
//       setShowToast(true); // show floater
//     } catch (err) {
//       alert("❌ Save failed: " + (err?.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Scroll to a specific service row and highlight it
//   const jumpToEdit = (rowKey) => {
//     const row = rowRefs.current[rowKey];
//     if (!row) return;
//     row.scrollIntoView({ behavior: "smooth", block: "center" });
//     const el = row.querySelector("input, textarea, select");
//     if (el) {
//       try { el.focus(); } catch {}
//     }
//     setHighlightKey(rowKey);
//     setTimeout(() => setHighlightKey(null), 1500);
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🧰 Services Section</h4> <BackBar />
//         </Col>
//       </Row>

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4">
//             <div className="text-center mx-auto" style={{ maxWidth: 600 }}>
//               <div className="text-muted small mb-2">
//                 template: <code>{effectiveTemplateId || "…"}</code>
//               </div>
//               <h1 className="display-6 text-uppercase mb-5">
//                 Reliable &amp; High-Value Gym Services
//               </h1>
//             </div>

//             <div className="row g-4">
//               {(servicesDoc.services || [])
//                 .slice()
//                 .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//                 .map((s, i) => {
//                   const k = keyFor(s, i);
//                   const shown = drafts[k]?.url || absUrl(s.imageUrl);
//                   return (
//                     <div
//                       className="col-lg-3 col-md-6"
//                       key={s._id || i}
//                       data-wow-delay={s.delay || `0.${i + 1}s`}
//                     >
//                       <div className="service-item">
//                         <div className="service-inner pb-5">
//                           {shown ? (
//                             <img className="img-fluid w-100" src={shown} alt="" />
//                           ) : null}
//                           <div className="service-text px-5 pt-4">
//                             <h5 className="text-uppercase">
//                               {s.title || "Service Title"}
//                             </h5>
//                             <p>{s.description || "Service description..."}</p>
//                           </div>

//                           <div className="d-flex gap-2 px-5">
//                             <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
//                               {s.buttonText || "Read More"}
//                               <i className="bi bi-chevron-double-right ms-1"></i>
//                             </a>
//                             <Button
//                               variant="outline-primary"
//                               size="sm"
//                               onClick={() => jumpToEdit(k)}
//                             >
//                               Edit
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5 className="fw-bold">Edit Services</h5>
//           <Button variant="outline-primary" onClick={addService}>
//             ➕ Add Service
//           </Button>
//         </div>

//         <Table bordered responsive size="sm">
//           <thead>
//             <tr>
//               <th style={{ width: 120 }}>Order</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th style={{ width: 130 }}>Delay</th>
//               <th>Image</th>
//               <th>Button Text</th>
//               <th>Button Link</th>
//               <th style={{ width: 160 }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(servicesDoc.services || []).map((s, idx) => {
//               const k = keyFor(s, idx);
//               const thumb = drafts[k]?.url || absUrl(s.imageUrl);
//               const isHighlighted = highlightKey === k;
//               return (
//                 <tr
//                   key={s._id || idx}
//                   ref={(el) => (rowRefs.current[k] = el)}
//                   className={isHighlighted ? "table-warning" : undefined}
//                   style={isHighlighted ? { transition: "background-color .6s" } : undefined}
//                 >
//                   <td>
//                     <Form.Control
//                       type="number"
//                       value={s.order ?? 0}
//                       onChange={(e) => updateService(idx, "order", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.title || ""}
//                       onChange={(e) => updateService(idx, "title", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       as="textarea"
//                       rows={2}
//                       value={s.description || ""}
//                       onChange={(e) => updateService(idx, "description", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.delay || ""}
//                       onChange={(e) => updateService(idx, "delay", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     {thumb ? (
//                       <img
//                         src={thumb}
//                         alt=""
//                         style={{
//                           width: 60,
//                           height: 60,
//                           objectFit: "cover",
//                           display: "block",
//                           marginBottom: 6,
//                         }}
//                       />
//                     ) : null}
//                     <Form.Control
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const f = e.target.files?.[0];
//                         if (!f) return;
//                         onPickLocal(f, k);
//                         try { e.target.value = ""; } catch {}
//                       }}
//                     />
//                     {!s._id && drafts[k]?.file && (
//                       <small className="text-muted d-block mt-1">
//                         (Save first to create this service, then the image will be uploaded.)
//                       </small>
//                     )}
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.buttonText || ""}
//                       onChange={(e) => updateService(idx, "buttonText", e.target.value)}
//                     />
//                   </td>
//                   <td>
//                     <Form.Control
//                       value={s.buttonHref || ""}
//                       onChange={(e) => updateService(idx, "buttonHref", e.target.value)}
//                     />
//                   </td>
//                   <td className="align-middle">
//                     <div className="d-flex gap-2 flex-wrap">
//                       <Button
//                         size="sm"
//                         variant="outline-secondary"
//                         onClick={() => jumpToEdit(k)}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => removeService(idx)}
//                       >
//                         ❌
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>

//         <div className="text-end">
//           <Button onClick={handleSave} disabled={saving || !effectiveTemplateId}>
//             {saving ? "Saving…" : "💾 Save Services"}
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
//             {success || "Saved successfully."}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// ServicesEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ServicesEditorPage;








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
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/* ----------------------------- TEMPLATE PROFILES ----------------------------- */
/* What fields are used for Services per template */
const SERVICES_PROFILES = {
  "sir-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: false,
      buttonText: false,
      buttonHref: false,
    },
    // number of items suggested (optional)
    suggested: 4,
  },
  "gym-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: true,
      buttonText: true,
      buttonHref: true,
    },
    suggested: 8,
  },
};

// fallback if template unknown: allow everything
const ALL_SERVICE_FIELDS = {
  title: true, description: true, delay: true, order: true,
  imageUrl: true, buttonText: true, buttonHref: true,
};

/* ----------------------------- HELPERS ----------------------------- */
const ABS = /^https?:\/\//i;
const absUrl = (u) => {
  const s = String(u || "").trim();
  if (!s) return "";
  if (ABS.test(s)) return s;
  if (s.startsWith("/")) return `${backendBaseUrl}${s}`;
  return `${backendBaseUrl}/${s.replace(/^\/+/, "")}`;
};

const pickAllowed = (row, allowed) => {
  const out = {};
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] && row[k] !== undefined) out[k] = row[k];
  });
  return out;
};

/* Resolve templateId: ?templateId → backend selection → gym-template-1 */
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
function ServicesEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const profile = SERVICES_PROFILES[templateId] || { fields: ALL_SERVICE_FIELDS, suggested: 4 };
  const allowed = profile.fields;

  const [doc, setDoc] = useState({ services: [] });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // draft previews keyed per row (_id or idx-#)
  const [drafts, setDrafts] = useState({});
  const lastUrlsRef = useRef({});

  const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

  // ------------------- LOAD -------------------
  useEffect(() => {
    if (!templateId) return;
    let off = false;

    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json().catch(() => ({}));
        if (off) return;

        const rows = Array.isArray(json?.services) ? json.services : [];
        setDoc({ services: rows });
        setErrorMsg("");
      } catch (e) {
        if (!off) {
          setDoc({ services: [] });
          setErrorMsg("Failed to load services.");
          console.error("❌ services load:", e);
        }
      }
    })();

    return () => { off = true; };
  }, [userId, templateId]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      Object.values(lastUrlsRef.current).forEach((u) => {
        try { u && URL.revokeObjectURL(u); } catch {}
      });
      lastUrlsRef.current = {};
    };
  }, []);

  // ------------------- EDITING -------------------
  const updateRow = (idx, key, value) => {
    setDoc((p) => {
      const arr = Array.isArray(p.services) ? [...p.services] : [];
      if (!arr[idx]) return p;
      arr[idx] = { ...arr[idx], [key]: key === "order" ? Number(value) : value };
      return { ...p, services: arr };
    });
  };

  const addRow = () => {
    setDoc((p) => ({
      ...p,
      services: [
        ...(p.services || []),
        {
          title: "",
          description: "",
          delay: "0.1s",
          order: (p.services?.length || 0) + 1,
          imageUrl: "",
          buttonText: "Read More",
          buttonHref: "#",
        },
      ],
    }));
  };

  const removeRow = (idx) => {
    setDoc((p) => {
      const arr = [...(p.services || [])];
      const removed = arr.splice(idx, 1)[0];
      const k = keyFor(removed, idx);
      const u = lastUrlsRef.current[k];
      if (u) { try { URL.revokeObjectURL(u); } catch {} delete lastUrlsRef.current[k]; }
      setDrafts((d) => {
        const { [k]: _, ...rest } = d;
        return rest;
      });
      return { ...p, services: arr };
    });
  };

  const pickLocalFile = (file, rowKey) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be ≤ 10 MB");
      return;
    }
    const objUrl = URL.createObjectURL(file);
    const prev = lastUrlsRef.current[rowKey];
    if (prev) {
      try { URL.revokeObjectURL(prev); } catch {}
    }
    lastUrlsRef.current[rowKey] = objUrl;
    setDrafts((d) => ({ ...d, [rowKey]: { file, url: objUrl } }));
  };

  const uploadImageFor = async (serviceId, file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(
      `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/${encodeURIComponent(serviceId)}/image`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    return res.json();
  };

  // ------------------- SAVE -------------------
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    try {
      let working = { services: [...(doc.services || [])] };

      // If this template supports imageUrl, upload drafts for rows that have _id
      if (allowed.imageUrl) {
        for (let idx = 0; idx < working.services.length; idx++) {
          const row = working.services[idx];
          const k = keyFor(row, idx);
          const draft = drafts[k];
          if (draft?.file && row?._id) {
            const up = await uploadImageFor(row._id, draft.file);
            // allow either shape {result:{services}} or {imageUrl: "..."}
            if (up?.result?.services) {
              working.services = up.result.services;
            } else if (up?.imageUrl) {
              working.services[idx] = { ...row, imageUrl: up.imageUrl };
            }
          }
        }
      }

      // send only allowed fields to backend
      const payload = {
        services: working.services.map((s) => pickAllowed(s, allowed)),
      };

      const put = await fetch(
        `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const putJson = await put.json().catch(() => null);
      if (!put.ok) {
        throw new Error(putJson?.error || put.statusText || "Save failed");
      }

      // replace with server doc
      if (putJson?.services) setDoc({ services: putJson.services });

      // clear drafts
      Object.values(lastUrlsRef.current).forEach((u) => { try { u && URL.revokeObjectURL(u); } catch {} });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------- PREVIEW ------------------- */
  const PreviewSir = ({ items }) => (
    <section className="section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div className="exp valign text-center">
              <div className="full-width">
                <h2>12+</h2>
                <h6 className="sub-title">Years of Experience</h6>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="accordion bord full-width">
              <div className="sec-head mb-70">
                <span className="sub-title mb-15 opacity-8">- Services</span>
                <h3 className="text-u f-bold">What We <span className="f-ultra-light">Do</span> ?</h3>
              </div>

              {items
                .slice()
                .sort((a,b)=>(a.order ?? 0)-(b.order ?? 0))
                .map((s, i) => (
                <div key={s._id || i} className="item mb-20">
                  <div className="title">
                    <h4 className="">{s.title || "Service Title"}</h4>
                    <span className="ico"></span>
                  </div>
                  <div className="accordion-info">
                    <p>{s.description || "Service description..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const PreviewGym = ({ items }) => (
    <div className="row g-4">
      {items
        .slice()
        .sort((a,b)=>(a.order ?? 0)-(b.order ?? 0))
        .map((s, i) => {
          const k = keyFor(s, i);
          const shown = drafts[k]?.url || absUrl(s.imageUrl);
          return (
            <div className="col-lg-3 col-md-6" key={s._id || i} data-wow-delay={s.delay || `0.${i+1}s`}>
              <div className="service-item">
                <div className="service-inner pb-5">
                  {shown ? <img className="img-fluid w-100" src={shown} alt="" /> : null}
                  <div className="service-text px-5 pt-4">
                    <h5 className="text-uppercase">{s.title || "Service Title"}</h5>
                    <p>{s.description || "Service description..."}</p>
                  </div>
                  <div className="d-flex gap-2 px-5">
                    <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
                      {s.buttonText || "Read More"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );

  const isSir = templateId === "sir-template-1";
  const isGym = templateId === "gym-template-1";

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center">
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🧰 Services</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">
                fields: {Object.keys(allowed).filter(k => allowed[k]).join(", ")}
              </Badge>
            </div>
            <div className="text-muted">endpoint: <code>/api/services/{defaultUserId}/{templateId}</code></div>
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
      ) : null}

      {/* Preview */}
      <Card className="p-4 mb-4">
        {isSir && <PreviewSir items={doc.services || []} />}
        {isGym && <PreviewGym items={doc.services || []} />}
        {!isSir && !isGym && (
          <div className="text-muted">No special preview for this template.</div>
        )}
      </Card>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Edit Items</h5>
          <Button variant="outline-primary" onClick={addRow}>➕ Add Item</Button>
        </div>

        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 84 }}>Order</th>
              <th style={{ minWidth: 220 }}>Title</th>
              <th>Description</th>
              {allowed.delay && <th style={{ width: 120 }}>Delay</th>}
              {allowed.imageUrl && <th style={{ width: 220 }}>Image</th>}
              {allowed.buttonText && <th style={{ width: 160 }}>Btn Text</th>}
              {allowed.buttonHref && <th style={{ width: 220 }}>Btn Link</th>}
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(doc.services || []).map((s, idx) => {
              const k = keyFor(s, idx);
              const thumb = drafts[k]?.url || absUrl(s.imageUrl);
              return (
                <tr key={s._id || idx}>
                  <td>
                    <Form.Control
                      type="number"
                      value={s.order ?? 0}
                      onChange={(e) => updateRow(idx, "order", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={s.title || ""}
                      onChange={(e) => updateRow(idx, "title", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={s.description || ""}
                      onChange={(e) => updateRow(idx, "description", e.target.value)}
                    />
                  </td>

                  {allowed.delay && (
                    <td>
                      <Form.Control
                        value={s.delay || ""}
                        onChange={(e) => updateRow(idx, "delay", e.target.value)}
                      />
                    </td>
                  )}

                  {allowed.imageUrl && (
                    <td>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          style={{ width: 64, height: 64, objectFit: "cover", display: "block", marginBottom: 6 }}
                        />
                      ) : null}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          pickLocalFile(f, k);
                          try { e.target.value = ""; } catch {}
                        }}
                      />
                      {!s._id && drafts[k]?.file && (
                        <small className="text-muted d-block mt-1">
                          Save to create the row first; image will upload afterwards.
                        </small>
                      )}
                    </td>
                  )}

                  {allowed.buttonText && (
                    <td>
                      <Form.Control
                        value={s.buttonText || ""}
                        onChange={(e) => updateRow(idx, "buttonText", e.target.value)}
                      />
                    </td>
                  )}

                  {allowed.buttonHref && (
                    <td>
                      <Form.Control
                        value={s.buttonHref || ""}
                        onChange={(e) => updateRow(idx, "buttonHref", e.target.value)}
                      />
                    </td>
                  )}

                  <td className="align-middle">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => removeRow(idx)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
            {(doc.services || []).length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No items yet. Click “Add Item”.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ServicesEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ServicesEditorPage;
