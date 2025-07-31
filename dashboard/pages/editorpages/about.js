// // dashboard/pages/editorpages/about.js
// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Form,
//   Alert,
//   Table,
// } from "react-bootstrap";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// function AboutEditorPage() {
//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     imageUrl: "",
//     imageAlt: "",
//     bullets: [],
//   });
//   const [success, setSuccess] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
//       const data = await res.json();
//       if (data) setAbout((p) => ({ ...p, ...data }));
//     })();
//   }, []);

//   const handleChange = (key, value) => {
//     setAbout((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleBulletChange = (idx, value) => {
//     const updated = [...about.bullets];
//     updated[idx].text = value;
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };

//   const addBullet = () => {
//     setAbout((p) => ({ ...p, bullets: [...(p.bullets || []), { text: "" }] }));
//   };

//   const removeBullet = (idx) => {
//     const updated = [...about.bullets];
//     updated.splice(idx, 1);
//     setAbout((p) => ({ ...p, bullets: updated }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     try {
//       const res = await fetch(
//         `${backendBaseUrl}/api/about/${userId}/${templateId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(about),
//         }
//       );
//       const data = await res.json();
//       if (data.message) setSuccess("✅ Saved!");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUploadImage = async (e) => {
//     if (!e.target.files?.length) return;
//     setUploading(true);
//     try {
//       const form = new FormData();
//       form.append("image", e.target.files[0]);

//       const res = await fetch(
//         `${backendBaseUrl}/api/about/${userId}/${templateId}/image`,
//         { method: "POST", body: form }
//       );
//       const data = await res.json();
//       if (data?.result?.imageUrl) {
//         setAbout((p) => ({ ...p, imageUrl: data.result.imageUrl }));
//         setSuccess("✅ Image uploaded!");
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Container fluid className="py-4">
//       <Row>
//         <Col>
//           <h4 className="fw-bold">ℹ️ About Section</h4>
//         </Col>
//       </Row>

//       {success && <Alert variant="success">{success}</Alert>}

//     {/* Live preview styled like frontend */}
// <Row className="mb-4">
//   <Col>
//     <Card className="p-4">
//       <div className="row g-5">
//         <div className="col-lg-6">
//         <img
//   src={`${backendBaseUrl}${about.imageUrl || "/img/about.jpg"}`}
//   alt={about.imageAlt || "About Image"}
//   className="img-fluid"
//   style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
// />

//         </div>
//         <div className="col-lg-6">
//           <h1 className="display-6 text-uppercase mb-4">
//             {about.title || "About title..."}
//           </h1>
//           <p className="mb-4">{about.description || "Description..."}</p>

//           <div className="row g-5 mb-4">
//             {(about.bullets || []).map((b, i) => (
//               <div key={i} className="col-sm-6">
//                 <div className="d-flex align-items-center">
//                   <div className="flex-shrink-0 btn-xl-square bg-light me-3">
//                     <i className="fa fa-check-square fa-2x text-primary"></i>
//                   </div>
//                   <h5 className="lh-base text-uppercase mb-0">{b.text}</h5>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border border-5 border-primary p-4 text-center mt-4">
//             <h4 className="lh-base text-uppercase mb-0">
//               {about.highlight || "Highlight text..."}
//             </h4>
//           </div>
//         </div>
//       </div>
//     </Card>
//   </Col>
// </Row>


//       {/* Editor */}
//       <Card className="p-4 shadow-sm">
//         <Row className="mb-3">
//           <Col md={8}>
//             <Form.Group>
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 value={about.title || ""}
//                 onChange={(e) => handleChange("title", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Image (upload)</Form.Label>
//               <Form.Control type="file" onChange={handleUploadImage} />
//               {uploading && <small className="text-muted">Uploading…</small>}
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col>
//             <Form.Group>
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={4}
//                 value={about.description || ""}
//                 onChange={(e) => handleChange("description", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col>
//             <Form.Group>
//               <Form.Label>Highlight (bottom bordered text)</Form.Label>
//               <Form.Control
//                 value={about.highlight || ""}
//                 onChange={(e) => handleChange("highlight", e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//         </Row>

//         <h6 className="fw-bold mt-3 mb-2">Bullets</h6>
//         <Table striped bordered>
//           <thead>
//             <tr>
//               <th style={{ width: "80%" }}>Text</th>
//               <th style={{ width: "20%" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(about.bullets || []).map((b, idx) => (
//               <tr key={idx}>
//                 <td>
//                   <Form.Control
//                     value={b.text}
//                     onChange={(e) => handleBulletChange(idx, e.target.value)}
//                   />
//                 </td>
//                 <td>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => removeBullet(idx)}
//                   >
//                     ❌ Remove
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             <tr>
//               <td colSpan={2}>
//                 <Button variant="outline-primary" size="sm" onClick={addBullet}>
//                   ➕ Add Bullet
//                 </Button>
//               </td>
//             </tr>
//           </tbody>
//         </Table>

