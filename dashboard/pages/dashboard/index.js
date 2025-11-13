



// // original
// // // dashboard/pages/dashboard/index.js
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

// import { api, getUserId, PUBLIC_HOST, setToken } from "../../lib/api";
// import { setTemplateCookie } from "../../lib/templateCookie";
// import { backendBaseUrl } from "../../lib/config";

// /* -------------------------------------------------------------------------- */
// /* Helpers                                                                    */
// /* -------------------------------------------------------------------------- */

// const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"]; // shown in chooser

// function getTokenFromCookie() {
//   if (typeof document === "undefined") return null;
//   const cname =
//     (process.env.NEXT_PUBLIC_COOKIE_NAME ||
//       process.env.COOKIE_NAME ||
//       "auth_token").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const m = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
//   return m ? decodeURIComponent(m[2]) : null;
// }

// function defaultVersionFor(tplObj) {
//   const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
//   return tplObj?.currentTag || versions?.[0]?.tag || "v1";
// }

// /* -------------------------------------------------------------------------- */
// /* Template Chooser Card                                                      */
// /* -------------------------------------------------------------------------- */

// function TemplateChooserCard({ userId }) {
//   const router = useRouter();

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
//   const [toast, setToast] = useState({ show: false, msg: "", variant: "success" });

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         // 1) list all templates
//         const list = await api.listTemplates();
//         const data = (list?.data || []).filter((t) =>
//           ALLOWED_TEMPLATES.includes(t.templateId)
//         );

//         // 2) fetch current selection for this user
//         const sel = await api.selectedTemplateForUser(userId);
//         let activeTpl =
//           sel?.data?.templateId ?? sel?.templateId ?? data?.[0]?.templateId ?? null;

//         if (!data.find((t) => t.templateId === activeTpl)) {
//           activeTpl = data?.[0]?.templateId ?? null;
//         }

//         if (!off) {
//           setTemplates(data);
//           setSelected(activeTpl);
//         }
//       } catch (e) {
//         if (!off) setError(e?.message || "Failed to load templates");
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

//       // version tag cookie
//       const tplObj = templates.find((t) => t.templateId === templateId) || null;
//       const verTag = defaultVersionFor(tplObj);

//       // sync cookie
//       setTemplateCookie(templateId, verTag, userId);

//       // optional ping to static host (guarded)
//       if (PUBLIC_HOST) {
//         fetch(
//           `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
//             templateId
//           )}&v=${encodeURIComponent(verTag)}&r=${Date.now()}`,
//           { mode: "no-cors", credentials: "include" }
//         );
//       }
//     } catch (e) {
//       alert(e?.message || "Failed to select template");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function openReset(tpl) {
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

//       // POST /api/template-reset/:userId/:templateId?ver=<tag>
//       const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
//         userId
//       )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(confirmTpl.tag)}`;

//       const token = getTokenFromCookie();

//       const res = await fetch(url, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ reason: "user_reset_to_default" }),
//         credentials: "include",
//       });

//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || json?.ok === false) {
//         throw new Error(json?.error || json?.message || `Reset failed (${res.status})`);
//       }

//       // keep cookie & (optionally) static host in sync
//       if (selected === confirmTpl.id) {
//         setTemplateCookie(confirmTpl.id, confirmTpl.tag, userId);
//         if (PUBLIC_HOST) {
//           fetch(
//             `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
//               confirmTpl.id
//             )}&v=${encodeURIComponent(confirmTpl.tag)}&reset=1&r=${Date.now()}`,
//             { mode: "no-cors", credentials: "include" }
//           );
//         }
//       }

//       setToast({
//         show: true,
//         msg: `Restored version defaults (${confirmTpl.tag})`,
//         variant: "success",
//       });
//       setConfirmOpen(false);

//       // refresh the page so cards & editors see the new order/content
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

