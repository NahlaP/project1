


// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\page\[id].js
"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../../layouts/EditorDashboardLayout";
import {
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../../lib/config";
import { SectionsApi } from "../../../lib/sectionsApi";
import { api } from "../../../lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import HeroSectionPreview from "../hero";
import AboutViewer from "../aboutE";
import WhyChooseEditorPage from "../why-chooseE";
import ServicesPagePreview from "../servicesE";
import AppointmentPreview from "../appointmentE";
import TeamPagePreview from "../teamE";
import TestimonialsPagePreview from "../testimonialE";
import ProjectsPreview from "../projectE";
import MarqueePreview from "../marqueeE";
import BrandsPreview from "../brandsE";
import BlogPreview from "../blogE";
import ContactPreview from "../contactE";
import FooterPreview from "../footerE";                 // <-- NEW: Footer preview

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
  faLayerGroup,
  faHandshake,
  faBlog,
  faEnvelope,
  faSitemap,                                           // <-- NEW: icon for footer
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavbarHeader from "layouts/navbars/NavbarHeader";

const HEX24 = /^[0-9a-fA-F]{24}$/;

export default function HomepagePreview() {
  const router = useRouter();
  const { id: rawId } = router.query;

  const [effectiveTemplateId, setEffectiveTemplateId] = useState(null);
  const [resolvedPageId, setResolvedPageId] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [sections, setSections] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  const effectiveUserId = defaultUserId;

  // 1) Decide template, preferring backend selection
  useEffect(() => {
    let off = false;

    async function pickTemplate() {
      try {
        const fromUrl =
          typeof router.query.templateId === "string" &&
          router.query.templateId.trim();
        if (fromUrl) {
          if (!off) setEffectiveTemplateId(fromUrl.trim());
          return;
        }

        const sel = await api.selectedTemplateForUser(effectiveUserId);
        const backendT = sel?.data?.templateId;
        if (backendT) {
          if (!off) setEffectiveTemplateId(backendT);
          return;
        }

        if (!off) setEffectiveTemplateId(defaultTemplateId);
      } catch {
        if (!off) setEffectiveTemplateId(defaultTemplateId);
      }
    }

    pickTemplate();
    return () => {
      off = true;
    };
  }, [router.query.templateId, effectiveUserId]);

  // 2) Resolve which page to open (home by slug/type)
  useEffect(() => {
    if (!router.isReady || !effectiveTemplateId) return;

    const maybeId = typeof rawId === "string" ? rawId : null;

    const goTo = (id) => {
      if (!id) return;
      const q = new URLSearchParams({ templateId: effectiveTemplateId }).toString();
      if (maybeId !== id) router.replace(`/editorpages/page/${id}?${q}`);
      setResolvedPageId(id);
      setResolving(false);
    };

    const resolveHome = async () => {
      try {
        const res = await SectionsApi.list(effectiveUserId, effectiveTemplateId, {
          type: "page",
          slug: "home",
        });
        const list = Array.isArray(res.data) ? res.data : [];
        const home =
          list.find(
            (r) =>
              r?.type === "page" &&
              (((r.slug || "").toLowerCase() === "home") ||
                ((r.title || "").toLowerCase() === "home"))
          ) || list[0];
        goTo(home?._id);
      } catch (err) {
        console.error("Failed to resolve 'home' page:", err);
        setResolving(false);
      }
    };

    const doResolve = async () => {
      if (!maybeId || !HEX24.test(maybeId)) {
        await resolveHome();
        return;
      }
      try {
        const res = await SectionsApi.getOne(maybeId);
        if (res?.data?.type !== "page") {
          await resolveHome();
          return;
        }
        goTo(maybeId);
      } catch {
        await resolveHome();
      }
    };

    setResolving(true);
    doResolve();
  }, [router.isReady, rawId, effectiveTemplateId, effectiveUserId]);

  // 3) Page title
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

  // 4) Load sections for the page
  const loadSections = async (pid, tid) => {
    try {
      const res = await SectionsApi.list(effectiveUserId, tid);
      const assigned = (res.data || []).filter(
        (s) => String(s.parentPageId) === String(pid)
      );
      const deduped = Array.from(new Map(assigned.map((s) => [s._id, s])).values());
      const sorted = deduped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(sorted);
    } catch (err) {
      console.error("Error fetching sections", err);
    }
  };

  useEffect(() => {
    if (!resolvedPageId || !effectiveTemplateId) return;
    loadSections(resolvedPageId, effectiveTemplateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPageId, effectiveTemplateId, effectiveUserId]);

  // 5) Reorder — scoped to THIS PAGE
  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSections(reordered);

    try {
      const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
      await SectionsApi.reorderForPage(
        effectiveUserId,
        effectiveTemplateId,
        resolvedPageId,
        updates
      );
      await loadSections(resolvedPageId, effectiveTemplateId);
    } catch (err) {
      console.error("Failed to save reorder", err);
    }
  };

  // 6) Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this section?")) return;
    try {
      await SectionsApi.remove(id);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // 7) Add
  const handleAddSection = async (type, label) => {
    if (!resolvedPageId) return;
    try {
      const newSection = {
        type,
        title: label,
        parentPageId: resolvedPageId,
        order: sections.length,
      };
      await SectionsApi.create(effectiveUserId, effectiveTemplateId, newSection);
      await loadSections(resolvedPageId, effectiveTemplateId);
    } catch (err) {
      console.error("Failed to add section:", err);
      alert("❌ Error adding section");
    }
  };

  // Add-menu
  const sectionOptions = useMemo(
    () => [
      { type: "hero", label: "Hero" },
      { type: "about", label: "About" },
      { type: "whychooseus", label: "Why Choose Us" },
      { type: "services", label: "Services" },
      { type: "projects", label: "Projects" },
      { type: "marquee", label: "Marquee" },
      { type: "brands", label: "Brands" },
      { type: "blog", label: "Blog" },
      { type: "contact", label: "Contact" },
      { type: "footer", label: "Footer" },             // <-- NEW
      { type: "appointment", label: "Appointment" },
      { type: "team", label: "Team" },
      { type: "testimonials", label: "Testimonials" },
    ],
    []
  );

  // Icons
  const sectionIcons = {
    hero: faStar,
    about: faInfoCircle,
    whychooseus: faThumbsUp,
    services: faBriefcase,
    projects: faLayerGroup,
    marquee: faLayerGroup,
    brands: faHandshake,
    blog: faBlog,
    contact: faEnvelope,
    footer: faSitemap,                                  // <-- NEW
    appointment: faCalendarAlt,
    team: faUsers,
    testimonials: faCommentDots,
  };

  // Descriptions
  const sectionDescriptions = {
    hero: "Main banner with call-to-action",
    about: "Introduce your brand or team",
    whychooseus: "Get your best features",
    services: "What you offer to clients",
    projects: "Portfolio / Works grid",
    marquee: "Scrolling skill/feature tags",
    brands: "Logo carousel / clients",
    blog: "Latest posts / insights",
    contact: "Get in touch with us",
    footer: "Site-wide footer content",                 // <-- NEW
    appointment: "Booking and contact form",
    testimonials: "What clients say",
    team: "Meet the people behind the brand",
  };

  // Preview renderer
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
      case "projects":
        return <ProjectsPreview />;
      case "marquee":
        return <MarqueePreview />;
      case "brands":
        return <BrandsPreview />;
      case "blog":
        return <BlogPreview />;
      case "contact":
        return <ContactPreview />;
      case "footer":                                    // <-- NEW
        return <FooterPreview />;
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

  if (resolving || !effectiveTemplateId) {
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
          backgroundColor: "#F1F1F1",
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
                    onClick={() => handleAddSection(opt.type, opt.label)}
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
                                    icon={sectionIcons[section.type] || faLayerGroup}
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
                                        projects: "/editorpages/projectS",
                                        marquee: "/editorpages/marqueeS",
                                        brands: "/editorpages/brandsS",
                                        blog: "/editorpages/blogS",
                                        contact: "/editorpages/contactS",
                                        footer: "/editorpages/footerS",       // <-- NEW
                                        appointment: "/editorpages/appointmentS",
                                        testimonials: "/editorpages/testimonialS",
                                        team: "/editorpages/teamS",
                                      };
                                      const route =
                                        sectionRoutes[section.type?.toLowerCase()] ||
                                        `/editorpages/section/${section._id}`;
                                      const q = new URLSearchParams({
                                        pageId: String(resolvedPageId),
                                        sectionId: String(section._id),
                                        templateId: String(effectiveTemplateId),
                                      }).toString();
                                      router.push(`${route}?${q}`);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPencil} className="me-2" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => handleDelete(section._id)}
                                    className="text-danger"
                                  >
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
                                      onClick={() => handleAddSection(opt.type, opt.label)}
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
