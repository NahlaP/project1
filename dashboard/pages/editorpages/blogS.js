


// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\blogS.js
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container, Row, Col, Card, Button, Form, Table,
  Toast, ToastContainer, Alert, Badge
} from "react-bootstrap";
import { useRouter } from "next/router";

import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import BackBar from "../components/BackBar";

import { backendBaseUrl as API, s3Bucket, s3Region } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";

/* ---------------- Image URL helpers (presigned / S3 / relative) ---------------- */
const ABS = /^https?:\/\//i;
const toPublicS3 = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

const toAbs = (u) => {
  if (!u) return "";
  if (ABS.test(u)) return u;                      // already absolute (presigned or remote)
  if (u.startsWith("/")) return `${API}${u}`;     // relative to backend
  return toPublicS3(u) || `${API}/${u}`;          // try S3 key, else fallback
};

/* ----------------------------- Tiny helpers ----------------------------- */
const readErr = async (res) => {
  const txt = await res.text().catch(() => "");
  try {
    const j = JSON.parse(txt);
    return j?.error || j?.message || txt || `HTTP ${res.status}`;
  } catch {
    return txt || `HTTP ${res.status}`;
  }
};

function BlogStudioPage() {
  const router = useRouter();
  const { userId, templateId } = useIonContext(); // 🔗 single source of truth

  const pageId = typeof router.query.pageId === "string" ? router.query.pageId : "";
  const sectionId = typeof router.query.sectionId === "string" ? router.query.sectionId : "";

  const [doc, setDoc] = useState({ items: [] });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Draft previews per row key (ObjectURL)
  const [drafts, setDrafts] = useState({});
  const lastUrlsRef = useRef({}); // {key: objUrl}
  const rowRefs = useRef({});
  const [highlightKey, setHighlightKey] = useState(null);

  // Endpoints
  const endpoints = useMemo(() => {
    if (!userId || !templateId) return null;
    const base = `${API}/api/blogs/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
    return {
      BASE: base,
      GET_URL: base,
      PUT_URL: base,
      RESET: `${base}/reset`,
      UPLOAD_FOR: (postId) => `${base}/${encodeURIComponent(postId)}/image`,
    };
  }, [userId, templateId]);

  const keyFor = (it, idx) => (it?._id ? String(it._id) : `idx-${idx}`);

  // Load
  const load = async () => {
    if (!endpoints) return;
    const res = await fetch(`${endpoints.GET_URL}?_=${Date.now()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await readErr(res));
    const json = await res.json().catch(() => ({}));
    setDoc(json || { items: [] });
  };

  useEffect(() => {
    if (!endpoints) return;
    let abort = false;
    (async () => {
      setErrorMsg("");
      try {
        await load();
      } catch (e) {
        console.error("❌ blogs load", e);
        if (!abort) setErrorMsg(String(e?.message || "Failed to load blog items."));
      }
    })();
    return () => { abort = true; };
  }, [endpoints?.GET_URL]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      Object.values(lastUrlsRef.current).forEach((u) => {
        try { if (u) URL.revokeObjectURL(u); } catch {}
      });
      lastUrlsRef.current = {};
    };
  }, []);

  // Mutators
  const setField = (idx, k) => (e) => {
    const v = e?.target?.value ?? e;
    setDoc((p) => {
      const items = [...(p.items || [])];
      if (!items[idx]) return p;
      items[idx] = { ...items[idx], [k]: k === "order" ? Number(v) : v };
      return { ...p, items };
    });
  };

  const addRow = () => {
    setDoc((p) => ({
      ...p,
      items: [
        ...(p.items || []),
        {
          title: "",
          excerpt: "",
          tag: "",
          date: "",
          href: "blog-details.html",
          imageUrl: "",
          imageKey: "",
          delay: ".2",
          order: (p.items?.length || 0) + 1,
        },
      ],
    }));
  };

  const removeRow = (idx) => {
    const row = (doc.items || [])[idx];
    const k = keyFor(row, idx);
    const prev = lastUrlsRef.current[k];
    if (prev) { try { URL.revokeObjectURL(prev); } catch {} }
    setDrafts((d) => { const { [k]: _, ...rest } = d; return rest; });
    setDoc((p) => {
      const items = [...(p.items || [])];
      items.splice(idx, 1);
      return { ...p, items };
    });
  };

  const moveUp = (idx) =>
    setDoc((p) => {
      const items = [...(p.items || [])];
      if (idx <= 0) return p;
      [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
      return { ...p, items };
    });

  const moveDown = (idx) =>
    setDoc((p) => {
      const items = [...(p.items || [])];
      if (idx >= items.length - 1) return p;
      [items[idx + 1], items[idx]] = [items[idx], items[idx + 1]];
      return { ...p, items };
    });

  // Draft local file -> preview only (upload after Save if row has _id)
  const onPickLocal = (file, rowKey) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Image must be ≤ 10 MB"); return; }
    const obj = URL.createObjectURL(file);
    const prev = lastUrlsRef.current[rowKey];
    if (prev) { try { URL.revokeObjectURL(prev); } catch {} }
    lastUrlsRef.current[rowKey] = obj;
    setDrafts((d) => ({ ...d, [rowKey]: { file, url: obj } }));
  };

  // Upload a single draft for a known _id
  const uploadOne = async (postId, file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${endpoints.UPLOAD_FOR(postId)}?_=${Date.now()}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) throw new Error(await readErr(res));
    return res.json(); // Expected: { imageKey, imageUrl? } OR { result: {...} }
  };

  const handleSave = async () => {
    if (!endpoints) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // 1) Upload drafts for rows that already have _id
      let working = { ...(doc || {}), items: [...(doc.items || [])] };
      for (let i = 0; i < working.items.length; i++) {
        const it = working.items[i];
        const k = keyFor(it, i);
        const d = drafts[k];
        if (d?.file && it?._id) {
          const up = await uploadOne(it._id, d.file);
          if (up?.result?.items) {
            // backend returned full updated document
            working = up.result;
          } else if (up?.imageKey) {
            working.items[i] = { ...it, imageKey: up.imageKey, imageUrl: up.imageUrl || it.imageUrl };
          } else if (up?.key) {
            // legacy fallback
            working.items[i] = { ...it, imageKey: up.key, imageUrl: up.url || it.imageUrl };
          }
        }
      }

      // 2) PUT all items (store keys; server can presign on GET)
      const payload = {
        items: (working.items || []).map((x, i) => ({
          title: x.title || "",
          excerpt: x.excerpt || "",
          tag: x.tag || "",
          date: x.date || "",
          href: x.href || "blog-details.html",
          imageKey: x.imageKey || "",                    // <-- key is the source of truth
          delay: (x.delay ?? `.${(i % 3) + 2}`).toString(),
          order: Number.isFinite(x.order) ? Number(x.order) : i + 1,
        })),
      };

      const res = await fetch(`${endpoints.PUT_URL}?_=${Date.now()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Save failed");

      // 3) Refresh from server (to get _ids + presigned/absolute URLs)
      await load();

      // 4) clear drafts
      Object.values(lastUrlsRef.current).forEach((u) => {
        try { if (u) URL.revokeObjectURL(u); } catch {}
      });
      lastUrlsRef.current = {};
      setDrafts({});

      setShowToast(true);
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults (server) — delete overrides and reload
  const handleReset = async () => {
    if (!endpoints) return;
    setResetting(true);
    setErrorMsg("");
    try {
      const r = await fetch(`${endpoints.RESET}?_=${Date.now()}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readErr(r));
      await load();

      // clean any local previews
      Object.values(lastUrlsRef.current).forEach((u) => {
        try { if (u) URL.revokeObjectURL(u); } catch {}
      });
      lastUrlsRef.current = {};
      setDrafts({});
    } catch (e) {
      setErrorMsg(e?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const jumpToEdit = (rowKey) => {
    const row = rowRefs.current[rowKey];
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightKey(rowKey);
    setTimeout(() => setHighlightKey(null), 1200);
  };

  const goBack = () => {
    const q = new URLSearchParams({ templateId: templateId || "" });
    if (pageId) router.push(`/editorpages/page/${pageId}?${q.toString()}`);
    else router.back();
  };

  /* ------------------------------- UI ------------------------------- */
  return (
    <EditorDashboardLayout>
      <Container fluid className="py-4">
        <Row>
          <Col className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="fw-bold">📰 Blog & Insights</h4>
              <BackBar onBack={goBack} />
            </div>
            <div className="text-end small">
              <div>
                <strong>Template:</strong> <code>{templateId || "(resolving…)"}</code>{" "}
                <Badge bg="secondary">{(doc.items || []).length} posts</Badge>
                {sectionId ? <> • <strong>Section:</strong> <code>{sectionId}</code></> : null}
              </div>
              {endpoints?.BASE && (
                <div className="text-muted" title={endpoints.BASE}>
                  endpoint: <code>/api/blogs/{encodeURIComponent(userId || "")}/{encodeURIComponent(templateId || "")}</code>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {(!userId || !templateId) && (
          <Row className="mb-3"><Col><Alert variant="secondary" className="mb-0">Resolving user/template…</Alert></Col></Row>
        )}

        {errorMsg ? (
          <Row className="mb-3"><Col><Alert variant="danger" className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{errorMsg}</Alert></Col></Row>
        ) : null}

        {/* Preview (compact list + reset) */}
        <Row className="mb-4">
          <Col>
            <Card className="p-4">
              <div className="sec-head mb-4 d-flex align-items-center">
                <div>
                  <span className="sub-title mb-1 opacity-75">- News</span>
                  <h3 className="text-uppercase fw-bold">Blog & <span className="fw-light">Insights</span></h3>
                </div>
                <div className="ms-auto d-flex gap-2">
                  <Button variant="outline-secondary" onClick={handleReset} disabled={resetting || !templateId || !userId}>
                    {resetting ? "Resetting…" : "↺ Reset to Defaults"}
                  </Button>
                </div>
              </div>

              {(doc.items || [])
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((it, i) => {
                  const k = keyFor(it, i);
                  const src = drafts[k]?.url || toAbs(it.imageUrl || it.imageKey);
                  return (
                    <div className="item block border rounded p-3 mb-3" key={it._id || i}>
                      <div className="row g-3 align-items-center">
                        <div className="col-lg-6">
                          <div className="d-flex align-items-center gap-3">
                            {src ? (
                              <img
                                src={src}
                                alt=""
                                style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 4 }}
                              />
                            ) : null}
                            <div>
                              <div className="small text-muted">
                                <span className="me-3">{it.tag || "Tag"}</span>
                                <span>{it.date || "Date"}</span>
                              </div>
                              <h5 className="mb-0">{it.title || "Post title…"}</h5>
                              <div className="small opacity-75 text-truncate" style={{ maxWidth: 520 }}>
                                {it.excerpt || "Excerpt…"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 offset-lg-3 text-end">
                          <div className="d-inline-flex gap-2">
                            <a className="btn btn-light btn-sm" href={it.href || "#"} target="_blank" rel="noreferrer">
                              Continue Read →
                            </a>
                            <Button size="sm" variant="outline-primary" onClick={() => jumpToEdit(k)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </Card>
          </Col>
        </Row>

        {/* Editor table */}
        <Card className="p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Posts</h6>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleReset} disabled={resetting || !templateId || !userId}>
                {resetting ? "Resetting…" : "↺ Reset to Defaults"}
              </Button>
              <Button variant="outline-primary" onClick={addRow}>➕ Add Post</Button>
            </div>
          </div>

          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th style={{width: 80}}>Order</th>
                <th style={{minWidth: 220}}>Title</th>
                <th style={{minWidth: 260}}>Excerpt</th>
                <th style={{width: 120}}>Tag</th>
                <th style={{width: 170}}>Date</th>
                <th style={{width: 180}}>Link (href)</th>
                <th style={{width: 130}}>Delay</th>
                <th style={{minWidth: 230}}>Image</th>
                <th style={{width: 170}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(doc.items || []).map((it, idx) => {
                const k = keyFor(it, idx);
                const thumb = drafts[k]?.url || toAbs(it.imageUrl || it.imageKey);
                const isHi = highlightKey === k;
                return (
                  <tr
                    key={it._id || idx}
                    ref={(el) => (rowRefs.current[k] = el)}
                    className={isHi ? "table-warning" : undefined}
                    style={isHi ? { transition: "background-color .6s" } : undefined}
                  >
                    <td>
                      <Form.Control type="number" value={it.order ?? idx + 1} onChange={setField(idx, "order")} />
                    </td>
                    <td>
                      <Form.Control value={it.title || ""} onChange={setField(idx, "title")} />
                    </td>
                    <td>
                      <Form.Control as="textarea" rows={2} value={it.excerpt || ""} onChange={setField(idx, "excerpt")} />
                    </td>
                    <td>
                      <Form.Control value={it.tag || ""} onChange={setField(idx, "tag")} />
                    </td>
                    <td>
                      <Form.Control value={it.date || ""} onChange={setField(idx, "date")} />
                    </td>
                    <td>
                      <Form.Control value={it.href || ""} onChange={setField(idx, "href")} />
                    </td>
                    <td>
                      <Form.Control value={it.delay || ""} onChange={setField(idx, "delay")} />
                    </td>
                    <td>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          style={{ width: 66, height: 44, objectFit: "cover", display: "block", marginBottom: 6 }}
                        />
                      ) : null}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          onPickLocal(f, k);
                          try { e.target.value = ""; } catch {}
                        }}
                      />
                      {!it._id && drafts[k]?.file && (
                        <small className="text-muted d-block mt-1">
                          (Save to create this post, then the image is attached.)
                        </small>
                      )}
                    </td>
                    <td className="text-nowrap">
                      <Button size="sm" className="me-2" variant="light" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</Button>
                      <Button size="sm" className="me-2" variant="light" onClick={() => moveDown(idx)} disabled={idx === (doc.items?.length || 1) - 1}>↓</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => removeRow(idx)}>Delete</Button>
                    </td>
                  </tr>
                );
              })}
              {(doc.items || []).length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted">No posts. Add one above.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="text-end">
            <Button onClick={handleSave} disabled={saving || !templateId || !userId}>
              {saving ? "Saving…" : "💾 Save Posts"}
            </Button>
          </div>
        </Card>

        {/* Toast */}
        <ToastContainer position="bottom-end" className="p-3">
          <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
            <Toast.Body className="text-white">✅ Saved successfully.</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </EditorDashboardLayout>
  );
}

BlogStudioPage.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
export default BlogStudioPage;
