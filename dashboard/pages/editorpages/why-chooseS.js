








// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseS.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table,
  Toast, ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || "";

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
    bgImageUrl: "",   
  });

  // previews
  const [serverPreviewUrl, setServerPreviewUrl] = useState("");
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreviewUrl, setDraftPreviewUrl] = useState("");
  const lastObjUrlRef = useRef("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const GET_URL     = `${API}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  const PUT_URL     = GET_URL;
  const TOKEN_URL   = `${GET_URL}/upload-token`;     // same flow as hero/appointment
  const CLEAR_URL   = `${GET_URL}/clear-image`;      // mirrors hero/appointment clear

  const loadData = async () => {
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json();

    const url = j?.bgImageUrl || j?.bgImage || "";   // accept either field name
    setState((p) => ({
      ...p,
      description: j?.description || "",
      stats: Array.isArray(j?.stats) ? j.stats : [],
      progressBars: Array.isArray(j?.progressBars) ? j.progressBars : [],
      bgOverlay: typeof j?.bgOverlay === "number" ? j.bgOverlay : 0.5,
      bgImageUrl: url || "",
    }));
    setServerPreviewUrl(bust(url || ""));
  };

  useEffect(() => { loadData().catch((e) => setError(String(e.message || e))); }, []);
  useEffect(() => () => { if (lastObjUrlRef.current) { try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {} } }, []);

  // ------- form helpers -------
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

  // ------- local pick (preview only) -------
  const onPickLocalBg = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); return; }
    const url = URL.createObjectURL(file);
    if (lastObjUrlRef.current) { try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {} }
    lastObjUrlRef.current = url;
    setDraftFile(file);
    setDraftPreviewUrl(url);
    setError("");
  };

  // ------- cPanel upload -> returns PUBLIC URL -------
  const uploadViaCpanel = async (file) => {
    const meta = {
      filename: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    };
    const m1 = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    if (!m1.ok) throw new Error(await readErr(m1));
    const { token, uploadUrl } = await m1.json();

    const fd = new FormData();
    fd.append("file", file);
    const m2 = await fetch(uploadUrl, {
      method: "POST",
      headers: { "X-ION7-Token": token },  // IMPORTANT header
      body: fd,
    });
    if (!m2.ok) throw new Error(await readErr(m2));
    const j = await m2.json();
    const url = j?.url || "";
    if (!/^https?:\/\//i.test(url)) throw new Error("cPanel upload did not return a public URL");
    return url;
  };

  // ------- save (text + arrays + overlay + public URL) -------
  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      let urlToPersist = state.bgImageUrl || "";

      if (draftFile) {
        urlToPersist = await uploadViaCpanel(draftFile);
      }

      const payload = {
        description: state.description,
        stats: state.stats,
        progressBars: state.progressBars,
        bgOverlay: state.bgOverlay,
        // backend accepts either; we send bgImageUrl to be explicit
        bgImageUrl: urlToPersist,
      };

      const put = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!put.ok) throw new Error(await readErr(put));

      await loadData();

      if (lastObjUrlRef.current) { try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {} lastObjUrlRef.current = ""; }
      setDraftFile(null);
      setDraftPreviewUrl("");

      setShowToast(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBg = async () => {
    setError("");
    try {
      
      let res = await fetch(CLEAR_URL, { method: "POST" });
      if (!res.ok) {
    
        res = await fetch(`${GET_URL}/bg`, { method: "DELETE" });
      }
      if (!res.ok) throw new Error(await readErr(res));
      await loadData();
      if (lastObjUrlRef.current) { try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {} lastObjUrlRef.current = ""; }
      setDraftFile(null);
      setDraftPreviewUrl("");
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const refreshPreview = async () => {
    try { await loadData(); }
    catch (e) { setError(String(e.message || e)); }
  };

  const previewBg = draftPreviewUrl || serverPreviewUrl;

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🏆 Why Choose Us Section</h4> <BackBar /></Col></Row>

      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-0 overflow-hidden"
            style={{
              backgroundImage: previewBg ? `url(${previewBg})` : "none",
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
                {/* preview-only; upload occurs on Save via cPanel */}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickLocalBg(e.target.files?.[0] || null)}
                />
                <Button variant="outline-secondary" onClick={refreshPreview}>Refresh preview</Button>
              </div>
              {previewBg && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={previewBg}
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
                <strong>Stored URL:</strong> {state.bgImageUrl || "(none)"}{" "}
                {draftPreviewUrl && <em className="ms-2">(Draft selected – not saved yet)</em>}
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
                    value={s.label || ""}
                    onChange={(e) => updateArray("stats", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={s.value ?? 0}
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
                    value={b.label || ""}
                    onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={b.percent ?? 0}
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

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default WhyChooseEditorPage;
