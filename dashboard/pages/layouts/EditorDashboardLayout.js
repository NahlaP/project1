








// og
// import React, { useState, useEffect } from 'react';
// import { Nav, Button, Collapse } from 'react-bootstrap';
// import { useRouter } from 'next/router';
// import { SectionsApi } from '../../lib/sectionsApi';
// import { userId, templateId } from '../../lib/config';

// import NavbarEditor from 'layouts/navbars/NavbarEditor';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import {
//   Home,
//   Star,
//   LayoutGrid,
//   Info,
//   Users,
//   MessageSquare,
//   Briefcase,
//   Mail,
//   File as FileIcon,
// } from 'lucide-react';
// import {
//   faStar,
//   faLayerGroup,
//   faInfoCircle,
//   faCogs,
//   faUsers,
//   faQuoteRight,
//   faBars,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const sidebarIcons = {
//   heroS: faStar,
//   "why-chooseS": faLayerGroup,
//   aboutS: faInfoCircle,
//   servicesS: faCogs,
//   teamS: faUsers,
//   testimonialS: faQuoteRight,
// };

// const sections = [
//   { href: "/editorpages/heroS", title: "Hero Section", desc: "Eye-catching banner" },
//   { href: "/editorpages/why-chooseS", title: "Features Grid", desc: "Showcase key features" },
//   { href: "/editorpages/aboutS", title: "About Us", desc: "Company information" },
//   { href: "/editorpages/servicesS", title: "Services", desc: "Service offerings" },
//   { href: "/editorpages/teamS", title: "Team", desc: "Meet the team section" },
//   { href: "/editorpages/testimonialS", title: "Testimonials", desc: "Customer reviews" },
// ];

// const EditorDashboardLayout = ({ children }) => {
//   const router = useRouter();
//   const currentPath = router.asPath;

//   const [loading, setLoading] = useState(true);
//   const [all, setAll] = useState([]);
//   const [pagesState, setPagesState] = useState([]);
//   const [reorderMode, setReorderMode] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(true);

//   // Responsive sidebar state
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   const pages = all.filter((s) => s.type === 'page');

//   const getLinkClass = (path) =>
//     `d-flex align-items-center gap-2 nav-link-custom ${currentPath === path ? 'active-link' : 'text-dark'}`;

//   const load = async () => {
//     try {
//       setLoading(true);
//       const { data } = await SectionsApi.list(userId, templateId);
//       setAll(data);
//     } catch (e) {
//       console.error('Failed to fetch sections', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   useEffect(() => {
//     if (!loading) {
//       setPagesState(pages);
//     }
//   }, [loading, all]);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setSidebarOpen(!mobile); 
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const toggleSidebar = () => setSidebarOpen(prev => !prev);

//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;

//     const items = Array.from(pagesState);
//     const [movedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, movedItem);

//     const reorderedWithOrder = items.map((item, index) => ({
//       ...item,
//       order: index,
//     }));

//     setPagesState(reorderedWithOrder);

//     try {
//       const payload = reorderedWithOrder.map((item, index) => ({
//         _id: item._id,
//         order: index,
//       }));
//       await SectionsApi.reorder(userId, templateId, payload);
//       await load();
//     } catch (err) {
//       console.error('❌ Failed to save order to backend:', err);
//     }
//   };

//   const addPage = async () => {
//     const title = typeof window !== 'undefined' ? window.prompt('New page title?') : null;
//     if (!title) return;
//     await SectionsApi.create(userId, templateId, { type: 'page', title });
//     await load();
//   };

//   return (
//     <div style={{ display: 'flex' }}>
//       {/* Hamburger Button for mobile */}
//       {isMobile && (
//         <Button
//           onClick={toggleSidebar}
//           style={{
//             position: 'fixed',
//             top: 10,
//             left: 10,
//             zIndex: 1100,
//             backgroundColor: '#FE3131',
//             border: 'none',
//             borderRadius: 6,
//             padding: '6px 12px',
//             color: '#fff',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             cursor: 'pointer',
//           }}
//           aria-label="Toggle sidebar"
//           size="sm"
//         >
//           <FontAwesomeIcon icon={faBars} size="lg" />
//         </Button>
//       )}

//       {/* Sidebar */}
//       <div
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: sidebarOpen ? 0 : isMobile ? '-260px' : 0,
//           width: '250px',
//           height: '100vh',
//           backgroundColor: '#fff',
//           borderRight: '1px solid #dee2e6',
//           overflowY: 'auto',
//           zIndex: 1000,
//           padding: '2rem 0.5rem',
//           transition: 'left 0.3s ease-in-out',
//           scrollbarWidth: 'none',
//           msOverflowStyle: 'none',
//         }}
//         className="hide-scrollbar"
//       >
//         <NavbarEditor />
  


//         <div className="px-2 mb-3 d-flex gap-2">
//           <Button
//             size="sm"
//             className="d-flex align-items-center gap-2 fw-semibold"
//             style={{
//               backgroundColor: '#FE3131',
//               border: 'none',
//               borderRadius: '10px',
//               padding: '6px 18px',
//               fontSize: '13px',
//               color: 'white',
//             }}
//           >
//             <i className="bi bi-floppy-fill" style={{ fontSize: '14px' }}></i>
//             Save
//           </Button>

        

//           <Button
//   size="sm"
//   className="fw-semibold"
//   variant="light"
//   style={{
//     border: '2px solid #111',
//     borderRadius: '10px',
//     padding: '6px 18px',
//     fontSize: '13px',
//     color: '#111',
//   }}
//   onClick={() => router.push('/dashboard')} 
// >
//   Exit
// </Button>


