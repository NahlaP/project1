

// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\projectS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form,
  Toast, ToastContainer, Alert, Badge,
} from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { backendBaseUrl, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ------------------------------------------------------------------
   SIR template shows a “works” strip with up to 6 projects
-------------------------------------------------------------------*/
const MAX_PROJECTS = 6;

const TEMPLATE_DEFAULTS = {
  "sir-template-1": {
    projects: [
      { tag: "Digital Design", title: "Retouch Photo",   year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
      { tag: "Branding",       title: "Earthmade Aroma", year: "2023", href: "project2.html", imageUrl: "", imageKey: "" },
      { tag: "Branding",       title: "Bank Rebranding", year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
      { tag: "Product Design", title: "The joy of music",year: "2023", href: "project4.html", imageUrl: "", imageKey: "" },
      { tag: "Digital Art",    title: "Blue Adobe MAX",  year: "2023", href: "project1.html", imageUrl: "", imageKey: "" },
      { tag: "Web Design",     title: "Carved Wood",     year: "2023", href: "project3.html", imageUrl: "", imageKey: "" },
    ],
  },
};

const ABS_RX = /^https?:\/\//i;
const isAbs = (u) => typeof u === "string" && ABS_RX.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;                 // presigned from backend
  if (u.startsWith("/")) return u;        // absolute path on same host
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

/* ============================= PAGE ============================== */
function ProjectStudioPage() {
  const router = useRouter();

  // ✅ single source of truth (no local fallbacks)
  const { userId, templateId } = useIonContext();

  // Always keep exactly MAX_PROJECTS slots in UI
  const emptyRow = { tag: "", title: "", year: "", href: "", imageUrl: "", imageKey: "" };
  const [projects, setProjects] = useState(
    Array.from({ length: MAX_PROJECTS }, () => ({ ...emptyRow }))
  );

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Keep per-index draft file & preview (upload on Save)
  const [drafts, setDrafts] = useState(
    Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" }))
  );
  const lastUrlsRef = useRef(Array(MAX_PROJECTS).fill(null)); // revokeObjectURL later

  const apiUrl = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // Fill UI with template defaults (non-destructive) when templateId changes
  useEffect(() => {
    if (!templateId) return;
    const d = TEMPLATE_DEFAULTS["sir-template-1"]?.projects || [];
    setProjects(() =>
      Array.from({ length: MAX_PROJECTS }, (_, i) => ({
        ...emptyRow,
        ...(d[i] || {}),
      }))
    );
    setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
    // revoke any previous previews
    lastUrlsRef.current.forEach((u, i) => {
      if (u) URL.revokeObjectURL(u);
      lastUrlsRef.current[i] = null;
    });
  }, [templateId]);

  // Load current from backend
  const loadProjects = async () => {
    if (!apiUrl) return;
    const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data?.projects) ? data.projects : [];

    setProjects(() =>
      Array.from({ length: MAX_PROJECTS }, (_, i) => ({
        ...emptyRow,
        ...(list[i] || {}),
        imageUrl: list[i]?.imageUrl || "", // presigned for preview
        imageKey: list[i]?.imageKey || "",
      }))
    );
  };

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        await loadProjects();
      } catch (e) {
        console.error("❌ Load projects failed", e);
        setErrorMsg("Failed to load projects.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // field setters
  const setField = (i, key) => (e) =>
    setProjects((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: e.target.value };
      return next;
    });

  // choose file for index -> local preview (upload on Save)
  const pickFile = (i) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Image must be ≤ 15 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastUrlsRef.current[i]) URL.revokeObjectURL(lastUrlsRef.current[i]);
    lastUrlsRef.current[i] = objUrl;
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = { file, preview: objUrl };
      return next;
    });
  };

  // upload a single draft if present, returns relative key or null
  const uploadDraftIfAny = async (i) => {
    const draft = drafts[i];
    if (!draft?.file) return null;
    const url = `${apiUrl}/image/${i}`;
    const form = new FormData();
    form.append("image", draft.file);
    const res = await fetch(url, { method: "POST", body: form, credentials: "include" });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Upload failed (index ${i + 1})`);
    }
    const data = await res.json().catch(() => ({}));
    // controller returns { imageKey, imageUrl }
    return data?.imageKey || null;
  };

  const handleSave = async () => {
    if (!apiUrl) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // 1) upload any new images
      const uploadedKeys = await Promise.all(
        Array.from({ length: MAX_PROJECTS }, (_, i) => uploadDraftIfAny(i))
      );

      // 2) prepare payload (keys only)
      const body = {
        projects: projects.map((p, i) => ({
          tag: p.tag || "",
          title: p.title || "",
          year: p.year || "",
          href: p.href || "",
          imageKey: uploadedKeys[i] ? uploadedKeys[i] : (p.imageKey || ""),
        })),
      };

      // 3) PUT
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = ct.includes("application/json") ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Save failed (${res.status})`);
      }

      // 4) refresh from server
      await loadProjects();

      // 5) clear draft previews
      setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => {
        if (u) URL.revokeObjectURL(u);
        lastUrlsRef.current[i] = null;
      });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!apiUrl) return;
    setResetting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${apiUrl}/reset?_=${Date.now()}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "include",
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = ct.includes("application/json") ? (data?.error || data?.message) : await res.text().catch(() => "");
        throw new Error(txt || `Reset failed (${res.status})`);
      }

      await loadProjects();

      setDrafts(Array.from({ length: MAX_PROJECTS }, () => ({ file: null, preview: "" })));
      lastUrlsRef.current.forEach((u, i) => {
        if (u) URL.revokeObjectURL(u);
        lastUrlsRef.current[i] = null;
      });

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🗂 Projects (SIR “works”)</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">max {MAX_PROJECTS} items</Badge>
            </div>
            {apiUrl && (
              <div className="text-muted" title={apiUrl}>
                endpoint: <code>/api/projects/{userId}/{templateId}</code>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3">
          <Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col>
        </Row>
      ) : null}

      {/* Preview-strip styled like SIR */}
      <Card className="p-3 mb-4">
        <div className="d-flex flex-wrap gap-3">
          {projects.map((p, i) => (
            <div key={i} className="border rounded p-2" style={{ width: 280 }}>
              <div className="ratio ratio-16x9 mb-2" style={{ background: "#111" }}>
                {drafts[i].preview || p.imageUrl ? (
                  <img
                    src={drafts[i].preview || toAbs(p.imageUrl)}
                    alt=""
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="small opacity-75">{p.tag || "Tag"}</div>
              <div className="fw-semibold">{p.title || "Title"}</div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">{p.year || "Year"}</span>
                <span className="text-muted">{p.href ? "link ✓" : "no link"}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Editor grid */}
      <Row className="g-3">
        {projects.map((p, i) => (
          <Col md={6} lg={4} key={i}>
            <Card className="p-3 h-100">
              <div className="mb-2 fw-semibold">Project #{i + 1}</div>

              <Form.Group className="mb-2">
                <Form.Label>Image (upload on Save)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={pickFile(i)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Tag (small label)</Form.Label>
                <Form.Control value={p.tag || ""} onChange={setField(i, "tag")} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control value={p.title || ""} onChange={setField(i, "title")} />
              </Form.Group>

              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Year</Form.Label>
                    <Form.Control value={p.year || ""} onChange={setField(i, "year")} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Link (href)</Form.Label>
                    <Form.Control value={p.href || ""} onChange={setField(i, "href")} />
                  </Form.Group>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
          variant="outline-secondary"
          onClick={handleReset}
          disabled={resetting || !templateId}
          title="Reset to template defaults"
        >
          {resetting ? "Resetting…" : "↺ Reset to Defaults"}
        </Button>
        <Button onClick={handleSave} disabled={saving || !templateId}>
          {saving ? "Saving…" : "💾 Save"}
        </Button>
      </div>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ProjectStudioPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default ProjectStudioPage;
