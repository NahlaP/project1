




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
// import { backendBaseUrl as backendUrl, userId, templateId } from '../../lib/config';
// import BackBar from "../components/BackBar";
// function TestimonialEditor() {
//   const [items, setItems] = useState([]);
//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     profession: '',
//     message: '',
//     rating: 5,
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editingImageFile, setEditingImageFile] = useState(null);

//   useEffect(() => {
//     fetchTestimonials();
//   }, []);

//   const fetchTestimonials = async () => {
//     try {
//       const res = await fetch(`${backendUrl}/api/testimonial/${userId}/${templateId}`);
//       const data = await res.json();
//       setItems(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error(e);
//       setError('Failed to load testimonials');
//     }
//   };

//   const resetAlerts = () => {
//     setSuccess('');
//     setError('');
//   };

//   const handleAdd = async () => {
//     resetAlerts();
//     if (!form.name || !form.message) {
//       setError('Name and message are required');
//       return;
//     }

//     try {
//       setLoading(true);
//       const fd = new FormData();
//       fd.append('name', form.name);
//       fd.append('profession', form.profession);
//       fd.append('message', form.message);
//       fd.append('rating', String(form.rating));
//       if (imageFile) fd.append('image', imageFile);

//       const res = await fetch(`${backendUrl}/api/testimonial/${userId}/${templateId}`, {
//         method: 'POST',
//         body: fd,
//       });

//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setItems((prev) => [data, ...prev]);

//       setForm({ name: '', profession: '', message: '', rating: 5 });
//       setImageFile(null);
//       setSuccess('✅ Testimonial added');
//     } catch (e) {
//       console.error(e);
//       setError('Failed to add testimonial');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditStart = (item) => {
//     setForm({
//       name: item.name || '',
//       profession: item.profession || '',
//       message: item.message || '',
//       rating: item.rating || 5,
//     });
//     setEditingId(item._id);
//     setEditingImageFile(null);
//     setImageFile(null);
//     window.scrollTo(0, 0);
//   };

//   const handleEdit = async () => {
//     resetAlerts();
//     if (!editingId || !form.name || !form.message) {
//       setError('Name and message are required');
//       return;
//     }

//     try {
//       setLoading(true);
//       const fd = new FormData();
//       fd.append('name', form.name);
//       fd.append('profession', form.profession);
//       fd.append('message', form.message);
//       fd.append('rating', String(form.rating));
//       if (editingImageFile) fd.append('image', editingImageFile);

//       const res = await fetch(`${backendUrl}/api/testimonial/${editingId}`, {
//         method: 'PATCH',
//         body: fd,
//       });

//       if (!res.ok) throw new Error(await res.text());
//       const updated = await res.json();
//       setItems((prev) => prev.map((item) => (item._id === editingId ? updated : item)));

//       setSuccess('✅ Testimonial updated');
//       setForm({ name: '', profession: '', message: '', rating: 5 });
//       setImageFile(null);
//       setEditingImageFile(null);
//       setEditingId(null);
//     } catch (e) {
//       console.error(e);
//       setError('Failed to update testimonial');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     resetAlerts();
//     try {
//       const res = await fetch(`${backendUrl}/api/testimonial/${id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Delete failed');
//       setItems((prev) => prev.filter((t) => t._id !== id));
//       setSuccess('🗑️ Testimonial deleted');
//     } catch (e) {
//       console.error(e);
//       setError('Failed to delete testimonial');
//     }
//   };

//   const imgSrc = (url) => (url?.startsWith('http') ? url : `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`);
// return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col><h4 className="fw-bold">⭐ Testimonial Section Editor</h4>  <BackBar /></Col>
//       </Row>

//       {/* Preview Section */}
//       <Row className="my-4">
//         <Col>
//           <div className="bg-light p-4 rounded shadow-sm">
//             <h5 className="mb-4">Live Preview</h5>
//             <div className="d-flex flex-wrap gap-4">
//               {items.length === 0 && <span className="text-muted">No testimonials yet.</span>}
//               {items.map((t) => (
//                 <div key={t._id} className="border rounded p-3 bg-white shadow-sm" style={{ width: '300px' }}>
//                   {t.imageUrl && (
//                     <Image
//                       src={imgSrc(t.imageUrl)}
//                       alt={t.name}
//                       width={80}
//                       height={80}
//                       roundedCircle
//                       className="mb-2"
//                     />
//                   )}
//                   <h6 className="mb-1">{t.name}</h6>
//                   <small className="text-muted">{t.profession}</small>
//                   <p className="mt-2 mb-1">{t.message}</p>
//                   <div className="text-warning">
//                     {Array.from({ length: t.rating }).map((_, i) => (
//                       <i key={i} className="fas fa-star"></i>
//                     ))}
//                     {Array.from({ length: 5 - t.rating }).map((_, i) => (
//                       <i key={i} className="far fa-star"></i>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {success && <Alert variant="success" className="mt-3">{success}</Alert>}
//       {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

