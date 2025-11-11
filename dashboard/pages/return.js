











// // dashboard/pages/welcome.js
// import Head from "next/head";
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { useRouter } from "next/router";

// const BACKEND =
//   process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://127.0.0.1:5000";

// function Feature({ icon, title, text }) {
//   return (
//     <div className="feat">
//       <div className="ico">{icon}</div>
//       <h4>{title}</h4>
//       <p>{text}</p>
//       <style jsx>{`
//         .feat { background:#fff; border:1px solid #ececec; border-radius:16px; padding:14px; text-align:center; }
//         .ico { font-size:20px; }
//         h4 { margin:8px 0 6px; font-size:14px; }
//         p { margin:0; color:#6b7280; font-size:12px; line-height:1.35; }
//       `}</style>
//     </div>
//   );
// }

// export default function Welcome() {
//   const router = useRouter();
//   const sessionId = useMemo(() => router.query.session_id, [router.query]);

//   const [ui, setUi] = useState({
//     loading: true,
//     plan: "ION7 Plan",
//     amount: "—",
//     currency: "AED",
//     orderNo: "",
//     progress: 95,
//     note: "Includes 1 month free",
//     error: "",
//   });

//   const fetchSession = useCallback(async () => {
//     if (!sessionId) {
//       setUi((x) => ({ ...x, loading: false, error: "Missing session_id in URL" }));
//       return;
//     }
//     setUi((x) => ({ ...x, loading: true, error: "" }));
//     try {
//       const token =
//         typeof window !== "undefined" ? localStorage.getItem("token") : "";
//       const res = await fetch(
//         `${BACKEND}/api/billing/session/${encodeURIComponent(sessionId)}`,
//         { headers: { Authorization: token ? `Bearer ${token}` : "" } }
//       );
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const s = await res.json();

//       const sub = s.subscription || {};
//       const item = sub?.items?.data?.[0];
//       const price = item?.price || {};
//       const amount = (price?.unit_amount ?? 0) / 100;
//       const currency = (price?.currency || "aed").toUpperCase();

//       setUi((x) => ({
//         ...x,
//         loading: false,
//         plan: price?.nickname || x.plan,
//         amount: amount
//           ? new Intl.NumberFormat("en-AE").format(amount)
//           : x.amount,
//         currency,
//         orderNo: s?.id
//           ? `ORDER #${String(s.id).replace(/^cs_test_/, "")}`
//           : "ORDER #ION7-TEST",
//         progress: 100,
//       }));
//     } catch (e) {
//       setUi((x) => ({
//         ...x,
//         loading: false,
//         error: "Could not verify your session. You can still continue.",
//         note: "Verification failed",
//       }));
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     fetchSession();
//   }, [fetchSession]);

//   return (
//     <>
//       <Head>
//         <title>Welcome to ION7</title>
//         <meta name="robots" content="noindex" />
//       </Head>

//       <div className="wrap">
//         <div className="card">
//           <div className="pill"><span>✓</span></div>
//           <div className="logo">ION7</div>

//           <div className="toprow">
//             <div className="complete">100%<br/>Complete</div>
//             <h1 className="title">Welcome to<br/>ION7!</h1>
//           </div>

//           <p className="lead">
//             {ui.loading
//               ? "Verifying your subscription…"
//               : "Your dashboard is being set up. You can now start managing your website and explore your CMS."}
//           </p>

//           {ui.error && <div className="error">{ui.error}</div>}

//           <div className="tri">
//             <Feature icon="🧩" title="Website Builder" text="Create stunning websites with our drag-and-drop builder" />
//             <Feature icon="📈" title="Analytics" text="Track performance and visitor insights" />
//             <Feature icon="🛟" title="24/7 Support" text="Get help whenever you need it" />
//           </div>