//           <Button
//             size="sm"
//             className="fw-semibold"
//             variant="light"
//             style={{
//               border: '2px solid #FE3131',
//               borderRadius: '10px',
//               padding: '6px 14px',
//               fontSize: '13px',
//               color: '#FE3131',
//             }}
//           >
//             Discard
//           </Button>
//         </div>

//         {/* Pages */}
//         <div className="mt-4">
//           <div
//             className="d-flex justify-content-between align-items-center px-3 cursor-pointer"
//             style={{ cursor: 'pointer' }}
//             onClick={() => setPagesOpen(!pagesOpen)}
//           >
//             <small className="text-muted fw-semibold">Pages</small>
//             {pagesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//           </div>

//           <Collapse in={pagesOpen}>
//             <div>
//               <Nav className="flex-column mt-2 px-2">
//                 {reorderMode ? (
//                   <DragDropContext onDragEnd={handleDragEnd}>
//                     <Droppable droppableId="pages-reorder">
//                       {(provided) => (
//                         <div ref={provided.innerRef} {...provided.droppableProps}>
//                           {pagesState.map((p, index) => {
//                             const isActive = currentPath === `/editorpages/page/${p._id}`;
//                             const title = p.title.toLowerCase();

//                             const icon = title.includes("home") ? <Home size={16} className={isActive ? "text-danger" : "text-muted"} />
//                               : title.includes("about") ? <Info size={16} className={isActive ? "text-danger" : "text-muted"} />
//                               : title.includes("service") ? <Briefcase size={16} className={isActive ? "text-danger" : "text-muted"} />
//                               : title.includes("contact") ? <Mail size={16} className={isActive ? "text-danger" : "text-muted"} />
//                               : <FileIcon size={16} className={isActive ? "text-danger" : "text-muted"} />;

//                             return (
//                               <Draggable draggableId={p._id} index={index} key={p._id}>
//                                 {(provided) => (
//                                   <div
//                                     ref={provided.innerRef}
//                                     {...provided.draggableProps}
//                                     {...provided.dragHandleProps}
//                                     className="d-flex align-items-center justify-content-between mb-2"
//                                     style={{
//                                       fontSize: '14px',
//                                       backgroundColor: isActive ? 'rgba(254,49,49,0.1)' : 'transparent',
//                                       borderRadius: '12px',
//                                       padding: '10px 16px',
//                                       fontWeight: isActive ? 600 : 400,
//                                       color: isActive ? '#FE3131' : '#000',
//                                       cursor: 'move',
//                                     }}
//                                   >
//                                     <span className="d-flex align-items-center gap-2">
//                                       {icon}
//                                       {p.title}
//                                     </span>
//                                     <i className="bi bi-grip-vertical text-muted" />
//                                   </div>
//                                 )}
//                               </Draggable>
//                             );
//                           })}
//                           {provided.placeholder}
//                         </div>
//                       )}
//                     </Droppable>
//                   </DragDropContext>
//                 ) : (
//                   pages.map((p) => {
//                     const isActive = currentPath === `/editorpages/page/${p._id}`;
//                     const title = p.title.toLowerCase();

//                     const icon = title.includes("home") ? <Home size={16} className={isActive ? "text-danger" : "text-muted"} />
//                       : title.includes("about") ? <Info size={16} className={isActive ? "text-danger" : "text-muted"} />
//                       : title.includes("service") ? <Briefcase size={16} className={isActive ? "text-danger" : "text-muted"} />
//                       : title.includes("contact") ? <Mail size={16} className={isActive ? "text-danger" : "text-muted"} />
//                       : <FileIcon size={16} className={isActive ? "text-danger" : "text-muted"} />;

//                     return (
//                       <Nav.Link
//                         key={p._id}
//                         href={`/editorpages/page/${p._id}`}
//                         className="d-flex align-items-center justify-content-between mb-2"
//                         style={{
//                           backgroundColor: isActive ? '#FFF5F5' : 'transparent',
//                           borderRadius: '20px',
//                           padding: '10px 16px',
//                           fontSize: '14px',
//                           color: isActive ? '#FE3131' : '#000',
//                           fontWeight: isActive ? 600 : 400,
//                           border: isActive ? '1px solid #FE3131' : 'none',
//                         }}
//                       >
//                         <span className="d-flex align-items-center gap-2">
//                           {icon}
//                           {p.title}
//                         </span>
//                         <i className="bi bi-gear" style={{ color: isActive ? '#FE3131' : '#aaa' }} />
//                       </Nav.Link>
//                     );
//                   })
//                 )}
//                 <Nav.Link
//                   onClick={addPage}
//                   className="d-flex align-items-center justify-content-center gap-2 fw-medium"
//                   style={{
//                     fontSize: '13px',
//                     border: '2px dashed #d9d9d9',
//                     borderRadius: '999px',
//                     padding: '10px 24px',
//                     height: '42px',
//                     width: '210px',
//                     color: '#6c757d',
//                     backgroundColor: 'transparent',
//                     marginBottom: '8px'
//                   }}
//                 >
//                   <i className="bi bi-plus" style={{ fontSize: '14px' }}></i>
//                   + Add New Page
//                 </Nav.Link>

//                 <Nav.Link
//                   href="/editorpages/pages-manager"
//                   className="d-flex align-items-center justify-content-center gap-2 fw-medium"
//                   style={{
//                     fontSize: '13px',
//                     border: '2px dashed #d9d9d9',
//                     borderRadius: '999px',
//                     padding: '10px 26px',
//                     height: '42px',
//                     width: '210px',
//                     color: '#6c757d',
//                     backgroundColor: 'transparent',
//                   }}
//                 >
//                   <i className="bi bi-folder2-open" style={{ fontSize: '16px' }}></i>
//                   All Pages Manager
//                 </Nav.Link>
//               </Nav>
//             </div>
//           </Collapse>
//         </div>

