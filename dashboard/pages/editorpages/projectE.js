

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import {
  backendBaseUrl,
  userId as defaultUserId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";

const API = backendBaseUrl || "";
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return u;
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

// Resolve templateId from user or backend
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
        if (t && !off) setTid(t);
      } catch {}
      if (!off) setTid("sir-template-1"); // fallback
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

export default function ProjectsPreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [projects, setProjects] = useState([]);

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/projects/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch (err) {
        console.error("❌ Failed to fetch projects", err);
      }
    })();
  }, [apiUrl]);

  // Jump to editor
  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/projectS?${q}`);
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
      {/* Left side: project image */}
      <div style={{ width: "50%", height: "100%" }}>
        {projects.length > 0 && projects[0].imageUrl ? (
          <img
            src={toAbs(projects[0].imageUrl)}
            alt={projects[0].title || "Project"}
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
        {projects.length > 0 ? (
          <>
            <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
              {projects[0].tag || "Project"}
            </div>
            <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
              {projects[0].title || "Project Title"}
            </h4>
            {projects[0].year && (
              <div className="mb-2 text-muted">📅 {projects[0].year}</div>
            )}
            <p className="mb-2" style={{ fontSize: "0.95rem" }}>
              {projects[0].description || "Short project description..."}
            </p>
            {projects[0].href && (
              <a
                href={projects[0].href}
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
