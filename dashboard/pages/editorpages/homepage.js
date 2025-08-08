// before backend
// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\homepage.js
// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";

// const backendBaseUrl = "http://localhost:5000";
// const userId = "demo-user";
// const templateId = "gym-template-1";

// export default function HomepagePreview() {
//   const router = useRouter();

//   // ============ STATE ============
//   const [hero, setHero] = useState({ content: "", imageUrl: "" });

//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     bullets: [],
//     imageUrl: "",
//   });

 

//   const [whychoose, setWhychoose] = useState({
//     description: "",
//     stats: [],
//     progressBars: [],
//     bgImageUrl: "",
//     bgOverlay: 0.5,
//   });

//    const [services, setServices] = useState([]);
//   const [appointment, setAppointment] = useState({
//     title: "",
//     description: "",
//     officeAddress: "",
//     officeTime: "",
//     bgImageUrl: "",
//   });

//   const [team, setTeam] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);

//   const [contact, setContact] = useState({
//     address: "",
//     phone: "",
//     email: "",
//     socialLinks: {},
//     businessHours: {},
//   });

//   // ============ FETCH ============
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

//     const fetchAbout = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`);
//         const data = await res.json();
//         setAbout(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load about section", err);
//       }
//     };

//     const fetchServices = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`);
//         const data = await res.json();
//         setServices(data.services || []);
//       } catch (err) {
//         console.error("❌ Failed to load services", err);
//       }
//     };

//     const fetchWhyChoose = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`);
//         const data = await res.json();
//         setWhychoose(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load why choose us section", err);
//       }
//     };

//     const fetchAppointment = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`);
//         const data = await res.json();
//         setAppointment(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load appointment section", err);
//       }
//     };

//     const fetchTeam = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`);
//         const data = await res.json();
//         setTeam(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("❌ Failed to load team", err);
//       }
//     };

//     const fetchTestimonials = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`);
//         const data = await res.json();
//         setTestimonials(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("❌ Failed to load testimonials", err);
//       }
//     };

//     const fetchContact = async () => {
//       try {
//         const res = await fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`);
//         const data = await res.json();
//         setContact(data || {});
//       } catch (err) {
//         console.error("❌ Failed to load contact info", err);
//       }
//     };

//     fetchHero();
//     fetchAbout();

//     fetchWhyChoose();
//         fetchServices();
//     fetchAppointment();
//     fetchTeam();
//     fetchTestimonials();
//     fetchContact();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* ================= HERO ================= */}
//       <section className="mb-5">
//         <h3 className="fw-bold">Hero Section</h3>
//         <div id="header-carousel" className="carousel slide">
//           <div className="carousel-inner">
//           <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
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
//                   <Button variant="light" className="py-3 px-4" onClick={() => router.push("/editorpages/heroS")}>
//                     ✏️ Edit Hero Section
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= ABOUT ================= */}
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
//             <Button variant="primary" onClick={() => router.push("/editorpages/about")}>
//               ✏️ Edit About Section
//             </Button>
//           </div>
//         </div>
//       </section>

   

//       {/* ================= WHY CHOOSE US ================= */}
//       <section
//         className="rounded shadow-sm mb-5 p-5 text-white"
//         style={{
//           backgroundImage: whychoose.bgImageUrl ? `url(${backendBaseUrl}${whychoose.bgImageUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           position: "relative",
//         }}
//       >
//         {/* Overlay */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
//             zIndex: 1,
//           }}
//         />
//         <div style={{ position: "relative", zIndex: 2 }}>
//           <h3 className="fw-bold mb-3 text-uppercase">Why You Should Choose Our Services</h3>
//           <p>{whychoose.description || "Add a compelling reason here."}</p>

