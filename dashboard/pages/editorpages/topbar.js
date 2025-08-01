

// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function TopbarEditorPage() {
//   const [topbar, setTopbar] = useState({
//     logoType: "text",
//     logoText: "",
//     logoSize: 48,
//     logoUrl: "",
//     logoWidth: 150,
//     logoHeight: 50,
//     address: "",
//     email: "",
//     phone: "",
//     socialLinks: {
//       facebook: "",
//       twitter: "",
//       linkedin: "",
//     },
//   });
//   const [logoFile, setLogoFile] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/topbar/${userId}/${templateId}`
//         );
//         const data = await res.json();
//         if (data) {
//           setTopbar((prev) => ({ ...prev, ...data }));
//         }
//       } catch (e) {
//         console.error("❌ Failed to fetch topbar:", e);
//       }
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setTopbar((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSocialChange = (key, value) => {
//     setTopbar((prev) => ({
//       ...prev,
//       socialLinks: { ...prev.socialLinks, [key]: value },
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/topbar/${userId}/${templateId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(topbar),
//         }
//       );
//       const data = await res.json();
//       if (data?.message) setSuccess("✅ Saved successfully!");
//     } catch (e) {
//       console.error("❌ Save failed:", e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleLogoUpload = async () => {
//     if (!logoFile) return;
//     const formData = new FormData();
//     formData.append("logo", logoFile);
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/topbar/${userId}/${templateId}/logo`,
//         { method: "POST", body: formData }
//       );
//       const data = await res.json();
//       if (data?.result) {
//         setTopbar((prev) => ({ ...prev, ...data.result }));
//         setSuccess("✅ Logo uploaded!");
//       }
//     } catch (err) {
//       console.error("❌ Upload failed:", err);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🧭 Topbar / Branding</h4>
//         </Col>
//       </Row>

//       {/* 🔍 Live Preview */}
//       <Row className="mb-4">
//         <Col>
//           <div className="container-fluid bg-primary text-white d-none d-lg-flex">
//             <div className="container py-3">
//               <div className="d-flex align-items-center justify-content-between">
//                 {topbar.logoType === "image" && topbar.logoUrl ? (
//                   <img
//                     src={`${backendBaseUrl}${topbar.logoUrl}`}
//                     alt="Logo"
//                     style={{ width: topbar.logoWidth, height: topbar.logoHeight }}
//                   />
//                 ) : (
//                   <h2
//                     className="text-white fw-bold m-0"
//                     style={{ fontSize: `${topbar.logoSize}px` }}
//                   >
//                     {topbar.logoText || "Your Logo"}
//                   </h2>
//                 )}
//                 <div className="d-flex align-items-center">
//                   <small className="ms-4">
//                     <i className="fa fa-map-marker-alt me-2"></i> {topbar.address || "Your Address"}
//                   </small>
//                   <small className="ms-4">
//                     <i className="fa fa-envelope me-2"></i> {topbar.email || "your@email.com"}
//                   </small>
//                   <small className="ms-4">
//                     <i className="fa fa-phone-alt me-2"></i> {topbar.phone || "+000 0000 0000"}
//                   </small>
//                   <div className="ms-3 d-flex">
//                     {topbar.socialLinks?.facebook && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.facebook}
//                         target="_blank"
//                       >
//                         <i className="fab fa-facebook-f"></i>
//                       </a>
//                     )}
//                     {topbar.socialLinks?.twitter && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.twitter}
//                         target="_blank"
//                       >
//                         <i className="fab fa-twitter"></i>
//                       </a>
//                     )}
//                     {topbar.socialLinks?.linkedin && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.linkedin}
//                         target="_blank"
//                       >
//                         <i className="fab fa-linkedin-in"></i>
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       <Card className="p-4 shadow-sm">
//         {success && <Alert variant="success">{success}</Alert>}

//         <Row className="mb-4">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Logo Type</Form.Label>
//               <Form.Select
//                 value={topbar.logoType}
//                 onChange={(e) => handleChange("logoType", e.target.value)}
//               >
//                 <option value="text">Text</option>
//                 <option value="image">Image</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {topbar.logoType === "text" ? (
//           <Row className="mb-4">
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Logo Text</Form.Label>
//                 <Form.Control
//                   value={topbar.logoText || ""}
//                   onChange={(e) => handleChange("logoText", e.target.value)}
//                   placeholder="Your brand / company name"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>
//                   Logo Size <small className="text-muted">({topbar.logoSize}px)</small>
//                 </Form.Label>
//                 <Form.Range
//                   min={10}
//                   max={200}
//                   value={topbar.logoSize || 48}
//                   onChange={(e) => handleChange("logoSize", Number(e.target.value))}
//                 />
//               </Form.Group>
//             </Col>
//           </Row>
//         ) : (
//           <>
//             <Row className="mb-4">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Upload Logo</Form.Label>
//                   <Form.Control
//                     type="file"
//                     onChange={(e) => setLogoFile(e.target.files[0])}
//                     accept="image/*"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Button className="mt-4" onClick={handleLogoUpload} disabled={!logoFile}>
//                   Upload Logo
//                 </Button>
//               </Col>
//             </Row>
//             <Row className="mb-4">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Logo Width</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={topbar.logoWidth || 150}
//                     onChange={(e) => handleChange("logoWidth", Number(e.target.value))}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Logo Height</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={topbar.logoHeight || 50}
//                     onChange={(e) => handleChange("logoHeight", Number(e.target.value))}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </>
//         )}

//         {/* Contact Info */}
//         <Row className="mb-4">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Address</Form.Label>
//               <Form.Control
//                 value={topbar.address || ""}
//                 onChange={(e) => handleChange("address", e.target.value)}
//                 placeholder="123 Street, New York, USA"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 value={topbar.email || ""}
//                 onChange={(e) => handleChange("email", e.target.value)}
//                 placeholder="info@example.com"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 value={topbar.phone || ""}
//                 onChange={(e) => handleChange("phone", e.target.value)}
//                 placeholder="+012 345 67890"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         {/* Social Links */}
//         <Row className="mb-4">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Facebook</Form.Label>
//               <Form.Control
//                 value={topbar.socialLinks?.facebook || ""}
//                 onChange={(e) => handleSocialChange("facebook", e.target.value)}
//                 placeholder="https://facebook.com/yourpage"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Twitter</Form.Label>
//               <Form.Control
//                 value={topbar.socialLinks?.twitter || ""}
//                 onChange={(e) => handleSocialChange("twitter", e.target.value)}
//                 placeholder="https://twitter.com/yourhandle"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>LinkedIn</Form.Label>
//               <Form.Control
//                 value={topbar.socialLinks?.linkedin || ""}
//                 onChange={(e) => handleSocialChange("linkedin", e.target.value)}
//                 placeholder="https://linkedin.com/company/yourcompany"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <div className="d-flex justify-content-end mb-4">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : "💾 Save"}
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// TopbarEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TopbarEditorPage;







'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl as backendUrl, userId, templateId } from '../../lib/config';

function TopbarEditorPage() {
  const [topbar, setTopbar] = useState({
    logoType: 'text',
    logoText: '',
    logoSize: 48,
    logoUrl: '',
    logoWidth: 150,
    logoHeight: 50,
    address: '',
    email: '',
    phone: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}`);
        const data = await res.json();
        if (data) {
          setTopbar((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error('❌ Failed to fetch topbar:', e);
      }
    })();
  }, []);

  const handleChange = (key, value) => {
    setTopbar((prev) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (key, value) => {
    setTopbar((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topbar),
      });
      const data = await res.json();
      if (data?.message) setSuccess('✅ Saved successfully!');
    } catch (e) {
      console.error('❌ Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    const formData = new FormData();
    formData.append('logo', logoFile);
    try {
      const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}/logo`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.result) {
        setTopbar((prev) => ({ ...prev, ...data.result }));
        setSuccess('✅ Logo uploaded!');
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🧭 Topbar / Branding</h4>
        </Col>
      </Row>

      {/* 🔍 Live Preview */}
      <Row className="mb-4">
        <Col>
          <div className="container-fluid bg-primary text-white d-none d-lg-flex">
            <div className="container py-3">
              <div className="d-flex align-items-center justify-content-between">
                {topbar.logoType === "image" && topbar.logoUrl ? (
                  <img
                    src={`${backendBaseUrl}${topbar.logoUrl}`}
                    alt="Logo"
                    style={{ width: topbar.logoWidth, height: topbar.logoHeight }}
                  />
                ) : (
                  <h2
                    className="text-white fw-bold m-0"
                    style={{ fontSize: `${topbar.logoSize}px` }}
                  >
                    {topbar.logoText || "Your Logo"}
                  </h2>
                )}
                <div className="d-flex align-items-center">
                  <small className="ms-4">
                    <i className="fa fa-map-marker-alt me-2"></i> {topbar.address || "Your Address"}
                  </small>
                  <small className="ms-4">
                    <i className="fa fa-envelope me-2"></i> {topbar.email || "your@email.com"}
                  </small>
                  <small className="ms-4">
                    <i className="fa fa-phone-alt me-2"></i> {topbar.phone || "+000 0000 0000"}
                  </small>
                  <div className="ms-3 d-flex">
                    {topbar.socialLinks?.facebook && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.facebook}
                        target="_blank"
                      >
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    )}
                    {topbar.socialLinks?.twitter && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.twitter}
                        target="_blank"
                      >
                        <i className="fab fa-twitter"></i>
                      </a>
                    )}
                    {topbar.socialLinks?.linkedin && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.linkedin}
                        target="_blank"
                      >
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Card className="p-4 shadow-sm">
        {success && <Alert variant="success">{success}</Alert>}

        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Logo Type</Form.Label>
              <Form.Select
                value={topbar.logoType}
                onChange={(e) => handleChange("logoType", e.target.value)}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {topbar.logoType === "text" ? (
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Logo Text</Form.Label>
                <Form.Control
                  value={topbar.logoText || ""}
                  onChange={(e) => handleChange("logoText", e.target.value)}
                  placeholder="Your brand / company name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Logo Size <small className="text-muted">({topbar.logoSize}px)</small>
                </Form.Label>
                <Form.Range
                  min={10}
                  max={200}
                  value={topbar.logoSize || 48}
                  onChange={(e) => handleChange("logoSize", Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
        ) : (
          <>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Upload Logo</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    accept="image/*"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Button className="mt-4" onClick={handleLogoUpload} disabled={!logoFile}>
                  Upload Logo
                </Button>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Logo Width</Form.Label>
                  <Form.Control
                    type="number"
                    value={topbar.logoWidth || 150}
                    onChange={(e) => handleChange("logoWidth", Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Logo Height</Form.Label>
                  <Form.Control
                    type="number"
                    value={topbar.logoHeight || 50}
                    onChange={(e) => handleChange("logoHeight", Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Contact Info */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={topbar.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Street, New York, USA"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={topbar.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@example.com"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={topbar.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+012 345 67890"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Social Links */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Facebook</Form.Label>
              <Form.Control
                value={topbar.socialLinks?.facebook || ""}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Twitter</Form.Label>
              <Form.Control
                value={topbar.socialLinks?.twitter || ""}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                value={topbar.socialLinks?.linkedin || ""}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mb-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "💾 Save"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

TopbarEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default TopbarEditorPage;
