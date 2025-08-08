


// import {
//   Container, Row, Col, Card, Button, Badge, ProgressBar
// } from 'react-bootstrap';
// import Link from "next/link"; 
// import {
//   FaPlusCircle, FaPaintBrush, FaChartLine, FaUserCircle, FaBell
// } from 'react-icons/fa';
// import { FaLock, FaInfoCircle } from 'react-icons/fa';

// export default function DashboardHome() {
//   return (
//     <Container fluid className="mt-6 px-4">
//       <h2 className="fw-bold">Dashboard</h2>
//       <p className="text-muted mb-4">Welcome back! Here&apos;s what&apos;s happening with your website.</p>

//       <Row className="g-4">
//         {/* Left Side */}
//         <Col md={8}>
//           <Row className="g-4">
//             {/* Subscription Card */}
//             <Col md={6}>
//               <Card className="shadow-sm h-100">
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <span className="text-muted">Subscription</span>
//                     <Badge bg="success">Active</Badge>
//                   </div>
//                   <h5 className="fw-bold">
//                     Pro Plan <Badge bg="light text-dark">CURRENT</Badge>
//                   </h5>
//                   <p className="fs-4 fw-bold text-dark">
//                     $49 <span className="fs-6 fw-normal text-muted">/month</span>
//                   </p>
//                   <div className="d-flex justify-content-between align-items-center mb-1">
//                     <span className="text-muted small">Next billing</span>
//                     <span className="text-muted small">15 days left</span>
//                   </div>
//                   <ProgressBar now={70} className="mb-2" />
//                   <p className="text-muted small mb-3">November 15, 2023 – $49.00</p>
//                   <div className="d-flex gap-2">
//                     <Button variant="primary" size="sm">Upgrade Plan</Button>
//                     <Button variant="outline-secondary" size="sm">Change Payment</Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>

//             {/* Domain Card */}
//             <Col md={6}>
//               <Card className="shadow-sm h-100">
//                 <Card.Body>
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <span className="text-muted">My Domain</span>
//                     <Badge bg="success">Active</Badge>
//                   </div>
//                   <p className="fw-semibold mb-2 text-success d-flex align-items-center">
//                     <FaLock className="me-2 text-success" size={14} /> sarah.ion7cms.com
//                   </p>
//                   <Card className="mb-3 bg-light p-2 small border-0">
//                     <span className="text-muted">
//                       <FaInfoCircle className="text-primary me-2" style={{ fontSize: '16px' }} />
//                       Want a custom domain? <br />
//                       <small><strong className="text-primary p-5">Connect your own domain like yoursite.com</strong></small>
//                     </span>
//                   </Card>
//                   <Button variant="primary" size="sm" className="w-100 fw-semibold">
//                     Customize Domain
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>

//             {/* Website Card */}
//             <Col md={12}>
//               <Card className="shadow-sm">
//                 <Card.Body className="d-flex align-items-center">
//                   <img
//                     src="/images/sample-thumbnail.jpg"
//                     className="rounded border me-3"
//                     alt="Website Thumbnail"
//                     style={{ width: '150px', height: 'auto' }}
//                   />
//                   <div style={{ flex: 1 }}>
//                     <h6 className="text-muted">My Website</h6>
//                     <div className="d-flex align-items-center mb-2">
//                       <div className="px-3 py-1 bg-light border rounded me-2">
//                         <strong>Sarah&rsquo;s Portfolio</strong>
//                       </div>
//                       <Badge bg="success">Published</Badge>
//                     </div>
//                     <p className="text-muted small mb-1">Last updated: 2 hours ago</p>
//                     <p className="text-muted small mb-3">Visitors this month: 1,247</p>
//                     <div className="d-flex gap-2">
//                       <Button as={Link} href="/editorpages/homepage" variant="primary" size="sm">
//                         Edit My Website
//                       </Button>
//                       <Button variant="outline-secondary" size="sm">Preview Site</Button>
//                     </div>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>

//             {/* Action Cards */}
//             <Col md={4}>
//               <Card className="h-100 shadow-sm text-center p-3">
//                 <Card.Body>
//                   <FaPlusCircle size={24} className="mb-2 text-primary" />
//                   <h6 className="fw-semibold">Add Content</h6>
//                   <p className="text-muted small">Create new pages or posts</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={4}>
//               <Card className="h-100 shadow-sm text-center p-3">
//                 <Card.Body>
//                   <FaPaintBrush size={24} className="mb-2 text-info" />
//                   <h6 className="fw-semibold">Customize Design</h6>
//                   <p className="text-muted small">Change themes and styles</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={4}>
//               <Card className="h-100 shadow-sm text-center p-3">
//                 <Card.Body>
//                   <FaChartLine size={24} className="mb-2 text-success" />
//                   <h6 className="fw-semibold">View Analytics</h6>
//                   <p className="text-muted small">Track your site performance</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Col>

