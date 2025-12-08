






// // C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarTop.js
// import React, { useEffect, useState } from "react";
// import { Nav, Navbar, Dropdown } from "react-bootstrap";
// import { useRouter } from "next/router";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBell } from "@fortawesome/free-regular-svg-icons";
// import {
//   faEllipsisVertical,
//   faSearch,
//   faPowerOff,
// } from "@fortawesome/free-solid-svg-icons";

// // ✅ only import api – api.logout will clear token + cookie
// import { api } from "../../lib/api";

// const TINY_BP = 438;

// const NavbarTop = ({ isMobile }) => {
//   const [localCompact, setLocalCompact] = useState(false);
//   const [isTiny, setIsTiny] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const onResize = () => {
//       if (typeof window === "undefined") return;
//       setLocalCompact(window.innerWidth <= 993);
//       setIsTiny(window.innerWidth <= TINY_BP);
//     };

//     onResize();

//     if (typeof window !== "undefined") {
//       window.addEventListener("resize", onResize);
//       return () => window.removeEventListener("resize", onResize);
//     }
//   }, []);

//   const compact = isMobile || localCompact;

//   // -------- Logout (FIXED) ----------
//     // -------- Logout (FIXED) ----------
//   const handleLogout = async () => {
//     try {
//       // 1) tell backend to clear httpOnly cookie + any server state
//       await api.logout();
//     } catch (e) {
//       // if backend is down, still continue
//       console.warn("logout api failed", e);
//     }

//     // 2) Clear ALL possible auth cookies on the client
//     if (typeof document !== "undefined") {
//       const cookieNames = [
//         "auth_token",
//         "ion7dev_auth",
//         process.env.NEXT_PUBLIC_COOKIE_NAME,
//         process.env.COOKIE_NAME,
//       ].filter(Boolean);

//       cookieNames.forEach((name) => {
//         // clear for root path
//         document.cookie = `${name}=; Max-Age=0; path=/`;
//         document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
//       });
//     }

//     // 3) HARD redirect so old dashboard React tree is destroyed
//     if (typeof window !== "undefined") {
//       window.location.href = "/authentication/signin";
//     } else {
//       router.replace("/authentication/signin");
//     }
//   };

//   return (
//     <Navbar
//       expand="lg"
//       className="px-4 nav-header-custom"
//       style={{
//         left: compact ? 0 : "256px",
//         width: compact ? "100%" : "calc(100% - 256px)",
//       }}
//     >
//       <div className="d-flex justify-content-between align-items-center w-100 gap-2">
//         <div style={{ width: 44, flex: "0 0 auto" }} />

//         {/* Right Side */}
//         <Nav
//           className="d-flex align-items-center gap-3 flex-nowrap"
//           style={{ flex: "0 0 auto" }}
//         >
//           {isTiny ? (
//             // -------------- MOBILE: ellipsis dropdown --------------
//             <Dropdown align="end">
//               <Dropdown.Toggle
//                 as="button"
//                 className="btn d-inline-flex p-0"
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 12,
//                   background: "#fff",
//                   border: "1px solid #e0e0e0",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <FontAwesomeIcon
//                   icon={faEllipsisVertical}
//                   style={{ fontSize: 16, color: "#111" }}
//                 />
//               </Dropdown.Toggle>

//               <Dropdown.Menu
//                 align="end"
//                 className="p-2"
//                 style={{ minWidth: 260 }}
//               >
//                 <div className="mb-2">
//                   <div className="position-relative">
//                     <input
//                       type="text"
//                       className="form-control rounded-pill ps-5 pe-4"
//                       placeholder="Search..."
//                       style={{
//                         height: 38,
//                         background: "#fff",
//                         border: "1px solid #e0e0e0",
//                         boxShadow: "none",
//                         width: "100%",
//                       }}
//                     />

//                     <FontAwesomeIcon
//                       icon={faSearch}
//                       style={{
//                         position: "absolute",
//                         left: 12,
//                         top: "50%",
//                         transform: "translateY(-50%)",
//                         fontSize: 12,
//                         color: "#777",
//                         pointerEvents: "none",
//                       }}
//                       aria-hidden
//                     />
//                   </div>
//                 </div>

//                 <div
//                   className="d-flex align-items-center justify-content-between p-2 rounded"
//                   style={{ background: "#fafafa", border: "1px solid #eee" }}
//                 >
//                   <div className="d-flex align-items-center gap-2">
//                     <div
//                       className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
//                       style={{
//                         width: 32,
//                         height: 32,
//                         padding: 8,
//                         border: "1px solid #eee",
//                       }}
//                     >
//                       <FontAwesomeIcon
//                         icon={faBell}
//                         style={{ color: "#222", fontSize: 12 }}
//                       />
//                       <span
//                         className="position-absolute bg-danger rounded-circle"
//                         style={{
//                           width: 6,
//                           height: 6,
//                           border: "1.5px solid white",
//                           top: 3,
//                           right: 3,
//                         }}
//                       />
//                     </div>
//                     <span className="small text-muted">Notifications</span>
//                   </div>
//                   <span className="badge text-bg-danger">3</span>
//                 </div>

