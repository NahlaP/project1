

// pages/email-manager/[email].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import NavbarTop from '../../layouts/navbars/NavbarTop';
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeCircleCheck, faPaperPlane, faInfinity, faTrashCan, faEnvelope, faSliders, faX} from "@fortawesome/free-solid-svg-icons";

const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";

const NAVBAR_H = 48;            // top bar height
const BREAKPOINT = 1120;         // ≤ 993px => compact

export default function ManageEmailPage() {
  const router = useRouter();
  const { email } = router.query;

  const [showMenu, setShowMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);


  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);

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

    // helper: show decimals only when needed
    const formatSmart = (value, decimals = 1) => {
      if (value == null || Number.isNaN(Number(value))) return "";
      const n = Number(value);
      // Always show 1 decimal for values < 1
      if (n < 1) return n.toFixed(2);
      const rounded = Number(n.toFixed(decimals));
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
    };


  // useEffect(() => {
  //   const onResize = () => {
  //     const below = typeof window !== "undefined" ? window.innerWidth < 992 : false;
  //     setIsBelowLg(below);
  //     setSidebarOpen(!below);
  //   };
  //   onResize();
  //   if (typeof window !== "undefined") {
  //     window.addEventListener("resize", onResize);
  //     return () => window.removeEventListener("resize", onResize);
  //   }
  // }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success"); // "success" | "error"

  // mailbox data
  const [box, setBox] = useState(null);

  // form state
  const [password, setPassword] = useState("");
  const [quotaMB, setQuotaMB] = useState(0);
  const [unlimited, setUnlimited] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [outgoing, setOutgoing] = useState(false);
  const [login, setLogin] = useState(false);

  // storage data (for display in card)
  const [storageUsedGB, setStorageUsedGB] = useState(0);
  const [storageAllocGB, setStorageAllocGB] = useState(0);
  const [storageRemainingPercent, setStorageRemainingPercent] = useState(0);

  const [stayAfterSave, setStayAfterSave] = useState(false);

  // ------------USED EMAIL STORAGE FUNC
  const usedHuman = useMemo(() => {
    if (!box) return "0 MB";
    const v = Number(box.usedMB || 0);
    return v >= 1024 ? `${(v / 1024).toFixed(2)} GB` : `${v.toFixed(2)} MB`;
  }, [box]);

  async function load() {
    if (!email) return;
    setLoading(true);
    setFlash("");
    try {
      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to load");
      setBox(j);
      setQuotaMB(j.unlimited ? 0 : Number(j.quotaMB || 0));
      setUnlimited(!!j.unlimited);
      setIncoming(!!j?.suspended?.incoming);
      setOutgoing(!!j?.suspended?.outgoing);
      setLogin(!!j?.suspended?.login);
      setPassword("");
      console.log("Loaded email data:", j);

      // Email storage Data: convert MB → GB and calculate remaining
      const usedMB = Number(j.usedMB || 0);
      const allocMB = j.unlimited ? 0 : Number(j.quotaMB || 0);
      const usedGB = usedMB / 1024;
      const allocGB = allocMB / 1024;
      const remainingGB = Math.max(0, allocGB - usedGB);
      const remainingPercent = allocGB > 0 ? (remainingGB / allocGB) * 100 : 0;

      // Set state so it persists across renders
      setStorageUsedGB(usedGB);
      setStorageAllocGB(allocGB);
      setStorageRemainingPercent(remainingPercent);
    } catch (e) {
      setFlash(e.message || String(e));
      setFlashType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [email]);

  // percentage used (derived from storage state)
  const storageUsedPercent = storageAllocGB > 0 ? (storageUsedGB / storageAllocGB) * 100 : storageUsedGB > 0 ? 100 : 0;
  const storageUsedPercentClamped = Math.min(100, Math.max(0, storageUsedPercent));

  async function save() {
    if (!email) return;
    setSaving(true);
    setFlash("");
    try {
      const payload = {
        quotaMB: Number(quotaMB || 0),
        unlimited,
        suspended: { incoming, outgoing, login },
      };
      if (String(password || "").trim()) payload.password = String(password).trim();

      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || j?.ok === false) {
        throw new Error(j?.errors?.join("; ") || j?.error || "Update failed");
      }

      if (stayAfterSave) {
       
        setFlash(`All of your changes to “${email}” are saved.`);
        setFlashType("success");
        await load();
      } else {
     
        router.push({
          pathname: "/email-manager",
          query: {
            flash: `All of your changes to “${email}” are saved.`,
            flashType: "success",
          },
        });
      }
    } catch (e) {
      const msg = e.message || String(e);
      if (stayAfterSave) {
        setFlash(msg);
        setFlashType("error");
      } else {
        router.push({
          pathname: "/email-manager",
          query: { flash: msg, flashType: "error" },
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!email) return;
    // if (!confirm(`Delete ${email}?`)) return;
    // setDeleting(true);
    setFlash("");
    console.log("Deleting email:", email);
    try {
      const destroy = document.getElementById("destroyMail")?.checked ? 1 : 0;
      const r = await fetch(`/next-api/email/${encodeURIComponent(email)}?destroy=${destroy}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Delete failed");
    
      router.push({
        pathname: "/email-manager",
        query: {
          flash: `Deleted “${email}”.`,
          flashType: "success",
        },
      });
    } catch (e) {
      setFlash(e.message || String(e));
      setFlashType("error");
    } finally {
      setDeleting(false);
    }
  }

  const genPass = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    let p = ""; for (let i = 0; i < 16; i++) p += alphabet[Math.floor(Math.random() * alphabet.length)];
    setPassword(p);
  };

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

            <div className="sm-btn mb-2">
              <button onClick={() => history.back()}>← Go Back</button>
            </div>
            <h5 className="container-title">
              Manage Email Account
            </h5>
            <p className="container-subtitle">
              Use this page to manage the selected email account.
            </p>
            

            {/* cPanel-style flash inside this page */}
            {flash && (
              <div
                role="status"
                style={{
                  margin: "12px 0 14px",
                  borderRadius: 6,
                  padding: "10px 12px",
                  border: flashType === "success" ? "1px solid #8ed38e" : "1px solid #f3b1b1",
                  background: flashType === "success" ? "#eaffea" : "#ffecec",
                  color: flashType === "success" ? "#145214" : "#a42828",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <strong style={{ marginRight: 6 }}>
                  {flashType === "success" ? "Success:" : "Error:"}
                </strong>
                <span>{flash}</span>
              </div>
            )}

            <Row className="g-4 mb-5 mt-2 flex-row-reverse">

              {/* LEFT: mini widget cards */}
              <Col xs={12} md={12} lg={12} xl={4}>
                <Row className="g-4 mt-2" style={{ height: "100%" }}>

                  {/* My Email */}
                  <Col xs={12} md={4} lg={4} xl={12}>
                    <div className="anim-card-wrapper dark-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                0
                              </span>
                            </div>
                            <h6 className="card-title mb-1">My Email</h6>
                            <p
                              className="mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Quick access to the email.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <div className="domain-wrapper">
                              <span>{email || "-"} <FontAwesomeIcon icon={faPaperPlane} /></span>
                            </div>
                          </div>

                          <div className={`button-wrapper d-flex flex-column gap-2`}>
                            <button
                              type="button"
                              className="primary-btn w-100"
                              onClick={() => window.open(CPANEL_WEBMAIL, "_blank")}
                            >
                              Open Email
                            </button>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Email Storage Used */}
                  <Col xs={12} md={4} lg={4} xl={12}>
                    <div className="anim-card-wrapper dark-bg cap-xl">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                {`${storageUsedPercentClamped.toFixed(2)}%`}
                              </span>
                            </div>

                            <h6 className="card-title mb-1">Storage Used</h6>
                            <p
                              className="mb-5"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {unlimited ? (
                                <span>
                                  {formatSmart(storageUsedGB)}GB used&nbsp;/&nbsp;<FontAwesomeIcon icon={faInfinity} />
                                </span>
                              ) : (
                                <span>
                                  {formatSmart(storageUsedGB)}GB used of {formatSmart(storageAllocGB)}GB total
                                </span>
                              )}
                            </p>
                          </div>

                          <div>
                            <h3
                              className="fw-bold mb-1 highlight"
                              style={{ fontSize: "2rem" }}
                            >
                              {unlimited ? (
                                <span>
                                  Unlimited <small className="highlight-sm fs-6 align-middle">/Capacity</small>
                                </span>
                              ) : (
                                `${formatSmart(storageAllocGB - storageUsedGB)}`
                              )}
                              {!unlimited && (
                                <small className="highlight-sm fs-6 align-middle">
                                  {" "}
                                  /GB Remaining
                                </small>
                              )}
                            </h3>
                            <div className="progress progress-thin thin">
                              <div
                                className="progress-bar bg-mavsketch"
                                style={{ width: `${unlimited ? 100 : storageUsedPercentClamped}%` }}
                              />
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span>{unlimited ? "100%" : `${storageUsedPercentClamped.toFixed(0)}%`}</span>
                      </figcaption>
                    </div>
                  </Col>

                  {/* Delete Account */}
                  <Col xs={12} md={4} lg={4} xl={12}>
                    <div className="anim-card-wrapper primary-bg cap-med">
                      <div className="anim-card">
                        <div className="border-shadow-top" />
                        <div className="border-shadow-right" />
                        <div className="border-shadow-bottom" />
                        <div className="border-shadow-left" />

                        <svg
                          viewBox="0 0 400 400"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <filter id="noiseFilter">
                            <feTurbulence
                              type="fractalNoise"
                              baseFrequency="20.43"
                              numOctaves="400"
                              stitchTiles="stitch"
                            />
                          </filter>

                          <rect
                            width="100%"
                            height="100%"
                            filter="url(#noiseFilter)"
                          />
                        </svg>

                        <Card.Body className="p-3">
                          <div>
                            <div className="d-flex justify-content-end">
                              <span className="px-2 py-1 rounded-pill fw-bold badge-soft-white">
                                +2.1%
                              </span>
                            </div>
                            <h6 className="card-title mb-1" style={{color: "#ff9f9f"}}>Delete Email Account</h6>
                            <p className="mb-5">
                              When you delete an email account, all of its data is permanently deleted.
                            </p>
                          </div>
                          <div className="card_anim_body">
                            <label className="label-email" >
                              <input id="destroyMail" type="checkbox" /> Also delete mailbox files on disk
                            </label>
                            <div className={`button-wrapper d-flex flex-column gap-2`}>
                              <button
                                type="button"
                                className="primary-btn w-100"
                                // onClick={del} 
                                onClick={()=> {setDeleting(true);}}
                                disabled={deleting}
                              >
                                {deleting ? "Deleting…" : "Delete Email Account"}
                              </button>
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                      <figcaption style={{ backgroundColor: "#5e2a2a" , color: "#ff9f9f"}}>
                        <span>
                          <FontAwesomeIcon icon={faTrashCan} />
                        </span>
                      </figcaption>
                    </div>
                  </Col>

                </Row>
              </Col>

              {/* Right: Manage email */}
              <Col xs={12} md={12} lg={12} xl={8}>
                <Row className="g-4 mt-2" style={{ height: "100%" }}>

                  {/* Manage Email */}
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
                              Manage an Email Account
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Overview of your email list
                            </p>
                          </div>
                          

                          {/* Security */}
                          <div className="input-wrapper mt-7">
                            <h6 className="card-title mb-1">Password</h6>
                            <div className="input-box">
                              <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password (leave blank to keep current)"
                              />
                              <div className="button-wrapper">
                                <button type="button" onClick={genPass} className="success-btn">Generate</button>
                              </div>
                              
                            </div>
                          </div>

                          {/* Storage */}
                          <div className="input-wrapper mt-7">
                            <h6 className="card-title mb-1">Storage</h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Current Storage Usage: <strong>{usedHuman}</strong>
                            </p>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Allocated Storage Space (MB)
                            </p>
                            <div className="input-box">
                              <input
                                type="number"
                                min="0"
                                disabled={unlimited}
                                value={unlimited ? 0 : quotaMB}
                                onChange={(e) => setQuotaMB(e.target.value)}
                              />
                              
                              <div className="checkbox-wrapper">
                                <label className="label-email" >
                                  <input id="destroyMail" type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} /> Unlimited
                                </label>
                              </div>
                              
                              
                            </div>
                          </div>
                          
                          {/* Restrictions */}
                          <div className="input-wrapper mt-7">
                            <h6 className="card-title mb-3">Restrictions</h6>

                            {/* Incoming Mail */}
                            <div className="input-box wide-box mb-3">
                              <h6 className="card-title">Receiving Incoming Mail</h6>
                              <div className="checkbox-wrapper">
                                <label className="label-email" >
                                  <input id="destroyMail" type="checkbox" checked={incoming} onChange={(e)=>setIncoming(e.target.checked)} /> Suspend
                                </label>
                              </div>
                            </div>

                            {/* Outgoing Mail */}
                            <div className="input-box wide-box mb-3">
                              <h6 className="card-title">Sending Outgoing Email</h6>
                              <div className="checkbox-wrapper">
                                <label className="label-email" >
                                  <input id="destroyMail" type="checkbox" checked={outgoing} onChange={(e)=>setOutgoing(e.target.checked)} /> Suspend
                                </label>
                              </div>
                            </div>

                            {/* Logging In */}
                            <div className="input-box wide-box mb-3">
                              <h6 className="card-title">Logging In</h6>
                              <div className="checkbox-wrapper">
                                <label className="label-email" >
                                  <input id="destroyMail" type="checkbox" checked={login} onChange={(e)=>setLogin(e.target.checked)} /> Suspend
                                </label>
                              </div>
                            </div>

                          </div>

                          {/* Stay + actions */}
                          <div className="input-wrapper mt-7">
                            <h6 className="card-title mb-3">Stay on this page</h6>

                            <div className="input-box wide-box mb-3">
                              {/* <h6 className="card-title">Logging In</h6> */}
                              <div className="checkbox-wrapper">
                                <label className="label-email" >
                                  <input id="destroyMail" type="checkbox" checked={stayAfterSave}
                                onChange={(e) => setStayAfterSave(e.target.checked)} /> Stay on this page after I click <em>Update Email Settings</em>.
                                </label>
                              </div>
                            </div>

                          </div>

                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
                            <button type="button" className="primary-button" onClick={save} disabled={saving || loading}>
                              {saving ? "Saving…" : "Update Email Settings"}
                            </button>
                            <button type="button" className="light-button" onClick={() => router.push("/email-manager")}>Go Back</button>
                          </div>

    
                        </Card.Body>
                      </div>
                      <figcaption>
                        <span><FontAwesomeIcon icon={faSliders} /></span>
                      </figcaption>
                    </div>

                  </Col>
                </Row>
              </Col>

            </Row>



            

            {/* delete card */}
            {/* <div style={{ border: "1px solid #f4c7a1", background: "#fff7ea", marginTop: 20, borderRadius: 8, padding: 16, maxWidth: 880 }}>
              <div style={{ fontWeight: 700, color: "#8a5b00", marginBottom: 8 }}>Delete Email Account</div>
              <div style={{ color: "#8a5b00", marginBottom: 10 }}>When you delete an email account, all of its data is permanently deleted.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b5200" }}>
                  <input id="destroyMail" type="checkbox" /> Also delete mailbox files on disk
                </label>
                <div style={{ flex: 1 }} />
                <button type="button" onClick={del} disabled={deleting} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}>
                  {deleting ? "Deleting…" : "Delete Email Account"}
                </button>
              </div>
            </div> */}

            {/* delete confirmation toaster */}
            {deleting &&
              <>
                <div className="toaster-overlay" onClick={() => { setDeleting(false);}}></div>
                <div className="toaster-fixed">
                  <div className="toaster-confirmation">
                    <div className="toast-message">
                      <h4>
                      Are you sure to delete the email account <strong>“{email}”</strong>?
                      </h4>
                      <label>This action cannot be undone.</label>
                    </div>
                    <div className="toast-actions">
                      <button type="button" onClick={()=>{del();}} className="toaster-botton toaster-delete">
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                      <button type="button" onClick={() => { setDeleting(false);}} className="toaster-botton toaster-cancel">
                        <FontAwesomeIcon icon={faX} />
                      </button>
                      
                    </div>
                  </div>
                </div>
              </>
            }

          </Container>

        </main>
      </div>

    </>
  );
}

/* styles */
const btn = {
  display: "inline-block",
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
const linkBtnSmall = { ...btn, padding: "2px 8px", fontSize: 12, borderColor: "#cfd5df", color: "#334" };
const label = { fontSize: 13, color: "#2d3748", display: "grid", gap: 6 };
const input = { height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #d6dbe1", width: "100%" };
const rowBetween = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const toggleLabel = { display: "flex", alignItems: "center", gap: 8, color: "#334", fontSize: 13 };
