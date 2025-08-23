
// // upload content works fine but not image

// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Card, Form, Button, Image as RBImage, Alert } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId } from "../../lib/config";

// /**
//  * IMPORTANT
//  * - We always call RELATIVE '/api/...': same origin => no CORS.
//  * - Upload uses your generic route: /api/upload/:userId/:templateId/hero
//  * - Save includes { userId, templateId } like you do in Postman.
//  */

// async function readErr(res) {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// }

// async function presign(key) {
//   if (!key) return "";
//   const res = await fetch(`/api/upload/file-url?key=${encodeURIComponent(key)}`, { headers: { Accept: "application/json" }, cache: "no-store" });
//   if (!res.ok) throw new Error(await readErr(res));
//   const j = await res.json();
//   return j?.url || j?.signedUrl || j || "";
// }

// function HeroEditorPage() {
//   const [hero, setHero] = useState({ content: "", imageKey: "", displayUrl: "" });
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const refreshHero = async () => {
//     try {
//       setLoading(true); setError("");
//       const res = await fetch(`/api/hero/${userId}/${templateId}`, { headers: { Accept: "application/json" }, cache: "no-store" });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();

//       let url = data?.imageUrl || "";
//       if (!url && data?.imageKey) {
//         try { url = await presign(data.imageKey); } catch (e) { console.warn("presign failed:", e); }
//       }

//       setHero({
//         content: data?.content || data?.title || "",
//         imageKey: data?.imageKey || "",
//         displayUrl: url || "",
//       });
//     } catch (e) {
//       setError(String(e.message || e));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { refreshHero(); }, []);

//   const handleUploadImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

//     setUploading(true); setSuccess(""); setError("");
//     try {
//       const form = new FormData();
//       form.append("image", file); // field name must be "image"

//       // ✅ Your working generic uploader
//       const url = `/api/upload/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/hero`;
//       const res = await fetch(url, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();
//       if (!data?.key) throw new Error("Upload ok but no 'key' returned");

//       setHero(p => ({ ...p, imageKey: data.key }));
//       await refreshHero();
//       setSuccess("✅ Image uploaded!");
//     } catch (e2) {
//       setError(String(e2.message || e2));
//     } finally {
//       setUploading(false);
//       try { e.target.value = ""; } catch {}
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true); setSuccess(""); setError("");
//     try {
//       const payload = {
//         userId,                // ✅ include IDs (matches what worked in Postman)
//         templateId,            // ✅
//         content: hero.content, // send both content+title in case backend uses one
//         title: hero.content,
//         imageKey: hero.imageKey || undefined,
//       };

//       const res = await fetch(`/api/hero/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       await refreshHero();
//       setSuccess("✅ Saved!");
//     } catch (e2) {
//       setError(String(e2.message || e2));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleRefreshPreview = async () => {
//     try {
//       setError("");
//       if (hero.imageKey) {
//         const url = await presign(hero.imageKey);
//         setHero(p => ({ ...p, displayUrl: url || "" }));
//       } else {
//         await refreshHero();
//       }
//     } catch (e) {
//       setError(String(e.message || e));
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>
//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger" style={{whiteSpace:"pre-wrap"}}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         {loading ? <div className="text-muted">Loading…</div> : (
//           <>
//             <div className="row g-5 mb-4">
//               <div className="col-lg-6">
//                 {hero.displayUrl ? (
//                   <RBImage
//                     src={hero.displayUrl}
//                     alt="Hero"
//                     className="img-fluid"
//                     style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//                     onError={() => setError("Preview failed (URL may have expired). Click 'Refresh preview'.")}
//                   />
//                 ) : <div className="text-muted">No image uploaded yet</div>}

//                 <div className="d-flex gap-2 mt-2">
//                   <Form.Control type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
//                   <Button variant="outline-secondary" onClick={handleRefreshPreview}>Refresh preview</Button>
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
//                     onChange={(e)=>setHero(p=>({ ...p, content: e.target.value }))}
//                     placeholder="Write a motivational welcome message..."
//                   />
//                 </Form.Group>

//                 <div className="small text-muted">
//                   <div><strong>Stored key:</strong> {hero.imageKey || "(none)"} </div>
//                   <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (expires ~60s)" : "(none)"} </div>
//                 </div>
//               </div>
//             </div>

//             <div className="d-flex justify-content-end">
//               <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "💾 Save"}</Button>
//             </div>
//           </>
//         )}
//       </Card>
//     </Container>
//   );
// }

// HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
// export default HeroEditorPage;



























