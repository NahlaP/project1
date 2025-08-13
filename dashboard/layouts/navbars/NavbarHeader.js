


// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarHeader.js
"use client";

import { Navbar } from "react-bootstrap";
import Image from "next/image";
import { FaEye, FaMobileAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

const SIDEBAR_W = 250;
const BREAKPOINT = 768;

const NavbarHeader = ({ pageTitle = "Page Editor" }) => {
  const [compact, setCompact] = useState(false); 

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < BREAKPOINT);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Navbar
      expand="md" 
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
        
        <div className="d-none d-md-flex align-items-center gap-3">
          <h5 className="mb-0 fw-bold text-truncate">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: 13, color: "#888" }}>Last saved: 2 mins ago</span>
            <span style={{ color: "red", fontSize: 14 }}>●</span>
          </div>
        </div>

       
        <Navbar.Toggle
          aria-controls="navbar-header-collapse"
          className="border-0 p-0 ms-auto"
          style={{ fontSize: "1.25rem" }}
        />
      </div>

      <Navbar.Collapse id="navbar-header-collapse" className="bg-white w-100 px-2 py-2 py-md-0">
    
        <div className="d-flex d-md-none flex-column mb-2 px-2">
          <h5 className="fw-bold mb-1">{pageTitle}</h5>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: 13, color: "#888" }}>Last saved: 2 mins ago</span>
            <span style={{ color: "red", fontSize: 14 }}>●</span>
          </div>
        </div>


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
