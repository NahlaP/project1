
// 'use client';
// import { Navbar, Nav } from 'react-bootstrap';
// import { useRouter } from 'next/router';

// const NavbarHeader = ({ onSave }) => {
//   const router = useRouter();

//   const handleExit = () => {
//     router.push('/dashboard');
//   };

//   return (
//     <Navbar bg="light" expand="lg" className="border-bottom">
//       <div className="d-flex justify-content-between w-100 px-3 py-2">
//         <div>
//           <h5 className="mb-0 fw-bold">Menu Editor</h5>
//         </div>
//         <Nav className="ms-auto d-flex align-items-center gap-3">
//           <span className="badge bg-info">Editing</span>
//           <button className="btn btn-outline-secondary btn-sm">Preview</button>
//           <button className="btn btn-primary btn-sm" onClick={onSave}>Save Changes</button>
//           <button className="btn btn-danger btn-sm" onClick={handleExit}>Exit</button>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarHeader;


// 'use client';
// import { Navbar, Nav } from 'react-bootstrap';
// import { useRouter } from 'next/router';
// import Image from 'next/image';

// const NavbarHeader = ({ onSave }) => {
//   const router = useRouter();

//   const handleExit = () => {
//     router.push('/dashboard');
//   };

//   return (
 
//     <Navbar
//   bg="white"
//   expand="lg"
//   className="shadow-sm border-bottom"
//   style={{
//     height: '60px',
//     padding: '0 1rem',
//     position: 'fixed',      
//     top: 0,
//     left: '250px',           
//     right: 0,
//     zIndex: 1050,          
//   }}
// >
//       <div className="d-flex justify-content-between align-items-center w-100">
//         {/* Left Side - Title + Last Saved */}
//         <div className="d-flex align-items-center gap-2">
//           <h6 className="mb-0 fw-bold">Home Page Editor</h6>
//           <span style={{ fontSize: '13px', color: '#888' }}>Last saved: 2 mins ago</span>
//           <span style={{ color: 'red', fontSize: '14px' }}>●</span>
//         </div>

//         {/* Right Side - Buttons */}
//         <Nav className="d-flex align-items-center gap-3">
//           <button className="btn btn-outline-secondary btn-sm px-3">Preview</button>
//           <button className="btn btn-primary btn-sm px-3" onClick={onSave}>Save</button>

//           {/* User Profile Avatar */}
//           <div
//             className="rounded-circle overflow-hidden"
//             style={{
//               width: '32px',
//               height: '32px',
//               border: '1px solid #ddd',
//             }}
//           >
//             <Image
//               src="/images/avatar.png" // 🔁 Replace with actual avatar path
//               alt="User"
//               width={32}
//               height={32}
//               objectFit="cover"
//             />
//           </div>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarHeader;
// "use client";

// import { Navbar, Nav } from 'react-bootstrap';
// import { useRouter } from 'next/router';
// import Image from 'next/image';

// // const NavbarHeader = ({ onSave }) => {
// //   const router = useRouter();
// //   const { id: pageId } = router.query;

// const NavbarHeader = ({ onSave, pageTitle = "Page Editor" }) => {
 


//   const getTitleFromSlug = (slug) => {
//     if (!slug) return "Editor";
//     const words = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1));
//     return `${words.join(" ")} Page Editor`;
//   };

//   return (
//     <Navbar
//       bg="white"
//       expand="lg"
//       className="shadow-sm border-bottom"
//       style={{
//         height: '60px',
//         padding: '0 1rem',
//         position: 'fixed',
//         top: 0,
//         left: '250px',
//         right: 0,
//         zIndex: 1050,
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100">
//         <div className="d-flex align-items-center gap-2">
// <h4 className="mb-0 fw-bold">{pageTitle}</h4>

//           <span style={{ fontSize: '13px', color: '#888' }}>Last saved: 2 mins ago</span>
//           <span style={{ color: 'red', fontSize: '14px' }}>●</span>
//         </div>

//         <Nav className="d-flex align-items-center gap-3">
//           <button className="btn btn-outline-secondary btn-sm px-3">Preview</button>
//           <button className="btn btn-primary btn-sm px-3" onClick={onSave}>Save</button>

