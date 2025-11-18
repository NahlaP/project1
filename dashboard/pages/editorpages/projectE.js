

// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\projectE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";

import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ----------------------------- HELPERS ------------------------------ */
const ABS_RX = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);
const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const toAbs = (uOrKey) => {
  if (!uOrKey) return "";
  if (isAbs(uOrKey)) return uOrKey;          // already full URL (e.g., presigned)
  if (uOrKey.startsWith("/")) return uOrKey;  // absolute path on same host
  return absFromKey(uOrKey);                  // treat as S3 key
};

export default function ProjectsPreview() {
  const router = useRouter();
  const { userId, templateId } = useIonContext();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  useEffect(() => {
    if (!apiUrl) return;
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data?.projects) ? data.projects : [];

        // normalize first so preview can always show an absolute image if present
        const normalized = list.map((p) => ({
          ...p,
          // prefer explicit imageUrl; else resolve imageKey to absolute S3 URL for preview
          _previewUrl: p?.imageUrl ? toAbs(p.imageUrl) : toAbs(p?.imageKey || ""),
        }));

        if (!off) setProjects(normalized);
      } catch (err) {
        console.error("❌ Failed to fetch projects", err);
        if (!off) setProjects([]);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [apiUrl]);

  // Jump to editor, preserving template context
  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/projectS?${q}`);
  };

  const first = projects[0];

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
      {/* Left side: project image */}
      <div style={{ width: "50%", height: "100%" }}>
        {loading ? (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
            Loading…
          </div>
        ) : first && (first._previewUrl) ? (
          <img
            src={first._previewUrl}
            alt={first?.title || "Project"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
            No Project Image
          </div>
        )}
      </div>

      {/* Right side: project details */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        {loading ? (
          <div className="text-muted">Preparing preview…</div>
        ) : first ? (
          <>
            <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
              {first.tag || "Project"}
            </div>
            <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
              {first.title || "Project Title"}
            </h4>
            {first.year && (
              <div className="mb-2 text-muted">📅 {first.year}</div>
            )}
            <p className="mb-2" style={{ fontSize: "0.95rem" }}>
              {first.description || "Short project description..."}
            </p>
            {first.href && (
              <a
                href={first.href}
                target="_blank"
                rel="noreferrer"
                className="text-primary"
              >
                View Project →
              </a>
            )}
          </>
        ) : (
          <div className="text-muted">No projects added yet.</div>
        )}

        <div className="d-flex align-items-center gap-3 mt-3">
          <Button size="sm" variant="outline-dark" onClick={goEdit}>
            ✏️ Edit Projects Section
          </Button>
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
