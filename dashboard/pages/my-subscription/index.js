

// dashboard/pages/my-subscription/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import SidebarDashly from "../../layouts/navbars/NavbarVertical";
import NavbarTop from "../../layouts/navbars/NavbarTop";
import { api } from "../../lib/api";

function formatDateFromUnix(ts) {
  if (!ts) return "--";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount, currency = "AED") {
  if (amount == null) return "--";
  return `${currency} ${(amount / 100).toFixed(2)}`;
}

function statusLabel(status) {
  if (!status) return { label: "Unknown", className: "badge bg-secondary" };
  const s = status.toLowerCase();
  if (s === "paid") return { label: "Paid", className: "badge bg-success" };
  if (s === "open") return { label: "Open", className: "badge bg-warning text-dark" };
  if (s === "draft") return { label: "Draft", className: "badge bg-secondary" };
  if (s === "uncollectible" || s === "void")
    return { label: "Cancelled", className: "badge bg-danger" };
  if (s === "upcoming") return { label: "Upcoming", className: "badge bg-warning text-dark" };
  return { label: status, className: "badge bg-secondary" };
}

export default function MySubscriptionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [planLabel, setPlanLabel] = useState("");
  const [billingInterval] = useState("Monthly"); // for now all your plans are monthly
  const [amount, setAmount] = useState(null);

  const [subscriptionId, setSubscriptionId] = useState("");
  const [status, setStatus] = useState("");
  const [nextBillingTs, setNextBillingTs] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  const [accountEmail, setAccountEmail] = useState("");

  const [invoiceRows, setInvoiceRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) User + subscription
        const me = await api.me();
        const user = me?.user;
        const sub = me?.subscription;

        setAccountEmail(user?.email || "");

        const priceId = user?.priceId || me?.meta?.priceId || "";
        let plan = "Basic";
        if (priceId.toLowerCase().includes("pro")) plan = "Pro";
        setPlanLabel(plan);

        // Quick amount guess – you can also call api.getPrice(priceId)
        if (plan === "Pro") setAmount(19900); // 199.00 AED
        else setAmount(10900); // 109.00 AED

        if (sub?.id) setSubscriptionId(sub.id);
        if (sub?.status) setStatus(sub.status);

        if (sub?.current_period_end) {
          const endTs = sub.current_period_end;
          setNextBillingTs(endTs);
          const now = Date.now() / 1000;
          const diffDays = Math.max(
            0,
            Math.ceil((endTs - now) / (60 * 60 * 24))
          );
          setDaysRemaining(diffDays);
        }

        // 2) Real invoices from backend (Stripe)
        const billing = await api.billingInvoices();
        const items = Array.isArray(billing?.items) ? billing.items : [];
        const upcoming = billing?.upcoming || null;

        // Build rows array.
        const rows = [...items.map((inv) => ({ ...inv, isUpcoming: false }))];

        // Add synthetic "upcoming" row if Stripe returned one and it's not already in list
        if (upcoming && (!upcoming.id || !rows.find((r) => r.id === upcoming.id))) {
          rows.unshift({
            ...upcoming,
            isUpcoming: true,
            status: "upcoming",
          });
        }

        // Sort newest first by created timestamp if available
        rows.sort((a, b) => (b.created || 0) - (a.created || 0));

        setInvoiceRows(rows);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to load subscription");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nextBillingLabel = nextBillingTs ? formatDateFromUnix(nextBillingTs) : "--";
  const daysRemainingLabel =
    daysRemaining == null ? "--" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;

  return (
    <>
      <Head>
        <title>My Subscription - ION7</title>
      </Head>

      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <SidebarDashly
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCompact={sidebarCompact}
          setIsCompact={setSidebarCompact}
        />

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ marginLeft: sidebarCompact ? 72 : 250 }}
        >
          <NavbarTop isMobile={sidebarCompact} />

          <main className="flex-grow-1 px-4 py-4">
            <h5 className="text-white mb-1">My Subscription</h5>
            <p className="text-muted mb-4" style={{ maxWidth: 520 }}>
              View your current plan, billing history and payment methods.
            </p>

            {loading ? (
              <div className="text-muted">Loading subscription…</div>
            ) : err ? (
              <div className="alert alert-danger py-2 px-3">{err}</div>
            ) : (
              <>
                {/* Top row: current sub / payment method / account */}
                <div className="row g-3 mb-3">
                  {/* Current subscription */}
                  <div className="col-lg-6">
                    <div className="card h-100 bg-dark text-white border-0 rounded-4 p-4">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <div className="small text-uppercase text-secondary fw-semibold">
                            Current Subscription
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <span className="badge bg-warning text-dark rounded-pill px-3 py-1">
                              {planLabel || "—"}
                            </span>
                            <span className="badge bg-secondary rounded-pill px-3 py-1">
                              {billingInterval}
                            </span>
                            {status && (
                              <span className="badge bg-success rounded-pill px-3 py-1 text-capitalize">
                                {status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="display-5 fw-bold mb-2">
                        {amount == null
                          ? "—"
                          : `AED ${(amount / 100).toFixed(2)}`}
                        <span className="fs-6 text-secondary ms-1">/month</span>
                      </div>

                      <div className="small text-secondary mb-1">
                        Subscription ID: {subscriptionId || "—"}
                      </div>

                      <div className="mt-3">
                        <div className="small text-uppercase text-secondary fw-semibold mb-1">
                          Billing period
                        </div>
                        <div className="small">
                          Next billing date:{" "}
                          <span className="fw-semibold text-white">
                            {nextBillingLabel}
                          </span>
                        </div>
                        <div className="small">
                          Days remaining:{" "}
                          <span className="fw-semibold text-white">
                            {daysRemainingLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment method (placeholder) */}
                  <div className="col-lg-3">
                    <div className="card h-100 bg-dark text-white border-0 rounded-4 p-4">
                      <div className="small text-uppercase text-secondary fw-semibold mb-2">
                        Payment Method
                      </div>
                      <div className="fw-semibold mb-1">
                        {/* Static text until you wire real PM from Stripe */}
                        Visa ending in 4242
                      </div>
                      <div className="small text-secondary mb-4">Expires 12/29</div>
                      <button className="btn btn-outline-light w-100 rounded-pill py-2">
                        Update payment method
                      </button>
                    </div>
                  </div>

                  {/* Account box */}
                  <div className="col-lg-3">
                    <div className="card h-100 bg-dark text-white border-0 rounded-4 p-4">
                      <div className="small text-uppercase text-secondary fw-semibold mb-2">
                        Account
                      </div>
                      <div className="small text-secondary mb-1">Signed in as</div>
                      <div className="fw-semibold mb-4">
                        {accountEmail || "—"}
                      </div>
                      <button className="btn btn-outline-light w-100 rounded-pill py-2">
                        Manage billing details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom row: billing trend + invoices */}
                <div className="row g-3">
                  {/* Billing trend placeholder */}
                  <div className="col-lg-6">
                    <div className="card h-100 bg-dark text-white border-0 rounded-4 p-4">
                      <div className="d-flex justify-content-between mb-2">
                        <div className="small text-uppercase text-secondary fw-semibold">
                          Billing Trend
                        </div>
                        <div className="small text-secondary">Last 6 months</div>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-secondary small">
                        (Chart placeholder — we’ll plug real Stripe data later.)
                      </div>
                    </div>
                  </div>

                  {/* Invoices table */}
                  <div className="col-lg-6">
                    <div className="card h-100 bg-dark text-white border-0 rounded-4 p-0">
                      <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
                        <div className="small text-uppercase text-secondary fw-semibold">
                          Invoices
                        </div>
                        <div className="small text-secondary">
                          Showing recent invoices
                        </div>
                      </div>
                      <div className="table-responsive px-3 pb-3">
                        <table className="table table-dark table-sm mb-0 align-middle">
                          <thead>
                            <tr style={{ fontSize: 12 }}>
                              <th style={{ width: "32%" }}>Invoice</th>
                              <th style={{ width: "20%" }}>Date</th>
                              <th style={{ width: "20%" }}>Amount</th>
                              <th style={{ width: "16%" }}>Status</th>
                              <th style={{ width: "12%" }} className="text-end">
                                Download
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center text-secondary small py-4">
                                  No invoices yet.
                                </td>
                              </tr>
                            ) : (
                              invoiceRows.map((inv) => {
                                const { label, className } = statusLabel(inv.status);
                                const createdLabel = inv.created
                                  ? formatDateFromUnix(inv.created)
                                  : "--";
                                const amountLabel = formatAmount(
                                  inv.amount,
                                  inv.currency || "AED"
                                );
                                const canDownload =
                                  !!inv.invoice_pdf || !!inv.hosted_invoice_url;
                                const num =
                                  inv.number ||
                                  (inv.isUpcoming ? "Upcoming invoice" : inv.id);

                                return (
                                  <tr key={inv.id || num} style={{ fontSize: 13 }}>
                                    <td>{num}</td>
                                    <td>{createdLabel}</td>
                                    <td>{amountLabel}</td>
                                    <td>
                                      <span className={className}>{label}</span>
                                    </td>
                                    <td className="text-end">
                                      {canDownload ? (
                                        <a
                                          href={inv.invoice_pdf || inv.hosted_invoice_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
                                        >
                                          Download
                                        </a>
                                      ) : (
                                        <button
                                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
                                          disabled
                                        >
                                          Download
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}













