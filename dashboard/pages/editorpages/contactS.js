'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import EditorDashboardLayout from '../layouts/EditorDashboardLayout';

const backendUrl = 'http://localhost:5000';
const userId = 'demo-user';
const templateId = 'gym-template-1';

function ContactEditor() {
  const [form, setForm] = useState({
    address: '',
    phone: '',
    email: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      youtube: '',
      linkedin: '',
    },
    businessHours: {
      mondayToFriday: '',
      saturday: '',
      sunday: '',
    },
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/contact-info/${userId}/${templateId}`);
        const data = await res.json();
        if (data) setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load contact info');
      }
    })();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${backendUrl}/api/contact-info/${userId}/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.message) setSuccess('✅ Contact info saved successfully!');
    } catch (err) {
      setError('❌ Failed to save');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">📞 Contact Section Editor</h4></Col></Row>
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={form.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={form.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={form.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col><h6 className="text-uppercase">🌐 Social Links</h6></Col>
        </Row>
        <Row>
          {['facebook', 'twitter', 'youtube', 'linkedin'].map((key) => (
            <Col md={3} key={key}>
              <Form.Group className="mb-3">
                <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
                <Form.Control
                  value={form.socialLinks?.[key] || ''}
                  onChange={(e) => handleNestedChange('socialLinks', key, e.target.value)}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        <Row className="mt-3">
          <Col><h6 className="text-uppercase">⏰ Business Hours</h6></Col>
        </Row>
        <Row>
          {[
            ['mondayToFriday', 'Monday - Friday'],
            ['saturday', 'Saturday'],
            ['sunday', 'Sunday'],
          ].map(([key, label]) => (
            <Col md={4} key={key}>
              <Form.Group className="mb-3">
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  value={form.businessHours?.[key] || ''}
                  onChange={(e) => handleNestedChange('businessHours', key, e.target.value)}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={loading} variant="primary">
            {loading ? 'Saving...' : '💾 Save Contact Info'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 mt-4 bg-dark text-white">
        <Row className="g-5">
          <Col md={6} lg={3}>
            <h5 className="text-uppercase text-light mb-4">Our Office</h5>
            <p><i className="fa fa-map-marker-alt text-primary me-2"></i>{form.address}</p>
            <p><i className="fa fa-phone-alt text-primary me-2"></i>{form.phone}</p>
            <p><i className="fa fa-envelope text-primary me-2"></i>{form.email}</p>
            <div className="d-flex pt-3">
              {form.socialLinks.twitter && <a className="btn btn-square btn-light me-2" href={form.socialLinks.twitter}><i className="fab fa-twitter"></i></a>}
              {form.socialLinks.facebook && <a className="btn btn-square btn-light me-2" href={form.socialLinks.facebook}><i className="fab fa-facebook-f"></i></a>}
              {form.socialLinks.youtube && <a className="btn btn-square btn-light me-2" href={form.socialLinks.youtube}><i className="fab fa-youtube"></i></a>}
              {form.socialLinks.linkedin && <a className="btn btn-square btn-light me-2" href={form.socialLinks.linkedin}><i className="fab fa-linkedin-in"></i></a>}
            </div>
          </Col>

          <Col md={6} lg={3}>
            <h5 className="text-uppercase text-light mb-4">Business Hours</h5>
            <p className="text-uppercase mb-0">Monday - Friday</p>
            <p>{form.businessHours.mondayToFriday}</p>
            <p className="text-uppercase mb-0">Saturday</p>
            <p>{form.businessHours.saturday}</p>
            <p className="text-uppercase mb-0">Sunday</p>
            <p>{form.businessHours.sunday}</p>
          </Col>

          <Col md={12} lg={6}>
            {/* <h5 className="text-uppercase text-light mb-4">Gallery (Static)</h5> */}
            <div className="row g-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div className="col-4" key={i}>
                  {/* <img className="img-fluid" src={`/img/service-${i}.jpg`} alt={`Gallery ${i}`} /> */}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

ContactEditor.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactEditor;
