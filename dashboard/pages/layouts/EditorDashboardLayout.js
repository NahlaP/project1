




// // dashboard/pages/layouts/EditorDashboardLayout.js

// import React, { useState, useEffect } from 'react';
// import { Row, Col, Nav, Accordion, Spinner, Button } from 'react-bootstrap';
// import NavbarEditor from 'layouts/navbars/NavbarEditor';
// import { useRouter } from 'next/router';
// import { BsHouseDoor, BsInfoCircle, BsTelephone } from 'react-icons/bs';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import { SectionsApi } from '../../lib/sectionsApi';

// const USER_ID = 'demo-user';
// const TEMPLATE_ID = 'gym-template-1';

// const EditorDashboardLayout = ({ children }) => {
//   const router = useRouter();
//   const currentPath = router.pathname;

//   const [loading, setLoading] = useState(true);
//   const [all, setAll] = useState([]);
//   const [reorderMode, setReorderMode] = useState(false);
//   const [pagesState, setPagesState] = useState([]);

//   const pages = all.filter((s) => s.type === 'page');
//   const dynamicSections = all.filter((s) => s.type !== 'page');

//   const getLinkClass = (path) =>
//     `d-flex align-items-center gap-2 nav-link-custom ${
//       currentPath === path ? 'active-link' : 'text-dark'
//     }`;

//   const load = async () => {
//     try {
//       setLoading(true);
//       const { data } = await SectionsApi.list(USER_ID, TEMPLATE_ID);
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
//       await SectionsApi.reorder(USER_ID, TEMPLATE_ID, payload);
//       await load();
//     } catch (err) {
//       console.error('❌ Failed to save order to backend:', err);
//     }
//   };

//   const addPage = async () => {
//     const title = typeof window !== 'undefined' ? window.prompt('New page title?') : null;
//     if (!title) return;
//     await SectionsApi.create(USER_ID, TEMPLATE_ID, { type: 'page', title });
//     await load();
//   };

//   const addSection = async () => {
//     const title = typeof window !== 'undefined' ? window.prompt('New section title?') : null;
//     if (!title) return;
//     const type = typeof window !== 'undefined'
//       ? window.prompt('Section type (hero, about, services, testimonial, team, contact, whychooseus, appointment, custom)', 'custom')
//       : 'custom';

//     let parentPageId = null;
//     const match = currentPath.match(/\/editorpages\/page\/(.+)/);
//     if (match && match[1]) parentPageId = match[1];

//     await SectionsApi.create(USER_ID, TEMPLATE_ID, { type, title, parentPageId });
//     await load();
//   };

//   return (
//     <>
//       <NavbarEditor />
//       <Row className="g-0">
//         <Col md={2} className="bg-white border-end p-3 shadow-sm" style={{ minHeight: '100vh' }}>
//           <Accordion defaultActiveKey="pages" alwaysOpen>
//             <Accordion.Item eventKey="pages">
//               <Accordion.Header>Pages</Accordion.Header>
//               <Accordion.Body className="px-2 py-1">
//                 <Nav className="flex-column gap-1">
//                   {reorderMode ? (
//                     <DragDropContext onDragEnd={handleDragEnd}>
//                       <Droppable droppableId="pages-reorder">
//                         {(provided) => (
//                           <div ref={provided.innerRef} {...provided.droppableProps}>
//                             {pagesState.map((p, index) => (
//                               <Draggable draggableId={p._id} index={index} key={p._id}>
//                                 {(provided) => (
//                                   <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
//                                     <Nav.Link
//                                       href={`/editorpages/page/${p._id}`}
//                                       className={getLinkClass(`/editorpages/page/${p._id}`)}
//                                     >
//                                       📄 {p.title}
//                                     </Nav.Link>
//                                   </div>
//                                 )}
//                               </Draggable>
//                             ))}
//                             {provided.placeholder}
//                           </div>
//                         )}
//                       </Droppable>
//                     </DragDropContext>
//                   ) : (
//                     pages.map((p) => (
//                       <Nav.Link
//                         key={p._id}
//                         href={`/editorpages/page/${p._id}`}
//                         className={getLinkClass(`/editorpages/page/${p._id}`)}
//                       >
//                         📄 {p.title}
//                       </Nav.Link>
//                     ))
//                   )}

