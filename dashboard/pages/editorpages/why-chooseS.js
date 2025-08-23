
// dashboard/pages/editorpages/why-chooseS.js
"use client";

import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";

// API base: keep '' so /api is proxied by Next when backendBaseUrl is empty
const API = backendBaseUrl || "";

// Build a public S3 URL from a plain key (for instant preview right after upload)
const absFromKey = (key) =>
  key ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}` : "";

// Helpers
const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
};
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

function WhyChooseEditorPage() {
  const [state, setState] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgOverlay: 0.5,

    // image handling
    bgImageKey: "",    // S3 key to persist in DB
    displayUrl: "",    // absolute (pre-signed or public) URL for preview
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const GET_URL = `${API}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  const PUT_URL = GET_URL;
  const UPLOAD_BG_URL = `${GET_URL}/bg`;
  const DELETE_BG_URL = `${GET_URL}/bg`;

  const loadData = async () => {
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json();

    setState((p) => ({
      ...p,
      description: j?.description || "",
      stats: Array.isArray(j?.stats) ? j.stats : [],
      progressBars: Array.isArray(j?.progressBars) ? j.progressBars : [],
      bgOverlay: typeof j?.bgOverlay === "number" ? j.bgOverlay : 0.5,

      // server returns: bgImageKey (the key), bgImageUrl (pre-signed)
      bgImageKey: j?.bgImageKey || j?.bgImageUrl || "",
      displayUrl: bust(j?.bgImageUrl || absFromKey(j?.bgImageKey || "")),
    }));
  };

  useEffect(() => { loadData().catch((e) => setError(String(e.message || e))); }, []);

  // ------- form change helpers -------
  const handleChange = (key, value) => setState((prev) => ({ ...prev, [key]: value }));
  const updateArray = (field, idx, key, value) => {
    const updated = [...(state[field] || [])];
    if (!updated[idx]) updated[idx] = {};
    updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
    setState((p) => ({ ...p, [field]: updated }));
  };
  const addItem = (field, item) => setState((p) => ({ ...p, [field]: [...(p[field] || []), item] }));
  const removeItem = (field, idx) => {
    const updated = [...(state[field] || [])];
    updated.splice(idx, 1);
    setState((p) => ({ ...p, [field]: updated }));
  };

  // ------- save all (text + arrays + overlay + bgImageKey) -------
  const handleSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      // DO NOT send bgImageUrl (pre-signed). Persist only the S3 key.
      const payload = {
        description: state.description,
        stats: state.stats,
        progressBars: state.progressBars,
        bgOverlay: state.bgOverlay,
        bgImageKey: state.bgImageKey || "",     // <— important
      };

      const res = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readErr(res));
      await loadData();
      setSuccess("✅ Saved!");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  // ------- upload background image -------
  const handleUploadBg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); e.target.value = ""; return; }

    setUploading(true); setSuccess(""); setError("");
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(UPLOAD_BG_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const j = await res.json();

      // backend returns updated doc in j.result; its bgImageUrl field holds the S3 key
      const key = j?.result?.bgImageUrl || j?.key || "";
      const displayUrl = absFromKey(key);

      setState((p) => ({ ...p, bgImageKey: key, displayUrl: bust(displayUrl) }));
      setSuccess("✅ Background image uploaded!");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  const handleDeleteBg = async () => {
    setError(""); setSuccess("");
    try {
      const res = await fetch(DELETE_BG_URL, { method: "DELETE" });
      if (!res.ok) throw new Error(await readErr(res));
      await res.json();
      setState((p) => ({ ...p, bgImageKey: "", displayUrl: "" }));
      setSuccess("🗑️ Background removed");
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const refreshPreview = async () => {
    try { await loadData(); } catch (e) { setError(String(e.message || e)); }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🏆 Why Choose Us Section</h4></Col></Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-0 overflow-hidden"
            style={{
              backgroundImage: state.displayUrl ? `url(${state.displayUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              minHeight: 480,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(0,0,0,${state.bgOverlay ?? 0})`,
              }}
            />
            <div className="p-4 position-relative" style={{ zIndex: 2 }}>
              <h1 className="display-6 text-white text-uppercase mb-4">
                Why You Should Choose Our Services
              </h1>
              <p className="text-light mb-4">
                {state.description || "Description here..."}
              </p>

              <Row className="mb-4">
                {(state.stats || []).map((s, i) => (
                  <Col key={i} sm={6}>
                    <div className="flex-column text-center border border-5 border-primary p-5">
                      <h1 className="text-white">{s.value}</h1>
                      <p className="text-white text-uppercase mb-0">{s.label}</p>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="border border-5 border-primary border-bottom-0 p-4">
                {(state.progressBars || []).map((bar, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white text-uppercase">{bar.label}</span>
                      <span className="text-white">{bar.percent}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bar.percent}
                        style={{ width: `${bar.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Background Image</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control type="file" accept="image/*" onChange={handleUploadBg} />
                <Button variant="outline-secondary" onClick={refreshPreview}>Refresh preview</Button>
              </div>
              {uploading && <small className="text-muted">Uploading…</small>}
              {state.displayUrl && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={state.displayUrl}   // do NOT prefix with backendBaseUrl
                    alt="bg"
                    style={{ height: 60, borderRadius: 4 }}
                    onError={() => setError("Preview failed (URL may have expired). Click Refresh preview.")}
                  />
                  <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
                    Remove
                  </Button>
                </div>
              )}
              <div className="small text-muted mt-1">
                <strong>Stored key:</strong> {state.bgImageKey || "(none)"}
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Overlay (0 - 1)</Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
                value={state.bgOverlay ?? 0.5}
                onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
              />
              <div className="text-muted small">{state.bgOverlay ?? 0.5}</div>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={state.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Form.Group>

        <h6 className="fw-bold">📊 Stats</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Value</th><th>Action</th></tr>
          </thead>
          <tbody>
            {(state.stats || []).map((s, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={s.label}
                    onChange={(e) => updateArray("stats", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={s.value}
                    onChange={(e) => updateArray("stats", i, "value", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("stats", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary" onClick={() => addItem("stats", { label: "", value: 0 })}>
                  ➕ Add Stat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Percent</th><th>Action</th></tr>
          </thead>
          <tbody>
            {(state.progressBars || []).map((b, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={b.label}
                    onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={b.percent}
                    onChange={(e) => updateArray("progressBars", i, "percent", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("progressBars", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary" onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
                  ➕ Add Progress Bar
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Changes"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default WhyChooseEditorPage;






