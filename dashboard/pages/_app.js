


// // C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { NextSeo } from 'next-seo';
// import SSRProvider from 'react-bootstrap/SSRProvider';
// import { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';

// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { config } from '@fortawesome/fontawesome-svg-core';
// config.autoAddCss = false;

// import '../lib/fontawesome';
// import 'styles/theme.scss';

// import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// // Central fallback for prod backend
// const PROD_BACKEND = 'https://project1backend-2xvq.onrender.com';

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   // ---- Analytics toggle (avoid 404 on /_vercel/insights/script.js) ----
//   const [AnalyticsComp, setAnalyticsComp] = useState(null);
//   const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

//   useEffect(() => {
//     if (analyticsEnabled) {
//       import('@vercel/analytics/react')
//         .then(m => setAnalyticsComp(() => m.Analytics))
//         .catch(() => setAnalyticsComp(null));
//     }
//   }, [analyticsEnabled]);

//   // ---- Bootstrap JS on client only ----
//   useEffect(() => {
//     import('bootstrap/dist/js/bootstrap.bundle.min.js');
//   }, []);

//   // ---- Axios global baseURL + interceptor on client only ----
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const hostname = window.location.hostname;
//     const isProd =
//       hostname.endsWith('.vercel.app') ||
//       hostname.includes('project1-dash.vercel.app') ||
//       hostname.includes('project1-o4nf.vercel.app');

//     const base =
//       process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
//       (isProd ? PROD_BACKEND : 'http://localhost:5000');

//     // 1) Default baseURL for all axios calls that use relative paths
//     axios.defaults.baseURL = base;

//     // 2) Intercept any hardcoded localhost URLs and rewrite to the chosen base
//     const id = axios.interceptors.request.use((cfg) => {
//       if (typeof cfg.url === 'string' && cfg.url.startsWith('http://localhost:5000')) {
//         cfg.url = cfg.url.replace('http://localhost:5000', base);
//       }
//       return cfg;
//     });

//     return () => axios.interceptors.request.eject(id);
//   }, []);

//   const canonical = useMemo(() => {
//     if (typeof window !== 'undefined') {
//       return `${window.location.origin}${router.asPath || ''}`;
//     }

//     return undefined;
//   }, [router.asPath]);

//   const title = 'Dash UI - Next.Js Admin Dashboard Template';
//   const description =
//     'Dash is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects.';
//   const keywords =
//     'Dash UI, Nextjs, Next.js, admin themes, Nextjs admin, dashboard, ui kit';

//   const getLayout =
//     Component.getLayout ||
//     ((page) => <DefaultDashboardLayout>{page}</DefaultDashboardLayout>);

//   return (
//     <SSRProvider>
//       <Head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <meta name="keywords" content={keywords} />
//         <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
//       </Head>

//       <NextSeo
//         title={title}
//         description={description}
//         canonical={canonical}
//         openGraph={{
//           url: canonical,
//           title,
//           description,
//           site_name: process.env.NEXT_PUBLIC_SITE_NAME || 'Dash UI',
//         }}
//       />

//       {getLayout(<Component {...pageProps} />)}


//       {analyticsEnabled && AnalyticsComp ? <AnalyticsComp /> : null}
//     </SSRProvider>
//   );
// }

// export default MyApp;




// // C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { NextSeo } from 'next-seo';
// import SSRProvider from 'react-bootstrap/SSRProvider';
// import { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';

// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { config } from '@fortawesome/fontawesome-svg-core';
// config.autoAddCss = false;

// import '../lib/fontawesome';
// import 'styles/theme.scss';

// import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// // --- Choose backend base URL (priority: ENV → window override → EC2 IP) ---
// function resolveApiBase() {
//   // Server-side: only env is available
//   if (typeof window === 'undefined') {
//     return (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://3.109.207.179').trim();
//   }
//   // Client-side: allow an inline override via window.__API_BASE__
//   const w = window;
//   const fromWindow = (w && w.__API_BASE__ && String(w.__API_BASE__).trim()) || '';
//   const fromEnv = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '').trim();
//   return (fromEnv || fromWindow || 'http://3.109.207.179');
// }

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   // ---- Analytics toggle (avoid 404 on /_vercel/insights/script.js) ----
//   const [AnalyticsComp, setAnalyticsComp] = useState(null);
//   const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

//   useEffect(() => {
//     if (analyticsEnabled) {
//       import('@vercel/analytics/react')
//         .then((m) => setAnalyticsComp(() => m.Analytics))
//         .catch(() => setAnalyticsComp(null));
//     }
//   }, [analyticsEnabled]);

//   // ---- Bootstrap JS on client only ----
//   useEffect(() => {
//     import('bootstrap/dist/js/bootstrap.bundle.min.js');
//   }, []);