//         <div className="mt-4" style={{ fontSize: '0.85rem' }}>
//           <small className="text-muted px-3 fw-semibold">Layout</small>
//           <Nav className="flex-column mt-2 px-2" style={{ fontSize: '0.8rem' }}>
//             <Nav.Link href="/editorpages/topbar" className={getLinkClass('/editorpages/topbar')}>
//               Header Settings
//             </Nav.Link>
//             <Nav.Link href="/editorpages/contact-editor" className={getLinkClass('/editorpages/contact-editor')}>
//               Footer Settings
//             </Nav.Link>
//           </Nav>
//         </div>

//         <div className="mt-5">
//           <small className="text-muted px-3 fw-bold">Available Sections</small>
//           <Nav className="flex-column mt-2 px-2">
//             {sections.map((item) => {
//               const key = item.href.split("/").pop();
//               const icon = sidebarIcons[key];

//               return (
//                 <Nav.Link
//                   key={item.href}
//                   href={item.href}
//                   className="d-flex align-items-center gap-3 px-3 py-3 mb-2 border"
//                   style={{
//                     backgroundColor:
//                       currentPath === item.href ? "rgba(254, 49, 49, 0.1)" : "#ffffff",
//                     border: `1px solid ${
//                       currentPath === item.href ? "#FE3131" : "#f1f1f1"
//                     }`,
//                     borderRadius: "20px",
//                     width: "220px",
//                     height: "70px",
//                     color: "#000",
//                     textDecoration: "none",
//                   }}
//                 >
//                   <div
//                     className="d-flex align-items-center justify-content-center"
//                     style={{
//                       width: "36px",
//                       height: "36px",
//                       borderRadius: "12px",
//                     }}
//                   >
//                     <FontAwesomeIcon
//                       icon={icon}
//                       style={{
//                         color: "#FE3131",
//                         fontSize: "14px",
//                         width: "14px",
//                         height: "14px",
//                       }}
//                     />
//                   </div>
//                   <div className="d-flex flex-column justify-content-center">
//                     <h6 className="mb-0 fw-bold">{item.title}</h6>
//                     <small className="text-muted">{item.desc}</small>
//                   </div>
//                 </Nav.Link>
//               );
//             })}
//           </Nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div
//         style={{
//           marginLeft: isMobile ? 0 : '250px',
//           width: isMobile ? '100%' : 'calc(100% - 250px)',
//           backgroundColor: '#E5E7EB',
//           minHeight: '100vh',
//           overflowX: 'hidden',
//           transition: 'margin-left 0.3s ease-in-out',
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };

// export default EditorDashboardLayout;






























// // C:\Users\97158\Desktop\project1\dashboard\pages\layouts\EditorDashboardLayout.js
// import React, { useState, useEffect } from "react";
// import { Nav, Button, Collapse } from "react-bootstrap";
// import { useRouter } from "next/router";
// import { SectionsApi } from "../../lib/sectionsApi";
// import {
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// import NavbarEditor from "layouts/navbars/NavbarEditor";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import {
//   Home, Info, Briefcase, Mail, File as FileIcon,
// } from "lucide-react";
// import {
//   faStar,
//   faLayerGroup,
//   faInfoCircle,
//   faCogs,
//   faUsers,
//   faQuoteRight,
//   faBars,
//   faBriefcase,   // added for projects
//   faEye,         // preview icon
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// /* ---------------- Icons for the Available Sections --------------- */
// const sidebarIcons = {
//   heroS: faStar,
//   "why-chooseS": faLayerGroup,
//   aboutS: faInfoCircle,
//   servicesS: faCogs,
//   teamS: faUsers,
//   testimonialS: faQuoteRight,
//   projectS: faBriefcase,   // NEW: Projects editor
//   projectE: faEye,         // NEW: Projects preview
// };

// /* ---------------- Base section items shown in sidebar ------------ */
// const baseSectionItems = [
//   { href: "/editorpages/heroS",         title: "Hero Section",     desc: "Eye-catching banner" },
//   { href: "/editorpages/why-chooseS",   title: "Features Grid",    desc: "Showcase key features" },
//   { href: "/editorpages/aboutS",        title: "About Us",         desc: "Company information" },
//   { href: "/editorpages/servicesS",     title: "Services",         desc: "Service offerings" },
//   { href: "/editorpages/teamS",         title: "Team",             desc: "Meet the team section" },
//   { href: "/editorpages/testimonialS",  title: "Testimonials",     desc: "Customer reviews" },
//   // NEW: Projects (editor + preview)
//   { href: "/editorpages/projectS",      title: "Projects",         desc: "Portfolio grid" },
//   { href: "/editorpages/projectE",      title: "Projects Preview", desc: "Live works preview" },
// ];

// const EditorDashboardLayout = ({ children }) => {
//   const router = useRouter();
//   const currentPath = router.pathname;
//   const userId = defaultUserId;

//   // 1) Resolve effective templateId (URL → backend selection → config fallback)
//   const [effectiveTemplateId, setEffectiveTemplateId] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         const fromUrl =
//           typeof window !== "undefined"
//             ? new URLSearchParams(window.location.search).get("templateId")
//             : null;
//         if (fromUrl) {
//           if (!off) setEffectiveTemplateId(fromUrl.trim());
//           return;
//         }

//         const sel = await api.selectedTemplateForUser(userId).catch(() => null);
//         const t = sel?.data?.templateId;
//         if (t) {
//           if (!off) setEffectiveTemplateId(t);
//           return;
//         }

//         if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
//       } catch {
//         if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
//       }
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId, defaultTemplateId]);

