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






// // ogaws s3 upload

// // C:\Users\97158\Desktop\project1\dashboard\next.config.js
// const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";

// // add your bucket + region here (or pull from env if you prefer)
// const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || "project1-uploads-12345";
// const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1";
// const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

// module.exports = {
//   reactStrictMode: true,
//   async rewrites() {
//     return [
//       // your existing API proxy
//       { source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` },

//       // 🔧 Fix pre-hydration relative fetches:
//       // e.g. /editorpages/sections/about/xxx.jpg  →  https://<bucket>.s3.<region>.amazonaws.com/sections/about/xxx.jpg
//       { source: "/editorpages/sections/:path*", destination: `${S3_ORIGIN}/sections/:path*` },

//       // also catch plain /sections/... just in case
//       { source: "/sections/:path*", destination: `${S3_ORIGIN}/sections/:path*` },

//       // optional: stop the missing fallback 404
//       // (remove this if you add /public/img/about.jpg instead)
//       { source: "/img/about.jpg", destination: "https://placehold.co/700x350?text=About" },
//     ];
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






/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'project1-uploads-12345.s3.ap-south-1.amazonaws.com',
      },
      // { protocol: 'https', hostname: 'ion7.mavsketch.com' },
    ],
  },
  async rewrites() {
    const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';
    const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-12345';
    const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-south-1';
    const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    return [
      
      { source: '/next-api/:path*', destination: '/api/:path*' },

      // Backend Express routes stay on /api/*
      { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },

      // Static from S3
      { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
    ];
  },
};

module.exports = nextConfig;
