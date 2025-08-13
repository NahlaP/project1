


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
import { userId, templateId } from "../../lib/config";

// Always go through Next.js rewrites → browser calls /api/... (same-origin),
// Next proxies to BACKEND_ORIGIN from next.config.js
const API = "/api";

// Build a public URL for display if server gave us bucket/key (no imageUrl)
function s3PublicUrlFrom({ bucket, key, region }) {
  if (!bucket || !key) return "";
  const r = region || process.env.NEXT_PUBLIC_AWS_REGION || ""; // optional
  return r
    ? `https://${bucket}.s3.${r}.amazonaws.com/${key}`
    : `https://${bucket}.s3.amazonaws.com/${key}`;
}

// If server returns a relative path (e.g. "/uploads/foo.jpg"), make it go via proxy
function toDisplayUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  // Ensure it hits the rewrite by prefixing /api
  return `/api${path}`;
}

function HeroEditorPage() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");       // final public URL we’ll render & save
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Load current hero data
  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await fetch(`${API}/hero/${userId}/${templateId}`, { method: "GET" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setContent(data?.content || "");

        // Accept absolute URL, backend-relative, or S3 fields
        if (data?.imageUrl) {
          setImageUrl(/^https?:\/\//i.test(data.imageUrl) ? data.imageUrl : toDisplayUrl(data.imageUrl));
        } else if (data?.bucket && data?.key) {
          setImageUrl(s3PublicUrlFrom({ bucket: data.bucket, key: data.key, region: data.region }));
        } else {
          setImageUrl("");
        }
      } catch (err) {
        console.error("❌ Failed to fetch hero section", err);
        setError("Could not load current hero data.");
      }
    })();
  }, []);

  // Upload image (accepts imageUrl OR bucket/key from server)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // match backend field name

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${API}/hero/upload-image`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      let publicUrl = "";
      if (data?.imageUrl) {
        publicUrl = /^https?:\/\//i.test(data.imageUrl) ? data.imageUrl : toDisplayUrl(data.imageUrl);
      } else if (data?.bucket && data?.key) {
        publicUrl = s3PublicUrlFrom({ bucket: data.bucket, key: data.key, region: data.region });
      } else {
        throw new Error("Server did not return imageUrl or {bucket,key}");
      }

      setImageUrl(publicUrl);
      setSuccess("✅ Image uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Save content + image
  const handleSave = async () => {
    setSuccess("");
    setError("");
    try {
      const payload = { content };
      if (imageUrl) payload.imageUrl = imageUrl; // backend should persist this as-is

      const res = await fetch(`${API}/hero/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Save failed");
      setSuccess("✅ Hero section saved successfully!");
    } catch (err) {
      console.error("❌ Save error:", err);
      setError("Could not save hero section.");
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">📝 Hero Section Editor</h4>
          <p className="text-muted">Update the main banner of your homepage</p>
        </Col>
      </Row>

      <Card className="p-4 shadow-sm">
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Hero Headline</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a motivational welcome message..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Current Image</Form.Label>
            <div className="text-center mb-3">
              {imageUrl ? (
                <RBImage
                  src={imageUrl}
                  alt="Hero"
                  style={{
                    width: "300px",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                  onError={() => setError("Image failed to load (check S3 ACL/URL).")}
                />
              ) : (
                <p className="text-muted">No image uploaded yet</p>
              )}
            </div>

            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            <Form.Text className="text-muted">Upload JPG/PNG. Recommended: 1920x1080px</Form.Text>
          </Form.Group>

          <Button variant="success" onClick={handleSave} disabled={uploading}>
            {uploading ? "Uploading…" : "💾 Save Changes"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;
