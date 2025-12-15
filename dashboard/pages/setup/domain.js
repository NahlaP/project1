

// // current one


// // dashboard/pages/setup/domain.js
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { useMemo, useState } from "react";
// import NavbarTop from "../../layouts/navbars/NavbarTop";
// import { api } from "../../lib/api";

// /* ---------------- helpers ---------------- */

// // ✅ keep same FX as checkout UI
// const FX_USD_TO_AED = 3.6725;

// // Format money nicely (6.99 -> "6.99 USD")
// function formatMoney(value, currency = "USD") {
//   if (typeof value !== "number" || Number.isNaN(value)) return "—";
//   const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
//   return `${rounded.toFixed(2).replace(/\.00$/, "")} ${currency}`;
// }

// function usdToAed(usd) {
//   if (typeof usd !== "number" || Number.isNaN(usd)) return null;
//   return Math.round((usd * FX_USD_TO_AED + Number.EPSILON) * 100) / 100;
// }

// function normalizeTld(x) {
//   return String(x || "")
//     .trim()
//     .toLowerCase()
//     .replace(/^\./, "");
// }

// function normalizeOpResult(item) {
//   const domain = item?.domain || "";
//   const status = String(item?.status || "").toLowerCase();

//   const available = status === "free" || status === "available";
//   const taken = status === "active" || status === "taken";

//   const productPrice = item?.price?.product?.price;
//   const productCurrency = item?.price?.product?.currency;

//   const resellerPrice = item?.price?.reseller?.price;
//   const resellerCurrency = item?.price?.reseller?.currency;

//   return {
//     raw: item,
//     domain,
//     status,
//     available,
//     taken,
//     reason: item?.reason || "",
//     // Prefer reseller as cost (what you pay)
//     cost: typeof resellerPrice === "number" ? resellerPrice : null,
//     costCurrency: resellerCurrency || null,
//     // Fallback: product price
//     productPrice: typeof productPrice === "number" ? productPrice : null,
//     productCurrency: productCurrency || null,
//   };
// }

// /* ---------------- component ---------------- */

// export default function DomainSetupPage() {
//   const router = useRouter();

//   // Coming from /choose-plan
//   const priceId = router.query.priceId?.toString() || "";
//   const billing = (router.query.billing?.toString() || "monthly").toLowerCase();

//   // "new" | "transfer" | "dns"
//   const [mode, setMode] = useState("new");

//   /* -------- TLDs (STATIC: simple dropdown only) -------- */
//   const POPULAR_TLDS = ["com", "net", "info", "org"];
//   const UAE_TLDS = ["ae"];
//   const SIMPLE_TLDS = Array.from(new Set([...POPULAR_TLDS, ...UAE_TLDS])).map(normalizeTld);

//   // NEW DOMAIN
//   const [name, setName] = useState("");
//   const [tld, setTld] = useState("com");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [opResults, setOpResults] = useState(null);
//   const [selected, setSelected] = useState(null);

//   // TRANSFER
//   const [transferDomain, setTransferDomain] = useState("");
//   const [authCode, setAuthCode] = useState("");
//   const [transferLoading, setTransferLoading] = useState(false);
//   const [transferError, setTransferError] = useState("");
//   const [transferSuccess, setTransferSuccess] = useState("");
//   const [transferQuote, setTransferQuote] = useState(null); // display only

//   // DNS ONLY
//   const [dnsDomain, setDnsDomain] = useState("");
//   const [dnsLoading, setDnsLoading] = useState(false);
//   const [dnsError, setDnsError] = useState("");
//   const [dnsSuccess, setDnsSuccess] = useState("");

//   const trimmedName = useMemo(() => name.trim().toLowerCase(), [name]);

//   // Search list: selected + popular + uae
//   const searchTlds = useMemo(() => {
//     const base = Array.from(new Set([normalizeTld(tld), ...SIMPLE_TLDS])).filter(Boolean);
//     return base;
//   }, [tld]);

//   /* ---------------- go to checkout (MATCH NEW FLOW) ---------------- */
//   // ✅ IMPORTANT: Do NOT pass domainPrice/domainCurrency in URL anymore.
//   // Checkout will always fetch latest domain price from backend.
//   const goToCheckout = (opts = {}) => {
//     const { includeDomain = false, domainOverride, typeOverride } = opts;

//     if (!priceId) {
//       router.push("/checkout");
//       return;
//     }

//     const params = new URLSearchParams({ priceId, billing });

//     let domainToSend = "";
//     let domainType = typeOverride || mode;

//     if (includeDomain && domainOverride) {
//       domainToSend = domainOverride;
//     } else if (includeDomain && selected?.domain && selected?.available) {
//       domainToSend = selected.domain;
//       domainType = "new";
//     }

//     if (includeDomain && domainToSend) {
//       params.set("domain", domainToSend);
//       params.set("domainType", domainType);
//     }

//     router.push(`/checkout?${params.toString()}`);
//   };

//   /* ---------------- NEW DOMAIN: search (availability + price) ---------------- */

