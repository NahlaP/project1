



// og
// // pages/email-manager/index.js
// import { useEffect, useMemo, useState } from "react";
// import SidebarDashly from "../../layouts/navbars/NavbarVertical";

// const CPANEL_USER = "mavsketc"; // 

// export default function EmailManager() {
//   // --- only added for SidebarDashly layout ---
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
//   // -------------------------------------------

//   const [data, setData] = useState({ header: { available: "∞", used: 0 }, rows: [] });
//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState("all"); 

//   useEffect(() => {
//     fetch("/api/emails")
//       .then((r) => r.json())
//       .then((d) => {
//         const safe = Array.isArray(d?.rows) ? d : { header: { available: "∞", used: 0 }, rows: [] };

//         const rows = (safe.rows || []).map((x) => {
//           const isSystem =
//             Boolean(x.system) ||
//             x.user === CPANEL_USER ||
           
//             (!!x.user && x.email === x.user && !String(x.email || "").includes("@"));

//           return { ...x, system: isSystem };
//         });

//         setData({ header: safe.header || { available: "∞", used: 0 }, rows });
//       })
//       .catch(() => setData({ header: { available: "∞", used: 0 }, rows: [] }));
//   }, []);

//   const rows = data.rows || [];

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
//     if (filter === "system") r = r.filter((x) => x.system); // <-- use the flag we set above

//     return r;
//   }, [rows, q, filter]);

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       {/* --- SidebarDashly added --- */}
//       <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />
//       {/* -------------------------------- */}

//       <main
//         style={{
//           flexGrow: 1,
//           padding: 20,
//           // leave space when sidebar is open on desktop (SidebarDashly width ~256px)
//           marginLeft: !isBelowLg && sidebarOpen ? 256 : 0,
//           transition: "margin-left .25s ease",
//           width: "100%",
//         }}
//       >
//         <h1 style={{ marginBottom: 8 }}>Email Accounts</h1>
//         <p style={{ color: "#667", marginTop: 0 }}>
//           This feature lets you create and manage email accounts.
//         </p>

//         {/* Header: Available / Used */}
//         <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
//           <div style={{ border: "1px solid #e1e5ea", borderRadius: 6, padding: "10px 14px" }}>
//             <div style={{ fontSize: 12, color: "#667" }}>Available</div>
//             <div style={{ fontSize: 22, fontWeight: 700 }}>{data.header.available}</div>
//           </div>
//           <div style={{ border: "1px solid #e1e5ea", borderRadius: 6, padding: "10px 14px" }}>
//             <div style={{ fontSize: 12, color: "#667" }}>Used</div>
//             <div style={{ fontSize: 22, fontWeight: 700 }}>{data.header.used}</div>
//           </div>
//         </div>

//         {/* Search */}
//         <div style={{ display: "flex", gap: 8, marginBottom: 10, maxWidth: 520 }}>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Search"
//             style={{
//               flex: 1,
//               height: 38,
//               padding: "0 12px",
//               borderRadius: 6,
//               border: "1px solid #d6dbe1",
//             }}
//           />
//           <button
//             type="button"
//             onClick={() => {}}
//             style={{
//               height: 38,
//               padding: "0 12px",
//               borderRadius: 6,
//               border: "1px solid #d6dbe1",
//               background: "#fff",
//             }}
//           >
//             Search
//           </button>
//         </div>

//         {/* Filters */}
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
//         </div>

//         {/* Table */}
//         <div style={{ border: "1px solid #cfd5df", borderRadius: 4, overflow: "hidden" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#fff" }}>
//                 <th style={th}>Account @ Domain</th>
//                 <th style={th}>Restrictions</th>
//                 <th style={th}>Storage: Used / Allocated / %</th>
//                 <th style={th}></th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((r) => {
//                 const pct = r.unlimited ? null : (r.percent ?? 0);
//                 return (
//                   <tr key={r.email}>
//                     <td style={td}>
//                       <strong>{r.email}</strong>{" "}
//                       {r.system && <span style={badgeSystem}>System</span>}
//                     </td>
//                     <td style={td}>
//                       {r.restrictions === "Restricted" ? "⚠️ Restricted" : "✅ Unrestricted"}
//                     </td>
//                     <td style={td}>
//                       <div style={{ fontSize: 12 }}>
//                         {r.usedHuman} / {r.allocatedHuman}{" "}
//                         {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
//                       </div>
//                       <div
//                         style={{
//                           height: 8,
//                           background: "#eef1f5",
//                           borderRadius: 999,
//                           overflow: "hidden",
//                           marginTop: 6,
//                         }}
//                       >
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
//                       <a
//                         href="https://mavsketch.com:2096"
//                         target="_blank"
//                         rel="noreferrer"
//                         style={btn}
//                       >
//                         Check Email
//                       </a>
//                       <button style={btn}>Manage</button>
//                       <button style={btn}>Connect Devices</button>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan="4" style={{ ...td, textAlign: "center", color: "#667" }}>
//                     No results
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <div style={{ padding: "10px 12px", color: "#667", fontSize: 13 }}>
//             1 – {filtered.length} of {rows.length}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// const th = {
//   textAlign: "left",
//   padding: "10px 14px",
//   borderBottom: "2px solid #cfd5df",
//   fontSize: 13,
//   color: "#303844",
// };
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
// };
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











