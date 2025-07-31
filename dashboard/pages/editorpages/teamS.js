




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

const backendUrl = 'http://localhost:5000';
const userId = 'demo-user';
const templateId = 'gym-template-1';

function TeamEditor() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', socialLinks: {} });
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/team/${userId}/${templateId}`)
      .then(res => res.json())
      .then(setMembers);
  }, []);

  const resetForm = () => {
    setForm({ name: '', role: '', socialLinks: {} });
    setImageFile(null);
    setEditingId(null);
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await fetch(`${backendUrl}/api/upload/team`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.imageUrl;
  };

  const handleAdd = async () => {
    try {
      const imageUrl = await uploadImage();
      const payload = { ...form, imageUrl, userId, templateId };

      const res = await fetch(`${backendUrl}/api/team/${userId}/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMembers(prev => [...prev, data.data]);
      setSuccess('✅ Team member added');
      resetForm();
    } catch (e) {
      setError('Failed to add member');
    }
  };

  const handleEditStart = (member) => {
    setForm({
      name: member.name,
      role: member.role,
      socialLinks: member.socials || {},
    });
    setEditingId(member._id);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const handleUpdate = async () => {
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('role', form.role);
      fd.append('socials', JSON.stringify(form.socialLinks));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(`${backendUrl}/api/team/${editingId}`, {
        method: 'PATCH',
        body: fd,
      });
      const data = await res.json();
      setMembers((prev) =>
        prev.map((m) => (m._id === editingId ? data.data : m))
      );
      setSuccess('✅ Member updated');
      resetForm();
    } catch (e) {
      setError('Failed to update member');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${backendUrl}/api/team/${id}`, { method: 'DELETE' });
    setMembers(prev => prev.filter(m => m._id !== id));
    setSuccess('🗑️ Member deleted');
  };

  const imgSrc = (url) =>
    url?.startsWith('http') ? url : `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col><h4 className="fw-bold">👥 Team Section Editor</h4></Col>
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
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{editingId ? 'Replace Image (optional)' : 'Image'}</Form.Label>
              <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])} />
            </Form.Group>
            <Button onClick={editingId ? handleUpdate : handleAdd}>
              {editingId ? '✏️ Update Member' : '➕ Add Member'}
            </Button>
            {editingId && (
              <Button variant="secondary" className="ms-2" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Card className="p-4">
        <Table bordered>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td>
                  {m.imageUrl ? (
                    <Image
                      src={imgSrc(m.imageUrl)}
                      alt="Team Member"
                      width={60}
                      height={60}
                      roundedCircle
                    />
                  ) : 'No image'}
                </td>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditStart(m)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(m._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}

TeamEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default TeamEditor;
