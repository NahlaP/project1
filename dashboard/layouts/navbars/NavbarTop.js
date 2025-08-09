
// import {
// 	Nav,
// 	Navbar,
// } from 'react-bootstrap';

// // import sub components
// import QuickMenu from 'layouts/QuickMenu';
// import NavbarSubscription from './NavbarSubscription';

// const NavbarTop = () => {
// 	return (
// 		<Navbar expanded="lg" className="navbar-classic navbar navbar-expand-lg">
// 			<div className='d-flex justify-content-between w-100 m-1'>
// 				{/* Left Side (Removed Menu icon and search bar) */}
// 				<div></div>

// 				{/* Quick Menu */}
// 				<Nav className="navbar-right-wrap ms-2 d-flex nav-top-wrap p-4">
// 					{/* <QuickMenu /> */}
// 					{/* <NavbarSubscription/> */}
					
// 				</Nav>
// 			</div>
// 		</Navbar>
// 	);
// };

// export default NavbarTop;










// import { Nav, Navbar } from 'react-bootstrap';
// import { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faLightbulb, faBars } from '@fortawesome/free-solid-svg-icons';
// import { faBell } from '@fortawesome/free-regular-svg-icons';

// const NavbarTop = ({ isMobile, toggleMenu }) => {
//   const [localMobile, setLocalMobile] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setLocalMobile(window.innerWidth <= 768);
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <Navbar
//       expanded="lg"
//       className="px-4"
//       style={{
//         backgroundColor: '#F1F1F1',
//         height: '68px',
//         position: 'fixed',
//         top: 0,
//         left: isMobile ? 0 : '250px',
//         width: isMobile ? '100%' : 'calc(100% - 250px)',
//         zIndex: 1030,
//         borderBottom: '1px solid #e0e0e0',
//         display: 'flex',
//         alignItems: 'center',
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
//         {/* 🍔 Hamburger Icon on Mobile */}
//         {/* {localMobile && (
//           <button
//             className="btn btn-outline-dark d-md-none"
//             onClick={toggleMenu}
//             style={{ marginRight: '12px' }}
//           >
//             <FontAwesomeIcon icon={faBars} />
//           </button>
//         )} */}

//         {/* Search Bar */}
//         <div className="flex-grow-1 pe-3" style={{ minWidth: '200px' }}>
//           <input
//             type="text"
//             className="form-control rounded-pill px-4"
//             placeholder="Search..."
//             style={{
//               height: '40px',
//               background: '#fff',
//               border: 'none',
//               boxShadow: 'none',
//               maxWidth: '400px',
//               width: '100%',
//             }}
//           />
//         </div>

//         {/* Right Side Icons and Profile */}
//         <Nav className="d-flex align-items-center gap-3 flex-nowrap">
//           {/* 💡 Bulb */}
//           <div
//             className="rounded-circle bg-white d-flex align-items-center justify-content-center"
//             style={{
//               width: 32,
//               height: 32,
//               padding: 10,
//             }}
//           >
//             <FontAwesomeIcon icon={faLightbulb} style={{ color: '#FE3131', fontSize: 12 }} />
//           </div>

//           {/* 🔔 Bell */}
//           <div
//             className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
//             style={{
//               width: 32,
//               height: 32,
//               padding: 8,
//             }}
//           >
//             <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
//             <span
//               className="position-absolute bg-danger rounded-circle"
//               style={{
//                 width: 6,
//                 height: 6,
//                 border: '1.5px solid white',
//                 top: 3,
//                 right: 3,
//               }}
//             ></span>
//           </div>

//           {/* 👤 Profile */}
//           <div className="d-flex align-items-center gap-2">
//             <img
//               src="https://i.pravatar.cc/40"
//               alt="Profile"
//               className="rounded-circle"
//               width="30"
//               height="30"
//             />
//             <div className="d-none d-sm-flex flex-column">
//               <strong className="fs-6">Marco Botton</strong>
//               <small className="text-muted">Admin</small>
//             </div>
//           </div>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarTop;





