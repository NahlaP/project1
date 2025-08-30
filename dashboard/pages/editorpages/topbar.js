



// // pages/editorpages/topbar.js
// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Toast,
//   ToastContainer,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
// import BackBar from '../components/BackBar';
// import { backendBaseUrl as backendUrl, userId, templateId } from '../../lib/config';

// function TopbarEditorPage() {
//   const [topbar, setTopbar] = useState({
//     logoType: 'text',
//     logoText: '',
//     logoSize: 48,
//     logoUrl: '',
//     logoWidth: 150,
//     logoHeight: 50,
//     address: '',
//     email: '',
//     phone: '',
//     socialLinks: { facebook: '', twitter: '', linkedin: '' },
//   });

 
//   const [logoFile, setLogoFile] = useState(null);
//   const [logoDraftUrl, setLogoDraftUrl] = useState('');

//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState('');


//   const savedLogoSrc =
//     topbar?.logoUrl
//       ? (topbar.logoUrl.startsWith('http') ? topbar.logoUrl : `${backendUrl}${topbar.logoUrl}`)
//       : '';
//   const liveLogoSrc = logoDraftUrl || savedLogoSrc;

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}`);
//         const data = await res.json();
//         if (data) setTopbar(prev => ({ ...prev, ...data }));
//       } catch (e) {
//         console.error('❌ Failed to fetch topbar:', e);
//       }
//     })();
//   }, []);

//   const flash = (msg) => setSuccess(msg);

//   const handleChange = (key, value) => setTopbar(prev => ({ ...prev, [key]: value }));
//   const handleSocialChange = (key, value) =>
//     setTopbar(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess('');
//     try {
//       const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(topbar),
//       });
//       const data = await res.json();
//       if (data?.message) flash('✅ Saved successfully!');
//     } catch (e) {
//       console.error('❌ Save failed:', e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handlePickLogo = (file) => {
//     setLogoFile(file || null);
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setLogoDraftUrl((prev) => {
//         if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//         return url;
//       });
//     } else {
//       setLogoDraftUrl((prev) => {
//         if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//         return '';
//       });
//     }
//   };

//   const handleLogoUpload = async () => {
//     if (!logoFile) return;
//     const formData = new FormData();
//     formData.append('logo', logoFile); // backend expects field name 'logo'
//     try {
//       const res = await fetch(`${backendUrl}/api/topbar/${userId}/${templateId}/logo`, {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       // Expecting { result: { logoUrl: "/uploads/xyz.png", ... } }
//       if (data?.result) {
//         setTopbar(prev => ({ ...prev, ...data.result }));
//         flash('✅ Logo uploaded!');
//         // clear draft
//         setLogoFile(null);
//         setLogoDraftUrl((prev) => {
//           if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
//           return '';
//         });
//       }
//     } catch (err) {
//       console.error('❌ Upload failed:', err);
//     }
//   };

//   return (
//     <Container fluid className="py-4 position-relative">
//       {/* Floating Success Toast */}
//       <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
//         <Toast
//           bg="success"
//           onClose={() => setSuccess('')}
//           show={!!success}
//           delay={2200}
//           autohide
//         >
//           <Toast.Body className="text-white">{success}</Toast.Body>
//         </Toast>
//       </ToastContainer>

//       {/* Header with Back button */}
//       <Row className="mb-3">
//         <Col className="d-flex align-items-center gap-3">
//           <BackBar />
//           <h4 className="fw-bold mb-0">🧭 Topbar / Branding</h4>
//         </Col>
//       </Row>

//       {/* Live Preview */}
//       <Row className="mb-4">
//         <Col>
//           <div className="container-fluid bg-primary text-white d-none d-lg-flex">
//             <div className="container py-3">
//               <div className="d-flex align-items-center justify-content-between">
//                 {topbar.logoType === 'image' && (liveLogoSrc || savedLogoSrc) ? (
//                   <img
//                     src={liveLogoSrc}
//                     alt="Logo"
//                     style={{
//                       width: topbar.logoWidth,
//                       height: topbar.logoHeight,
//                       objectFit: 'contain'
//                     }}
//                   />
//                 ) : (
//                   <h2
//                     className="text-white fw-bold m-0"
//                     style={{ fontSize: `${topbar.logoSize}px` }}
//                   >
//                     {topbar.logoText || 'Your Logo'}
//                   </h2>
//                 )}
//                 <div className="d-flex align-items-center">
//                   <small className="ms-4">
//                     <i className="fa fa-map-marker-alt me-2" /> {topbar.address || 'Your Address'}
//                   </small>
//                   <small className="ms-4">
//                     <i className="fa fa-envelope me-2" /> {topbar.email || 'your@email.com'}
//                   </small>
//                   <small className="ms-4">
//                     <i className="fa fa-phone-alt me-2" /> {topbar.phone || '+000 0000 0000'}
//                   </small>
//                   <div className="ms-3 d-flex">
//                     {topbar.socialLinks?.facebook && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.facebook}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         <i className="fab fa-facebook-f" />
//                       </a>
//                     )}
//                     {topbar.socialLinks?.twitter && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.twitter}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         <i className="fab fa-twitter" />
//                       </a>
//                     )}
//                     {topbar.socialLinks?.linkedin && (
//                       <a
//                         className="btn btn-sm-square btn-light text-primary ms-2"
//                         href={topbar.socialLinks.linkedin}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         <i className="fab fa-linkedin-in" />
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
//         <Row className="mb-4">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Logo Type</Form.Label>
//               <Form.Select
//                 value={topbar.logoType}
//                 onChange={e => handleChange('logoType', e.target.value)}
//               >
//                 <option value="text">Text</option>
//                 <option value="image">Image</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         {topbar.logoType === 'text' ? (
//           <Row className="mb-4">
//             <Col md={6}>
//               <Form.Group>
//                 <Form.Label>Logo Text</Form.Label>
//                 <Form.Control
//                   value={topbar.logoText || ''}
//                   onChange={e => handleChange('logoText', e.target.value)}
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
//                   onChange={e => handleChange('logoSize', Number(e.target.value))}
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
//                     onChange={e => handlePickLogo(e.target.files?.[0] || null)}
//                     accept="image/*"
//                   />
//                   {logoDraftUrl && (
//                     <div className="mt-2">
//                       <img
//                         src={logoDraftUrl}
//                         alt="Draft preview"
//                         style={{ height: 60, objectFit: 'contain' }}
//                       />
//                       <div className="small text-muted">(Preview — not uploaded yet)</div>
//                     </div>
//                   )}
//                 </Form.Group>
//               </Col>
//               <Col md={6} className="d-flex align-items-end">
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
//                     onChange={e => handleChange('logoWidth', Number(e.target.value))}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Logo Height</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={topbar.logoHeight || 50}
//                     onChange={e => handleChange('logoHeight', Number(e.target.value))}
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
//                 value={topbar.address || ''}
//                 onChange={e => handleChange('address', e.target.value)}
//                 placeholder="123 Street, New York, USA"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 value={topbar.email || ''}
//                 onChange={e => handleChange('email', e.target.value)}
//                 placeholder="info@example.com"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 value={topbar.phone || ''}
//                 onChange={e => handleChange('phone', e.target.value)}
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
//                 value={topbar.socialLinks?.facebook || ''}
//                 onChange={e => handleSocialChange('facebook', e.target.value)}
//                 placeholder="https://facebook.com/yourpage"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Twitter</Form.Label>
//               <Form.Control
//                 value={topbar.socialLinks?.twitter || ''}
//                 onChange={e => handleSocialChange('twitter', e.target.value)}
//                 placeholder="https://twitter.com/yourhandle"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>LinkedIn</Form.Label>
//               <Form.Control
//                 value={topbar.socialLinks?.linkedin || ''}
//                 onChange={e => handleSocialChange('linkedin', e.target.value)}
//                 placeholder="https://linkedin.com/company/yourcompany"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <div className="d-flex justify-content-end mb-4">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? 'Saving...' : '💾 Save'}
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// TopbarEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default TopbarEditorPage;













// pages/editorpages/topbar.js
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Form, Toast, ToastContainer,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import BackBar from '../components/BackBar';
import { backendBaseUrl as API, userId, templateId } from '../../lib/config';

const GET_URL   = `${API}/api/topbar/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
const PUT_URL   = GET_URL;
const CLEAR_URL = `${GET_URL}/clear-logo`;
const TOKEN_URL = `${GET_URL}/upload-token`;