//       <Card className="p-4 mb-4 shadow-sm">
//         <Row>
//           <Col md={6}>
//             <Form.Group className="mb-3">
//               <Form.Label>Name *</Form.Label>
//               <Form.Control
//                 value={form.name}
//                 onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Profession</Form.Label>
//               <Form.Control
//                 value={form.profession}
//                 onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Message *</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={4}
//                 value={form.message}
//                 onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Rating: {form.rating}</Form.Label>
//               <Form.Range
//                 min={1}
//                 max={5}
//                 value={form.rating}
//                 onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>{editingId ? 'Replace Image (optional)' : 'Image (optional)'}</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) =>
//                   editingId
//                     ? setEditingImageFile(e.target.files?.[0] || null)
//                     : setImageFile(e.target.files?.[0] || null)
//                 }
//               />
//             </Form.Group>

//             <Button onClick={editingId ? handleEdit : handleAdd} disabled={loading}>
//               {loading ? 'Saving…' : editingId ? '✏️ Update Testimonial' : '➕ Add Testimonial'}
//             </Button>
//             {editingId && (
//               <Button variant="secondary" className="ms-2" onClick={() => {
//                 setEditingId(null);
//                 setForm({ name: '', profession: '', message: '', rating: 5 });
//                 setImageFile(null);
//                 setEditingImageFile(null);
//               }}>
//                 Cancel
//               </Button>
//             )}
//           </Col>
//         </Row>
//       </Card>

//       <Card className="p-4 shadow-sm">
//         <Table bordered hover responsive>
//           <thead>
//             <tr>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Profession</th>
//               <th>Message</th>
//               <th>Rating</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr><td colSpan={6} className="text-center text-muted">No testimonials yet.</td></tr>
//             ) : (
//               items.map((t) => (
//                 <tr key={t._id}>
//                   <td>
//                     {t.imageUrl ? (
//                       <Image
//                         src={imgSrc(t.imageUrl)}
//                         alt={t.name}
//                         width={60}
//                         height={60}
//                         roundedCircle
//                         onError={(e) => { e.target.style.display = 'none'; }}
//                       />
//                     ) : (
//                       <span className="text-muted">No image</span>
//                     )}
//                   </td>
//                   <td>{t.name}</td>
//                   <td>{t.profession}</td>
//                   <td>{t.message}</td>
//                   <td>{t.rating}</td>
//                   <td>
//                     <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditStart(t)}>
//                       Edit
//                     </Button>
//                     <Button variant="danger" size="sm" onClick={() => handleDelete(t._id)}>
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </Table>
//       </Card>
//     </Container>
//   );
// }

// TestimonialEditor.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TestimonialEditor;







// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialS.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import {
  backendBaseUrl as backendUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from '../../lib/config';
import { api } from '../../lib/api';
import BackBar from "../components/BackBar";

/** Resolve templateId in this order:
 *  1) ?templateId=… in URL
 *  2) backend-selected template for the user
 *  3) config fallback (legacy)
 */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState('');
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL param
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const fromUrl = sp?.get('templateId')?.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl);
        return;
      }
      // 2) Backend-selected
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      // 3) Fallback
      if (!off) setTpl(defaultTemplateId || 'gym-template-1');
    })();
    return () => {
      off = true;
    };
  }, [userId]);
  return tpl;
}