//           <div className="buttons">
//             <button className="cta" type="button" onClick={() => router.push("/dashboard")} disabled={ui.loading}>
//               Go to Dashboard
//             </button>
//             <button className="ghost" type="button" onClick={fetchSession} disabled={ui.loading}>
//               {ui.loading ? "Checking…" : "Retry verification"}
//             </button>
//           </div>

//           <div className="tinylinks">
//             <a onClick={() => router.push("/docs/get-started")}>Getting Started Guide</a>
//             <span>•</span>
//             <a onClick={() => router.push("/support")}>Contact Support</a>
//           </div>

//           <div className="progressRow">
//             <div className="labels">
//               <span className="on">Account Created</span>
//               <span className="on">Domain Setup</span>
//               <span className="on">Payment Processed</span>
//               <span className={ui.progress >= 100 ? "on" : ""}>Final Configuration</span>
//             </div>
//             <div className="bar">
//               <div className="fill" style={{ width: `${ui.progress}%` }} />
//               <span className="pct">{ui.progress}% Complete</span>
//             </div>
//           </div>

//           <div className="receipt">
//             <div className="left">
//               <div className="muted">Order Confirmation</div>
//               <div className="plan">{ui.plan}</div>
//               <div className="order">{ui.orderNo}</div>
//             </div>
//             <div className="right">
//               <div className="amount">{ui.currency} {ui.amount}</div>
//               <div className="green">{ui.note}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         :root{
//           --bg:#f7f7fb; --card:#fff; --ink:#111827; --muted:#6b7280;
//           --accent:#ff3b30; --accent-700:#e22e25; --border:#eaeaea;
//           --ring:rgba(255,59,48,.14); --green:#0ba370;
//         }
//         .wrap{
//           min-height:100vh;
//           background: radial-gradient(900px 900px at 8% 10%, #ffecec 0, transparent 45%),
//                       radial-gradient(900px 900px at 92% 85%, #ecfff2 0, transparent 45%),
//                       var(--bg);
//           display:grid;place-items:center;padding:24px;
//         }
//         .card{width:100%;max-width:640px;background:var(--card);border-radius:28px;
//           box-shadow:0 20px 60px rgba(0,0,0,.08);padding:28px 28px 24px;position:relative;}

//         .logo{width:72px;height:72px;border-radius:22px;margin:0 auto 8px;background:#ffe2e0;
//           color:#ff3b30;font-weight:800;display:grid;place-items:center;letter-spacing:.5px;}
//         .toprow{display:flex;gap:16px;align-items:end;justify-content:center;margin:4px 0 8px}
//         .complete{color:#69b500;font-weight:800;line-height:1.05;text-align:right}
//         .title{font-size:32px;line-height:1.08;text-align:center;margin:0;color:var(--ink);font-weight:800}
//         .lead{text-align:center;color:var(--muted);max-width:520px;margin:8px auto 18px}
//         .error{ text-align:center; color:#b91c1c; background:#fee2e2; border:1px solid #fecaca;
//           padding:10px 12px; border-radius:10px; margin:-6px auto 12px; max-width:520px; }
//         .tri{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:10px 0 16px}
//         .buttons{display:flex;gap:10px;justify-content:center;align-items:center}
//         .cta{margin:10px 0 8px;display:block;width:220px;height:44px;border-radius:12px;border:none;
//           background:var(--accent);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 10px 20px var(--ring);}
//         .cta:hover{background:var(--accent-700)}
//         .cta:disabled{opacity:.6;cursor:not-allowed}
//         .ghost{background:transparent;border:1px solid var(--border);border-radius:10px;
//           padding:10px 14px;font-weight:600;cursor:pointer}
//         .ghost:disabled{opacity:.6;cursor:not-allowed}
//         .tinylinks{display:flex;gap:10px;justify-content:center;color:var(--muted);font-size:12px;margin-bottom:6px}
//         .tinylinks a{cursor:pointer}
//         .progressRow{margin:12px 0 16px}
//         .labels{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;font-size:12px;color:var(--muted);margin-bottom:10px}
//         .labels .on{color:#111}
//         .bar{position:relative;height:10px;background:#f1f1f5;border-radius:999px;overflow:hidden}
//         .fill{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#86efac,#22c55e);width:60%}
//         .pct{position:absolute;right:10px;top:-22px;font-size:12px;color:#16a34a;font-weight:700}
//         .receipt{margin-top:14px;border:1px solid var(--border);border-radius:16px;padding:14px 16px;
//           display:flex;justify-content:space-between;gap:12px;background:#fcfdfc}
//         .muted{color:var(--muted);font-size:12px}
//         .plan{font-weight:800;margin-top:2px}
//         .order{color:var(--muted);font-size:12px}
//         .amount{font-weight:900}
//         .green{color:var(--green);font-size:12px}
//         @media (max-width:640px){
//           .tri{grid-template-columns:1fr}
//           .pill{width:100%}
//           .receipt{flex-direction:column;align-items:flex-start}
//         }
//       `}</style>
//     </>
//   );
// }













