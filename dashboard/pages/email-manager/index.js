


// // og
// // pages/email-manager/index.js
// import { useEffect, useMemo, useRef, useState } from "react";
// import SidebarDashly from "../../layouts/navbars/NavbarVertical";

// const CPANEL_USER = "mavsketc";
// const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";
// const CPANEL_UI = process.env.NEXT_PUBLIC_CPANEL_UI || "https://mavsketch.com:2083/frontend/jupiter";
// const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "mavsketch.com";

// // hard cap for # of email accounts (non-system)
// const MAX_EMAIL_ACCOUNTS = 14;

// const DEFAULT_QUOTA_MB = 10240;
// const makeDefaultCreateForm = (domain) => ({
//   domain: domain || DEFAULT_DOMAIN,
//   user: "",
//   mode: "password",           // "password" | "invite"
//   alternateEmail: "",         // used when mode === "invite"
//   password: "",
//   quotaMB: DEFAULT_QUOTA_MB,
//   unlimited: false,
//   sendWelcome: false,         // welcome email to the NEW mailbox
//   stayAfterCreate: false,
// });

// // ✅ single place to change the path if needed later
// const EMAILS_API = "/next-api/emails";

// export default function EmailManager() {
//   // sidebar
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isBelowLg, setIsBelowLg] = useState(false);
//   useEffect(() => {
//     const onResize = () => {
//       const below = typeof window !== "undefined" ? window.innerWidth < 992 : false;
//       setIsBelowLg(below);
//       setSidebarOpen(!below);
//     };
//     onResize();
//     if (typeof window !== "undefined") {
//       window.addEventListener("resize", onResize);
//       return () => window.removeEventListener("resize", onResize);
//     }
//   }, []);

//   // data + state
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState("");
//   const [data, setData] = useState({ header: { available: "∞", used: 0 }, rows: [] });

//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState("all");

//   // selection
//   const [selected, setSelected] = useState({});
//   const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

//   // confirm delete
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [destroyMail, setDestroyMail] = useState(false);

//   // CREATE modal
//   const [showCreate, setShowCreate] = useState(false);
//   const [createForm, setCreateForm] = useState(makeDefaultCreateForm(DEFAULT_DOMAIN));

//   // QUOTA modal
//   const [showQuota, setShowQuota] = useState(false);

//   // toast
//   const [toast, setToast] = useState(null);
//   const toastTimerRef = useRef(null);
//   const pushToast = (message, type = "error", duration = 6000) => {
//     if (!message) return;
//     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     setToast({ type, message });
//     toastTimerRef.current = setTimeout(() => setToast(null), duration);
//   };
//   useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);

//   const load = async () => {
//     setError("");
//     setLoading(true);
//     try {
//       // 🔁 point to Next API
//       const r = await fetch(EMAILS_API);
//       const d = await r.json();
//       const safe = Array.isArray(d?.rows) ? d : { header: { available: "∞", used: 0 }, rows: [] };
//       const rows = (safe.rows || []).map((x) => {
//         const isSystem =
//           Boolean(x.system) ||
//           x.user === CPANEL_USER ||
//           (!!x.user && x.email === x.user && !String(x.email || "").includes("@"));
//         return { ...x, system: isSystem };
//       });
//       setData({ header: safe.header || { available: "∞", used: 0 }, rows });
//       setSelected({});
//       setShowConfirm(false);
//       setDestroyMail(false);
//     } catch (e) {
//       console.error(e);
//       setError("Failed to load email accounts.");
//       setData({ header: { available: "∞", used: 0 }, rows: [] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);
//   const rows = data.rows || [];

//   // domain options for Create
//   const domainOptions = useMemo(() => {
//     const s = new Set(rows.map(r => r.domain).filter(Boolean));
//     if (s.size === 0 && DEFAULT_DOMAIN) s.add(DEFAULT_DOMAIN);
//     return Array.from(s).sort();
//   }, [rows]);

//   useEffect(() => {
//     setCreateForm(f => ({ ...f, domain: f.domain || domainOptions[0] || "" }));
//   }, [domainOptions.length]);

//   const resetCreateState = (domainCandidate) => {
//     const dom = domainCandidate || domainOptions[0] || DEFAULT_DOMAIN;
//     setCreateForm(makeDefaultCreateForm(dom));
//     setCreating(false);
//   };