//   // ---- Axios global baseURL + interceptor on client only ----
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const base = resolveApiBase();

//     // 1) Default baseURL for all axios calls that use relative paths
//     axios.defaults.baseURL = base;

//     // 2) Intercept and rewrite any old hosts → chosen base
//     const id = axios.interceptors.request.use((cfg) => {
//       if (!cfg?.url) return cfg;
//       const current = String(cfg.url);

//       // Rewrite *any* hardcoded hosts we were using before
//       let nextUrl = current
//         .replace('https://project1backend-2xvq.onrender.com', base)
//         .replace('http://localhost:5000', base);

//       // If still a relative URL, prefix with base
//       if (!/^https?:\/\//i.test(nextUrl)) {
//         nextUrl = `${base}${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
//       }

//       cfg.url = nextUrl;
//       return cfg;
//     });

//     return () => axios.interceptors.request.eject(id);
//   }, []);

//   // Canonical URL for SEO
//   const canonical = useMemo(() => {
//     if (typeof window !== 'undefined') {
//       return `${window.location.origin}${router.asPath || ''}`;
//     }
//     return undefined;
//   }, [router.asPath]);

//   const title = 'Dash UI - Next.Js Admin Dashboard Template';
//   const description =
//     'Dash is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects.';
//   const keywords =
//     'Dash UI, Nextjs, Next.js, admin themes, Nextjs admin, dashboard, ui kit';

//   const getLayout =
//     Component.getLayout ||
//     ((page) => <DefaultDashboardLayout>{page}</DefaultDashboardLayout>);

//   return (
//     <SSRProvider>
//       <Head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <meta name="keywords" content={keywords} />
//         <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
//       </Head>

//       <NextSeo
//         title={title}
//         description={description}
//         canonical={canonical}
//         openGraph={{
//           url: canonical,
//           title,
//           description,
//           site_name: process.env.NEXT_PUBLIC_SITE_NAME || 'Dash UI',
//         }}
//       />

//       {getLayout(<Component {...pageProps} />)}

//       {analyticsEnabled && AnalyticsComp ? <AnalyticsComp /> : null}
//     </SSRProvider>
//   );
// }

// export default MyApp;





// C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

import '../lib/fontawesome';

// ✅ Load your theme first, then your custom overrides
import 'styles/theme.scss';
import 'styles/_user.scss'; // <-- make sure this path points to your SCSS file with updated styles

import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// --- Choose backend base URL (priority: ENV → window override → EC2 IP) ---
function resolveApiBase() {
  if (typeof window === 'undefined') {
    return (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://3.109.207.179').trim();
  }
  const w = window;
  const fromWindow = (w && w.__API_BASE__ && String(w.__API_BASE__).trim()) || '';
  const fromEnv = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '').trim();
  return (fromEnv || fromWindow || 'http://3.109.207.179');
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [AnalyticsComp, setAnalyticsComp] = useState(null);
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  useEffect(() => {
    if (analyticsEnabled) {
      import('@vercel/analytics/react')
        .then((m) => setAnalyticsComp(() => m.Analytics))
        .catch(() => setAnalyticsComp(null));
    }
  }, [analyticsEnabled]);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = resolveApiBase();
    axios.defaults.baseURL = base;
    const id = axios.interceptors.request.use((cfg) => {
      if (!cfg?.url) return cfg;
      const current = String(cfg.url);
      let nextUrl = current
        .replace('https://project1backend-2xvq.onrender.com', base)
        .replace('http://localhost:5000', base);
      if (!/^https?:\/\//i.test(nextUrl)) {
        nextUrl = `${base}${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
      }
      cfg.url = nextUrl;
      return cfg;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  const canonical = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${router.asPath || ''}`;
    }
    return undefined;
  }, [router.asPath]);

  const title = 'Dash UI - Next.Js Admin Dashboard Template';
  const description =
    'Dash is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects.';
  const keywords =
    'Dash UI, Nextjs, Next.js, admin themes, Nextjs admin, dashboard, ui kit';

  const getLayout =
    Component.getLayout ||
    ((page) => <DefaultDashboardLayout>{page}</DefaultDashboardLayout>);

  return (
    <SSRProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>

      <NextSeo
        title={title}
        description={description}
        canonical={canonical}
        openGraph={{
          url: canonical,
          title,
          description,
          site_name: process.env.NEXT_PUBLIC_SITE_NAME || 'Dash UI',
        }}
      />

      {getLayout(<Component {...pageProps} />)}

      {analyticsEnabled && AnalyticsComp ? <AnalyticsComp /> : null}
    </SSRProvider>
  );
}

export default MyApp;
