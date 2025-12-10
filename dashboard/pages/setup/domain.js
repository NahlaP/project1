




// // og code 

// // dashboard/pages/setup/domain.js
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { useState } from "react";
// import NavbarTop from "../../layouts/navbars/NavbarTop";
// import { api } from "../../lib/api";

// // Only working TLDs
// const POPULAR_TLDS = ["com", "info", "org"];
// const UAE_TLDS = ["ae"];

// // Format prices nicely (59.4500000 -> "59.45 AED")
// function formatMoney(value, currency = "AED") {
//   if (typeof value !== "number" || Number.isNaN(value)) return "";
//   const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
//   const str = rounded.toFixed(2).replace(/\.00$/, "");
//   return `${str} ${currency}`;
// }

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

//   // ⬇️ UPDATED: can optionally include domain + prices in query string
//   const goToCheckout = (opts = {}) => {
//     const { includeDomain = false } = opts;

//     if (!priceId) {
//       router.push("/checkout");
//       return;
//     }

//     const params = new URLSearchParams({
//       priceId,
//       billing,
//     });

//     // Only send domain info when we have a quote and it’s available
//     if (
//       includeDomain &&
//       quote &&
//       checkResult?.status === "available" &&
//       fullDomain
//     ) {
//       const { priceAed, includedAed, extraAed } = quote;

//       params.set("domain", fullDomain);

//       if (typeof priceAed === "number") {
//         params.set("domainPriceAed", String(priceAed));
//       }
//       if (typeof includedAed === "number") {
//         params.set("domainIncludedAed", String(includedAed));
//       }
//       if (typeof extraAed === "number") {
//         params.set("domainExtraAed", String(extraAed));
//       }
//     }

//     router.push(`/checkout?${params.toString()}`);
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

//       // 1) availability
//       const checkRes = await api.get(
//         `/api/resellerclub/domain/check?name=${encodeURIComponent(
//           trimmed
//         )}&tlds=${encodeURIComponent(tld)}`
//       );

//       if (!checkRes.ok) {
//         throw new Error(checkRes.error || "Domain check failed");
//       }

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

//       // 2) quote
//       const quoteRes = await api.get(
//         `/api/resellerclub/domain/quote?name=${encodeURIComponent(
//           trimmed
//         )}&tld=${encodeURIComponent(tld)}`
//       );

//       if (!quoteRes.ok) {
//         throw new Error(quoteRes.error || "Domain quote failed");
//       }

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

//       setTransferSuccess(
//         "Transfer request submitted. We’ll process it and update you."
//       );
//       setTimeout(() => goToCheckout(), 800);
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

//       setDnsSuccess(
//         "Domain saved. Please update your DNS records to point to ION7."
//       );
//       setTimeout(() => goToCheckout(), 800);
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
//         <div className="alert alert-success mt-3 py-2 px-3">
//           <strong>{checkResult.domain}</strong> is available 🎉
//         </div>
//       );
//     }

//     if (checkResult.status === "taken") {
//       return (
//         <div className="alert alert-danger mt-3 py-2 px-3">
//           <strong>{checkResult.domain}</strong> is already taken. Please try
//           another name.
//         </div>
//       );
//     }

//     return (
//       <div className="alert alert-warning mt-3 py-2 px-3">
//         Status: {checkResult.status} ({checkResult.rawStatus})
//       </div>
//     );
//   };

//   const renderQuoteCard = () => {
//     if (!quote || checkResult?.status !== "available") return null;

//     const { priceAed, includedAed, extraAed, isFreeWithPlan, currency } = quote;
//     const displayCurrency = currency || "AED";
//     const hasPrice = typeof priceAed === "number" && !Number.isNaN(priceAed);

//     const registrarLabel = hasPrice
//       ? formatMoney(priceAed, displayCurrency)
//       : "";
//     const includedLabel =
//       typeof includedAed === "number"
//         ? formatMoney(includedAed, displayCurrency)
//         : "";
//     const extraLabel =
//       typeof extraAed === "number"
//         ? formatMoney(extraAed, displayCurrency)
//         : "";

//     return (
//       <div className="mt-3">
//         <div className="border rounded-3 p-3 bg-white">
//           <div className="fw-semibold mb-2">Pricing summary</div>
//           <div className="d-flex justify-content-between mb-1">
//             <span>Domain</span>
//             <span className="fw-semibold">{fullDomain}</span>
//           </div>