//           <div className="row text-center mb-4">
//             {(whychoose.stats || []).map((s, i) => (
//               <div key={i} className="col-md-3 col-6 mb-3">
//                 <div className="border border-light p-3">
//                   <h4 className="fw-bold">{s.value}</h4>
//                   <div className="text-uppercase small">{s.label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border-top border-light pt-4">
//             {(whychoose.progressBars || []).map((bar, i) => (
//               <div key={i} className="mb-3">
//                 <div className="d-flex justify-content-between mb-1">
//                   <span>{bar.label}</span>
//                   <span>{bar.percent}%</span>
//                 </div>
//                 <div className="progress">
//                   <div
//                     className="progress-bar bg-primary"
//                     role="progressbar"
//                     style={{ width: `${bar.percent}%` }}
//                     aria-valuenow={bar.percent}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-4">
//             <Button variant="light" onClick={() => router.push("/editorpages/why-choose")}>
//               ✏️ Edit Why Choose Us Section
//             </Button>
//           </div>
//         </div>
//       </section>
//  {/* ================= SERVICES ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Services</h3>
//         <div className="row">
//           {services.map((item) => (
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
//                     <a href={item.buttonHref} className="btn btn-outline-primary btn-sm">
//                       {item.buttonText}
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button variant="primary" onClick={() => router.push("/editorpages/services")}>
//           ✏️ Edit Services
//         </Button>
//       </section>

//       {/* ================= APPOINTMENT ================= */}
//       <section
//         className="rounded shadow-sm mb-5 p-5 text-dark"
//         style={{
//           backgroundImage: appointment.bgImageUrl
//             ? `url(${backendBaseUrl}${appointment.bgImageUrl})`
//             : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           position: "relative",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(255,255,255,.7)",
//             zIndex: 1,
//           }}
//         />
//         <div style={{ position: "relative", zIndex: 2 }}>
//           <h3 className="fw-bold mb-3 text-uppercase">{appointment.title || "Appointment"}</h3>
//           <p>{appointment.description || ""}</p>

//           <div className="mb-3">
//             <strong>Office Address:</strong> {appointment.officeAddress || "-"}
//           </div>
//           <div className="mb-3">
//             <strong>Office Time:</strong> {appointment.officeTime || "-"}
//           </div>

//           <Button variant="primary" onClick={() => router.push("/editorpages/appointment-editor")}>
//             ✏️ Edit Appointment Section
//           </Button>
//         </div>
//       </section>

//       {/* ================= TEAM ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Team</h3>
//         <div className="row">
//           {team.map((m) => (
//             <div className="col-md-3 mb-4" key={m._id}>
//               <div className="card h-100 text-center">
//                 {m.imageUrl && (
//                   <img
//                     src={m.imageUrl.startsWith("http") ? m.imageUrl : `${backendBaseUrl}${m.imageUrl}`}
//                     alt={m.name}
//                     className="card-img-top"
//                     style={{ height: 220, objectFit: "cover" }}
//                   />
//                 )}
//                 <div className="card-body">
//                   <h5 className="card-title text-uppercase">{m.name}</h5>
//                   <p className="card-text text-muted">{m.role || m.profession}</p>
//                   {(m.socialLinks || []).map((s, i) => (
//                     <a key={i} href={s.href} className="btn btn-sm btn-outline-primary me-1">
//                       <i className={s.icon}></i>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button variant="primary" onClick={() => router.push("/editorpages/team-editor")}>
//           ✏️ Edit Team
//         </Button>
//       </section>

//       {/* ================= TESTIMONIALS ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Testimonials</h3>
//         {testimonials.length === 0 ? (
//           <p className="text-muted">No testimonials yet.</p>
//         ) : (
//           <div className="row">
//             {testimonials.slice(0, 6).map((t) => (
//               <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
//                 <div className="border p-3 h-100">
//                   <div className="d-flex align-items-center mb-3">
//                     {t.imageUrl && (
//                       <img
//                         src={t.imageUrl.startsWith("http") ? t.imageUrl : `${backendBaseUrl}${t.imageUrl}`}
//                         alt={t.name}
//                         style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%", marginRight: 12 }}
//                       />
//                     )}
//                     <div>
//                       <strong className="text-uppercase d-block">{t.name}</strong>
//                       <small className="text-muted">{t.profession}</small>
//                     </div>
//                   </div>
//                   <p className="mb-2">{t.message}</p>
//                   <div className="text-warning">
//                     {Array.from({ length: t.rating || 5 }).map((_, i) => (
//                       <i className="fas fa-star" key={i}></i>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <Button variant="primary" onClick={() => router.push("/editorpages/testimonial-editor")}>
//           ✏️ Edit Testimonials
//         </Button>
//       </section>

