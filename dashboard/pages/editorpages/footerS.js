


// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\footerS.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Alert,
  Toast, ToastContainer, Badge
} from "react-bootstrap";
import { useRouter } from "next/router";

import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ---------------------- Per-template fields + defaults ---------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    footer: {
      fields: {
        topSubtitle: true,
        emailLabel: true,
        emailHref: true,
        logoUrl: true,
        social: true,            // [{label, href}] x4
        officeAddress: true,
        officePhone: true,
        officePhoneHref: true,
        links: true,             // [{label, href}] x3
        copyrightHtml: true,
      },
      defaults: {
        topSubtitle: "we would love to hear from you.",
        emailLabel: "hello@Bayone.com",
        emailHref: "mailto:hello@Bayone.com",
        logoUrl: "assets/imgs/logo-light.png",
        social: [
          { label: "Facebook", href: "" },
          { label: "Twitter", href: "" },
          { label: "LinkedIn", href: "" },
          { label: "Behance", href: "" },
        ],
        officeAddress: "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
        officePhone: "+2 456 34324 45",
        officePhoneHref: "tel:+24563432445",
        links: [
          { label: "FAQ", href: "about.html" },
          { label: "Careers", href: "about.html" },
          { label: "Contact Us", href: "contact.html" },
        ],
        copyrightHtml:
          '© 2023 Bayone is Proudly Powered by <span class="underline"><a href="https://themeforest.net/user/ui-themez" target="_blank">Ui-ThemeZ</a></span>',
      },
    },
  },
  "gym-template-1": {
    footer: {
      fields: {
        topSubtitle: true,
        emailLabel: true,
        emailHref: true,
        logoUrl: true,
        social: true,
        officeAddress: true,
        officePhone: true,
        officePhoneHref: true,
        links: true,
        copyrightHtml: true,
      },
      defaults: {
        topSubtitle: "train with us — get in touch.",
        emailLabel: "contact@gympro.com",
        emailHref: "mailto:contact@gympro.com",
        logoUrl: "assets/imgs/logo-gym-light.png",
        social: [
          { label: "Instagram", href: "" },
          { label: "YouTube", href: "" },
          { label: "Facebook", href: "" },
          { label: "X (Twitter)", href: "" },
        ],
        officeAddress: "Downtown Fitness Mall, 2nd Floor, Dubai",
        officePhone: "+971 55 123 4567",
        officePhoneHref: "tel:+971551234567",
        links: [
          { label: "Membership", href: "membership.html" },
          { label: "Trainers", href: "trainers.html" },
          { label: "Contact", href: "contact.html" },
        ],
        copyrightHtml:
          "© 2025 GymPro — All rights reserved.",
      },
    },
  },
};

const API = backendBaseUrl || "";

