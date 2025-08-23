







// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Alert,
//   Table,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config"; // ✅ Import config

// function WhyChooseEditorPage() {
//   const [data, setData] = useState({
//     description: "",
//     stats: [],
//     progressBars: [],
//     bgImageUrl: "",
//     bgOverlay: 0.5,
//   });
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`);
//       const json = await res.json();
//       if (json) setData((p) => ({ ...p, ...json }));
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setData((prev) => ({ ...prev, [key]: value }));
//   };

//   const updateArray = (field, idx, key, value) => {
//     const updated = [...data[field]];
//     updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
//     setData((p) => ({ ...p, [field]: updated }));
//   };

//   const addItem = (field, defaultItem) => {
//     setData((p) => ({ ...p, [field]: [...(p[field] || []), defaultItem] }));
//   };

//   const removeItem = (field, idx) => {
//     const updated = [...data[field]];
//     updated.splice(idx, 1);
//     setData((p) => ({ ...p, [field]: updated }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       const json = await res.json();
//       if (json.message) setSuccess("✅ Saved!");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUploadBg = async (e) => {
//     if (!e.target.files?.length) return;
//     setUploading(true);
//     try {
//       const form = new FormData();
//       form.append("image", e.target.files[0]);

//       const res = await fetch(
//         `${backendBaseUrl}/api/whychoose/${userId}/${templateId}/bg`,
//         { method: "POST", body: form }
//       );
//       const json = await res.json();
//       if (json?.result?.bgImageUrl) {
//         setData((p) => ({ ...p, bgImageUrl: json.result.bgImageUrl }));
//         setSuccess("✅ Background image uploaded!");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDeleteBg = async () => {
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/whychoose/${userId}/${templateId}/bg`,
//         { method: "DELETE" }
//       );
//       const json = await res.json();
//       if (json.message) {
//         setData((p) => ({ ...p, bgImageUrl: "" }));
//         setSuccess("🗑️ Background removed");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">🏆 Why Choose Us Section</h4>
//         </Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}

//       {/* Preview */}
//       <Row className="mb-4">
//         <Col>
//           <Card
//             className="p-0 overflow-hidden"
//             style={{
//               backgroundImage: data.bgImageUrl
//                 ? `url(${backendBaseUrl}${data.bgImageUrl})`
//                 : "none",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               position: "relative",
//               minHeight: 480,
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 background: `rgba(0,0,0,${data.bgOverlay || 0})`,
//               }}
//             />
//             <div className="p-4 position-relative" style={{ zIndex: 2 }}>
//               <h1 className="display-6 text-white text-uppercase mb-4">
//                 Why You Should Choose Our Services
//               </h1>
//               <p className="text-light mb-4">
//                 {data.description || "Description here..."}
//               </p>

//               <Row className="mb-4">
//                 {data.stats.map((s, i) => (
//                   <Col key={i} sm={6} className="wow fadeIn">
//                     <div className="flex-column text-center border border-5 border-primary p-5">
//                       <h1 className="text-white">{s.value}</h1>
//                       <p className="text-white text-uppercase mb-0">{s.label}</p>
//                     </div>
//                   </Col>
//                 ))}
//               </Row>

//               <div className="border border-5 border-primary border-bottom-0 p-4">
//                 {data.progressBars.map((bar, i) => (
//                   <div key={i} className="mb-3">
//                     <div className="d-flex justify-content-between mb-2">
//                       <span className="text-white text-uppercase">{bar.label}</span>
//                       <span className="text-white">{bar.percent}%</span>
//                     </div>
//                     <div className="progress">
//                       <div
//                         className="progress-bar bg-primary"
//                         role="progressbar"
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                         aria-valuenow={bar.percent}
//                         style={{ width: `${bar.percent}%` }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* Editor Form */}
//       <Card className="p-4 shadow-sm">
//         <Row className="mb-4">
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Background Image</Form.Label>
//               <Form.Control type="file" accept="image/*" onChange={handleUploadBg} />
//               {uploading && <small className="text-muted">Uploading…</small>}
//               {data.bgImageUrl && (
//                 <div className="mt-2 d-flex align-items-center gap-2">
//                   <img
//                     src={`${backendBaseUrl}${data.bgImageUrl}`}
//                     alt="bg"
//                     style={{ height: 60, borderRadius: 4 }}
//                   />
//                   <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
//                     Remove
//                   </Button>
//                 </div>
//               )}
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group>
//               <Form.Label>Overlay (0 - 1)</Form.Label>
//               <Form.Range
//                 min={0}
//                 max={1}
//                 step={0.05}
//                 value={data.bgOverlay ?? 0.5}
//                 onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
//               />
//               <div className="text-muted small">{data.bgOverlay ?? 0.5}</div>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Form.Group className="mb-4">
//           <Form.Label>Description</Form.Label>
//           <Form.Control
//             as="textarea"
//             rows={3}
//             value={data.description || ""}
//             onChange={(e) => handleChange("description", e.target.value)}
//           />
//         </Form.Group>

