




// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\appointmentE.js
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { backendBaseUrl, userId as defaultUserId, templateId as defaultTemplateId } from "../../lib/config";
// import { api } from "../../lib/api";

// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tpl, setTpl] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl);
//         return;
//       }
//       // 2) Backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
//         const t = sel?.data?.templateId;
//         if (t && !off) {
//           setTpl(t);
//           return;
//         }
//       } catch {}
//       // 3) Fallback to legacy default (if present)
//       if (!off) setTpl(defaultTemplateId || "gym-template-1");
//     })();
//     return () => {
//       off = true;
//     };
//   }, [router.query.templateId, userId]);

//   return tpl;
// }

// export default function AppointmentPreview() {
//   const router = useRouter();
//   const userId = defaultUserId;
//   const effectiveTemplateId = useResolvedTemplateId(userId);

//   const [appointment, setAppointment] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",     // S3 key
//     backgroundImageUrl: "",  // presigned from backend if available
//   });

//   const [previewUrl, setPreviewUrl] = useState(""); // CSS bg image
//   const [loading, setLoading] = useState(true);

//   // Helper: presign any S3 key via backend
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json().catch(() => ({}));
//       return json?.url || json?.signedUrl || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   // Load when the effective template changes
//   useEffect(() => {
//     if (!effectiveTemplateId) return;
//     let abort = false;

//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(effectiveTemplateId)}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const result = await res.json();
//         if (abort) return;

//         setAppointment(result || {});
//         if (result?.backgroundImageUrl) {
//           setPreviewUrl(result.backgroundImageUrl);
//         } else if (result?.backgroundImage) {
//           const url = await getSignedUrlFor(result.backgroundImage);
//           if (!abort) setPreviewUrl(url || "");
//         } else {
//           setPreviewUrl("");
//         }
//       } catch (err) {
//         if (!abort) console.error("❌ Failed to fetch appointment", err);
//       } finally {
//         if (!abort) setLoading(false);
//       }
//     })();

//     return () => {
//       abort = true;
//     };
//   }, [userId, effectiveTemplateId]);

//   // If the stored key/url changes later, refresh preview
//   useEffect(() => {
//     (async () => {
//       if (appointment?.backgroundImageUrl) {
//         setPreviewUrl(appointment.backgroundImageUrl);
//         return;
//       }
//       if (appointment?.backgroundImage) {
//         const url = await getSignedUrlFor(appointment.backgroundImage);
//         setPreviewUrl(url || "");
//       }
//     })();
//   }, [appointment?.backgroundImage, appointment?.backgroundImageUrl]);

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//       }}
//     >
//       {/* Left: Background image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundColor: "#f0f0f0",
//         }}
//         aria-label="Appointment background"
//       />

//       {/* Right: Content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <div className="text-muted small mb-1">
//           template: <code>{effectiveTemplateId || "…"}</code>
//         </div>
//         <h5 className="fw-bold text-uppercase mb-2">
//           {appointment.title || (loading ? "Loading…" : "Appointment")}
//         </h5>
//         <p className="mb-2">{appointment.subtitle || (!loading && "Subtitle goes here...")}</p>
//         <p className="mb-1">
//           <strong>📍 Address:</strong>{" "}
//           {appointment.officeAddress || (!loading && "Not specified")}
//         </p>
//         <p className="mb-3">
//           <strong>⏰ Time:</strong>{" "}
//           {appointment.officeTime || (!loading && "Not specified")}
//         </p>
//       </div>
//     </div>
//   );
// }

















// // C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\appointmentE.js
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   backendBaseUrl,
//   userId as defaultUserId,
//   templateId as defaultTemplateId,
// } from "../../lib/config";
// import { api } from "../../lib/api";

// function useResolvedTemplateId(userId) {
//   const router = useRouter();
//   const [tpl, setTpl] = useState("");

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       // 1) URL ?templateId=
//       const fromUrl =
//         typeof router.query.templateId === "string" &&
//         router.query.templateId.trim();
//       if (fromUrl) {
//         if (!off) setTpl(fromUrl);
//         return;
//       }
//       // 2) Backend-selected
//       try {
//         const sel = await api.selectedTemplateForUser(userId);
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
//   }, [router.query.templateId, userId]);

//   return tpl;
// }

// const ABS = /^https?:\/\//i;

// export default function AppointmentPreview() {
//   const userId = defaultUserId;
//   const effectiveTemplateId = useResolvedTemplateId(userId);

//   const [appointment, setAppointment] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",     // S3 key or absolute URL from template
//     backgroundImageUrl: "",  // presigned from backend if available
//   });

//   const [previewUrl, setPreviewUrl] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Helper: presign any S3 key via backend
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json().catch(() => ({}));
//       return json?.url || json?.signedUrl || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   // Load when template changes (with cache-buster)
//   useEffect(() => {
//     if (!effectiveTemplateId) return;
//     let abort = false;

//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${encodeURIComponent(
//             userId
//           )}/${encodeURIComponent(effectiveTemplateId)}?_=${Date.now()}`,
//           { headers: { Accept: "application/json" }, cache: "no-store" }
//         );
//         const result = await res.json();
//         if (abort) return;

//         setAppointment(result || {});

//         // Decide preview URL priority:
//         // 1) backgroundImageUrl (presigned from server)
//         // 2) absolute backgroundImage (template static URL)
//         // 3) presign backgroundImage if it's an S3 key
//         if (result?.backgroundImageUrl) {
//           setPreviewUrl(result.backgroundImageUrl);
//         } else if (result?.backgroundImage && ABS.test(result.backgroundImage)) {
//           setPreviewUrl(result.backgroundImage);
//         } else if (result?.backgroundImage) {
//           const url = await getSignedUrlFor(result.backgroundImage);
//           if (!abort) setPreviewUrl(url || "");
//         } else {
//           setPreviewUrl("");
//         }
//       } catch (err) {
//         if (!abort) console.error("❌ Failed to fetch appointment", err);
//       } finally {
//         if (!abort) setLoading(false);
//       }
//     })();