//   // Open the proper editor for the template that’s selected
//   async function openEditorForSelected() {
//     try {
//       const tplId = selected;
//       if (!tplId) return;
//       const pageId = await api.getHomePageId(userId, tplId);
//       if (pageId) {
//         router.push(`/editorpages/page/${pageId}?templateId=${encodeURIComponent(tplId)}`);
//       } else {
//         alert("Home page not found for this template.");
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
//               style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}
//             >
//               {templates.map((t) => {
//                 const isActive = selected === t.templateId;
//                 const versions = Array.isArray(t.versions) ? t.versions : [];
//                 const verLabel =
//                   t.currentTag || versions?.[0]?.tag || (versions.length ? versions[0].tag : "—");

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

//       {/* Confirm Reset Modal */}
//       <Modal
//         show={confirmOpen}
//         onHide={() => (!resetting ? setConfirmOpen(false) : null)}
//         centered
//       >
//         <Modal.Header closeButton={!resetting}>
//           <Modal.Title>Reset “{confirmTpl.name}” to default?</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           This will remove your overrides and restore the{" "}
//           <b>version defaults</b> (content + section order) from{" "}
//           <code>{confirmTpl.tag}</code>.
//           <div className="mt-3">
//             <Form.Label className="fw-semibold">Version</Form.Label>
//             <Form.Select
//               disabled={resetting}
//               value={confirmTpl.tag}
//               onChange={(e) => setConfirmTpl((s) => ({ ...s, tag: e.target.value }))}
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
//           <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={resetting}>
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

// /* -------------------------------------------------------------------------- */
// /* Main Dashboard                                                             */
// /* -------------------------------------------------------------------------- */

// export default function DashboardHome() {
//   const router = useRouter();

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false);
//   const [me, setMe] = useState(null); // { user, next, meta }
//   const [homePageId, setHomePageId] = useState(null);

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

//   // Load current user and initial homepage id (for the small quick "Open Editor" card)
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const profile = await api.me();
//         if (cancelled) return;

//         setMe(profile);
//         const userId = getUserId();
//         // use their currently selected template if present
//         const sel = await api.selectedTemplateForUser(userId);
//         const tplId = sel?.data?.templateId || sel?.templateId || "sir-template-1";
//         const pId = await api.getHomePageId(userId, tplId);
//         setHomePageId(pId || null);
//       } catch (e) {
//         // if not authed, send to sign in
//         router.replace("/authentication/signin");
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [router]);

//   const userName = me?.user?.fullName || "there";
//   const userId = getUserId();

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

//       <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
//         <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

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
//               Welcome back, {userName}!
//             </h5>
//             <br />
//             <p className="text-dark">
//               Here&apos;s your website overview and next steps to complete your setup.
//             </p>

//             {/* Template chooser */}
//             <Row className="g-4 mt-2">
//               <Col xs={12}>
//                 {userId ? <TemplateChooserCard userId={userId} /> : <div />}
//               </Col>
//             </Row>

//             {/* Quick “Open Editor” / other cards (unchanged visuals) */}
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
//                       <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">Monthly</span>
//                     </div>

//                     <div className="card_wrapper-custom">
//                       <h4 className="fw-bold mb-3" style={{ lineHeight: "1.5", fontSize: "1.7rem" }}>
//                         $29.99{" "}
//                         <small className="text-dark fs-6 fw-normal align-middle">/month</small>
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
//                         <div className="progress-bar bg-mavsketch" style={{ width: `${(8.2 / 50) * 100}%` }}>
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
//                         yourdomain.com
//                       </h6>

//                       <div className="d-flex flex-wrap gap-2 mb-3">
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">✔ Connected</span>
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">SSL Active</span>
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
//                         onClick={() => {
//                           if (PUBLIC_HOST) window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank");
//                         }}
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
//                         <button type="button" className="btn button-dark" disabled style={{ color: "#fff" }}>
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
//           </Container>
//         </main>
//       </div>
//     </>
//   );
// }

























































































// // works fine with current users 
// // dashboard/pages/dashboard/index.js
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

// import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
// import { setTemplateCookie } from "../../lib/templateCookie";
// import { backendBaseUrl } from "../../lib/config";