// // dashboard/pages/welcome.js
// import Head from "next/head";
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { useRouter } from "next/router";

// const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://127.0.0.1:5000").replace(/\/$/, "");

// function Feature({ icon, title, text }) {
//   return (
//     <div className="feat">
//       <div className="ico">{icon}</div>
//       <h4>{title}</h4>
//       <p>{text}</p>
//       <style jsx>{`
//         .feat { background:#fff; border:1px solid #ececec; border-radius:16px; padding:14px; text-align:center; }
//         .ico { font-size:20px; }
//         h4 { margin:8px 0 6px; font-size:14px; }
//         p { margin:0; color:#6b7280; font-size:12px; line-height:1.35; }
//       `}</style>
//     </div>
//   );
// }

// export default function Welcome() {
//   const router = useRouter();

//   // Wait until router is ready to read query params
//   const ready = router.isReady;

//   // Two success return types:
//   // - Embedded Checkout:  ?session_id=cs_...
//   // - Payment Element:    ?sid=sub_...
//   const sessionId = useMemo(() => (ready ? router.query.session_id : undefined), [ready, router.query]);
//   const subId     = useMemo(() => (ready ? router.query.sid        : undefined), [ready, router.query]);

//   const [ui, setUi] = useState({
//     loading: true,
//     plan: "ION7 Plan",
//     amount: "—",
//     currency: "AED",
//     orderNo: "",
//     progress: 95,
//     note: "Includes 1 month free",
//     error: "",
//   });

//   const token = () =>
//     typeof window !== "undefined" ? (localStorage.getItem("token") || "") : "";

//   const fetchFromCheckoutSession = useCallback(async (id) => {
//     const r = await fetch(`${BACKEND}/api/billing/session/${encodeURIComponent(id)}`, {
//       headers: { Authorization: token() ? `Bearer ${token()}` : "" },
//     });
//     if (!r.ok) throw new Error(`HTTP ${r.status}`);
//     const s = await r.json();

//     const sub = s.subscription || {};
//     const item = sub?.items?.data?.[0];
//     const price = item?.price || {};
//     const amount = (price?.unit_amount ?? 0) / 100;
//     const currency = (price?.currency || "aed").toUpperCase();

//     setUi((x) => ({
//       ...x,
//       loading: false,
//       plan: price?.nickname || x.plan,
//       amount: amount ? new Intl.NumberFormat("en-AE").format(amount) : x.amount,
//       currency,
//       orderNo: s?.id ? `ORDER #${String(s.id).replace(/^cs_(test|live)_/, "")}` : x.orderNo,
//       progress: 100,
//       error: "",
//     }));
//   }, []);

//   const fetchFromSubscription = useCallback(async (id) => {
//     const r = await fetch(`${BACKEND}/api/billing/elements/subscriptions/${encodeURIComponent(id)}`, {
//       headers: { Authorization: token() ? `Bearer ${token()}` : "" },
//     });
//     if (!r.ok) throw new Error(`HTTP ${r.status}`);
//     const sub = await r.json();

