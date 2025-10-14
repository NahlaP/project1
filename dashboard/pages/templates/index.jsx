// // pages/templates/index.jsx
// import { useEffect, useState } from 'react';
// import Head from 'next/head';
// import { api, getUserId } from '../../lib/api'; // ← RELATIVE import
// import { useRouter } from 'next/router';

// export default function TemplateChooser() {
//   const router = useRouter();
//   const userId = getUserId(); // decoded from JWT (falls back to "demo-user")

//   const [loading, setLoading] = useState(true);
//   const [templates, setTemplates] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     (async () => {
//       try {
//         const list = await api.listTemplates();
//         setTemplates(list?.data || []);
//         const sel = await api.selectedTemplateForUser(userId);
//         setSelected(sel?.data?.templateId || null);
//       } catch (e) {
//         setError(e.message || 'Failed to load templates');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [userId]);

//   async function selectTemplate(templateId) {
//     try {
//       setSaving(true);
//       await api.selectTemplate(templateId, userId);
//       setSelected(templateId);
//     } catch (e) {
//       alert(e.message || 'Failed to select template');
//     } finally {
//       setSaving(false);
//     }
//   }

//   function goEditor() {
//     // TODO: replace with your actual editor route if different
//     router.push('/editorpages/page/68936e2e6fe52575397b943e');
//   }

//   if (loading) return <div className="center">Loading templates…</div>;
//   if (error)   return <div className="center error">{error}</div>;

//   return (
//     <>
//       <Head><title>Choose Template</title></Head>
//       <main className="page">
//         <div className="head">
//           <h1>Choose Your Template</h1>
//           <div className="spacer" />
//           <button className="btn ghost" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
//         </div>

//         <p className="muted">Pick a template to customize. You can switch anytime. Your current selection is highlighted.</p>

//         <div className="grid">
//           {templates.map(t => (
//             <article key={t.templateId} className={`card ${selected === t.templateId ? 'active' : ''}`}>
//               <div className="thumb" aria-hidden />
//               <h3>{t.name}</h3>
//               <p className="sub">ID: {t.templateId}</p>
//               <div className="row">
//                 <button
//                   className="btn"
//                   disabled={saving || selected === t.templateId}
//                   onClick={() => selectTemplate(t.templateId)}
//                   title={selected === t.templateId ? 'Already selected' : 'Select this template'}
//                 >
//                   {selected === t.templateId ? 'Selected ✓' : (saving ? 'Saving…' : 'Select')}
//                 </button>
//                 <button className="btn ghost" onClick={() => router.push(`/templates/preview/${t.templateId}`)}>
//                   Preview
//                 </button>
//               </div>
//             </article>
//           ))}
//         </div>

//         <div className="footer">
//           <button className="btn primary" onClick={goEditor} disabled={!selected}>
//             Open Editor
//           </button>
//         </div>
//       </main>

//       <style jsx>{`
//         .page { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
//         .head { display:flex; align-items:center; gap:12px; }
//         .spacer { flex:1; }
//         .muted { color:#6b7280; margin:8px 0 18px; }
//         .grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
//         .card { border:1px solid #e5e7eb; border-radius:14px; padding:14px; background:#fff; box-shadow:0 8px 24px rgba(0,0,0,.04); }
//         .card.active { border-color:#2563eb; box-shadow:0 10px 28px rgba(37,99,235,.18); }
//         .thumb { height:140px; border-radius:10px; background:linear-gradient(135deg,#f5f7fa,#e4ecf7); margin-bottom:10px; }
//         h3 { margin:4px 0 2px; font-size:16px; }
//         .sub { color:#6b7280; margin:0 0 8px; font-size:12px; }
//         .row { display:flex; gap:8px; }
//         .btn { border:0; padding:10px 12px; border-radius:10px; background:#111827; color:#fff; cursor:pointer; }
//         .btn.primary { background:#2563eb; }
//         .btn.ghost { background:#fff; color:#111827; border:1px solid #e5e7eb; }
//         .btn:disabled { opacity:.6; cursor:not-allowed; }
//         .footer { display:flex; justify-content:flex-end; margin-top:22px; }
//         .center { text-align:center; padding:40px 0; }
//         .center.error { color:#b91c1c; }
//       `}</style>
//     </>
//   );
// }



// pages/templates/index.jsx
import Link from "next/link";

export default function TemplatesIndex() {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h3>Templates page moved</h3>
      <p>
        Go to the <Link href="/dashboard">Dashboard</Link> to pick a template.
      </p>
    </div>
  );
}
