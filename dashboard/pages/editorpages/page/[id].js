






// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\page\[id].js
"use client";

import { useEffect, useMemo, useState } from "react";
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

const HEX24 = /^[0-9a-fA-F]{24}$/;

export default function HomepagePreview() {
  const router = useRouter();
  const { id: rawId } = router.query;

  const [resolvedPageId, setResolvedPageId] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [sections, setSections] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  const pageBg = "#F1F1F1";

  useEffect(() => {
    if (!router.isReady) return;
    const maybeId = typeof rawId === "string" ? rawId : null;

    const goTo = (id) => {
      if (!id) return;
      if (maybeId !== id) {
        router.replace(`/editorpages/page/${id}`);
      }
      setResolvedPageId(id);
      setResolving(false);
    };

    const resolveHome = async () => {
      try {
        const res = await SectionsApi.list(userId, templateId, { type: "page", slug: "home" });
        const home = Array.isArray(res.data) ? res.data[0] : null;
        goTo(home?._id);
      } catch (err) {
        console.error("Failed to resolve 'home' page:", err);
        setResolving(false);
      }
    };

    const doResolve = async () => {
      // If invalid/missing id, jump to home
      if (!maybeId || !HEX24.test(maybeId)) {
        await resolveHome();
        return;
      }
      try {
        const res = await SectionsApi.getOne(maybeId);
        // If this id isn't a page (e.g., it's a section), jump to home
        if (res?.data?.type !== "page") {
          await resolveHome();
          return;
        }
        goTo(maybeId);
      } catch {
        // 404 or other -> go home
        await resolveHome();
      }
    };

    setResolving(true);
    doResolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, rawId]);

  // Title for the resolved page
  useEffect(() => {
    if (!resolvedPageId) return;
    (async () => {
      try {
        const res = await SectionsApi.getOne(resolvedPageId);
        setPageTitle(res.data?.title ? `${res.data.title} Editor` : "Page Editor");
      } catch (err) {
        console.error("Failed to fetch page title", err);
        setPageTitle("Page Editor");
      }
    })();
  }, [resolvedPageId]);

  // Sections for the resolved page
  useEffect(() => {
    if (!resolvedPageId) return;
    (async () => {
      try {
        const res = await SectionsApi.list(userId, templateId);
        const assigned = (res.data || []).filter(
          (s) => String(s.parentPageId) === String(resolvedPageId)
        );
        // de-dupe (defensive)
        const deduped = Array.from(new Map(assigned.map((s) => [s._id, s])).values());
        const sorted = deduped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSections(sorted);
      } catch (err) {
        console.error("Error fetching sections", err);
      }
    })();
  }, [resolvedPageId]);

  // Drag reorder
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

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this section?")) return;
    try {
      await SectionsApi.remove(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Add
  const handleAddSection = async (type, label, index) => {
    if (!resolvedPageId) return;
    try {
      const newSection = {
        type,
        title: label,
        parentPageId: resolvedPageId,
        order: sections.length,
      };
      await SectionsApi.create(userId, templateId, newSection);

      // Refresh list
      const res = await SectionsApi.list(userId, templateId);
      const assigned = (res.data || []).filter(
        (s) => String(s.parentPageId) === String(resolvedPageId)
      );
      const deduped = Array.from(new Map(assigned.map((s) => [s._id, s])).values());
      const sorted = deduped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(sorted);
    } catch (err) {
      console.error("Failed to add section:", err);
      alert("❌ Error adding section");
    }
  };

  const sectionOptions = useMemo(
    () => [
      { type: "hero", label: "Hero" },
      { type: "about", label: "About" },
      { type: "whychooseus", label: "Why Choose Us" },
      { type: "services", label: "Services" },
      { type: "appointment", label: "Appointment" },
      { type: "team", label: "Team" },
      { type: "testimonials", label: "Testimonials" },
    ],
    []
  );

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

  // Guard: while resolving the page id, show a tiny loader/blank
  if (resolving) {
    return (
      <>
        <NavbarHeader pageTitle="Resolving page…" />
        <div style={{ padding: "6rem 1rem" }}>
          <Container fluid>
            <div className="text-muted">Loading editor…</div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarHeader pageTitle={pageTitle || "Page Editor"} />

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
                onChange={() => setDragEnabled(!dragEnabled)}
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
                                  <span style={{ cursor: "grab", fontSize: "1.25rem", color: "#888" }}>
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
                                      const route =
                                        sectionRoutes[section.type?.toLowerCase()] ||
                                        `/editorpages/section/${section._id}`;
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

HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