//   const handleCheck = async (e) => {
//     e.preventDefault();
//     setError("");
//     setOpResults(null);
//     setSelected(null);

//     if (!trimmedName) {
//       setError("Please enter a domain name.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ Backend endpoint (token stays in backend)
//       const url =
//         `/api/openprovider/domains/search?name=${encodeURIComponent(trimmedName)}` +
//         `&tlds=${encodeURIComponent(searchTlds.join(","))}`;

//       const res = await api.get(url);

//       const raw = res?.data || res;
//       const results =
//         raw?.data?.results ||
//         raw?.results ||
//         raw?.data?.data?.results ||
//         raw?.data?.data?.data?.results ||
//         [];

//       if (!Array.isArray(results) || results.length === 0) {
//         throw new Error("No response from Openprovider domain search.");
//       }

//       const normalized = results.map(normalizeOpResult);

//       // sort: available first, then cheapest (same currency), then name
//       normalized.sort((a, b) => {
//         if (a.available !== b.available) return a.available ? -1 : 1;

//         const aP = a.cost ?? a.productPrice;
//         const bP = b.cost ?? b.productPrice;
//         const aC = a.costCurrency ?? a.productCurrency;
//         const bC = b.costCurrency ?? b.productCurrency;

//         if (aP != null && bP != null && aC && bC && aC === bC) {
//           if (aP !== bP) return aP - bP;
//         }

//         return String(a.domain).localeCompare(String(b.domain));
//       });

//       setOpResults(normalized);
//       setSelected(normalized.find((x) => x.available) || null);
//     } catch (err) {
//       console.error("Openprovider search error:", err);
//       setError(err?.message || "Something went wrong while checking domain.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderNewDomainStatus = () => {
//     if (!opResults) return null;
//     const availableCount = opResults.filter((x) => x.available).length;

//     if (availableCount > 0) {
//       return (
//         <div className="alert alert-success mt-3 py-2 px-3">
//           We found <strong>{availableCount}</strong> available options. Select one to continue.
//         </div>
//       );
//     }

//     return (
//       <div className="alert alert-danger mt-3 py-2 px-3">
//         No available options found for <strong>{trimmedName}</strong>. Try another name.
//       </div>
//     );
//   };

//   const renderOptionsTable = () => {
//     if (!opResults || opResults.length === 0) return null;

//     return (
//       <div className="mt-3">
//         <div className="border rounded-3 p-3 bg-white">
//           <div className="fw-semibold mb-2">Options</div>

//           <div className="table-responsive">
//             <table className="table align-middle mb-0">
//               <thead>
//                 <tr>
//                   <th>Domain</th>
//                   <th>Status</th>
//                   <th className="text-end">Price</th>
//                   <th className="text-end"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {opResults.map((x) => {
//                   const isSelected = selected?.domain === x.domain;
//                   const price = x.cost ?? x.productPrice;
//                   const cur = x.costCurrency ?? x.productCurrency;

//                   return (
//                     <tr key={x.domain}>
//                       <td className="fw-semibold">{x.domain}</td>
//                       <td>
//                         {x.available ? (
//                           <span className="badge bg-success">Available</span>
//                         ) : x.taken ? (
//                           <span className="badge bg-danger">Taken</span>
//                         ) : (
//                           <span className="badge bg-secondary">{x.status || "unknown"}</span>
//                         )}
//                         {x.reason ? <div className="text-muted small mt-1">{x.reason}</div> : null}
//                       </td>
//                       <td className="text-end">
//                         {price != null && cur ? formatMoney(price, cur) : "—"}
//                       </td>
//                       <td className="text-end">
//                         <button
//                           type="button"
//                           className={`btn btn-sm ${
//                             isSelected ? "btn-primary" : "btn-outline-primary"
//                           } rounded-pill`}
//                           disabled={!x.available}
//                           onClick={() => setSelected(x)}
//                         >
//                           {isSelected ? "Selected" : "Select"}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-3">
//             <button
//               type="button"
//               className="btn btn-primary w-100 rounded-pill"
//               disabled={!selected || !selected.available}
//               onClick={() => goToCheckout({ includeDomain: true, typeOverride: "new" })}
//             >
//               Use selected domain &amp; continue
//             </button>

