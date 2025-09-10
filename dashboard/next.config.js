// // og

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




// const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";
// const CPANEL_HOST = (process.env.NEXT_PUBLIC_CPANEL_HOST || "sogimchurch.com").replace(/^https?:\/\//, "");

// module.exports = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: CPANEL_HOST, pathname: "/assets/img/**" },
//       { protocol: "https", hostname: "www.sogimchurch.com", pathname: "/assets/img/**" }, // include www if used
//     ],
//   },
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
// };




// C:\Users\97158\Desktop\project1\dashboard\next.config.js

// const BACKEND_ORIGIN =
//   process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";

// const CPANEL_HOST = (process.env.NEXT_PUBLIC_CPANEL_HOST || "ion7.mavsketch.com")
//   .replace(/^https?:\/\//, "");

// module.exports = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       // new uploads location on cPanel
//       { protocol: "https", hostname: CPANEL_HOST, pathname: "/uploads/**" },
//       // (optional) allow http while SSL/AutoSSL is pending
//       { protocol: "http",  hostname: CPANEL_HOST, pathname: "/uploads/**" },

//       // (optional) keep old domain during migration
//       // { protocol: "https", hostname: "sogimchurch.com", pathname: "/assets/img/**" },
//       // { protocol: "https", hostname: "www.sogimchurch.com", pathname: "/assets/img/**" },
//     ],
//   },
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
// };


const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";

const CPANEL_HOST = (process.env.NEXT_PUBLIC_CPANEL_HOST || "ion7.mavsketch.com")
  .replace(/^https?:\/\//, "");

module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // new uploads location on cPanel
      { protocol: "https", hostname: CPANEL_HOST, pathname: "/uploads/**" },
      { protocol: "http",  hostname: CPANEL_HOST, pathname: "/uploads/**" },

      // old static assets (many sections use this)
      { protocol: "https", hostname: CPANEL_HOST, pathname: "/assets/img/**" },
      { protocol: "http",  hostname: CPANEL_HOST, pathname: "/assets/img/**" },
    ],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
};
