


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
import { api } from "../../lib/api";

/** Resolve templateId in this order:
 *  1) ?templateId=… in URL
 *  2) backend-selected template for the user
 *  3) config fallback (legacy)
 */
function useResolvedTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      // 1) URL param
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const fromUrl = sp?.get("templateId")?.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl);
        return;
      }
      // 2) Backend-selected
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      // 3) Fallback
      if (!off) setTpl(defaultTemplateId || "gym-template-1");
    })();
    return () => { off = true; };
  }, [userId]);
  return tpl;
}

// Helper to presign S3 key via backend
async function presignKey(key) {
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
}

export default function TestimonialPreview() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [testimonials, setTestimonials] = useState([]);

  const displayUrlFor = useMemo(
    () => async (t) => {
      // Full URL already?
      if (t?.imageUrl && /^https?:\/\//i.test(t.imageUrl)) return t.imageUrl;

      // S3 key present? (imageKey OR non-absolute imageUrl)
      const key =
        t?.imageKey ||
        (t?.imageUrl && !/^https?:\/\//i.test(t.imageUrl) ? t.imageUrl : "");

      if (key) {
        const url = await presignKey(key);
        if (url) return url;
      }

      // Legacy /uploads
      if (typeof t?.imageUrl === "string" && t.imageUrl.startsWith("/uploads/")) {
        return `${backendBaseUrl}${t.imageUrl}`;
      }
      return "";
    },
    []
  );

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/testimonial/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const arr = (await res.json()) || [];
        const safe = Array.isArray(arr) ? arr : [];
        const withUrls = await Promise.all(
          safe.map(async (t) => ({ ...t, displayUrl: await displayUrlFor(t) }))
        );
        setTestimonials(withUrls);
      } catch (e) {
        console.error("❌ Failed to fetch testimonials", e);
        setTestimonials([]);
      }
    })();
  }, [templateId, userId, displayUrlFor]);

  const first = testimonials[0];

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Left: Client Image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: first?.displayUrl ? `url(${first.displayUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!first?.displayUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Testimonial Content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">What Clients Say</h5>

        {first ? (
          <>
            <strong className="text-uppercase">{first.name}</strong>
            <small className="text-muted mb-2">{first.profession}</small>
            <p className="mb-2">{first.message}</p>
            <div className="text-warning mb-2">
              {Array.from({ length: Math.max(0, Math.min(5, first.rating || 5)) }).map((_, i) => (
                <i className="fas fa-star" key={i}></i>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted">No testimonials available.</p>
        )}
      </div>
    </div>
  );
}
