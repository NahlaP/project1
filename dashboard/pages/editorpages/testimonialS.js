

<<<<<<< HEAD
// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\testimonialS.js
=======

// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialS.js
>>>>>>> origin/design-work
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
} from '../../lib/config';
import { api } from '../../lib/api';
import { useIonContext } from '../../lib/useIonContext';
import BackBar from '../components/BackBar';

/* ---------------- helpers ---------------- */
const ABS = /^https?:\/\//i;
const isObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`);

async function presignKey(key) {
  if (!key) return '';
  try {
    const res = await fetch(
      `${backendUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`,
      { credentials: 'include', cache: 'no-store' }
    );
    const json = await res.json().catch(() => ({}));
    return json?.url || json?.signedUrl || '';
  } catch {
    return '';
  }
}

async function buildDisplayUrl(item) {
  if (item?.imageUrl && ABS.test(item.imageUrl)) return bust(item.imageUrl);
  const key =
    item?.imageKey ||
    (item?.imageUrl && !ABS.test(item.imageUrl) ? item.imageUrl : '');
  if (key) {
    const url = await presignKey(key);
    if (url) return bust(url);
  }
  if (typeof item?.imageUrl === 'string' && item.imageUrl.startsWith('/uploads/')) {
    return bust(`${backendUrl}${item.imageUrl}`);
  }
  return '';
}

function normItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
}

/* ---------------- page ---------------- */
function TestimonialEditor() {
  const { userId, templateId } = useIonContext(); // ✅ single source of truth

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
    () => async (item) => buildDisplayUrl(item),
    []
  );

  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${backendUrl}/api/testimonial/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return {
      list: `${base}`,
      create: `${base}`,
      reset: `${base}/reset`,
      patchOne: (id) => `${backendUrl}/api/testimonial/${encodeURIComponent(id)}`,
      deleteOne: (id) => `${backendUrl}/api/testimonial/${encodeURIComponent(id)}`,
    };
  }, [userId, templateId]);

  useEffect(() => {
    if (!endpoints) return;
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.list]);

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${endpoints.list}?_=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      const arr = normItems(data);
      const withUrls = await Promise.all(
        arr.map(async (t) => ({
          ...t,
          _id: t._id || t.id,
          rating: clamp(Number(t.rating || 0), 0, 5),
          displayUrl: await imgDisplayUrl(t),
        }))
      );
      setItems(withUrls);
    } catch (e) {
      console.error(e);
      setError('Failed to load testimonials');
    }
  }

  async function handleAdd() {
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
      fd.append('rating', String(clamp(form.rating, 1, 5)));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(endpoints.create, {
        method: 'POST',
        body: fd,
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      const newItem = { ...(data?.data || data) };
      newItem._id = newItem._id || newItem.id;
      newItem.rating = clamp(Number(newItem.rating || 0), 0, 5);
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
  }

  function handleEditStart(item) {
    setForm({
      name: item.name || '',
      profession: item.profession || '',
      message: item.message || '',
      rating: clamp(Number(item.rating || 5), 1, 5),
    });
    setEditingId(item._id);
    setEditingImageFile(null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // If editing a template placeholder (id like "tpl-0"), create an override instead of PATCH.
  async function handleEdit() {
    resetAlerts();
    if (!form.name || !form.message) {
      setError('Name and message are required');
      return;
    }
    if (!editingId || !endpoints) return;

    try {
      setLoading(true);

      if (!isObjectId(editingId)) {
        // Template item -> create user override (POST)
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('profession', form.profession);
        fd.append('message', form.message);
        fd.append('rating', String(clamp(form.rating, 1, 5)));
        if (editingImageFile) fd.append('image', editingImageFile);

        const res = await fetch(endpoints.create, {
          method: 'POST',
          body: fd,
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json().catch(() => ({}));
        const up = { ...(created?.data || created) };
        up._id = up._id || up.id;
        up.rating = clamp(Number(up.rating || 0), 0, 5);
        up.displayUrl = await imgDisplayUrl(up);
        setItems((prev) => [up, ...prev]);
        setSuccess('✅ Converted template item to your testimonial');
      } else {
        // Real DB row -> PATCH
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('profession', form.profession);
        fd.append('message', form.message);
        fd.append('rating', String(clamp(form.rating, 1, 5)));
        if (editingImageFile) fd.append('image', editingImageFile);

        const res = await fetch(endpoints.patchOne(editingId), {
          method: 'PATCH',
          body: fd,
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(await res.text());
        const updated = await res.json().catch(() => ({}));

        const up = { ...(updated?.data || updated) };
        up._id = up._id || up.id;
        up.rating = clamp(Number(up.rating || 0), 0, 5);
        up.displayUrl = await imgDisplayUrl(up);

        setItems((prev) =>
          prev.map((it) => ((it._id || it.id) === (up._id || up.id) ? up : it))
        );
        setSuccess('✅ Testimonial updated');
      }

      // reset editing form
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
  }

  async function handleDelete(id) {
    resetAlerts();
    if (!endpoints) return;
    if (!isObjectId(id)) {
      setError(
        'This item comes from the template. Convert it (Edit → Save) before deleting.'
      );
      return;
    }
    try {
      const res = await fetch(endpoints.deleteOne(id), {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((t) => (t._id || t.id) !== id));
      setSuccess('🗑️ Testimonial deleted');
    } catch (e) {
      console.error(e);
      setError('Failed to delete testimonial');
    }
  }

  /* ⟳ Reset to template defaults (like Hero) */
  async function handleReset() {
    resetAlerts();
    if (!endpoints) return;
    if (!confirm('Reset testimonials to template defaults?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${endpoints.reset}?_=${Date.now()}`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Reset failed'));

      // Re-fetch so the preview shows the seeded defaults immediately
      await fetchTestimonials();
      setSuccess('↺ Reset to defaults done.');
    } catch (e) {
      console.error(e);
      setError('Failed to reset testimonials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">⭐ Testimonial Section Editor</h4>
            <div className="small text-muted">
              template: <code>{templateId || '…'}</code>
            </div>
          </div>
          <BackBar />
        </Col>
      </Row>

      {/* Preview */}
      <Row className="my-4">
        <Col>
          <div className="bg-light p-4 rounded shadow-sm">
            <h5 className="mb-4">Live Preview</h5>
            <div className="d-flex flex-wrap gap-4">
              {items.length === 0 && (
                <span className="text-muted">No testimonials yet.</span>
              )}
              {items.map((t) => (
                <div
                  key={t._id || t.id}
                  className="border rounded p-3 bg-white shadow-sm"
                  style={{ width: '300px' }}
                >
                  {t.displayUrl ? (
                    <Image
                      src={t.displayUrl}
                      alt={t.name || 'User'}
                      width={80}
                      height={80}
                      roundedCircle
                      className="mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <h6 className="mb-1">{t.name || 'Name'}</h6>
                  <small className="text-muted">{t.profession || ''}</small>
                  <p className="mt-2 mb-1">{t.message || ''}</p>
                  <div className="text-warning">
                    {Array.from({ length: clamp(t.rating || 0, 0, 5) }).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - clamp(t.rating || 0, 0, 5)) }).map(
                      (_, i) => (
                        <i key={i} className="far fa-star"></i>
                      )
                    )}
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profession</Form.Label>
              <Form.Control
                value={form.profession}
                onChange={(e) =>
                  setForm((p) => ({ ...p, profession: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating: {form.rating}</Form.Label>
              <Form.Range
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rating: clamp(Number(e.target.value), 1, 5),
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {editingId ? 'Replace Image (optional)' : 'Image (optional)'}
              </Form.Label>
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

            <div className="d-flex gap-2">
              <Button onClick={editingId ? handleEdit : handleAdd} disabled={loading || !templateId || !userId}>
                {loading ? 'Saving…' : editingId ? '✏️ Update Testimonial' : '➕ Add Testimonial'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleReset}
                disabled={loading || !templateId || !userId}
                title="Reset to template defaults on the server"
              >
                ↺ Reset to Defaults
              </Button>
              {editingId && (
                <Button
                  variant="secondary"
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
            </div>
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
                <tr key={t._id || t.id}>
                  <td className="align-middle">
                    {t.displayUrl ? (
                      <Image
                        src={t.displayUrl}
                        alt={t.name || 'User'}
                        width={60}
                        height={60}
                        roundedCircle
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td className="align-middle">{t.name}</td>
                  <td className="align-middle">{t.profession}</td>
                  <td className="align-middle">{t.message}</td>
                  <td className="align-middle">{clamp(t.rating || 0, 0, 5)}</td>
                  <td className="align-middle">
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditStart(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(t._id || t.id)}
                      >
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

/* wrap in layout */
TestimonialEditor.getLayout = function (page) {
  return <EditorDashboardLayout>{page}</EditorDashboardLayout>;
};

export default TestimonialEditor;
