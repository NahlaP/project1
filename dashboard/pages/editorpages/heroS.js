
// upload content works fine but not image

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






// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Card, Form, Button, Image as RBImage, Alert } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId } from "../../lib/config";

// /** Helpers */
// async function readErr(res) {
//   const txt = await res.text().catch(() => "");
//   try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
//   catch { return txt || `HTTP ${res.status}`; }
// }
// async function presign(key) {
//   if (!key) return "";
//   const res = await fetch(`/api/upload/file-url?key=${encodeURIComponent(key)}`, {
//     headers: { Accept: "application/json" },
//     cache: "no-store",
//   });
//   if (!res.ok) throw new Error(await readErr(res));
//   const j = await res.json();
//   return j?.url || j?.signedUrl || j || "";
// }

// function HeroEditorPage() {
//   const [hero, setHero]   = useState({ content: "", imageKey: "", displayUrl: "" });
//   const [success, setSuccess] = useState("");
//   const [error, setError]     = useState("");
//   const [saving, setSaving]   = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading]     = useState(true);

//   /** Load current hero from server */
//   const refreshHero = async () => {
//     try {
//       setLoading(true); setError("");
//       const res = await fetch(`/api/hero/${userId}/${templateId}`, {
//         headers: { Accept: "application/json" }, cache: "no-store"
//       });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();

//       // If server returned a signed URL use it; otherwise presign from key.
//       let url = data?.imageUrl || "";
//       if (!url && data?.imageKey) {
//         try { url = await presign(data.imageKey); } catch {}
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

//   /** Upload image -> keep new key locally and show preview immediately */
//   const handleUploadImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

//     setUploading(true); setSuccess(""); setError("");
//     try {
//       const form = new FormData();
//       form.append("image", file); // field name must be "image"

//       const url = `/api/upload/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/hero`;
//       const res = await fetch(url, { method: "POST", body: form });
//       if (!res.ok) throw new Error(await readErr(res));
//       const data = await res.json();
//       if (!data?.key) throw new Error("Upload ok but no 'key' returned");

//       // ⛔️ Do NOT refresh from the server now (it still has the old key).
//       // ✅ Show the new image immediately using a presigned URL.
//       const signed = await presign(data.key);
//       setHero(p => ({ ...p, imageKey: data.key, displayUrl: signed || p.displayUrl }));
//       setSuccess("✅ Image uploaded! Click Save to persist.");
//     } catch (e2) {
//       setError(String(e2.message || e2));
//     } finally {
//       setUploading(false);
//       try { e.target.value = ""; } catch {}
//     }
//   };

//   /** Save text + current imageKey to backend */
//   const handleSave = async () => {
//     setSaving(true); setSuccess(""); setError("");
//     try {
//       const payload = {
//         userId,
//         templateId,
//         content: hero.content,
//         title: hero.content,          // harmless if backend ignores
//         imageKey: hero.imageKey || undefined,
//       };
//       const res = await fetch(`/api/hero/save`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(await readErr(res));

//       // Optional: re-pull to confirm persisted state
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
//         {loading ? (
//           <div className="text-muted">Loading…</div>
//         ) : (
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
//                   <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (temporary)" : "(none)"} </div>
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




















// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\heroS.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Image as RBImage, Alert } from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { userId, templateId } from "../../lib/config";

/** Helpers */
async function readErr(res) {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
}
async function presign(key) {
  if (!key) return "";
  const res = await fetch(`/api/upload/file-url?key=${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readErr(res));
  const j = await res.json();
  return j?.url || j?.signedUrl || j || "";
}

function HeroEditorPage() {
  const [hero, setHero]   = useState({ content: "", imageKey: "", displayUrl: "" });
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(true);

  /** Load current hero from server */
  const refreshHero = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`/api/hero/${userId}/${templateId}`, {
        headers: { Accept: "application/json" }, cache: "no-store"
      });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();

      // If server returned a signed URL use it; otherwise presign from key.
      let url = data?.imageUrl || "";
      if (!url && data?.imageKey) {
        try { url = await presign(data.imageKey); } catch {}
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

  /** Upload image -> keep new key locally and show preview immediately */
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image > 10MB"); return; }

    setUploading(true); setSuccess(""); setError("");
    try {
      const form = new FormData();
      form.append("image", file); // field name must be "image"

      const url = `/api/upload/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/hero`;
      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const data = await res.json();
      if (!data?.key) throw new Error("Upload ok but no 'key' returned");

      // ⛔️ Do NOT refresh from the server now (it still has the old key).
      // ✅ Show the new image immediately using a presigned URL.
      const signed = await presign(data.key);
      setHero(p => ({ ...p, imageKey: data.key, displayUrl: signed || p.displayUrl }));
      setSuccess("✅ Image uploaded! Click Save to persist.");
    } catch (e2) {
      setError(String(e2.message || e2));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  /** Save text + current imageKey to backend */
  const handleSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      const payload = {
        userId,
        templateId,
        content: hero.content,
        title: hero.content,          // harmless if backend ignores
        imageKey: hero.imageKey || undefined,
      };
      const res = await fetch(`/api/hero/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readErr(res));

      // Optional: re-pull to confirm persisted state
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
        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
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
                  <div><strong>Preview URL:</strong> {hero.displayUrl ? "presigned (temporary)" : "(none)"} </div>
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