/* ----------------------------- helpers ----------------------------- */
const withHttp = (u) => (!u || /^https?:\/\//i.test(u) ? u : `https://${u}`);

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

const getAllowed = (templateId, section) =>
  (TEMPLATE_PROFILES?.[templateId]?.[section]?.fields) || {};

const getDefaults = (templateId, section) =>
  (TEMPLATE_PROFILES?.[templateId]?.[section]?.defaults) || {};

const pickAllowed = (obj, allowedMap) => {
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (!allowedMap[k]) return;
    if (obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/** Ensure shapes (4 socials, 3 links) + fallback mailto/tel each time we load/patch local state. */
const normalizeFooter = (x, defaults) => {
  const base = { ...(defaults || {}), ...(x || {}) };

  const socialSrc = Array.isArray(base.social) ? base.social : [];
  base.social = Array.from({ length: 4 }, (_, i) => ({
    label: socialSrc[i]?.label ?? (defaults?.social?.[i]?.label || ""),
    href: socialSrc[i]?.href ?? (defaults?.social?.[i]?.href || ""),
  }));

  const linksSrc = Array.isArray(base.links) ? base.links : [];
  base.links = Array.from({ length: 3 }, (_, i) => ({
    label: linksSrc[i]?.label ?? (defaults?.links?.[i]?.label || ""),
    href: linksSrc[i]?.href ?? (defaults?.links?.[i]?.href || ""),
  }));

  base.emailHref =
    base.emailHref || (base.emailLabel ? `mailto:${base.emailLabel}` : defaults?.emailHref);

  base.officePhoneHref =
    base.officePhoneHref ||
    (base.officePhone ? `tel:${String(base.officePhone).replace(/\s+/g, "")}` : defaults?.officePhoneHref);

  return base;
};

/* ----------------------------- Preview tile ----------------------------- */
function FooterPreview({ data }) {
  return (
    <div
      className="shadow-sm"
      style={{
        width: 896,
        height: 290,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #EEF1F4",
        background: "#0b0b0b",
        color: "#fff",
      }}
    >
      <div className="d-flex" style={{ width: "100%", height: "100%" }}>
        {/* LEFT */}
        <div className="d-flex flex-column justify-content-center px-4 py-3" style={{ width: "50%" }}>
          <div className="text-uppercase opacity-75 small text-truncate">
            {data.topSubtitle || ""}
          </div>
          <h4 className="mt-1 mb-2" style={{ lineHeight: 1.2, wordBreak: "break-word" }}>
            <a
              href={data.emailHref || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{ color: "#fff" }}
              title={data.emailLabel || ""}
            >
              {data.emailLabel || ""}
            </a>
          </h4>
          <div className="d-flex gap-3 small flex-wrap">
            {(data.links || []).slice(0, 3).map((l, i) => (
              <a
                key={i}
                href={l.href || "#"}
                className="text-decoration-none"
                style={{ color: "#ddd" }}
                title={l.label || "-"}
              >
                {l.label || "-"}
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="d-flex flex-column px-4 py-3" style={{ width: "50%", height: "100%", overflowY: "auto", background: "#0e0e0e" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <img src={data.logoUrl || ""} alt="logo" style={{ height: 28 }} />
            <div className="small opacity-75">Follow & Contact</div>
          </div>

          <div className="mb-2">
            <div className="text-uppercase opacity-75 small mb-1">Social</div>
            <div className="d-flex flex-wrap gap-3 small">
              {(data.social || []).slice(0, 4).map((s, i) => (
                <a
                  key={i}
                  href={withHttp(s.href) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                  style={{ color: "#ddd" }}
                  title={s.label || "-"}
                >
                  {s.label || "-"}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-auto small">
            <div className="text-uppercase opacity-75 mb-1">Our Office</div>
            <div
              className="opacity-90"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={data.officeAddress || "-"}
            >
              {data.officeAddress || "-"}
            </div>
            <div className="mt-1">
              <a
                href={data.officePhoneHref || "#"}
                className="text-decoration-none"
                style={{ color: "#fff" }}
                title={data.officePhone || "-"}
              >
                {data.officePhone || "-"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Page (Hero-style) ----------------------------- */
function FooterEditorPage() {
  const router = useRouter();
  const { userId, templateId } = useIonContext();         // ✅ same as hero

  const allowed = useMemo(() => getAllowed(templateId, "footer"), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId, "footer"), [templateId]);

  const pageId = typeof router.query.pageId === "string" ? router.query.pageId : "";
  const sectionId = typeof router.query.sectionId === "string" ? router.query.sectionId : "";

  const [doc, setDoc] = useState(normalizeFooter({}, defaults));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  // Build endpoints once IDs exist
  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/footer/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return {
      GET_URL: base,
      PUT_URL: base,
      RESET: `${base}/reset`,
    };
  }, [userId, templateId]);

  // When template changes, apply that template's defaults locally (like Hero)
  useEffect(() => {
    setDoc((p) => normalizeFooter(p, defaults));
    setError("");
  }, [defaults, templateId]);

  // Load from server (respect allowed fields, normalize)
  const loadFooter = async () => {
    if (!endpoints) return;
    setError("");
    const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const server = await res.json();
    const safeFromServer = normalizeFooter(pickAllowed(server, allowed), defaults);
    setDoc(safeFromServer);
  };

  useEffect(() => {
    if (!endpoints) return;
    loadFooter().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, allowed]);

  // Save (filter to allowed)
  const onSave = async () => {
    if (!endpoints) return;
    setSaving(true);
    setError("");
    try {
      const payload = pickAllowed(doc, allowed);
      const res = await fetch(`${endpoints.PUT_URL}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await readErr(res));
      await loadFooter();
      setToast(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  // Reset → backend seeded defaults (like Hero’s onResetDefault)
  const onResetDefault = async () => {
    if (!endpoints) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));
      await loadFooter();        // 🔁 pull the seeded doc
      setToast(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  // Field helpers
  const setField = (k) => (e) =>
    setDoc((p) => normalizeFooter({ ...p, [k]: e?.target?.value ?? e }, defaults));

  const setSocial = (i, key) => (e) =>
    setDoc((p) => {
      const list = Array.isArray(p.social) ? [...p.social] : [];
      list[i] = { ...(list[i] || {}), [key]: e?.target?.value ?? e };
      return normalizeFooter({ ...p, social: list }, defaults);
    });

  const setLink = (i, key) => (e) =>
    setDoc((p) => {
      const list = Array.isArray(p.links) ? [...p.links] : [];
      list[i] = { ...(list[i] || {}), [key]: e?.target?.value ?? e };
      return normalizeFooter({ ...p, links: list }, defaults);
    });

  const isSir = useMemo(() => templateId === "sir-template-1", [templateId]);
  const isGym = useMemo(() => templateId === "gym-template-1", [templateId]);

  const goBack = () => {
    const q = new URLSearchParams({ templateId: templateId || "" });
    if (pageId) router.push(`/editorpages/page/${pageId}?${q.toString()}`);
    else router.back();
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center">
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🦶 Footer</h4>
            <BackBar onBack={goBack} />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">{isSir ? "SIR" : isGym ? "GYM" : "Custom"}</Badge>
            </div>
            <div className="text-muted">
              endpoint: <code>/api/footer/{userId}/{templateId}</code>
            </div>
          </div>
        </Col>
      </Row>

      {(!userId || !templateId) && (
        <Alert variant="secondary" className="mt-3">Resolving user/template…</Alert>
      )}
      {error && <Alert variant="danger" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      <div className="my-3 d-flex justify-content-center">
        <FooterPreview data={doc} />
      </div>

      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Edit</h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={onResetDefault}
              disabled={saving || !templateId}
              title="Reset to template defaults"
            >
              {saving ? "Resetting…" : "↩ Reset to Default"}
            </Button>
            <Button variant="primary" onClick={onSave} disabled={saving || !templateId}>
              {saving ? "Saving…" : "💾 Save"}
            </Button>
          </div>
        </div>

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Top Subtitle</Form.Label>
              <Form.Control
                value={doc.topSubtitle || ""}
                onChange={setField("topSubtitle")}
                placeholder="we would love to hear from you."
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Email Label</Form.Label>
              <Form.Control
                value={doc.emailLabel || ""}
                onChange={setField("emailLabel")}
                placeholder="hello@Bayone.com"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Email Href</Form.Label>
              <Form.Control
                value={doc.emailHref || ""}
                onChange={setField("emailHref")}
                placeholder="mailto:hello@Bayone.com"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Logo URL</Form.Label>
              <Form.Control
                value={doc.logoUrl || ""}
                onChange={setField("logoUrl")}
                placeholder="assets/imgs/logo-light.png"
              />
            </Form.Group>
          </Col>

          <Col xs={12}><hr /></Col>

          <Col xs={12}><h6 className="text-uppercase">Social</h6></Col>
          {(doc.social || []).map((_, i) => (
            <Col md={6} key={`social-${i}`}>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Label</Form.Label>
                    <Form.Control
                      value={doc.social?.[i]?.label || ""}
                      onChange={setSocial(i, "label")}
                      placeholder={`Social ${i + 1}`}
                    />
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group>
                    <Form.Label>URL</Form.Label>
                    <Form.Control
                      value={doc.social?.[i]?.href || ""}
                      onChange={setSocial(i, "href")}
                      placeholder="https://…"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          ))}

          <Col xs={12}><hr /></Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control
                value={doc.officeAddress || ""}
                onChange={setField("officeAddress")}
                placeholder="Street, City"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Office Phone (display)</Form.Label>
              <Form.Control
                value={doc.officePhone || ""}
                onChange={setField("officePhone")}
                placeholder="+971 55 123 4567"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Office Phone (href)</Form.Label>
              <Form.Control
                value={doc.officePhoneHref || ""}
                onChange={setField("officePhoneHref")}
                placeholder="tel:+971551234567"
              />
            </Form.Group>
          </Col>

          <Col xs={12}><hr /></Col>

          <Col xs={12}><h6 className="text-uppercase">Footer Links</h6></Col>
          {(doc.links || []).map((_, i) => (
            <Col md={6} key={`link-${i}`}>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Label</Form.Label>
                    <Form.Control
                      value={doc.links?.[i]?.label || ""}
                      onChange={setLink(i, "label")}
                      placeholder={`Link ${i + 1}`}
                    />
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group>
                    <Form.Label>Href</Form.Label>
                    <Form.Control
                      value={doc.links?.[i]?.href || ""}
                      onChange={setLink(i, "href")}
                      placeholder="about.html / https://…"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          ))}

          <Col xs={12}><hr /></Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Copyright (HTML allowed)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={doc.copyrightHtml || ""}
                onChange={setField("copyrightHtml")}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setToast(false)} show={toast} delay={2000} autohide>
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

FooterEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default FooterEditorPage;
