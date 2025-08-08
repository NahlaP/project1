// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function TestimonialsPagePreview() {
//   const router = useRouter();
//   const [testimonials, setTestimonials] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setTestimonials);
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">🌟 Testimonials Preview</h4>

//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h5 className="fw-bold">What Clients Say</h5>
//         <div className="row">
//           {testimonials.map((t) => (
//             <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
//               <div className="border p-3 h-100">
//                 <div className="d-flex align-items-center mb-3">
//                   <img
//                     src={`${backendBaseUrl}${t.imageUrl}`}
//                     alt={t.name}
//                     style={{
//                       width: 60,
//                       height: 60,
//                       objectFit: "cover",
//                       borderRadius: "50%",
//                       marginRight: 12,
//                     }}
//                   />
//                   <div>
//                     <strong className="text-uppercase d-block">{t.name}</strong>
//                     <small className="text-muted">{t.profession}</small>
//                   </div>
//                 </div>
//                 <p className="mb-2">{t.message}</p>
//                 <div className="text-warning">
//                   {Array.from({ length: t.rating || 5 }).map((_, i) => (
//                     <i className="fas fa-star" key={i}></i>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <Button
//           variant="primary"
//           onClick={() => router.push("/editorpages/testimonialS")}
//         >
//           ✏️ Edit Testimonials
//         </Button>
//       </section>
//     </Container>
//   );
// }

// TestimonialsPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TestimonialsPagePreview;


// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// function TestimonialsPagePreview() {
//   const router = useRouter();
//   const [testimonials, setTestimonials] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setTestimonials);
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">🌟 Testimonials Preview</h4>

//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h5 className="fw-bold">What Clients Say</h5>
//         <div className="row">
//           {testimonials.map((t) => (
//             <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
//               <div className="border p-3 h-100">
//                 <div className="d-flex align-items-center mb-3">
//                   <img
//                     src={`${backendBaseUrl}${t.imageUrl}`}
//                     alt={t.name}
//                     style={{
//                       width: 60,
//                       height: 60,
//                       objectFit: "cover",
//                       borderRadius: "50%",
//                       marginRight: 12,
//                     }}
//                   />
//                   <div>
//                     <strong className="text-uppercase d-block">{t.name}</strong>
//                     <small className="text-muted">{t.profession}</small>
//                   </div>
//                 </div>
//                 <p className="mb-2">{t.message}</p>
//                 <div className="text-warning">
//                   {Array.from({ length: t.rating || 5 }).map((_, i) => (
//                     <i className="fas fa-star" key={i}></i>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <Button
//           variant="primary"
//           onClick={() => router.push("/editorpages/testimonialS")}
//         >
//           ✏️ Edit Testimonials
//         </Button>
//       </section>
//     </Container>
//   );
// }

// TestimonialsPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TestimonialsPagePreview;
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function TestimonialPreview() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setTestimonials);
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
          backgroundImage: first?.imageUrl
            ? `url(${backendBaseUrl}${first.imageUrl})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!first?.imageUrl && (
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
              {Array.from({ length: first.rating || 5 }).map((_, i) => (
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
