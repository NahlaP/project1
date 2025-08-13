


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
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

// Use same pattern as About: keep '' so '/api/...' hits Next.js rewrite
const API = backendBaseUrl || "";

// -------- helpers --------
const ABS = (u = "") => /^https?:\/\//i.test(u);
const join = (base, p = "") => (ABS(p) ? p : `${base}${p.startsWith("/") ? p : `/${p}`}`);

function HeroEditorPage() {
  // Keep BOTH: imageKey (persistent S3 key) + displayUrl (short-lived presigned URL for preview)
  const [hero, setHero] = useState({
    content: "",
    imageKey: "",
    displayUrl: "", // presigned URL from backend for preview only
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch from backend (uses presigned URL for display)
  const refreshHero = async () => {
    try {
      const res = await fetch(`${API}/api/hero/${userId}/${templateId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `GET failed: ${res.status}`);

      setHero({
        content: data?.content || "",
        imageKey: data?.imageKey || "",
        displayUrl: data?.imageUrl || "", // presigned (expires ~60s)
      });
    } catch (e) {
      console.error("❌ Get Hero error:", e);
      setError("Could not load current hero data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    refreshHero();
  }, []);

  // Upload image -> returns { key, bucket }, then refetch to get presigned URL
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const form = new FormData();
      form.append("image", file); // field name must be 'image' (multer-s3)

      const res = await fetch(`${API}/api/hero/upload-image`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");

      // Persist the S3 key in state; preview via a fresh presigned URL by refetching
      setHero((p) => ({ ...p, imageKey: data.key }));
      await refreshHero();

      setSuccess("✅ Image uploaded!");
    } catch (e2) {
      console.error("❌ Upload Hero Image error:", e2);
      setError("Image upload failed. Check Network tab for details.");
    } finally {
      setUploading(false);
    }
  };

  // Save content + imageKey (backend stores the S3 key, NOT a URL)
  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        content: hero.content,
        imageKey: hero.imageKey || undefined, // backend also accepts imageUrl but prefers key
      };

      const res = await fetch(`${API}/api/hero/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      // data: { content, imageKey }
      setHero((p) => ({ ...p, imageKey: data.imageKey || p.imageKey }));
      setSuccess("✅ Saved!");
    } catch (e2) {
      console.error("❌ Save Hero error:", e2);
      setError("Save failed. Open DevTools → Network to see details.");
    } finally {
      setSaving(false);
    }
  };

  // Manually refresh the presigned URL if it expires (after ~60s)
  const handleRefreshPreview = async () => {
    setError("");
    await refreshHero();
  };

  // Preview URL (if you ever return relative paths, join with backendBaseUrl)
  const previewUrl = hero.displayUrl
    ? (ABS(hero.displayUrl) ? hero.displayUrl : join(backendBaseUrl, hero.displayUrl))
    : ""; // show placeholder when empty

  return (
    <Container fluid className="py-4">
      <Row>
        <Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col>
      </Row>

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
                {previewUrl ? (
                  <RBImage
                    src={previewUrl}
                    alt="Hero"
                    className="img-fluid"
                    style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
                    onError={() => setError("Image failed to load (presigned URL may have expired).")}
                  />
                ) : (
                  <div className="text-muted">No image uploaded yet</div>
                )}
                <div className="d-flex gap-2 mt-2">
                  <Form.Control type="file" onChange={handleUploadImage} disabled={uploading} />
                  <Button variant="outline-secondary" onClick={handleRefreshPreview}>
                    Refresh preview
                  </Button>
                </div>
                {uploading && <small className="text-muted">Uploading…</small>}
              </div>

              <div className="col-lg-6">
                <Form.Group className="mb-3">
                  <Form.Label>Hero Headline</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={hero.content || ""}
                    onChange={(e) => setHero((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write a motivational welcome message..."
                  />
                </Form.Group>

                <div className="small text-muted">
                  <div><strong>Stored key:</strong> {hero.imageKey || "(none)"} </div>
                  <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (expires ~60s)" : "(none)"} </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="d-flex justify-content-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "💾 Save"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;
