


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialS.js
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table, Alert, Image,
} from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
import { backendBaseUrl as backendUrl, userId, templateId } from '../../lib/config';
import BackBar from "../components/BackBar";

// ------------ helpers -------------
const readErr = async (res) => {
  const t = await res.text().catch(() => '');
  try { const j = JSON.parse(t); return j?.error || j?.message || t || `HTTP ${res.status}`; }
  catch { return t || `HTTP ${res.status}`; }
};

function TestimonialEditor() {
  const [items, setItems] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', profession: '', message: '', rating: 5,
  });

  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingImageFile, setEditingImageFile] = useState(null);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/testimonial/${userId}/${templateId}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      console.error(e);
      setError('Failed to load testimonials');
    }
  };

  const resetAlerts = () => { setSuccess(''); setError(''); };

  /** Get short-lived upload token + uploadUrl from backend */
  const getUploadToken = async (filename, type, size) => {
    const res = await fetch(
      `${backendUrl}/api/testimonial/${userId}/${templateId}/upload-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ filename, type, size }),
      }
    );
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || 'Failed to get upload token');
    // { token, uploadUrl, expiresIn }
    return j;
  };

  /** Upload file to cPanel using token + uploadUrl (robust across hosts) */
  const uploadToCpanel = async (file, token, uploadUrl) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('token', token); // body fallback

    // also include token in URL as a fallback
    const urlWithToken =
      uploadUrl + (uploadUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);

    const res = await fetch(urlWithToken, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // primary
        'X-ION7-Token': token,            // alternate header (some hosts drop Authorization)
      },
      body: fd,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j?.url) throw new Error(j?.error || 'cPanel upload failed');
    // e.g. https://ion7.mavsketch.com/uploads/YYYY/MM/xxxxx.jpg
    return j.url;
  };

  /** Create/Update on backend using JSON payload */
  const saveJson = async (payload, id = null) => {
    const url = id
      ? `${backendUrl}/api/testimonial/${id}`
      : `${backendUrl}/api/testimonial/${userId}/${templateId}`;
    const method = id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.message || 'Save failed');
    return j?.data || j;
  };

  const handleAdd = async () => {
    resetAlerts();
    if (!form.name || !form.message) {
      setError('Name and message are required');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = '';
      if (imageFile) {
        const { token, uploadUrl } =
          await getUploadToken(imageFile.name, imageFile.type, imageFile.size);
        imageUrl = await uploadToCpanel(imageFile, token, uploadUrl);
      }

      const saved = await saveJson({
        name: form.name,
        profession: form.profession,
        message: form.message,
        rating: Number(form.rating) || 5,
        imageUrl, // optional
      });

      setItems((prev) => [saved, ...prev]);
      setForm({ name: '', profession: '', message: '', rating: 5 });
      setImageFile(null);
      setSuccess('✅ Testimonial added');
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to add testimonial');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = async () => {
    resetAlerts();
    if (!editingId || !form.name || !form.message) {
      setError('Name and message are required');
      return;
    }

    try {
      setLoading(true);

      let imageUrl;
      if (editingImageFile) {
        const { token, uploadUrl } =
          await getUploadToken(editingImageFile.name, editingImageFile.type, editingImageFile.size);
        imageUrl = await uploadToCpanel(editingImageFile, token, uploadUrl);
      }

      const payload = {
        name: form.name,
        profession: form.profession,
        message: form.message,
        rating: Number(form.rating) || 5,
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      const updated = await saveJson(payload, editingId);

      setItems((prev) => prev.map((t) => (t._id === editingId ? updated : t)));
      setSuccess('✅ Testimonial updated');
      setForm({ name: '', profession: '', message: '', rating: 5 });
      setImageFile(null);
      setEditingImageFile(null);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to update testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetAlerts();
    try {
      const res = await fetch(`${backendUrl}/api/testimonial/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((t) => t._id !== id));
      setSuccess('🗑️ Testimonial deleted');
    } catch (e) {
      console.error(e);
      setError('Failed to delete testimonial');
    }
  };

  const imgSrc = (url) =>
    url?.startsWith('http')
      ? url
      : `${backendUrl}${url?.startsWith('/') ? '' : '/'}${url || ''}`;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">⭐ Testimonial Section Editor</h4> <BackBar />
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
                <div
                  key={t._id}
                  className="border rounded p-3 bg-white shadow-sm"
                  style={{ width: '300px' }}
                >
                  {t.imageUrl && (
                    <Image
                      src={imgSrc(t.imageUrl)}
                      alt={t.name}
                      width={80}
                      height={80}
                      roundedCircle
                      className="mb-2"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <h6 className="mb-1">{t.name}</h6>
                  <small className="text-muted">{t.profession}</small>
                  <p className="mt-2 mb-1">{t.message}</p>
                  <div className="text-warning">
                    {Array.from({ length: t.rating || 0 }).map((_, i) => (
                      <i key={`f-${t._id}-${i}`} className="fas fa-star"></i>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (t.rating || 0)) }).map((_, i) => (
                      <i key={`e-${t._id}-${i}`} className="far fa-star"></i>
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
              <div className="form-text">Max 10MB.</div>
            </Form.Group>

            <Button onClick={editingId ? handleEdit : handleAdd} disabled={loading}>
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
                disabled={loading}
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
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No testimonials yet.
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t._id}>
                  <td>
                    {t.imageUrl ? (
                      <Image
                        src={imgSrc(t.imageUrl)}
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
                  <td>{t.name}</td>
                  <td>{t.profession}</td>
                  <td>{t.message}</td>
                  <td>{t.rating}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditStart(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(t._id)}
                    >
                      Delete
                    </Button>
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
