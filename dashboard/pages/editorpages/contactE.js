// "use client";

// import React, { useEffect, useState } from "react";
// import { Container, Button } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function ContactPagePreview() {
//   const router = useRouter();
//   const [contact, setContact] = useState({
//     address: "",
//     phone: "",
//     email: "",
//     socialLinks: {},
//     businessHours: {},
//   });

//   useEffect(() => {
//     fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`)
//       .then((res) => res.json())
//       .then(setContact);
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       <h4 className="fw-bold mb-4">📞 Contact Section Preview</h4>

//       <section className="bg-dark rounded p-4 shadow-sm text-white">
//         <h5 className="fw-bold text-white">Contact / Footer</h5>
//         <div className="row">
//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Our Office</h6>
//             <p>
//               <i className="fa fa-map-marker-alt text-primary me-2"></i>
//               {contact.address}
//             </p>
//             <p>
//               <i className="fa fa-phone-alt text-primary me-2"></i>
//               {contact.phone}
//             </p>
//             <p>
//               <i className="fa fa-envelope text-primary me-2"></i>
//               {contact.email}
//             </p>
//           </div>

//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Business Hours</h6>
//             <p className="mb-0 text-uppercase">Monday - Friday</p>
//             <p>{contact.businessHours?.mondayToFriday || "-"}</p>
//             <p className="mb-0 text-uppercase">Saturday</p>
//             <p>{contact.businessHours?.saturday || "-"}</p>
//             <p className="mb-0 text-uppercase">Sunday</p>
//             <p>{contact.businessHours?.sunday || "-"}</p>
//           </div>

//           <div className="col-lg-4">
//             <h6 className="text-uppercase text-light mb-3">Social</h6>
//             <div className="d-flex">
//               {contact.socialLinks?.twitter && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.twitter}
//                 >
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.facebook && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.facebook}
//                 >
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.youtube && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.youtube}
//                 >
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.linkedin && (
//                 <a
//                   className="btn btn-square btn-light me-2"
//                   href={contact.socialLinks.linkedin}
//                 >
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-3">
//           <Button
//             variant="light"
//             onClick={() => router.push("/editorpages/contact-editor")}
//           >
//             ✏️ Edit Contact
//           </Button>
//         </div>
//       </section>
//     </Container>
//   );
// }

// ContactPagePreview.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default ContactPagePreview;


"use client";

import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

function ContactPagePreview() {
  const router = useRouter();
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
    socialLinks: {},
    businessHours: {},
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`);
        const data = await res.json();
        setContact(data);
      } catch (err) {
        console.error("❌ Failed to fetch contact info", err);
      }
    })();
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      <h4 className="fw-bold mb-4">📞 Contact Section Preview</h4>

      <section className="bg-dark rounded p-4 shadow-sm text-white">
        <h5 className="fw-bold text-white">Contact / Footer</h5>
        <div className="row">
          {/* Office Info */}
          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Our Office</h6>
            <p>
              <i className="fa fa-map-marker-alt text-primary me-2"></i>
              {contact.address || "-"}
            </p>
            <p>
              <i className="fa fa-phone-alt text-primary me-2"></i>
              {contact.phone || "-"}
            </p>
            <p>
              <i className="fa fa-envelope text-primary me-2"></i>
              {contact.email || "-"}
            </p>
          </div>

          {/* Business Hours */}
          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Business Hours</h6>
            <p className="mb-0 text-uppercase">Monday - Friday</p>
            <p>{contact.businessHours?.mondayToFriday || "-"}</p>
            <p className="mb-0 text-uppercase">Saturday</p>
            <p>{contact.businessHours?.saturday || "-"}</p>
            <p className="mb-0 text-uppercase">Sunday</p>
            <p>{contact.businessHours?.sunday || "-"}</p>
          </div>

          {/* Social Links */}
          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Social</h6>
            <div className="d-flex">
              {contact.socialLinks?.twitter && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={contact.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-twitter"></i>
                </a>
              )}
              {contact.socialLinks?.facebook && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={contact.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              )}
              {contact.socialLinks?.youtube && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={contact.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              )}
              {contact.socialLinks?.linkedin && (
                <a
                  className="btn btn-square btn-light me-2"
                  href={contact.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Button
            variant="light"
            onClick={() => router.push("/editorpages/contactS")}
          >
            ✏️ Edit Contact
          </Button>
        </div>
      </section>
    </Container>
  );
}

ContactPagePreview.getLayout = (page) => (
  <EditorDashboardLayout>{page}</EditorDashboardLayout>
);

export default ContactPagePreview;
