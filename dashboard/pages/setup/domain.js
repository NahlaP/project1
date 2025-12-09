









// more domain

// // dashboard/pages/setup/domain.js
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { useState, useMemo } from "react";
// import { api } from "../../lib/api";

// // ----- TLD GROUPS (UI ONLY – values are without dot) -----
// const POPULAR_TLDS = ["com", "net", "org", "info"];
// const PREMIUM_TLDS = ["io", "ai", "tech", "online", "store", "app"];
// const UAE_TLDS = ["ae"];
// const OTHER_TLDS = ["biz", "site"];

// // for quick checks
// const PREMIUM_SET = new Set(PREMIUM_TLDS);

// export default function DomainSetupPage() {
//   const router = useRouter();

//   // Coming from /choose-plan
//   const priceId = router.query.priceId?.toString() || "";
//   const billing = (router.query.billing?.toString() || "monthly").toLowerCase();

//   // "new" | "transfer" | "dns"
//   const [mode, setMode] = useState("new");

//   // NEW DOMAIN STATE
//   const [name, setName] = useState("");
//   const [tld, setTld] = useState("com");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [checkResult, setCheckResult] = useState(null);
//   const [quote, setQuote] = useState(null);

//   // TRANSFER STATE
//   const [transferDomain, setTransferDomain] = useState("");
//   const [authCode, setAuthCode] = useState("");
//   const [transferLoading, setTransferLoading] = useState(false);
//   const [transferError, setTransferError] = useState("");
//   const [transferSuccess, setTransferSuccess] = useState("");

//   // DNS ONLY STATE
//   const [dnsDomain, setDnsDomain] = useState("");
//   const [dnsLoading, setDnsLoading] = useState(false);
//   const [dnsError, setDnsError] = useState("");
//   const [dnsSuccess, setDnsSuccess] = useState("");

//   const fullDomain = name ? `${name.trim().toLowerCase()}.${tld}` : "";

//   const isPremiumTld = useMemo(() => PREMIUM_SET.has(tld), [tld]);

//   const goToCheckout = () => {
//     if (!priceId) {
//       router.push("/checkout");
//       return;
//     }
//     router.push(
//       `/checkout?priceId=${encodeURIComponent(
//         priceId
//       )}&billing=${encodeURIComponent(billing)}`
//     );
//   };

//   /* ---------------- NEW DOMAIN: CHECK + QUOTE ---------------- */

//   const handleCheck = async (e) => {
//     e.preventDefault();
//     setError("");
//     setCheckResult(null);
//     setQuote(null);

//     const trimmed = name.trim().toLowerCase();
//     if (!trimmed) {
//       setError("Please enter a domain name.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ 1) availability for selected TLD
//       const checkRes = await api.get(
//         `/api/resellerclub/domain/check?name=${encodeURIComponent(
//           trimmed
//         )}&tlds=${encodeURIComponent(tld)}`
//       );

//       if (!checkRes.ok) {
//         throw new Error(checkRes.error || "Domain check failed");
//       }

//       // backend returns: { ok: true, data: [...] }
//       const list = checkRes.data;
//       const first = Array.isArray(list) ? list[0] : null;

//       if (!first) {
//         throw new Error("No response from domain check API");
//       }

//       setCheckResult(first);

//       if (first.status !== "available") {
//         setQuote(null);
//         return;
//       }

//       // ✅ 2) quote (availability + live price from backend)
//       const quoteRes = await api.get(
//         `/api/resellerclub/domain/quote?name=${encodeURIComponent(
//           trimmed
//         )}&tld=${encodeURIComponent(tld)}`
//       );

//       if (!quoteRes.ok) {
//         throw new Error(quoteRes.error || "Domain quote failed");
//       }

//       // backend: { ok: true, data: quote }
//       setQuote(quoteRes.data);
//     } catch (err) {
//       console.error("Domain setup error:", err);
//       setError(err.message || "Something went wrong while checking domain.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- TRANSFER ---------------- */

//   const handleTransferSubmit = async (e) => {
//     e.preventDefault();
//     setTransferError("");
//     setTransferSuccess("");

//     const d = transferDomain.trim().toLowerCase();
//     const code = authCode.trim();

//     if (!d) {
//       setTransferError("Please enter your existing domain.");
//       return;
//     }
//     if (!code) {
//       setTransferError("Please enter the EPP / Auth code.");
//       return;
//     }

//     try {
//       setTransferLoading(true);
//       // TODO: real backend call later
//       // const res = await api.post("/api/resellerclub/domain/transfer", { domain: d, authCode: code });
//       // if (!res.ok) throw new Error(res.error || "Transfer failed");

//       setTransferSuccess(
//         "Transfer request submitted. We’ll process it and update you."
//       );
//       setTimeout(goToCheckout, 800);
//     } catch (err) {
//       console.error("Transfer error:", err);
//       setTransferError(
//         err.message || "Something went wrong while submitting transfer."
//       );
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   /* ---------------- DNS ONLY ---------------- */

//   const handleDnsSubmit = async (e) => {
//     e.preventDefault();
//     setDnsError("");
//     setDnsSuccess("");

//     const d = dnsDomain.trim().toLowerCase();
//     if (!d) {
//       setDnsError("Please enter your domain.");
//       return;
//     }

//     try {
//       setDnsLoading(true);
//       // TODO: real backend call later
//       // const res = await api.post("/api/domain/attach-existing", { domain: d, type: "dns" });
//       // if (!res.ok) throw new Error(res.error || "Saving domain failed");

//       setDnsSuccess(
//         "Domain saved. Please update your DNS records to point to ION7."
//       );
//       setTimeout(goToCheckout, 800);
//     } catch (err) {
//       console.error("DNS attach error:", err);
//       setDnsError(err.message || "Something went wrong while saving domain.");
//     } finally {
//       setDnsLoading(false);
//     }
//   };

//   /* ---------------- RENDER HELPERS ---------------- */

//   const renderStatusAlert = () => {
//     if (!checkResult) return null;

//     if (checkResult.status === "available") {
//       return (
//         <div className="alert success">
//           <strong>{checkResult.domain}</strong> is available 🎉
//         </div>
//       );
//     }

//     if (checkResult.status === "taken") {
//       return (
//         <div className="alert danger">
//           <strong>{checkResult.domain}</strong> is already taken. Please try
//           another name.
//         </div>
//       );
//     }

//     return (
//       <div className="alert warn">
//         Status: {checkResult.status} ({checkResult.rawStatus})
//       </div>
//     );
//   };

//   const renderQuoteCard = () => {
//     if (!quote || checkResult?.status !== "available") return null;

//     const { priceAed, includedAed, extraAed, isFreeWithPlan, currency } = quote;
//     const hasPrice = typeof priceAed === "number" && !Number.isNaN(priceAed);
//     const displayCurrency = currency || "AED";

//     return (
//       <div className="quoteCard">
//         <h4>Pricing summary</h4>
//         <p>
//           Domain: <strong>{fullDomain}</strong>
//         </p>

