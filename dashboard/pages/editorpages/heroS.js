







// // og
// // pages/editorpages/heroS.js
// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert, Toast, ToastContainer
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";
// import BackBar from "../components/BackBar";

// const API = backendBaseUrl || ""; 

// const absFromKey = (key) =>
//   key && s3Bucket && s3Region
//     ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
//     : "";

// const readErr = async (res) => {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// };

// function HeroEditorPage() {
//   // server-saved state
//   const [state, setState] = useState({ content: "", imageKey: "", displayUrl: "" });

//   // local draft image (preview-only until Save)
//   const [draftFile, setDraftFile] = useState(null);
//   const [draftPreview, setDraftPreview] = useState("");
//   const lastObjUrlRef = useRef(null);

//   const [saving, setSaving] = useState(false);
//   const [success, setSuccess] = useState(""); // kept for logic; not rendered as Alert
//   const [error, setError] = useState("");

//   // floater (toast)
//   const [showToast, setShowToast] = useState(false);

//   const GET_URL    = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const PUT_URL    = GET_URL;            // PUT text/key
//   const UPLOAD_URL = `${GET_URL}/image`; // POST image (used only inside Save)

//   const loadHero = async () => {
//     setError("");
//     const res = await fetch(`${GET_URL}?t=${Date.now()}`, {
//       headers: { Accept: "application/json" },
//       cache: "no-store",
//     });
//     if (!res.ok) throw new Error(await readErr(res));
//     const data = await res.json();
//     setState({
//       content:  data?.content  || "",
//       imageKey: data?.imageKey || "",
//       displayUrl: data?.imageUrl || absFromKey(data?.imageKey || ""),
//     });
//   };

//   useEffect(() => { loadHero().catch((e) => setError(String(e.message || e))); }, []);

//   useEffect(() => {
//     return () => { if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current); };
//   }, []);

//   // choose file -> only preview locally (no upload)
//   const onPickLocal = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 10 * 1024 * 1024) {
//       setError("Image must be ≤ 10 MB");
//       e.target.value = "";
//       return;
//     }

//     const objUrl = URL.createObjectURL(file);
//     if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
//     lastObjUrlRef.current = objUrl;

//     setDraftFile(file);
//     setDraftPreview(objUrl);
//     setSuccess("");
//     setError("");
//   };

//   // helper used ONLY in Save
//   const uploadDraftIfNeeded = async () => {
//     if (!draftFile) return null;
//     const form = new FormData();
//     form.append("image", draftFile); // multer expects "image"
//     const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
//     if (!res.ok) throw new Error(await readErr(res));
//     const j = await res.json(); // { imageKey/key, imageUrl? }
//     return (j?.imageKey || j?.key || "").replace(/^\/+/, "");
//   };

//   const onSave = async () => {
//     setSaving(true); setSuccess(""); setError("");
//     try {
//       // 1) If user chose a new file, upload it now
//       const newKey = await uploadDraftIfNeeded();

//       // 2) Save doc (include imageKey only if changed)
//       const payload = {
//         content: state.content || "",
//         ...(newKey ? { imageKey: newKey } : {}),
//       };

//       const res = await fetch(PUT_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       // 3) refresh server data (gets signed URL etc.)
//       await loadHero();

//       // 4) clear local draft preview
//       setDraftFile(null);
//       setDraftPreview("");
//       if (lastObjUrlRef.current) { URL.revokeObjectURL(lastObjUrlRef.current); lastObjUrlRef.current = null; }

//       setSuccess("✅ Saved!");
//       setShowToast(true); // <-- show floater
//     } catch (err) {
//       setError(String(err.message || err));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🖼️ Hero Section</h4>
//           <BackBar />
//         </Col>
//       </Row>

//       {/* Keep error Alert; success is shown via the toast floater */}
//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         <div className="row g-5">
//           <div className="col-lg-6">
//             {(draftPreview || state.displayUrl) ? (
//               <RBImage
//                 src={draftPreview || state.displayUrl}
//                 alt="Hero preview"
//                 className="img-fluid"
//                 style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//               />
//             ) : (
//               <div className="text-muted">No image chosen yet</div>
//             )}

//             <div className="d-flex gap-2 mt-2">
//               {/* only sets local preview; no upload */}
//               <Form.Control type="file" accept="image/*" onChange={onPickLocal} />
//               <Button variant="outline-secondary" onClick={() => loadHero()}>
//                 Refresh server image
//               </Button>
//             </div>

//             <div className="small text-muted mt-2">
//               <div><strong>Stored key:</strong> {state.imageKey || "(none)"} </div>
//               <div>
//                 <strong>Draft selected:</strong>{" "}
//                 {draftFile ? `${draftFile.name} (unsaved)` : "(no draft)"}
//               </div>
//             </div>
//           </div>

