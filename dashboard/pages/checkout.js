
// og

// dashboard/pages/checkout.js
import Head from "next/head";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../lib/api";

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(PK);

const COUNTRY_NAME_TO_ISO = {
  "United Arab Emirates": "AE",
  India: "IN",
  Qatar: "QA",
  Oman: "OM",
  "Saudi Arabia": "SA",
  Bahrain: "BH",
  Kuwait: "KW",
};

const centsToMoney = (c, cur = "AED") => {
  if (c == null) return "—";
  const amt = (c / 100).toFixed(2).replace(/\.00$/, "");
  return `${cur.toUpperCase()} ${amt}`;
};
const toInt = (v) => (isNaN(parseInt(v, 10)) ? 0 : parseInt(v, 10));

/* ---------------- Payment Element form: parent calls ref.pay() ---------------- */
const CheckoutForm = forwardRef(function CheckoutForm({ subscriptionId, mode }, ref) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    if (!stripe || !elements) return { ok: false, error: "Stripe not ready" };
    setErr("");
    setSubmitting(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErr(submitError.message || "Please check the fields above.");
      setSubmitting(false);
      return { ok: false, error: submitError.message };
    }

    const confirmParams = {
      elements,
      confirmParams: { return_url: `${window.location.origin}/welcome?sid=${subscriptionId}` },
      redirect: "if_required",
    };

    const result =
      mode === "setup" ? await stripe.confirmSetup(confirmParams) : await stripe.confirmPayment(confirmParams);

    if (result?.error) {
      setErr(result.error.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return { ok: false, error: result.error.message };
    }

    router.replace(`/welcome?sid=${subscriptionId}`);
    return { ok: true };
  };

  useImperativeHandle(ref, () => ({ pay, isSubmitting: () => submitting }));

  return (
    <div className="card payment" aria-label="Payment Details">
      <h3 className="cardTitle">Payment Details</h3>
      <PaymentElement />
      {err && <p className="err">{err}</p>}
      <style jsx>{`
        .cardTitle{margin:0 0 10px;font-size:16px}
        .err{color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;border-radius:12px;
             padding:10px 12px;margin:12px 0 0;font-size:13px}
      `}</style>
    </div>
  );
});

