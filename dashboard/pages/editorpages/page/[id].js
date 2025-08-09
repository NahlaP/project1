
// before backend

// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Button,
//   Card,
//   Container,
//   Spinner,
//   Form,
//   Row,
//   Col
// } from "react-bootstrap";
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";

// const backendUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// const availableSectionTypes = [
//   { type: "hero", label: "Hero Section" },
//   { type: "about", label: "About Section" },
//   { type: "whychooseus", label: "Why Choose Us Section" },
//   { type: "services", label: "Services Section" },
//   { type: "appointment", label: "Appointment Section" },
//   { type: "testimonials", label: "Testimonials Section" },
//   { type: "contact", label: "Contact Section" },
//   { type: "team", label: "Team Section" },
// ];

// const reorder = (list, startIndex, endIndex) => {
//   const result = [...list];
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

// const PageEditor = () => {
//   const router = useRouter();
//   const { id } = router.query;

//   const [page, setPage] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [selectedTypes, setSelectedTypes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [savingOrder, setSavingOrder] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     const fetchData = async () => {
//       try {
//         const resPage = await axios.get(`${backendUrl}/api/sections/by-id/${id}`);
//         setPage(resPage.data);

//         const resSections = await axios.get(`${backendUrl}/api/sections?userId=${userId}&templateId=${templateId}`);
//         const assigned = resSections.data
//           .filter((s) => s.parentPageId === id)
//           .sort((a, b) => a.order - b.order);
//         setSections(assigned);
//       } catch (err) {
//         console.error("Failed to load page or sections", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id]);

//   const handleCreateAndAssignSections = async () => {
//     try {
//       for (const type of selectedTypes) {
//         const found = availableSectionTypes.find((t) => t.type === type);
//         if (!found) continue;

//         await axios.post(`${backendUrl}/api/sections/${userId}/${templateId}`, {
//           type: type,
//           title: found.label,
//           parentPageId: id,
//         });
//       }
//       alert("✅ Sections created & assigned!");
//       router.reload();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to assign sections");
//     }
//   };

//   const handleDelete = async (sectionId) => {
//     if (!window.confirm("Are you sure you want to delete this section?")) return;
//     try {
//       await axios.delete(`${backendUrl}/api/sections/${sectionId}`);
//       setSections(sections.filter((s) => s._id !== sectionId));
//     } catch (err) {
//       console.error("Failed to delete section", err);
//       alert("❌ Failed to delete section");
//     }
//   };

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = reorder(sections, result.source.index, result.destination.index);
//     setSections(reordered);
//   };

//   const persistOrder = async () => {
//     setSavingOrder(true);
//     try {
//       const updates = sections.map((s, i) => ({ _id: s._id, order: i }));
//       await axios.post(`${backendUrl}/api/sections/reorder/${userId}/${templateId}`, { items: updates });
//       alert("✅ Order saved!");
//     } catch (e) {
//       console.error("Failed to save order", e);
//       alert("❌ Failed to save order");
//     } finally {
//       setSavingOrder(false);
//     }
//   };

//   if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

//   const sectionRoutes = {
//     hero: "/editorpages/hero",
//     about: "/editorpages/aboutS",
//     whychooseus: "/editorpages/why-chooseE",
//     services: "/editorpages/servicesE",
//     appointment: "/editorpages/appointmentE",
//     testimonials: "/editorpages/testimonialE",
//     contact: "/editorpages/contactE",
//     team: "/editorpages/teamE",
//   };

//   return (
//     <Container className="p-4">
//       <h3 className="fw-bold mb-4">📄 {page?.title || "Page"}</h3>

//       <Form.Group className="mb-4">
//         <Form.Label>➕ Select Section Types to Add</Form.Label>
//         <Form.Control
//           as="select"
//           multiple
//           value={selectedTypes}
//           onChange={(e) => {
//             const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
//             setSelectedTypes(selected);
//           }}
//         >
//           {availableSectionTypes.map((s) => (
//             <option key={s.type} value={s.type}>{s.label}</option>
//           ))}
//         </Form.Control>
//         <Button className="mt-2" onClick={handleCreateAndAssignSections}>➕ Add Selected Sections</Button>
//       </Form.Group>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <Droppable droppableId="sections-droppable">
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//               {sections.map((section, index) => (
//                 <Draggable draggableId={section._id} index={index} key={section._id}>
//                   {(provided) => (
//                     <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
//                       <Card className="mb-3 p-3 shadow-sm">
//                         <Row className="align-items-center">
//                           <Col>
//                             <h5 className="mb-1">{section.title}</h5>
//                             <p className="text-muted mb-2">Type: {section.type}</p>
//                           </Col>
//                           <Col className="text-end">
//                             <Button
//                               variant="outline-primary"
//                               className="me-2"
//                               onClick={() => {
//                                 const route = sectionRoutes[section.type.toLowerCase()] || `/editorpages/section/${section._id}`;
//                                 router.push(route);
//                               }}
//                             >
//                               ✏️ Edit
//                             </Button>
//                             <Button
//                               variant="outline-danger"
//                               onClick={() => handleDelete(section._id)}
//                             >
//                               🗑️ Delete
//                             </Button>
//                           </Col>
//                         </Row>
//                       </Card>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>

//       <div className="text-end">
//         <Button variant="success" onClick={persistOrder} disabled={savingOrder}>
//           {savingOrder ? 'Saving…' : '💾 Save Order'}
//         </Button>
//       </div>
//     </Container>
//   );
// };

// PageEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// // export default PageEditor;
// after render backend

// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Button,
//   Card,
//   Container,
//   Spinner,
//   Form,
//   Row,
//   Col,
// } from "react-bootstrap";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../../lib/config";
// import NavbarHeader from "layouts/navbars/NavbarHeader";
// const availableSectionTypes = [
//   { type: "hero", label: "Hero Section" },
//   { type: "about", label: "About Section" },
//   { type: "whychooseus", label: "Why Choose Us Section" },
//   { type: "services", label: "Services Section" },
//   { type: "appointment", label: "Appointment Section" },
//   { type: "testimonials", label: "Testimonials Section" },
//   { type: "contact", label: "Contact Section" },
//   { type: "team", label: "Team Section" },
// ];

// const reorder = (list, startIndex, endIndex) => {
//   const result = [...list];
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

// const PageEditor = () => {
//   const router = useRouter();
//   const { id } = router.query;

//   const [page, setPage] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [selectedTypes, setSelectedTypes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [savingOrder, setSavingOrder] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     const fetchData = async () => {
//       try {
//         const resPage = await axios.get(`${backendBaseUrl}/api/sections/by-id/${id}`);
//         setPage(resPage.data);

//         const resSections = await axios.get(
//           `${backendBaseUrl}/api/sections?userId=${userId}&templateId=${templateId}`
//         );
//         const assigned = resSections.data
//           .filter((s) => s.parentPageId === id)
//           .sort((a, b) => a.order - b.order);
//         setSections(assigned);
//       } catch (err) {
//         console.error("Failed to load page or sections", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id]);

//   const handleCreateAndAssignSections = async () => {
//     try {
//       for (const type of selectedTypes) {
//         const found = availableSectionTypes.find((t) => t.type === type);
//         if (!found) continue;

//         await axios.post(`${backendBaseUrl}/api/sections/${userId}/${templateId}`, {
//           type,
//           title: found.label,
//           parentPageId: id,
//         });
//       }
//       alert("✅ Sections created & assigned!");
//       router.reload();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to assign sections");
//     }
//   };

//   const handleDelete = async (sectionId) => {
//     if (!window.confirm("Are you sure you want to delete this section?")) return;
//     try {
//       await axios.delete(`${backendBaseUrl}/api/sections/${sectionId}`);
//       setSections(sections.filter((s) => s._id !== sectionId));
//     } catch (err) {
//       console.error("Failed to delete section", err);
//       alert("❌ Failed to delete section");
//     }
//   };

//   const onDragEnd = (result) => {
//     if (!result.destination) return;
//     const reordered = reorder(sections, result.source.index, result.destination.index);
//     setSections(reordered);
//   };

//   const persistOrder = async () => {
//     setSavingOrder(true);
//     try {
//       const updates = sections.map((s, i) => ({ _id: s._id, order: i }));
//       await axios.post(`${backendBaseUrl}/api/sections/reorder/${userId}/${templateId}`, {
//         items: updates,
//       });
//       alert("✅ Order saved!");
//     } catch (e) {
//       console.error("Failed to save order", e);
//       alert("❌ Failed to save order");
//     } finally {
//       setSavingOrder(false);
//     }
//   };

//   const sectionRoutes = {
//     hero: "/editorpages/hero",
//     about: "/editorpages/aboutS",
//     whychooseus: "/editorpages/why-chooseE",
//     services: "/editorpages/servicesE",
//     appointment: "/editorpages/appointmentE",
//     testimonials: "/editorpages/testimonialE",
//     contact: "/editorpages/contactE",
//     team: "/editorpages/teamE",
//   };

//   if (loading)
//     return (
//       <div className="p-5 text-center">
//         <Spinner animation="border" />
//       </div>
//     );

//   return (
   
//     <Container className="p-4">
    
//       <h3 className="fw-bold mb-4">📄 {page?.title || "Page"}</h3>

//       <Form.Group className="mb-4">
//         <Form.Label>➕ Select Section Types to Add</Form.Label>
//         <Form.Control
//           as="select"
//           multiple
//           value={selectedTypes}
//           onChange={(e) => {
//             const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
//             setSelectedTypes(selected);
//           }}
//         >
//           {availableSectionTypes.map((s) => (
//             <option key={s.type} value={s.type}>
//               {s.label}
//             </option>
//           ))}
//         </Form.Control>
//         <Button className="mt-2" onClick={handleCreateAndAssignSections}>
//           ➕ Add Selected Sections
//         </Button>
//       </Form.Group>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <Droppable droppableId="sections-droppable">
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//               {sections.map((section, index) => (
//                 <Draggable draggableId={section._id} index={index} key={section._id}>
//                   {(provided) => (
//                     <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
//                       <Card className="mb-3 p-3 shadow-sm">
//                         <Row className="align-items-center">
//                           <Col>
//                             <h5 className="mb-1">{section.title}</h5>
//                             <p className="text-muted mb-2">Type: {section.type}</p>
//                           </Col>
//                           <Col className="text-end">
//                             <Button
//                               variant="outline-primary"
//                               className="me-2"
//                               onClick={() => {
//                                 const route =
//                                   sectionRoutes[section.type.toLowerCase()] ||
//                                   `/editorpages/section/${section._id}`;
//                                 router.push(route);
//                               }}
//                             >
//                               ✏️ Edit
//                             </Button>
//                             <Button variant="outline-danger" onClick={() => handleDelete(section._id)}>
//                               🗑️ Delete
//                             </Button>
//                           </Col>
//                         </Row>
//                       </Card>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>