//         {hasPrice ? (
//           <>
//             <p>
//               Registrar price:{" "}
//               <strong>
//                 {priceAed} {displayCurrency} / year
//               </strong>
//             </p>
//             <p>
//               Included in plan:{" "}
//               <strong>
//                 {includedAed} {displayCurrency}
//               </strong>
//             </p>
//           </>
//         ) : (
//           <p>
//             Registrar price:{" "}
//             <strong>Currently unavailable (we’ll confirm in checkout).</strong>
//           </p>
//         )}

//         {isPremiumTld && (
//           <p className="premiumNote">
//             Premium extension –{" "}
//             <span>first-year and renewal prices are usually higher.</span>
//           </p>
//         )}

//         {hasPrice && (
//           <>
//             {isFreeWithPlan ? (
//               <div className="alert success">
//                 ✅ This domain is <strong>FREE</strong> with your current plan
//                 (within {includedAed} {displayCurrency}).
//               </div>
//             ) : (
//               <div className="alert warn">
//                 ℹ️ This domain is above the included amount. Extra to pay:{" "}
//                 <strong>
//                   {extraAed} {displayCurrency}
//                 </strong>
//               </div>
//             )}
//           </>
//         )}

//         <p className="footnote">
//           Prices are fetched in real time from our registrar (ResellerClub) in{" "}
//           {displayCurrency}. Renewal pricing after the first year may change.
//         </p>

//         <button
//           type="button"
//           className="btn primary fullBtn"
//           onClick={goToCheckout}
//         >
//           Use this domain &amp; continue
//         </button>
//       </div>
//     );
//   };

//   const renderNewDomain = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Register a new domain</h3>
//         <p className="lead">
//           Search for a new domain. We’ll check availability and apply your{" "}
//           <strong>up to 50 AED free</strong> credit.
//         </p>

//         <form onSubmit={handleCheck}>
//           <label className="lbl">New domain</label>
//           <div className="domainRow">
//             <input
//               className="inp"
//               type="text"
//               placeholder="mybusinessname"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               disabled={loading}
//             />
//             <span className="dot">.</span>
//             <select
//               className="inp tld"
//               value={tld}
//               onChange={(e) => setTld(e.target.value)}
//               disabled={loading}
//             >
//               <optgroup label="Most popular">
//                 {POPULAR_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//               <optgroup label="Premium">
//                 {PREMIUM_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//               <optgroup label="UAE & region">
//                 {UAE_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//               <optgroup label="Other">
//                 {OTHER_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//             </select>
//           </div>

//           {fullDomain && (
//             <p className="hint">
//               Full domain: <strong>{fullDomain}</strong>
//             </p>
//           )}

//           {isPremiumTld && (
//             <p className="hint premiumHint">
//               Premium TLD – pricing is usually higher than .com / .net.
//             </p>
//           )}

//           {error && <div className="alert danger">{error}</div>}

//           <button type="submit" className="btn primary" disabled={loading}>
//             {loading ? "Checking…" : "Check availability"}
//           </button>
//         </form>

//         {renderStatusAlert()}
//       </div>

//       <div className="sidePanel glass">
//         <h4>What’s included</h4>
//         <ul className="sideList">
//           <li>Free domain credit up to 50 AED</li>
//           <li>1 year registration with ResellerClub</li>
//           <li>Automatic connection to your ION7 site</li>
//         </ul>

//         {renderQuoteCard()}
//       </div>
//     </div>
//   );

//   const renderTransfer = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Transfer your existing domain</h3>
//         <p className="lead">
//           Move your domain into our ResellerClub account so we can manage
//           everything for you.
//         </p>

//         <form onSubmit={handleTransferSubmit}>
//           <label className="lbl">Existing domain</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="mybusiness.com"
//             value={transferDomain}
//             onChange={(e) => setTransferDomain(e.target.value)}
//             disabled={transferLoading}
//           />

//           <label className="lbl">EPP / Auth code</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="Auth code from current registrar"
//             value={authCode}
//             onChange={(e) => setAuthCode(e.target.value)}
//             disabled={transferLoading}
//           />

//           {transferError && <div className="alert danger">{transferError}</div>}
//           {transferSuccess && (
//             <div className="alert success">{transferSuccess}</div>
//           )}

//           <button
//             type="submit"
//             className="btn primary"
//             disabled={transferLoading}
//           >
//             {transferLoading ? "Submitting…" : "Submit transfer request"}
//           </button>
//         </form>
//       </div>

//       <div className="sidePanel glass">
//         <h4>Transfer tips</h4>
//         <ul className="sideList">
//           <li>Unlock your domain at your current registrar.</li>
//           <li>Request the EPP/Auth code from them.</li>
//           <li>Make sure WHOIS email is correct to approve transfer.</li>
//         </ul>
//       </div>
//     </div>
//   );

//   const renderDns = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Use existing domain (DNS only)</h3>
//         <p className="lead">
//           Keep your domain with your current provider and just point DNS to
//           ION7.
//         </p>

//         <form onSubmit={handleDnsSubmit}>
//           <label className="lbl">Existing domain</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="mybusiness.com"
//             value={dnsDomain}
//             onChange={(e) => setDnsDomain(e.target.value)}
//             disabled={dnsLoading}
//           />

//           {dnsError && <div className="alert danger">{dnsError}</div>}
//           {dnsSuccess && <div className="alert success">{dnsSuccess}</div>}

//           <button
//             type="submit"
//             className="btn primary"
//             disabled={dnsLoading}
//           >
//             {dnsLoading ? "Saving…" : "Save domain & continue"}
//           </button>
//         </form>
//       </div>

//       <div className="sidePanel glass">
//         <h4>What you’ll need to do</h4>
//         <ul className="sideList">
//           <li>Update A records / nameservers at your registrar.</li>
//           <li>DNS changes can take up to 24 hours to propagate.</li>
//           <li>We’ll show you the exact values after this step.</li>
//         </ul>
//       </div>
//     </div>
//   );

//   /* ---------------- MAIN RENDER ---------------- */

//   return (
//     <>
//       <Head>
//         <title>Domain setup — ION7</title>
//       </Head>

//       <div className="shell">
//         {/* Header */}
//         <div className="head card glass">
//           <div className="brand">
//             <div className="logo">ION</div>
//             <div>
//               <h1>Domain setup</h1>
//               <p>Choose how you want to use a domain with your ION7 website.</p>
//             </div>
//           </div>

//           <div className="modeToggle">
//             <button
//               type="button"
//               className={`pill ${mode === "new" ? "active" : ""}`}
//               onClick={() => setMode("new")}
//             >
//               New domain
//             </button>
//             <button
//               type="button"
//               className={`pill ${mode === "transfer" ? "active" : ""}`}
//               onClick={() => setMode("transfer")}
//             >
//               Transfer domain
//             </button>
//             <button
//               type="button"
//               className={`pill ${mode === "dns" ? "active" : ""}`}
//               onClick={() => setMode("dns")}
//             >
//               Use existing (DNS)
//             </button>
//           </div>
//         </div>

//         {/* Flows */}
//         {mode === "new" && renderNewDomain()}
//         {mode === "transfer" && renderTransfer()}
//         {mode === "dns" && renderDns()}
//       </div>

