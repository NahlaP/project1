

// // og

// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactS.js
// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Alert,
//   Toast,
//   ToastContainer,
// } from 'react-bootstrap';
// import EditorDashboardLayout from '../layouts/EditorDashboardLayout';
// import { backendBaseUrl, userId, templateId } from '../../lib/config';
// import BackBar from "../components/BackBar";

// function ContactEditor() {
//   const [form, setForm] = useState({
//     address: '',
//     phone: '',
//     email: '',
//     socialLinks: {
//       facebook: '',
//       twitter: '',
//       youtube: '',
//       linkedin: '',
//     },
//     businessHours: {
//       mondayToFriday: '',
//       saturday: '',
//       sunday: '',
//     },
//   });

//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showToast, setShowToast] = useState(false);

//   // Ensure nested objects exist (in case backend omits them)
//   const normalize = (data) => ({
//     address: data?.address || '',
//     phone: data?.phone || '',
//     email: data?.email || '',
//     socialLinks: {
//       facebook: data?.socialLinks?.facebook || '',
//       twitter:  data?.socialLinks?.twitter  || '',
//       youtube:  data?.socialLinks?.youtube  || '',
//       linkedin: data?.socialLinks?.linkedin || '',
//     },
//     businessHours: {
//       mondayToFriday: data?.businessHours?.mondayToFriday || '',
//       saturday:       data?.businessHours?.saturday       || '',
//       sunday:         data?.businessHours?.sunday         || '',
//     },
//   });

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`,
//           { headers: { Accept: 'application/json' }, cache: 'no-store' }
//         );
//         const data = await res.json();
//         if (data) setForm(normalize(data));
//       } catch (err) {
//         console.error(err);
//         setError('❌ Failed to load contact info');
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleNestedChange = (section, key, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [key]: value,
//       },
//     }));
//   };

//   const withHttp = (url) => {
//     if (!url) return '';
//     if (/^https?:\/\//i.test(url)) return url;
//     return `https://${url}`;
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     setSuccess('');
//     setError('');
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/contact-info/${userId}/${templateId}`,
//         {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(form),
//         }
//       );
//       const result = await res.json();
//       if (!res.ok) throw new Error(result?.message || 'Save failed');
//       if (result.message) {
//         setSuccess('✅ Contact info saved successfully!');
//         setShowToast(true);
//       }
//     } catch (err) {
//       setError('❌ Failed to save');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">📞 Contact Section Editor</h4>
//           <BackBar />
//         </Col>
//       </Row>
//       {success && <Alert variant="success">{success}</Alert>}
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="p-4 shadow-sm mb-4">
//         <Row>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Address</Form.Label>
//               <Form.Control
//                 value={form.address}
//                 onChange={(e) => handleChange('address', e.target.value)}
//                 placeholder="123 Example St, City"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Phone</Form.Label>
//               <Form.Control
//                 type="tel"
//                 value={form.phone}
//                 onChange={(e) => handleChange('phone', e.target.value)}
//                 placeholder="+1 555 123 4567"
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => handleChange('email', e.target.value)}
//                 placeholder="you@example.com"
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <h6 className="text-uppercase">🌐 Social Links</h6>
//           </Col>
//         </Row>
//         <Row>
//           {['facebook', 'twitter', 'youtube', 'linkedin'].map((key) => (
//             <Col md={3} key={key}>
//               <Form.Group className="mb-3">
//                 <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
//                 <Form.Control
//                   value={form.socialLinks?.[key]}
//                   onChange={(e) =>
//                     handleNestedChange('socialLinks', key, e.target.value)
//                   }
//                   placeholder={`https://www.${key}.com/yourpage`}
//                 />
//               </Form.Group>
//             </Col>
//           ))}
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <h6 className="text-uppercase">⏰ Business Hours</h6>
//           </Col>
//         </Row>
//         <Row>
//           {[
//             ['mondayToFriday', 'Monday - Friday'],
//             ['saturday', 'Saturday'],
//             ['sunday', 'Sunday'],
//           ].map(([key, label]) => (
//             <Col md={4} key={key}>
//               <Form.Group className="mb-3">
//                 <Form.Label>{label}</Form.Label>
//                 <Form.Control
//                   value={form.businessHours?.[key]}
//                   onChange={(e) =>
//                     handleNestedChange('businessHours', key, e.target.value)
//                   }
//                   placeholder={key === 'mondayToFriday' ? '09:00 – 18:00' : 'Closed / 10:00 – 16:00'}
//                 />
//               </Form.Group>
//             </Col>
//           ))}
//         </Row>