// // pages/editorpages/heroS.js
// import React, { useEffect, useState } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId, s3Bucket, s3Region } from "../../lib/config";

// /** Helpers */
// async function readErr(res) {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// }
// async function presign(key) {
//   if (!key) return "";
//   const url = `/api/upload/file-url?key=${encodeURIComponent(key)}`;
//   const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
//   if (!res.ok) throw new Error(await readErr(res));
//   const j = await res.json();
//   return j?.url || j?.signedUrl || "";
// }
// const publicUrlFromKey = (key) => (key ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}` : "");
// const bust = (url) => (url ? `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}` : "");

// function HeroEditorPage() {
//   const [hero, setHero] = useState({ content: "", imageKey: "", displayUrl: "" });
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const HERO_GET = `/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const HERO_UPLOAD = `/api/hero/upload-image`;              // legacy upload route
//   const HERO_SAVE = `/api/hero/save`;                        // ✅ use legacy SAVE (POST)

//   const refreshHero = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(`${HERO_GET}?t=${Date.now()}`, {
//         headers: { Accept: "application/json" },
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();

//       // Prefer fresh URL derived from imageKey; fallback to imageUrl
//       let url = "";
//       if (data?.imageKey) {
//         try { url = await presign(data.imageKey); } catch {}
//         if (!url) url = publicUrlFromKey(data.imageKey);
//       }
//       if (!url) url = data?.imageUrl || "";

//       setHero({
//         content: data?.content || data?.title || "",
//         imageKey: data?.imageKey || "",
//         displayUrl: bust(url || ""),
//       });
//     } catch (e) {
//       setError(String(e.message || e));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { refreshHero(); }, []);

//   const handleUploadImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

//     setUploading(true); setSuccess(""); setError("");
//     try {
//       const form = new FormData();
//       form.append("image", file); // multer expects "image"

//       const res = await fetch(HERO_UPLOAD, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await readErr(res));
//       const up = await res.json().catch(() => ({}));

//       // Try to get the key from upload response
//       const newKey = up?.imageKey || up?.key || up?.s3Key || "";
//       if (newKey) {
//         let url = "";
//         try { url = await presign(newKey); } catch {}
//         if (!url) url = publicUrlFromKey(newKey);

//         setHero(p => ({ ...p, imageKey: newKey, displayUrl: bust(url || p.displayUrl) }));

//         // Persist the new key + current text (uses legacy POST /api/hero/save)
//         await fetch(HERO_SAVE, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId, templateId,
//             content: (hero.content || ""),
//             title: (hero.content || ""),
//             imageKey: newKey,
//           }),
//         }).catch(() => {});
//       } else {
//         // Fallback: pull whatever the server now has
//         await refreshHero();
//       }

//       setSuccess("✅ Image uploaded!");
//     } catch (e2) {
//       setError(String(e2.message || e2));
//     } finally {
//       setUploading(false);
//       try { e.target.value = ""; } catch {}
//     }
//   };

//   const handleSave = async (silent = false) => {
//     const payload = {
//       userId,
//       templateId,
//       content: hero.content || "",
//       title: hero.content || "",
//       ...(hero.imageKey ? { imageKey: hero.imageKey } : {}),
//     };

//     try {
//       if (!silent) { setSaving(true); setSuccess(""); setError(""); }
//       // ✅ save to POST /api/hero/save
//       const res = await fetch(HERO_SAVE, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));
//       await refreshHero();
//       if (!silent) setSuccess("✅ Saved!");
//     } catch (e2) {
//       if (!silent) setError(String(e2.message || e2));
//       else console.warn("Silent save failed:", e2);
//     } finally {
//       if (!silent) setSaving(false);
//     }
//   };

//   const handleRefreshPreview = async () => {
//     try {
//       setError("");
//       if (hero.imageKey) {
//         let url = "";
//         try { url = await presign(hero.imageKey); } catch {}
//         if (!url) url = publicUrlFromKey(hero.imageKey);
//         setHero(p => ({ ...p, displayUrl: bust(url || p.displayUrl) }));
//       } else {
//         await refreshHero();
//       }
//     } catch (e) {
//       setError(String(e.message || e));
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>
//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         {loading ? <div className="text-muted">Loading…</div> : (
//           <>
//             <div className="row g-5 mb-4">
//               <div className="col-lg-6">
//                 {hero.displayUrl ? (
//                   <RBImage
//                     key={hero.displayUrl}      // force React to replace <img>
//                     src={hero.displayUrl}      // cache-busted
//                     alt="Hero"
//                     className="img-fluid"
//                     style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//                     onError={() => setError("Preview failed (URL may have expired). Click 'Refresh preview'.")}
//                   />
//                 ) : <div className="text-muted">No image uploaded yet</div>}

//                 <div className="d-flex gap-2 mt-2">
//                   <Form.Control type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
//                   <Button variant="outline-secondary" onClick={handleRefreshPreview}>Refresh preview</Button>
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
//                   <div><strong>Preview URL:</strong> {hero.displayUrl ? "active (cache-busted)" : "(none)"} </div>
//                 </div>
//               </div>
//             </div>

//             <div className="d-flex justify-content-end">
//               <Button onClick={() => handleSave(false)} disabled={saving}>
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







// // pages/editorpages/heroS.js
// import React, { useEffect, useState } from "react";
// import {
//   Container, Row, Col, Card, Form, Button, Image as RBImage, Alert
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId, s3Bucket, s3Region } from "../../lib/config";

// /** Helpers */
// async function readErr(res) {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// }
// async function presign(key) {
//   if (!key) return "";
//   const url = `/api/upload/file-url?key=${encodeURIComponent(key)}`;
//   const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
//   if (!res.ok) throw new Error(await readErr(res));
//   const j = await res.json();
//   return j?.url || j?.signedUrl || "";
// }
// const publicUrlFromKey = (key) => (key ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}` : "");

