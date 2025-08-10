

// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Image,
//   Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function HeroEditorPage() {
//   const [content, setContent] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setContent(data.content || "");
//         setImageUrl(data.imageUrl || "");
//       })
//       .catch((err) => console.error("❌ Failed to fetch hero section", err));
//   }, []);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.imageUrl) {
//         setImageUrl(data.imageUrl);
//         setSuccess("✅ Image uploaded successfully!");
//       }
//     } catch (err) {
//       console.error("❌ Upload error:", err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content, imageUrl }),
//       });

//       const data = await res.json();
//       if (data.content) setSuccess("✅ Hero section saved successfully!");
//     } catch (err) {
//       console.error("❌ Save error:", err);
//     }
//   };

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
//               {imageUrl ? (
//                 <Image
//                   src={
//                     imageUrl.startsWith("http")
//                       ? imageUrl
//                       : `${backendBaseUrl}${imageUrl}`
//                   }
//                   alt="Hero"
//                   style={{
//                     width: "300px",
//                     height: "auto",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                     border: "1px solid #ddd",
//                   }}
//                 />
//               ) : (
//                 <p className="text-muted">No image uploaded yet</p>
//               )}
//             </div>
//             <Form.Control
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//             />
//             <Form.Text className="text-muted">
//               Upload JPG/PNG. Recommended: 1920x1080px
//             </Form.Text>
//           </Form.Group>

//           <Button variant="success" onClick={handleSave}>
//             💾 Save Changes
//           </Button>
//         </Form>
//       </Card>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default HeroEditorPage;





// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Image,
//   Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// function HeroEditorPage() {
//   const [content, setContent] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setContent(data.content || "");
//         setImageUrl(data.imageUrl || "");
//       })
//       .catch((err) => console.error("❌ Failed to fetch hero section", err));
//   }, []);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.imageUrl) {
//         setImageUrl(data.imageUrl);
//         setSuccess("✅ Image uploaded successfully!");
//       }
//     } catch (err) {
//       console.error("❌ Upload error:", err);
//     }
//   };

//   // const handleSave = async () => {
//   //   try {
//   //     const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ content, imageUrl }),
//   //     });

//   //     const data = await res.json();
//   //     if (data.content) setSuccess("✅ Hero section saved successfully!");
//   //   } catch (err) {
//   //     console.error("❌ Save error:", err);
//   //   }
//   // };

//   const handleSave = async () => {
//   try {
//     const payload = { content };
//     if (imageUrl) {
//       payload.imageUrl = imageUrl;
//     }

//     const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     if (data.content) setSuccess("✅ Hero section saved successfully!");
//   } catch (err) {
//     console.error("❌ Save error:", err);
//   }
// };


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
//               {imageUrl ? (
//                 <Image
//                   src={
//                     imageUrl.startsWith("http")
//                       ? imageUrl
//                       : `${backendBaseUrl}${imageUrl}`
//                   }
//                   alt="Hero"
//                   style={{
//                     width: "300px",
//                     height: "auto",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                     border: "1px solid #ddd",
//                   }}
//                 />
//               ) : (
//                 <p className="text-muted">No image uploaded yet</p>
//               )}
//             </div>
//             <Form.Control
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//             />
//             <Form.Text className="text-muted">
//               Upload JPG/PNG. Recommended: 1920x1080px
//             </Form.Text>
//           </Form.Group>

//           <Button variant="success" onClick={handleSave}>
//             💾 Save Changes
//           </Button>
//         </Form>
//       </Card>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default HeroEditorPage;



import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Image as RBImage, Alert,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl as CONFIG_BASE, userId, templateId } from "../../lib/config";

// --- Resolve backend base safely for dev/prod ---
const resolveBackendBase = () => {
  if (typeof window !== "undefined") {
    const isProd =
      window.location.hostname.endsWith(".vercel.app") ||
      window.location.hostname.includes("project1-dash");
    return (
      CONFIG_BASE ||
      (isProd ? "https://project1backend-2xvq.onrender.com" : "http://localhost:5000")
    );
  }
  return CONFIG_BASE || "http://localhost:5000";
};
const backendBaseUrl = resolveBackendBase();

// --- Turn relative ('/uploads/..' or 'uploads/..') into absolute URL ---
const toPublicUrl = (maybePath) => {
  if (!maybePath) return "";
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const path = maybePath.startsWith("/") ? maybePath : `/${maybePath}`;
  return `${backendBaseUrl}${path}`;
};

function HeroEditorPage() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // may be absolute or relative
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setError("");
      try {
        const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setContent(data?.content || "");
        setImageUrl(data?.imageUrl || "");
      } catch (err) {
        console.error("❌ Failed to fetch hero section", err);
        setError("Could not load current hero data.");
      }
    };
    run();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl); // keep raw value; we resolve at render-time
        setSuccess("✅ Image uploaded successfully!");
      } else {
        throw new Error("Server did not return imageUrl");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSuccess("");
    setError("");
    try {
      const payload = { content };
      if (imageUrl) payload.imageUrl = imageUrl; // send raw value (server expects same as fetch)
      const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
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

  // Final absolute URL for display
  const displayUrl = toPublicUrl(imageUrl);

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
              {displayUrl ? (
                <RBImage
                  src={displayUrl}
                  alt="Hero"
                  style={{
                    width: "300px",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                  onError={() => setError("Image failed to load (check path/host).")}
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
