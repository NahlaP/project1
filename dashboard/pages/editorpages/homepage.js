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






// "use client";

// import { useEffect, useState } from "react";
// import { Button, Container, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId, backendBaseUrl } from "../../lib/config";
// import { SectionsApi } from "../../lib/sectionsApi";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import HeroSectionPreview from "./hero";
// import AboutViewer from "./aboutE";
// import WhyChooseEditorPage from "./why-chooseE";
// import ServicesPagePreview from "./servicesE";
// import AppointmentPreview from "./appointmentE";
// import TeamPagePreview from "./teamE";
// import TestimonialsPagePreview from "./testimonialE";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPencil,
//   faXmark,
//   faGripVertical,
//   faRocket,
//   faInfoCircle,
//   faStar,
//   faWrench,
//   faCalendarCheck,
//   faUsers,
//   faCommentDots,
// } from "@fortawesome/free-solid-svg-icons";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const [sections, setSections] = useState([]);
//   const [dragEnabled, setDragEnabled] = useState(false);
//   const [hero, setHero] = useState({ content: "", imageUrl: "" });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await SectionsApi.list(userId, templateId);
//         const homepageSections = res.data.filter((s) => s.parentPageId === null);
//         const sorted = homepageSections.sort((a, b) => a.order - b.order);
//         setSections(sorted);

//         const heroRes = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
//         const heroData = await heroRes.json();
//         setHero(heroData || {});
//       } catch (err) {
//         console.error("Error fetching sections", err);
//       }
//     };
//     fetchData();
//   }, []);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = Array.from(sections);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     setSections(reordered);

//     try {
//       const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
//       await SectionsApi.reorder(userId, templateId, updates);
//     } catch (err) {
//       console.error("Failed to save reorder", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this section?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setSections(sections.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleAddSection = async (type, label, index) => {
//     try {
//       const newSection = {
//         type,
//         title: label,
//         parentPageId: null,
//         order: index + 1,
//       };
//       await SectionsApi.create(userId, templateId, newSection);
//       const res = await SectionsApi.list(userId, templateId);
//       const homepageSections = res.data.filter((s) => s.parentPageId === null);
//       const sorted = homepageSections.sort((a, b) => a.order - b.order);
//       setSections(sorted);
//     } catch (err) {
//       console.error("Failed to add section:", err);
//       alert("❌ Error adding section");
//     }
//   };

//   const sectionOptions = [
//     { type: "hero", label: "Hero" },
//     { type: "about", label: "About" },
//     { type: "whychooseus", label: "Why Choose Us Section" },
//     { type: "services", label: "Services" },
//     { type: "appointment", label: "Appointment" },
//     { type: "team", label: "Team" },
//     { type: "testimonials", label: "Testimonials" },
//   ];

//   const iconMap = {
//     hero: faRocket,
//     about: faInfoCircle,
//     whychooseus: faStar,
//     services: faWrench,
//     appointment: faCalendarCheck,
//     team: faUsers,
//     testimonials: faCommentDots,
//   };

//   const renderPreview = (section) => {
//     const style = {
//       height: "100%",
//       overflowY: "auto",
//     };

//     switch (section.type) {
//       case "hero":
//         return <div style={style}><HeroSectionPreview /></div>;
//       case "about":
//         return <div style={style}><AboutViewer /></div>;
//       case "whychooseus":
//         return <div style={style}><WhyChooseEditorPage /></div>;
//       case "services":
//         return <div style={style}><ServicesPagePreview /></div>;
//       case "appointment":
//         return <div style={style}><AppointmentPreview /></div>;
//       case "team":
//         return <div style={style}><TeamPagePreview /></div>;
//       case "testimonials":
//         return <div style={style}><TestimonialsPagePreview /></div>;
//       default:
//         return <div className="text-muted">No preview available for this section.</div>;
//     }
//   };

