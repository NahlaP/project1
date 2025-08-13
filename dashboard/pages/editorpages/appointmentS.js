





'use client';

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function AppointmentEditorPage() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",
    services: [],
  });

  const [newService, setNewService] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`);
        const result = await res.json();
        if (result) setData((p) => ({ ...p, ...result }));
      } catch (err) {
        console.error("❌ Failed to load appointment section", err);
      }
    })();
  }, []);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadImage = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", e.target.files[0]);

      const res = await fetch(`${backendBaseUrl}/api/upload/appointment`, {
        method: "POST",
        body: form,
      });
      const result = await res.json();
      if (result?.imageUrl) {
        setData((prev) => ({ ...prev, backgroundImage: result.imageUrl }));
        setSuccess("✅ Background image uploaded!");
      }
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.message) setSuccess("✅ Appointment section updated!");
    } catch (err) {
      console.error("❌ Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">📆 Appointment Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview Section */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4" style={{ background: "#f9f9f9" }}>
            <Row>
              <Col lg={6}>
                <div
                  style={{
                    backgroundImage: `url(${backendBaseUrl}${data.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "500px",
                    borderRadius: "8px",
                  }}
                />
              </Col>
              <Col lg={6}>
                <h1 className="display-6 text-uppercase mb-4">
                  {data.title || "Appointment title..."}
                </h1>
                <p className="mb-4">{data.subtitle || "Subtitle..."}</p>
                <p><strong>Office Address:</strong> {data.officeAddress}</p>
                <p><strong>Office Time:</strong> {data.officeTime}</p>
                <p><strong>Services:</strong></p>
                <ul>
                  {data.services.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={data.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control
                value={data.officeAddress}
                onChange={(e) => handleChange("officeAddress", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Office Time</Form.Label>
              <Form.Control
                value={data.officeTime}
                onChange={(e) => handleChange("officeTime", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Background Image Upload */}
        <Form.Group className="mb-4">
          <Form.Label>Upload Background Image</Form.Label>
          <Form.Control type="file" onChange={handleUploadImage} />
          {uploading && <small className="text-muted">Uploading…</small>}
        </Form.Group>

        <h6 className="fw-bold mt-3 mb-2">Services</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Service</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((service, idx) => (
              <tr key={idx}>
                <td>{service}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      const updated = data.services.filter((_, i) => i !== idx);
                      setData((p) => ({ ...p, services: updated }));
                    }}
                  >
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Row>
                  <Col>
                    <Form.Control
                      placeholder="New service"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        if (newService.trim()) {
                          setData((p) => ({
                            ...p,
                            services: [...p.services, newService.trim()],
                          }));
                          setNewService("");
                        }
                      }}
                    >
                      ➕ Add Service
                    </Button>
                  </Col>
                </Row>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

AppointmentEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AppointmentEditorPage;
