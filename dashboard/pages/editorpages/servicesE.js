// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function ServicesPagePreview() {
//   const router = useRouter();
//   const [servicesDoc, setServicesDoc] = useState({ services: [] });

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setServicesDoc);
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">🌐 Services Page Preview</h4>

//       {/* ================= SERVICES ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h5 className="fw-bold">Services</h5>
//         <div className="row">
//           {servicesDoc.services.map((item) => (
//             <div className="col-md-3 mb-4" key={item._id}>
//               <div className="card h-100">
//                 {item.imageUrl && (
//                   <img
//                     src={`${backendBaseUrl}${item.imageUrl}`}
//                     alt={item.title}
//                     className="card-img-top"
//                     style={{ height: "180px", objectFit: "cover" }}
//                   />
//                 )}
//                 <div className="card-body">
//                   <h5 className="card-title">{item.title}</h5>
//                   <p className="card-text">{item.description}</p>
//                   {item.buttonText && (
//                     <a
//                       href={item.buttonHref}
//                       className="btn btn-outline-primary btn-sm"
//                     >
//                       {item.buttonText}
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button
//           variant="primary"
//           onClick={() => router.push("/editorpages/servicesS")}
//         >
//           ✏️ Edit Services
//         </Button>
//       </section>
//     </Container>
//   );
// }

// ServicesPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ServicesPagePreview;


"use client";

import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function ServicesPagePreview() {
  const router = useRouter();
  const [servicesDoc, setServicesDoc] = useState({ services: [] });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setServicesDoc);
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      <h4 className="fw-bold mb-4">🌐 Services Page Preview</h4>

      {/* ================= SERVICES ================= */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h5 className="fw-bold">Services</h5>
        <div className="row">
          {servicesDoc.services.map((item) => (
            <div className="col-md-3 mb-4" key={item._id}>
              <div className="card h-100">
                {item.imageUrl && (
                  <img
                    src={`${backendBaseUrl}${item.imageUrl}`}
                    alt={item.title}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text">{item.description}</p>
                  {item.buttonText && (
                    <a
                      href={item.buttonHref}
                      className="btn btn-outline-primary btn-sm"
                    >
                      {item.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/editorpages/servicesS")}
        >
          ✏️ Edit Services
        </Button>
      </section>
    </Container>
  );
}

ServicesPagePreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ServicesPagePreview;
