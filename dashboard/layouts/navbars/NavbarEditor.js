// import { Navbar, Nav } from 'react-bootstrap';

// const NavbarEditor = () => {
//   return (
//     <Navbar bg="light" expand="lg" className="border-bottom">
//       <div className="d-flex justify-content-between w-100 px-3 py-2">
//         {/* Left Side - Editor Title */}
//         <div>
//           <h5 className="mb-0 fw-bold">ION7 Editor</h5>
//         </div>

//         {/* Right Side - Status / Buttons */}
//         <Nav className="ms-auto d-flex align-items-center gap-3">
//           <span className="badge bg-success">Published</span>
//           <button className="btn btn-outline-secondary btn-sm">Preview</button>
//           <button className="btn btn-primary btn-sm">Save Changes</button>
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarEditor;
'use client';
import { Navbar, Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';

const NavbarEditor = () => {
  const router = useRouter();

  const handleExit = () => {
    router.push('/dashboard'); // Go back to dashboard
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom">
      <div className="d-flex justify-content-between w-100 px-3 py-2">
        {/* Left Side - Editor Title */}
        <div>
          <h5 className="mb-0 fw-bold">ION7 Editor</h5>
        </div>

        {/* Right Side - Status / Buttons */}
        <Nav className="ms-auto d-flex align-items-center gap-3">
          <span className="badge bg-success">Published</span>
          <button className="btn btn-outline-secondary btn-sm">Preview</button>
          <button className="btn btn-primary btn-sm">Save Changes</button>
          <button className="btn btn-danger btn-sm" onClick={handleExit}>Exit</button>
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarEditor;
