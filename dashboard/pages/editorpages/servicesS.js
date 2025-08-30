









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






// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesS.js
"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { backendBaseUrl, userId, templateId } from "../../lib/config";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || "";

// helpers
const isHttp = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

function ServicesEditorPage() {
  const [servicesDoc, setServicesDoc] = useState({ services: [] });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // draft previews per row key: { [rowKey]: { file, url } }
  const [drafts, setDrafts] = useState({});
  const lastUrlsRef = useRef({}); // for revoking object URLs

  // row refs & highlight for "Edit" jumps
  const rowRefs = useRef({});
  const [highlightKey, setHighlightKey] = useState(null);

  // unique key for a row
  const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

  // ------- LOAD -------
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          `${API}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const j = await r.json();
        setServicesDoc(j || { services: [] });
      } catch (e) {
        console.error("Failed to load services", e);
      }
    })();

    return () => {
      // cleanup any object URLs
      Object.values(lastUrlsRef.current).forEach((u) => {
        try {
          if (u) URL.revokeObjectURL(u);
        } catch {}
      });
      lastUrlsRef.current = {};
    };
  }, []);

  // ------- FORM EDIT -------
  const updateService = (idx, key, value) => {
    const updated = [...(servicesDoc.services || [])];
    if (!updated[idx]) return;
    updated[idx][key] = key === "order" ? Number(value) : value;
    setServicesDoc((p) => ({ ...p, services: updated }));
  };

  const addService = () => {
    setServicesDoc((p) => ({
      ...p,
      services: [
        ...(p.services || []),
        {
          title: "",
          description: "",
          imageUrl: "", // will be set to public URL after upload
          delay: "0.1s",
          order: (p.services?.length || 0) + 1,
          buttonText: "Read More",
          buttonHref: "#",
        },
      ],
    }));
  };

  const removeService = (idx) => {
    const updated = [...(servicesDoc.services || [])];
    const removed = updated.splice(idx, 1)[0];
    const k = keyFor(removed, idx);
    const lu = lastUrlsRef.current[k];
    if (lu) {
      try {
        URL.revokeObjectURL(lu);
      } catch {}
      delete lastUrlsRef.current[k];
    }
    setDrafts((d) => {
      const { [k]: _gone, ...rest } = d;
      return rest;
    });
    setServicesDoc((p) => ({ ...p, services: updated }));
  };

  // ------- FILE PICK (LOCAL PREVIEW ONLY) -------
  const onPickLocal = (file, svcKey) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be ≤ 10 MB");
      return;
    }
    const objUrl = URL.createObjectURL(file);
    const prev = lastUrlsRef.current[svcKey];
    if (prev) {
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }
    lastUrlsRef.current[svcKey] = objUrl;
    setDrafts((d) => ({ ...d, [svcKey]: { file, url: objUrl } }));
  };

  // ------- CPANEL TOKEN + UPLOAD -------
  const uploadViaCpanel = async (file) => {
    // 1) ask backend for a short-lived token & upload URL
    const meta = {
      filename: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    };
    const tRes = await fetch(
      `${API}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/upload-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      }
    );
    if (!tRes.ok) throw new Error(await readErr(tRes));
    const { token, uploadUrl } = await tRes.json();

    // 2) upload file to cPanel
    const fd = new FormData();
    fd.append("file", file);
    const uRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "X-ION7-Token": token },
      body: fd,
    });
    if (!uRes.ok) throw new Error(await readErr(uRes));
    const j = await uRes.json();
    const url = j?.url || "";
    if (!isHttp(url)) throw new Error("cPanel upload did not return a public URL");
    return url; // absolute http(s) URL
  };

  // ------- SAVE -------
  const handleSave = async () => {
    setSaving(true);
    try {
      // working copy
      const working = { ...(servicesDoc || {}), services: [...(servicesDoc.services || [])] };

      // 1) upload all drafts first (in parallel)
      const uploads = working.services.map(async (svc, idx) => {
        const k = keyFor(svc, idx);
        const draft = drafts[k];
        if (!draft?.file) return svc; // no change
        const publicUrl = await uploadViaCpanel(draft.file);
        return { ...svc, imageUrl: publicUrl };
      });
      const uploadedServices = await Promise.all(uploads);

      // 2) ensure only http(s) or empty is sent
      const payload = {
        services: uploadedServices.map((s) => ({
          title: s.title || "",
          description: s.description || "",
          delay: s.delay || "",
          order: typeof s.order === "number" ? s.order : 0,
          buttonText: s.buttonText || "",
          buttonHref: s.buttonHref || "",
          imageUrl: isHttp(s.imageUrl) ? s.imageUrl : "", // backend requires http(s)
          // _id is ignored by backend on PUT (it replaces array), so omit
        })),
      };

      // 3) PUT full services array
      const put = await fetch(
        `${API}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!put.ok) throw new Error(await readErr(put));

      // 4) refresh from server
      const fresh = await fetch(
        `${API}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const freshJson = await fresh.json();
      setServicesDoc(freshJson || { services: [] });

      // 5) clear local drafts
      Object.values(lastUrlsRef.current).forEach((u) => {
        try {
          if (u) URL.revokeObjectURL(u);
        } catch {}
      });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (err) {
      alert("❌ Save failed: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  // scroll to row helper
  const jumpToEdit = (rowKey) => {
    const row = rowRefs.current[rowKey];
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    const el = row.querySelector("input, textarea, select");
    if (el) {
      try {
        el.focus();
      } catch {}
    }
    setHighlightKey(rowKey);
    setTimeout(() => setHighlightKey(null), 1500);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🧰 Services Section</h4> <BackBar />
        </Col>
      </Row>

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="text-center mx-auto" style={{ maxWidth: 600 }}>
              <h1 className="display-6 text-uppercase mb-5">
                Reliable &amp; High-Value Gym Services
              </h1>
            </div>

            <div className="row g-4">
              {(servicesDoc.services || [])
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((s, i) => {
                  const k = keyFor(s, i);
                  const shown = drafts[k]?.url || (isHttp(s.imageUrl) ? s.imageUrl : "");
                  return (
                    <div
                      className="col-lg-3 col-md-6"
                      key={s._id || i}
                      data-wow-delay={s.delay || `0.${i + 1}s`}
                    >
                      <div className="service-item">
                        <div className="service-inner pb-5">
                          {shown ? (
                            <img className="img-fluid w-100" src={shown} alt="" />
                          ) : null}
                          <div className="service-text px-5 pt-4">
                            <h5 className="text-uppercase">{s.title || "Service Title"}</h5>
                            <p>{s.description || "Service description..."}</p>
                          </div>

                          <div className="d-flex gap-2 px-5">
                            <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
                              {s.buttonText || "Read More"}
                              <i className="bi bi-chevron-double-right ms-1"></i>
                            </a>
                            <Button variant="outline-primary" size="sm" onClick={() => jumpToEdit(k)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Edit Services</h5>
          <Button variant="outline-primary" onClick={addService}>
            ➕ Add Service
          </Button>
        </div>

        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Order</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{ width: 130 }}>Delay</th>
              <th>Image</th>
              <th>Button Text</th>
              <th>Button Link</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(servicesDoc.services || []).map((s, idx) => {
              const k = keyFor(s, idx);
              const thumb = drafts[k]?.url || (isHttp(s.imageUrl) ? s.imageUrl : "");
              const isHighlighted = highlightKey === k;
              return (
                <tr
                  key={s._id || idx}
                  ref={(el) => (rowRefs.current[k] = el)}
                  className={isHighlighted ? "table-warning" : undefined}
                  style={isHighlighted ? { transition: "background-color .6s" } : undefined}
                >
                  <td>
                    <Form.Control
                      type="number"
                      value={s.order ?? 0}
                      onChange={(e) => updateService(idx, "order", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={s.title || ""}
                      onChange={(e) => updateService(idx, "title", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={s.description || ""}
                      onChange={(e) => updateService(idx, "description", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={s.delay || ""}
                      onChange={(e) => updateService(idx, "delay", e.target.value)}
                    />
                  </td>
                  <td>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          display: "block",
                          marginBottom: 6,
                        }}
                      />
                    ) : null}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        onPickLocal(f, k);
                        try {
                          e.target.value = "";
                        } catch {}
                      }}
                    />
                    {!isHttp(s.imageUrl) && !drafts[k]?.file && (
                      <small className="text-muted d-block mt-1">
                        (Choose an image to upload; a public URL will be saved.)
                      </small>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      value={s.buttonText || ""}
                      onChange={(e) => updateService(idx, "buttonText", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={s.buttonHref || ""}
                      onChange={(e) => updateService(idx, "buttonHref", e.target.value)}
                    />
                  </td>
                  <td className="align-middle">
                    <div className="d-flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline-secondary" onClick={() => jumpToEdit(k)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => removeService(idx)}>
                        ❌
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Services"}
          </Button>
        </div>
      </Card>

      {/* Floating toast (floater) */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ServicesEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default ServicesEditorPage;
