"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Toast,
  ToastContainer,
  Alert,
  Badge,
  Table,
} from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

const API = backendBaseUrl || "";
const MAX_ITEMS = 10;

/* Resolve templateId: (1) ?templateId, (2) backend selection, (3) fallback */
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
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

function MarqueeStudioPage() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [items, setItems] = useState([{ text: "", icon: "*" }]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/marquee/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // defaults when template changes (keep at least 5)
  useEffect(() => {
    setItems([
      { text: "UI-UX Experience", icon: "*" },
      { text: "Web Development", icon: "*" },
      { text: "Digital Marketing", icon: "*" },
      { text: "Product Design", icon: "*" },
      { text: "Mobile Solutions", icon: "*" },
    ]);
    setErrorMsg("");
  }, [templateId]);

  // load
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
        if (arr.length) setItems(arr.map((x) => ({ text: x.text || "", icon: x.icon || "*" })));
      } catch (e) {
        console.error("❌ Load marquee failed", e);
        setErrorMsg("Failed to load marquee data.");
      }
    })();
  }, [apiUrl]);

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
      prev.length >= MAX_ITEMS ? prev : [...prev, { text: "", icon: "*" }]
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

  const handleSave = async () => {
    if (!apiUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const body = { items: items.map((x) => ({ text: x.text || "", icon: x.icon || "*" })) };
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
            <h4 className="fw-bold">🏷 Marquee</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">max {MAX_ITEMS} items</Badge>
            </div>
            {apiUrl && (
              <div className="text-muted" title={apiUrl}>
                endpoint: <code>/api/marquee/{defaultUserId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">{errorMsg}</Alert>
          </Col>
        </Row>
      ) : null}

      {/* Live-ish preview */}
      <Card className="p-4 mb-4">
        <div className="mb-2 text-muted">Preview</div>
        <div className="border rounded p-3 bg-light">
          <div className="d-flex flex-wrap gap-4">
            {items.map((it, i) => (
              <div key={i} className="d-flex align-items-center gap-3">
                <span className="fw-semibold">{it.text || "…"}</span>
                <span className="opacity-50">{it.icon || "*"}</span>
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
              <th style={{ width: "52px" }}>#</th>
              <th>Text</th>
              <th style={{ width: "160px" }}>Icon (optional)</th>
              <th style={{ width: "210px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td className="text-center align-middle">{idx + 1}</td>
                <td>
                  <Form.Control
                    placeholder="e.g. UI-UX Experience"
                    value={it.text || ""}
                    onChange={setField(idx, "text")}
                  />
                </td>
                <td>
                  <Form.Control
                    placeholder="*"
                    value={it.icon || ""}
                    onChange={setField(idx, "icon")}
                  />
                </td>
                <td className="text-nowrap">
                  <Button
                    size="sm"
                    variant="light"
                    className="me-2"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    className="me-2"
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeItem(idx)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted">No items. Add one above.</td></tr>
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

MarqueeStudioPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default MarqueeStudioPage;
