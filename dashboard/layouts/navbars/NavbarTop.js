



// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarTop.js
import { Nav, Navbar, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical, faRightFromBracket, faSearch, faPowerOff } from '@fortawesome/free-solid-svg-icons';

const TINY_BP = 438;

const NavbarTop = ({ isMobile }) => {
  const [localCompact, setLocalCompact] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const router = useRouter();

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

  // -------- Logout ----------
  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      document.cookie = 'auth=; Max-Age=0; path=/; SameSite=Lax';

    } catch {}
    const next = encodeURIComponent(router.asPath || '/dashboard');
    router.replace(`/login?next=${next}`);
  };

  return (
    <Navbar
      expanded="lg"
      className="px-4 nav-header-custom"
      style={{
        left: compact ? 0 : '256px',
        width: compact ? '100%' : 'calc(100% - 256px)',
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 gap-2">
        <div style={{ width: 44, flex: '0 0 auto' }} />

        {/* ------Search input */}
        {/* {!isTiny && (
          <div
            className="pe-3"
            style={{
              flex: '1 1 auto',        
              minWidth: 220,
              maxWidth: compact ? 360 : 480,
            }}
          >
            <input
              type="text"
              className="form-control rounded-pill ps-4 pe-4"
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
        )} */}

        {/* Right Side */}
        <Nav className="d-flex align-items-center gap-3 flex-nowrap" style={{ flex: '0 0 auto' }}>
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
                        pointerEvents: 'none',
                      }}
                      aria-hidden
                    />
                  </div>
                </div>

                <div
                  className="d-flex align-items-center justify-content-between p-2 rounded"
                  style={{ background: '#fafafa', border: '1px solid #eee' }}
                >
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

                <div
                  className="d-flex align-items-center gap-2 mt-2 p-2 rounded"
                  style={{ background: '#fafafa', border: '1px solid #eee' }}
                >
                  <img src="https://i.pravatar.cc/40" alt="Profile" className="rounded-circle" width="30" height="30" />
                  <div className="d-flex flex-column">
                    <strong className="fs-6">Marco Botton</strong>
                    <small className="text-muted">Admin</small>
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    {/* <FontAwesomeIcon icon={faRightFromBracket} /> */}
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              {/* <div
                className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32, padding: 8, border: '1px solid #e0e0e0' }}
              >
                <FontAwesomeIcon icon={faBell} style={{ color: '#222', fontSize: 12 }} />
                <span
                  className="position-absolute bg-danger rounded-circle"
                  style={{ width: 6, height: 6, border: '1.5px solid white', top: 3, right: 3 }}
                />
              </div> */}
              <div className="navbar-profile">
                {/* <img src="https://i.pravatar.cc/40" alt="Profile" className="rounded-circle"/> */}
                <img src="images/avatar/avatar-1.jpg" alt="Profile" className="rounded-circle"/>
                <div className="user-info">
                  <strong className="fs-6">Marco Botton</strong>
                  <small className="text-muted">Admin</small>
                </div>
              </div>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faPowerOff} />
              </button>
            </>
          )}
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarTop;
