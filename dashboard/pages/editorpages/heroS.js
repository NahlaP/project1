


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
  Form,
  Button,
  Image as RBImage,
  Alert,
} from "react-bootstrap";
import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

// Helpers — mirror About behavior
const API = backendBaseUrl || ""; // keep '' so '/api/...' hits rewrite

const isAbsolute = (u = "") => /^https?:\/\//i.test(u);
const joinUrl = (base, path) => {
  if (!path) return "";
  if (isAbsolute(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

// Build S3 URL when backend returns { bucket, key, region }
const s3Url = ({ bucket, key, region }) => {
  if (!bucket || !key) return "";
  const r = region || process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1"; // sensible default
  return `https://${bucket}.s3.${r}.amazonaws.com/${key}`;
};

function HeroEditorPage() {
  const [hero, setHero] = useState({
    content: "",
    imageUrl: "", // may be absolute or relative
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current hero (like About)
  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/hero/${userId}/${templateId}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();

        // Accept absolute URL, backend-relative, or S3 fields
        let img = "";
        if (data?.imageUrl) {
          img = data.imageUrl;
        } else if (data?.bucket && data?.key) {
          img = s3Url({ bucket: data.bucket, key: data.key, region: data.region });
        }

        setHero({
          content: data?.content || "",
          imageUrl: img || "",
        });
      } catch (e) {
        console.error("❌ Failed to load Hero", e);
        setError("Could not load current hero data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Upload image (same idea as About)
  const handleUploadImage = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const form = new FormData();
      form.append("image", e.target.files[0]); // field name must match backend

      // Prefer the About-style endpoint for consistency:
      // POST /api/hero/:userId/:templateId/image
      let res = await fetch(`${API}/api/hero/${userId}/${templateId}/image`, {
        method: "POST",
        body: form,
      });

      // If your backend only has /api/hero/upload-image, fall back:
      if (!res.ok && res.status !== 200) {
        res = await fetch(`${API}/api/hero/upload-image`, {
          method: "POST",
          body: form,
        });
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      if (!res.ok) throw new Error(data?.message || text || "Upload failed");

      // Accept either { result: { imageUrl } } like About, or { imageUrl } or { bucket, key }
      let newUrl = "";
      const imgFromResult = data?.result?.imageUrl;
      if (imgFromResult) {
        newUrl = imgFromResult;
      } else if (data?.imageUrl) {
        newUrl = data.imageUrl;
      } else if (data?.bucket && data?.key) {
        newUrl = s3Url({ bucket: data.bucket, key: data.key, region: data.region });
      } else {
        throw new Error("Server did not return imageUrl or {bucket,key}");
      }

      // update state
      setHero((p) => ({ ...p, imageUrl: newUrl }));
      setSuccess("✅ Image uploaded!");
    } catch (e) {
      console.error("❌ Upload failed", e);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Save (About uses PUT /api/about/:userId/:templateId)
  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const payload = {
        content: hero.content,
        imageUrl: hero.imageUrl, // store absolute or backend-relative—backend should accept it
      };

      const res = await fetch(`${API}/api/hero/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) throw new Error(data?.message || text || "Save failed");
      setSuccess("✅ Saved!");
    } catch (e) {
      console.error("❌ Save failed", e);
      setError("Could not save hero section.");
    } finally {
      setSaving(false);
    }
  };

  // Final preview URL (match About’s `${backendBaseUrl}${about.imageUrl || "/img/about.jpg"}`)
  const previewUrl = hero.imageUrl
    ? isAbsolute(hero.imageUrl)
      ? hero.imageUrl
      : joinUrl(backendBaseUrl, hero.imageUrl)
    : joinUrl(backendBaseUrl, "/img/about.jpg"); // fallback image

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🖼️ Hero Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                <img
                  src={previewUrl}
                  alt="Hero"
                  className="img-fluid"
                  style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
                  onError={() => setError("Image failed to load (check S3 ACL/URL).")}
                />
              </div>
              <div className="col-lg-6">
                <h1 className="display-6 text-uppercase mb-4">
                  {hero.content || "Your hero headline..."}
                </h1>
                <div className="mt-3">
                  <Form.Group>
                    <Form.Label>Hero Headline</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={hero.content || ""}
                      onChange={(e) => setHero((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Write a motivational welcome message..."
                    />
                  </Form.Group>
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
              <Form.Label>Headline (again)</Form.Label>
              <Form.Control
                value={hero.content || ""}
                onChange={(e) => setHero((p) => ({ ...p, content: e.target.value }))}
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