// /* -------------------------------------------------------------------------- */
// /* Helpers                                                                    */
// /* -------------------------------------------------------------------------- */

// const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"]; // shown in chooser

// function getTokenFromCookie() {
//   if (typeof document === "undefined") return null;
//   const cname =
//     (process.env.NEXT_PUBLIC_COOKIE_NAME ||
//       process.env.COOKIE_NAME ||
//       "auth_token").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const m = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
//   return m ? decodeURIComponent(m[2]) : null;
// }

// function defaultVersionFor(tplObj) {
//   const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
//   return tplObj?.currentTag || versions?.[0]?.tag || "v1";
// }

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// /**
//  * Ensure the selected template has a Home page for this user.
//  * If missing, silently seed with your existing reset route (first_time_autoseed).
//  * Returns the homePageId (or null if not created in time).
//  */
// async function ensureHomeFor(userId, templateId, verTag) {
//   if (!userId || !templateId) return null;

//   // 1) already there?
//   let pageId = await api.getHomePageId(userId, templateId);
//   if (pageId) return pageId;

//   // 2) seed defaults (silently)
//   const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
//     userId
//   )}/${encodeURIComponent(templateId)}?ver=${encodeURIComponent(verTag || "v1")}`;

//   const token = getTokenFromCookie();
//   try {
//     await fetch(url, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: JSON.stringify({ reason: "first_time_autoseed" }),
//       credentials: "include",
//     });
//   } catch {
//     // ignore network hiccups; we will still poll below
//   }

//   // 3) poll briefly (exponential backoff: ~3s total)
//   for (let i = 0; i < 6; i++) {
//     await sleep(250 * Math.pow(1.5, i));
//     pageId = await api.getHomePageId(userId, templateId);
//     if (pageId) return pageId;
//   }
//   return null;
// }

// /* -------------------------------------------------------------------------- */
// /* Template Chooser Card                                                      */
// /* -------------------------------------------------------------------------- */

// function TemplateChooserCard({ userId, onHomeReady }) {
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [templates, setTemplates] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   // reset modal (manual reset still available)
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmTpl, setConfirmTpl] = useState({
//     id: null,
//     name: "",
//     tag: "v1",
//     versions: [],
//   });
//   const [resetting, setResetting] = useState(false);
//   const [toast, setToast] = useState({ show: false, msg: "", variant: "success" });

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         // 1) list all templates
//         const list = await api.listTemplates();
//         const data = (list?.data || []).filter((t) =>
//           ALLOWED_TEMPLATES.includes(t.templateId)
//         );

//         // 2) fetch current selection for this user
//         const sel = await api.selectedTemplateForUser(userId);
//         let activeTpl =
//           sel?.data?.templateId ?? sel?.templateId ?? data?.[0]?.templateId ?? null;

//         if (!data.find((t) => t.templateId === activeTpl)) {
//           activeTpl = data?.[0]?.templateId ?? null;
//         }

//         if (!off) {
//           setTemplates(data);
//           setSelected(activeTpl);

//           // ensure home exists for the selected template (first visit experience)
//           if (activeTpl) {
//             const tplObj = data.find((t) => t.templateId === activeTpl) || {};
//             const verTag = defaultVersionFor(tplObj);
//             setTemplateCookie(activeTpl, verTag, userId);
//             const pageId = await ensureHomeFor(userId, activeTpl, verTag);
//             onHomeReady?.(pageId || null);
//           }
//         }
//       } catch (e) {
//         if (!off) setError(e?.message || "Failed to load templates");
//       } finally {
//         if (!off) setLoading(false);
//       }
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId, onHomeReady]);

//   async function choose(templateId) {
//     try {
//       setSaving(true);
//       await api.selectTemplate(templateId, userId);
//       setSelected(templateId);

//       // version tag cookie
//       const tplObj = templates.find((t) => t.templateId === templateId) || null;
//       const verTag = defaultVersionFor(tplObj);

//       // sync cookie
//       setTemplateCookie(templateId, verTag, userId);