//                   <Nav.Link href="#" onClick={addPage} className="text-primary fw-semibold">
//                     + Add New Page
//                   </Nav.Link>
//                   <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => setReorderMode(!reorderMode)}>
//                     {reorderMode ? '✅ Done Reordering' : '↕️ Reorder Pages'}
//                   </Button>
//                   <Nav.Link href="/editorpages/pages-manager" className={getLinkClass('/editorpages/pages-manager')}>
//                     🗂️ All Pages Manager
//                   </Nav.Link>
//                 </Nav>
//               </Accordion.Body>
//             </Accordion.Item>

//             <Accordion.Item eventKey="header">
//               <Accordion.Header>Header</Accordion.Header>
//               <Accordion.Body className="px-2 py-1">
//                 <Nav className="flex-column gap-1">
//                   <Nav.Link href="/editorpages/topbar" className={getLinkClass('/editorpages/topbar')}>
//                     Logo & Branding
//                   </Nav.Link>
//                   <Nav.Link href="/editorpages/navbar" className={getLinkClass('/editorpages/navbar')}>
//                     Menu Items
//                   </Nav.Link>
//                   <Nav.Link href="#" className="text-dark">
//                     CTA Button
//                   </Nav.Link>
//                   <Nav.Link href="/editorpages/contact-editor" className={getLinkClass('/editorpages/contact-editor')}>
//                     <BsTelephone /> Contact Info
//                   </Nav.Link>
//                 </Nav>
//               </Accordion.Body>
//             </Accordion.Item>

//             <Accordion.Item eventKey="sections">
//               <Accordion.Header>Sections</Accordion.Header>
//               <Accordion.Body className="px-2 py-1">
//                 <Nav className="flex-column gap-1">
//                   {loading ? (
//                     <span className="text-muted small">Loading…</span>
//                   ) : (
//                     dynamicSections.map((s) => (
//                       <Nav.Link
//                         key={s._id}
//                         href={`/editorpages/sections/${s._id}`}
//                         className={getLinkClass(`/editorpages/sections/${s._id}`)}
//                       >
//                         🧩 {s.title || s.type}
//                       </Nav.Link>
//                     ))
//                   )}
//                   <Nav.Link href="#" onClick={addSection} className="text-primary fw-semibold">
//                     + Add Section
//                   </Nav.Link>
//                   <Nav.Link href="/editorpages/sections-manager" className={getLinkClass('/editorpages/sections-manager')}>
//                     🧩 All Sections Manager
//                   </Nav.Link>
//                 </Nav>
//               </Accordion.Body>
//             </Accordion.Item>

//             <Accordion.Item eventKey="footer">
//               <Accordion.Header>Footer</Accordion.Header>
//               <Accordion.Body>
//                 <span className="text-muted">Footer editor coming soon...</span>
//               </Accordion.Body>
//             </Accordion.Item>
//           </Accordion>
//         </Col>

//         <Col md={10} className="p-4 bg-light">
//           {children}
//         </Col>
//       </Row>
//     </>
//   );
// };

// export default EditorDashboardLayout;


// dashboard/pages/layouts/EditorDashboardLayout.js

import React, { useState, useEffect } from 'react';
import { Row, Col, Nav, Accordion, Spinner, Button } from 'react-bootstrap';
import NavbarEditor from 'layouts/navbars/NavbarEditor';
import { useRouter } from 'next/router';
import { BsTelephone } from 'react-icons/bs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SectionsApi } from '../../lib/sectionsApi';

const USER_ID = 'demo-user';
const TEMPLATE_ID = 'gym-template-1';

