
// import { Fragment, useContext } from "react";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useMediaQuery } from "react-responsive";
// import {
//   ListGroup,
//   Accordion,
//   Card,
//   Badge,
//   useAccordionButton,
//   AccordionContext,
// } from "react-bootstrap";

// // import simple bar scrolling used for notification item scrolling
// import SimpleBar from "simplebar-react";
// import "simplebar/dist/simplebar.min.css";

// // import routes file
// import { DashboardMenu } from "routes/DashboardRoutes";

// const NavbarVertical = (props) => {
//   const location = useRouter();

//   const CustomToggle = ({ children, eventKey, icon }) => {
//     const { activeEventKey } = useContext(AccordionContext);
//     const decoratedOnClick = useAccordionButton(eventKey, () =>
//       console.log("toggle")
//     );
//     const isCurrentEventKey = activeEventKey === eventKey;
//     return (
//       <li className="nav-item">
//         <Link
//           href="#"
//           className="nav-link"
//           onClick={decoratedOnClick}
//           aria-expanded={isCurrentEventKey}
//           aria-controls="navDashboard"
//         >
//           {icon ? <i className={`nav-icon fe fe-${icon} me-2`}></i> : ""}{" "}
//           {children}
//         </Link>
//       </li>
//     );
//   };

//   const CustomToggleLevel2 = ({ children, eventKey }) => {
//     const { activeEventKey } = useContext(AccordionContext);
//     const decoratedOnClick = useAccordionButton(eventKey);
//     const isCurrentEventKey = activeEventKey === eventKey;
//     return (
//       <Link
//         href="#"
//         className="nav-link"
//         onClick={decoratedOnClick}
//         aria-expanded={isCurrentEventKey}
//         aria-controls="navDashboard"
//       >
//         {children}
//       </Link>
//     );
//   };

//   const generateLink = (item) => {
//     return (
//       <Link
//         href={item.link}
//         className={`nav-link ${
//           location.pathname === item.link ? "active" : ""
//         }`}
//         onClick={(e) =>
//           isMobile ? props.onClick(!props.showMenu) : props.showMenu
//         }
//       >
//         {item.name}
//         {item.badge && (
//           <Badge className="ms-1" bg={item.badgecolor || "primary"}>
//             {item.badge}
//           </Badge>
//         )}
//       </Link>
//     );
//   };

//   const isMobile = useMediaQuery({ maxWidth: 767 });

//   return (
//     <Fragment>
//       <SimpleBar style={{ maxHeight: "100vh" }}>
//         {/* ✅ Custom ION7 Brand Top Section */}
//        {/* <div className="nav-scroller px-4 py-3 d-flex align-items-center gap-2">
//   <div
//     className="bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded"
//     style={{ width: "36px", height: "36px", fontSize: "16px" }}
//   >
//     I7
//   </div>
//   <span className="text-white fw-semibold fs-5">ION7</span>
// </div> */}
// <div className="bg-white px-4 py-3 d-flex align-items-center gap-2 border-bottom">
//   <div
//     className="bg-primary text-white fw-bold d-flex align-items-center justify-content-center rounded"
//     style={{ width: "36px", height: "36px", fontSize: "14px" }}
//   >
//     I7
//   </div>
//   <span className="fw-semibold text-dark fs-5">ION7</span>
// </div>


