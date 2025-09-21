


// "use client";

// import React, { useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function ServicesPagePreview() {
//   const router = useRouter();
//   const [servicesDoc, setServicesDoc] = useState({ services: [] });

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setServicesDoc);
//   }, []);

//   return (
//     <div
//       className="d-flex w-100 bg-white shadow-sm"
//       style={{
//         width: "896px",
//         height: "290px",
//         borderRadius: "20px",
//         overflow: "hidden",
//         padding: "20px",
//       }}
//     >
//       {/* Left: Services Grid */}
//       <div className="d-flex flex-wrap gap-3" style={{ width: "70%", height: "100%", overflowY: "auto" }}>
//         {servicesDoc.services.slice(0, 2).map((item) => (
//           <div
//             key={item._id}
//             className="border rounded p-2 d-flex flex-column"
//             style={{
//               width: "calc(50% - 10px)",
//               height: "100%",
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             {item.imageUrl && (
//               <img
//                 src={`${backendBaseUrl}${item.imageUrl}`}
//                 alt={item.title}
//                 style={{
//                   width: "100%",
//                   height: "100px",
//                   objectFit: "cover",
//                   borderRadius: "8px",
//                   marginBottom: "8px",
//                 }}
//               />
//             )}
//             <h6 className="fw-bold mb-1">{item.title}</h6>
//             <p className="small mb-1 text-muted">{item.description}</p>
//             {item.buttonText && (
//               <a
//                 href={item.buttonHref}
//                 className="btn btn-outline-primary btn-sm mt-auto"
//               >
//                 {item.buttonText}
//               </a>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Right: Action Button */}
//       <div className="d-flex align-items-end justify-content-end flex-column ps-3" style={{ width: "30%" }}>
//         {/* <Button
//           variant="outline-dark"
//           size="sm"
//           onClick={() => router.push("/editorpages/servicesS")}
//         >
//           ✏️ Edit Services
//         </Button> */}
//       </div>
//     </div>
//   );
// }












// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\servicesE.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function ServicesPagePreview() {
  const router = useRouter();
  const [servicesDoc, setServicesDoc] = useState({ services: [] });

  // helper: presign any S3 key via backend
  const getSignedUrlFor = async (key) => {
    if (!key) return "";
    try {
      const res = await fetch(
        `${backendBaseUrl}/api/upload/file-url?key=${encodeURIComponent(key)}`
      );
      const json = await res.json().catch(() => ({}));
      return json?.url || json?.signedUrl || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${backendBaseUrl}/api/services/${userId}/${templateId}`
        );
        const doc = (await res.json()) || { services: [] };

        // build displayUrl per service item
        const services = await Promise.all(
          (doc.services || []).map(async (item) => {
            // prefer server-provided presigned URL if present
            if (item.imageUrl && /^https?:\/\//i.test(item.imageUrl)) {
              return { ...item, displayUrl: item.imageUrl };
            }
            // if backend returned only a key (imageKey or imageUrl contains a key), presign it
            const key =
              item.imageKey ||
              (item.imageUrl && !/^https?:\/\//i.test(item.imageUrl)
                ? item.imageUrl
                : "");
            if (key) {
              const url = await getSignedUrlFor(key);
              return { ...item, displayUrl: url || "" };
            }
            return { ...item, displayUrl: "" };
          })
        );

        setServicesDoc({ ...doc, services });
      } catch (e) {
        console.error("❌ Failed to fetch services", e);
        setServicesDoc({ services: [] });
      }
    })();
  }, []);

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Left: Services Grid */}
      <div
        className="d-flex flex-wrap gap-3"
        style={{ width: "70%", height: "100%", overflowY: "auto" }}
      >
        {servicesDoc.services.slice(0, 2).map((item) => (
          <div
            key={item._id}
            className="border rounded p-2 d-flex flex-column"
            style={{
              width: "calc(50% - 10px)",
              height: "100%",
              backgroundColor: "#f8f9fa",
            }}
          >
            {item.displayUrl ? (
              <img
                src={item.displayUrl} 
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              />
            ) : null}

            <h6 className="fw-bold mb-1">{item.title}</h6>
            <p className="small mb-1 text-muted">{item.description}</p>
            {item.buttonText && (
              <a
                href={item.buttonHref}
                className="btn btn-outline-primary btn-sm mt-auto"
              >
                {item.buttonText}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Right: Action Button (unchanged / commented as before) */}
      <div
        className="d-flex align-items-end justify-content-end flex-column ps-3"
        style={{ width: "30%" }}
      >
        {/* <Button
          variant="outline-dark"
          size="sm"
          onClick={() => router.push("/editorpages/servicesS")}
        >
          ✏️ Edit Services
        </Button> */}
      </div>
    </div>
  );
}