//         <h6 className="fw-bold">📊 Stats</h6>
//         <Table bordered size="sm">
//           <thead>
//             <tr><th>Label</th><th>Value</th><th>Action</th></tr>
//           </thead>
//           <tbody>
//             {data.stats.map((s, i) => (
//               <tr key={i}>
//                 <td>
//                   <Form.Control
//                     value={s.label}
//                     onChange={(e) => updateArray("stats", i, "label", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Form.Control
//                     type="number"
//                     value={s.value}
//                     onChange={(e) => updateArray("stats", i, "value", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button size="sm" variant="outline-danger" onClick={() => removeItem("stats", i)}>❌</Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={3}>
//                 <Button size="sm" variant="outline-primary" onClick={() => addItem("stats", { label: "", value: 0 })}>
//                   ➕ Add Stat
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
//         <Table bordered size="sm">
//           <thead>
//             <tr><th>Label</th><th>Percent</th><th>Action</th></tr>
//           </thead>
//           <tbody>
//             {data.progressBars.map((b, i) => (
//               <tr key={i}>
//                 <td>
//                   <Form.Control
//                     value={b.label}
//                     onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Form.Control
//                     type="number"
//                     value={b.percent}
//                     onChange={(e) => updateArray("progressBars", i, "percent", e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button size="sm" variant="outline-danger" onClick={() => removeItem("progressBars", i)}>❌</Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={3}>
//                 <Button size="sm" variant="outline-primary" onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
//                   ➕ Add Progress Bar
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <div className="text-end">
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving…" : "💾 Save Changes"}
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// WhyChooseEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default WhyChooseEditorPage;





"use client";

import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Alert, Table
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

