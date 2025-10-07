


// // og
// import { useEffect, useState } from "react";
// import { Button, Container, Table, Spinner } from "react-bootstrap";
// import { useRouter } from "next/router";
// import { SectionsApi } from "../../lib/sectionsApi";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId } from "../../lib/config";

// export default function PagesManager() {
//   const router = useRouter();
//   const [pages, setPages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const { data } = await SectionsApi.list(userId, templateId);
//         setPages(data.filter((s) => s.type === "page"));
//       } catch (err) {
//         console.error("Failed to load pages", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const handleDelete = async (id, title) => {
//     if (title.toLowerCase().includes("home")) {
//       alert("❌ Home page is permanent and cannot be deleted.");
//       return;
//     }
//     if (!window.confirm("Are you sure you want to delete this page?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setPages(pages.filter((p) => p._id !== id));
//     } catch (err) {
//       console.error("Failed to delete page", err);
//       alert("❌ Failed to delete page");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-5 text-center">
//         <Spinner animation="border" />
//       </div>
//     );
//   }

//   return (
//     <Container className="p-4">
//       <h3 className="fw-bold mb-4">🗂️ All Pages Manager</h3>
//       <Table bordered hover>
//         <thead>
//           <tr>
//             <th>Title</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {pages.map((p) => (
//             <tr key={p._id}>
//               <td>{p.title}</td>
//               <td>
//                 <Button
//                   variant="outline-primary"
//                   className="me-2"
//                   onClick={() => router.push(`/editorpages/page/${p._id}`)}
//                 >
//                   ✏️ Edit
//                 </Button>
//                 {!p.title.toLowerCase().includes("home") && (
//                   <Button
//                     variant="outline-danger"
//                     onClick={() => handleDelete(p._id, p.title)}
//                   >
//                     🗑️ Delete
//                   </Button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </Container>
//   );
// }

// PagesManager.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );






// // // dashboard/pages/editorpages/pages-manager.js
// import { useEffect, useMemo, useState } from "react";
// import { Button, Container, Table, Spinner } from "react-bootstrap";
// import { useRouter } from "next/router";
// import { SectionsApi } from "../../lib/sectionsApi";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { api } from "../../lib/api";
// import {
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";

// /* Resolve the effective templateId (URL -> backend selected -> config fallback) */
// function useEffectiveTemplateId(userId) {
//   const [tpl, setTpl] = useState("");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const fromUrl =
//         typeof window !== "undefined"
//           ? new URLSearchParams(window.location.search).get("templateId")
//           : null;
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl.trim());
//         return;
//       }

//       // 2) Backend selection for user
//       try {
//         const sel = await api.selectedTemplateForUser(userId).catch(() => null);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}

//       // 3) Fallback
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [userId]);

//   return tpl;
// }

// export default function PagesManager() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const effectiveTemplateId = useEffectiveTemplateId(userId);

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [seeding, setSeeding] = useState(false);

//   const pages = useMemo(
//     () =>
//       (rows || [])
//         .filter((s) => s?.type === "page")
//         .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//     [rows]
//   );

//   async function load() {
//     if (!effectiveTemplateId) return;
//     try {
//       setLoading(true);
//       const { data } = await SectionsApi.list(userId, effectiveTemplateId);
//       const list = Array.isArray(data) ? data : data?.data || [];
//       setRows(list);
//     } catch (err) {
//       console.error("Failed to load pages", err);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Create a default “Home” page if none exist (protects against reset empties)
//   async function ensureHomeIfEmpty() {
//     if (!effectiveTemplateId || pages.length > 0) return;
//     try {
//       setSeeding(true);
//       await SectionsApi.create(userId, effectiveTemplateId, {
//         type: "page",
//         title: "Home",
//         name: "Home",
//         slug: "home",
//         order: 0,
//       });
//       await load();
//     } catch (err) {
//       console.error("Failed to seed Home page", err);
//     } finally {
//       setSeeding(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, [effectiveTemplateId]);

//   useEffect(() => {
//     if (!loading && effectiveTemplateId && pages.length === 0) {
//       ensureHomeIfEmpty();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [loading, effectiveTemplateId]);

//   const addPage = async () => {
//     const title =
//       typeof window !== "undefined"
//         ? window.prompt("New page title?")
//         : null;
//     if (!title) return;
//     const slug = title
//       .toLowerCase()
//       .trim()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");
//     try {
//       await SectionsApi.create(userId, effectiveTemplateId, {
//         type: "page",
//         title,
//         name: title,
//         slug,
//       });
//       await load();
//     } catch (err) {
//       console.error("Failed to create page", err);
//       alert("❌ Failed to create page");
//     }
//   };