//   return (
//     <Container className="py-5">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4 className="fw-bold">Homepage Sections</h4>
//         <div className="form-check form-switch">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             checked={dragEnabled}
//             onChange={() => setDragEnabled(!dragEnabled)}
//           />
//           <label className="form-check-label">Reorder Mode</label>
//         </div>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <Droppable droppableId="sections">
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//               {sections.map((section, index) => (
//                 <Draggable
//                   draggableId={section._id}
//                   index={index}
//                   key={section._id}
//                   isDragDisabled={!dragEnabled}
//                 >
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       className="mb-4 d-flex justify-content-center"
//                     >
//                       <div
//                         className="border bg-white p-4"
//                         style={{
//                           width: "896px",
//                           height: dragEnabled ? "160px" : "auto",
//                           borderRadius: "20px",
//                           display: "flex",
//                           flexDirection: "column",
//                           justifyContent: "space-between",
//                           transition: "height 0.3s ease",
//                           position: "relative",
//                         }}
//                       >
//                         {/* Header */}
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <div className="d-flex align-items-center gap-2">
//                             {dragEnabled && (
//                               <span
//                                 {...provided.dragHandleProps}
//                                 style={{ cursor: "grab", fontSize: "1.25rem", color: "#888" }}
//                               >
//                                 <FontAwesomeIcon icon={faGripVertical} />
//                               </span>
//                             )}
//                             <FontAwesomeIcon icon={iconMap[section.type]} style={{ color: "#FE3131" }} />
//                             <div>
//                               <h6 className="mb-0 fw-bold">{section.title}</h6>
//                               <small className="text-muted text-capitalize">{section.type}</small>
//                             </div>
//                           </div>
//                           <div className="d-flex gap-2">
//                             <Button
//                               variant="link"
//                               size="sm"
//                               onClick={() => router.push(`/editorpages/${section.type}E`)}
//                               style={{ color: "#0d6efd" }}
//                             >
//                               <FontAwesomeIcon icon={faPencil} size="lg" />
//                             </Button>
//                             <Button
//                               variant="link"
//                               size="sm"
//                               onClick={() => handleDelete(section._id)}
//                               style={{ color: "#dc3545" }}
//                             >
//                               <FontAwesomeIcon icon={faXmark} size="lg" />
//                             </Button>
//                           </div>
//                         </div>

//                         {/* Preview */}
//                         <div
//                           style={{
//                             height: dragEnabled ? "60px" : "auto",
//                             overflow: dragEnabled ? "hidden" : "visible",
//                             opacity: dragEnabled ? 0.4 : 1,
//                             transition: "all 0.3s ease-in-out",
//                             flexGrow: 1,
//                           }}
//                         >
//                           {renderPreview(section)}
//                         </div>

//                         {/* Add Section Below */}
//                         <div className="text-center mt-3">
//                           <Dropdown>
//                             <Dropdown.Toggle variant="outline-dark" size="sm">
//                               ➕ Add Section Below
//                             </Dropdown.Toggle>
//                             <Dropdown.Menu>
//                               {sectionOptions.map((opt) => (
//                                 <Dropdown.Item
//                                   key={opt.type}
//                                   onClick={() => handleAddSection(opt.type, opt.label, index)}
//                                 >
//                                   {opt.label}
//                                 </Dropdown.Item>
//                               ))}
//                             </Dropdown.Menu>
//                           </Dropdown>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;




// "use client";

// import { useEffect, useState } from "react";
// import { Button, Container, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId, backendBaseUrl } from "../../lib/config";
// import { SectionsApi } from "../../lib/sectionsApi";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import HeroSectionPreview from "./hero";
// import AboutViewer from "./aboutE";
// import WhyChooseEditorPage from "./why-chooseE";
// import ServicesPagePreview from "./servicesE";
// import AppointmentPreview from "./appointmentE";
// import TeamPagePreview from "./teamE";
// import TestimonialsPagePreview from "./testimonialE";