/* ---------- helpers ---------- */
async function readErr(res) {
  const txt = await res.text().catch(() => "");
  try { const j = JSON.parse(txt); return j?.error || j?.message || txt || `HTTP ${res.status}`; }
  catch { return txt || `HTTP ${res.status}`; }
}
async function presign(key) {
  if (!key) return "";
  const url = `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(await readErr(res));
  const j = await res.json();
  return j?.url || "";
}
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(url);

function WhyChooseEditorPage() {
  const [data, setData] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgImageUrl: "",      // <-- S3 KEY lives here
    bgOverlay: 0.5,
  });
  const [bgDisplayUrl, setBgDisplayUrl] = useState(""); // <-- presigned URL for preview
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const GET_URL = `${backendBaseUrl}/api/whychoose/${userId}/${templateId}`;
  const PUT_URL = GET_URL;
  const UPLOAD_BG_URL = `${backendBaseUrl}/api/whychoose/${userId}/${templateId}/bg`;
  const DELETE_BG_URL = UPLOAD_BG_URL;

  async function refresh() {
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(GET_URL, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(await readErr(res));
      const json = await res.json();
      setData(p => ({ ...p, ...(json || {}) }));

      const key = json?.bgImageUrl || "";
      if (key) {
        try { setBgDisplayUrl(await presign(key)); }
        catch { setBgDisplayUrl(""); }
      } else {
        setBgDisplayUrl("");
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const handleChange = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const updateArray = (field, idx, key, value) => {
    const updated = [...(data[field] || [])];
    if (!updated[idx]) updated[idx] = {};
    updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
    setData(p => ({ ...p, [field]: updated }));
  };

  const addItem = (field, def) => setData(p => ({ ...p, [field]: [...(p[field] || []), def] }));
  const removeItem = (field, idx) => {
    const updated = [...(data[field] || [])];
    updated.splice(idx, 1);
    setData(p => ({ ...p, [field]: updated }));
  };

  const handleSave = async () => {
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch(PUT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await readErr(res));
      const json = await res.json();
      setSuccess(json?.message || "✅ Saved!");
      // re-presign in case key changed on server side
      if (data.bgImageUrl) {
        try { setBgDisplayUrl(await presign(data.bgImageUrl)); } catch {}
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBg = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true); setError(""); setSuccess("");
    try {
      const form = new FormData();
      form.append("image", e.target.files[0]);
      const res = await fetch(UPLOAD_BG_URL, { method: "POST", body: form });
      if (!res.ok) throw new Error(await readErr(res));
      const json = await res.json();

      // server might return { key }, { imageKey }, or { result: { bgImageUrl } }
      const newKey =
        json?.key ||
        json?.imageKey ||
        json?.result?.bgImageUrl ||
        json?.bgImageUrl ||
        "";

      if (!newKey) throw new Error("Upload succeeded but no S3 key returned");

      setData(p => ({ ...p, bgImageUrl: newKey }));
      try { setBgDisplayUrl(await presign(newKey)); } catch {}
      setSuccess("✅ Background image uploaded!");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setUploading(false);
      try { e.target.value = ""; } catch {}
    }
  };

  const handleDeleteBg = async () => {
    setError(""); setSuccess("");
    try {
      const res = await fetch(DELETE_BG_URL, { method: "DELETE" });
      if (!res.ok) throw new Error(await readErr(res));
      await res.json().catch(() => ({}));
      setData(p => ({ ...p, bgImageUrl: "" }));
      setBgDisplayUrl("");
      setSuccess("🗑️ Background removed");
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const handleRefreshPreview = async () => {
    try {
      if (data.bgImageUrl) setBgDisplayUrl(await presign(data.bgImageUrl));
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  return (
    <Container fluid className="py-4">
      <Row><Col><h4 className="fw-bold">🏆 Why Choose Us Section</h4></Col></Row>

      {error && <Alert variant="danger" style={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-0 overflow-hidden"
            style={{
              backgroundImage: bgDisplayUrl ? `url(${bgDisplayUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              minHeight: 480,
            }}
          >
            <div
              style={{
                position: "absolute", inset: 0,
                background: `rgba(0,0,0,${data.bgOverlay || 0})`,
              }}
            />
            <div className="p-4 position-relative" style={{ zIndex: 2 }}>
              <h1 className="display-6 text-white text-uppercase mb-4">
                Why You Should Choose Our Services
              </h1>
              <p className="text-light mb-4">
                {data.description || "Description here..."}
              </p>

              <Row className="mb-4">
                {(data.stats || []).map((s, i) => (
                  <Col key={i} sm={6}>
                    <div className="flex-column text-center border border-5 border-primary p-5">
                      <h1 className="text-white">{s.value}</h1>
                      <p className="text-white text-uppercase mb-0">{s.label}</p>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="border border-5 border-primary border-bottom-0 p-4">
                {(data.progressBars || []).map((bar, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-white text-uppercase">{bar.label}</span>
                      <span className="text-white">{bar.percent}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={bar.percent}
                        style={{ width: `${bar.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div className="mt-2">
            <Button size="sm" variant="outline-secondary" onClick={handleRefreshPreview}>
              Refresh preview
            </Button>
            {loading && <span className="ms-2 text-muted">Loading…</span>}
          </div>
        </Col>
      </Row>

      {/* Editor Form */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Background Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleUploadBg} disabled={uploading} />
              {uploading && <small className="text-muted">Uploading…</small>}
              {data.bgImageUrl && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={bgDisplayUrl || ""}
                    alt="bg"
                    style={{ height: 60, borderRadius: 4 }}
                    onError={() => setError("Preview failed (URL may have expired). Click 'Refresh preview'.")}
                  />
                  <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
                    Remove
                  </Button>
                </div>
              )}
              <div className="small text-muted mt-2">
                <div><strong>Stored key:</strong> {data.bgImageUrl || "(none)"} </div>
                <div><strong>Preview URL:</strong> {bgDisplayUrl ? "active" : "(none)"} </div>
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Overlay (0 - 1)</Form.Label>
              <Form.Range
                min={0} max={1} step={0.05}
                value={data.bgOverlay ?? 0.5}
                onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
              />
              <div className="text-muted small">{data.bgOverlay ?? 0.5}</div>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea" rows={3}
            value={data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Form.Group>

        <h6 className="fw-bold">📊 Stats</h6>
        <Table bordered size="sm">
          <thead><tr><th>Label</th><th>Value</th><th>Action</th></tr></thead>
          <tbody>
            {(data.stats || []).map((s, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={s.label}
                    onChange={(e) => updateArray("stats", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={s.value}
                    onChange={(e) => updateArray("stats", i, "value", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("stats", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary"
                        onClick={() => addItem("stats", { label: "", value: 0 })}>
                  ➕ Add Stat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
        <Table bordered size="sm">
          <thead><tr><th>Label</th><th>Percent</th><th>Action</th></tr></thead>
          <tbody>
            {(data.progressBars || []).map((b, i) => (
              <tr key={i}>
                <td>
                  <Form.Control
                    value={b.label}
                    onChange={(e) => updateArray("progressBars", i, "label", e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={b.percent}
                    onChange={(e) => updateArray("progressBars", i, "percent", e.target.value)}
                  />
                </td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem("progressBars", i)}>❌</Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <Button size="sm" variant="outline-primary"
                        onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
                  ➕ Add Progress Bar
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "💾 Save Changes"}
          </Button>
        </div>
      </Card>
    </Container>
  );
}

WhyChooseEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default WhyChooseEditorPage;