//   // 2) Sidebar/page state
//   const [loading, setLoading] = useState(true);
//   const [all, setAll] = useState([]);
//   const pages = all
//     .filter((s) => s.type === "page")
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   const [pagesState, setPagesState] = useState([]);
//   const [reorderMode, setReorderMode] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(true);

//   // Responsive sidebar
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);
//   const toggleSidebar = () => setSidebarOpen((p) => !p);

//   // 3) Load pages for the **effective template**
//   const load = async () => {
//     if (!effectiveTemplateId) return;
//     try {
//       setLoading(true);
//       const { data } = await SectionsApi.list(userId, effectiveTemplateId);
//       setAll(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error("Failed to fetch sections", e);
//       setAll([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     load();
//   }, [effectiveTemplateId]);

//   useEffect(() => {
//     if (!loading) setPagesState(pages);
//   }, [loading, all]);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setSidebarOpen(!mobile);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const withTpl = (href) => {
//     const q = new URLSearchParams({
//       templateId: String(effectiveTemplateId || ""),
//     }).toString();
//     return `${href}?${q}`;
//   };

//   const getLinkClass = (path) =>
//     `d-flex align-items-center gap-2 nav-link-custom ${
//       currentPath === path ? "active-link" : "text-dark"
//     }`;

//   const handleDragEnd = async (result) => {
//     if (!result.destination) return;
//     const items = Array.from(pagesState);
//     const [moved] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, moved);
//     const reordered = items.map((item, index) => ({ ...item, order: index }));
//     setPagesState(reordered);
//     try {
//       const payload = reordered.map((item, index) => ({
//         _id: item._id,
//         order: index,
//       }));
//       await SectionsApi.reorder(userId, effectiveTemplateId, payload);
//       await load();
//     } catch (err) {
//       console.error("❌ Failed to save order", err);
//     }
//   };

//   const addPage = async () => {
//     const title =
//       typeof window !== "undefined"
//         ? window.prompt("New page title?")
//         : null;
//     if (!title) return;
//     await SectionsApi.create(userId, effectiveTemplateId, {
//       type: "page",
//       title,
//     });
//     await load();
//   };

//   // Build section items with template query
//   const sections = baseSectionItems.map((s) => ({
//     ...s,
//     href: withTpl(s.href),
//   }));

//   return (
//     <div style={{ display: "flex" }}>
//       {/* Mobile hamburger */}
//       {isMobile && (
//         <Button
//           onClick={toggleSidebar}
//           style={{
//             position: "fixed",
//             top: 10,
//             left: 10,
//             zIndex: 1100,
//             backgroundColor: "#FE3131",
//             border: "none",
//             borderRadius: 6,
//             padding: "6px 12px",
//             color: "#fff",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             cursor: "pointer",
//           }}
//           aria-label="Toggle sidebar"
//           size="sm"
//         >
//           <FontAwesomeIcon icon={faBars} size="lg" />
//         </Button>
//       )}

//       {/* Sidebar */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: sidebarOpen ? 0 : isMobile ? "-260px" : 0,
//           width: "250px",
//           height: "100vh",
//           backgroundColor: "#fff",
//           borderRight: "1px solid #dee2e6",
//           overflowY: "auto",
//           zIndex: 1000,
//           padding: "2rem 0.5rem",
//           transition: "left 0.3s ease-in-out",
//           scrollbarWidth: "none",
//           msOverflowStyle: "none",
//         }}
//         className="hide-scrollbar"
//       >
//         <NavbarEditor />

//         <div className="px-2 mb-3 d-flex gap-2">
//           <Button
//             size="sm"
//             className="d-flex align-items-center gap-2 fw-semibold"
//             style={{
//               backgroundColor: "#FE3131",
//               border: "none",
//               borderRadius: "10px",
//               padding: "6px 18px",
//               fontSize: "13px",
//               color: "white",
//             }}
//           >
//             <i className="bi bi-floppy-fill" style={{ fontSize: "14px" }} /> Save
//           </Button>

//           <Button
//             size="sm"
//             className="fw-semibold"
//             variant="light"
//             style={{
//               border: "2px solid #111",
//               borderRadius: "10px",
//               padding: "6px 18px",
//               fontSize: "13px",
//               color: "#111",
//             }}
//             onClick={() => router.push("/dashboard")}
//           >
//             Exit
//           </Button>

//           <Button
//             size="sm"
//             className="fw-semibold"
//             variant="light"
//             style={{
//               border: "2px solid #FE3131",
//               borderRadius: "10px",
//               padding: "6px 14px",
//               fontSize: "13px",
//               color: "#FE3131",
//             }}
//           >
//             Discard
//           </Button>
//         </div>

//         {/* Pages */}
//         <div className="mt-4">
//           <div
//             className="d-flex justify-content-between align-items-center px-3"
//             style={{ cursor: "pointer" }}
//             onClick={() => setPagesOpen(!pagesOpen)}
//           >
//             <small className="text-muted fw-semibold">Pages</small>
//             {pagesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//           </div>

//           <Collapse in={pagesOpen}>
//             <div>
//               <Nav className="flex-column mt-2 px-2">
//                 {reorderMode ? (
//                   <DragDropContext onDragEnd={handleDragEnd}>
//                     <Droppable droppableId="pages-reorder">
//                       {(provided) => (
//                         <div ref={provided.innerRef} {...provided.droppableProps}>
//                           {pagesState.map((p, index) => {
//                             const isActive = router.asPath.startsWith(
//                               `/editorpages/page/${p._id}`
//                             );
//                             const title = (p.title || "").toLowerCase();
//                             const icon = title.includes("home") ? (
//                               <Home
//                                 size={16}
//                                 className={isActive ? "text-danger" : "text-muted"}
//                               />
//                             ) : title.includes("about") ? (
//                               <Info
//                                 size={16}
//                                 className={isActive ? "text-danger" : "text-muted"}
//                               />
//                             ) : title.includes("service") ? (
//                               <Briefcase
//                                 size={16}
//                                 className={isActive ? "text-danger" : "text-muted"}
//                               />
//                             ) : title.includes("contact") ? (
//                               <Mail
//                                 size={16}
//                                 className={isActive ? "text-danger" : "text-muted"}
//                               />
//                             ) : (
//                               <FileIcon
//                                 size={16}
//                                 className={isActive ? "text-danger" : "text-muted"}
//                               />
//                             );