//       // silently ensure defaults so "Edit" works immediately
//       const pageId = await ensureHomeFor(userId, templateId, verTag);
//       onHomeReady?.(pageId || null);

//       // optional ping to static host
//       if (PUBLIC_HOST) {
//         fetch(
//           `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
//             templateId
//           )}&v=${encodeURIComponent(verTag)}&r=${Date.now()}`,
//           { mode: "no-cors", credentials: "include" }
//         );
//       }
//     } catch (e) {
//       alert(e?.message || "Failed to select template");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function openReset(tpl) {
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

//       // POST /api/template-reset/:userId/:templateId?ver=<tag>
//       const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
//         userId
//       )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(confirmTpl.tag)}`;

//       const token = getTokenFromCookie();

//       const res = await fetch(url, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ reason: "user_reset_to_default" }),
//         credentials: "include",
//       });

//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || json?.ok === false) {
//         throw new Error(json?.error || json?.message || `Reset failed (${res.status})`);
//       }

//       // keep cookie & (optionally) static host in sync
//       if (selected === confirmTpl.id) {
//         setTemplateCookie(confirmTpl.id, confirmTpl.tag, userId);
//         if (PUBLIC_HOST) {
//           fetch(
//             `${PUBLIC_HOST}/?templateId=${encodeURIComponent(
//               confirmTpl.id
//             )}&v=${encodeURIComponent(confirmTpl.tag)}&reset=1&r=${Date.now()}`,
//             { mode: "no-cors", credentials: "include" }
//           );
//         }
//       }

//       setToast({
//         show: true,
//         msg: `Restored version defaults (${confirmTpl.tag})`,
//         variant: "success",
//       });
//       setConfirmOpen(false);
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

//   // Open the proper editor for the template that’s selected
//   async function openEditorForSelected() {
//     try {
//       const tplId = selected;
//       if (!tplId) return;
//       const pageId = await api.getHomePageId(userId, tplId);
//       if (pageId) {
//         router.push(`/editorpages/page/${pageId}?templateId=${encodeURIComponent(tplId)}`);
//       } else {
//         // Try to seed once if user somehow got here before seeding finished
//         const tplObj = templates.find((t) => t.templateId === tplId) || {};
//         const verTag = defaultVersionFor(tplObj);
//         const id = await ensureHomeFor(userId, tplId, verTag);
//         if (id) router.push(`/editorpages/page/${id}?templateId=${encodeURIComponent(tplId)}`);
//         else alert("Home page not found for this template.");
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
//               style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}
//             >
//               {templates.map((t) => {
//                 const isActive = selected === t.templateId;
//                 const versions = Array.isArray(t.versions) ? t.versions : [];
//                 const verLabel =
//                   t.currentTag || versions?.[0]?.tag || (versions.length ? versions[0].tag : "—");

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

//       {/* Confirm Reset Modal */}
//       <Modal
//         show={confirmOpen}
//         onHide={() => (!resetting ? setConfirmOpen(false) : null)}
//         centered
//       >
//         <Modal.Header closeButton={!resetting}>
//           <Modal.Title>Reset “{confirmTpl.name}” to default?</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           This will remove your overrides and restore the <b>version defaults</b> (content + section
//           order) from <code>{confirmTpl.tag}</code>.
//           <div className="mt-3">
//             <Form.Label className="fw-semibold">Version</Form.Label>
//             <Form.Select
//               disabled={resetting}
//               value={confirmTpl.tag}
//               onChange={(e) => setConfirmTpl((s) => ({ ...s, tag: e.target.value }))}
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
//           <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={resetting}>
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

// /* -------------------------------------------------------------------------- */
// /* Main Dashboard                                                             */
// /* -------------------------------------------------------------------------- */

// export default function DashboardHome() {
//   const router = useRouter();

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false);
//   const [me, setMe] = useState(null); // { user, next, meta }
//   const [homePageId, setHomePageId] = useState(null);

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

//   // Load current user and ensure a homepage exists for their selected template
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const profile = await api.me();
//         if (cancelled) return;

//         setMe(profile);

