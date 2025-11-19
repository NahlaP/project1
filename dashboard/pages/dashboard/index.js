// // dashboard/pages/dashboard/index.js
// import React, { useEffect, useMemo, useState } from "react";
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
// import NavbarTop from "../../layouts/navbars/NavbarTop";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBars,
//   faBasketShopping,
//   faGlobe,
//   faSwatchbook,
// } from "@fortawesome/free-solid-svg-icons";

// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Filler,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
// } from "chart.js";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import { Doughnut, Line } from "react-chartjs-2";

// import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
// import { setTemplateCookie } from "../../lib/templateCookie";
// import { backendBaseUrl } from "../../lib/config";

// /* -------------------------------------------------------------------------- */
// /* Chart.js setup                                                             */
// /* -------------------------------------------------------------------------- */

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   Filler,
//   ChartDataLabels,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title
// );

// /* -------------------------------------------------------------------------- */
// /* Helpers                                                                    */
// /* -------------------------------------------------------------------------- */

// // Show only these templates in chooser
// const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"];

// // Map templateId -> S3 folder + entry file (must match your S3 layout)
// const TEMPLATE_ROUTES = {
//   "sir-template-1": {
//     folder: "sir-template-1",
//     entry: "landing.html", // Bayone landing
//   },
//   "gym-template-1": {
//     folder: "gym-template", // Weldork folder
//     entry: "index.html", // Weldork homepage
//   },
// };

// function getTokenFromCookie() {
//   if (typeof document === "undefined") return null;
//   const cname = (
//     process.env.NEXT_PUBLIC_COOKIE_NAME ||
//     process.env.COOKIE_NAME ||
//     "auth_token"
//   ).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const m = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
//   return m ? decodeURIComponent(m[2]) : null;
// }

// function defaultVersionFor(tplObj) {
//   const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
//   return tplObj?.currentTag || versions?.[0]?.tag || "v1";
// }

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// /**
//  * Build the exact S3 URL for the template + user, matching your console code:
//  *
//  * sir-template-1:
//  *   https://ion7-templates.s3.ap-south-1.amazonaws.com/sir-template-1/v1/landing.html?...tpl=sir-template-1...
//  *
//  * gym-template-1:
//  *   https://ion7-templates.s3.ap-south-1.amazonaws.com/gym-template/v1/index.html?...tpl=gym-template-1...
//  */
// function buildTemplateUrl(userId, templateId, verTag) {
//   if (!userId || !templateId) return "";

//   const config = TEMPLATE_ROUTES[templateId];
//   if (!config) {
//     console.warn("Unknown templateId in buildTemplateUrl:", templateId);
//     return "";
//   }

//   const v = verTag || "v1";
//   const uid = encodeURIComponent(userId);
//   const tpl = encodeURIComponent(templateId);
//   const ver = encodeURIComponent(v);

//   const base = "https://ion7-templates.s3.ap-south-1.amazonaws.com";

//   const url =
//     `${base}/${config.folder}/${ver}/${config.entry}` +
//     `?uid=${uid}&tpl=${tpl}&v=${ver}&r=${Date.now()}`;

//   console.log("[buildTemplateUrl]", { templateId, url });
//   return url;
// }

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
//   )}/${encodeURIComponent(templateId)}?ver=${encodeURIComponent(
//     verTag || "v1"
//   )}`;

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

// function TemplateChooserCard({ userId, onHomeReady, onPreviewUrlChange }) {
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
//   const [toast, setToast] = useState({
//     show: false,
//     msg: "",
//     variant: "success",
//   });

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
//           sel?.data?.templateId ??
//           sel?.templateId ??
//           data?.[0]?.templateId ??
//           null;

//         if (!data.find((t) => t.templateId === activeTpl)) {
//           activeTpl = data?.[0]?.templateId ?? null;
//         }

//         if (!off) {
//           setTemplates(data);
//           setSelected(activeTpl);

//           // ensure home exists for the selected template (first visit experience)
//           if (activeTpl) {
//             const tplObj =
//               data.find((t) => t.templateId === activeTpl) || {};
//             const verTag = defaultVersionFor(tplObj);

//             // cookie for proxy / public site
//             setTemplateCookie(activeTpl, verTag, userId);

//             // build preview URL and notify parent
//             const url = buildTemplateUrl(userId, activeTpl, verTag);
//             onPreviewUrlChange?.(url);

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
//   }, [userId, onHomeReady, onPreviewUrlChange]);

//   async function choose(templateId) {
//     try {
//       setSaving(true);
//       await api.selectTemplate(templateId, userId);
//       setSelected(templateId);

//       // version tag cookie
//       const tplObj =
//         templates.find((t) => t.templateId === templateId) || null;
//       const verTag = defaultVersionFor(tplObj);

//       // sync cookie
//       setTemplateCookie(templateId, verTag, userId);

//       // silently ensure defaults so "Edit" works immediately
//       const pageId = await ensureHomeFor(userId, templateId, verTag);
//       onHomeReady?.(pageId || null);

//       // update preview URL
//       const url = buildTemplateUrl(userId, templateId, verTag);
//       onPreviewUrlChange?.(url);

//       // optional ping to static host (kept for backwards compat)
//       if (PUBLIC_HOST) {
//         fetch(
//           `${PUBLIC_HOST}/?uid=${encodeURIComponent(
//             userId
//           )}&tpl=${encodeURIComponent(
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
//       )}/${encodeURIComponent(confirmTpl.id)}?ver=${encodeURIComponent(
//         confirmTpl.tag
//       )}`;

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
//         throw new Error(
//           json?.error || json?.message || `Reset failed (${res.status})`
//         );
//       }

//       // keep cookie & (optionally) static host in sync
//       if (selected === confirmTpl.id) {
//         setTemplateCookie(confirmTpl.id, confirmTpl.tag, userId);

//         // update preview URL after reset too (still same URL, but safe)
//         const url = buildTemplateUrl(userId, confirmTpl.id, confirmTpl.tag);
//         onPreviewUrlChange?.(url);

//         if (PUBLIC_HOST) {
//           fetch(
//             `${PUBLIC_HOST}/?uid=${encodeURIComponent(
//               userId
//             )}&tpl=${encodeURIComponent(
//               confirmTpl.id
//             )}&v=${encodeURIComponent(
//               confirmTpl.tag
//             )}&reset=1&r=${Date.now()}`,
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
//         router.push(
//           `/editorpages/page/${pageId}?templateId=${encodeURIComponent(tplId)}`
//         );
//       } else {
//         // Try to seed once if user somehow got here before seeding finished
//         const tplObj =
//           templates.find((t) => t.templateId === tplId) || {};
//         const verTag = defaultVersionFor(tplObj);
//         const id = await ensureHomeFor(userId, tplId, verTag);
//         if (id)
//           router.push(
//             `/editorpages/page/${id}?templateId=${encodeURIComponent(tplId)}`
//           );
//         else alert("Home page not found for this template.");
//       }
//     } catch (e) {
//       alert(e?.message || "Failed to open editor");
//     }
//   }

//   return (
//     <>
//       {/* Original glass-style chooser (fully functional) */}
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
//                         style={{
//                           background: "#111827",
//                           color: "#fff",
//                           borderRadius: 8,
//                         }}
//                         disabled={saving || isActive}
//                         onClick={() => choose(t.templateId)}
//                         title={
//                           isActive
//                             ? "Already selected"
//                             : "Select this template"
//                         }
//                       >
//                         {isActive
//                           ? "Selected ✓"
//                           : saving
//                           ? "Saving…"
//                           : "Select"}
//                       </button>
//                     </div>

