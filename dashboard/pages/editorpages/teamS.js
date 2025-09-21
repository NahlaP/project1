




// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamS.js
// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Container, Row, Col, Card, Form, Button, Table, Alert, Image,
//   Toast, ToastContainer,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
// import { backendBaseUrl, userId, templateId } from '../../lib/config';
// import BackBar from "../components/BackBar";

// // ---------- helpers ----------
// const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// const readErr = async (res) => {
//   const t = await res.text().catch(() => '');
//   try { const j = JSON.parse(t); return j?.error || j?.message || t || `HTTP ${res.status}`; }
//   catch { return t || `HTTP ${res.status}`; }
// };

// function TeamEditor() {
//   const [members, setMembers] = useState([]);
//   const [form, setForm] = useState({ name: '', role: '', socialLinks: {} });

//   // local draft image (preview-only until Add/Update)
//   const [imageFile, setImageFile] = useState(null);
//   const [draftPreviewUrl, setDraftPreviewUrl] = useState('');
//   const lastObjUrlRef = useRef('');

//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // floater toast
//   const [showToast, setShowToast] = useState(false);

//   const clearAlertsSoon = () =>
//     setTimeout(() => { setSuccess(''); setError(''); }, 2500);

//   const normalizeMembers = (payload) =>
//     Array.isArray(payload) ? payload : payload?.members || [];

//   // Prefer URL from API; fallback to legacy /uploads path if present
//   const imgSrc = (m) => {
//     if (m?.imageUrl) return m.imageUrl;
//     if (m?.imageKey?.startsWith('/uploads/')) return `${backendBaseUrl}${m.imageKey}`;
//     return '';
//   };

//   const reloadTeam = async () => {
//     const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`, {
//       headers: { Accept: 'application/json' },
//       cache: 'no-store',
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const json = await res.json();
//     setMembers(normalizeMembers(json));
//   };

//   useEffect(() => {
//     (async () => {
//       try { await reloadTeam(); }
//       catch { setError('Failed to load team'); clearAlertsSoon(); }
//     })();

//     return () => {
//       if (lastObjUrlRef.current) {
//         try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const resetForm = () => {
//     setForm({ name: '', role: '', socialLinks: {} });
//     setImageFile(null);
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//       lastObjUrlRef.current = '';
//     }
//     setDraftPreviewUrl('');
//     setEditingId(null);
//   };

//   // Choose file -> local preview only
//   const onPickLocal = (file) => {
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       setError('Image must be ≤ 10 MB');
//       clearAlertsSoon();
//       return;
//     }
//     const url = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//     }
//     lastObjUrlRef.current = url;
//     setImageFile(file);
//     setDraftPreviewUrl(url);
//     setSuccess('');
//     setError('');
//   };

//   /** Get upload token+URL from backend */
//   const getUploadToken = async (filename, type, size) => {
//     const res = await fetch(
//       `${backendBaseUrl}/api/team/${userId}/${templateId}/upload-token`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//         body: JSON.stringify({ filename, type, size }),
//       }
//     );
//     const j = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(j?.error || 'Failed to get upload token');
//     // expected: { token, uploadUrl, expiresIn }
//     return j;
//   };

//   /** Upload file to cPanel using token + uploadUrl (robust across hosts) */
//   const uploadToCpanel = async (file, token, uploadUrl) => {
//     const fd = new FormData();
//     fd.append('file', file);
//     fd.append('token', token); // body fallback

//     // also include token as query (another fallback)
//     const urlWithToken =
//       uploadUrl + (uploadUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);

//     const res = await fetch(urlWithToken, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`, // primary
//         'X-ION7-Token': token,            // alt header (shared hosts may drop Authorization)
//       },
//       body: fd,
//     });
//     const j = await res.json().catch(() => ({}));
//     if (!res.ok || !j?.url) throw new Error(j?.error || 'cPanel upload failed');
//     return j.url; // e.g. https://ion7.mavsketch.com/uploads/YYYY/MM/xxxx.jpg
//   };

//   /** Create or update a member on backend using JSON (imageUrl when present) */
//   const saveMemberJson = async (payload, id = null) => {
//     const url = id
//       ? `${backendBaseUrl}/api/team/${id}`
//       : `${backendBaseUrl}/api/team/${userId}/${templateId}`;
//     const method = id ? 'PATCH' : 'POST';
//     const res = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//       body: JSON.stringify(payload),
//     });
//     const j = await res.json().catch(() => ({}));
//     if (!res.ok) throw new Error(j?.message || 'Save failed');
//     return j?.data || j;
//   };

