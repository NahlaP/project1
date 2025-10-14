

// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\why-chooseE.js
"use client";

import { useEffect, useState } from "react";
import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
import { api } from "../../lib/api";

export default function WhyChooseEditorPage() {
  const userId = defaultUserId;

  // Resolve template: ?templateId= → backend selection → config fallback
  const [effectiveTemplateId, setEffectiveTemplateId] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        // 1) URL param
        const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const fromUrl = sp?.get("templateId")?.trim();
        if (fromUrl) { if (!off) setEffectiveTemplateId(fromUrl); return; }
        // 2) Backend-selected
        const sel = await api.selectedTemplateForUser(userId).catch(() => null);
        const t = sel?.data?.templateId;
        if (t) { if (!off) setEffectiveTemplateId(t); return; }
        // 3) Fallback
        if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
      } catch {
        if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
      }
    })();
    return () => { off = true; };
  }, [userId]);

  const [whychoose, setWhychoose] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgImageUrl: "", // may be full URL or just a key
    bgImageKey: "", // optional explicit key from backend
    bgOverlay: 0.5,
  });
  const [displayUrl, setDisplayUrl] = useState("");

  // Presign any S3 key via backend
  const getSignedUrlFor = async (key) => {
    if (!key) return "";
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
      );
      const json = await res.json().catch(() => ({}));
      return json?.url || json?.signedUrl || "";
    } catch {
      return "";
    }
  };

  // Load whenever template changes
  useEffect(() => {
    if (!effectiveTemplateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/whychoose/${userId}/${effectiveTemplateId}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const data = (await res.json()) || {};
        setWhychoose((p) => ({ ...p, ...data }));

        // prefer full URL; else presign a key (bgImageKey or bgImageUrl-as-key)
        const full = data?.bgImageUrl;
        const keyCandidate =
          data?.bgImageKey ||
          (full && !/^https?:\/\//i.test(full) ? String(full) : "");

        if (full && /^https?:\/\//i.test(full)) {
          setDisplayUrl(full);
        } else if (keyCandidate) {
          const url = await getSignedUrlFor(keyCandidate);
          setDisplayUrl(url || "");
        } else {
          setDisplayUrl("");
        }
      } catch (err) {
        console.error("❌ Failed to fetch Why Choose section", err);
        setDisplayUrl("");
      }
    })();
  }, [effectiveTemplateId, userId]);

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundImage: displayUrl ? `url(${displayUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ position: "relative", zIndex: 2, width: "100%", height: "127%" }}
      >
        <h4 className="fw-bold mb-2 text-uppercase" style={{ fontSize: "1.25rem" }}>
          Why You Should Choose Our Services
        </h4>

        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
          {whychoose.description || "Add a compelling reason here."}
        </p>

        {/* Stats */}
        <div className="d-flex gap-4 mb-3 flex-wrap">
          {(whychoose.stats || []).slice(0, 2).map((stat, i) => (
            <div key={i} className="text-center">
              <h5 className="fw-bold mb-0">{stat.value}</h5>
              <small>{stat.label}</small>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        {(whychoose.progressBars || []).slice(0, 1).map((bar, i) => (
          <div key={i} className="mb-2">
            <div className="d-flex justify-content-between small">
              <span>{bar.label}</span>
              <span>{bar.percent}%</span>
            </div>
            <div className="progress" style={{ height: "6px" }}>
              <div className="progress-bar bg-warning" style={{ width: `${bar.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
