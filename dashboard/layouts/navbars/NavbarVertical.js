





// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarVertical.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadset,
  faBars,
  faChartBar,
  faFile,
  faImage,
  faUser,
  faCommentDots,
  faGear,
  faEye,
  faShieldHalved,
  faEnvelope,            // <-- NEW
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const BREAKPOINT = 993;
const NAVBAR_H = 68;

const iconMap = {
  'bar-chart': faChartBar,
  'file': faFile,
  'image': faImage,
  'user': faUser,
  'message-circle': faCommentDots,
  'settings': faGear,
  'eye': faEye,
  'shield': faShieldHalved,
  'envelope': faEnvelope,        // <-- NEW
};

const SidebarItem = ({ icon, label, href }) => {
  const router = useRouter();
  const faIcon = iconMap[icon] || faFile;

  // highlight for exact path *and* nested routes
  const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`d-flex align-items-center gap-3 px-4 py-2 mb-1 ${
        isActive ? 'active-nav-custom rounded-pill fw-semibold' : 'text-dark'
      }`}
      style={{ textDecoration: 'none' }}
    >
      <FontAwesomeIcon icon={faIcon} className="fs-5" />
      <span>{label}</span>
    </Link>
  );
};

const SidebarDashly = () => {
  const [isCompact, setIsCompact] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth <= BREAKPOINT;
      setIsCompact(compact);
      setIsOpen(!compact);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isCompact && isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCompact, isOpen]);

  return (
    <>
      <div
        className='bg-wrapper-custom'
        style={{
          backgroundImage: 'url("images/background/640.webp")',
        }}
      >
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
        <div className="blob blob4"></div>
        <div className="blob blob5"></div>

        <div className="bg-inner-custom"></div>
      </div>

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
        className="side-nav-custom d-flex flex-column position-fixed"
        style={{
          top: isCompact ? NAVBAR_H : 0,
          left: isCompact ? (isOpen ? 0 : -256) : 0,
          height: isCompact ? `calc(100vh - ${NAVBAR_H}px)` : '100vh',
          boxShadow: isCompact && isOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <SimpleBar style={{ height: '100%' }}>
          {/* Logo */}
          <div className="px-4 pt-2 pb-4 d-flex align-items-center gap-2">
            <img
              src="/images/svg/download.png"
              alt="Logo"
              style={{ width: 'auto', height: 100 }}
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
<SidebarItem icon="login" label="login" href="/logino" />
            {/* NEW MENU ITEM */}
            <SidebarItem icon="envelope" label="Email Manager" href="/email-manager" />
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
                alignItems: 'center'
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















