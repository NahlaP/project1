


// // C:\Users\97158\Desktop\project1\dashboard\next.config.js

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






// C:\Users\97158\Desktop\project1\dashboard\next.config.js

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";

const CPANEL_HOST = (process.env.NEXT_PUBLIC_CPANEL_HOST || "ion7.mavsketch.com")
  .replace(/^https?:\/\//, "");

module.exports = {
  reactStrictMode: true,
  images: {
    // Enable modern formats and responsive sizing (faster!)
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      // new uploads on cPanel
      { protocol: "https", hostname: CPANEL_HOST, pathname: "/uploads/**" },
      { protocol: "http",  hostname: CPANEL_HOST, pathname: "/uploads/**" },

      // old theme/static assets many sections still use
      { protocol: "https", hostname: CPANEL_HOST, pathname: "/assets/img/**" },
      { protocol: "http",  hostname: CPANEL_HOST, pathname: "/assets/img/**" },
    ],

    // Dev-only fallback if needed to debug hotlink issues:
    // unoptimized: true,
  },

  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
};
