// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutE.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ------------------------- TEMPLATE PROFILES ------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: true, // up to 3 animated lines
        description: true,
        highlight: true,
        videoUrl: true,
        posterUrl: true,
        imageUrl: false,
        imageAlt: false,
        services: true, // 3 tiles
        bullets: false,
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
        videoUrl: false,
        posterUrl: false,
        imageUrl: true,
        imageAlt: true,
        services: false,
        bullets: true,
      },
    },
  },
};

/* ----------------------------- HELPERS ------------------------------ */
const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(
        /^\/+/,
        ""
      )}`
    : "";

const getAllowed = (templateId, section) =>
  (TEMPLATE_PROFILES?.[templateId]?.[section]?.fields) || {};

const pickAllowed = (obj, allowedMap) => {
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (allowedMap[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

/* ============================= COMPONENT ============================= */
export default function AboutViewer() {
  const router = useRouter();

  // ✅ single source of truth for userId + templateId
  const { userId, templateId } = useIonContext();
  const allowed = useMemo(() => getAllowed(templateId, "about"), [templateId]);

  const [about, setAbout] = useState({
    subtitle: "",
    title: "",
    lines: [],
    description: "",
    highlight: "",
    imageUrl: "",
    imageKey: "",
    imageAlt: "",
    videoUrl: "",
    posterUrl: "",
    bullets: [],
    services: [],
  });
  const [loading, setLoading] = useState(true);

  const pageId =
    typeof router.query.pageId === "string" ? router.query.pageId : "";
  const sectionId =
    typeof router.query.sectionId === "string" ? router.query.sectionId : "";

  useEffect(() => {
    if (!userId || !templateId) return;
    let off = false;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${backendBaseUrl}/api/about/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}?_=${Date.now()}`,
          {
            headers: { Accept: "application/json" },
            cache: "no-store",
            credentials: "include",
          }
        );

        const raw = await res.json().catch(() => ({}));

        // Normalize media fallbacks & arrays
        const normalized = {
          ...raw,
          imageUrl:
            raw?.imageUrl || (raw?.imageKey ? absFromKey(raw.imageKey) : ""),
          videoUrl: raw?.videoUrl || "",
          posterUrl: raw?.posterUrl || "",
          lines: Array.isArray(raw?.lines) ? raw.lines : [],
          bullets: Array.isArray(raw?.bullets) ? raw.bullets : [],
          services: Array.isArray(raw?.services) ? raw.services : [],
        };

        // Keep only allowed fields for this template
        const safe = pickAllowed(normalized, allowed);

        if (!off) {
          setAbout((prev) => ({
            ...prev,
            ...safe,
          }));
        }
      } catch (err) {
        console.error("❌ Failed to fetch About section", err);
      } finally {
        if (!off) setLoading(false);
      }
    })();

    return () => {
      off = true;
    };
  }, [userId, templateId, allowed]);

  const displayImageUrl = useMemo(
    () => about.imageUrl || absFromKey(about.imageKey || ""),
    [about.imageUrl, about.imageKey]
  );

  const showVideo = !!(allowed.videoUrl && about.videoUrl);
  const showImage = !!(allowed.imageUrl && (about.imageUrl || about.imageKey));

  // Jump to editor while keeping context (template/page/section)
  const goEdit = () => {
    const q = new URLSearchParams({
      templateId: String(templateId || ""),
      ...(pageId ? { pageId: String(pageId) } : {}),
      ...(sectionId ? { sectionId: String(sectionId) } : {}),
    });
    router.push(`/editorpages/aboutS?${q.toString()}`);
  };

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Left Media */}
      <div style={{ width: "50%", height: "100%" }}>
        {showVideo ? (
          <video
            controls
            playsInline
            muted
            loop
            poster={allowed.posterUrl ? about.posterUrl || undefined : undefined}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          >
            <source src={about.videoUrl} />
          </video>
        ) : showImage ? (
          <img
            src={displayImageUrl}
            alt={allowed.imageAlt ? about.imageAlt || "About" : "About"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
            {!userId || !templateId
              ? "Resolving…"
              : loading
              ? "Loading…"
              : "No Media"}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        {allowed.subtitle && (
          <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            {about.subtitle || "- About Us"}
          </div>
        )}

        <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
          {about.title || (loading ? "…" : "About Title")}
        </h4>

        {allowed.lines && (about.lines || []).length > 0 && (
          <div className="mb-2" style={{ fontSize: "0.95rem", opacity: 0.8 }}>
            {(about.lines || [])
              .slice(0, 3)
              .map((ln, i) => <div key={i}>{ln}</div>)}
          </div>
        )}

        {allowed.description && (
          <p className="mb-2" style={{ fontSize: "0.95rem" }}>
            {about.description ||
              (loading ? "Loading description…" : "Short about description...")}
          </p>
        )}

        {allowed.highlight && about.highlight && (
          <div
            className="bg-white border px-3 py-2 rounded mb-2"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            ⭐ {about.highlight}
          </div>
        )}

        {allowed.services &&
          Array.isArray(about.services) &&
          about.services.length > 0 && (
            <div className="row g-2 mb-2" style={{ fontSize: "0.9rem" }}>
              {about.services.slice(0, 3).map((s, idx) => (
                <div className="col-6" key={idx}>
                  <div className="p-2 border rounded h-100 bg-white">
                    <div
                      className="text-muted"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {s?.tag || "Tag"}
                    </div>
                    <div className="fw-semibold">
                      {s?.heading || "Heading"}
                    </div>
                    {s?.href ? (
                      <a href={s.href} target="_blank" rel="noreferrer">
                        View Details →
                      </a>
                    ) : (
                      <span className="text-muted">No link</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        {allowed.bullets && (
          <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem" }}>
            {(about.bullets || []).slice(0, 3).map((b, i) => (
              <li key={b?._id || `${b?.text || ""}-${i}`}>
                {b?.text || ""}
              </li>
            ))}
          </ul>
        )}

        <div className="d-flex align-items-center gap-3 mt-3">
          <Button size="sm" variant="outline-dark" onClick={goEdit}>
            ✏️ Edit About Section
          </Button>
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
