"use client";

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

const backendBaseUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

function ServicesEditorPage() {
  const [servicesDoc, setServicesDoc] = useState({
    services: [],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`);
      const json = await res.json();
      setServicesDoc(json || { services: [] });
    })();
  }, []);

  const updateService = (idx, key, value) => {
    const updated = [...(servicesDoc.services || [])];
    updated[idx][key] = key === "order" ? Number(value) : value;
    setServicesDoc((p) => ({ ...p, services: updated }));
  };

  const addService = () => {
    setServicesDoc((p) => ({
      ...p,
      services: [
        ...(p.services || []),
        {
          title: "",
          description: "",
          imageUrl: "",
          delay: "0.1s",
          order: (p.services?.length || 0) + 1,
          buttonText: "Read More",
          buttonHref: "#",
        },
      ],
    }));
  };

  const removeService = (idx) => {
    const updated = [...servicesDoc.services];
    updated.splice(idx, 1);
    setServicesDoc((p) => ({ ...p, services: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(servicesDoc),
      });
      const json = await res.json();
      if (json.message) setSuccess("✅ Saved!");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, serviceId, idx) => {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(
      `${backendBaseUrl}/api/services/${userId}/${templateId}/${serviceId}/image`,
      { method: "POST", body: form }
    );
    const json = await res.json();
    if (json?.result) {
      setServicesDoc(json.result); // refresh from backend (keeps MongoIds correct)
      setSuccess("✅ Image uploaded!");
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🧰 Services Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* ===== Preview (like frontend) ===== */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="text-center mx-auto" style={{ maxWidth: 600 }}>
              <h1 className="display-6 text-uppercase mb-5">
                Reliable &amp; High-Value gym Services
              </h1>
            </div>

            <div className="row g-4">
              {(servicesDoc.services || [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((s, i) => (
                  <div
                    className="col-lg-3 col-md-6"
                    key={s._id || i}
                    data-wow-delay={s.delay || `0.${i + 1}s`}
                  >
                    <div className="service-item">
                      <div className="service-inner pb-5">
                        {s.imageUrl && (
                          <img className="img-fluid w-100" src={`${backendBaseUrl}${s.imageUrl}`} alt="" />
                        )}
                        <div className="service-text px-5 pt-4">
                          <h5 className="text-uppercase">{s.title || "Service Title"}</h5>
                          <p>{s.description || "Service description..."}</p>
                        </div>
                        <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
                          {s.buttonText || "Read More"}
                          <i className="bi bi-chevron-double-right ms-1"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== Editor ===== */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Edit Services</h5>
          <Button variant="outline-primary" onClick={addService}>
            ➕ Add Service
          </Button>
        </div>

        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Order</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{ width: 130 }}>Delay</th>
              <th>Image</th>
              <th>Button Text</th>
              <th>Button Link</th>
              <th style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(servicesDoc.services || []).map((s, idx) => (
              <tr key={s._id || idx}>
                <td>
                  <Form.Control
                    type="number"
                    value={s.order ?? 0}
                    onChange={(e) => updateService(idx, "order", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    value={s.title || ""}
                    onChange={(e) => updateService(idx, "title", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={s.description || ""}
                    onChange={(e) => updateService(idx, "description", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    value={s.delay || ""}
                    onChange={(e) => updateService(idx, "delay", e.target.value)}
                  />
                </td>
                <td>
                  {s.imageUrl && (
                    <img
                      src={`${backendBaseUrl}${s.imageUrl}`}
                      alt=""
                      style={{ width: 60, height: 60, objectFit: "cover", display: "block", marginBottom: 6 }}
                    />
                  )}
                  <Form.Control
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files?.length) return;
                      uploadImage(e.target.files[0], s._id, idx);
                    }}
                  />
                </td>
                <td>
                  <Form.Control
                    value={s.buttonText || ""}
                    onChange={(e) => updateService(idx, "buttonText", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    value={s.buttonHref || ""}
                    onChange={(e) => updateService(idx, "buttonHref", e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeService(idx)}
                  >
                    ❌
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Services"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

ServicesEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ServicesEditorPage;