//         <div className="d-flex justify-content-end">
//           <Button onClick={handleSave} disabled={saving}>
//           {saving ? "Saving…" : "💾 Save"}
//           </Button>
//         </div>
//       </Card>
//     </Container>
//   );
// }

// AboutEditorPage.getLayout = (page) => (
//   <EditorDashboardLayout>{page}</EditorDashboardLayout>
// );

// export default AboutEditorPage;
// pages/editorpages/about-preview.js
import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

const backendBaseUrl = "http://localhost:5000";
const userId = "demo-user";
const templateId = "gym-template-1";

export default function AboutPagePreview() {
  const router = useRouter();

  const [about, setAbout] = useState({
    title: "",
    description: "",
    highlight: "",
    bullets: [],
    imageUrl: "",
  });

  const [services, setServices] = useState([]);

  const [whychoose, setWhychoose] = useState({
    description: "",
    stats: [],
    progressBars: [],
    bgImageUrl: "",
    bgOverlay: 0.5,
  });
const [appointment, setAppointment] = useState({
    title: "",
    description: "",
    officeAddress: "",
    officeTime: "",
    bgImageUrl: "",
  });
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contact, setContact] = useState({});

  useEffect(() => {
    const fetchAbout = async () => {
      const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
      const data = await res.json();
      setAbout(data || {});
    };

    // const fetchServices = async () => {
    //   const res = await fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`);
    //   const data = await res.json();
    //   setServices(data.services || []);
    // };

    const fetchWhyChoose = async () => {
      const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`);
      const data = await res.json();
      setWhychoose(data || {});
    };

    const fetchServices = async () => {
      const res = await fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`);
      const data = await res.json();
      setServices(data.services || []);
    };

  const fetchAppointment = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`);
        const data = await res.json();
        setAppointment(data || {});
      } catch (err) {
        console.error("❌ Failed to load appointment section", err);
      }
    };
    const fetchTeam = async () => {
      const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`);
      const data = await res.json();
      setTeam(Array.isArray(data) ? data : []);
    };

    const fetchTestimonials = async () => {
      const res = await fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`);
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    };

    const fetchContact = async () => {
      const res = await fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`);
      const data = await res.json();
      setContact(data || {});
    };

    fetchAbout();
  
    fetchWhyChoose();
     fetchServices();
        fetchAppointment();
    fetchTeam();
    fetchTestimonials();
    fetchContact();
  }, []);

  return (
    <Container fluid className="p-4 bg-light">
      {/* ABOUT */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h3 className="fw-bold">About Section</h3>
        <div className="row">
          <div className="col-md-6">
            {about.imageUrl && (
              <img
                src={`${backendBaseUrl}${about.imageUrl}`}
                alt="About"
                className="img-fluid mb-3 rounded"
                style={{ maxHeight: "350px", objectFit: "cover" }}
              />
            )}
          </div>
          <div className="col-md-6">
            <h4>{about.title}</h4>
            <p>{about.description}</p>
            <div className="border p-3 mb-2">
              <strong>{about.highlight}</strong>
            </div>
            <ul>
              {(about.bullets || []).map((b) => (
                <li key={b._id || b.text}>{b.text}</li>
              ))}
            </ul>
            <Button variant="primary" onClick={() => router.push("/editorpages/aboutS")}>✏️ Edit About Section</Button>
          </div>
        </div>
      </section>

     
      {/* WHY CHOOSE US */}
      <section
        className="rounded shadow-sm mb-5 p-5 text-white"
        style={{
          backgroundImage: whychoose.bgImageUrl ? `url(${backendBaseUrl}${whychoose.bgImageUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h3 className="fw-bold mb-3 text-uppercase">Why You Should Choose Our Services</h3>
          <p>{whychoose.description || "Add a compelling reason here."}</p>

          <div className="row text-center mb-4">
            {(whychoose.stats || []).map((s, i) => (
              <div key={i} className="col-md-3 col-6 mb-3">
                <div className="border border-light p-3">
                  <h4 className="fw-bold">{s.value}</h4>
                  <div className="text-uppercase small">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top border-light pt-4">
            {(whychoose.progressBars || []).map((bar, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>{bar.label}</span>
                  <span>{bar.percent}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${bar.percent}%` }}
                    aria-valuenow={bar.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="light" onClick={() => router.push("/editorpages/why-choose")}>✏️ Edit Why Choose Us Section</Button>
          </div>
        </div>
      </section>
       {/* SERVICES */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h3 className="fw-bold">Services</h3>
        <div className="row">
          {services.map((item) => (
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
                    <a href={item.buttonHref} className="btn btn-outline-primary btn-sm">
                      {item.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => router.push("/editorpages/services")}>✏️ Edit Services</Button>
      </section>

       {/* ================= APPOINTMENT ================= */}
            <section
              className="rounded shadow-sm mb-5 p-5 text-dark"
              style={{
                backgroundImage: appointment.bgImageUrl
                  ? `url(${backendBaseUrl}${appointment.bgImageUrl})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,.7)",
                  zIndex: 1,
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <h3 className="fw-bold mb-3 text-uppercase">{appointment.title || "Appointment"}</h3>
                <p>{appointment.description || ""}</p>
      
                <div className="mb-3">
                  <strong>Office Address:</strong> {appointment.officeAddress || "-"}
                </div>
                <div className="mb-3">
                  <strong>Office Time:</strong> {appointment.officeTime || "-"}
                </div>
      
                <Button variant="primary" onClick={() => router.push("/editorpages/appointment-editor")}>
                  ✏️ Edit Appointment Section
                </Button>
              </div>
            </section>

      {/* TEAM */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h3 className="fw-bold">Team</h3>
        <div className="row">
          {team.map((m) => (
            <div className="col-md-3 mb-4" key={m._id}>
              <div className="card h-100 text-center">
                {m.imageUrl && (
                  <img
                    src={m.imageUrl.startsWith("http") ? m.imageUrl : `${backendBaseUrl}${m.imageUrl}`}
                    alt={m.name}
                    className="card-img-top"
                    style={{ height: 220, objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title text-uppercase">{m.name}</h5>
                  <p className="card-text text-muted">{m.role || m.profession}</p>
                  {(m.socialLinks || []).map((s, i) => (
                    <a key={i} href={s.href} className="btn btn-sm btn-outline-primary me-1">
                      <i className={s.icon}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => router.push("/editorpages/team-editor")}>✏️ Edit Team</Button>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white rounded p-4 shadow-sm mb-5">
        <h3 className="fw-bold">Testimonials</h3>
        {testimonials.length === 0 ? (
          <p className="text-muted">No testimonials yet.</p>
        ) : (
          <div className="row">
            {testimonials.slice(0, 6).map((t) => (
              <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
                <div className="border p-3 h-100">
                  <div className="d-flex align-items-center mb-3">
                    {t.imageUrl && (
                      <img
                        src={t.imageUrl.startsWith("http") ? t.imageUrl : `${backendBaseUrl}${t.imageUrl}`}
                        alt={t.name}
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%", marginRight: 12 }}
                      />
                    )}
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
        )}
        <Button variant="primary" onClick={() => router.push("/editorpages/testimonial-editor")}>✏️ Edit Testimonials</Button>
      </section>

      {/* CONTACT */}
      <section className="bg-dark rounded p-4 shadow-sm mb-5 text-white">
        <h3 className="fw-bold text-white">Contact / Footer</h3>
        <div className="row">
          <div className="col-lg-4">
            <h5 className="text-uppercase text-light mb-3">Our Office</h5>
            <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-2"></i>{contact.address}</p>
            <p className="mb-2"><i className="fa fa-phone-alt text-primary me-2"></i>{contact.phone}</p>
            <p className="mb-2"><i className="fa fa-envelope text-primary me-2"></i>{contact.email}</p>
          </div>

          <div className="col-lg-4">
            <h5 className="text-uppercase text-light mb-3">Business Hours</h5>
            <p className="mb-0 text-uppercase">Monday - Friday</p>
            <p>{contact.businessHours?.mondayToFriday || "-"}</p>
            <p className="mb-0 text-uppercase">Saturday</p>
            <p>{contact.businessHours?.saturday || "-"}</p>
            <p className="mb-0 text-uppercase">Sunday</p>
            <p>{contact.businessHours?.sunday || "-"}</p>
          </div>

          <div className="col-lg-4">
            <h5 className="text-uppercase text-light mb-3">Social</h5>
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
          <Button variant="light" onClick={() => router.push("/editorpages/contact-editor")}>✏️ Edit Contact / Footer</Button>
        </div>
      </section>
    </Container>
  );
}

AboutPagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