//         <Col md={4}>
//           <div
//             className="position-fixed"
//             style={{
//               top: '0',
//               bottom: '0',
//               right: '0',
//               width: '320px',
//               paddingTop: '1rem',
//               paddingBottom: '1rem',
//               overflowY: 'auto',
//               zIndex: 1020,
//               backgroundColor: '#fff',
//               borderLeft: '1px solid #eee'
//             }}
//           >
//             <div className="d-flex justify-content-end gap-3 px-3 mb-2">
//               <FaBell size={18} className="text-muted" />
//               <FaUserCircle size={22} className="text-muted" />
//             </div>

//             <Card className="shadow-sm border-0">
//               <Card.Body>
//                 <h5 className="fw-bold mb-3">⚙️ Setup Guide</h5>
//                 <p className="text-muted small mb-4">
//                   Complete these steps to get the most out of ION7
//                 </p>

//                 <div className="mb-3 d-flex align-items-start bg-light p-3 rounded border border-success border-2">
//                   <span className="me-3 fs-5 text-success">✅</span>
//                   <div>
//                     <strong>Create your website</strong><br />
//                     <span className="text-muted small">Choose a template and customize it</span>
//                   </div>
//                 </div>

//                 <div className="mb-3 d-flex align-items-start">
//                   <Badge bg="primary" className="me-3">2</Badge>
//                   <div>
//                     <strong>Add your content</strong><br />
//                     <span className="text-muted small">Upload images and write your first post</span>
//                   </div>
//                 </div>

//                 <div className="mb-3 d-flex align-items-start">
//                   <Badge bg="secondary" className="me-3">3</Badge>
//                   <div>
//                     <strong>Connect a custom domain</strong><br />
//                     <span className="text-muted small">Use your own URL</span>
//                   </div>
//                 </div>

//                 <div className="mb-4 d-flex align-items-start">
//                   <Badge bg="secondary" className="me-3">4</Badge>
//                   <div>
//                     <strong>Set up analytics</strong><br />
//                     <span className="text-muted small">Track your visitors</span>
//                   </div>
//                 </div>

//                 <div className="mb-0">
//                   <div className="d-flex justify-content-between align-items-center mb-1">
//                     <p className="text-muted small mb-0">Progress</p>
//                     <span className="text-dark small fw-semibold">1 of 4 complete</span>
//                   </div>
//                   <ProgressBar now={25} />
//                 </div>
//               </Card.Body>
//             </Card>
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// }



// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Badge,
//   ProgressBar,
// } from "react-bootstrap";
// import Link from "next/link";
// import { FaBell, FaUserCircle } from "react-icons/fa";

// export default function DashboardHome() {
//   const red = "#FE3131";
//   const green = "#D5FF40";
//   const pageBg = "#F1F1F1";

//   return (
//     <div style={{ backgroundColor: pageBg, minHeight: "100vh", padding: "2rem" }}>
//       <Container fluid>
//         <h4 className="fw-bold">Welcome back, Marco!</h4>
//         <p className="text-muted">
//           Here's your website overview and next steps to complete your setup.
//         </p>