// Helper to get a presigned URL for a stored S3 key
async function presignKey(key) {
  if (!key) return '';
  try {
    const res = await fetch(
      `${backendUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
    );
    const json = await res.json().catch(() => ({}));
    return json?.url || json?.signedUrl || '';
  } catch {
    return '';
  }
}

function TestimonialEditor() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [items, setItems] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    profession: '',
    message: '',
    rating: 5,
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingImageFile, setEditingImageFile] = useState(null);

  const resetAlerts = () => {
    setSuccess('');
    setError('');
  };

  const imgDisplayUrl = useMemo(
    () => async (item) => {
      // If backend already returned a full URL, use it
      if (item?.imageUrl && /^https?:\/\//i.test(item.imageUrl)) return item.imageUrl;

      // If we have an S3 key (imageKey or non-absolute imageUrl), presign it
      const maybeKey =
        item?.imageKey ||
        (item?.imageUrl && !/^https?:\/\//i.test(item.imageUrl) ? item.imageUrl : '');

      if (maybeKey) {
        const url = await presignKey(maybeKey);
        if (url) return url;
      }

      // Legacy /uploads fallback
      if (typeof item?.imageUrl === 'string' && item.imageUrl.startsWith('/uploads/')) {
        return `${backendUrl}${item.imageUrl}`;
      }

      return '';
    },
    []
  );

  useEffect(() => {
    if (!templateId) return;
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/api/testimonial/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`
      );
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];

      // Attach displayUrl per item
      const withUrls = await Promise.all(
        arr.map(async (t) => ({
          ...t,
          displayUrl: await imgDisplayUrl(t),
        }))
      );
      setItems(withUrls);
    } catch (e) {
      console.error(e);
      setError('Failed to load testimonials');
    }
  };

  const handleAdd = async () => {
    resetAlerts();
    if (!form.name || !form.message) {
      setError('Name and message are required');
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('profession', form.profession);
      fd.append('message', form.message);
      fd.append('rating', String(form.rating));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(
        `${backendUrl}/api/testimonial/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
        { method: 'POST', body: fd }
      );

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Normalize and add displayUrl
      const newItem = { ...(data?.data || data) };
      newItem.displayUrl = await imgDisplayUrl(newItem);
      setItems((prev) => [newItem, ...prev]);

      setForm({ name: '', profession: '', message: '', rating: 5 });
      setImageFile(null);
      setSuccess('✅ Testimonial added');
    } catch (e) {
      console.error(e);
      setError('Failed to add testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (item) => {
    setForm({
      name: item.name || '',
      profession: item.profession || '',
      message: item.message || '',
      rating: item.rating || 5,
    });
    setEditingId(item._id);
    setEditingImageFile(null);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const handleEdit = async () => {
    resetAlerts();
    if (!editingId || !form.name || !form.message) {
      setError('Name and message are required');
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('profession', form.profession);
      fd.append('message', form.message);
      fd.append('rating', String(form.rating));
      if (editingImageFile) fd.append('image', editingImageFile);

      const res = await fetch(`${backendUrl}/api/testimonial/${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();

      // Refresh display url
      const up = { ...(updated?.data || updated) };
      up.displayUrl = await imgDisplayUrl(up);

      setItems((prev) => prev.map((it) => (it._id === editingId ? up : it)));

      setSuccess('✅ Testimonial updated');
      setForm({ name: '', profession: '', message: '', rating: 5 });
      setImageFile(null);
      setEditingImageFile(null);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setError('Failed to update testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetAlerts();
    try {
      const res = await fetch(`${backendUrl}/api/testimonial/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((t) => t._id !== id));
      setSuccess('🗑️ Testimonial deleted');
    } catch (e) {
      console.error(e);
      setError('Failed to delete testimonial');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">⭐ Testimonial Section Editor</h4>
          <BackBar />
        </Col>
      </Row>

      {/* Preview Section */}
      <Row className="my-4">
        <Col>
          <div className="bg-light p-4 rounded shadow-sm">
            <h5 className="mb-4">Live Preview</h5>
            <div className="d-flex flex-wrap gap-4">
              {items.length === 0 && <span className="text-muted">No testimonials yet.</span>}
              {items.map((t) => (
                <div key={t._id} className="border rounded p-3 bg-white shadow-sm" style={{ width: '300px' }}>
                  {t.displayUrl ? (
                    <Image
                      src={t.displayUrl}
                      alt={t.name}
                      width={80}
                      height={80}
                      roundedCircle
                      className="mb-2"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <h6 className="mb-1">{t.name}</h6>
                  <small className="text-muted">{t.profession}</small>
                  <p className="mt-2 mb-1">{t.message}</p>
                  <div className="text-warning">
                    {Array.from({ length: t.rating || 0 }).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (t.rating || 0)) }).map((_, i) => (
                      <i key={i} className="far fa-star"></i>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Card className="p-4 mb-4 shadow-sm">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profession</Form.Label>
              <Form.Control
                value={form.profession}
                onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating: {form.rating}</Form.Label>
              <Form.Range
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{editingId ? 'Replace Image (optional)' : 'Image (optional)'}</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) =>
                  editingId
                    ? setEditingImageFile(e.target.files?.[0] || null)
                    : setImageFile(e.target.files?.[0] || null)
                }
              />
            </Form.Group>

            <Button onClick={editingId ? handleEdit : handleAdd} disabled={loading || !templateId}>
              {loading ? 'Saving…' : editingId ? '✏️ Update Testimonial' : '➕ Add Testimonial'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', profession: '', message: '', rating: 5 });
                  setImageFile(null);
                  setEditingImageFile(null);
                }}
              >
                Cancel
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Profession</th>
              <th>Message</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">No testimonials yet.</td></tr>
            ) : (
              items.map((t) => (
                <tr key={t._id}>
                  <td className="align-middle">
                    {t.displayUrl ? (
                      <Image
                        src={t.displayUrl}
                        alt={t.name}
                        width={60}
                        height={60}
                        roundedCircle
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td className="align-middle">{t.name}</td>
                  <td className="align-middle">{t.profession}</td>
                  <td className="align-middle">{t.message}</td>
                  <td className="align-middle">{t.rating}</td>
                  <td className="align-middle">
                    <div className="d-flex gap-2 flex-wrap">
                      <Button variant="warning" size="sm" onClick={() => handleEditStart(t)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(t._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

TestimonialEditor.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default TestimonialEditor;
