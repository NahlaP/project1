



// C:\Users\97158\Desktop\project1\dashboard\layouts\DefaultDashboardLayout.js

import { useState, useEffect } from 'react';
import NavbarTop from './navbars/NavbarTop';
import { Row, Col } from 'react-bootstrap';

const NAVBAR_H = 48;            
const BREAKPOINT = 993;         

const ION7DashboardLayout = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const toggleMenu = () => setShowMenu(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth <= BREAKPOINT;
      setIsCompact(compact);
      if (!compact) setShowMenu(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('sidebar-open', isCompact && showMenu);
  }, [isCompact, showMenu]);

  return (
    <div id="db-wrapper">
    
      <style jsx global>{`
        @media (max-width: ${BREAKPOINT}px) {
          .header button[aria-label="Toggle sidebar"],
          .header button[aria-label="Menu"],
          .header .darkmode-toggle {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="page-content"
        style={{
          paddingTop: isCompact ? NAVBAR_H : 0,
        }}
      >
      <div className="header">
        <NavbarTop
          isMobile={isCompact}
          toggleMenu={toggleMenu}
          sidebarVisible={!isCompact}

        />
      </div>

      {props.children}

        {isCompact && showMenu && (
          <div className="mobile-backdrop" onClick={() => setShowMenu(false)} />
        )}

        <div className="px-6 py-3 footer-custom">
          <Row>
            <Col sm={12} className="text-center">
              <p className="m-0">
                © {new Date().getFullYear()} ION7 CMS by 
                <img
            src="images/svg/mavsketch.png"
            alt="Mavsketch"
          />
    . All rights reserved.
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ION7DashboardLayout;
