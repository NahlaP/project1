
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



// dashboard/layouts/DefaultDashboardLayout.js
import { useState, useEffect } from 'react';
import NavbarTop from './navbars/NavbarTop';
import { Row, Col } from 'react-bootstrap';

const NAVBAR_H = 68; // your NavbarTop height

const ION7DashboardLayout = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => setShowMenu(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowMenu(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="db-wrapper">
      <div
        id="page-content"
        style={{
          marginLeft: 0,
          transition: 'margin-left 0.3s ease-in-out',
          // ⬇️ only affect mobile spacing so content isn't hidden by the header
          paddingTop: isMobile ? NAVBAR_H : 0,
          paddingLeft: isMobile ? 16 : 0,
          paddingRight: isMobile ? 16 : 0,
          backgroundColor: '#F1F1F1',
          minHeight: '100vh',
        }}
      >
        <div className="header">
          <NavbarTop
            isMobile={isMobile}
            toggleMenu={toggleMenu}
            sidebarVisible={false}
          />
        </div>

        {props.children}

        <div className="px-6 border-top py-3 bg-white">
          <Row>
            <Col sm={12} className="text-center">
              <p className="m-0">© {new Date().getFullYear()} ION7 CMS. All rights reserved.</p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ION7DashboardLayout;
