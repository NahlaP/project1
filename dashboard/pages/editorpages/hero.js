
// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// export default function HomepagePreview() {
//   const router = useRouter();

//   const [hero, setHero] = useState({ content: "", imageUrl: "" });

//   useEffect(() => {
//     const fetchHero = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
//         const data = await res.json();
//         setHero(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load hero section", err);
//       }
//     };
//     fetchHero();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* ================= HERO ================= */}
//       <section className="mb-5">
//         <h3 className="fw-bold">Hero Section</h3>
//         <div id="header-carousel" className="carousel slide">
//           <div className="carousel-inner">
//             <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
//               {hero.imageUrl && (
//                 <img
//                   src={hero.imageUrl.startsWith("http") ? hero.imageUrl : `${backendBaseUrl}${hero.imageUrl}`}
//                   alt="Hero"
//                   className="w-100 h-100"
//                   style={{ objectFit: "cover", height: "auto", maxHeight: "100vh" }}
//                 />
//               )}
//               <div
//                 className="carousel-caption"
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "flex-start",
//                   background: "rgba(0, 0, 0, 0.5)",
//                   padding: "4rem 4rem 4rem 11rem",
//                   zIndex: 10,
//                 }}
//               >
//                 <h1
//                   style={{
//                     fontSize: "2.5rem",
//                     fontWeight: "bold",
//                     color: "white",
//                     maxWidth: "700px",
//                   }}
//                 >
//                   {hero.content}
//                 </h1>
//                 <div className="d-flex gap-2">
//                   <a href="#" className="btn btn-primary py-3 px-4">
//                     Explore More
//                   </a>
//                   <Button variant="light" className="py-3 px-4" onClick={() => router.push("/editorpages/heroS")}>✏️ Edit Hero Section</Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;








// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const [hero, setHero] = useState({ content: "", imageUrl: "" });

//   useEffect(() => {
//     const fetchHero = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
//         const data = await res.json();
//         setHero(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load hero section", err);
//       }
//     };
//     fetchHero();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <section className="mb-5">
//         <h3 className="fw-bold">Hero Section</h3>
//         <div id="header-carousel" className="carousel slide">
//           <div className="carousel-inner">
//             <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
//               {hero.imageUrl && (
//                 <img
//                   src={hero.imageUrl.startsWith("http") ? hero.imageUrl : `${backendBaseUrl}${hero.imageUrl}`}
//                   alt="Hero"
//                   className="w-100 h-100"
//                   style={{ objectFit: "cover", height: "auto", maxHeight: "100vh" }}
//                 />
//               )}
//               <div
//                 className="carousel-caption"
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "flex-start",
//                   background: "rgba(0, 0, 0, 0.5)",
//                   padding: "4rem 4rem 4rem 11rem",
//                   zIndex: 10,
//                 }}
//               >
//                 <h1
//                   style={{
//                     fontSize: "2.5rem",
//                     fontWeight: "bold",
//                     color: "white",
//                     maxWidth: "700px",
//                   }}
//                 >
//                   {hero.content}
//                 </h1>
//                 <div className="d-flex gap-2">
//                   <a href="#" className="btn btn-primary py-3 px-4">
//                     Explore More
//                   </a>
//                   <Button
//                     variant="light"
//                     className="py-3 px-4"
//                     onClick={() => router.push("/editorpages/heroS")}
//                   >
//                     ✏️ Edit Hero Section
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;



"use client";

import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function HeroSectionPreview() {
  const router = useRouter();
  const [hero, setHero] = useState({ content: "", imageUrl: "" });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
        const data = await res.json();
        setHero(data || {});
      } catch (err) {
        console.error("❌ Failed to load hero section", err);
      }
    };
    fetchHero();
  }, []);

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "280px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Left: Hero Text Content */}
      <div
        className="d-flex flex-column justify-content-center"
        style={{ width: "60%", paddingRight: "20px" }}
      >
        <h5 className="fw-bold mb-2">Hero Section</h5>
        <p className="mb-3" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
          {hero.content || "Your Hero Section Content Goes Here"}
        </p>
        <div className="d-flex gap-2">
          <a href="#" className="btn btn-primary btn-sm">
            Explore More
          </a>
        
        </div>
      </div>

      {/* Right: Hero Image */}
      <div style={{ width: "40%" }}>
        {hero.imageUrl && (
          <img
            src={
              hero.imageUrl.startsWith("http")
                ? hero.imageUrl
                : `${backendBaseUrl}${hero.imageUrl}`
            }
            alt="Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        )}
      </div>
    </div>
  );
}
