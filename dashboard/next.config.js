
// // og
// const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";
// module.exports = {
//   reactStrictMode: true,
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
//   },
// };




// dashboard/next.config.js
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://3.109.207.179";

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "project1-uploads-12345.s3.ap-south-1.amazonaws.com" },
    ],
  },
};