//   // filtering
//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     let r = rows;
//     if (term) {
//       r = r.filter(
//         (x) =>
//           (x.email || "").toLowerCase().includes(term) ||
//           (x.domain || "").toLowerCase().includes(term)
//       );
//     }
//     if (filter === "restricted") r = r.filter((x) => x.restrictions === "Restricted");
//     if (filter === "exceeded") r = r.filter((x) => x.exceeded);
//     if (filter === "system") r = r.filter((x) => x.system);
//     return r;
//   }, [rows, q, filter]);

//   // selection helpers
//   const visibleSelectable = useMemo(() => filtered.filter((r) => !r.system), [filtered]);
//   const allVisibleSelected = useMemo(
//     () => visibleSelectable.length > 0 && visibleSelectable.every((r) => selected[r.email]),
//     [visibleSelectable, selected]
//   );
//   const someVisibleSelected = useMemo(
//     () => visibleSelectable.some((r) => selected[r.email]) && !allVisibleSelected,
//     [visibleSelectable, selected, allVisibleSelected]
//   );
//   const selectedCountVisible = useMemo(
//     () => visibleSelectable.filter((r) => selected[r.email]).length,
//     [visibleSelectable, selected]
//   );

//   // tri-state checkbox visuals
//   const miniAllRef = useRef(null);
//   const headAllRef = useRef(null);
//   useEffect(() => {
//     if (miniAllRef.current) miniAllRef.current.indeterminate = someVisibleSelected;
//     if (headAllRef.current) headAllRef.current.indeterminate = someVisibleSelected;
//   }, [someVisibleSelected]);

//   const toggleOne = (email) => setSelected((prev) => ({ ...prev, [email]: !prev[email] }));
//   const toggleAllVisible = () => {
//     const map = { ...selected };
//     const newState = !allVisibleSelected;
//     visibleSelectable.forEach((r) => (map[r.email] = newState));
//     setSelected(map);
//   };

//   // count current non-system accounts for quota logic
//   const currentCount = useMemo(() => rows.filter(r => !r.system).length, [rows]);

//   // delete flow
//   const askDelete = () => {
//     if (selectedCountVisible === 0) return;
//     setShowConfirm(true);
//     setDestroyMail(false);
//   };

//   const handleDelete = async () => {
//     const toDelete = selectedEmails.filter((e) => {
//       const row = rows.find((r) => r.email === e);
//       return row && !row.system;
//     });
//     if (!toDelete.length) return;

//     setDeleting(true);
//     setError("");
//     try {
//       const r = await fetch(EMAILS_API, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ emails: toDelete, destroy: destroyMail }),
//       });
//       const j = await r.json();
//       if (!r.ok) {
//         const failed =
//           (j?.results || []).filter((x) => !x.ok).map((x) => `${x.email}: ${x.error}`).join("\n") ||
//           j?.error || "Delete failed";
//         throw new Error(failed);
//       }
//       await load();
//       setError("");
//       pushToast("Deleted selected accounts", "success");
//     } catch (e) {
//       console.error(e);
//       setError(`Delete failed: ${e.message || e}`);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // create flow
//   const openCreate = () => {
//     // if already at or above limit, show quota modal instead of opening create dialog
//     if (currentCount >= MAX_EMAIL_ACCOUNTS) {
//       setShowQuota(true);
//       return;
//     }
//     setToast(null);
//     setError("");
//     resetCreateState(domainOptions[0] || DEFAULT_DOMAIN);
//     setShowCreate(true);
//   };
//   const closeCreate = () => {
//     setShowCreate(false);
//     resetCreateState(domainOptions[0] || DEFAULT_DOMAIN);
//   };

//   const genStrongPass = () => {
//     const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
//     let p = ""; for (let i = 0; i < 16; i++) p += alphabet[Math.floor(Math.random() * alphabet.length)];
//     setCreateForm(f => ({ ...f, password: p }));
//   };

//   const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

//   const submitCreate = async () => {
//     // double-check right before POST in case another tab/page created one meanwhile
//     if (currentCount >= MAX_EMAIL_ACCOUNTS) {
//       setShowCreate(false);
//       setShowQuota(true);
//       return;
//     }