// import {
//   faPencil,
//   faTrash,
//   faGripVertical,
//   faChevronDown,
//   faStar,
//   faInfoCircle,
//   faThumbsUp,
//   faBriefcase,
//   faCalendarAlt,
//   faUsers,
//   faCommentDots,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const [sections, setSections] = useState([]);
//   const [dragEnabled, setDragEnabled] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await SectionsApi.list(userId, templateId);
//         const homepageSections = res.data.filter((s) => s.parentPageId === null);
//         const sorted = homepageSections.sort((a, b) => a.order - b.order);
//         setSections(sorted);
//       } catch (err) {
//         console.error("Error fetching sections", err);
//       }
//     };
//     fetchData();
//   }, []);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = Array.from(sections);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     setSections(reordered);

//     try {
//       const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
//       await SectionsApi.reorder(userId, templateId, updates);
//     } catch (err) {
//       console.error("Failed to save reorder", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this section?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setSections(sections.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleAddSection = async (type, label, index) => {
//     try {
//       const newSection = {
//         type,
//         title: label,
//         parentPageId: null,
//         order: index + 1,
//       };
//       await SectionsApi.create(userId, templateId, newSection);
//       const res = await SectionsApi.list(userId, templateId);
//       const homepageSections = res.data.filter((s) => s.parentPageId === null);
//       const sorted = homepageSections.sort((a, b) => a.order - b.order);
//       setSections(sorted);
//     } catch (err) {
//       console.error("Failed to add section:", err);
//       alert("❌ Error adding section");
//     }
//   };

//   const sectionOptions = [
//     { type: "hero", label: "Hero" },
//     { type: "about", label: "About" },
//     { type: "whychooseus", label: "Why Choose Us" },
//     { type: "services", label: "Services" },
//     { type: "appointment", label: "Appointment" },
//     { type: "team", label: "Team" },
//     { type: "testimonials", label: "Testimonials" },
//   ];

//   const sectionIcons = {
//     hero: faStar,
//     about: faInfoCircle,
//     whychooseus: faThumbsUp,
//     services: faBriefcase,
//     appointment: faCalendarAlt,
//     team: faUsers,
//     testimonials: faCommentDots,
//   };

//   const renderPreview = (section) => {
//     switch (section.type) {
//       case "hero":
//         return <HeroSectionPreview />;
//       case "about":
//         return <AboutViewer />;
//       case "whychooseus":
//         return <WhyChooseEditorPage />;
//       case "services":
//         return <ServicesPagePreview />;
//       case "appointment":
//         return <AppointmentPreview />;
//       case "team":
//         return <TeamPagePreview />;
//       case "testimonials":
//         return <TestimonialsPagePreview />;
//       default:
//         return <div className="text-muted">No preview available.</div>;
//     }
//   };

//   return (
//     <Container className="py-5">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4 className="fw-bold">Homepage Sections</h4>
//         <div className="form-check form-switch">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             checked={dragEnabled}
//             onChange={() => setDragEnabled(!dragEnabled)}
//           />
//           <label className="form-check-label">Reorder Mode</label>
//         </div>
//       </div>

//       <DragDropContext onDragEnd={onDragEnd}>
//         <Droppable droppableId="sections">
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//               {sections.map((section, index) => (
//                 <Draggable
//                   key={section._id}
//                   draggableId={section._id}
//                   index={index}
//                   isDragDisabled={!dragEnabled}
//                 >
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       className="mb-4 d-flex justify-content-center"
//                     >
//                       <div
//                         className="bg-white shadow-sm p-4"
//                         style={{
//                           width: "896px",
//                           height: dragEnabled ? "160px" : "auto",
//                           borderRadius: "20px",
//                           display: "flex",
//                           flexDirection: "column",
//                           justifyContent: "space-between",
//                           transition: "height 0.3s ease",
//                           position: "relative",
//                         }}
//                       >
//                         {/* Header */}
//                         <div className="d-flex justify-content-between align-items-center mb-2">
//                           <div className="d-flex align-items-center gap-2">
//                             {dragEnabled && (
//                               <span
//                                 {...provided.dragHandleProps}
//                                 style={{ cursor: "grab", fontSize: "1.25rem", color: "#888" }}
//                               >
//                                 <FontAwesomeIcon icon={faGripVertical} />
//                               </span>
//                             )}
//                             <FontAwesomeIcon
//                               icon={sectionIcons[section.type]}
//                               className="me-2"
//                               style={{ color: "#FE3131" }}
//                             />
//                             <div>
//                               <h6 className="mb-0 fw-bold">{section.title}</h6>
//                               <small className="text-muted text-capitalize">{section.type}</small>
//                             </div>
//                           </div>

