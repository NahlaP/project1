// C:\Users\97158\Desktop\project1\dashboard\layouts\DefaultDashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import NavbarTop from './navbars/NavbarTop';

const NAVBAR_H = 48; // top bar height (if needed)
const BREAKPOINT = 1120; // breakpoint for compact mode

const DefaultDashboardLayout = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const compact = window.innerWidth <= BREAKPOINT;
      setIsCompact(compact);
      if (!compact) setShowMenu(false);
    };
    handleResize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('sidebar-open', isCompact && showMenu);
  }, [isCompact, showMenu]);

  return (
    <div id="db-wrapper">
      {/* responsive tweak for old header buttons */}
      <style jsx global>{`
        @media (max-width: ${BREAKPOINT}px) {
          .header button[aria-label='Toggle sidebar'],
          .header button[aria-label='Menu'],
          .header .darkmode-toggle {
            display: none !important;
          }
        }
      `}</style>

      {/* Background blobs */}
      <div className="bg-wrapper-custom">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
        <div className="blob blob5" />
      </div>

      <div
        id="page-content"
        style={{
          paddingTop: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top navbar */}
        <NavbarTop isMobile={isCompact} />

        {/* Main content */}
        {props.children}

        {/* Footer */}
        <div className="px-6 py-3 footer-custom">
          <Row>
            <Col sm={12} className="text-center">
              <p className="m-0">
                © {new Date().getFullYear()} ION7 CMS by{' '}
                <img src="images/svg/mavsketch.png" alt="Mavsketch" />
                . All rights reserved.
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default DefaultDashboardLayout;
