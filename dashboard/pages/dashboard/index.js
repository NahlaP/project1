



// // og
// // dashboard/pages/dashboard/index.js
// // working fine for sir-template — now also opens Home editor for Gym from the chooser

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Toast,
//   ToastContainer,
//   Modal,
//   Button,
//   Spinner,
//   Form,
// } from "react-bootstrap";
// import SidebarDashly from "../../layouts/navbars/NavbarVertical";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBars } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";

// import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
// import { setTemplateCookie } from "../../lib/templateCookie";
// import { backendBaseUrl } from "../../lib/config";

// const USER_ID_CONST = "demo-user";                // replace if you have auth
// const FALLBACK_TEMPLATE_ID = "sir-template-1";    // safe default
// const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"]; // ✅ hide/remove 3rd template

// /* ---------------- Inline Template Chooser Card ---------------- */
// function TemplateChooserCard() {
//   const router = useRouter();
//   const userId = getUserId();

//   const [loading, setLoading] = useState(true);
//   const [templates, setTemplates] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   // reset modal
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmTpl, setConfirmTpl] = useState({
//     id: null,
//     name: "",
//     tag: "v1",
//     versions: [],
//   });
//   const [resetting, setResetting] = useState(false);
//   const [toast, setToast] = useState({
//     show: false,
//     msg: "",
//     variant: "success",
//   });

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         // list contains your templates (with versions[])
//         const list = await api.listTemplates();
//         const sel = await api.selectedTemplateForUser(userId);
//         if (off) return;

//         const data = list?.data || [];

//         // ✅ Only keep the two templates you want to show
//         const filtered = data.filter((t) =>
//           ALLOWED_TEMPLATES.includes(t.templateId)
//         );

//         setTemplates(filtered);

//         // choose selected from filtered list (fall back to first allowed)
//         let activeTpl =
//           sel?.data?.templateId ??
//           sel?.templateId ??
//           filtered?.[0]?.templateId ??
//           null;

//         if (!filtered.find((t) => t.templateId === activeTpl)) {
//           activeTpl = filtered?.[0]?.templateId ?? null;
//         }
//         setSelected(activeTpl);
//       } catch (e) {
//         if (!off)
//           setError(e?.message || "Failed to load templates / selected template");
//       } finally {
//         if (!off) setLoading(false);
//       }
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);

//   async function choose(templateId) {
//     try {
//       setSaving(true);
//       await api.selectTemplate(templateId, userId);
//       setSelected(templateId);

//       // keep cookie in sync
//       setTemplateCookie(templateId);

//       // ping public host to sync
//       fetch(
//         `${PUBLIC_HOST}/?templateId=${encodeURIComponent(templateId)}&r=${Date.now()}`,
//         { mode: "no-cors", credentials: "include" }
//       );
//     } catch (e) {
//       alert(e.message || "Failed to select template");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function openReset(tpl) {
//     // tpl is the object from listTemplates; it should have versions[]
//     const versions = Array.isArray(tpl.versions) ? tpl.versions : [];
//     const defaultTag = tpl.currentTag || versions?.[0]?.tag || "v1";

//     setConfirmTpl({
//       id: tpl.templateId,
//       name: tpl.name || tpl.templateId,
//       tag: defaultTag,
//       versions,
//     });
//     setConfirmOpen(true);
//   }

//   async function doReset() {
//     if (!confirmTpl.id) return;
//     try {
//       setResetting(true);

//       // pass ?ver=<selectedTag> so backend pulls the correct version
//       const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
//         userId
//       )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(
//         confirmTpl.tag
//       )}`;

//       const res = await fetch(url, {
//         method: "POST",
//         headers: { Accept: "application/json" },
//       });
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || json?.ok === false) {
//         throw new Error(json?.error || json?.message || "Reset failed");
//       }

//       // keep cookie & public site in sync if currently selected
//       if (selected === confirmTpl.id) {
//         setTemplateCookie(confirmTpl.id);
//         fetch(
//           `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
//             confirmTpl.id
//           )}&reset=1&r=${Date.now()}`,
//           { mode: "no-cors", credentials: "include" }
//         );
//       }

//       setToast({
//         show: true,
//         msg: `Restored version defaults (${confirmTpl.tag}): content + order.`,
//         variant: "success",
//       });
//       setConfirmOpen(false);

//       // optional: refresh current page data so editor/preview sees new order
//       router.replace(router.asPath);
//     } catch (e) {
//       setToast({
//         show: true,
//         msg: e?.message || "Reset failed",
//         variant: "danger",
//       });
//     } finally {
//       setResetting(false);
//     }
//   }

//   // ✅ NEW: Open Editor for the currently selected template (works for Gym and Sir)
//   async function openEditorForSelected() {
//     try {
//       const tplId = selected || FALLBACK_TEMPLATE_ID;
//       const pageId = await api.getHomePageId(userId, tplId);
//       if (pageId) {
//         router.push(`/editorpages/page/${pageId}`);
//       } else {
//         alert("Home page not found yet.");
//       }
//     } catch (e) {
//       alert(e?.message || "Failed to open editor");
//     }
//   }

//   return (
//     <>
//       <Card
//         className="border-0 ion-card h-100"
//         style={{
//           background: "rgba(255,255,255,0.28)",
//           backdropFilter: "blur(50px)",
//           WebkitBackdropFilter: "blur(50px)",
//           borderRadius: 20,
//           border: "1px solid rgba(255,255,255,0.3)",
//         }}
//       >
//         <Card.Body className="px-4 pt-4 pb-3">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//               Choose Your Template
//             </h5>
//             <img src="/icons/layout-icon.png" alt="" width={30} height={30} />
//           </div>

//           {loading && <div className="text-muted">Loading templates…</div>}
//           {error && <div className="text-danger">{error}</div>}

//           {!loading && !error && (
//             <div
//               className="d-grid"
//               style={{
//                 gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
//                 gap: 12,
//               }}
//             >
//               {templates.map((t) => {
//                 const isActive = selected === t.templateId;
//                 const versions = Array.isArray(t.versions) ? t.versions : [];
//                 const verLabel =
//                   t.currentTag ||
//                   versions?.[0]?.tag ||
//                   (versions.length ? versions[0].tag : "—");

//                 return (
//                   <div
//                     key={t.templateId}
//                     className={`p-3 rounded-3 border ${
//                       isActive ? "border-primary shadow-sm" : "border-light"
//                     }`}
//                     style={{ background: "#fff" }}
//                   >
//                     <div
//                       style={{
//                         height: 110,
//                         borderRadius: 10,
//                         background: "linear-gradient(135deg,#f5f7fa,#e4ecf7)",
//                       }}
//                     />
//                     <div className="mt-2 d-flex align-items-center justify-content-between">
//                       <div>
//                         <div className="fw-semibold">{t.name}</div>
//                         <div className="text-muted" style={{ fontSize: 12 }}>
//                           ID: {t.templateId}
//                         </div>
//                         <div className="text-muted" style={{ fontSize: 12 }}>
//                           Current: {verLabel}
//                         </div>
//                       </div>
//                       <button
//                         className="btn btn-sm"
//                         style={{ background: "#111827", color: "#fff", borderRadius: 8 }}
//                         disabled={saving || isActive}
//                         onClick={() => choose(t.templateId)}
//                         title={isActive ? "Already selected" : "Select this template"}
//                       >
//                         {isActive ? "Selected ✓" : saving ? "Saving…" : "Select"}
//                       </button>
//                     </div>

//                     <div className="mt-2 d-flex flex-wrap gap-2">
//                       <button
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => router.push(`/templates/preview/${t.templateId}`)}
//                         style={{ borderRadius: 8 }}
//                       >
//                         Preview
//                       </button>