//     const { domain, user, password, quotaMB, unlimited, sendWelcome, stayAfterCreate, mode, alternateEmail } = createForm;
//     if (!domain || !user) {
//       pushToast("Domain and username are required.", "error"); return;
//     }
//     if (mode === "invite" && !isEmail(alternateEmail)) {
//       pushToast("Enter a valid alternate email to send the login link.", "error"); return;
//     }
//     if (mode === "password" && !password && !sendWelcome) {
//       pushToast("Password is required unless you only send the welcome email.", "error"); return;
//     }

//     setCreating(true);
//     try {
//       const r = await fetch(EMAILS_API, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           mode,
//           domain,
//           user,
//           password,
//           alternateEmail,
//           quotaMB: unlimited ? 0 : Number(quotaMB) || 0,
//           sendWelcome: !!sendWelcome,
//         }),
//       });
//       const j = await r.json();
//       if (!r.ok || j?.error) {
//         const det = j?.details;
//         const msg = Array.isArray(det) ? det.join("; ") : (typeof det === "string" ? det : (j?.error || "Create failed"));
//         throw new Error(msg);
//       }

//       await load();

//       if (stayAfterCreate) {
//         // keep dialog open for bulk adding, but clear user + password + alternateEmail
//         setCreateForm(f => ({ ...f, user: "", password: "", alternateEmail: "" }));
//       } else {
//         closeCreate();
//       }
//       pushToast(
//         mode === "invite"
//           ? `Created ${user}@${domain} and invited ${alternateEmail}`
//           : `Created ${user}@${domain}`,
//         "success"
//       );
//     } catch (e) {
//       console.error(e);
//       pushToast(e.message || "Create failed", "error");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const canCreate =
//     !!createForm.domain && !!createForm.user &&
//     (createForm.mode === "invite" ? isEmail(createForm.alternateEmail) : (createForm.password || createForm.sendWelcome));

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

//       {/* top-right toast */}
//       <Toast toast={toast} onClose={() => setToast(null)} />

//       <main
//         style={{
//           flexGrow: 1,
//           padding: 20,
//           marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
//           transition: "margin-left .25s ease",
//           width: "100%",
//         }}
//       >
//         <h1 style={{ marginBottom: 8 }}>Email Accounts</h1>
//         <p style={{ color: "#667", marginTop: 0 }}>Create, list, and manage email accounts.</p>

//         {/* header stats + Create button */}
//         <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
//           <Stat label="Available" value={data.header.available} />
//           <Stat label="Used" value={data.header.used} />
//           <div style={{ flex: 1 }} />
//           <button
//             type="button"
//             onClick={openCreate}
//             disabled={currentCount >= MAX_EMAIL_ACCOUNTS}
//             title={currentCount >= MAX_EMAIL_ACCOUNTS ? "Creation limit reached" : "+ Create"}
//             style={{ ...btn, borderColor: "#22a06b", color: "#167a4f", opacity: currentCount >= MAX_EMAIL_ACCOUNTS ? 0.6 : 1 }}
//           >
//             + Create
//           </button>
//         </div>

//         {/* search + filters */}
//         <div style={{ display: "flex", gap: 8, marginBottom: 10, maxWidth: 680 }}>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search"
//             style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #d6dbe1" }}
//           />
//           <button type="button" onClick={() => {}} style={{ ...btn, height: 38 }}>
//             Search
//           </button>
//         </div>
//         <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
//           <span style={{ color: "#667", fontSize: 13 }}>Filter:</span>
//           {["all", "restricted", "system", "exceeded"].map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               style={{
//                 padding: "4px 10px",
//                 borderRadius: 6,
//                 border: "1px solid #d6dbe1",
//                 background: filter === f ? "#1e66d0" : "#f6f8fc",
//                 color: filter === f ? "#fff" : "#334",
//                 fontWeight: 700,
//                 fontSize: 12.5,
//               }}
//             >
//               {f[0].toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//           <div style={{ color: "#667", marginLeft: "auto", fontSize: 13 }}>
//             {loading ? "Loading..." : `Selected: ${selectedEmails.length}`}
//           </div>
//         </div>

//         {/* page banner (load/delete) */}
//         {error && (
//           <div style={{ background: "#ffecec", border: "1px solid #f3b1b1", color: "#a42828", padding: 10, borderRadius: 6, marginBottom: 12 }}>
//             {error}
//           </div>
//         )}