//             <div className="text-muted small mt-2">
//               Prices are fetched in real time from Openprovider here. Checkout will re-check price on server.
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderTldSelect = () => (
//     <select
//       className="form-select bg-white text-dark"
//       value={tld}
//       onChange={(e) => setTld(e.target.value)}
//       disabled={loading}
//       style={{ maxWidth: 170 }}
//     >
//       {SIMPLE_TLDS.map((code) => (
//         <option key={code} value={code}>
//           .{code}
//         </option>
//       ))}
//     </select>
//   );

//   const renderNewDomain = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Register a new domain</h5>
//           <p className="mb-0">
//             Search for a new domain. We’ll check availability and show pricing via{" "}
//             <strong>Openprovider</strong>.
//           </p>
//         </div>

//         <form onSubmit={handleCheck}>
//           <div className="mb-2">
//             <label className="form-label">New domain</label>
//             <div className="d-flex align-items-center gap-2">
//               <input
//                 className="form-control bg-white text-dark"
//                 type="text"
//                 placeholder="mybusinessname"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 disabled={loading}
//               />
//               <span className="fs-5">.</span>
//               {renderTldSelect()}
//             </div>
//           </div>

//           {error ? <div className="alert alert-danger py-2 px-3 mb-2">{error}</div> : null}

//           <button type="submit" className="btn btn-primary rounded-pill mt-1" disabled={loading}>
//             {loading ? "Checking…" : "Check availability"}
//           </button>

//           <div className="text-muted small mt-2">Search list: {searchTlds.join(", ")}</div>
//         </form>

//         {renderNewDomainStatus()}
//         {renderOptionsTable()}
//       </div>

//       <div className="col-lg-5">
//         <div className="border rounded-3 p-3 h-100 bg-white">
//           <div className="fw-semibold mb-2">What’s included</div>
//           <ul className="mb-0 ps-3">
//             <li>Real-time availability + pricing</li>
//             <li>Token stays in backend (never exposed)</li>
//             <li>Automatic connection to your ION7 site</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );

//   /* ---------------- TRANSFER ---------------- */

//   const handleTransferSubmit = async (e) => {
//     e.preventDefault();
//     setTransferError("");
//     setTransferSuccess("");
//     setTransferQuote(null);

//     const d = transferDomain.trim().toLowerCase();
//     const code = authCode.trim();

//     if (!d) return setTransferError("Please enter your existing domain.");
//     if (!code) return setTransferError("Please enter the EPP / Auth code.");

//     try {
//       setTransferLoading(true);

//       // 1) store transfer request (DB)
//       const res = await api.post("/api/domain/transfer", { domain: d, eppCode: code });
//       setTransferSuccess(res?.message || res?.msg || "Transfer request submitted.");

//       // 2) get real transfer price from backend (same source checkout uses)
//       const qRes = await api.get(
//         `/api/openprovider/domains/transfer-price?domain=${encodeURIComponent(d)}`
//       );

//       const qRaw = qRes?.data || qRes;
//       const root = qRaw?.data ?? qRaw;

//       const price =
//         root?.data?.price?.reseller?.price ??
//         root?.price?.reseller?.price ??
//         root?.price ??
//         null;

//       const currency =
//         root?.data?.price?.reseller?.currency ??
//         root?.price?.reseller?.currency ??
//         root?.currency ??
//         null;

//       const cur = String(currency || "").toUpperCase();
//       const usd = typeof price === "number" ? price : null;

//       const aed = cur === "USD" && usd != null ? usdToAed(usd) : null;

//       setTransferQuote({
//         price: usd,
//         currency: cur || null,
//         fx: cur === "USD" ? FX_USD_TO_AED : null,
//         aed,
//         isPremium: !!(root?.data?.is_premium ?? root?.is_premium),
//         isPromotion: !!(root?.data?.is_promotion ?? root?.is_promotion),
//       });
//     } catch (err) {
//       setTransferError(err?.message || "Transfer failed");
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   const renderTransfer = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Transfer your existing domain</h5>
//           <p className="mb-0">We’ll estimate transfer cost and proceed to checkout.</p>
//         </div>

//         <form onSubmit={handleTransferSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Existing domain</label>
//             <input
//               className="form-control bg-white text-dark"
//               type="text"
//               placeholder="mybusiness.com"
//               value={transferDomain}
//               onChange={(e) => setTransferDomain(e.target.value)}
//               disabled={transferLoading}
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label">EPP / Auth code</label>
//             <input
//               className="form-control bg-white text-dark"
//               type="text"
//               placeholder="Auth code from current registrar"
//               value={authCode}
//               onChange={(e) => setAuthCode(e.target.value)}
//               disabled={transferLoading}
//             />
//           </div>

//           {transferError ? (
//             <div className="alert alert-danger py-2 px-3 mb-2">{transferError}</div>
//           ) : null}
//           {transferSuccess ? (
//             <div className="alert alert-success py-2 px-3 mb-2">{transferSuccess}</div>
//           ) : null}

//           {transferQuote?.price != null && transferQuote?.currency ? (
//             <div className="alert alert-info py-2 px-3 mb-3">
//               Estimated transfer cost:{" "}
//               <strong>{formatMoney(transferQuote.price, transferQuote.currency)}</strong>

//               {transferQuote.fx && transferQuote.aed != null ? (
//                 <div className="text-muted small mt-1">
//                   Estimated charge today: <strong>{formatMoney(transferQuote.aed, "AED")}</strong>{" "}
//                   <span className="ms-1">(FX {transferQuote.fx})</span>
//                 </div>
//               ) : (
//                 <div className="text-muted small mt-1">
//                   Checkout will re-check price on server before payment.
//                 </div>
//               )}

//               {transferQuote.isPremium ? (
//                 <span className="ms-2 badge bg-warning text-dark">Premium</span>
//               ) : null}
//               {transferQuote.isPromotion ? (
//                 <span className="ms-2 badge bg-success">Promo</span>
//               ) : null}
//             </div>
//           ) : null}

//           <div className="d-flex gap-3">
//             <button
//               type="submit"
//               className="btn btn-primary rounded-pill"
//               disabled={transferLoading}
//             >
//               {transferLoading ? "Submitting…" : "Submit transfer request"}
//             </button>

//             <button
//               type="button"
//               className="btn btn-outline-secondary rounded-pill"
//               disabled={!transferDomain.trim() || !authCode.trim()}
//               onClick={() =>
//                 goToCheckout({
//                   includeDomain: true,
//                   typeOverride: "transfer",
//                   domainOverride: transferDomain.trim().toLowerCase(),
//                 })
//               }
//             >
//               Continue to checkout
//             </button>
//           </div>
//         </form>
//       </div>

//       <div className="col-lg-5">
//         <div className="border rounded-3 p-3 h-100 bg-white">
//           <div className="fw-semibold mb-2">Transfer tips</div>
//           <ul className="mb-0 ps-3">
//             <li>Unlock your domain at your current registrar.</li>
//             <li>Request the EPP/Auth code from them.</li>
//             <li>Confirm WHOIS email access to approve transfer.</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );

//   /* ---------------- DNS ONLY ---------------- */

//   const handleDnsSubmit = async (e) => {
//     e.preventDefault();
//     setDnsError("");
//     setDnsSuccess("");

//     const d = dnsDomain.trim().toLowerCase();
//     if (!d) return setDnsError("Please enter your domain.");

//     try {
//       setDnsLoading(true);
//       const res = await api.post("/api/domain/dns", { domain: d });
//       setDnsSuccess(res?.message || res?.msg || "Domain saved. Update DNS to point to ION7.");

//       setTimeout(() => {
//         goToCheckout({ includeDomain: true, typeOverride: "dns", domainOverride: d });
//       }, 500);
//     } catch (err) {
//       setDnsError(err?.message || "DNS save failed");
//     } finally {
//       setDnsLoading(false);
//     }
//   };

//   const renderDns = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Use existing domain (DNS only)</h5>
//           <p className="mb-0">Keep your domain elsewhere and just point DNS to ION7.</p>
//         </div>

//         <form onSubmit={handleDnsSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Existing domain</label>
//             <input
//               className="form-control bg-white text-dark"
//               type="text"
//               placeholder="mybusiness.com"
//               value={dnsDomain}
//               onChange={(e) => setDnsDomain(e.target.value)}
//               disabled={dnsLoading}
//             />
//           </div>

//           {dnsError ? <div className="alert alert-danger py-2 px-3 mb-2">{dnsError}</div> : null}
//           {dnsSuccess ? (
//             <div className="alert alert-success py-2 px-3 mb-2">{dnsSuccess}</div>
//           ) : null}

//           <button type="submit" className="btn btn-primary rounded-pill" disabled={dnsLoading}>
//             {dnsLoading ? "Saving…" : "Save domain & continue"}
//           </button>
//         </form>
//       </div>

//       <div className="col-lg-5">
//         <div className="border rounded-3 p-3 h-100 bg-white">
//           <div className="fw-semibold mb-2">What you’ll need to do</div>
//           <ul className="mb-0 ps-3">
//             <li>Update A records / nameservers at your registrar.</li>
//             <li>DNS changes can take up to 24 hours to propagate.</li>
//             <li>We’ll show you the exact values after this step.</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );

//   /* ---------------- main render ---------------- */

//   return (
//     <>
//       <Head>
//         <title>Domain Setup - ION7</title>
//       </Head>

//       <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
//         <NavbarTop isMobile={false} />

//         <main className="flex-grow-1 px-4 py-4">
//           <div className="domain-setup">
//             <div className="domain-head card shadow-sm border-0 rounded-4 mb-3 px-4 py-3">
//               <div className="d-flex align-items-center justify-content-between gap-3">
//                 <div className="d-flex align-items-center gap-3">
//                   <div className="domain-logo">ION</div>
//                   <div>
//                     <h2 className="domain-title mb-1">Domain setup</h2>
//                     <p className="domain-subtitle mb-0">
//                       Connect a domain to your ION7 site. Register a new domain, transfer an existing
//                       one, or keep your domain elsewhere and point DNS.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="domain-step">Step 2 of 3</div>
//               </div>
//             </div>

//             <div className="card border-0 shadow-sm rounded-4">
//               <div className="card-header border-0 bg-white px-4 pt-3 pb-0">
//                 <ul className="nav nav-pills nav-justified">
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${mode === "new" ? "active" : ""}`}
//                       onClick={() => setMode("new")}
//                     >
//                       New domain
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${mode === "transfer" ? "active" : ""}`}
//                       onClick={() => setMode("transfer")}
//                     >
//                       Transfer domain
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${mode === "dns" ? "active" : ""}`}
//                       onClick={() => setMode("dns")}
//                     >
//                       Use existing (DNS)
//                     </button>
//                   </li>
//                 </ul>
//               </div>

//               <div className="card-body px-4 pb-4 pt-3 bg-white">
//                 {mode === "new" && renderNewDomain()}
//                 {mode === "transfer" && renderTransfer()}
//                 {mode === "dns" && renderDns()}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       <style jsx>{`
//         .domain-setup {
//           font-size: 15px;
//         }
//         .domain-head {
//           background: #ffffff;
//         }
//         .domain-logo {
//           width: 52px;
//           height: 52px;
//           border-radius: 18px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 800;
//           font-size: 20px;
//           color: #022c22;
//           background: linear-gradient(135deg, #a7f3d0, #22c55e);
//           box-shadow: 0 10px 30px rgba(22, 163, 74, 0.35);
//         }
//         .domain-title {
//           font-size: 24px;
//           font-weight: 600;
//           color: #111827;
//         }
//         .domain-subtitle {
//           font-size: 14px;
//           color: #4b5563;
//           max-width: 640px;
//         }
//         .domain-step {
//           padding: 7px 14px;
//           border-radius: 999px;
//           background: #eef2ff;
//           color: #4f46e5;
//           font-size: 13px;
//           font-weight: 600;
//           white-space: nowrap;
//         }
//         .nav-pills .nav-link {
//           border-radius: 999px;
//           color: #111827;
//           font-weight: 500;
//           font-size: 14px;
//         }
//         .nav-pills .nav-link.active {
//           background-color: #7c3aed;
//           color: #ffffff;
//         }
//         .btn-primary {
//           background-color: #7c3aed;
//           border-color: #7c3aed;
//           font-weight: 600;
//         }
//         .btn-primary:hover,
//         .btn-primary:focus {
//           background-color: #6d28d9;
//           border-color: #6d28d9;
//         }
//         .form-label {
//           font-weight: 500;
//           font-size: 14px;
//         }
//         .form-control,
//         .form-select {
//           font-size: 14px;
//           padding: 9px 12px;
//         }
//       `}</style>
//     </>
//   );
// }















































