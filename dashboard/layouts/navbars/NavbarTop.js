
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




// // C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarTop.js
// import { Nav, Navbar } from 'react-bootstrap';
// import { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBell } from '@fortawesome/free-regular-svg-icons';

// const NavbarTop = ({ isMobile }) => {
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
//         {/* Search Bar */}
//         <div
//           className="flex-grow-1 pe-3"
//           style={{
//             minWidth: 20,
//             marginLeft: compact ? '4opx' : '0px', // move right on small screens
//           }}
//         >
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

//         {/* Right Side Icons */}
//         <Nav className="d-flex align-items-center gap-3 flex-nowrap">
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


// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarTop.js
import { Nav, Navbar, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical, faSearch } from '@fortawesome/free-solid-svg-icons';

const TINY_BP = 438; // <= 438px => move Search/Bell/Profile into a dropdown on the right

const NavbarTop = ({ isMobile }) => {
  const [localCompact, setLocalCompact] = useState(false);  // <= 993
  const [isTiny, setIsTiny] = useState(false);              // <= 438

  useEffect(() => {
    const onResize = () => {
      setLocalCompact(window.innerWidth <= 993);
      setIsTiny(window.innerWidth <= TINY_BP);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 gap-2">
        {/* Left side spacer (keeps layout balanced when sidebar hamburger exists) */}
        <div style={{ width: 44, flex: '0 0 auto' }} />

        {/* Search (hidden on tiny screens; moves into dropdown) */}
        {!isTiny && (
          <div className="flex-grow-1 pe-3" style={{ minWidth: 200 }}>
            <div className="position-relative">
              <input
                type="text"
                className="form-control rounded-pill ps-5 pe-4"
                placeholder="Search..."
                style={{
                  height: 40,
                  background: '#fff',
                  border: 'none',
                  boxShadow: 'none',
                  maxWidth: compact ? 300 : 400,
                  width: '100%',
                }}
              />
              <FontAwesomeIcon
               
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 12,
                  color: '#777',
                }}
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        <Nav className="d-flex align-items-center gap-3 flex-nowrap" style={{ flex: '0 0 auto' }}>
          {/* When tiny: show one compact dropdown anchored to the right */}
          {isTiny ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                className="btn d-inline-flex p-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 16, color: '#111' }} />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="p-2" style={{ minWidth: 260 }}>
                {/* Search inside dropdown */}
                <div className="mb-2">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control rounded-pill ps-5 pe-4"
                      placeholder="Search..."
                      style={{
                        height: 38,
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        boxShadow: 'none',
                        width: '100%',
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 12,
                        color: '#777',
                      }}
                    />
                  </div>
                </div>

                {/* Bell */}
                <div className="d-flex align-items-center justify-content-between p-2 rounded"
                  style={{ background: '#fafafa', border: '1px solid #eee' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, padding: 8, border: '1px solid #eee' }}
                    >
                      <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
                      <span
                        className="position-absolute bg-danger rounded-circle"
                        style={{ width: 6, height: 6, border: '1.5px solid white', top: 3, right: 3 }}
                      />
                    </div>
                    <span className="small text-muted">Notifications</span>
                  </div>
                  <span className="badge text-bg-danger">3</span>
                </div>

                {/* Profile */}
                <div className="d-flex align-items-center gap-2 mt-2 p-2 rounded"
                  style={{ background: '#fafafa', border: '1px solid #eee' }}>
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Profile"
                    className="rounded-circle"
                    width="30"
                    height="30"
                  />
                  <div className="d-flex flex-column">
                    <strong className="fs-6">Marco Botton</strong>
                    <small className="text-muted">Admin</small>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            // Normal (≥ 439px): show bell + profile inline on right
            <>
              <div
                className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32, padding: 8, border: '1px solid #e0e0e0' }}
              >
                <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
                <span
                  className="position-absolute bg-danger rounded-circle"
                  style={{ width: 6, height: 6, border: '1.5px solid white', top: 3, right: 3 }}
                />
              </div>

              <div className="d-flex align-items-center gap-2">
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
            </>
          )}
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarTop;