//                     <div className="mt-2 d-flex flex-wrap gap-2">
//                       {/* Open real template URL for this user/template (raw S3) */}
//                       <button
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => {
//                           const verTag = defaultVersionFor(t);
//                           const url = buildTemplateUrl(
//                             userId,
//                             t.templateId,
//                             verTag
//                           );
//                           if (url)
//                             window.open(
//                               url,
//                               "_blank",
//                               "noopener,noreferrer"
//                             );
//                         }}
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
//                         {isActive
//                           ? "Reset to Default"
//                           : "Reset (Select first)"}
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
//           This will remove your overrides and restore the <b>version defaults</b>{" "}
//           (content + section order) from <code>{confirmTpl.tag}</code>.
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
//               {!confirmTpl.versions?.length && (
//                 <option value="v1">v1</option>
//               )}
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
//                 <Spinner animation="border" size="sm" className="me-2" />{" "}
//                 Resetting…
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
// /* Dummy data for charts (can wire to real API later)                         */
// /* -------------------------------------------------------------------------- */

// const email_account = [
//   {
//     username: "marco",
//     domain: "mavsketch.com",
//     storage_used: 1536,
//     label: "1.5GB",
//     storage_allocation: 0,
//     storage_unit: "MB",
//   },
//   {
//     username: "nahla",
//     domain: "mavsketch.com",
//     storage_used: 204.8,
//     label: "204.9MB",
//     storage_allocation: 2,
//     storage_unit: "MB",
//   },
//   {
//     username: "miguel",
//     domain: "mavsketch.com",
//     storage_used: 523,
//     label: "523MB",
//     storage_allocation: 1,
//     storage_unit: "MB",
//   },
//   {
//     username: "info",
//     domain: "mavsketch.com",
//     storage_used: 2048,
//     label: "2GB",
//     storage_allocation: 0,
//     storage_unit: "MB",
//   },
//   {
//     username: "marco2",
//     domain: "mavsketch.com",
//     storage_used: 1536,
//     label: "1.5GB",
//     storage_allocation: 0,
//     storage_unit: "MB",
//   },
//   {
//     username: "nahla2",
//     domain: "mavsketch.com",
//     storage_used: 204.8,
//     label: "204.9MB",
//     storage_allocation: 2,
//     storage_unit: "MB",
//   },
//   {
//     username: "miguel2",
//     domain: "mavsketch.com",
//     storage_used: 523,
//     label: "523MB",
//     storage_allocation: 1,
//     storage_unit: "MB",
//   },
//   {
//     username: "info2",
//     domain: "mavsketch.com",
//     storage_used: 2048,
//     label: "2GB",
//     storage_allocation: 0,
//     storage_unit: "MB",
//   },
//   {
//     username: "thirdy",
//     domain: "mavsketch.com",
//     storage_used: 2048,
//     label: "2GB",
//     storage_allocation: 0,
//     storage_unit: "MB",
//   },
// ];

// const storage = [
//   {
//     used: 2,
//     storage_allocation: 10,
//     storage_unit: "GB",
//   },
// ];

// /* -------------------------------------------------------------------------- */
// /* Main Dashboard                                                             */
// /* -------------------------------------------------------------------------- */

// const BREAKPOINT = 1120;
// const ARC_DEG = 240;

// export default function DashboardHome() {
//   const router = useRouter();

//   const [showMenu, setShowMenu] = useState(false);
//   const [isCompact, setIsCompact] = useState(false);

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false);

//   const [me, setMe] = useState(null); // { user, next, meta }
//   const [homePageId, setHomePageId] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState("");

//   const toggleMenu = () => setShowMenu((prev) => !prev);

//   const palette = [
//     "rgba(120, 113, 108, 1)", // Warm gray
//     "rgba(147, 197, 253, 1)", // Soft blue
//     "rgba(186, 230, 253, 1)", // Light blue
//     "rgba(209, 250, 229, 1)", // Mint green
//     "rgba(254, 215, 170, 1)", // Peach
//     "rgba(221, 214, 254, 1)", // Lavender
//     "rgba(253, 230, 138, 1)", // Pale yellow
//     "rgba(204, 251, 241, 1)", // Seafoam
//     "rgba(229, 231, 235, 1)", // Cool gray
//     "rgba(254, 205, 211, 1)", // Blush pink
//   ];

//   useEffect(() => {
//     const handleResize = () => {
//       const compact = window.innerWidth <= BREAKPOINT;
//       setIsCompact(compact);
//       if (!compact) setShowMenu(false);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     document.body.classList.toggle("sidebar-open", isCompact && showMenu);
//   }, [isCompact, showMenu]);

//   useEffect(() => {
//     const onResize = () => {
//       const below = window.innerWidth <= 1120;
//       setIsBelowLg(below);
//       setSidebarOpen(!below);
//     };
//     if (typeof window !== "undefined") {
//       onResize();
//       window.addEventListener("resize", onResize);
//       return () => window.removeEventListener("resize", onResize);
//     }
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
//         const tplId =
//           sel?.data?.templateId || sel?.templateId || "sir-template-1";

//         // we don't know the tag here; fetch its default from listTemplates
//         const list = await api.listTemplates();
//         const tplObj =
//           (list?.data || []).find((t) => t.templateId === tplId) || {
//             versions: [],
//           };
//         const verTag = defaultVersionFor(tplObj);

//         const pId = await ensureHomeFor(userId, tplId, verTag);
//         if (!cancelled) {
//           setHomePageId(pId || null);

//           // also pre-populate preview URL on first load
//           const url = buildTemplateUrl(userId, tplId, verTag);
//           setPreviewUrl(url);

//           // also keep cookie in sync here
//           setTemplateCookie(tplId, verTag, userId);
//         }
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

//   // For "View Site" / "Preview Changes" – always prefer PUBLIC_HOST
//   const openPreview = () => {
//     if (PUBLIC_HOST) {
//       window.open(
//         `${PUBLIC_HOST}/?r=${Date.now()}`,
//         "_blank",
//         "noopener,noreferrer"
//       );
//     } else if (previewUrl) {
//       window.open(previewUrl, "_blank", "noopener,noreferrer");
//     }
//   };

//   // helper: show decimals only when needed
//   const formatSmart = (value, decimals = 1) => {
//     if (value == null || Number.isNaN(Number(value))) return "";
//     const n = Number(value);
//     const rounded = Number(n.toFixed(decimals));
//     return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
//   };

//   /* ---------------- Email storage donut ---------------- */

//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: "Storage used",
//         data: [],
//         backgroundColor: [],
//         borderColor: [],
//         borderWidth: 1,
//       },
//     ],
//   });

//   useEffect(() => {
//     const labels = email_account.map((acc) => acc.username || "unknown");
//     const customLabel = email_account.map((acc) => acc.label || "unknown");
//     const values = email_account.map((acc) => {
//       const v = parseFloat(acc.storage_used);
//       return Number.isFinite(v) ? v : 0;
//     });

//     const bg = labels.map((_, i) =>
//       palette[i % palette.length].replace("1)", "0.2)")
//     );
//     const borderColor = labels.map((_, i) => palette[i % palette.length]);

