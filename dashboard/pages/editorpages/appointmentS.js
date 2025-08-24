



// 'use client';

// import React, { useEffect, useState } from "react";
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
// import { backendBaseUrl, userId, templateId } from "../../lib/config";
// import BackBar from "../components/BackBar";
// function AppointmentEditorPage() {
//   const [data, setData] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "", // stores S3 key (e.g., sections/appointment/..jpg)
//     services: [],
//   });

//   const [previewUrl, setPreviewUrl] = useState(""); // presigned URL for the bg preview

//   const [newService, setNewService] = useState("");
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   // Helper: get a presigned URL for any stored S3 key
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json();
//       // Support either { url } or bare string responses
//       return json?.url || json?.signedUrl || json || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${userId}/${templateId}`
//         );
//         const result = await res.json();
//         if (result) {
//           setData((p) => ({ ...p, ...result }));

//           // Prefer backgroundImageUrl if backend returns it; otherwise presign the key
//           if (result.backgroundImageUrl) {
//             setPreviewUrl(result.backgroundImageUrl);
//           } else if (result.backgroundImage) {
//             const url = await getSignedUrlFor(result.backgroundImage);
//             setPreviewUrl(url || "");
//           } else {
//             setPreviewUrl("");
//           }
//         }
//       } catch (err) {
//         console.error("❌ Failed to load appointment section", err);
//       }
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleUploadImage = async (e) => {
//     if (!e.target.files?.length) return;
//     setUploading(true);
//     setSuccess("");
//     try {
//       const form = new FormData();
//       form.append("image", e.target.files[0]);

//       // NEW: use your S3-backed route
//       const res = await fetch(`${backendBaseUrl}/api/appointment/upload-bg`, {
//         method: "POST",
//         body: form,
//       });
//       const result = await res.json();

//       if (result?.key) {
//         // Save the S3 key so PUT will persist it
//         setData((prev) => ({ ...prev, backgroundImage: result.key }));

//         // Immediately show a presigned preview
//         const url = await getSignedUrlFor(result.key);
//         setPreviewUrl(url || "");

//         setSuccess("✅ Background image uploaded!");
//       } else {
//         console.warn("Upload did not return key:", result);
//       }
//     } catch (err) {
//       console.error("Image upload failed", err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/appointment/${userId}/${templateId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(data),
//         }
//       );
//       const result = await res.json();
//       if (result.message) setSuccess("✅ Appointment section updated!");

//       // Refresh to pick up any server-side changes and a fresh presigned URL
//       const r2 = await fetch(
//         `${backendBaseUrl}/api/appointment/${userId}/${templateId}`
//       );
//       const j2 = await r2.json();
//       if (j2) {
//         setData((p) => ({ ...p, ...j2 }));
//         const newUrl =
//           j2.backgroundImageUrl ||
//           (j2.backgroundImage ? await getSignedUrlFor(j2.backgroundImage) : "");
//         setPreviewUrl(newUrl || "");
//       }
//     } catch (err) {
//       console.error("❌ Save failed", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">📆 Appointment Section</h4>  <BackBar />
//         </Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}

//       {/* Preview Section */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4" style={{ background: "#f9f9f9" }}>
//             <Row>
//               <Col lg={6}>
//                 <div
//                   style={{
//                     backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
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
//                 <p>
//                   <strong>Office Address:</strong> {data.officeAddress}
//                 </p>
//                 <p>
//                   <strong>Office Time:</strong> {data.officeTime}
//                 </p>
//                 <p>
//                   <strong>Services:</strong>
//                 </p>
//                 <ul>
//                   {data.services.map((service, i) => (
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

//         {/* Background Image Upload */}
//         <Form.Group className="mb-4">
//           <Form.Label>Upload Background Image</Form.Label>
//           <Form.Control type="file" onChange={handleUploadImage} />
//           {uploading && <small className="text-muted">Uploading…</small>}
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
//             {data.services.map((service, idx) => (
//               <tr key={idx}>
//                 <td>{service}</td>
//                 <td>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => {
//                       const updated = data.services.filter((_, i) => i !== idx);
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
//                   <Col>
//                     <Button
//                       variant="outline-primary"
//                       onClick={() => {
//                         if (newService.trim()) {
//                           setData((p) => ({
//                             ...p,
//                             services: [...p.services, newService.trim()],
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
//           <Button onClick={handleSave} disabled={saving}>
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
















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\appointmentS.js
'use client';

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
import { backendBaseUrl, userId, templateId } from "../../lib/config";
import BackBar from "../components/BackBar";

function AppointmentEditorPage() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",   // S3 key stored in DB
    services: [],
  });

  // server-side preview (presigned) and local draft preview
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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/appointment/${userId}/${templateId}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const result = await res.json();
        if (result) {
          setData((p) => ({ ...p, ...result }));

          // Prefer direct URL if provided; else presign the key
          if (result.backgroundImageUrl) {
            setServerPreviewUrl(result.backgroundImageUrl);
          } else if (result.backgroundImage) {
            const url = await getSignedUrlFor(result.backgroundImage);
            setServerPreviewUrl(url || "");
          } else {
            setServerPreviewUrl("");
          }
        }
      } catch (err) {
        console.error("❌ Failed to load appointment section", err);
      }
    })();

    // cleanup any object URL on unmount
    return () => {
      if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    };
  }, []);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // ⬇️ Choose file -> local preview ONLY (no upload here)
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

  // Used ONLY by Save
  const uploadDraftIfNeeded = async () => {
    if (!draftFile) return null;
    const form = new FormData();
    form.append("image", draftFile);
    // Your existing S3-backed route for appointment background
    const res = await fetch(`${backendBaseUrl}/api/appointment/upload-bg`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    const result = await res.json();
    return result?.key || null; // S3 key to store in DB
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // 1) If a new file was selected, upload it now and capture the key
      const newKey = await uploadDraftIfNeeded();

      // 2) Build payload; include new key if present
      const payload = {
        title: data.title || "",
        subtitle: data.subtitle || "",
        officeAddress: data.officeAddress || "",
        officeTime: data.officeTime || "",
        services: Array.isArray(data.services) ? data.services : [],
        backgroundImage: newKey ? newKey : (data.backgroundImage || ""),
      };

      // 3) Save the document
      const res = await fetch(
        `${backendBaseUrl}/api/appointment/${userId}/${templateId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();
      if (result?.message) setSuccess("✅ Appointment section updated!");

      // 4) Refresh from server (also refresh presigned URL)
      const r2 = await fetch(
        `${backendBaseUrl}/api/appointment/${userId}/${templateId}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const j2 = await r2.json();
      if (j2) {
        setData((p) => ({ ...p, ...j2 }));
        const newUrl =
          j2.backgroundImageUrl ||
          (j2.backgroundImage ? await getSignedUrlFor(j2.backgroundImage) : "");
        setServerPreviewUrl(newUrl || "");
      }

      // 5) Clear local draft
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

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">📆 Appointment Section</h4>
          <BackBar />
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview Section */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4" style={{ background: "#f9f9f9" }}>
            <Row>
              <Col lg={6}>
                <div
                  style={{
                    backgroundImage: (draftPreview || serverPreviewUrl)
                      ? `url(${draftPreview || serverPreviewUrl})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
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
                <p>
                  <strong>Services:</strong>
                </p>
                <ul>
                  {data.services.map((service, i) => (
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

        {/* Background Image (choose – preview only) */}
        <Form.Group className="mb-4">
          <Form.Label>Background Image</Form.Label>
          {/* 👇 only sets local preview; upload occurs in Save */}
          <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
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
            {data.services.map((service, idx) => (
              <tr key={idx}>
                <td>{service}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const updated = data.services.filter((_, i) => i !== idx);
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
                  <Col>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        if (newService.trim()) {
                          setData((p) => ({
                            ...p,
                            services: [...p.services, newService.trim()],
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
          <Button onClick={handleSave} disabled={saving}>
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