// import { Nav, Navbar } from 'react-bootstrap';
// import { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faLightbulb, faBars } from '@fortawesome/free-solid-svg-icons';
// import { faBell } from '@fortawesome/free-regular-svg-icons';

// const NavbarTop = ({ isMobile, toggleMenu }) => {
//   const [localCompact, setLocalCompact] = useState(false);

//   useEffect(() => {
//     const handleResize = () => setLocalCompact(window.innerWidth <= 993);
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const compact = isMobile || localCompact;

//   return (
//     <Navbar
//       expanded="lg"
//       className="px-4"
//       style={{
//         backgroundColor: '#F1F1F1',
//         height: '68px',
//         position: 'fixed',
//         top: 0,
//         left: compact ? 0 : '250px',
//         width: compact ? '100%' : 'calc(100% - 250px)',
//         zIndex: 1030,
//         borderBottom: '1px solid #e0e0e0',
//         display: 'flex',
//         alignItems: 'center',
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
//         {/* 🍔 Hamburger (compact only) */}
//         {compact && (
//           <button
//             type="button"
//             aria-label="Open menu"
//             onClick={toggleMenu}
//             className="btn d-inline-flex p-0 me-2"
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: 12,
//               background: '#fff',
//               border: '1px solid #e0e0e0',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <FontAwesomeIcon icon={faBars} style={{ fontSize: 16, color: '#111' }} />
//           </button>
//         )}

//         {/* Search Bar */}
//         <div className="flex-grow-1 pe-3" style={{ minWidth: 200 }}>
//           <input
//             type="text"
//             className="form-control rounded-pill px-4"
//             placeholder="Search..."
//             style={{
//               height: 40,
//               background: '#fff',
//               border: 'none',
//               boxShadow: 'none',
//               maxWidth: compact ? 300 : 400,
//               width: '100%',
//             }}
//           />
//         </div>

//         {/* Right Side Icons and Profile */}
//         <Nav className="d-flex align-items-center gap-3 flex-nowrap">
//           {/* 💡 Bulb */}
//           <div
//             className="rounded-circle bg-white d-flex align-items-center justify-content-center"
//             style={{ width: 32, height: 32, padding: 10 }}
//           >
//             <FontAwesomeIcon icon={faLightbulb} style={{ color: '#FE3131', fontSize: 12 }} />
//           </div>

//           {/* 🔔 Bell */}
//           <div
//             className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
//             style={{ width: 32, height: 32, padding: 8 }}
//           >
//             <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
//             <span
//               className="position-absolute bg-danger rounded-circle"
//               style={{
//                 width: 6,
//                 height: 6,
//                 border: '1.5px solid white',
//                 top: 3,
//                 right: 3,
//               }}
//             />
//           </div>

//           {/* 👤 Profile */}
//           <div className="d-flex align-items-center gap-2">
//             <img
//               src="https://i.pravatar.cc/40"
//               alt="Profile"
//               className="rounded-circle"
//               width="30"
//               height="30"
//             />
//             <div className="d-none d-sm-flex flex-column">
//               <strong className="fs-6">Marco Botton</strong>
//               <small className="text-muted">Admin</small>
//             </div>
//           </div>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarTop;