//   // ADD
//   const handleAdd = async () => {
//     setLoading(true); setSuccess(''); setError('');
//     try {
//       let imageUrl = '';

//       if (imageFile) {
//         const { token, uploadUrl } =
//           await getUploadToken(imageFile.name, imageFile.type, imageFile.size);
//         imageUrl = await uploadToCpanel(imageFile, token, uploadUrl);
//       }

//       const saved = await saveMemberJson({
//         name: form.name,
//         role: form.role,
//         socialLinks: form.socialLinks || {},
//         imageUrl, // may be empty if no image chosen
//       });

//       setMembers((prev) => [...prev, saved]);
//       await reloadTeam();
//       setSuccess('✅ Team member added');
//       setShowToast(true);
//       resetForm();
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || 'Failed to add member');
//     } finally {
//       setLoading(false);
//       clearAlertsSoon();
//     }
//   };

//   const handleEditStart = (member) => {
//     setForm({
//       name: member.name || '',
//       role: member.role || '',
//       socialLinks: member.socialLinks || member.socials || {},
//     });
//     setEditingId(member._id);
//     if (lastObjUrlRef.current) {
//       try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
//       lastObjUrlRef.current = '';
//     }
//     setDraftPreviewUrl('');
//     setImageFile(null);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // UPDATE
//   const handleUpdate = async () => {
//     if (!editingId) return;
//     setLoading(true); setSuccess(''); setError('');
//     try {
//       let imageUrl;

//       if (imageFile) {
//         const { token, uploadUrl } =
//           await getUploadToken(imageFile.name, imageFile.type, imageFile.size);
//         imageUrl = await uploadToCpanel(imageFile, token, uploadUrl);
//       }

//       const payload = {
//         name: form.name,
//         role: form.role,
//         socialLinks: form.socialLinks || {},
//       };
//       if (imageUrl) payload.imageUrl = imageUrl;

//       const updated = await saveMemberJson(payload, editingId);

//       setMembers((prev) => prev.map((m) => (m._id === editingId ? updated : m)));
//       await reloadTeam();

//       setSuccess('✅ Member updated');
//       setShowToast(true);
//       resetForm();
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || 'Failed to update member');
//     } finally {
//       setLoading(false);
//       clearAlertsSoon();
//     }
//   };

//   const handleDelete = async (id) => {
//     setLoading(true); setSuccess(''); setError('');
//     try {
//       const res = await fetch(`${backendBaseUrl}/api/team/${id}`, { method: 'DELETE' });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.message || 'Failed to delete');

//       setMembers((prev) => prev.filter((m) => m._id !== id));
//       setSuccess('🗑️ Member deleted');
//       setShowToast(true);
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || 'Failed to delete member');
//     } finally {
//       setLoading(false);
//       clearAlertsSoon();
//     }
//   };

//   // For editing preview: show draft if exists; otherwise current member image
//   const currentEditing = editingId ? members.find((m) => m._id === editingId) : null;
//   const currentImage = draftPreviewUrl || (currentEditing ? imgSrc(currentEditing) : '');

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">👥 Team Section Editor</h4> <BackBar />
//         </Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="p-4 mb-4">
//         <Row className="g-4">
//           <Col md={6}>
//             <Form.Group className="mb-3">
//               <Form.Label>Name</Form.Label>
//               <Form.Control
//                 value={form.name}
//                 onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Role</Form.Label>
//               <Form.Control
//                 value={form.role}
//                 onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
//               />
//             </Form.Group>