// // IMPORTANT: do NOT cache-bust pre-signed S3 URLs (signature covers the whole query string)
// const isPresigned = (url) =>
//   /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(url);
// const bust = (url) => {
//   if (!url) return "";
//   return isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
// };

// function HeroEditorPage() {
//   const [hero, setHero] = useState({ content: "", imageKey: "", displayUrl: "" });
//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const HERO_GET = `/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   const HERO_UPLOAD = `/api/hero/upload-image`;              // legacy upload route
//   const HERO_SAVE = `/api/hero/save`;                        // legacy save (POST)

//   const refreshHero = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(`${HERO_GET}?t=${Date.now()}`, {
//         headers: { Accept: "application/json" },
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();

//       // Prefer fresh URL derived from imageKey; fallback to imageUrl
//       let url = "";
//       if (data?.imageKey) {
//         try { url = await presign(data.imageKey); } catch {}
//         if (!url) url = publicUrlFromKey(data.imageKey);
//       }
//       if (!url) url = data?.imageUrl || "";

//       setHero({
//         content: data?.content || data?.title || "",
//         imageKey: data?.imageKey || "",
//         displayUrl: bust(url || ""),
//       });
//     } catch (e) {
//       setError(String(e.message || e));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { refreshHero(); }, []);

//   const handleUploadImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

//     setUploading(true); setSuccess(""); setError("");
//     try {
//       const form = new FormData();
//       form.append("image", file); // multer expects "image"

//       const res = await fetch(HERO_UPLOAD, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await readErr(res));
//       const up = await res.json().catch(() => ({}));

//       // Try to get the key from upload response
//       const newKey = up?.imageKey || up?.key || up?.s3Key || "";
//       if (newKey) {
//         let url = "";
//         try { url = await presign(newKey); } catch {}
//         if (!url) url = publicUrlFromKey(newKey);

//         setHero(p => ({ ...p, imageKey: newKey, displayUrl: bust(url || p.displayUrl) }));

//         // Persist the new key + current text (uses legacy POST /api/hero/save)
//         await fetch(HERO_SAVE, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId, templateId,
//             content: (hero.content || ""),
//             title: (hero.content || ""),
//             imageKey: newKey,
//           }),
//         }).catch(() => {});
//       } else {
//         // Fallback: pull whatever the server now has
//         await refreshHero();
//       }

//       setSuccess("✅ Image uploaded!");
//     } catch (e2) {
//       setError(String(e2.message || e2));
//     } finally {
//       setUploading(false);
//       try { e.target.value = ""; } catch {}
//     }
//   };

//   const handleSave = async (silent = false) => {
//     const payload = {
//       userId,
//       templateId,
//       content: hero.content || "",
//       title: hero.content || "",
//       ...(hero.imageKey ? { imageKey: hero.imageKey } : {}),
//     };

//     try {
//       if (!silent) { setSaving(true); setSuccess(""); setError(""); }
//       // save to POST /api/hero/save
//       const res = await fetch(HERO_SAVE, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));
//       await refreshHero();
//       if (!silent) setSuccess("✅ Saved!");
//     } catch (e2) {
//       if (!silent) setError(String(e2.message || e2));
//       else console.warn("Silent save failed:", e2);
//     } finally {
//       if (!silent) setSaving(false);
//     }
//   };

