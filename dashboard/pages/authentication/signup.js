
// dashboard/pages/authentication/signup.jsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [company, setCompany]   = useState('');
  const [country, setCountry]   = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [agree, setAgree]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!formRef.current) return;
      const els = formRef.current.querySelectorAll('input[type=text],input[type=password],input[type=email]');
      els.forEach(el => { if (el.value) el.value = ''; });
      setFullName(''); setCompany(''); setCountry(''); setEmail('');
      setPassword(''); setConfirm('');
    }, 50);
    return () => clearTimeout(t);
  }, []);

  function validPassword(pw) {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (password !== confirm) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    if (!validPassword(password)) return setMsg({ type: 'error', text: 'Password must be 8+ chars, include an uppercase letter and a number.' });
    if (!agree) return setMsg({ type: 'error', text: 'Please agree to the Terms and Privacy Policy.' });

    setLoading(true);
    try {
      await api.signup(fullName, company, country, email, password);
      setMsg({ type: 'ok', text: 'Account created. Please sign in…' });
      router.replace('/authentication/signin');
    } catch (e) {
      setMsg({ type: 'error', text: e?.message || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Sign up</title></Head>

      <div className="wrap">
        <form ref={formRef} className="card" onSubmit={onSubmit} autoComplete="off">
          {/* hidden dummy fields to defeat autofill */}
          <input type="text" name="fake-user" autoComplete="username" style={{display:'none'}} />
          <input type="password" name="fake-pass" autoComplete="new-password" style={{display:'none'}} />

          <div className="brand">
            <div className="logo">ION</div>
            <div>
              <h1>Create your account</h1>
              <p>Join thousands of businesses using ION7</p>
            </div>
          </div>

          <label className="label">Full Name *</label>
          <input className="input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required name="full-name" spellCheck={false} />

          <label className="label">Company / Brand (optional)</label>
          <input className="input" type="text" value={company} onChange={e => setCompany(e.target.value)} name="company" spellCheck={false} />

          <label className="label">Country *</label>
          <input className="input" type="text" value={country} onChange={e => setCountry(e.target.value)} required name="country" spellCheck={false} />

          <label className="label">Business Email *</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required name="business-email" inputMode="email" spellCheck={false} />

          <label className="label">Password *</label>
          <div className="field">
            <input className="input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" name="new-password" />
            <button type="button" className="eye" onClick={() => setShowPwd(v => !v)} aria-label={showPwd ? 'Hide password' : 'Show password'}>{showPwd ? '🙈' : '👁️'}</button>
          </div>

          <label className="label">Confirm Password *</label>
          <div className="field">
            <input className="input" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" name="confirm-password" />
            <button type="button" className="eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>{showConfirm ? '🙈' : '👁️'}</button>
          </div>

          <div className="hint">Password must contain: • at least 8 characters • one uppercase letter • one number</div>

          <div className="row row-wrap">
            <label className="remember">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              I agree to the&nbsp;<a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>&nbsp;and&nbsp;
              <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            </label>
          </div>

          <button className={`btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>

          <div className={`msg ${msg?.type || ''}`}>{msg?.text || ''}</div>

          <div className="foot">
            Already have an account? <a href="/authentication/signin" className="link">Sign in</a>
          </div>
        </form>
      </div>

      <style jsx>{`
        :root{
          --bg:#f3f4f6; --accent:#ff3b30; --accent-700:#e22e25; --text:#0f172a;
          --muted:#6b7280; --card:#ffffffcc; --ring:rgba(255,59,48,.18); --border:#e5e7eb;
          --border-strong:#4b5563; --border-strong-hover:#374151; --placeholder:#9ca3af;
        }
        html,body,#__next{height:100%}
        body{ margin:0; background:var(--bg); font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:var(--text); }
        .wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .card{ width:100%; max-width:440px; background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:0 24px 70px rgba(0,0,0,.12); backdrop-filter:blur(8px); padding:28px; margin:0 auto; }
        .brand{display:flex;gap:12px;align-items:center;margin-bottom:6px}
        .logo{ width:42px;height:42px;border-radius:10px;display:grid;place-items:center;background:#cde6b2;color:#1a2b1a;font-weight:800; }
        h1{margin:0;font-size:18px}
        .brand p{margin:2px 0 0;color:var(--muted);font-size:12px}
        .label{display:block;margin-top:16px;margin-bottom:6px;color:var(--muted);font-size:12px}
        .field{position:relative}
        .input{ width:100%; background:#fff; border:2px solid var(--border-strong); border-radius:12px; padding:12px 44px 12px 14px; font-size:14px; outline:none; color:#111827; transition:border-color .15s ease, box-shadow .15s ease, background-color .15s ease; box-shadow: 0 0 0 1px rgba(0,0,0,.08) inset; }
        .input:hover{ border-color: var(--border-strong-hover); }
        .input:focus{ border-color: var(--accent); box-shadow: 0 0 0 4px var(--ring), 0 0 0 1px rgba(0,0,0,.08) inset; }
        .eye{ position:absolute;right:8px;top:50%;transform:translateY(-50%); border:0;background:transparent;cursor:pointer;font-size:16px;opacity:.7 }
        .hint{ margin-top:8px; border-radius:10px; background:#f9fafb; border:1px solid var(--border); padding:10px 12px; font-size:12px; color:#4b5563; }
        .row{margin-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
        .row-wrap{justify-content:flex-start}
        .remember{display:flex;align-items:center;gap:8px;color:var(--muted)}
        .remember a{color:#e22e25;text-decoration:none}
        .remember a:hover{text-decoration:underline}
        .btn{ margin-top:16px; width:100%; padding:12px 14px; border:0; border-radius:12px; background: linear-gradient(180deg, #ff3b30, #e22e25); color:#fff; font-weight:700; letter-spacing:.2px; cursor:pointer; box-shadow:0 16px 40px rgba(255,59,48,.35); }
        .btn:hover:not(:disabled){ filter: brightness(1.02); }
        .btn:disabled{ opacity:.7; cursor:not-allowed; }
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

SignUp.noChrome = true;
