
// // og
// const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";
// module.exports = {
//   reactStrictMode: true,
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
// };




// // dashboard/next.config.js
// const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";

// /** @type {import('next').NextConfig} */
// module.exports = {
//   reactStrictMode: true,
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: "project1-uploads-12345.s3.ap-south-1.amazonaws.com" },
//     ],
//   },
// };





// C:\Users\97158\Desktop\project1\dashboard\next.config.js
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";

// add your bucket + region here (or pull from env if you prefer)
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || "project1-uploads-12345";
const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1";
const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // your existing API proxy
      { source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` },

      // 🔧 Fix pre-hydration relative fetches:
      // e.g. /editorpages/sections/about/xxx.jpg  →  https://<bucket>.s3.<region>.amazonaws.com/sections/about/xxx.jpg
      { source: "/editorpages/sections/:path*", destination: `${S3_ORIGIN}/sections/:path*` },

      // also catch plain /sections/... just in case
      { source: "/sections/:path*", destination: `${S3_ORIGIN}/sections/:path*` },

      // optional: stop the missing fallback 404
      // (remove this if you add /public/img/about.jpg instead)
      { source: "/img/about.jpg", destination: "https://placehold.co/700x350?text=About" },
    ];
  },
};