//                       {/* ✅ This Edit now opens the Home editor for the active template (Gym supported) */}
//                       <button
//                         className="btn btn-sm btn-primary"
//                         onClick={openEditorForSelected}
//                         disabled={!isActive}
//                         style={{ borderRadius: 8 }}
//                       >
//                         Edit
//                       </button>

//                       <button
//                         className="btn btn-sm btn-outline-danger"
//                         onClick={() => openReset(t)}
//                         disabled={!isActive}
//                         style={{ borderRadius: 8 }}
//                         title={
//                           isActive
//                             ? "Reset all sections to S3 version defaults (content + order)"
//                             : "Select this template to enable reset"
//                         }
//                       >
//                         {isActive ? "Reset to Default" : "Reset (Select first)"}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Confirm Reset Modal (versioned) */}
//       <Modal
//         show={confirmOpen}
//         onHide={() => (!resetting ? setConfirmOpen(false) : null)}
//         centered
//       >
//         <Modal.Header closeButton={!resetting}>
//           <Modal.Title>Reset “{confirmTpl.name}” to default?</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           This will remove all your overrides and restore the{" "}
//           <b>version defaults</b> (content + section order) from S3 version{" "}
//           <code>{confirmTpl.tag}</code>. Your uploads remain in S3.
//           <div className="mt-3">
//             <Form.Label className="fw-semibold">Version</Form.Label>
//             <Form.Select
//               disabled={resetting}
//               value={confirmTpl.tag}
//               onChange={(e) =>
//                 setConfirmTpl((s) => ({ ...s, tag: e.target.value }))
//               }
//             >
//               {(confirmTpl.versions || []).map((v) => (
//                 <option key={v.tag} value={v.tag}>
//                   {v.tag} (#{v.number})
//                 </option>
//               ))}
//               {!confirmTpl.versions?.length && <option value="v1">v1</option>}
//             </Form.Select>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setConfirmOpen(false)}
//             disabled={resetting}
//           >
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={doReset} disabled={resetting}>
//             {resetting ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" /> Resetting…
//               </>
//             ) : (
//               "Reset to Default"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Toast */}
//       <ToastContainer position="bottom-end" className="p-3">
//         <Toast
//           onClose={() => setToast((t) => ({ ...t, show: false }))}
//           show={toast.show}
//           delay={2400}
//           autohide
//           bg={toast.variant === "danger" ? "danger" : "success"}
//         >
//           <Toast.Body className="text-white">{toast.msg}</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </>
//   );
// }