//                             return (
//                               <Draggable
//                                 draggableId={p._id}
//                                 index={index}
//                                 key={p._id}
//                               >
//                                 {(drag) => (
//                                   <div
//                                     ref={drag.innerRef}
//                                     {...drag.draggableProps}
//                                     {...drag.dragHandleProps}
//                                     className="d-flex align-items-center justify-content-between mb-2"
//                                     style={{
//                                       fontSize: "14px",
//                                       backgroundColor: isActive
//                                         ? "rgba(254,49,49,0.1)"
//                                         : "transparent",
//                                       borderRadius: "12px",
//                                       padding: "10px 16px",
//                                       fontWeight: isActive ? 600 : 400,
//                                       color: isActive ? "#FE3131" : "#000",
//                                       cursor: "move",
//                                     }}
//                                   >
//                                     <span className="d-flex align-items-center gap-2">
//                                       {icon}
//                                       {p.title}
//                                     </span>
//                                     <i className="bi bi-grip-vertical text-muted" />
//                                   </div>
//                                 )}
//                               </Draggable>
//                             );
//                           })}
//                           {provided.placeholder}
//                         </div>
//                       )}
//                     </Droppable>
//                   </DragDropContext>
//                 ) : (
//                   pages.map((p) => {
//                     const href = withTpl(`/editorpages/page/${p._id}`);
//                     const isActive = router.asPath.startsWith(
//                       `/editorpages/page/${p._id}`
//                     );
//                     const title = (p.title || "").toLowerCase();
//                     const icon = title.includes("home") ? (
//                       <Home
//                         size={16}
//                         className={isActive ? "text-danger" : "text-muted"}
//                       />
//                     ) : title.includes("about") ? (
//                       <Info
//                         size={16}
//                         className={isActive ? "text-danger" : "text-muted"}
//                       />
//                     ) : title.includes("service") ? (
//                       <Briefcase
//                         size={16}
//                         className={isActive ? "text-danger" : "text-muted"}
//                       />
//                     ) : title.includes("contact") ? (
//                       <Mail
//                         size={16}
//                         className={isActive ? "text-danger" : "text-muted"}
//                       />
//                     ) : (
//                       <FileIcon
//                         size={16}
//                         className={isActive ? "text-danger" : "text-muted"}
//                       />
//                     );

//                     return (
//                       <Nav.Link
//                         key={p._id}
//                         href={href}
//                         className="d-flex align-items-center justify-content-between mb-2"
//                         style={{
//                           backgroundColor: isActive ? "#FFF5F5" : "transparent",
//                           borderRadius: "20px",
//                           padding: "10px 16px",
//                           fontSize: "14px",
//                           color: isActive ? "#FE3131" : "#000",
//                           fontWeight: isActive ? 600 : 400,
//                           border: isActive ? "1px solid #FE3131" : "none",
//                         }}
//                       >
//                         <span className="d-flex align-items-center gap-2">
//                           {icon}
//                           {p.title}
//                         </span>
//                         <i
//                           className="bi bi-gear"
//                           style={{ color: isActive ? "#FE3131" : "#aaa" }}
//                         />
//                       </Nav.Link>
//                     );
//                   })
//                 )}

//                 <Nav.Link
//                   onClick={addPage}
//                   className="d-flex align-items-center justify-content-center gap-2 fw-medium"
//                   style={{
//                     fontSize: "13px",
//                     border: "2px dashed #d9d9d9",
//                     borderRadius: "999px",
//                     padding: "10px 24px",
//                     height: "42px",
//                     width: "210px",
//                     color: "#6c757d",
//                     backgroundColor: "transparent",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <i className="bi bi-plus" style={{ fontSize: "14px" }} />
//                   + Add New Page
//                 </Nav.Link>

//                 <Nav.Link
//                   href={withTpl("/editorpages/pages-manager")}
//                   className="d-flex align-items-center justify-content-center gap-2 fw-medium"
//                   style={{
//                     fontSize: "13px",
//                     border: "2px dashed #d9d9d9",
//                     borderRadius: "999px",
//                     padding: "10px 26px",
//                     height: "42px",
//                     width: "210px",
//                     color: "#6c757d",
//                     backgroundColor: "transparent",
//                   }}
//                 >
//                   <i className="bi bi-folder2-open" style={{ fontSize: "16px" }} />
//                   All Pages Manager
//                 </Nav.Link>
//               </Nav>
//             </div>
//           </Collapse>
//         </div>

//         {/* Layout links */}
//         <div className="mt-4" style={{ fontSize: "0.85rem" }}>
//           <small className="text-muted px-3 fw-semibold">Layout</small>
//           <Nav className="flex-column mt-2 px-2" style={{ fontSize: "0.8rem" }}>
//             <Nav.Link
//               href={withTpl("/editorpages/topbar")}
//               className={getLinkClass("/editorpages/topbar")}
//             >
//               Header Settings
//             </Nav.Link>
//             <Nav.Link
//               href={withTpl("/editorpages/contact-editor")}
//               className={getLinkClass("/editorpages/contact-editor")}
//             >
//               Footer Settings
//             </Nav.Link>
//           </Nav>
//         </div>

//         {/* Available Sections */}
//         <div className="mt-5">
//           <small className="text-muted px-3 fw-bold">Available Sections</small>
//           <Nav className="flex-column mt-2 px-2">
//             {sections.map((item) => {
//               const key = item.href.split("/").pop().split("?")[0];
//               const icon = sidebarIcons[key] || faLayerGroup;
//               const active = router.asPath.startsWith(item.href.split("?")[0]);

//               return (
//                 <Nav.Link
//                   key={item.href}
//                   href={item.href}
//                   className="d-flex align-items-center gap-3 px-3 py-3 mb-2 border"
//                   style={{
//                     backgroundColor: active ? "rgba(254, 49, 49, 0.1)" : "#ffffff",
//                     border: `1px solid ${active ? "#FE3131" : "#f1f1f1"}`,
//                     borderRadius: "20px",
//                     width: "220px",
//                     height: "70px",
//                     color: "#000",
//                     textDecoration: "none",
//                   }}
//                 >
//                   <div
//                     className="d-flex align-items-center justify-content-center"
//                     style={{ width: "36px", height: "36px", borderRadius: "12px" }}
//                   >
//                     <FontAwesomeIcon
//                       icon={icon}
//                       style={{ color: "#FE3131", fontSize: "14px", width: "14px", height: "14px" }}
//                     />
//                   </div>
//                   <div className="d-flex flex-column justify-content-center">
//                     <h6 className="mb-0 fw-bold">{item.title}</h6>
//                     <small className="text-muted">{item.desc}</small>
//                   </div>
//                 </Nav.Link>
//               );
//             })}
//           </Nav>
//         </div>
//       </div>

//       {/* Main content */}
//       <div
//         style={{
//           marginLeft: isMobile ? 0 : "250px",
//           width: isMobile ? "100%" : "calc(100% - 250px)",
//           backgroundColor: "#E5E7EB",
//           minHeight: "100vh",
//           overflowX: "hidden",
//           transition: "margin-left 0.3s ease-in-out",
//         }}
//       >
//         {/* Toggle reorder */}
//         <div className="px-3 pt-3">
//           <label className="form-check form-switch d-inline-flex align-items-center gap-2">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               checked={reorderMode}
//               onChange={() => setReorderMode((v) => !v)}
//             />
//             <span className="small">Reorder Mode</span>
//           </label>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default EditorDashboardLayout;