const readErr = async (res) => {
  const txt = await res.text().catch(() => '');
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
};

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
      ? (topbar.logoUrl.startsWith('http') ? topbar.logoUrl : `${API}${topbar.logoUrl}`)
      : '';
  const liveLogoSrc = logoDraftUrl || savedLogoSrc;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(GET_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (!res.ok) throw new Error(await readErr(res));
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
      const res = await fetch(PUT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topbar),
      });
      if (!res.ok) throw new Error(await readErr(res));
      flash('✅ Saved successfully!');
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

  // Upload via cPanel (token -> POST file to cPanel -> returns public URL)
  const uploadViaCpanel = async (file) => {
    const meta = { filename: file.name, size: file.size, type: file.type || 'application/octet-stream' };
    const step1 = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
    if (!step1.ok) throw new Error(await readErr(step1));
    const { token, uploadUrl } = await step1.json();

    const fd = new FormData();
    fd.append('file', file);
    const step2 = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'X-ION7-Token': token },
      body: fd,
    });
    if (!step2.ok) throw new Error(await readErr(step2));
    const j = await step2.json();
    const url = j?.url || '';
    if (!/^https?:\/\//i.test(url)) throw new Error('Upload did not return a public URL');
    return url;
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    try {
      const publicUrl = await uploadViaCpanel(logoFile);

      const payload = {
        ...topbar,
        logoType: 'image',
        logoUrl: publicUrl,
      };
      const res = await fetch(PUT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readErr(res));

      // refresh saved state
      const r2 = await fetch(GET_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const fresh = await r2.json();
      setTopbar(prev => ({ ...prev, ...fresh }));

      // clear draft preview
      setLogoFile(null);
      setLogoDraftUrl((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return '';
      });

      flash('✅ Logo uploaded!');
    } catch (e) {
      console.error('❌ Upload failed:', e);
      flash('❌ Upload failed');
    }
  };

  const handleClearLogo = async () => {
    try {
      const res = await fetch(CLEAR_URL, { method: 'POST' });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();
      setTopbar(prev => ({ ...prev, ...(data?.result || {}), logoUrl: '', logoType: 'text' }));
      flash('✅ Logo cleared');
    } catch (e) {
      console.error('❌ Clear logo failed:', e);
    }
  };

  return (
    <Container fluid className="py-4 position-relative">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
        <Toast bg="success" onClose={() => setSuccess('')} show={!!success} delay={2200} autohide>
          <Toast.Body className="text-white">{success}</Toast.Body>
        </Toast>
      </ToastContainer>

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
                    style={{ width: topbar.logoWidth, height: topbar.logoHeight, objectFit: 'contain' }}
                  />
                ) : (
                  <h2 className="text-white fw-bold m-0" style={{ fontSize: `${topbar.logoSize}px` }}>
                    {topbar.logoText || 'Your Logo'}
                  </h2>
                )}

                <div className="d-flex align-items-center">
                  <small className="ms-4"><i className="fa fa-map-marker-alt me-2" /> {topbar.address || 'Your Address'}</small>
                  <small className="ms-4"><i className="fa fa-envelope me-2" /> {topbar.email || 'your@email.com'}</small>
                  <small className="ms-4"><i className="fa fa-phone-alt me-2" /> {topbar.phone || '+000 0000 0000'}</small>
                  <div className="ms-3 d-flex">
                    {topbar.socialLinks?.facebook && (
                      <a className="btn btn-sm-square btn-light text-primary ms-2" href={topbar.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook-f" />
                      </a>
                    )}
                    {topbar.socialLinks?.twitter && (
                      <a className="btn btn-sm-square btn-light text-primary ms-2" href={topbar.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter" />
                      </a>
                    )}
                    {topbar.socialLinks?.linkedin && (
                      <a className="btn btn-sm-square btn-light text-primary ms-2" href={topbar.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
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
              <Form.Select value={topbar.logoType} onChange={e => handleChange('logoType', e.target.value)}>
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
                <Form.Label>Logo Size <small className="text-muted">({topbar.logoSize}px)</small></Form.Label>
                <Form.Range min={10} max={200} value={topbar.logoSize || 48} onChange={e => handleChange('logoSize', Number(e.target.value))} />
              </Form.Group>
            </Col>
          </Row>
        ) : (
          <>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Pick Logo (preview only)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={e => handlePickLogo(e.target.files?.[0] || null)} />
                  {logoDraftUrl && (
                    <div className="mt-2">
                      <img src={logoDraftUrl} alt="Draft preview" style={{ height: 60, objectFit: 'contain' }} />
                      <div className="small text-muted">(Preview — not uploaded yet)</div>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end gap-2">
                <Button className="mt-4" onClick={handleLogoUpload} disabled={!logoFile}>Upload Logo</Button>
                <Button className="mt-4" variant="outline-danger" onClick={handleClearLogo}>Clear Logo</Button>
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
