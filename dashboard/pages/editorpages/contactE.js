


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

/* ---------------- Template resolver (URL ?templateId → backend → default) ---------------- */
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tpl, setTpl] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl.trim());
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      if (!off) setTpl(defaultTemplateId || "sir-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tpl;
}

/* ---------------- Field normalization ---------------- */
const normalizeContact = (data) => ({
  // SIR (form-style)
  subtitle: data?.subtitle || "- Contact Us",
  titleStrong: data?.titleStrong || "Get In",
  titleLight: data?.titleLight || "Touch",
  buttonText: data?.buttonText || "Let's Talk",
  formAction:
    data?.formAction ||
    "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
  // GYM (info-style)
  address: data?.address || "",
  phone: data?.phone || "",
  email: data?.email || "",
  socialLinks: {
    twitter: data?.socialLinks?.twitter || "",
    facebook: data?.socialLinks?.facebook || "",
    youtube: data?.socialLinks?.youtube || "",
    linkedin: data?.socialLinks?.linkedin || "",
  },
  businessHours: {
    mondayToFriday: data?.businessHours?.mondayToFriday || "",
    saturday: data?.businessHours?.saturday || "",
    sunday: data?.businessHours?.sunday || "",
  },
});

/* ---------------- Shared tile style (match About: height 290, max 896) ---------------- */
const TILE_STYLE = {
  width: "100%",          // fill wrapper; prevents overflow
  maxWidth: "896px",      // same cap as your other previews
  height: "290px",        // match About height
  borderRadius: 20,
  overflow: "hidden",
  backgroundColor: "#f8f9fa",
  border: "1px solid #EEF1F4",
  margin: "0 auto",
  boxSizing: "border-box",
};

function ContactPagePreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [contact, setContact] = useState(normalizeContact({}));
  const isSir = useMemo(() => templateId === "sir-template-1", [templateId]);
  const isGym = useMemo(() => templateId === "gym-template-1", [templateId]);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/contact-info/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        setContact(normalizeContact(data || {}));
      } catch (err) {
        console.error("❌ Failed to fetch contact info", err);
        setContact(normalizeContact({}));
      }
    })();
  }, [userId, templateId]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/contactS?${q}`);
  };

  return (
    <Container fluid className="p-0">
      {/* Tile */}
      <div className="d-flex shadow-sm" style={TILE_STYLE}>
        {/* Left: header / meta */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#F7FAFC" }}
        >
          <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            - Contact Us
          </div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>
            {isSir ? (
              <>
                {contact.titleStrong}{" "}
                <span className="fw-normal">{contact.titleLight}</span>.
              </>
            ) : (
              "Contact / Footer"
            )}
          </h4>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Preview only.
          </div>
        </div>

        {/* Right: compact preview */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#fff" }}
        >
          {isSir ? (
            <>
              <div className="d-flex gap-2 mb-2">
                <input
                  placeholder="Name"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240 }}
                  readOnly
                />
                <input
                  placeholder="Email"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240 }}
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
                <button className="btn btn-secondary btn-sm" type="button">
                  {contact.buttonText}
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
              <div className="d-flex gap-2">
                {contact.socialLinks?.twitter && (
                  <span className="badge bg-light text-dark">Twitter</span>
                )}
                {contact.socialLinks?.facebook && (
                  <span className="badge bg-light text-dark">Facebook</span>
                )}
                {contact.socialLinks?.youtube && (
                  <span className="badge bg-light text-dark">YouTube</span>
                )}
                {contact.socialLinks?.linkedin && (
                  <span className="badge bg-light text-dark">LinkedIn</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions under tile */}
      <div className="d-flex align-items-center justify-content-center mt-3">
      
      </div>
    </Container>
  );
}

ContactPagePreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactPagePreview;