//         {/* confirm delete bar */}
//         {showConfirm && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               padding: "12px 14px",
//               marginBottom: 12,
//               background: "#fff7d6",
//               border: "1px solid #f1d488",  
//               borderRadius: 6,
//             }}
//           >
//             <div style={{ fontSize: 15, color: "#6b5200", fontWeight: 600 }}>
//               {selectedCountVisible === 1
//                 ? `Delete “${visibleSelectable.find(v => selected[v.email])?.email}”?`
//                 : `Delete ${selectedCountVisible} email account(s)?`}
//             </div>
//             <label style={{ marginLeft: 8, color: "#6b5200", display: "flex", alignItems: "center", gap: 6 }}>
//               <input type="checkbox" checked={destroyMail} onChange={(e) => setDestroyMail(e.target.checked)} />
//               Also delete mailbox files on disk
//             </label>
//             <div style={{ flex: 1 }} />
//             <button type="button" onClick={handleDelete} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }} disabled={deleting}>
//               {deleting ? "Deleting…" : `Delete (${selectedCountVisible})`}
//             </button>
//             <button type="button" onClick={() => { setShowConfirm(false); setDestroyMail(false); }} style={btn} disabled={deleting}>
//               Cancel
//             </button>
//           </div>
//         )}

//         {/* mini actions */}
//         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//           <input
//             ref={miniAllRef}
//             type="checkbox"
//             checked={allVisibleSelected}
//             onChange={toggleAllVisible}
//             title="Select all on this list"
//             style={{ width: 18, height: 18 }}
//           />
//           <button
//             type="button"
//             onClick={askDelete}
//             style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00", margin: 0 }}
//             disabled={selectedCountVisible === 0 || deleting}
//           >
//             Delete
//           </button>
//         </div>

//         {/* table */}
//         <div style={{ border: "1px solid #cfd5df", borderRadius: 4, overflow: "hidden" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#fff" }}>
//                 <th style={{ ...th, width: 42 }}>
//                   <input ref={headAllRef} type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="select all" />
//                 </th>
//                 <th style={th}>Account @ Domain</th>
//                 <th style={th}>Restrictions</th>
//                 <th style={th}>Storage: Used / Allocated / %</th>
//                 <th style={th}></th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((r) => {
//                 const pct = r.unlimited ? null : (r.percent ?? 0);
//                 const checked = !!selected[r.email];
//                 return (
//                   <tr key={r.email}>
//                     <td style={{ ...td, textAlign: "center" }}>
//                       <input
//                         type="checkbox"
//                         checked={checked}
//                         onChange={() => toggleOne(r.email)}
//                         disabled={r.system}
//                         title={r.system ? "System account cannot be deleted" : ""}
//                       />
//                     </td>
//                     <td style={td}>
//                       <strong>{r.email}</strong> {r.system && <span style={badgeSystem}>System</span>}
//                     </td>
//                     <td style={td}>{r.restrictions === "Restricted" ? "⚠️ Restricted" : "✅ Unrestricted"}</td>
//                     <td style={td}>
//                       <div style={{ fontSize: 12 }}>
//                         {r.usedHuman} / {r.allocatedHuman} {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
//                       </div>
//                       <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
//                         <div
//                           style={{
//                             height: 8,
//                             width: r.unlimited ? "100%" : `${Math.min(100, pct).toFixed(2)}%`,
//                             background: r.exceeded ? "#e74c3c" : "#9fb6d9",
//                           }}
//                         />
//                       </div>
//                     </td>
//                     <td style={{ ...td, whiteSpace: "nowrap" }}>
//                       <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" style={btn}>Check Email</a>
//                       <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" style={btn}>Manage</a>
//                       <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" style={btn}>Connect Devices</a>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && !loading && (
//                 <tr>
//                   <td colSpan="5" style={{ ...td, textAlign: "center", color: "#667" }}>No results</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <div style={{ padding: "10px 12px", color: "#667", fontSize: 13 }}>
//             {loading ? "Loading…" : `1 – ${filtered.length} of ${rows.length}`}
//           </div>
//         </div>

//         {/* CREATE MODAL */}
//         {showCreate && (
//           <div
//             onClick={() => !creating && closeCreate()}
//             style={{
//               position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
//               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
//             }}
//           >
//             <div onClick={(e) => e.stopPropagation()} style={{ width: 560, background: "#fff", borderRadius: 8, padding: 16 }}>
//               <h3 style={{ marginTop: 0, marginBottom: 12 }}>Create an Email Account</h3>