//         {/* Dashboard Menu */}
//         <Accordion
//           defaultActiveKey="0"
//           as="ul"
//           className="navbar-nav flex-column"
//         >
//           {DashboardMenu.map((menu, index) => {
//             if (menu.grouptitle) {
//               return (
//                 <Card bsPrefix="nav-item" key={index}>
//                   <div className="navbar-heading">{menu.title}</div>
//                 </Card>
//               );
//             } else if (menu.children) {
//               return (
//                 <Fragment key={index}>
//                   <CustomToggle eventKey={index} icon={menu.icon}>
//                     {menu.title}
//                     {menu.badge && (
//                       <Badge
//                         className="ms-1"
//                         bg={menu.badgecolor || "primary"}
//                       >
//                         {menu.badge}
//                       </Badge>
//                     )}
//                   </CustomToggle>
//                   <Accordion.Collapse eventKey={index} as="li" bsPrefix="nav-item">
//                     <ListGroup as="ul" bsPrefix="" className="nav flex-column">
//                       {menu.children.map((menuLevel1Item, menuLevel1Index) => {
//                         if (menuLevel1Item.children) {
//                           return (
//                             <ListGroup.Item
//                               as="li"
//                               bsPrefix="nav-item"
//                               key={menuLevel1Index}
//                             >
//                               <Accordion defaultActiveKey="0" className="navbar-nav flex-column">
//                                 <CustomToggleLevel2 eventKey={0}>
//                                   {menuLevel1Item.title}
//                                   {menuLevel1Item.badge && (
//                                     <Badge
//                                       className="ms-1"
//                                       bg={menuLevel1Item.badgecolor || "primary"}
//                                     >
//                                       {menuLevel1Item.badge}
//                                     </Badge>
//                                   )}
//                                 </CustomToggleLevel2>
//                                 <Accordion.Collapse eventKey={0} bsPrefix="nav-item">
//                                   <ListGroup as="ul" className="nav flex-column">
//                                     {menuLevel1Item.children.map(
//                                       (menuLevel2Item, menuLevel2Index) => (
//                                         <ListGroup.Item
//                                           key={menuLevel2Index}
//                                           as="li"
//                                           bsPrefix="nav-item"
//                                         >
//                                           {generateLink(menuLevel2Item)}
//                                         </ListGroup.Item>
//                                       )
//                                     )}
//                                   </ListGroup>
//                                 </Accordion.Collapse>
//                               </Accordion>
//                             </ListGroup.Item>
//                           );
//                         } else {
//                           return (
//                             <ListGroup.Item
//                               as="li"
//                               bsPrefix="nav-item"
//                               key={menuLevel1Index}
//                             >
//                               {generateLink(menuLevel1Item)}
//                             </ListGroup.Item>
//                           );
//                         }
//                       })}
//                     </ListGroup>
//                   </Accordion.Collapse>
//                 </Fragment>
//               );
//             } else {
//               return (
//                 <Card bsPrefix="nav-item" key={index}>
//                   <Link
//                     href={menu.link}
//                     className={`nav-link ${
//                       location.pathname === menu.link ? "active" : ""
//                     }`}
//                   >
//                     {typeof menu.icon === "string" ? (
//                       <i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
//                     ) : (
//                       menu.icon
//                     )}
//                     {menu.title}
//                     {menu.badge && (
//                       <Badge
//                         className="ms-1"
//                         bg={menu.badgecolor || "primary"}
//                       >
//                         {menu.badge}
//                       </Badge>
//                     )}
//                   </Link>
//                 </Card>
//               );
//             }
//           })}
//         </Accordion>
//       </SimpleBar>
//     </Fragment>
//   );
// };

// export default NavbarVertical;





// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import SimpleBar from 'simplebar-react';
// import 'simplebar/dist/simplebar.min.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHeadset, faBars } from '@fortawesome/free-solid-svg-icons';
// import { useState, useEffect } from 'react';

// const SidebarItem = ({ icon, label, href }) => {
//   const router = useRouter();
//   const isActive = router.pathname === href;

//   return (
//     <Link
//       href={href}
//       className={`d-flex align-items-center gap-3 px-4 py-2 mb-1 ${
//         isActive ? 'bg-white text-danger rounded-pill fw-semibold' : 'text-dark'
//       }`}
//       style={{ textDecoration: 'none' }}
//     >
//       <i className={`fe fe-${icon} fs-5`}></i>
//       <span>{label}</span>
//     </Link>
//   );
// };

// const SidebarDashly = () => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [isOpen, setIsOpen] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setIsOpen(!mobile); // Open on desktop, closed on mobile
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <>
//       {/* Hamburger Button (mobile only) */}
//       {isMobile && (
//         <button
//           className="btn btn-outline-secondary position-fixed"
//           style={{
//             top: '16px',
//             left: '16px',
//             zIndex: 2000,
//             borderRadius: '8px',
//           }}
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <FontAwesomeIcon icon={faBars} />
//         </button>
//       )}

//       {/* Sidebar */}
//       <aside
//         className="d-flex flex-column position-fixed top-0 start-0"
//         style={{
//           width: '256px',
//           height: '100vh',
//           backgroundColor: '#F1F1F1',
//           zIndex: 1050,
//           transition: 'transform 0.3s ease-in-out',
//           transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
//           boxShadow: isMobile && isOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
//         }}
//       >
//         <SimpleBar style={{ height: '100%' }}>
//           {/* Logo */}
//           <div className="px-4 pt-2 pb-4 d-flex align-items-center gap-2">
//             <img
//               src="/images/svg/download.png"
//               alt="Logo"
//               style={{
//                 width: '140px',
//                 height: '60px',
//                 borderRadius: '12px',
//                 objectFit: 'cover',
//               }}
//             />
//           </div>

//           {/* Main Menu */}
//           <div className="px-3 pt-2">
//             <p className="text-uppercase small fw-bold text-muted px-2 mb-2">Main Menu</p>
//             <SidebarItem icon="bar-chart" label="Dashboard" href="/dashboard" />
//             <SidebarItem icon="file" label="Content" href="/content" />
//             <SidebarItem icon="image" label="Media" href="/media" />
//             <SidebarItem icon="user" label="Users" href="/users" />
//             <SidebarItem icon="message-circle" label="Comments" href="/comments" />
//           </div>

//           {/* Settings */}
//           <div className="px-3 pt-4">
//             <p className="text-uppercase small fw-bold text-muted px-2 mb-2">Settings</p>
//             <SidebarItem icon="settings" label="General" href="/settings/general" />
//             <SidebarItem icon="eye" label="Appearance" href="/settings/appearance" />
//             <SidebarItem icon="shield" label="Security" href="/settings/security" />
//           </div>