//           <div
//             className="rounded-circle overflow-hidden"
//             style={{
//               width: '32px',
//               height: '32px',
//               border: '1px solid #ddd',
//             }}
//           >
//             <Image
//               src="/images/avatar.png"
//               alt="User"
//               width={32}
//               height={32}
//               objectFit="cover"
//             />
//           </div>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarHeader;





// "use client";

// import { Navbar, Nav } from "react-bootstrap";
// import { useRouter } from "next/router";
// import Image from "next/image";
// import { FaEye, FaMobileAlt } from "react-icons/fa"; // 👁️ and 📱 icons

// const NavbarHeader = ({ onSave, pageTitle = "Page Editor" }) => {
//   return (
//     <Navbar
//       bg="white"
//       expand="lg"
//       className="shadow-sm border-bottom"
//       style={{
//         height: "60px",
//         padding: "0 1rem",
//         position: "fixed",
//         top: 0,
//         left: "250px",
//         right: 0,
//         zIndex: 1050,
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100">
//         {/* Left Side - Page Title & Status */}
//         <div className="d-flex align-items-center gap-2">
//           <h4 className="mb-0 fw-bold">{pageTitle}</h4>
//           <span style={{ fontSize: "13px", color: "#888" }}>
//             Last saved: 2 mins ago
//           </span>
//           <span style={{ color: "red", fontSize: "14px" }}>●</span>
//         </div>

//         {/* Right Side - Actions + Avatar */}
//         <Nav className="d-flex align-items-center gap-3">
//           {/* 👁️ Preview */}
//           <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: "14px", cursor: "pointer" }}>
//             <FaEye size={16} />
//             <span>Preview</span>
//           </div>

//           {/* 📱 Mobile View */}
//           <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: "14px", cursor: "pointer" }}>
//             <FaMobileAlt size={15} />
//             <span>Mobile View</span>
//           </div>

//           {/* Divider */}
//           <div style={{ height: "24px", borderLeft: "1px solid #ddd" }}></div>

//           {/* Avatar + Name */}
//           <div className="d-flex align-items-center gap-2">
//             <Image
//               src="/images/avatar.png"
//               alt="User"
//               width={28}
//               height={28}
//               className="rounded-circle"
//             />
//             <span className="fw-medium" style={{ fontSize: "14px", color: "#333" }}>Marco</span>
//           </div>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarHeader;

// "use client";

// import { Navbar, Nav } from "react-bootstrap";
// import { useRouter } from "next/router";
// import Image from "next/image";
// import { FaEye, FaMobileAlt } from "react-icons/fa"; // 👁️ and 📱 icons

// const NavbarHeader = ({ onSave, pageTitle = "Page Editor" }) => {
//   return (
//     <Navbar
//       bg="white"
//       expand="lg"
//       className="shadow-sm border-bottom"
//       style={{
//         height: "60px",
//         padding: "0 1rem",
//         position: "fixed",
//         top: 0,
//         left: "250px",
//         right: 0,
//         zIndex: 1050,
//       }}
//     >
//       <div className="container-fluid px-2">
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 gap-2 gap-md-0">
//           {/* Left Side - Page Title & Status */}
//           <div className="d-flex align-items-center gap-2">
//             <h5 className="mb-0 fw-bold text-truncate" style={{ maxWidth: "160px" }}>
//               {pageTitle}
//             </h5>
//             <span className="d-none d-sm-inline" style={{ fontSize: "13px", color: "#888" }}>
//               Last saved: 2 mins ago
//             </span>
//             <span style={{ color: "red", fontSize: "14px" }}>●</span>
//           </div>

//           {/* Right Side - Actions + Avatar */}
//           <Nav className="d-flex align-items-center gap-3 flex-wrap">
//             {/* 👁️ Preview */}
//             <div
//               className="d-flex align-items-center gap-1 text-dark"
//               style={{ fontSize: "14px", cursor: "pointer" }}
//             >
//               <FaEye size={16} />
//               <span className="d-none d-sm-inline">Preview</span>
//             </div>

//             {/* 📱 Mobile View */}
//             <div
//               className="d-flex align-items-center gap-1 text-dark"
//               style={{ fontSize: "14px", cursor: "pointer" }}
//             >
//               <FaMobileAlt size={15} />
//               <span className="d-none d-sm-inline">Mobile View</span>
//             </div>

//             {/* Divider */}
//             <div className="d-none d-md-block" style={{ height: "24px", borderLeft: "1px solid #ddd" }}></div>