// dashboard/layouts/navbars/NavbarTop.js
import { Nav, Navbar, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faBars, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';

const NavbarTop = ({ isMobile, toggleMenu }) => {
  const [localCompact, setLocalCompact] = useState(false);  // ≤993px (your hamburger logic)
  const [isNarrowMenu, setIsNarrowMenu] = useState(false);  // ≤492px → collapse into dropdown

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setLocalCompact(w <= 993);
      setIsNarrowMenu(w <= 492);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const compact = isMobile || localCompact;

  return (
    <Navbar
      expanded="lg"
      className="px-4"
      style={{
        backgroundColor: '#F1F1F1',
        height: '68px',
        position: 'fixed',
        top: 0,
        left: compact ? 0 : '250px',
        width: compact ? '100%' : 'calc(100% - 250px)',
        zIndex: 1030,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        // keep single row; tighten padding only when dropdown mode
        paddingLeft: isNarrowMenu ? 8 : undefined,
        paddingRight: isNarrowMenu ? 8 : undefined,
        overflow: 'hidden',
      }}
    >
      <div
        className="d-flex align-items-center w-100"
        style={{
          flexWrap: 'nowrap',
          columnGap: isNarrowMenu ? 8 : 12,
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* 🍔 Hamburger (compact only, unchanged) */}
        {compact && (
          <button
            type="button"
            aria-label="Open menu"
            onClick={toggleMenu}
            className="btn d-inline-flex p-0 me-2"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#fff',
              border: '1px solid #e0e0e0',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
            }}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: 16, color: '#111' }} />
          </button>
        )}

        {/* Search (hidden at ≤492 because it goes into dropdown) */}
        {!isNarrowMenu && (
          <div
            className="pe-3 flex-grow-1"
            style={{
              minWidth: 200,
              maxWidth: compact ? 300 : 400,
              flex: '1 1 auto',
            }}
          >
            <input
              type="text"
              className="form-control rounded-pill px-4"
              placeholder="Search..."
              style={{
                height: 40,
                background: '#fff',
                border: 'none',
                boxShadow: 'none',
                width: '100%',
              }}
            />
          </div>
        )}

        {/* Right side: icons as usual (hidden at ≤492 in favor of dropdown) */}
        {!isNarrowMenu && (
          <Nav className="d-flex align-items-center gap-3 flex-nowrap" style={{ flex: '0 0 auto' }}>
            {/* 💡 Bulb */}
            <div
              className="rounded-circle bg-white d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, padding: 10, flex: '0 0 auto' }}
            >
              <FontAwesomeIcon icon={faLightbulb} style={{ color: '#FE3131', fontSize: 12 }} />
            </div>

            {/* 🔔 Bell */}
            <div
              className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, padding: 8, flex: '0 0 auto' }}
            >
              <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
              <span
                className="position-absolute bg-danger rounded-circle"
                style={{ width: 6, height: 6, border: '1.5px solid white', top: 3, right: 3 }}
              />
            </div>

            {/* 👤 Profile */}
            <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
              <img
                src="https://i.pravatar.cc/40"
                alt="Profile"
                className="rounded-circle"
                width="30"
                height="30"
              />
              <div className="d-none d-sm-flex flex-column">
                <strong className="fs-6">Marco Botton</strong>
                <small className="text-muted">Admin</small>
              </div>
            </div>
          </Nav>
        )}

        {/* ≤492px: collapse search + icons into a dropdown */}
        {isNarrowMenu && (
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="nav-narrow-toggle"
              className="d-inline-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#fff',
                border: '1px solid #e0e0e0',
                padding: 0,
              }}
              aria-label="More"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 16, color: '#111' }} />
            </Dropdown.Toggle>

            <Dropdown.Menu
              style={{ minWidth: 240, padding: 8, borderRadius: 12 }}
              renderOnMount
            >
              {/* Search inside dropdown */}
              <div className="px-2 py-2">
                <input
                  type="text"
                  className="form-control rounded-pill px-3"
                  placeholder="Search..."
                  style={{
                    height: 38,
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    boxShadow: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <Dropdown.Divider />

              {/* Bulb / Tips */}
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28 }}
                >
                  <FontAwesomeIcon icon={faLightbulb} style={{ color: '#FE3131', fontSize: 12 }} />
                </div>
                Tips
              </Dropdown.Item>

              {/* Notifications */}
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center position-relative"
                  style={{ width: 28, height: 28 }}
                >
                  <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
                  <span
                    className="position-absolute bg-danger rounded-circle"
                    style={{ width: 6, height: 6, border: '1.5px solid white', top: 3, right: 3 }}
                  />
                </div>
                Notifications
              </Dropdown.Item>

              <Dropdown.Divider />

              {/* Profile */}
              <Dropdown.Item as="div" className="px-3 py-2">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Profile"
                    className="rounded-circle"
                    width="28"
                    height="28"
                  />
                  <div className="d-flex flex-column">
                    <strong className="small mb-0">Marco Botton</strong>
                    <small className="text-muted">Admin</small>
                  </div>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </Navbar>
  );
};

export default NavbarTop;
