




// pages/email-manager/index.js
import { useEffect, useMemo, useState } from "react";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faPlus, faCog, faTrash } from "@fortawesome/free-solid-svg-icons";


const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;
const KB = 1024;
const fmt = (b) =>
  b >= GB ? (b / GB).toFixed(2) + " GB" :
  b >= MB ? (b / MB).toFixed(2) + " MB" :
  b >= KB ? Math.round(b / KB) + " KB" : b + " B";
const pct = (u, q) => (q > 0 ? Math.min(100, (u / q) * 100) : null);
const isRestricted = (r) => !!(r.restricted_login || r.restricted_incoming || r.restricted_outgoing);


const ROWS = [
  { email:"fatima@mavsketch.com",   domain:"mavsketch.com", used_bytes:1.31*MB, quota_bytes:10*GB, restricted_login:1 },
  { email:"info@mavsketch.com",     domain:"mavsketch.com", used_bytes:1.29*GB, quota_bytes:0 },
  { email:"joseph@mavsketch.com",   domain:"mavsketch.com", used_bytes:25.04*MB, quota_bytes:1*GB },
  { email:"madhubala@mavsketch.com",domain:"mavsketch.com", used_bytes:94.66*MB, quota_bytes:10*GB, restricted_login:1 },
  { email:"marco@mavsketch.com",    domain:"mavsketch.com", used_bytes:2.14*GB, quota_bytes:0 },
  { email:"matthew@mavsketch.com",  domain:"mavsketch.com", used_bytes:33*MB, quota_bytes:1*GB },
  { email:"mavsketc",               domain:"",              used_bytes:80.63*MB, quota_bytes:0, is_system:true },
  { email:"miguel@mavsketch.com",   domain:"mavsketch.com", used_bytes:26.09*MB, quota_bytes:1*GB },
  { email:"muskan@mavsketch.com",   domain:"mavsketch.com", used_bytes:214.61*KB, quota_bytes:10*GB, restricted_login:1 },
  { email:"nahla@mavsketch.com",    domain:"mavsketch.com", used_bytes:448.87*KB, quota_bytes:10*GB },
  { email:"sales@mavsketch.com",    domain:"mavsketch.com", used_bytes:15.47*MB, quota_bytes:1*GB },
  { email:"timothy@mavsketch.com",  domain:"mavsketch.com", used_bytes:29.02*MB, quota_bytes:1*GB, restricted_login:1 },
];

/* tiny SVGs */
const Check  = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const Warn   = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>;
const OpenInNew = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3l-1.42-1.42l9.3-9.29H14V3M5 5h5v2H7v10h10v-3h2v5H5V5Z"/></svg>;
const Wrench = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M22.61 18.97L13.9 10.26A6 6 0 0 0 7.74 2l3.31 3.31L8.22 8.14L4 3.92A6 6 0 0 0 13.74 11l8.87 8.87Z"/></svg>;
const Phone  = () => <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.05-.24a11.36 11.36 0 0 0 3.56.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1A17 17 0 0 1 3 8a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1c.12 1.24.36 2.42.57 3.56a1 1 0 0 1-.24 1.05Z"/></svg>;