//     setChartData({
//       labels,
//       datasets: [
//         {
//           label: "Storage used",
//           customLabel,
//           data: values,
//           backgroundColor: bg,
//           borderColor,
//           borderWidth: 1.5,
//           borderRadius: 4,
//           offset: 20,
//           hoverOffset: 35,
//         },
//       ],
//     });
//   }, []); // email_account is constant

//   const totalStorageMB = (chartData?.datasets?.[0]?.data || []).reduce(
//     (s, n) => s + (Number(n) || 0),
//     0
//   );
//   const totalStorageGB = totalStorageMB / 1024;

//   /* ---------------- Main storage (half donut) ---------------- */

//   const [storageData, setStorageData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: "Storage used",
//         data: [],
//         backgroundColor: [],
//         borderColor: [],
//         borderWidth: 1,
//       },
//     ],
//   });

//   const storageValues = [
//     storage[0].used,
//     storage[0].storage_allocation - storage[0].used,
//   ];

//   useEffect(() => {
//     setStorageData({
//       labels: ["Used Storage", "Storage Available"],
//       datasets: [
//         {
//           label: "Storage",
//           data: storageValues,
//           backgroundColor: function (context) {
//             const chart = context.chart;
//             const { ctx, chartArea } = chart;

//             if (!chartArea) {
//               return;
//             }

//             const gradient = ctx.createLinearGradient(
//               0,
//               chartArea.bottom,
//               0,
//               chartArea.top
//             );
//             gradient.addColorStop(0, "rgba(213, 255, 64, 1)");
//             gradient.addColorStop(1, "rgba(215, 68, 5, 1)");

//             return [gradient, "rgba(225, 225, 225, 1)"];
//           },
//           borderColor: ["rgba(213, 255, 64, 0)", "rgba(225, 225, 225, 0)"],
//           borderWidth: 1.5,
//           borderRadius: 4,
//           offset: 10,
//           hoverOffset: 35,
//         },
//       ],
//     });
//   }, []);

//   const storageUsed = Number(storage?.[0]?.used || 0); // GB
//   const storageAlloc = Number(storage?.[0]?.storage_allocation || 1); // GB
//   const storageRemainingGB = Math.max(0, storageAlloc - storageUsed);
//   const storageRemainingPercent =
//     storageAlloc > 0 ? (storageRemainingGB / storageAlloc) * 100 : 0;

//   /* ---------------- Visitors line chart ---------------- */

//   const lineData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Visitors",
//         data: [0, 29, 80, 41, 10, 89],
//         fill: "origin",
//         backgroundColor: (context) => {
//           const { chart } = context;
//           const { ctx, chartArea } = chart;

//           if (!chartArea) {
//             return;
//           }

//           const gradient = ctx.createLinearGradient(
//             0,
//             chartArea.top,
//             0,
//             chartArea.bottom
//           );
//           const topColor = "rgba(213, 255, 64, 0.3)";
//           const bottomColor = "rgba(213, 255, 64, 0)";

//           gradient.addColorStop(0, topColor);
//           gradient.addColorStop(1, bottomColor);

//           return gradient;
//         },
//         borderColor: "#d5ff40",
//         borderWidth: 1.0,
//         tension: 0.4,
//       },
//     ],
//   };

//   const lineOptions = {
//     responsive: true,
//     layout: {
//       padding: {
//         right: 20,
//         top: 20,
//       },
//     },
//     plugins: {
//       legend: { display: false },
//       title: { display: false },
//       datalabels: {
//         color: "#fff",
//         anchor: "top",
//         align: "top",
//         formatter: (value, context) => {
//           const idx = context?.dataIndex;
//           const labels = context?.chart?.data?.labels || [];
//           const label = labels[idx] ?? "";
//           const customLabels =
//             context?.chart?.data?.datasets[0]?.customLabel || [];
//           const customLabel = customLabels[idx] || "";
//           return customLabel ? `${customLabel}` : String(value);
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         border: { display: false },
//         ticks: { color: "#ffffff77" },
//       },
//       y: {
//         beginAtZero: true,
//         grid: { display: true },
//         border: { display: false },
//         ticks: { display: false, color: "transparent" },
//       },
//     },
//   };

//   return (
//     <>
//       <style jsx global>{`
//         #page-content {
//           background-color: transparent !important;
//         }
//       `}</style>

//       {isCompact && (
//         <button
//           className="btn btn-outline-secondary position-fixed navbar-button"
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           aria-label="Toggle sidebar"
//         >
//           <img
//             src={`/icons/${sidebarOpen ? "menu-close.png" : "002-app.png"}`}
//             alt="Toggle menu"
//           />
//         </button>
//       )}

//       <div className="header">
//         <NavbarTop
//           isMobile={isCompact}
//           toggleMenu={toggleMenu}
//           sidebarVisible={!isCompact}
//         />
//       </div>

//       <div className="bg-wrapper-custom">
//         <div className="blob blob1" />
//         <div className="blob blob2" />
//         <div className="blob blob3" />
//         <div className="blob blob4" />
//         <div className="blob blob5" />
//         <div className="bg-inner-custom" />
//       </div>

//       <div
//         style={{
//           display: "flex",
//           minHeight: "100vh",
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         <SidebarDashly
//           isOpen={sidebarOpen}
//           setIsOpen={setSidebarOpen}
//           isCompact={isCompact}
//           setIsCompact={setIsCompact}
//           isMobile={isBelowLg}
//         />

//         <main
//           className="main-wrapper"
//           style={{
//             flexGrow: 1,
//             marginLeft: !isBelowLg && sidebarOpen ? 240 : 0,
//             transition: "margin-left 0.25s ease",
//             padding: "3.5rem 10px 20px 10px",
//             width: "100%",
//             overflowX: "hidden",
//           }}
//         >
//           <Container fluid="xxl" className="dash-container">
//             <h5 className="container-title">
//               Welcome back, {userName}!
//             </h5>
//             <p className="container-subtitle">
//               Here&apos;s your website overview and next steps to complete your
//               setup.
//             </p>

//             <Row className="g-4">
//               {/* LEFT: main cards */}
//               <Col xs={12} md={12} lg={12} xl={9}>
//                 <Row className="g-4 mt-2" style={{ height: "100%" }}>
//                   {/* Current Subscription */}
//                   <Col xs={12} md={7} lg={7} xl={7}>
//                     <Card className="border-0 ion-card h-100 box-card">
//                       <Card.Body className="position-relative px-4 pt-5 pb-4">
//                         <div>
//                           <div className="d-flex justify-content-between align-items-start mb-3">
//                             <h5 className="card-title">Current Subscription</h5>
//                             <div className="card-icon">
//                               <img src="/icons/crown.svg" alt="Pro Plan" />
//                             </div>
//                           </div>
//                           <div className="d-flex flex-wrap gap-2 mb-3">
//                             <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">
//                               Pro Plan
//                             </span>
//                             <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">
//                               Monthly
//                             </span>
//                           </div>
//                         </div>

//                         <div className="card_wrapper_custom">
//                           <h4>
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               viewBox="0 0 344.84 299.91"
//                               width="18"
//                               height="18"
//                               aria-hidden="true"
//                               focusable="false"
//                             >
//                               <path
//                                 fill="#ffffff"
//                                 d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
//                               />
//                             </svg>
//                             29.99 <small>/month</small>
//                           </h4>
//                           <div className="col-info-wrapper">
//                             <div className="col-info">
//                               <span className="bold">Next billing date</span>
//                               <span>Nov 01, 2025</span>
//                             </div>
//                             <div className="col-info">
//                               <span className="bold">Days Remaining</span>
//                               <span>6 Days</span>
//                             </div>
//                           </div>