//         <div className="d-flex justify-content-end">
//           <Button onClick={handleSave} disabled={loading} variant="primary">
//             {loading ? 'Saving...' : '💾 Save Contact Info'}
//           </Button>
//         </div>
//       </Card>

//       {/* Preview card */}
//       <Card className="p-4 bg-dark text-white">
//         <Row className="g-5">
//           <Col md={6} lg={3}>
//             <h5 className="text-uppercase text-light mb-4">Our Office</h5>
//             <p><i className="fa fa-map-marker-alt text-primary me-2"></i>{form.address}</p>
//             <p>
//               <i className="fa fa-phone-alt text-primary me-2"></i>
//               {form.phone ? <a href={`tel:${form.phone}`} className="text-white text-decoration-none">{form.phone}</a> : ''}
//             </p>
//             <p>
//               <i className="fa fa-envelope text-primary me-2"></i>
//               {form.email ? <a href={`mailto:${form.email}`} className="text-white text-decoration-none">{form.email}</a> : ''}
//             </p>
//             <div className="d-flex pt-3">
//               {form.socialLinks.twitter && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={withHttp(form.socialLinks.twitter)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {form.socialLinks.facebook && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={withHttp(form.socialLinks.facebook)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {form.socialLinks.youtube && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={withHttp(form.socialLinks.youtube)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {form.socialLinks.linkedin && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={withHttp(form.socialLinks.linkedin)}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </Col>

//           <Col md={6} lg={3}>
//             <h5 className="text-uppercase text-light mb-4">Business Hours</h5>
//             <p className="text-uppercase mb-0">Monday - Friday</p>
//             <p>{form.businessHours.mondayToFriday}</p>
//             <p className="text-uppercase mb-0">Saturday</p>
//             <p>{form.businessHours.saturday}</p>
//             <p className="text-uppercase mb-0">Sunday</p>
//             <p>{form.businessHours.sunday}</p>
//           </Col>

//           <Col md={12} lg={6}>
//             {/* Placeholder for image gallery (optional future use) */}
//             <div className="row g-1">
//               {[1, 2, 3, 4, 5, 6].map((i) => (
//                 <div className="col-4" key={i}>
//                   {/* Example: <img src={`/img/service-${i}.jpg`} alt={`Gallery ${i}`} className="img-fluid" /> */}
//                 </div>
//               ))}
//             </div>
//           </Col>
//         </Row>
//       </Card>

//       {/* Floating success toast */}
//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast
//           bg="success"
//           onClose={() => setShowToast(false)}
//           show={showToast}
//           delay={2200}
//           autohide
//         >
//           <Toast.Body className="text-white">
//             {success || 'Saved successfully.'}
//           </Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// ContactEditor.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ContactEditor;























// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactS.js
"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Toast,
  ToastContainer,
  Alert,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/* ----------------------------- TEMPLATE PROFILES ----------------------------- */
const CONTACT_PROFILES = {
  "sir-template-1": {
    fields: {
      subtitle: true,
      titleStrong: true,
      titleLight: true,
      buttonText: true,
      formAction: true,
    },
    kind: "form",
  },
  "gym-template-1": {
    fields: {
      address: true,
      phone: true,
      email: true,
      socialLinks: { facebook: true, twitter: true, youtube: true, linkedin: true },
      businessHours: { mondayToFriday: true, saturday: true, sunday: true },
    },
    kind: "info",
  },
};

const ALL_CONTACT_FIELDS = {
  subtitle: true,
  titleStrong: true,
  titleLight: true,
  buttonText: true,
  formAction: true,
  address: true,
  phone: true,
  email: true,
  socialLinks: { facebook: true, twitter: true, youtube: true, linkedin: true },
  businessHours: { mondayToFriday: true, saturday: true, sunday: true },
};

