
// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table,
  Toast, ToastContainer,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* -------------------------------------------------------------------------- */
/* Per-template field matrix + defaults (mirror Hero pattern)                 */
/* -------------------------------------------------------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    whychoose: {
      fields: {
        description: true,
        stats: true,          // [{ label, value }]
        progressBars: true,   // [{ label, percent }]
        bgOverlay: true,      // 0..1
        bgImageKey: true,
        bgImageUrl: true,     // read-only convenience
      },
      defaults: {
        description: "We bring experience, speed, and a results-first mindset.",
        stats: [
          { label: "Happy Clients", value: 120 },
          { label: "Projects Done", value: 240 },
        ],
        progressBars: [
          { label: "Design", percent: 90 },
          { label: "Development", percent: 85 },
          { label: "Branding", percent: 80 },
        ],
        bgOverlay: 0.5,
        bgImageKey: "",
        bgImageUrl: "",
      },
    },
  },
  "gym-template-1": {
    whychoose: {
      fields: {
        description: true,
        stats: true,
        progressBars: true,
        bgOverlay: true,
        bgImageKey: true,
        bgImageUrl: true,
      },
      defaults: {
        description: "Certified coaches. Measurable progress. Community that pushes you.",
        stats: [
          { label: "Clients", value: 300 },
          { label: "Transformations", value: 180 },
        ],
        progressBars: [
          { label: "Strength", percent: 92 },
          { label: "Mobility", percent: 78 },
          { label: "Endurance", percent: 88 },
        ],
        bgOverlay: 0.45,
        bgImageKey: "",
        bgImageUrl: "",
      },
    },
  },
};

const API = backendBaseUrl || "";
const ABS_S3 = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));

const bust = (url) => (!url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`);

const clamp = (n, lo, hi) => {
  const x = Number.isFinite(+n) ? +n : 0;
  return Math.min(hi, Math.max(lo, x));
};

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

const getAllowed = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.whychoose?.fields || {};

const getDefaults = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.whychoose?.defaults || {};

const pickAllowed = (obj, allowedMap) => {
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (allowedMap[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/* ---------------------------------- page ---------------------------------- */
function WhyChooseEditorPage() {
  // 🔗 unify userId/templateId with the same hook you use in Hero
  const { userId, templateId } = useIonContext();

  const allowed = useMemo(() => getAllowed(templateId), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId), [templateId]);

  const [state, setState] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgOverlay: 0.5,
    bgImageKey: "",
    bgImageUrl: "",
    displayUrl: "", // derived (for preview)
  });

  const [draftFile, setDraftFile] = useState(null);
  const [draftPreviewUrl, setDraftPreviewUrl] = useState("");
  const lastObjUrlRef = useRef("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Build endpoints ONLY when we have both IDs (mirror Hero)
  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/whychoose/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return {
      GET_URL: base,
      PUT_URL: base,
      UP_BG: `${base}/bg`,
      DEL_BG: `${base}/bg`,
      RESET: `${base}/reset`,
    };
  }, [userId, templateId]);

  /* -------------------- template change → apply defaults ------------------- */
  useEffect(() => {
    // apply per-template defaults locally (like Hero)
    const d = getDefaults(templateId);
    setState((p) => ({
      ...p,
      ...d,
      displayUrl: bust(d?.bgImageUrl || ABS_S3(d?.bgImageKey || "")),
    }));
    setDraftFile(null);
    setDraftPreviewUrl("");
    setError("");
  }, [templateId]);

  /* ---------------------------- load from server --------------------------- */
  const loadData = async () => {
    if (!endpoints?.GET_URL) return;
    setError("");
    const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const j = await res.json();

    // resolve bg url from either explicit URL or stored key
    const serverKey = typeof j?.bgImageKey === "string" ? j.bgImageKey : "";
    const serverUrl = typeof j?.bgImageUrl === "string" ? j.bgImageUrl : ABS_S3(serverKey);

    // sanitize / clamp and then filter to allowed keys
    const fullFromServer = {
      description: j?.description || "",
      stats: Array.isArray(j?.stats)
        ? j.stats.map((s) => ({ label: s?.label ?? "", value: clamp(s?.value, 0, 1e9) }))
        : [],
      progressBars: Array.isArray(j?.progressBars)
        ? j.progressBars.map((b) => ({ label: b?.label ?? "", percent: clamp(b?.percent, 0, 100) }))
        : [],
      bgOverlay: clamp(j?.bgOverlay ?? 0.5, 0, 1),
      bgImageKey: serverKey,
      bgImageUrl: serverUrl || "",
    };
    const safe = pickAllowed(fullFromServer, allowed);

    setState((prev) => ({
      ...prev,
      ...safe,
      displayUrl: bust(safe.bgImageUrl || ABS_S3(safe.bgImageKey || "")),
    }));
  };

  useEffect(() => {
    if (!endpoints?.GET_URL) return;
    loadData().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, allowed]);

  useEffect(() => {
    return () => {
      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
      }
    };
  }, []);

  /* ------------------------------ change handlers ------------------------- */
  const handleChange = (key, value) => setState((p) => ({ ...p, [key]: value }));

  const updateArray = (field, idx, key, value) => {
    const updated = [...(state[field] || [])];
    if (!updated[idx]) updated[idx] = {};
    if (field === "stats" && key === "value") {
      updated[idx][key] = clamp(value, 0, 1e9);
    } else if (field === "progressBars" && key === "percent") {
      updated[idx][key] = clamp(value, 0, 100);
    } else {
      updated[idx][key] = value;
    }
    setState((p) => ({ ...p, [field]: updated }));
  };

  const addItem = (field, item) => setState((p) => ({ ...p, [field]: [...(p[field] || []), item] }));
  const removeItem = (field, idx) => {
    const updated = [...(state[field] || [])];
    updated.splice(idx, 1);
    setState((p) => ({ ...p, [field]: updated }));
  };

  /* -------------------------- local bg (preview) -------------------------- */
  const onPickLocalBg = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); return; }
    const url = URL.createObjectURL(file);
    if (lastObjUrlRef.current) {
      try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    }
    lastObjUrlRef.current = url;
    setDraftFile(file);
    setDraftPreviewUrl(url);
    setError("");
  };

  /* --------------------------------- save --------------------------------- */
  const handleSave = async () => {
    if (!endpoints?.PUT_URL) return;
    setSaving(true); setError("");
    try {
      let keyToPersist = state.bgImageKey || "";

      // upload new bg if selected
      if (draftFile && endpoints.UP_BG) {
        const form = new FormData();
        form.append("image", draftFile);
        const up = await fetch(`${endpoints.UP_BG}?_=${Date.now()}`, {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!up.ok) throw new Error(await readErr(up));
        const uj = await up.json();
        const uploadedKey = uj?.result?.bgImageKey || uj?.bgImageKey || uj?.key || "";
        if (!uploadedKey) throw new Error("Upload succeeded but no key was returned.");
        keyToPersist = uploadedKey;
      }

      const fullPayload = {
        description: state.description,
        stats: (state.stats || []).map((s) => ({
          label: String(s.label || ""),
          value: clamp(s.value, 0, 1e9),
        })),
        progressBars: (state.progressBars || []).map((b) => ({
          label: String(b.label || ""),
          percent: clamp(b.percent, 0, 100),
        })),
        bgOverlay: clamp(state.bgOverlay ?? 0.5, 0, 1),
        bgImageKey: keyToPersist,
      };

      const safePayload = pickAllowed(fullPayload, allowed);

      const put = await fetch(`${endpoints.PUT_URL}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(safePayload),
      });
      if (!put.ok) throw new Error(await readErr(put));

      await loadData();

      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
        lastObjUrlRef.current = "";
      }
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
    if (!endpoints?.DEL_BG) return;
    if (!confirm("Remove background image?")) return;
    setError("");
    try {
      const res = await fetch(`${endpoints.DEL_BG}?_=${Date.now()}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await readErr(res));
      await res.json().catch(() => ({}));
      setState((p) => ({ ...p, bgImageKey: "", bgImageUrl: "", displayUrl: "" }));
      if (lastObjUrlRef.current) {
        try { URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
        lastObjUrlRef.current = "";
      }
      setDraftFile(null);
      setDraftPreviewUrl("");
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  /* ------------------------ Reset to Default (like Hero) ------------------- */
  const onResetDefault = async () => {
    if (!endpoints?.RESET) return;
    setResetting(true);
    setError("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));
      await loadData();             // ⬅️ pull server-seeded defaults
      setShowToast(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setResetting(false);
    }
  };

  const previewBg = draftPreviewUrl || state.displayUrl;

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🏆 Why Choose Us Section</h4>
          <BackBar />
        </Col>
      </Row>

      {(!userId || !templateId) && (
        <Alert variant="secondary" className="mt-3">Resolving user/template…</Alert>
      )}
      {error && <Alert variant="danger" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

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
                background: `rgba(0,0,0,${clamp(state.bgOverlay ?? 0.5, 0, 1)})`,
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
                {!state.stats?.length && (
                  <Col sm={12}><div className="text-white-50">No stats yet.</div></Col>
                )}
              </Row>

              <div className="border border-5 border-primary border-bottom-0 p-4">
                {(state.progressBars || []).map((bar, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white text-uppercase">{bar.label}</span>
                      <span className="text-white">{clamp(bar.percent, 0, 100)}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={clamp(bar.percent, 0, 100)}
                        style={{ width: `${clamp(bar.percent, 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!state.progressBars?.length && (
                  <div className="text-white-50">No progress bars yet.</div>
                )}
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
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickLocalBg(e.target.files?.[0] || null)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => loadData().catch((e) => setError(String(e.message || e)))}
                >
                  Refresh preview
                </Button>
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
                <strong>Stored key:</strong> {state.bgImageKey || "(none)"}{" "}
                {draftPreviewUrl && <em className="ms-2">(Draft selected – not saved yet)</em>}
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Overlay (0 – 1)</Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
                value={clamp(state.bgOverlay ?? 0.5, 0, 1)}
                onChange={(e) => handleChange("bgOverlay", clamp(parseFloat(e.target.value), 0, 1))}
              />
              <div className="text-muted small">{clamp(state.bgOverlay ?? 0.5, 0, 1)}</div>
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
            <tr><th>Label</th><th>Value</th><th style={{width:110}}>Action</th></tr>
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
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => addItem("stats", { label: "", value: 0 })}
                >
                  ➕ Add Stat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Percent</th><th style={{width:110}}>Action</th></tr>
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
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => addItem("progressBars", { label: "", percent: 0 })}
                >
                  ➕ Add Progress Bar
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={onResetDefault}
            disabled={resetting || !templateId || !userId}
            title="Reset this section to the template's server defaults"
          >
            {resetting ? "Resetting…" : "↩ Reset to Default"}
          </Button>

          <Button onClick={handleSave} disabled={saving || !templateId || !userId}>
            {saving ? "Saving…" : "💾 Save Changes"}
          </Button>
        </div>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default WhyChooseEditorPage;