//                           <div className="progress thin">
//                             <div
//                               className="progress-bar bg-mavsketch"
//                               style={{ width: `${(24 / 30) * 100}%` }}
//                             />
//                           </div>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </Col>

//                   {/* My Products */}
//                   <Col xs={12} md={5} lg={5} xl={5}>
//                     <div className="anim-card-wrapper primary-bg cap-med">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />
//                         <div className="border-shadow-left" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>

//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 +2.1%
//                               </span>
//                             </div>
//                             <h6 className="card-title mb-1">My Products</h6>
//                             <p className="mb-0">
//                               Summary of all your products.
//                             </p>
//                           </div>
//                           <div className="products-summary">
//                             <div className="product-item">
//                               <span className="product-name">
//                                 Total Products
//                               </span>
//                               <span className="product-value">128</span>
//                             </div>
//                             <div className="product-item">
//                               <span className="product-name">
//                                 Active Products
//                               </span>
//                               <span className="product-value">115</span>
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>
//                           <FontAwesomeIcon icon={faBasketShopping} />
//                         </span>
//                       </figcaption>
//                     </div>
//                   </Col>

//                   {/* Site Visitors */}
//                   <Col xs={12} md={5} lg={5} xl={5}>
//                     <div className="anim-card-wrapper dark-bg cap-xl">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>
//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 {`${((8.2 / 50) * 100).toFixed(2)}%`}
//                               </span>
//                             </div>
//                             <h6 className="card-title mb-1">Site Visitors</h6>
//                             <p
//                               className="mb-0"
//                               style={{ fontSize: "0.9rem" }}
//                             >
//                               See how many visits your website is getting.
//                             </p>
//                           </div>
//                           <div className="card_anim_body">
//                             <div className="lineChart-Container">
//                               <Line data={lineData} options={lineOptions} />
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
//                       </figcaption>
//                     </div>
//                   </Col>

//                   {/* Edit My Website */}
//                   <Col xs={12} md={7} lg={7} xl={7}>
//                     <div className="anim-card-wrapper dark-bg cap-xl">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>
//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 {`${((8.2 / 50) * 100).toFixed(2)}%`}
//                               </span>
//                             </div>
//                             <h6 className="card-title mb-1">Edit My Website</h6>
//                             <p
//                               className="mb-0"
//                               style={{ fontSize: "0.9rem" }}
//                             >
//                               Quick access to your website editor and
//                               customization tools.
//                             </p>
//                           </div>
//                           <div className="card_anim_body">
//                             <div className="col-info">
//                               <span className="bold">Last edited</span>
//                               <span>2 hours ago</span>
//                             </div>
//                             <div className="col-info">
//                               <span className="bold">Draft changes</span>
//                               <span>3 pending</span>
//                             </div>
//                             <div className="col-info">
//                               <span className="bold">Template</span>
//                               <span>Modern Blog</span>
//                             </div>
//                           </div>

//                           <div
//                             className={`button-wrapper d-flex flex-column gap-2 ${
//                               isCompact ? "dir-inline" : ""
//                             }`}
//                           >
//                             {homePageId ? (
//                               <button
//                                 type="button"
//                                 className="primary-btn"
//                                 onClick={() =>
//                                   router.push(`/editorpages/page/${homePageId}`)
//                                 }
//                               >
//                                 Open Editor
//                               </button>
//                             ) : (
//                               <button
//                                 type="button"
//                                 className="btn button-dark"
//                                 disabled
//                                 style={{ color: "#fff" }}
//                               >
//                                 <div className="modern-loader">
//                                   <svg
//                                     viewBox="0 0 120 120"
//                                     className="infinity-loader"
//                                   >
//                                     <path
//                                       className="infinity-path"
//                                       d="M60,15 a45,45 0 0 1 45,45 a45,45 0 0 1 -45,45 a45,45 0 0 1 -45,-45 a45,45 0 0 1 45,-45"
//                                     />
//                                   </svg>
//                                 </div>
//                                 Initializing…
//                               </button>
//                             )}
//                             <button
//                               type="button"
//                               className=""
//                               onClick={openPreview}
//                             >
//                               Preview Changes
//                             </button>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
//                       </figcaption>
//                     </div>
//                   </Col>

//                   {/* My Domain */}
//                   <Col xs={12} md={4} lg={4} xl={4}>
//                     <div className="anim-card-wrapper dark-bg cap-med">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />
//                         <div className="border-shadow-left" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>

//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 0
//                               </span>
//                             </div>
//                             <h6 className="card-title mb-1">My Domain</h6>
//                             <p
//                               className="mb-0"
//                               style={{ fontSize: "0.9rem" }}
//                             >
//                               Quick info about your domain settings.
//                             </p>
//                           </div>
//                           <div className="card_anim_body">
//                             <div className="domain-wrapper">
//                               <span className="https">https://</span>
//                               <span>yourdomain.com</span>
//                             </div>
//                           </div>

//                           <div className={`button-wrapper d-flex flex-column gap-2`}>
//                             <button
//                               type="button"
//                               className="primary-btn w-100"
//                               onClick={openPreview}
//                             >
//                               Visit your site
//                             </button>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>
//                           <FontAwesomeIcon icon={faGlobe} />
//                         </span>
//                       </figcaption>
//                     </div>
//                   </Col>

//                   {/* Storage Used */}
//                   <Col xs={12} md={4} lg={4} xl={4}>
//                     <div className="anim-card-wrapper dark-bg cap-xl">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />
//                         <div className="border-shadow-left" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>

//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 {`${((8.2 / 50) * 100).toFixed(2)}%`}
//                               </span>
//                             </div>

//                             <h6 className="card-title mb-1">Storage Used</h6>
//                             <p
//                               className="mb-0"
//                               style={{ fontSize: "0.9rem" }}
//                             >
//                               {`${formatSmart(storageUsed)}GB used of ${storageAlloc}GB total`}
//                             </p>
//                           </div>
//                           <div>
//                             <div className="chart-container-halfdoughnut">
//                               <Doughnut
//                                 data={storageData}
//                                 width={"100%"}
//                                 options={{
//                                   maintainAspectRatio: true,
//                                   animation: {
//                                     duration: 200,
//                                     easing: "easeOutCubic",
//                                     animateRotate: true,
//                                     animateScale: true,
//                                   },
//                                   layout: {
//                                     padding: {
//                                       top: 5,
//                                       left: 5,
//                                       right: 5,
//                                     },
//                                   },
//                                   rotation: -ARC_DEG / 2,
//                                   circumference: ARC_DEG,
//                                   cutout: "70%",
//                                   animations: {
//                                     x: { duration: 150 },
//                                     y: { duration: 150 },
//                                     resize: { duration: 0 },
//                                   },
//                                   aspectRatio: 1,
//                                   plugins: {
//                                     legend: { display: false },
//                                     tooltip: {
//                                       callbacks: {
//                                         label: function (context) {
//                                           let label =
//                                             context.dataset.label || "";
//                                           if (label) label += " ";
//                                           if (context.parsed !== null) {
//                                             label += context.parsed;
//                                           }
//                                           label += "GB";
//                                           return label;
//                                         },
//                                       },
//                                     },
//                                     datalabels: { display: false },
//                                   },
//                                 }}
//                                 responsive={true}
//                                 id={"Email-halfDoughnut-Chart"}
//                               />
//                               <div className="chart-center-text">
//                                 <h5 className="highlight">
//                                   {formatSmart(storageUsed)}
//                                   <small className="highlight-sm fs-6 align-middle">
//                                     {" "}
//                                     /GB
//                                   </small>
//                                 </h5>
//                               </div>
//                             </div>
//                             <h3
//                               className="fw-bold mb-1 highlight"
//                               style={{ fontSize: "2rem" }}
//                             >
//                               {`${formatSmart(storageRemainingGB)}`}
//                               <small className="highlight-sm fs-6 align-middle">
//                                 {" "}
//                                 /GB Remaining
//                               </small>
//                             </h3>
//                             <div className="progress progress-thin thin">
//                               <div
//                                 className="progress-bar bg-mavsketch"
//                                 style={{ width: `${storageRemainingPercent}%` }}
//                               />
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>{`${((8.2 / 50) * 100).toFixed(2)}%`}</span>
//                       </figcaption>
//                     </div>
//                   </Col>

