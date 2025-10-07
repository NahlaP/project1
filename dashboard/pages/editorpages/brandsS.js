// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\brandsS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Toast, ToastContainer,
  Alert, Badge, Table, Image, InputGroup
} from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || "";
const MAX_ITEMS = 12;

// ---------------- Preview URL resolver ----------------
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || "http://127.0.0.1:5501/bayone1").replace(/\/+$/, "");
const ABS_RX = /^https?:\/\//i;

function resolvePreviewUrl(u) {
  const s = (u || "").trim();
  if (!s) return "";
  if (ABS_RX.test(s)) return s;               // http(s)
  if (s.startsWith("/")) return s;            // /uploads/...
  if (s.startsWith("assets/")) return `${SITE_ORIGIN}/${s}`; // theme assets
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${s.replace(/^\/+/, "")}`;
  }
  return s;
}

// Resolve templateId: (?templateId) -> selected template -> fallback
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl = typeof router.query.templateId === "string" && router.query.templateId.trim();
      if (fromUrl) { if (!off) setTid(fromUrl); return; }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) { setTid(t); return; }
      } catch {}
      if (!off) setTid("sir-template-1");
    })();
    return () => { off = true; };
  }, [router.query.templateId, userId]);
  return tid;
}

function BrandsStudioPage() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [items, setItems] = useState([
    { imageUrl: "assets/imgs/brands/01.png", href: "#0", alt: "Brand 1" },
    { imageUrl: "assets/imgs/brands/02.png", href: "#0", alt: "Brand 2" },
    { imageUrl: "assets/imgs/brands/03.png", href: "#0", alt: "Brand 3" },
    { imageUrl: "assets/imgs/brands/04.png", href: "#0", alt: "Brand 4" },
    { imageUrl: "assets/imgs/brands/05.png", href: "#0", alt: "Brand 5" },
  ]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // one hidden file input per row
  const fileInputsRef = useRef([]);

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/brands/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // Load saved brands
  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data?.items) ? data.items : [];
        if (arr.length) {
          setItems(arr.map((x) => ({
            imageUrl: x.imageUrl || "",
            href: x.href || "#",
            alt: x.alt || ""
          })));
        }
      } catch (e) {
        console.error("❌ Load brands failed", e);
        setErrorMsg("Failed to load brands data.");
      }
    })();
  }, [apiUrl]);

  // table field setters
  const setField = (i, key) => (e) => {
    const val = e.target.value;
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: val };
      return next;
    });
  };

  const addItem = () =>
    setItems((prev) =>
      prev.length >= MAX_ITEMS ? prev : [...prev, { imageUrl: "", href: "#", alt: "" }]
    );

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const moveUp = (idx) =>
    setItems((prev) => {
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });

  const moveDown = (idx) =>
    setItems((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });

  // ---------- file picker + upload ----------
  const openPicker = (i) => () => {
    const input = fileInputsRef.current[i];
    if (input) input.click();
  };

  const onPick = (i) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert("Logo must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    if (!apiUrl) return;
    try {
      const url = `${apiUrl}/image/${i}`;
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Upload failed (${res.status})`);
      }
      const data = await res.json().catch(() => ({}));
      const uploadedUrl = data?.imageUrl || "";
      if (uploadedUrl) {
        setItems((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], imageUrl: uploadedUrl };
          return next;
        });
      }
    } catch (err) {
      console.error("Upload error", err);
      alert(err?.message || "Upload failed");
    } finally {
      // reset input so selecting same file again still fires change
      e.target.value = "";
    }
  };

  // Save rows
  const handleSave = async () => {
    if (!apiUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const body = {
        items: items.map((x) => ({
          imageUrl: x.imageUrl || "",
          href: x.href || "#",
          alt: x.alt || ""
        })),
      };
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      const data = isJson ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = isJson ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Save failed (${res.status})`);
      }
      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🏷 Brands</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">max {MAX_ITEMS} items</Badge>
            </div>
            {apiUrl && (
              <div className="text-muted" title={apiUrl}>
                endpoint: <code>/api/brands/{defaultUserId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
      ) : null}

      {/* Live preview */}
      <Card className="p-4 mb-4">
        <div className="mb-2 text-muted">Preview</div>
        <div className="border rounded p-3 bg-light">
          <div className="d-flex flex-wrap gap-4 align-items-center">
            {items.map((it, i) => (
              <div key={i} style={{ width: 90, textAlign: "center" }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 10 }}>
                  <Image
                    src={resolvePreviewUrl(it.imageUrl) || resolvePreviewUrl("assets/imgs/brands/01.png")}
                    alt={it.alt || ""}
                    fluid
                  />
                </div>
                <small className="d-block text-truncate mt-1">{it.alt || "Brand"}</small>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Editor table */}
      <Card className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-bold">Items</h6>
          <Button variant="outline-primary" size="sm" onClick={addItem} disabled={items.length >= MAX_ITEMS}>
            ➕ Add Item
          </Button>
        </div>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: 52 }}>#</th>
              <th style={{ minWidth: 320 }}>Image URL</th>
              <th style={{ minWidth: 220 }}>Link (href)</th>
              <th style={{ width: 200 }}>Alt text</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td className="text-center align-middle">{idx + 1}</td>

                <td>
                  {/* URL + Browse button */}
                  <InputGroup>
                    <Form.Control
                      placeholder="assets/imgs/brands/01.png or /uploads/... or https://…"
                      value={it.imageUrl || ""}
                      onChange={setField(idx, "imageUrl")}
                      onDoubleClick={openPicker(idx)}  // quick access
                    />
                    <Button variant="outline-secondary" onClick={openPicker(idx)}>🗂 Browse</Button>
                  </InputGroup>

                  {/* hidden picker */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (fileInputsRef.current[idx] = el)}
                    style={{ display: "none" }}
                    onChange={onPick(idx)}
                  />
                </td>

                <td>
                  <Form.Control
                    placeholder="#0 or https://company.com"
                    value={it.href || ""}
                    onChange={setField(idx, "href")}
                  />
                </td>

                <td>
                  <Form.Control
                    placeholder="Brand name"
                    value={it.alt || ""}
                    onChange={setField(idx, "alt")}
                  />
                </td>

                <td className="text-nowrap">
                  <Button size="sm" variant="light" className="me-2" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</Button>
                  <Button size="sm" variant="light" className="me-2" onClick={() => moveDown(idx)} disabled={idx === items.length - 1}>↓</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem(idx)}>Delete</Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">No items. Add one above.</td></tr>
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
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

BrandsStudioPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default BrandsStudioPage;