//         <Row className="g-4 mt-2">
//           {/* Subscription */}
//           <Col md={4}>
//             <Card className="shadow-sm h-100" style={{ backgroundColor: "#FFFFFF" }}>
//               <Card.Body>
//                 <h6>
//                   <Badge style={{ backgroundColor: green, color: "#000" }} className="me-2">
//                     Pro Plan
//                   </Badge>
//                   <Badge bg="secondary">Monthly</Badge>
//                 </h6>
//                 <h4 className="fw-bold">
//                   $29.99 <small className="text-muted fs-6 fw-normal">/month</small>
//                 </h4>
//                 <p className="text-muted small mb-1">
//                   Next billing date <strong>Feb 15, 2024</strong>
//                 </p>
//                 <p className="text-muted small mb-2">
//                   Storage used <strong>8.2GB / 50GB</strong>
//                 </p>
//                 <ProgressBar
//                   now={(8.2 / 50) * 100}
//                   className="mb-3"
//                   style={{ height: "6px", backgroundColor: "#ddd" }}
//                 />
//                 <Button variant="outline-dark" size="sm" className="w-100">
//                   Manage Subscription
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Domain */}
//           <Col md={4}>
//             <Card className="shadow-sm h-100" style={{ backgroundColor: "#FFFFFF" }}>
//               <Card.Body>
//                 <h5 className="fw-bold mb-2">marcobotton.com</h5>
//                 <Badge
//                   style={{ backgroundColor: green, color: "#000", fontWeight: 600 }}
//                   className="me-2"
//                 >
//                   Connected
//                 </Badge>
//                 <Badge
//                   style={{ backgroundColor: green, color: "#000", fontWeight: 600 }}
//                 >
//                   SSL Active
//                 </Badge>
//                 <p className="text-muted small mt-3 mb-0">
//                   Domain expires: <strong>Dec 25, 2024</strong>
//                 </p>
//                 <p className="text-muted small mb-3">
//                   DNS Status: <span className="text-success">Active</span>
//                 </p>
//                 <Button
//                   style={{ backgroundColor: red, borderColor: red }}
//                   className="me-2"
//                   size="sm"
//                 >
//                   View Site
//                 </Button>
//                 <Button variant="outline-dark" size="sm">
//                   Settings
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Website Editor */}
//           <Col md={4}>
//             <Card className="shadow-sm h-100" style={{ backgroundColor: "#FFFFFF" }}>
//               <Card.Body>
//                 <h6 className="fw-bold">Edit My Website</h6>
//                 <p className="text-muted small mb-1">
//                   Quick access to your website editor and customization tools.
//                 </p>
//                 <p className="text-muted small mb-1">Last edited: 2 hours ago</p>
//                 <p className="text-muted small mb-1">
//                   Draft changes: <strong>3 pending</strong>
//                 </p>
//                 <p className="text-muted small mb-3">
//                   Template: <strong>Modern Blog</strong>
//                 </p>
//                 <Button
//                   style={{ backgroundColor: red, borderColor: red }}
//                   size="sm"
//                   className="me-2"
//                 >
//                   Open Editor
//                 </Button>
//                 <Button variant="outline-dark" size="sm">
//                   Preview Changes
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Stats */}
//         <Row className="g-4 mt-3">
//           {[
//             {
//               label: "SUBSCRIBERS",
//               value: "2,548",
//               change: "+12.5%",
//               compare: "Compared to 2,267 last month",
//             },
//             {
//               label: "PAGE VIEWS",
//               value: "42.5k",
//               change: "+8.2%",
//               compare: "Compared to 39.3k last month",
//             },
//             {
//               label: "BOUNCE RATE",
//               value: "28.3%",
//               change: "+2.1%",
//               compare: "Compared to 26.2% last month",
//             },
//           ].map((stat, i) => (
//             <Col md={4} key={i}>
//               <Card className="text-center shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
//                 <Card.Body>
//                   <p className="text-uppercase text-muted fw-bold small mb-1">
//                     {stat.label}
//                   </p>
//                   <h4 className="fw-bold">{stat.value}</h4>
//                   <Badge
//                     style={{
//                       backgroundColor: green,
//                       color: "#000",
//                       fontWeight: 600,
//                     }}
//                   >
//                     {stat.change}
//                   </Badge>
//                   <p className="text-muted small mt-2">{stat.compare}</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>

//         {/* Recent Activity */}
//         <Row className="mt-4">
//           <Col md={12}>
//             <Card className="shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
//               <Card.Body>
//                 <h6 className="fw-bold mb-3">Recent Activity</h6>
//                 <ul className="list-unstyled mb-0">
//                   <li className="mb-3 d-flex align-items-center gap-2">
//                     <img
//                       src="/images/user1.jpg"
//                       alt=""
//                       width="32"
//                       height="32"
//                       className="rounded-circle"
//                     />
//                     <div>
//                       <strong>Sarah Johnson</strong> published a new article
//                       <br />
//                       <small className="text-muted">
//                         “Design Systems in 2023” · 2 hours ago
//                       </small>
//                     </div>
//                   </li>
//                   <li className="mb-3 d-flex align-items-center gap-2">
//                     <img
//                       src="/images/user2.jpg"
//                       alt=""
//                       width="32"
//                       height="32"
//                       className="rounded-circle"
//                     />
//                     <div>
//                       <strong>Robert Chen</strong> updated the homepage banner
//                       <br />
//                       <small className="text-muted">4 hours ago</small>
//                     </div>
//                   </li>
//                   <li className="d-flex align-items-center gap-2">
//                     <img
//                       src="/images/user3.jpg"
//                       alt=""
//                       width="32"
//                       height="32"
//                       className="rounded-circle"
//                     />
//                     <div>
//                       <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
//                       <br />
//                       <small className="text-muted">Yesterday at 2:45 PM</small>
//                     </div>
//                   </li>
//                 </ul>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>

//       {/* Floating Icons */}
//       <div className="position-fixed end-0 top-0 mt-3 me-4 d-flex gap-3">
//         <FaBell size={18} className="text-muted" />
//         <FaUserCircle size={22} className="text-muted" />
//       </div>
//     </div>
//   );
// }







// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Badge,
//   ProgressBar,
// } from "react-bootstrap";
// import Link from "next/link";


// export default function DashboardHome() {
//    const [homePageId, setHomePageId] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchHomePage() {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/sections?userId=demo-user&templateId=gym-template-1&type=page&slug=home`);
//         const page = res.data[0];
//         setHomePageId(page?._id);
//       } catch (err) {
//         console.error("Error fetching home page", err);
//       }
//     }

//     fetchHomePage();
//   }, []);

//   const red = "#FE3131";
//   const green = "#D5FF40";
//   const pageBg = "#F1F1F1";
  

