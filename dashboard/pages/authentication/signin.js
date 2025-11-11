

// dashboard/pages/authentication/signin.jsx
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { api, setToken } from "../../lib/api";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'error'|'ok', text: string }

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setMsg(null);
    setLoading(true);
    try {
      // 1) Login → store JWT
      const res = await api.login(email.trim().toLowerCase(), password);
      if (!res?.token) throw new Error(res?.error || "No token returned");
      setToken(res.token);

      // 2) Ask backend where to go next
      setMsg({ type: "ok", text: "Signed in. Checking your subscription…" });
      const me = await api.me(); // -> { next: 'dashboard' | 'checkout' | 'choose-plan' }

      const map = { dashboard: "/dashboard", checkout: "/checkout", "choose-plan": "/choose-plan" };
      router.replace(map[me?.next] || "/choose-plan");
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Sign in</title></Head>
      <div className="wrap">
        <form className="card" onSubmit={onSubmit} autoComplete="off">
          {/* hidden dummies to defeat browser autofill */}
          <input type="text" name="fake-user" autoComplete="username" style={{ display: "none" }} />
          <input type="password" name="fake-pass" autoComplete="current-password" style={{ display: "none" }} />

          <div className="brand">
            <div className="logo">ION</div>
            <div>
              <h1>Access your workspace</h1>
              <p>Sign in to continue</p>
            </div>
          </div>

          <label className="label">Business Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            inputMode="email"
            name="email"
            spellCheck={false}
            placeholder="you@company.com"
          />

          <label className="label">Password</label>
          <div className="field">
            <input
              className="input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="row">
            <span />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Ask admin to reset.");
              }}
            >
              Forgot password?
            </a>
          </div>

          <button className={`btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className={`msg ${msg?.type || ""}`}>{msg?.text || ""}</div>

          <div className="foot">
            Don’t have an account?{" "}
            <a href="/authentication/signup" className="link">Create one</a>
          </div>
        </form>
      </div>

      <style jsx>{`
        :root{
          --bg:#f3f4f6; --accent:#ff3b30; --accent-700:#e22e25; --text:#0f172a;
          --muted:#6b7280; --card:#ffffffcc; --ring:rgba(255,59,48,.18);
          --border:#e5e7eb; --border-strong:#4b5563; --border-strong-hover:#374151; --placeholder:#9ca3af;
        }
        html,body,#__next{height:100%}
        body{ margin:0; background: var(--bg); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:var(--text); }
        .wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .card{ width:100%; max-width:440px; background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:0 24px 70px rgba(0,0,0,.12); backdrop-filter:blur(8px); padding:28px; margin:0 auto; }
        .brand{display:flex;gap:12px;align-items:center;margin-bottom:6px}
        .logo{ width:42px;height:42px;border-radius:10px;display:grid;place-items:center;background:#cde6b2;color:#1a2b1a;font-weight:800; }
        h1{margin:0;font-size:18px}
        .brand p{margin:2px 0 0;color:var(--muted);font-size:12px}
        .label{display:block;margin-top:16px;margin-bottom:6px;color:var(--muted);font-size:12px}
        .field{position:relative}
        .input{ width:100%; background:#fff; border:2px solid var(--border-strong); border-radius:12px; padding:12px 44px 12px 14px; font-size:14px; outline:none; color:#111827; transition:border-color .15s ease, box-shadow .15s ease, background-color .15s ease; box-shadow: 0 0 0 1px rgba(0,0,0,.08) inset; }
        .input::placeholder{ color: var(--placeholder); }
        .input:hover{ border-color: var(--border-strong-hover); }
        .input:focus{ border-color: var(--accent); box-shadow: 0 0 0 4px var(--ring), 0 0 0 1px rgba(0,0,0,.08) inset; }
        .eye{ position:absolute;right:8px;top:50%;transform:translateY(-50%); border:0;background:transparent;cursor:pointer;font-size:16px;opacity:.7 }
        .row{margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
        .row a{color:#e22e25;text-decoration:none}
        .row a:hover{text-decoration:underline}
        .btn{ margin-top:16px; width:100%; padding:12px 14px; border:0; border-radius:12px; background: linear-gradient(180deg, #ff3b30, #e22e25); color:#fff; font-weight:700; letter-spacing:.2px; cursor:pointer; box-shadow:0 16px 40px rgba(255,59,48,.35); transition: transform .06s ease, filter .15s ease; }
        .btn:hover:not(:disabled){ transform: translateY(-1px); filter: brightness(1.02); }
        .btn:disabled{ opacity:.7; cursor:not-allowed; color:#fff; background: linear-gradient(180deg, #ff3b30, #e22e25); }
        .msg{margin-top:10px;min-height:18px;font-size:13px}
        .msg.error{color:#d00}
        .msg.ok{color:#059669}
        .foot{ margin-top:14px; text-align:center; font-size:13px; color:var(--muted); }
        .foot .link{ color:#e22e25; text-decoration:none; }
        .foot .link:hover{ text-decoration:underline; }
      `}</style>
    </>
  );
}

SignIn.noChrome = true;














