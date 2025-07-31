
"use client";

import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

const backendBaseUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

function TeamPagePreview() {
  const router = useRouter();
  const [team, setTeam] = useState([]);

  const [testimonials, setTestimonials] = useState([]);
  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
    socialLinks: {},
    businessHours: {},
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setTeam);

   

    fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setTestimonials);

    fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setContact);
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      <h4 className="fw-bold mb-4">👥 Team Page Preview</h4>

      {/* ================= TEAM ================= */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h5 className="fw-bold">Meet Our Team</h5>
        <div className="row">
          {team.map((member) => (
            <div className="col-md-3 mb-4" key={member._id}>
              <div className="card h-100 text-center">
                <img
                  src={`${backendBaseUrl}${member.imageUrl}`}
                  alt={member.name}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover" }}
                />
                <div className="card-body">
                  <h6 className="card-title text-uppercase">{member.name}</h6>
                  <p className="card-text text-muted">{member.role || member.profession}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => router.push("/editorpages/teamS")}>✏️ Edit Team</Button>
      </section>

     

      {/* ================= TESTIMONIALS ================= */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h5 className="fw-bold">Testimonials</h5>
        <div className="row">
          {testimonials.map((t) => (
            <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
              <div className="border p-3 h-100">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={`${backendBaseUrl}${t.imageUrl}`}
                    alt={t.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%", marginRight: 12 }}
                  />
                  <div>
                    <strong className="text-uppercase d-block">{t.name}</strong>
                    <small className="text-muted">{t.profession}</small>
                  </div>
                </div>
                <p className="mb-2">{t.message}</p>
                <div className="text-warning">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <i className="fas fa-star" key={i}></i>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => router.push("/editorpages/testimonial-editor")}>✏️ Edit Testimonials</Button>
      </section>

      {/* ================= CONTACT / FOOTER ================= */}
      <section className="bg-dark rounded p-4 shadow-sm mb-5 text-white">
        <h5 className="fw-bold text-white">Contact / Footer</h5>
        <div className="row">
          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Our Office</h6>
            <p><i className="fa fa-map-marker-alt text-primary me-2"></i>{contact.address}</p>
            <p><i className="fa fa-phone-alt text-primary me-2"></i>{contact.phone}</p>
            <p><i className="fa fa-envelope text-primary me-2"></i>{contact.email}</p>
          </div>

          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Business Hours</h6>
            <p className="mb-0 text-uppercase">Monday - Friday</p>
            <p>{contact.businessHours?.mondayToFriday || "-"}</p>
            <p className="mb-0 text-uppercase">Saturday</p>
            <p>{contact.businessHours?.saturday || "-"}</p>
            <p className="mb-0 text-uppercase">Sunday</p>
            <p>{contact.businessHours?.sunday || "-"}</p>
          </div>

          <div className="col-lg-4">
            <h6 className="text-uppercase text-light mb-3">Social</h6>
            <div className="d-flex">
              {contact.socialLinks?.twitter && (
                <a className="btn btn-square btn-light me-2" href={contact.socialLinks.twitter}>
                  <i className="fab fa-twitter"></i>
                </a>
              )}
              {contact.socialLinks?.facebook && (
                <a className="btn btn-square btn-light me-2" href={contact.socialLinks.facebook}>
                  <i className="fab fa-facebook-f"></i>
                </a>
              )}
              {contact.socialLinks?.youtube && (
                <a className="btn btn-square btn-light me-2" href={contact.socialLinks.youtube}>
                  <i className="fab fa-youtube"></i>
                </a>
              )}
              {contact.socialLinks?.linkedin && (
                <a className="btn btn-square btn-light me-2" href={contact.socialLinks.linkedin}>
                  <i className="fab fa-linkedin-in"></i>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Button variant="light" onClick={() => router.push("/editorpages/contact-editor")}>✏️ Edit Contact</Button>
        </div>
      </section>
    </Container>
  );
}

TeamPagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;

export default TeamPagePreview;
