// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\footerS.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Toast, ToastContainer, Badge } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/* ---------------- Resolve templateId (URL → backend → default) ---------------- */
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) { if (!off) setTid(fromUrl.trim()); return; }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) { setTid(t); return; }
      } catch {}
      if (!off) setTid(defaultTemplateId || "sir-template-1");
    })();
    return () => { off = true; };
  }, [router.query.templateId, userId]);

  return tid;
}

/* ---------------- Defaults + helpers ---------------- */
const DEFAULTS = {
  topSubtitle: "we would love to hear from you.",
  emailLabel: "hello@Bayone.com",
  emailHref: "mailto:hello@Bayone.com",
  logoUrl: "assets/imgs/logo-light.png",
  social: [
    { label: "Facebook", href: "" },
    { label: "twitter", href: "" },
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
};

const norm = (x) => {
  const d = { ...DEFAULTS, ...(x || {}) };
  d.social = Array.isArray(d.social) && d.social.length ? d.social : DEFAULTS.social.slice();
  d.links  = Array.isArray(d.links)  && d.links.length  ? d.links  : DEFAULTS.links.slice();
  // ensure lengths so UI is stable
  if (d.social.length < 4) d.social = [...d.social, ...DEFAULTS.social.slice(d.social.length)];
  if (d.links.length  < 3) d.links  = [...d.links,  ...DEFAULTS.links.slice(d.links.length)];
  return d;
};

const withHttp = (u) => (!u || /^https?:\/\//i.test(u) ? u : `https://${u}`);

/* ---------------- Preview (inline, small) ---------------- */
function FooterPreview({ data }) {
  return (
    <div className="shadow-sm" style={{ width: 896, borderRadius: 16, overflow: "hidden", background: "#0b0b0b", color: "#fff" }}>
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-6">
            <div>
              <div className="text-uppercase opacity-75 small">{data.topSubtitle || DEFAULTS.topSubtitle}</div>
              <h4 className="mt-1 underline">
                <a href={data.emailHref || `mailto:${data.emailLabel || "hello@Bayone.com"}`} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
                  {data.emailLabel || DEFAULTS.emailLabel}
                </a>
              </h4>
            </div>
          </div>
        </div>

        <div className="row mt-4 align-items-start">
          <div className="col-lg-3">
            <div className="d-flex align-items-center gap-2">
              <img src={data.logoUrl || DEFAULTS.logoUrl} alt="logo" style={{ height: 32 }} />
            </div>
          </div>

          <div className="col-lg-6">
            <h6 className="text-uppercase opacity-75 mb-2">Social Media</h6>
            <div className="d-flex flex-wrap gap-3 small">
              {(data.social || []).slice(0, 4).map((s, i) => (
                <a key={i} href={withHttp(s.href) || "#"} target="_blank" rel="noreferrer" className="text-decoration-none" style={{ color: "#ddd" }}>
                  {s.label || "-"}
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-3">
            <h6 className="text-uppercase opacity-75 mb-2">Our Office :</h6>
            <div className="small">{data.officeAddress || "-"}</div>
            <div className="mt-2">
              <a href={data.officePhoneHref || "#"} className="text-decoration-none" style={{ color: "#fff" }}>
                {data.officePhone || "-"}
              </a>
            </div>
          </div>
        </div>

        <div className="row mt-4 pt-3 border-top border-secondary">
          <div className="col-lg-6">
            <div className="d-flex gap-3 small">
              {(data.links || []).slice(0, 3).map((l, i) => (
                <a key={i} href={l.href || "#"} className="text-decoration-none" style={{ color: "#ddd" }}>
                  {l.label || "-"}
                </a>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="small text-end" dangerouslySetInnerHTML={{ __html: data.copyrightHtml || DEFAULTS.copyrightHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function FooterEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [doc, setDoc] = useState(norm({}));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState("");

  /* Load */
  useEffect(() => {
    if (!templateId) return;
    let off = false;
    (async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/footer/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!off) { setDoc(norm(json)); setError(""); }
      } catch (e) {
        if (!off) { setDoc(norm({})); setError("Failed to load footer."); console.error("footer load", e); }
      }
    })();
    return () => { off = true; };
  }, [userId, templateId]);

  /* Save */
  const onSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/footer/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Save failed");
      setToast(true);
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* Field helpers */
  const setField = (k) => (e) => setDoc((p) => ({ ...p, [k]: e?.target?.value ?? e }));
  const setSocial = (i, key) => (e) =>
    setDoc((p) => {
      const list = [...(p.social || [])];
      list[i] = { ...(list[i] || {}), [key]: e?.target?.value ?? e };
      return { ...p, social: list };
    });
  const setLink = (i, key) => (e) =>
    setDoc((p) => {
      const list = [...(p.links || [])];
      list[i] = { ...(list[i] || {}), [key]: e?.target?.value ?? e };
      return { ...p, links: list };
    });

  const isSir = useMemo(() => templateId === "sir-template-1", [templateId]);
  const isGym = useMemo(() => templateId === "gym-template-1", [templateId]);

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center">
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🦶 Footer</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">{isSir ? "SIR" : isGym ? "GYM" : "Custom"}</Badge>
            </div>
            <div className="text-muted">endpoint: <code>/api/footer/{defaultUserId}/{templateId}</code></div>
          </div>
        </Col>
      </Row>

      <div className="my-3 d-flex justify-content-center">
        <FooterPreview data={doc} />
      </div>

      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Edit</h5>
          <Button variant="primary" onClick={onSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Top Subtitle</Form.Label>
              <Form.Control value={doc.topSubtitle || ""} onChange={setField("topSubtitle")} placeholder="we would love to hear from you." />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Email Label</Form.Label>
              <Form.Control value={doc.emailLabel || ""} onChange={setField("emailLabel")} placeholder="hello@Bayone.com" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Email Href</Form.Label>
              <Form.Control value={doc.emailHref || ""} onChange={setField("emailHref")} placeholder="mailto:hello@Bayone.com" />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Logo URL</Form.Label>
              <Form.Control value={doc.logoUrl || ""} onChange={setField("logoUrl")} placeholder="assets/imgs/logo-light.png" />
            </Form.Group>
          </Col>

          <Col xs={12}><hr /></Col>

          <Col xs={12}><h6 className="text-uppercase">Social</h6></Col>
          {["Facebook", "twitter", "LinkedIn", "Behance"].map((label, i) => (
            <Col md={6} key={label}>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Label</Form.Label>
                    <Form.Control value={doc.social?.[i]?.label || ""} onChange={setSocial(i, "label")} placeholder={label} />
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group>
                    <Form.Label>URL</Form.Label>
                    <Form.Control value={doc.social?.[i]?.href || ""} onChange={setSocial(i, "href")} placeholder="https://…" />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          ))}

          <Col xs={12}><hr /></Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Office Address</Form.Label>
              <Form.Control value={doc.officeAddress || ""} onChange={setField("officeAddress")} placeholder="Street, City" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Office Phone (display)</Form.Label>
              <Form.Control value={doc.officePhone || ""} onChange={setField("officePhone")} placeholder="+2 456 34324 45" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Office Phone (href)</Form.Label>
              <Form.Control value={doc.officePhoneHref || ""} onChange={setField("officePhoneHref")} placeholder="tel:+24563432445" />
            </Form.Group>
          </Col>

          <Col xs={12}><hr /></Col>

          <Col xs={12}><h6 className="text-uppercase">Footer Links</h6></Col>
          {[0,1,2].map((i) => (
            <Col md={6} key={i}>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Label</Form.Label>
                    <Form.Control value={doc.links?.[i]?.label || ""} onChange={setLink(i, "label")} placeholder={`Link ${i+1}`} />
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group>
                    <Form.Label>Href</Form.Label>
                    <Form.Control value={doc.links?.[i]?.href || ""} onChange={setLink(i, "href")} placeholder="about.html / https://…" />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          ))}

          <Col xs={12}><hr /></Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label>Copyright (HTML allowed)</Form.Label>
              <Form.Control as="textarea" rows={3} value={doc.copyrightHtml || ""} onChange={setField("copyrightHtml")} />
            </Form.Group>
          </Col>
        </Row>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setToast(false)} show={toast} delay={1800} autohide>
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

FooterEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default FooterEditorPage;
