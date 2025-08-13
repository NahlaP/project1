


// import React, { useEffect, useState } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl as CONFIG_BASE, userId, templateId } from "../../lib/config";

// const resolveBackendBase = () => {
//   if (typeof window !== "undefined") {
//     const isProd =
//       window.location.hostname.endsWith(".vercel.app") ||
//       window.location.hostname.includes("project1-dash");
//     return (
//       CONFIG_BASE ||
//       (isProd ? "https://project1backend-2xvq.onrender.com" : "http://localhost:5000")
//     );
//   }
//   return CONFIG_BASE || "http://localhost:5000";
// };
// const backendBaseUrl = resolveBackendBase();


// const toPublicUrl = (maybePath) => {
//   if (!maybePath) return "";
//   if (/^https?:\/\//i.test(maybePath)) return maybePath;
//   const path = maybePath.startsWith("/") ? maybePath : `/${maybePath}`;
//   return `${backendBaseUrl}${path}`;
// };

// function HeroEditorPage() {
//   const [content, setContent] = useState("");
//   const [imageUrl, setImageUrl] = useState(""); 
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     const run = async () => {
//       setError("");
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
//         if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//         const data = await res.json();
//         setContent(data?.content || "");
//         setImageUrl(data?.imageUrl || "");
//       } catch (err) {
//         console.error("❌ Failed to fetch hero section", err);
//         setError("Could not load current hero data.");
//       }
//     };
//     run();
//   }, []);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("image", file);

//     setUploading(true);
//     setSuccess("");
//     setError("");

//     try {
//       const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Upload failed");

//       if (data?.imageUrl) {
//         setImageUrl(data.imageUrl); 
//         setSuccess("✅ Image uploaded successfully!");
//       } else {
//         throw new Error("Server did not return imageUrl");
//       }
//     } catch (err) {
//       console.error("❌ Upload error:", err);
//       setError("Image upload failed. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     setSuccess("");
//     setError("");
//     try {
//       const payload = { content };
//       if (imageUrl) payload.imageUrl = imageUrl; // send raw value (server expects same as fetch)
//       const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Save failed");
//       setSuccess("✅ Hero section saved successfully!");
//     } catch (err) {
//       console.error("❌ Save error:", err);
//       setError("Could not save hero section.");
//     }
//   };

//   // Final absolute URL for display
//   const displayUrl = toPublicUrl(imageUrl);

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">📝 Hero Section Editor</h4>
//           <p className="text-muted">Update the main banner of your homepage</p>
//         </Col>
//       </Row>

//       <Card className="p-4 shadow-sm">
//         {success && <Alert variant="success">{success}</Alert>}
//         {error && <Alert variant="danger">{error}</Alert>}

//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>Hero Headline</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="Write a motivational welcome message..."
//             />
//           </Form.Group>

//           <Form.Group className="mb-4">
//             <Form.Label>Current Image</Form.Label>
//             <div className="text-center mb-3">
//               {displayUrl ? (
//                 <RBImage
//                   src={displayUrl}
//                   alt="Hero"
//                   style={{
//                     width: "300px",
//                     height: "auto",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                     border: "1px solid #ddd",
//                   }}
//                   onError={() => setError("Image failed to load (check path/host).")}
//                 />
//               ) : (
//                 <p className="text-muted">No image uploaded yet</p>
//               )}
//             </div>

//             <Form.Control type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
//             <Form.Text className="text-muted">Upload JPG/PNG. Recommended: 1920x1080px</Form.Text>
//           </Form.Group>

//           <Button variant="success" onClick={handleSave} disabled={uploading}>
//             {uploading ? "Uploading…" : "💾 Save Changes"}
//           </Button>
//         </Form>
//       </Card>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// export default HeroEditorPage;




// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function HeroEditorPage() {
  const [hero, setHero] = useState({
    content: "",
    imageUrl: "",   // presigned URL for preview (like About uses imageUrl to preview)
  });
  const [imageKey, setImageKey] = useState(""); // S3 key that your backend stores
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // absolute URL checker (so we don't prefix presigned URLs)
  const isAbs = (u = "") => /^https?:\/\//i.test(u);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || `GET failed: ${res.status}`);

        // backend returns: { content, imageUrl: <presigned>, imageKey }
        setHero((p) => ({ ...p, content: data?.content || "", imageUrl: data?.imageUrl || "" }));
        setImageKey(data?.imageKey || "");
      } catch (err) {
        console.error("❌ Failed to load Hero section", err);
      }
    })();
  }, []);

  const handleChange = (key, value) => {
    setHero((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // Backend expects { content, imageKey | imageUrl } and persists the S3 key
      const body = {
        content: hero.content,
        imageKey: imageKey || undefined,  // prefer key if we have it
      };

      const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      // response: { content, imageKey }
      if (data?.imageKey) setImageKey(data.imageKey);
      setSuccess("✅ Saved!");
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
      const form = new FormData();
      form.append("image", e.target.files[0]); // multer-s3 expects field name 'image'

      const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      // upload returns { key, bucket }; store key and refresh to get a fresh presigned URL
      if (data?.key) setImageKey(data.key);

      // re-fetch hero to get a presigned preview URL
      const r2 = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
      const d2 = await r2.json();
      if (r2.ok) {
        setHero((p) => ({ ...p, imageUrl: d2?.imageUrl || p.imageUrl }));
      }

      setSuccess("✅ Image uploaded!");
    } catch (e2) {
      console.error("❌ Upload failed", e2);
    } finally {
      setUploading(false);
    }
  };

  // Preview URL: follow About’s pattern but don’t prefix presigned URLs
  const previewSrc = hero.imageUrl
    ? (isAbs(hero.imageUrl) ? hero.imageUrl : `${backendBaseUrl}${hero.imageUrl}`)
    : `${backendBaseUrl}/img/about.jpg`; // simple fallback like About

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🖼️ Hero Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview (mirrors About layout/style) */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Hero"
                    className="img-fluid"
                    style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
                  />
                ) : (
                  <div className="text-muted">No image uploaded yet</div>
                )}
              </div>
              <div className="col-lg-6">
                <h1 className="display-6 text-uppercase mb-4">
                  {hero.content || "Your hero headline..."}
                </h1>
                <div className="small text-muted">
                  <div><strong>Stored key:</strong> {imageKey || "(none)"} </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor (mirrors About editor) */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Hero Headline</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={hero.content || ""}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Write a motivational welcome message..."
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Image (upload)</Form.Label>
              <Form.Control type="file" onChange={handleUploadImage} />
              {uploading && <small className="text-muted">Uploading…</small>}
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default HeroEditorPage;
