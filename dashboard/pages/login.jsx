// pages/login.jsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('demo@client.com');
  const [password, setPassword] = useState('123456');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'error'|'ok', text: string }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setMsg({ type: 'error', text: data?.message || 'Invalid email or password' });
      } else {
        setMsg({ type: 'ok', text: 'Signed in. Redirecting…' });
        const next = router.query.next?.toString() || '/dashboard';
        router.replace(next);
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Login</title></Head>

      <div className="wrap">
        <form className="card" onSubmit={onSubmit}>
          <div className="brand">
            <div className="logo">ION</div>
            <div>
              <h1>Welcome back</h1>
              <p>Sign in to continue</p>
            </div>
          </div>

          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label className="label">Password</label>
          <div className="field">
            <input
              className="input"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="row">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" onClick={e => { e.preventDefault(); alert('Ask admin to reset.'); }}>
              Forgot password?
            </a>
          </div>

          <button className={`btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>

          <div className={`msg ${msg?.type || ''}`}>{msg?.text || ''}</div>
        </form>
      </div>

      <style jsx>{`
        :root{
          --bg:#f3f4f6;
          --accent:#ff3b30;
          --accent-700:#e22e25;
          --text:#0f172a;
          --muted:#6b7280;
          --card:#ffffffcc;
          --ring:rgba(255,59,48,.18);
          --border:#e5e7eb;
          /* DARKER, HIGHER-CONTRAST border */
          --border-strong:#4b5563; /* slate-600 */
          --border-strong-hover:#374151; /* slate-700 */
          --placeholder:#9ca3af; /* gray-400 */
        }
        html,body,#__next{height:100%}
        body{
          margin:0;
          background: var(--bg);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          color:var(--text);
        }

        .wrap{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
        }

        .card{
          width:100%;
          max-width:440px;
          background:var(--card);
          border:1px solid var(--border);
          border-radius:16px;
          box-shadow:0 24px 70px rgba(0,0,0,.12);
          backdrop-filter:blur(8px);
          padding:28px;
          margin:0 auto;
        }

        .brand{display:flex;gap:12px;align-items:center;margin-bottom:6px}
        .logo{
          width:42px;height:42px;border-radius:10px;display:grid;place-items:center;
          background:#cde6b2;color:#1a2b1a;font-weight:800;
        }
        h1{margin:0;font-size:18px}
        .brand p{margin:2px 0 0;color:var(--muted);font-size:12px}

        .label{display:block;margin-top:16px;margin-bottom:6px;color:var(--muted);font-size:12px}
        .field{position:relative}

        /* MUCH DARKER border + subtle outer glow for visibility */
        .input{
          width:100%;
          background:#fff;
          border:2px solid var(--border-strong);
          border-radius:12px;
          padding:12px 44px 12px 14px;
          font-size:14px;
          outline:none;
          color:#111827;
          transition:border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
          box-shadow: 0 0 0 1px rgba(0,0,0,.08) inset;
        }
        .input::placeholder{ color: var(--placeholder); }
        .input:hover{
          border-color: var(--border-strong-hover);
        }
        .input:focus{
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--ring), 0 0 0 1px rgba(0,0,0,.08) inset;
        }

        .eye{
          position:absolute;right:8px;top:50%;transform:translateY(-50%);
          border:0;background:transparent;cursor:pointer;font-size:16px;opacity:.7
        }

        .row{margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
        .remember{display:flex;align-items:center;gap:8px;color:var(--muted)}
        .row a{color:#e22e25;text-decoration:none}
        .row a:hover{text-decoration:underline}

        .btn{
          margin-top:18px;
          width:100%;
          padding:12px 14px;
          border:0;
          border-radius:12px;
          background: linear-gradient(180deg, #ff3b30, #e22e25);
          color:#fff;
          font-weight:700;
          letter-spacing:.2px;
          cursor:pointer;
          box-shadow:0 16px 40px rgba(255,59,48,.35);
          transition: transform .06s ease, filter .15s ease;
        }
        .btn:hover:not(:disabled){ transform: translateY(-1px); filter: brightness(1.02); }
        .btn:disabled{ opacity:.7; cursor:not-allowed; color:#fff; background: linear-gradient(180deg, #ff3b30, #e22e25); }

        .msg{margin-top:10px;min-height:18px;font-size:13px}
        .msg.error{color:#d00}
        .msg.ok{color:#059669}
      `}</style>
    </>
  );
}

LoginPage.noChrome = true;
export default LoginPage;
