

// pages/editorpages/appointmentS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table, Toast, ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* --------------------------- per-template profiles --------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    appointment: {
      fields: {
        title: true,
        subtitle: true,
        officeAddress: true,
        officeTime: true,
        services: true,
        backgroundImage: true,   // S3 key to persist
        backgroundImageUrl: true // absolute URL (optional from backend)
      },
      defaults: {
        title: "Book an Appointment",
        subtitle: "Tell us what you need — we’ll schedule you quickly.",
        officeAddress: "Dubai Media City, Building X",
        officeTime: "Sun–Thu, 9:00–18:00",
        services: ["Brand Strategy", "UI/UX Design", "Web Development"],
        backgroundImage: "",
        backgroundImageUrl: "",
      },
    },
  },
  "gym-template-1": {
    appointment: {
      fields: {
        title: true,
        subtitle: true,
        officeAddress: true,
        officeTime: true,
        services: true,
        backgroundImage: true,
        backgroundImageUrl: true
      },
      defaults: {
        title: "Schedule Your Session",
        subtitle: "Personal training tailored to your goals.",
        officeAddress: "Al Qusais, Street 12",
        officeTime: "Daily, 6:00–22:00",
        services: ["Strength Training", "Mobility", "Endurance"],
        backgroundImage: "",
        backgroundImageUrl: "",
      },
    },
  },
};

const API = backendBaseUrl || "";

/* --------------------------------- helpers --------------------------------- */
const isHttp = (s) => /^https?:\/\//i.test(String(s || ""));
const clamp = (n, lo, hi) => {
  const x = Number.isFinite(+n) ? +n : lo;
  return Math.min(hi, Math.max(lo, x));
};
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

async function presignKey(key) {
  if (!key) return "";
  try {
    const r = await fetch(`${API}/api/upload/file-url?key=${encodeURIComponent(key)}`, {
      credentials: "include",
    });
    const j = await r.json().catch(() => ({}));
    return j?.url || j?.signedUrl || "";
  } catch {
    return "";
  }
}