//   return (
    
//     // <div style={{ backgroundColor: pageBg, minHeight: "100vh", padding: "2rem" }}>
//     <div style={{ backgroundColor: pageBg, minHeight: "100vh", padding: "2rem", paddingTop: "6rem" }}>

//       <Container fluid>
//         <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}> 
//           Welcome back, Marco!
//         </h5>
//         <br/>
//         <p className="text-dark">
//           Here's your website overview and next steps to complete your setup.
//         </p>

//         <Row className="g-4 mt-2">
//           {/* Subscription */}
//           <Col md={4}>
//   <Card
//     // className="shadow-sm h-100 border-0 rounded-4"
//     className="custom-card-shadow border-0 rounded-4"
//      style={{
//       backgroundColor: "#ffffff",
//       width: "362.67px",
//       height: "326px",

//     }}
//   >
//     <Card.Body className="position-relative px-4 pt-5 pb-4">
     

//       {/* Title and Icon */}
//       <div className="d-flex justify-content-between align-items-start mb-3">
//         <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
//           Current Subscription
//         </h5>
//         <img src="/icons/crown.svg" alt="Pro Plan" width={18} height={18} />
//       </div>

//       {/* Plan Badges */}
//       <div className="d-flex gap-2 mb-3">
//         <span
//           className="px-2 py-1 rounded-pill fw-bold"
//           style={{
//             backgroundColor: "#D5FF40",
//             fontSize: "0.75rem",
//             color: "#000",
//           }}
//         >
//           Pro Plan
//         </span>
//         <span
//           className="px-3 py-1 rounded-pill fw-bold"
//           style={{
//             backgroundColor: "#E1E1E1",
//             fontSize: "0.75rem",
//             color: "#000",
//             minWidth: "70px",
//             textAlign: "center",
//           }}
//         >
//           Monthly
//         </span>
//       </div>

//       {/* Price */}
//       <h4 className="fw-bold mb-3" style={{ lineHeight: "1.5",fontSize: "1.7rem" }}>
//         $29.99{" "}
//         <small className="text-dark fs-6 fw-normal align-middle">/month</small>
//       </h4>

//       {/* Billing Date */}
//       <div className="d-flex justify-content-between text-dark small mb-1">
//         <span>Next billing date</span>
//         <span className="fw-semibold text-dark">Feb 15, 2024</span>
//       </div>

//       {/* Storage */}
//       <div className="d-flex justify-content-between text-dark small mb-3">
//         <span>Storage used</span>
//         <span className="fw-semibold text-dark">8.2GB / 50GB</span>
//       </div>

//       {/* Progress bar */}
//       <div
//         className="mb-3"
//         style={{
//           height: "6px",
//           backgroundColor: "#E5E7EB",
//           borderRadius: "4px",
//         }}
//       >
//         <div
//           style={{
//             width: `${(8.2 / 50) * 100}%`,
//             height: "100%",
//             backgroundColor: "#FE3131",
//             borderRadius: "4px",
//           }}
//         ></div>
//       </div>

//       {/* Manage Button */}
 
//       <Button
//   variant="#FFFFFF"
//   className="w-100 fw-medium rounded-3"
//   style={{
//     fontSize: "0.92rem",
//     padding: "6px 0",
//     border: "1px solid #D1D1D1",        // subtle grey border
//     boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
//     color: "#111",
//   }}
// >
//   Manage Subscription
// </Button>

//     </Card.Body>
//   </Card>
// </Col>

//  <Col md={4}>
//   <Card
//     className="custom-card-shadow border-0 rounded-4"
//     style={{
//       backgroundColor: "#ffffff",
//       width: "362.67px",
//       height: "326px",
//     }}
//   >
//     <Card.Body className="position-relative px-4 pt-4 pb-3">
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-start mb-2">
//         <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//           Domain Information
//         </h5>
//          <img src="/icons/globe-icon.png" alt="Domain" width={18} height={18} />
//       </div>

//       {/* Domain (lowered slightly) */}
//       <h6
//         className="fw-bold mb-2 mt-3"
//         style={{ fontSize: "1rem", marginTop: "4px" }}
//       >
//         marcobotton.com
//       </h6>

//       {/* Badges */}
//       <div className="d-flex gap-2 mb-3">
//         <span
//           className="px-2 py-1 rounded-pill fw-bold d-inline-block"
//           style={{
//             fontSize: "0.75rem",
//             backgroundColor: "#D5FF40",
//             color: "#000",
//           }}
//         >
//          ✔ Connected
//         </span>
//         <span
//           className="px-2 py-1 rounded-pill fw-bold d-inline-block"
//           style={{
//             fontSize: "0.75rem",
//             backgroundColor: "#D5FF40",
//             color: "#000",
//           }}
//         >
//           SSL Active
//         </span>
//       </div>

