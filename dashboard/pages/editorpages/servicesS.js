






"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
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
} from "../../lib/config";
import { api } from "../../lib/api";
import BackBar from "../components/BackBar";

/* ----------------------------- TEMPLATE PROFILES ----------------------------- */
/* What fields are used for Services per template */
const SERVICES_PROFILES = {
  "sir-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: false,
      buttonText: false,
      buttonHref: false,
    },
    // number of items suggested (optional)
    suggested: 4,
  },
  "gym-template-1": {
    fields: {
      title: true,
      description: true,
      delay: true,
      order: true,
      imageUrl: true,
      buttonText: true,
      buttonHref: true,
    },
    suggested: 8,
  },
};

// fallback if template unknown: allow everything
const ALL_SERVICE_FIELDS = {
  title: true, description: true, delay: true, order: true,
  imageUrl: true, buttonText: true, buttonHref: true,
};

/* ----------------------------- HELPERS ----------------------------- */
const ABS = /^https?:\/\//i;
const absUrl = (u) => {
  const s = String(u || "").trim();
  if (!s) return "";
  if (ABS.test(s)) return s;
  if (s.startsWith("/")) return `${backendBaseUrl}${s}`;
  return `${backendBaseUrl}/${s.replace(/^\/+/, "")}`;
};

const pickAllowed = (row, allowed) => {
  const out = {};
  Object.keys(allowed).forEach((k) => {
    if (allowed[k] && row[k] !== undefined) out[k] = row[k];
  });
  return out;
};