//           <div className="col-lg-6">
//             <Form.Group className="mb-3">
//               <Form.Label>Hero Headline</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={state.content || ""}
//                 onChange={(e) => setState((p) => ({ ...p, content: e.target.value }))}
//                 placeholder="Write a motivational welcome message..."
//               />
//             </Form.Group>

//             <div className="d-flex justify-content-end">
//               <Button onClick={onSave} disabled={saving}>
//                 {saving ? "Saving…" : "💾 Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Floating toast (floater) */}
//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast
//           bg="success"
//           onClose={() => setShowToast(false)}
//           show={showToast}
//           delay={2200}
//           autohide
//         >
//           <Toast.Body className="text-white">
//             ✅ Saved successfully.
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default HeroEditorPage;


















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Image as RBImage, Alert, Toast, ToastContainer,
} from "react-bootstrap";
import { useRouter } from "next/router";

import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { api } from "../../lib/api";
import { backendBaseUrl, userId as defaultUserId, s3Bucket, s3Region } from "../../lib/config";

/* ------------------------- TEMPLATE PROFILES -------------------------
   Declare which fields the Hero editor supports for each template.
----------------------------------------------------------------------- */
const TEMPLATE_PROFILES = {
  "sir-template-1": {
    hero: {
      fields: {
        content: true,
        // media (video-first)
        videoUrl: true,
        videoKey: true,
        posterUrl: true,
        posterKey: true,
        imageKey: false,
        imageUrl: false,
      },
      defaults: {
        content: "We craft identities and digital experiences.",
      },
    },
  },
  "gym-template-1": {
    hero: {
      fields: {
        content: true,
        // media (image-first)
        imageKey: true,
        imageUrl: true, // presigned URL (optional from backend)
        videoUrl: false,
        videoKey: false,
        posterUrl: false,
        posterKey: false,
      },
      defaults: {
        content: "Train smart. Live strong.",
      },
    },
  },
};

/* ----------------------------- HELPERS ------------------------------ */
const API = backendBaseUrl || "";

const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

const getAllowed = (templateId, section) =>
  (TEMPLATE_PROFILES?.[templateId]?.[section]?.fields) || {};

const getDefaults = (templateId, section) =>
  (TEMPLATE_PROFILES?.[templateId]?.[section]?.defaults) || {};

const pickAllowed = (obj, allowedMap) => {
  const out = {};
  Object.keys(allowedMap).forEach((k) => {
    if (allowedMap[k] && obj?.[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

// resolve templateId: ?templateId=... -> backend selection -> fallback
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" && router.query.templateId.trim();
      if (fromUrl) { if (!off) setTemplateId(fromUrl); return; }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) { setTemplateId(t); return; }
      } catch {}
      if (!off) setTemplateId("gym-template-1");
    })();
    return () => { off = true; };
  }, [router.query.templateId, userId]);

  return templateId;
}

