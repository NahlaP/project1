

// // pages/editorpages/appointmentS.js
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Container, Row, Col, Card, Button, Form, Alert, Table,
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
//     return () => { off = true; };
//   }, [userId, require("next/router").useRouter().query.templateId]);

//   return templateId;
// }

// function AppointmentEditorPage() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [data, setData] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",       // S3 key stored in DB
//     backgroundImageUrl: "",    // optional direct/presigned URL from server
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

//   // Load existing Appointment doc
//   useEffect(() => {
//     if (!templateId) return;

//     let abort = false;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const result = await res.json();
//         if (abort) return;

//         if (result) {
//           setData((p) => ({ ...p, ...result }));

//           if (result.backgroundImageUrl) {
//             setServerPreviewUrl(result.backgroundImageUrl);
//           } else if (result.backgroundImage) {
//             const url = await getSignedUrlFor(result.backgroundImage);
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
//   }, [userId, templateId]);

//   const handleChange = (key, value) => {
//     setData((prev) => ({ ...prev, [key]: value }));
//   };

//   // Choose file → local preview only
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

//   /**
//    * Upload to your existing backend route:
//    *   POST /api/appointment/:userId/:templateId/image
//    * field name: "image"
//    * (We keep a tiny fallback to /upload-bg only if you later add it.)
//    */
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile) return null;

//     // 1) preferred – your existing route with user/template in path
//     try {
//       const form = new FormData();
//       form.append("image", draftFile);
//       const url = `${backendBaseUrl}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/image`;
//       const res = await fetch(url, { method: "POST", body: form });
//       if (!res.ok) {
//         const txt = await res.text().catch(() => "");
//         throw new Error(txt || `Upload failed (${res.status})`);
//       }
//       const j = await res.json().catch(() => ({}));
//       return j?.imageKey || j?.key || null;
//     } catch (e) {
//       console.warn("primary upload route failed, trying /upload-bg once:", e?.message || e);
//       // 2) optional fallback (only if you later add this backend)
//       try {
//         const form = new FormData();
//         form.append("image", draftFile);
//         const res = await fetch(`${backendBaseUrl}/api/appointment/upload-bg`, {
//           method: "POST",
//           body: form,
//         });
//         if (!res.ok) {
//           const txt = await res.text().catch(() => "");
//           throw new Error(txt || `Upload failed (${res.status})`);
//         }
//         const j = await res.json().catch(() => ({}));
//         return j?.key || null;
//       } catch (e2) {
//         throw e2;
//       }
//     }
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
//         backgroundImage: newKey ? newKey : data.backgroundImage || "",
//       };

//       // Save for this user/template
//       const res = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );
//       const result = await res.json().catch(() => ({}));
//       if (result?.message || result?.ok) setSuccess("✅ Appointment section updated!");

//       // Refresh from server (also refresh presigned URL)
//       const r2 = await fetch(
//         `${backendBaseUrl}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
//         { headers: { Accept: "application/json" }, cache: "no-store" }
//       );
//       const j2 = await r2.json().catch(() => ({}));
//       if (j2) {
//         setData((p) => ({ ...p, ...j2 }));
//         const newUrl =
//           j2.backgroundImageUrl ||
//           (j2.backgroundImage ? await getSignedUrlFor(j2.backgroundImage) : "");
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
//                     backgroundImage: (draftPreview || serverPreviewUrl)
//                       ? `url(${draftPreview || serverPreviewUrl})`
//                       : "none",
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
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
//                 <p><strong>Office Address:</strong> {data.officeAddress}</p>
//                 <p><strong>Office Time:</strong> {data.officeTime}</p>
//                 <p className="mb-1"><strong>Services:</strong></p>
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
//             Max 10 MB. New image is uploaded only when you click <strong>Save</strong>.
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
//                       const updated = (data.services || []).filter((_, i) => i !== idx);
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
//                             services: [...(p.services || []), newService.trim()],
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















// pages/editorpages/appointmentS.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId as defaultUserId } from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/** Resolve templateId from: URL ?templateId=... -> backend selection -> fallback */
function useResolvedTemplateId(userId) {
  const [templateId, setTemplateId] = useState("");
  const router = require("next/router").useRouter();

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTemplateId(fromUrl);
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTemplateId(t);
          return;
        }
      } catch {}
      if (!off) setTemplateId("gym-template-1");
    })();
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, require("next/router").useRouter().query.templateId]);

  return templateId;
}

const ABS = /^https?:\/\//i;

function AppointmentEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [data, setData] = useState({
    // Editor-facing fields
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "", // S3 key OR absolute url (from template)
    backgroundImageUrl: "", // direct/presigned (server)
    services: [],
  });

  const [serverPreviewUrl, setServerPreviewUrl] = useState("");
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [newService, setNewService] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Helper: get a presigned URL for any stored S3 key
  const getSignedUrlFor = async (key) => {
    if (!key) return "";
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
      );
      const json = await res.json();
      return json?.url || json?.signedUrl || json || "";
    } catch (e) {
      console.error("Failed to get signed URL", e);
      return "";
    }
  };

  // Load existing Appointment doc (user override → template defaults)
  useEffect(() => {
    if (!templateId) return;

    let abort = false;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/appointment/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const result = await res.json();
        if (abort) return;

        if (result) {
          // Map template field names to editor fields
          const mapped = {
            ...result,
            title: result.title ?? result.headingLeft ?? "",
            subtitle: result.subtitle ?? result.descriptionLeft ?? "",
            services: Array.isArray(result.services) ? result.services : [],
            // backgroundImage may be:
            //  - a server-provided presigned `backgroundImageUrl`
            //  - an absolute template URL in `backgroundImage`
            //  - an S3 key in `backgroundImage`
          };

          setData((p) => ({ ...p, ...mapped }));

          // Choose best preview URL
          if (mapped.backgroundImageUrl) {
            setServerPreviewUrl(mapped.backgroundImageUrl);
          } else if (mapped.backgroundImage && ABS.test(mapped.backgroundImage)) {
            setServerPreviewUrl(mapped.backgroundImage);
          } else if (mapped.backgroundImage) {
            const url = await getSignedUrlFor(mapped.backgroundImage);
            if (!abort) setServerPreviewUrl(url || "");
          } else {
            setServerPreviewUrl("");
          }
        }
      } catch (err) {
        if (!abort) console.error("❌ Failed to load appointment section", err);
      }
    })();

    return () => {
      abort = true;
      if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, templateId]);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Choose file → local preview
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
    setSuccess("");
  };

  /** Upload draft image if any (field name: "image") */
  const uploadDraftIfNeeded = async () => {
    if (!draftFile) return null;

    // Preferred route with user/template in path
    const form = new FormData();
    form.append("image", draftFile);
    const url = `${backendBaseUrl}/api/appointment/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}/image`;
    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Upload failed (${res.status})`);
    }
    const j = await res.json().catch(() => ({}));
    return j?.imageKey || j?.key || null;
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // Upload file if picked
      const newKey = await uploadDraftIfNeeded();

      const payload = {
        title: data.title || "",
        subtitle: data.subtitle || "",
        officeAddress: data.officeAddress || "",
        officeTime: data.officeTime || "",
        services: Array.isArray(data.services) ? data.services : [],
        // if a new image was uploaded, use it; otherwise keep key if it’s a key
        // (we do not store absolute template URLs in DB)
        backgroundImage: newKey
          ? newKey
          : ABS.test(data.backgroundImage)
          ? ""
          : data.backgroundImage || "",
      };

      const res = await fetch(
        `${backendBaseUrl}/api/appointment/${encodeURIComponent(
          userId
        )}/${encodeURIComponent(templateId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json().catch(() => ({}));
      if (result?.message || result?.ok)
        setSuccess("✅ Appointment section updated!");

      // Refresh from server (also refresh preview URL)
      const r2 = await fetch(
        `${backendBaseUrl}/api/appointment/${encodeURIComponent(
          userId
        )}/${encodeURIComponent(templateId)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const j2 = await r2.json().catch(() => ({}));
      if (j2) {
        const mapped = {
          ...j2,
          title: j2.title ?? j2.headingLeft ?? "",
          subtitle: j2.subtitle ?? j2.descriptionLeft ?? "",
        };
        setData((p) => ({ ...p, ...mapped }));

        const newUrl =
          mapped.backgroundImageUrl ||
          (mapped.backgroundImage && ABS.test(mapped.backgroundImage)
            ? mapped.backgroundImage
            : mapped.backgroundImage
            ? await getSignedUrlFor(mapped.backgroundImage)
            : "");
        setServerPreviewUrl(newUrl || "");
      }

      // Clear local draft
      setDraftFile(null);
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }
      setDraftPreview("");
    } catch (err) {
      alert("❌ Save failed: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const bgUrl = draftPreview || serverPreviewUrl || "";

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

      {success && <Alert variant="success" className="mt-3">{success}</Alert>}

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
                    minHeight: "500px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              </Col>
              <Col lg={6}>
                <h1 className="display-6 text-uppercase mb-4">
                  {data.title || "Appointment title..."}
                </h1>
                <p className="mb-4">{data.subtitle || "Subtitle..."}</p>
                <p>
                  <strong>Office Address:</strong> {data.officeAddress}
                </p>
                <p>
                  <strong>Office Time:</strong> {data.officeTime}
                </p>
                <p className="mb-1">
                  <strong>Services:</strong>
                </p>
                <ul className="mb-0">
                  {(data.services || []).map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
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
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={data.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control
                value={data.officeAddress}
                onChange={(e) => handleChange("officeAddress", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Office Time</Form.Label>
              <Form.Control
                value={data.officeTime}
                onChange={(e) => handleChange("officeTime", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Background Image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
          <div className="form-text">
            Max 10 MB. New image is uploaded only when you click{" "}
            <strong>Save</strong>.
          </div>
        </Form.Group>

        <h6 className="fw-bold mt-3 mb-2">Services</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Service</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data.services || []).map((service, idx) => (
              <tr key={idx}>
                <td>{service}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const updated = (data.services || []).filter(
                        (_, i) => i !== idx
                      );
                      setData((p) => ({ ...p, services: updated }));
                    }}
                  >
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Row>
                  <Col>
                    <Form.Control
                      placeholder="New service"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                    />
                  </Col>
                  <Col sm="auto">
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        if (newService.trim()) {
                          setData((p) => ({
                            ...p,
                            services: [
                              ...(p.services || []),
                              newService.trim(),
                            ],
                          }));
                          setNewService("");
                        }
                      }}
                    >
                      ➕ Add Service
                    </Button>
                  </Col>
                </Row>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

AppointmentEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AppointmentEditorPage;