//       <style jsx>{`
//         :root {
//           --bg: #f3f4f6;
//           --accent: #7c3aed;
//           --accent-soft: #ede9fe;
//           --text: #0f172a;
//           --muted: #6b7280;
//           --card: #ffffffcc;
//           --border: #e5e7eb;
//           --danger-bg: #fee2e2;
//           --danger-border: #fecaca;
//           --success-bg: #dcfce7;
//           --success-border: #bbf7d0;
//           --warn-bg: #fef9c3;
//           --warn-border: #facc15;
//         }
//         html,
//         body,
//         #__next {
//           height: 100%;
//         }
//         body {
//           margin: 0;
//           background: radial-gradient(
//             circle at top,
//             #e5e7eb 0,
//             #f3f4f6 40%,
//             #e5e7eb 100%
//           );
//           color: var(--text);
//           font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial,
//             sans-serif;
//         }
//         .shell {
//           max-width: 1100px;
//           margin: 0 auto;
//           padding: 88px 16px 64px;
//         }
//         .card {
//           border-radius: 18px;
//           padding: 20px;
//         }
//         .glass {
//           background: var(--card);
//           border: 1px solid rgba(148, 163, 184, 0.4);
//           box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
//           backdrop-filter: blur(10px);
//         }
//         .head {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 16px;
//           padding: 22px 24px;
//           margin-bottom: 20px;
//         }
//         .brand {
//           display: flex;
//           gap: 12px;
//           alignments: center;
//         }
//         .logo {
//           width: 44px;
//           height: 44px;
//           border-radius: 14px;
//           display: grid;
//           place-items: center;
//           background: linear-gradient(135deg, #a7f3d0, #22c55e);
//           color: #022c22;
//           font-weight: 800;
//           font-size: 18px;
//           box-shadow: 0 10px 30px rgba(22, 163, 74, 0.45);
//         }
//         .brand h1 {
//           margin: 0;
//           font-size: 20px;
//         }
//         .brand p {
//           margin: 4px 0 0;
//           color: var(--muted);
//           font-size: 12px;
//         }
//         .modeToggle {
//           display: inline-flex;
//           padding: 4px;
//           border-radius: 999px;
//           background: rgba(15, 23, 42, 0.03);
//           border: 1px solid rgba(148, 163, 184, 0.5);
//           gap: 4px;
//         }
//         .pill {
//           padding: 7px 14px;
//           border-radius: 999px;
//           font-size: 12px;
//           font-weight: 600;
//           background: transparent;
//           border: 0;
//           color: #4b5563;
//           cursor: pointer;
//         }
//         .pill.active {
//           background: #111827;
//           color: #f9fafb;
//         }
//         .flowGrid {
//           display: grid;
//           grid-template-columns: minmax(0, 2.1fr) minmax(0, 1.2fr);
//           gap: 18px;
//           align-items: flex-start;
//         }
//         .cardTitle {
//           margin: 0 0 8px;
//           font-size: 16px;
//           font-weight: 700;
//         }
//         .lead {
//           margin: 0 0 14px;
//           font-size: 13px;
//           color: var(--muted);
//         }
//         .lbl {
//           display: block;
//           font-size: 12px;
//           color: #4b5563;
//           margin: 12px 0 6px;
//           font-weight: 600;
//         }
//         .domainRow {
//           display: grid;
//           grid-template-columns: minmax(0, 1fr) auto auto;
//           gap: 6px;
//           align-items: center;
//         }
//         .dot {
//           font-size: 18px;
//           text-align: center;
//           color: #4b5563;
//         }
//         .inp {
//           border-radius: 12px;
//           border: 1px solid var(--border);
//           padding: 10px 12px;
//           font-size: 14px;
//           outline: none;
//           background: #ffffff;
//           box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
//         }
//         .inp.tld {
//           width: 130px;
//         }
//         .inp:focus {
//           border-color: #4f46e5;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
//         }
//         .hint {
//           margin: 8px 0 0;
//           font-size: 12px;
//           color: var(--muted);
//         }
//         .premiumHint {
//           color: #b45309;
//         }
//         .btn {
//           border-radius: 12px;
//           border: 0;
//           padding: 10px 18px;
//           font-weight: 700;
//           font-size: 14px;
//           cursor: pointer;
//           margin-top: 16px;
//         }
//         .btn.primary {
//           background: #ff3b30;
//           color: #ffffff;
//           box-shadow: 0 14px 35px rgba(248, 113, 113, 0.35);
//         }
//         .btn.primary:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//           box-shadow: none;
//         }
//         .fullBtn {
//           width: 100%;
//         }
//         .alert {
//           margin-top: 12px;
//           border-radius: 12px;
//           padding: 10px 12px;
//           font-size: 13px;
//         }
//         .alert.danger {
//           background: var(--danger-bg);
//           border: 1px solid var(--danger-border);
//           color: #b91c1c;
//         }
//         .alert.success {
//           background: var(--success-bg);
//           border: 1px solid var(--success-border);
//           color: #166534;
//         }
//         .alert.warn {
//           background: var(--warn-bg);
//           border: 1px solid var(--warn-border);
//           color: #854d0e;
//         }
//         .sidePanel {
//           padding: 18px 18px 16px;
//         }
//         .sidePanel h4 {
//           margin: 0 0 10px;
//           font-size: 14px;
//         }
//         .sideList {
//           list-style: none;
//           padding: 0;
//           margin: 0 0 10px;
//           font-size: 12px;
//           color: var(--muted);
//         }
//         .sideList li {
//           padding-left: 14px;
//           position: relative;
//           margin-bottom: 6px;
//         }
//         .sideList li::before {
//           content: "•";
//           position: absolute;
//           left: 0;
//           color: #22c55e;
//         }
//         .quoteCard {
//           margin-top: 10px;
//           padding-top: 10px;
//           border-top: 1px dashed rgba(148, 163, 184, 0.6);
//           font-size: 13px;
//         }
//         .quoteCard h4 {
//           margin: 0 0 8px;
//           font-size: 13px;
//         }
//         .premiumNote {
//           margin: 6px 0 0;
//           font-size: 12px;
//           color: #b45309;
//         }
//         .premiumNote span {
//           font-weight: 500;
//         }
//         .footnote {
//           margin-top: 10px;
//           font-size: 11px;
//           color: #6b7280;
//         }
//         optgroup {
//           font-weight: 600;
//           color: #4b5563;
//         }
//         @media (max-width: 900px) {
//           .flowGrid {
//             grid-template-columns: minmax(0, 1fr);
//           }
//           .sidePanel {
//             margin-top: 4px;
//           }
//         }
//         @media (max-width: 640px) {
//           .head {
//             flex-direction: column;
//             align-items: flex-start;
//           }
//           .modeToggle {
//             width: 100%;
//             justify-content: space-between;
//           }
//         }
//       `}</style>
//     </>
//   );
// }




























































// // og
// // dashboard/pages/setup/domain.js
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { useState } from "react";
// import { api } from "../../lib/api";

// // ----- TLD LIST (ONLY WORKING ONES) -----
// // These are the only ones we show in the UI
// const POPULAR_TLDS = ["com", "info", "org"];
// const UAE_TLDS = ["ae"];