/* Resolve templateId: ?templateId → backend selection → gym-template-1 */
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
      if (!off) setTid("gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

/* ============================= PAGE ============================== */
function ServicesEditorPage() {
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const profile = SERVICES_PROFILES[templateId] || { fields: ALL_SERVICE_FIELDS, suggested: 4 };
  const allowed = profile.fields;

  const [doc, setDoc] = useState({ services: [] });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // draft previews keyed per row (_id or idx-#)
  const [drafts, setDrafts] = useState({});
  const lastUrlsRef = useRef({});

  const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

  // ------------------- LOAD -------------------
  useEffect(() => {
    if (!templateId) return;
    let off = false;

    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json().catch(() => ({}));
        if (off) return;

        const rows = Array.isArray(json?.services) ? json.services : [];
        setDoc({ services: rows });
        setErrorMsg("");
      } catch (e) {
        if (!off) {
          setDoc({ services: [] });
          setErrorMsg("Failed to load services.");
          console.error("❌ services load:", e);
        }
      }
    })();

    return () => { off = true; };
  }, [userId, templateId]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      Object.values(lastUrlsRef.current).forEach((u) => {
        try { u && URL.revokeObjectURL(u); } catch {}
      });
      lastUrlsRef.current = {};
    };
  }, []);

  // ------------------- EDITING -------------------
  const updateRow = (idx, key, value) => {
    setDoc((p) => {
      const arr = Array.isArray(p.services) ? [...p.services] : [];
      if (!arr[idx]) return p;
      arr[idx] = { ...arr[idx], [key]: key === "order" ? Number(value) : value };
      return { ...p, services: arr };
    });
  };

  const addRow = () => {
    setDoc((p) => ({
      ...p,
      services: [
        ...(p.services || []),
        {
          title: "",
          description: "",
          delay: "0.1s",
          order: (p.services?.length || 0) + 1,
          imageUrl: "",
          buttonText: "Read More",
          buttonHref: "#",
        },
      ],
    }));
  };

  const removeRow = (idx) => {
    setDoc((p) => {
      const arr = [...(p.services || [])];
      const removed = arr.splice(idx, 1)[0];
      const k = keyFor(removed, idx);
      const u = lastUrlsRef.current[k];
      if (u) { try { URL.revokeObjectURL(u); } catch {} delete lastUrlsRef.current[k]; }
      setDrafts((d) => {
        const { [k]: _, ...rest } = d;
        return rest;
      });
      return { ...p, services: arr };
    });
  };

  const pickLocalFile = (file, rowKey) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be ≤ 10 MB");
      return;
    }
    const objUrl = URL.createObjectURL(file);
    const prev = lastUrlsRef.current[rowKey];
    if (prev) {
      try { URL.revokeObjectURL(prev); } catch {}
    }
    lastUrlsRef.current[rowKey] = objUrl;
    setDrafts((d) => ({ ...d, [rowKey]: { file, url: objUrl } }));
  };

  const uploadImageFor = async (serviceId, file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(
      `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}/${encodeURIComponent(serviceId)}/image`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    return res.json();
  };

  // ------------------- SAVE -------------------
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    try {
      let working = { services: [...(doc.services || [])] };

      // If this template supports imageUrl, upload drafts for rows that have _id
      if (allowed.imageUrl) {
        for (let idx = 0; idx < working.services.length; idx++) {
          const row = working.services[idx];
          const k = keyFor(row, idx);
          const draft = drafts[k];
          if (draft?.file && row?._id) {
            const up = await uploadImageFor(row._id, draft.file);
            // allow either shape {result:{services}} or {imageUrl: "..."}
            if (up?.result?.services) {
              working.services = up.result.services;
            } else if (up?.imageUrl) {
              working.services[idx] = { ...row, imageUrl: up.imageUrl };
            }
          }
        }
      }

      // send only allowed fields to backend
      const payload = {
        services: working.services.map((s) => pickAllowed(s, allowed)),
      };

      const put = await fetch(
        `${backendBaseUrl}/api/services/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`,
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

      // replace with server doc
      if (putJson?.services) setDoc({ services: putJson.services });

      // clear drafts
      Object.values(lastUrlsRef.current).forEach((u) => { try { u && URL.revokeObjectURL(u); } catch {} });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------- PREVIEW ------------------- */
  const PreviewSir = ({ items }) => (
    <section className="section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 d-flex align-items-center justify-content-center">
            <div className="exp valign text-center">
              <div className="full-width">
                <h2>12+</h2>
                <h6 className="sub-title">Years of Experience</h6>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="accordion bord full-width">
              <div className="sec-head mb-70">
                <span className="sub-title mb-15 opacity-8">- Services</span>
                <h3 className="text-u f-bold">What We <span className="f-ultra-light">Do</span> ?</h3>
              </div>

              {items
                .slice()
                .sort((a,b)=>(a.order ?? 0)-(b.order ?? 0))
                .map((s, i) => (
                <div key={s._id || i} className="item mb-20">
                  <div className="title">
                    <h4 className="">{s.title || "Service Title"}</h4>
                    <span className="ico"></span>
                  </div>
                  <div className="accordion-info">
                    <p>{s.description || "Service description..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const PreviewGym = ({ items }) => (
    <div className="row g-4">
      {items
        .slice()
        .sort((a,b)=>(a.order ?? 0)-(b.order ?? 0))
        .map((s, i) => {
          const k = keyFor(s, i);
          const shown = drafts[k]?.url || absUrl(s.imageUrl);
          return (
            <div className="col-lg-3 col-md-6" key={s._id || i} data-wow-delay={s.delay || `0.${i+1}s`}>
              <div className="service-item">
                <div className="service-inner pb-5">
                  {shown ? <img className="img-fluid w-100" src={shown} alt="" /> : null}
                  <div className="service-text px-5 pt-4">
                    <h5 className="text-uppercase">{s.title || "Service Title"}</h5>
                    <p>{s.description || "Service description..."}</p>
                  </div>
                  <div className="d-flex gap-2 px-5">
                    <a className="btn btn-light px-3" href={s.buttonHref || "#"}>
                      {s.buttonText || "Read More"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );

  const isSir = templateId === "sir-template-1";
  const isGym = templateId === "gym-template-1";

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center">
        <Col className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="fw-bold">🧰 Services</h4>
            <BackBar />
          </div>
          <div className="text-end small">
            <div>
              template: <code>{templateId || "(resolving…)"}</code>{" "}
              <Badge bg="secondary">
                fields: {Object.keys(allowed).filter(k => allowed[k]).join(", ")}
              </Badge>
            </div>
            <div className="text-muted">endpoint: <code>/api/services/{defaultUserId}/{templateId}</code></div>
          </div>
        </Col>
      </Row>

      {errorMsg ? (
        <Row className="mb-3"><Col><Alert variant="danger" className="mb-0">{errorMsg}</Alert></Col></Row>
      ) : null}

      {/* Preview */}
      <Card className="p-4 mb-4">
        {isSir && <PreviewSir items={doc.services || []} />}
        {isGym && <PreviewGym items={doc.services || []} />}
        {!isSir && !isGym && (
          <div className="text-muted">No special preview for this template.</div>
        )}
      </Card>

      {/* Editor */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Edit Items</h5>
          <Button variant="outline-primary" onClick={addRow}>➕ Add Item</Button>
        </div>

        <Table bordered responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 84 }}>Order</th>
              <th style={{ minWidth: 220 }}>Title</th>
              <th>Description</th>
              {allowed.delay && <th style={{ width: 120 }}>Delay</th>}
              {allowed.imageUrl && <th style={{ width: 220 }}>Image</th>}
              {allowed.buttonText && <th style={{ width: 160 }}>Btn Text</th>}
              {allowed.buttonHref && <th style={{ width: 220 }}>Btn Link</th>}
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(doc.services || []).map((s, idx) => {
              const k = keyFor(s, idx);
              const thumb = drafts[k]?.url || absUrl(s.imageUrl);
              return (
                <tr key={s._id || idx}>
                  <td>
                    <Form.Control
                      type="number"
                      value={s.order ?? 0}
                      onChange={(e) => updateRow(idx, "order", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={s.title || ""}
                      onChange={(e) => updateRow(idx, "title", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={s.description || ""}
                      onChange={(e) => updateRow(idx, "description", e.target.value)}
                    />
                  </td>

                  {allowed.delay && (
                    <td>
                      <Form.Control
                        value={s.delay || ""}
                        onChange={(e) => updateRow(idx, "delay", e.target.value)}
                      />
                    </td>
                  )}

                  {allowed.imageUrl && (
                    <td>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          style={{ width: 64, height: 64, objectFit: "cover", display: "block", marginBottom: 6 }}
                        />
                      ) : null}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          pickLocalFile(f, k);
                          try { e.target.value = ""; } catch {}
                        }}
                      />
                      {!s._id && drafts[k]?.file && (
                        <small className="text-muted d-block mt-1">
                          Save to create the row first; image will upload afterwards.
                        </small>
                      )}
                    </td>
                  )}

                  {allowed.buttonText && (
                    <td>
                      <Form.Control
                        value={s.buttonText || ""}
                        onChange={(e) => updateRow(idx, "buttonText", e.target.value)}
                      />
                    </td>
                  )}

                  {allowed.buttonHref && (
                    <td>
                      <Form.Control
                        value={s.buttonHref || ""}
                        onChange={(e) => updateRow(idx, "buttonHref", e.target.value)}
                      />
                    </td>
                  )}

                  <td className="align-middle">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => removeRow(idx)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
            {(doc.services || []).length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No items yet. Click “Add Item”.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="text-end">
          <Button onClick={handleSave} disabled={saving || !templateId}>
            {saving ? "Saving…" : "💾 Save"}
          </Button>
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

ServicesEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ServicesEditorPage;