//                   {/* Email Capacity */}
//                   <Col xs={12} md={4} lg={4} xl={4}>
//                     <div className="anim-card-wrapper dark-bg cap-xl">
//                       <div className="anim-card">
//                         <div className="border-shadow-top" />
//                         <div className="border-shadow-right" />
//                         <div className="border-shadow-bottom" />
//                         <div className="border-shadow-left" />

//                         <svg
//                           viewBox="0 0 400 400"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <filter id="noiseFilter">
//                             <feTurbulence
//                               type="fractalNoise"
//                               baseFrequency="20.43"
//                               numOctaves="400"
//                               stitchTiles="stitch"
//                             />
//                           </filter>

//                           <rect
//                             width="100%"
//                             height="100%"
//                             filter="url(#noiseFilter)"
//                           />
//                         </svg>

//                         <Card.Body className="p-3">
//                           <div>
//                             <div className="d-flex justify-content-end">
//                               <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
//                                 {`${((8.2 / 50) * 100).toFixed(2)}%`}
//                               </span>
//                             </div>
//                             <h6 className="card-title mb-1">
//                               Email Capacity
//                             </h6>
//                             <p
//                               className="mb-0"
//                               style={{ fontSize: "0.9rem" }}
//                             >
//                               13 used of 14 accounts total
//                             </p>
//                           </div>
//                           <div>
//                             <div className="chart-container-doughnut">
//                               <Doughnut
//                                 data={chartData}
//                                 width={"100%"}
//                                 options={{
//                                   maintainAspectRatio: true,
//                                   animation: {
//                                     duration: 200,
//                                     easing: "easeOutCubic",
//                                     animateRotate: true,
//                                     animateScale: true,
//                                   },
//                                   animations: {
//                                     x: {
//                                       duration: 150,
//                                       easing: "easeOutCubic",
//                                     },
//                                     y: {
//                                       duration: 150,
//                                       easing: "easeOutCubic",
//                                     },
//                                     resize: { duration: 0 },
//                                   },
//                                   aspectRatio: 1,
//                                   plugins: {
//                                     legend: { display: false },
//                                     datalabels: {
//                                       color: "#fff",
//                                       anchor: "center",
//                                       align: "center",
//                                       formatter: (value, context) => {
//                                         const idx = context?.dataIndex;
//                                         const labels =
//                                           context?.chart?.data?.labels || [];
//                                         const label = labels[idx] ?? "";
//                                         const CustomLabels =
//                                           context?.chart?.data?.datasets[0]
//                                             ?.customLabel || [];
//                                         const customLabel =
//                                           CustomLabels[idx] || "";
//                                         return customLabel
//                                           ? `${customLabel}`
//                                           : String(value);
//                                       },
//                                     },
//                                   },
//                                 }}
//                                 responsive={true}
//                                 id={"Email-Doughnut-Chart"}
//                               />
//                               <div className="chart-center-text">
//                                 <h5 className="highlight">
//                                   {totalStorageGB.toFixed(1)}
//                                   <small className="highlight-sm fs-6 align-middle">
//                                     {" "}
//                                     /GB
//                                   </small>
//                                 </h5>
//                               </div>
//                             </div>
//                             <div className="label-wrapper">
//                               {chartData?.labels?.map((label, index) => {
//                                 const bg =
//                                   chartData?.datasets?.[0]?.backgroundColor;
//                                 const color = Array.isArray(bg)
//                                   ? bg[index]
//                                   : bg || "#ccc";
//                                 const bgBorder =
//                                   chartData?.datasets?.[0]?.borderColor;
//                                 const colorBorder = Array.isArray(bgBorder)
//                                   ? bgBorder[index]
//                                   : bgBorder || "#ccc";
//                                 return (
//                                   <div key={index} className="label-item">
//                                     <span
//                                       className="label-color"
//                                       style={{
//                                         display: "inline-block",
//                                         width: 10,
//                                         height: 10,
//                                         borderRadius: 999,
//                                         background: color,
//                                         border: `1px solid ${colorBorder}`,
//                                         boxShadow:
//                                           "0 0 0 2px rgba(0,0,0,0.03) inset",
//                                       }}
//                                     />
//                                     <span className="label-text">{label}</span>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           </div>
//                         </Card.Body>
//                       </div>
//                       <figcaption>
//                         <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
//                       </figcaption>
//                     </div>
//                   </Col>
//                 </Row>
//               </Col>

//               {/* RIGHT: Template chooser column */}
//               <Col xs={12} md={12} lg={12} xl={3}>
//                 <Row className="g-4 mt-2" style={{ height: "100%" }}>
//                   <Col xs={12}>
//                     {userId ? (
//                       <TemplateChooserCard
//                         userId={userId}
//                         onHomeReady={setHomePageId}
//                         onPreviewUrlChange={setPreviewUrl}
//                       />
//                     ) : (
//                       <div />
//                     )}
//                   </Col>
//                 </Row>
//               </Col>
//             </Row>
//           </Container>
//         </main>
//       </div>

//       {isCompact && showMenu && (
//         <div
//           className="mobile-backdrop"
//           onClick={() => setShowMenu(false)}
//         />
//       )}
//     </>
//   );
// }
























// dashboard/pages/dashboard/index.js
import React, { useEffect, useMemo, useState } from "react";
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
import NavbarTop from "../../layouts/navbars/NavbarTop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBasketShopping,
  faGlobe,
  faSwatchbook,
} from "@fortawesome/free-solid-svg-icons";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, Line } from "react-chartjs-2";

import { api, getUserId, PUBLIC_HOST } from "../../lib/api";
import { setTemplateCookie } from "../../lib/templateCookie";
import { backendBaseUrl } from "../../lib/config";

/* -------------------------------------------------------------------------- */
/* Chart.js setup                                                             */
/* -------------------------------------------------------------------------- */

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// Show only these templates in chooser
const ALLOWED_TEMPLATES = ["sir-template-1", "gym-template-1"];