//                           {/* Dropdown */}
//                           <Dropdown align="end">
//                             <Dropdown.Toggle
//                               variant="link"
//                               bsPrefix="p-0 border-0 bg-transparent"
//                               style={{ fontSize: "1.2rem", color: "#333" }}
//                             >
//                               <FontAwesomeIcon icon={faChevronDown} />
//                             </Dropdown.Toggle>
//                             <Dropdown.Menu>
//                               <Dropdown.Item
//                                 onClick={() => router.push(`/editorpages/${section.type}E`)}
//                               >
//                                 <FontAwesomeIcon icon={faPencil} className="me-2" />
//                                 Edit
//                               </Dropdown.Item>
//                               <Dropdown.Item
//                                 onClick={() => handleDelete(section._id)}
//                                 className="text-danger"
//                               >
//                                 <FontAwesomeIcon icon={faTrash} className="me-2" />
//                                 Delete
//                               </Dropdown.Item>
//                             </Dropdown.Menu>
//                           </Dropdown>
//                         </div>

//                         {/* Content Preview */}
//                         <div
//                           style={{
//                             height: dragEnabled ? "60px" : "auto",
//                             overflow: dragEnabled ? "hidden" : "visible",
//                             opacity: dragEnabled ? 0.4 : 1,
//                             transition: "all 0.3s ease-in-out",
//                           }}
//                         >
//                           {renderPreview(section)}
//                         </div>

//                         {/* Add Section Below */}
//                         {/* <div className="text-center mt-3">
//                           <Dropdown>
//                             <Dropdown.Toggle variant="outline-dark" size="sm">
//                               ➕ Add Section Below
//                             </Dropdown.Toggle>
//                             <Dropdown.Menu>
//                               {sectionOptions.map((opt) => (
//                                 <Dropdown.Item
//                                   key={opt.type}
//                                   onClick={() => handleAddSection(opt.type, opt.label, index)}
//                                 >
//                                   {opt.label}
//                                 </Dropdown.Item>
//                               ))}
//                             </Dropdown.Menu>
//                           </Dropdown>
//                         </div> */}
//                         <div className="text-center mt-3">
//   <Dropdown>
//     <Dropdown.Toggle
//       as="button"
//       style={{
//         width: "860px",
//         height: "40px",
//         borderRadius: "20px",
//         border: "1px dashed #E1E1E1",
//         backgroundColor: "transparent",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 0,
//       }}
//     >
//      <span
//   style={{
//     color: "#666666",
//     fontWeight: "500",
//     fontSize: "14px",
//     display: "flex",
//     alignItems: "center",
//     gap: "6px",
//   }}
// >
//   <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
//   Add Section Below
// </span>

//     </Dropdown.Toggle>
//     <Dropdown.Menu>
//       {sectionOptions.map((opt) => (
//         <Dropdown.Item
//           key={opt.type}
//           onClick={() => handleAddSection(opt.type, opt.label, index)}
//         >
//           {opt.label}
//         </Dropdown.Item>
//       ))}
//     </Dropdown.Menu>
//   </Dropdown>
// </div>

//                       </div>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </Container>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;




// "use client";