// // pages/email-manager/index.js
// import { useEffect, useMemo, useRef, useState } from "react";
// import SidebarDashly from "../../layouts/navbars/NavbarVertical";

// const CPANEL_USER = "mavsketc"; // system account (not deletable)
// const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";
// const CPANEL_UI = process.env.NEXT_PUBLIC_CPANEL_UI || "https://mavsketch.com:2083/frontend/jupiter";

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

//   // data
//   const [loading, setLoading] = useState(false);
//   const [opLoading, setOpLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [data, setData] = useState({ header: { available: "∞", used: 0 }, rows: [] });

//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState("all");

//   // selection
//   const [selected, setSelected] = useState({}); // { [email]: true }
//   const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

//   // confirm delete
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [destroyMail, setDestroyMail] = useState(false);

//   const load = async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const r = await fetch("/api/emails");
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

//   // visible, selectable rows (non-system)
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

//   // tri-state checkboxes (mini bar + table header)
//   const miniAllRef = useRef(null);
//   const headAllRef = useRef(null);
//   useEffect(() => {
//     if (miniAllRef.current) miniAllRef.current.indeterminate = someVisibleSelected;
//     if (headAllRef.current) headAllRef.current.indeterminate = someVisibleSelected;
//   }, [someVisibleSelected]);

//   // selection handlers
//   const toggleOne = (email) => setSelected((prev) => ({ ...prev, [email]: !prev[email] }));
//   const toggleAllVisible = () => {
//     const map = { ...selected };
//     const newState = !allVisibleSelected; // if all selected, unselect; else select all
//     visibleSelectable.forEach((r) => (map[r.email] = newState));
//     setSelected(map);
//   };

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

//     setOpLoading(true);
//     setError("");
//     try {
//       const r = await fetch("/api/emails", {
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
//     } catch (e) {
//       console.error(e);
//       setError(`Delete failed: ${e.message || e}`);
//       setOpLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

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

//         {/* header stats */}
//         <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
//           <Stat label="Available" value={data.header.available} />
//           <Stat label="Used" value={data.header.used} />
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

//         {error && (
//           <div style={{ background: "#ffecec", border: "1px solid #f3b1b1", color: "#a42828", padding: 10, borderRadius: 6, marginBottom: 12 }}>
//             {error}
//           </div>
//         )}

//         {/* confirm banner */}
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
//               <input
//                 type="checkbox"
//                 checked={destroyMail}
//                 onChange={(e) => setDestroyMail(e.target.checked)}
//               />
//               Also delete mailbox files on disk
//             </label>
//             <div style={{ flex: 1 }} />
//             <button
//               type="button"
//               onClick={handleDelete}
//               style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}
//               disabled={opLoading}
//             >
//               {opLoading ? "Deleting…" : `Delete (${selectedCountVisible})`}
//             </button>
//             <button
//               type="button"
//               onClick={() => { setShowConfirm(false); setDestroyMail(false); }}
//               style={btn}
//               disabled={opLoading}
//             >
//               Cancel
//             </button>
//           </div>
//         )}

