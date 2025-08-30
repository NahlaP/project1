



// pages/editorpages/topbar.js
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import BackBar from '../components/BackBar';
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
    socialLinks: { facebook: '', twitter: '', linkedin: '' },
  });

 
  const [logoFile, setLogoFile] = useState(null);
  const [logoDraftUrl, setLogoDraftUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');


  const savedLogoSrc =
    topbar?.logoUrl
      ? (topbar.logoUrl.startsWith('http') ? topbar.logoUrl : `${backendUrl}${topbar.logoUrl}`)
      : '';
  const liveLogoSrc = logoDraftUrl || savedLogoSrc;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}`);
        const data = await res.json();
        if (data) setTopbar(prev => ({ ...prev, ...data }));
      } catch (e) {
        console.error('❌ Failed to fetch topbar:', e);
      }
    })();
  }, []);

  const flash = (msg) => setSuccess(msg);

  const handleChange = (key, value) => setTopbar(prev => ({ ...prev, [key]: value }));
  const handleSocialChange = (key, value) =>
    setTopbar(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));

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
      if (data?.message) flash('✅ Saved successfully!');
    } catch (e) {
      console.error('❌ Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handlePickLogo = (file) => {
    setLogoFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoDraftUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setLogoDraftUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return '';
      });
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    const formData = new FormData();
    formData.append('logo', logoFile); // backend expects field name 'logo'
    try {
      const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}/logo`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      // Expecting { result: { logoUrl: "/uploads/xyz.png", ... } }
      if (data?.result) {
        setTopbar(prev => ({ ...prev, ...data.result }));
        flash('✅ Logo uploaded!');
        // clear draft
        setLogoFile(null);
        setLogoDraftUrl((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return '';
        });
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  return (
    <Container fluid className="py-4 position-relative">
      {/* Floating Success Toast */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast
          bg="success"
          onClose={() => setSuccess('')}
          show={!!success}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">{success}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header with Back button */}
      <Row className="mb-3">
        <Col className="d-flex align-items-center gap-3">
          <BackBar />
          <h4 className="fw-bold mb-0">🧭 Topbar / Branding</h4>
        </Col>
      </Row>

      {/* Live Preview */}
      <Row className="mb-4">
        <Col>
          <div className="container-fluid bg-primary text-white d-none d-lg-flex">
            <div className="container py-3">
              <div className="d-flex align-items-center justify-content-between">
                {topbar.logoType === 'image' && (liveLogoSrc || savedLogoSrc) ? (
                  <img
                    src={liveLogoSrc}
                    alt="Logo"
                    style={{
                      width: topbar.logoWidth,
                      height: topbar.logoHeight,
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <h2
                    className="text-white fw-bold m-0"
                    style={{ fontSize: `${topbar.logoSize}px` }}
                  >
                    {topbar.logoText || 'Your Logo'}
                  </h2>
                )}
                <div className="d-flex align-items-center">
                  <small className="ms-4">
                    <i className="fa fa-map-marker-alt me-2" /> {topbar.address || 'Your Address'}
                  </small>
                  <small className="ms-4">
                    <i className="fa fa-envelope me-2" /> {topbar.email || 'your@email.com'}
                  </small>
                  <small className="ms-4">
                    <i className="fa fa-phone-alt me-2" /> {topbar.phone || '+000 0000 0000'}
                  </small>
                  <div className="ms-3 d-flex">
                    {topbar.socialLinks?.facebook && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-facebook-f" />
                      </a>
                    )}
                    {topbar.socialLinks?.twitter && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-twitter" />
                      </a>
                    )}
                    {topbar.socialLinks?.linkedin && (
                      <a
                        className="btn btn-sm-square btn-light text-primary ms-2"
                        href={topbar.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-linkedin-in" />
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
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Logo Type</Form.Label>
              <Form.Select
                value={topbar.logoType}
                onChange={e => handleChange('logoType', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {topbar.logoType === 'text' ? (
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Logo Text</Form.Label>
                <Form.Control
                  value={topbar.logoText || ''}
                  onChange={e => handleChange('logoText', e.target.value)}
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
                  onChange={e => handleChange('logoSize', Number(e.target.value))}
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
                    onChange={e => handlePickLogo(e.target.files?.[0] || null)}
                    accept="image/*"
                  />
                  {logoDraftUrl && (
                    <div className="mt-2">
                      <img
                        src={logoDraftUrl}
                        alt="Draft preview"
                        style={{ height: 60, objectFit: 'contain' }}
                      />
                      <div className="small text-muted">(Preview — not uploaded yet)</div>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
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
                    onChange={e => handleChange('logoWidth', Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Logo Height</Form.Label>
                  <Form.Control
                    type="number"
                    value={topbar.logoHeight || 50}
                    onChange={e => handleChange('logoHeight', Number(e.target.value))}
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
                value={topbar.address || ''}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="123 Street, New York, USA"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={topbar.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="info@example.com"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={topbar.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
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
                value={topbar.socialLinks?.facebook || ''}
                onChange={e => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Twitter</Form.Label>
              <Form.Control
                value={topbar.socialLinks?.twitter || ''}
                onChange={e => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                value={topbar.socialLinks?.linkedin || ''}
                onChange={e => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mb-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save'}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

TopbarEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default TopbarEditorPage;













// // pages/editorpages/topbarS.js
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert, Toast, ToastContainer,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";
// import BackBar from "../components/BackBar";

// const API = backendBaseUrl || "";

// // unified error reader
// const readErr = async (res) => {
//   const txt = await res.text().catch(() => "");
//   try {
//     const j = JSON.parse(txt);
//     return j?.error || j?.message || txt || `HTTP ${res.status}`;
//   } catch {
//     return txt || `HTTP ${res.status}`;
//   }
// };

// function TopbarEditorPage() {
//   // what we store on server (logoUrl + other text fields)
//   const [state, setState] = useState({
//     title: "",
//     subtitle: "",
//     phone: "",
//     email: "",
//     address: "",
//     logoUrl: "",
//   });

//   // local draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [showToast, setShowToast] = useState(false);

//   const BASE_URL = `${API}/api/topbar/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const GET_URL = BASE_URL;                   // GET current topbar
//   const PUT_URL = BASE_URL;                   // PUT updates
//   const TOKEN_URL = `${BASE_URL}/upload-token`; // POST to get cPanel token+URL
//   const CLEAR_URL = `${BASE_URL}/clear-logo`; // POST clear logo

//   // ------- load current data -------
//   const loadTopbar = async () => {
//     setError("");
//     const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const data = await res.json();
//     setState({
//       title: data?.title ?? "",
//       subtitle: data?.subtitle ?? "",
//       phone: data?.phone ?? "",
//       email: data?.email ?? "",
//       address: data?.address ?? "",
//       logoUrl: data?.logoUrl ?? data?.logo?.url ?? "",
//     });
//   };

//   useEffect(() => { loadTopbar().catch(e => setError(String(e.message || e))); }, []);
//   useEffect(() => () => { // revoke object URL on unmount
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//       lastObjUrlRef.current = null;
//     }
//   }, []);

//   // ------- local file pick (no upload yet) -------
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       setError("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }

//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//     }
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//     setError("");
//   };

//   // ------- cPanel upload flow (token → upload.php) -------
//   const uploadViaCpanel = async (file) => {
//     // 1) ask backend for short-lived token + upload URL
//     const meta = {
//       filename: file.name,
//       size: file.size,
//       type: file.type || "application/octet-stream",
//     };
//     const r1 = await fetch(TOKEN_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(meta),
//     });
//     if (!r1.ok) throw new Error(await readErr(r1));
//     const { token, uploadUrl } = await r1.json();

//     // 2) upload directly to cPanel
//     const fd = new FormData();
//     fd.append("file", file);
//     const r2 = await fetch(uploadUrl, {
//       method: "POST",
//       headers: { "X-ION7-Token": token },
//       body: fd,
//     });
//     if (!r2.ok) throw new Error(await readErr(r2));
//     const j = await r2.json();
//     const url = j?.url || "";
//     if (!/^https?:\/\//i.test(url)) throw new Error("cPanel upload did not return a public URL");
//     return url;
//   };

//   // ------- save (optionally upload first) -------
//   const onSave = async () => {
//     setSaving(true); setError("");
//     try {
//       // If a new local file is selected, upload to cPanel now
//       let logoUrlToSave = state.logoUrl || "";
//       if (draftFile) {
//         logoUrlToSave = await uploadViaCpanel(draftFile);
//       }

//       const payload = {
//         title: state.title || "",
//         subtitle: state.subtitle || "",
//         phone: state.phone || "",
//         email: state.email || "",
//         address: state.address || "",
//         ...(logoUrlToSave ? { logoUrl: logoUrlToSave } : {}),
//       };

//       const res = await fetch(PUT_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       await loadTopbar();

//       // clear local draft
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");

//       setShowToast(true);
//     } catch (err) {
//       setError(String(err.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ------- clear logo on server -------
//   const onClearLogo = async () => {
//     setError("");
//     try {
//       const res = await fetch(CLEAR_URL, { method: "POST" });
//       if (!res.ok) throw new Error(await readErr(res));
//       await loadTopbar();
//       // also clear local draft preview
//       setDraftFile(null);
//       if (lastObjUrlRef.current) {
//         try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//         lastObjUrlRef.current = null;
//       }
//       setDraftPreview("");
//       setShowToast(true);
//     } catch (e) {
//       setError(String(e.message || e));
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row className="mb-2">
//         <Col>
//           <h4 className="fw-bold">🔝 Topbar</h4>
//           <BackBar />
//         </Col>
//       </Row>

//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm mb-4">
//         <Row className="g-4">
//           <Col lg={6}>
//             {/* Logo preview */}
//             {(draftPreview || state.logoUrl) ? (
//               <RBImage
//                 src={draftPreview || state.logoUrl}
//                 alt="Logo preview"
//                 className="img-fluid bg-white p-2"
//                 style={{ maxHeight: 120, objectFit: "contain" }}
//               />
//             ) : (
//               <div className="text-muted">No logo selected</div>
//             )}

//             <div className="d-flex gap-2 mt-2">
//               <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//               <Button variant="outline-secondary" onClick={() => loadTopbar()}>
//                 Refresh server logo
//               </Button>
//               <Button variant="outline-danger" onClick={onClearLogo}>
//                 Clear logo
//               </Button>
//             </div>

//             <div className="small text-muted mt-2">
//               <div><strong>Stored URL:</strong> {state.logoUrl || "(none)"} </div>
//               <div>
//                 <strong>Draft selected:</strong>{" "}
//                 {draftFile ? `${draftFile.name} (unsaved)` : "(no draft)"}
//               </div>
//             </div>
//           </Col>

//           <Col lg={6}>
//             <Form.Group className="mb-3">
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 value={state.title}
//                 onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Subtitle</Form.Label>
//               <Form.Control
//                 value={state.subtitle}
//                 onChange={(e) => setState((p) => ({ ...p, subtitle: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 value={state.phone}
//                 onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 value={state.email}
//                 onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-4">
//               <Form.Label>Address</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={state.address}
//                 onChange={(e) => setState((p) => ({ ...p, address: e.target.value }))}
//               />
//             </Form.Group>

//             <div className="d-flex justify-content-end">
//               <Button onClick={onSave} disabled={saving}>
//                 {saving ? "Saving…" : "💾 Save"}
//               </Button>
//             </div>
//           </Col>
//         </Row>
//       </Card>

//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast
//           bg="success"
//           onClose={() => setShowToast(false)}
//           show={showToast}
//           delay={2200}
//           autohide
//         >
//           <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// TopbarEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default TopbarEditorPage;
