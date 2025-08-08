
// 'use client';
// import { Navbar, Nav } from 'react-bootstrap';
// import { useRouter } from 'next/router';
// import Image from 'next/image';

// import Link from 'next/link';

// const NavbarEditor = () => {
//   const router = useRouter();

//   const handleExit = () => {
//     router.push('/dashboard'); // Go back to dashboard
//   };

//   return (
//     <Navbar bg="light" expand="lg" className="border-bottom">
//       <div className="d-flex justify-content-between w-100 px-3 py-2">
      

// <div className="d-flex flex-column">
//             <span className="fw-bold">Home Page Editor</span>
//             <div style={{ fontSize: '12px', color: '#777' }}>
//               Last saved: 2 mins ago <span style={{ color: 'red' }}>•</span>
//             </div>
//           </div>
//         {/* Right Side - Status / Buttons */}
//         <Nav className="ms-auto d-flex align-items-center gap-3">
//           <span className="badge bg-success">Published</span>
//           <button className="btn btn-outline-secondary btn-sm">Preview</button>
//           <button className="btn btn-primary btn-sm">Save Changes</button>
//           <button className="btn btn-danger btn-sm" onClick={handleExit}>Exit</button>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarEditor;


// 'use client';
// import { Navbar, Nav } from 'react-bootstrap';
// import { useRouter } from 'next/router';
// import Image from 'next/image';
// import Link from 'next/link';

// const NavbarEditor = ({ onSave }) => {
//   const router = useRouter();

//   return (
//     <Navbar
//       // bg="white"
//       expand="lg"
//       className="shadow-sm border-bottom"
//       style={{
//         height: '30px',
//         padding: '0 1rem',
//         position: 'sticky',
//         top: 0,
//         zIndex: 1000,
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100">
//         {/* Left: Logo + Home Page Editor title */}
//         <div className="d-flex align-items-left gap-6">
//           <Link href="/dashboard">
//             <img
//               src="/images/svg/download.png" // ✅ Your dashboard logo path
//               alt="Logo"
//               style={{ width: '120px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
//             />
//           </Link>

          
//         </div>

   
        
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarEditor;



'use client';
import { Navbar } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

const NavbarEditor = ({ onSave }) => {
  const router = useRouter();

  return (
    <Navbar
      expand="lg"
      // className="border-bottom"
      style={{
        height: '50px',
        padding: '0 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100">
        {/* Left: Logo only */}
        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          <Link href="/dashboard" passHref legacyBehavior>
            <a style={{ textDecoration: 'none' }}>
              <Image
                src="/images/svg/download.png"
                alt="Logo"
                width={130}
                height={70}
                style={{
                  objectFit: 'cover',
                  borderRadius: 'px',
                  marginTop: '-55px', // ⬆ Moved higher by increasing negative margin
                }}
              />
            </a>
          </Link>
        </div>
      </div>
    </Navbar>
  );
};

export default NavbarEditor;