//     const item = sub?.items?.data?.[0];
//     const price = item?.price || {};
//     const amount = (price?.unit_amount ?? 0) / 100;
//     const currency = (price?.currency || "aed").toUpperCase();

//     setUi((x) => ({
//       ...x,
//       loading: false,
//       plan: price?.nickname || x.plan,
//       amount: amount ? new Intl.NumberFormat("en-AE").format(amount) : x.amount,
//       currency,
//       orderNo: sub?.id ? `ORDER #${String(sub.id).replace(/^sub_/, "").toUpperCase()}` : x.orderNo,
//       progress: 100,
//       error: "",
//     }));
//   }, []);

//   const fetchData = useCallback(async () => {
//     if (!ready) return;
//     setUi((x) => ({ ...x, loading: true, error: "" }));

//     try {
//       if (sessionId) {
//         await fetchFromCheckoutSession(String(sessionId));
//       } else if (subId) {
//         await fetchFromSubscription(String(subId));
//       } else {
//         setUi((x) => ({
//           ...x,
//           loading: false,
//           error:
//             "Missing session_id or sid in URL. Your payment may have completed—use 'Retry verification' or go to Dashboard.",
//           note: "Verification needed",
//         }));
//       }
//     } catch {
//       setUi((x) => ({
//         ...x,
//         loading: false,
//         error: "Could not verify your purchase. You can still continue.",
//         note: "Verification failed",
//       }));
//     }
//   }, [ready, sessionId, subId, fetchFromCheckoutSession, fetchFromSubscription]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return (
//     <>
//       <Head>
//         <title>Welcome to ION7</title>
//         <meta name="robots" content="noindex" />
//       </Head>

//       <div className="wrap">
//         <div className="card">
//           <div className="pill"><span>✓</span></div>
//           <div className="logo">ION7</div>

//           <div className="toprow">
//             <div className="complete">100%<br/>Complete</div>
//             <h1 className="title">Welcome to<br/>ION7!</h1>
//           </div>

//           <p className="lead">
//             {ui.loading
//               ? "Verifying your subscription…"
//               : "Your dashboard is being set up. You can now start managing your website and explore your CMS."}
//           </p>

//           {ui.error && <div className="error">{ui.error}</div>}

//           <div className="tri">
//             <Feature icon="🧩" title="Website Builder" text="Create stunning websites with our drag-and-drop builder" />
//             <Feature icon="📈" title="Analytics" text="Track performance and visitor insights" />
//             <Feature icon="🛟" title="24/7 Support" text="Get help whenever you need it" />
//           </div>

//           <div className="buttons">
//             <button className="cta" type="button" onClick={() => router.push("/dashboard")} disabled={ui.loading}>
//               Go to Dashboard
//             </button>
//             <button className="ghost" type="button" onClick={fetchData} disabled={ui.loading}>
//               {ui.loading ? "Checking…" : "Retry verification"}
//             </button>
//           </div>

//           <div className="tinylinks">
//             <a onClick={() => router.push("/docs/get-started")}>Getting Started Guide</a>
//             <span>•</span>
//             <a onClick={() => router.push("/support")}>Contact Support</a>
//           </div>

//           <div className="progressRow">
//             <div className="labels">
//               <span className="on">Account Created</span>
//               <span className="on">Domain Setup</span>
//               <span className="on">Payment Processed</span>
//               <span className={ui.progress >= 100 ? "on" : ""}>Final Configuration</span>
//             </div>
//             <div className="bar">
//               <div className="fill" style={{ width: `${ui.progress}%` }} />
//               <span className="pct">{ui.progress}% Complete</span>
//             </div>
//           </div>