//           {hasPrice ? (
//             <>
//               <div className="d-flex justify-content-between mb-1">
//                 <span>Registrar price</span>
//                 <span className="fw-semibold">
//                   {registrarLabel}
//                   <span className="ms-1">/ year</span>
//                 </span>
//               </div>
//               {includedLabel && (
//                 <div className="d-flex justify-content-between mb-1">
//                   <span>Included in plan</span>
//                   <span className="fw-semibold">{includedLabel}</span>
//                 </div>
//               )}
//             </>
//           ) : (
//             <p className="mb-2">
//               We’ll confirm the exact registrar price in checkout.
//             </p>
//           )}

//           {hasPrice && (
//             <>
//               {isFreeWithPlan ? (
//                 <div className="alert alert-success mt-2 py-2 px-3 mb-2">
//                   This domain is <strong>free</strong> with your current plan
//                   (within {includedLabel}).
//                 </div>
//               ) : (
//                 <div className="alert alert-warning mt-2 py-2 px-3 mb-2">
//                   This domain is above the included amount. Extra to pay:{" "}
//                   <strong>{extraLabel}</strong>
//                 </div>
//               )}
//             </>
//           )}

//           <p className="mb-3">
//             Prices are fetched in real time from our registrar (ResellerClub) in{" "}
//             {displayCurrency}. Renewal pricing after the first year may change.
//           </p>

//           <button
//             type="button"
//             className="btn btn-primary w-100 rounded-pill"
//             onClick={() => goToCheckout({ includeDomain: true })}
//           >
//             Use this domain &amp; continue
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const renderNewDomain = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Register a new domain</h5>
//           <p className="mb-0">
//             Search for a new domain. We’ll check availability and apply your{" "}
//             <strong>up to 50 AED</strong> credit.
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
//               <select
//                 className="form-select bg-white text-dark"
//                 value={tld}
//                 onChange={(e) => setTld(e.target.value)}
//                 disabled={loading}
//                 style={{ maxWidth: 150 }}
//               >
//                 <optgroup label="Most popular">
//                   {POPULAR_TLDS.map((code) => (
//                     <option key={code} value={code}>
//                       .{code}
//                     </option>
//                   ))}
//                 </optgroup>
//                 <optgroup label="UAE & region">
//                   {UAE_TLDS.map((code) => (
//                     <option key={code} value={code}>
//                       .{code}
//                     </option>
//                   ))}
//                 </optgroup>
//               </select>
//             </div>
//           </div>

//           {fullDomain && (
//             <p className="mb-2">
//               Full domain: <span className="fw-semibold">{fullDomain}</span>
//             </p>
//           )}

//           {error && (
//             <div className="alert alert-danger py-2 px-3 mb-2">{error}</div>
//           )}

//           <button
//             type="submit"
//             className="btn btn-primary rounded-pill mt-1"
//             disabled={loading}
//           >
//             {loading ? "Checking…" : "Check availability"}
//           </button>
//         </form>

//         {renderStatusAlert()}
//       </div>

//       <div className="col-lg-5">
//         <div className="border rounded-3 p-3 h-100 bg-white">
//           <div className="fw-semibold mb-2">What’s included</div>
//           <ul className="mb-0 ps-3">
//             <li>Free domain credit up to 50 AED</li>
//             <li>1 year registration with ResellerClub</li>
//             <li>Automatic connection to your ION7 site</li>
//           </ul>

//           {renderQuoteCard()}
//         </div>
//       </div>
//     </div>
//   );

//   const renderTransfer = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Transfer your existing domain</h5>
//           <p className="mb-0">
//             Move your domain into our ResellerClub account so we can manage
//             everything for you.
//           </p>
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

//           {transferError && (
//             <div className="alert alert-danger py-2 px-3 mb-2">
//               {transferError}
//             </div>
//           )}
//           {transferSuccess && (
//             <div className="alert alert-success py-2 px-3 mb-2">
//               {transferSuccess}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="btn btn-primary rounded-pill"
//             disabled={transferLoading}
//           >
//             {transferLoading ? "Submitting…" : "Submit transfer request"}
//           </button>
//         </form>
//       </div>

