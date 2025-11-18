

// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\contactE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container, Button, Toast, ToastContainer, Alert } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl as API } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ---------------- Template Profiles (match contactS.js) ---------------- */
const CONTACT_PROFILES = {
  "sir-template-1": {
    fields: { subtitle: true, titleStrong: true, titleLight: true, buttonText: true, formAction: true },
    defaults: {
      subtitle: "- Contact Us",
      titleStrong: "Get In",
      titleLight: "Touch",
      buttonText: "Let's Talk",
      formAction: "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
    },
    kind: "form",
  },
  "gym-template-1": {
    fields: {
      address: true, phone: true, email: true,
      socialLinks: { facebook: true, twitter: true, youtube: true, linkedin: true },
      businessHours: { mondayToFriday: true, saturday: true, sunday: true },
    },
    defaults: {
      address: "",
      phone: "",
      email: "",
      socialLinks: { facebook: "", twitter: "", youtube: "", linkedin: "" },
      businessHours: { mondayToFriday: "", saturday: "", sunday: "" },
    },
    kind: "info",
  },
};

/* ---------------- Helpers (aligned with contactS.js) ---------------- */
const safeObj = (v) => (v && typeof v === "object" ? v : {});
const pickAllowed = (src, allowedMap) => {
  const out = {};
  for (const k of Object.keys(allowedMap || {})) {
    const allowVal = allowedMap[k];
    if (allowVal && typeof allowVal === "object" && !Array.isArray(allowVal)) {
      out[k] = pickAllowed(safeObj(src?.[k]), allowVal);
    } else if (allowVal) {
      out[k] = src?.[k] ?? "";
    }
  }
  return out;
};
const mergeDefaults = (allowed, defaults) => pickAllowed(defaults || {}, allowed || {});
const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

/* ---------------- Shared tile style ---------------- */
const TILE_STYLE = {
  width: "100%",
  maxWidth: "896px",
  height: "290px",
  borderRadius: 20,
  overflow: "hidden",
  backgroundColor: "#f8f9fa",
  border: "1px solid #EEF1F4",
  margin: "0 auto",
  boxSizing: "border-box",
};

function ContactPagePreview() {
  const router = useRouter();
  const { userId, templateId } = useIonContext(); // 🔗 single source of truth

  const { fields: allowed, defaults: tmplDefaults, kind } = useMemo(() => {
    const p = CONTACT_PROFILES?.[templateId] || { fields: {}, defaults: {}, kind: "form" };
    return { fields: p.fields || {}, defaults: p.defaults || {}, kind: p.kind || "form" };
  }, [templateId]);

  const [contact, setContact] = useState(mergeDefaults({}, {})); // will be set below
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showToast, setShowToast] = useState(false);
  const isSir = templateId === "sir-template-1";
  const isGym = templateId === "gym-template-1";

  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/contact-info/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return { GET_URL: base, RESET: `${base}/reset` };
  }, [userId, templateId]);

  const loadContact = async () => {
    if (!endpoints) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();
      // restrict to allowed + merge defaults so preview always has sane values
      const safe = pickAllowed(data || {}, allowed);
      setContact({ ...mergeDefaults(allowed, tmplDefaults), ...safe });
    } catch (e) {
      setErr(String(e.message || e));
      // fallback to defaults if fetch fails
      setContact(mergeDefaults(allowed, tmplDefaults));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!endpoints) return;
    // when template or allowed fields change, reload
    loadContact().catch((e) => {
      setErr(String(e.message || e));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, JSON.stringify(Object.keys(allowed || {}))]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/contactS?${q}`);
  };

  const onResetDefault = async () => {
    if (!endpoints) return;
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));
      await loadContact(); // refresh from server
      setShowToast(true);
    } catch (e) {
      setErr(String(e.message || e));
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0">
      {(!userId || !templateId) && (
        <Alert variant="secondary" className="mb-2">Resolving user/template…</Alert>
      )}
      {err && (
        <Alert variant="danger" className="mb-2" style={{ whiteSpace: "pre-wrap" }}>{err}</Alert>
      )}

      {/* Tile */}
      <div className="d-flex shadow-sm" style={TILE_STYLE} aria-busy={loading}>
        {/* Left */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#F7FAFC" }}
        >
          <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            {isSir ? (contact.subtitle || "- Contact Us") : "Contact / Footer"}
          </div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.5rem", lineHeight: 1.2 }}>
            {isSir ? (
              <>
                {contact.titleStrong || "Get In"}{" "}
                <span className="fw-normal">{contact.titleLight || "Touch"}</span>.
              </>
            ) : (
              "Preview"
            )}
          </h4>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Preview only.
          </div>
        </div>

        {/* Right */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#fff" }}
        >
          {isSir ? (
            <>
              <div className="d-flex gap-2 mb-2 flex-wrap">
                <input
                  placeholder="Name"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240, minWidth: 140 }}
                  readOnly
                />
                <input
                  placeholder="Email"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240, minWidth: 140 }}
                  readOnly
                />
              </div>
              <textarea
                placeholder="Message"
                className="form-control form-control-sm"
                rows={3}
                readOnly
              />
              <div className="text-end mt-2">
                <button className="btn btn-secondary btn-sm" type="button" disabled>
                  {contact.buttonText || "Let's Talk"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="small mb-1">
                <i className="fa fa-map-marker-alt me-2 text-primary" />
                {contact.address || "—"}
              </div>
              <div className="small mb-1">
                <i className="fa fa-phone-alt me-2 text-primary" />
                {contact.phone || "—"}
              </div>
              <div className="small mb-2">
                <i className="fa fa-envelope me-2 text-primary" />
                {contact.email || "—"}
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {contact.socialLinks?.twitter && <span className="badge bg-light text-dark">Twitter</span>}
                {contact.socialLinks?.facebook && <span className="badge bg-light text-dark">Facebook</span>}
                {contact.socialLinks?.youtube && <span className="badge bg-light text-dark">YouTube</span>}
                {contact.socialLinks?.linkedin && <span className="badge bg-light text-dark">LinkedIn</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onResetDefault}
          disabled={!templateId || !userId || loading}
          title="Reset contact to template seeded defaults"
        >
          ↩ Reset to Default
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={goEdit}
          disabled={!templateId}
          title="Open Contact editor"
        >
          ✏️ Edit Contact
        </Button>
      </div>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ContactPagePreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactPagePreview;








