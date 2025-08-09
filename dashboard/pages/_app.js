

// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { NextSeo } from 'next-seo';
// import SSRProvider from 'react-bootstrap/SSRProvider';
// import { Analytics } from '@vercel/analytics/react';

// // Theme styles
// import 'styles/theme.scss';

// // Default layout
// import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   const pageURL = process.env.baseURL + router.pathname;
//   const title = "Dash UI - Next.Js Admin Dashboard Template";
//   const description = "Dash is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects.";
//   const keywords = "Dash UI, Nextjs, Next.js, admin themes, Nextjs admin, dashboard, ui kit";

//   // Use per-page layout if defined, else fallback to DefaultDashboardLayout
//   const getLayout = Component.getLayout || ((page) => <DefaultDashboardLayout>{page}</DefaultDashboardLayout>);

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
//         canonical={pageURL}
//         openGraph={{
//           url: pageURL,
//           title: title,
//           description: description,
//           site_name: process.env.siteName
//         }}
//       />
//       {getLayout(<Component {...pageProps} />)}
//       <Analytics />
//     </SSRProvider>
//   );
// }

// export default MyApp;
// C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { NextSeo } from 'next-seo';
// import SSRProvider from 'react-bootstrap/SSRProvider';
// import { Analytics } from '@vercel/analytics/react';
// import { useEffect } from 'react';

// // If you also want Bootstrap's default CSS (optional if your theme.scss already imports it):
// // import 'bootstrap/dist/css/bootstrap.min.css';
// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { config } from '@fortawesome/fontawesome-svg-core';
// config.autoAddCss = false;

// import '../lib/fontawesome';
// import 'styles/theme.scss';

// import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   // 👇 Load Bootstrap JS (dropdowns, collapse, etc.) on the client
//   useEffect(() => {
//     import('bootstrap/dist/js/bootstrap.bundle.min.js');
//   }, []);

//   const pageURL = process.env.baseURL + router.pathname;
//   const title = "Dash UI - Next.Js Admin Dashboard Template";
//   const description =
//     "Dash is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects.";
//   const keywords =
//     "Dash UI, Nextjs, Next.js, admin themes, Nextjs admin, dashboard, ui kit";

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
//         canonical={pageURL}
//         openGraph={{
//           url: pageURL,
//           title: title,
//           description: description,
//           site_name: process.env.siteName,
//         }}
//       />

//       {getLayout(<Component {...pageProps} />)}
//       <Analytics />
//     </SSRProvider>
//   );
// }

// export default MyApp;



// C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import axios from 'axios'; // <<< ADDED

// If you also want Bootstrap's default CSS (optional if your theme.scss already imports it):
// import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

import '../lib/fontawesome';
import 'styles/theme.scss';

import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

// <<< ADDED: set your prod backend once here
const PROD_BACKEND = 'https://project1backend-2xvq.onrender.com';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Load Bootstrap JS (dropdowns, collapse, etc.) on the client
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');

    // <<< ADDED: one-time global Axios setup (runs in browser only)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isProd =
        hostname.endsWith('.vercel.app') ||
        hostname.includes('project1-dash.vercel.app') ||
        hostname.includes('project1-o4nf.vercel.app');

      const base =
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
        (isProd ? PROD_BACKEND : 'http://localhost:5000');

      // Set default baseURL so relative calls like axios.get('/api/...') work
      axios.defaults.baseURL = base;

      // Rewrite any hardcoded localhost URLs on the fly (no refactor needed)
      const interceptorId = axios.interceptors.request.use((config) => {
        if (config?.url?.startsWith('http://localhost:5000')) {
          config.url = config.url.replace('http://localhost:5000', base);
        }
        return config;
      });

      // Cleanup on HMR/navigation
      return () => axios.interceptors.request.eject(interceptorId);
    }
  }, []);

  const pageURL = process.env.baseURL + router.pathname;
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
        canonical={pageURL}
        openGraph={{
          url: pageURL,
          title: title,
          description: description,
          site_name: process.env.siteName,
        }}
      />

      {getLayout(<Component {...pageProps} />)}
      <Analytics />
    </SSRProvider>
  );
}

export default MyApp;