//       {/* ================= CONTACT / FOOTER ================= */}
//       <section className="bg-dark rounded p-4 shadow-sm mb-5 text-white">
//         <h3 className="fw-bold text-white">Contact / Footer</h3>
//         <div className="row">
//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Our Office</h5>
//             <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-2"></i>{contact.address}</p>
//             <p className="mb-2"><i className="fa fa-phone-alt text-primary me-2"></i>{contact.phone}</p>
//             <p className="mb-2"><i className="fa fa-envelope text-primary me-2"></i>{contact.email}</p>
//           </div>

//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Business Hours</h5>
//             <p className="mb-0 text-uppercase">Monday - Friday</p>
//             <p>{contact.businessHours?.mondayToFriday || "-"}</p>
//             <p className="mb-0 text-uppercase">Saturday</p>
//             <p>{contact.businessHours?.saturday || "-"}</p>
//             <p className="mb-0 text-uppercase">Sunday</p>
//             <p>{contact.businessHours?.sunday || "-"}</p>
//           </div>

//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Social</h5>
//             <div className="d-flex">
//               {contact.socialLinks?.twitter && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.twitter}>
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.facebook && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.facebook}>
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.youtube && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.youtube}>
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.linkedin && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.linkedin}>
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-3">
//           <Button variant="light" onClick={() => router.push("/editorpages/contact-editor")}>
//             ✏️ Edit Contact / Footer
//           </Button>
//         </div>
//       </section>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;













// after backend url given(render)

// // C:\Users\97158\Desktop\project1\dashboard\pages\editorpages\homepage.js
// import { useEffect, useState } from "react";
// import { Button, Container } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { backendBaseUrl, userId, templateId } from "../../lib/config";

// export default function HomepagePreview() {
//   const router = useRouter();

//   const [hero, setHero] = useState({ content: "", imageUrl: "" });

//   const [about, setAbout] = useState({
//     title: "",
//     description: "",
//     highlight: "",
//     bullets: [],
//     imageUrl: "",
//   });

//   const [whychoose, setWhychoose] = useState({
//     description: "",
//     stats: [],
//     progressBars: [],
//     bgImageUrl: "",
//     bgOverlay: 0.5,
//   });

//   const [services, setServices] = useState([]);
//   const [appointment, setAppointment] = useState({
//     title: "",
//     description: "",
//     officeAddress: "",
//     officeTime: "",
//     bgImageUrl: "",
//   });

//   const [team, setTeam] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);

//   const [contact, setContact] = useState({
//     address: "",
//     phone: "",
//     email: "",
//     socialLinks: {},
//     businessHours: {},
//   });

//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [heroRes, aboutRes, whyRes, servicesRes, appRes, teamRes, testRes, contactRes] = await Promise.all([
//           fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/about/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/whychoose/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/services/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/testimonial/${userId}/${templateId}`),
//           fetch(`${backendBaseUrl}/api/contact-info/${userId}/${templateId}`),
//         ]);

//         setHero(await heroRes.json());
//         setAbout(await aboutRes.json());
//         setWhychoose(await whyRes.json());
//         setServices((await servicesRes.json()).services || []);
//         setAppointment(await appRes.json());
//         setTeam(Array.isArray(await teamRes.json()) ? await teamRes.json() : []);
//         setTestimonials(Array.isArray(await testRes.json()) ? await testRes.json() : []);
//         setContact(await contactRes.json());
//       } catch (err) {
//         console.error("❌ Error fetching homepage data:", err);
//       }
//     };

