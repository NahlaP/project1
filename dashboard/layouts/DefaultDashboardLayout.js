
// import { useState } from 'react';
// import NavbarVertical from './navbars/NavbarVertical';
// import NavbarTop from './navbars/NavbarTop';
// import { Row, Col } from 'react-bootstrap';

// const ION7DashboardLayout = (props) => {
//   const [showMenu, setShowMenu] = useState(true);
//   const ToggleMenu = () => setShowMenu(!showMenu);

//   return (
//     <div id="db-wrapper" className={`${showMenu ? '' : 'toggled'}`}>
//       <div className="navbar-vertical navbar">
//         <NavbarVertical showMenu={showMenu} onClick={(value) => setShowMenu(value)} />
//       </div>
//       <div id="page-content">
//         <div className="header">
         
// 		  <NavbarTop/>
//         </div>

//         {/* Main Content */}
//         {props.children}

//         {/* Footer */}
//         <div className='px-6 border-top py-3'>
//           <Row>
//             <Col sm={12} className='text-center'>
//               <p className='m-0'>© {new Date().getFullYear()} ION7 CMS. All rights reserved.</p>
//             </Col>
//           </Row>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ION7DashboardLayout;

// import { useState, useEffect } from 'react';
// import NavbarVertical from './navbars/NavbarVertical';
// import NavbarTop from './navbars/NavbarTop';
// import { Row, Col } from 'react-bootstrap';

// const ION7DashboardLayout = (props) => {
//   const [showMenu, setShowMenu] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   const toggleMenu = () => setShowMenu(prev => !prev);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setShowMenu(!mobile);
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <div id="db-wrapper" className={`${showMenu ? '' : 'toggled'}`}>
//       {/* <div className="navbar-vertical navbar">
//         <NavbarVertical showMenu={showMenu} />
//       </div> */}
//       <div id="page-content" style={{
//         marginLeft: showMenu ? 250 : 0,  // Adjust content margin based on sidebar visibility
//         transition: 'margin-left 0.3s ease-in-out',
//       }}>
//         <div className="header">
//           <NavbarTop isMobile={isMobile} toggleMenu={toggleMenu} />
//         </div>

//         {props.children}

//         <div className="px-6 border-top py-3">
//           <Row>
//             <Col sm={12} className="text-center">
//               <p className="m-0">© {new Date().getFullYear()} ION7 CMS. All rights reserved.</p>
//             </Col>
//           </Row>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ION7DashboardLayout;


// import { useState, useEffect } from 'react';
// import NavbarTop from './navbars/NavbarTop';
// import { Row, Col } from 'react-bootstrap';

// const ION7DashboardLayout = (props) => {
//   const [showMenu, setShowMenu] = useState(false); // sidebar not shown
//   const [isMobile, setIsMobile] = useState(false);

//   const toggleMenu = () => setShowMenu(prev => !prev);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setShowMenu(false); 
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <div id="db-wrapper">
  

//       <div
//         id="page-content"
//         style={{
//           marginLeft: 0,
//           transition: 'margin-left 0.3s ease-in-out',
//         }}
//       >
//         <div className="header">
//           <NavbarTop
//             isMobile={isMobile}
//             toggleMenu={toggleMenu}
//             sidebarVisible={false} 
//           />
//         </div>

//         {props.children}

//         <div className="px-6 border-top py-3">
//           <Row>
//             <Col sm={12} className="text-center">
//               <p className="m-0">© {new Date().getFullYear()} ION7 CMS. All rights reserved.</p>
//             </Col>
//           </Row>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ION7DashboardLayout;


// C:\Users\97158\Desktop\project1\dashboard\layouts\DefaultDashboardLayout.js
import { useState, useEffect } from "react";
import NavbarTop from "./navbars/NavbarTop";
import { Row, Col, Container } from "react-bootstrap";

const NAVBAR_H = 68; // keep in sync with NavbarTop

const ION7DashboardLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // if you add a sidebar later

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      id="db-wrapper"
      style={{
        minHeight: "100dvh",
        background: "#F1F1F1",
        paddingLeft: 0, // no sidebar now
      }}
    >
      {/* Fixed header */}
      <div className="header" style={{ position: "sticky", top: 0, zIndex: 1030 }}>
        <NavbarTop
          isMobile={isMobile}
          toggleMenu={toggleMenu}
          sidebarVisible={false} // no sidebar right now
        />
      </div>

      {/* Main content area */}
      <main
        id="page-content"
        style={{
          transition: "margin-left 0.3s ease-in-out",
          // ensure content is never hidden under the fixed header
          paddingTop: `calc(${NAVBAR_H}px + env(safe-area-inset-top, 0px))`,
          paddingBottom: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <Container fluid className="px-0 px-sm-2">
          {children}
        </Container>
      </main>

      {/* Footer */}
      <footer className="px-4 px-sm-6 border-top py-3 bg-white">
        <Row className="mx-0">
          <Col sm={12} className="text-center">
            <p className="m-0">
              © {new Date().getFullYear()} ION7 CMS. All rights reserved.
            </p>
          </Col>
        </Row>
      </footer>
    </div>
  );
};

export default ION7DashboardLayout;