//         {/* mini action bar with real SELECT-ALL checkbox (tri-state) */}
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
//             disabled={selectedCountVisible === 0 || opLoading}
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
//                   <input
//                     ref={headAllRef}
//                     type="checkbox"
//                     checked={allVisibleSelected}
//                     onChange={toggleAllVisible}
//                     aria-label="select all"
//                   />
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
//                       <strong>{r.email}</strong>{" "}
//                       {r.system && <span style={badgeSystem}>System</span>}
//                     </td>
//                     <td style={td}>
//                       {r.restrictions === "Restricted" ? "⚠️ Restricted" : "✅ Unrestricted"}
//                     </td>
//                     <td style={td}>
//                       <div style={{ fontSize: 12 }}>
//                         {r.usedHuman} / {r.allocatedHuman}{" "}
//                         {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
//                       </div>
//                       <div
//                         style={{
//                           height: 8,
//                           background: "#eef1f5",
//                           borderRadius: 999,
//                           overflow: "hidden",
//                           marginTop: 6,
//                         }}
//                       >
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
//                       <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" style={btn}>
//                         Check Email
//                       </a>
//                       <a
//                         href={`${CPANEL_UI}/email_accounts/index.html`}
//                         target="_blank"
//                         rel="noreferrer"
//                         style={btn}
//                       >
//                         Manage
//                       </a>
//                       <a
//                         href={`${CPANEL_UI}/email_accounts/index.html`}
//                         target="_blank"
//                         rel="noreferrer"
//                         style={btn}
//                       >
//                         Connect Devices
//                       </a>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && !loading && (
//                 <tr>
//                   <td colSpan="5" style={{ ...td, textAlign: "center", color: "#667" }}>
//                     No results
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <div style={{ padding: "10px 12px", color: "#667", fontSize: 13 }}>
//             {loading ? "Loading…" : `1 – ${filtered.length} of ${rows.length}`}
//           </div>
//         </div>
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
import SidebarDashly from "../../layouts/navbars/NavbarVertical";

const CPANEL_USER = "mavsketc"; // system account (not deletable)
const CPANEL_WEBMAIL = process.env.NEXT_PUBLIC_CPANEL_WEBMAIL || "https://mavsketch.com:2096";
const CPANEL_UI = process.env.NEXT_PUBLIC_CPANEL_UI || "https://mavsketch.com:2083/frontend/jupiter";
const DEFAULT_DOMAIN = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN || "mavsketch.com";