// Map templateId -> S3 folder + entry file (must match your S3 layout)
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
  const cname = (
    process.env.NEXT_PUBLIC_COOKIE_NAME ||
    process.env.COOKIE_NAME ||
    "auth_token"
  ).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function defaultVersionFor(tplObj) {
  const versions = Array.isArray(tplObj?.versions) ? tplObj.versions : [];
  return tplObj?.currentTag || versions?.[0]?.tag || "v1";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build the exact S3 URL for the template + user, matching your console code
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
  )}/${encodeURIComponent(templateId)}?ver=${encodeURIComponent(
    verTag || "v1"
  )}`;

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
/* Template Chooser Card – redesigned with your “Themes” anim-card style      */
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

            // cookie for proxy / public site
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
      {/* NEW: anim-card "Themes" style for Choose Your Template */}
      <div className="anim-card-wrapper dark-bg cap-med template-card">
        <div className="anim-card">
          <div className="border-shadow-top"></div>
          <div className="border-shadow-right"></div>
          <div className="border-shadow-bottom"></div>
          <div className="border-shadow-left"></div>

          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="20.43"
                numOctaves="400"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>

          <Card.Body className="p-3">
            <div>
              <div className="d-flex justify-content-end">
                <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                  {templates?.length || 0}
                </span>
              </div>
              <h6 className="card-title mb-1">Choose Your Template</h6>
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                Access customizable website designs.
              </p>
            </div>

            <div className="template-card-wrapper mt-3">
              {loading && <div className="text-muted">Loading templates…</div>}
              {error && <div className="text-danger">{error}</div>}

              {!loading &&
                !error &&
                templates.map((t) => {
                  const isActive = selected === t.templateId;
                  const versions = Array.isArray(t.versions) ? t.versions : [];
                  const verLabel =
                    t.currentTag ||
                    versions?.[0]?.tag ||
                    (versions.length ? versions[0].tag : "—");

                  return (
                    <div
                      key={t.templateId}
                      className={`template-card ${isActive ? "active" : ""}`}
                    >
                      <div
                        className="template-snippet"
                        style={{
                          backgroundImage: `url("/images/preview1.png")`,
                        }}
                      >
                        <div className="template-info">
                          <div className="mt-2 d-flex align-items-center justify-content-between">
                            <div>
                              <div className="template-title">
                                {t.name || "Template"}
                              </div>
                              <div
                                className="template-sub-title"
                                style={{ fontSize: 12 }}
                              >
                                ID: {t.templateId}
                              </div>
                              <div
                                className="template-sub-title"
                                style={{ fontSize: 12 }}
                              >
                                Version: {verLabel}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 d-flex flex-column gap-2">
                            {/* Apply Theme / Select */}
                            <button
                              className="w-100"
                              onClick={() => choose(t.templateId)}
                              disabled={saving || isActive}
                            >
                              {isActive
                                ? "Currently selected"
                                : saving
                                ? "Saving…"
                                : "Apply theme"}
                            </button>

                            {/* Preview + Edit row */}
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-light flex-grow-1"
                                style={{ fontSize: 11, borderRadius: 6 }}
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
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-light flex-grow-1"
                                style={{ fontSize: 11, borderRadius: 6 }}
                                onClick={openEditorForSelected}
                                disabled={!isActive}
                              >
                                Edit
                              </button>
                            </div>

                            {/* Reset button */}
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-danger w-100"
                              style={{ fontSize: 11, borderRadius: 6 }}
                              onClick={() => openReset(t)}
                              disabled={!isActive}
                              title={
                                isActive
                                  ? "Reset all sections to S3 version defaults (content + order)"
                                  : "Select this template to enable reset"
                              }
                            >
                              {isActive ? "Reset to default" : "Reset (select first)"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="button-wrapper d-flex flex-column gap-2 mt-3">
              <button
                type="button"
                className="primary-btn w-100"
                // you can wire this later if you have a "View All Templates" page
                onClick={() => {}}
              >
                View All Templates
              </button>
            </div>
          </Card.Body>
        </div>
        <figcaption>
          <span>
            <FontAwesomeIcon icon={faSwatchbook} />
          </span>
        </figcaption>
      </div>

      {/* Confirm Reset Modal (unchanged logic) */}
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

      {/* Toast (unchanged) */}
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
/* Dummy data for charts (can wire to real API later)                         */
/* -------------------------------------------------------------------------- */

const email_account = [
  {
    username: "marco",
    domain: "mavsketch.com",
    storage_used: 1536,
    label: "1.5GB",
    storage_allocation: 0,
    storage_unit: "MB",
  },
  {
    username: "nahla",
    domain: "mavsketch.com",
    storage_used: 204.8,
    label: "204.9MB",
    storage_allocation: 2,
    storage_unit: "MB",
  },
  {
    username: "miguel",
    domain: "mavsketch.com",
    storage_used: 523,
    label: "523MB",
    storage_allocation: 1,
    storage_unit: "MB",
  },
  {
    username: "info",
    domain: "mavsketch.com",
    storage_used: 2048,
    label: "2GB",
    storage_allocation: 0,
    storage_unit: "MB",
  },
  {
    username: "marco2",
    domain: "mavsketch.com",
    storage_used: 1536,
    label: "1.5GB",
    storage_allocation: 0,
    storage_unit: "MB",
  },
  {
    username: "nahla2",
    domain: "mavsketch.com",
    storage_used: 204.8,
    label: "204.9MB",
    storage_allocation: 2,
    storage_unit: "MB",
  },
  {
    username: "miguel2",
    domain: "mavsketch.com",
    storage_used: 523,
    label: "523MB",
    storage_allocation: 1,
    storage_unit: "MB",
  },
  {
    username: "info2",
    domain: "mavsketch.com",
    storage_used: 2048,
    label: "2GB",
    storage_allocation: 0,
    storage_unit: "MB",
  },
  {
    username: "thirdy",
    domain: "mavsketch.com",
    storage_used: 2048,
    label: "2GB",
    storage_allocation: 0,
    storage_unit: "MB",
  },
];

const storage = [
  {
    used: 2,
    storage_allocation: 10,
    storage_unit: "GB",
  },
];

/* -------------------------------------------------------------------------- */
/* Main Dashboard                                                             */
/* -------------------------------------------------------------------------- */

const BREAKPOINT = 1120;
const ARC_DEG = 240;

export default function DashboardHome() {
  const router = useRouter();

  const [showMenu, setShowMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);

  const [me, setMe] = useState(null); // { user, next, meta }
  const [homePageId, setHomePageId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const palette = [
    "rgba(120, 113, 108, 1)", // Warm gray
    "rgba(147, 197, 253, 1)", // Soft blue
    "rgba(186, 230, 253, 1)", // Light blue
    "rgba(209, 250, 229, 1)", // Mint green
    "rgba(254, 215, 170, 1)", // Peach
    "rgba(221, 214, 254, 1)", // Lavender
    "rgba(253, 230, 138, 1)", // Pale yellow
    "rgba(204, 251, 241, 1)", // Seafoam
    "rgba(229, 231, 235, 1)", // Cool gray
    "rgba(254, 205, 211, 1)", // Blush pink
  ];

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
    if (typeof document === "undefined") return;
    document.body.classList.toggle("sidebar-open", isCompact && showMenu);
  }, [isCompact, showMenu]);

  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth <= 1120;
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

          // also keep cookie in sync here
          setTemplateCookie(tplId, verTag, userId);
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

  // For "View Site" / "Preview Changes" – always prefer PUBLIC_HOST
  const openPreview = () => {
    if (PUBLIC_HOST) {
      window.open(
        `${PUBLIC_HOST}/?r=${Date.now()}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  };

  // helper: show decimals only when needed
  const formatSmart = (value, decimals = 1) => {
    if (value == null || Number.isNaN(Number(value))) return "";
    const n = Number(value);
    const rounded = Number(n.toFixed(decimals));
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
  };

  /* ---------------- Email storage donut ---------------- */

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Storage used",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const labels = email_account.map((acc) => acc.username || "unknown");
    const customLabel = email_account.map((acc) => acc.label || "unknown");
    const values = email_account.map((acc) => {
      const v = parseFloat(acc.storage_used);
      return Number.isFinite(v) ? v : 0;
    });

    const bg = labels.map((_, i) =>
      palette[i % palette.length].replace("1)", "0.2)")
    );
    const borderColor = labels.map((_, i) => palette[i % palette.length]);

    setChartData({
      labels,
      datasets: [
        {
          label: "Storage used",
          customLabel,
          data: values,
          backgroundColor: bg,
          borderColor,
          borderWidth: 1.5,
          borderRadius: 4,
          offset: 20,
          hoverOffset: 35,
        },
      ],
    });
  }, []); // email_account is constant

  const totalStorageMB = (chartData?.datasets?.[0]?.data || []).reduce(
    (s, n) => s + (Number(n) || 0),
    0
  );
  const totalStorageGB = totalStorageMB / 1024;

  /* ---------------- Main storage (half donut) ---------------- */

  const [storageData, setStorageData] = useState({
    labels: [],
    datasets: [
      {
        label: "Storage used",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const storageValues = [
    storage[0].used,
    storage[0].storage_allocation - storage[0].used,
  ];

  useEffect(() => {
    setStorageData({
      labels: ["Used Storage", "Storage Available"],
      datasets: [
        {
          label: "Storage",
          data: storageValues,
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return;
            }

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(213, 255, 64, 1)");
            gradient.addColorStop(1, "rgba(215, 68, 5, 1)");

            return [gradient, "rgba(225, 225, 225, 1)"];
          },
          borderColor: ["rgba(213, 255, 64, 0)", "rgba(225, 225, 225, 0)"],
          borderWidth: 1.5,
          borderRadius: 4,
          offset: 10,
          hoverOffset: 35,
        },
      ],
    });
  }, []);

  const storageUsed = Number(storage?.[0]?.used || 0); // GB
  const storageAlloc = Number(storage?.[0]?.storage_allocation || 1); // GB
  const storageRemainingGB = Math.max(0, storageAlloc - storageUsed);
  const storageRemainingPercent =
    storageAlloc > 0 ? (storageRemainingGB / storageAlloc) * 100 : 0;

  /* ---------------- Visitors line chart ---------------- */

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Visitors",
        data: [0, 29, 80, 41, 10, 89],
        fill: "origin",
        backgroundColor: (context) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return;
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          const topColor = "rgba(213, 255, 64, 0.3)";
          const bottomColor = "rgba(213, 255, 64, 0)";

          gradient.addColorStop(0, topColor);
          gradient.addColorStop(1, bottomColor);

          return gradient;
        },
        borderColor: "#d5ff40",
        borderWidth: 1.0,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    layout: {
      padding: {
        right: 20,
        top: 20,
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        color: "#fff",
        anchor: "top",
        align: "top",
        formatter: (value, context) => {
          const idx = context?.dataIndex;
          const labels = context?.chart?.data?.labels || [];
          const label = labels[idx] ?? "";
          const customLabels =
            context?.chart?.data?.datasets[0]?.customLabel || [];
          const customLabel = customLabels[idx] || "";
          return customLabel ? `${customLabel}` : String(value);
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#ffffff77" },
      },
      y: {
        beginAtZero: true,
        grid: { display: true },
        border: { display: false },
        ticks: { display: false, color: "transparent" },
      },
    },
  };

  return (
    <>
      <style jsx global>{`
        #page-content {
          background-color: transparent !important;
        }
      `}</style>

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
            <h5 className="container-title">Welcome back, {userName}!</h5>
            <p className="container-subtitle">
              Here&apos;s your website overview and next steps to complete your
              setup.
            </p>

            <Row className="g-4">
              {/* LEFT: main cards */}
              <Col xs={12} md={12} lg={12} xl={9}>
                <Row className="g-4 mt-2" style={{ height: "100%" }}>
                  {/* Current Subscription */}
                  <Col xs={12} md={7} lg={7} xl={7}>
                    <Card className="border-0 ion-card h-100 box-card">
                      <Card.Body className="position-relative px-4 pt-5 pb-4">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title">Current Subscription</h5>
                            <div className="card-icon">
                              <img src="/icons/crown.svg" alt="Pro Plan" />
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
                        </div>

                        <div className="card_wrapper_custom">
                          <h4>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 344.84 299.91"
                              width="18"
                              height="18"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path
                                fill="#ffffff"
                                d="M342.14,140.96l2.7,2.54v-7.72c0-17-11.92-30.84-26.56-30.84h-23.41C278.49,36.7,222.69,0,139.68,0c-52.86,0-59.65,0-109.71,0,0,0,15.03,12.63,15.03,52.4v52.58h-27.68c-5.38,0-10.43-2.08-14.61-6.01l-2.7-2.54v7.72c0,17.01,11.92,30.84,26.56,30.84h18.44s0,29.99,0,29.99h-27.68c-5.38,0-10.43-2.07-14.61-6.01l-2.7-2.54v7.71c0,17,11.92,30.82,26.56,30.82h18.44s0,54.89,0,54.89c0,38.65-15.03,50.06-15.03,50.06h109.71c85.62,0,139.64-36.96,155.38-104.98h32.46c5.38,0,10.43,2.07,14.61,6l2.7,2.54v-7.71c0-17-11.92-30.83-26.56-30.83h-18.9c.32-4.88.49-9.87.49-15s-.18-10.11-.51-14.99h28.17c5.37,0,10.43,2.07,14.61,6.01ZM89.96,15.01h45.86c61.7,0,97.44,27.33,108.1,89.94l-153.96.02V15.01ZM136.21,284.93h-46.26v-89.98l153.87-.02c-9.97,56.66-42.07,88.38-107.61,90ZM247.34,149.96c0,5.13-.11,10.13-.34,14.99l-157.04.02v-29.99l157.05-.02c.22,4.84.33,9.83.33,15Z"
                              />
                            </svg>
                            29.99 <small>/month</small>
                          </h4>
                          <div className="col-info-wrapper">
                            <div className="col-info">
                              <span className="bold">Next billing date</span>
                              <span>Nov 01, 2025</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Days Remaining</span>
                              <span>6 Days</span>
                            </div>
                          </div>

                          <div className="progress thin">
                            <div
                              className="progress-bar bg-mavsketch"
                              style={{ width: `${(24 / 30) * 100}%` }}
                            />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* My Products */}
                  <Col xs={12} md={5} lg={5} xl={5}>
                    <div className="anim-card-wrapper primary-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                +2.1%
                              </span>
                            </div>
                            <h6 className="card-title mb-1">My Products</h6>
                            <p className="mb-0">
                              Summary of all your products.
                            </p>
                          </div>
                          <div className="products-summary">
                            <div className="product-item">
                              <span className="product-name">
                                Total Products
                              </span>
                              <span className="product-value">128</span>
                            </div>
                            <div className="product-item">
                              <span className="product-name">
                                Active Products
                              </span>
                              <span className="product-value">115</span>
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>
                          <FontAwesomeIcon icon={faBasketShopping} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Site Visitors */}
                  <Col xs={12} md={5} lg={5} xl={5}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>
                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                {`${((8.2 / 50) * 100).toFixed(2)}%`}
                              </span>
                            </div>
                            <h6 className="card-title mb-1">Site Visitors</h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              See how many visits your website is getting.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="lineChart-Container">
                              <Line data={lineData} options={lineOptions} />
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Edit My Website */}
                  <Col xs={12} md={7} lg={7} xl={7}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>
                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                {`${((8.2 / 50) * 100).toFixed(2)}%`}
                              </span>
                            </div>
                            <h6 className="card-title mb-1">Edit My Website</h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Quick access to your website editor and
                              customization tools.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="col-info">
                              <span className="bold">Last edited</span>
                              <span>2 hours ago</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Draft changes</span>
                              <span>3 pending</span>
                            </div>
                            <div className="col-info">
                              <span className="bold">Template</span>
                              <span>Modern Blog</span>
                            </div>
                          </div>

                          <div
                            className={`button-wrapper d-flex flex-column gap-2 ${
                              isCompact ? "dir-inline" : ""
                            }`}
                          >
                            {homePageId ? (
                              <button
                                type="button"
                                className="primary-btn"
                                onClick={() =>
                                  router.push(`/editorpages/page/${homePageId}`)
                                }
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
                              className=""
                              onClick={openPreview}
                            >
                              Preview Changes
                            </button>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* My Domain */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                0
                              </span>
                            </div>
                            <h6 className="card-title mb-1">My Domain</h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Quick info about your domain settings.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="domain-wrapper">
                              <span className="https">https://</span>
                              <span>yourdomain.com</span>
                            </div>
                          </div>

                          <div className={`button-wrapper d-flex flex-column gap-2`}>
                            <button
                              type="button"
                              className="primary-btn w-100"
                              onClick={openPreview}
                            >
                              Visit your site
                            </button>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>
                          <FontAwesomeIcon icon={faGlobe} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Storage Used */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                {`${((8.2 / 50) * 100).toFixed(2)}%`}
                              </span>
                            </div>

                            <h6 className="card-title mb-1">Storage Used</h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {`${formatSmart(storageUsed)}GB used of ${storageAlloc}GB total`}
                            </p>
                          </div>
                          <div>
                            <div className="chart-container-halfdoughnut">
                              <Doughnut
                                data={storageData}
                                width={"100%"}
                                options={{
                                  maintainAspectRatio: true,
                                  animation: {
                                    duration: 200,
                                    easing: "easeOutCubic",
                                    animateRotate: true,
                                    animateScale: true,
                                  },
                                  layout: {
                                    padding: {
                                      top: 5,
                                      left: 5,
                                      right: 5,
                                    },
                                  },
                                  rotation: -ARC_DEG / 2,
                                  circumference: ARC_DEG,
                                  cutout: "70%",
                                  animations: {
                                    x: { duration: 150 },
                                    y: { duration: 150 },
                                    resize: { duration: 0 },
                                  },
                                  aspectRatio: 1,
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          let label =
                                            context.dataset.label || "";
                                          if (label) label += " ";
                                          if (context.parsed !== null) {
                                            label += context.parsed;
                                          }
                                          label += "GB";
                                          return label;
                                        },
                                      },
                                    },
                                    datalabels: { display: false },
                                  },
                                }}
                                responsive={true}
                                id={"Email-halfDoughnut-Chart"}
                              />
                              <div className="chart-center-text">
                                <h5 className="highlight">
                                  {formatSmart(storageUsed)}
                                  <small className="highlight-sm fs-6 align-middle">
                                    {" "}
                                    /GB
                                  </small>
                                </h5>
                              </div>
                            </div>
                            <h3
                              className="fw-bold mb-1 highlight"
                              style={{ fontSize: "2rem" }}
                            >
                              {`${formatSmart(storageRemainingGB)}`}
                              <small className="highlight-sm fs-6 align-middle">
                                {" "}
                                /GB Remaining
                              </small>
                            </h3>
                            <div className="progress progress-thin thin">
                              <div
                                className="progress-bar bg-mavsketch"
                                style={{ width: `${storageRemainingPercent}%` }}
                              />
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((8.2 / 50) * 100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Email Capacity */}
                  <Col xs={12} md={4} lg={4} xl={4}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                {`${((8.2 / 50) * 100).toFixed(2)}%`}
                              </span>
                            </div>
                            <h6 className="card-title mb-1">
                              Email Capacity
                            </h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              13 used of 14 accounts total
                            </p>
                          </div>
                          <div>
                            <div className="chart-container-doughnut">
                              <Doughnut
                                data={chartData}
                                width={"100%"}
                                options={{
                                  maintainAspectRatio: true,
                                  animation: {
                                    duration: 200,
                                    easing: "easeOutCubic",
                                    animateRotate: true,
                                    animateScale: true,
                                  },
                                  animations: {
                                    x: {
                                      duration: 150,
                                      easing: "easeOutCubic",
                                    },
                                    y: {
                                      duration: 150,
                                      easing: "easeOutCubic",
                                    },
                                    resize: { duration: 0 },
                                  },
                                  aspectRatio: 1,
                                  plugins: {
                                    legend: { display: false },
                                    datalabels: {
                                      color: "#fff",
                                      anchor: "center",
                                      align: "center",
                                      formatter: (value, context) => {
                                        const idx = context?.dataIndex;
                                        const labels =
                                          context?.chart?.data?.labels || [];
                                        const label = labels[idx] ?? "";
                                        const CustomLabels =
                                          context?.chart?.data?.datasets[0]
                                            ?.customLabel || [];
                                        const customLabel =
                                          CustomLabels[idx] || "";
                                        return customLabel
                                          ? `${customLabel}`
                                          : String(value);
                                      },
                                    },
                                  },
                                }}
                                responsive={true}
                                id={"Email-Doughnut-Chart"}
                              />
                              <div className="chart-center-text">
                                <h5 className="highlight">
                                  {totalStorageGB.toFixed(1)}
                                  <small className="highlight-sm fs-6 align-middle">
                                    {" "}
                                    /GB
                                  </small>
                                </h5>
                              </div>
                            </div>
                            <div className="label-wrapper">
                              {chartData?.labels?.map((label, index) => {
                                const bg =
                                  chartData?.datasets?.[0]?.backgroundColor;
                                const color = Array.isArray(bg)
                                  ? bg[index]
                                  : bg || "#ccc";
                                const bgBorder =
                                  chartData?.datasets?.[0]?.borderColor;
                                const colorBorder = Array.isArray(bgBorder)
                                  ? bgBorder[index]
                                  : bgBorder || "#ccc";
                                return (
                                  <div key={index} className="label-item">
                                    <span
                                      className="label-color"
                                      style={{
                                        display: "inline-block",
                                        width: 10,
                                        height: 10,
                                        borderRadius: 999,
                                        background: color,
                                        border: `1px solid ${colorBorder}`,
                                        boxShadow:
                                          "0 0 0 2px rgba(0,0,0,0.03) inset",
                                      }}
                                    />
                                    <span className="label-text">{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{`${((13 / 14) * 100).toFixed(2)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>
                </Row>
              </Col>

              {/* RIGHT: Template chooser column */}
              <Col xs={12} md={12} lg={12} xl={3}>
                <Row className="g-4 mt-2" style={{ height: "100%" }}>
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
              </Col>
            </Row>
          </Container>
        </main>
      </div>

      {isCompact && showMenu && (
        <div
          className="mobile-backdrop"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