//     fetchAll();
//   }, []);

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* ================= HERO ================= */}
//       <section className="mb-5">
//         <h3 className="fw-bold">Hero Section</h3>
//         <div id="header-carousel" className="carousel slide">
//           <div className="carousel-inner">
//           <div className="carousel-item active" style={{ minHeight: "100vh", position: "relative" }}>
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
//                   <Button variant="light" className="py-3 px-4" onClick={() => router.push("/editorpages/heroS")}>
//                     ✏️ Edit Hero Section
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= ABOUT ================= */}
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
//             <Button variant="primary" onClick={() => router.push("/editorpages/about")}>
//               ✏️ Edit About Section
//             </Button>
//           </div>
//         </div>
//       </section>

   

//       {/* ================= WHY CHOOSE US ================= */}
//       <section
//         className="rounded shadow-sm mb-5 p-5 text-white"
//         style={{
//           backgroundImage: whychoose.bgImageUrl ? `url(${backendBaseUrl}${whychoose.bgImageUrl})` : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           position: "relative",
//         }}
//       >
//         {/* Overlay */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: `rgba(0, 0, 0, ${whychoose.bgOverlay ?? 0.5})`,
//             zIndex: 1,
//           }}
//         />
//         <div style={{ position: "relative", zIndex: 2 }}>
//           <h3 className="fw-bold mb-3 text-uppercase">Why You Should Choose Our Services</h3>
//           <p>{whychoose.description || "Add a compelling reason here."}</p>

//           <div className="row text-center mb-4">
//             {(whychoose.stats || []).map((s, i) => (
//               <div key={i} className="col-md-3 col-6 mb-3">
//                 <div className="border border-light p-3">
//                   <h4 className="fw-bold">{s.value}</h4>
//                   <div className="text-uppercase small">{s.label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border-top border-light pt-4">
//             {(whychoose.progressBars || []).map((bar, i) => (
//               <div key={i} className="mb-3">
//                 <div className="d-flex justify-content-between mb-1">
//                   <span>{bar.label}</span>
//                   <span>{bar.percent}%</span>
//                 </div>
//                 <div className="progress">
//                   <div
//                     className="progress-bar bg-primary"
//                     role="progressbar"
//                     style={{ width: `${bar.percent}%` }}
//                     aria-valuenow={bar.percent}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-4">
//             <Button variant="light" onClick={() => router.push("/editorpages/why-choose")}>
//               ✏️ Edit Why Choose Us Section
//             </Button>
//           </div>
//         </div>
//       </section>
//  {/* ================= SERVICES ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Services</h3>
//         <div className="row">
//           {services.map((item) => (
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
//                     <a href={item.buttonHref} className="btn btn-outline-primary btn-sm">
//                       {item.buttonText}
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button variant="primary" onClick={() => router.push("/editorpages/services")}>
//           ✏️ Edit Services
//         </Button>
//       </section>

//       {/* ================= APPOINTMENT ================= */}
//       <section
//         className="rounded shadow-sm mb-5 p-5 text-dark"
//         style={{
//           backgroundImage: appointment.bgImageUrl
//             ? `url(${backendBaseUrl}${appointment.bgImageUrl})`
//             : "none",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           position: "relative",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background: "rgba(255,255,255,.7)",
//             zIndex: 1,
//           }}
//         />
//         <div style={{ position: "relative", zIndex: 2 }}>
//           <h3 className="fw-bold mb-3 text-uppercase">{appointment.title || "Appointment"}</h3>
//           <p>{appointment.description || ""}</p>

//           <div className="mb-3">
//             <strong>Office Address:</strong> {appointment.officeAddress || "-"}
//           </div>
//           <div className="mb-3">
//             <strong>Office Time:</strong> {appointment.officeTime || "-"}
//           </div>

//           <Button variant="primary" onClick={() => router.push("/editorpages/appointment-editor")}>
//             ✏️ Edit Appointment Section
//           </Button>
//         </div>
//       </section>

