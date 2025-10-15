


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\aboutE.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import {
  backendBaseUrl,
  userId as defaultUserId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";

/* ------------------------- TEMPLATE PROFILES -------------------------
   Define what the About preview should render for each template.
----------------------------------------------------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    about: {
      fields: {
        subtitle: true,
        title: true,
        lines: true,          // up to 3 animated lines
        description: true,
        highlight: true,
        // media: prefers video
        videoUrl: true,
        posterUrl: true,
        imageUrl: false,
        imageAlt: false,
        // blocks
        services: true,       // 3 tiles
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
        // media: prefers image
        videoUrl: false,
        posterUrl: false,
        imageUrl: true,
        imageAlt: true,
        // blocks
        services: false,
        bullets: true,
      },
    },
  },
};

/* ----------------------------- HELPERS ------------------------------ */
const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
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

// Resolve templateId: URL -> backend selection -> fallback
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTid(fromUrl);
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTid(t);
          return;
        }
      } catch {}
      // fallback if nothing else
      if (!off) setTid("gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

export default function AboutViewer() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const allowed = useMemo(() => getAllowed(templateId, "about"), [templateId]);

  const [about, setAbout] = useState({
    // superset of possible fields (we'll render only allowed ones)
    subtitle: "",
    title: "",
    lines: [],
    description: "",
    highlight: "",
    // media
    imageUrl: "",
    imageKey: "",
    imageAlt: "",
    videoUrl: "",
    posterUrl: "",
    // blocks
    bullets: [],
    services: [],
  });

  
  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/about/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
    
        const safe = pickAllowed(data || {}, allowed);
        setAbout((prev) => ({
          ...prev,
          ...safe,
          lines: Array.isArray(safe.lines) ? safe.lines : [],
          bullets: Array.isArray(safe.bullets) ? safe.bullets : [],
          services: Array.isArray(safe.services) ? safe.services : [],
        }));
      } catch (err) {
        console.error("❌ Failed to fetch About section", err);
      }
    })();
  }, [userId, templateId, allowed]);

  
  const displayImageUrl = useMemo(
    () => about.imageUrl || absFromKey(about.imageKey || ""),
    [about.imageUrl, about.imageKey]
  );

 
  const showVideo = !!(allowed.videoUrl && about.videoUrl);
  const showImage = !!(allowed.imageUrl && (about.imageUrl || about.imageKey));

 
  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/aboutS?${q}`);
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
            alt={allowed.imageAlt ? (about.imageAlt || "About") : "About"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
            No Media
          </div>
        )}
      </div>

      {/* Right Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        {/* Subtitle */}
        {allowed.subtitle && (
          <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            {about.subtitle || "- About Us"}
          </div>
        )}

        {/* Title */}
        <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
          {about.title || "About Title"}
        </h4>

        {/* Animated Lines (sir-template) */}
        {allowed.lines && (about.lines || []).length > 0 && (
          <div className="mb-2" style={{ fontSize: "0.95rem", opacity: 0.8 }}>
            {(about.lines || []).slice(0, 3).map((ln, i) => (
              <div key={i}>{ln}</div>
            ))}
          </div>
        )}

        {/* Description */}
        {allowed.description && (
          <p className="mb-2" style={{ fontSize: "0.95rem" }}>
            {about.description || "Short about description..."}
          </p>
        )}

        {/* Highlight */}
        {allowed.highlight && about.highlight && (
          <div
            className="bg-white border px-3 py-2 rounded mb-2"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            ⭐ {about.highlight}
          </div>
        )}

        {/* Services (sir-template) */}
        {allowed.services && Array.isArray(about.services) && about.services.length > 0 && (
          <div className="row g-2 mb-2" style={{ fontSize: "0.9rem" }}>
            {about.services.slice(0, 3).map((s, idx) => (
              <div className="col-6" key={idx}>
                <div className="p-2 border rounded h-100 bg-white">
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>
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

        {/* Bullets (gym-template) */}
        {allowed.bullets && (
          <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem" }}>
            {(about.bullets || []).slice(0, 3).map((b, i) => (
              <li key={b?._id || `${b?.text || ""}-${i}`}>{b?.text || ""}</li>
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
