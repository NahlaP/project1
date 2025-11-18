

<<<<<<< HEAD
=======


>>>>>>> origin/design-work


// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\servicesS.js
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
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl } from "../../lib/config";
import BackBar from "../components/BackBar";
import { useIonContext } from "../../lib/useIonContext";

/* ----------------------------- TEMPLATE PROFILES ----------------------------- */
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
  title: true,
  description: true,
  delay: true,
  order: true,
  imageUrl: true,
  buttonText: true,
  buttonHref: true,
};

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

<<<<<<< HEAD
=======

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
>>>>>>> origin/design-work
function ServicesEditorPage() {
  const { userId, templateId } = useIonContext();

  const profile =
    SERVICES_PROFILES[templateId] || { fields: ALL_SERVICE_FIELDS, suggested: 4 };
  const allowed = profile.fields;

  const [doc, setDoc] = useState({ services: [] });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // draft previews keyed per row (_id or idx-#)
  const [drafts, setDrafts] = useState({});
  const lastUrlsRef = useRef({});

  const keyFor = (s, idx) => (s?._id ? String(s._id) : `idx-${idx}`);

  const apiBase = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/services/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // ------------------- LOAD -------------------
  const loadServices = async () => {
    if (!apiBase) return;
    const res = await fetch(`${apiBase}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json().catch(() => ({}));
    const rows = Array.isArray(json?.services) ? json.services : [];
    setDoc({ services: rows });
  };

  useEffect(() => {
    if (!apiBase) return;
    let off = false;
    (async () => {
      try {
        await loadServices();
        if (!off) setErrorMsg("");
      } catch (e) {
        if (!off) {
          setDoc({ services: [] });
          setErrorMsg("Failed to load services.");
          console.error("❌ services load:", e);
        }
      }
    })();
    return () => {
      off = true;
    };
  }, [apiBase]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      Object.values(lastUrlsRef.current).forEach((u) => {
        try {
          u && URL.revokeObjectURL(u);
        } catch {}
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
      if (u) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
        delete lastUrlsRef.current[k];
      }
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
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }
    lastUrlsRef.current[rowKey] = objUrl;
    setDrafts((d) => ({ ...d, [rowKey]: { file, url: objUrl } }));
  };

  const uploadImageFor = async (serviceId, file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${apiBase}/${encodeURIComponent(serviceId)}/image`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Upload failed");
    }
    return res.json();
  };

  // ------------------- SAVE -------------------
  const handleSave = async () => {
    if (!apiBase) return;
    setSaving(true);
    setErrorMsg("");

    try {
      let working = { services: [...(doc.services || [])] };

      // Upload drafts where applicable (GYM supports images)
      if (allowed.imageUrl) {
        for (let idx = 0; idx < working.services.length; idx++) {
          const row = working.services[idx];
          const k = keyFor(row, idx);
          const draft = drafts[k];
          if (draft?.file && row?._id) {
            const up = await uploadImageFor(row._id, draft.file);
            if (up?.result?.services) {
              // controller returned full list
              working.services = up.result.services;
            } else if (up?.imageUrl) {
              working.services[idx] = { ...row, imageUrl: up.imageUrl };
            }
          }
        }
      }

      // Only send allowed fields to avoid cross-template pollution
      const payload = {
        services: working.services.map((s) => pickAllowed(s, allowed)),
      };

      const put = await fetch(apiBase, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const putJson = await put.json().catch(() => null);
      if (!put.ok) {
        throw new Error(putJson?.error || put.statusText || "Save failed");
      }

      await loadServices();

      // clear drafts
      Object.values(lastUrlsRef.current).forEach((u) => {
        try {
          u && URL.revokeObjectURL(u);
        } catch {}
      });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ------------------- RESET (Server) -------------------
  const handleReset = async () => {
    if (!apiBase) return;
    setResetting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${apiBase}/reset`, {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "include",
      });
      const okJson = (res.headers.get("content-type") || "")
        .toLowerCase()
        .includes("application/json");
      const data = okJson ? await res.json().catch(() => ({})) : null;
      if (!res.ok) {
        const txt = okJson ? data?.error || data?.message : await res.text().catch(() => "");
        throw new Error(txt || `Reset failed (${res.status})`);
      }

      await loadServices();

      Object.values(lastUrlsRef.current).forEach((u) => {
        try {
          u && URL.revokeObjectURL(u);
        } catch {}
      });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed");
    } finally {
      setResetting(false);
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
                <h3 className="text-u f-bold">
                  What We <span className="f-ultra-light">Do</span> ?
                </h3>
              </div>

              {items
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s, i) => {
          const k = keyFor(s, i);
          const shown = drafts[k]?.url || absUrl(s.imageUrl);
          return (
            <div
              className="col-lg-3 col-md-6"
              key={s._id || i}
              data-wow-delay={s.delay || `0.${i + 1}s`}
            >
              <div className="service-item">
                <div className="service-inner pb-5">
                  {shown ? (
                    <img className="img-fluid w-100" src={shown} alt="" />
                  ) : null}
                  <div className="service-text px-5 pt-4">
                    <h5 className="text-uppercase">
                      {s.title || "Service Title"}
                    </h5>
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
                fields: {Object.keys(allowed).filter((k) => allowed[k]).join(", ")}
              </Badge>
            </div>
            {apiBase && (
              <div className="text-muted" title={apiBase}>
                endpoint: <code>/api/services/{userId}/{templateId}</code>
              </div>
            )}
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
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              onClick={handleReset}
              disabled={resetting || !templateId}
              title="Reset to template/hardcoded defaults"
            >
              {resetting ? "Resetting…" : "🧹 Reset (Server)"}
            </Button>
            <Button variant="outline-primary" onClick={addRow}>
              ➕ Add Item
            </Button>
          </div>
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
                      onChange={(e) =>
                        updateRow(idx, "description", e.target.value)
                      }
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
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            display: "block",
                            marginBottom: 6,
                          }}
                        />
                      ) : null}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          pickLocalFile(f, k);
                          try {
                            e.target.value = "";
                          } catch {}
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
                        onChange={(e) =>
                          updateRow(idx, "buttonText", e.target.value)
                        }
                      />
                    </td>
                  )}

                  {allowed.buttonHref && (
                    <td>
                      <Form.Control
                        value={s.buttonHref || ""}
                        onChange={(e) =>
                          updateRow(idx, "buttonHref", e.target.value)
                        }
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
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2200}
          autohide
        >
          <Toast.Body className="text-white">✅ Done.</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

ServicesEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ServicesEditorPage;