//       {/* ================= TEAM ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Team</h3>
//         <div className="row">
//           {team.map((m) => (
//             <div className="col-md-3 mb-4" key={m._id}>
//               <div className="card h-100 text-center">
//                 {m.imageUrl && (
//                   <img
//                     src={m.imageUrl.startsWith("http") ? m.imageUrl : `${backendBaseUrl}${m.imageUrl}`}
//                     alt={m.name}
//                     className="card-img-top"
//                     style={{ height: 220, objectFit: "cover" }}
//                   />
//                 )}
//                 <div className="card-body">
//                   <h5 className="card-title text-uppercase">{m.name}</h5>
//                   <p className="card-text text-muted">{m.role || m.profession}</p>
//                   {(m.socialLinks || []).map((s, i) => (
//                     <a key={i} href={s.href} className="btn btn-sm btn-outline-primary me-1">
//                       <i className={s.icon}></i>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <Button variant="primary" onClick={() => router.push("/editorpages/team-editor")}>
//           ✏️ Edit Team
//         </Button>
//       </section>

//       {/* ================= TESTIMONIALS ================= */}
//       <section className="bg-white rounded p-4 shadow-sm mb-5">
//         <h3 className="fw-bold">Testimonials</h3>
//         {testimonials.length === 0 ? (
//           <p className="text-muted">No testimonials yet.</p>
//         ) : (
//           <div className="row">
//             {testimonials.slice(0, 6).map((t) => (
//               <div className="col-md-6 col-lg-4 mb-4" key={t._id}>
//                 <div className="border p-3 h-100">
//                   <div className="d-flex align-items-center mb-3">
//                     {t.imageUrl && (
//                       <img
//                         src={t.imageUrl.startsWith("http") ? t.imageUrl : `${backendBaseUrl}${t.imageUrl}`}
//                         alt={t.name}
//                         style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%", marginRight: 12 }}
//                       />
//                     )}
//                     <div>
//                       <strong className="text-uppercase d-block">{t.name}</strong>
//                       <small className="text-muted">{t.profession}</small>
//                     </div>
//                   </div>
//                   <p className="mb-2">{t.message}</p>
//                   <div className="text-warning">
//                     {Array.from({ length: t.rating || 5 }).map((_, i) => (
//                       <i className="fas fa-star" key={i}></i>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//         <Button variant="primary" onClick={() => router.push("/editorpages/testimonial-editor")}>
//           ✏️ Edit Testimonials
//         </Button>
//       </section>

//       {/* ================= CONTACT / FOOTER ================= */}
//       <section className="bg-dark rounded p-4 shadow-sm mb-5 text-white">
//         <h3 className="fw-bold text-white">Contact / Footer</h3>
//         <div className="row">
//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Our Office</h5>
//             <p className="mb-2"><i className="fa fa-map-marker-alt text-primary me-2"></i>{contact.address}</p>
//             <p className="mb-2"><i className="fa fa-phone-alt text-primary me-2"></i>{contact.phone}</p>
//             <p className="mb-2"><i className="fa fa-envelope text-primary me-2"></i>{contact.email}</p>
//           </div>

//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Business Hours</h5>
//             <p className="mb-0 text-uppercase">Monday - Friday</p>
//             <p>{contact.businessHours?.mondayToFriday || "-"}</p>
//             <p className="mb-0 text-uppercase">Saturday</p>
//             <p>{contact.businessHours?.saturday || "-"}</p>
//             <p className="mb-0 text-uppercase">Sunday</p>
//             <p>{contact.businessHours?.sunday || "-"}</p>
//           </div>

//           <div className="col-lg-4">
//             <h5 className="text-uppercase text-light mb-3">Social</h5>
//             <div className="d-flex">
//               {contact.socialLinks?.twitter && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.twitter}>
//                   <i className="fab fa-twitter"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.facebook && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.facebook}>
//                   <i className="fab fa-facebook-f"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.youtube && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.youtube}>
//                   <i className="fab fa-youtube"></i>
//                 </a>
//               )}
//               {contact.socialLinks?.linkedin && (
//                 <a className="btn btn-square btn-light me-2" href={contact.socialLinks.linkedin}>
//                   <i className="fab fa-linkedin-in"></i>
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-3">
//           <Button variant="light" onClick={() => router.push("/editorpages/contact-editor")}>
//             ✏️ Edit Contact / Footer
//           </Button>
//         </div>
//       </section>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;




