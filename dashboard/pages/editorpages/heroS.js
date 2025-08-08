

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





import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Alert,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function HeroEditorPage() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content || "");
        setImageUrl(data.imageUrl || "");
      })
      .catch((err) => console.error("❌ Failed to fetch hero section", err));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${backendBaseUrl}/api/hero/upload-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setSuccess("✅ Image uploaded successfully!");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
    }
  };

  // const handleSave = async () => {
  //   try {
  //     const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ content, imageUrl }),
  //     });

  //     const data = await res.json();
  //     if (data.content) setSuccess("✅ Hero section saved successfully!");
  //   } catch (err) {
  //     console.error("❌ Save error:", err);
  //   }
  // };

  const handleSave = async () => {
  try {
    const payload = { content };
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }

    const res = await fetch(`${backendBaseUrl}/api/hero/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.content) setSuccess("✅ Hero section saved successfully!");
  } catch (err) {
    console.error("❌ Save error:", err);
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
                <Image
                  src={
                    imageUrl.startsWith("http")
                      ? imageUrl
                      : `${backendBaseUrl}${imageUrl}`
                  }
                  alt="Hero"
                  style={{
                    width: "300px",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <p className="text-muted">No image uploaded yet</p>
              )}
            </div>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Form.Text className="text-muted">
              Upload JPG/PNG. Recommended: 1920x1080px
            </Form.Text>
          </Form.Group>

          <Button variant="success" onClick={handleSave}>
            💾 Save Changes
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default HeroEditorPage;