//       {/* Domain Info */}
//       <div className="d-flex justify-content-between text-dark small mb-1">
//         <span>Domain expires</span>
//         <span className="fw-semibold text-dark">Dec 25, 2024</span>
//       </div>

//       <div className="d-flex justify-content-between text-dark small mb-3">
//         <span>DNS Status</span>
//         {/* <span className="fw-semibold" style={{ color: "#C1F44B" }}>
//           Active
//         </span> */}
//         <span
//           className="px-2 py-1 rounded-pill fw-bold d-inline-block"
//           style={{
//             fontSize: "0.75rem",
//             backgroundColor: "#D5FF40",
//             color: "#000",
//           }}
//         >
//            Active
//         </span>
//       </div>

//       {/* Buttons */}
//       <div className="d-flex gap-2">
//         <Button
//           variant="danger"
//           className="fw-medium rounded-3 w-50"
//           style={{
//              backgroundColor: "#FF3C3C",
//             fontSize: "0.92rem",
//             padding: "6px 0",
//           }}
//         >
//           View Site
//         </Button>
//         <Button
//           variant="#FFFFFF"
//           className="fw-medium border border-dark-subtle rounded-3 w-50"
//           style={{
//             fontSize: "0.92rem",
//             padding: "6px 0",
//             color:"#111"
//           }}
//         >
//           Settings
//         </Button>
//       </div>
//     </Card.Body>
//   </Card>
// </Col>

// <Col md={4}>
//   <Card
//     // className="shadow-sm border-0 rounded-4"
//      className="custom-card-shadow border-0 rounded-4"
//    style={{
//       backgroundColor: "#ffffff",
//       width: "362.67px",
//       height: "326px",
//     }}
//   >
//    <Card.Body className="position-relative px-4 pt-4 pb-3">
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-start mb-2">
//         <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
//           Edit My Website
//         </h5>
//         <img
//           src="/icons/edit-icon.png"
//           alt="Edit"
//           width={30}
//           height={30}
//         />
//       </div>

//       {/* Subtext */}
//       <p className="text-dark mb-3" style={{ fontSize: "0.88rem" }}>
//         Quick access to your website editor and customization tools.
//       </p>

//       {/* Info Rows */}
//       <div className="d-flex justify-content-between text-dark small mb-1">
//         <span>Last edited</span>
//         <span className="fw-semibold text-dark">2 hours ago</span>
//       </div>
//       <div className="d-flex justify-content-between  text-dark small mb-1">
//         <span>Draft changes</span>
//         <span className="fw-semibold text-dark">3 pending</span>
//       </div>
//       <div className="d-flex justify-content-between text-dark  small mb-3">
//         <span>Template</span>
//         <span className="fw-semibold text-dark">Modern Blog</span>
//       </div>

//       {/* Action Buttons */}
//      <div className="d-flex flex-column gap-2">
//                   {homePageId ? (
//                     <Button
//                       onClick={() => router.push(`/editorpages/page/${homePageId}`)}
//                       style={{
//                         backgroundColor: "#FF3C3C",
//                         border: "none",
//                         borderRadius: "10px",
//                         padding: "8px 0",
//                         fontWeight: 500,
//                       }}
//                     >
//                       Open Editor
//                     </Button>
//                   ) : (
//                     <Button disabled>Loading...</Button>
//                   )}
//         <Button
//           variant="#FFFFFF"
//           className="fw-medium border border-dark-subtle rounded-3"
//           style={{
//             fontSize: "0.92rem",
//             padding: "8px 0",
//             color:"#111"
//           }}
//         >
//           Preview Changes
//         </Button>
//       </div>
//     </Card.Body>
//   </Card>
// </Col>

          
//         </Row>
// <Row className="g-4 mt-3">
//   <Col>
//     <Card
//        className="custom-card-shadow border-0"
//       style={{
//         width: "363px",
//         height: "148px",
//         borderRadius: "20px",
//         backgroundColor: "#ffffff",
//         padding: "16px",
//       }}
//     >
//       <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
//         {/* Badge */}
//         <div className="d-flex justify-content-end">
//           <span
//             className="px-2 py-1 rounded-pill fw-bold"
//             style={{
//               fontSize: "0.75rem",
//               backgroundColor: "#D5FF40", 
//               color: "#000",
//             }}
//           >
//             +12.5%
//           </span>
//         </div>

//         {/* Main Content */}
//         <div>
//           <h6
//             className="text-uppercase text-muted fw-semibold mb-1"
//             style={{ fontSize: "0.75rem" }}
//           >
//             Subscribers
//           </h6>
//           <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//             2,548
//           </h3>
//           <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//             Compared to 2,267 last month
//           </p>
//         </div>
//       </Card.Body>
//     </Card>
//   </Col>