/* ----------------------------- HELPERS ----------------------------- */
const pickAllowed = (obj, allowed) => {
  if (!obj || !allowed) return {};
  const out = {};
  for (const k of Object.keys(allowed)) {
    const allowVal = allowed[k];
    const v = obj[k];
    if (allowVal && typeof allowVal === "object" && v && typeof v === "object") {
      out[k] = {};
      for (const nk of Object.keys(allowVal)) {
        if (allowVal[nk] && v[nk] !== undefined) out[k][nk] = v[nk];
      }
    } else if (allowVal && v !== undefined) {
      out[k] = v;
    }
  }
  return out;
};

const normalizeByProfile = (data, allowed) => {
  const base = {
    subtitle: data?.subtitle || "- Contact Us",
    titleStrong: data?.titleStrong || "Get In",
    titleLight: data?.titleLight || "Touch",
    buttonText: data?.buttonText || "Let's Talk",
    formAction:
      data?.formAction ||
      "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
    address: data?.address || "",
    phone: data?.phone || "",
    email: data?.email || "",
    socialLinks: {
      facebook: data?.socialLinks?.facebook || "",
      twitter: data?.socialLinks?.twitter || "",
      youtube: data?.socialLinks?.youtube || "",
      linkedin: data?.socialLinks?.linkedin || "",
    },
    businessHours: {
      mondayToFriday: data?.businessHours?.mondayToFriday || "",
      saturday: data?.businessHours?.saturday || "",
      sunday: data?.businessHours?.sunday || "",
    },
  };
  return pickAllowed(base, allowed);
};