const getAllowed = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.appointment?.fields || {};
const getDefaults = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.appointment?.defaults || {};
const pickAllowed = (obj, allowed) => {
  const out = {};
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/* ---------------------------------- page ---------------------------------- */
function AppointmentEditorPage() {
  const { userId, templateId } = useIonContext(); // 🔗 same as hero/why-choose
  const allowed = useMemo(() => getAllowed(templateId), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId), [templateId]);

  const [state, setState] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    services: [],
    backgroundImage: "",    // key we persist
    backgroundImageUrl: "", // server may return absolute URL
  });

  const [displayUrl, setDisplayUrl] = useState("");
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", variant: "success" });
  const [newService, setNewService] = useState("");

  // Build endpoints only when we have IDs
  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/appointment/${encodeURIComponent(userId)}/${encodeURIComponent(
      templateId
    )}`;
    return {
      GET_URL: base,
      PUT_URL: base,
      UP_IMAGE: `${base}/image`,
      RESET: `${base}/reset`,
    };
  }, [userId, templateId]);

  // On template switch → apply defaults locally
  useEffect(() => {
    setState((p) => ({ ...p, ...defaults }));
    setDraftFile(null);
    setDraftPreview("");
    setError("");
  }, [defaults, templateId]);

  // Compute preview URL (prefer full URL; otherwise presign key)
  const computePreview = useMemo(
    () => async (doc) => {
      const full = doc?.backgroundImageUrl;
      if (isHttp(full)) return bust(full);
      const key = doc?.backgroundImage || (full && !isHttp(full) ? String(full) : "");
      if (key) {
        const url = await presignKey(key);
        return bust(url || "");
      }
      return "";
    },
    []
  );

  // Load current appointment (server → state with defaults fallback)
  const loadAppointment = async () => {
    if (!endpoints) return;
    setError("");
    const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json().catch(() => ({}));

    const merged = {
      ...defaults,
      ...(typeof j === "object" ? j : {}),
    };

    // normalize a couple of legacy field names if backend sends them
    const normalized = {
      title: merged.title ?? merged.headingLeft ?? "",
      subtitle: merged.subtitle ?? merged.descriptionLeft ?? "",
      officeAddress: merged.officeAddress ?? "",
      officeTime: merged.officeTime ?? "",
      services: Array.isArray(merged.services) ? merged.services : [],
      backgroundImage: merged.backgroundImage ?? "",
      backgroundImageUrl: merged.backgroundImageUrl ?? "",
    };

    const safe = pickAllowed(normalized, allowed);
    setState((p) => ({ ...p, ...safe }));

    const show = await computePreview(safe);
    setDisplayUrl(show);
  };

  useEffect(() => {
    if (!endpoints) return;
    loadAppointment().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, allowed]);

  useEffect(() => {
    return () => {
      if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    };
  }, []);

  /* ---------------------------- draft image pick ---------------------------- */
  const onPickLocal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    lastObjUrlRef.current = objUrl;

    setDraftFile(file);
    setDraftPreview(objUrl);
    setError("");
  };

  /* --------------------------------- upload -------------------------------- */
  const uploadIfNeeded = async () => {
    if (!endpoints || !draftFile || !allowed.backgroundImage) return { backgroundImage: "" };
    const form = new FormData();
    form.append("image", draftFile);
    const r = await fetch(`${endpoints.UP_IMAGE}?_=${Date.now()}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!r.ok) throw new Error(await readErr(r));
    const j = await r.json().catch(() => ({}));
    const key = j?.imageKey || j?.key || "";
    return { backgroundImage: key };
  };

  /* ---------------------------------- save ---------------------------------- */
  const onSave = async () => {
    if (!endpoints) return;
    if (!userId || !templateId) {
      setError("Missing user/template.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const uploaded = await uploadIfNeeded();

      const fullPayload = {
        title: state.title || "",
        subtitle: state.subtitle || "",
        officeAddress: state.officeAddress || "",
        officeTime: state.officeTime || "",
        services: Array.isArray(state.services) ? state.services : [],
        ...(uploaded.backgroundImage
          ? { backgroundImage: uploaded.backgroundImage }
          : isHttp(state.backgroundImage)
          ? {} // if an absolute URL somehow landed in backgroundImage, ignore it
          : { backgroundImage: state.backgroundImage || "" }),
      };

      const safePayload = pickAllowed(fullPayload, allowed);

      const res = await fetch(`${endpoints.PUT_URL}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await readErr(res));

      await loadAppointment();

      // clear local draft
      setDraftFile(null);
      setDraftPreview("");
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }

      setToast({ show: true, msg: "✅ Saved.", variant: "success" });
    } catch (e) {
      setError(String(e.message || e));
      setToast({ show: true, msg: "❌ Save failed.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------- reset --------------------------------- */
  const onResetDefault = async () => {
    if (!endpoints) return;
    setResetting(true);
    setError("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));

      await loadAppointment();

      // clear local draft preview
      setDraftFile(null);
      setDraftPreview("");
      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }

      setToast({ show: true, msg: "↺ Reset to defaults done.", variant: "success" });
    } catch (e) {
      setError(String(e.message || e));
      setToast({ show: true, msg: "❌ Reset failed.", variant: "danger" });
    } finally {
      setResetting(false);
    }
  };

  /* --------------------------------- ui --------------------------------- */
  const bgUrl = draftPreview || displayUrl || "";
  const addService = () => {
    const s = (newService || "").trim();
    if (!s) return;
    setState((p) => ({ ...p, services: [...(p.services || []), s] }));
    setNewService("");
  };
  const removeService = (idx) =>
    setState((p) => ({ ...p, services: (p.services || []).filter((_, i) => i !== idx) }));

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">📆 Appointment Section</h4>
            <div className="small text-muted">
              template: <code>{templateId || "…"}</code>
            </div>
          </div>
          <BackBar />
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </Alert>
      )}

      {/* Preview */}
      <Row className="mb-4 mt-3">
        <Col>
          <Card className="p-4" style={{ background: "#f9f9f9" }}>
            <Row>
              <Col lg={6}>
                <div
                  style={{
                    backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: "460px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              </Col>
              <Col lg={6}>
                <h1 className="display-6 text-uppercase mb-3">
                  {state.title || "Appointment title…"}
                </h1>
                <p className="mb-3">{state.subtitle || "Subtitle…"}</p>
                <p className="mb-1">
                  <strong>Office Address:</strong> {state.officeAddress || "—"}
                </p>
                <p className="mb-3">
                  <strong>Office Time:</strong> {state.officeTime || "—"}
                </p>
                <p className="mb-1"><strong>Services:</strong></p>
                <ul className="mb-0">
                  {(state.services || []).map((s, i) => <li key={i}>{s}</li>)}
                  {!state.services?.length && <li className="text-muted">No services yet.</li>}
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
            value={state.title}
            onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={state.subtitle}
            onChange={(e) => setState((p) => ({ ...p, subtitle: e.target.value }))}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control
                value={state.officeAddress}
                onChange={(e) => setState((p) => ({ ...p, officeAddress: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Time</Form.Label>
              <Form.Control
                value={state.officeTime}
                onChange={(e) => setState((p) => ({ ...p, officeTime: e.target.value }))}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Background Image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
          <div className="form-text">
            Max 10 MB. New image uploads when you click <strong>Save</strong>.
          </div>
        </Form.Group>

        <h6 className="fw-bold mt-3 mb-2">Services</h6>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th style={{ width: "80%" }}>Service</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.services || []).map((service, idx) => (
              <tr key={idx}>
                <td>{service}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeService(idx)}>
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <Row className="g-2">
                  <Col>
                    <Form.Control
                      placeholder="New service"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                    />
                  </Col>
                  <Col sm="auto">
                    <Button variant="outline-primary" onClick={addService}>
                      ➕ Add Service
                    </Button>
                  </Col>
                </Row>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={onResetDefault}
            disabled={resetting || !templateId || !userId}
            title="Reset to template defaults"
          >
            {resetting ? "Resetting…" : "↺ Reset to Defaults"}
          </Button>

          <Button onClick={onSave} disabled={saving || !templateId || !userId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          delay={2200}
          autohide
          bg={toast.variant === "danger" ? "danger" : "success"}
        >
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

AppointmentEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AppointmentEditorPage;
