


// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
// import React, { useEffect, useState } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// // Use the same pattern as About: keep '' so '/api/...' hits Next.js rewrite
// const API = backendBaseUrl || "";

// // Optional: direct upload base to bypass Vercel proxy for large files (must be HTTPS)
// const UPLOAD_BASE =
//   (typeof window !== "undefined" && window.__API_UPLOAD_BASE__) ||
//   process.env.NEXT_PUBLIC_UPLOAD_BASE ||
//   API; // default to the same as API

// const isAbs = (u = "") => /^https?:\/\//i.test(u);
// const join = (base, p = "") => (isAbs(p) ? p : `${base}${p.startsWith("/") ? p : `/${p}`}`);

// function HeroEditorPage() {
//   const [hero, setHero] = useState({
//     content: "",
//     imageKey: "",     // persistent S3 key stored in DB
//     displayUrl: "",   // short-lived presigned URL for preview
//   });

//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);

//   async function refreshHero() {
//     try {
//       const res = await fetch(`${API}/api/hero/${userId}/${templateId}`, { cache: "no-store" });
//       const txt = await res.text();
//       let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
//       if (!res.ok) throw new Error(data?.error || `GET failed: ${res.status} ${txt}`);

//       setHero({
//         content: data?.content || "",
//         imageKey: data?.imageKey || "",
//         displayUrl: data?.imageUrl || "", // presigned URL (expires ~60s)
//       });
//     } catch (e) {
//       console.error("❌ Get Hero error:", e);
//       setError(String(e.message || e));
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     setLoading(true);
//     setError("");
//     refreshHero();
//   }, []);

//   // Upload image: send field name "image" (multer-s3), show detailed errors
//   const handleUploadImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // optional: client-side sanity check (10 MB)
//     if (file.size > 10 * 1024 * 1024) {
//       setError("Image is larger than 10 MB. Please pick a smaller file.");
//       return;
//     }

//     setUploading(true);
//     setSuccess("");
//     setError("");

//     try {
//       const form = new FormData();
//       form.append("image", file);

//       // If NEXT_PUBLIC_UPLOAD_BASE is set to an HTTPS backend, use that; otherwise go through /api rewrite
//       const uploadUrl = `${UPLOAD_BASE}/api/hero/upload-image`;

//       const res = await fetch(uploadUrl, { method: "POST", body: form });
//       const txt = await res.text();
//       let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }

//       if (!res.ok) {
//         throw new Error(
//           `Upload failed (${res.status}). ` +
//           (data?.error || data?.message || txt || "No error body")
//         );
//       }

//       // Backend returns { key, bucket }
//       if (!data?.key) throw new Error("Server did not return 'key' for uploaded image.");

//       // Store key and fetch a fresh presigned URL for preview
//       setHero(p => ({ ...p, imageKey: data.key }));
//       await refreshHero();

//       setSuccess("✅ Image uploaded!");
//     } catch (e2) {
//       console.error("❌ Upload Hero Image error:", e2);
//       setError(String(e2.message || e2));
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Save content + imageKey (the backend stores the S3 key; it can also accept imageUrl but prefers key)
//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     setError("");

//     try {
//       const payload = {
//         content: hero.content,
//         imageKey: hero.imageKey || undefined,
//       };

//       const res = await fetch(`${API}/api/hero/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const txt = await res.text();
//       let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }

//       if (!res.ok) {
//         throw new Error(
//           `Save failed (${res.status}). ` +
//           (data?.error || data?.message || txt || "No error body")
//         );
//       }

//       // Response shape: { content, imageKey }
//       setHero(p => ({ ...p, imageKey: data?.imageKey || p.imageKey }));
//       setSuccess("✅ Saved!");
//     } catch (e2) {
//       console.error("❌ Save Hero error:", e2);
//       setError(String(e2.message || e2));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // If presigned URL expires (60s), allow manual refresh
//   const handleRefreshPreview = async () => {
//     setError("");
//     await refreshHero();
//   };

