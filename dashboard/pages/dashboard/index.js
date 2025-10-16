


// // og

// // dashboard/pages/dashboard/index.js
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";
// import { Container, Row, Col, Card } from "react-bootstrap";
// import SidebarDashly from "../../layouts/navbars/NavbarVertical";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBars } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";

// import { api, getUserId } from "../../lib/api";


// const USER_ID_CONST = "demo-user";
// const TEMPLATE_ID_CONST = "gym-template-1";

// const http = axios.create({ baseURL: "" });

// /* ---------------- Inline Template Chooser Card ---------------- */
// function TemplateChooserCard({ onOpenEditor }) {
//   const router = useRouter();
//   const userId = getUserId();

//   const [loading, setLoading] = useState(true);
//   const [templates, setTemplates] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         const list = await api.listTemplates();
//         const sel = await api.selectedTemplateForUser(userId);
//         if (off) return;
//         setTemplates(list?.data || []);
//         setSelected(sel?.data?.templateId || null);
//       } catch (e) {
//         if (!off) setError(e.message || "Failed to load templates");
//       } finally {
//         if (!off) setLoading(false);
//       }
//     })();
//     return () => { off = true; };
//   }, [userId]);

//   async function choose(templateId) {
//     try {
//       setSaving(true);
//       await api.selectTemplate(templateId, userId);
//       setSelected(templateId);
//     } catch (e) {
//       alert(e.message || "Failed to select template");
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <Card className="border-0 ion-card h-100" style={{
//       background:"rgba(255,255,255,0.28)",
//       backdropFilter:"blur(50px)",
//       WebkitBackdropFilter:"blur(50px)",
//       borderRadius:20,
//       border:"1px solid rgba(255,255,255,0.3)"
//     }}>
//       <Card.Body className="px-4 pt-4 pb-3">
//         <div className="d-flex justify-content-between align-items-start mb-2">
//           <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//             Choose Your Template
//           </h5>
//           <img src="/icons/layout-icon.png" alt="" width={30} height={30} />
//         </div>

//         {loading && <div className="text-muted">Loading templates…</div>}
//         {error && <div className="text-danger">{error}</div>}

//         {!loading && !error && (
//           <div className="d-grid" style={{
//             gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
//             gap: 12
//           }}>
//             {templates.map(t => (
//               <div key={t.templateId} className={`p-3 rounded-3 border ${selected === t.templateId ? "border-primary shadow-sm" : "border-light"}`} style={{ background:"#fff" }}>
//                 <div style={{ height: 110, borderRadius: 10, background:"linear-gradient(135deg,#f5f7fa,#e4ecf7)" }} />
//                 <div className="mt-2 d-flex align-items-center justify-content-between">
//                   <div>
//                     <div className="fw-semibold">{t.name}</div>
//                     <div className="text-muted" style={{ fontSize:12 }}>ID: {t.templateId}</div>
//                   </div>
//                   <button
//                     className="btn btn-sm"
//                     style={{ background:"#111827", color:"#fff", borderRadius:8 }}
//                     disabled={saving || selected === t.templateId}
//                     onClick={() => choose(t.templateId)}
//                     title={selected === t.templateId ? "Already selected" : "Select this template"}
//                   >
//                     {selected === t.templateId ? "Selected ✓" : (saving ? "Saving…" : "Select")}
//                   </button>
//                 </div>
//                 <div className="mt-2 d-flex gap-2">
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     onClick={() => router.push(`/templates/preview/${t.templateId}`)}
//                     style={{ borderRadius:8 }}
//                   >
//                     Preview
//                   </button>
//                   <button
//                     className="btn btn-sm btn-primary"
//                     onClick={onOpenEditor}
//                     disabled={!selected || selected !== t.templateId}
//                     style={{ borderRadius:8 }}
//                   >
//                     Edit
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card.Body>
//     </Card>
//   );
// }

// /* ------------------------------ MAIN DASHBOARD ------------------------------ */
// export default function DashboardHome() {
//   const [homePageId, setHomePageId] = useState(null);
//   const [fetchErr, setFetchErr] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false); // < 992px
//   const router = useRouter();

//   const cardGlass = {
//     background: "rgba(255,255,255,0.28)",
//     backdropFilter: "blur(50px)",
//     WebkitBackdropFilter: "blur(50px)",
//     borderRadius: 20,
//     border: "1px solid rgba(255,255,255,0.3)",
//   };

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


//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setFetchErr(null);
//       try {
//         const primary = await http.get("/api/sections", {
//           params: {
//             userId: USER_ID_CONST,
//             templateId: TEMPLATE_ID_CONST,
//             type: "page",
//             slug: "home",
//           },
//           timeout: 15000,
//         });

//         const pRows = Array.isArray(primary.data)
//           ? primary.data
//           : primary.data?.data || [];

//         let page =
//           pRows.find(
//             (r) =>
//               r?.type === "page" &&
//               (r?.slug?.toLowerCase() === "home" ||
//                 r?.title?.toLowerCase() === "home")
//           ) || null;

//         if (!page) {
//           const fallback = await http.get(
//             `/api/sections/${USER_ID_CONST}/${TEMPLATE_ID_CONST}`,
//             { timeout: 15000 }
//           );
//           const fRows = Array.isArray(fallback.data)
//             ? fallback.data
//             : fallback.data?.data || [];
//           page =
//             fRows.find(
//               (r) =>
//                 r?.type === "page" &&
//                 (r?.slug?.toLowerCase() === "home" ||
//                   r?.title?.toLowerCase() === "home")
//             ) || null;
//         }

//         if (!cancelled) setHomePageId(page?._id || null);
//         if (!page) setFetchErr("Could not locate a 'home' page in API response.");
//       } catch (err) {
//         if (!cancelled) {
//           setHomePageId(null);
//           setFetchErr(err?.message || "Request failed");
//         }
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <>
//       <style jsx global>{`
//         #page-content { background-color: transparent !important; }
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
//           style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
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

//             {/* ---------- NEW ROW: TEMPLATE CHOOSER ---------- */}
//             <Row className="g-4 mt-2">
//               <Col xs={12}>
//                 <TemplateChooserCard
//                   onOpenEditor={() =>
//                     homePageId
//                       ? router.push(`/editorpages/page/${homePageId}`)
//                       : alert("Home page not found yet.")
//                   }
//                 />
//               </Col>
//             </Row>

   
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
//                         $29.99 <small className="text-dark fs-6 fw-normal align-middle">/month</small>
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
//                         marcobotton.com
//                       </h6>

//                       <div className="d-flex flex-wrap gap-2 mb-3">
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">✔ Connected</span>
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">SSL Active</span>
//                       </div>
//                     </div>

//                     <div className="card_wrapper-custom">
//                       <div className="d-flex justify-content-between text-dark small mb-1">
//                         <span>Domain expires</span>
//                         <span className="fw-semibold text-dark">Dec 25, 2024</span>
//                       </div>

//                       <div className="d-flex justify-content-between text-dark small mb-3">
//                         <span>DNS Status</span>
//                         <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">Active</span>
//                       </div>
//                     </div>

//                     <div className="d-flex gap-2">
//                       <button
//                         type="button"
//                         className="btn fw-medium rounded-3 w-50"
//                         style={{ padding: "6px 0", backgroundColor: "#FF3C3C", color: "#fff", border: "none" }}
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

//                     <div className="card_wrapper-custom">
//                       <p className="text-dark mb-3" style={{ fontSize: "0.88rem" }}>
//                         Quick access to your website editor and customization tools.
//                       </p>

//                       <div className="d-flex justify-content-between text-dark small mb-1">
//                         <span>Last edited</span>
//                         <span className="fw-semibold text-dark">2 hours ago</span>
//                       </div>
//                       <div className="d-flex justify-content-between text-dark small mb-1">
//                         <span>Draft changes</span>
//                         <span className="fw-semibold text-dark">3 pending</span>
//                       </div>
//                       <div className="d-flex justify-content-between text-dark small mb-3">
//                         <span>Template</span>
//                         <span className="fw-semibold text-dark">Modern Blog</span>
//                       </div>
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

//             <Row className="g-4 mt-3">
//               <Col xs={12} md={6} lg={4}>
//                 <Card className="border-0 metric-card h-100" style={cardGlass}>
//                   <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
//                     <div className="d-flex justify-content-end">
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">+12.5%</span>
//                     </div>
//                     <div>
//                       <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
//                       <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">+8.2%</span>
//                     </div>
//                     <div>
//                       <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
//                 <Card className="custom-card-shadow border-0 metric-card h-100" style={cardGlass}>
//                   <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
//                     <div className="d-flex justify-content-end">
//                       <span className="px-2 py-1 rounded-pill fw-bold" style={{ background: "#FF3B30", color: "#fff" }}>
//                         +2.1%
//                       </span>
//                     </div>
//                     <div>
//                       <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
//                           <strong>Sarah Johnson</strong> published a new article “Design Systems in 2023”
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
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import { api, getUserId } from "../../lib/api";

const USER_ID_CONST = "demo-user";
const TEMPLATE_ID_CONST = "gym-template-1";

// Public host to “ping” so index.php sets cookie on .mavsketch.com
const PUBLIC_HOST =
  process.env.NEXT_PUBLIC_PUBLIC_HOST || "https://ion7dev.mavsketch.com";

const http = axios.create({ baseURL: "" });

/* ---------------- Cookie helpers (prod + localhost safe) ---------------- */
function getBaseDomain(
  hostname = (typeof location !== "undefined" ? location.hostname : "")
) {
  // If localhost or an IP, don't set Domain attr
  if (
    !hostname ||
    hostname === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.split(".").length < 2
  )
    return "";

  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];
  const use3 = tld.length === 2 && parts.length >= 3; // e.g., .ae
  const base = parts.slice(use3 ? -3 : -2).join(".");
  return `.${base}`; // e.g., .mavsketch.com
}

function setTemplateCookie(templateId) {
  const oneYear = 60 * 60 * 24 * 365;
  const attrs = [
    `templateId=${encodeURIComponent(templateId)}`,
    `Max-Age=${oneYear}`,
    `Path=/`,
    `SameSite=Lax`,
  ];
  if (typeof location !== "undefined") {
    const baseDomain = getBaseDomain();
    if (baseDomain) attrs.push(`Domain=${baseDomain}`);
    if (location.protocol === "https:") attrs.push("Secure");
  }
  document.cookie = attrs.join("; ");
}

/* ---------------- Inline Template Chooser Card ---------------- */
function TemplateChooserCard({ onOpenEditor }) {
  const router = useRouter();
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const list = await api.listTemplates();
        const sel = await api.selectedTemplateForUser(userId);
        if (off) return;
        setTemplates(list?.data || []);
        setSelected(sel?.data?.templateId || null);
      } catch (e) {
        if (!off) setError(e.message || "Failed to load templates");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [userId]);

  async function choose(templateId) {
    try {
      setSaving(true);
      await api.selectTemplate(templateId, userId);
      setSelected(templateId);

      // 1) set cross-subdomain cookie (helps if dashboard is on same eTLD)
      setTemplateCookie(templateId);

      // 2) ping the public host so its index.php sets cookie server-side, too
      //    (no-cors so it works cross-origin; credentials include for good measure)
      fetch(`${PUBLIC_HOST}/?templateId=${encodeURIComponent(templateId)}&r=${Date.now()}`, {
        mode: "no-cors",
        credentials: "include",
      });

      // Optional: open public site in a new tab for instant confirmation
      // window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank");
    } catch (e) {
      alert(e.message || "Failed to select template");
    } finally {
      setSaving(false);
    }
  }

  return (
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
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 12,
            }}
          >
            {templates.map((t) => (
              <div
                key={t.templateId}
                className={`p-3 rounded-3 border ${
                  selected === t.templateId ? "border-primary shadow-sm" : "border-light"
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
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ background: "#111827", color: "#fff", borderRadius: 8 }}
                    disabled={saving || selected === t.templateId}
                    onClick={() => choose(t.templateId)}
                    title={selected === t.templateId ? "Already selected" : "Select this template"}
                  >
                    {selected === t.templateId ? "Selected ✓" : saving ? "Saving…" : "Select"}
                  </button>
                </div>
                <div className="mt-2 d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => router.push(`/templates/preview/${t.templateId}`)}
                    style={{ borderRadius: 8 }}
                  >
                    Preview
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={onOpenEditor}
                    disabled={!selected || selected !== t.templateId}
                    style={{ borderRadius: 8 }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

/* ------------------------------ MAIN DASHBOARD ------------------------------ */
export default function DashboardHome() {
  const [homePageId, setHomePageId] = useState(null);
  const [fetchErr, setFetchErr] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false); // < 992px
  const router = useRouter();

  const cardGlass = {
    background: "rgba(255,255,255,0.28)",
    backdropFilter: "blur(50px)",
    WebkitBackdropFilter: "blur(50px)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.3)",
  };

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFetchErr(null);
      try {
        const primary = await http.get("/api/sections", {
          params: {
            userId: USER_ID_CONST,
            templateId: TEMPLATE_ID_CONST,
            type: "page",
            slug: "home",
          },
          timeout: 15000,
        });

        const pRows = Array.isArray(primary.data)
          ? primary.data
          : primary.data?.data || [];

        let page =
          pRows.find(
            (r) =>
              r?.type === "page" &&
              (r?.slug?.toLowerCase() === "home" ||
                r?.title?.toLowerCase() === "home")
          ) || null;

        if (!page) {
          const fallback = await http.get(
            `/api/sections/${USER_ID_CONST}/${TEMPLATE_ID_CONST}`,
            { timeout: 15000 }
          );
          const fRows = Array.isArray(fallback.data)
            ? fallback.data
            : fallback.data?.data || [];
          page =
            fRows.find(
              (r) =>
                r?.type === "page" &&
                (r?.slug?.toLowerCase() === "home" ||
                  r?.title?.toLowerCase() === "home")
            ) || null;
        }

        if (!cancelled) setHomePageId(page?._id || null);
        if (!page) setFetchErr("Could not locate a 'home' page in API response.");
      } catch (err) {
        if (!cancelled) {
          setHomePageId(null);
          setFetchErr(err?.message || "Request failed");
        }
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

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

        <button
          type="button"
          onClick={() => setSidebarOpen((s) => !s)}
          className="btn btn-link d-lg-none position-fixed top-0 start-0 m-3 p-2 z-3"
          aria-label="Toggle menu"
          style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
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

            {/* ---------- NEW ROW: TEMPLATE CHOOSER ---------- */}
            <Row className="g-4 mt-2">
              <Col xs={12}>
                <TemplateChooserCard
                  onOpenEditor={() =>
                    homePageId
                      ? router.push(`/editorpages/page/${homePageId}`)
                      : alert("Home page not found yet.")
                  }
                />
              </Col>
            </Row>

            {/* ---------- rest of your UI is unchanged ---------- */}
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
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">Pro Plan</span>
                      <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">Monthly</span>
                    </div>

                    <div className="card_wrapper-custom">
                      <h4 className="fw-bold mb-3" style={{ lineHeight: "1.5", fontSize: "1.7rem" }}>
                        $29.99 <small className="text-dark fs-6 fw-normal align-middle">/month</small>
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
                        <div className="progress-bar bg-mavsketch" style={{ width: `${(8.2 / 50) * 100}%` }}>
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
                        <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">✔ Connected</span>
                        <span className="px-2 py-1 rounded-pill fw-bold badge-soft-gray">SSL Active</span>
                      </div>
                    </div>

                    <div className="card_wrapper-custom">
                      <div className="d-flex justify-content-between text-dark small mb-1">
                        <span>Domain expires</span>
                        <span className="fw-semibold text-dark">Dec 25, 2024</span>
                      </div>

                      <div className="d-flex justify-content-between text-dark small mb-3">
                        <span>DNS Status</span>
                        <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">Active</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn fw-medium rounded-3 w-50"
                        style={{ padding: "6px 0", backgroundColor: "#FF3C3C", color: "#fff", border: "none" }}
                        onClick={() => window.open(`${PUBLIC_HOST}/?r=${Date.now()}`, "_blank")}
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

                    <div className="card_wrapper-custom">
                      <p className="text-dark mb-3" style={{ fontSize: "0.88rem" }}>
                        Quick access to your website editor and customization tools.
                      </p>

                      <div className="d-flex justify-content-between text-dark small mb-1">
                        <span>Last edited</span>
                        <span className="fw-semibold text-dark">2 hours ago</span>
                      </div>
                      <div className="d-flex justify-content-between text-dark small mb-1">
                        <span>Draft changes</span>
                        <span className="fw-semibold text-dark">3 pending</span>
                      </div>
                      <div className="d-flex justify-content-between text-dark small mb-3">
                        <span>Template</span>
                        <span className="fw-semibold text-dark">Modern Blog</span>
                      </div>
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
                        <button type="button" className="btn button-dark" disabled style={{ color: "#fff" }}>
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

            <Row className="g-4 mt-3">
              <Col xs={12} md={6} lg={4}>
                <Card className="border-0 metric-card h-100" style={cardGlass}>
                  <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-end">
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">+12.5%</span>
                    </div>
                    <div>
                      <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
                      <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">+8.2%</span>
                    </div>
                    <div>
                      <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
                <Card className="custom-card-shadow border-0 metric-card h-100" style={cardGlass}>
                  <Card.Body className="p-3 d-flex flex-column justify-content-between h-100">
                    <div className="d-flex justify-content-end">
                      <span className="px-2 py-1 rounded-pill fw-bold" style={{ background: "#FF3B30", color: "#fff" }}>
                        +2.1%
                      </span>
                    </div>
                    <div>
                      <h6 className="text-uppercase text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
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
                          <strong>Sarah Johnson</strong> published a new article “Design Systems in 2023”
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