//             {/* Avatar + Name */}
//             <div className="d-flex align-items-center gap-2">
//               <Image
//                 src="/images/avatar.png"
//                 alt="User"
//                 width={28}
//                 height={28}
//                 className="rounded-circle"
//               />
//               <span className="fw-medium d-none d-sm-inline" style={{ fontSize: "14px", color: "#333" }}>
//                 Marco
//               </span>
//             </div>
//           </Nav>
//         </div>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarHeader;




// "use client";

// import { Navbar, Nav } from "react-bootstrap";
// import Image from "next/image";
// import { FaEye, FaMobileAlt } from "react-icons/fa";

// const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
//   return (
//     <Navbar
//       bg="white"
//       expand="md"
//       className="shadow-sm border-bottom px-3"
//       style={{
//         height: "60px",
//         position: "fixed",
//         top: 0,
//         left: "250px",
//         right: 0,
//         zIndex: 1050,
//       }}
//     >
      
//       {/* ☰ Toggle and Page Title on left */}
//       <div className="container-fluid d-flex justify-content-between align-items-center w-100 px-0">
//         <div className="d-flex align-items-center gap-2">
//           <Navbar.Toggle
//             aria-controls="navbar-collapse"
//             className="border-0 p-0 me-2"
//             style={{ fontSize: "1.25rem" }}
//           />
//           <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
//         </div>
//       </div>

//       {/* ✅ Collapsible content: everything on the right */}
//       <Navbar.Collapse id="navbar-collapse" className="bg-white w-100 px-2 py-2 py-md-0">
//         <div className="d-flex flex-column flex-md-row justify-content-end align-items-start align-items-md-center gap-3 w-100">
//           {/* 👁 Preview */}
//           <div
//             className="d-flex align-items-center gap-1 text-dark"
//             style={{ fontSize: "14px", cursor: "pointer" }}
//           >
//             <FaEye size={16} />
//             <span>Preview</span>
//           </div>

//           {/* 📱 Mobile View */}
//           <div
//             className="d-flex align-items-center gap-1 text-dark"
//             style={{ fontSize: "14px", cursor: "pointer" }}
//           >
//             <FaMobileAlt size={15} />
//             <span>Mobile View</span>
//           </div>

//           {/* ⏱️ Last saved */}
//           <div className="d-flex align-items-center gap-1">
//             <span style={{ fontSize: "13px", color: "#888" }}>
//               Last saved: 2 mins ago
//             </span>
//             <span style={{ color: "red", fontSize: "14px" }}>●</span>
//           </div>

//           {/* 👤 Avatar + Name */}
//           <div className="d-flex align-items-center gap-2">
//             <Image
//               src="/images/avatar.png"
//               alt="User"
//               width={28}
//               height={28}
//               className="rounded-circle"
//             />
//             <span
//               className="fw-medium"
//               style={{ fontSize: "14px", color: "#333" }}
//             >
//               Marco
//             </span>
//           </div>
//         </div>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// };

// export default NavbarHeader;






// "use client";

// import { Navbar } from "react-bootstrap";
// import Image from "next/image";
// import { FaEye, FaMobileAlt } from "react-icons/fa";

// const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
//   return (
//     <Navbar
//       expand="md"
//       className="shadow-sm border-bottom px-3 custom-navbar"
//       style={{
//         height: "60px",
//         position: "fixed",
//         top: 0,
//         left: "250px",
//         right: 0,
//         zIndex: 1050,
//       }}
//     >
//       {/* ☰ Toggle only */}
//       <div className="container-fluid d-flex justify-content-between align-items-center w-100 px-0">
//         <div className="d-flex align-items-center gap-2">
//           <Navbar.Toggle
//             aria-controls="navbar-collapse"
//             className="border-0 p-0 me-2"
//             style={{ fontSize: "1.25rem" }}
//           />

//           {/* Desktop Title + Last Saved */}
//           <div className="d-none d-md-flex align-items-center gap-3">
//             <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
//             <div className="d-flex align-items-center gap-1">
//               <span style={{ fontSize: "13px", color: "#888" }}>
//                 Last saved: 2 mins ago
//               </span>
//               <span style={{ color: "red", fontSize: "14px" }}>●</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Collapsible content: hamburger menu on small screens */}
//       <Navbar.Collapse
//         id="navbar-collapse"
//         className="bg-white w-100 px-2 py-2 py-md-0"
//       >
//         {/* Mobile Title + Last Saved (hidden on md and up) */}
//         <div className="d-flex d-md-none flex-column mb-3 px-2">
//           <h5 className="fw-bold mb-1">{pageTitle}</h5>
//           <div className="d-flex align-items-center gap-1">
//             <span style={{ fontSize: "13px", color: "#888" }}>
//               Last saved: 2 mins ago
//             </span>
//             <span style={{ color: "red", fontSize: "14px" }}>●</span>
//           </div>
//         </div>