//   <Col>
//   <Card
//     className="custom-card-shadow border-0"
//     style={{
//       width: "363px",
//       height: "148px",
//       borderRadius: "20px",
//       backgroundColor: "#ffffff",
//       padding: "16px",
//     }}
//   >
//     <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
//       {/* Badge */}
//       <div className="d-flex justify-content-end">
//         <span
//           className="px-2 py-1 rounded-pill fw-bold"
//           style={{
//             fontSize: "0.75rem",
//             backgroundColor: "#D5FF40", 
//             color: "#000",
//           }}
//         >
//           +8.2%
//         </span>
//       </div>

//       {/* Text content */}
//       <div>
//         <h6
//           className="text-uppercase text-muted fw-semibold mb-1"
//           style={{ fontSize: "0.75rem" }}
//         >
//           Page Views
//         </h6>
//         <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//           42.5k
//         </h3>
//         <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//           Compared to 39.3k last month
//         </p>
//       </div>
//     </Card.Body>
//   </Card>
// </Col>
// <Col>
//   <Card
//     className="custom-card-shadow border-0"
//     style={{
//       width: "363px",
//       height: "148px",
//       borderRadius: "20px",
//       backgroundColor: "#ffffff",
//       padding: "16px",
//     }}
//   >
//     <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
//       {/* Badge */}
//       <div className="d-flex justify-content-end">
//         <span
//           className="px-2 py-1 rounded-pill fw-bold"
//           style={{
//             fontSize: "0.75rem",
//             backgroundColor: "#FF3B30", // red color
//             color: "#fff",
//           }}
//         >
//           +2.1%
//         </span>
//       </div>

//       {/* Text content */}
//       <div>
//         <h6
//           className="text-uppercase text-muted fw-semibold mb-1"
//           style={{ fontSize: "0.75rem" }}
//         >
//           Bounce Rate
//         </h6>
//         <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
//           28.3%
//         </h3>
//         <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
//           Compared to 26.2% last month
//         </p>
//       </div>
//     </Card.Body>
//   </Card>
// </Col>

// </Row>
       
// <Row className="mt-6">
//   <Col md={12}>
//     <Card
//       className="custom-card-shadow border-0"
//       style={{
//         backgroundColor: "#FFFFFF",
//         borderRadius: "20px",
//         height: "260px",
//         padding: "24px",
//       }}
//     >
//       <Card.Body className="p-0">
//         <h5 className="fw-bold mb-4" style={{ fontSize: "1.05rem" }}>
//           Recent Activity
//         </h5>
//         <ul className="list-unstyled mb-0">
//           <li className="mb-3 d-flex align-items-start gap-3">
//             <img
//               src="/images/user1.jpg"
//               alt=""
//               width="40"
//               height="40"
//               className="rounded-circle object-fit-cover"
//             />
//             <div>
//               <strong>Sarah Johnson</strong> published a new article “Design Systems in 2023”
//               <br />
//               <small className="text-muted">2 hours ago</small>
//             </div>
//           </li>
//           <li className="mb-3 d-flex align-items-start gap-3">
//             <img
//               src="/images/user2.jpg"
//               alt=""
//               width="40"
//               height="40"
//               className="rounded-circle object-fit-cover"
//             />
//             <div>
//               <strong>Robert Chen</strong> updated the homepage banner
//               <br />
//               <small className="text-muted">4 hours ago</small>
//             </div>
//           </li>
//           <li className="d-flex align-items-start gap-3">
//             <img
//               src="/images/user3.jpg"
//               alt=""
//               width="40"
//               height="40"
//               className="rounded-circle object-fit-cover"
//             />
//             <div>
//               <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
//               <br />
//               <small className="text-muted">Yesterday at 2:45 PM</small>
//             </div>
//           </li>
//         </ul>
//       </Card.Body>
//     </Card>
//   </Col>
// </Row>


//       </Container>

    
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";
import SidebarDashly from '../../layouts/navbars/NavbarVertical'; // import your Sidebar component