/* --------------------------------- Page --------------------------------- */
export default function CheckoutPage() {
  const router = useRouter();
  const priceId = router.query.priceId?.toString();
  const billingCycle = (router.query.billing?.toString() || "yearly").toLowerCase();

  const [clientSecret, setClientSecret] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [mode, setMode] = useState("payment");
  const [starting, setStarting] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [paying, setPaying] = useState(false);
  const payRef = useRef(null);

  // user/billing info
  const [userEmail, setUserEmail] = useState("");
  const [haveApiEmail, setHaveApiEmail] = useState(false);
  const [billing, setBilling] = useState({
    fullName: "",
    company: "",
    country: "United Arab Emirates",
    address1: "",
    city: "",
    postal: "",
  });

  // summary
  const [planName, setPlanName] = useState("Selected Plan");
  const [currency, setCurrency] = useState("AED");
  const [recurringCents, setRecurringCents] = useState(0);
  const [discountCents, setDiscountCents] = useState(0);
  const [setupFeeCents, setSetupFeeCents] = useState(0);

  // load /me for email/name
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await api.me();
        if (ignore) return;
        if (me?.email) {
          setUserEmail(me.email);
          setHaveApiEmail(true);
        }
        const name = me?.fullName || me?.name || "";
        if (name) setBilling((b) => ({ ...b, fullName: name }));
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  // price meta for summary
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!priceId) return;
      try {
        const j = await api.getPrice(priceId);
        if (ignore) return;
        const name = j.nickname || (j.product && j.product.name) || "Selected Plan";
        const curr = (j.currency || "AED").toUpperCase();
        setPlanName(name);
        setCurrency(curr);
        setRecurringCents(j.unit_amount || 0);

        const meta = j.metadata || {};
        let setup = toInt(meta.setup_fee_cents);
        let disc = toInt(meta.discount_cents);

        if (router.query.setup) setup = toInt(router.query.setup.toString());
        if (router.query.discount) disc = toInt(router.query.discount.toString());

        if (!setup && !disc && billingCycle === "yearly" && curr === "AED") {
          setup = 249900;
          disc = 19900;
        }
        setSetupFeeCents(setup);
        setDiscountCents(disc);
      } catch {}
    })();
    return () => { ignore = true; };
  }, [priceId, router.query.setup, router.query.discount, billingCycle]);

  // start elements
  const startCheckout = useCallback(async () => {
    if (!priceId) return;
    if (!userEmail.trim()) {
      setApiErr("Email is required");
      return;
    }
    setStarting(true);
    setApiErr("");
    try {
      const payload = {
        priceId,
        email: userEmail.trim(),
        name: (billing.fullName || "").trim(),
        country: COUNTRY_NAME_TO_ISO[billing.country] || undefined,
        address1: billing.address1 || undefined,
        city: billing.city || undefined,
        postalCode: billing.postal || undefined,
      };
      const j = await api.billingStartElements(priceId, payload);
      setClientSecret(j.clientSecret); // can be null if already active
      setSubscriptionId(j.subscriptionId);
      setMode(j.mode || "payment");
      // If already active, jump straight to welcome
      if (!j.clientSecret && j.subscriptionId) {
        router.replace(`/welcome?sid=${j.subscriptionId}`);
      }
    } catch (e) {
      setApiErr(e?.message || "Something went wrong starting checkout.");
    } finally {
      setStarting(false);
    }
  }, [priceId, userEmail, billing, router]);

  useEffect(() => {
    if (priceId && haveApiEmail && userEmail && !clientSecret && !starting) {
      startCheckout();
    }
  }, [priceId, haveApiEmail, userEmail, clientSecret, starting, startCheckout]);

  // Stripe theme
  const appearance = useMemo(
    () => ({
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
        colorText: "#0f172a",
        colorTextSecondary: "#6b7280",
        borderRadius: "12px",
      },
      rules: {
        ".Input": { boxShadow: "none" },
        ".Input--focus": { borderColor: "#2563eb", boxShadow: "0 0 0 4px rgba(37,99,235,.15)" },
        ".Tab, .Block": { borderRadius: "12px" },
      },
    }),
    []
  );

  const totalTodayCents = Math.max(0, recurringCents - discountCents + setupFeeCents);
  const thenText =
    billingCycle === "monthly"
      ? `Then ${centsToMoney(recurringCents, currency)} monthly`
      : `Then ${centsToMoney(recurringCents, currency)} yearly`;

  const handlePayClick = async () => {
    if (!payRef.current) return;
    setPaying(true);
    try {
      const res = await payRef.current.pay();
      if (!res?.ok) setPaying(false);
    } catch {
      setPaying(false);
    }
  };

  return (
    <>
      <Head><title>Checkout — ION7</title></Head>

      <main className="shell">
        <div className="header">
          <div className="logo">ION7</div>
          <h2>Complete Your Order</h2>
          <p className="sub">Secure checkout powered by Stripe</p>
        </div>

        {!priceId && (
          <div className="card note">
            <p>No plan selected.</p>
            <p>Go back to <Link href="/choose-plan">Choose Plan</Link> and pick a plan.</p>
          </div>
        )}

        {apiErr && (
          <div className="card errbox">
            <strong>Couldn't start checkout</strong>
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{apiErr}</p>
          </div>
        )}

        <section className="checkoutGrid">
          {/* Selected Plan */}
          <div className="card selected" aria-label="Selected Plan">
            <div className="selLeft">
              <div className="pill">{planName}</div>
              <div className="subtle">
                {billingCycle === "monthly" ? "Monthly Billing" : "Yearly Billing — 13 months for 12"}
              </div>
            </div>
            <div className="selRight">
              <div className="price">{centsToMoney(recurringCents, currency)}</div>
              {discountCents > 0 && <div className="save">Save {centsToMoney(discountCents, currency)}</div>}
            </div>
          </div>

          {/* Summary */}
          <aside className="card summary" aria-label="Order Summary">
            <h4>Order Summary</h4>
            <ul>
              <li>
                <span>{planName.toUpperCase()}</span>
                <strong>{centsToMoney(recurringCents, currency)}</strong>
              </li>
              {discountCents > 0 && (
                <li className="discount">
                  <span>Yearly Discount</span>
                  <strong className="neg">-{centsToMoney(discountCents, currency)}</strong>
                </li>
              )}
              {setupFeeCents > 0 && (
                <li>
                  <span>One-time Setup Fee</span>
                  <strong>{centsToMoney(setupFeeCents, currency)}</strong>
                </li>
              )}
              <li className="totalRow">
                <div>
                  <div className="total">Total Today</div>
                  <small className="muted">{thenText}</small>
                </div>
                <div className="totalAmt">{centsToMoney(totalTodayCents, currency)}</div>
              </li>

              <li className="badgeRow"><span className="badge green">1 Month Free</span></li>
              <li className="muted">Secure 256-bit SSL encryption</li>
              <li className="muted">Renews automatically every year</li>
              <li className="muted">Cancel anytime</li>
            </ul>

            <button
              className="redCta"
              type="button"
              onClick={clientSecret ? handlePayClick : startCheckout}
              disabled={starting || paying || !priceId || (!clientSecret && !userEmail)}
              title={!userEmail ? "Enter your email first" : ""}
            >
              {paying ? "Processing…" : clientSecret ? "Start My Subscription" : "Continue"}
            </button>
            <p className="tiny muted">
              By clicking “Start My Subscription”, you agree to our Terms of Service and Privacy Policy.
            </p>
          </aside>

          {/* Billing */}
          <div className="card billing" aria-label="Billing Information">
            <h3 className="cardTitle">Billing Information</h3>

            {!haveApiEmail && (
              <>
                <label className="lbl">Email<span style={{ color:"#b91c1c"}}> *</span></label>
                <input
                  className="inp"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </>
            )}

            <label className="lbl">Full Name</label>
            <input
              className="inp"
              value={billing.fullName}
              onChange={(e) => setBilling({ ...billing, fullName: e.target.value })}
              placeholder="John Smith"
              autoComplete="name"
            />

            <label className="lbl">Company Name</label>
            <input
              className="inp"
              value={billing.company}
              onChange={(e) => setBilling({ ...billing, company: e.target.value })}
              placeholder="Smith Digital Agency"
              autoComplete="organization"
            />

            <label className="lbl">Country</label>
            <select
              className="inp"
              value={billing.country}
              onChange={(e) => setBilling({ ...billing, country: e.target.value })}
            >
              {Object.keys(COUNTRY_NAME_TO_ISO).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <div className="row3">
              <div>
                <label className="lbl">Address (Optional)</label>
                <input
                  className="inp"
                  value={billing.address1}
                  onChange={(e) => setBilling({ ...billing, address1: e.target.value })}
                  placeholder="123 Business Street"
                  autoComplete="address-line1"
                />
              </div>
              <div>
                <label className="lbl">City (Optional)</label>
                <input
                  className="inp"
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                  placeholder="Dubai"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className="lbl">Postal (Optional)</label>
                <input
                  className="inp"
                  value={billing.postal}
                  onChange={(e) => setBilling({ ...billing, postal: e.target.value })}
                  placeholder="00000"
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          {clientSecret && subscriptionId && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm ref={payRef} subscriptionId={subscriptionId} mode={mode} />
            </Elements>
          )}
          {starting && !clientSecret && <div className="card payment">Initializing checkout…</div>}
        </section>
      </main>

      <style jsx>{`
        :root{ --bg:#f3f4f6; --text:#0f172a; --muted:#6b7280; --card:#fff; --border:#e5e7eb; --accent:#ff3b30; --green:#10b981; }
        .shell{ --nav-h:var(--navbar-height,72px); padding-top:calc(var(--nav-h)+16px); padding-bottom:40px; max-width:1100px; margin:0 auto; background:var(--bg); min-height:calc(100vh - var(--nav-h)); }
        .header{text-align:center;margin-bottom:8px}
        .logo{width:56px;height:56px;margin:0 auto 4px;border-radius:50%;display:grid;place-items:center;background:#fff;color:var(--accent);border:1px solid var(--border);font-weight:800}
        .checkoutGrid{display:grid;grid-template-columns:minmax(0,1fr) 360px;grid-template-areas:"selected summary" "billing summary" "payment summary";gap:20px;align-items:start}
        .selected{grid-area:selected;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .billing{grid-area:billing}
        .payment{grid-area:payment}
        .summary{grid-area:summary;position:sticky;top:16px}
        .card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px}
        .errbox{margin-top:12px;border-color:#fecaca;background:#fff1f2}
        .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#fff7ed;color:#b45309;border:1px solid #fed7aa;font-weight:600;font-size:12px}
        .subtle{color:var(--muted);font-size:12px;margin-top:6px}
        .selRight{text-align:right}
        .price{font-weight:800}
        .save{color:var(--green);font-size:12px}
        .summary h4{margin:0 0 8px}
        .summary ul{list-style:none;padding:0;margin:0 0 10px}
        .summary li{display:flex;justify-content:space-between;align-items:center;margin:8px 0}
        .discount strong.neg{color:#059669}
        .badgeRow{justify-content:flex-start}
        .badge{display:inline-block;padding:8px 10px;border-radius:10px;font-size:12px}
        .green{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
        .totalRow{align-items:flex-start}
        .total{font-weight:700}
        .totalAmt{font-weight:800}
        .redCta{width:100%;margin-top:8px;border:0;border-radius:12px;padding:12px 16px;background:#ff3b30;color:#fff;font-weight:700;transition:filter .12s ease}
        .redCta:disabled{filter:grayscale(.3);cursor:not-allowed}
        .lbl{display:block;font-size:12px;color:#4b5563;margin:12px 0 6px}
        .inp{border:1px solid var(--border);border-radius:12px;padding:12px;width:100%}
        .inp:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.15)}
        .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        @media (max-width:980px){
          .checkoutGrid{grid-template-columns:1fr;grid-template-areas:"summary" "selected" "billing" "payment"}
          .summary{position:static}
          .row3{grid-template-columns:1fr}
        }
      `}</style>
    </>
  );
}





