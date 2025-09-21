






// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { Button } from "react-bootstrap";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function AboutViewer() {
//   const router = useRouter();

//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     bullets: [],
//     imageUrl: "",
//   });

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => setAbout(data || {}))
//       .catch((err) => console.error("❌ Failed to fetch About section", err));
//   }, []);

//   return (
//     <div
//       className="d-flex w-100"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//         backgroundColor: "#f8f9fa",
//       }}
//     >
//       {/* Left Image */}
//       <div style={{ width: "50%", height: "100%" }}>
//         {about.imageUrl ? (
//           <img
//             src={`${backendBaseUrl}${about.imageUrl}`}
//             alt="About"
//             className="w-100 h-100"
//             style={{
//               objectFit: "cover",
//             }}
//           />
//         ) : (
//           <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Right Content */}
//       <div
//         className="d-flex flex-column justify-content-center px-4 py-3"
//         style={{
//           width: "50%",
//           height: "127%",
//           overflowY: "auto",
//         }}
//       >
//         <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
//           {about.title || "About Title"}
//         </h4>
//         <p className="mb-2" style={{ fontSize: "0.95rem" }}>
//           {about.description || "Short about description..."}
//         </p>
//         {about.highlight && (
//           <div
//             className="bg-white border px-3 py-2 rounded mb-2"
//             style={{
//               fontSize: "0.875rem",
//               fontWeight: "500",
//               backgroundColor: "#fff",
//             }}
//           >
//             ⭐ {about.highlight}
//           </div>
//         )}
//         <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem" }}>
//           {(about.bullets || []).slice(0, 3).map((b) => (
//             <li key={b._id || b.text}>{b.text}</li>
//           ))}
//         </ul>

//         <Button
//           size="sm"
//           variant="outline-dark"
//           className="mt-3"
//           onClick={() => router.push("/editorpages/aboutS")}
//         >
//           ✏️ Edit About Section
//         </Button>
//       </div>
//     </div>
//   );
// }






// pages/editorpages/aboutE.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, userId, templateId, s3Bucket, s3Region } from "../../lib/config";

const absFromKey = (key) =>
  key && s3Bucket && s3Region
    ? `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${String(key).replace(/^\/+/, "")}`
    : "";

export default function AboutViewer() {
  const router = useRouter();

  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    bullets: [],
    imageUrl: "",   // presigned from backend
    imageKey: "",   // optional fallback
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setAbout(data || {}))
      .catch((err) => console.error("❌ Failed to fetch About section", err));
  }, []);

  // Prefer presigned URL; fall back to absolute S3 path if only key available
  const displayUrl = about.imageUrl || absFromKey(about.imageKey || "");

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
      {/* Left Image */}
      <div style={{ width: "50%", height: "100%" }}>
        {displayUrl ? (
          // plain <img> so we don't need optimizer for presigned URLs
          <img
            src={displayUrl}
            alt="About"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
            No Image
          </div>
        )}
      </div>

      {/* Right Content */}
      <div
        className="d-flex flex-column justify-content-center px-4 py-3"
        style={{ width: "50%", height: "127%", overflowY: "auto" }}
      >
        <h4 className="fw-bold mb-2" style={{ fontSize: "1.5rem" }}>
          {about.title || "About Title"}
        </h4>

        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
          {about.description || "Short about description..."}
        </p>

        {about.highlight && (
          <div
            className="bg-white border px-3 py-2 rounded mb-2"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            ⭐ {about.highlight}
          </div>
        )}

        <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem" }}>
          {(about.bullets || []).slice(0, 3).map((b) => (
            <li key={b._id || b.text}>{b.text}</li>
          ))}
        </ul>

        <Button
          size="sm"
          variant="outline-dark"
          className="mt-3"
          onClick={() => router.push("/editorpages/aboutS")}
        >
          ✏️ Edit About Section
        </Button>
      </div>
    </div>
  );
}
