
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function TestimonialPreview() {
//   const router = useRouter();
//   const [testimonials, setTestimonials] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setTestimonials);
//   }, []);

//   const first = testimonials[0];

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
//       {/* Left: Client Image */}
//       <div
//         style={{
//           width: "50%",
//           height: "127%",
//           backgroundImage: first?.imageUrl
//             ? `url(${backendBaseUrl}${first.imageUrl})`
//             : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {!first?.imageUrl && (
//           <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Right: Testimonial Content */}
//       <div
//         className="d-flex flex-column justify-content-center p-4"
//         style={{ width: "50%", height: "100%", overflowY: "auto" }}
//       >
//         <h5 className="fw-bold text-uppercase mb-2">What Clients Say</h5>

//         {first ? (
//           <>
//             <strong className="text-uppercase">{first.name}</strong>
//             <small className="text-muted mb-2">{first.profession}</small>
//             <p className="mb-2">{first.message}</p>
//             <div className="text-warning mb-2">
//               {Array.from({ length: first.rating || 5 }).map((_, i) => (
//                 <i className="fas fa-star" key={i}></i>
//               ))}
//             </div>
//           </>
//         ) : (
//           <p className="text-muted">No testimonials available.</p>
//         )}

//         {/* <Button
//           size="sm"
//           variant="outline-dark"
//           onClick={() => router.push("/editorpages/testimonialS")}
//         >
//           ✏️ Edit Testimonials
//         </Button> */}
//       </div>
//     </div>
//   );
// }






// C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\testimonialE.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function TestimonialPreview() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);

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
          `${backendBaseUrl}/api/testimonial/${userId}/${templateId}`,
          { headers: { Accept: "application/json" }, cache: "no-store" }
        );
        const arr = (await res.json()) || [];
        const safe = Array.isArray(arr) ? arr : [];

        // build displayUrl for each testimonial
        const withUrls = await Promise.all(
          safe.map(async (t) => {
            // full URL already?
            if (t.imageUrl && /^https?:\/\//i.test(t.imageUrl)) {
              return { ...t, displayUrl: t.imageUrl };
            }
            // do we have a key? (imageKey OR imageUrl that is a key)
            const key =
              t.imageKey ||
              (t.imageUrl && !/^https?:\/\//i.test(t.imageUrl) ? t.imageUrl : "");
            if (key) {
              const url = await getSignedUrlFor(key);
              return { ...t, displayUrl: url || "" };
            }
            return { ...t, displayUrl: "" };
          })
        );

        setTestimonials(withUrls);
      } catch (e) {
        console.error("❌ Failed to fetch testimonials", e);
        setTestimonials([]);
      }
    })();
  }, []);

  const first = testimonials[0];

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
      {/* Left: Client Image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: first?.displayUrl ? `url(${first.displayUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!first?.displayUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Testimonial Content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">What Clients Say</h5>

        {first ? (
          <>
            <strong className="text-uppercase">{first.name}</strong>
            <small className="text-muted mb-2">{first.profession}</small>
            <p className="mb-2">{first.message}</p>
            <div className="text-warning mb-2">
              {Array.from({ length: Math.max(0, Math.min(5, first.rating || 5)) }).map((_, i) => (
                <i className="fas fa-star" key={i}></i>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted">No testimonials available.</p>
        )}

        {/* <Button
          size="sm"
          variant="outline-dark"
          onClick={() => router.push("/editorpages/testimonialS")}
        >
          ✏️ Edit Testimonials
        </Button> */}
      </div>
    </div>
  );
}