//             {/* Socials quick fields */}
//             <Form.Group className="mb-2">
//               <Form.Label>Facebook</Form.Label>
//               <Form.Control
//                 value={form.socialLinks.facebook || ''}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     socialLinks: { ...p.socialLinks, facebook: e.target.value },
//                   }))
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Instagram</Form.Label>
//               <Form.Control
//                 value={form.socialLinks.instagram || ''}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     socialLinks: { ...p.socialLinks, instagram: e.target.value },
//                   }))
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-2">
//               <Form.Label>Twitter</Form.Label>
//               <Form.Control
//                 value={form.socialLinks.twitter || ''}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     socialLinks: { ...p.socialLinks, twitter: e.target.value },
//                   }))
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>LinkedIn</Form.Label>
//               <Form.Control
//                 value={form.socialLinks.linkedin || ''}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     socialLinks: { ...p.socialLinks, linkedin: e.target.value },
//                   }))
//                 }
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>{editingId ? 'Replace Image (optional)' : 'Image'}</Form.Label>
//               <Form.Control
//                 type="file" accept="image/*"
//                 onChange={(e) => onPickLocal(e.target.files?.[0] || null)}
//               />
//               {currentImage ? (
//                 <div className="mt-3">
//                   <Image
//                     src={currentImage}
//                     alt="Preview"
//                     width={96}
//                     height={96}
//                     roundedCircle
//                     style={{ objectFit: 'cover' }}
//                   />
//                   {draftPreviewUrl && (
//                     <div className="small text-muted mt-1">(Preview – not saved yet)</div>
//                   )}
//                 </div>
//               ) : null}
//             </Form.Group>

//             <Button disabled={loading} onClick={editingId ? handleUpdate : handleAdd}>
//               {editingId ? (loading ? 'Updating…' : '✏️ Update Member')
//                          : (loading ? 'Adding…'   : '➕ Add Member')}
//             </Button>
//             {editingId && (
//               <Button variant="secondary" className="ms-2" onClick={resetForm} disabled={loading}>
//                 Cancel
//               </Button>
//             )}
//           </Col>
//         </Row>
//       </Card>

