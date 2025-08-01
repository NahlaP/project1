
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

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

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
//             {/* overlay */}
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

//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         {/* BG image + overlay */}
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
//           <Form.Group>
//             <Form.Label>Overlay (0 - 1)</Form.Label>
//             <Form.Range
//               min={0}
//               max={1}
//               step={0.05}
//               value={data.bgOverlay ?? 0.5}
//               onChange={(e) => handleChange("bgOverlay", parseFloat(e.target.value))}
//             />
//             <div className="text-muted small">{data.bgOverlay ?? 0.5}</div>
//           </Form.Group>
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
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
} from "react-bootstrap";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config"; // ✅ Import config

function WhyChooseEditorPage() {
  const [data, setData] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgImageUrl: "",
    bgOverlay: 0.5,
  });
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`);
      const json = await res.json();
      if (json) setData((p) => ({ ...p, ...json }));
    })();
  }, []);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateArray = (field, idx, key, value) => {
    const updated = [...data[field]];
    updated[idx][key] = key === "value" || key === "percent" ? Number(value) : value;
    setData((p) => ({ ...p, [field]: updated }));
  };

  const addItem = (field, defaultItem) => {
    setData((p) => ({ ...p, [field]: [...(p[field] || []), defaultItem] }));
  };

  const removeItem = (field, idx) => {
    const updated = [...data[field]];
    updated.splice(idx, 1);
    setData((p) => ({ ...p, [field]: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.message) setSuccess("✅ Saved!");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBg = async (e) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", e.target.files[0]);

      const res = await fetch(
        `${backendBaseUrl}/api/whychoose/${userId}/${templateId}/bg`,
        { method: "POST", body: form }
      );
      const json = await res.json();
      if (json?.result?.bgImageUrl) {
        setData((p) => ({ ...p, bgImageUrl: json.result.bgImageUrl }));
        setSuccess("✅ Background image uploaded!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBg = async () => {
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/whychoose/${userId}/${templateId}/bg`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.message) {
        setData((p) => ({ ...p, bgImageUrl: "" }));
        setSuccess("🗑️ Background removed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h4 className="fw-bold">🏆 Why Choose Us Section</h4>
        </Col>
      </Row>

      {success && <Alert variant="success">{success}</Alert>}

      {/* Preview */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-0 overflow-hidden"
            style={{
              backgroundImage: data.bgImageUrl
                ? `url(${backendBaseUrl}${data.bgImageUrl})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              minHeight: 480,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
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
                {data.stats.map((s, i) => (
                  <Col key={i} sm={6} className="wow fadeIn">
                    <div className="flex-column text-center border border-5 border-primary p-5">
                      <h1 className="text-white">{s.value}</h1>
                      <p className="text-white text-uppercase mb-0">{s.label}</p>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="border border-5 border-primary border-bottom-0 p-4">
                {data.progressBars.map((bar, i) => (
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
        </Col>
      </Row>

      {/* Editor Form */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Background Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleUploadBg} />
              {uploading && <small className="text-muted">Uploading…</small>}
              {data.bgImageUrl && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img
                    src={`${backendBaseUrl}${data.bgImageUrl}`}
                    alt="bg"
                    style={{ height: 60, borderRadius: 4 }}
                  />
                  <Button variant="outline-danger" size="sm" onClick={handleDeleteBg}>
                    Remove
                  </Button>
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Overlay (0 - 1)</Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
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
            as="textarea"
            rows={3}
            value={data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </Form.Group>

        <h6 className="fw-bold">📊 Stats</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Value</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data.stats.map((s, i) => (
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
                <Button size="sm" variant="outline-primary" onClick={() => addItem("stats", { label: "", value: 0 })}>
                  ➕ Add Stat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <h6 className="fw-bold mt-4">📈 Progress Bars</h6>
        <Table bordered size="sm">
          <thead>
            <tr><th>Label</th><th>Percent</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data.progressBars.map((b, i) => (
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
                <Button size="sm" variant="outline-primary" onClick={() => addItem("progressBars", { label: "", percent: 0 })}>
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