// export default function DomainSetupPage() {
//   const router = useRouter();

//   // Coming from /choose-plan
//   const priceId = router.query.priceId?.toString() || "";
//   const billing = (router.query.billing?.toString() || "monthly").toLowerCase();

//   // "new" | "transfer" | "dns"
//   const [mode, setMode] = useState("new");

//   // NEW DOMAIN STATE
//   const [name, setName] = useState("");
//   const [tld, setTld] = useState("com");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [checkResult, setCheckResult] = useState(null);
//   const [quote, setQuote] = useState(null);

//   // TRANSFER STATE
//   const [transferDomain, setTransferDomain] = useState("");
//   const [authCode, setAuthCode] = useState("");
//   const [transferLoading, setTransferLoading] = useState(false);
//   const [transferError, setTransferError] = useState("");
//   const [transferSuccess, setTransferSuccess] = useState("");

//   // DNS ONLY STATE
//   const [dnsDomain, setDnsDomain] = useState("");
//   const [dnsLoading, setDnsLoading] = useState(false);
//   const [dnsError, setDnsError] = useState("");
//   const [dnsSuccess, setDnsSuccess] = useState("");

//   const fullDomain = name ? `${name.trim().toLowerCase()}.${tld}` : "";

//   const goToCheckout = () => {
//     if (!priceId) {
//       router.push("/checkout");
//       return;
//     }
//     router.push(
//       `/checkout?priceId=${encodeURIComponent(
//         priceId
//       )}&billing=${encodeURIComponent(billing)}`
//     );
//   };

//   /* ---------------- NEW DOMAIN: CHECK + QUOTE ---------------- */

//   const handleCheck = async (e) => {
//     e.preventDefault();
//     setError("");
//     setCheckResult(null);
//     setQuote(null);

//     const trimmed = name.trim().toLowerCase();
//     if (!trimmed) {
//       setError("Please enter a domain name.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ 1) availability for selected TLD
//       const checkRes = await api.get(
//         `/api/resellerclub/domain/check?name=${encodeURIComponent(
//           trimmed
//         )}&tlds=${encodeURIComponent(tld)}`
//       );

//       if (!checkRes.ok) {
//         throw new Error(checkRes.error || "Domain check failed");
//       }

//       // backend returns: { ok: true, data: [...] }
//       const list = checkRes.data;
//       const first = Array.isArray(list) ? list[0] : null;

//       if (!first) {
//         throw new Error("No response from domain check API");
//       }

//       setCheckResult(first);

//       if (first.status !== "available") {
//         setQuote(null);
//         return;
//       }

//       // ✅ 2) quote (availability + live price from backend)
//       const quoteRes = await api.get(
//         `/api/resellerclub/domain/quote?name=${encodeURIComponent(
//           trimmed
//         )}&tld=${encodeURIComponent(tld)}`
//       );

//       if (!quoteRes.ok) {
//         throw new Error(quoteRes.error || "Domain quote failed");
//       }

//       // backend: { ok: true, data: quote }
//       setQuote(quoteRes.data);
//     } catch (err) {
//       console.error("Domain setup error:", err);
//       setError(err.message || "Something went wrong while checking domain.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- TRANSFER ---------------- */

//   const handleTransferSubmit = async (e) => {
//     e.preventDefault();
//     setTransferError("");
//     setTransferSuccess("");

//     const d = transferDomain.trim().toLowerCase();
//     const code = authCode.trim();

//     if (!d) {
//       setTransferError("Please enter your existing domain.");
//       return;
//     }
//     if (!code) {
//       setTransferError("Please enter the EPP / Auth code.");
//       return;
//     }

//     try {
//       setTransferLoading(true);
//       // TODO: real backend call later
//       // const res = await api.post("/api/resellerclub/domain/transfer", { domain: d, authCode: code });
//       // if (!res.ok) throw new Error(res.error || "Transfer failed");

//       setTransferSuccess(
//         "Transfer request submitted. We’ll process it and update you."
//       );
//       setTimeout(goToCheckout, 800);
//     } catch (err) {
//       console.error("Transfer error:", err);
//       setTransferError(
//         err.message || "Something went wrong while submitting transfer."
//       );
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   /* ---------------- DNS ONLY ---------------- */

//   const handleDnsSubmit = async (e) => {
//     e.preventDefault();
//     setDnsError("");
//     setDnsSuccess("");

//     const d = dnsDomain.trim().toLowerCase();
//     if (!d) {
//       setDnsError("Please enter your domain.");
//       return;
//     }

//     try {
//       setDnsLoading(true);
//       // TODO: real backend call later
//       // const res = await api.post("/api/domain/attach-existing", { domain: d, type: "dns" });
//       // if (!res.ok) throw new Error(res.error || "Saving domain failed");

//       setDnsSuccess(
//         "Domain saved. Please update your DNS records to point to ION7."
//       );
//       setTimeout(goToCheckout, 800);
//     } catch (err) {
//       console.error("DNS attach error:", err);
//       setDnsError(err.message || "Something went wrong while saving domain.");
//     } finally {
//       setDnsLoading(false);
//     }
//   };

//   /* ---------------- RENDER HELPERS ---------------- */

//   const renderStatusAlert = () => {
//     if (!checkResult) return null;

//     if (checkResult.status === "available") {
//       return (
//         <div className="alert success">
//           <strong>{checkResult.domain}</strong> is available 🎉
//         </div>
//       );
//     }

//     if (checkResult.status === "taken") {
//       return (
//         <div className="alert danger">
//           <strong>{checkResult.domain}</strong> is already taken. Please try
//           another name.
//         </div>
//       );
//     }

//     return (
//       <div className="alert warn">
//         Status: {checkResult.status} ({checkResult.rawStatus})
//       </div>
//     );
//   };

//   const renderQuoteCard = () => {
//     if (!quote || checkResult?.status !== "available") return null;

//     const { priceAed, includedAed, extraAed, isFreeWithPlan, currency } = quote;
//     const hasPrice = typeof priceAed === "number" && !Number.isNaN(priceAed);
//     const displayCurrency = currency || "AED";

//     return (
//       <div className="quoteCard">
//         <h4>Pricing summary</h4>
//         <p>
//           Domain: <strong>{fullDomain}</strong>
//         </p>

//         {hasPrice ? (
//           <>
//             <p>
//               Registrar price:{" "}
//               <strong>
//                 {priceAed} {displayCurrency} / year
//               </strong>
//             </p>
//             <p>
//               Included in plan:{" "}
//               <strong>
//                 {includedAed} {displayCurrency}
//               </strong>
//             </p>
//           </>
//         ) : (
//           <p>
//             Registrar price:{" "}
//             <strong>Currently unavailable (we’ll confirm in checkout).</strong>
//           </p>
//         )}

//         {hasPrice && (
//           <>
//             {isFreeWithPlan ? (
//               <div className="alert success">
//                 ✅ This domain is <strong>FREE</strong> with your current plan
//                 (within {includedAed} {displayCurrency}).
//               </div>
//             ) : (
//               <div className="alert warn">
//                 ℹ️ This domain is above the included amount. Extra to pay:{" "}
//                 <strong>
//                   {extraAed} {displayCurrency}
//                 </strong>
//               </div>
//             )}
//           </>
//         )}