//       <Card className="p-4">
//         <Table bordered responsive>
//           <thead>
//             <tr>
//               <th style={{ width: 90 }}>Image</th>
//               <th>Name</th>
//               <th>Role</th>
//               <th style={{ width: 200 }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {members.map((m) => (
//               <tr key={m._id}>
//                 <td className="align-middle">
//                   {imgSrc(m) ? (
//                     <Image
//                       src={imgSrc(m)}
//                       alt="Team Member"
//                       width={60}
//                       height={60}
//                       roundedCircle
//                       style={{ objectFit: 'cover' }}
//                     />
//                   ) : 'No image'}
//                 </td>
//                 <td className="align-middle">{m.name}</td>
//                 <td className="align-middle">{m.role}</td>
//                 <td className="align-middle">
//                   <div className="d-flex gap-2 flex-wrap">
//                     <Button variant="warning" size="sm" onClick={() => handleEditStart(m)}>
//                       Edit
//                     </Button>
//                     <Button variant="danger" size="sm" onClick={() => handleDelete(m._id)}>
//                       Delete
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {!members.length && (
//               <tr>
//                 <td colSpan={4} className="text-center text-muted">No team members yet</td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </Card>

//       {/* Floating toast */}
//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
//           <Toast.Body className="text-white">{success || 'Saved successfully.'}</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// TeamEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default TeamEditor;






















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamS.js
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Image,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl, userId, templateId } from '../../lib/config';
import BackBar from "../components/BackBar";

function TeamEditor() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', socialLinks: {} });

  // local draft image (preview-only until Add/Update)
  const [imageFile, setImageFile] = useState(null);
  const [draftPreviewUrl, setDraftPreviewUrl] = useState('');
  const lastObjUrlRef = useRef('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // floater toast
  const [showToast, setShowToast] = useState(false);

  const clearAlertsSoon = () =>
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 2500);

  const normalizeMembers = (payload) =>
    Array.isArray(payload) ? payload : payload?.members || [];

  // Prefer presigned URL from API; fallback to legacy /uploads path
  const imgSrc = (m) => {
    if (m?.imageUrl) return m.imageUrl;
    if (m?.imageKey?.startsWith('/uploads/')) {
      return `${backendBaseUrl}${m.imageKey}`;
    }
    return '';
  };

  const reloadTeam = async () => {
    const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const json = await res.json();
    setMembers(normalizeMembers(json));
  };

  useEffect(() => {
    (async () => {
      try {
        await reloadTeam();
      } catch {
        setError('Failed to load team');
        clearAlertsSoon();
      }
    })();

    return () => {
      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ name: '', role: '', socialLinks: {} });
    setImageFile(null);
    if (lastObjUrlRef.current) {
      try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
      lastObjUrlRef.current = '';
    }
    setDraftPreviewUrl('');
    setEditingId(null);
  };

  // Choose file -> local preview only
  const onPickLocal = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be ≤ 10 MB');
      clearAlertsSoon();
      return;
    }
    const url = URL.createObjectURL(file);
    if (lastObjUrlRef.current) {
      try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    }
    lastObjUrlRef.current = url;
    setImageFile(file);
    setDraftPreviewUrl(url);
    setSuccess('');
    setError('');
  };

  // ADD: multipart (name, role, socials JSON string, optional image)
  const handleAdd = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('role', form.role);
      fd.append('socials', JSON.stringify(form.socialLinks || {}));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(
        `${backendBaseUrl}/api/team/${userId}/${templateId}`,
        { method: 'POST', body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add');

      setMembers((prev) => [...prev, data?.data || data]);
      await reloadTeam();

      setSuccess('✅ Team member added');
      setShowToast(true);
      resetForm();
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to add member');
    } finally {
      setLoading(false);
      clearAlertsSoon();
    }
  };

  const handleEditStart = (member) => {
    setForm({
      name: member.name || '',
      role: member.role || '',
      socialLinks: member.socials || member.socialLinks || {},
    });
    setEditingId(member._id);
    if (lastObjUrlRef.current) {
      try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
      lastObjUrlRef.current = '';
    }
    setDraftPreviewUrl('');
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UPDATE: multipart (name, role, socials JSON string, optional image)
  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('role', form.role);
      fd.append('socials', JSON.stringify(form.socialLinks || {}));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(`${backendBaseUrl}/api/team/${editingId}`, {
        method: 'PATCH',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update');

      const updated = data?.data || data;
      setMembers((prev) => prev.map((m) => (m._id === editingId ? updated : m)));
      await reloadTeam();

      setSuccess('✅ Member updated');
      setShowToast(true);
      resetForm();
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to update member');
    } finally {
      setLoading(false);
      clearAlertsSoon();
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${backendBaseUrl}/api/team/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to delete');

      setMembers((prev) => prev.filter((m) => m._id !== id));
      setSuccess('🗑️ Member deleted');
      setShowToast(true);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to delete member');
    } finally {
      setLoading(false);
      clearAlertsSoon();
    }
  };

  // For editing preview: show draft if exists; otherwise current member image
  const currentEditing = editingId ? members.find((m) => m._id === editingId) : null;
  const currentImage = draftPreviewUrl || (currentEditing ? imgSrc(currentEditing) : '');

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">👥 Team Section Editor</h4> <BackBar />
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 mb-4">
        <Row className="g-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              />
            </Form.Group>

            {/* Socials quick fields */}
            <Form.Group className="mb-2">
              <Form.Label>Facebook</Form.Label>
              <Form.Control
                value={form.socialLinks.facebook || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, facebook: e.target.value },
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Instagram</Form.Label>
              <Form.Control
                value={form.socialLinks.instagram || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, instagram: e.target.value },
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Twitter</Form.Label>
              <Form.Control
                value={form.socialLinks.twitter || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, twitter: e.target.value },
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                value={form.socialLinks.linkedin || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, linkedin: e.target.value },
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {editingId ? 'Replace Image (optional)' : 'Image'}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => onPickLocal(e.target.files?.[0] || null)}
              />
              {currentImage ? (
                <div className="mt-3">
                  <Image
                    src={currentImage}
                    alt="Preview"
                    width={96}
                    height={96}
                    roundedCircle
                    style={{ objectFit: 'cover' }}
                  />
                  {draftPreviewUrl && (
                    <div className="small text-muted mt-1">(Preview – not saved yet)</div>
                  )}
                </div>
              ) : null}
            </Form.Group>

            <Button disabled={loading} onClick={editingId ? handleUpdate : handleAdd}>
              {editingId
                ? loading
                  ? 'Updating…'
                  : '✏️ Update Member'
                : loading
                ? 'Adding…'
                : '➕ Add Member'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                className="ms-2"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Card className="p-4">
        <Table bordered responsive>
          <thead>
            <tr>
              <th style={{ width: 90 }}>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td className="align-middle">
                  {imgSrc(m) ? (
                    <Image
                      src={imgSrc(m)}
                      alt="Team Member"
                      width={60}
                      height={60}
                      roundedCircle
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    'No image'
                  )}
                </td>
                <td className="align-middle">{m.name}</td>
                <td className="align-middle">{m.role}</td>

                {/* Keep TD as a table-cell; put flex on an inner div */}
                <td className="align-middle">
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEditStart(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(m._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No team members yet
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Floating toast (floater) */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">
            {success || 'Saved successfully.'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

TeamEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default TeamEditor;



