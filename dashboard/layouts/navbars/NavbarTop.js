
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
// import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
// import { faBell } from '@fortawesome/free-regular-svg-icons';

// const NavbarTop = () => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
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
//           {/* 🔴 Bulb Icon */}
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

//           {/* 🔔 Bell Icon with Dot */}
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

//           {/* 👤 Profile Info */}
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



import { Nav, Navbar } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faBars } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';

const NavbarTop = ({ isMobile, toggleMenu }) => {
  const [localMobile, setLocalMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setLocalMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Navbar
      expanded="lg"
      className="px-4"
      style={{
        backgroundColor: '#F1F1F1',
        height: '68px',
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : '250px',
        width: isMobile ? '100%' : 'calc(100% - 250px)',
        zIndex: 1030,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
        {/* 🍔 Hamburger Icon on Mobile */}
        {/* {localMobile && (
          <button
            className="btn btn-outline-dark d-md-none"
            onClick={toggleMenu}
            style={{ marginRight: '12px' }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )} */}

        {/* Search Bar */}
        <div className="flex-grow-1 pe-3" style={{ minWidth: '200px' }}>
          <input
            type="text"
            className="form-control rounded-pill px-4"
            placeholder="Search..."
            style={{
              height: '40px',
              background: '#fff',
              border: 'none',
              boxShadow: 'none',
              maxWidth: '400px',
              width: '100%',
            }}
          />
        </div>

        {/* Right Side Icons and Profile */}
        <Nav className="d-flex align-items-center gap-3 flex-nowrap">
          {/* 💡 Bulb */}
          <div
            className="rounded-circle bg-white d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              padding: 10,
            }}
          >
            <FontAwesomeIcon icon={faLightbulb} style={{ color: '#FE3131', fontSize: 12 }} />
          </div>

          {/* 🔔 Bell */}
          <div
            className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              padding: 8,
            }}
          >
            <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
            <span
              className="position-absolute bg-danger rounded-circle"
              style={{
                width: 6,
                height: 6,
                border: '1.5px solid white',
                top: 3,
                right: 3,
              }}
            ></span>
          </div>

          {/* 👤 Profile */}
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
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarTop;