// /* ------------------------------ MAIN DASHBOARD ------------------------------ */
// export default function DashboardHome() {
//   const [homePageId, setHomePageId] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false);
//   const router = useRouter();

//   const cardGlass = useMemo(
//     () => ({
//       background: "rgba(255,255,255,0.28)",
//       backdropFilter: "blur(50px)",
//       WebkitBackdropFilter: "blur(50px)",
//       borderRadius: 20,
//       border: "1px solid rgba(255,255,255,0.3)",
//     }),
//     []
//   );

//   useEffect(() => {
//     const onResize = () => {
//       const below = window.innerWidth < 992;
//       setIsBelowLg(below);
//       setSidebarOpen(!below);
//     };
//     onResize();
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   // This card still uses a static fallback; the chooser's Edit button now handles Gym/Sir correctly.
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const pageId = await api.getHomePageId(
//           USER_ID_CONST,
//           FALLBACK_TEMPLATE_ID
//         );
//         if (!cancelled) setHomePageId(pageId || null);
//       } catch {
//         if (!cancelled) setHomePageId(null);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <>
//       <style jsx global>{`
//         #page-content {
//           background-color: transparent !important;
//         }
//       `}</style>

//       <div className="bg-wrapper-custom">
//         <div className="blob blob1" />
//         <div className="blob blob2" />
//         <div className="blob blob3" />
//         <div className="blob blob4" />
//         <div className="blob blob5" />
//         <div className="bg-inner-custom" />
//       </div>

//       <div
//         style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}
//       >
//         <SidebarDashly
//           isOpen={sidebarOpen}
//           setIsOpen={setSidebarOpen}
//           isMobile={isBelowLg}
//         />

//         <button
//           type="button"
//           onClick={() => setSidebarOpen((s) => !s)}
//           className="btn btn-link d-lg-none position-fixed top-0 start-0 m-3 p-2 z-3"
//           aria-label="Toggle menu"
//           style={{
//             background: "#fff",
//             borderRadius: 10,
//             boxShadow: "0 2px 8px rgba(0,0,0,.12)",
//           }}
//         >
//           <FontAwesomeIcon icon={faBars} />
//         </button>

//         <main
//           className="main-wrapper"
//           style={{
//             flexGrow: 1,
//             marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
//             transition: "margin-left 0.25s ease",
//             padding: "2rem",
//             paddingTop: "6rem",
//             width: "100%",
//             overflowX: "hidden",
//           }}
//         >
//           <Container fluid="xxl">
//             <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
//               Welcome back, Marco!
//             </h5>
//             <br />
//             <p className="text-dark">
//               Here&apos;s your website overview and next steps to complete your setup.
//             </p>

//             {/* ---------- TEMPLATE CHOOSER (version-aware reset) ---------- */}
//             <Row className="g-4 mt-2">
//               <Col xs={12}>
//                 <TemplateChooserCard />
//               </Col>
//             </Row>

//             {/* ---- Rest of cards kept the same (optional UI below) ---- */}
//             <Row className="g-4 mt-2">
//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 ion-card h-100" style={cardGlass}>
//                   <Card.Body className="position-relative px-4 pt-5 pb-4">
//                     <div className="d-flex justify-content-between align-items-start mb-3">
//                       <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
//                         Current Subscription
//                       </h5>
//                       <div className="card-icon">
//                         <img src="/icons/crown.png" alt="Pro Plan" />
//                       </div>
//                     </div>
//                     <div className="d-flex flex-wrap gap-2 mb-3">
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">
//                         Pro Plan
//                       </span>
//                       <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">
//                         Monthly
//                       </span>
//                     </div>

//                     <div className="card_wrapper-custom">
//                       <h4
//                         className="fw-bold mb-3"
//                         style={{ lineHeight: "1.5", fontSize: "1.7rem" }}
//                       >
//                         $29.99{" "}
//                         <small className="text-dark fs-6 fw-normal align-middle">
//                           /month
//                         </small>
//                       </h4>

//                       <div className="d-flex justify-content-between text-dark small mb-1">
//                         <span>Next billing date</span>
//                         <span className="fw-semibold text-dark">Feb 15, 2024</span>
//                       </div>
//                       <div className="d-flex justify-content-between text-dark small mb-3">
//                         <span>Storage used</span>
//                         <span className="fw-semibold text-dark">8.2GB / 50GB</span>
//                       </div>

//                       <div className="mb-3 progress thin">
//                         <div
//                           className="progress-bar bg-mavsketch"
//                           style={{ width: `${(8.2 / 50) * 100}%` }}
//                         >
//                           {8.2 > 8 ? <div>8.2GB</div> : ""}
//                         </div>
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       className="btn w-100 fw-medium rounded-3 button-primary"
//                       style={{ fontSize: "0.92rem", padding: "6px 0" }}
//                     >
//                       Manage Subscription
//                     </button>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 ion-card h-100" style={cardGlass}>
//                   <Card.Body className="position-relative px-4 pt-4 pb-3">
//                     <div className="d-flex justify-content-between align-items-start mb-2">
//                       <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//                         Domain Information
//                       </h5>
//                       <div className="card-icon">
//                         <img src="/icons/globe-icon.png" alt="Domain" />
//                       </div>
//                     </div>

//                     <div className="card_wrapper-custom">
//                       <h6 className="fw-bold mb-2 mt-3" style={{ fontSize: "1rem" }}>
//                         marcobotton.com
//                       </h6>

//                       <div className="d-flex flex-wrap gap-2 mb-3">
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">
//                           ✔ Connected
//                         </span>
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">
//                           SSL Active
//                         </span>
//                       </div>
//                     </div>

//                     <div className="d-flex gap-2">
//                       <button
//                         type="button"
//                         className="btn fw-medium rounded-3 w-50"
//                         style={{
//                           padding: "6px 0",
//                           backgroundColor: "#FF3C3C",
//                           color: "#fff",
//                           border: "none",
//                         }}
//                         onClick={() =>
//                           window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank")
//                         }
//                       >
//                         View Site
//                       </button>
//                       <button
//                         type="button"
//                         className="btn fw-medium rounded-3 w-50 button-primary"
//                         style={{ padding: "6px 0" }}
//                       >
//                         Settings
//                       </button>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 ion-card h-100" style={cardGlass}>
//                   <Card.Body className="position-relative px-4 pt-4 pb-3">
//                     <div className="d-flex justify-content-between align-items-start mb-2">
//                       <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//                         Edit My Website
//                       </h5>
//                       <img src="/icons/edit-icon.png" alt="Edit" width={30} height={30} />
//                     </div>

//                     <div className="d-flex flex-column gap-2">
//                       {homePageId ? (
//                         <button
//                           type="button"
//                           className="btn"
//                           onClick={() => router.push(`/editorpages/page/${homePageId}`)}
//                           style={{
//                             backgroundColor: "#FF3C3C",
//                             color: "#fff",
//                             border: "none",
//                             borderRadius: "10px",
//                             padding: "8px 0",
//                             fontWeight: 500,
//                           }}
//                         >
//                           Open Editor
//                         </button>
//                       ) : (
//                         <button
//                           type="button"
//                           className="btn button-dark"
//                           disabled
//                           style={{ color: "#fff" }}
//                         >
//                           <div className="modern-loader">
//                             <svg viewBox="0 0 120 120" className="infinity-loader">
//                               <path
//                                 className="infinity-path"
//                                 d="M60,15 a45,45 0 0 1 45,45 a45,45 0 0 1 -45,45 a45,45 0 0 1 -45,-45 a45,45 0 0 1 45,-45"
//                               />
//                             </svg>
//                           </div>
//                           Initializing…
//                         </button>
//                       )}
//                       <button
//                         type="button"
//                         className="btn fw-medium rounded-3 button-primary"
//                         style={{ fontSize: "0.92rem", padding: "8px 0" }}
//                       >
//                         Preview Changes
//                       </button>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             {/* simple metrics / recent activity (unchanged UI) */}
//             <Row className="g-4 mt-3">
//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 metric-card h-100" style={cardGlass}>
//                   <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
//                     <div className="d-flex justify-content-end">
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                         +12.5%
//                       </span>
//                     </div>
//                     <div>
//                       <h6
//                         className="text-uppercase text-muted fw-semibold mb-1"
//                         style={{ fontSize: "0.75rem" }}
//                       >
//                         Subscribers
//                       </h6>
//                       <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//                         2,548
//                       </h3>
//                       <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//                         Compared to 2,267 last month
//                       </p>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 metric-card h-100" style={cardGlass}>
//                   <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
//                     <div className="d-flex justify-content-end">
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                         +8.2%
//                       </span>
//                     </div>
//                     <div>
//                       <h6
//                         className="text-uppercase text-muted fw-semibold mb-1"
//                         style={{ fontSize: "0.75rem" }}
//                       >
//                         Page Views
//                       </h6>
//                       <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//                         42.5k
//                       </h3>
//                       <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//                         Compared to 39.3k last month
//                       </p>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               <Col xs={12} md={6} lg={4}>
//                 <Card
//                   className="custom-card-shadow border-0 metric-card h-100"
//                   style={cardGlass}
//                 >
//                   <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
//                     <div className="d-flex justify-content-end">
//                       <span
//                         className="px-2 py-1 rounded-pill fw-bold"
//                         style={{ background: "#FF3B30", color: "#fff" }}
//                       >
//                         +2.1%
//                       </span>
//                     </div>
//                     <div>
//                       <h6
//                         className="text-uppercase text-muted fw-semibold mb-1"
//                         style={{ fontSize: "0.75rem" }}
//                       >
//                         Bounce Rate
//                       </h6>
//                       <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//                         28.3%
//                       </h3>
//                       <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//                         Compared to 26.2% last month
//                       </p>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             <Row className="mt-4">
//               <Col xs={12}>
//                 <Card className="custom-card-shadow border-0 rounded-4" style={cardGlass}>
//                   <Card.Body className="p-4">
//                     <h5 className="fw-bold mb-4" style={{ fontSize: "1.05rem" }}>
//                       Recent Activity
//                     </h5>
//                     <ul className="list-unstyled mb-0">
//                       <li className="mb-3 d-flex align-items-start gap-3">
//                         <Image
//                           src="/images/user1.jpg"
//                           alt=""
//                           width={40}
//                           height={40}
//                           className="rounded-circle object-fit-cover"
//                         />
//                         <div>
//                           <strong>Sarah Johnson</strong> published a new article “Design
//                           Systems in 2023”
//                           <br />
//                           <small className="text-muted">2 hours ago</small>
//                         </div>
//                       </li>
//                       <li className="mb-3 d-flex align-items-start gap-3">
//                         <img
//                           src="/images/user2.jpg"
//                           alt=""
//                           width="40"
//                           height="40"
//                           className="rounded-circle object-fit-cover"
//                         />
//                         <div>
//                           <strong>Robert Chen</strong> updated the homepage banner
//                           <br />
//                           <small className="text-muted">4 hours ago</small>
//                         </div>
//                       </li>
//                       <li className="d-flex align-items-start gap-3">
//                         <img
//                           src="/images/user3.jpg"
//                           alt=""
//                           width="40"
//                           height="40"
//                           className="rounded-circle object-fit-cover"
//                         />
//                         <div>
//                           <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
//                           <br />
//                           <small className="text-muted">Yesterday at 2:45 PM</small>
//                         </div>
//                       </li>
//                     </ul>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>
//           </Container>
//         </main>
//       </div>
//     </>
//   );
// }


































// dashboard/pages/dashboard/index.js
// working fine for sir-template — now also opens Home editor for Gym from the chooser

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  Toast,
  ToastContainer,
  Modal,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
import { setTemplateCookie } from "../../lib/templateCookie";
import { backendBaseUrl } from "../../lib/config";

const USER_ID_CONST = "demo-user";                // replace if you have auth
const FALLBACK_TEMPLATE_ID = "sir-template-1";    // safe default
const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"]; // ✅ hide/remove 3rd template

/* ---------------- Inline Template Chooser Card ---------------- */
function TemplateChooserCard() {
  const router = useRouter();
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // reset modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTpl, setConfirmTpl] = useState({
    id: null,
    name: "",
    tag: "v1",
    versions: [],
  });
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    msg: "",
    variant: "success",
  });

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        // list contains your templates (with versions[])
        const list = await api.listTemplates();
        const sel = await api.selectedTemplateForUser(userId);
        if (off) return;

        const data = list?.data || [];

        // ✅ Only keep the two templates you want to show
        const filtered = data.filter((t) =>
          ALLOWED_TEMPLATES.includes(t.templateId)
        );

        setTemplates(filtered);

        // choose selected from filtered list (fall back to first allowed)
        let activeTpl =
          sel?.data?.templateId ??
          sel?.templateId ??
          filtered?.[0]?.templateId ??
          null;

        if (!filtered.find((t) => t.templateId === activeTpl)) {
          activeTpl = filtered?.[0]?.templateId ?? null;
        }
        setSelected(activeTpl);
      } catch (e) {
        if (!off)
          setError(e?.message || "Failed to load templates / selected template");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [userId]);

  function defaultVersionFor(tplObj) {
    const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
    return tplObj?.currentTag || versions?.[0]?.tag || "v1";
  }

  async function choose(templateId) {
    try {
      setSaving(true);
      await api.selectTemplate(templateId, userId);
      setSelected(templateId);

      // pick a version tag for cookies (no UI change)
      const tplObj = templates.find((t) => t.templateId === templateId) || null;
      const verTag = defaultVersionFor(tplObj);

      // keep cookie in sync (now writes version + user id as well)
      setTemplateCookie(templateId, verTag, userId);

      // ping public host to sync
      fetch(
        `${PUBLIC_HOST}/?templateId=${encodeURIComponent(templateId)}&v=${encodeURIComponent(verTag)}&r=${Date.now()}`,
        { mode: "no-cors", credentials: "include" }
      );
    } catch (e) {
      alert(e.message || "Failed to select template");
    } finally {
      setSaving(false);
    }
  }

  function openReset(tpl) {
    // tpl is the object from listTemplates; it should have versions[]
    const versions = Array.isArray(tpl.versions) ? tpl.versions : [];
    const defaultTag = tpl.currentTag || versions?.[0]?.tag || "v1";

    setConfirmTpl({
      id: tpl.templateId,
      name: tpl.name || tpl.templateId,
      tag: defaultTag,
      versions,
    });
    setConfirmOpen(true);
  }

  async function doReset() {
    if (!confirmTpl.id) return;
    try {
      setResetting(true);

      // pass ?ver=<selectedTag> so backend pulls the correct version
      const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
        userId
      )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(
        confirmTpl.tag
      )}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || json?.message || "Reset failed");
      }

      // keep cookie & public site in sync if currently selected
      if (selected === confirmTpl.id) {
        setTemplateCookie(confirmTpl.id, confirmTpl.tag, userId);
        fetch(
          `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
            confirmTpl.id
          )}&v=${encodeURIComponent(confirmTpl.tag)}&reset=1&r=${Date.now()}`,
          { mode: "no-cors", credentials: "include" }
        );
      }

      setToast({
        show: true,
        msg: `Restored version defaults (${confirmTpl.tag}): content + order.`,
        variant: "success",
      });
      setConfirmOpen(false);

      // optional: refresh current page data so editor/preview sees new order
      router.replace(router.asPath);
    } catch (e) {
      setToast({
        show: true,
        msg: e?.message || "Reset failed",
        variant: "danger",
      });
    } finally {
      setResetting(false);
    }
  }

  // ✅ NEW: Open Editor for the currently selected template (works for Gym and Sir)
  async function openEditorForSelected() {
    try {
      const tplId = selected || FALLBACK_TEMPLATE_ID;
      const pageId = await api.getHomePageId(userId, tplId);
      if (pageId) {
        router.push(`/editorpages/page/${pageId}`);
      } else {
        alert("Home page not found yet.");
      }
    } catch (e) {
      alert(e?.message || "Failed to open editor");
    }
  }

  return (
    <>
      <Card
        className="border-0 ion-card h-100"
        style={{
          background: "rgba(255,255,255,0.28)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <Card.Body className="px-4 pt-4 pb-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
              Choose Your Template
            </h5>
            <img src="/icons/layout-icon.png" alt="" width={30} height={30} />
          </div>

          {loading && <div className="text-muted">Loading templates…</div>}
          {error && <div className="text-danger">{error}</div>}

          {!loading && !error && (
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 12,
              }}
            >
              {templates.map((t) => {
                const isActive = selected === t.templateId;
                const versions = Array.isArray(t.versions) ? t.versions : [];
                const verLabel =
                  t.currentTag ||
                  versions?.[0]?.tag ||
                  (versions.length ? versions[0].tag : "—");

                return (
                  <div
                    key={t.templateId}
                    className={`p-3 rounded-3 border ${
                      isActive ? "border-primary shadow-sm" : "border-light"
                    }`}
                    style={{ background: "#fff" }}
                  >
                    <div
                      style={{
                        height: 110,
                        borderRadius: 10,
                        background: "linear-gradient(135deg,#f5f7fa,#e4ecf7)",
                      }}
                    />
                    <div className="mt-2 d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">{t.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          ID: {t.templateId}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          Current: {verLabel}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#111827", color: "#fff", borderRadius: 8 }}
                        disabled={saving || isActive}
                        onClick={() => choose(t.templateId)}
                        title={isActive ? "Already selected" : "Select this template"}
                      >
                        {isActive ? "Selected ✓" : saving ? "Saving…" : "Select"}
                      </button>
                    </div>

                    <div className="mt-2 d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => router.push(`/templates/preview/${t.templateId}`)}
                        style={{ borderRadius: 8 }}
                      >
                        Preview
                      </button>

                      {/* ✅ This Edit now opens the Home editor for the active template (Gym supported) */}
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={openEditorForSelected}
                        disabled={!isActive}
                        style={{ borderRadius: 8 }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => openReset(t)}
                        disabled={!isActive}
                        style={{ borderRadius: 8 }}
                        title={
                          isActive
                            ? "Reset all sections to S3 version defaults (content + order)"
                            : "Select this template to enable reset"
                        }
                      >
                        {isActive ? "Reset to Default" : "Reset (Select first)"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirm Reset Modal (versioned) */}
      <Modal
        show={confirmOpen}
        onHide={() => (!resetting ? setConfirmOpen(false) : null)}
        centered
      >
        <Modal.Header closeButton={!resetting}>
          <Modal.Title>Reset “{confirmTpl.name}” to default?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will remove all your overrides and restore the{" "}
          <b>version defaults</b> (content + section order) from S3 version{" "}
          <code>{confirmTpl.tag}</code>. Your uploads remain in S3.
          <div className="mt-3">
            <Form.Label className="fw-semibold">Version</Form.Label>
            <Form.Select
              disabled={resetting}
              value={confirmTpl.tag}
              onChange={(e) =>
                setConfirmTpl((s) => ({ ...s, tag: e.target.value }))
              }
            >
              {(confirmTpl.versions || []).map((v) => (
                <option key={v.tag} value={v.tag}>
                  {v.tag} (#{v.number})
                </option>
              ))}
              {!confirmTpl.versions?.length && <option value="v1">v1</option>}
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            disabled={resetting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={doReset} disabled={resetting}>
            {resetting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Resetting…
              </>
            ) : (
              "Reset to Default"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          delay={2400}
          autohide
          bg={toast.variant === "danger" ? "danger" : "success"}
        >
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

/* ------------------------------ MAIN DASHBOARD ------------------------------ */
export default function DashboardHome() {
  const [homePageId, setHomePageId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);
  const router = useRouter();

  const cardGlass = useMemo(
    () => ({
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(50px)",
      WebkitBackdropFilter: "blur(50px)",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.3)",
    }),
    []
  );

  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth < 992;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // This card still uses a static fallback; the chooser's Edit button now handles Gym/Sir correctly.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pageId = await api.getHomePageId(
          USER_ID_CONST,
          FALLBACK_TEMPLATE_ID
        );
        if (!cancelled) setHomePageId(pageId || null);
      } catch {
        if (!cancelled) setHomePageId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        #page-content {
          background-color: transparent !important;
        }
      `}</style>

      <div className="bg-wrapper-custom">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
        <div className="blob blob5" />
        <div className="bg-inner-custom" />
      </div>

      <div
        style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}
      >
        <SidebarDashly
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isBelowLg}
        />

        <button
          type="button"
          onClick={() => setSidebarOpen((s) => !s)}
          className="btn btn-link d-lg-none position-fixed top-0 start-0 m-3 p-2 z-3"
          aria-label="Toggle menu"
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,.12)",
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <main
          className="main-wrapper"
          style={{
            flexGrow: 1,
            marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
            transition: "margin-left 0.25s ease",
            padding: "2rem",
            paddingTop: "6rem",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Container fluid="xxl">
            <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
              Welcome back, Marco!
            </h5>
            <br />
            <p className="text-dark">
              Here&apos;s your website overview and next steps to complete your setup.
            </p>

            {/* ---------- TEMPLATE CHOOSER (version-aware reset) ---------- */}
            <Row className="g-4 mt-2">
              <Col xs={12}>
                <TemplateChooserCard />
              </Col>
            </Row>

            {/* ---- Rest of cards kept the same (optional UI below) ---- */}
            <Row className="g-4 mt-2">
              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 ion-card h-100" style={cardGlass}>
                  <Card.Body className="position-relative px-4 pt-5 pb-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                        Current Subscription
                      </h5>
                      <div className="card-icon">
                        <img src="/icons/crown.png" alt="Pro Plan" />
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">
                        Pro Plan
                      </span>
                      <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">
                        Monthly
                      </span>
                    </div>

                    <div className="card_wrapper-custom">
                      <h4
                        className="fw-bold mb-3"
                        style={{ lineHeight: "1.5", fontSize: "1.7rem" }}
                      >
                        $29.99{" "}
                        <small className="text-dark fs-6 fw-normal align-middle">
                          /month
                        </small>
                      </h4>

                      <div className="d-flex justify-content-between text-dark small mb-1">
                        <span>Next billing date</span>
                        <span className="fw-semibold text-dark">Feb 15, 2024</span>
                      </div>
                      <div className="d-flex justify-content-between text-dark small mb-3">
                        <span>Storage used</span>
                        <span className="fw-semibold text-dark">8.2GB / 50GB</span>
                      </div>

                      <div className="mb-3 progress thin">
                        <div
                          className="progress-bar bg-mavsketch"
                          style={{ width: `${(8.2 / 50) * 100}%` }}
                        >
                          {8.2 > 8 ? <div>8.2GB</div> : ""}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn w-100 fw-medium rounded-3 button-primary"
                      style={{ fontSize: "0.92rem", padding: "6px 0" }}
                    >
                      Manage Subscription
                    </button>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 ion-card h-100" style={cardGlass}>
                  <Card.Body className="position-relative px-4 pt-4 pb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
                        Domain Information
                      </h5>
                      <div className="card-icon">
                        <img src="/icons/globe-icon.png" alt="Domain" />
                      </div>
                    </div>

                    <div className="card_wrapper-custom">
                      <h6 className="fw-bold mb-2 mt-3" style={{ fontSize: "1rem" }}>
                        marcobotton.com
                      </h6>

                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">
                          ✔ Connected
                        </span>
                        <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">
                          SSL Active
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn fw-medium rounded-3 w-50"
                        style={{
                          padding: "6px 0",
                          backgroundColor: "#FF3C3C",
                          color: "#fff",
                          border: "none",
                        }}
                        onClick={() =>
                          window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank")
                        }
                      >
                        View Site
                      </button>
                      <button
                        type="button"
                        className="btn fw-medium rounded-3 w-50 button-primary"
                        style={{ padding: "6px 0" }}
                      >
                        Settings
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 ion-card h-100" style={cardGlass}>
                  <Card.Body className="position-relative px-4 pt-4 pb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
                        Edit My Website
                      </h5>
                      <img src="/icons/edit-icon.png" alt="Edit" width={30} height={30} />
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {homePageId ? (
                        <button
                          type="button"
                          className="btn"
                          onClick={() => router.push(`/editorpages/page/${homePageId}`)}
                          style={{
                            backgroundColor: "#FF3C3C",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 0",
                            fontWeight: 500,
                          }}
                        >
                          Open Editor
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn button-dark"
                          disabled
                          style={{ color: "#fff" }}
                        >
                          <div className="modern-loader">
                            <svg viewBox="0 0 120 120" className="infinity-loader">
                              <path
                                className="infinity-path"
                                d="M60,15 a45,45 0 0 1 45,45 a45,45 0 0 1 -45,45 a45,45 0 0 1 -45,-45 a45,45 0 0 1 45,-45"
                              />
                            </svg>
                          </div>
                          Initializing…
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn fw-medium rounded-3 button-primary"
                        style={{ fontSize: "0.92rem", padding: "8px 0" }}
                      >
                        Preview Changes
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* simple metrics / recent activity (unchanged UI) */}
            <Row className="g-4 mt-3">
              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 metric-card h-100" style={cardGlass}>
                  <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-end">
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                        +12.5%
                      </span>
                    </div>
                    <div>
                      <h6
                        className="text-uppercase text-muted fw-semibold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Subscribers
                      </h6>
                      <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                        2,548
                      </h3>
                      <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                        Compared to 2,267 last month
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 metric-card h-100" style={cardGlass}>
                  <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-end">
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                        +8.2%
                      </span>
                    </div>
                    <div>
                      <h6
                        className="text-uppercase text-muted fw-semibold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Page Views
                      </h6>
                      <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                        42.5k
                      </h3>
                      <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                        Compared to 39.3k last month
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Card
                  className="custom-card-shadow border-0 metric-card h-100"
                  style={cardGlass}
                >
                  <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-end">
                      <span
                        className="px-2 py-1 rounded-pill fw-bold"
                        style={{ background: "#FF3B30", color: "#fff" }}
                      >
                        +2.1%
                      </span>
                    </div>
                    <div>
                      <h6
                        className="text-uppercase text-muted fw-semibold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Bounce Rate
                      </h6>
                      <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                        28.3%
                      </h3>
                      <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                        Compared to 26.2% last month
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col xs={12}>
                <Card className="custom-card-shadow border-0 rounded-4" style={cardGlass}>
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4" style={{ fontSize: "1.05rem" }}>
                      Recent Activity
                    </h5>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-3 d-flex align-items-start gap-3">
                        <Image
                          src="/images/user1.jpg"
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Sarah Johnson</strong> published a new article “Design
                          Systems in 2023”
                          <br />
                          <small className="text-muted">2 hours ago</small>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-start gap-3">
                        <img
                          src="/images/user2.jpg"
                          alt=""
                          width="40"
                          height="40"
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Robert Chen</strong> updated the homepage banner
                          <br />
                          <small className="text-muted">4 hours ago</small>
                        </div>
                      </li>
                      <li className="d-flex align-items-start gap-3">
                        <img
                          src="/images/user3.jpg"
                          alt=""
                          width="40"
                          height="40"
                          className="rounded-circle object-fit-cover"
                        />
                        <div>
                          <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
                          <br />
                          <small className="text-muted">Yesterday at 2:45 PM</small>
                        </div>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </>
  );
}













































