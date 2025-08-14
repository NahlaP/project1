


// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Alert,
//   Image,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
// import { backendBaseUrl, userId, templateId } from '../../lib/config';

// function TeamEditor() {
//   const [members, setMembers] = useState([]);
//   const [form, setForm] = useState({ name: '', role: '', socialLinks: {} });
//   const [imageFile, setImageFile] = useState(null);
//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [editingId, setEditingId] = useState(null);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
//       .then(res => res.json())
//       .then(setMembers);
//   }, []);

//   const resetForm = () => {
//     setForm({ name: '', role: '', socialLinks: {} });
//     setImageFile(null);
//     setEditingId(null);
//   };

//   const uploadImage = async () => {
//     if (!imageFile) return '';
//     const formData = new FormData();
//     formData.append('image', imageFile);
//     const res = await fetch(`${backendBaseUrl}/api/upload/team`, {
//       method: 'POST',
//       body: formData,
//     });
//     const data = await res.json();
//     return data.imageUrl;
//   };

//   const handleAdd = async () => {
//     try {
//       const imageUrl = await uploadImage();
//       const payload = { ...form, imageUrl, userId, templateId };

//       const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       setMembers(prev => [...prev, data.data]);
//       setSuccess('✅ Team member added');
//       resetForm();
//     } catch (e) {
//       setError('Failed to add member');
//     }
//   };

//   const handleEditStart = (member) => {
//     setForm({
//       name: member.name,
//       role: member.role,
//       socialLinks: member.socials || {},
//     });
//     setEditingId(member._id);
//     setImageFile(null);
//     window.scrollTo(0, 0);
//   };

//   const handleUpdate = async () => {
//     try {
//       const fd = new FormData();
//       fd.append('name', form.name);
//       fd.append('role', form.role);
//       fd.append('socials', JSON.stringify(form.socialLinks));
//       if (imageFile) fd.append('image', imageFile);

//       const res = await fetch(`${backendBaseUrl}/api/team/${editingId}`, {
//         method: 'PATCH',
//         body: fd,
//       });
//       const data = await res.json();
//       setMembers((prev) =>
//         prev.map((m) => (m._id === editingId ? data.data : m))
//       );
//       setSuccess('✅ Member updated');
//       resetForm();
//     } catch (e) {
//       setError('Failed to update member');
//     }
//   };

//   const handleDelete = async (id) => {
//     await fetch(`${backendBaseUrl}/api/team/${id}`, { method: 'DELETE' });
//     setMembers(prev => prev.filter(m => m._id !== id));
//     setSuccess('🗑️ Member deleted');
//   };

//   const imgSrc = (url) =>
//     url?.startsWith('http') ? url : `${backendBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col><h4 className="fw-bold">👥 Team Section Editor</h4></Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="p-4 mb-4">
//         <Row>
//           <Col md={6}>
//             <Form.Group className="mb-3">
//               <Form.Label>Name</Form.Label>
//               <Form.Control
//                 value={form.name}
//                 onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Role</Form.Label>
//               <Form.Control
//                 value={form.role}
//                 onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>{editingId ? 'Replace Image (optional)' : 'Image'}</Form.Label>
//               <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])} />
//             </Form.Group>
//             <Button onClick={editingId ? handleUpdate : handleAdd}>
//               {editingId ? '✏️ Update Member' : '➕ Add Member'}
//             </Button>
//             {editingId && (
//               <Button variant="secondary" className="ms-2" onClick={resetForm}>
//                 Cancel
//               </Button>
//             )}
//           </Col>
//         </Row>
//       </Card>

//       <Card className="p-4">
//         <Table bordered>
//           <thead>
//             <tr>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Role</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {members.map((m) => (
//               <tr key={m._id}>
//                 <td>
//                   {m.imageUrl ? (
//                     <Image
//                       src={imgSrc(m.imageUrl)}
//                       alt="Team Member"
//                       width={60}
//                       height={60}
//                       roundedCircle
//                     />
//                   ) : 'No image'}
//                 </td>
//                 <td>{m.name}</td>
//                 <td>{m.role}</td>
//                 <td>
//                   <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditStart(m)}>
//                     Edit
//                   </Button>
//                   <Button variant="danger" size="sm" onClick={() => handleDelete(m._id)}>
//                     Delete
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </Card>
//     </Container>
//   );
// }

// TeamEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// export default TeamEditor;







// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\teamS.js
'use client';

import React, { useEffect, useState } from 'react';
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
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl, userId, templateId } from '../../lib/config';

function TeamEditor() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', socialLinks: {} });
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearAlertsSoon = () =>
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 2500);

  const normalizeMembers = (payload) =>
    Array.isArray(payload) ? payload : payload?.members || [];

  // Prefer presigned URL from API; fallback to legacy /uploads path
  const imgSrc = (m) => {
    if (m?.imageUrl) return m.imageUrl; // presigned S3 URL from API (expires ~60s)
    if (m?.imageKey?.startsWith('/uploads/')) {
      return `${backendBaseUrl}${m.imageKey}`; // legacy local uploads
    }
    return '';
  };

  const reloadTeam = async () => {
    const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ name: '', role: '', socialLinks: {} });
    setImageFile(null);
    setEditingId(null);
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

      // API shape: { message, data: { ...member } }
      const created = data?.data || data;
      // Optimistic add:
      setMembers((prev) => [...prev, created]);

      // Refresh list to get fresh presigned URLs for all members
      await reloadTeam();

      setSuccess('✅ Team member added');
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
      socialLinks: member.socials || {},
    });
    setEditingId(member._id);
    setImageFile(null);
    window.scrollTo(0, 0);
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

      // Replace the edited member locally
      setMembers((prev) => prev.map((m) => (m._id === editingId ? updated : m)));

      // Refresh list to renew presigned URLs (avoid 403 after 60s)
      await reloadTeam();

      setSuccess('✅ Member updated');
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
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to delete member');
    } finally {
      setLoading(false);
      clearAlertsSoon();
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">👥 Team Section Editor</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 mb-4">
        <Row>
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
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
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
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td>
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
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
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
    </Container>
  );
}

TeamEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default TeamEditor;