// dashboard/pages/setup/domain.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import NavbarTop from "../../layouts/navbars/NavbarTop";
import { api } from "../../lib/api";

/* ---------------- helpers ---------------- */

// ✅ keep same FX as checkout UI
const FX_USD_TO_AED = 3.6725;

function formatMoney(value, currency = "USD") {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return `${rounded.toFixed(2).replace(/\.00$/, "")} ${currency}`;
}

function usdToAed(usd) {
  if (typeof usd !== "number" || Number.isNaN(usd)) return null;
  return Math.round((usd * FX_USD_TO_AED + Number.EPSILON) * 100) / 100;
}

function normalizeTld(x) {
  return String(x || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "");
}

function normalizeOpResult(item) {
  const domain = item?.domain || "";
  const status = String(item?.status || "").toLowerCase();

  const available = status === "free" || status === "available";
  const taken = status === "active" || status === "taken";

  const productPrice = item?.price?.product?.price;
  const productCurrency = item?.price?.product?.currency;

  const resellerPrice = item?.price?.reseller?.price;
  const resellerCurrency = item?.price?.reseller?.currency;

  return {
    raw: item,
    domain,
    status,
    available,
    taken,
    reason: item?.reason || "",
    cost: typeof resellerPrice === "number" ? resellerPrice : null,
    costCurrency: resellerCurrency || null,
    productPrice: typeof productPrice === "number" ? productPrice : null,
    productCurrency: productCurrency || null,
  };
}

