// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function TeamPagePreview() {
//   const router = useRouter();
//   const [team, setTeam] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setTeam(Array.isArray(data) ? data : []);
//       });
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">👥 Team Section Preview</h4>

//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h5 className="fw-bold">Meet Our Team</h5>
//         <div className="row">
//           {team.map((member) => (
//             <div className="col-md-3 mb-4" key={member._id}>
//               <div className="card h-100 text-center">
//                 {member.imageUrl && (
//                   <img
//                     src={
//                       member.imageUrl.startsWith("http")
//                         ? member.imageUrl
//                         : `${backendBaseUrl}${member.imageUrl}`
//                     }
//                     alt={member.name}
//                     className="card-img-top"
//                     style={{ height: 220, objectFit: "cover" }}
//                   />
//                 )}
//                 <div className="card-body">
//                   <h6 className="card-title text-uppercase">{member.name}</h6>
//                   <p className="card-text text-muted">
//                     {member.role || member.profession}
//                   </p>
//                   {(member.socialLinks || []).map((s, i) => (
//                     <a
//                       key={i}
//                       href={s.href}
//                       className="btn btn-sm btn-outline-primary me-1"
//                     >
//                       <i className={s.icon}></i>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button
//           variant="primary"
//           onClick={() => router.push("/editorpages/teamS")}
//         >
//           ✏️ Edit Team
//         </Button>
//       </section>
//     </Container>
//   );
// }

// TeamPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TeamPagePreview;


// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// function TeamPagePreview() {
//   const router = useRouter();
//   const [team, setTeam] = useState([]);

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setTeam(Array.isArray(data) ? data : []);
//       });
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">👥 Team Section Preview</h4>

//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h5 className="fw-bold">Meet Our Team</h5>
//         <div className="row">
//           {team.map((member) => (
//             <div className="col-md-3 mb-4" key={member._id}>
//               <div className="card h-100 text-center">
//                 {member.imageUrl && (
//                   <img
//                     src={
//                       member.imageUrl.startsWith("http")
//                         ? member.imageUrl
//                         : `${backendBaseUrl}${member.imageUrl}`
//                     }
//                     alt={member.name}
//                     className="card-img-top"
//                     style={{ height: 220, objectFit: "cover" }}
//                   />
//                 )}
//                 <div className="card-body">
//                   <h6 className="card-title text-uppercase">{member.name}</h6>
//                   <p className="card-text text-muted">
//                     {member.role || member.profession}
//                   </p>
//                   {(member.socialLinks || []).map((s, i) => (
//                     <a
//                       key={i}
//                       href={s.href}
//                       className="btn btn-sm btn-outline-primary me-1"
//                     >
//                       <i className={s.icon}></i>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button
//           variant="primary"
//           onClick={() => router.push("/editorpages/teamS")}
//         >
//           ✏️ Edit Team
//         </Button>
//       </section>
//     </Container>
//   );
// }

// TeamPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default TeamPagePreview;




"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function TeamPreview() {
  const router = useRouter();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        setTeam(Array.isArray(data) ? data : []);
      });
  }, []);

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
      {/* Left: First team member image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage:
            team[0]?.imageUrl
              ? `url(${backendBaseUrl}${team[0].imageUrl})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!team[0]?.imageUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Team content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">Meet Our Team</h5>
        {team.slice(0, 2).map((member, idx) => (
          <div key={idx} className="mb-2">
            <strong>{member.name}</strong> –{" "}
            <span className="text-muted">
              {member.role || member.profession}
            </span>
          </div>
        ))}

        {/* <Button
          size="sm"
          variant="outline-dark"
          onClick={() => router.push("/editorpages/teamS")}
        >
          ✏️ Edit Team
        </Button> */}
      </div>
    </div>
  );
}
