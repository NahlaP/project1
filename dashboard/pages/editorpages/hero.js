

// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ------------------------- TEMPLATE PROFILES ------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    hero: {
      fields: {
        content: true,
        videoUrl: true,
        videoKey: true,
        posterUrl: true,
        posterKey: true,
        imageUrl: false,
        imageKey: false,
      },
    },
  },
  "gym-template-1": {
    hero: {
      fields: {
        content: true,
        imageUrl: true,
        imageKey: true,
        videoUrl: false,
        videoKey: false,
        posterUrl: false,
        posterKey: false,
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

/* ============================= COMPONENT ============================= */
export default function HeroSectionPreview() {
  const router = useRouter();
  const { userId, templateId } = useIonContext();        // ✅ single source of truth (no fallback)
  const allowed = useMemo(() => getAllowed(templateId, "hero"), [templateId]);

  const [hero, setHero] = useState({
    content: "",
    imageUrl: "",
    imageKey: "",
    videoUrl: "",
    videoKey: "",
    posterUrl: "",
    posterKey: "",
  });
  const [loading, setLoading] = useState(true);

  const pageId = typeof router.query.pageId === "string" ? router.query.pageId : "";
  const sectionId = typeof router.query.sectionId === "string" ? router.query.sectionId : "";

  const heroApiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  useEffect(() => {
    if (!heroApiUrl) return;
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${heroApiUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        const normalized = {
          content: data?.content || "",
          imageUrl: allowed.imageUrl
            ? (data?.imageUrl || (data?.imageKey ? absFromKey(data.imageKey) : ""))
            : "",
          imageKey: data?.imageKey || "",
          videoUrl: allowed.videoUrl
            ? (data?.videoUrl || (data?.videoKey ? absFromKey(data.videoKey) : ""))
            : "",
          videoKey: data?.videoKey || "",
          posterUrl: allowed.posterUrl
            ? (data?.posterUrl || (data?.posterKey ? absFromKey(data.posterKey) : ""))
            : "",
          posterKey: data?.posterKey || "",
        };

        const safe = pickAllowed(normalized, allowed);
        if (!off) setHero((p) => ({ ...p, ...safe }));
      } catch (err) {
        console.error("❌ Failed to load hero section", err);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [heroApiUrl, allowed]);

  // Decide which media to show
  const isVideoTemplate = !!allowed.videoUrl;
  const showVideo = isVideoTemplate && !!hero.videoUrl;
  const showImage = !!allowed.imageUrl && !!(hero.imageUrl || hero.imageKey);

  const goEdit = () => {
    const q = new URLSearchParams({
      templateId: String(templateId || ""),
      ...(pageId ? { pageId: String(pageId) } : {}),
      ...(sectionId ? { sectionId: String(sectionId) } : {}),
    });
    router.push(`/editorpages/heroS?${q.toString()}`);
  };

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "280px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Left: text */}
      <div className="d-flex flex-column justify-content-center" style={{ width: "60%", paddingRight: "20px" }}>
        <h5 className="fw-bold mb-2">Hero Section</h5>
        <p className="mb-3" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
          {(!userId || !templateId) ? "Resolving…" : (loading ? "Loading hero…" : hero?.content || "Your Hero Headline Goes Here")}
        </p>

        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm" type="button">Explore More</button>
          <Button size="sm" variant="outline-dark" onClick={goEdit}>✏️ Edit Hero</Button>
        </div>

        <div className="mt-2 small text-muted">
          <span>Template: </span><code>{templateId || "(resolving…)"}</code>
        </div>
      </div>

      {/* Right: media (video for sir-template, image for gym-template) */}
      <div style={{ width: "40%", display: "flex", alignItems: "center" }}>
        {showVideo ? (
          <video
            controls
            playsInline
            muted
            loop
            poster={allowed.posterUrl ? (hero.posterUrl || undefined) : undefined}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
          >
            <source src={hero.videoUrl} />
          </video>
        ) : showImage ? (
          <img
            src={hero.imageUrl}
            alt="Hero"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center text-muted"
            style={{ width: "100%", height: "100%", background: "#f7f7f8", borderRadius: "12px", fontSize: 12 }}
          >
            {loading ? "Loading media…" : "No media"}
          </div>
        )}
      </div>
    </div>
  );
}