/* ------------------------------ PAGE ------------------------------- */
function HeroEditorPage() {
  const router = useRouter();

  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);
  const allowed = useMemo(() => getAllowed(templateId, "hero"), [templateId]);
  const defaults = useMemo(() => getDefaults(templateId, "hero"), [templateId]);

  const pageId = typeof router.query.pageId === "string" ? router.query.pageId : "";
  const sectionId = typeof router.query.sectionId === "string" ? router.query.sectionId : "";

  // server state (superset; UI will only render allowed fields)
  const [state, setState] = useState({
    content: "",
    imageKey: "",
    imageUrl: "",    // presigned (optional from backend)
    videoUrl: "",
    videoKey: "",
    posterUrl: "",
    posterKey: "",
  });

  // local drafts
  const [draftImage, setDraftImage] = useState(null);
  const [draftImagePreview, setDraftImagePreview] = useState("");

  const [draftVideo, setDraftVideo] = useState(null);
  const [draftPoster, setDraftPoster] = useState(null);

  const lastObjUrlRef = useRef(null);
  const hiddenVideoInputRef = useRef(null);
  const hiddenPosterInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // endpoints
  const endpoints = useMemo(() => {
    if (!templateId) return null;
    const base = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return {
      GET_URL: base,
      PUT_URL: base,
      UP_IMAGE: `${base}/image`,
      UP_VIDEO: `${base}/video`,
      UP_POSTER: `${base}/poster`,
      CLEAR_VIDEO: `${base}/clear-video`,
    };
  }, [templateId, userId]);

  // reset to template defaults when template changes
  useEffect(() => {
    setState((p) => ({ ...p, ...defaults }));
    setDraftImage(null);
    setDraftImagePreview("");
    setDraftVideo(null);
    setDraftPoster(null);
    setError("");
  }, [defaults, templateId]);

  const loadHero = async () => {
    if (!endpoints) return;
    setError("");
    const res = await fetch(`${endpoints.GET_URL}?t=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const d = await res.json();

    // Compute a consistent display image URL if image is allowed
    const imageUrl = allowed.imageUrl
      ? (d?.imageUrl || absFromKey(d?.imageKey || ""))
      : "";

    // Keep only allowed fields
    const safeFromServer = pickAllowed(
      {
        content: d?.content || "",
        imageKey: d?.imageKey || "",
        imageUrl,                 // synthesized for preview if needed
        videoUrl: d?.videoUrl || "",
        videoKey: d?.videoKey || "",
        posterUrl: d?.posterUrl || "",
        posterKey: d?.posterKey || "",
      },
      allowed
    );

    setState((prev) => ({ ...prev, ...safeFromServer }));
  };

  useEffect(() => {
    if (!endpoints) return;
    loadHero().catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints?.GET_URL, allowed]);

  useEffect(() => {
    return () => {
      if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    };
  }, []);

  /* ------------------------- PICKERS ------------------------- */

  // image chooser (preview only until save)
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    const objUrl = URL.createObjectURL(file);
    if (lastObjUrlRef.current) URL.revokeObjectURL(lastObjUrlRef.current);
    lastObjUrlRef.current = objUrl;

    setDraftImage(file);
    setDraftImagePreview(objUrl);
    setError("");
  };

  // clicking the "Video URL" display opens file dialog
  const onClickVideoURL = (e) => {
    e.preventDefault();
    hiddenVideoInputRef.current?.click();
  };
  const onPickVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      setError("Video must be ≤ 200 MB");
      e.target.value = "";
      return;
    }
    setDraftVideo(file);
  };

  // clicking the "Poster URL" display opens file dialog
  const onClickPosterURL = (e) => {
    e.preventDefault();
    hiddenPosterInputRef.current?.click();
  };
  const onPickPoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Poster must be ≤ 10 MB");
      e.target.value = "";
      return;
    }
    setDraftPoster(file);
  };

  /* ------------------------- UPLOADS ------------------------- */

  const uploadIfNeeded = async () => {
    const out = { imageKey: "", videoKey: "", posterKey: "" };

    // image (only if this template uses image)
    if (allowed.imageKey && draftImage && endpoints) {
      const form = new FormData();
      form.append("image", draftImage);
      const r = await fetch(endpoints.UP_IMAGE, { method: "POST", body: form });
      if (!r.ok) throw new Error(await readErr(r));
      const j = await r.json();
      out.imageKey = (j?.imageKey || j?.key || "").replace(/^\/+/, "");
    }

    // video (only if template uses video)
    if (allowed.videoKey && draftVideo && endpoints) {
      const form = new FormData();
      form.append("video", draftVideo);
      const r = await fetch(endpoints.UP_VIDEO, { method: "POST", body: form });
      if (!r.ok) throw new Error(await readErr(r));
      const j = await r.json();
      out.videoKey = (j?.videoKey || j?.key || "").replace(/^\/+/, "");
    }

    // poster (only if template uses poster)
    if (allowed.posterKey && draftPoster && endpoints) {
      const form = new FormData();
      form.append("poster", draftPoster);
      const r = await fetch(endpoints.UP_POSTER, { method: "POST", body: form });
      if (!r.ok) throw new Error(await readErr(r));
      const j = await r.json();
      out.posterKey = (j?.posterKey || j?.key || "").replace(/^\/+/, "");
    }

    return out;
  };

  /* ------------------------- SAVE ------------------------- */

  const onSave = async () => {
    if (!endpoints) return;
    setSaving(true);
    setError("");
    try {
      // upload drafts first (respects allowed fields)
      const uploaded = await uploadIfNeeded();

      // Build full payload then filter by allowed fields
      const fullPayload = {
        content: state.content || "",
        ...(uploaded.imageKey ? { imageKey: uploaded.imageKey } : {}),
        ...(uploaded.videoKey ? { videoKey: uploaded.videoKey } : {}),
        ...(uploaded.posterKey ? { posterKey: uploaded.posterKey } : {}),
      };

      const safePayload = pickAllowed(fullPayload, allowed);

      const res = await fetch(endpoints.PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
      });
      if (!res.ok) throw new Error(await readErr(res));

      await loadHero();

      // reset drafts
      setDraftImage(null);
      setDraftImagePreview("");
      setDraftVideo(null);
      setDraftPoster(null);

      if (lastObjUrlRef.current) {
        URL.revokeObjectURL(lastObjUrlRef.current);
        lastObjUrlRef.current = null;
      }

      setShowToast(true);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const clearVideo = async () => {
    if (!endpoints || !allowed.videoKey) return; // only for video templates
    setSaving(true);
    try {
      await fetch(endpoints.CLEAR_VIDEO, { method: "POST" });
      await loadHero();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    const q = new URLSearchParams({ templateId });
    if (pageId) router.push(`/editorpages/page/${pageId}?${q.toString()}`);
    else router.back();
  };

  /* ------------------------- PREVIEW ------------------------- */
  const showVideo = !!(allowed.videoUrl && state.videoUrl);
  const showImage = !!(allowed.imageKey && (draftImagePreview || state.imageUrl || state.imageKey));

  const displayImage = useMemo(
    () => draftImagePreview || state.imageUrl || absFromKey(state.imageKey || ""),
    [draftImagePreview, state.imageUrl, state.imageKey]
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🖼️ Hero Section</h4>
          <BackBar onBack={goBack} />
        </Col>
      </Row>

      {!templateId && <Alert variant="secondary" className="mt-3">Resolving template…</Alert>}
      {error && <Alert variant="danger" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      <Card className="p-4 shadow-sm mt-3">
        <div className="row g-5">
          {/* Media Preview & Pickers */}
          <div className="col-lg-6">
            {/* Preview */}
            {showVideo ? (
              <video
                controls
                playsInline
                muted
                loop
                poster={allowed.posterUrl ? state.posterUrl || undefined : undefined}
                className="w-100"
                style={{ maxHeight: 350, objectFit: "cover", borderRadius: 6 }}
              >
                <source src={state.videoUrl} />
              </video>
            ) : showImage ? (
              <RBImage
                src={displayImage}
                alt="Hero preview"
                className="img-fluid"
                style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
              />
            ) : (
              <div className="text-muted">No media yet</div>
            )}

            {/* Image picker (gym) */}
            {allowed.imageKey && (
              <div className="d-flex gap-2 mt-2">
                <Form.Control type="file" accept="image/*" onChange={onPickImage} />
                <Button variant="outline-secondary" onClick={() => loadHero()}>
                  Refresh server image
                </Button>
              </div>
            )}

            <div className="small text-muted mt-2">
              {allowed.imageKey && <div><strong>Stored image key:</strong> {state.imageKey || "(none)"}</div>}
              {allowed.videoKey && <div><strong>Current video:</strong> {state.videoKey ? state.videoKey : "(none)"} </div>}
              {allowed.posterKey && <div><strong>Poster:</strong> {state.posterKey ? state.posterKey : "(none)"} </div>}
              <div>
                <strong>Template:</strong> <code>{templateId || "(resolving…)"}</code>
                {sectionId ? <> • <strong>Section:</strong> <code>{sectionId}</code></> : null}
              </div>
            </div>
          </div>

          {/* Text + Video/Poster controls */}
          <div className="col-lg-6">
            <Form.Group className="mb-3">
              <Form.Label>Hero Headline</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={state.content || ""}
                onChange={(e) => setState((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write a motivational welcome message..."
              />
            </Form.Group>

            {/* VIDEO PICKER (sir) – clicking the box opens a file dialog */}
            {allowed.videoKey && (
              <Form.Group className="mb-3">
                <Form.Label>Video URL (mp4/webm/ogg)</Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={state.videoUrl || "(click to select a video file)"}
                  onClick={(e) => { e.preventDefault(); hiddenVideoInputRef.current?.click(); }}
                  style={{ cursor: "pointer" }}
                />
                <div className="d-flex gap-2 mt-2">
                  <input
                    ref={hiddenVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/*"
                    style={{ display: "none" }}
                    onChange={onPickVideo}
                  />
                  <Button variant="outline-danger" size="sm" onClick={clearVideo}>
                    Clear Video
                  </Button>
                </div>
              </Form.Group>
            )}

            {/* POSTER PICKER (sir) */}
            {allowed.posterKey && (
              <Form.Group className="mb-4">
                <Form.Label>Poster URL (optional)</Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={state.posterUrl || "(click to select a poster image)"}
                  onClick={(e) => { e.preventDefault(); hiddenPosterInputRef.current?.click(); }}
                  style={{ cursor: "pointer" }}
                />
                <input
                  ref={hiddenPosterInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onPickPoster}
                />
                <div className="form-text">
                  Used as the preview image for the video. Leave empty to disable.
                </div>
              </Form.Group>
            )}

            <div className="d-flex justify-content-end">
              <Button onClick={onSave} disabled={saving || !templateId}>
                {saving ? "Saving…" : "💾 Save"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2200} autohide>
          <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;
















