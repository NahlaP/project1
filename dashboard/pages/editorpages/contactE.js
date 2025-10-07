


// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// function ContactPagePreview() {
//   const router = useRouter();
//   const [contact, setContact] = useState({
//     address: "",
//     phone: "",
//     email: "",
//     socialLinks: {},
//     businessHours: {},
//   });

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`);
//         const data = await res.json();
//         setContact(data);
//       } catch (err) {
//         console.error("❌ Failed to fetch contact info", err);
//       }
//     })();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">📞 Contact Section Preview</h4>

//       <section className="bg-dark rounded p-4 shadow-sm text-white">
//         <h5 className="fw-bold text-white">Contact / Footer</h5>
//         <div className="row">
//           {/* Office Info */}
//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Our Office</h6>
//             <p>
//               <i className="fa fa-map-marker-alt text-primary me-2"></i>
//               {contact.address || "-"}
//             </p>
//             <p>
//               <i className="fa fa-phone-alt text-primary me-2"></i>
//               {contact.phone || "-"}
//             </p>
//             <p>
//               <i className="fa fa-envelope text-primary me-2"></i>
//               {contact.email || "-"}
//             </p>
//           </div>

//           {/* Business Hours */}
//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Business Hours</h6>
//             <p className="mb-0 text-uppercase">Monday - Friday</p>
//             <p>{contact.businessHours?.mondayToFriday || "-"}</p>
//             <p className="mb-0 text-uppercase">Saturday</p>
//             <p>{contact.businessHours?.saturday || "-"}</p>
//             <p className="mb-0 text-uppercase">Sunday</p>
//             <p>{contact.businessHours?.sunday || "-"}</p>
//           </div>

//           {/* Social Links */}
//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Social</h6>
//             <div className="d-flex">
//               {contact.socialLinks?.twitter && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.twitter}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.facebook && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.facebook}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.youtube && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.youtube}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.linkedin && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.linkedin}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-3">
//           <Button
//             variant="light"
//             onClick={() => router.push("/editorpages/contactS")}
//           >
//             ✏️ Edit Contact
//           </Button>
//         </div>
//       </section>
//     </Container>
//   );
// }

// ContactPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ContactPagePreview;
















// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactE.js
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// /* ---------------- Template resolver (URL ?templateId → backend → default) ---------------- */
// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tpl, setTpl] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl.trim());
//         return;
//       }
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}
//       if (!off) setTpl(defaultTemplateId || "sir-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [router.query.templateId, userId]);

//   return tpl;
// }

// /* ---------------- Field normalization ---------------- */
// const normalizeContact = (data) => ({
//   // SIR (form-style)
//   subtitle: data?.subtitle || "- Contact Us",
//   titleStrong: data?.titleStrong || "Get In",
//   titleLight: data?.titleLight || "Touch",
//   buttonText: data?.buttonText || "Let's Talk",
//   formAction:
//     data?.formAction ||
//     "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
//   // GYM (info-style)
//   address: data?.address || "",
//   phone: data?.phone || "",
//   email: data?.email || "",
//   socialLinks: {
//     twitter: data?.socialLinks?.twitter || "",
//     facebook: data?.socialLinks?.facebook || "",
//     youtube: data?.socialLinks?.youtube || "",
//     linkedin: data?.socialLinks?.linkedin || "",
//   },
//   businessHours: {
//     mondayToFriday: data?.businessHours?.mondayToFriday || "",
//     saturday: data?.businessHours?.saturday || "",
//     sunday: data?.businessHours?.sunday || "",
//   },
// });

// /* ---------------- Compact panel styles ---------------- */
// const panel = {
//   width: "896px",
//   height: "290px",
//   borderRadius: 20,
//   overflow: "hidden",
//   margin: "0 auto",
//   border: "1px solid #EEF1F4",
//   background: "#fff",
// };

// export default function ContactPagePreview() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const templateId = useResolvedTemplateId(userId);

//   const [contact, setContact] = useState(normalizeContact({}));
//   const isSir = useMemo(() => templateId === "sir-template-1", [templateId]);
//   const isGym = useMemo(() => templateId === "gym-template-1", [templateId]);

//   useEffect(() => {
//     if (!templateId) return;
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/contact-info/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(templateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const data = await res.json().catch(() => ({}));
//         setContact(normalizeContact(data || {}));
//       } catch (err) {
//         console.error("❌ Failed to fetch contact info", err);
//         setContact(normalizeContact({}));
//       }
//     })();
//   }, [userId, templateId]);

//   const goEdit = () => {
//     const q = new URLSearchParams({ templateId: String(templateId || "") });
//     router.push(`/editorpages/contactS?${q}`);
//   };

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-3">📞 Contact Section Preview</h4>

//       {/* Compact tile */}
//       <div className="shadow-sm d-flex" style={panel}>
//         {/* SIR (form) */}
//         {isSir && (
//           <>
//             {/* Left: heading */}
//             <div
//               className="d-flex flex-column justify-content-center px-4"
//               style={{ width: "40%", background: "#F8FAFB" }}
//             >
//               <span className="text-muted" style={{ fontSize: 12 }}>
//                 {contact.subtitle}
//               </span>
//               <h4 className="mb-1 fw-bold" style={{ lineHeight: 1.2 }}>
//                 {contact.titleStrong}{" "}
//                 <span className="fw-light">{contact.titleLight}</span>.
//               </h4>
//               <small className="text-muted">Preview only.</small>
//             </div>

//             {/* Right: tidy form */}
//             <div
//               className="d-flex align-items-center justify-content-center p-4"
//               style={{ width: "60%", background: "#FFFFFF" }}
//             >
//               <form
//                 className="w-100"
//                 style={{ maxWidth: 480 }}
//                 onSubmit={(e) => e.preventDefault()}
//                 method="post"
//                 action={contact.formAction}
//               >
//                 <div className="row g-2">
//                   <div className="col-6">
//                     <input
//                       className="form-control form-control-sm"
//                       id="form_name"
//                       type="text"
//                       name="name"
//                       placeholder="Name"
//                       required
//                     />
//                   </div>
//                   <div className="col-6">
//                     <input
//                       className="form-control form-control-sm"
//                       id="form_email"
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       required
//                     />
//                   </div>
//                   <div className="col-12">
//                     <textarea
//                       className="form-control form-control-sm"
//                       id="form_message"
//                       name="message"
//                       placeholder="Message"
//                       rows={3}
//                       required
//                     />
//                   </div>
//                   <div className="col-12 d-flex">
//                     <button
//                       type="submit"
//                       className="btn btn-dark btn-sm ms-auto"
//                       disabled
//                       title="Preview only"
//                     >
//                       {contact.buttonText}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </>
//         )}

//         {/* GYM (info / footer) */}
//         {!isSir && (
//           <>
//             <div
//               className="p-4"
//               style={{ width: "50%", background: "#111827", color: "#fff" }}
//             >
//               <h6 className="text-uppercase opacity-75 mb-2">Our Office</h6>
//               <p className="mb-2">
//                 <i className="fa fa-map-marker-alt me-2 text-primary" />
//                 {contact.address || "—"}
//               </p>
//               <p className="mb-2">
//                 <i className="fa fa-phone-alt me-2 text-primary" />
//                 {contact.phone || "—"}
//               </p>
//               <p className="mb-0">
//                 <i className="fa fa-envelope me-2 text-primary" />
//                 {contact.email || "—"}
//               </p>
//             </div>

//             <div
//               className="p-4"
//               style={{
//                 width: "50%",
//                 background: "#0F172A",
//                 color: "#fff",
//                 borderLeft: "1px solid rgba(255,255,255,.08)",
//               }}
//             >
//               <h6 className="text-uppercase opacity-75 mb-2">Business Hours</h6>
//               <div className="small">
//                 <div className="mb-1">
//                   <span className="text-uppercase opacity-75">Mon–Fri:</span>{" "}
//                   {contact.businessHours?.mondayToFriday || "—"}
//                 </div>
//                 <div className="mb-1">
//                   <span className="text-uppercase opacity-75">Sat:</span>{" "}
//                   {contact.businessHours?.saturday || "—"}
//                 </div>
//                 <div>
//                   <span className="text-uppercase opacity-75">Sun:</span>{" "}
//                   {contact.businessHours?.sunday || "—"}
//                 </div>
//               </div>

//               <div className="d-flex gap-2 mt-3">
//                 {contact.socialLinks?.twitter && (
//                   <a
//                     className="btn btn-light btn-sm"
//                     href={contact.socialLinks.twitter}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <i className="fab fa-twitter" />
//                   </a>
//                 )}
//                 {contact.socialLinks?.facebook && (
//                   <a
//                     className="btn btn-light btn-sm"
//                     href={contact.socialLinks.facebook}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <i className="fab fa-facebook-f" />
//                   </a>
//                 )}
//                 {contact.socialLinks?.youtube && (
//                   <a
//                     className="btn btn-light btn-sm"
//                     href={contact.socialLinks.youtube}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <i className="fab fa-youtube" />
//                   </a>
//                 )}
//                 {contact.socialLinks?.linkedin && (
//                   <a
//                     className="btn btn-light btn-sm"
//                     href={contact.socialLinks.linkedin}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <i className="fab fa-linkedin-in" />
//                   </a>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Edit button row */}
//       <div className="d-flex align-items-center justify-content-between mt-3">
//         <div />
//         <div>
//           <Button variant={isSir ? "outline-dark" : "light"} onClick={goEdit}>
//             ✏️ Edit Contact
//           </Button>
//           <small className="text-muted ms-3">
//             template: <code>{templateId || "…"}</code>
//           </small>
//         </div>
//       </div>
//     </Container>
//   );
// }

// ContactPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );































// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\contactE.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import {
  backendBaseUrl,
  userId as defaultUserId,
  templateId as defaultTemplateId,
} from "../../lib/config";
import { api } from "../../lib/api";

/* ---------------- Template resolver (URL ?templateId → backend → default) ---------------- */
function useResolvedTemplateId(userId) {
  const router = useRouter();
  const [tpl, setTpl] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const fromUrl =
        typeof router.query.templateId === "string" &&
        router.query.templateId.trim();
      if (fromUrl) {
        if (!off) setTpl(fromUrl.trim());
        return;
      }
      try {
        const sel = await api.selectedTemplateForUser(userId);
        const t = sel?.data?.templateId;
        if (t && !off) {
          setTpl(t);
          return;
        }
      } catch {}
      if (!off) setTpl(defaultTemplateId || "sir-template-1");
    })();
    return () => {
      off = true;
    };
  }, [router.query.templateId, userId]);

  return tpl;
}

/* ---------------- Field normalization ---------------- */
const normalizeContact = (data) => ({
  // SIR (form-style)
  subtitle: data?.subtitle || "- Contact Us",
  titleStrong: data?.titleStrong || "Get In",
  titleLight: data?.titleLight || "Touch",
  buttonText: data?.buttonText || "Let's Talk",
  formAction:
    data?.formAction ||
    "https://ui-themez.smartinnovates.net/items/bayone1/contact.php",
  // GYM (info-style)
  address: data?.address || "",
  phone: data?.phone || "",
  email: data?.email || "",
  socialLinks: {
    twitter: data?.socialLinks?.twitter || "",
    facebook: data?.socialLinks?.facebook || "",
    youtube: data?.socialLinks?.youtube || "",
    linkedin: data?.socialLinks?.linkedin || "",
  },
  businessHours: {
    mondayToFriday: data?.businessHours?.mondayToFriday || "",
    saturday: data?.businessHours?.saturday || "",
    sunday: data?.businessHours?.sunday || "",
  },
});

/* ---------------- Shared tile style (match About: height 290, max 896) ---------------- */
const TILE_STYLE = {
  width: "100%",          // fill wrapper; prevents overflow
  maxWidth: "896px",      // same cap as your other previews
  height: "290px",        // match About height
  borderRadius: 20,
  overflow: "hidden",
  backgroundColor: "#f8f9fa",
  border: "1px solid #EEF1F4",
  margin: "0 auto",
  boxSizing: "border-box",
};

function ContactPagePreview() {
  const router = useRouter();
  const userId = defaultUserId;
  const templateId = useResolvedTemplateId(userId);

  const [contact, setContact] = useState(normalizeContact({}));
  const isSir = useMemo(() => templateId === "sir-template-1", [templateId]);
  const isGym = useMemo(() => templateId === "gym-template-1", [templateId]);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/contact-info/${encodeURIComponent(
            userId
          )}/${encodeURIComponent(templateId)}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        setContact(normalizeContact(data || {}));
      } catch (err) {
        console.error("❌ Failed to fetch contact info", err);
        setContact(normalizeContact({}));
      }
    })();
  }, [userId, templateId]);

  const goEdit = () => {
    const q = new URLSearchParams({ templateId: String(templateId || "") });
    router.push(`/editorpages/contactS?${q}`);
  };

  return (
    <Container fluid className="p-0">
      {/* Tile */}
      <div className="d-flex shadow-sm" style={TILE_STYLE}>
        {/* Left: header / meta */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#F7FAFC" }}
        >
          <div className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            - Contact Us
          </div>
          <h4 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>
            {isSir ? (
              <>
                {contact.titleStrong}{" "}
                <span className="fw-normal">{contact.titleLight}</span>.
              </>
            ) : (
              "Contact / Footer"
            )}
          </h4>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Preview only.
          </div>
        </div>

        {/* Right: compact preview */}
        <div
          className="d-flex flex-column justify-content-center px-4 py-3"
          style={{ width: "50%", height: "100%", background: "#fff" }}
        >
          {isSir ? (
            <>
              <div className="d-flex gap-2 mb-2">
                <input
                  placeholder="Name"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240 }}
                  readOnly
                />
                <input
                  placeholder="Email"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 240 }}
                  readOnly
                />
              </div>
              <textarea
                placeholder="Message"
                className="form-control form-control-sm"
                rows={3}
                readOnly
              />
              <div className="text-end mt-2">
                <button className="btn btn-secondary btn-sm" type="button">
                  {contact.buttonText}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="small mb-1">
                <i className="fa fa-map-marker-alt me-2 text-primary" />
                {contact.address || "—"}
              </div>
              <div className="small mb-1">
                <i className="fa fa-phone-alt me-2 text-primary" />
                {contact.phone || "—"}
              </div>
              <div className="small mb-2">
                <i className="fa fa-envelope me-2 text-primary" />
                {contact.email || "—"}
              </div>
              <div className="d-flex gap-2">
                {contact.socialLinks?.twitter && (
                  <span className="badge bg-light text-dark">Twitter</span>
                )}
                {contact.socialLinks?.facebook && (
                  <span className="badge bg-light text-dark">Facebook</span>
                )}
                {contact.socialLinks?.youtube && (
                  <span className="badge bg-light text-dark">YouTube</span>
                )}
                {contact.socialLinks?.linkedin && (
                  <span className="badge bg-light text-dark">LinkedIn</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions under tile */}
      <div className="d-flex align-items-center justify-content-center mt-3">
      
      </div>
    </Container>
  );
}

ContactPagePreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactPagePreview;