//         <p className="footnote">
//           Prices are fetched in real time from our registrar (ResellerClub) in{" "}
//           {displayCurrency}. Renewal pricing after the first year may change.
//         </p>

//         <button
//           type="button"
//           className="btn primary fullBtn"
//           onClick={goToCheckout}
//         >
//           Use this domain &amp; continue
//         </button>
//       </div>
//     );
//   };

//   const renderNewDomain = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Register a new domain</h3>
//         <p className="lead">
//           Search for a new domain. We’ll check availability and apply your{" "}
//           <strong>up to 50 AED free</strong> credit.
//         </p>

//         <form onSubmit={handleCheck}>
//           <label className="lbl">New domain</label>
//           <div className="domainRow">
//             <input
//               className="inp"
//               type="text"
//               placeholder="mybusinessname"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               disabled={loading}
//             />
//             <span className="dot">.</span>
//             <select
//               className="inp tld"
//               value={tld}
//               onChange={(e) => setTld(e.target.value)}
//               disabled={loading}
//             >
//               <optgroup label="Most popular">
//                 {POPULAR_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//               <optgroup label="UAE & region">
//                 {UAE_TLDS.map((code) => (
//                   <option key={code} value={code}>
//                     .{code}
//                   </option>
//                 ))}
//               </optgroup>
//             </select>
//           </div>

//           {fullDomain && (
//             <p className="hint">
//               Full domain: <strong>{fullDomain}</strong>
//             </p>
//           )}

//           {error && <div className="alert danger">{error}</div>}

//           <button type="submit" className="btn primary" disabled={loading}>
//             {loading ? "Checking…" : "Check availability"}
//           </button>
//         </form>

//         {renderStatusAlert()}
//       </div>

//       <div className="sidePanel glass">
//         <h4>What’s included</h4>
//         <ul className="sideList">
//           <li>Free domain credit up to 50 AED</li>
//           <li>1 year registration with ResellerClub</li>
//           <li>Automatic connection to your ION7 site</li>
//         </ul>

//         {renderQuoteCard()}
//       </div>
//     </div>
//   );

//   const renderTransfer = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Transfer your existing domain</h3>
//         <p className="lead">
//           Move your domain into our ResellerClub account so we can manage
//           everything for you.
//         </p>

//         <form onSubmit={handleTransferSubmit}>
//           <label className="lbl">Existing domain</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="mybusiness.com"
//             value={transferDomain}
//             onChange={(e) => setTransferDomain(e.target.value)}
//             disabled={transferLoading}
//           />

//           <label className="lbl">EPP / Auth code</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="Auth code from current registrar"
//             value={authCode}
//             onChange={(e) => setAuthCode(e.target.value)}
//             disabled={transferLoading}
//           />

//           {transferError && <div className="alert danger">{transferError}</div>}
//           {transferSuccess && (
//             <div className="alert success">{transferSuccess}</div>
//           )}

//           <button
//             type="submit"
//             className="btn primary"
//             disabled={transferLoading}
//           >
//             {transferLoading ? "Submitting…" : "Submit transfer request"}
//           </button>
//         </form>
//       </div>

//       <div className="sidePanel glass">
//         <h4>Transfer tips</h4>
//         <ul className="sideList">
//           <li>Unlock your domain at your current registrar.</li>
//           <li>Request the EPP/Auth code from them.</li>
//           <li>Make sure WHOIS email is correct to approve transfer.</li>
//         </ul>
//       </div>
//     </div>
//   );

//   const renderDns = () => (
//     <div className="flowGrid">
//       <div className="card glass">
//         <h3 className="cardTitle">Use existing domain (DNS only)</h3>
//         <p className="lead">
//           Keep your domain with your current provider and just point DNS to
//           ION7.
//         </p>

//         <form onSubmit={handleDnsSubmit}>
//           <label className="lbl">Existing domain</label>
//           <input
//             className="inp"
//             type="text"
//             placeholder="mybusiness.com"
//             value={dnsDomain}
//             onChange={(e) => setDnsDomain(e.target.value)}
//             disabled={dnsLoading}
//           />

//           {dnsError && <div className="alert danger">{dnsError}</div>}
//           {dnsSuccess && <div className="alert success">{dnsSuccess}</div>}

//           <button
//             type="submit"
//             className="btn primary"
//             disabled={dnsLoading}
//           >
//             {dnsLoading ? "Saving…" : "Save domain & continue"}
//           </button>
//         </form>
//       </div>

//       <div className="sidePanel glass">
//         <h4>What you’ll need to do</h4>
//         <ul className="sideList">
//           <li>Update A records / nameservers at your registrar.</li>
//           <li>DNS changes can take up to 24 hours to propagate.</li>
//           <li>We’ll show you the exact values after this step.</li>
//         </ul>
//       </div>
//     </div>
//   );

//   /* ---------------- MAIN RENDER ---------------- */

//   return (
//     <>
//       <Head>
//         <title>Domain setup — ION7</title>
//       </Head>

//       <div className="shell">
//         {/* Header */}
//         <div className="head card glass">
//           <div className="brand">
//             <div className="logo">ION</div>
//             <div>
//               <h1>Domain setup</h1>
//               <p>Choose how you want to use a domain with your ION7 website.</p>
//             </div>
//           </div>

//           <div className="modeToggle">
//             <button
//               type="button"
//               className={`pill ${mode === "new" ? "active" : ""}`}
//               onClick={() => setMode("new")}
//             >
//               New domain
//             </button>
//             <button
//               type="button"
//               className={`pill ${mode === "transfer" ? "active" : ""}`}
//               onClick={() => setMode("transfer")}
//             >
//               Transfer domain
//             </button>
//             <button
//               type="button"
//               className={`pill ${mode === "dns" ? "active" : ""}`}
//               onClick={() => setMode("dns")}
//             >
//               Use existing (DNS)
//             </button>
//           </div>
//         </div>

//         {/* Flows */}
//         {mode === "new" && renderNewDomain()}
//         {mode === "transfer" && renderTransfer()}
//         {mode === "dns" && renderDns()}
//       </div>

