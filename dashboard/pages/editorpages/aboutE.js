// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// export default function AboutPagePreview() {
//   const router = useRouter();

//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     bullets: [],
//     imageUrl: "",
//   });

//   useEffect(() => {
//     const fetchAbout = async () => {
//       const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
//       const data = await res.json();
//       setAbout(data || {});
//     };

//     fetchAbout();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* ABOUT */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">About Section</h3>
//         <div className="row">
//           <div className="col-md-6">
//             {about.imageUrl && (
//               <img
//                 src={`${backendBaseUrl}${about.imageUrl}`}
//                 alt="About"
//                 className="img-fluid mb-3 rounded"
//                 style={{ maxHeight: "350px", objectFit: "cover" }}
//               />
//             )}
//           </div>
//           <div className="col-md-6">
//             <h4>{about.title}</h4>
//             <p>{about.description}</p>
//             <div className="border p-3 mb-2">
//               <strong>{about.highlight}</strong>
//             </div>
//             <ul>
//               {(about.bullets || []).map((b) => (
//                 <li key={b._id || b.text}>{b.text}</li>
//               ))}
//             </ul>
//             <Button variant="primary" onClick={() => router.push("/editorpages/aboutS")}>✏️ Edit About Section</Button>
//           </div>
//         </div>
//       </section>
//     </Container>
//   );
// }

// AboutPagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;


// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
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
//     const fetchAbout = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
//         const data = await res.json();
//         setAbout(data || {});
//       } catch (err) {
//         console.error("❌ Failed to fetch About section", err);
//       }
//     };

//     fetchAbout();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* ABOUT SECTION PREVIEW */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">About Section</h3>
//         <div className="row">
//           <div className="col-md-6">
//             {about.imageUrl && (
//               <img
//                 src={`${backendBaseUrl}${about.imageUrl}`}
//                 alt="About"
//                 className="img-fluid mb-3 rounded"
//                 style={{ maxHeight: "350px", objectFit: "cover" }}
//               />
//             )}
//           </div>
//           <div className="col-md-6">
//             <h4>{about.title}</h4>
//             <p>{about.description}</p>
//             <div className="border p-3 mb-2">
//               <strong>{about.highlight}</strong>
//             </div>
//             <ul>
//               {(about.bullets || []).map((b) => (
//                 <li key={b._id || b.text}>{b.text}</li>
//               ))}
//             </ul>
//             <Button variant="primary" onClick={() => router.push("/editorpages/aboutS")}>
//               ✏️ Edit About Section
//             </Button>
//           </div>
//         </div>
//       </section>
//     </Container>
//   );
// }


// AboutViewer.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;








"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function AboutViewer() {
  const router = useRouter();

  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    bullets: [],
    imageUrl: "",
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`)
      .then((res) => res.json())
      .then((data) => setAbout(data || {}))
      .catch((err) => console.error("❌ Failed to fetch About section", err));
  }, []);

  return (
    <div
      className="d-flex w-100"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Left Image */}
      <div style={{ width: "50%", height: "100%" }}>
        {about.imageUrl ? (
          <img
            src={`${backendBaseUrl}${about.imageUrl}`}
            alt="About"
            className="w-100 h-100"
            style={{
              objectFit: "cover",
            }}
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
        style={{
          width: "50%",
          height: "127%",
          overflowY: "auto",
        }}
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
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              backgroundColor: "#fff",
            }}
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