//   const handleRefreshPreview = async () => {
//     try {
//       setError("");
//       if (hero.imageKey) {
//         let url = "";
//         try { url = await presign(hero.imageKey); } catch {}
//         if (!url) url = publicUrlFromKey(hero.imageKey);
//         setHero(p => ({ ...p, displayUrl: bust(url || p.displayUrl) }));
//       } else {
//         await refreshHero();
//       }
//     } catch (e) {
//       setError(String(e.message || e));
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>
//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

//       <Card className="p-4 shadow-sm">
//         {loading ? <div className="text-muted">Loading…</div> : (
//           <>
//             <div className="row g-5 mb-4">
//               <div className="col-lg-6">
//                 {hero.displayUrl ? (
//                   <RBImage
//                     key={hero.displayUrl}
//                     src={hero.displayUrl}    // cache-busted unless pre-signed
//                     alt="Hero"
//                     className="img-fluid"
//                     style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
//                     onError={() => setError("Preview failed (URL may have expired). Click 'Refresh preview'.")}
//                   />
//                 ) : <div className="text-muted">No image uploaded yet</div>}

//                 <div className="d-flex gap-2 mt-2">
//                   <Form.Control type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
//                   <Button variant="outline-secondary" onClick={handleRefreshPreview}>Refresh preview</Button>
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
//                   <div><strong>Preview URL:</strong> {hero.displayUrl ? "active" : "(none)"} </div>
//                 </div>
//               </div>
//             </div>

//             <div className="d-flex justify-content-end">
//               <Button onClick={() => handleSave(false)} disabled={saving}>
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




















// dashboard/pages/editorpages/heroS.js
"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Image as RBImage, Alert } from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";

const API = backendBaseUrl || "";                 // keep '' so Next rewrite proxies /api → backend
const absFromKey = (key) =>
  key ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}` : "";

const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
};

function HeroEditorPage() {
  const [state, setState] = useState({
    content: "",
    imageKey: "",
    displayUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const GET_URL = `${API}/api/hero/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
  const PUT_URL = GET_URL;
  const UPLOAD_URL = `${GET_URL}/image`;

  const loadHero = async () => {
    setError("");
    const res = await fetch(`${GET_URL}?t=${Date.now()}`, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(await readErr(res));
    const data = await res.json();
    setState({
      content: data?.content || "",
      imageKey: data?.imageKey || "",
      displayUrl: data?.imageUrl || absFromKey(data?.imageKey || ""),
    });
  };

  useEffect(() => { loadHero().catch((e) => setError(String(e.message || e))); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be ≤ 10 MB"); e.target.value = ""; return; }

    setUploading(true); setSuccess(""); setError("");
    try {
      const form = new FormData();
      form.append("image", file); // multer expects "image"
      const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const j = await res.json();

      // backend already persisted the key; we just refresh UI
      setState((p) => ({
        ...p,
        imageKey: j?.imageKey || j?.key || p.imageKey,
        displayUrl: j?.imageUrl || absFromKey(j?.imageKey || j?.key || ""),
      }));
      setSuccess("✅ Image uploaded!");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  const onSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: state.content || "",
          imageKey: state.imageKey || "",   // controller accepts imageKey or imageUrl
        }),
      });
      if (!res.ok) throw new Error(await readErr(res));
      await loadHero();
      setSuccess("✅ Saved!");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const refreshPreview = async () => {
    try { await loadHero(); } catch (e) { setError(String(e.message || e)); }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🖼️ Hero Section</h4></Col></Row>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <div className="row g-5">
          <div className="col-lg-6">
            {state.displayUrl ? (
              <RBImage
                src={state.displayUrl}
                alt="Hero"
                className="img-fluid"
                style={{ maxHeight: 350, objectFit: "cover", width: "100%" }}
                onError={() => setError("Preview failed (URL may be expired). Click “Refresh preview”.")}
              />
            ) : (
              <div className="text-muted">No image uploaded yet</div>
            )}
            <div className="d-flex gap-2 mt-2">
              <Form.Control type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
              <Button variant="outline-secondary" onClick={refreshPreview}>Refresh preview</Button>
            </div>
            {uploading && <small className="text-muted">Uploading…</small>}
            <div className="small text-muted mt-2">
              <div><strong>Stored key:</strong> {state.imageKey || "(none)"} </div>
              <div><strong>Preview URL:</strong> {state.displayUrl ? "active" : "(none)"} </div>
            </div>
          </div>

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

            <div className="d-flex justify-content-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "💾 Save"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
}

HeroEditorPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default HeroEditorPage;