//       <style jsx>{`
//         :root {
//           --bg: #f3f4f6;
//           --accent: #7c3aed;
//           --accent-soft: #ede9fe;
//           --text: #0f172a;
//           --muted: #6b7280;
//           --card: #ffffffcc;
//           --border: #e5e7eb;
//           --danger-bg: #fee2e2;
//           --danger-border: #fecaca;
//           --success-bg: #dcfce7;
//           --success-border: #bbf7d0;
//           --warn-bg: #fef9c3;
//           --warn-border: #facc15;
//         }
//         html,
//         body,
//         #__next {
//           height: 100%;
//         }
//         body {
//           margin: 0;
//           background: radial-gradient(
//             circle at top,
//             #e5e7eb 0,
//             #f3f4f6 40%,
//             #e5e7eb 100%
//           );
//           color: var(--text);
//           font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial,
//             sans-serif;
//         }
//         .shell {
//           max-width: 1100px;
//           margin: 0 auto;
//           padding: 88px 16px 64px;
//         }
//         .card {
//           border-radius: 18px;
//           padding: 20px;
//         }
//         .glass {
//           background: var(--card);
//           border: 1px solid rgba(148, 163, 184, 0.4);
//           box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
//           backdrop-filter: blur(10px);
//         }
//         .head {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 16px;
//           padding: 22px 24px;
//           margin-bottom: 20px;
//         }
//         .brand {
//           display: flex;
//           gap: 12px;
//           alignments: center;
//         }
//         .logo {
//           width: 44px;
//           height: 44px;
//           border-radius: 14px;
//           display: grid;
//           place-items: center;
//           background: linear-gradient(135deg, #a7f3d0, #22c55e);
//           color: #022c22;
//           font-weight: 800;
//           font-size: 18px;
//           box-shadow: 0 10px 30px rgba(22, 163, 74, 0.45);
//         }
//         .brand h1 {
//           margin: 0;
//           font-size: 20px;
//         }
//         .brand p {
//           margin: 4px 0 0;
//           color: var(--muted);
//           font-size: 12px;
//         }
//         .modeToggle {
//           display: inline-flex;
//           padding: 4px;
//           border-radius: 999px;
//           background: rgba(15, 23, 42, 0.03);
//           border: 1px solid rgba(148, 163, 184, 0.5);
//           gap: 4px;
//         }
//         .pill {
//           padding: 7px 14px;
//           border-radius: 999px;
//           font-size: 12px;
//           font-weight: 600;
//           background: transparent;
//           border: 0;
//           color: #4b5563;
//           cursor: pointer;
//         }
//         .pill.active {
//           background: #111827;
//           color: #f9fafb;
//         }
//         .flowGrid {
//           display: grid;
//           grid-template-columns: minmax(0, 2.1fr) minmax(0, 1.2fr);
//           gap: 18px;
//           align-items: flex-start;
//         }
//         .cardTitle {
//           margin: 0 0 8px;
//           font-size: 16px;
//           font-weight: 700;
//         }
//         .lead {
//           margin: 0 0 14px;
//           font-size: 13px;
//           color: var(--muted);
//         }
//         .lbl {
//           display: block;
//           font-size: 12px;
//           color: #4b5563;
//           margin: 12px 0 6px;
//           font-weight: 600;
//         }
//         .domainRow {
//           display: grid;
//           grid-template-columns: minmax(0, 1fr) auto auto;
//           gap: 6px;
//           align-items: center;
//         }
//         .dot {
//           font-size: 18px;
//           text-align: center;
//           color: #4b5563;
//         }
//         .inp {
//           border-radius: 12px;
//           border: 1px solid var(--border);
//           padding: 10px 12px;
//           font-size: 14px;
//           outline: none;
//           background: #ffffff;
//           box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
//         }
//         .inp.tld {
//           width: 130px;
//         }
//         .inp:focus {
//           border-color: #4f46e5;
//           box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
//         }
//         .hint {
//           margin: 8px 0 0;
//           font-size: 12px;
//           color: var(--muted);
//         }
//         .btn {
//           border-radius: 12px;
//           border: 0;
//           padding: 10px 18px;
//           font-weight: 700;
//           font-size: 14px;
//           cursor: pointer;
//           margin-top: 16px;
//         }
//         .btn.primary {
//           background: #ff3b30;
//           color: #ffffff;
//           box-shadow: 0 14px 35px rgba(248, 113, 113, 0.35);
//         }
//         .btn.primary:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//           box-shadow: none;
//         }
//         .fullBtn {
//           width: 100%;
//         }
//         .alert {
//           margin-top: 12px;
//           border-radius: 12px;
//           padding: 10px 12px;
//           font-size: 13px;
//         }
//         .alert.danger {
//           background: var(--danger-bg);
//           border: 1px solid var(--danger-border);
//           color: #b91c1c;
//         }
//         .alert.success {
//           background: var(--success-bg);
//           border: 1px solid var(--success-border);
//           color: #166534;
//         }
//         .alert.warn {
//           background: var(--warn-bg);
//           border: 1px solid var(--warn-border);
//           color: #854d0e;
//         }
//         .sidePanel {
//           padding: 18px 18px 16px;
//         }
//         .sidePanel h4 {
//           margin: 0 0 10px;
//           font-size: 14px;
//         }
//         .sideList {
//           list-style: none;
//           padding: 0;
//           margin: 0 0 10px;
//           font-size: 12px;
//           color: var(--muted);
//         }
//         .sideList li {
//           padding-left: 14px;
//           position: relative;
//           margin-bottom: 6px;
//         }
//         .sideList li::before {
//           content: "•";
//           position: absolute;
//           left: 0;
//           color: #22c55e;
//         }
//         .quoteCard {
//           margin-top: 10px;
//           padding-top: 10px;
//           border-top: 1px dashed rgba(148, 163, 184, 0.6);
//           font-size: 13px;
//         }
//         .quoteCard h4 {
//           margin: 0 0 8px;
//           font-size: 13px;
//         }
//         .footnote {
//           margin-top: 10px;
//           font-size: 11px;
//           color: #6b7280;
//         }
//         optgroup {
//           font-weight: 600;
//           color: #4b5563;
//         }
//         @media (max-width: 900px) {
//           .flowGrid {
//             grid-template-columns: minmax(0, 1fr);
//           }
//           .sidePanel {
//             margin-top: 4px;
//           }
//         }
//         @media (max-width: 640px) {
//           .head {
//             flex-direction: column;
//             align-items: flex-start;
//           }
//           .modeToggle {
//             width: 100%;
//             justify-content: space-between;
//           }
//         }
//       `}</style>
//     </>
//   );
// }













































// dashboard/pages/setup/domain.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "../../lib/api";

// ----- TLD LIST (ONLY WORKING ONES) -----
const POPULAR_TLDS = ["com", "info", "org"];
const UAE_TLDS = ["ae"];

// Format prices nicely (e.g. 9.4500000 -> "9.45 AED")
function formatMoney(value, currency = "AED") {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const str = rounded.toFixed(2).replace(/\.00$/, "");
  return `${str} ${currency}`;
}