//           <div className="receipt">
//             <div className="left">
//               <div className="muted">Order Confirmation</div>
//               <div className="plan">{ui.plan}</div>
//               <div className="order">{ui.orderNo}</div>
//             </div>
//             <div className="right">
//               <div className="amount">{ui.currency} {ui.amount}</div>
//               <div className="green">{ui.note}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         :root{
//           --bg:#f7f7fb; --card:#fff; --ink:#111827; --muted:#6b7280;
//           --accent:#ff3b30; --accent-700:#e22e25; --border:#eaeaea;
//           --ring:rgba(255,59,48,.14); --green:#0ba370;
//         }
//         .wrap{
//           min-height:100vh;
//           background: radial-gradient(900px 900px at 8% 10%, #ffecec 0, transparent 45%),
//                       radial-gradient(900px 900px at 92% 85%, #ecfff2 0, transparent 45%),
//                       var(--bg);
//           display:grid;place-items:center;padding:24px;
//         }
//         .card{width:100%;max-width:640px;background:var(--card);border-radius:28px;
//           box-shadow:0 20px 60px rgba(0,0,0,.08);padding:28px 28px 24px;position:relative;}
//         .logo{width:72px;height:72px;border-radius:22px;margin:0 auto 8px;background:#ffe2e0;
//           color:#ff3b30;font-weight:800;display:grid;place-items:center;letter-spacing:.5px;}
//         .toprow{display:flex;gap:16px;align-items:end;justify-content:center;margin:4px 0 8px}
//         .complete{color:#69b500;font-weight:800;line-height:1.05;text-align:right}
//         .title{font-size:32px;line-height:1.08;text-align:center;margin:0;color:var(--ink);font-weight:800}
//         .lead{text-align:center;color:var(--muted);max-width:520px;margin:8px auto 18px}
//         .error{ text-align:center; color:#b91c1c; background:#fee2e2; border:1px solid #fecaca;
//           padding:10px 12px; border-radius:10px; margin:-6px auto 12px; max-width:520px; }
//         .tri{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:10px 0 16px}
//         .buttons{display:flex;gap:10px;justify-content:center;align-items:center}
//         .cta{margin:10px 0 8px;display:block;width:220px;height:44px;border-radius:12px;border:none;
//           background:var(--accent);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 10px 20px var(--ring);}
//         .cta:hover{background:var(--accent-700)}
//         .cta:disabled{opacity:.6;cursor:not-allowed}
//         .ghost{background:transparent;border:1px solid var(--border);border-radius:10px;
//           padding:10px 14px;font-weight:600;cursor:pointer}
//         .ghost:disabled{opacity:.6;cursor:not-allowed}
//         .tinylinks{display:flex;gap:10px;justify-content:center;color:var(--muted);font-size:12px;margin-bottom:6px}
//         .tinylinks a{cursor:pointer}
//         .progressRow{margin:12px 0 16px}
//         .labels{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;font-size:12px;color:var(--muted);margin-bottom:10px}
//         .labels .on{color:#111}
//         .bar{position:relative;height:10px;background:#f1f1f5;border-radius:999px;overflow:hidden}
//         .fill{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#86efac,#22c55e);width:60%}
//         .pct{position:absolute;right:10px;top:-22px;font-size:12px;color:#16a34a;font-weight:700}
//         .receipt{margin-top:14px;border:1px solid var(--border);border-radius:16px;padding:14px 16px;
//           display:flex;justify-content:space-between;gap:12px;background:#fcfdfc}
//         .muted{color:var(--muted);font-size:12px}
//         .plan{font-weight:800;margin-top:2px}
//         .order{color:var(--muted);font-size:12px}
//         .amount{font-weight:900}
//         .green{color:var(--green);font-size:12px}
//         @media (max-width:640px){
//           .tri{grid-template-columns:1fr}
//           .receipt{flex-direction:column;align-items:flex-start}
//         }
//       `}</style>
//     </>
//   );
// }
