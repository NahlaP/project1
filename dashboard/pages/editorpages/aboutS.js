

// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\aboutS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Table,
  Toast, ToastContainer, Alert, Badge
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";
import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ------------------------------------------------------------------
   TEMPLATE PROFILES — with DEFAULTS
-------------------------------------------------------------------*/
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: true,
        description: true,
        highlight: true,
        imageUrl: false, // text-only preview in dashboard for SIR
        imageAlt: false,
        services: true,  // 3 tiles shown inline
        bullets: false,
      },
      defaults: {
        subtitle: "- About Us",
        title: "Crafting brands with emotion & clarity",
        lines: [
          "Design that feels human.",
          "Systems that scale gracefully.",
          "Identity with a point of view.",
        ],
        description:
          "We help ambitious teams shape meaningful brands and digital experiences. From identity to product, we obsess over clarity, craft and performance.",
        highlight: "Focused on strategy, craft and performance.",
        services: [
          { tag: "News",   heading: "Design that sparks emotion", href: "" },
          { tag: "Brand",  heading: "Shaping brands with clarity", href: "" },
          { tag: "Studio", heading: "From idea to identity",       href: "" },
        ],
        bullets: [],
        imageUrl: "", imageAlt: "",
      },
    },
  },
  "gym-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: false,
        description: true,
        highlight: true,
        imageUrl: true,
        imageAlt: true,
        services: false,
        bullets: true,
      },
      defaults: {
        subtitle: "- About Gym",
        title: "Stronger every day",
        description:
          "Train smart. Recover well. Perform better. Our coaches and programs help you reach your goals with sustainable progress.",
        highlight: "Train smart. Live strong.",
        bullets: [
          { text: "Personalized training plans" },
          { text: "Nutrition guidance" },
          { text: "Community & accountability" },
        ],
        imageUrl: "/images/about-gym.jpg",
        imageAlt: "Training session",
        lines: [],
        services: [],
      },
    },
  },
};

/* ------- fallback shapes (used only if templateId unknown yet) ------- */
const ALL_ABOUT_FIELDS = {
  subtitle: true, title: true, lines: true, description: true, highlight: true,
  imageUrl: true, imageAlt: true, services: true, bullets: true,
};
const VERY_SAFE_DEFAULTS = {
  subtitle: "- About Us", title: "ABOUT TITLE…", lines: [],
  description: "Description…", highlight: "HIGHLIGHT TEXT…",
  services: [{ tag: "", heading: "", href: "" }, { tag: "", heading: "", href: "" }, { tag: "", heading: "", href: "" }],
  bullets: [], imageUrl: "", imageAlt: "",
};

/* ----------------------------- HELPERS ------------------------------ */
const API = backendBaseUrl || "";
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return `${backendBaseUrl}${u}`;
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

const getAllowed = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.about?.fields || ALL_ABOUT_FIELDS;

const getDefaults = (templateId) =>
  TEMPLATE_PROFILES?.[templateId]?.about?.defaults || VERY_SAFE_DEFAULTS;