//         const userId = getUserId();
//         const sel = await api.selectedTemplateForUser(userId);
//         const tplId = sel?.data?.templateId || sel?.templateId || "sir-template-1";

//         // we don't know the tag here; fetch its default from listTemplates
//         const list = await api.listTemplates();
//         const tplObj =
//           (list?.data || []).find((t) => t.templateId === tplId) || { versions: [] };
//         const verTag = defaultVersionFor(tplObj);

//         const pId = await ensureHomeFor(userId, tplId, verTag);
//         if (!cancelled) setHomePageId(pId || null);
//       } catch (e) {
//         if (!cancelled) router.replace("/authentication/signin");
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [router]);

//   const userName = me?.user?.fullName || "there";
//   const userId = getUserId();

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

//       <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
//         <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

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
//               Welcome back, {userName}!
//             </h5>
//             <br />
//             <p className="text-dark">
//               Here&apos;s your website overview and next steps to complete your setup.
//             </p>

//             {/* Template chooser */}
//             <Row className="g-4 mt-2">
//               <Col xs={12}>
//                 {userId ? <TemplateChooserCard userId={userId} onHomeReady={setHomePageId} /> : <div />}
//               </Col>
//             </Row>

//             {/* Quick “Open Editor” / other cards */}
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
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">Pro Plan</span>
//                       <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">Monthly</span>
//                     </div>

//                     <div className="card_wrapper-custom">
//                       <h4 className="fw-bold mb-3" style={{ lineHeight: "1.5", fontSize: "1.7rem" }}>
//                         $29.99{" "}
//                         <small className="text-dark fs-6 fw-normal align-middle">/month</small>
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
//                         <div className="progress-bar bg-mavsketch" style={{ width: `${(8.2 / 50) * 100}%` }}>
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
//                         yourdomain.com
//                       </h6>

//                       <div className="d-flex flex-wrap gap-2 mb-3">
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">✔ Connected</span>
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">SSL Active</span>
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
//                         onClick={() => {
//                           if (PUBLIC_HOST) window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank");
//                         }}
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
//                         <button type="button" className="btn button-dark" disabled style={{ color: "#fff" }}>
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
//           </Container>
//         </main>
//       </div>
//     </>
//   );
// }

































// preview works fine users working fine current orginal only problem cpanel domain not working properly

// dashboard/pages/dashboard/index.js
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

import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
import { setTemplateCookie } from "../../lib/templateCookie";
import { backendBaseUrl } from "../../lib/config";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// Show only these templates in chooser
const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"];