//                 <div
//                   className="d-flex align-items-center gap-2 mt-2 p-2 rounded"
//                   style={{ background: "#fafafa", border: "1px solid #eee" }}
//                 >
//                   <img
//                     src="https://i.pravatar.cc/40"
//                     alt="Profile"
//                     className="rounded-circle"
//                     width="30"
//                     height="30"
//                   />
//                   <div className="d-flex flex-column">
//                     <strong className="fs-6">Marco Botton</strong>
//                     <small className="text-muted">Admin</small>
//                   </div>
//                 </div>

//                 <div className="mt-2">
//                   <button className="logout-button" onClick={handleLogout}>
//                     <FontAwesomeIcon icon={faPowerOff} />
//                   </button>
//                 </div>
//               </Dropdown.Menu>
//             </Dropdown>
//           ) : (
//             // -------------- DESKTOP: Marco pill + ONE logout icon --------------
//             <div className="navbar-profile">
//               <img
//                 src="images/avatar/avatar-1.jpg"
//                 alt="Profile"
//                 className="rounded-circle"
//               />
//               <div className="user-info">
//                 <strong className="fs-6">Marco Botton</strong>
//                 <small className="text-muted">Admin</small>
//               </div>

//               {/* only one logout icon, inside the pill */}
//               <button
//                 className="logout-button logout-button-inline"
//                 onClick={handleLogout}
//               >
//                 <FontAwesomeIcon icon={faPowerOff} />
//               </button>
//             </div>
//           )}
//         </Nav>
//       </div>
//     </Navbar>
//   );
// };

// export default NavbarTop;



















// C:\Users\97158\Desktop\project1\dashboard\layouts\navbars\NavbarTop.js
import React, { useEffect, useState } from "react";
import { Nav, Navbar, Dropdown } from "react-bootstrap";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import {
  faEllipsisVertical,
  faSearch,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";

// ✅ only import api – api.logout will clear token + cookie on backend
import { api } from "../../lib/api";

const TINY_BP = 438;

const NavbarTop = ({ isMobile }) => {
  const [localCompact, setLocalCompact] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      setLocalCompact(window.innerWidth <= 993);
      setIsTiny(window.innerWidth <= TINY_BP);
    };

    onResize();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  const compact = isMobile || localCompact;

  // -------- Logout (FIXED with history replace) ----------
  const handleLogout = async () => {
    try {
      // 1) tell backend to clear httpOnly cookie + any server state
      await api.logout();
    } catch (e) {
      // if backend is down, still continue
      console.warn("logout api failed", e);
    }

    // 2) Clear any client-side state
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
      } catch {}
      try {
        sessionStorage.clear();
      } catch {}

      // 3) HARD redirect with replace (so back button won't return to /dashboard)
      const isProdHost =
        window.location.hostname === "ion7dashboard.mavsketch.com";

      const signinUrl = isProdHost
        ? "https://ion7dashboard.mavsketch.com/authentication/signin?next=%2Fdashboard"
        : "/authentication/signin?next=%2Fdashboard";

      window.location.replace(signinUrl);
    } else {
      // SSR fallback
      router.replace("/authentication/signin?next=%2Fdashboard");
    }
  };

  return (
    <Navbar
      expand="lg"
      className="px-4 nav-header-custom"
      style={{
        left: compact ? 0 : "256px",
        width: compact ? "100%" : "calc(100% - 256px)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100 gap-2">
        <div style={{ width: 44, flex: "0 0 auto" }} />

        {/* Right Side */}
        <Nav
          className="d-flex align-items-center gap-3 flex-nowrap"
          style={{ flex: "0 0 auto" }}
        >
          {isTiny ? (
            // -------------- MOBILE: ellipsis dropdown --------------
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                className="btn d-inline-flex p-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  style={{ fontSize: 16, color: "#111" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu
                align="end"
                className="p-2"
                style={{ minWidth: 260 }}
              >
                <div className="mb-2">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control rounded-pill ps-5 pe-4"
                      placeholder="Search..."
                      style={{
                        height: 38,
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        boxShadow: "none",
                        width: "100%",
                      }}
                    />

                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        color: "#777",
                        pointerEvents: "none",
                      }}
                      aria-hidden
                    />
                  </div>
                </div>

                <div
                  className="d-flex align-items-center justify-content-between p-2 rounded"
                  style={{ background: "#fafafa", border: "1px solid #eee" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="position-relative rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 8,
                        border: "1px solid #eee",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        style={{ color: "#222", fontSize: 12 }}
                      />
                      <span
                        className="position-absolute bg-danger rounded-circle"
                        style={{
                          width: 6,
                          height: 6,
                          border: "1.5px solid white",
                          top: 3,
                          right: 3,
                        }}
                      />
                    </div>
                    <span className="small text-muted">Notifications</span>
                  </div>
                  <span className="badge text-bg-danger">3</span>
                </div>

                <div
                  className="d-flex align-items-center gap-2 mt-2 p-2 rounded"
                  style={{ background: "#fafafa", border: "1px solid #eee" }}
                >
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

                <div className="mt-2">
                  <button className="logout-button" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            // -------------- DESKTOP: Marco pill + ONE logout icon --------------
            <div className="navbar-profile">
              <img
                src="images/avatar/avatar-1.jpg"
                alt="Profile"
                className="rounded-circle"
              />
              <div className="user-info">
                <strong className="fs-6">Marco Botton</strong>
                <small className="text-muted">Admin</small>
              </div>

              {/* only one logout icon, inside the pill */}
              <button
                className="logout-button logout-button-inline"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faPowerOff} />
              </button>
            </div>
          )}
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavbarTop;