// import { useEffect, useState } from "react";
// import { Button, Container, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import EditorDashboardLayout from "../layouts/EditorDashboardLayout";
// import { userId, templateId, backendBaseUrl } from "../../lib/config";
// import { SectionsApi } from "../../lib/sectionsApi";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import HeroSectionPreview from "./hero";
// import AboutViewer from "./aboutE";
// import WhyChooseEditorPage from "./why-chooseE";
// import ServicesPagePreview from "./servicesE";
// import AppointmentPreview from "./appointmentE";
// import TeamPagePreview from "./teamE";
// import TestimonialsPagePreview from "./testimonialE";
// import NavbarHeader from "layouts/navbars/NavbarHeader";
// import {
//   faPencil,
//   faTrash,
//   faGripVertical,
//   faChevronDown,
//   faStar,
//   faInfoCircle,
//   faThumbsUp,
//   faBriefcase,
//   faCalendarAlt,
//   faUsers,
//   faCommentDots,
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// export default function HomepagePreview() {
//   const router = useRouter();
//   const [sections, setSections] = useState([]);
//   const [dragEnabled, setDragEnabled] = useState(false);
//  const pageBg = "#F1F1F1";
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await SectionsApi.list(userId, templateId);
//         const homepageSections = res.data.filter((s) => s.parentPageId === null);
//         const sorted = homepageSections.sort((a, b) => a.order - b.order);
//         setSections(sorted);
//       } catch (err) {
//         console.error("Error fetching sections", err);
//       }
//     };
//     fetchData();
//   }, []);

//   const onDragEnd = async (result) => {
//     if (!result.destination) return;
//     const reordered = Array.from(sections);
//     const [moved] = reordered.splice(result.source.index, 1);
//     reordered.splice(result.destination.index, 0, moved);
//     setSections(reordered);

//     try {
//       const updates = reordered.map((s, i) => ({ _id: s._id, order: i }));
//       await SectionsApi.reorder(userId, templateId, updates);
//     } catch (err) {
//       console.error("Failed to save reorder", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this section?")) return;
//     try {
//       await SectionsApi.remove(id);
//       setSections(sections.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleAddSection = async (type, label, index) => {
//     try {
//       const newSection = {
//         type,
//         title: label,
//         parentPageId: null,
//         order: index + 1,
//       };
//       await SectionsApi.create(userId, templateId, newSection);
//       const res = await SectionsApi.list(userId, templateId);
//       const homepageSections = res.data.filter((s) => s.parentPageId === null);
//       const sorted = homepageSections.sort((a, b) => a.order - b.order);
//       setSections(sorted);
//     } catch (err) {
//       console.error("Failed to add section:", err);
//       alert("❌ Error adding section");
//     }
//   };

//   const sectionOptions = [
//     { type: "hero", label: "Hero" },
//     { type: "about", label: "About" },
//     { type: "whychooseus", label: "Why Choose Us" },
//     { type: "services", label: "Services" },
//     { type: "appointment", label: "Appointment" },
//     { type: "team", label: "Team" },
//     { type: "testimonials", label: "Testimonials" },
//   ];

//   const sectionIcons = {
//     hero: faStar,
//     about: faInfoCircle,
//     whychooseus: faThumbsUp,
//     services: faBriefcase,
//     appointment: faCalendarAlt,
//     team: faUsers,
//     testimonials: faCommentDots,
//   };

//   const renderPreview = (section) => {
//     switch (section.type) {
//       case "hero":
//         return <HeroSectionPreview />;
//       case "about":
//         return <AboutViewer />;
//       case "whychooseus":
//         return <WhyChooseEditorPage />;
//       case "services":
//         return <ServicesPagePreview />;
//       case "appointment":
//         return <AppointmentPreview />;
//       case "team":
//         return <TeamPagePreview />;
//       case "testimonials":
//         return <TestimonialsPagePreview />;
//       default:
//         return <div className="text-muted">No preview available.</div>;
//     }
//   };

//   return (

// <>
// <NavbarHeader/>
//     <div style={{ backgroundColor: "#E5E7EB", minHeight: "100vh", padding: "2rem" }}> 
   
//  <Container fluid>
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           {/* <h4 className="fw-bold">Homepage Sections</h4> */}
//           <div className="form-check form-switch">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               checked={dragEnabled}
//               onChange={() => setDragEnabled(!dragEnabled)}
//             />
//             <label className="form-check-label">Reorder Mode</label>
//           </div>
//         </div>