//     return () => {
//       abort = true;
//     };
//   }, [userId, effectiveTemplateId]);

//   // If the stored key/url changes later, refresh preview
//   useEffect(() => {
//     (async () => {
//       if (appointment?.backgroundImageUrl) {
//         setPreviewUrl(appointment.backgroundImageUrl);
//         return;
//       }
//       if (appointment?.backgroundImage) {
//         if (ABS.test(appointment.backgroundImage)) {
//           setPreviewUrl(appointment.backgroundImage);
//           return;
//         }
//         const url = await getSignedUrlFor(appointment.backgroundImage);
//         setPreviewUrl(url || "");
//       }
//     })();
//   }, [appointment?.backgroundImage, appointment?.backgroundImageUrl]);

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//       }}
//     >
//       {/* Left: Background image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundColor: "#f0f0f0",
//         }}
//         aria-label="Appointment background"
//       />

//       {/* Right: Content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <div className="text-muted small mb-1">
//           template: <code>{effectiveTemplateId || "…"}</code>
//         </div>
//         <h5 className="fw-bold text-uppercase mb-2">
//           {appointment.title || (loading ? "Loading…" : "Appointment")}
//         </h5>
//         <p className="mb-2">
//           {appointment.subtitle || (!loading && "Subtitle goes here...")}
//         </p>
//         <p className="mb-1">
//           <strong>📍 Address:</strong>{" "}
//           {appointment.officeAddress || (!loading && "Not specified")}
//         </p>
//         <p className="mb-3">
//           <strong>⏰ Time:</strong>{" "}
//           {appointment.officeTime || (!loading && "Not specified")}
//         </p>
//       </div>
//     </div>
//   );
// }













// C:\Users\97158\Desktop\project1 dev\project1\dashboard\pages\editorpages\appointmentE.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../lib/config";
import { useIonContext } from "../../lib/useIonContext";
import { api } from "../../lib/api";

/* ---------- helpers ---------- */
const isHttp = (s) => /^https?:\/\//i.test(String(s || ""));
const isPresigned = (url) =>
  /\bX-Amz-(Signature|Algorithm|Credential|Date|Expires|SignedHeaders)=/i.test(String(url));
const bust = (url) =>
  !url || isPresigned(url) ? url : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

/** Prefer full URL from server; otherwise presign an S3 key via backend */
async function presignKey(key) {
  if (!key) return "";
  try {
    const r = await fetch(
      `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
    );
    const j = await r.json().catch(() => ({}));
    return j?.url || j?.signedUrl || "";
  } catch {
    return "";
  }
}

export default function AppointmentPreview() {
  const { userId, templateId } = useIonContext();

  const [doc, setDoc] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",    // S3 key or relative key
    backgroundImageUrl: "", // absolute URL from server if provided
  });
  const [displayUrl, setDisplayUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const GET_URL = useMemo(() => {
    if (!userId || !templateId) return "";
    return `${backendBaseUrl}/api/appointment/${encodeURIComponent(
      userId
    )}/${encodeURIComponent(templateId)}`;
  }, [userId, templateId]);

  // Compute preview URL from server doc
  const computeDisplayUrl = useMemo(
    () => async (data) => {
      const full = data?.backgroundImageUrl;
      if (isHttp(full)) return bust(full);

      const key = data?.backgroundImage || (full && !isHttp(full) ? String(full) : "");
      if (key) {
        const url = await presignKey(key);
        return bust(url || "");
      }
      return "";
    },
    []
  );

  // Load (with cache-buster so it reflects dashboard resets immediately)
  useEffect(() => {
    if (!GET_URL) return;
    let off = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${GET_URL}?_=${Date.now()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "include",
        });
        const data = (await res.json().catch(() => null)) || {};
        if (off) return;

        const normalized = {
          title: data?.title ?? data?.headingLeft ?? "",
          subtitle: data?.subtitle ?? data?.descriptionLeft ?? "",
          officeAddress: data?.officeAddress ?? "",
          officeTime: data?.officeTime ?? "",
          backgroundImage: data?.backgroundImage ?? "",
          backgroundImageUrl: data?.backgroundImageUrl ?? "",
        };
        setDoc(normalized);
        setDisplayUrl(await computeDisplayUrl(normalized));
      } finally {
        if (!off) setLoading(false);
      }
    })();

    return () => {
      off = true;
    };
  }, [GET_URL, computeDisplayUrl]);

  // In case background fields change later, recompute preview
  useEffect(() => {
    (async () => {
      const url = await computeDisplayUrl(doc);
      setDisplayUrl(url);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.backgroundImage, doc.backgroundImageUrl]);

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Left: Background */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: displayUrl ? `url(${displayUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f0f0f0",
        }}
        aria-label="Appointment background"
      />

      {/* Right: Content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <div className="text-muted small mb-1">
          template: <code>{templateId || "…"}</code>
        </div>
        <h5 className="fw-bold text-uppercase mb-2">
          {doc.title || (loading ? "Loading…" : "Appointment")}
        </h5>
        <p className="mb-2">
          {doc.subtitle || (!loading && "Subtitle goes here...")}
        </p>
        <p className="mb-1">
          <strong>📍 Address:</strong>{" "}
          {doc.officeAddress || (!loading && "Not specified")}
        </p>
        <p className="mb-0">
          <strong>⏰ Time:</strong>{" "}
          {doc.officeTime || (!loading && "Not specified")}
        </p>
      </div>
    </div>
  );
}