//   const renamePage = async (p) => {
//     const title =
//       typeof window !== "undefined"
//         ? window.prompt("Rename page to:", p.title || "")
//         : null;
//     if (!title || title === p.title) return;
//     try {
//       await SectionsApi.update(p._id, { title, name: title });
//       await load();
//     } catch (err) {
//       console.error("Failed to rename page", err);
//       alert("❌ Failed to rename page");
//     }
//   };

//   const handleDelete = async (p) => {
//     const title = (p.title || "").toLowerCase();
//     if (title.includes("home")) {
//       alert("❌ Home page is permanent and cannot be deleted.");
//       return;
//     }
//     if (!window.confirm(`Delete page "${p.title}"? This cannot be undone.`)) return;
//     try {
//       await SectionsApi.remove(p._id);
//       await load();
//     } catch (err) {
//       console.error("Failed to delete page", err);
//       alert("❌ Failed to delete page");
//     }
//   };

//   const openEditor = (id) => {
//     const q = new URLSearchParams({ templateId: effectiveTemplateId }).toString();
//     router.push(`/editorpages/page/${id}?${q}`);
//   };

//   return (
//     <Container className="p-4">
//       <div className="d-flex align-items-center justify-content-between mb-3">
//         <h3 className="fw-bold mb-0">🗂️ All Pages Manager</h3>
//         <div className="d-flex gap-2">
//           <Button variant="outline-secondary" size="sm" onClick={load}>
//             Refresh
//           </Button>
//           <Button size="sm" onClick={addPage} style={{ background: "#FE3131", border: "none" }}>
//             + Add New Page
//           </Button>
//         </div>
//       </div>

//       {(loading || seeding) && (
//         <div className="d-flex align-items-center gap-2 text-muted mb-3">
//           <Spinner animation="border" size="sm" />
//           <small>{seeding ? "Seeding Home page…" : "Loading pages…"}</small>
//         </div>
//       )}

//       <Table bordered hover responsive>
//         <thead>
//           <tr>
//             <th style={{ width: "60%" }}>Title</th>
//             <th style={{ width: "40%" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {!loading && !seeding && pages.length === 0 ? (
//             <tr>
//               <td colSpan={2} className="text-muted">
//                 No pages yet for this template.
//                 <Button
//                   size="sm"
//                   className="ms-2"
//                   variant="outline-secondary"
//                   onClick={ensureHomeIfEmpty}
//                 >
//                   Create “Home”
//                 </Button>
//               </td>
//             </tr>
//           ) : (
//             pages.map((p) => (
//               <tr key={p._id}>
//                 <td>{p.title || "(untitled)"}</td>
//                 <td className="d-flex gap-2">
//                   <Button variant="light" size="sm" onClick={() => openEditor(p._id)}>
//                     ✏️ Open
//                   </Button>
//                   <Button variant="outline-secondary" size="sm" onClick={() => renamePage(p)}>
//                     Rename
//                   </Button>
//                   {!String(p.title || "").toLowerCase().includes("home") && (
//                     <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p)}>
//                       🗑 Delete
//                     </Button>
//                   )}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>
//     </Container>
//   );
// }

// PagesManager.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
















// works with sir template
// dashboard/pages/editorpages/pages-manager.js
import { useEffect, useMemo, useState } from "react";
import { Button, Container, Table, Spinner, Form } from "react-bootstrap";
import { useRouter } from "next/router";
import { SectionsApi } from "../../lib/sectionsApi";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { api } from "../../lib/api";
import {
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";

/* Resolve the effective templateId (URL -> backend selected -> config fallback) */
function useEffectiveTemplateId(userId) {
  const [tpl, setTpl] = useState("");
  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("templateId")
          : null;
      if (fromUrl) {
        if (!off) setTpl(fromUrl.trim());
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId).catch(() => null);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      if (!off) setTpl(defaultTemplateId || "gym-template-1");
    })();
    return () => {
      off = true;
    };
  }, [userId]);

  return tpl;
}

