
// pages/editorpages/heroS.js
"use client";

import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Image as RBImage, Alert
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";

const API = backendBaseUrl || ""; // keep '' so Next proxy/rewrite for /api works

const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
};

function HeroEditorPage() {
  const [state, setState] = useState({ content: "", imageKey: "", displayUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const GET_URL    = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  const PUT_URL    = GET_URL;                  // PUT text/key
  const UPLOAD_URL = `${GET_URL}/image`;       // POST image

  const loadHero = async () => {
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const data = await res.json();
    setState({
      content:  data?.content  || "",
      imageKey: data?.imageKey || "",
      displayUrl: data?.imageUrl || absFromKey(data?.imageKey || ""),
    });
  };

  useEffect(() => { loadHero().catch((e) => setError(String(e.message || e))); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); e.target.value = ""; return; }

    setUploading(true); setSuccess(""); setError("");
    try {
      const form = new FormData();
      form.append("image", file); // multer expects "image"

      const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const j = await res.json();

      setState((p) => ({
        ...p,
        imageKey:  j?.imageKey || j?.key || p.imageKey,
        displayUrl: j?.imageUrl || absFromKey(j?.imageKey || j?.key || ""),
      }));
      setSuccess("✅ Image uploaded!");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  const onSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:  state.content || "",
          imageKey: state.imageKey || "", // backend accepts imageKey or imageUrl
        }),
      });
      if (!res.ok) throw new Error(await readErr(res));
      await loadHero();
      setSuccess("✅ Saved!");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <div className="row g-5">
          <div className="col-lg-6">
            {state.displayUrl ? (
              <RBImage
                src={state.displayUrl}
                alt="Hero"
                className="img-fluid"
                style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
              />
            ) : <div className="text-muted">No image uploaded yet</div>}

            <div className="d-flex gap-2 mt-2">
              <Form.Control type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
              <Button variant="outline-secondary" onClick={() => loadHero()}>Refresh preview</Button>
            </div>
            {uploading && <small className="text-muted">Uploading…</small>}

            <div className="small text-muted mt-2">
              <div><strong>Stored key:</strong> {state.imageKey || "(none)"} </div>
              <div><strong>Preview URL:</strong> {state.displayUrl ? "active" : "(none)"} </div>
            </div>
          </div>

          <div className="col-lg-6">
            <Form.Group className="mb-3">
              <Form.Label>Hero Headline</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={state.content || ""}
                onChange={(e) => setState((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write a motivational welcome message..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "💾 Save"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;









