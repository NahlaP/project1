// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId as defaultUserId, s3Bucket, s3Region } from "../../lib/config";
// import { api } from "../../lib/api";

// const API = backendBaseUrl || "";
// const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
// const toAbs = (u) => {
//   if (!u) return "";
//   if (isAbs(u)) return u;
//   if (u.startsWith("/")) return u;
//   if (s3Bucket && s3Region) {
//     return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
//   }
//   return u;
// };

// function useResolvedTemplateId(userId) {
//   const [tid, setTid] = useState("sir-template-1");
//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) setTid(t);
//       } catch {}
//     })();
//     return () => { off = true; };
//   }, [userId]);
//   return tid;
// }

// function ProjectPreviewPage() {
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [items, setItems] = useState([]);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   const apiUrl = useMemo(() => {
//     if (!templateId) return "";
//     return `${API}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(templateId)}`;
//   }, [userId, templateId]);

//   useEffect(() => {
//     if (!apiUrl) return;
//     setLoading(true);
//     (async () => {
//       try {
//         const res = await fetch(`${apiUrl}?_=${Date.now()}`, { cache: "no-store" });
//         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//         const data = await res.json().catch(() => ({}));
//         setItems(Array.isArray(data?.projects) ? data.projects : []);
//       } catch (e) {
//         setErr(e?.message || "Failed to load.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [apiUrl]);

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">Projects — Live Preview</h4>
//           <div className="text-muted">template: <code>{templateId}</code></div>
//         </Col>
//       </Row>

//       {err && (
//         <Row className="mt-3">
//           <Col><Alert variant="danger" className="mb-0">{err}</Alert></Col>
//         </Row>
//       )}

//       {loading ? (
//         <div className="mt-5 d-flex align-items-center gap-2">
//           <Spinner size="sm" /> <span>Loading…</span>
//         </div>
//       ) : (
//         <section className="works thecontainer ontop sub-bg mt-4">
//           {items.map((it, idx) => (
//             <div className="panel mb-3" key={idx}>
//               <div className="item">
//                 <div className="img" style={{ overflow: "hidden", borderRadius: 8 }}>
//                   {it.imageUrl ? (
//                     <img src={toAbs(it.imageUrl)} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
//                   ) : (
//                     <div style={{ height: 220, background: "#111" }} />
//                   )}
//                 </div>
//                 <div className="cont d-flex align-items-center p-3" style={{ background: "#0e0e0e", borderRadius: 8 }}>
//                   <div>
//                     <span className="d-block opacity-75">{it.tag || "Tag"}</span>
//                     <h5 className="mb-0">{it.title || "Title"}</h5>
//                   </div>
//                   <div className="ms-auto">
//                     <h6 className="mb-0">{it.year || ""}</h6>
//                   </div>
//                 </div>
//                 <a
//                   href={it.href || "#"}
//                   className="link-overlay"
//                   target="_blank"
//                   rel="noreferrer"
//                   aria-label="Open project"
//                   style={{ display: "block" }}
//                 />
//               </div>
//             </div>
//           ))}
//           {!items.length && (
//             <div className="text-muted">No projects yet. Go to “Projects” editor and add some.</div>
//           )}
//         </section>
//       )}
//     </Container>
//   );
// }

// ProjectPreviewPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ProjectPreviewPage;









"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import {
  backendBaseUrl,
  userId as defaultUserId,
  s3Bucket,
  s3Region,
} from "../../lib/config";
import { api } from "../../lib/api";

const API = backendBaseUrl || "";
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
const toAbs = (u) => {
  if (!u) return "";
  if (isAbs(u)) return u;
  if (u.startsWith("/")) return u;
  if (s3Bucket && s3Region) {
    return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${u.replace(/^\/+/, "")}`;
  }
  return u;
};

// Resolve templateId from user or backend
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tid, setTid] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTid(fromUrl);
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) setTid(t);
      } catch {}
      if (!off) setTid("sir-template-1"); // fallback
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tid;
}

export default function ProjectsPreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [projects, setProjects] = useState([]);

  const apiUrl = useMemo(() => {
    if (!templateId) return "";
    return `${API}/api/projects/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  useEffect(() => {
    if (!apiUrl) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}?_=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        setProjects(Array.isArray(data?.projects) ? data.projects : []);
      } catch (err) {
        console.error("❌ Failed to fetch projects", err);
      }
    })();
  }, [apiUrl]);

  // Jump to editor
  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/projectS?${q}`);
  };

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Left side: project image */}
      <div style={{ width: "50%", height: "100%" }}>
        {projects.length > 0 && projects[0].imageUrl ? (
          <img
            src={toAbs(projects[0].imageUrl)}
            alt={projects[0].title || "Project"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
            No Project Image
          </div>
        )}
      </div>

      {/* Right side: project details */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        {projects.length > 0 ? (
          <>
            <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
              {projects[0].tag || "Project"}
            </div>
            <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
              {projects[0].title || "Project Title"}
            </h4>
            {projects[0].year && (
              <div className="mb-2 text-muted">📅 {projects[0].year}</div>
            )}
            <p className="mb-2" style={{ fontSize: "0.95rem" }}>
              {projects[0].description || "Short project description..."}
            </p>
            {projects[0].href && (
              <a
                href={projects[0].href}
                target="_blank"
                rel="noreferrer"
                className="text-primary"
              >
                View Project →
              </a>
            )}
          </>
        ) : (
          <div className="text-muted">No projects added yet.</div>
        )}

        <div className="d-flex align-items-center gap-3 mt-3">
          <Button size="sm" variant="outline-dark" onClick={goEdit}>
            ✏️ Edit Projects Section
          </Button>
          <small className="text-muted">
            template: <code>{templateId || "…"}</code>
          </small>
        </div>
      </div>
    </div>
  );
}