//       <div className="text-end">
//         <Button variant="success" onClick={persistOrder} disabled={savingOrder}>
//           {savingOrder ? "Saving…" : "💾 Save Order"}
//         </Button>
//       </div>
//     </Container>
//   );
// };

// PageEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

// export default PageEditor;
















// "use client";

// import { useEffect, useState } from "react";
// import { Button, Container, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
// import { userId, templateId, backendBaseUrl } from "../../../lib/config";
// import { SectionsApi } from "../../../lib/sectionsApi";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import HeroSectionPreview from "../hero";
// import AboutViewer from "../aboutE";
// import WhyChooseEditorPage from "../why-chooseE";
// import ServicesPagePreview from "../servicesE";
// import AppointmentPreview from "../appointmentE";
// import TeamPagePreview from "../teamE";
// import TestimonialsPagePreview from "../testimonialE";

// import {
//   faPencil,
//   faTrash,
//   faGripVertical,
//   faChevronDown,
//   faStar,
//   faInfoCircle,
//   faThumbsUp,
//   faBriefcase,
//   faCalendarAlt,
//   faUsers,
//   faCommentDots,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import NavbarHeader from "layouts/navbars/NavbarHeader";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const { id: pageId } = router.query;
//   const [sections, setSections] = useState([]);
//   const [dragEnabled, setDragEnabled] = useState(false);
//   const pageBg = "#F1F1F1";
// const [pageTitle, setPageTitle] = useState("");

// useEffect(() => {
//   const fetchPageTitle = async () => {
//     if (!pageId) return;
//     try {
//       const res = await SectionsApi.getOne(pageId);
// setPageTitle(res.data?.title ? `${res.data.title} Editor` : "Page Editor");

//     } catch (err) {
//       console.error("Failed to fetch page title", err);
//     }
//   };
//   fetchPageTitle();
// }, [pageId]);
//   useEffect(() => {
//     const fetchSections = async () => {
//       if (!pageId) return;
//       try {
//         const res = await SectionsApi.list(userId, templateId);
//         const assigned = res.data.filter((s) => s.parentPageId === pageId);
//         const sorted = assigned.sort((a, b) => a.order - b.order);
//         setSections(sorted);
//       } catch (err) {
//         console.error("Error fetching sections", err);
//       }
//     };
//     fetchSections();
//   }, [pageId]);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = Array.from(sections);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     setSections(reordered);

//     try {
//       const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
//       await SectionsApi.reorder(userId, templateId, updates);
//     } catch (err) {
//       console.error("Failed to save reorder", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this section?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setSections(sections.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleAddSection = async (type, label, index) => {
//     try {
//       const newSection = {
//         type,
//         title: label,
//         parentPageId: pageId,
//         order: index + 1,
//       };
//       await SectionsApi.create(userId, templateId, newSection);
//       const res = await SectionsApi.list(userId, templateId);
//       const assigned = res.data.filter((s) => s.parentPageId === pageId);
//       const sorted = assigned.sort((a, b) => a.order - b.order);
//       setSections(sorted);
//     } catch (err) {
//       console.error("Failed to add section:", err);
//       alert("\u274C Error adding section");
//     }
//   };

//   const sectionOptions = [
//     { type: "hero", label: "Hero" },
//     { type: "about", label: "About" },
//     { type: "whychooseus", label: "Why Choose Us" },
//     { type: "services", label: "Services" },
//     { type: "appointment", label: "Appointment" },
//     { type: "team", label: "Team" },
//     { type: "testimonials", label: "Testimonials" },
//   ];

//   const sectionIcons = {
//     hero: faStar,
//     about: faInfoCircle,
//     whychooseus: faThumbsUp,
//     services: faBriefcase,
//     appointment: faCalendarAlt,
//     team: faUsers,
//     testimonials: faCommentDots,
//   };

//   const renderPreview = (section) => {
//     switch (section.type) {
//       case "hero":
//         return <HeroSectionPreview />;
//       case "about":
//         return <AboutViewer />;
//       case "whychooseus":
//         return <WhyChooseEditorPage />;
//       case "services":
//         return <ServicesPagePreview />;
//       case "appointment":
//         return <AppointmentPreview />;
//       case "team":
//         return <TeamPagePreview />;
//       case "testimonials":
//         return <TestimonialsPagePreview />;
//       default:
//         return <div className="text-muted">No preview available.</div>;
//     }
//   };

// const sectionDescriptions = {
//   hero: 'Main banner with call-to-action',
//   about: 'Introduce your brand or team',
//   whychooseus:'Get your best features',
//   services: 'What you offer to clients',
//   appointment: 'Booking and contact form',
//   testimonials: 'What clients say',
//   team: 'Meet the people behind the brand',
//   contact: 'Get in touch with us',
  
// };


//   return (
//     <>
//       {/* <NavbarHeader /> */}
//       <NavbarHeader pageTitle={pageTitle} />


//       <div style={{ backgroundColor: pageBg, minHeight: "100vh", padding: "2rem", paddingTop: "6rem" }}>
//         <Container fluid>
        
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             {/* <div className="form-check form-switch">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 checked={dragEnabled}
//                 onChange={() => setDragEnabled(!dragEnabled)}
//               />
//               <label className="form-check-label">Reorder Mode</label>
//             </div> */}
// <>
//   <style jsx>{`
//     /* Track background when ON */
//     .form-check-input.form-check-input:checked:not(:disabled) {
//       background-color: #ff0000; /* Red when checked */
//       border-color: #ff0000;
//     }
//     /* Track background when OFF */
//     .form-check-input:not(:checked) {
//       background-color: #ff0000; /* Red when unchecked */
//       border-color: #ff0000;
//     }