/* Helpers */
const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function PagesManager() {
  const router = useRouter();
  const userId = defaultUserId;
  const effectiveTemplateId = useEffectiveTemplateId(userId);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState({}); // { [id]: tmpTitle }

  const pages = useMemo(
    () =>
      (rows || [])
        .filter((s) => s?.type === "page")
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [rows]
  );

  async function load() {
    if (!effectiveTemplateId) return;
    try {
      setLoading(true);
      const { data } = await SectionsApi.list(userId, effectiveTemplateId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setRows(list);
    } catch (err) {
      console.error("Failed to load pages", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // Ensure at least one “Home” page exists after reset
  async function ensureHomeIfEmpty() {
    if (!effectiveTemplateId || pages.length > 0) return;
    try {
      setSeeding(true);
      await SectionsApi.create(userId, effectiveTemplateId, {
        type: "page",
        title: "Home",
        name: "Home",
        slug: "home",
        order: 0,
      });
      await load();
    } catch (err) {
      console.error("Failed to seed Home page", err);
      alert("Could not seed a default Home page.");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    load();
  }, [effectiveTemplateId]);

  useEffect(() => {
    if (!loading && effectiveTemplateId && pages.length === 0) {
      ensureHomeIfEmpty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, effectiveTemplateId]);

  const addPage = async () => {
    const title =
      typeof window !== "undefined"
        ? window.prompt("New page title?")
        : null;
    if (!title) return;
    try {
      await SectionsApi.create(userId, effectiveTemplateId, {
        type: "page",
        title,
        name: title,
        slug: slugify(title),
      });
      await load();
    } catch (err) {
      console.error("Failed to create page", err);
      alert("❌ Failed to create page");
    }
  };

  // Robust rename that tries multiple endpoints
  const saveRename = async (p) => {
    const nextTitle = (editing[p._id] ?? "").trim();
    if (!nextTitle || nextTitle === p.title) {
      setEditing((e) => {
        const n = { ...e };
        delete n[p._id];
        return n;
      });
      return;
    }

    const body = { title: nextTitle, name: nextTitle, slug: slugify(nextTitle) };

    try {
      // 1) preferred: your client wrapper
      await SectionsApi.update(p._id, body);
    } catch (e1) {
      try {
        // 2) fallback: generic PATCH by id
        await fetch(`/api/sections/${p._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(async (r) => {
          if (!r.ok) throw new Error(await r.text());
        });
      } catch (e2) {
        try {
          // 3) fallback: PUT with user/template route some backends use
          await fetch(
            `/api/sections/${encodeURIComponent(
              userId
            )}/${encodeURIComponent(effectiveTemplateId)}/${encodeURIComponent(
              p._id
            )}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          ).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
          });
        } catch (e3) {
          console.error("All rename paths failed", { e1, e2, e3 });
          alert("❌ Failed to rename page");
          return;
        }
      }
    }

    setEditing((e) => {
      const n = { ...e };
      delete n[p._id];
      return n;
    });
    await load();
  };

  const handleDelete = async (p) => {
    const title = (p.title || "").toLowerCase();
    if (title.includes("home")) {
      alert("❌ Home page is permanent and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete page "${p.title || "(untitled)"}"?`)) return;
    try {
      await SectionsApi.remove(p._id);
      await load();
    } catch (err) {
      console.error("Failed to delete page", err);
      alert("❌ Failed to delete page");
    }
  };

  const openEditor = (id) => {
    const q = new URLSearchParams({ templateId: effectiveTemplateId }).toString();
    router.push(`/editorpages/page/${id}?${q}`);
  };

  return (
    <Container className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="fw-bold mb-0">🗂️ All Pages Manager</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={load}>
            Refresh
          </Button>
          <Button size="sm" onClick={addPage} style={{ background: "#FE3131", border: "none" }}>
            + Add New Page
          </Button>
        </div>
      </div>

      {(loading || seeding) && (
        <div className="d-flex align-items-center gap-2 text-muted mb-3">
          <Spinner animation="border" size="sm" />
          <small>{seeding ? "Seeding Home page…" : "Loading pages…"}</small>
        </div>
      )}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th style={{ width: "60%" }}>Title</th>
            <th style={{ width: "40%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loading && !seeding && pages.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-muted">
                No pages yet for this template.
                <Button
                  size="sm"
                  className="ms-2"
                  variant="outline-secondary"
                  onClick={ensureHomeIfEmpty}
                >
                  Create “Home”
                </Button>
              </td>
            </tr>
          ) : (
            pages.map((p) => {
              const isEditing = editing[p._id] !== undefined;
              return (
                <tr key={p._id}>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        value={editing[p._id]}
                        onChange={(e) =>
                          setEditing((m) => ({ ...m, [p._id]: e.target.value }))
                        }
                        size="sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(p);
                          if (e.key === "Escape")
                            setEditing((m) => {
                              const n = { ...m };
                              delete n[p._id];
                              return n;
                            });
                        }}
                      />
                    ) : (
                      p.title || "(untitled)"
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="success" size="sm" onClick={() => saveRename(p)}>
                          Save
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            setEditing((m) => {
                              const n = { ...m };
                              delete n[p._id];
                              return n;
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="light" size="sm" onClick={() => openEditor(p._id)}>
                          Open
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            setEditing((m) => ({ ...m, [p._id]: p.title || "" }))
                          }
                        >
                          Rename
                        </Button>
                        {!String(p.title || "").toLowerCase().includes("home") && (
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p)}>
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </Container>
  );
}

PagesManager.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;





























