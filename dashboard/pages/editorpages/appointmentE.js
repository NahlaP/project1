

// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function AppointmentPreview() {
//   const router = useRouter();

//   const [appointment, setAppointment] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",       // S3 key like sections/appointment/....jpg
//     backgroundImageUrl: "",    // (if backend provides it)
//   });

//   const [previewUrl, setPreviewUrl] = useState(""); // presigned URL for CSS bg
//   const [loading, setLoading] = useState(true);

//   // Helper: ask backend to presign any S3 key
//   const getSignedUrlFor = async (key) => {
//     if (!key) return "";
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
//       );
//       const json = await res.json();
//       // Support {url}, {signedUrl}, or bare string
//       return json?.url || json?.signedUrl || json || "";
//     } catch (e) {
//       console.error("Failed to get signed URL", e);
//       return "";
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(
//           `${backendBaseUrl}/api/appointment/${userId}/${templateId}`
//         );
//         const result = await res.json();
//         setAppointment(result || {});
//         // Prefer server-provided presigned URL, else presign the key
//         if (result?.backgroundImageUrl) {
//           setPreviewUrl(result.backgroundImageUrl);
//         } else if (result?.backgroundImage) {
//           const url = await getSignedUrlFor(result.backgroundImage);
//           setPreviewUrl(url || "");
//         } else {
//           setPreviewUrl("");
//         }
//       } catch (err) {
//         console.error("❌ Failed to fetch appointment", err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // If the stored key changes later, refresh the previewUrl
//   useEffect(() => {
//     (async () => {
//       if (!appointment?.backgroundImage) return;
//       if (appointment?.backgroundImageUrl) {
//         setPreviewUrl(appointment.backgroundImageUrl);
//         return;
//       }
//       const url = await getSignedUrlFor(appointment.backgroundImage);
//       setPreviewUrl(url || "");
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
//         <h5 className="fw-bold text-uppercase mb-2">
//           {appointment.title || "Appointment"}
//         </h5>
//         <p className="mb-2">{appointment.subtitle || "Subtitle goes here..."}</p>
//         <p className="mb-1">
//           <strong>📍 Address:</strong>{" "}
//           {appointment.officeAddress || "Not specified"}
//         </p>
//         <p className="mb-3">
//           <strong>⏰ Time:</strong> {appointment.officeTime || "Not specified"}
//         </p>
//       </div>
//     </div>
//   );
// }









// pages/editorpages/appointmentE.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function AppointmentPreview() {
  const router = useRouter();

  const [appointment, setAppointment] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",      // S3 key, e.g., sections/appointment/....jpg
    backgroundImageUrl: "",   // presigned from backend if available
  });

  const [previewUrl, setPreviewUrl] = useState(""); // CSS bg image
  const [loading, setLoading] = useState(true);

  // Helper: presign any S3 key via backend
  const getSignedUrlFor = async (key) => {
    if (!key) return "";
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
      );
      const json = await res.json().catch(() => ({}));
      return json?.url || json?.signedUrl || "";
    } catch (e) {
      console.error("Failed to get signed URL", e);
      return "";
    }
  };

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/appointment/${userId}/${templateId}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const result = await res.json();
        setAppointment(result || {});
        // Prefer server-provided presigned URL, else presign the key
        if (result?.backgroundImageUrl) {
          setPreviewUrl(result.backgroundImageUrl);
        } else if (result?.backgroundImage) {
          const url = await getSignedUrlFor(result.backgroundImage);
          setPreviewUrl(url || "");
        } else {
          setPreviewUrl("");
        }
      } catch (err) {
        console.error("❌ Failed to fetch appointment", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If the stored key/url changes later, refresh preview
  useEffect(() => {
    (async () => {
      if (appointment?.backgroundImageUrl) {
        setPreviewUrl(appointment.backgroundImageUrl);
        return;
      }
      if (appointment?.backgroundImage) {
        const url = await getSignedUrlFor(appointment.backgroundImage);
        setPreviewUrl(url || "");
      }
    })();
  }, [appointment?.backgroundImage, appointment?.backgroundImageUrl]);

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
      {/* Left: Background image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
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
        <h5 className="fw-bold text-uppercase mb-2">
          {appointment.title || "Appointment"}
        </h5>
        <p className="mb-2">{appointment.subtitle || "Subtitle goes here..."}</p>
        <p className="mb-1">
          <strong>📍 Address:</strong>{" "}
          {appointment.officeAddress || "Not specified"}
        </p>
        <p className="mb-3">
          <strong>⏰ Time:</strong> {appointment.officeTime || "Not specified"}
        </p>
      </div>
    </div>
  );
}
