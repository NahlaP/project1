
'use client';
import { Navbar, Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';

const NavbarHeader = ({ onSave }) => {
  const router = useRouter();

  const handleExit = () => {
    router.push('/dashboard');
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom">
      <div className="d-flex justify-content-between w-100 px-3 py-2">
        <div>
          <h5 className="mb-0 fw-bold">Menu Editor</h5>
        </div>
        <Nav className="ms-auto d-flex align-items-center gap-3">
          <span className="badge bg-info">Editing</span>
          <button className="btn btn-outline-secondary btn-sm">Preview</button>
          <button className="btn btn-primary btn-sm" onClick={onSave}>Save Changes</button>
          <button className="btn btn-danger btn-sm" onClick={handleExit}>Exit</button>
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarHeader;