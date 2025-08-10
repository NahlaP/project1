
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

// import { Navbar } from "react-bootstrap";
// import Image from "next/image";
// import { FaEye, FaMobileAlt } from "react-icons/fa";

// const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
//   return (
//     <Navbar
//       expand="md"
//       className="px-3 custom-navbar border-md-bottom shadow-md"
//       style={{
//         height: "60px",
//         position: "fixed",
//         top: 0,
//         left: "250px",
//         right: 0,
//         zIndex: 1050,
//         boxShadow: "none", // remove on small
//         borderBottom: "none", // remove on small
//       }}
//     >
//       <div className="container-fluid d-flex align-items-center justify-content-between w-100 px-0">
//         {/* Title + Last Saved (md and above only) */}
//         <div className="d-none d-md-flex align-items-center gap-3">
//           <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
//           <div className="d-flex align-items-center gap-1">
//             <span style={{ fontSize: "13px", color: "#888" }}>
//               Last saved: 2 mins ago
//             </span>
//             <span style={{ color: "red", fontSize: "14px" }}>●</span>
//           </div>
//         </div>

//         {/* Hamburger Toggle (always on right) */}
//         <Navbar.Toggle
//           aria-controls="navbar-collapse"
//           className="border-0 p-0 ms-auto"
//           style={{ fontSize: "1.25rem" }}
//         />
//       </div>

//       <Navbar.Collapse
//         id="navbar-collapse"
//         className="bg-white w-100 px-2 py-2 py-md-0"
//       >
//         {/* Title + Last Saved (mobile only) */}
//         <div className="d-flex d-md-none flex-column mb-3 px-2">
//           <h5 className="fw-bold mb-1">{pageTitle}</h5>
//           <div className="d-flex align-items-center gap-1">
//             <span style={{ fontSize: "13px", color: "#888" }}>
//               Last saved: 2 mins ago
//             </span>
//             <span style={{ color: "red", fontSize: "14px" }}>●</span>
//           </div>
//         </div>

//         {/* Menu Items */}
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

//       <style jsx>{`
//         /* Adjust menu content for very small screens */
//         @media (max-width: 576px) {
//           .custom-navbar .navbar-collapse {
//             padding: 8px 0;
//           }
//           .navbar-toggle {
//             font-size: 1.25rem;
//           }
//           .navbar-collapse .d-flex {
//             flex-direction: column;
//           }
//           .navbar-collapse .gap-1 {
//             gap: 0.5rem;
//           }
//         }
//       `}</style>
//     </Navbar>
//   );
// };

// export default NavbarHeader;




// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarHeader.js
"use client";

import { Navbar } from "react-bootstrap";
import Image from "next/image";
import { FaEye, FaMobileAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

const SIDEBAR_W = 250;
const BREAKPOINT = 768; // "md" from Bootstrap

const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
  const [compact, setCompact] = useState(false); // <= md

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < BREAKPOINT);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Navbar
      expand="md" // hamburger appears on the RIGHT below md
      className="px-3 custom-navbar"
      style={{
        height: 60,
        position: "fixed",
        top: 0,
        left: compact ? 0 : SIDEBAR_W,
        right: 0,
        width: compact ? "100%" : `calc(100% - ${SIDEBAR_W}px)`,
        zIndex: 1050,
        backgroundColor: "#F1F1F1",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between w-100 px-0">
        {/* Title + Last Saved (md and up) */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: 13, color: "#888" }}>Last saved: 2 mins ago</span>
            <span style={{ color: "red", fontSize: 14 }}>●</span>
          </div>
        </div>

        {/* Right-side hamburger (auto shows < md) */}
        <Navbar.Toggle
          aria-controls="navbar-header-collapse"
          className="border-0 p-0 ms-auto"
          style={{ fontSize: "1.25rem" }}
        />
      </div>

      <Navbar.Collapse id="navbar-header-collapse" className="bg-white w-100 px-2 py-2 py-md-0">
        {/* Title + Last Saved (mobile only) */}
        <div className="d-flex d-md-none flex-column mb-2 px-2">
          <h5 className="fw-bold mb-1">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: 13, color: "#888" }}>Last saved: 2 mins ago</span>
            <span style={{ color: "red", fontSize: 14 }}>●</span>
          </div>
        </div>

        {/* Menu Items (stack on small, inline on md+) */}
        <div className="d-flex flex-column flex-md-row justify-content-end align-items-start align-items-md-center gap-3 w-100">
          {/* 👁 Preview */}
          <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: 14, cursor: "pointer" }}>
            <FaEye size={16} />
            <span>Preview</span>
          </div>

          {/* 📱 Mobile View */}
          <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: 14, cursor: "pointer" }}>
            <FaMobileAlt size={15} />
            <span>Mobile View</span>
          </div>

          {/* 👤 Avatar + Name */}
          <div className="d-flex align-items-center gap-2">
            <Image src="/images/avatar.png" alt="User" width={28} height={28} className="rounded-circle" />
            <span className="fw-medium" style={{ fontSize: 14, color: "#333" }}>Marco</span>
          </div>
        </div>
      </Navbar.Collapse>

      <style jsx>{`
        /* tighten collapse on very small screens */
        @media (max-width: 576px) {
          .custom-navbar .navbar-collapse { padding: 8px 0; }
          .custom-navbar .navbar-collapse .d-flex { row-gap: 8px; }
        }
      `}</style>
    </Navbar>
  );
};

export default NavbarHeader;