//       <div className="col-lg-5">
//         <div className="border rounded-3 p-3 h-100 bg-white">
//           <div className="fw-semibold mb-2">Transfer tips</div>
//           <ul className="mb-0 ps-3">
//             <li>Unlock your domain at your current registrar.</li>
//             <li>Request the EPP/Auth code from them.</li>
//             <li>Make sure WHOIS email is correct to approve transfer.</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );

//   const renderDns = () => (
//     <div className="row g-4">
//       <div className="col-lg-7">
//         <div className="mb-3">
//           <h5 className="mb-1">Use existing domain (DNS only)</h5>
//           <p className="mb-0">
//             Keep your domain with your current provider and just point DNS to
//             ION7.
//           </p>
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

//           {dnsError && (
//             <div className="alert alert-danger py-2 px-3 mb-2">
//               {dnsError}
//             </div>
//           )}
//           {dnsSuccess && (
//             <div className="alert alert-success py-2 px-3 mb-2">
//               {dnsSuccess}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="btn btn-primary rounded-pill"
//             disabled={dnsLoading}
//           >
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

//   /* ---------------- MAIN RENDER ---------------- */

//   return (
//     <>
//       <Head>
//         <title>Domain Setup - ION7</title>
//       </Head>

//       <div
//         className="d-flex flex-column"
//         style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
//       >
//         <NavbarTop isMobile={false} />

//         <main className="flex-grow-1 px-4 py-4">
//           <div className="domain-setup">
//             {/* HEADER WITH ICON (old style) */}
//             <div className="domain-head card shadow-sm border-0 rounded-4 mb-3 px-4 py-3">
//               <div className="d-flex align-items-center justify-content-between gap-3">
//                 <div className="d-flex align-items-center gap-3">
//                   <div className="domain-logo">ION</div>
//                   <div>
//                     <h2 className="domain-title mb-1">Domain setup</h2>
//                     <p className="domain-subtitle mb-0">
//                       Connect a domain to your ION7 site. You can register a new
//                       domain, transfer an existing one, or keep your domain
//                       elsewhere and point DNS to ION7.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="domain-step">Step 2 of 3</div>
//               </div>
//             </div>