//           {/* Support Box */}
//           <div className="px-4 py-4 mt-auto">
//             <div
//               style={{
//                 width: '100%',
//                 backgroundColor: '#FFFFFF',
//                 borderRadius: '20px',
//                 padding: '12px',
//                 boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}
//             >
//               <div
//                 className="fw-semibold text-dark mb-2 d-flex align-items-center"
//                 style={{ fontSize: '14px', gap: '6px' }}
//               >
//                 <FontAwesomeIcon icon={faHeadset} style={{ width: '14px', height: '14px' }} />
//                 <span>Need help?</span>
//               </div>
//               <div
//                 className="text-muted mb-3 text-center"
//                 style={{ fontSize: '13px', lineHeight: '1.4' }}
//               >
//                 Contact our support team for assistance
//               </div>
//               <button
//                 className="btn btn-outline-dark btn-sm"
//                 style={{
//                   width: '100%',
//                   height: '38px',
//                   fontSize: '13px',
//                   borderRadius: '12px',
//                 }}
//               >
//                 Contact Support
//               </button>
//             </div>
//           </div>
//         </SimpleBar>
//       </aside>
//     </>
//   );
// };

// export default SidebarDashly;




// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarVertical.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset, faBars } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const BREAKPOINT = 993;      // <= 993px => hamburger/off-canvas
const NAVBAR_H = 68;         // height of your fixed top navbar

const SidebarItem = ({ icon, label, href }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={`d-flex align-items-center gap-3 px-4 py-2 mb-1 ${
        isActive ? 'bg-white text-danger rounded-pill fw-semibold' : 'text-dark'
      }`}
      style={{ textDecoration: 'none' }}
    >
      <i className={`fe fe-${icon} fs-5`}></i>
      <span>{label}</span>
    </Link>
  );
};

const SidebarDashly = () => {
  const [isCompact, setIsCompact] = useState(false); // <= 993px
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth <= BREAKPOINT;
      setIsCompact(compact);
      setIsOpen(!compact); // open on desktop, closed in compact
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent page scroll and allow CSS hooks when the drawer is open on compact
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isCompact && isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCompact, isOpen]);

  return (
    <>
      {/* Hamburger Button (compact only) */}
      {isCompact && (
        <button
          className="btn btn-outline-secondary position-fixed"
          style={{
            top: 16,
            left: 16,
            zIndex: 2000,
            borderRadius: 8,
            background: '#fff',
            border: '1px solid #e0e0e0'
          }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className="d-flex flex-column position-fixed"
        style={{
          top: isCompact ? NAVBAR_H : 0,            // drop under top bar in compact
          left: isCompact ? (isOpen ? 0 : -256) : 0, // off-canvas slide on compact
          width: 256,
          height: isCompact ? `calc(100vh - ${NAVBAR_H}px)` : '100vh',
          backgroundColor: '#F1F1F1',
          zIndex: 1050,
          transition: 'left 0.3s ease-in-out',
          boxShadow: isCompact && isOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
          borderRight: '1px solid #dee2e6',
          overflow: 'hidden'
        }}
      >
        <SimpleBar style={{ height: '100%' }}>
          {/* Logo */}
          <div className="px-4 pt-2 pb-4 d-flex align-items-center gap-2">
            <img
              src="/images/svg/download.png"
              alt="Logo"
              style={{
                width: 140,
                height: 60,
                borderRadius: 12,
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Main Menu */}
          <div className="px-3 pt-2">
            <p className="text-uppercase small fw-bold text-muted px-2 mb-2">Main Menu</p>
            <SidebarItem icon="bar-chart" label="Dashboard" href="/dashboard" />
            <SidebarItem icon="file" label="Content" href="/content" />
            <SidebarItem icon="image" label="Media" href="/media" />
            <SidebarItem icon="user" label="Users" href="/users" />
            <SidebarItem icon="message-circle" label="Comments" href="/comments" />
          </div>

          {/* Settings */}
          <div className="px-3 pt-4">
            <p className="text-uppercase small fw-bold text-muted px-2 mb-2">Settings</p>
            <SidebarItem icon="settings" label="General" href="/settings/general" />
            <SidebarItem icon="eye" label="Appearance" href="/settings/appearance" />
            <SidebarItem icon="shield" label="Security" href="/settings/security" />
          </div>

          {/* Support Box */}
          <div className="px-4 py-4 mt-auto">
            <div
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 12,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                className="fw-semibold text-dark mb-2 d-flex align-items-center"
                style={{ fontSize: 14, gap: 6 }}
              >
                <FontAwesomeIcon icon={faHeadset} style={{ width: 14, height: 14 }} />
                <span>Need help?</span>
              </div>
              <div className="text-muted mb-3 text-center" style={{ fontSize: 13, lineHeight: 1.4 }}>
                Contact our support team for assistance
              </div>
              <button
                className="btn btn-outline-dark btn-sm"
                style={{ width: '100%', height: 38, fontSize: 13, borderRadius: 12 }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </SimpleBar>
      </aside>

      {/* Backdrop when drawer open (compact only) */}
      {isCompact && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.35)',
            zIndex: 1040
          }}
        />
      )}
    </>
  );
};

export default SidebarDashly;
