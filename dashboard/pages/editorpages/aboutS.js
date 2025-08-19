





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

// function AboutEditorPage() {
//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",
//     imageAlt: "",
//     bullets: [],
//   });
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
//         const data = await res.json();
//         if (data) setAbout((p) => ({ ...p, ...data }));
//       } catch (err) {
//         console.error("❌ Failed to load About section", err);
//       }
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setAbout((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleBulletChange = (idx, value) => {
//     const updated = [...about.bullets];
//     updated[idx].text = value;
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };

//   const addBullet = () => {
//     setAbout((p) => ({ ...p, bullets: [...(p.bullets || []), { text: "" }] }));
//   };

//   const removeBullet = (idx) => {
//     const updated = [...about.bullets];
//     updated.splice(idx, 1);
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(about),
//       });
//       const data = await res.json();
//       if (data.message) setSuccess("✅ Saved!");
//     } catch (err) {
//       console.error("❌ Save failed", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUploadImage = async (e) => {
//     if (!e.target.files?.length) return;
//     setUploading(true);
//     try {
//       const form = new FormData();
//       form.append("image", e.target.files[0]);

//       const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}/image`, {
//         method: "POST",
//         body: form,
//       });
//       const data = await res.json();
//       if (data?.result?.imageUrl) {
//         setAbout((p) => ({ ...p, imageUrl: data.result.imageUrl }));
//         setSuccess("✅ Image uploaded!");
//       }
//     } catch (e) {
//       console.error("❌ Upload failed", e);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">ℹ️ About Section</h4>
//         </Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="p-4">
//             <div className="row g-5">
//               <div className="col-lg-6">
//                 <img
//                   src={`${backendBaseUrl}${about.imageUrl || "/img/about.jpg"}`}
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
//                         <h5 className="lh-base text-uppercase mb-0">{b.text}</h5>
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
//               <Form.Label>Image (upload)</Form.Label>
//               <Form.Control type="file" onChange={handleUploadImage} />
//               {uploading && <small className="text-muted">Uploading…</small>}
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
//                     value={b.text}
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
//     </Container>
//   );
// }

// AboutEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AboutEditorPage;






// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
import React, { useEffect, useState, useMemo } from "react";
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
import {
  backendBaseUrl,
  userId,
  templateId,
  // Optional (add these in lib/config.js for best results):
  // export const s3Bucket = 'project1-uploads-12345';
  // export const s3Region = 'ap-south-1';
  s3Bucket,
  s3Region,
} from "../../lib/config";

const API = backendBaseUrl || ""; // keep '' so /api/... uses Next rewrite
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const fileName = (p = "") => p.split("/").pop() || "";
const buildS3Url = (bucket, region, keyOrFolder, nameMaybe) => {
  // keyOrFolder can be "users/demo-user/.../about" or "sections/about/..."
  const prefix = String(keyOrFolder || "").replace(/^\/*/, "");
  const path = nameMaybe ? `${prefix}/${nameMaybe}` : prefix;
  return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
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
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load current About
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/about/${userId}/${templateId}`);
        const data = await res.json();
        if (data) setAbout((p) => ({ ...p, ...data }));
      } catch (err) {
        console.error("❌ Failed to load About section", err);
      }
    })();
  }, []);

  const handleChange = (key, value) => {
    setAbout((prev) => ({ ...prev, [key]: value }));
  };

  const handleBulletChange = (idx, value) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    if (!updated[idx]) updated[idx] = { text: "" };
    updated[idx].text = value;
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const addBullet = () => {
    setAbout((p) => ({
      ...p,
      bullets: [...(Array.isArray(p.bullets) ? p.bullets : []), { text: "" }],
    }));
  };

  const removeBullet = (idx) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    updated.splice(idx, 1);
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // Persist the absolute imageUrl + text fields (no backend change required)
      const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
      const data = await res.json();
      if (data?.message || data?.ok) {
        setSuccess("✅ Saved!");
        // Re-fetch to normalize the doc (if backend massages fields)
        const fresh = await fetch(`${API}/api/about/${userId}/${templateId}`);
        setAbout((p) => ({ ...p, ...(await fresh.json()) }));
      }
    } catch (err) {
      console.error("❌ Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setSuccess("");
    try {
      const file = e.target.files[0];
      const form = new FormData();
      form.append("image", file);

      // Your existing upload route
      const res = await fetch(`${API}/api/about/${userId}/${templateId}/image`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      // Try the backend-provided absolute URL first (best case)
      let absUrl =
        data?.result?.imageUrl ||
        data?.imageUrl ||
        data?.url ||
        data?.Location ||
        "";

      // If the backend didn’t return an absolute URL, build one from bucket/folder/key
      if (!isAbs(absUrl)) {
        const bucket = data?.bucket || s3Bucket;
        const folder = String(data?.folder || "").replace(/^\/*/, "");
        const key = String(data?.key || "").replace(/^\/*/, "");
        const name = fileName(key) || file.name;

        if (bucket && (folder || key) && s3Region) {
          absUrl = buildS3Url(bucket, s3Region, folder || key, name);
        }
      }

      if (isAbs(absUrl)) {
        setAbout((p) => ({ ...p, imageUrl: absUrl }));
        setSuccess("✅ Image uploaded!");
      } else {
        console.warn("Upload returned no absolute URL; keeping previous imageUrl");
        setSuccess("⚠️ Uploaded, but preview URL missing.");
      }
    } catch (e2) {
      console.error("❌ Upload failed", e2);
    } finally {
      setUploading(false);
      // reset file input so the same file can be reselected if needed
      e.target.value = "";
    }
  };

  // Ensure the preview never becomes a relative /editorpages/... path
  const safePreviewSrc = useMemo(() => {
    const u = about?.imageUrl;
    if (isAbs(u)) return u;               // good: absolute S3/presigned URL
    if (typeof u === "string" && u.startsWith("/")) return u; // root-relative
    // Anything else (like "sections/about/...") would 404 from /editorpages,
    // so show a stable placeholder from /public/img/.
    return "/img/about.jpg";
  }, [about?.imageUrl]);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">ℹ️ About Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

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
              <Form.Label>Image (upload)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleUploadImage} />
              {uploading && <small className="text-muted">Uploading…</small>}
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
    </Container>
  );
}

AboutEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AboutEditorPage;