//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="sections">
//             {(provided) => (
//               <div {...provided.droppableProps} ref={provided.innerRef}>
//                 {sections.map((section, index) => (
//                   <Draggable
//                     key={section._id}
//                     draggableId={section._id}
//                     index={index}
//                     isDragDisabled={!dragEnabled}
//                   >
//                     {(provided) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         className="mb-4 d-flex justify-content-center"
//                       >
//                         <div
//                           className="bg-white shadow-sm p-4"
//                           style={{
//                             width: "896px",
//                             height: dragEnabled ? "160px" : "auto",
//                             borderRadius: "20px",
//                             display: "flex",
//                             flexDirection: "column",
//                             justifyContent: "space-between",
//                             transition: "height 0.3s ease",
//                             position: "relative",
//                           }}
//                         >
//                           {/* Header */}
//                           <div className="d-flex justify-content-between align-items-center mb-2">
//                             <div className="d-flex align-items-center gap-2">
//                               {dragEnabled && (
//                                 <span
//                                   {...provided.dragHandleProps}
//                                   style={{ cursor: "grab", fontSize: "1.25rem", color: "#888" }}
//                                 >
//                                   <FontAwesomeIcon icon={faGripVertical} />
//                                 </span>
//                               )}
//                               <FontAwesomeIcon
//                                 icon={sectionIcons[section.type]}
//                                 className="me-2"
//                                 style={{ color: "#FE3131" }}
//                               />
//                               <div>
//                                 <h6 className="mb-0 fw-bold">{section.title}</h6>
//                                 <small className="text-muted text-capitalize">{section.type}</small>
//                               </div>
//                             </div>

//                             {/* Dropdown */}
//                             <Dropdown align="end">
//                               <Dropdown.Toggle
//                                 variant="link"
//                                 bsPrefix="p-0 border-0 bg-transparent"
//                                 style={{ fontSize: "1.2rem", color: "#333" }}
//                               >
//                                 <FontAwesomeIcon icon={faChevronDown} />
//                               </Dropdown.Toggle>
//                               <Dropdown.Menu>
//                                 <Dropdown.Item
//                                   onClick={() => router.push(`/editorpages/${section.type}E`)}
//                                 >
//                                   <FontAwesomeIcon icon={faPencil} className="me-2" />
//                                   Edit
//                                 </Dropdown.Item>
//                                 <Dropdown.Item
//                                   onClick={() => handleDelete(section._id)}
//                                   className="text-danger"
//                                 >
//                                   <FontAwesomeIcon icon={faTrash} className="me-2" />
//                                   Delete
//                                 </Dropdown.Item>
//                               </Dropdown.Menu>
//                             </Dropdown>
//                           </div>

//                           {/* Content Preview */}
//                           <div
//                             style={{
//                               height: dragEnabled ? "60px" : "auto",
//                               overflow: dragEnabled ? "hidden" : "visible",
//                               opacity: dragEnabled ? 0.4 : 1,
//                               transition: "all 0.3s ease-in-out",
//                             }}
//                           >
//                             {renderPreview(section)}
//                           </div>

//                           {/* Add Section Below */}
//                           <div className="text-center mt-3">
//                             <Dropdown>
//                               <Dropdown.Toggle
//                                 as="button"
//                                 style={{
//                                   width: "860px",
//                                   height: "40px",
//                                   borderRadius: "20px",
//                                   border: "1px dashed #E1E1E1",
//                                   backgroundColor: "transparent",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   padding: 0,
//                                 }}
//                               >
//                                 <span
//                                   style={{
//                                     color: "#666666",
//                                     fontWeight: "500",
//                                     fontSize: "14px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: "6px",
//                                   }}
//                                 >
//                                   <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
//                                   Add Section Below
//                                 </span>
//                               </Dropdown.Toggle>
//                               <Dropdown.Menu>
//                                 {sectionOptions.map((opt) => (
//                                   <Dropdown.Item
//                                     key={opt.type}
//                                     onClick={() => handleAddSection(opt.type, opt.label, index)}
//                                   >
//                                     {opt.label}
//                                   </Dropdown.Item>
//                                 ))}
//                               </Dropdown.Menu>
//                             </Dropdown>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </Container>
//     </div>
//     </>
//   );
// }

// HomepagePreview.getLayout = (page) => <EditorDashboardLayout>{page}</EditorDashboardLayout>;