const EditorDashboardLayout = ({ children }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const [reorderMode, setReorderMode] = useState(false);
  const [pagesState, setPagesState] = useState([]);

  const pages = all.filter((s) => s.type === 'page');

  const getLinkClass = (path) =>
    `d-flex align-items-center gap-2 nav-link-custom ${
      currentPath === path ? 'active-link' : 'text-dark'
    }`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await SectionsApi.list(USER_ID, TEMPLATE_ID);
      setAll(data);
    } catch (e) {
      console.error('Failed to fetch sections', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      setPagesState(pages);
    }
  }, [loading, all]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(pagesState);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    const reorderedWithOrder = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setPagesState(reorderedWithOrder);

    try {
      const payload = reorderedWithOrder.map((item, index) => ({
        _id: item._id,
        order: index,
      }));
      await SectionsApi.reorder(USER_ID, TEMPLATE_ID, payload);
      await load();
    } catch (err) {
      console.error('❌ Failed to save order to backend:', err);
    }
  };

  const addPage = async () => {
    const title = typeof window !== 'undefined' ? window.prompt('New page title?') : null;
    if (!title) return;
    await SectionsApi.create(USER_ID, TEMPLATE_ID, { type: 'page', title });
    await load();
  };

  return (
    <>
      <NavbarEditor />
      <Row className="g-0">
        <Col md={2} className="bg-white border-end p-3 shadow-sm" style={{ minHeight: '100vh' }}>
          <Accordion defaultActiveKey="pages" alwaysOpen>
            <Accordion.Item eventKey="pages">
              <Accordion.Header>Pages</Accordion.Header>
              <Accordion.Body className="px-2 py-1">
                <Nav className="flex-column gap-1">
                  {reorderMode ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="pages-reorder">
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {pagesState.map((p, index) => (
                              <Draggable draggableId={p._id} index={index} key={p._id}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <Nav.Link
                                      href={`/editorpages/page/${p._id}`}
                                      className={getLinkClass(`/editorpages/page/${p._id}`)}
                                    >
                                      📄 {p.title}
                                    </Nav.Link>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    pages.map((p) => (
                      <Nav.Link
                        key={p._id}
                        href={`/editorpages/page/${p._id}`}
                        className={getLinkClass(`/editorpages/page/${p._id}`)}
                      >
                        📄 {p.title}
                      </Nav.Link>
                    ))
                  )}

                  <Nav.Link href="#" onClick={addPage} className="text-primary fw-semibold">
                    + Add New Page
                  </Nav.Link>
                  <Button variant="outline-secondary" size="sm" className="mt-2" onClick={() => setReorderMode(!reorderMode)}>
                    {reorderMode ? '✅ Done Reordering' : '↕️ Reorder Pages'}
                  </Button>
                  <Nav.Link href="/editorpages/pages-manager" className={getLinkClass('/editorpages/pages-manager')}>
                    🗂️ All Pages Manager
                  </Nav.Link>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="header">
              <Accordion.Header>Header</Accordion.Header>
              <Accordion.Body className="px-2 py-1">
                <Nav className="flex-column gap-1">
                  <Nav.Link href="/editorpages/topbar" className={getLinkClass('/editorpages/topbar')}>
                    Logo & Branding
                  </Nav.Link>
                  <Nav.Link href="/editorpages/navbar" className={getLinkClass('/editorpages/navbar')}>
                    Menu Items
                  </Nav.Link>
                  <Nav.Link href="#" className="text-dark">
                    CTA Button
                  </Nav.Link>
                  <Nav.Link href="/editorpages/contact-editor" className={getLinkClass('/editorpages/contact-editor')}>
                    <BsTelephone /> Contact Info
                  </Nav.Link>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="sections">
              <Accordion.Header>Sections</Accordion.Header>
              <Accordion.Body className="px-2 py-1">
                <Nav className="flex-column gap-1">
                  <Nav.Link href="/editorpages/hero" className={getLinkClass('/editorpages/hero')}>
                    Hero Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/aboutE" className={getLinkClass('/editorpages/aboutE')}>
                    About Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/why-chooseE" className={getLinkClass('/editorpages/why-chooseE')}>
                    Why Choose Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/servicesE" className={getLinkClass('/editorpages/servicesE')}>
                    Services Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/appointmentE" className={getLinkClass('/editorpages/appointmentE')}>
                    Appointment Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/teamE" className={getLinkClass('/editorpages/teamE')}>
                    Team Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/testimonialE" className={getLinkClass('/editorpages/testimonialE')}>
                    Testimonial Section
                  </Nav.Link>
                  <Nav.Link href="/editorpages/contactE" className={getLinkClass('/editorpages/contactE')}>
                    <BsTelephone /> Contact Section
                  </Nav.Link>
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>

        <Col md={10} className="p-4 bg-light">
          {children}
        </Col>
      </Row>
    </>
  );
};

export default EditorDashboardLayout;