// Map templateId -> S3 folder + entry file
// (this is the same logic you used in your console snippets)
const TEMPLATE_ROUTES = {
  "sir-template-1": {
    folder: "sir-template-1",
    entry: "landing.html", // Bayone landing
  },
  "gym-template-1": {
    folder: "gym-template", // Weldork folder
    entry: "index.html", // Weldork homepage
  },
};

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const cname =
    (process.env.NEXT_PUBLIC_COOKIE_NAME ||
      process.env.COOKIE_NAME ||
      "auth_token").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function defaultVersionFor(tplObj) {
  const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
  return tplObj?.currentTag || versions?.[0]?.tag || "v1";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build the exact S3 URL for the template + user, matching your console code:
 *
 * sir-template-1:
 *   https://ion7-templates.s3.ap-south-1.amazonaws.com/sir-template-1/v1/landing.html?...tpl=sir-template-1...
 *
 * gym-template-1:
 *   https://ion7-templates.s3.ap-south-1.amazonaws.com/gym-template/v1/index.html?...tpl=gym-template-1...
 */
function buildTemplateUrl(userId, templateId, verTag) {
  if (!userId || !templateId) return "";

  const config = TEMPLATE_ROUTES[templateId];
  if (!config) {
    console.warn("Unknown templateId in buildTemplateUrl:", templateId);
    return "";
  }

  const v = verTag || "v1";
  const uid = encodeURIComponent(userId);
  const tpl = encodeURIComponent(templateId);
  const ver = encodeURIComponent(v);

  const base = "https://ion7-templates.s3.ap-south-1.amazonaws.com";

  const url =
    `${base}/${config.folder}/${ver}/${config.entry}` +
    `?uid=${uid}&tpl=${tpl}&v=${ver}&r=${Date.now()}`;

  console.log("[buildTemplateUrl]", { templateId, url });
  return url;
}

/**
 * Ensure the selected template has a Home page for this user.
 * If missing, silently seed with your existing reset route (first_time_autoseed).
 * Returns the homePageId (or null if not created in time).
 */
async function ensureHomeFor(userId, templateId, verTag) {
  if (!userId || !templateId) return null;

  // 1) already there?
  let pageId = await api.getHomePageId(userId, templateId);
  if (pageId) return pageId;

  // 2) seed defaults (silently)
  const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
    userId
  )}/${encodeURIComponent(templateId)}?ver=${encodeURIComponent(verTag || "v1")}`;

  const token = getTokenFromCookie();
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reason: "first_time_autoseed" }),
      credentials: "include",
    });
  } catch {
    // ignore network hiccups; we will still poll below
  }

  // 3) poll briefly (exponential backoff: ~3s total)
  for (let i = 0; i < 6; i++) {
    await sleep(250 * Math.pow(1.5, i));
    pageId = await api.getHomePageId(userId, templateId);
    if (pageId) return pageId;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Template Chooser Card                                                      */
/* -------------------------------------------------------------------------- */

function TemplateChooserCard({ userId, onHomeReady, onPreviewUrlChange }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // reset modal (manual reset still available)
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
        // 1) list all templates
        const list = await api.listTemplates();
        const data = (list?.data || []).filter((t) =>
          ALLOWED_TEMPLATES.includes(t.templateId)
        );

        // 2) fetch current selection for this user
        const sel = await api.selectedTemplateForUser(userId);
        let activeTpl =
          sel?.data?.templateId ??
          sel?.templateId ??
          data?.[0]?.templateId ??
          null;

        if (!data.find((t) => t.templateId === activeTpl)) {
          activeTpl = data?.[0]?.templateId ?? null;
        }

        if (!off) {
          setTemplates(data);
          setSelected(activeTpl);

          // ensure home exists for the selected template (first visit experience)
          if (activeTpl) {
            const tplObj =
              data.find((t) => t.templateId === activeTpl) || {};
            const verTag = defaultVersionFor(tplObj);

            // cookie for proxy (if you later use PUBLIC_HOST again)
            setTemplateCookie(activeTpl, verTag, userId);

            // build preview URL and notify parent
            const url = buildTemplateUrl(userId, activeTpl, verTag);
            onPreviewUrlChange?.(url);

            const pageId = await ensureHomeFor(userId, activeTpl, verTag);
            onHomeReady?.(pageId || null);
          }
        }
      } catch (e) {
        if (!off) setError(e?.message || "Failed to load templates");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [userId, onHomeReady, onPreviewUrlChange]);

  async function choose(templateId) {
    try {
      setSaving(true);
      await api.selectTemplate(templateId, userId);
      setSelected(templateId);

      // version tag cookie
      const tplObj =
        templates.find((t) => t.templateId === templateId) || null;
      const verTag = defaultVersionFor(tplObj);

      // sync cookie
      setTemplateCookie(templateId, verTag, userId);

      // silently ensure defaults so "Edit" works immediately
      const pageId = await ensureHomeFor(userId, templateId, verTag);
      onHomeReady?.(pageId || null);

      // update preview URL
      const url = buildTemplateUrl(userId, templateId, verTag);
      onPreviewUrlChange?.(url);

      // optional ping to static host (kept for backwards compat)
      if (PUBLIC_HOST) {
        fetch(
          `${PUBLIC_HOST}/?uid=${encodeURIComponent(
            userId
          )}&tpl=${encodeURIComponent(
            templateId
          )}&v=${encodeURIComponent(verTag)}&r=${Date.now()}`,
          { mode: "no-cors", credentials: "include" }
        );
      }
    } catch (e) {
      alert(e?.message || "Failed to select template");
    } finally {
      setSaving(false);
    }
  }

  function openReset(tpl) {
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

      // POST /api/template-reset/:userId/:templateId?ver=<tag>
      const url = `${backendBaseUrl}/api/template-reset/${encodeURIComponent(
        userId
      )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(
        confirmTpl.tag
      )}`;

      const token = getTokenFromCookie();

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: "user_reset_to_default" }),
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        throw new Error(
          json?.error || json?.message || `Reset failed (${res.status})`
        );
      }

      // keep cookie & (optionally) static host in sync
      if (selected === confirmTpl.id) {
        setTemplateCookie(confirmTpl.id, confirmTpl.tag, userId);

        // update preview URL after reset too (still same URL, but safe)
        const url = buildTemplateUrl(userId, confirmTpl.id, confirmTpl.tag);
        onPreviewUrlChange?.(url);

        if (PUBLIC_HOST) {
          fetch(
            `${PUBLIC_HOST}/?uid=${encodeURIComponent(
              userId
            )}&tpl=${encodeURIComponent(
              confirmTpl.id
            )}&v=${encodeURIComponent(
              confirmTpl.tag
            )}&reset=1&r=${Date.now()}`,
            { mode: "no-cors", credentials: "include" }
          );
        }
      }

      setToast({
        show: true,
        msg: `Restored version defaults (${confirmTpl.tag})`,
        variant: "success",
      });
      setConfirmOpen(false);
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

  // Open the proper editor for the template that’s selected
  async function openEditorForSelected() {
    try {
      const tplId = selected;
      if (!tplId) return;
      const pageId = await api.getHomePageId(userId, tplId);
      if (pageId) {
        router.push(
          `/editorpages/page/${pageId}?templateId=${encodeURIComponent(tplId)}`
        );
      } else {
        // Try to seed once if user somehow got here before seeding finished
        const tplObj =
          templates.find((t) => t.templateId === tplId) || {};
        const verTag = defaultVersionFor(tplObj);
        const id = await ensureHomeFor(userId, tplId, verTag);
        if (id)
          router.push(
            `/editorpages/page/${id}?templateId=${encodeURIComponent(tplId)}`
          );
        else alert("Home page not found for this template.");
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
                        style={{
                          background: "#111827",
                          color: "#fff",
                          borderRadius: 8,
                        }}
                        disabled={saving || isActive}
                        onClick={() => choose(t.templateId)}
                        title={
                          isActive
                            ? "Already selected"
                            : "Select this template"
                        }
                      >
                        {isActive
                          ? "Selected ✓"
                          : saving
                          ? "Saving…"
                          : "Select"}
                      </button>
                    </div>

                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {/* Open real template URL for this user/template */}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const verTag = defaultVersionFor(t);
                          const url = buildTemplateUrl(
                            userId,
                            t.templateId,
                            verTag
                          );
                          if (url)
                            window.open(
                              url,
                              "_blank",
                              "noopener,noreferrer"
                            );
                        }}
                        style={{ borderRadius: 8 }}
                      >
                        Preview
                      </button>

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
                        {isActive
                          ? "Reset to Default"
                          : "Reset (Select first)"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirm Reset Modal */}
      <Modal
        show={confirmOpen}
        onHide={() => (!resetting ? setConfirmOpen(false) : null)}
        centered
      >
        <Modal.Header closeButton={!resetting}>
          <Modal.Title>Reset “{confirmTpl.name}” to default?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will remove your overrides and restore the <b>version defaults</b>{" "}
          (content + section order) from <code>{confirmTpl.tag}</code>.
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
              {!confirmTpl.versions?.length && (
                <option value="v1">v1</option>
              )}
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
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Resetting…
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

/* -------------------------------------------------------------------------- */
/* Main Dashboard                                                             */
/* -------------------------------------------------------------------------- */

export default function DashboardHome() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);
  const [me, setMe] = useState(null); // { user, next, meta }
  const [homePageId, setHomePageId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
    if (typeof window !== "undefined") {
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  // Load current user and ensure a homepage exists for their selected template
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await api.me();
        if (cancelled) return;

        setMe(profile);

        const userId = getUserId();
        const sel = await api.selectedTemplateForUser(userId);
        const tplId =
          sel?.data?.templateId || sel?.templateId || "sir-template-1";

        // we don't know the tag here; fetch its default from listTemplates
        const list = await api.listTemplates();
        const tplObj =
          (list?.data || []).find((t) => t.templateId === tplId) || {
            versions: [],
          };
        const verTag = defaultVersionFor(tplObj);

        const pId = await ensureHomeFor(userId, tplId, verTag);
        if (!cancelled) {
          setHomePageId(pId || null);

          // also pre-populate preview URL on first load
          const url = buildTemplateUrl(userId, tplId, verTag);
          setPreviewUrl(url);
        }
      } catch (e) {
        if (!cancelled) router.replace("/authentication/signin");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const userName = me?.user?.fullName || "there";
  const userId = getUserId();

  const openPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } else if (PUBLIC_HOST) {
      // fallback (should almost never happen now)
      window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank");
    }
  };

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
        style={{
          display: "flex",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
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
              Welcome back, {userName}!
            </h5>
            <br />
            <p className="text-dark">
              Here&apos;s your website overview and next steps to complete your
              setup.
            </p>

            {/* Template chooser */}
            <Row className="g-4 mt-2">
              <Col xs={12}>
                {userId ? (
                  <TemplateChooserCard
                    userId={userId}
                    onHomeReady={setHomePageId}
                    onPreviewUrlChange={setPreviewUrl}
                  />
                ) : (
                  <div />
                )}
              </Col>
            </Row>

            {/* Quick “Open Editor” / other cards */}
            <Row className="g-4 mt-2">
              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 ion-card h-100" style={cardGlass}>
                  <Card.Body className="position-relative px-4 pt-5 pb-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5
                        className="fw-bold mb-0"
                        style={{ fontSize: "1.1rem" }}
                      >
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
                        style={{
                          lineHeight: "1.5",
                          fontSize: "1.7rem",
                        }}
                      >
                        $29.99{" "}
                        <small className="text-dark fs-6 fw-normal align-middle">
                          /month
                        </small>
                      </h4>

                      <div className="d-flex justify-content-between text-dark small mb-1">
                        <span>Next billing date</span>
                        <span className="fw-semibold text-dark">
                          Feb 15, 2024
                        </span>
                      </div>
                      <div className="d-flex justify-content-between text-dark small mb-3">
                        <span>Storage used</span>
                        <span className="fw-semibold text-dark">
                          8.2GB / 50GB
                        </span>
                      </div>

                      <div className="mb-3 progress thin">
                        <div
                          className="progress-bar bg-mavsketch"
                          style={{
                            width: `${(8.2 / 50) * 100}%`,
                          }}
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
                      <h5
                        className="fw-bold mb-0"
                        style={{ fontSize: "1.05rem" }}
                      >
                        Domain Information
                      </h5>
                      <div className="card-icon">
                        <img src="/icons/globe-icon.png" alt="Domain" />
                      </div>
                    </div>

                    <div className="card_wrapper-custom">
                      <h6
                        className="fw-bold mb-2 mt-3"
                        style={{ fontSize: "1rem" }}
                      >
                        yourdomain.com
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
                        onClick={openPreview}
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
                      <h5
                        className="fw-bold mb-0"
                        style={{ fontSize: "1.05rem" }}
                      >
                        Edit My Website
                      </h5>
                      <img
                        src="/icons/edit-icon.png"
                        alt="Edit"
                        width={30}
                        height={30}
                      />
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {homePageId ? (
                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            router.push(`/editorpages/page/${homePageId}`)
                          }
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
                            <svg
                              viewBox="0 0 120 120"
                              className="infinity-loader"
                            >
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
                        onClick={openPreview}
                      >
                        Preview Changes
                      </button>
                    </div>
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






































