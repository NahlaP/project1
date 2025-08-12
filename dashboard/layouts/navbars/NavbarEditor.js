



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
                  marginTop: '-55px', 
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