//     /* Remove blue focus outline */
//     .form-check-input:focus {
//       box-shadow: none !important;
//       outline: none !important;
//     }

//     /* Toggle knob (circle) color */
//     .form-check-input:checked {
//       background-color: #fff; /* knob white */
//     }
//     .form-check-input:not(:checked) {
//       background-color: #fff; /* knob white */
//     }
//   `}</style>

//   <div className="d-flex justify-content-between align-items-center mb-4">
//     <div className="form-check form-switch">
//       <input
//         className="form-check-input"
//         type="checkbox"
//         checked={dragEnabled}
//         onChange={() => setDragEnabled(!dragEnabled)}
//       />
//       <label className="form-check-label">Reorder Mode</label>
//     </div>
//   </div>
// </>

//             <Dropdown>
//               <Dropdown.Toggle
//                 variant="outline-dark"
//                 id="dropdown-add-section"
//                 style={{
//                   borderRadius: "20px",
//                   fontSize: "14px",
//                   padding: "6px 16px",
//                   fontWeight: "500",
//                 }}
//               >
//                 + Add Section
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 {sectionOptions.map((opt) => (
//                   <Dropdown.Item
//                     key={opt.type}
//                     onClick={() => handleAddSection(opt.type, opt.label, sections.length - 1)}
//                   >
//                     {opt.label}
//                   </Dropdown.Item>
//                 ))}
//               </Dropdown.Menu>
//             </Dropdown>
//           </div>

//           <DragDropContext onDragEnd={onDragEnd}>
//             <Droppable droppableId="sections">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef}>
//                   {sections.map((section, index) => (
//                     <Draggable
//                       key={section._id}
//                       draggableId={section._id}
//                       index={index}
//                       isDragDisabled={!dragEnabled}
//                     >
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           className="mb-4 d-flex justify-content-center"
//                         >
                         

//                            <div
//         className="shadow-sm p-4"
//         {...provided.dragHandleProps}  
//         style={{
//           backgroundColor: "#ffffff",
//           width: "100%",
//           maxWidth: "896px",
//           minHeight: dragEnabled ? "160px" : "auto",
//           borderRadius: "20px",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//           transition: "height 0.3s ease",
//           position: "relative",
//           margin: "0 auto",
//           cursor: dragEnabled ? "grab" : "default", // Optional styling
//         }}
//       >
//                             <div className="d-flex justify-content-between align-items-center mb-2">
//                               <div className="d-flex align-items-center gap-2">
                                
                              
//                                 {dragEnabled && (
//   <span
//     {...provided.dragHandleProps}
//     style={{
//       cursor: "grab",
//       fontSize: "1.25rem",
//       color: "#888",
//     }}
//   >
//     {/* DRAG */}
//   </span>
// )}

// <div className="px-3 pt-2">
//   <div className="d-flex align-items-center gap-2">
 
//     {dragEnabled && (
//       <span
//         {...provided.dragHandleProps}
//         style={{
//           cursor: "grab",
//           fontSize: "1.25rem",
//           color: "#888",
//         }}
//       >
//         <FontAwesomeIcon icon={faGripVertical} />
//       </span>
//     )}

 
//     <div className="d-flex align-items-center gap-3">
   
//     <div
//   className="d-flex align-items-center justify-content-center"
//   style={{
//     width: "36px",
//     height: "36px",
//     backgroundColor: "#FFF5F5",
//     borderRadius: "12px",
//   }}
// >
//   <FontAwesomeIcon
//     icon={sectionIcons[section.type]}
//     style={{
//       color: "#FE3131",
//       fontSize: "14px",     // Controls visual size
//       width: "14px",        // Override SVG width
//       height: "14px",       // Override SVG height
//     }}
//   />
// </div>


    
//       <div>
//         <h6 className="mb-0 fw-bold">{section.title}</h6>
//         <small className="text-muted text-capitalize">
//           {sectionDescriptions[section.type] || section.type}
//         </small>
//       </div>
//     </div>
//   </div>
// </div>
//                               </div>

//                               <Dropdown align="end">
//                                 <Dropdown.Toggle
//                                   variant="link"
//                                   bsPrefix="p-0 border-0 bg-transparent"
//                                   style={{ fontSize: "1.2rem", color: "#333" }}
//                                 >
//                                   <FontAwesomeIcon icon={faChevronDown} />
//                                 </Dropdown.Toggle>
//                                 <Dropdown.Menu>
//                                   <Dropdown.Item
//                                     onClick={() => {
//                                       const sectionRoutes = {
//                                         hero: "/editorpages/heroS",
//                                         about: "/editorpages/aboutS",
//                                         whychooseus: "/editorpages/why-chooseS",
//                                         services: "/editorpages/servicesS",
//                                         appointment: "/editorpages/appointmentS",
//                                         testimonials: "/editorpages/testimonialS",
//                                         team: "/editorpages/teamS",
//                                       };
//                                       const route = sectionRoutes[section.type?.toLowerCase()] || `/editorpages/section/${section._id}`;
//                                       router.push(route);
//                                     }}
//                                   >
//                                     <FontAwesomeIcon icon={faPencil} className="me-2" />
//                                     Edit
//                                   </Dropdown.Item>
//                                   <Dropdown.Item
//                                     onClick={() => handleDelete(section._id)}
//                                     className="text-danger"
//                                   >
//                                     <FontAwesomeIcon icon={faTrash} className="me-2" />
//                                     Delete
//                                   </Dropdown.Item>
//                                 </Dropdown.Menu>
//                               </Dropdown>
//                             </div>

//                             <div
//                               style={{
//                                 height: dragEnabled ? "60px" : "auto",
//                                 overflow: dragEnabled ? "hidden" : "visible",
//                                 opacity: dragEnabled ? 0.4 : 1,
//                                 transition: "all 0.3s ease-in-out",
//                               }}
//                             >
//                               {renderPreview(section)}
//                             </div>

//                             <div className="text-center mt-3">
//                               <Dropdown>
//                                 <Dropdown.Toggle
//                                   as="button"
//                                   style={{
//                                     width: "860px",
//                                     height: "40px",
//                                     borderRadius: "20px",
//                                     border: "1px dashed #E1E1E1",
//                                     backgroundColor: "transparent",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     padding: 0,
//                                   }}
//                                 >
//                                   <span
//                                     style={{
//                                       color: "#666666",
//                                       fontWeight: "500",
//                                       fontSize: "14px",
//                                       display: "flex",
//                                       alignItems: "center",
//                                       gap: "6px",
//                                     }}
//                                   >
//                                     <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
//                                     Add Section Below
//                                   </span>
//                                 </Dropdown.Toggle>
//                                 <Dropdown.Menu>
//                                   {sectionOptions.map((opt) => (
//                                     <Dropdown.Item
//                                       key={opt.type}
//                                       onClick={() => handleAddSection(opt.type, opt.label, index)}
//                                     >
//                                       {opt.label}
//                                     </Dropdown.Item>
//                                   ))}
//                                 </Dropdown.Menu>
//                               </Dropdown>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
//         </Container>
//       </div>
//     </>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;






// "use client";

// import { useEffect, useState } from "react";
// import { Button, Container, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
// import { userId, templateId ,backendBaseUrl} from "../../../lib/config";
// import { SectionsApi } from "../../../lib/sectionsApi";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import axios from "axios";
// import HeroSectionPreview from "../hero";
// import AboutViewer from "../aboutE";
// import WhyChooseEditorPage from "../why-chooseE";
// import ServicesPagePreview from "../servicesE";
// import AppointmentPreview from "../appointmentE";
// import TeamPagePreview from "../teamE";
// import TestimonialsPagePreview from "../testimonialE";

// import {
//   faPencil,
//   faTrash,
//   faGripVertical,
//   faChevronDown,
//   faStar,
//   faInfoCircle,
//   faThumbsUp,
//   faBriefcase,
//   faCalendarAlt,
//   faUsers,
//   faCommentDots,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import NavbarHeader from "layouts/navbars/NavbarHeader";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const { id: pageId } = router.query;
//   const [sections, setSections] = useState([]);
//   const [dragEnabled, setDragEnabled] = useState(false);
//   const pageBg = "#F1F1F1";
//   const [pageTitle, setPageTitle] = useState("");

//   useEffect(() => {
//     const fetchPageTitle = async () => {
//       if (!pageId) return;
//       try {
//         const res = await SectionsApi.getOne(pageId);
//         setPageTitle(res.data?.title ? `${res.data.title} Editor` : "Page Editor");
//       } catch (err) {
//         console.error("Failed to fetch page title", err);
//       }
//     };
//     fetchPageTitle();
//   }, [pageId]);

//   useEffect(() => {
//     const fetchSections = async () => {
//       if (!pageId) return;
//       try {
//         const res = await SectionsApi.list(userId, templateId);
//         const assigned = res.data.filter((s) => s.parentPageId === pageId);
//         const sorted = assigned.sort((a, b) => a.order - b.order);
//         setSections(sorted);
//       } catch (err) {
//         console.error("Error fetching sections", err);
//       }
//     };
//     fetchSections();
//   }, [pageId]);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = Array.from(sections);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     setSections(reordered);

//     try {
//       const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
//       await SectionsApi.reorder(userId, templateId, updates);
//     } catch (err) {
//       console.error("Failed to save reorder", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this section?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setSections(sections.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleAddSection = async (type, label, index) => {
//     try {
//       const newSection = {
//         type,
//         title: label,
//         parentPageId: pageId,
//         order: index + 1,
//       };
//       await SectionsApi.create(userId, templateId, newSection);
//       const res = await SectionsApi.list(userId, templateId);
//       const assigned = res.data.filter((s) => s.parentPageId === pageId);
//       const sorted = assigned.sort((a, b) => a.order - b.order);
//       setSections(sorted);
//     } catch (err) {
//       console.error("Failed to add section:", err);
//       alert("\u274C Error adding section");
//     }
//   };

//   const sectionOptions = [
//     { type: "hero", label: "Hero" },
//     { type: "about", label: "About" },
//     { type: "whychooseus", label: "Why Choose Us" },
//     { type: "services", label: "Services" },
//     { type: "appointment", label: "Appointment" },
//     { type: "team", label: "Team" },
//     { type: "testimonials", label: "Testimonials" },
//   ];

//   const sectionIcons = {
//     hero: faStar,
//     about: faInfoCircle,
//     whychooseus: faThumbsUp,
//     services: faBriefcase,
//     appointment: faCalendarAlt,
//     team: faUsers,
//     testimonials: faCommentDots,
//   };

//   const renderPreview = (section) => {
//     switch (section.type) {
//       case "hero":
//         return <HeroSectionPreview />;
//       case "about":
//         return <AboutViewer />;
//       case "whychooseus":
//         return <WhyChooseEditorPage />;
//       case "services":
//         return <ServicesPagePreview />;
//       case "appointment":
//         return <AppointmentPreview />;
//       case "team":
//         return <TeamPagePreview />;
//       case "testimonials":
//         return <TestimonialsPagePreview />;
//       default:
//         return <div className="text-muted">No preview available.</div>;
//     }
//   };

//   const sectionDescriptions = {
//     hero: "Main banner with call-to-action",
//     about: "Introduce your brand or team",
//     whychooseus: "Get your best features",
//     services: "What you offer to clients",
//     appointment: "Booking and contact form",
//     testimonials: "What clients say",
//     team: "Meet the people behind the brand",
//     contact: "Get in touch with us",
//   };

//   return (
//     <>
//       <NavbarHeader pageTitle={pageTitle} />

//       <div
//         style={{
//           backgroundColor: pageBg,
//           minHeight: "100vh",
//           padding: "2rem 1rem",
//           paddingTop: "6rem",
//         }}
//       >
//         <Container fluid>
//           <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
//             <div className="form-check form-switch d-flex align-items-center">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 checked={dragEnabled}
//                 onChange={() => setDragEnabled(!dragEnabled)}
//                 id="dragToggle"
//               />
//               <label
//                 className="form-check-label ms-2"
//                 htmlFor="dragToggle"
//                 style={{ userSelect: "none" }}
//               >
//                 Reorder Mode
//               </label>
//             </div>

//             <Dropdown>
//               <Dropdown.Toggle
//                 variant="outline-dark"
//                 id="dropdown-add-section"
//                 style={{
//                   borderRadius: "20px",
//                   fontSize: "14px",
//                   padding: "6px 16px",
//                   fontWeight: "500",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 + Add Section
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 {sectionOptions.map((opt) => (
//                   <Dropdown.Item
//                     key={opt.type}
//                     onClick={() => handleAddSection(opt.type, opt.label, sections.length - 1)}
//                   >
//                     {opt.label}
//                   </Dropdown.Item>
//                 ))}
//               </Dropdown.Menu>
//             </Dropdown>
//           </div>

//           <DragDropContext onDragEnd={onDragEnd}>
//             <Droppable droppableId="sections">
//               {(provided) => (
//                 <div {...provided.droppableProps} ref={provided.innerRef}>
//                   {sections.map((section, index) => (
//                     <Draggable
//                       key={section._id}
//                       draggableId={section._id}
//                       index={index}
//                       isDragDisabled={!dragEnabled}
//                     >
//                       {(provided) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           className="mb-4 d-flex justify-content-center"
//                         >
//                           <div
//                             className="shadow-sm p-4"
//                             {...provided.dragHandleProps}
//                             style={{
//                               backgroundColor: "#ffffff",
//                               width: "100%",
//                               maxWidth: "896px",
//                               minHeight: dragEnabled ? "160px" : "auto",
//                               borderRadius: "20px",
//                               display: "flex",
//                               flexDirection: "column",
//                               justifyContent: "space-between",
//                               transition: "height 0.3s ease",
//                               position: "relative",
//                               margin: "0 auto",
//                               cursor: dragEnabled ? "grab" : "default",
//                             }}
//                           >
//                             <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
//                               <div className="d-flex align-items-center gap-2 flex-wrap">
//                                 {dragEnabled && (
//                                   <span
//                                     {...provided.dragHandleProps}
//                                     style={{
//                                       cursor: "grab",
//                                       fontSize: "1.25rem",
//                                       color: "#888",
//                                     }}
//                                   >
//                                     <FontAwesomeIcon icon={faGripVertical} />
//                                   </span>
//                                 )}

//                                 <div
//                                   className="d-flex align-items-center justify-content-center"
//                                   style={{
//                                     width: "36px",
//                                     height: "36px",
//                                     backgroundColor: "#FFF5F5",
//                                     borderRadius: "12px",
//                                   }}
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={sectionIcons[section.type]}
//                                     style={{
//                                       color: "#FE3131",
//                                       fontSize: "14px",
//                                       width: "14px",
//                                       height: "14px",
//                                     }}
//                                   />
//                                 </div>

//                                 <div>
//                                   <h6 className="mb-0 fw-bold">{section.title}</h6>
//                                   <small className="text-muted text-capitalize">
//                                     {sectionDescriptions[section.type] || section.type}
//                                   </small>
//                                 </div>
//                               </div>

//                               <Dropdown align="end">
//                                 <Dropdown.Toggle
//                                   variant="link"
//                                   bsPrefix="p-0 border-0 bg-transparent"
//                                   style={{ fontSize: "1.2rem", color: "#333" }}
//                                 >
//                                   <FontAwesomeIcon icon={faChevronDown} />
//                                 </Dropdown.Toggle>
//                                 <Dropdown.Menu>
//                                   <Dropdown.Item
//                                     onClick={() => {
//                                       const sectionRoutes = {
//                                         hero: "/editorpages/heroS",
//                                         about: "/editorpages/aboutS",
//                                         whychooseus: "/editorpages/why-chooseS",
//                                         services: "/editorpages/servicesS",
//                                         appointment: "/editorpages/appointmentS",
//                                         testimonials: "/editorpages/testimonialS",
//                                         team: "/editorpages/teamS",
//                                       };
//                                       const route = sectionRoutes[section.type?.toLowerCase()] || `/editorpages/section/${section._id}`;
//                                       router.push(route);
//                                     }}
//                                   >
//                                     <FontAwesomeIcon icon={faPencil} className="me-2" />
//                                     Edit
//                                   </Dropdown.Item>
//                                   <Dropdown.Item
//                                     onClick={() => handleDelete(section._id)}
//                                     className="text-danger"
//                                   >
//                                     <FontAwesomeIcon icon={faTrash} className="me-2" />
//                                     Delete
//                                   </Dropdown.Item>
//                                 </Dropdown.Menu>
//                               </Dropdown>
//                             </div>

//                             <div
//                               style={{
//                                 height: dragEnabled ? "60px" : "auto",
//                                 overflow: dragEnabled ? "hidden" : "visible",
//                                 opacity: dragEnabled ? 0.4 : 1,
//                                 transition: "all 0.3s ease-in-out",
//                               }}
//                             >
//                               {renderPreview(section)}
//                             </div>

//                             <div className="text-center mt-3">
//                               <Dropdown>
//                                 <Dropdown.Toggle
//                                   as="button"
//                                   style={{
//                                     width: "100%",
//                                     maxWidth: "896px",
//                                     height: "40px",
//                                     borderRadius: "20px",
//                                     border: "1px dashed #E1E1E1",
//                                     backgroundColor: "transparent",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     padding: 0,
//                                   }}
//                                 >
//                                   <span
//                                     style={{
//                                       color: "#666666",
//                                       fontWeight: "500",
//                                       fontSize: "14px",
//                                       display: "flex",
//                                       alignItems: "center",
//                                       gap: "6px",
//                                     }}
//                                   >
//                                     <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
//                                     Add Section Below
//                                   </span>
//                                 </Dropdown.Toggle>
//                                 <Dropdown.Menu>
//                                   {sectionOptions.map((opt) => (
//                                     <Dropdown.Item
//                                       key={opt.type}
//                                       onClick={() => handleAddSection(opt.type, opt.label, index)}
//                                     >
//                                       {opt.label}
//                                     </Dropdown.Item>
//                                   ))}
//                                 </Dropdown.Menu>
//                               </Dropdown>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
//         </Container>
//       </div>
//     </>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;





// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\page\[id].js
"use client";

import { useEffect, useState } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
import { userId, templateId } from "../../../lib/config";
import { SectionsApi } from "../../../lib/sectionsApi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import HeroSectionPreview from "../hero";
import AboutViewer from "../aboutE";
import WhyChooseEditorPage from "../why-chooseE";
import ServicesPagePreview from "../servicesE";
import AppointmentPreview from "../appointmentE";
import TeamPagePreview from "../teamE";
import TestimonialsPagePreview from "../testimonialE";

import {
  faPencil,
  faTrash,
  faGripVertical,
  faChevronDown,
  faStar,
  faInfoCircle,
  faThumbsUp,
  faBriefcase,
  faCalendarAlt,
  faUsers,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import NavbarHeader from "layouts/navbars/NavbarHeader";

export default function HomepagePreview() {
  const router = useRouter();
  const pageId = router.query?.id; // becomes available when router.isReady === true

  const [sections, setSections] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [mounted, setMounted] = useState(false);

  const pageBg = "#F1F1F1";

  // Avoid hydration mismatch on this highly interactive page
  useEffect(() => setMounted(true), []);

  // Fetch page title once router/pageId are ready
  useEffect(() => {
    if (!router.isReady || !pageId) return;
    const fetchPageTitle = async () => {
      try {
        const res = await SectionsApi.getOne(pageId);
        const title = res?.data?.title || "Page Editor";
        setPageTitle(`${title} Editor`);
      } catch (err) {
        console.error("Failed to fetch page title", err);
        setPageTitle("Page Editor");
      }
    };
    fetchPageTitle();
  }, [router.isReady, pageId]);

  // Fetch sections assigned to this page (server-side filtering)
  useEffect(() => {
    if (!router.isReady || !pageId) return;
    const fetchSections = async () => {
      try {
        const res = await SectionsApi.list(userId, templateId, { parentPageId: pageId });
        // Normalize shape in case backend wraps with {data:[]}
        const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const sorted = rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSections(sorted);
      } catch (err) {
        console.error("Error fetching sections", err);
        setSections([]);
      }
    };
    fetchSections();
  }, [router.isReady, pageId]);

  // Drag & drop reorder
  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSections(reordered);

    try {
      const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
      await SectionsApi.reorder(userId, templateId, updates);
    } catch (err) {
      console.error("Failed to save reorder", err);
    }
  };

  // Delete section from this page
  const handleDelete = async (id) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this section?")) return;
    try {
      await SectionsApi.remove(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Add new section to the end of the list
  const handleAddSection = async (type, label, index /* not used */) => {
    if (!pageId) return;
    try {
      await SectionsApi.create(userId, templateId, {
        type,
        title: label,
        parentPageId: pageId,
        order: sections.length, // append at the end
      });

      // Re-fetch only this page's sections
      const res = await SectionsApi.list(userId, templateId, { parentPageId: pageId });
      const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const sorted = rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(sorted);
    } catch (err) {
      console.error("Failed to add section:", err);
      if (typeof window !== "undefined") alert("❌ Error adding section");
    }
  };

  const sectionOptions = [
    { type: "hero", label: "Hero" },
    { type: "about", label: "About" },
    { type: "whychooseus", label: "Why Choose Us" },
    { type: "services", label: "Services" },
    { type: "appointment", label: "Appointment" },
    { type: "team", label: "Team" },
    { type: "testimonials", label: "Testimonials" },
  ];

  const sectionIcons = {
    hero: faStar,
    about: faInfoCircle,
    whychooseus: faThumbsUp,
    services: faBriefcase,
    appointment: faCalendarAlt,
    team: faUsers,
    testimonials: faCommentDots,
  };

  const sectionDescriptions = {
    hero: "Main banner with call-to-action",
    about: "Introduce your brand or team",
    whychooseus: "Get your best features",
    services: "What you offer to clients",
    appointment: "Booking and contact form",
    testimonials: "What clients say",
    team: "Meet the people behind the brand",
    contact: "Get in touch with us",
  };

  const renderPreview = (section) => {
    switch (section.type) {
      case "hero":
        return <HeroSectionPreview />;
      case "about":
        return <AboutViewer />;
      case "whychooseus":
        return <WhyChooseEditorPage />;
      case "services":
        return <ServicesPagePreview />;
      case "appointment":
        return <AppointmentPreview />;
      case "team":
        return <TeamPagePreview />;
      case "testimonials":
        return <TestimonialsPagePreview />;
      default:
        return <div className="text-muted">No preview available.</div>;
    }
  };

  // Don’t render until client + router are ready (prevents hydration errors)
  if (!mounted || !router.isReady || !pageId) {
    return <div style={{ padding: "6rem 1rem" }}>Loading editor…</div>;
  }

  return (
    <>
      <NavbarHeader pageTitle={pageTitle} />

      <div
        style={{
          backgroundColor: pageBg,
          minHeight: "100vh",
          padding: "2rem 1rem",
          paddingTop: "6rem",
        }}
      >
        <Container fluid>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
            <div className="form-check form-switch d-flex align-items-center">
              <input
                className="form-check-input"
                type="checkbox"
                checked={dragEnabled}
                onChange={() => setDragEnabled((v) => !v)}
                id="dragToggle"
              />
              <label className="form-check-label ms-2" htmlFor="dragToggle" style={{ userSelect: "none" }}>
                Reorder Mode
              </label>
            </div>

            <Dropdown>
              <Dropdown.Toggle
                variant="outline-dark"
                id="dropdown-add-section"
                style={{
                  borderRadius: "20px",
                  fontSize: "14px",
                  padding: "6px 16px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Section
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {sectionOptions.map((opt) => (
                  <Dropdown.Item
                    key={opt.type}
                    onClick={() => handleAddSection(opt.type, opt.label, sections.length - 1)}
                  >
                    {opt.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sections.map((section, index) => (
                    <Draggable
                      key={section._id}
                      draggableId={section._id}
                      index={index}
                      isDragDisabled={!dragEnabled}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="mb-4 d-flex justify-content-center"
                        >
                          <div
                            className="shadow-sm p-4"
                            {...provided.dragHandleProps}
                            style={{
                              backgroundColor: "#ffffff",
                              width: "100%",
                              maxWidth: "896px",
                              minHeight: dragEnabled ? "160px" : "auto",
                              borderRadius: "20px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              transition: "height 0.3s ease",
                              position: "relative",
                              margin: "0 auto",
                              cursor: dragEnabled ? "grab" : "default",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                {dragEnabled && (
                                  <span
                                    {...provided.dragHandleProps}
                                    style={{ cursor: "grab", fontSize: "1.25rem", color: "#888" }}
                                  >
                                    <FontAwesomeIcon icon={faGripVertical} />
                                  </span>
                                )}

                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    backgroundColor: "#FFF5F5",
                                    borderRadius: "12px",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={sectionIcons[section.type]}
                                    style={{ color: "#FE3131", fontSize: "14px", width: "14px", height: "14px" }}
                                  />
                                </div>

                                <div>
                                  <h6 className="mb-0 fw-bold">{section.title}</h6>
                                  <small className="text-muted text-capitalize">
                                    {sectionDescriptions[section.type] || section.type}
                                  </small>
                                </div>
                              </div>

                              <Dropdown align="end">
                                <Dropdown.Toggle
                                  variant="link"
                                  bsPrefix="p-0 border-0 bg-transparent"
                                  style={{ fontSize: "1.2rem", color: "#333" }}
                                >
                                  <FontAwesomeIcon icon={faChevronDown} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => {
                                      const sectionRoutes = {
                                        hero: "/editorpages/heroS",
                                        about: "/editorpages/aboutS",
                                        whychooseus: "/editorpages/why-chooseS",
                                        services: "/editorpages/servicesS",
                                        appointment: "/editorpages/appointmentS",
                                        testimonials: "/editorpages/testimonialS",
                                        team: "/editorpages/teamS",
                                      };
                                      const key = (section.type || "").toLowerCase();
                                      const route = sectionRoutes[key] || `/editorpages/section/${section._id}`;
                                      router.push(route);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPencil} className="me-2" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDelete(section._id)} className="text-danger">
                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>

                            <div
                              style={{
                                height: dragEnabled ? "60px" : "auto",
                                overflow: dragEnabled ? "hidden" : "visible",
                                opacity: dragEnabled ? 0.4 : 1,
                                transition: "all 0.3s ease-in-out",
                              }}
                            >
                              {renderPreview(section)}
                            </div>

                            <div className="text-center mt-3">
                              <Dropdown>
                                <Dropdown.Toggle
                                  as="button"
                                  style={{
                                    width: "100%",
                                    maxWidth: "896px",
                                    height: "40px",
                                    borderRadius: "20px",
                                    border: "1px dashed #E1E1E1",
                                    backgroundColor: "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#666666",
                                      fontWeight: "500",
                                      fontSize: "14px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
                                    Add Section Below
                                  </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {sectionOptions.map((opt) => (
                                    <Dropdown.Item
                                      key={opt.type}
                                      onClick={() => handleAddSection(opt.type, opt.label, index)}
                                    >
                                      {opt.label}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Container>
      </div>
    </>
  );
}

// Keep your layout wrapper
HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