//               <div style={{ display: "grid", gap: 10 }}>
//                 <label style={label}>
//                   Domain
//                   {domainOptions.length > 0 ? (
//                     <select
//                       value={createForm.domain}
//                       onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value }))}
//                       style={input}
//                     >
//                       {domainOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
//                     </select>
//                   ) : (
//                     <input
//                       value={createForm.domain}
//                       onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value.trim() }))}
//                       placeholder="example.com"
//                       style={input}
//                     />
//                   )}
//                 </label>

//                 <label style={label}>
//                   Username
//                   <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//                     <input
//                       value={createForm.user}
//                       onChange={(e) => setCreateForm(f => ({ ...f, user: e.target.value.trim() }))}
//                       placeholder="e.g. support"
//                       style={{ ...input, flex: 1 }}
//                     />
//                     <div style={{ fontSize: 13, color: "#667" }}>@{createForm.domain || "domain"}</div>
//                   </div>
//                 </label>

//                 {/* Mode selector */}
//                 <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
//                   <div style={{ fontSize: 13, color: "#2d3748", fontWeight: 600 }}>Password Options</div>
//                   <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#2d3748" }}>
//                     <input
//                       type="radio"
//                       name="mode"
//                       checked={createForm.mode === "password"}
//                       onChange={() => setCreateForm(f => ({ ...f, mode: "password" }))}
//                     />
//                     Set password now
//                   </label>
//                   <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#2d3748" }}>
//                     <input
//                       type="radio"
//                       name="mode"
//                       checked={createForm.mode === "invite"}
//                       onChange={() => setCreateForm(f => ({ ...f, mode: "invite", password: "" }))}
//                     />
//                     Send login link to alternate email
//                   </label>
//                 </div>

//                 {/* Password (only when mode=password) */}
//                 {createForm.mode === "password" && (
//                   <label style={label}>
//                     Password
//                     <div style={{ display: "flex", gap: 8 }}>
//                       <input
//                         type="text"
//                         value={createForm.password}
//                         onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
//                         placeholder="Enter password"
//                         style={{ ...input, flex: 1 }}
//                       />
//                       <button type="button" onClick={genStrongPass} style={btn}>Generate</button>
//                     </div>
//                   </label>
//                 )}

//                 {/* Alternate Email (only when mode=invite) */}
//                 {createForm.mode === "invite" && (
//                   <label style={label}>
//                     Alternate email (where we send the login link)
//                     <input
//                       type="email"
//                       value={createForm.alternateEmail}
//                       onChange={(e) => setCreateForm(f => ({ ...f, alternateEmail: e.target.value.trim() }))}
//                       placeholder="user@example.com"
//                       style={input}
//                     />
//                   </label>
//                 )}

//                 <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
//                   <label style={label}>
//                     Quota (MB)
//                     <input
//                       type="number"
//                       min="0"
//                       disabled={createForm.unlimited}
//                       value={createForm.unlimited ? 0 : createForm.quotaMB}
//                       onChange={(e) => setCreateForm(f => ({ ...f, quotaMB: e.target.value }))}
//                       style={input}
//                     />
//                   </label>
//                   <label style={{ ...label, alignSelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
//                     <input
//                       type="checkbox"
//                       checked={createForm.unlimited}
//                       onChange={(e) => setCreateForm(f => ({ ...f, unlimited: e.target.checked }))}
//                     />
//                     Unlimited
//                   </label>
//                 </div>

//                 <label style={{ ...label, flexDirection: "row", alignItems: "center", gap: 8 }}>
//                   <input
//                     type="checkbox"
//                     checked={createForm.sendWelcome}
//                     onChange={(e) => setCreateForm(f => ({ ...f, sendWelcome: e.target.checked }))}
//                   />
//                   Send welcome email to the new mailbox
//                 </label>

//                 <details>
//                   <summary style={{ cursor: "pointer", color: "#334", fontWeight: 600 }}>Optional Settings</summary>
//                   <label style={{ ...label, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
//                     <input
//                       type="checkbox"
//                       checked={createForm.stayAfterCreate}
//                       onChange={(e) => setCreateForm(f => ({ ...f, stayAfterCreate: e.target.checked }))}
//                     />
//                     Stay on this dialog after Create (add multiple)
//                   </label>
//                 </details>
//               </div>