export default function EmailManager() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);

  // search + filter state
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); 
  const q = query.trim().toLowerCase();

  
  const rowsToShow = useMemo(() => {
    let rows = ROWS;
    if (q) {
      rows = rows.filter(r =>
        (r.email || "").toLowerCase().includes(q) ||
        (r.domain || "").toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case "restricted":
        rows = rows.filter(isRestricted);
        break;
      case "system":
        rows = rows.filter(r => !!r.is_system);
        break;
      case "exceeded":
        rows = rows.filter(r => r.quota_bytes > 0 && r.used_bytes >= r.quota_bytes);
        break;
      default:
        break;
    }
    return rows;
  }, [q, filter]);

  useEffect(() => {
    const onResize = () => {
      const below = window.innerWidth < 992;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onKeyDown = (e) => { if (e.key === "Enter") e.currentTarget.blur(); };
  const choose = (val) => (e) => { e.preventDefault(); setFilter(val); };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap");
        body{ font-family:"Open Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif; }
      `}</style>

      <div className="bg-wrapper-custom">
        <div className="blob blob1"/><div className="blob blob2"/><div className="blob blob3"/>
        <div className="blob blob4"/><div className="blob blob5"/><div className="bg-inner-custom"/>
      </div>

      <div style={{ display:"flex", minHeight:"100vh", position:"relative", zIndex:1 }}>
        <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

        <button
          type="button"
          onClick={() => setSidebarOpen(s => !s)}
          className="btn btn-link d-lg-none position-fixed top-0 start-0 m-3 p-2 z-3"
          aria-label="Toggle menu"
          style={{ background:"#fff", borderRadius:10, boxShadow:"0 2px 8px rgba(0,0,0,.12)" }}
        >
          <FontAwesomeIcon icon={faBars}/>
        </button>

        <main
          className="main-wrapper"
          style={{
            flexGrow:1,
            marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
            transition:"margin-left .25s ease",
            padding:"2rem",
            paddingTop:"5.25rem",
            width:"100%",
            overflowX:"visible"
          }}
        >
          <div className="cp-header">
            {/* LEFT */}
            <div>
              <h1 className="cp-title mb-2">Email Accounts</h1>
              <p className="cp-sub mb-4">
                This feature lets you create and manage email accounts. Want to learn more?{" "}
                <a className="cp-link">Read our documentation</a>.
              </p>

              {/* search */}
              <div className="cp-search mb-2">
                <input
                  className="cp-search-input"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button type="button" className="cp-search-btn" aria-label="Search">
                  <FontAwesomeIcon icon={faSearch}/>
                </button>
              </div>

              {/* filters + bulk */}
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="small text-muted">Filter:</div>

                <button
                  className={`cp-chip ${filter === "all" ? "cp-chip--active" : ""}`}
                  onClick={choose("all")}
                  type="button"
                >
                  All
                </button>

                <a
                  href="#"
                  role="button"
                  className={`cp-filter-link ${filter === "restricted" ? "active" : ""}`}
                  onClick={choose("restricted")}
                >
                  Restricted
                </a>
                <a
                  href="#"
                  role="button"
                  className={`cp-filter-link ${filter === "system" ? "active" : ""}`}
                  onClick={choose("system")}
                >
                  System Account
                </a>
                <a
                  href="#"
                  role="button"
                  className={`cp-filter-link ${filter === "exceeded" ? "active" : ""}`}
                  onClick={choose("exceeded")}
                >
                  Exceeded Storage
                </a>
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="cp-check"><input type="checkbox" /></label>
                <button className="btn-del"><FontAwesomeIcon icon={faTrash} className="me-1"/>Delete</button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="cp-right">
              <div className="cp-availability">
                <div className="cp-av-row">
                  <div className="cp-av-left">
                    <span className="cp-infty">∞</span>
                    <span className="cp-av-label">Available</span>
                  </div>
                  <div className="cp-av-right">
                    <span className="cp-used">11</span>
                    <span className="cp-av-label">Used</span>
                  </div>
                </div>
                <div className="cp-av-bottom">
                  <a className="cp-buy">Buy More <span className="cp-info-dot">i</span></a>
                </div>
              </div>

              <div className="cp-pager-stack">
                <div className="cp-pager">
                  <button>&laquo;&laquo;</button>
                  <button>&laquo;</button>
                  <button className="is-page">Page 1 of 1 <span className="caret"/></button>
                  <button>&raquo;</button>
                  <button>&raquo;&raquo;</button>
                </div>
                <div className="cp-pager-count">1 - {rowsToShow.length} of {rowsToShow.length}</div>

                <div className="cp-right-toolbar">
                  <button className="cp-create"><span className="plusbox">+</span> Create</button>
                  <button className="cp-gear"><FontAwesomeIcon icon={faCog}/><span className="caret-down"/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="cp-divider mt-3 mb-3"/>

          {/* table */}
          <div className="cp-table-wrap">
            <div className="cp-table-scroll">
              <table className="cp-table">
                <colgroup>
                  <col style={{ width: "58px" }}/>
                  <col style={{ width: "34%" }}/>
                  <col style={{ width: "16%" }}/>
                  <col style={{ width: "28%" }}/>
                  <col style={{ width: "430px" }}/>
                </colgroup>

                <thead>
                  <tr>
                    <th/>
                    <th><a className="cp-head-link">Account <span className="caret-sm">^</span> @ Domain</a></th>
                    <th>Restrictions</th>
                    <th>Storage: <a className="cp-head-link">Used / Allocated / %</a></th>
                    <th/>
                  </tr>
                </thead>

                <tbody>
                  {rowsToShow.map((r) => {
                    const used = r.used_bytes ?? 0;
                    const quota = r.quota_bytes ?? 0;
                    const p = pct(used, quota);
                    const unlimited = p === null;
                    const minPx = !unlimited && p > 0 && p < 0.8 ? 8 : 0;

                    return (
                      <tr key={r.email}>
                        <td>
                          <div className="cp-firstcol">
                            <button className="cp-expand" title="expand" disabled>›</button>
                            <label className="cp-check"><input type="checkbox"/></label>
                          </div>
                        </td>

                        <td>
                          <div className="cp-email">
                            {r.email} {r.is_system && <span className="cp-system">System</span>}
                          </div>
                        </td>

                        <td>
                          <div className={`cp-r ${isRestricted(r) ? "warn" : "ok"}`}>
                            {isRestricted(r)
                              ? <span className="r-icon warn"><Warn/></span>
                              : <span className="r-icon ok"><Check/></span>}
                            <span className="r-text">{isRestricted(r) ? "Restricted" : "Unrestricted"}</span>
                          </div>
                        </td>

                        <td>
                          <div className="cp-storage">
                            <div className="cp-storage-top">
                              {fmt(Math.max(0, used))} / {quota > 0 ? fmt(quota) : "∞"} {unlimited ? "" : `(${p.toFixed(2)}%)`}
                            </div>
                            <div className={"cp-meter" + (unlimited ? " cp-meter-unlimited" : "")}>
                              <div className="cp-meter-fill" style={{ width: unlimited ? "100%" : `${p.toFixed(2)}%`, minWidth: unlimited ? 0 : minPx }}/>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="cp-actions">
                            <a className="cp-btn-outline" href="https://mavsketch.com:2096" target="_blank" rel="noreferrer"><OpenInNew/>Check Email</a>
                            <button className="cp-btn-outline"><Wrench/>Manage</button>
                            <button className="cp-btn-outline"><Phone/>Connect Devices</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="cp-count">1 - {rowsToShow.length} of {rowsToShow.length}</div>
          </div>
        </main>
      </div>

      <style jsx>{`
        :root{
          --cp-blue:#1e66d0; --cp-blue-dark:#1a59b6;
          --cp-green:#28a745; --cp-amber:#f0ad4e;
          --cp-border:#dfe3ea; --cp-border-dark:#c7ccd5;
          --cp-row-alt:#f5f6f9; --cp-text:#253142; --cp-muted:#6b7481;
        }

        .cp-title{ font-size:28px; font-weight:700; }
        .cp-sub{ color:#5f6b7a; font-size:14px; }
        .cp-link{ color:#1e66d0; text-decoration:underline; cursor:pointer; }

        .cp-header{ display:grid; grid-template-columns: 1fr 380px; gap:24px; align-items:start; }
        .cp-right{ display:flex; flex-direction:column; align-items:flex-end; width:100%; }

        .cp-right .cp-availability{ width:100%; border:1px solid var(--cp-border); border-radius:6px; background:#fff; overflow:hidden; }
        .cp-right .cp-av-row{ display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid var(--cp-border); }
        .cp-right .cp-av-left, .cp-right .cp-av-right{ display:flex; align-items:center; gap:10px; }
        .cp-right .cp-infty{ font-size:22px; font-weight:700; }
        .cp-right .cp-used{ font-size:28px; font-weight:700; }
        .cp-right .cp-av-label{ font-size:14px; color:var(--cp-muted); }
        .cp-right .cp-av-bottom{ padding:10px 16px; text-align:center; }
        .cp-right .cp-buy{ color:var(--cp-blue); font-size:14px; text-decoration:underline; }
        .cp-right .cp-info-dot{ display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; margin-left:6px; border-radius:50%; border:1px solid #87b4ef; color:var(--cp-blue); font-size:11px; line-height:1; }

        .cp-right .cp-pager-stack{ width:100%; margin-top:14px; }
        .cp-right .cp-pager{ display:inline-flex; align-items:center; justify-content:flex-end; width:100%; }
        .cp-right .cp-pager > button{ height:36px; padding:0 14px; background:#fff; border:1px solid var(--cp-border); color:#5e6773; line-height:1; }
        .cp-right .cp-pager > button:first-child{ border-radius:4px 0 0 4px; }
        .cp-right .cp-pager > button:nth-child(2){ border-left:none; }
        .cp-right .cp-pager > button.is-page{ border-left:none; border-right:none; min-width:160px; font-weight:600; }
        .cp-right .cp-pager > button:nth-child(4){ border-left:none; }
        .cp-right .cp-pager > button:nth-child(5){ border-left:none; border-radius:0 4px 4px 0; }
        .cp-right .cp-pager .caret{ display:inline-block; width:0; height:0; margin-left:8px; vertical-align:middle; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #9aa5b1; }
        .cp-right .cp-pager-count{ color:#8a93a2; font-size:14px; text-align:right; margin-top:8px; }
        .cp-right .cp-right-toolbar{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
        .cp-right .cp-create{ height:36px; padding:0 16px; border-radius:4px; background:#2f7bd7; color:#fff; border:1px solid #1d63ba; font-weight:700; font-size:14px; display:inline-flex; align-items:center; gap:8px; }
        .cp-right .cp-create .plusbox{ display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:3px; background:rgba(255,255,255,.18); font-weight:800; line-height:1; }
        .cp-right .cp-create:hover{ background:#286ec4; }
        .cp-right .cp-gear{ height:36px; padding:0 10px; border-radius:4px; background:#fff; color:#4a5568; border:1px solid var(--cp-border); display:inline-flex; align-items:center; gap:6px; }
        .cp-right .caret-down{ display:inline-block; width:0; height:0; margin-left:2px; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #6c737f; }

        .cp-search{ display:flex; align-items:center; width:520px; max-width:100%; background:#fff; border:1px solid #d6dbe1; border-radius:6px; overflow:hidden; }
        .cp-search-input{ flex:1; height:38px; padding:0 12px; border:0; outline:0; font-size:14px; }
        .cp-search-btn{ width:44px; height:38px; border-left:1px solid #d6dbe1; background:#fff; color:#667085; cursor:pointer; }
        .cp-search-btn:hover{ background:#f6f8fc; }
        .cp-search-btn:active{ background:#eef2f7; }
        .cp-search-btn:focus{ outline:none; box-shadow:0 0 0 2px rgba(31,95,196,.18); }

        .cp-chip{ border:1px solid #d6dbe1; background:#f6f8fc; color:#3b4656; font-weight:700; font-size:12.5px; padding:.2rem .6rem; border-radius:6px; }
        .cp-chip--active{ background:#1e66d0; border-color:#1e66d0; color:#fff; }
        .cp-filter-link{ color:#1e66d0; font-weight:600; text-decoration:none; cursor:pointer; }
        .cp-filter-link:hover{ text-decoration:underline; }
        .cp-filter-link.active{ text-decoration:underline; font-weight:700; }
        .btn-del{ height:32px; padding:0 12px; border-radius:6px; background:#fff; border:1px solid var(--cp-border); color:#445063; font-weight:600; }
        .cp-check input{ width:16px; height:16px; }

        .cp-divider{ height:1px; background:#e0e5ec; }

        .cp-table-wrap{ background:#fff; border:1px solid #cfd5df; border-radius:4px; }
        .cp-table-scroll{ overflow-x:visible; }
        .cp-table{ width:100%; border-collapse:separate; border-spacing:0; table-layout:fixed; }
        .cp-table thead tr{ background:#fff; }
        .cp-table th{ font-size:13px; padding:10px 14px 9px; border-bottom:2px solid var(--cp-border-dark); text-align:left; font-weight:600; color:#303844; }
        .cp-head-link{ color:#1e66d0; text-decoration:underline; cursor:pointer; }
        .caret-sm{ color:#1e66d0; font-weight:700; }
        .cp-table tbody tr:nth-child(odd) td{ background:#fff; }
        .cp-table tbody tr:nth-child(even) td{ background:var(--cp-row-alt); }
        .cp-table td{ font-size:12.5px; padding:12px 14px; border-top:1px solid #dfe3ea; vertical-align:middle; }

        .cp-firstcol{ display:flex; align-items:center; gap:12px; }
        .cp-expand{ border:0; background:transparent; color:#487bbd; font-size:18px; }
        .cp-email{ font-weight:600; color:#2b3137; }
        .cp-system{ font-size:12px; font-weight:700; padding:2px 8px; border-radius:4px; background:#e7f0ff; color:#1e66d0; margin-left:6px; }

        .cp-r{ display:inline-flex; align-items:center; gap:8px; }
        .cp-r .r-text{ color:#1e66d0; font-weight:600; }
        .cp-r .r-icon.warn svg{ color:var(--cp-amber); }
        .cp-r .r-icon.ok svg{ color:var(--cp-green); }

        .cp-storage-top{ text-align:right; font-size:11.5px; color:#5b6472; margin-bottom:6px; }
        .cp-meter{ position:relative; width:100%; height:9px; background:#ebedf1; border-radius:999px; overflow:hidden; }
        .cp-meter-fill{ position:absolute; left:0; top:0; bottom:0; background:#d3d8de; }
        .cp-meter-unlimited .cp-meter-fill{ background:#d9dde3; }

        .cp-actions{ display:flex; justify-content:flex-end; align-items:center; gap:10px; white-space:nowrap; padding-right:6px; }
        .cp-btn-outline{ display:inline-flex; align-items:center; gap:6px; height:32px; line-height:32px; padding:0 14px; min-width:118px; flex:0 0 auto; background:#fff; color:#1e66d0; border:1px solid #9fc2f2; border-radius:4px; font-weight:600; font-size:12.5px; text-decoration:none; }
        .cp-btn-outline:hover{ background:#f0f7ff; border-color:#8cb8ef; }
        .cp-btn-outline:active{ background:#e6f1ff; border-color:#7faced; }
        .cp-btn-outline:focus{ outline:none; box-shadow:0 0 0 2px rgba(31,95,196,.25); }
        .cp-btn-outline svg{ width:14px; height:14px; color:#1e66d0; margin-top:-1px; }

        .cp-count{ padding:10px 12px; color:#8a93a2; font-size:13px; }

        @media (max-width:1280px){
          .cp-header{ grid-template-columns: 1fr 360px; }
          .cp-table colgroup col:last-child{ width:400px !important; }
          .cp-btn-outline{ min-width:112px; padding:0 12px; }
        }
      `}</style>
    </>
  );
}