//         {/* Main menu items */}
//         <div className="d-flex flex-column flex-md-row justify-content-end align-items-start align-items-md-center gap-3 w-100">
//           {/* 👁 Preview */}
//           <div
//             className="d-flex align-items-center gap-1 text-dark"
//             style={{ fontSize: "14px", cursor: "pointer" }}
//           >
//             <FaEye size={16} />
//             <span>Preview</span>
//           </div>

//           {/* 📱 Mobile View */}
//           <div
//             className="d-flex align-items-center gap-1 text-dark"
//             style={{ fontSize: "14px", cursor: "pointer" }}
//           >
//             <FaMobileAlt size={15} />
//             <span>Mobile View</span>
//           </div>

//           {/* 👤 Avatar + Name */}
//           <div className="d-flex align-items-center gap-2">
//             <Image
//               src="/images/avatar.png"
//               alt="User"
//               width={28}
//               height={28}
//               className="rounded-circle"
//             />
//             <span
//               className="fw-medium"
//               style={{ fontSize: "14px", color: "#333" }}
//             >
//               Marco
//             </span>
//           </div>
//         </div>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// };

// export default NavbarHeader;

"use client";

import { Navbar } from "react-bootstrap";
import Image from "next/image";
import { FaEye, FaMobileAlt } from "react-icons/fa";

const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
  return (
    <Navbar
      expand="md"
      className="px-3 custom-navbar border-md-bottom shadow-md"
      style={{
        height: "60px",
        position: "fixed",
        top: 0,
        left: "250px",
        right: 0,
        zIndex: 1050,
        boxShadow: "none", // remove on small
        borderBottom: "none", // remove on small
      }}
    >
      {/* ☰ Toggle on Right + Title/Last Saved (desktop only) */}
      <div className="container-fluid d-flex align-items-center justify-content-between w-100 px-0">
        {/* Title + Last Saved (md and above only) */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: "13px", color: "#888" }}>
              Last saved: 2 mins ago
            </span>
            <span style={{ color: "red", fontSize: "14px" }}>●</span>
          </div>
        </div>

        {/* Hamburger Toggle (always on right) */}
        <Navbar.Toggle
          aria-controls="navbar-collapse"
          className="border-0 p-0 ms-auto"
          style={{ fontSize: "1.25rem" }}
        />
      </div>

      {/* ✅ Collapsible content: shown on mobile */}
      <Navbar.Collapse
        id="navbar-collapse"
        className="bg-white w-100 px-2 py-2 py-md-0"
      >
        {/* Title + Last Saved (mobile only) */}
        <div className="d-flex d-md-none flex-column mb-3 px-2">
          <h5 className="fw-bold mb-1">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: "13px", color: "#888" }}>
              Last saved: 2 mins ago
            </span>
            <span style={{ color: "red", fontSize: "14px" }}>●</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="d-flex flex-column flex-md-row justify-content-end align-items-start align-items-md-center gap-3 w-100">
          {/* 👁 Preview */}
          <div
            className="d-flex align-items-center gap-1 text-dark"
            style={{ fontSize: "14px", cursor: "pointer" }}
          >
            <FaEye size={16} />
            <span>Preview</span>
          </div>

          {/* 📱 Mobile View */}
          <div
            className="d-flex align-items-center gap-1 text-dark"
            style={{ fontSize: "14px", cursor: "pointer" }}
          >
            <FaMobileAlt size={15} />
            <span>Mobile View</span>
          </div>

          {/* 👤 Avatar + Name */}
          <div className="d-flex align-items-center gap-2">
            <Image
              src="/images/avatar.png"
              alt="User"
              width={28}
              height={28}
              className="rounded-circle"
            />
            <span
              className="fw-medium"
              style={{ fontSize: "14px", color: "#333" }}
            >
              Marco
            </span>
          </div>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavbarHeader;