export default function EmailManager() {
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

  // data
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ header: { available: "∞", used: 0 }, rows: [] });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  // selection
  const [selected, setSelected] = useState({}); // { [email]: true }
  const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  // confirm delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [destroyMail, setDestroyMail] = useState(false);

  // CREATE modal (new)
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    domain: DEFAULT_DOMAIN,
    user: "",
    password: "",
    quotaMB: 10240,   // 10 GB default
    unlimited: false, // 0 = unlimited in API when true
    sendWelcome: false,
    stayAfterCreate: false,
  });

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/emails");
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

  // ---------- domains for Create (from existing rows; fallback to DEFAULT_DOMAIN) ----------
  const domainOptions = useMemo(() => {
    const s = new Set(rows.map(r => r.domain).filter(Boolean));
    if (s.size === 0 && DEFAULT_DOMAIN) s.add(DEFAULT_DOMAIN);
    return Array.from(s).sort();
  }, [rows]);

  useEffect(() => {
    // set default domain when modal opens or rows change
    setCreateForm(f => ({ ...f, domain: f.domain || domainOptions[0] || "" }));
  }, [domainOptions.length]);

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

  // visible, selectable rows (non-system)
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

  // tri-state checkboxes (mini bar + table header)
  const miniAllRef = useRef(null);
  const headAllRef = useRef(null);
  useEffect(() => {
    if (miniAllRef.current) miniAllRef.current.indeterminate = someVisibleSelected;
    if (headAllRef.current) headAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  // selection handlers
  const toggleOne = (email) => setSelected((prev) => ({ ...prev, [email]: !prev[email] }));
  const toggleAllVisible = () => {
    const map = { ...selected };
    const newState = !allVisibleSelected; // if all selected, unselect; else select all
    visibleSelectable.forEach((r) => (map[r.email] = newState));
    setSelected(map);
  };

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

    setOpLoading(true);
    setError("");
    try {
      const r = await fetch("/api/emails", {
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
    } catch (e) {
      console.error(e);
      setError(`Delete failed: ${e.message || e}`);
      setOpLoading(false);
    }
  };

  // ---------------------- CREATE modal actions ----------------------
  const openCreate = () => {
    setShowCreate(true);
    // ensure we have a domain selected
    setCreateForm(f => ({ ...f, domain: f.domain || domainOptions[0] || "" }));
  };

  const genStrongPass = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    let p = ""; for (let i=0;i<16;i++) p += alphabet[Math.floor(Math.random()*alphabet.length)];
    setCreateForm(f => ({ ...f, password: p }));
  };

  const submitCreate = async () => {
    const { domain, user, password, quotaMB, unlimited, sendWelcome, stayAfterCreate } = createForm;
    if (!domain || !user || (!password && !sendWelcome)) {
      alert("Domain, username and password are required (unless you only send a welcome email).");
      return;
    }
    setOpLoading(true); setError("");
    try {
      const r = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          user,
          password,
          quotaMB: unlimited ? 0 : Number(quotaMB) || 0,
          sendWelcome: !!sendWelcome,
        }),
      });
      const j = await r.json();
      if (!r.ok || j?.error) throw new Error(j?.error || "Create failed");

      await load();
      if (stayAfterCreate) {
        setCreateForm(f => ({ ...f, user: "", password: "" })); // ready for next one
      } else {
        setShowCreate(false);
      }
      alert(`Created ${user}@${domain}`);
    } catch (e) {
      console.error(e);
      setError(`Create failed: ${e.message || e}`);
    } finally {
      setOpLoading(false);
    }
  };
  // -----------------------------------------------------------------

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarDashly isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isBelowLg} />

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

        {/* header stats + Create button (this is the only UI we added on top) */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "12px 0 18px" }}>
          <Stat label="Available" value={data.header.available} />
          <Stat label="Used" value={data.header.used} />
          <div style={{ flex: 1 }} />
          <button type="button" onClick={openCreate} style={{ ...btn, borderColor: "#22a06b", color: "#167a4f" }}>
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

        {error && (
          <div style={{ background: "#ffecec", border: "1px solid #f3b1b1", color: "#a42828", padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* confirm banner */}
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
              <input
                type="checkbox"
                checked={destroyMail}
                onChange={(e) => setDestroyMail(e.target.checked)}
              />
              Also delete mailbox files on disk
            </label>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={handleDelete}
              style={{ ...btn, borderColor: "#e3a008", color: "#8a5b00" }}
              disabled={opLoading}
            >
              {opLoading ? "Deleting…" : `Delete (${selectedCountVisible})`}
            </button>
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setDestroyMail(false); }}
              style={btn}
              disabled={opLoading}
            >
              Cancel
            </button>
          </div>
        )}

        {/* mini action bar with SELECT-ALL + Delete */}
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
            disabled={selectedCountVisible === 0 || opLoading}
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
                  <input
                    ref={headAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="select all"
                  />
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
                      <strong>{r.email}</strong>{" "}
                      {r.system && <span style={badgeSystem}>System</span>}
                    </td>
                    <td style={td}>
                      {r.restrictions === "Restricted" ? "⚠️ Restricted" : "✅ Unrestricted"}
                    </td>
                    <td style={td}>
                      <div style={{ fontSize: 12 }}>
                        {r.usedHuman} / {r.allocatedHuman}{" "}
                        {r.unlimited ? "" : ` / ${pct.toFixed(2)}%`}
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "#eef1f5",
                          borderRadius: 999,
                          overflow: "hidden",
                          marginTop: 6,
                        }}
                      >
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
                      <a href={CPANEL_WEBMAIL} target="_blank" rel="noreferrer" style={btn}>
                        Check Email
                      </a>
                      <a
                        href={`${CPANEL_UI}/email_accounts/index.html`}
                        target="_blank"
                        rel="noreferrer"
                        style={btn}
                      >
                        Manage
                      </a>
                      <a
                        href={`${CPANEL_UI}/email_accounts/index.html`}
                        target="_blank"
                        rel="noreferrer"
                        style={btn}
                      >
                        Connect Devices
                      </a>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ ...td, textAlign: "center", color: "#667" }}>
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: "10px 12px", color: "#667", fontSize: 13 }}>
            {loading ? "Loading…" : `1 – ${filtered.length} of ${rows.length}`}
          </div>
        </div>

        {/* CREATE MODAL (pure client-side; posts to your existing /api/emails) */}
        {showCreate && (
          <div
            onClick={() => !opLoading && setShowCreate(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
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
                      {domainOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
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
                  Send welcome email
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
                <button type="button" onClick={() => setShowCreate(false)} style={btn} disabled={opLoading}>Cancel</button>
                <button
                  type="button"
                  onClick={submitCreate}
                  style={{ ...btn, borderColor: "#22a06b", color: "#167a4f" }}
                  disabled={opLoading || !createForm.domain || !createForm.user}
                >
                  {opLoading ? "Creating…" : "Create"}
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
