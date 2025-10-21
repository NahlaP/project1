


// C:\Users\97158\Desktop\project1\dashboard\pages\_app.js
import 'bootstrap/dist/css/bootstrap.min.css';

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

import 'styles/theme.scss';
import 'styles/_user.scss';

import DefaultDashboardLayout from 'layouts/DefaultDashboardLayout';

const PROD_BACKEND = 'https://project1backend-2xvq.onrender.com';

function MyApp({ Component, pageProps }) {

  
  const router = useRouter();

  // ---- Analytics toggle ----
  const [AnalyticsComp, setAnalyticsComp] = useState(null);
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  useEffect(() => {
    if (analyticsEnabled) {
      import('@vercel/analytics/react')
        .then(m => setAnalyticsComp(() => m.Analytics))
        .catch(() => setAnalyticsComp(null));
    }
  }, [analyticsEnabled]);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isProd =
      hostname.endsWith('.vercel.app') ||
      hostname.includes('project1-dash.vercel.app') ||
      hostname.includes('project1-o4nf.vercel.app');

    const base =
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
      (isProd ? PROD_BACKEND : 'http://localhost:5000');

    axios.defaults.baseURL = base;

    const id = axios.interceptors.request.use((cfg) => {
      if (typeof cfg.url === 'string' && cfg.url.startsWith('http://localhost:5000')) {
        cfg.url = cfg.url.replace('http://localhost:5000', base);
      }
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

  // default layout
  const getLayout =
    Component.getLayout ||
    ((page) => <DefaultDashboardLayout>{page}</DefaultDashboardLayout>);

  const noChrome = Component.noChrome || router.pathname === '/login';

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

      {noChrome ? (
    
        <Component {...pageProps} />
      ) : (
        
        getLayout(<Component {...pageProps} />)
      )}

      {analyticsEnabled && AnalyticsComp ? <AnalyticsComp /> : null}
    </SSRProvider>
  );
}

export default MyApp;