//               <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
//                 <button type="button" onClick={closeCreate} style={btn} disabled={creating}>Cancel</button>
//                 <button
//                   type="button"
//                   onClick={submitCreate}
//                   style={{ ...btn, borderColor: "#22a06b", color: "#167a4f" }}
//                   disabled={creating || !canCreate}
//                 >
//                   {creating ? "Creating…" : "Create"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* QUOTA MODAL */}
//         {showQuota && (
//           <div
//             onClick={() => setShowQuota(false)}
//             style={{
//               position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
//               display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
//             }}
//           >
//             <div
//               onClick={(e) => e.stopPropagation()}
//               style={{ width: 520, background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 12px 28px rgba(0,0,0,.18)" }}
//               role="dialog" aria-modal="true" aria-labelledby="quotaTitle"
//             >
//               <h3 id="quotaTitle" style={{ margin: 0, marginBottom: 10 }}>Creation Limit Reached</h3>
//               <p style={{ marginTop: 6, color: "#334", lineHeight: 1.45 }}>
//                 You can create up to <strong>{MAX_EMAIL_ACCOUNTS}</strong> email accounts. You currently have{" "}
//                 <strong>{currentCount}</strong>. Please delete an existing account or increase your plan limit before creating a new one.
//               </p>
//               <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
//                 <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" style={btn}>
//                   Manage in cPanel
//                 </a>
//                 <button type="button" onClick={() => setShowQuota(false)} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}>
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// /* UI helpers */
// function Stat({ label, value }) {
//   return (
//     <div style={{ border: "1px solid #e1e5ea", borderRadius: 6, padding: "10px 14px" }}>
//       <div style={{ fontSize: 12, color: "#667" }}>{label}</div>
//       <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
//     </div>
//   );
// }

// function Toast({ toast, onClose }) {
//   if (!toast) return null;
//   const isSuccess = toast.type === "success";
//   const bg = isSuccess ? "#eafff4" : "#ffecec";
//   const border = isSuccess ? "#39c07a" : "#f3b1b1";
//   const color = isSuccess ? "#0d7a43" : "#a42828";
//   const title = isSuccess ? "Success" : "Error";

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 18,
//         right: 18,
//         zIndex: 9999,
//         maxWidth: 520,
//         background: bg,
//         border: `1px solid ${border}`,
//         color,
//         borderRadius: 8,
//         padding: "12px 14px",
//        boxShadow: "0 10px 24px rgba(0,0,0,.12)",
// display: "flex",
//         gap: 10,
//         alignItems: "flex-start",
//       }}
//       role="alert"
//       aria-live="assertive"
//     >
//       <div style={{ fontWeight: 800, marginRight: 4 }}>{title}:</div>
//       <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.35, flex: 1 }}>{toast.message}</div>
//       <button onClick={onClose} title="Close" style={{ ...btn, margin: 0, padding: "2px 8px" }}>
//         ×
//       </button>
//     </div>
//   );
// }

// const th = { textAlign: "left", padding: "10px 14px", borderBottom: "2px solid #cfd5df", fontSize: 13, color: "#303844" };
// const td = { padding: "12px 14px", borderTop: "1px solid #dfe3ea", fontSize: 13 };
// const btn = {
//   display: "inline-block",
//   marginRight: 8,
//   padding: "6px 10px",
//   border: "1px solid #9fc2f2",
//   background: "#fff",
//   color: "#1e66d0",
//   borderRadius: 4,
//   fontWeight: 600,
//   fontSize: 12.5,
//   cursor: "pointer",
//   textDecoration: "none",
// };
// const label = { fontSize: 13, color: "#2d3748", display: "grid", gap: 6 };
// const input = { height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #d6dbe1", width: "100%" };
// const badgeSystem = {
//   display: "inline-block",
//   marginLeft: 6,
//   padding: "2px 8px",
//   borderRadius: 4,
//   background: "#e7f0ff",
//   color: "#1e66d0",
//   fontWeight: 700,
//   fontSize: 12,
// };






















// pages/email-manager/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";

const CPANEL_USER = "mavsketc";
const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";
const CPANEL_UI = process.env.NEXT_PUBLIC_CPANEL_UI || "https://mavsketch.com:2083/frontend/jupiter";
const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "mavsketch.com";