export default function DashboardHome() {
  const [homePageId, setHomePageId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Detect screen size for mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchHomePage() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sections?userId=demo-user&templateId=gym-template-1&type=page&slug=home`
        );
        const page = res.data[0];
        setHomePageId(page?._id);
      } catch (err) {
        console.error("Error fetching home page", err);
      }
    }
    fetchHomePage();
  }, []);

  const red = "#FE3131";
  const green = "#D5FF40";
  const pageBg = "#F1F1F1";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: pageBg }}>
      {/* Sidebar with control */}
      <SidebarDashly
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main content shifts right when sidebar is open */}
      <main
        style={{
          flexGrow: 1,
          marginLeft: sidebarOpen ? 256 : 0, // width of sidebar
          padding: "2rem",
          paddingTop: "6rem",
          transition: "margin-left 0.3s ease-in-out",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Container fluid>
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
            Welcome back, Marco!
          </h5>
          <br />
          <p className="text-dark">
            Here's your website overview and next steps to complete your setup.
          </p>

          <Row className="g-4 mt-2">
            {/* Subscription Card */}
            <Col md={4}>
              <Card
                className="custom-card-shadow border-0 rounded-4"
                style={{
                  backgroundColor: "#ffffff",
                  width: "362.67px",
                  height: "326px",
                }}
              >
                <Card.Body className="position-relative px-4 pt-5 pb-4">
                  {/* Title and Icon */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                      Current Subscription
                    </h5>
                    <img
                      src="/icons/crown.svg"
                      alt="Pro Plan"
                      width={18}
                      height={18}
                    />
                  </div>

                  {/* Plan Badges */}
                  <div className="d-flex gap-2 mb-3">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        backgroundColor: "#D5FF40",
                        fontSize: "0.75rem",
                        color: "#000",
                      }}
                    >
                      Pro Plan
                    </span>
                    <span
                      className="px-3 py-1 rounded-pill fw-bold"
                      style={{
                        backgroundColor: "#E1E1E1",
                        fontSize: "0.75rem",
                        color: "#000",
                        minWidth: "70px",
                        textAlign: "center",
                      }}
                    >
                      Monthly
                    </span>
                  </div>

                  {/* Price */}
                  <h4
                    className="fw-bold mb-3"
                    style={{ lineHeight: "1.5", fontSize: "1.7rem" }}
                  >
                    $29.99{" "}
                    <small className="text-dark fs-6 fw-normal align-middle">
                      /month
                    </small>
                  </h4>

                  {/* Billing Date */}
                  <div className="d-flex justify-content-between text-dark small mb-1">
                    <span>Next billing date</span>
                    <span className="fw-semibold text-dark">Feb 15, 2024</span>
                  </div>

                  {/* Storage */}
                  <div className="d-flex justify-content-between text-dark small mb-3">
                    <span>Storage used</span>
                    <span className="fw-semibold text-dark">8.2GB / 50GB</span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="mb-3"
                    style={{
                      height: "6px",
                      backgroundColor: "#E5E7EB",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: `${(8.2 / 50) * 100}%`,
                        height: "100%",
                        backgroundColor: "#FE3131",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>

                  {/* Manage Button */}
                  <Button
                    variant="#FFFFFF"
                    className="w-100 fw-medium rounded-3"
                    style={{
                      fontSize: "0.92rem",
                      padding: "6px 0",
                      border: "1px solid #D1D1D1", // subtle grey border
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      color: "#111",
                    }}
                  >
                    Manage Subscription
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Domain Info Card */}
            <Col md={4}>
              <Card
                className="custom-card-shadow border-0 rounded-4"
                style={{
                  backgroundColor: "#ffffff",
                  width: "362.67px",
                  height: "326px",
                }}
              >
                <Card.Body className="position-relative px-4 pt-4 pb-3">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
                      Domain Information
                    </h5>
                    <img
                      src="/icons/globe-icon.png"
                      alt="Domain"
                      width={18}
                      height={18}
                    />
                  </div>

                  {/* Domain */}
                  <h6
                    className="fw-bold mb-2 mt-3"
                    style={{ fontSize: "1rem", marginTop: "4px" }}
                  >
                    marcobotton.com
                  </h6>

                  {/* Badges */}
                  <div className="d-flex gap-2 mb-3">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold d-inline-block"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#D5FF40",
                        color: "#000",
                      }}
                    >
                      ✔ Connected
                    </span>
                    <span
                      className="px-2 py-1 rounded-pill fw-bold d-inline-block"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#D5FF40",
                        color: "#000",
                      }}
                    >
                      SSL Active
                    </span>
                  </div>

                  {/* Domain Info */}
                  <div className="d-flex justify-content-between text-dark small mb-1">
                    <span>Domain expires</span>
                    <span className="fw-semibold text-dark">Dec 25, 2024</span>
                  </div>

                  <div className="d-flex justify-content-between text-dark small mb-3">
                    <span>DNS Status</span>
                    <span
                      className="px-2 py-1 rounded-pill fw-bold d-inline-block"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#D5FF40",
                        color: "#000",
                      }}
                    >
                      Active
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="danger"
                      className="fw-medium rounded-3 w-50"
                      style={{
                        backgroundColor: "#FF3C3C",
                        fontSize: "0.92rem",
                        padding: "6px 0",
                      }}
                    >
                      View Site
                    </Button>
                    <Button
                      variant="#FFFFFF"
                      className="fw-medium border border-dark-subtle rounded-3 w-50"
                      style={{
                        fontSize: "0.92rem",
                        padding: "6px 0",
                        color: "#111",
                      }}
                    >
                      Settings
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Edit My Website Card */}
            <Col md={4}>
              <Card
                className="custom-card-shadow border-0 rounded-4"
                style={{
                  backgroundColor: "#ffffff",
                  width: "362.67px",
                  height: "326px",
                }}
              >
                <Card.Body className="position-relative px-4 pt-4 pb-3">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0" style={{ fontSize: "1.05rem" }}>
                      Edit My Website
                    </h5>
                    <img src="/icons/edit-icon.png" alt="Edit" width={30} height={30} />
                  </div>

                  {/* Subtext */}
                  <p className="text-dark mb-3" style={{ fontSize: "0.88rem" }}>
                    Quick access to your website editor and customization tools.
                  </p>

                  {/* Info Rows */}
                  <div className="d-flex justify-content-between text-dark small mb-1">
                    <span>Last edited</span>
                    <span className="fw-semibold text-dark">2 hours ago</span>
                  </div>
                  <div className="d-flex justify-content-between  text-dark small mb-1">
                    <span>Draft changes</span>
                    <span className="fw-semibold text-dark">3 pending</span>
                  </div>
                  <div className="d-flex justify-content-between text-dark  small mb-3">
                    <span>Template</span>
                    <span className="fw-semibold text-dark">Modern Blog</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex flex-column gap-2">
                    {homePageId ? (
                      <Button
                        onClick={() => router.push(`/editorpages/page/${homePageId}`)}
                        style={{
                          backgroundColor: "#FF3C3C",
                          border: "none",
                          borderRadius: "10px",
                          padding: "8px 0",
                          fontWeight: 500,
                        }}
                      >
                        Open Editor
                      </Button>
                    ) : (
                      <Button disabled>Loading...</Button>
                    )}
                    <Button
                      variant="#FFFFFF"
                      className="fw-medium border border-dark-subtle rounded-3"
                      style={{
                        fontSize: "0.92rem",
                        padding: "8px 0",
                        color: "#111",
                      }}
                    >
                      Preview Changes
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Other cards */}
          <Row className="g-4 mt-3">
            <Col>
              <Card
                className="custom-card-shadow border-0"
                style={{
                  width: "363px",
                  height: "148px",
                  borderRadius: "20px",
                  backgroundColor: "#ffffff",
                  padding: "16px",
                }}
              >
                <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
                  <div className="d-flex justify-content-end">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#D5FF40",
                        color: "#000",
                      }}
                    >
                      +12.5%
                    </span>
                  </div>
                  <div>
                    <h6
                      className="text-uppercase text-muted fw-semibold mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Subscribers
                    </h6>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      2,548
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                      Compared to 2,267 last month
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card
                className="custom-card-shadow border-0"
                style={{
                  width: "363px",
                  height: "148px",
                  borderRadius: "20px",
                  backgroundColor: "#ffffff",
                  padding: "16px",
                }}
              >
                <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
                  <div className="d-flex justify-content-end">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#D5FF40",
                        color: "#000",
                      }}
                    >
                      +8.2%
                    </span>
                  </div>
                  <div>
                    <h6
                      className="text-uppercase text-muted fw-semibold mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Page Views
                    </h6>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      42.5k
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                      Compared to 39.3k last month
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card
                className="custom-card-shadow border-0"
                style={{
                  width: "363px",
                  height: "148px",
                  borderRadius: "20px",
                  backgroundColor: "#ffffff",
                  padding: "16px",
                }}
              >
                <Card.Body className="p-0 d-flex flex-column justify-content-between h-100">
                  <div className="d-flex justify-content-end">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "#FF3B30", // red color
                        color: "#fff",
                      }}
                    >
                      +2.1%
                    </span>
                  </div>
                  <div>
                    <h6
                      className="text-uppercase text-muted fw-semibold mb-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Bounce Rate
                    </h6>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      28.3%
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                      Compared to 26.2% last month
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-6">
            <Col md={12}>
              <Card
                className="custom-card-shadow border-0"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "20px",
                  height: "295px",
                  padding: "24px",
                }}
              >
                <Card.Body className="p-0">
                  <h5 className="fw-bold mb-4" style={{ fontSize: "1.05rem" }}>
                    Recent Activity
                  </h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-3 d-flex align-items-start gap-3">
                      <img
                        src="/images/user1.jpg"
                        alt=""
                        width="40"
                        height="40"
                        className="rounded-circle object-fit-cover"
                      />
                      <div>
                        <strong>Sarah Johnson</strong> published a new article “Design Systems in 2023”
                        <br />
                        <small className="text-muted">2 hours ago</small>
                      </div>
                    </li>
                    <li className="mb-3 d-flex align-items-start gap-3">
                      <img
                        src="/images/user2.jpg"
                        alt=""
                        width="40"
                        height="40"
                        className="rounded-circle object-fit-cover"
                      />
                      <div>
                        <strong>Robert Chen</strong> updated the homepage banner
                        <br />
                        <small className="text-muted">4 hours ago</small>
                      </div>
                    </li>
                    <li className="d-flex align-items-start gap-3">
                      <img
                        src="/images/user3.jpg"
                        alt=""
                        width="40"
                        height="40"
                        className="rounded-circle object-fit-cover"
                      />
                      <div>
                        <strong>Jessica Lee</strong> commented on “UX Design Fundamentals”
                        <br />
                        <small className="text-muted">Yesterday at 2:45 PM</small>
                      </div>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}
