;





// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutS.js
import React, { useEffect, useMemo, useState } from "react";
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
import {
  backendBaseUrl,
  userId,
  templateId,
  // Make sure these exist in dashboard/lib/config.js:
  // export const s3Bucket = 'project1-uploads-12345';
  // export const s3Region = 'ap-south-1';
  s3Bucket,
  s3Region,
} from "../../lib/config";

const API = backendBaseUrl || ""; // keep '' so /api uses Next rewrite
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// Convert a RELATIVE key like "sections/about/xyz.jpg" into ABSOLUTE S3 URL
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;       // already absolute
  if (u.startsWith("/")) return u; // root-relative (from /public) is fine
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u; // last resort
};

function AboutEditorPage() {
  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    imageUrl: "",
    imageAlt: "",
    bullets: [],
  });
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load current About
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/about/${userId}/${templateId}`);
        const data = await res.json();
        if (data) setAbout((p) => ({ ...p, ...data }));
      } catch (err) {
        console.error("❌ Failed to load About section", err);
      }
    })();
  }, []);

  // SAFETY NET: rewrite any stray <img src="sections/..."> added by other components
  useEffect(() => {
    const rewrite = () => {
      const imgs = document.querySelectorAll("img");
      imgs.forEach((img) => {
        const raw = img.getAttribute("src") || "";
        if (!isAbs(raw) && !raw.startsWith("/") && /^sections\//i.test(raw)) {
          const fixed = toAbs(raw);
          if (fixed && fixed !== raw) {
            img.src = fixed;
            img.setAttribute("data-rewritten", "true");
          }
        }
      });
    };
    rewrite();
    const mo = new MutationObserver((muts) => {
      let needs = false;
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG") needs = true;
        if (m.type === "childList") needs = true;
      }
      if (needs) rewrite();
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
    return () => mo.disconnect();
  }, []);

  const handleChange = (key, value) => setAbout((prev) => ({ ...prev, [key]: value }));

  const handleBulletChange = (idx, value) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    if (!updated[idx]) updated[idx] = { text: "" };
    updated[idx].text = value;
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const addBullet = () =>
    setAbout((p) => ({
      ...p,
      bullets: [...(Array.isArray(p.bullets) ? p.bullets : []), { text: "" }],
    }));

  const removeBullet = (idx) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    updated.splice(idx, 1);
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const res = await fetch(`${API}/api/about/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about), // we persist whatever backend expects; imageUrl may be relative there
      });
      const data = await res.json();
      if (data?.message || data?.ok) {
        setSuccess("✅ Saved!");
        // re-fetch to normalize
        const fresh = await fetch(`${API}/api/about/${userId}/${templateId}`);
        const freshData = await fresh.json();
        setAbout((p) => ({ ...p, ...freshData }));
      }
    } catch (err) {
      console.error("❌ Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    setSuccess("");
    try {
      const file = e.target.files[0];
      const form = new FormData();
      form.append("image", file);

      // Your existing upload endpoint
      const res = await fetch(`${API}/api/about/${userId}/${templateId}/image`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      // Your API returns updated About doc in data.result with RELATIVE imageUrl
      const rel = data?.result?.imageUrl || data?.imageUrl || "";
      if (rel) {
        // store relative; preview uses toAbs(rel) so it displays as S3 immediately
        setAbout((p) => ({ ...p, imageUrl: rel }));
        setSuccess("✅ Image uploaded!");
      } else {
        setSuccess("⚠️ Uploaded, but no image URL returned.");
      }
    } catch (err) {
      console.error("❌ Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Always render an absolute preview URL (S3) or a stable local placeholder
  const safePreviewSrc = useMemo(() => toAbs(about?.imageUrl) || "/img/about.jpg", [about?.imageUrl]);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">ℹ️ About Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                <img
                  src={safePreviewSrc}
                  alt={about.imageAlt || "About Image"}
                  className="img-fluid"
                  style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
                />
              </div>
              <div className="col-lg-6">
                <h1 className="display-6 text-uppercase mb-4">
                  {about.title || "About title..."}
                </h1>
                <p className="mb-4">{about.description || "Description..."}</p>

                <div className="row g-5 mb-4">
                  {(about.bullets || []).map((b, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 btn-xl-square bg-light me-3">
                          <i className="fa fa-check-square fa-2x text-primary"></i>
                        </div>
                        <h5 className="lh-base text-uppercase mb-0">
                          {b?.text || ""}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border border-5 border-primary p-4 text-center mt-4">
                  <h4 className="lh-base text-uppercase mb-0">
                    {about.highlight || "Highlight text..."}
                  </h4>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={about.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Image (upload)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleUploadImage} />
              {uploading && <small className="text-muted">Uploading…</small>}
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={about.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Highlight (bottom bordered text)</Form.Label>
              <Form.Control
                value={about.highlight || ""}
                onChange={(e) => handleChange("highlight", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <h6 className="fw-bold mt-3 mb-2">Bullets</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Text</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(about.bullets || []).map((b, idx) => (
              <tr key={idx}>
                <td>
                  <Form.Control
                    value={b?.text || ""}
                    onChange={(e) => handleBulletChange(idx, e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeBullet(idx)}
                  >
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Button variant="outline-primary" size="sm" onClick={addBullet}>
                  ➕ Add Bullet
                </Button>
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

AboutEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AboutEditorPage;
