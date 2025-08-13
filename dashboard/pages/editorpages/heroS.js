


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
  Container, Row, Col, Card, Form, Button, Image as RBImage, Alert,
} from "react-bootstrap";
import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

const API = backendBaseUrl || ""; // '' → '/api/...'

const ABS = (u = "") => /^https?:\/\//i.test(u);
const join = (base, p = "") => (ABS(p) ? p : `${base}${p.startsWith("/") ? p : `/${p}`}`);

const s3Url = ({ bucket, key, region }) => {
  if (!bucket || !key) return "";
  const r = region || process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
  return `https://${bucket}.s3.${r}.amazonaws.com/${key}`;
};

const normalizeImageFromResponse = (data) =>
  data?.result?.imageUrl ||
  data?.imageUrl ||
  s3Url({ bucket: data?.bucket, key: data?.key, region: data?.region }) ||
  "";

function HeroEditorPage() {
  const [hero, setHero] = useState({ content: "", imageUrl: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load (mirrors About)
  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/hero/${userId}/${templateId}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();

        const img =
          data?.imageUrl ||
          s3Url({ bucket: data?.bucket, key: data?.key, region: data?.region }) ||
          "";

        setHero({ content: data?.content || "", imageUrl: img });
      } catch (e) {
        console.error("❌ Failed to load Hero", e);
        setError("Could not load current hero data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Upload (About-style first, fallback to legacy)
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const form = new FormData();
      form.append("image", file);

      // 1) matches About
      let res = await fetch(`${API}/api/hero/${userId}/${templateId}/image`, {
        method: "POST",
        body: form,
      });

      // 2) fallback to your Postman route
      if (!res.ok) {
        res = await fetch(`${API}/api/hero/upload-image`, {
          method: "POST",
          body: form,
        });
      }

      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { raw }; }
      if (!res.ok) throw new Error(data?.message || raw || "Upload failed");

      const newUrl = normalizeImageFromResponse(data);
      if (!newUrl) throw new Error("No image URL returned from server");

      const withBuster = newUrl + (newUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
      setHero((p) => ({ ...p, imageUrl: withBuster }));
      setSuccess("✅ Image uploaded!");
    } catch (e) {
      console.error("❌ Upload failed", e);
      setError("Image upload failed. Check Network tab for details.");
    } finally {
      setUploading(false);
    }
  };

  // Save (About-style first, fallback to legacy)
  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        content: hero.content,
        imageUrl: hero.imageUrl,
      };

      // 1) matches About
      let res = await fetch(`${API}/api/hero/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 2) fallback to your legacy route
      if (!res.ok) {
        res = await fetch(`${API}/api/hero/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = { raw }; }
      if (!res.ok) throw new Error(data?.message || raw || "Save failed");

      setSuccess("✅ Saved!");
    } catch (e) {
      console.error("❌ Save failed", e);
      setError("Save failed. Open DevTools → Network to see details.");
    } finally {
      setSaving(false);
    }
  };

  // Preview (same style as About)
  const previewUrl = hero.imageUrl
    ? (ABS(hero.imageUrl) ? hero.imageUrl : join(backendBaseUrl, hero.imageUrl))
    : join(backendBaseUrl, "/img/about.jpg"); // harmless fallback

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 shadow-sm">
        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <>
            {/* Preview */}
            <div className="row g-5 mb-4">
              <div className="col-lg-6">
                <RBImage
                  src={previewUrl}
                  alt="Hero"
                  className="img-fluid"
                  style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
                  onError={() => setError("Image failed to load (check S3 ACL/URL).")}
                />
              </div>
              <div className="col-lg-6">
                <h1 className="display-6 text-uppercase mb-4">
                  {hero.content || "Your hero headline..."}
                </h1>
              </div>
            </div>

            {/* Editor */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Hero Headline</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={hero.content || ""}
                  onChange={(e) => setHero((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write a motivational welcome message..."
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Image (upload)</Form.Label>
                <Form.Control type="file" onChange={handleUploadImage} />
                {uploading && <small className="text-muted">Uploading…</small>}
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "💾 Save"}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;