export default function DomainSetupPage() {
  const router = useRouter();

  const priceId = router.query.priceId?.toString() || "";
  const billing = (router.query.billing?.toString() || "monthly").toLowerCase();

  const [mode, setMode] = useState("new");

  const POPULAR_TLDS = ["com", "net", "info", "org"];
  const UAE_TLDS = ["ae"];
  const SIMPLE_TLDS = Array.from(new Set([...POPULAR_TLDS, ...UAE_TLDS])).map(
    normalizeTld
  );

  // NEW DOMAIN
  const [name, setName] = useState("");
  const [tld, setTld] = useState("com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [opResults, setOpResults] = useState(null);
  const [selected, setSelected] = useState(null);

  // TRANSFER
  const [transferDomain, setTransferDomain] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferQuote, setTransferQuote] = useState(null);

  // DNS ONLY
  const [dnsDomain, setDnsDomain] = useState("");
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState("");
  const [dnsSuccess, setDnsSuccess] = useState("");

  const trimmedName = useMemo(() => name.trim().toLowerCase(), [name]);

  const searchTlds = useMemo(() => {
    const base = Array.from(new Set([normalizeTld(tld), ...SIMPLE_TLDS])).filter(
      Boolean
    );
    return base;
  }, [tld]);

  /* ---------------- go to checkout ---------------- */
  // ✅ We pass only domain + domainType + (OPTIONAL authCode for transfer)
  const goToCheckout = (opts = {}) => {
    const {
      includeDomain = false,
      domainOverride,
      typeOverride,
      authCodeOverride,
    } = opts;

    if (!priceId) {
      router.push("/checkout");
      return;
    }

    const params = new URLSearchParams({ priceId, billing });

    let domainToSend = "";
    let domainType = typeOverride || mode;

    if (includeDomain && domainOverride) {
      domainToSend = domainOverride;
    } else if (includeDomain && selected?.domain && selected?.available) {
      domainToSend = selected.domain;
      domainType = "new";
    }

    if (includeDomain && domainToSend) {
      params.set("domain", domainToSend);
      params.set("domainType", domainType);
    }

    // ✅ OPTIONAL: only for transfer we pass authCode (backend can also read from DB)
    if (domainType === "transfer" && authCodeOverride) {
      params.set("authCode", authCodeOverride);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  /* ---------------- NEW DOMAIN: search ---------------- */
  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    setOpResults(null);
    setSelected(null);

    if (!trimmedName) {
      setError("Please enter a domain name.");
      return;
    }

    try {
      setLoading(true);

      const url =
        `/api/openprovider/domains/search?name=${encodeURIComponent(
          trimmedName
        )}` + `&tlds=${encodeURIComponent(searchTlds.join(","))}`;

      const res = await api.get(url);

      const raw = res?.data || res;
      const results =
        raw?.data?.results ||
        raw?.results ||
        raw?.data?.data?.results ||
        raw?.data?.data?.data?.results ||
        [];

      if (!Array.isArray(results) || results.length === 0) {
        throw new Error("No response from Openprovider domain search.");
      }

      const normalized = results.map(normalizeOpResult);

      normalized.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;

        const aP = a.cost ?? a.productPrice;
        const bP = b.cost ?? b.productPrice;
        const aC = a.costCurrency ?? a.productCurrency;
        const bC = b.costCurrency ?? b.productCurrency;

        if (aP != null && bP != null && aC && bC && aC === bC) {
          if (aP !== bP) return aP - bP;
        }

        return String(a.domain).localeCompare(String(b.domain));
      });

      setOpResults(normalized);
      setSelected(normalized.find((x) => x.available) || null);
    } catch (err) {
      console.error("Openprovider search error:", err);
      setError(err?.message || "Something went wrong while checking domain.");
    } finally {
      setLoading(false);
    }
  };

  const renderNewDomainStatus = () => {
    if (!opResults) return null;
    const availableCount = opResults.filter((x) => x.available).length;

    if (availableCount > 0) {
      return (
        <div className="alert alert-success mt-3 py-2 px-3">
          We found <strong>{availableCount}</strong> available options. Select one
          to continue.
        </div>
      );
    }

    return (
      <div className="alert alert-danger mt-3 py-2 px-3">
        No available options found for <strong>{trimmedName}</strong>. Try
        another name.
      </div>
    );
  };

  const renderOptionsTable = () => {
    if (!opResults || opResults.length === 0) return null;

    return (
      <div className="mt-3">
        <div className="border rounded-3 p-3 bg-white">
          <div className="fw-semibold mb-2">Options</div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Status</th>
                  <th className="text-end">Price</th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {opResults.map((x) => {
                  const isSelected = selected?.domain === x.domain;
                  const price = x.cost ?? x.productPrice;
                  const cur = x.costCurrency ?? x.productCurrency;

                  return (
                    <tr key={x.domain}>
                      <td className="fw-semibold">{x.domain}</td>
                      <td>
                        {x.available ? (
                          <span className="badge bg-success">Available</span>
                        ) : x.taken ? (
                          <span className="badge bg-danger">Taken</span>
                        ) : (
                          <span className="badge bg-secondary">
                            {x.status || "unknown"}
                          </span>
                        )}
                        {x.reason ? (
                          <div className="text-muted small mt-1">{x.reason}</div>
                        ) : null}
                      </td>
                      <td className="text-end">
                        {price != null && cur ? formatMoney(price, cur) : "—"}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            isSelected ? "btn-primary" : "btn-outline-primary"
                          } rounded-pill`}
                          disabled={!x.available}
                          onClick={() => setSelected(x)}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-primary w-100 rounded-pill"
              disabled={!selected || !selected.available}
              onClick={() =>
                goToCheckout({ includeDomain: true, typeOverride: "new" })
              }
            >
              Use selected domain &amp; continue
            </button>

            <div className="text-muted small mt-2">
              Prices are fetched in real time from Openprovider here. Checkout will
              re-check price on server.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTldSelect = () => (
    <select
      className="form-select bg-white text-dark"
      value={tld}
      onChange={(e) => setTld(e.target.value)}
      disabled={loading}
      style={{ maxWidth: 170 }}
    >
      {SIMPLE_TLDS.map((code) => (
        <option key={code} value={code}>
          .{code}
        </option>
      ))}
    </select>
  );

  const renderNewDomain = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Register a new domain</h5>
          <p className="mb-0">
            Search for a new domain. We’ll check availability and show pricing via{" "}
            <strong>Openprovider</strong>.
          </p>
        </div>

        <form onSubmit={handleCheck}>
          <div className="mb-2">
            <label className="form-label">New domain</label>
            <div className="d-flex align-items-center gap-2">
              <input
                className="form-control bg-white text-dark"
                type="text"
                placeholder="mybusinessname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <span className="fs-5">.</span>
              {renderTldSelect()}
            </div>
          </div>

          {error ? (
            <div className="alert alert-danger py-2 px-3 mb-2">{error}</div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary rounded-pill mt-1"
            disabled={loading}
          >
            {loading ? "Checking…" : "Check availability"}
          </button>

          <div className="text-muted small mt-2">
            Search list: {searchTlds.join(", ")}
          </div>
        </form>

        {renderNewDomainStatus()}
        {renderOptionsTable()}
      </div>

      <div className="col-lg-5">
        <div className="border rounded-3 p-3 h-100 bg-white">
          <div className="fw-semibold mb-2">What’s included</div>
          <ul className="mb-0 ps-3">
            <li>Real-time availability + pricing</li>
            <li>Token stays in backend (never exposed)</li>
            <li>Automatic connection to your ION7 site</li>
          </ul>
        </div>
      </div>
    </div>
  );

  /* ---------------- TRANSFER ---------------- */
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");
    setTransferQuote(null);

    const d = transferDomain.trim().toLowerCase();
    const code = authCode.trim();

    if (!d) return setTransferError("Please enter your existing domain.");
    if (!code) return setTransferError("Please enter the EPP / Auth code.");

    try {
      setTransferLoading(true);

      // ✅ 1) store transfer domain + authCode in backend
      const res = await api.saveDomainTransfer(d, code);
      setTransferSuccess(res?.message || res?.msg || "Transfer request saved.");

      // ✅ 2) show transfer price (display only)
      const qRes = await api.get(
        `/api/openprovider/domains/transfer-price?domain=${encodeURIComponent(d)}`
      );

      const qRaw = qRes?.data || qRes;
      const root = qRaw?.data ?? qRaw;

      const price =
        root?.data?.price?.reseller?.price ??
        root?.price?.reseller?.price ??
        root?.price ??
        null;

      const currency =
        root?.data?.price?.reseller?.currency ??
        root?.price?.reseller?.currency ??
        root?.currency ??
        null;

      const cur = String(currency || "").toUpperCase();
      const usd = typeof price === "number" ? price : null;
      const aed = cur === "USD" && usd != null ? usdToAed(usd) : null;

      setTransferQuote({
        price: usd,
        currency: cur || null,
        fx: cur === "USD" ? FX_USD_TO_AED : null,
        aed,
        isPremium: !!(root?.data?.is_premium ?? root?.is_premium),
        isPromotion: !!(root?.data?.is_promotion ?? root?.is_promotion),
      });
    } catch (err) {
      setTransferError(err?.message || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const renderTransfer = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Transfer your existing domain</h5>
          <p className="mb-0">We’ll estimate transfer cost and proceed to checkout.</p>
        </div>

        <form onSubmit={handleTransferSubmit}>
          <div className="mb-3">
            <label className="form-label">Existing domain</label>
            <input
              className="form-control bg-white text-dark"
              type="text"
              placeholder="mybusiness.com"
              value={transferDomain}
              onChange={(e) => setTransferDomain(e.target.value)}
              disabled={transferLoading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">EPP / Auth code</label>
            <input
              className="form-control bg-white text-dark"
              type="text"
              placeholder="Auth code from current registrar"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              disabled={transferLoading}
            />
          </div>

          {transferError ? (
            <div className="alert alert-danger py-2 px-3 mb-2">{transferError}</div>
          ) : null}
          {transferSuccess ? (
            <div className="alert alert-success py-2 px-3 mb-2">{transferSuccess}</div>
          ) : null}

          {transferQuote?.price != null && transferQuote?.currency ? (
            <div className="alert alert-info py-2 px-3 mb-3">
              Estimated transfer cost:{" "}
              <strong>{formatMoney(transferQuote.price, transferQuote.currency)}</strong>

              {transferQuote.fx && transferQuote.aed != null ? (
                <div className="text-muted small mt-1">
                  Estimated charge today:{" "}
                  <strong>{formatMoney(transferQuote.aed, "AED")}</strong>{" "}
                  <span className="ms-1">(FX {transferQuote.fx})</span>
                </div>
              ) : (
                <div className="text-muted small mt-1">
                  Checkout will re-check price on server before payment.
                </div>
              )}

              {transferQuote.isPremium ? (
                <span className="ms-2 badge bg-warning text-dark">Premium</span>
              ) : null}
              {transferQuote.isPromotion ? (
                <span className="ms-2 badge bg-success">Promo</span>
              ) : null}
            </div>
          ) : null}

          <div className="d-flex gap-3">
            <button
              type="submit"
              className="btn btn-primary rounded-pill"
              disabled={transferLoading}
            >
              {transferLoading ? "Submitting…" : "Save transfer request"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill"
              disabled={!transferDomain.trim() || !authCode.trim()}
              onClick={() =>
                goToCheckout({
                  includeDomain: true,
                  typeOverride: "transfer",
                  domainOverride: transferDomain.trim().toLowerCase(),
                  authCodeOverride: authCode.trim(), // ✅ send to checkout so backend definitely gets it
                })
              }
            >
              Continue to checkout
            </button>
          </div>
        </form>
      </div>

      <div className="col-lg-5">
        <div className="border rounded-3 p-3 h-100 bg-white">
          <div className="fw-semibold mb-2">Transfer tips</div>
          <ul className="mb-0 ps-3">
            <li>Unlock your domain at your current registrar.</li>
            <li>Request the EPP/Auth code from them.</li>
            <li>Confirm WHOIS email access to approve transfer.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  /* ---------------- DNS ONLY ---------------- */
  const handleDnsSubmit = async (e) => {
    e.preventDefault();
    setDnsError("");
    setDnsSuccess("");

    const d = dnsDomain.trim().toLowerCase();
    if (!d) return setDnsError("Please enter your domain.");

    try {
      setDnsLoading(true);
      const res = await api.saveDnsOnlyDomain(d);
      setDnsSuccess(
        res?.message || res?.msg || "Domain saved. Update DNS to point to ION7."
      );

      setTimeout(() => {
        goToCheckout({ includeDomain: true, typeOverride: "dns", domainOverride: d });
      }, 300);
    } catch (err) {
      setDnsError(err?.message || "DNS save failed");
    } finally {
      setDnsLoading(false);
    }
  };

  const renderDns = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Use existing domain (DNS only)</h5>
          <p className="mb-0">Keep your domain elsewhere and just point DNS to ION7.</p>
        </div>

        <form onSubmit={handleDnsSubmit}>
          <div className="mb-3">
            <label className="form-label">Existing domain</label>
            <input
              className="form-control bg-white text-dark"
              type="text"
              placeholder="mybusiness.com"
              value={dnsDomain}
              onChange={(e) => setDnsDomain(e.target.value)}
              disabled={dnsLoading}
            />
          </div>

          {dnsError ? (
            <div className="alert alert-danger py-2 px-3 mb-2">{dnsError}</div>
          ) : null}
          {dnsSuccess ? (
            <div className="alert alert-success py-2 px-3 mb-2">{dnsSuccess}</div>
          ) : null}

          <button type="submit" className="btn btn-primary rounded-pill" disabled={dnsLoading}>
            {dnsLoading ? "Saving…" : "Save domain & continue"}
          </button>
        </form>
      </div>

      <div className="col-lg-5">
        <div className="border rounded-3 p-3 h-100 bg-white">
          <div className="fw-semibold mb-2">What you’ll need to do</div>
          <ul className="mb-0 ps-3">
            <li>Update A records / nameservers at your registrar.</li>
            <li>DNS changes can take up to 24 hours to propagate.</li>
            <li>We’ll show you the exact values after this step.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Domain Setup - ION7</title>
      </Head>

      <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <NavbarTop isMobile={false} />

        <main className="flex-grow-1 px-4 py-4">
          <div className="domain-setup">
            <div className="domain-head card shadow-sm border-0 rounded-4 mb-3 px-4 py-3">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="domain-logo">ION</div>
                  <div>
                    <h2 className="domain-title mb-1">Domain setup</h2>
                    <p className="domain-subtitle mb-0">
                      Connect a domain to your ION7 site. Register a new domain, transfer an existing
                      one, or keep your domain elsewhere and point DNS.
                    </p>
                  </div>
                </div>
                <div className="domain-step">Step 2 of 3</div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header border-0 bg-white px-4 pt-3 pb-0">
                <ul className="nav nav-pills nav-justified">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${mode === "new" ? "active" : ""}`}
                      onClick={() => setMode("new")}
                    >
                      New domain
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${mode === "transfer" ? "active" : ""}`}
                      onClick={() => setMode("transfer")}
                    >
                      Transfer domain
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${mode === "dns" ? "active" : ""}`}
                      onClick={() => setMode("dns")}
                    >
                      Use existing (DNS)
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body px-4 pb-4 pt-3 bg-white">
                {mode === "new" && renderNewDomain()}
                {mode === "transfer" && renderTransfer()}
                {mode === "dns" && renderDns()}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .domain-setup {
          font-size: 15px;
        }
        .domain-head {
          background: #ffffff;
        }
        .domain-logo {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          color: #022c22;
          background: linear-gradient(135deg, #a7f3d0, #22c55e);
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.35);
        }
        .domain-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }
        .domain-subtitle {
          font-size: 14px;
          color: #4b5563;
          max-width: 640px;
        }
        .domain-step {
          padding: 7px 14px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .nav-pills .nav-link {
          border-radius: 999px;
          color: #111827;
          font-weight: 500;
          font-size: 14px;
        }
        .nav-pills .nav-link.active {
          background-color: #7c3aed;
          color: #ffffff;
        }
        .btn-primary {
          background-color: #7c3aed;
          border-color: #7c3aed;
          font-weight: 600;
        }
        .btn-primary:hover,
        .btn-primary:focus {
          background-color: #6d28d9;
          border-color: #6d28d9;
        }
        .form-label {
          font-weight: 500;
          font-size: 14px;
        }
        .form-control,
        .form-select {
          font-size: 14px;
          padding: 9px 12px;
        }
      `}</style>
    </>
  );
}
