// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function AppointmentEditorPage() {
//   const router = useRouter();

//   const [appointment, setAppointment] = useState({
//     title: "",
//     subtitle: "",
//     officeAddress: "",
//     officeTime: "",
//     backgroundImage: "",
//   });

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setAppointment);
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">📆 Appointment Section Preview</h4>

//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <Row>
//           <Col lg={6}>
//             <div
//               style={{
//                 backgroundImage: appointment.backgroundImage
//                   ? `url(${backendBaseUrl}${appointment.backgroundImage})`
//                   : "none",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 minHeight: "400px",
//                 borderRadius: "8px",
//               }}
//             />
//           </Col>
//           <Col lg={6}>
//             <h3 className="fw-bold text-uppercase mb-3">
//               {appointment.title || "Appointment"}
//             </h3>
//             <p>{appointment.subtitle}</p>
//             <p>
//               <strong>Office Address:</strong> {appointment.officeAddress || "-"}
//             </p>
//             <p>
//               <strong>Office Time:</strong> {appointment.officeTime || "-"}
//             </p>
//             <Button
//               variant="primary"
//               onClick={() => router.push("/editorpages/appointmentS")}
//             >
//               ✏️ Edit Appointment
//             </Button>
//           </Col>
//         </Row>
//       </section>
//     </Container>
//   );
// }

// AppointmentEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AppointmentEditorPage;


"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function AppointmentEditorPage() {
  const router = useRouter();

  const [appointment, setAppointment] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setAppointment)
      .catch((err) => console.error("❌ Failed to fetch appointment data", err));
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      <h4 className="fw-bold mb-4">📆 Appointment Section Preview</h4>

      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <Row>
          <Col lg={6}>
            <div
              style={{
                backgroundImage: appointment.backgroundImage
                  ? `url(${backendBaseUrl}${appointment.backgroundImage})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "400px",
                borderRadius: "8px",
              }}
            />
          </Col>
          <Col lg={6}>
            <h3 className="fw-bold text-uppercase mb-3">
              {appointment.title || "Appointment"}
            </h3>
            <p>{appointment.subtitle}</p>
            <p>
              <strong>Office Address:</strong> {appointment.officeAddress || "-"}
            </p>
            <p>
              <strong>Office Time:</strong> {appointment.officeTime || "-"}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/editorpages/appointmentS")}
            >
              ✏️ Edit Appointment
            </Button>
          </Col>
        </Row>
      </section>
    </Container>
  );
}

AppointmentEditorPage.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default AppointmentEditorPage;