const pickOnlyAllowed = (obj, allowedMap) => {
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (allowedMap[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/* ============================= PAGE ============================== */
function AboutEditorPage() {
  // 🔗 single source of truth for user + template
  const { userId, templateId } = useIonContext();

  const allowed = useMemo(() => getAllowed(templateId), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId), [templateId]);

  const [about, setAbout] = useState(defaults);

  // local draft image
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const lastObjUrlRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // API URLs when both IDs exist
  const aboutBaseUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  const aboutUploadUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/image`;
  }, [userId, templateId]);

  const aboutResetUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${API}/api/about/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/reset`;
  }, [userId, templateId]);

  /* -------- Load current About: MERGE defaults + server ---------- */
  useEffect(() => {
    if (!aboutBaseUrl) return;
    (async () => {
      try {
        setErrorMsg("");
        const res = await fetch(`${aboutBaseUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json().catch(() => ({}));

        const safeFromServer = pickOnlyAllowed(
          {
            ...data,
            services: (data?.services || []).map((s) => ({
              tag: s?.tag || "",
              heading: s?.heading ?? s?.title ?? "",
              href: s?.href || "",
            })),
          },
          allowed
        );

        let normalized = { ...defaults, ...safeFromServer };
        if (allowed.services) {
          const sv = Array.isArray(normalized.services) ? normalized.services : [];
          normalized.services = [
            sv[0] || { tag: "", heading: "", href: "" },
            sv[1] || { tag: "", heading: "", href: "" },
            sv[2] || { tag: "", heading: "", href: "" },
          ];
        }
        normalized.lines = Array.isArray(normalized.lines) ? normalized.lines.slice(0, 3) : [];
        normalized.bullets = Array.isArray(normalized.bullets) ? normalized.bullets : [];

        setAbout(normalized);
      } catch (err) {
        console.error("❌ Failed to load About", err);
        setAbout(defaults);
        setErrorMsg("Failed to load About section.");
      }
    })();
  }, [aboutBaseUrl, allowed, defaults]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      try { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    };
  }, []);

  // editors
  const handleChange = (key, value) => setAbout((prev) => ({ ...prev, [key]: value }));
  const setField = (k) => (e) => handleChange(k, e.target.value);

  const setLine = (i, v) =>
    setAbout((p) => {
      const lines = Array.isArray(p.lines) ? [...p.lines] : [];
      lines[i] = v;
      return { ...p, lines };
    });

  const setService = (i, key, v) =>
    setAbout((p) => {
      const arr = Array.isArray(p.services) ? [...p.services] : [{}, {}, {}];
      if (!arr[i]) arr[i] = { tag: "", heading: "", href: "" };
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, services: arr };
    });

  const handleBulletChange = (idx, value) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    if (!updated[idx]) updated[idx] = { text: "" };
    updated[idx].text = value;
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  const addBullet = () =>
    setAbout((p) => ({ ...p, bullets: [...(Array.isArray(p.bullets) ? p.bullets : []), { text: "" }] }));

  const removeBullet = (idx) => {
    const updated = Array.isArray(about.bullets) ? [...about.bullets] : [];
    updated.splice(idx, 1);
    setAbout((p) => ({ ...p, bullets: updated }));
  };

  // file pick (local preview)
  const onPickLocal = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Image must be ≤ 10 MB"); e.target.value = ""; return; }
    const objUrl = URL.createObjectURL(file);
    try { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    lastObjUrlRef.current = objUrl;
    setDraftFile(file);
    setDraftPreview(objUrl);
  };

  const uploadDraftIfNeeded = async () => {
    if (!draftFile || !aboutUploadUrl || !allowed.imageUrl) return null;
    const form = new FormData();
    form.append("image", draftFile);
    const res = await fetch(`${aboutUploadUrl}?_=${Date.now()}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    const data = await res.json().catch(() => ({}));
    return data?.key || data?.imageKey || null; // relative key for PUT
  };

  const clearDraft = () => {
    setDraftFile(null);
    try { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); } catch {}
    lastObjUrlRef.current = null;
    setDraftPreview("");
  };

  const refetchIntoState = async () => {
    const fresh = await fetch(`${aboutBaseUrl}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    const freshData = await fresh.json().catch(() => ({}));

    const safeFresh = pickOnlyAllowed(
      {
        ...freshData,
        services: (freshData?.services || []).map((s) => ({
          tag: s?.tag || "", heading: s?.heading ?? s?.title ?? "", href: s?.href || "",
        })),
      },
      allowed
    );

    let normalized = { ...defaults, ...safeFresh };
    if (allowed.services) {
      const sv = Array.isArray(normalized.services) ? normalized.services : [];
      normalized.services = [
        sv[0] || { tag: "", heading: "", href: "" },
        sv[1] || { tag: "", heading: "", href: "" },
        sv[2] || { tag: "", heading: "", href: "" },
      ];
    }
    normalized.lines = Array.isArray(normalized.lines) ? normalized.lines.slice(0, 3) : [];
    normalized.bullets = Array.isArray(normalized.bullets) ? normalized.bullets : [];

    setAbout(normalized);
  };

  const handleSave = async () => {
    if (!aboutBaseUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const newRelKey = await uploadDraftIfNeeded();

      const payload = {
        title: about.title || "",
        subtitle: about.subtitle || "",
        description: about.description || "",
        highlight: about.highlight || "",
        imageAlt: about.imageAlt || "",
        lines: Array.isArray(about.lines) ? about.lines.slice(0, 3) : [],
        services: Array.isArray(about.services)
          ? about.services.slice(0, 3).map((s) => ({
              tag: s?.tag || "", heading: s?.heading || "", href: s?.href || "",
            }))
          : [],
        bullets: Array.isArray(about.bullets) ? about.bullets : [],
        imageUrl: newRelKey ? newRelKey : about.imageUrl || "",
      };

      const safePayload = pickOnlyAllowed(payload, allowed);

      const res = await fetch(`${aboutBaseUrl}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Save failed");

      await refetchIntoState();
      clearDraft();
      setShowToast(true);
    } catch (err) {
      setErrorMsg(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!aboutResetUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const r = await fetch(`${aboutResetUrl}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || data?.message || "Reset failed");

      await refetchIntoState();
      clearDraft();
      setShowToast(true);
    } catch (err) {
      setErrorMsg(err?.message || "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  // Preview image (gym only; sir has no image in dashboard)
  const safeImagePreview = useMemo(
    () => draftPreview || toAbs(about?.imageUrl) || `${backendBaseUrl}/img/about.jpg`,
    [draftPreview, about?.imageUrl]
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">ℹ️ About Section</h4>
            <BackBar />
          </div>

          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">
                allowed: {Object.keys(allowed).filter((k) => allowed[k]).join(", ")}
              </Badge>
            </div>
            {aboutBaseUrl && (
              <div className="text-muted" title={aboutBaseUrl}>
                <code>/api/about/{userId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
      ) : null}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card className="p-4">
            <div className="row g-5">
              <div className="col-lg-6">
                {allowed.imageUrl ? (
                  <img
                    src={safeImagePreview}
                    alt={about.imageAlt || "About Image"}
                    className="img-fluid"
                    style={{ maxHeight: 350, objectFit: "cover", width: "100%", borderRadius: 8 }}
                  />
                ) : (
                  <div className="text-muted">This template shows text content only here.</div>
                )}
              </div>

              <div className="col-lg-6">
                {allowed.subtitle && (
                  <small className="text-muted d-block mb-1">{about.subtitle || "- About Us"}</small>
                )}
                <h1 className="display-6 text-uppercase mb-2">{about.title || "About title..."}</h1>

                {allowed.lines && (
                  <div className="mb-3">
                    {(about.lines || []).slice(0, 3).map((ln, i) => (
                      <div key={i} className="opacity-75">{ln}</div>
                    ))}
                  </div>
                )}

                <p className="mb-4">{about.description || "Description..."}</p>

                {allowed.services && (
                  <div className="row g-3 mb-4">
                    {(about.services || []).map((s, i) => (
                      <div key={i} className="col-sm-6">
                        <div className="p-3 border rounded h-100">
                          <div className="small opacity-75">{s?.tag || "Tag"}</div>
                          <div className="fw-semibold">{s?.heading || "Heading"}</div>
                          {s?.href ? <a href={s.href} target="_blank" rel="noreferrer">View Details →</a>
                                   : <span className="text-muted">No link</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-5 border-primary p-3 text-center mt-2">
                  <h5 className="lh-base text-uppercase mb-0">{about.highlight || "Highlight text..."}</h5>
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
              <Form.Control value={about.title || ""} onChange={setField("title")} />
            </Form.Group>
          </Col>

          {allowed.imageUrl && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>Image (choose – preview only)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
                <Form.Text>Upload happens on Save.</Form.Text>
              </Form.Group>
            </Col>
          )}
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Subtitle</Form.Label>
              {allowed.subtitle
                ? <Form.Control value={about.subtitle || ""} onChange={setField("subtitle")} />
                : <Form.Control disabled placeholder="Not used by this template" />}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Image ALT</Form.Label>
              {allowed.imageAlt
                ? <Form.Control value={about.imageAlt || ""} onChange={setField("imageAlt")} />
                : <Form.Control disabled placeholder="Not used by this template" />}
            </Form.Group>
          </Col>
        </Row>

        {allowed.lines && (
          <Row className="mb-3">
            <Col>
              <Form.Label>Animated Lines (max 3)</Form.Label>
              <Row className="g-2">
                {[0, 1, 2].map((i) => (
                  <Col md={4} key={i}>
                    <Form.Control
                      placeholder={`Line ${i + 1}`}
                      value={about.lines?.[i] || ""}
                      onChange={(e) => setLine(i, e.target.value)}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={about.description || ""}
                onChange={setField("description")}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Highlight (bottom bordered text)</Form.Label>
              <Form.Control value={about.highlight || ""} onChange={setField("highlight")} />
            </Form.Group>
          </Col>
        </Row>

        {allowed.services && (
          <div className="mb-4">
            <h6 className="fw-bold">Inline Services (3 items)</h6>
            <Row className="g-3">
              {[0, 1, 2].map((i) => (
                <Col md={4} key={i}>
                  <Card className="p-3 h-100">
                    <div className="mb-2 text-muted">Item #{i + 1}</div>
                    <Form.Group className="mb-2">
                      <Form.Label>Tag</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.tag || ""}
                        onChange={(e) => setService(i, "tag", e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Heading</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.heading || ""}
                        onChange={(e) => setService(i, "heading", e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Link (href)</Form.Label>
                      <Form.Control
                        value={about.services?.[i]?.href || ""}
                        onChange={(e) => setService(i, "href", e.target.value)}
                      />
                    </Form.Group>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {allowed.bullets && (
          <>
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
                      <Button variant="outline-danger" size="sm" onClick={() => removeBullet(idx)}>
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
          </>
        )}

        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={handleReset} disabled={saving || !templateId || !userId}>
            {saving ? "Resetting…" : "↩ Reset to Default"}
          </Button>

          <Button onClick={handleSave} disabled={saving || !templateId || !userId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>
      </Card>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

AboutEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default AboutEditorPage;