export default function DomainSetupPage() {
  const router = useRouter();

  // Coming from /choose-plan
  const priceId = router.query.priceId?.toString() || "";
  const billing = (router.query.billing?.toString() || "monthly").toLowerCase();

  // "new" | "transfer" | "dns"
  const [mode, setMode] = useState("new");

  // NEW DOMAIN STATE
  const [name, setName] = useState("");
  const [tld, setTld] = useState("com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [quote, setQuote] = useState(null);

  // TRANSFER STATE
  const [transferDomain, setTransferDomain] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  // DNS ONLY STATE
  const [dnsDomain, setDnsDomain] = useState("");
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState("");
  const [dnsSuccess, setDnsSuccess] = useState("");

  const fullDomain = name ? `${name.trim().toLowerCase()}.${tld}` : "";

  const goToCheckout = () => {
    if (!priceId) {
      router.push("/checkout");
      return;
    }
    router.push(
      `/checkout?priceId=${encodeURIComponent(
        priceId
      )}&billing=${encodeURIComponent(billing)}`
    );
  };

  /* ---------------- NEW DOMAIN: CHECK + QUOTE ---------------- */

  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    setCheckResult(null);
    setQuote(null);

    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter a domain name.");
      return;
    }

    try {
      setLoading(true);

      const checkRes = await api.get(
        `/api/resellerclub/domain/check?name=${encodeURIComponent(
          trimmed
        )}&tlds=${encodeURIComponent(tld)}`
      );

      if (!checkRes.ok) {
        throw new Error(checkRes.error || "Domain check failed");
      }

      const list = checkRes.data;
      const first = Array.isArray(list) ? list[0] : null;

      if (!first) {
        throw new Error("No response from domain check API");
      }

      setCheckResult(first);

      if (first.status !== "available") {
        setQuote(null);
        return;
      }

      const quoteRes = await api.get(
        `/api/resellerclub/domain/quote?name=${encodeURIComponent(
          trimmed
        )}&tld=${encodeURIComponent(tld)}`
      );

      if (!quoteRes.ok) {
        throw new Error(quoteRes.error || "Domain quote failed");
      }

      setQuote(quoteRes.data);
    } catch (err) {
      console.error("Domain setup error:", err);
      setError(err.message || "Something went wrong while checking domain.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TRANSFER ---------------- */

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    const d = transferDomain.trim().toLowerCase();
    const code = authCode.trim();

    if (!d) {
      setTransferError("Please enter your existing domain.");
      return;
    }
    if (!code) {
      setTransferError("Please enter the EPP / Auth code.");
      return;
    }

    try {
      setTransferLoading(true);
      // TODO: real backend call later

      setTransferSuccess(
        "Transfer request submitted. We’ll process it and update you."
      );
      setTimeout(goToCheckout, 800);
    } catch (err) {
      console.error("Transfer error:", err);
      setTransferError(
        err.message || "Something went wrong while submitting transfer."
      );
    } finally {
      setTransferLoading(false);
    }
  };

  /* ---------------- DNS ONLY ---------------- */

  const handleDnsSubmit = async (e) => {
    e.preventDefault();
    setDnsError("");
    setDnsSuccess("");

    const d = dnsDomain.trim().toLowerCase();
    if (!d) {
      setDnsError("Please enter your domain.");
      return;
    }

    try {
      setDnsLoading(true);
      // TODO: real backend call later

      setDnsSuccess(
        "Domain saved. Please update your DNS records to point to ION7."
      );
      setTimeout(goToCheckout, 800);
    } catch (err) {
      console.error("DNS attach error:", err);
      setDnsError(err.message || "Something went wrong while saving domain.");
    } finally {
      setDnsLoading(false);
    }
  };

  /* ---------------- RENDER HELPERS ---------------- */

  const renderStatusAlert = () => {
    if (!checkResult) return null;

    if (checkResult.status === "available") {
      return (
        <div className="alert alert--success">
          <strong>{checkResult.domain}</strong> is available 🎉
        </div>
      );
    }

    if (checkResult.status === "taken") {
      return (
        <div className="alert alert--danger">
          <strong>{checkResult.domain}</strong> is already taken. Please try
          another name.
        </div>
      );
    }

    return (
      <div className="alert alert--warn">
        Status: {checkResult.status} ({checkResult.rawStatus})
      </div>
    );
  };

  const renderQuoteCard = () => {
    if (!quote || checkResult?.status !== "available") return null;

    const { priceAed, includedAed, extraAed, isFreeWithPlan, currency } = quote;
    const displayCurrency = currency || "AED";
    const hasPrice = typeof priceAed === "number" && !Number.isNaN(priceAed);

    const registrarLabel = hasPrice
      ? formatMoney(priceAed, displayCurrency)
      : "";
    const includedLabel =
      typeof includedAed === "number"
        ? formatMoney(includedAed, displayCurrency)
        : "";
    const extraLabel =
      typeof extraAed === "number"
        ? formatMoney(extraAed, displayCurrency)
        : "";

    return (
      <div className="quote">
        <div className="quote__header">Pricing summary</div>
        <div className="quote__row">
          <span className="quote__label">Domain</span>
          <span className="quote__value">{fullDomain}</span>
        </div>

        {hasPrice ? (
          <>
            <div className="quote__row">
              <span className="quote__label">Registrar price</span>
              <span className="quote__value">
                {registrarLabel}
                <span className="quote__note"> / year</span>
              </span>
            </div>
            {includedLabel && (
              <div className="quote__row">
                <span className="quote__label">Included in plan</span>
                <span className="quote__value">{includedLabel}</span>
              </div>
            )}
          </>
        ) : (
          <p className="quote__fallback">
            We’ll confirm the exact registrar price in checkout.
          </p>
        )}

        {hasPrice && (
          <>
            {isFreeWithPlan ? (
              <div className="alert alert--success quote__alert">
                This domain is <strong>free</strong> with your current plan
                (within {includedLabel}).
              </div>
            ) : (
              <div className="alert alert--warn quote__alert">
                This domain is above the included amount. Extra to pay:{" "}
                <strong>{extraLabel}</strong>
              </div>
            )}
          </>
        )}

        <p className="quote__fineprint">
          Prices are fetched in real time from our registrar (ResellerClub) in{" "}
          {displayCurrency}. Renewal pricing after the first year may change.
        </p>

        <button
          type="button"
          className="btn btn--primary btn--full"
          onClick={goToCheckout}
        >
          Use this domain &amp; continue
        </button>
      </div>
    );
  };

  const renderNewDomain = () => (
    <div className="layout">
      <div className="panel panel--main">
        <h3 className="panel__title">Register a new domain</h3>
        <p className="panel__subtitle">
          Search for a new domain. We’ll check availability and apply your{" "}
          <strong>up to 50 AED</strong> credit.
        </p>

        <form onSubmit={handleCheck}>
          <label className="field__label">New domain</label>
          <div className="field field--domain">
            <input
              className="field__input"
              type="text"
              placeholder="mybusinessname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <span className="field__dot">.</span>
            <select
              className="field__input field__input--tld"
              value={tld}
              onChange={(e) => setTld(e.target.value)}
              disabled={loading}
            >
              <optgroup label="Most popular">
                {POPULAR_TLDS.map((code) => (
                  <option key={code} value={code}>
                    .{code}
                  </option>
                ))}
              </optgroup>
              <optgroup label="UAE & region">
                {UAE_TLDS.map((code) => (
                  <option key={code} value={code}>
                    .{code}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {fullDomain && (
            <p className="field__hint">
              Full domain: <strong>{fullDomain}</strong>
            </p>
          )}

          {error && <div className="alert alert--danger">{error}</div>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Checking…" : "Check availability"}
          </button>
        </form>

        {renderStatusAlert()}
      </div>

      <aside className="panel panel--side">
        <div className="panel__sideHeader">What’s included</div>
        <ul className="panel__list">
          <li>Free domain credit up to 50 AED</li>
          <li>1 year registration with ResellerClub</li>
          <li>Automatic connection to your ION7 site</li>
        </ul>

        {renderQuoteCard()}
      </aside>
    </div>
  );

  const renderTransfer = () => (
    <div className="layout">
      <div className="panel panel--main">
        <h3 className="panel__title">Transfer your existing domain</h3>
        <p className="panel__subtitle">
          Move your domain into our ResellerClub account so we can manage
          everything for you.
        </p>

        <form onSubmit={handleTransferSubmit}>
          <label className="field__label">Existing domain</label>
          <input
            className="field__input"
            type="text"
            placeholder="mybusiness.com"
            value={transferDomain}
            onChange={(e) => setTransferDomain(e.target.value)}
            disabled={transferLoading}
          />

          <label className="field__label">EPP / Auth code</label>
          <input
            className="field__input"
            type="text"
            placeholder="Auth code from current registrar"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            disabled={transferLoading}
          />

          {transferError && (
            <div className="alert alert--danger">{transferError}</div>
          )}
          {transferSuccess && (
            <div className="alert alert--success">{transferSuccess}</div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={transferLoading}
          >
            {transferLoading ? "Submitting…" : "Submit transfer request"}
          </button>
        </form>
      </div>

      <aside className="panel panel--side">
        <div className="panel__sideHeader">Transfer tips</div>
        <ul className="panel__list">
          <li>Unlock your domain at your current registrar.</li>
          <li>Request the EPP/Auth code from them.</li>
          <li>Make sure WHOIS email is correct to approve transfer.</li>
        </ul>
      </aside>
    </div>
  );

  const renderDns = () => (
    <div className="layout">
      <div className="panel panel--main">
        <h3 className="panel__title">Use existing domain (DNS only)</h3>
        <p className="panel__subtitle">
          Keep your domain with your current provider and just point DNS to
          ION7.
        </p>

        <form onSubmit={handleDnsSubmit}>
          <label className="field__label">Existing domain</label>
          <input
            className="field__input"
            type="text"
            placeholder="mybusiness.com"
            value={dnsDomain}
            onChange={(e) => setDnsDomain(e.target.value)}
            disabled={dnsLoading}
          />

          {dnsError && <div className="alert alert--danger">{dnsError}</div>}
          {dnsSuccess && (
            <div className="alert alert--success">{dnsSuccess}</div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={dnsLoading}
          >
            {dnsLoading ? "Saving…" : "Save domain & continue"}
          </button>
        </form>
      </div>

      <aside className="panel panel--side">
        <div className="panel__sideHeader">What you’ll need to do</div>
        <ul className="panel__list">
          <li>Update A records / nameservers at your registrar.</li>
          <li>DNS changes can take up to 24 hours to propagate.</li>
          <li>We’ll show you the exact values after this step.</li>
        </ul>
      </aside>
    </div>
  );

  /* ---------------- MAIN RENDER ---------------- */

  return (
    <>
      <Head>
        <title>Domain setup — ION7</title>
      </Head>

      <div className="domainPage">
        <div className="domainPage__inner">
          <header className="pageHeader">
            <div>
              <h1 className="pageHeader__title">Connect your domain</h1>
              <p className="pageHeader__subtitle">
                Choose how you want to use a domain with your ION7 website.
              </p>
            </div>
            <div className="pageHeader__step">Step 2 of 3</div>
          </header>

          <div className="card">
            <div className="tabs">
              <button
                type="button"
                className={`tabs__item ${mode === "new" ? "tabs__item--active" : ""}`}
                onClick={() => setMode("new")}
              >
                New domain
              </button>
              <button
                type="button"
                className={`tabs__item ${
                  mode === "transfer" ? "tabs__item--active" : ""
                }`}
                onClick={() => setMode("transfer")}
              >
                Transfer domain
              </button>
              <button
                type="button"
                className={`tabs__item ${mode === "dns" ? "tabs__item--active" : ""}`}
                onClick={() => setMode("dns")}
              >
                Use existing (DNS)
              </button>
            </div>

            <div className="card__body">
              {mode === "new" && renderNewDomain()}
              {mode === "transfer" && renderTransfer()}
              {mode === "dns" && renderDns()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .domainPage {
          min-height: 100vh;
          background-color: #f5f7fb;
          padding: 32px 16px;
        }

        .domainPage__inner {
          max-width: 1000px;
          margin: 0 auto;
        }

        .pageHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .pageHeader__title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: #111827;
        }

        .pageHeader__subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .pageHeader__step {
          padding: 6px 10px;
          border-radius: 999px;
          background: #e5e7eb;
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }

        .card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .card__body {
          padding: 20px 20px 22px;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .tabs__item {
          flex: 1;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          position: relative;
        }

        .tabs__item--active {
          color: #111827;
          background: #ffffff;
        }

        .tabs__item--active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: #2563eb;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr);
          gap: 20px;
          align-items: flex-start;
        }

        .panel {
          border-radius: 10px;
        }

        .panel--main {
          padding: 2px 2px 2px 0;
        }

        .panel--side {
          padding: 12px 14px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .panel__title {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .panel__subtitle {
          margin: 0 0 14px;
          font-size: 13px;
          color: #6b7280;
        }

        .panel__sideHeader {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #111827;
        }

        .panel__list {
          list-style: none;
          margin: 0 0 12px;
          padding: 0;
          font-size: 13px;
          color: #4b5563;
        }

        .panel__list li {
          padding-left: 16px;
          position: relative;
          margin-bottom: 6px;
        }

        .panel__list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #10b981;
        }

        .field {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field--domain {
          grid-template-columns: minmax(0, 1fr) auto auto;
        }

        .field__label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #4b5563;
          margin: 10px 0 6px;
        }

        .field__input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          padding: 9px 10px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
        }

        .field__input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb1a;
        }

        .field__input--tld {
          max-width: 130px;
        }

        .field__dot {
          font-size: 18px;
          color: #4b5563;
        }

        .field__hint {
          margin: 6px 0 0;
          font-size: 12px;
          color: #6b7280;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: none;
          padding: 9px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 14px;
        }

        .btn--primary {
          background: #2563eb;
          color: #ffffff;
        }

        .btn--primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn--full {
          width: 100%;
        }

        .alert {
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 13px;
        }

        .alert--danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .alert--success {
          background: #ecfdf3;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .alert--warn {
          background: #fefce8;
          color: #854d0e;
          border: 1px solid #facc15;
        }

        .quote {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .quote__header {
          font-weight: 600;
          margin-bottom: 8px;
          color: #111827;
        }

        .quote__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }

        .quote__label {
          color: #6b7280;
        }

        .quote__value {
          font-weight: 600;
          color: #111827;
        }

        .quote__note {
          font-weight: 400;
          font-size: 12px;
          color: #6b7280;
          margin-left: 4px;
        }

        .quote__fallback {
          margin: 4px 0 8px;
          color: #6b7280;
        }

        .quote__alert {
          margin-top: 8px;
        }

        .quote__fineprint {
          margin-top: 8px;
          font-size: 11px;
          color: #9ca3af;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 640px) {
          .pageHeader {
            flex-direction: column;
            align-items: flex-start;
          }
          .pageHeader__step {
            align-self: flex-start;
          }
        }
      `}</style>
    </>
  );
}