// hard cap for # of email accounts (non-system)
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

// ✅ single place to change the path if needed later
const EMAILS_API = "/next-api/emails";

export default function EmailManager() {
  const router = useRouter();

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBelowLg, setIsBelowLg] = useState(false);
  useEffect(() => {
    const onResize = () => {
      const below = typeof window !== "undefined" ? window.innerWidth < 992 : false;
      setIsBelowLg(below);
      setSidebarOpen(!below);
    };
    onResize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

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

    // 2) If not in query, check sessionStorage (optional fallback)
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

      {/* top-right toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <main
        style={{
          flexGrow: 1,
          padding: 20,
          marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
          transition: "margin-left .25s ease",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>Email Accounts</h1>
        <p style={{ color: "#667", marginTop: 0 }}>Create, list, and manage email accounts.</p>

        {/* header stats + Create button */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
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
        </div>

        {/* search + filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, maxWidth: 680 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #d6dbe1" }}
          />
          <button type="button" onClick={() => {}} style={{ ...btn, height: 38 }}>
            Search
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
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
          <div style={{ color: "#667", marginLeft: "auto", fontSize: 13 }}>
            {loading ? "Loading..." : `Selected: ${selectedEmails.length}`}
          </div>
        </div>

        {/* page banner (load/delete) */}
        {error && (
          <div style={{ background: "#ffecec", border: "1px solid #f3b1b1", color: "#a42828", padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* confirm delete bar */}
        {showConfirm && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              marginBottom: 12,
              background: "#fff7d6",
              border: "1px solid #f1d488",
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 15, color: "#6b5200", fontWeight: 600 }}>
              {selectedCountVisible === 1
                ? `Delete “${visibleSelectable.find(v => selected[v.email])?.email}”?`
                : `Delete ${selectedCountVisible} email account(s)?`}
            </div>
            <label style={{ marginLeft: 8, color: "#6b5200", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={destroyMail} onChange={(e) => setDestroyMail(e.target.checked)} />
              Also delete mailbox files on disk
            </label>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={handleDelete} style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }} disabled={deleting}>
              {deleting ? "Deleting…" : `Delete (${selectedCountVisible})`}
            </button>
            <button type="button" onClick={() => { setShowConfirm(false); setDestroyMail(false); }} style={btn} disabled={deleting}>
              Cancel
            </button>
          </div>
        )}

        {/* mini actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <input
            ref={miniAllRef}
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAllVisible}
            title="Select all on this list"
            style={{ width: 18, height: 18 }}
          />
          <button
            type="button"
            onClick={askDelete}
            style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00", margin: 0 }}
            disabled={selectedCountVisible === 0 || deleting}
          >
            Delete
          </button>
        </div>

        {/* table */}
        <div style={{ border: "1px solid #cfd5df", borderRadius: 4, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fff" }}>
                <th style={{ ...th, width: 42 }}>
                  <input ref={headAllRef} type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="select all" />
                </th>
                <th style={th}>Account @ Domain</th>
                <th style={th}>Restrictions</th>
                <th style={th}>Storage: Used / Allocated / %</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const pct = r.unlimited ? null : (r.percent ?? 0);
                const checked = !!selected[r.email];
                return (
                  <tr key={r.email}>
                    <td style={{ ...td, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(r.email)}
                        disabled={r.system}
                        title={r.system ? "System account cannot be deleted" : ""}
                      />
                    </td>
                    <td style={td}>
                      <strong>{r.email}</strong> {r.system && <span style={badgeSystem}>System</span>}
                    </td>
                    <td style={td}>{r.restrictions === "Restricted" ? "⚠️ Restricted" : "✅ Unrestricted"}</td>
                    <td style={td}>
                      <div style={{ fontSize: 12 }}>
                        {r.usedHuman} / {r.allocatedHuman} {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
                      </div>
                      <div style={{ height: 8, background: "#eef1f5", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                        <div
                          style={{
                            height: 8,
                            width: r.unlimited ? "100%" : `${Math.min(100, pct).toFixed(2)}%`,
                            background: r.exceeded ? "#e74c3c" : "#9fb6d9",
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" style={btn}>Check Email</a>
                      <a href={`/email-manager/${encodeURIComponent(r.email)}`} style={btn}>Manage</a>
                      <a href={`${CPANEL_UI}/email_accounts/index.html`} target="_blank" rel="noreferrer" style={btn}>Connect Devices</a>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ ...td, textAlign: "center", color: "#667" }}>No results</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: "10px 12px", color: "#667", fontSize: 13 }}>
            {loading ? "Loading…" : `1 – ${filtered.length} of ${rows.length}`}
          </div>
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <div
            onClick={() => !creating && closeCreate()}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: 560, background: "#fff", borderRadius: 8, padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Create an Email Account</h3>

              <div style={{ display: "grid", gap: 10 }}>
                <label style={label}>
                  Domain
                  {domainOptions.length > 0 ? (
                    <select
                      value={createForm.domain}
                      onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value }))}
                      style={input}
                    >
                      {domainOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  ) : (
                    <input
                      value={createForm.domain}
                      onChange={(e) => setCreateForm(f => ({ ...f, domain: e.target.value.trim() }))}
                      placeholder="example.com"
                      style={input}
                    />
                  )}
                </label>

                <label style={label}>
                  Username
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      value={createForm.user}
                      onChange={(e) => setCreateForm(f => ({ ...f, user: e.target.value.trim() }))}
                      placeholder="e.g. support"
                      style={{ ...input, flex: 1 }}
                    />
                    <div style={{ fontSize: 13, color: "#667" }}>@{createForm.domain || "domain"}</div>
                  </div>
                </label>

                {/* Mode selector */}
                <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 13, color: "#2d3748", fontWeight: 600 }}>Password Options</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#2d3748" }}>
                    <input
                      type="radio"
                      name="mode"
                      checked={createForm.mode === "password"}
                      onChange={() => setCreateForm(f => ({ ...f, mode: "password" }))}
                    />
                    Set password now
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#2d3748" }}>
                    <input
                      type="radio"
                      name="mode"
                      checked={createForm.mode === "invite"}
                      onChange={() => setCreateForm(f => ({ ...f, mode: "invite", password: "" }))}
                    />
                    Send login link to alternate email
                  </label>
                </div>

                {/* Password (only when mode=password) */}
                {createForm.mode === "password" && (
                  <label style={label}>
                    Password
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={createForm.password}
                        onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Enter password"
                        style={{ ...input, flex: 1 }}
                      />
                      <button type="button" onClick={genStrongPass} style={btn}>Generate</button>
                    </div>
                  </label>
                )}

               
                {createForm.mode === "invite" && (
                  <label style={label}>
                    Alternate email (where we send the login link)
                    <input
                      type="email"
                      value={createForm.alternateEmail}
                      onChange={(e) => setCreateForm(f => ({ ...f, alternateEmail: e.target.value.trim() }))}
                      placeholder="user@example.com"
                      style={input}
                    />
                  </label>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <label style={label}>
                    Quota (MB)
                    <input
                      type="number"
                      min="0"
                      disabled={createForm.unlimited}
                      value={createForm.unlimited ? 0 : createForm.quotaMB}
                      onChange={(e) => setCreateForm(f => ({ ...f, quotaMB: e.target.value }))}
                      style={input}
                    />
                  </label>
                  <label style={{ ...label, alignSelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={createForm.unlimited}
                      onChange={(e) => setCreateForm(f => ({ ...f, unlimited: e.target.checked }))}
                    />
                    Unlimited
                  </label>
                </div>

                <label style={{ ...label, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={createForm.sendWelcome}
                    onChange={(e) => setCreateForm(f => ({ ...f, sendWelcome: e.target.checked }))}
                  />
                  Send welcome email to the new mailbox
                </label>

                <details>
                  <summary style={{ cursor: "pointer", color: "#334", fontWeight: 600 }}>Optional Settings</summary>
                  <label style={{ ...label, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={createForm.stayAfterCreate}
                      onChange={(e) => setCreateForm(f => ({ ...f, stayAfterCreate: e.target.checked }))}
                    />
                    Stay on this dialog after Create (add multiple)
                  </label>
                </details>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                <button type="button" onClick={closeCreate} style={btn} disabled={creating}>Cancel</button>
                <button
                  type="button"
                  onClick={submitCreate}
                  style={{ ...btn, borderColor: "#22a06b", color: "#167a4f" }}
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
      </main>
    </div>
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
