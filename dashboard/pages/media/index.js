// dashboard/pages/media/index.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
  Badge,
} from "react-bootstrap";

import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import NavbarTop from "../../layouts/navbars/NavbarTop";
import { api, getUserId, getTemplateId } from "../../lib/api";

const BREAKPOINT = 1120;

export default function MediaLibraryPage() {
  // Sidebar responsiveness
  const [isCompact, setIsCompact] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Hydration fix
  const [mounted, setMounted] = useState(false);

  // Media states
  const [type, setType] = useState("images");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    msg: "",
    variant: "success",
  });

  // Delete modal
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const userId = getUserId();
  const templateId = getTemplateId();

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => setMounted(true), []);

  // handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth <= BREAKPOINT;
      setIsCompact(compact);
      if (!compact) setShowMenu(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth <= BREAKPOINT;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ loader
  async function loadMedia(selectedType = type, { silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");

    try {
      if (!userId || !templateId) {
        setItems([]);
        return;
      }

      const normType =
        selectedType === "images"
          ? "image"
          : selectedType === "videos"
          ? "video"
          : selectedType;

      const res = await api.get(
        `/api/media/${encodeURIComponent(userId)}/${encodeURIComponent(
          templateId
        )}?type=${encodeURIComponent(normType)}`
      );

      const list = res?.items || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load media");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, userId, templateId]);

  async function onRefresh() {
    setRefreshing(true);
    await loadMedia(type, { silent: true });
    setRefreshing(false);
    setToast({ show: true, msg: "Media refreshed", variant: "success" });
  }

  // helpers
  const isImage = (m) =>
    m?.type === "image" || (m?.mime || "").startsWith("image/");
  const isVideo = (m) =>
    m?.type === "video" || (m?.mime || "").startsWith("video/");

  const getUrl = (m) => m?.url || "";
  const getName = (m) => m?.name || "Untitled";

  // download
  async function onDownload(m) {
    try {
      const res = await api.get(`/api/media/download/${m._id}`);
      const url = res?.url;
      if (!url) throw new Error("No download url");
      window.open(url, "_blank");
    } catch (e) {
      setToast({
        show: true,
        msg: e.message || "Download failed",
        variant: "danger",
      });
    }
  }

  // open delete modal + check usage
  async function onAskDelete(m) {
    setDeleteTarget(m);
    setConfirmDelete(true);
    setUsageInfo(null);

    try {
      const usage = await api.get(`/api/media/check/${m._id}`);
      setUsageInfo(usage);
    } catch {
      setUsageInfo({ inUse: false, usedIn: [] });
    }
  }

  // confirm delete
  async function onConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/media/${deleteTarget._id}`);
      setToast({
        show: true,
        msg: "Media deleted",
        variant: "success",
      });
      setConfirmDelete(false);
      setDeleteTarget(null);
      await loadMedia(type, { silent: true });
    } catch (e) {
      setToast({
        show: true,
        msg: e.message || "Delete failed",
        variant: "danger",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        #page-content {
          background-color: transparent !important;
        }
      `}</style>

      {/* mobile sidebar button */}
      {isCompact && (
        <button
          className="btn btn-outline-secondary position-fixed navbar-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <img
            src={`/icons/${sidebarOpen ? "menu-close.png" : "002-app.png"}`}
            alt="Toggle menu"
          />
        </button>
      )}

      <div className="header">
        <NavbarTop
          isMobile={isCompact}
          toggleMenu={toggleMenu}
          sidebarVisible={!isCompact}
        />
      </div>

      {/* Background blobs */}
      <div className="bg-wrapper-custom">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
        <div className="blob blob5" />
        <div className="bg-inner-custom" />
      </div>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Sidebar */}
        <SidebarDashly
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCompact={isCompact}
          setIsCompact={setIsCompact}
          isMobile={isBelowLg}
        />

        <main
          className="main-wrapper"
          style={{
            flexGrow: 1,
            marginLeft: !isBelowLg && sidebarOpen ? 240 : 0,
            transition: "margin-left 0.25s ease",
            padding: "3.5rem 10px 20px 10px",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Container fluid="xxl" className="dash-container">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="container-title mb-1">Media Library</h5>
                <p className="container-subtitle mb-0">
                  Uploads and assets used in your template.
                </p>

                {/* ✅ no hydration mismatch */}
                {mounted && userId && (
                  <small className="text-muted">
                    User: {userId} • Template: {templateId}
                  </small>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ minWidth: 140 }}
                >
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                </Form.Select>

                <Button
                  variant="outline-light"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="d-flex align-items-center gap-2"
                >
                  {refreshing ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Refreshing
                    </>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </div>

            {/* Error banner */}
            {!!error && (
              <div
                className="mt-3 px-3 py-2 rounded"
                style={{
                  background: "rgba(220, 53, 69, 0.15)",
                  border: "1px solid rgba(220, 53, 69, 0.35)",
                  color: "#fff",
                }}
              >
                {error}
              </div>
            )}

            <Card className="border-0 ion-card mt-3">
              <Card.Body>
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center py-5">
                    <Spinner animation="border" />
                    <span className="ms-2">Loading media…</span>
                  </div>
                ) : items.length === 0 ? (
                  <div
                    className="text-center py-5 rounded"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px dashed rgba(255,255,255,0.15)",
                      color: "#ffffffaa",
                    }}
                  >
                    No media uploaded yet.
                  </div>
                ) : (
                  <Row className="g-3">
                    {items.map((m, i) => {
                      const url = getUrl(m);
                      const name = getName(m);

                      return (
                        <Col key={m?._id || i} xs={12} sm={6} md={4} lg={3}>
                          <div
                            className="p-2 rounded"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            <div
                              className="rounded overflow-hidden d-flex align-items-center justify-content-center"
                              style={{
                                width: "100%",
                                height: 160,
                                background: "rgba(0,0,0,0.35)",
                              }}
                            >
                              {isImage(m) && url ? (
                                <img
                                  src={url}
                                  alt={name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : isVideo(m) && url ? (
                                <video
                                  src={url}
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span className="text-muted">No preview</span>
                              )}
                            </div>

                            <div className="mt-2 d-flex justify-content-between align-items-start gap-2">
                              <div className="me-auto">
                                <div
                                  className="fw-semibold text-truncate"
                                  title={name}
                                >
                                  {name}
                                </div>
                                {m?.size && (
                                  <small className="text-muted">
                                    {(Number(m.size) / 1024).toFixed(1)} KB
                                  </small>
                                )}
                                <div className="mt-1">
                                  <Badge bg="secondary">
                                    {m?.type || "file"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-light"
                                onClick={() => onDownload(m)}
                                style={{ flex: 1 }}
                              >
                                Download
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => onAskDelete(m)}
                                style={{ flex: 1 }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>

      {/* Delete modal */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete media?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!usageInfo ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" animation="border" />
              Checking if this file is in use…
            </div>
          ) : usageInfo.inUse ? (
            <>
              <p className="mb-2">
                This file is currently used in your website.
              </p>
              <ul className="small mb-0">
                {usageInfo.usedIn?.map((u, idx) => (
                  <li key={idx}>
                    {u.source} • {u.field || "content"} • {u.title}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mb-0">
              File is not used anywhere. You can safely delete it.
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirmDelete}
            disabled={!usageInfo || usageInfo.inUse || deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          delay={2500}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