// works fine sirtemplate
// // C:\Users\97158\Desktop\project1\dashboard\pages\layouts\EditorDashboardLayout.js
import React, { useState, useEffect } from "react";
import { Nav, Button, Collapse } from "react-bootstrap";
import { useRouter } from "next/router";
import { SectionsApi } from "../../lib/sectionsApi";
import {
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

import NavbarEditor from "layouts/navbars/NavbarEditor";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ChevronDown, ChevronUp, Home, Info, Briefcase, Mail, File as FileIcon } from "lucide-react";
import {
  faStar,
  faLayerGroup,
  faInfoCircle,
  faCogs,
  faUsers,
  faQuoteRight,
  faBars,
  faBriefcase,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/* ---------------- Icons for the Available Sections --------------- */
const sidebarIcons = {
  heroS: faStar,
  "why-chooseS": faLayerGroup,
  aboutS: faInfoCircle,
  servicesS: faCogs,
  teamS: faUsers,
  testimonialS: faQuoteRight,
  projectS: faBriefcase, // NEW
  projectE: faEye,       // NEW
};

/* ---------------- Base section items shown in sidebar ------------ */
const baseSectionItems = [
  { href: "/editorpages/heroS",         title: "Hero Section",     desc: "Eye-catching banner" },
  { href: "/editorpages/why-chooseS",   title: "Features Grid",    desc: "Showcase key features" },
  { href: "/editorpages/aboutS",        title: "About Us",         desc: "Company information" },
  { href: "/editorpages/servicesS",     title: "Services",         desc: "Service offerings" },
  { href: "/editorpages/teamS",         title: "Team",             desc: "Meet the team section" },
  { href: "/editorpages/testimonialS",  title: "Testimonials",     desc: "Customer reviews" },
  { href: "/editorpages/projectS",      title: "Projects",         desc: "Portfolio grid" },
  { href: "/editorpages/projectE",      title: "Projects Preview", desc: "Live works preview" },
];

const EditorDashboardLayout = ({ children }) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const userId = defaultUserId;

  /* ---------------- 1) Resolve effective templateId ---------------- */
  const [effectiveTemplateId, setEffectiveTemplateId] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        // 1) URL ?templateId=...
        const fromUrl =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("templateId")
            : null;
        if (fromUrl) {
          if (!off) setEffectiveTemplateId(fromUrl.trim());
          return;
        }
        // 2) Backend selection for this user
        const sel = await api.selectedTemplateForUser(userId).catch(() => null);
        const t = sel?.data?.templateId;
        if (t) {
          if (!off) setEffectiveTemplateId(t);
          return;
        }
        // 3) Config fallback
        if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
      } catch {
        if (!off) setEffectiveTemplateId(defaultTemplateId || "gym-template-1");
      }
    })();
    return () => { off = true; };
  }, [userId, defaultTemplateId]);

  /* ---------------- 2) Sidebar/page state ---------------- */
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const pages = all
    .filter((s) => s.type === "page")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [pagesState, setPagesState] = useState([]);
  const [reorderMode, setReorderMode] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);

  // Responsive sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  /* ---------------- 3) Load pages for the template ---------------- */
  const ensureHomeIfEmpty = async (list) => {
    if (Array.isArray(list) && list.some((r) => r.type === "page")) return list;

    // Auto-create a Home page so the Pages panel is never empty
    try {
      const title = "Home";
      const slug = "home";
      await SectionsApi.create(userId, effectiveTemplateId, {
        type: "page",
        title,
        name: title,
        slug,
        order: 0,
      });
      const { data: fresh } = await SectionsApi.list(userId, effectiveTemplateId);
      return Array.isArray(fresh) ? fresh : [];
    } catch (err) {
      console.error("Failed to auto-create Home page:", err);
      return list || [];
    }
  };

  const load = async () => {
    if (!effectiveTemplateId) return;
    try {
      setLoading(true);
      const { data } = await SectionsApi.list(userId, effectiveTemplateId);
      const list = Array.isArray(data) ? data : [];
      const safe = await ensureHomeIfEmpty(list);
      setAll(safe);
    } catch (e) {
      console.error("Failed to fetch sections", e);
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [effectiveTemplateId]);
  useEffect(() => { if (!loading) setPagesState(pages); }, [loading, all]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const withTpl = (href) => {
    const q = new URLSearchParams({
      templateId: String(effectiveTemplateId || ""),
    }).toString();
    return `${href}?${q}`;
  };

  const getLinkClass = (path) =>
    `d-flex align-items-center gap-2 nav-link-custom ${
      currentPath === path ? "active-link" : "text-dark"
    }`;

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(pagesState);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordered = items.map((item, index) => ({ ...item, order: index }));
    setPagesState(reordered);
    try {
      const payload = reordered.map((item, index) => ({
        _id: item._id,
        order: index,
      }));
      await SectionsApi.reorder(userId, effectiveTemplateId, payload);
      await load();
    } catch (err) {
      console.error("❌ Failed to save order", err);
    }
  };

  const addPage = async () => {
    const title =
      typeof window !== "undefined" ? window.prompt("New page title?") : null;
    if (!title) return;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await SectionsApi.create(userId, effectiveTemplateId, {
      type: "page",
      title,
      name: title,
      slug,
    });
    await load();
  };

  // Build section items with template query
  const sections = baseSectionItems.map((s) => ({ ...s, href: withTpl(s.href) }));

  return (
    <div style={{ display: "flex" }}>
      {/* Mobile hamburger */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1100,
            backgroundColor: "#FE3131",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Toggle sidebar"
          size="sm"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : isMobile ? "-260px" : 0,
          width: "250px",
          height: "100vh",
          backgroundColor: "#fff",
          borderRight: "1px solid #dee2e6",
          overflowY: "auto",
          zIndex: 1000,
          padding: "2rem 0.5rem",
          transition: "left 0.3s ease-in-out",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        <NavbarEditor />

        <div className="px-2 mb-3 d-flex gap-2">
          <Button
            size="sm"
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              backgroundColor: "#FE3131",
              border: "none",
              borderRadius: "10px",
              padding: "6px 18px",
              fontSize: "13px",
              color: "white",
            }}
          >
            <i className="bi bi-floppy-fill" style={{ fontSize: "14px" }} /> Save
          </Button>

          <Button
            size="sm"
            className="fw-semibold"
            variant="light"
            style={{
              border: "2px solid #111",
              borderRadius: "10px",
              padding: "6px 18px",
              fontSize: "13px",
              color: "#111",
            }}
            onClick={() => router.push("/dashboard")}
          >
            Exit
          </Button>

          <Button
            size="sm"
            className="fw-semibold"
            variant="light"
            style={{
              border: "2px solid #FE3131",
              borderRadius: "10px",
              padding: "6px 14px",
              fontSize: "13px",
              color: "#FE3131",
            }}
          >
            Discard
          </Button>
        </div>

        {/* Pages */}
        <div className="mt-4">
          <div
            className="d-flex justify-content-between align-items-center px-3"
            style={{ cursor: "pointer" }}
            onClick={() => setPagesOpen(!pagesOpen)}
          >
            <small className="text-muted fw-semibold">Pages</small>
            {pagesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>

          <Collapse in={pagesOpen}>
            <div>
              <Nav className="flex-column mt-2 px-2">
                {/* Empty-state helper */}
                {!loading && pages.length === 0 && (
                  <div className="px-3 py-2 text-muted small">
                    No pages found for this template.
                    <div className="mt-2">
                      <Button size="sm" variant="outline-secondary" onClick={addPage}>
                        + Create Home Page
                      </Button>
                    </div>
                  </div>
                )}

                {reorderMode && pages.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="pages-reorder">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {pagesState.map((p, index) => {
                            const isActive = router.asPath.startsWith(`/editorpages/page/${p._id}`);
                            const title = (p.title || "").toLowerCase();
                            const icon = title.includes("home") ? (
                              <Home size={16} className={isActive ? "text-danger" : "text-muted"} />
                            ) : title.includes("about") ? (
                              <Info size={16} className={isActive ? "text-danger" : "text-muted"} />
                            ) : title.includes("service") ? (
                              <Briefcase size={16} className={isActive ? "text-danger" : "text-muted"} />
                            ) : title.includes("contact") ? (
                              <Mail size={16} className={isActive ? "text-danger" : "text-muted"} />
                            ) : (
                              <FileIcon size={16} className={isActive ? "text-danger" : "text-muted"} />
                            );

                            return (
                              <Draggable draggableId={p._id} index={index} key={p._id}>
                                {(drag) => (
                                  <div
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    {...drag.dragHandleProps}
                                    className="d-flex align-items-center justify-content-between mb-2"
                                    style={{
                                      fontSize: "14px",
                                      backgroundColor: isActive ? "rgba(254,49,49,0.1)" : "transparent",
                                      borderRadius: "12px",
                                      padding: "10px 16px",
                                      fontWeight: isActive ? 600 : 400,
                                      color: isActive ? "#FE3131" : "#000",
                                      cursor: "move",
                                    }}
                                  >
                                    <span className="d-flex align-items-center gap-2">
                                      {icon}
                                      {p.title}
                                    </span>
                                    <i className="bi bi-grip-vertical text-muted" />
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  pages.map((p) => {
                    const href = withTpl(`/editorpages/page/${p._id}`);
                    const isActive = router.asPath.startsWith(`/editorpages/page/${p._id}`);
                    const title = (p.title || "").toLowerCase();
                    const icon = title.includes("home") ? (
                      <Home size={16} className={isActive ? "text-danger" : "text-muted"} />
                    ) : title.includes("about") ? (
                      <Info size={16} className={isActive ? "text-danger" : "text-muted"} />
                    ) : title.includes("service") ? (
                      <Briefcase size={16} className={isActive ? "text-danger" : "text-muted"} />
                    ) : title.includes("contact") ? (
                      <Mail size={16} className={isActive ? "text-danger" : "text-muted"} />
                    ) : (
                      <FileIcon size={16} className={isActive ? "text-danger" : "text-muted"} />
                    );

                    return (
                      <Nav.Link
                        key={p._id}
                        href={href}
                        className="d-flex align-items-center justify-content-between mb-2"
                        style={{
                          backgroundColor: isActive ? "#FFF5F5" : "transparent",
                          borderRadius: "20px",
                          padding: "10px 16px",
                          fontSize: "14px",
                          color: isActive ? "#FE3131" : "#000",
                          fontWeight: isActive ? 600 : 400,
                          border: isActive ? "1px solid #FE3131" : "none",
                        }}
                      >
                        <span className="d-flex align-items-center gap-2">
                          {icon}
                          {p.title}
                        </span>
                        <i className="bi bi-gear" style={{ color: isActive ? "#FE3131" : "#aaa" }} />
                      </Nav.Link>
                    );
                  })
                )}

                <Nav.Link
                  onClick={addPage}
                  className="d-flex align-items-center justify-content-center gap-2 fw-medium"
                  style={{
                    fontSize: "13px",
                    border: "2px dashed #d9d9d9",
                    borderRadius: "999px",
                    padding: "10px 24px",
                    height: "42px",
                    width: "210px",
                    color: "#6c757d",
                    backgroundColor: "transparent",
                    marginBottom: "8px",
                  }}
                >
                  <i className="bi bi-plus" style={{ fontSize: "14px" }} />
                  + Add New Page
                </Nav.Link>

                <Nav.Link
                  href={withTpl("/editorpages/pages-manager")}
                  className="d-flex align-items-center justify-content-center gap-2 fw-medium"
                  style={{
                    fontSize: "13px",
                    border: "2px dashed #d9d9d9",
                    borderRadius: "999px",
                    padding: "10px 26px",
                    height: "42px",
                    width: "210px",
                    color: "#6c757d",
                    backgroundColor: "transparent",
                  }}
                >
                  <i className="bi bi-folder2-open" style={{ fontSize: "16px" }} />
                  All Pages Manager
                </Nav.Link>
              </Nav>
            </div>
          </Collapse>
        </div>

        {/* Layout links */}
        <div className="mt-4" style={{ fontSize: "0.85rem" }}>
          <small className="text-muted px-3 fw-semibold">Layout</small>
          <Nav className="flex-column mt-2 px-2" style={{ fontSize: "0.8rem" }}>
            <Nav.Link
              href={withTpl("/editorpages/topbar")}
              className={getLinkClass("/editorpages/topbar")}
            >
              Header Settings
            </Nav.Link>
            <Nav.Link
              href={withTpl("/editorpages/contact-editor")}
              className={getLinkClass("/editorpages/contact-editor")}
            >
              Footer Settings
            </Nav.Link>
          </Nav>
        </div>

        {/* Available Sections */}
        <div className="mt-5">
          <small className="text-muted px-3 fw-bold">Available Sections</small>
          <Nav className="flex-column mt-2 px-2">
            {sections.map((item) => {
              const key = item.href.split("/").pop().split("?")[0];
              const icon = sidebarIcons[key] || faLayerGroup;
              const active = router.asPath.startsWith(item.href.split("?")[0]);

              return (
                <Nav.Link
                  key={item.href}
                  href={item.href}
                  className="d-flex align-items-center gap-3 px-3 py-3 mb-2 border"
                  style={{
                    backgroundColor: active ? "rgba(254, 49, 49, 0.1)" : "#ffffff",
                    border: `1px solid ${active ? "#FE3131" : "#f1f1f1"}`,
                    borderRadius: "20px",
                    width: "220px",
                    height: "70px",
                    color: "#000",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px", borderRadius: "12px" }}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      style={{ color: "#FE3131", fontSize: "14px", width: "14px", height: "14px" }}
                    />
                  </div>
                  <div className="d-flex flex-column justify-content-center">
                    <h6 className="mb-0 fw-bold">{item.title}</h6>
                    <small className="text-muted">{item.desc}</small>
                  </div>
                </Nav.Link>
              );
            })}
          </Nav>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          marginLeft: isMobile ? 0 : "250px",
          width: isMobile ? "100%" : "calc(100% - 250px)",
          backgroundColor: "#E5E7EB",
          minHeight: "100vh",
          overflowX: "hidden",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Toggle reorder */}
        <div className="px-3 pt-3">
          <label className="form-check form-switch d-inline-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={reorderMode}
              onChange={() => setReorderMode((v) => !v)}
            />
            <span className="small">Reorder Mode</span>
          </label>
        </div>
        {children}
      </div>
    </div>
  );
};

export default EditorDashboardLayout;

































