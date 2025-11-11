



// og

// dashboard/pages/choose-plan.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

export default function ChoosePlan() {
  const router = useRouter();
  const [plans, setPlans] = useState(null);
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const me = await api.me(); // { next: 'dashboard' | 'checkout' | 'choose-plan' }
        if (me?.next === "dashboard") return router.replace("/dashboard");
        if (me?.next === "checkout")  return router.replace("/checkout");

        const data = await api.listPlans();
        setPlans(data);
      } catch (e) {
        const msg = e?.message || "Something went wrong loading plans.";
        setErr(msg);
        if (String(msg).toLowerCase().includes("unauthorized")) {
          router.replace("/authentication/signin");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (priceId) => {
    if (!priceId) return;
    router.push(`/checkout?priceId=${encodeURIComponent(priceId)}&billing=${billing}`);
  };

  if (loading) {
    return (
      <>
        <Head><title>Choose plan</title></Head>
        <div className="wrap"><div className="loading">Loading…</div></div>
        <style jsx>{`
          :root{ --bg:#f3f4f6; --text:#0f172a; }
          html,body,#__next{height:100%}
          body{ margin:0; background:var(--bg); color:var(--text);
            font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; }
          .wrap{min-height:100vh;display:grid;place-items:center}
          .loading{color:#6b7280;font-size:14px}
        `}</style>
      </>
    );
  }

  if (!plans) {
    return (
      <>
        <Head><title>Choose plan</title></Head>
        <div className="shell">
          <div className="card glass err">
            <strong>Couldn’t load plans</strong>
            <p>{err || "Please try again."}</p>
          </div>
        </div>
        <style jsx>{`
          :root{ --bg:#f3f4f6; --text:#0f172a; --border:#e5e7eb; }
          body{ margin:0; background:var(--bg); color:var(--text);
            font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; }
          .shell{ max-width:1100px; margin:0 auto; padding:88px 16px 64px; }
          .glass{ background:#ffffffcc; border:1px solid var(--border); border-radius:16px; padding:20px; }
          .err{ border-color:#fecaca; background:#fff1f2; }
        `}</style>
      </>
    );
  }

  const list = billing === "monthly" ? plans.monthly : plans.yearly;

  return (
    <>
      <Head><title>Choose your plan</title></Head>

      <div className="shell">
        {/* Header */}
        <div className="head card glass">
          <div className="brand">
            <div className="logo">ION</div>
            <div>
              <h1>Choose your plan</h1>
              <p>Select the perfect plan and start building with ION7.</p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="toggle">
            <button onClick={() => setBilling("monthly")} className={`pill ${billing === "monthly" ? "active" : ""}`} type="button">
              Monthly
            </button>
            <button onClick={() => setBilling("yearly")} className={`pill ${billing === "yearly" ? "active" : ""}`} type="button">
              Yearly
            </button>
          </div>
        </div>

        {/* Simple business info (non-blocking UI) */}
        <div className="card glass">
          <div className="subhead">Tell us about your business</div>
          <div className="grid">
            <div className="select-wrap">
              <select className="select" defaultValue="">
                <option value="">Select Category</option>
                <option>Consulting</option>
                <option>Services</option>
                <option>eCommerce</option>
              </select>
              <span className="caret">⌄</span>
            </div>
            <div className="select-wrap">
              <select className="select" defaultValue="">
                <option value="">Select Goal</option>
                <option>Generate Leads</option>
                <option>Sell Online</option>
                <option>Portfolio</option>
              </select>
              <span className="caret">⌄</span>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="cards">
          {list.map((p) => {
            const highlighted = p.key === "pro";
            return (
              <div key={p.key} className={`plan card glass ${highlighted ? "plan-pro" : ""}`}>
                {highlighted && <div className="badge"><span>★</span> Recommended</div>}

                <div className="title">{p.name}</div>
                <div className="subtitle">
                  {p.key === "starter" ? "Perfect for small businesses" : "For growing businesses"}
                </div>

                <div className="price">
                  AED {p.price}
                  <span className="period">/ {billing === "monthly" ? "month" : "year"}</span>
                </div>

                {highlighted && (
                  <div className="promo">Build and manage multiple websites — get full creative control with ION7 PRO</div>
                )}

                <ul className="features">
                  {p.key === "starter" ? (
                    <>
                      <li>✔ 6–8 pages included</li>
                      <li>✔ 1 CMS account</li>
                      <li>✔ Free domain &amp; hosting</li>
                      <li>✔ Unlimited content updates</li>
                      <li>✔ Full support &amp; analytics</li>
                      <li>✔ Live chat integration</li>
                    </>
                  ) : (
                    <>
                      <li>✔ 15 pages included</li>
                      <li>✔ 3 CMS accounts</li>
                      <li>✔ All Starter features</li>
                      <li>✔ Multiple website templates</li>
                      <li>✔ WhatsApp &amp; eSignature</li>
                      <li>✔ eCommerce functionality</li>
                      <li>✔ Advanced analytics</li>
                    </>
                  )}
                </ul>

                <button onClick={() => handleSelect(p.priceId)} className="btn" type="button">
                  Get Started
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        :root{
          --bg:#f3f4f6; --accent:#ff3b30; --accent-700:#e22e25; --text:#0f172a; --muted:#6b7280;
          --card:#ffffffcc; --ring:rgba(255,59,48,.18); --border:#e5e7eb; --border-strong:#4b5563; --border-strong-hover:#374151;
        }
        html,body,#__next{height:100%}
        body{ margin:0; background:var(--bg); color:var(--text); font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; }
        .shell{ max-width:1100px; margin:0 auto; padding:88px 16px 64px; }
        .glass{ background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:0 24px 70px rgba(0,0,0,.12); backdrop-filter:blur(8px); }
        .card{ padding:20px; }
        .head{ display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px 24px; margin-bottom:14px; }
        .brand{display:flex;gap:12px;align-items:center}
        .logo{ width:42px;height:42px;border-radius:10px;display:grid;place-items:center;background:#cde6b2;color:#1a2b1a;font-weight:800; }
        .brand h1{ margin:0; font-size:20px; }
        .brand p{ margin:.25rem 0 0; color:var(--muted); font-size:12px; }
        .toggle{ display:flex; gap:8px; }
        .pill{ padding:8px 14px; border-radius:999px; font-size:13px; font-weight:700; background:#fff; border:1px solid var(--border); color:#374151; cursor:pointer; box-shadow:none; }
        .pill.active{ background:var(--accent); color:#fff; border:1px solid var(--accent); }
        .pill:hover{ filter:brightness(0.98); }
        .subhead{ font-size:13px; font-weight:700; color:#111827; margin-bottom:10px; }
        .grid{ display:grid; grid-template-columns:1fr; gap:10px; }
        @media(min-width:640px){ .grid{ grid-template-columns:1fr 1fr; } }
        .select-wrap{ position:relative; }
        .select{
          width:100%; height:40px; border-radius:12px; background:#fff;
          border:2px solid var(--border-strong); padding:0 36px 0 12px; font-size:14px; outline:none;
          box-shadow: 0 0 0 1px rgba(0,0,0,.08) inset; color:#111827;
          transition:border-color .15s ease, box-shadow .15s ease; appearance:none;
        }
        .select:hover{ border-color: var(--border-strong-hover); }
        .select:focus{ border-color: var(--accent); box-shadow: 0 0 0 4px var(--ring), 0 0 0 1px rgba(0,0,0,.08) inset; }
        .caret{ position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
        .cards{ display:grid; grid-template-columns:1fr; gap:16px; margin-top:16px; }
        @media(min-width:768px){ .cards{ grid-template-columns:1fr 1fr; } }
        .plan{ padding:22px; border:1px solid transparent; }
        .plan-pro{ border-color:#fecaca; }
        .badge{ display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#b91c1c; background:#fee2e2; padding:4px 8px; border-radius:999px; margin-bottom:8px; }
        .title{ font-weight:700; font-size:16px; color:#111827; }
        .subtitle{ font-size:12px; color:var(--muted); margin-bottom:8px; }
        .price{ font-weight:800; font-size:28px; color:#111827; }
        .period{ font-size:12px; color:#6b7280; margin-left:6px; }
        .promo{ margin-top:10px; border-radius:12px; background:#fff1f1; color:#b91c1c; font-size:12px; padding:10px 12px; border:1px solid #fecaca; }
        .features{ margin:12px 0 0; padding:0; list-style:none; display:grid; gap:6px; font-size:14px; color:#374151; }
        .btn{ margin-top:16px; width:100%; height:42px; border:0; border-radius:12px; background:#ff3b30; color:#fff; font-weight:800; cursor:pointer; }
        .btn:hover{ filter:brightness(0.98); }
      `}</style>
    </>
  );
}