//             {/* MAIN CARD */}
//             <div className="card border-0 shadow-sm rounded-4">
//               <div className="card-header border-0 bg-white px-4 pt-3 pb-0">
//                 <ul className="nav nav-pills nav-justified">
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${
//                         mode === "new" ? "active" : ""
//                       }`}
//                       onClick={() => setMode("new")}
//                     >
//                       New domain
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${
//                         mode === "transfer" ? "active" : ""
//                       }`}
//                       onClick={() => setMode("transfer")}
//                     >
//                       Transfer domain
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       type="button"
//                       className={`nav-link rounded-pill ${
//                         mode === "dns" ? "active" : ""
//                       }`}
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
//         /* Page font a bit bigger */
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
import { useState } from "react";
import NavbarTop from "../../layouts/navbars/NavbarTop";
import { api } from "../../lib/api";

// Only working TLDs
const POPULAR_TLDS = ["com", "info", "org"];
const UAE_TLDS = ["ae"];

// Format prices nicely (59.4500000 -> "59.45 AED")
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

  // ⬇️ can optionally include domain + prices in query string
  const goToCheckout = (opts = {}) => {
    const { includeDomain = false } = opts;

    if (!priceId) {
      router.push("/checkout");
      return;
    }

    const params = new URLSearchParams({
      priceId,
      billing,
    });

    // Only send domain info when we have a quote and it’s available
    if (
      includeDomain &&
      quote &&
      checkResult?.status === "available" &&
      fullDomain
    ) {
      const { priceAed, includedAed, extraAed } = quote;

      params.set("domain", fullDomain);

      if (typeof priceAed === "number") {
        params.set("domainPriceAed", String(priceAed));
      }
      if (typeof includedAed === "number") {
        params.set("domainIncludedAed", String(includedAed));
      }
      if (typeof extraAed === "number") {
        params.set("domainExtraAed", String(extraAed));
      }
    }

    router.push(`/checkout?${params.toString()}`);
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

      // 1) availability
      const checkRes = await api.get(
        `/api/resellerclub/domain/check?name=${encodeURIComponent(
          trimmed
        )}&tlds=${encodeURIComponent(tld)}`
      );

      if (!checkRes || checkRes.error || checkRes.ok === false) {
        throw new Error(checkRes.error || "Domain check failed");
      }

      const list = checkRes.data || checkRes;
      const first = Array.isArray(list) ? list[0] : null;

      if (!first) {
        throw new Error("No response from domain check API");
      }

      setCheckResult(first);

      if (first.status !== "available") {
        setQuote(null);
        return;
      }

      // 2) quote
      const quoteRes = await api.get(
        `/api/resellerclub/domain/quote?name=${encodeURIComponent(
          trimmed
        )}&tld=${encodeURIComponent(tld)}`
      );

      if (!quoteRes || quoteRes.error || quoteRes.ok === false) {
        throw new Error(quoteRes.error || "Domain quote failed");
      }

      setQuote(quoteRes.data || quoteRes);
    } catch (err) {
      console.error("Domain setup error:", err);
      setError(
        err.message || "Something went wrong while checking domain."
      );
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

      // 🔗 REAL backend call
      const res = await api.post("/api/domain/transfer", {
        domain: d,
        eppCode: code, // ✅ must match backend expected field
      });

      const msg =
        (res && (res.message || res.msg)) ||
        "Transfer request submitted. We’ll process it and update you.";

      setTransferSuccess(msg);

      // small delay then go to checkout
      setTimeout(() => goToCheckout(), 800);
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

      // 🔗 REAL backend call
      const res = await api.post("/api/domain/dns", { domain: d });

      const msg =
        (res && (res.message || res.msg)) ||
        "Domain saved. Please update your DNS records to point to ION7.";
      setDnsSuccess(msg);

      setTimeout(() => goToCheckout(), 800);
    } catch (err) {
      console.error("DNS attach error:", err);
      setDnsError(
        err.message || "Something went wrong while saving domain."
      );
    } finally {
      setDnsLoading(false);
    }
  };

  /* ---------------- RENDER HELPERS ---------------- */

  const renderStatusAlert = () => {
    if (!checkResult) return null;

    if (checkResult.status === "available") {
      return (
        <div className="alert alert-success mt-3 py-2 px-3">
          <strong>{checkResult.domain}</strong> is available 🎉
        </div>
      );
    }

    if (checkResult.status === "taken") {
      return (
        <div className="alert alert-danger mt-3 py-2 px-3">
          <strong>{checkResult.domain}</strong> is already taken. Please try
          another name.
        </div>
      );
    }

    return (
      <div className="alert alert-warning mt-3 py-2 px-3">
        Status: {checkResult.status} ({checkResult.rawStatus})
      </div>
    );
  };

  const renderQuoteCard = () => {
    if (!quote || checkResult?.status !== "available") return null;

    const { priceAed, includedAed, extraAed, isFreeWithPlan, currency } =
      quote;
    const displayCurrency = currency || "AED";
    const hasPrice =
      typeof priceAed === "number" && !Number.isNaN(priceAed);

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
      <div className="mt-3">
        <div className="border rounded-3 p-3 bg-white">
          <div className="fw-semibold mb-2">Pricing summary</div>
          <div className="d-flex justify-content-between mb-1">
            <span>Domain</span>
            <span className="fw-semibold">{fullDomain}</span>
          </div>

          {hasPrice ? (
            <>
              <div className="d-flex justify-content-between mb-1">
                <span>Registrar price</span>
                <span className="fw-semibold">
                  {registrarLabel}
                  <span className="ms-1">/ year</span>
                </span>
              </div>
              {includedLabel && (
                <div className="d-flex justify-content-between mb-1">
                  <span>Included in plan</span>
                  <span className="fw-semibold">{includedLabel}</span>
                </div>
              )}
            </>
          ) : (
            <p className="mb-2">
              We’ll confirm the exact registrar price in checkout.
            </p>
          )}

          {hasPrice && (
            <>
              {isFreeWithPlan ? (
                <div className="alert alert-success mt-2 py-2 px-3 mb-2">
                  This domain is <strong>free</strong> with your current
                  plan (within {includedLabel}).
                </div>
              ) : (
                <div className="alert alert-warning mt-2 py-2 px-3 mb-2">
                  This domain is above the included amount. Extra to pay:{" "}
                  <strong>{extraLabel}</strong>
                </div>
              )}
            </>
          )}

          <p className="mb-3">
            Prices are fetched in real time from our registrar (ResellerClub) in{" "}
            {displayCurrency}. Renewal pricing after the first year may
            change.
          </p>

          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill"
            onClick={() => goToCheckout({ includeDomain: true })}
          >
            Use this domain &amp; continue
          </button>
        </div>
      </div>
    );
  };

  const renderNewDomain = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Register a new domain</h5>
          <p className="mb-0">
            Search for a new domain. We’ll check availability and apply your{" "}
            <strong>up to 50 AED</strong> credit.
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
              <select
                className="form-select bg-white text-dark"
                value={tld}
                onChange={(e) => setTld(e.target.value)}
                disabled={loading}
                style={{ maxWidth: 150 }}
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
          </div>

          {fullDomain && (
            <p className="mb-2">
              Full domain: <span className="fw-semibold">{fullDomain}</span>
            </p>
          )}

          {error && (
            <div className="alert alert-danger py-2 px-3 mb-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-pill mt-1"
            disabled={loading}
          >
            {loading ? "Checking…" : "Check availability"}
          </button>
        </form>

        {renderStatusAlert()}
      </div>

      <div className="col-lg-5">
        <div className="border rounded-3 p-3 h-100 bg-white">
          <div className="fw-semibold mb-2">What’s included</div>
          <ul className="mb-0 ps-3">
            <li>Free domain credit up to 50 AED</li>
            <li>1 year registration with ResellerClub</li>
            <li>Automatic connection to your ION7 site</li>
          </ul>

          {renderQuoteCard()}
        </div>
      </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Transfer your existing domain</h5>
          <p className="mb-0">
            Move your domain into our ResellerClub account so we can manage
            everything for you.
          </p>
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

          {transferError && (
            <div className="alert alert-danger py-2 px-3 mb-2">
              {transferError}
            </div>
          )}
          {transferSuccess && (
            <div className="alert alert-success py-2 px-3 mb-2">
              {transferSuccess}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-pill"
            disabled={transferLoading}
          >
            {transferLoading ? "Submitting…" : "Submit transfer request"}
          </button>
        </form>
      </div>

      <div className="col-lg-5">
        <div className="border rounded-3 p-3 h-100 bg-white">
          <div className="fw-semibold mb-2">Transfer tips</div>
          <ul className="mb-0 ps-3">
            <li>Unlock your domain at your current registrar.</li>
            <li>Request the EPP/Auth code from them.</li>
            <li>Make sure WHOIS email is correct to approve transfer.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDns = () => (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="mb-3">
          <h5 className="mb-1">Use existing domain (DNS only)</h5>
          <p className="mb-0">
            Keep your domain with your current provider and just point DNS to
            ION7.
          </p>
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

          {dnsError && (
            <div className="alert alert-danger py-2 px-3 mb-2">
              {dnsError}
            </div>
          )}
          {dnsSuccess && (
            <div className="alert alert-success py-2 px-3 mb-2">
              {dnsSuccess}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-pill"
            disabled={dnsLoading}
          >
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

  /* ---------------- MAIN RENDER ---------------- */

  return (
    <>
      <Head>
        <title>Domain Setup - ION7</title>
      </Head>

      <div
        className="d-flex flex-column"
        style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
      >
        <NavbarTop isMobile={false} />

        <main className="flex-grow-1 px-4 py-4">
          <div className="domain-setup">
            {/* HEADER WITH ICON */}
            <div className="domain-head card shadow-sm border-0 rounded-4 mb-3 px-4 py-3">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="domain-logo">ION</div>
                  <div>
                    <h2 className="domain-title mb-1">Domain setup</h2>
                    <p className="domain-subtitle mb-0">
                      Connect a domain to your ION7 site. You can register a new
                      domain, transfer an existing one, or keep your domain
                      elsewhere and point DNS to ION7.
                    </p>
                  </div>
                </div>
                <div className="domain-step">Step 2 of 3</div>
              </div>
            </div>

            {/* MAIN CARD */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header border-0 bg-white px-4 pt-3 pb-0">
                <ul className="nav nav-pills nav-justified">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${
                        mode === "new" ? "active" : ""
                      }`}
                      onClick={() => setMode("new")}
                    >
                      New domain
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${
                        mode === "transfer" ? "active" : ""
                      }`}
                      onClick={() => setMode("transfer")}
                    >
                      Transfer domain
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link rounded-pill ${
                        mode === "dns" ? "active" : ""
                      }`}
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