/* Resolve templateId: ?templateId → backend selection → default */
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
        if (t && !off) {
          setTid(t);
          return;
        }
      } catch {}
      if (!off) setTid(defaultTemplateId || "gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

/* ============================= PAGE ============================== */
function ContactEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const profile =
    CONTACT_PROFILES[templateId] || { fields: ALL_CONTACT_FIELDS, kind: "form" };
  const allowed = profile.fields;
  const kind = profile.kind; // "form" for sir, "info" for gym

  const [doc, setDoc] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load
  useEffect(() => {
    if (!templateId) return;
    let off = false;

    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/contact-info/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        if (off) return;

        const normalized = normalizeByProfile(json || {}, allowed);
        setDoc(normalized);
        setErrorMsg("");
      } catch (e) {
        if (!off) {
          setDoc(normalizeByProfile({}, allowed));
          setErrorMsg("Failed to load contact info.");
          console.error("❌ contact load:", e);
        }
      }
    })();

    return () => {
      off = true;
    };
  }, [userId, templateId, allowed]);

  // Save
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = pickAllowed(doc, allowed);
      const put = await fetch(
        `${backendBaseUrl}/api/contact-info/${encodeURIComponent(
          userId
        )}/${encodeURIComponent(templateId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const putJson = await put.json().catch(() => null);
      if (!put.ok) {
        throw new Error(putJson?.error || put.statusText || "Save failed");
      }

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Field setters
  const setField = (k) => (e) =>
    setDoc((p) => ({ ...p, [k]: e?.target?.value ?? e }));

  const setNested = (section, key) => (e) =>
    setDoc((p) => ({
      ...p,
      [section]: { ...(p[section] || {}), [key]: e?.target?.value ?? e },
    }));

  const withHttp = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  /* ------------------- CLEAN PREVIEWS ------------------- */
  const PreviewSir = ({ data }) => {
    const panelStyle = {
      width: "896px",
      height: "290px",
      borderRadius: 20,
      overflow: "hidden",
      background: "#F8FAFB",
      border: "1px solid #EEF1F4",
      margin: "0 auto",
      display: "flex",
    };

    return (
      <div style={panelStyle} className="shadow-sm">
        {/* Left: heading */}
        <div
          className="d-flex flex-column justify-content-center px-4"
          style={{ width: "40%", background: "#ffffff" }}
        >
          <span className="text-muted" style={{ fontSize: 12 }}>
            {data.subtitle || "- Contact Us"}
          </span>
          <h4 className="mb-1 fw-bold" style={{ lineHeight: 1.2 }}>
            {data.titleStrong || "Get In"}{" "}
            <span className="fw-light">{data.titleLight || "Touch"}</span>.
          </h4>
          <small className="text-muted">Preview only — submit is disabled.</small>
        </div>

        {/* Right: tidy form */}
        <div
          className="d-flex align-items-center justify-content-center p-4"
          style={{ width: "60%", background: "#F6F7F9" }}
        >
          <form
            className="w-100"
            style={{ maxWidth: 460 }}
            onSubmit={(e) => e.preventDefault()}
            method="post"
            action={
              data.formAction ||
              "https://ui-themez.smartinnovates.net/items/bayone1/contact.php"
            }
          >
            <div className="row g-2">
              <div className="col-6">
                <input
                  className="form-control form-control-sm"
                  id="form_name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                />
              </div>
              <div className="col-6">
                <input
                  className="form-control form-control-sm"
                  id="form_email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="col-12">
                <textarea
                  className="form-control form-control-sm"
                  id="form_message"
                  name="message"
                  placeholder="Message"
                  rows={3}
                  required
                />
              </div>
              <div className="col-12 d-flex">
                <button
                  type="submit"
                  className="btn btn-dark btn-sm ms-auto"
                  disabled
                  title="Preview only"
                >
                  {data.buttonText || "Let's Talk"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PreviewGym = ({ data }) => {
    const panelStyle = {
      width: "896px",
      height: "290px",
      borderRadius: 20,
      overflow: "hidden",
      background: "#111827",
      margin: "0 auto",
      display: "flex",
      color: "#fff",
    };

    return (
      <div style={panelStyle} className="shadow-sm">
        <div className="p-4" style={{ width: "50%" }}>
          <h6 className="text-uppercase opacity-75 mb-2">Our Office</h6>
          {allowed.address && (
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-2 text-primary" />
              {data.address || "—"}
            </p>
          )}
          {allowed.phone && (
            <p className="mb-2">
              <i className="fa fa-phone-alt me-2 text-primary" />
              {data.phone || "—"}
            </p>
          )}
          {allowed.email && (
            <p className="mb-0">
              <i className="fa fa-envelope me-2 text-primary" />
              {data.email || "—"}
            </p>
          )}
        </div>

        <div
          className="p-4 border-start border-light"
          style={{
            width: "50%",
            borderColor: "rgba(255,255,255,.08) !important",
          }}
        >
          <h6 className="text-uppercase opacity-75 mb-2">Business Hours</h6>
          <div className="small">
            {allowed.businessHours?.mondayToFriday && (
              <div className="mb-1">
                <span className="text-uppercase opacity-75">Mon–Fri:</span>{" "}
                {data.businessHours?.mondayToFriday || "—"}
              </div>
            )}
            {allowed.businessHours?.saturday && (
              <div className="mb-1">
                <span className="text-uppercase opacity-75">Sat:</span>{" "}
                {data.businessHours?.saturday || "—"}
              </div>
            )}
            {allowed.businessHours?.sunday && (
              <div>
                <span className="text-uppercase opacity-75">Sun:</span>{" "}
                {data.businessHours?.sunday || "—"}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-3">
            {data.socialLinks?.twitter && (
              <a
                className="btn btn-light btn-sm"
                href={withHttp(data.socialLinks.twitter)}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-twitter" />
              </a>
            )}
            {data.socialLinks?.facebook && (
              <a
                className="btn btn-light btn-sm"
                href={withHttp(data.socialLinks.facebook)}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-facebook-f" />
              </a>
            )}
            {data.socialLinks?.youtube && (
              <a
                className="btn btn-light btn-sm"
                href={withHttp(data.socialLinks.youtube)}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-youtube" />
              </a>
            )}
            {data.socialLinks?.linkedin && (
              <a
                className="btn btn-light btn-sm"
                href={withHttp(data.socialLinks.linkedin)}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isSir = templateId === "sir-template-1";
  const isGym = templateId === "gym-template-1";

  /* ------------------- UI ------------------- */
  return (
    <Container fluid className="py-4">
      <Row className="align-items-center">
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">☎️ Contact</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">
                {isSir ? "SIR / Form" : isGym ? "GYM / Info" : "Custom"}
              </Badge>
            </div>
            <div className="text-muted">
              endpoint: <code>/api/contact-info/{defaultUserId}/{templateId}</code>
            </div>
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">
              {errorMsg}
            </Alert>
          </Col>
        </Row>
      ) : null}

      {/* Clean Preview panel (no extra Card wrapper) */}
      <div className="mb-4 d-flex justify-content-center">
        {isSir && <PreviewSir data={doc} />}
        {isGym && <PreviewGym data={doc} />}
        {!isSir && !isGym && (
          <div className="text-muted">No special preview for this template.</div>
        )}
      </div>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Edit</h5>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !templateId}
          >
            {saving ? "Saving…" : "💾 Save"}
          </Button>
        </div>

        {/* SIR fields (form-style) */}
        {isSir && (
          <Row className="g-3">
            {allowed.subtitle && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control
                    value={doc.subtitle || ""}
                    onChange={setField("subtitle")}
                    placeholder="- Contact Us"
                  />
                </Form.Group>
              </Col>
            )}
            {allowed.titleStrong && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Title (Bold)</Form.Label>
                  <Form.Control
                    value={doc.titleStrong || ""}
                    onChange={setField("titleStrong")}
                    placeholder="Get In"
                  />
                </Form.Group>
              </Col>
            )}
            {allowed.titleLight && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Title (Light)</Form.Label>
                  <Form.Control
                    value={doc.titleLight || ""}
                    onChange={setField("titleLight")}
                    placeholder="Touch"
                  />
                </Form.Group>
              </Col>
            )}
            {allowed.buttonText && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Button Text</Form.Label>
                  <Form.Control
                    value={doc.buttonText || ""}
                    onChange={setField("buttonText")}
                    placeholder="Let's Talk"
                  />
                </Form.Group>
              </Col>
            )}
            {allowed.formAction && (
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Form Action URL</Form.Label>
                  <Form.Control
                    value={doc.formAction || ""}
                    onChange={setField("formAction")}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
        )}

        {/* GYM fields (info-style) */}
        {isGym && (
          <>
            <Row className="g-3">
              {allowed.address && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      value={doc.address || ""}
                      onChange={setField("address")}
                      placeholder="123 Example St, City"
                    />
                  </Form.Group>
                </Col>
              )}
              {allowed.phone && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      value={doc.phone || ""}
                      onChange={setField("phone")}
                      placeholder="+1 555 123 4567"
                    />
                  </Form.Group>
                </Col>
              )}
              {allowed.email && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      value={doc.email || ""}
                      onChange={setField("email")}
                      placeholder="you@example.com"
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            <Row className="mt-3">
              <Col>
                <h6 className="text-uppercase">🌐 Social Links</h6>
              </Col>
            </Row>
            <Row className="g-3">
              {Object.entries(allowed.socialLinks || {}).map(([key, on]) =>
                on ? (
                  <Col md={3} key={key}>
                    <Form.Group>
                      <Form.Label>
                        {key[0].toUpperCase() + key.slice(1)}
                      </Form.Label>
                      <Form.Control
                        value={doc.socialLinks?.[key] || ""}
                        onChange={setNested("socialLinks", key)}
                        placeholder={`https://www.${key}.com/yourpage`}
                      />
                    </Form.Group>
                  </Col>
                ) : null
              )}
            </Row>

            <Row className="mt-3">
              <Col>
                <h6 className="text-uppercase">⏰ Business Hours</h6>
              </Col>
            </Row>
            <Row className="g-3">
              {Object.entries(allowed.businessHours || {}).map(([key, on]) =>
                on ? (
                  <Col md={4} key={key}>
                    <Form.Group>
                      <Form.Label>
                        {key === "mondayToFriday"
                          ? "Monday - Friday"
                          : key[0].toUpperCase() + key.slice(1)}
                      </Form.Label>
                      <Form.Control
                        value={doc.businessHours?.[key] || ""}
                        onChange={setNested("businessHours", key)}
                        placeholder={
                          key === "mondayToFriday"
                            ? "09:00 – 18:00"
                            : "Closed / 10:00 – 16:00"
                        }
                      />
                    </Form.Group>
                  </Col>
                ) : null
              )}
            </Row>
          </>
        )}
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
        >
          <Toast.Body className="text-white">
            ✅ Saved successfully.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ContactEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactEditorPage;
