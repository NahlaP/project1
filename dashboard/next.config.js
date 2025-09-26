// // for cpanel upload
// // C:\Users\97158\Desktop\project1\dashboard\next.config.js

// const BACKEND_ORIGIN =
//   process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";

// const CPANEL_HOST = (process.env.NEXT_PUBLIC_CPANEL_HOST || "ion7.mavsketch.com")
//   .replace(/^https?:\/\//, "");

// module.exports = {
//   reactStrictMode: true,
//   images: {
//     // Enable modern formats and responsive sizing (faster!)
//     formats: ["image/avif", "image/webp"],
//     deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

//     remotePatterns: [
//       // new uploads on cPanel
//       { protocol: "https", hostname: CPANEL_HOST, pathname: "/uploads/**" },
//       { protocol: "http",  hostname: CPANEL_HOST, pathname: "/uploads/**" },

//       // old theme/static assets many sections still use
//       { protocol: "https", hostname: CPANEL_HOST, pathname: "/assets/img/**" },
//       { protocol: "http",  hostname: CPANEL_HOST, pathname: "/assets/img/**" },
//     ],

//     // Dev-only fallback if needed to debug hotlink issues:
//     // unoptimized: true,
//   },

//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
// };









// local s3
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'project1-uploads-12345.s3.ap-south-1.amazonaws.com',
//       },
//       // if any legacy images still come from cPanel:
//       // { protocol: 'https', hostname: 'ion7.mavsketch.com' },
//     ],
//   },
//   async rewrites() {
//     const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';
//     const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-12345';
//     const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-south-1';
//     const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

//     return [
//       { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },
//       { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
//     ];
//   },
// };
// module.exports = nextConfig;





// // og current local works fine but not ec2
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'project1-uploads-12345.s3.ap-south-1.amazonaws.com',
//       },
//       // { protocol: 'https', hostname: 'ion7.mavsketch.com' },
//     ],
//   },
//   async rewrites() {
//     const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';
//     const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-12345';
//     const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-south-1';
//     const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

//     return [
      
//       { source: '/next-api/:path*', destination: '/api/:path*' },

//       // Backend Express routes stay on /api/*
//       { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },

//       // Static from S3
//       { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
//     ];
//   },
// };

// module.exports = nextConfig;






/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'project1-uploads-12345.s3.ap-south-1.amazonaws.com' },
    ],
  },
  async rewrites() {
    const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';
    const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-12345';
    const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-south-1';
    const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    return [
      // keep your client code working
      { source: '/next-api/:path*', destination: '/api/:path*' },

      // --- BYPASS: keep these handled by Next API ---
      { source: '/api/email/:path*', destination: '/api/email/:path*' },
      { source: '/api/emails', destination: '/api/emails' },

      // everything else under /api/* goes to Express
      { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },

      // static from S3
      { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
    ];
  },
};

module.exports = nextConfig;