//   // Preview: About concatenates backendBaseUrl for relative paths; here we only do that if it isn't absolute
//   const previewSrc = hero.displayUrl
//     ? (isAbs(hero.displayUrl) ? hero.displayUrl : join(backendBaseUrl, hero.displayUrl))
//     : "";

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         {loading ? (
//           <div className="text-muted">Loading…</div>
//         ) : (
//           <>
//             {/* Preview (same style as About) */}
//             <div className="row g-5 mb-4">
//               <div className="col-lg-6">
//                 {previewSrc ? (
//                   <RBImage
//                     src={previewSrc}
//                     alt="Hero"
//                     className="img-fluid"
//                     style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//                     onError={() => setError("Image failed to load (presigned URL may have expired). Click 'Refresh preview'.")}
//                   />
//                 ) : (
//                   <div className="text-muted">No image uploaded yet</div>
//                 )}
//                 <div className="d-flex gap-2 mt-2">
//                   <Form.Control type="file" onChange={handleUploadImage} disabled={uploading} />
//                   <Button variant="outline-secondary" onClick={handleRefreshPreview}>
//                     Refresh preview
//                   </Button>
//                 </div>
//                 {uploading && <small className="text-muted">Uploading…</small>}
//               </div>

//               <div className="col-lg-6">
//                 <Form.Group className="mb-3">
//                   <Form.Label>Hero Headline</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     value={hero.content || ""}
//                     onChange={(e) => setHero(p => ({ ...p, content: e.target.value }))}
//                     placeholder="Write a motivational welcome message..."
//                   />
//                 </Form.Group>

//                 <div className="small text-muted">
//                   <div><strong>Stored key:</strong> {hero.imageKey || "(none)"} </div>
//                   <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (expires ~60s)" : "(none)"} </div>
//                 </div>
//               </div>
//             </div>

//             {/* Save (mirrors About) */}
//             <div className="d-flex justify-content-end">
//               <Button onClick={handleSave} disabled={saving}>
//                 {saving ? "Saving…" : "💾 Save"}
//               </Button>
//             </div>
//           </>
//         )}
//       </Card>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default HeroEditorPage;



// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Image as RBImage, Alert } from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { userId, templateId } from "../../lib/config";

/**
 * IMPORTANT
 * - We always call RELATIVE '/api/...': same origin => no CORS.
 * - Upload uses your generic route: /api/upload/:userId/:templateId/hero
 * - Save includes { userId, templateId } like you do in Postman.
 */

async function readErr(res) {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
}

async function presign(key) {
  if (!key) return "";
  const res = await fetch(`/api/upload/file-url?key=${encodeURIComponent(key)}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(await readErr(res));
  const j = await res.json();
  return j?.url || j?.signedUrl || j || "";
}

function HeroEditorPage() {
  const [hero, setHero] = useState({ content: "", imageKey: "", displayUrl: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshHero = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`/api/hero/${userId}/${templateId}`, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();

      let url = data?.imageUrl || "";
      if (!url && data?.imageKey) {
        try { url = await presign(data.imageKey); } catch (e) { console.warn("presign failed:", e); }
      }

      setHero({
        content: data?.content || data?.title || "",
        imageKey: data?.imageKey || "",
        displayUrl: url || "",
      });
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshHero(); }, []);

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

    setUploading(true); setSuccess(""); setError("");
    try {
      const form = new FormData();
      form.append("image", file); // field name must be "image"

      // ✅ Your working generic uploader
      const url = `/api/upload/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/hero`;
      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();
      if (!data?.key) throw new Error("Upload ok but no 'key' returned");

      setHero(p => ({ ...p, imageKey: data.key }));
      await refreshHero();
      setSuccess("✅ Image uploaded!");
    } catch (e2) {
      setError(String(e2.message || e2));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  const handleSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      const payload = {
        userId,                // ✅ include IDs (matches what worked in Postman)
        templateId,            // ✅
        content: hero.content, // send both content+title in case backend uses one
        title: hero.content,
        imageKey: hero.imageKey || undefined,
      };

      const res = await fetch(`/api/hero/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readErr(res));

      await refreshHero();
      setSuccess("✅ Saved!");
    } catch (e2) {
      setError(String(e2.message || e2));
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshPreview = async () => {
    try {
      setError("");
      if (hero.imageKey) {
        const url = await presign(hero.imageKey);
        setHero(p => ({ ...p, displayUrl: url || "" }));
      } else {
        await refreshHero();
      }
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger" style={{whiteSpace:"pre-wrap"}}>{error}</Alert>}

      <Card className="p-4 shadow-sm">
        {loading ? <div className="text-muted">Loading…</div> : (
          <>
            <div className="row g-5 mb-4">
              <div className="col-lg-6">
                {hero.displayUrl ? (
                  <RBImage
                    src={hero.displayUrl}
                    alt="Hero"
                    className="img-fluid"
                    style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
                    onError={() => setError("Preview failed (URL may have expired). Click 'Refresh preview'.")}
                  />
                ) : <div className="text-muted">No image uploaded yet</div>}

                <div className="d-flex gap-2 mt-2">
                  <Form.Control type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                  <Button variant="outline-secondary" onClick={handleRefreshPreview}>Refresh preview</Button>
                </div>
                {uploading && <small className="text-muted">Uploading…</small>}
              </div>

              <div className="col-lg-6">
                <Form.Group className="mb-3">
                  <Form.Label>Hero Headline</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={hero.content || ""}
                    onChange={(e)=>setHero(p=>({ ...p, content: e.target.value }))}
                    placeholder="Write a motivational welcome message..."
                  />
                </Form.Group>

                <div className="small text-muted">
                  <div><strong>Stored key:</strong> {hero.imageKey || "(none)"} </div>
                  <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (expires ~60s)" : "(none)"} </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "💾 Save"}</Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;

