



// pages/email-manager/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import NavbarTop from '../../layouts/navbars/NavbarTop';
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleList, faUsers, faFilter, faMagnifyingGlass, faUserPlus, faEllipsisVertical, faCheck, faX, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import LiquidGlass from 'liquid-glass-react';

const CPANEL_USER = "mavsketc";
const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";
const CPANEL_UI = process.env.NEXT_PUBLIC_CPANEL_UI || "https://mavsketch.com:2083/frontend/jupiter";
const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "mavsketch.com";


const MAX_EMAIL_ACCOUNTS = 14;

const DEFAULT_QUOTA_MB = 10240;
const makeDefaultCreateForm = (domain) => ({
  domain: domain || DEFAULT_DOMAIN,
  user: "",
  mode: "password",           // "password" | "invite"
  alternateEmail: "",         // used when mode === "invite"
  password: "",
  quotaMB: DEFAULT_QUOTA_MB,
  unlimited: false,
  sendWelcome: false,         // welcome email to the NEW mailbox
  stayAfterCreate: false,
});

const NAVBAR_H = 48;            // top bar height
const BREAKPOINT = 1120;         // ≤ 993px => compact


const EMAILS_API = "/next-api/emails";

export default function EmailManager() {
  const router = useRouter();

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);

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

  
  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth <= 1120;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  //toggle filter & search
  const [openFilter, setOpenFilter] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const searchInputRef = useRef(null);

  const handleFilterMouseEnter = () => setOpenFilter(true);
  const handleFilterMouseLeave = () => setOpenFilter(filter !== "all");

  const handleSearchMouseEnter = () => setOpenSearch(true);
  const handleSearchMouseLeave = () => {
    const hasValue = Boolean((q || "").trim());
    const isFocused = searchInputRef.current && document.activeElement === searchInputRef.current;
    setOpenSearch(hasValue || isFocused);
  };
  

  // data + state
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ header: { available: "∞", used: 0 }, rows: [] });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  // selection
  const [selected, setSelected] = useState({});
  const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  // confirm delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [destroyMail, setDestroyMail] = useState(false);

  // CREATE modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(makeDefaultCreateForm(DEFAULT_DOMAIN));

  // QUOTA modal
  const [showQuota, setShowQuota] = useState(false);

  // toast
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const pushToast = (message, type = "error", duration = 6000) => {
    if (!message) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  };
  useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);

  // 🔔 show flash immediately if redirected with ?flash=... or if something set sessionStorage
  useEffect(() => {
    if (!router.isReady) return;

    // 1) From URL query (preferred)
    let msg = router.query.flash ? String(router.query.flash) : null;
    let t = router.query.flashType ? String(router.query.flashType) : "success";

    
    if (!msg && typeof window !== "undefined") {
      try {
        const ssMsg = window.sessionStorage.getItem("EMAIL_FLASH_MSG");
        const ssType = window.sessionStorage.getItem("EMAIL_FLASH_TYPE") || "success";
        if (ssMsg) {
          msg = ssMsg;
          t = ssType;
          window.sessionStorage.removeItem("EMAIL_FLASH_MSG");
          window.sessionStorage.removeItem("EMAIL_FLASH_TYPE");
        }
      } catch {}
    }

    if (msg) {
      pushToast(msg, t === "success" ? "success" : "error", 8000);
      // strip the flash params from the URL without a full reload
      const { flash, flashType, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.flash, router.query.flashType]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      // 🔁 point to Next API
      const r = await fetch(EMAILS_API);
      const d = await r.json();
      const safe = Array.isArray(d?.rows) ? d : { header: { available: "∞", used: 0 }, rows: [] };
      const rows = (safe.rows || []).map((x) => {
        const isSystem =
          Boolean(x.system) ||
          x.user === CPANEL_USER ||
          (!!x.user && x.email === x.user && !String(x.email || "").includes("@"));
        return { ...x, system: isSystem };
      });
      setData({ header: safe.header || { available: "∞", used: 0 }, rows });
      setSelected({});
      setShowConfirm(false);
      setDestroyMail(false);
    } catch (e) {
      console.error(e);
      setError("Failed to load email accounts.");
      setData({ header: { available: "∞", used: 0 }, rows: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const rows = data.rows || [];

  // domain options for Create
  const domainOptions = useMemo(() => {
    const s = new Set(rows.map(r => r.domain).filter(Boolean));
    if (s.size === 0 && DEFAULT_DOMAIN) s.add(DEFAULT_DOMAIN);
    return Array.from(s).sort();
  }, [rows]);

  useEffect(() => {
    setCreateForm(f => ({ ...f, domain: f.domain || domainOptions[0] || "" }));
  }, [domainOptions.length]);

  const resetCreateState = (domainCandidate) => {
    const dom = domainCandidate || domainOptions[0] || DEFAULT_DOMAIN;
    setCreateForm(makeDefaultCreateForm(dom));
    setCreating(false);
  };

  // filtering
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let r = rows;
    if (term) {
      r = r.filter(
        (x) =>
          (x.email || "").toLowerCase().includes(term) ||
          (x.domain || "").toLowerCase().includes(term)
      );
    }
    if (filter === "restricted") r = r.filter((x) => x.restrictions === "Restricted");
    if (filter === "exceeded") r = r.filter((x) => x.exceeded);
    if (filter === "system") r = r.filter((x) => x.system);
    return r;
  }, [rows, q, filter]);

  // selection helpers
  const visibleSelectable = useMemo(() => filtered.filter((r) => !r.system), [filtered]);
  const allVisibleSelected = useMemo(
    () => visibleSelectable.length > 0 && visibleSelectable.every((r) => selected[r.email]),
    [visibleSelectable, selected]
  );
  const someVisibleSelected = useMemo(
    () => visibleSelectable.some((r) => selected[r.email]) && !allVisibleSelected,
    [visibleSelectable, selected, allVisibleSelected]
  );
  const selectedCountVisible = useMemo(
    () => visibleSelectable.filter((r) => selected[r.email]).length,
    [visibleSelectable, selected]
  );

  // tri-state checkbox visuals
  const miniAllRef = useRef(null);
  const headAllRef = useRef(null);
  useEffect(() => {
    if (miniAllRef.current) miniAllRef.current.indeterminate = someVisibleSelected;
    if (headAllRef.current) headAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  // Mini options visibility (for touch devices)
  const [openMiniFor, setOpenMiniFor] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const [hoverMiniFor, setHoverMiniFor] = useState(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const detect = () => {
        try {
          const hasTouch = "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0 || (navigator.msMaxTouchPoints || 0) > 0;
          const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
          setIsTouch(Boolean(hasTouch || coarse));
        } catch (e) {
          setIsTouch(false);
        }
    };
    detect();
    let mq = null;
    const listener = () => detect();
    if (window.matchMedia) {
      mq = window.matchMedia("(pointer: coarse)");
      if (mq.addEventListener) mq.addEventListener("change", listener);
      else if (mq.addListener) mq.addListener(listener);
    }
    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener("change", listener);
        else if (mq.removeListener) mq.removeListener(listener);
      }
    };
  }, []);

  // Close mini options when clicking outside; allow toggling reliably
  useEffect(() => {
    if (typeof document === "undefined") return;
    function onDocDown(e) {
      try {
        const row = e.target && e.target.closest && e.target.closest('.table-row');
        const clickedEmail = row ? row.getAttribute('data-email') : null;
        // If there is an open mini and the click wasn't inside that same row, close it
        if (openMiniFor && clickedEmail !== openMiniFor) {
          setOpenMiniFor(null);
        }
      } catch (err) {
        // ignore
      }
    }
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [openMiniFor]);

  const toggleOne = (email) => setSelected((prev) => ({ ...prev, [email]: !prev[email] }));
  const toggleAllVisible = () => {
    const map = { ...selected };
    const newState = !allVisibleSelected;
    visibleSelectable.forEach((r) => (map[r.email] = newState));
    setSelected(map);
  };

  // count current non-system accounts for quota logic
  const currentCount = useMemo(() => rows.filter(r => !r.system).length, [rows]);

  // delete flow
  const askDelete = () => {
    if (selectedCountVisible === 0) return;
    setShowConfirm(true);
    setDestroyMail(false);
  };

  const handleDelete = async () => {
    const toDelete = selectedEmails.filter((e) => {
      const row = rows.find((r) => r.email === e);
      return row && !row.system;
    });
    if (!toDelete.length) return;

    setDeleting(true);
    setError("");
    try {
      const r = await fetch(EMAILS_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: toDelete, destroy: destroyMail }),
      });
      const j = await r.json();
      if (!r.ok) {
        const failed =
          (j?.results || []).filter((x) => !x.ok).map((x) => `${x.email}: ${x.error}`).join("\n") ||
          j?.error || "Delete failed";
        throw new Error(failed);
      }
      await load();
      setError("");
      pushToast("Deleted selected accounts", "success");
    } catch (e) {
      console.error(e);
      setError(`Delete failed: ${e.message || e}`);
    } finally {
      setDeleting(false);
    }
  };

  // create flow
  const openCreate = () => {
    // if already at or above limit, show quota modal instead of opening create dialog
    if (currentCount >= MAX_EMAIL_ACCOUNTS) {
      setShowQuota(true);
      return;
    }
    setToast(null);
    setError("");
    resetCreateState(domainOptions[0] || DEFAULT_DOMAIN);
    setShowCreate(true);
  };
  const closeCreate = () => {
    setShowCreate(false);
    resetCreateState(domainOptions[0] || DEFAULT_DOMAIN);
  };

  const genStrongPass = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    let p = ""; for (let i = 0; i < 16; i++) p += alphabet[Math.floor(Math.random() * alphabet.length)];
    setCreateForm(f => ({ ...f, password: p }));
  };

  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

  const submitCreate = async () => {

    if (currentCount >= MAX_EMAIL_ACCOUNTS) {
      setShowCreate(false);
      setShowQuota(true);
      return;
    }

    const { domain, user, password, quotaMB, unlimited, sendWelcome, stayAfterCreate, mode, alternateEmail } = createForm;
    if (!domain || !user) {
      pushToast("Domain and username are required.", "error"); return;
    }
    if (mode === "invite" && !isEmail(alternateEmail)) {
      pushToast("Enter a valid alternate email to send the login link.", "error"); return;
    }
    if (mode === "password" && !password && !sendWelcome) {
      pushToast("Password is required unless you only send the welcome email.", "error"); return;
    }

    setCreating(true);
    try {
      const r = await fetch(EMAILS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          domain,
          user,
          password,
          alternateEmail,
          quotaMB: unlimited ? 0 : Number(quotaMB) || 0,
          sendWelcome: !!sendWelcome,
        }),
      });
      const j = await r.json();
      if (!r.ok || j?.error) {
        const det = j?.details;
        const msg = Array.isArray(det) ? det.join("; ") : (typeof det === "string" ? det : (j?.error || "Create failed"));
        throw new Error(msg);
      }

      await load();

      if (stayAfterCreate) {
        // keep dialog open for bulk adding, but clear user + password + alternateEmail
        setCreateForm(f => ({ ...f, user: "", password: "", alternateEmail: "" }));
      } else {
        closeCreate();
      }
      pushToast(
        mode === "invite"
          ? `Created ${user}@${domain} and invited ${alternateEmail}`
          : `Created ${user}@${domain}`,
        "success"
      );
    } catch (e) {
      console.error(e);
      pushToast(e.message || "Create failed", "error");
    } finally {
      setCreating(false);
    }
  };

  const canCreate =
    !!createForm.domain && !!createForm.user &&
    (createForm.mode === "invite" ? isEmail(createForm.alternateEmail) : (createForm.password || createForm.sendWelcome));

  return (
    <>
      {isCompact && (
        <button
          className="btn btn-outline-secondary position-fixed navbar-button"
          setSidebarOpen
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {/* <FontAwesomeIcon icon={faBars} /> */}
          <img src={`/icons/${sidebarOpen ? "menu-close.png" : "002-app.png"}`} alt="Pro Plan" />
        </button>
      )}
      <div className="header">
        <NavbarTop
          isMobile={isCompact}
          toggleMenu={toggleMenu}
          sidebarVisible={!isCompact}
        />
      </div>

      <div className="bg-wrapper-custom">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />
        <div className="blob blob5" />
        <div className="bg-inner-custom" />
      </div>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} /> */}
        <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCompact={isCompact} setIsCompact={setIsCompact} isMobile={isBelowLg} />

        {/* top-right toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        <main
          className="main-wrapper"
          style={{
            flexGrow: 1,
            marginLeft: !isBelowLg && sidebarOpen ? 240 : 0,
            transition: "margin-left 0.25s ease",
            padding: "3.5rem 10px 20px 10px",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Container fluid="xxl" className="dash-container">

            <h5 className="container-title">
              Email Accounts
            </h5>
            <p className="container-subtitle">
              Create, list, and manage email accounts.
            </p>

            {/* Header Widgets */}
            <Row className="g-4 mb-5">

              {/* First row */}
              <Col xs={12} md={12} lg={12} xl={12} className="">
                <Row className="g-4 mt-2" style={{backgroundImage: "url('https://images.pexels.com/photos/1862000/pexels-photo-1862000.jpeg?_gl=1*fyf8z*_ga*MzI2NjQ4MDQ3LjE3NjIyNTgxMTA.*_ga_8JE65Q40S6*czE3NjgzOTM4NTIkbzQkZzEkdDE3NjgzOTM4OTkkajEzJGwwJGgw')" , height: "100%"}}>

                  {/* --Email Capacity-- */}

                  <Col xs={12} md={7} lg={7} xl={7}>
                    <div style={{width: "100%", display: "flex", height: "300px", position: "relative", overflow: "hidden", borderRadius: 12, padding: 12, boxSizing: "border-box"}}>
                      <LiquidGlass
                        displacementScale={100}
                        blurAmount={0.08}
                        saturation={130}
                        aberrationIntensity={2}
                        elasticity={0.35}
                        cornerRadius={10}
                        padding="20px"
                        // globalMousePos={{ x: mouse.x, y: mouse.y }}
                        style={{
                          position: "relative",
                          width: "calc(100% - 24px)",
                          height: "calc(100% - 24px)",
                          boxSizing: "border-box",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          zIndex: 1,
                        }}
                      >
                        <div style={{ position: "relative", zIndex: 2, color: "#fff", fontWeight: 700 }}>Click Me</div>
                      </LiquidGlass>
                    </div>
                  </Col>
                  <Col xs={12} md={7} lg={7} xl={7}>
                    <Card className="border-0 ion-card h-100 box-card">
                      <Card.Body className="position-relative px-4 pt-5 pb-4">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title">
                              Email Capacity
                            </h5>
                            <div className="card-icon">
                              <img src="/icons/crown.svg" alt="Pro Plan" />
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 rounded-pill fw-bold badge-soft-black">Active</span>
                            <span className="px-3 py-1 rounded-pill fw-bold badge-soft-gray">Monthly</span>
                          </div>
                        </div>

                        <div className="card_wrapper_custom">
                          <h4 className="">
                            8<small className=""> out </small>10 <small className="">   /GB Available</small>
                          </h4>
                          

                          <div className="progress thin">
                            <div className="progress-bar bg-mavsketch" style={{ width: `${(8 / 10) * 100}%` }}>
                              
                            </div>
                          </div>
                        </div>

                      </Card.Body>
                    </Card>
                    
                  </Col>

                  {/* --Email Quota-- */}
                  <Col xs={12} md={5} lg={5} xl={5}>
                    <div className="anim-card-wrapper primary-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top"></div>
                        <div className="border-shadow-right"></div>
                        <div className="border-shadow-bottom"></div>
                        <div className="border-shadow-left"></div>
                        
                        <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                            <filter id='noiseFilter'>
                              <feTurbulence 
                                type='fractalNoise' 
                                baseFrequency='20.43' 
                                numOctaves='400' 
                                stitchTiles='stitch'/>
                            </filter>
                            
                            <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                        </svg>
                        <Card.Body className="" style={{padding: "24px 20px 20px"}}>
                          <div>
                          
                            <h6 className="card-title mb-1" style={{fontSize: "1.25rem"}}>
                              Email Accounts
                            </h6>
                            <p className="mb-0">
                              13 used of 14 accounts total
                            </p>
                          </div>
                          <div className="highlight-number">
                            <div className="number">
                              <span className="highlight">01</span>
                              <span className="separator">/</span>
                              <span className="sub-highlight">14</span>
                            </div>
                            <div className="number-info">Available</div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>
                          <FontAwesomeIcon icon={faUsers} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>


                </Row>
              </Col>

            </Row>

            {/* MODERN TABLE: Email List */}
            <Row className="g-4 mb-5">

              <Col xs={12} md={12} lg={12} xl={12}>
                <div className="anim-card-wrapper dark-bg cap-med">
                  <div className="anim-card">
                    <div className="border-shadow-top"></div>
                    <div className="border-shadow-right"></div>
                    <div className="border-shadow-bottom"></div>
                    <div className="border-shadow-left"></div>
                    <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
                        <filter id='noiseFilter'>
                          <feTurbulence 
                            type='fractalNoise' 
                            baseFrequency='20.43' 
                            numOctaves='400' 
                            stitchTiles='stitch'/>
                        </filter>
                        
                        <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
                    </svg>
                    <Card.Body className="p-3" style={{padding: "24px 20px 20px !important;"}}>
                      <div>
                        <h6 className="card-title mb-1">
                          Email List
                        </h6>
                        <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                          Overview of your email list
                        </p>
                      </div>

                      <div className="card_anim_body">
                        <div className="table-wrapper">

                          <div className="widget-header">
                            <Row className="g-4 mb-3 flex-column-reverse">
                              <Col xs={12} md={7} lg={8} xl={8}>
                                <div className="widget-wrapper">
                                {/*DELETE: mini actions */}
                                  {
                                  selectedEmails.length > 0 &&
                                    <div className="widget-delete-wrapper">
                                      {/* <input
                                        ref={miniAllRef}
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAllVisible}
                                        title="Select all on this list"
                                        style={{ width: 18, height: 18 }}
                                      /> */}
                                      <button
                                        type="button"
                                        onClick={askDelete}
                                        disabled={selectedCountVisible === 0 || deleting}
                                        className="widget-box-delete"
                                      >
                                        <h4>Delete</h4>
                                        <h4 className="bold">
                                          {loading ? "Loading..." : `(${selectedEmails.length})`}
                                        </h4>
                                      </button>
                                    </div>
                                  }
                                {/*FILTER: mini actions */}
                                {["all", "restricted", "system", "exceeded"].map((f) => (
                                  <div 
                                    className={`widget-box ${filter === f ? "widget-box-active" : "widget-box-border"} `}
                                    key={f}
                                    onClick={(e) => {
                                      e.stopPropagation();            // prevent parent click
                                      setFilter(f);
                                      setOpenFilter(f !== "all");    // keep open unless "all"
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filter === f}
                                    />
                                    <div className="widget">
                                      <h4>{f[0].toUpperCase() + f.slice(1)}</h4>
                                    </div>
                                  </div>
                                ))}

                                </div>
                              </Col>
                              <Col xs={12} md={5} lg={4} xl={4}>
                                <div className="box-create-wrapper">
                                  {/* <div className="widget-box-create">
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <div className="widget">
                                      <h4>Create Email</h4>
                                    </div>
                                  </div> */}
                                  <button
                                    className="widget-box-create"
                                    onClick={openCreate}
                                    disabled={currentCount >= MAX_EMAIL_ACCOUNTS}
                                    title={currentCount >= MAX_EMAIL_ACCOUNTS ? "Creation limit reached" : "+ Create"}
                                    style={{opacity: currentCount >= MAX_EMAIL_ACCOUNTS ? 0.6 : 1 }}
                                  >
                                    <FontAwesomeIcon icon={faUserPlus} />
                                    <h4>Create Email</h4>
                                  </button>
                                </div>
                              </Col>
                            </Row>
                          
                          </div>

                          <div className="table">
                            <div className="table-row table-head">

                              <div className="table-col">
                                <input ref={headAllRef} type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="select all" />
                              </div>

                              <div className="table-col">
                                Account @ Domain
                              </div>
                              <div className="table-col">
                                Restrictions
                              </div>
                              <div className="table-col">
                                Storage: Used / Allocated / %
                              </div>
                              <div className="table-col">
                                
                              </div>
                            </div>

                            <div className="table-body">
                              {filtered.map((r) => {
                                const pct = r.unlimited ? null : (r.percent ?? 0);
                                const checked = !!selected[r.email];
                                const isEllipsisActive = openMiniFor === r.email;
                                return (
                                  <>
                                    <div
                                      key={r.email}
                                      className="table-row"
                                      data-email={r.email}
                                      onMouseEnter={() => setHoverMiniFor(r.email)}
                                      onMouseLeave={() => setHoverMiniFor(null)}
                                    >
                                      {/* First col: checkbox */}
                                      <div className="table-col">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleOne(r.email)}
                                          disabled={r.system}
                                          title={r.system ? "System account cannot be deleted" : ""}
                                        />
                                      </div>
                                      {/* Second col: Email */}
                                      <div className="table-col">
                                        <div className="inline-div">
                                          {r.email} {r.system && <span style={badgeSystem}>System</span>}
                                        </div>
                                        
                                      </div>
                                      {/* Third col: Status */}
                                      <div className="table-col">
                                        {
                                        r.restrictions === "Restricted" ? <div class="badge-soft-warning"> <div className="dot"></div>Restricted</div> : <div class="badge-soft-primary"><div className="dot"></div>Unrestricted</div>
                                        }
                                      </div>
                                      {/* Fourth col: Storage/capacity */}
                                      <div className="table-col storage-col">
                                        <div style={{ fontSize: 12 }}>
                                          {r.usedHuman} / {r.allocatedHuman} {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
                                        </div>
                                        <div className="progress">
                                          <div
                                            className={`progress-bar ${r.unlimited ? "unli" : ""}`}
                                            style={{
                                              width: r.unlimited ? "100%" : `${Math.min(100, pct).toFixed(2)}%`,
                                              // background: r.exceeded ? "#e74c3c" : "#9fb6d9",
                                            }}
                                          />
                                        </div>
                                      </div>
                                      {/* Fifth col: Actions */}
                                      <div className="table-col">
                                        <div className="inline-div">
                                          <div className="button-wrapper">
                                            <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" className="link">Check Email</a>
                                            <a href={`/email-manager/${encodeURIComponent(r.email)}`} className="link">Manage</a>
                                            <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" className="link">Connect Devices</a>
                                          </div>
                                          {
                                            isTouch && (
                                              <FontAwesomeIcon
                                                className="table-ellipsis-icon"
                                                icon={faEllipsisVertical}
                                                onClick={isEllipsisActive ? undefined : (e) => {
                                                  e.stopPropagation();
                                                  setOpenMiniFor((prev) => (prev === r.email ? null : r.email));
                                                }}
                                                style={{ position: "relative", zIndex: 9999, pointerEvents: isEllipsisActive ? "none" : "auto" }}
                                                aria-label={`more-${r.email}`}
                                                aria-disabled={isEllipsisActive}
                                                tabIndex={isEllipsisActive ? -1 : 0}
                                              />
                                            )
                                          }
                                          
                                        </div>
                                      </div>
                                      {(openMiniFor === r.email || (!isTouch && hoverMiniFor === r.email)) && (
                                        <div className="table-col table-mini-option">
                                          <div className="button-wrapper">
                                            <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" className="link">Check Email</a>
                                            <a href={`/email-manager/${encodeURIComponent(r.email)}`} className="link">Manage</a>
                                            <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" className="link">Connect Devices</a>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  
                                  </>
                                );
                              })}
                              {/* {filtered.length === 0 && !loading && (
                                <tr>
                                  <td colSpan="5" style={{ ...td, textAlign: "center", color: "#667" }}>No results</td>
                                </tr>
                              )} */}
                            </div>  
                              

                            
                          </div>
                

                        </div>
                      </div>

                    </Card.Body>
                  </div>
                  <figcaption>
                    <span><FontAwesomeIcon icon={faRectangleList} /></span>
                  </figcaption>
                </div>
              </Col>
                              
            </Row>  



     
              

            {/* header stats + Create button */}
            {/* <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
              <Stat label="Available" value={data.header.available} />
              <Stat label="Used" value={data.header.used} />
              <div style={{ flex: 1 }} />
              <button
                type="button"
                onClick={openCreate}
                disabled={currentCount >= MAX_EMAIL_ACCOUNTS}
                title={currentCount >= MAX_EMAIL_ACCOUNTS ? "Creation limit reached" : "+ Create"}
                style={{ ...btn, borderColor: "#22a06b", color: "#167a4f", opacity: currentCount >= MAX_EMAIL_ACCOUNTS ? 0.6 : 1 }}
              >
                + Create
              </button>
            </div> */}

            {/* search + filters */}
            {/* <div style={{ display: "flex", gap: 8, marginBottom: 10, maxWidth: 680 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #d6dbe1" }}
              />
              <button type="button" onClick={() => {}} style={{ ...btn, height: 38 }}>
                Search
              </button>
            </div> */}

            {/* <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#667", fontSize: 13 }}>Filter:</span>
              {["all", "restricted", "system", "exceeded"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #d6dbe1",
                    background: filter === f ? "#1e66d0" : "#f6f8fc",
                    color: filter === f ? "#fff" : "#334",
                    fontWeight: 700,
                    fontSize: 12.5,
                  }}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div> */}

            {/* page banner (load/delete) */}
            {error && (
              <div style={{ background: "#ffecec", border: "1px solid #f3b1b1", color: "#a42828", padding: 10, borderRadius: 6, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {/* confirm delete bar */}
            {showConfirm && (
              <>
                <div className="toaster-overlay" onClick={() => { setShowConfirm(false); setDestroyMail(false); }}></div>
                <div className="toaster-fixed">
                  <div className="toaster-confirmation">
                    <div className="toast-message">
                      <h4>
                      {selectedCountVisible === 1
                        ? `Delete “${visibleSelectable.find(v => selected[v.email])?.email}”?`
                        : `Delete ${selectedCountVisible} email account(s)?`}
                      </h4>
                        <label>
                          <input style={{marginRight: "5px"}} type="checkbox" checked={destroyMail} onChange={(e) => setDestroyMail(e.target.checked)} />
                          Also delete mailbox files on disk
                        </label>
                    </div>
                    <div className="toast-actions">
                      <button type="button" onClick={handleDelete} className="toaster-botton toaster-delete" disabled={deleting}>
                        {
                          deleting ? (
                            <>
                              <div className="modern-loader">
                                <svg viewBox="0 0 120 120" className="infinity-loader">
                                  <path
                                    className="infinity-path"
                                    d="M60,15 a45,45 0 0 1 45,45 a45,45 0 0 1 -45,45 a45,45 0 0 1 -45,-45 a45,45 0 0 1 45,-45"
                                  />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faTrashCan} />
                            </>
                          )
                        }
                      </button>
                      <button type="button" onClick={() => { setShowConfirm(false); setDestroyMail(false); }} className="toaster-botton toaster-cancel" disabled={deleting}>
                        <FontAwesomeIcon icon={faX} />
                      </button>
                      {/* <button type="button" onClick={handleDelete} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }} disabled={deleting}>
                        {deleting ? "Deleting…" : `Delete (${selectedCountVisible})`}
                      </button>
                      <button type="button" onClick={() => { setShowConfirm(false); setDestroyMail(false); }} style={btn} disabled={deleting}>
                        Cancel
                      </button> */}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CREATE MODAL */}
            {showCreate && (
              <div
                className="modal-overlay"
                onClick={() => !creating && closeCreate()}
              >
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <div className="border-shadow-top"></div>
                  <div className="border-shadow-right"></div>
                  <div className="border-shadow-bottom"></div>
                  <div className="border-shadow-left"></div>
                  <h3 className="modal-title">Create an Email Account</h3>
                  <p className="modal-subtitle">Add your email details</p>

                  <div className="modal-body">
                    <div className="input-group">
                      <h4>Domain</h4>
                      <div className="input-box">
                        {domainOptions.length > 0 ? (
                            <select
                              value={createForm.domain}
                              onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value }))}
                              className="input-fld"
                            >
                              {domainOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
                            </select>
                          ) : (
                            <input
                              value={createForm.domain}
                              onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value.trim() }))}
                              placeholder="example.com"
                              className="input-fld"
                            />
                        )} 
                      </div>
                    </div>

                    <div className="input-group">
                      <h4>Username</h4>
                      <div className="input-box">
                        <input
                          value={createForm.user}
                          onChange={(e) => setCreateForm(f => ({ ...f, user: e.target.value.trim() }))}
                          placeholder="e.g. support"
                          className="input-fld"
                        />
                        <div className="input-username">@{createForm.domain || "domain"}</div>
                      </div>
                    </div>

                    {/* Mode selector */}
                    <div className="input-group">
                      <h4>Password Options</h4>
                      <div className="input-box input-select">
                        <input
                          type="radio"
                          name="mode"
                          checked={createForm.mode === "password"}
                          onChange={() => setCreateForm(f => ({ ...f, mode: "password" }))}
                        />
                        Set password now
                      </div>
                      <div className="input-box input-select">
                        <input
                          type="radio"
                          name="mode"
                          checked={createForm.mode === "invite"}
                          onChange={() => setCreateForm(f => ({ ...f, mode: "invite", password: "" }))}
                        />
                        Send login link to alternate email
                      </div>
                    </div>

                    {/* Password (only when mode=password) */}
                    {createForm.mode === "password" && (
                      <div className="input-group">
                        <h4>Password</h4>
                        <div className="input-box">
                          <input
                            type="text"
                            value={createForm.password}
                            onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="Enter password"
                            className="input-fld"
                          />
                          <button type="button" className="primary-button" onClick={genStrongPass}>Generate</button>
                        </div>
                      </div>
                    )}

                  
                    {createForm.mode === "invite" && (
                      <div className="input-group">
                        <h4>Alternate email (where we send the login link)</h4>
                        <div className="input-box">
                          <input
                            type="email"
                            value={createForm.alternateEmail}
                            onChange={(e) => setCreateForm(f => ({ ...f, alternateEmail: e.target.value.trim() }))}
                            placeholder="user@example.com"
                            className="input-fld"
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                      <div className="input-group">
                        <h4>Quota (MB)</h4>
                        <div className="input-box">
                          <input
                            type="number"
                            min="0"
                            disabled={createForm.unlimited}
                            value={createForm.unlimited ? 0 : createForm.quotaMB}
                            onChange={(e) => setCreateForm(f => ({ ...f, quotaMB: e.target.value }))}
                            className="input-fld"
                          />
                          <div className="input-checkbox" style={{ marginLeft: 10 }}>
                            <input
                              type="checkbox"
                              checked={createForm.unlimited}
                              onChange={(e) => setCreateForm(f => ({ ...f, unlimited: e.target.checked }))}
                            />
                            Unlimited
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <div className="input-box">
                        <div className="input-checkbox">
                          <input
                            type="checkbox"
                            checked={createForm.sendWelcome}
                            onChange={(e) => setCreateForm(f => ({ ...f, sendWelcome: e.target.checked }))}
                          />
                          Send welcome email to the new mailbox
                        </div>
                      </div>
                    </div>

                    <details>
                      <summary className="mt-3">Optional Settings</summary>

                      <div className="input-group mt-1">
                        <div className="input-box">
                          <div className="input-checkbox">
                            <input
                              type="checkbox"
                              checked={createForm.stayAfterCreate}
                              onChange={(e) => setCreateForm(f => ({ ...f, stayAfterCreate: e.target.checked }))}
                            />
                            Stay on this dialog after Create (add multiple)
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                    <button type="button" onClick={closeCreate} className="light-button" disabled={creating}>Cancel</button>
                    <button
                      type="button"
                      onClick={submitCreate}
                      className="primary-button"
                      disabled={creating || !canCreate}
                    >
                      {creating ? "Creating…" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUOTA MODAL */}
            {showQuota && (
              <div
                onClick={() => setShowQuota(false)}
                style={{
                  position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 520, background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 12px 28px rgba(0,0,0,.18)" }}
                  role="dialog" aria-modal="true" aria-labelledby="quotaTitle"
                >
                  <h3 id="quotaTitle" style={{ margin: 0, marginBottom: 10 }}>Creation Limit Reached</h3>
                  <p style={{ marginTop: 6, color: "#334", lineHeight: 1.45 }}>
                    You can create up to <strong>{MAX_EMAIL_ACCOUNTS}</strong> email accounts. You currently have{" "}
                    <strong>{currentCount}</strong>. Please delete an existing account or increase your plan limit before creating a new one.
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                    <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" style={btn}>
                      Manage in cPanel
                    </a>
                    <button type="button" onClick={() => setShowQuota(false)} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Container>
        </main>
      </div>
    </>
  );
}

/* UI helpers */
function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #e1e5ea", borderRadius: 6, padding: "10px 14px" }}>
      <div style={{ fontSize: 12, color: "#667" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  const bg = isSuccess ? "#eafff4" : "#ffecec";
  const border = isSuccess ? "#39c07a" : "#f3b1b1";
  const color = isSuccess ? "#0d7a43" : "#a42828";
  const title = isSuccess ? "Success" : "Error";

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 9999,
        maxWidth: 520,
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 10px 24px rgba(0,0,0,.12)",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ fontWeight: 800, marginRight: 4 }}>{title}:</div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.35, flex: 1 }}>{toast.message}</div>
      <button onClick={onClose} title="Close" style={{ ...btn, margin: 0, padding: "2px 8px" }}>
        ×
      </button>
    </div>
  );
}

const th = { textAlign: "left", padding: "10px 14px", borderBottom: "2px solid #cfd5df", fontSize: 13, color: "#303844" };
const td = { padding: "12px 14px", borderTop: "1px solid #dfe3ea", fontSize: 13 };
const btn = {
  display: "inline-block",
  marginRight: 8,
  padding: "6px 10px",
  border: "1px solid #9fc2f2",
  background: "#fff",
  color: "#1e66d0",
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
  textDecoration: "none",
};
const label = { fontSize: 13, color: "#2d3748", display: "grid", gap: 6 };
const input = { height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #d6dbe1", width: "100%" };
const badgeSystem = {
  display: "inline-block",
  marginLeft: 6,
  padding: "2px 8px",
  borderRadius: 4,
  background: "#e7f0ff",
  color: "#1e66d0",
  fontWeight: 700,
  fontSize: 12,
};
