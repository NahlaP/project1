


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

// export default PageEditor;


import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Container,
  Spinner,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../../lib/config";

const availableSectionTypes = [
  { type: "hero", label: "Hero Section" },
  { type: "about", label: "About Section" },
  { type: "whychooseus", label: "Why Choose Us Section" },
  { type: "services", label: "Services Section" },
  { type: "appointment", label: "Appointment Section" },
  { type: "testimonials", label: "Testimonials Section" },
  { type: "contact", label: "Contact Section" },
  { type: "team", label: "Team Section" },
];

const reorder = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const PageEditor = () => {
  const router = useRouter();
  const { id } = router.query;

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const resPage = await axios.get(`${backendBaseUrl}/api/sections/by-id/${id}`);
        setPage(resPage.data);

        const resSections = await axios.get(
          `${backendBaseUrl}/api/sections?userId=${userId}&templateId=${templateId}`
        );
        const assigned = resSections.data
          .filter((s) => s.parentPageId === id)
          .sort((a, b) => a.order - b.order);
        setSections(assigned);
      } catch (err) {
        console.error("Failed to load page or sections", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCreateAndAssignSections = async () => {
    try {
      for (const type of selectedTypes) {
        const found = availableSectionTypes.find((t) => t.type === type);
        if (!found) continue;

        await axios.post(`${backendBaseUrl}/api/sections/${userId}/${templateId}`, {
          type,
          title: found.label,
          parentPageId: id,
        });
      }
      alert("✅ Sections created & assigned!");
      router.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign sections");
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await axios.delete(`${backendBaseUrl}/api/sections/${sectionId}`);
      setSections(sections.filter((s) => s._id !== sectionId));
    } catch (err) {
      console.error("Failed to delete section", err);
      alert("❌ Failed to delete section");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = reorder(sections, result.source.index, result.destination.index);
    setSections(reordered);
  };

  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = sections.map((s, i) => ({ _id: s._id, order: i }));
      await axios.post(`${backendBaseUrl}/api/sections/reorder/${userId}/${templateId}`, {
        items: updates,
      });
      alert("✅ Order saved!");
    } catch (e) {
      console.error("Failed to save order", e);
      alert("❌ Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const sectionRoutes = {
    hero: "/editorpages/hero",
    about: "/editorpages/aboutS",
    whychooseus: "/editorpages/why-chooseE",
    services: "/editorpages/servicesE",
    appointment: "/editorpages/appointmentE",
    testimonials: "/editorpages/testimonialE",
    contact: "/editorpages/contactE",
    team: "/editorpages/teamE",
  };

  if (loading)
    return (
      <div className="p-5 text-center">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container className="p-4">
      <h3 className="fw-bold mb-4">📄 {page?.title || "Page"}</h3>

      <Form.Group className="mb-4">
        <Form.Label>➕ Select Section Types to Add</Form.Label>
        <Form.Control
          as="select"
          multiple
          value={selectedTypes}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
            setSelectedTypes(selected);
          }}
        >
          {availableSectionTypes.map((s) => (
            <option key={s.type} value={s.type}>
              {s.label}
            </option>
          ))}
        </Form.Control>
        <Button className="mt-2" onClick={handleCreateAndAssignSections}>
          ➕ Add Selected Sections
        </Button>
      </Form.Group>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections-droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable draggableId={section._id} index={index} key={section._id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <Card className="mb-3 p-3 shadow-sm">
                        <Row className="align-items-center">
                          <Col>
                            <h5 className="mb-1">{section.title}</h5>
                            <p className="text-muted mb-2">Type: {section.type}</p>
                          </Col>
                          <Col className="text-end">
                            <Button
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => {
                                const route =
                                  sectionRoutes[section.type.toLowerCase()] ||
                                  `/editorpages/section/${section._id}`;
                                router.push(route);
                              }}
                            >
                              ✏️ Edit
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleDelete(section._id)}>
                              🗑️ Delete
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="text-end">
        <Button variant="success" onClick={persistOrder} disabled={savingOrder}>
          {savingOrder ? "Saving…" : "💾 Save Order"}
        </Button>
      </div>
    </Container>
  );
};

PageEditor.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default PageEditor;
