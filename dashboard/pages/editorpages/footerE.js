// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\footerE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
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
const normalizeFooter = (data) => ({
  email: data?.email || "hello@Bayone.com",
  socials: {
    facebook: data?.socials?.facebook || "",
    twitter: data?.socials?.twitter || "",
    linkedin: data?.socials?.linkedin || "",
    behance: data?.socials?.behance || "",
  },
  office: {
    address:
      data?.office?.address ||
      "Besòs 1, 08174 Sant Cugat del Vallès, Barcelona",
    phone: data?.office?.phone || "+2 456 34324 45",
  },
  links: {
    faq: data?.links?.faq || "about.html",
    careers: data?.links?.careers || "about.html",
    contact: data?.links?.contact || "contact.html",
  },
  copyright:
    data?.copyright ||
    "© 2023 Bayone is Proudly Powered by Ui-ThemeZ",
});

/* ---------------- SAME tile style as contact preview ---------------- */
const TILE_STYLE = {
  width: "100%",
  maxWidth: "896px",
  height: "290px",        // <- same height as contact preview
  borderRadius: 20,
  overflow: "hidden",
  backgroundColor: "#F8FAFB",
  border: "1px solid #EEF1F4",
  margin: "0 auto",
  boxSizing: "border-box",
};

function FooterPreview() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [footer, setFooter] = useState(normalizeFooter({}));

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/footer/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        setFooter(normalizeFooter(data || {}));
      } catch (e) {
        console.error("❌ footer fetch failed", e);
        setFooter(normalizeFooter({}));
      }
    })();
  }, [userId, templateId]);

  const has = (v) => typeof v === "string" && v.trim();

  return (
    <Container fluid className="p-0">
      <div className="d-flex shadow-sm" style={TILE_STYLE}>
        {/* Left: email CTA */}
        <div
          className="d-flex flex-column justify-content-center px-4"
          style={{ width: "45%", background: "#ffffff" }}
        >
          <div className="text-muted" style={{ fontSize: 12 }}>
            we would love to hear from you.
          </div>
          <h4 className="mb-1 fw-bold" style={{ lineHeight: 1.2 }}>
            <span className="underline">{footer.email}</span>
          </h4>
        </div>

        {/* Middle: socials */}
        <div
          className="d-flex flex-column justify-content-center px-4"
          style={{ width: "30%", background: "#F6F7F9" }}
        >
          <h6 className="text-uppercase opacity-75 mb-2">Social Media</h6>
          <div className="d-flex flex-wrap gap-2">
            {has(footer.socials.facebook) && (
              <span className="badge bg-light text-dark">Facebook</span>
            )}
            {has(footer.socials.twitter) && (
              <span className="badge bg-light text-dark">Twitter</span>
            )}
            {has(footer.socials.linkedin) && (
              <span className="badge bg-light text-dark">LinkedIn</span>
            )}
            {has(footer.socials.behance) && (
              <span className="badge bg-light text-dark">Behance</span>
            )}
            {!has(footer.socials.facebook) &&
              !has(footer.socials.twitter) &&
              !has(footer.socials.linkedin) &&
              !has(footer.socials.behance) && (
                <span className="text-muted small">—</span>
              )}
          </div>
        </div>

        {/* Right: office + phone */}
        <div
          className="d-flex flex-column justify-content-center px-4"
          style={{ width: "25%", background: "#ffffff" }}
        >
          <h6 className="text-uppercase opacity-75 mb-2">Our Office</h6>
          <div className="small mb-2">{footer.office.address}</div>
          <div className="fw-semibold">{footer.office.phone}</div>
        </div>
      </div>

      {/* Bottom line (links + copyright) */}
      <div
        className="d-flex justify-content-between align-items-center px-4 mt-2"
        style={{ maxWidth: "896px", margin: "0 auto" }}
      >
        <div className="d-flex gap-3 small">
          <span>FAQ</span>
          <span>Careers</span>
          <span>Contact</span>
        </div>
        <div className="small text-muted">{footer.copyright}</div>
      </div>
    </Container>
  );
}

FooterPreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default FooterPreview;
